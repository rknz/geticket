import type {
  BookingHandoffState,
  DataProvenance,
  JourneyProfile,
  ServiceStatusRecord,
} from "@get-ticket/shared-core";
import {
  OFFICIAL_ETICKET_URL,
  OFFICIAL_FARE_EAST_URL,
  OFFICIAL_SCHEDULE_REFERENCE_URL,
  isAllowedOfficialUrl,
} from "@get-ticket/security";

export interface StaticOfficialReference {
  sourceId: string;
  title: string;
  url: string;
  lastVerified: string;
  scopeNote: string;
  isLive: false;
}

export const OFFICIAL_STATIC_REFERENCES: readonly StaticOfficialReference[] = [
  {
    sourceId: "BR-ETICKET-PUBLIC",
    title: "Bangladesh Railway Official e-Ticket Portal",
    url: OFFICIAL_ETICKET_URL,
    lastVerified: "2026-11-17",
    scopeNote:
      "Public booking portal (Search -> Select -> Pay). Online advance window stated as 10 days; no public extension API approved.",
    isLive: false,
  },
  {
    sourceId: "BR-SCHEDULE-PUBLIC",
    title: "Bangladesh Railway Official Train Schedule Index",
    url: OFFICIAL_SCHEDULE_REFERENCE_URL,
    lastVerified: "2026-11-17",
    scopeNote: "Dated official static timetable reference only. Not a live feed.",
    isLive: false,
  },
  {
    sourceId: "BR-FARE-EAST",
    title: "Bangladesh Railway Eastern Zone Published Fare List",
    url: OFFICIAL_FARE_EAST_URL,
    lastVerified: "2026-11-17",
    scopeNote: "Dated official static fare reference only. Fares may change.",
    isLive: false,
  },
] as const;

export interface AvailabilityLookupResult {
  liveSupported: boolean;
  message: string;
  provenance: DataProvenance;
  officialReferences: readonly StaticOfficialReference[];
}

export interface ServiceStatusLookupResult {
  liveSupported: boolean;
  message: string;
  records: ServiceStatusRecord[];
  provenance: DataProvenance;
}

export interface RailwayDataProvider {
  readonly providerId: string;
  readonly supportsLiveAvailability: boolean;
  readonly supportsLiveServiceStatus: boolean;
  checkAvailability(profile: JourneyProfile, nowIso?: string): Promise<AvailabilityLookupResult>;
  checkServiceStatus(profile: JourneyProfile, nowIso?: string): Promise<ServiceStatusLookupResult>;
  prepareOfficialHandoff(profile: JourneyProfile, nowIso?: string): BookingHandoffState;
}

/**
 * Approved Phase 1+ provider under Step 3 Option A (Manual / Reference-Only +
 * Official-Site Handoff Mode). Never invents availability, never calls private
 * endpoints, and never claims a ticket hold.
 */
export class ManualReferenceOnlyProvider implements RailwayDataProvider {
  readonly providerId = "manual-reference-only";
  readonly supportsLiveAvailability = false;
  readonly supportsLiveServiceStatus = false;

  async checkAvailability(
    _profile: JourneyProfile,
    nowIso = new Date().toISOString(),
  ): Promise<AvailabilityLookupResult> {
    return {
      liveSupported: false,
      message: "Live availability integration unavailable",
      provenance: {
        sourceId: "BR-ETICKET-PUBLIC",
        sourceLabel: "Official e-Ticket Portal (Manual Handoff Only)",
        sourceUrl: OFFICIAL_ETICKET_URL,
        checkedAt: nowIso,
        confidence: "unverified",
        status: "unavailable",
        freshnessNote:
          "No public Bangladesh Railway API or automated polling permission is documented (Phase 0 Step 1 audit).",
      },
      officialReferences: OFFICIAL_STATIC_REFERENCES,
    };
  }

  async checkServiceStatus(
    _profile: JourneyProfile,
    nowIso = new Date().toISOString(),
  ): Promise<ServiceStatusLookupResult> {
    return {
      liveSupported: false,
      message: "Live service status unavailable",
      records: [],
      provenance: {
        sourceId: "BR-SCHEDULE-PUBLIC",
        sourceLabel: "Official Schedule Index (Static Reference Only)",
        sourceUrl: OFFICIAL_SCHEDULE_REFERENCE_URL,
        checkedAt: nowIso,
        confidence: "unverified",
        status: "unavailable",
        freshnessNote:
          "No authorized live cancellation/suspension feed is configured. Verify directly on official Railway channels.",
      },
    };
  }

  prepareOfficialHandoff(
    profile: JourneyProfile,
    nowIso = new Date().toISOString(),
  ): BookingHandoffState {
    if (!isAllowedOfficialUrl(OFFICIAL_ETICKET_URL)) {
      throw new Error("Official e-ticket URL failed allowlist verification");
    }
    return {
      kind: "ready_for_official_booking",
      preparedAt: nowIso,
      officialUrl: OFFICIAL_ETICKET_URL,
      note: `Prepared for ${profile.fromStation} -> ${profile.toStation} on ${profile.journeyDate} (${profile.passengerCount} passenger(s)). No reservation or hold is claimed; complete Search -> Select -> Pay manually on the official site.`,
    };
  }
}
