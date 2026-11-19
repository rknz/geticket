export type ConfidenceLevel = "verified" | "partial" | "unverified";

export type AvailabilityStatus =
  | "available"
  | "sold_out"
  | "limited"
  | "unknown"
  | "stale"
  | "unavailable";

export type ServiceRunStatus =
  | "running"
  | "cancelled"
  | "suspended"
  | "partial_impact"
  | "stale"
  | "unavailable"
  | "unknown";

export interface DataProvenance {
  sourceId: string;
  sourceLabel: string;
  sourceUrl?: string;
  checkedAt: string; // ISO-8601 timestamp
  confidence: ConfidenceLevel;
  status: AvailabilityStatus;
  freshnessNote?: string;
}

export interface ServiceStatusRecord {
  trainNumber: string;
  trainName: string;
  travelDate: string; // YYYY-MM-DD
  affectedSegment: {
    fromStation: string;
    toStation: string;
  };
  runStatus: ServiceRunStatus;
  effectivePeriod?: string;
  provenance: DataProvenance;
}

/**
 * Strictly distinguishes a locally prepared booking handoff from an
 * official temporary hold explicitly confirmed by the Railway system.
 */
export type BookingHandoffState =
  | {
      kind: "ready_for_official_booking";
      preparedAt: string;
      officialUrl: string;
      note: string;
    }
  | {
      kind: "official_hold_confirmed";
      confirmedAt: string;
      expiresAt: string;
      sourceId: string;
      officialUrl: string;
    };
