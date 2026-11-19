import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  findForbiddenSensitiveKeys,
  isAllowedOfficialUrl,
  redactForLogs,
  validateExtensionMessage,
} from "@get-ticket/security";
import {
  GetTicketRepository,
  InMemoryStorageAdapter,
  createEmptyStoreState,
} from "@get-ticket/storage";

const repoRoot = resolve(import.meta.dirname, "../..");

describe("security allowlist, redaction, and message guards", () => {
  it("allows only HTTPS official Bangladesh Railway hosts", () => {
    expect(isAllowedOfficialUrl("https://eticket.railway.gov.bd/")).toBe(true);
    expect(isAllowedOfficialUrl("https://railway.gov.bd/pages/static-pages/123")).toBe(true);
    expect(isAllowedOfficialUrl("http://eticket.railway.gov.bd/")).toBe(false);
    expect(isAllowedOfficialUrl("https://evil-railway.example.com/")).toBe(false);
    expect(isAllowedOfficialUrl("javascript:alert(1)")).toBe(false);
  });

  it("detects and rejects sensitive keys in messages and storage", async () => {
    expect(findForbiddenSensitiveKeys({ user: { password: "x", otp: "123" } })).toEqual([
      "user.password",
      "user.otp",
    ]);

    const rejected = validateExtensionMessage({
      type: "GET_STATE",
      cookie: "session=abc",
    });
    expect(rejected.ok).toBe(false);

    const redacted = redactForLogs({ action: "open", auth_header: "Bearer xyz" });
    expect(redacted["auth_header"]).toBe("[REDACTED]");
    expect(redacted["action"]).toBe("open");

    const repo = new GetTicketRepository(new InMemoryStorageAdapter());
    const badState = { ...createEmptyStoreState(), token: "leak" } as unknown as ReturnType<
      typeof createEmptyStoreState
    >;
    await expect(repo.save(badState)).rejects.toThrow(/forbidden sensitive keys/i);
  });

  it("verifies both desktop and android manifests follow least-privilege permissions", () => {
    const manifestPaths = [
      resolve(repoRoot, "apps/desktop-extension/manifest.json"),
      resolve(repoRoot, "apps/android-extension/manifest.json"),
    ];
    const forbiddenPermissions = new Set([
      "cookies",
      "webRequest",
      "webRequestBlocking",
      "tabs",
      "scripting",
      "browsingData",
      "<all_urls>",
    ]);

    for (const manifestPath of manifestPaths) {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
        manifest_version: number;
        permissions?: string[];
        host_permissions?: string[];
      };
      expect(manifest.manifest_version).toBe(3);
      expect(manifest.host_permissions).toBeUndefined();
      for (const perm of manifest.permissions ?? []) {
        expect(forbiddenPermissions.has(perm)).toBe(false);
      }
    }
  });
});
