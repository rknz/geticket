import { describe, expect, it } from "vitest";
import {
  createDefaultPreferenceSheet,
  journeyProfileSchema,
  rankCandidateOptions,
  type CandidateTrainOption,
  type JourneyProfile,
} from "@get-ticket/shared-core";

function makeProfile(overrides?: Partial<JourneyProfile>): JourneyProfile {
  const now = "2026-11-19T08:00:00.000Z";
  return {
    id: "jp-1",
    label: "Dhaka -> Mymensingh",
    fromStation: "Dhaka",
    toStation: "Mymensingh",
    journeyDate: "2026-11-29",
    direction: "outbound",
    passengerCount: 2,
    preferredTrainNumbers: [],
    enabled: true,
    preferences: createDefaultPreferenceSheet(),
    releaseReminder: {
      enabled: true,
      advanceDays: 10,
      releaseTimeLocal: "08:00",
      notifyMinutesBefore: 15,
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("shared-core validators", () => {
  it("accepts a valid personal-use JourneyProfile (1-3 passengers)", () => {
    const res = journeyProfileSchema.safeParse(makeProfile());
    expect(res.success).toBe(true);
  });

  it("rejects same origin and destination or >3 passengers", () => {
    const sameStation = journeyProfileSchema.safeParse(
      makeProfile({ fromStation: "Dhaka", toStation: "dhaka" }),
    );
    expect(sameStation.success).toBe(false);

    const tooManyPax = journeyProfileSchema.safeParse(makeProfile({ passengerCount: 4 }));
    expect(tooManyPax.success).toBe(false);
  });
});

describe("preference-matcher (docs/PREFERENCE_ENGINE.md)", () => {
  const baseProvenance = {
    sourceId: "TEST-VERIFIED",
    sourceLabel: "Test fixture",
    checkedAt: "2026-11-19T08:00:00.000Z",
    confidence: "verified" as const,
    status: "available" as const,
  };

  it("ranks priority 1 class ahead of priority 2 and never marks unverified seat as verified", () => {
    const profile = makeProfile();
    const candidates: CandidateTrainOption[] = [
      {
        trainNumber: "707",
        trainName: "Tista Express",
        fromStation: "Dhaka",
        toStation: "Mymensingh",
        journeyDate: "2026-11-29",
        departureTime: "07:30",
        classCode: "SNIGDHA",
        seatNumber: 35,
        verifiedSeatOrientation: "unverified",
        availableSeats: 5,
        fareBdt: 400,
        provenance: baseProvenance,
      },
      {
        trainNumber: "707",
        trainName: "Tista Express",
        fromStation: "Dhaka",
        toStation: "Mymensingh",
        journeyDate: "2026-11-29",
        departureTime: "07:30",
        classCode: "S_CHAIR",
        seatNumber: 12,
        verifiedSeatOrientation: "unverified",
        availableSeats: 5,
        fareBdt: 200,
        provenance: baseProvenance,
      },
    ];

    const ranked = rankCandidateOptions(profile, candidates);
    expect(ranked[0]?.option.classCode).toBe("S_CHAIR");
    expect(ranked[0]?.eligible).toBe(true);
    expect(ranked[0]?.usedTentativeSeatRule).toBe(false);
    expect(ranked[0]?.reasons).toContain("Seat direction unavailable / unverified");
  });

  it("applies optional SEAT-001 tentative sort ONLY when explicitly enabled and labels it unverified", () => {
    const prefs = createDefaultPreferenceSheet();
    prefs.tentativeSeatRule.enabled = true;
    const profile = makeProfile({ direction: "outbound", preferences: prefs });

    const candidates: CandidateTrainOption[] = [
      {
        trainNumber: "707",
        trainName: "Tista Express",
        fromStation: "Dhaka",
        toStation: "Mymensingh",
        journeyDate: "2026-11-29",
        departureTime: "07:30",
        classCode: "S_CHAIR",
        seatNumber: 10,
        verifiedSeatOrientation: "unverified",
        availableSeats: 4,
        fareBdt: 200,
        provenance: baseProvenance,
      },
      {
        trainNumber: "707",
        trainName: "Tista Express",
        fromStation: "Dhaka",
        toStation: "Mymensingh",
        journeyDate: "2026-11-29",
        departureTime: "07:30",
        classCode: "S_CHAIR",
        seatNumber: 35,
        verifiedSeatOrientation: "unverified",
        availableSeats: 4,
        fareBdt: 200,
        provenance: baseProvenance,
      },
    ];

    const ranked = rankCandidateOptions(profile, candidates);
    expect(ranked[0]?.option.seatNumber).toBe(35);
    expect(ranked[0]?.usedTentativeSeatRule).toBe(true);
    expect(ranked[0]?.reasons).toContain("Tentative owner preference — not verified");
  });
});
