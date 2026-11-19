import { resolve } from "node:path";
import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = resolve(import.meta.dirname);
const repoRoot = resolve(rootDir, "../..");

function copyExtensionAssets() {
  return {
    name: "copy-desktop-extension-assets",
    closeBundle() {
      const distDir = resolve(rootDir, "dist");
      mkdirSync(resolve(distDir, "assets/icons"), { recursive: true });
      copyFileSync(resolve(rootDir, "manifest.json"), resolve(distDir, "manifest.json"));
      cpSync(resolve(rootDir, "assets/icons"), resolve(distDir, "assets/icons"), {
        recursive: true,
        filter: (src) => !src.endsWith(".gitkeep"),
      });
    },
  };
}

export default defineConfig({
  root: rootDir,
  base: "./",
  plugins: [react(), copyExtensionAssets()],
  resolve: {
    alias: {
      "@get-ticket/shared-core": resolve(repoRoot, "packages/shared-core/src/index.ts"),
      "@get-ticket/railway-engine": resolve(repoRoot, "packages/railway-engine/src/index.ts"),
      "@get-ticket/route-intelligence": resolve(repoRoot, "packages/route-intelligence/src/index.ts"),
      "@get-ticket/scheduler": resolve(repoRoot, "packages/scheduler/src/index.ts"),
      "@get-ticket/notifications": resolve(repoRoot, "packages/notifications/src/index.ts"),
      "@get-ticket/storage": resolve(repoRoot, "packages/storage/src/index.ts"),
      "@get-ticket/security": resolve(repoRoot, "packages/security/src/index.ts"),
      "@get-ticket/ui-components": resolve(repoRoot, "packages/ui-components/src/index.ts"),
    },
  },
  build: {
    outDir: resolve(rootDir, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(rootDir, "src/popup/index.html"),
        dashboard: resolve(rootDir, "src/dashboard/index.html"),
        options: resolve(rootDir, "src/options/index.html"),
        background: resolve(rootDir, "src/background/index.ts"),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js",
      },
    },
  },
});
