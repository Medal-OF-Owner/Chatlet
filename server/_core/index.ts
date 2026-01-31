import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import { Pool as PgPool } from "pg";
import mysql from "mysql2/promise";

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";

import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { setupSocketIO } from "./socketio";
import { ENV } from "./env";

// Run database migrations on startup
async function runMigrations() {
  let dbUrl = ENV.databaseUrl;
  let attempts = 0;

  if (!dbUrl && attempts < 1) {
    console.log(`[DB] DATABASE_URL not set, checking individual DB variables...`);
  }

  if (!dbUrl) {
    console.error("[DB] DATABASE_URL not available after retries, skipping migrations");
    return;
  }

  try {
    const isMysql = dbUrl.startsWith("mysql");
    console.log(`[DB] Detected ${isMysql ? "MySQL" : "PostgreSQL"} database. Checking tables...`);

    if (isMysql) {
      console.log(`[DB] Attempting to connect to MySQL RDS...`);
      const connection = await mysql.createConnection({
        uri: dbUrl,
        connectTimeout: 10000,
        ssl: {
          rejectUnauthorized: false
        }
      }).catch(err => {
        console.error("[DB] CONNECTION ERROR DETAILS:", {
          message: err.message,
          code: err.code,
          errno: err.errno,
          host: process.env.DB_Host
        });
        throw err;
      });
      console.log(`[DB] Connected successfully to RDS.`);
      const db = drizzleMysql(connection);

      // MySQL Table Creation
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          openId VARCHAR(64) NOT NULL UNIQUE,
          name TEXT,
          email VARCHAR(320),
          loginMethod VARCHAR(64),
          role VARCHAR(64) DEFAULT 'user' NOT NULL,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          lastSignedIn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rooms (
          id INT AUTO_INCREMENT PRIMARY KEY,
          slug VARCHAR(100) NOT NULL UNIQUE,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          roomId INT NOT NULL,
          nickname VARCHAR(100) NOT NULL,
          content TEXT NOT NULL,
          fontFamily VARCHAR(100) DEFAULT 'sans-serif',
          textColor VARCHAR(7) DEFAULT '#ffffff',
          profileImage TEXT,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS activeNicknames (
          nickname VARCHAR(100) PRIMARY KEY,
          connectedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS accounts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(320) NOT NULL UNIQUE,
          nickname VARCHAR(100) NOT NULL UNIQUE,
          normalizedNickname VARCHAR(100) NOT NULL UNIQUE,
          passwordHash VARCHAR(255) NOT NULL,
          emailVerified TIMESTAMP NULL,
          verificationToken VARCHAR(255),
          resetToken VARCHAR(255),
          resetTokenExpiry TIMESTAMP NULL,
          profileImage TEXT,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          lastLogin TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await connection.end();
    } else {
      // PostgreSQL Table Creation
      const pool = new PgPool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      });
      const db = drizzlePg(pool);

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
          "textColor" VARCHAR(7) DEFAULT '#ffffff',
          "profileImage" TEXT,
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
          "normalizedNickname" VARCHAR(100) NOT NULL UNIQUE,
          "passwordHash" VARCHAR(255) NOT NULL,
          "emailVerified" TIMESTAMP,
          "verificationToken" VARCHAR(255),
          "resetToken" VARCHAR(255),
          "resetTokenExpiry" TIMESTAMP,
          "profileImage" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "lastLogin" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      await pool.end();
    }

    console.log("[DB] Tables created/verified!");
  } catch (err) {
    console.error("[DB] Migration error:", err);
    throw err;
  }
}

async function startServer() {
  console.log("[System] Checking environment and files...");
  console.log("[System] NODE_ENV:", process.env.NODE_ENV);
  console.log("[System] PORT:", process.env.PORT || process.env.port || "8080 (default)");
  
  try {
    const fs = await import("fs");
    const path = await import("path");
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      console.log("[System] 'dist' directory found.");
      const files = fs.readdirSync(distPath);
      console.log("[System] 'dist' contents:", files);
    } else {
      console.warn("[System] 'dist' directory NOT found at:", distPath);
    }
  } catch (e) {
    console.error("[System] Error checking files:", e);
  }

  // Run migrations first
  await runMigrations();
  const app = express();
  const server = createServer(app);

  // Setup Socket.IO
  setupSocketIO(server);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
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
  
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || process.env.port || "8080");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

if (process.argv.includes("--build")) {
  console.log("[Build] Server build check passed");
  process.exit(0);
}

startServer().catch(console.error);
