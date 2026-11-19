import type { ReleaseReminderConfig } from "@get-ticket/shared-core";

export interface PlannedReleaseReminder {
  releaseDate: string; // YYYY-MM-DD
  releaseAtIso: string;
  notifyAtIso: string;
  advanceDays: number;
  note: string;
}

/**
 * Computes the user-configurable ticket release reminder date/time.
 * Per Phase 0 Step 1, online sales window is stated as 10 days in advance,
 * while release time remains user-configurable (never hard-coded as official truth).
 */
export function computeReleaseReminder(
  journeyDate: string,
  config: ReleaseReminderConfig,
  utcOffsetMinutes = 360, // Asia/Dhaka UTC+6 default
): PlannedReleaseReminder {
  const [yearStr, monthStr, dayStr] = journeyDate.split("-");
  const [hourStr, minStr] = config.releaseTimeLocal.split(":");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hour = Number(hourStr);
  const minute = Number(minStr);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    throw new Error("Invalid journeyDate or releaseTimeLocal");
  }

  // Compute release date in calendar days before journeyDate
  const releaseMidnightUtc = Date.UTC(year, month - 1, day - config.advanceDays, 0, 0, 0);
  const releaseDateObj = new Date(releaseMidnightUtc);
  const yyyy = releaseDateObj.getUTCFullYear();
  const mm = String(releaseDateObj.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(releaseDateObj.getUTCDate()).padStart(2, "0");
  const releaseDate = `${yyyy}-${mm}-${dd}`;

  const releaseUtcMs =
    Date.UTC(
      releaseDateObj.getUTCFullYear(),
      releaseDateObj.getUTCMonth(),
      releaseDateObj.getUTCDate(),
      hour,
      minute,
      0,
    ) -
    utcOffsetMinutes * 60 * 1000;

  const notifyUtcMs = releaseUtcMs - config.notifyMinutesBefore * 60 * 1000;

  return {
    releaseDate,
    releaseAtIso: new Date(releaseUtcMs).toISOString(),
    notifyAtIso: new Date(notifyUtcMs).toISOString(),
    advanceDays: config.advanceDays,
    note: `User-configured ${config.advanceDays}-day advance reminder (${config.releaseTimeLocal} local time). Verify official Railway release time before booking.`,
  };
}
