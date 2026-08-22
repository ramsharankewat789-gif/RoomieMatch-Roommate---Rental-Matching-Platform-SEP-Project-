import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: path.resolve(rootDir, "apps/admin"),
  publicDir: path.resolve(rootDir, "public"),
  resolve: {
    alias: {
      "@shared": path.resolve(rootDir, "shared"),
    },
  },
  css: {
    postcss: path.resolve(rootDir, "postcss.config.js"),
  },
  build: {
    outDir: path.resolve(rootDir, "dist/admin"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(rootDir, "apps/admin/index.html"),
    },
  },
  server: {
    port: 5174,
    fs: {
      allow: [rootDir],
    },
  },
});
