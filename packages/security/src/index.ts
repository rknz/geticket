import { z } from "zod";

export const OFFICIAL_RAILWAY_HOSTS = [
  "eticket.railway.gov.bd",
  "railway.gov.bd",
] as const;

export const OFFICIAL_ETICKET_URL = "https://eticket.railway.gov.bd/";
export const OFFICIAL_SCHEDULE_REFERENCE_URL =
  "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2";
export const OFFICIAL_FARE_EAST_URL =
  "https://railway.gov.bd/pages/files/69199762933eb65569ddc6b9";

const FORBIDDEN_KEY_PATTERN =
  /(password|passwd|otp|cookie|token|authorization|auth_header|session|cvv|card_number|cardnumber|pin|secret)/i;

/**
 * Verifies that a URL uses HTTPS and points strictly to an allowlisted official
 * Bangladesh Railway hostname.
 */
export function isAllowedOfficialUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return OFFICIAL_RAILWAY_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    );
  } catch {
    return false;
  }
}

/**
 * Recursively checks an object for prohibited credential, session, OTP,
 * cookie, token, or payment field names.
 */
export function findForbiddenSensitiveKeys(
  value: unknown,
  pathPrefix = "",
): string[] {
  const found: string[] = [];
  if (value === null || typeof value !== "object") return found;

  if (Array.isArray(value)) {
    value.forEach((item, idx) => {
      found.push(...findForbiddenSensitiveKeys(item, `${pathPrefix}[${idx}]`));
    });
    return found;
  }

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    if (FORBIDDEN_KEY_PATTERN.test(key)) {
      found.push(currentPath);
    }
    found.push(...findForbiddenSensitiveKeys(nested, currentPath));
  }
  return found;
}

/**
 * Produces a redacted shallow-safe log summary, replacing any sensitive keys
 * with "[REDACTED]".
 */
export function redactForLogs(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = FORBIDDEN_KEY_PATTERN.test(key) ? "[REDACTED]" : value;
  }
  return out;
}

export const extensionMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("GET_STATE"),
  }),
  z.object({
    type: z.literal("OPEN_OFFICIAL_HANDOFF"),
    url: z.string().url().refine(isAllowedOfficialUrl, {
      message: "URL must be an allowlisted official Bangladesh Railway HTTPS origin",
    }),
    profileId: z.string().min(1).max(80).optional(),
  }),
  z.object({
    type: z.literal("SCHEDULE_RELEASE_REMINDER"),
    profileId: z.string().min(1).max(80),
    triggerAtIso: z.string().datetime(),
  }),
  z.object({
    type: z.literal("PAUSE_JOB"),
    profileId: z.string().min(1).max(80),
    reason: z.enum([
      "user_paused",
      "challenge_detected",
      "rate_limited",
      "source_unavailable",
      "browser_unsupported",
    ]),
  }),
  z.object({
    type: z.literal("RESUME_JOB_USER_ACTION"),
    profileId: z.string().min(1).max(80),
    confirmedByUser: z.literal(true),
  }),
]);

export type ExtensionMessage = z.infer<typeof extensionMessageSchema>;

export function validateExtensionMessage(raw: unknown):
  | { ok: true; message: ExtensionMessage }
  | { ok: false; error: string } {
  const sensitiveKeys = findForbiddenSensitiveKeys(raw);
  if (sensitiveKeys.length > 0) {
    return {
      ok: false,
      error: `Rejected message containing forbidden sensitive keys: ${sensitiveKeys.join(", ")}`,
    };
  }
  const parsed = extensionMessageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("; "),
    };
  }
  return { ok: true, message: parsed.data };
}
