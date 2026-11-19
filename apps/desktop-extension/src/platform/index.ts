import type { AppSettings, JourneyProfile } from "@get-ticket/shared-core";
import { isAllowedOfficialUrl } from "@get-ticket/security";
import {
  GetTicketRepository,
  InMemoryStorageAdapter,
  createChromeLocalStorageAdapter,
  type GetTicketStoreState,
} from "@get-ticket/storage";
import type { PlatformBridge, PlatformCapabilities } from "@get-ticket/ui-components";

function createRepository(): GetTicketRepository {
  const hasChromeStorage =
    typeof chrome !== "undefined" &&
    Boolean(chrome.storage && chrome.storage.local);
  return new GetTicketRepository(
    hasChromeStorage ? createChromeLocalStorageAdapter() : new InMemoryStorageAdapter(),
  );
}

export function detectDesktopCapabilities(): PlatformCapabilities {
  const hasChrome = typeof chrome !== "undefined";
  return {
    platformName: "Desktop (Chrome / Edge MV3)",
    alarmsSupported: hasChrome && Boolean(chrome.alarms),
    notificationsSupported: hasChrome && Boolean(chrome.notifications),
    popupSupported: true,
    lifecycleNote:
      "Manifest V3 service workers sleep when idle; all profiles and reminder states are persisted in chrome.storage.local. Automated live Railway polling is disabled (no authorized live source).",
  };
}

export function createDesktopBridge(): PlatformBridge {
  const repo = createRepository();
  return {
    capabilities: detectDesktopCapabilities(),
    loadState(): Promise<GetTicketStoreState> {
      return repo.load();
    },
    saveProfile(profile: JourneyProfile): Promise<GetTicketStoreState> {
      return repo.upsertProfile(profile);
    },
    deleteProfile(profileId: string): Promise<GetTicketStoreState> {
      return repo.deleteProfile(profileId);
    },
    updateSettings(settings: AppSettings): Promise<GetTicketStoreState> {
      return repo.updateSettings(settings);
    },
    async clearAllData(): Promise<GetTicketStoreState> {
      await repo.clearAll();
      return repo.load();
    },
    async openOfficialUrl(url: string): Promise<void> {
      if (!isAllowedOfficialUrl(url)) {
        throw new Error("Blocked navigation to non-allowlisted URL");
      }
      if (typeof chrome !== "undefined" && chrome.tabs?.create) {
        await chrome.tabs.create({ url });
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    async openDashboardTab(): Promise<void> {
      if (typeof chrome !== "undefined" && chrome.runtime?.getURL && chrome.tabs?.create) {
        await chrome.tabs.create({ url: chrome.runtime.getURL("src/dashboard/index.html") });
      }
    },
  };
}
