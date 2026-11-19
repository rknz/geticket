import { z } from "zod";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const confidenceLevelSchema = z.enum(["verified", "partial", "unverified"]);

export const availabilityStatusSchema = z.enum([
  "available",
  "sold_out",
  "limited",
  "unknown",
  "stale",
  "unavailable",
]);

export const serviceRunStatusSchema = z.enum([
  "running",
  "cancelled",
  "suspended",
  "partial_impact",
  "stale",
  "unavailable",
  "unknown",
]);

export const dataProvenanceSchema = z.object({
  sourceId: z.string().min(1).max(80),
  sourceLabel: z.string().min(1).max(160),
  sourceUrl: z.string().url().optional(),
  checkedAt: z.string().datetime(),
  confidence: confidenceLevelSchema,
  status: availabilityStatusSchema,
  freshnessNote: z.string().max(240).optional(),
});

export const serviceStatusRecordSchema = z.object({
  trainNumber: z.string().min(1).max(20),
  trainName: z.string().min(1).max(120),
  travelDate: z.string().regex(ISO_DATE_RE, "Expected YYYY-MM-DD"),
  affectedSegment: z.object({
    fromStation: z.string().min(1).max(100),
    toStation: z.string().min(1).max(100),
  }),
  runStatus: serviceRunStatusSchema,
  effectivePeriod: z.string().max(160).optional(),
  provenance: dataProvenanceSchema,
});

export const rankedClassPreferenceSchema = z.object({
  classCode: z.string().min(1).max(40),
  rank: z.number().int().min(1).max(50),
  enabled: z.boolean(),
  allowAnyCoachFallback: z.boolean(),
});

export const coachPreferenceSchema = z.object({
  coachCode: z.string().min(1).max(20),
  rank: z.number().int().min(1).max(50),
  enabled: z.boolean(),
});

export const seatDirectionPreferenceSchema = z.enum([
  "forward_first",
  "neutral_then_backward",
  "any_direction",
]);

export const legSeatPreferenceSchema = z.object({
  direction: z.enum(["outbound", "return"]),
  preference: seatDirectionPreferenceSchema,
  allowUnverifiedSeatDirection: z.boolean(),
});

export const tentativeSeatRuleConfigSchema = z.object({
  enabled: z.boolean(),
  assumptionId: z.literal("SEAT-001"),
  boundarySeatNumber: z.literal(30),
  disclaimerLabel: z.literal("Tentative owner preference — not verified"),
});

export const preferenceSheetSchema = z
  .object({
    rankedClasses: z.array(rankedClassPreferenceSchema).min(1),
    preferredCoaches: z.array(coachPreferenceSchema),
    outboundSeat: legSeatPreferenceSchema,
    returnSeat: legSeatPreferenceSchema,
    tentativeSeatRule: tentativeSeatRuleConfigSchema,
    tieBreaker: z.enum(["lowest_fare", "earliest_departure"]),
  })
  .superRefine((sheet, ctx) => {
    const ranks = new Set<number>();
    for (const item of sheet.rankedClasses) {
      if (ranks.has(item.rank)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate class rank: ${item.rank}`,
          path: ["rankedClasses"],
        });
      }
      ranks.add(item.rank);
    }
  });

export const releaseReminderConfigSchema = z.object({
  enabled: z.boolean(),
  advanceDays: z.number().int().min(1).max(30),
  releaseTimeLocal: z.string().regex(TIME_HHMM_RE, "Expected HH:mm"),
  notifyMinutesBefore: z.number().int().min(0).max(180),
});

export const journeyProfileSchema = z
  .object({
    id: z.string().min(1).max(80),
    label: z.string().min(1).max(120),
    fromStation: z.string().min(1).max(100),
    toStation: z.string().min(1).max(100),
    journeyDate: z.string().regex(ISO_DATE_RE, "Expected YYYY-MM-DD"),
    returnDate: z.string().regex(ISO_DATE_RE, "Expected YYYY-MM-DD").optional(),
    direction: z.enum(["outbound", "return"]),
    passengerCount: z.number().int().min(1).max(3),
    budgetBdt: z.number().int().positive().max(100000).optional(),
    preferredTrainNumbers: z.array(z.string().min(1).max(20)).max(20),
    enabled: z.boolean(),
    preferences: preferenceSheetSchema,
    releaseReminder: releaseReminderConfigSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .superRefine((profile, ctx) => {
    if (
      profile.fromStation.trim().toLowerCase() ===
      profile.toStation.trim().toLowerCase()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Origin and destination stations must be different",
        path: ["toStation"],
      });
    }
    if (profile.returnDate && profile.returnDate < profile.journeyDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Return date cannot be earlier than journey date",
        path: ["returnDate"],
      });
    }
  });

export const appSettingsSchema = z.object({
  language: z.enum(["bn", "en"]),
  theme: z.enum(["light", "dark", "system"]),
  notificationsEnabled: z.boolean(),
  minimumCheckIntervalMinutes: z.number().int().min(5).max(1440),
  manualBookingConfirmed: z.boolean(),
});

export function createDefaultPreferenceSheet(): z.infer<typeof preferenceSheetSchema> {
  return {
    rankedClasses: [
      { classCode: "S_CHAIR", rank: 1, enabled: true, allowAnyCoachFallback: true },
      { classCode: "SNIGDHA", rank: 2, enabled: true, allowAnyCoachFallback: true },
      { classCode: "F_CHAIR", rank: 3, enabled: false, allowAnyCoachFallback: true },
    ],
    preferredCoaches: [],
    outboundSeat: {
      direction: "outbound",
      preference: "forward_first",
      allowUnverifiedSeatDirection: true,
    },
    returnSeat: {
      direction: "return",
      preference: "forward_first",
      allowUnverifiedSeatDirection: true,
    },
    tentativeSeatRule: {
      enabled: false,
      assumptionId: "SEAT-001",
      boundarySeatNumber: 30,
      disclaimerLabel: "Tentative owner preference — not verified",
    },
    tieBreaker: "lowest_fare",
  };
}

export function createDefaultAppSettings(): z.infer<typeof appSettingsSchema> {
  return {
    language: "bn",
    theme: "system",
    notificationsEnabled: true,
    minimumCheckIntervalMinutes: 15,
    manualBookingConfirmed: true,
  };
}
