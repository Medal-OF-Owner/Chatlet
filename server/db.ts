import { eq, desc, lt } from "drizzle-orm";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users, rooms, messages, activeNicknames, accounts } from "../drizzle/schema";
import * as bcrypt from "bcryptjs";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { nanoid } from "nanoid";
import { normalizeNickname } from "../shared/utils";

let _db: any = null;
let _pool: any = null;

export async function getDb() {
  if (_db) return _db;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("[Database] DATABASE_URL is not defined");
    return null;
  }

  try {
    console.log("[Database] Attempting to connect to MySQL...");
    _pool = mysql.createPool(dbUrl);
    _db = drizzleMysql(_pool);
    
    // Test connection
    const connection = await _pool.getConnection();
    console.log("[Database] SUCCESS: Connected to MySQL");
    connection.release();
    
    return _db;
  } catch (error) {
    console.error("[Database] FAILED to connect to MySQL:", error);
    _db = null;
    _pool = null;
    return null;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const updateSet: any = {
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      lastSignedIn: user.lastSignedIn || new Date(),
    };

    await db.insert(users).values(user).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateRoom(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(rooms).where(eq(rooms.slug, slug)).limit(1);
  if (existing.length > 0) return existing[0];

  const [result] = await db.insert(rooms).values({ slug });
  return { id: result.insertId, slug, createdAt: new Date() };
}

export async function getMessages(roomId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(messages).where(eq(messages.roomId, roomId)).orderBy(desc(messages.createdAt)).limit(limit);
}

export async function addMessage(roomId: number, nickname: string, content: string, fontFamily?: string, profileImage?: string | null) {
  const db = await getDb();
  if (!db) return;
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
  if (!db) return false;

  try {
    await db.insert(activeNicknames).values({ nickname });
    return true;
  } catch (error) {
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
    if (existingEmail.length > 0) return { success: false, error: "Email already exists" };

    const existingNickname = await db.select().from(accounts).where(eq(accounts.nickname, nickname)).limit(1);
    if (existingNickname.length > 0) return { success: false, error: "Nickname already registered" };

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = nanoid(32);
    const normalizedNickname = normalizeNickname(nickname);
    await db.insert(accounts).values({ email, nickname, passwordHash, verificationToken, normalizedNickname });

    await sendVerificationEmail(email, verificationToken);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create account" };
  }
}

export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const account = await db.select().from(accounts).where(eq(accounts.verificationToken, token)).limit(1);
    if (account.length === 0) return { success: false, error: "Invalid verification token" };
    await db.update(accounts).set({ emailVerified: new Date(), verificationToken: null }).where(eq(accounts.id, account[0].id));
    return { success: true };
  } catch (error) {
    return { success: false, error: "Verification failed" };
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const account = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);
    if (account.length === 0) return { success: true };
    const resetToken = nanoid(32);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await db.update(accounts).set({ resetToken, resetTokenExpiry }).where(eq(accounts.id, account[0].id));
    await sendPasswordResetEmail(email, resetToken);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to request reset" };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const account = await db.select().from(accounts).where(eq(accounts.resetToken, token)).limit(1);
    if (account.length === 0) return { success: false, error: "Invalid reset token" };
    if (!account[0].resetTokenExpiry || account[0].resetTokenExpiry < new Date()) return { success: false, error: "Reset token expired" };
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(accounts).set({ passwordHash, resetToken: null, resetTokenExpiry: null }).where(eq(accounts.id, account[0].id));
    return { success: true };
  } catch (error) {
    return { success: false, error: "Password reset failed" };
  }
}

export async function login(identifier: string, password: string): Promise<{ success: boolean; account?: { id: number; email: string; nickname: string }; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    let account = await db.select().from(accounts).where(eq(accounts.email, identifier)).limit(1);
    if (account.length === 0) account = await db.select().from(accounts).where(eq(accounts.nickname, identifier)).limit(1);
    if (account.length === 0) return { success: false, error: "Identifiant ou mot de passe incorrect" };
    const isValid = await bcrypt.compare(password, account[0].passwordHash);
    if (!isValid) return { success: false, error: "Identifiant ou mot de passe incorrect" };
    if (!account[0].emailVerified) return { success: false, error: "Veuillez vérifier votre email avant de vous connecter" };
    await db.update(accounts).set({ lastLogin: new Date() }).where(eq(accounts.id, account[0].id));
    return { success: true, account: { id: account[0].id, email: account[0].email, nickname: account[0].nickname } };
  } catch (error) {
    return { success: false, error: "Erreur de connexion" };
  }
}

export async function cleanupExpiredAccounts(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await db.delete(accounts).where(lt(accounts.lastLogin, oneMonthAgo));
  } catch (error) {}
}
