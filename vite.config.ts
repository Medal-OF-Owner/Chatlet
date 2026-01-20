// import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc"; // Removed: incompatible with Vite 7
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
const plugins = [react(), tailwindcss(), vitePluginManusRuntime(), nodePolyfills()];
export default defineConfig({
  plugins,
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    minify: false,
    cssMinify: false,
    ssr: false
  },
  esbuild: false,
  server: {
    host: "0.0.0.0",
    port: 5000,
    hmr: {
      clientPort: 443
    },
    allowedHosts: [".manuspre.computer", ".manus.computer", ".manus-asia.computer", ".manuscomputer.ai", ".manusvm.computer", ".replit.dev", ".replit.app", ".replit.co", "localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  },
  optimizeDeps: {
    exclude: ["same-runtime/dist/jsx-runtime", "same-runtime/dist/jsx-dev-runtime"]
  }
});