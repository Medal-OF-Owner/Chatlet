import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getOrCreateRoom, getMessages, addMessage, createAccount, login, cleanupExpiredAccounts, verifyEmail, requestPasswordReset, resetPassword } from "./db";
import { normalizeNickname } from "../shared/utils";
import { getDb } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        nickname: z.string().min(3).max(100),
        password: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        return await createAccount(input.email, input.nickname, input.password);
      }),
    login: publicProcedure
      .input(z.object({
        identifier: z.string().min(1), // Accepte email ou pseudo
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await login(input.identifier, input.password);
      }),
    verifyEmail: publicProcedure
      .input(z.object({
        token: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await verifyEmail(input.token);
      }),
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        return await requestPasswordReset(input.email);
      }),
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        return await resetPassword(input.token, input.newPassword);
      }),

    updateProfileImage: publicProcedure
      .input(z.object({
        profileImage: z.string().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.email) {
          throw new Error("Unauthorized");
        }
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }
        const { accounts } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        await db.update(accounts).set({ profileImage: input.profileImage }).where(eq(accounts.email, ctx.user.email!));

        return { success: true };
      }),
  }),

  chat: router({
    getOrCreateRoom: publicProcedure
      .input(z.object({ slug: z.string().min(1).max(100) }))
      .mutation(async ({ input }) => {
        return await getOrCreateRoom(input.slug);
      }),

    getMessages: publicProcedure
      .input(z.object({ roomId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await getMessages(input.roomId, input.limit);
      }),

    sendMessage: publicProcedure
      .input(z.object({
        roomId: z.number(),
        nickname: z.string().min(1).max(100),
        content: z.string().min(1),
        fontFamily: z.string().optional(),
        profileImage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await addMessage(input.roomId, input.nickname, input.content, input.fontFamily, input.profileImage);
      }),
  }),

  guest: router({
    checkNicknameAvailable: publicProcedure
      .input(z.object({ nickname: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { available: true };
        
        const norm = normalizeNickname(input.nickname);
        const { accounts } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        const existing = await db.select().from(accounts).where(eq(accounts.normalizedNickname, norm)).limit(1);
        return { available: existing.length === 0 };
      }),
  }),
});

export type AppRouter = typeof appRouter;
