import { describe, expect, it } from "vitest";
import { createDefaultPreferenceSheet, type JourneyProfile } from "@get-ticket/shared-core";
import {
  ManualReferenceOnlyProvider,
  normalizeAvailabilityStatus,
} from "@get-ticket/railway-engine";
import {
  findValidatedAlternativeRoutes,
  validateSingleSegment,
  type StationGraph,
} from "@get-ticket/route-intelligence";

const profile: JourneyProfile = {
  id: "jp-int-1",
  label: "Dhaka -> Jamalpur",
  fromStation: "Dhaka",
  toStation: "Jamalpur",
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

describe("ManualReferenceOnlyProvider (Option A honesty rules)", () => {
  const provider = new ManualReferenceOnlyProvider();

  it("reports Live availability integration unavailable and never claims live data", async () => {
    const avail = await provider.checkAvailability(profile);
    expect(avail.liveSupported).toBe(false);
    expect(avail.message).toBe("Live availability integration unavailable");
    expect(avail.provenance.status).toBe("unavailable");
    expect(avail.provenance.confidence).toBe("unverified");

    const svc = await provider.checkServiceStatus(profile);
    expect(svc.liveSupported).toBe(false);
    expect(svc.message).toBe("Live service status unavailable");
    expect(svc.records).toEqual([]);
  });

  it("prepares ready_for_official_booking handoff without claiming a hold", () => {
    const handoff = provider.prepareOfficialHandoff(profile);
    expect(handoff.kind).toBe("ready_for_official_booking");
    expect(handoff.officialUrl).toBe("https://eticket.railway.gov.bd/");
  });

  it("never maps missing or unpermitted data to sold_out", () => {
    expect(
      normalizeAvailabilityStatus({
        sourcePermitted: false,
        sourceResponded: false,
        isStale: false,
      }),
    ).toBe("unavailable");

    expect(
      normalizeAvailabilityStatus({
        sourcePermitted: true,
        sourceResponded: true,
        isStale: false,
        confirmedSeatCount: null,
      }),
    ).toBe("unknown");
  });
});

describe("route-intelligence segment validation", () => {
  const graph: StationGraph = {
    stations: [
      { code: "DHK", nameEn: "Dhaka" },
      { code: "MYN", nameEn: "Mymensingh" },
      { code: "JML", nameEn: "Jamalpur" },
    ],
    edges: [
      {
        fromCode: "DHK",
        toCode: "MYN",
        trainNumber: "707",
        stopVerified: true,
        ticketValidityVerified: true,
        sourceId: "TEST-TIMETABLE",
        verifiedDate: "2026-11-19",
      },
      {
        fromCode: "MYN",
        toCode: "JML",
        trainNumber: "708",
        stopVerified: true,
        ticketValidityVerified: true,
        sourceId: "TEST-TIMETABLE",
        verifiedDate: "2026-11-19",
      },
    ],
  };

  it("refuses to treat a Dhaka -> Jamalpur segment as valid for Mymensingh without exact match", () => {
    const mismatch = validateSingleSegment(graph.edges[0], "DHK", "JML");
    expect(mismatch.validForSingleTicket).toBe(false);
    expect(mismatch.status).toBe("not_recommended");
  });

  it("explicitly labels two-leg alternatives as multi_leg_separate_tickets", () => {
    const routes = findValidatedAlternativeRoutes(graph, "DHK", "JML");
    expect(routes).toHaveLength(1);
    expect(routes[0]?.kind).toBe("multi_leg_separate_tickets");
    expect(routes[0]?.requiresSeparateTickets).toBe(true);
  });
});
