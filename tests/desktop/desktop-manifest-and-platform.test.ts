import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { detectDesktopCapabilities } from "../../apps/desktop-extension/src/platform/index.js";

const desktopDir = resolve(import.meta.dirname, "../../apps/desktop-extension");

describe("desktop-extension (Chrome / Edge MV3)", () => {
  it("declares valid MV3 manifest and all required raster PNG icons exist", () => {
    const manifest = JSON.parse(
      readFileSync(resolve(desktopDir, "manifest.json"), "utf8"),
    ) as {
      manifest_version: number;
      icons: Record<string, string>;
      background: { service_worker: string };
    };
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.background.service_worker).toBe("background.js");
    for (const iconPath of Object.values(manifest.icons)) {
      expect(existsSync(resolve(desktopDir, iconPath))).toBe(true);
    }
  });

  it("reports honest MV3 lifecycle note without claiming live polling", () => {
    const caps = detectDesktopCapabilities();
    expect(caps.platformName).toContain("Desktop");
    expect(caps.lifecycleNote).toMatch(/disabled/i);
  });
});
