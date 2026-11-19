import type { PreferenceSheet } from "./preferences.js";

export interface ReleaseReminderConfig {
  enabled: boolean;
  /** User-configurable advance days (public site states 10 days; release time is configurable). */
  advanceDays: number;
  /** Local HH:mm reminder time chosen by the user. */
  releaseTimeLocal: string;
  notifyMinutesBefore: number;
}

export interface JourneyProfile {
  id: string;
  label: string;
  fromStation: string;
  toStation: string;
  journeyDate: string; // YYYY-MM-DD
  returnDate?: string | undefined; // YYYY-MM-DD
  direction: "outbound" | "return";
  passengerCount: number; // Personal use: 1..3
  budgetBdt?: number | undefined;
  preferredTrainNumbers: string[];
  enabled: boolean;
  preferences: PreferenceSheet;
  releaseReminder: ReleaseReminderConfig;
  createdAt: string;
  updatedAt: string;
}

export type UiLanguage = "bn" | "en";
export type UiTheme = "light" | "dark" | "system";

export interface AppSettings {
  language: UiLanguage;
  theme: UiTheme;
  notificationsEnabled: boolean;
  /** Minimum interval in minutes when an authorized source exists in future. */
  minimumCheckIntervalMinutes: number;
  /** Explicit acknowledgement that all login, CAPTCHA, OTP, and payment remain manual. */
  manualBookingConfirmed: boolean;
}
