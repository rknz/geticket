export type CheckFailureKind =
  | "network_transient"
  | "challenge_captcha"
  | "queue_detected"
  | "rate_limited"
  | "auth_required"
  | "source_unavailable";

export interface RetryDecision {
  shouldPauseImmediately: boolean;
  requiresExplicitUserResume: boolean;
  nextDelayMinutes: number | null;
  reason: string;
}

/**
 * Enforces docs/SECURITY_AND_PERFORMANCE.md safe monitoring rules:
 * - Immediate pause (zero auto-retry) on CAPTCHA, queue, rate-limit, auth, or unavailable source.
 * - Bounded exponential backoff for transient network errors only, never below baseIntervalMinutes.
 */
export function evaluateRetryPolicy(input: {
  failureKind: CheckFailureKind;
  consecutiveFailures: number;
  baseIntervalMinutes: number;
  maxBackoffMinutes?: number;
}): RetryDecision {
  const maxBackoff = input.maxBackoffMinutes ?? 120;

  if (
    input.failureKind === "challenge_captcha" ||
    input.failureKind === "queue_detected" ||
    input.failureKind === "rate_limited" ||
    input.failureKind === "auth_required"
  ) {
    return {
      shouldPauseImmediately: true,
      requiresExplicitUserResume: true,
      nextDelayMinutes: null,
      reason: `Paused immediately due to ${input.failureKind}. Explicit user action required before resuming.`,
    };
  }

  if (input.failureKind === "source_unavailable") {
    return {
      shouldPauseImmediately: true,
      requiresExplicitUserResume: true,
      nextDelayMinutes: null,
      reason: "Paused because no authorized live data source is available.",
    };
  }

  // Transient network error: bounded exponential backoff
  const safeBase = Math.max(5, input.baseIntervalMinutes);
  const exponent = Math.min(Math.max(0, input.consecutiveFailures), 6);
  const computed = Math.min(safeBase * 2 ** exponent, maxBackoff);

  return {
    shouldPauseImmediately: false,
    requiresExplicitUserResume: false,
    nextDelayMinutes: computed,
    reason: `Transient network error; bounded backoff set to ${computed} minute(s).`,
  };
}
