import { z } from "zod";
import {
  appSettingsSchema,
  createDefaultAppSettings,
  journeyProfileSchema,
  type AppSettings,
  type JourneyProfile,
} from "@get-ticket/shared-core";
import { findForbiddenSensitiveKeys } from "@get-ticket/security";

export const STORAGE_KEY = "get_ticket_state_v1";
export const CURRENT_SCHEMA_VERSION = 1;

export const persistedJobStateSchema = z.object({
  profileId: z.string().min(1).max(80),
  status: z.enum([
    "idle",
    "reminder_scheduled",
    "paused_by_user",
    "paused_challenge",
    "paused_source_unavailable",
    "unsupported_lifecycle",
  ]),
  pauseReason: z.string().max(200).optional(),
  failureCount: z.number().int().min(0).max(100),
  nextPermittedCheckAt: z.string().datetime().optional(),
  lastCheckedAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime(),
});

export type PersistedJobState = z.infer<typeof persistedJobStateSchema>;

export const localAlertSchema = z.object({
  id: z.string().min(1).max(80),
  profileId: z.string().min(1).max(80).optional(),
  kind: z.enum([
    "release_reminder",
    "priority_match",
    "challenge_paused",
    "source_unavailable",
    "stale_data",
    "browser_limitation",
  ]),
  title: z.string().min(1).max(160),
  message: z.string().min(1).max(400),
  createdAt: z.string().datetime(),
  read: z.boolean(),
});

export type LocalAlert = z.infer<typeof localAlertSchema>;

export const storeStateSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  profiles: z.array(journeyProfileSchema),
  settings: appSettingsSchema,
  jobStates: z.record(z.string(), persistedJobStateSchema),
  alerts: z.array(localAlertSchema).max(100),
});

export type GetTicketStoreState = z.infer<typeof storeStateSchema>;

export interface StorageAdapter {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

export class InMemoryStorageAdapter implements StorageAdapter {
  private readonly store = new Map<string, unknown>();

  async get(key: string): Promise<unknown> {
    return this.store.get(key);
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, structuredClone(value));
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export function createChromeLocalStorageAdapter(): StorageAdapter {
  return {
    async get(key: string): Promise<unknown> {
      const result = await chrome.storage.local.get(key);
      return result[key];
    },
    async set(key: string, value: unknown): Promise<void> {
      await chrome.storage.local.set({ [key]: value });
    },
    async remove(key: string): Promise<void> {
      await chrome.storage.local.remove(key);
    },
  };
}

export function createEmptyStoreState(): GetTicketStoreState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profiles: [],
    settings: createDefaultAppSettings(),
    jobStates: {},
    alerts: [],
  };
}

/**
 * Safely migrates raw persisted data to CURRENT_SCHEMA_VERSION.
 * Never throws on legacy/corrupted data; strips invalid records and falls back cleanly.
 */
export function migrateStoreState(raw: unknown): {
  state: GetTicketStoreState;
  migrated: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  if (!raw || typeof raw !== "object") {
    return { state: createEmptyStoreState(), migrated: false, warnings };
  }

  const record = raw as Record<string, unknown>;
  const version = typeof record["schemaVersion"] === "number" ? record["schemaVersion"] : 0;

  // Handle v0 -> v1 migration cleanly
  const candidate =
    version === 0
      ? {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          profiles: Array.isArray(record["profiles"]) ? record["profiles"] : [],
          settings: record["settings"] ?? createDefaultAppSettings(),
          jobStates:
            record["jobStates"] && typeof record["jobStates"] === "object"
              ? record["jobStates"]
              : {},
          alerts: Array.isArray(record["alerts"]) ? record["alerts"] : [],
        }
      : record;

  const parsed = storeStateSchema.safeParse(candidate);
  if (parsed.success) {
    return {
      state: parsed.data,
      migrated: version !== CURRENT_SCHEMA_VERSION,
      warnings,
    };
  }

  warnings.push("Stored state failed schema validation; fell back to safe defaults.");
  return {
    state: createEmptyStoreState(),
    migrated: true,
    warnings,
  };
}

export class GetTicketRepository {
  constructor(private readonly adapter: StorageAdapter) {}

  async load(): Promise<GetTicketStoreState> {
    const raw = await this.adapter.get(STORAGE_KEY);
    const { state, migrated } = migrateStoreState(raw);
    if (migrated) {
      await this.save(state);
    }
    return state;
  }

  async save(state: GetTicketStoreState): Promise<void> {
    const forbidden = findForbiddenSensitiveKeys(state);
    if (forbidden.length > 0) {
      throw new Error(
        `Refused to persist forbidden sensitive keys: ${forbidden.join(", ")}`,
      );
    }
    const validated = storeStateSchema.parse(state);
    await this.adapter.set(STORAGE_KEY, validated);
  }

  async upsertProfile(profile: JourneyProfile): Promise<GetTicketStoreState> {
    const validProfile = journeyProfileSchema.parse(profile);
    const state = await this.load();
    const index = state.profiles.findIndex((p) => p.id === validProfile.id);
    const nextProfiles =
      index >= 0
        ? state.profiles.map((p, i) => (i === index ? validProfile : p))
        : [...state.profiles, validProfile];
    const nextState: GetTicketStoreState = { ...state, profiles: nextProfiles };
    await this.save(nextState);
    return nextState;
  }

  async deleteProfile(profileId: string): Promise<GetTicketStoreState> {
    const state = await this.load();
    const nextJobStates = { ...state.jobStates };
    delete nextJobStates[profileId];
    const nextState: GetTicketStoreState = {
      ...state,
      profiles: state.profiles.filter((p) => p.id !== profileId),
      jobStates: nextJobStates,
    };
    await this.save(nextState);
    return nextState;
  }

  async updateSettings(settings: AppSettings): Promise<GetTicketStoreState> {
    const validSettings = appSettingsSchema.parse(settings);
    const state = await this.load();
    const nextState: GetTicketStoreState = { ...state, settings: validSettings };
    await this.save(nextState);
    return nextState;
  }

  async clearAll(): Promise<void> {
    await this.adapter.remove(STORAGE_KEY);
  }
}
