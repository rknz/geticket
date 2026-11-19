import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { dispatchSafeNotification } from "@get-ticket/notifications";
import { detectKiwiCapabilities } from "../../apps/android-extension/src/platform/index.js";

const androidDir = resolve(import.meta.dirname, "../../apps/android-extension");

describe("android-extension (Kiwi Browser)", () => {
  it("declares valid separate Kiwi manifest and all required raster PNG icons exist", () => {
    const manifest = JSON.parse(
      readFileSync(resolve(androidDir, "manifest.json"), "utf8"),
    ) as {
      manifest_version: number;
      name: string;
      icons: Record<string, string>;
    };
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toContain("Kiwi");
    for (const iconPath of Object.values(manifest.icons)) {
      expect(existsSync(resolve(androidDir, iconPath))).toBe(true);
    }
  });

  it("does not claim real-device verification or uninterrupted Android background monitoring", () => {
    const caps = detectKiwiCapabilities();
    expect(caps.platformName).toMatch(/Unverified on Real Device/i);
    expect(caps.lifecycleNote).toMatch(/not guaranteed/i);
  });

  it("falls back cleanly to in-app alert when browser notifications API is missing", async () => {
    const res = await dispatchSafeNotification(
      { id: "n1", title: "Reminder", message: "Test" },
      null,
    );
    expect(res.deliveredVia).toBe("in_app_fallback");
  });
});
