import { describe, expect, it } from "vitest";
import { createDefaultPreferenceSheet, type JourneyProfile } from "@get-ticket/shared-core";
import {
  GetTicketRepository,
  InMemoryStorageAdapter,
  migrateStoreState,
} from "@get-ticket/storage";
import {
  computeReleaseReminder,
  createInitialJobState,
  evaluateRetryPolicy,
  resumeJobWithUserConfirmation,
  transitionJobOnFailure,
} from "@get-ticket/scheduler";

const sampleProfile: JourneyProfile = {
  id: "jp-test",
  label: "Dhaka -> Mymensingh",
  fromStation: "Dhaka",
  toStation: "Mymensingh",
  journeyDate: "2026-11-29",
  direction: "outbound",
  passengerCount: 1,
  preferredTrainNumbers: [],
  enabled: true,
  preferences: createDefaultPreferenceSheet(),
  releaseReminder: {
    enabled: true,
    advanceDays: 10,
    releaseTimeLocal: "08:00",
    notifyMinutesBefore: 15,
  },
  createdAt: "2026-11-19T08:00:00.000Z",
  updatedAt: "2026-11-19T08:00:00.000Z",
};

describe("storage repository & safe migrations", () => {
  it("saves, loads, updates, and deletes journey profiles cleanly", async () => {
    const repo = new GetTicketRepository(new InMemoryStorageAdapter());
    const initial = await repo.load();
    expect(initial.profiles).toHaveLength(0);

    const afterSave = await repo.upsertProfile(sampleProfile);
    expect(afterSave.profiles).toHaveLength(1);
    expect(afterSave.profiles[0]?.id).toBe("jp-test");

    const afterDelete = await repo.deleteProfile("jp-test");
    expect(afterDelete.profiles).toHaveLength(0);
  });

  it("recovers safely from corrupted storage payloads without crashing", () => {
    const result = migrateStoreState({ schemaVersion: 99, bad: true });
    expect(result.state.schemaVersion).toBe(1);
    expect(result.state.profiles).toEqual([]);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("scheduler release planner & safe retry policy", () => {
  it("computes user-configurable 10-day advance release reminder", () => {
    const plan = computeReleaseReminder("2026-11-29", sampleProfile.releaseReminder, 360);
    expect(plan.releaseDate).toBe("2026-11-19");
    expect(plan.releaseAtIso).toBe("2026-11-19T02:00:00.000Z"); // 08:00 UTC+6
    expect(plan.notifyAtIso).toBe("2026-11-19T01:45:00.000Z"); // 15 min prior
  });

  it("pauses immediately with zero retry on CAPTCHA, queue, or rate limit", () => {
    for (const failureKind of ["challenge_captcha", "queue_detected", "rate_limited"] as const) {
      const decision = evaluateRetryPolicy({
        failureKind,
        consecutiveFailures: 0,
        baseIntervalMinutes: 15,
      });
      expect(decision.shouldPauseImmediately).toBe(true);
      expect(decision.requiresExplicitUserResume).toBe(true);
      expect(decision.nextDelayMinutes).toBeNull();
    }
  });

  it("uses bounded exponential backoff on transient network errors and blocks unauthorized resume", () => {
    const initial = createInitialJobState("jp-test", "2026-11-19T08:00:00.000Z");
    const afterChallenge = transitionJobOnFailure(initial, "challenge_captcha", 15);
    expect(afterChallenge.status).toBe("paused_challenge");

    const resumedWithoutSource = resumeJobWithUserConfirmation(afterChallenge, false, true);
    expect(resumedWithoutSource.status).toBe("paused_source_unavailable");

    const backoff = evaluateRetryPolicy({
      failureKind: "network_transient",
      consecutiveFailures: 2,
      baseIntervalMinutes: 15,
      maxBackoffMinutes: 120,
    });
    expect(backoff.shouldPauseImmediately).toBe(false);
    expect(backoff.nextDelayMinutes).toBe(60);
  });
});
