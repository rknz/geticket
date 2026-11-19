import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const repoRoot = resolve(import.meta.dirname);

export default defineConfig({
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
  test: {
    environment: "node",
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.ts",
      "tests/security/**/*.test.ts",
      "tests/desktop/**/*.test.ts",
      "tests/android/**/*.test.ts",
      "packages/*/src/**/*.test.ts",
    ],
    passWithNoTests: false,
  },
});
