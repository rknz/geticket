import type { AvailabilityStatus, DataProvenance } from "@get-ticket/shared-core";

/**
 * Enforces the core Get Ticket honesty rule: missing, unverified, or failed data
 * must NEVER be reported as "sold_out".
 */
export function normalizeAvailabilityStatus(input: {
  sourcePermitted: boolean;
  sourceResponded: boolean;
  isStale: boolean;
  confirmedSeatCount?: number | null;
}): AvailabilityStatus {
  if (!input.sourcePermitted) return "unavailable";
  if (!input.sourceResponded) return "unknown";
  if (input.isStale) return "stale";
  if (input.confirmedSeatCount === undefined || input.confirmedSeatCount === null) {
    return "unknown";
  }
  if (input.confirmedSeatCount <= 0) return "sold_out";
  if (input.confirmedSeatCount <= 5) return "limited";
  return "available";
}

export function isProvenanceStale(
  provenance: DataProvenance,
  maxAgeMinutes: number,
  nowMs = Date.now(),
): boolean {
  const checkedMs = Date.parse(provenance.checkedAt);
  if (Number.isNaN(checkedMs)) return true;
  return nowMs - checkedMs > maxAgeMinutes * 60 * 1000;
}
