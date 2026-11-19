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

/**
 * Runtime feature detection for Kiwi Browser on Android.
 * Never claims uninterrupted background monitoring on Android.
 */
export function detectKiwiCapabilities(): PlatformCapabilities {
  const hasChrome = typeof chrome !== "undefined";
  const alarmsSupported = hasChrome && Boolean(chrome.alarms?.create);
  const notificationsSupported = hasChrome && Boolean(chrome.notifications?.create);

  return {
    platformName: "Android (Kiwi Browser — Unverified on Real Device)",
    alarmsSupported,
    notificationsSupported,
    popupSupported: true,
    lifecycleNote:
      "Android OS battery policies and Kiwi Browser may suspend, throttle, or kill background workers at any time. Continuous background monitoring is not guaranteed; use manual refresh and official-site handoff.",
  };
}

export function createKiwiBridge(): PlatformBridge {
  const repo = createRepository();
  return {
    capabilities: detectKiwiCapabilities(),
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
