import type { PersistedJobState } from "@get-ticket/storage";
import { evaluateRetryPolicy, type CheckFailureKind } from "../retry-policy/index.js";

export function createInitialJobState(
  profileId: string,
  nowIso = new Date().toISOString(),
): PersistedJobState {
  return {
    profileId,
    status: "paused_source_unavailable",
    pauseReason: "Live availability integration unavailable (no authorized live source).",
    failureCount: 0,
    updatedAt: nowIso,
  };
}

export function transitionJobOnFailure(
  current: PersistedJobState,
  failureKind: CheckFailureKind,
  baseIntervalMinutes: number,
  nowIso = new Date().toISOString(),
): PersistedJobState {
  const decision = evaluateRetryPolicy({
    failureKind,
    consecutiveFailures: current.failureCount,
    baseIntervalMinutes,
  });

  if (decision.shouldPauseImmediately) {
    const status =
      failureKind === "source_unavailable"
        ? "paused_source_unavailable"
        : "paused_challenge";
    return {
      profileId: current.profileId,
      status,
      pauseReason: decision.reason,
      failureCount: current.failureCount + 1,
      updatedAt: nowIso,
    };
  }

  const nextMs = Date.parse(nowIso) + (decision.nextDelayMinutes ?? baseIntervalMinutes) * 60 * 1000;
  return {
    profileId: current.profileId,
    status: current.status,
    pauseReason: decision.reason,
    failureCount: current.failureCount + 1,
    nextPermittedCheckAt: new Date(nextMs).toISOString(),
    updatedAt: nowIso,
  };
}

export function resumeJobWithUserConfirmation(
  current: PersistedJobState,
  liveSourceAuthorized: boolean,
  confirmedByUser: boolean,
  nowIso = new Date().toISOString(),
): PersistedJobState {
  if (!confirmedByUser) {
    return current;
  }
  if (!liveSourceAuthorized) {
    return {
      profileId: current.profileId,
      status: "paused_source_unavailable",
      pauseReason: "Cannot resume live monitoring: no authorized live Railway data source.",
      failureCount: 0,
      updatedAt: nowIso,
    };
  }
  return {
    profileId: current.profileId,
    status: "reminder_scheduled",
    failureCount: 0,
    updatedAt: nowIso,
  };
}
