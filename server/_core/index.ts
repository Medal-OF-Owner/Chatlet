import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { spawn } from "child_process";

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { setupSocketIO } from "./socketio";

// Run database migrations on startup
async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log("[DB] DATABASE_URL not set, skipping migrations");
    return;
  }

  return new Promise<void>((resolve, reject) => {
    try {
      console.log("[DB] Running schema sync...");
      const proc = spawn("pnpm", ["exec", "drizzle-kit", "push:pg"], {
        stdio: "inherit",
        env: { ...process.env },
      });

      proc.on("exit", (code) => {
        if (code === 0) {
          console.log("[DB] Schema sync completed!");
          resolve();
        } else {
          reject(new Error(`drizzle-kit push failed with code ${code}`));
        }
      });

      proc.on("error", (err) => {
        console.error("[DB] Failed to run drizzle-kit:", err);
        reject(err);
      });
    } catch (err) {
      console.error("[DB] Migration error:", err);
      reject(err);
    }
  });
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
