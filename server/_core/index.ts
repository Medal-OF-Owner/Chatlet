import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { execSync } from "child_process";

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { setupSocketIO } from "./socketio";

// Run database migrations on startup
async function runMigrations() {
  try {
    if (process.env.NODE_ENV === "production") {
      console.log("[DB] Running migrations...");
      execSync("pnpm exec drizzle-kit push:pg --force-cli", { stdio: "inherit" });
      console.log("[DB] Migrations completed!");
    }
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
