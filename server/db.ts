import { eq, desc, and, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUser, users, rooms, messages, activeNicknames, accounts } from "../drizzle/schema";
import { ENV } from './_core/env';
import * as bcrypt from "bcryptjs";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };

    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: [users.openId],
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateRoom(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(rooms).where(eq(rooms.slug, slug)).limit(1);
  if (existing.length > 0) return existing[0];

  const created = await db.insert(rooms).values({ slug }).returning();
  return created[0];
}

export async function getMessages(roomId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(messages).where(eq(messages.roomId, roomId)).orderBy(desc(messages.createdAt)).limit(limit);
}

export async function addMessage(roomId: number, nickname: string, content: string, fontFamily?: string, profileImage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(messages).values({ roomId, nickname, content, fontFamily, profileImage });
}

export async function checkNicknameAvailable(nickname: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;

  const existing = await db.select().from(activeNicknames).where(eq(activeNicknames.nickname, nickname)).limit(1);
  return existing.length === 0;
}

export async function reserveNickname(nickname: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(activeNicknames).values({ nickname });
    return true;
  } catch {
    return false;
  }
}

export async function releaseNickname(nickname: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(activeNicknames).where(eq(activeNicknames.nickname, nickname));
}

export async function createAccount(email: string, nickname: string, password: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const existingEmail = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);
    if (existingEmail.length > 0) {
      return { success: false, error: "Email already exists" };
    }

    const existingNickname = await db.select().from(accounts).where(eq(accounts.nickname, nickname)).limit(1);
    if (existingNickname.length > 0) {
      return { success: false, error: "Nickname already registered" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = nanoid(32);
    await db.insert(accounts).values({ email, nickname, passwordHash, verificationToken });
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to create account:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const account = await db.select().from(accounts).where(eq(accounts.verificationToken, token)).limit(1);
    if (account.length === 0) {
      return { success: false, error: "Invalid verification token" };
    }

    await db.update(accounts).set({ emailVerified: new Date(), verificationToken: null }).where(eq(accounts.id, account[0].id));
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to verify email:", error);
    return { success: false, error: "Verification failed" };
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const account = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);
    if (account.length === 0) {
      // For security, don't reveal if email exists
      return { success: true };
    }

    const resetToken = nanoid(32);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.update(accounts).set({ resetToken, resetTokenExpiry }).where(eq(accounts.id, account[0].id));
    
    // Send reset email
    await sendPasswordResetEmail(email, resetToken);
    
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to request password reset:", error);
    return { success: false, error: "Failed to request reset" };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const account = await db.select().from(accounts).where(eq(accounts.resetToken, token)).limit(1);
    if (account.length === 0) {
      return { success: false, error: "Invalid reset token" };
    }

    if (!account[0].resetTokenExpiry || account[0].resetTokenExpiry < new Date()) {
      return { success: false, error: "Reset token expired" };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(accounts).set({ passwordHash, resetToken: null, resetTokenExpiry: null }).where(eq(accounts.id, account[0].id));
    
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to reset password:", error);
    return { success: false, error: "Password reset failed" };
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; account?: { id: number; email: string; nickname: string }; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const account = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);
    if (account.length === 0) {
      return { success: false, error: "Email not found" };
    }

    const isValid = await bcrypt.compare(password, account[0].passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid password" };
    }

    // Update lastLogin
    await db.update(accounts).set({ lastLogin: new Date() }).where(eq(accounts.id, account[0].id));

    return { success: true, account: { id: account[0].id, email: account[0].email, nickname: account[0].nickname } };
  } catch (error) {
    console.error("[Database] Failed to login:", error);
    return { success: false, error: "Login failed" };
  }
}

export async function cleanupExpiredAccounts(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await db.delete(accounts).where(lt(accounts.lastLogin, oneMonthAgo));
    console.log("✅ Cleaned up expired accounts");
  } catch (error) {
    console.error("[Database] Failed to cleanup accounts:", error);
  }
}
