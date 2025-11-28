import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { setupSocketIO } from "./socketio";

// Run database migrations on startup
async function runMigrations() {
  // Wait for DATABASE_URL to be available (Render may inject it with delay)
  let dbUrl = process.env.DATABASE_URL;
  let attempts = 0;
  
  while (!dbUrl && attempts < 10) {
    attempts++;
    console.log(`[DB] DATABASE_URL not set (attempt ${attempts}/10), waiting...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    dbUrl = process.env.DATABASE_URL;
  }
  
  if (!dbUrl) {
    console.error("[DB] DATABASE_URL not available after retries, skipping migrations");
    return;
  }

  try {
    console.log("[DB] Creating tables if needed...");
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
    
    const db = drizzle(pool);

    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "openId" VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        "loginMethod" VARCHAR(64),
        role VARCHAR(64) DEFAULT 'user' NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        "roomId" INTEGER NOT NULL,
        nickname VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        "fontFamily" VARCHAR(100) DEFAULT 'sans-serif',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "activeNicknames" (
        nickname VARCHAR(50) PRIMARY KEY,
        "connectedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(320) NOT NULL UNIQUE,
        nickname VARCHAR(100) NOT NULL UNIQUE,
        "passwordHash" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "lastLogin" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log("[DB] Tables created/verified!");
    await pool.end();
  } catch (err) {
    console.error("[DB] Migration error:", err);
    throw err;
  }
}

async function startServer() {
  // Run migrations first
  await runMigrations();
  const app = express();
  const server = createServer(app);
  
  // Setup Socket.IO
  setupSocketIO(server);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Health check endpoint (for keeping app alive on Render free tier)
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
    console.log(`Socket.IO ready on ws://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
