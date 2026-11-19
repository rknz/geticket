import type { UiLanguage } from "../types/index.js";

export const UI_STRINGS = {
  en: {
    appName: "Get Ticket",
    tagline: "Personal Bangladesh Railway Planner & Official Handoff",
    navOverview: "Overview",
    navNewJourney: "New Journey",
    navResults: "Results",
    navServiceStatus: "Service Status",
    navPreferences: "Preferences",
    navAltRoutes: "Alt Routes",
    navMonitoring: "Monitoring",
    navReleasePlanner: "Release Planner",
    navDataSources: "Data Sources",
    navSecurity: "Security & Privacy",
    navSettings: "Settings",
    statusLive: "Live",
    statusCheckedAt: "Checked at",
    statusStale: "Stale",
    statusUnavailable: "Unavailable",
    statusChallengePaused: "Challenge paused",
    statusUnsupported: "Not supported in this browser",
    liveAvailabilityUnavailable: "Live availability integration unavailable",
    liveServiceStatusUnavailable: "Live service status unavailable",
    seatDirectionUnverified: "Seat direction unavailable / unverified",
    tentativeOwnerPreference: "Tentative owner preference — not verified",
    readyForOfficialBooking: "Ready for official booking",
    officialHoldConfirmed: "Official hold confirmed",
    userActionRequired: "User action required",
    openOfficialSite: "Open Official e-Ticket Site",
    officialFlowSteps: "Official flow: Search → Select → Pay (user-controlled)",
    noCredentialsNotice:
      "Get Ticket never stores passwords, OTPs, cookies, tokens, or payment details.",
  },
  bn: {
    appName: "Get Ticket",
    tagline: "ব্যক্তিগত Bangladesh Railway পরিকল্পনা ও অফিসিয়াল হ্যান্ডঅফ",
    navOverview: "সারসংক্ষেপ",
    navNewJourney: "নতুন যাত্রা",
    navResults: "ফলাফল",
    navServiceStatus: "সার্ভিস স্ট্যাটাস",
    navPreferences: "পছন্দের তালিকা",
    navAltRoutes: "বিকল্প রুট",
    navMonitoring: "মনিটরিং",
    navReleasePlanner: "টিকিট রিলিজ প্ল্যানার",
    navDataSources: "তথ্য উৎস",
    navSecurity: "নিরাপত্তা ও গোপনীয়তা",
    navSettings: "সেটিংস",
    statusLive: "লাইভ",
    statusCheckedAt: "যাচাইয়ের সময়",
    statusStale: "পুরোনো তথ্য",
    statusUnavailable: "উপলব্ধ নয়",
    statusChallengePaused: "চ্যালেঞ্জে স্থগিত",
    statusUnsupported: "এই ব্রাউজারে সমর্থিত নয়",
    liveAvailabilityUnavailable: "লাইভ availability integration উপলব্ধ নয়",
    liveServiceStatusUnavailable: "লাইভ সার্ভিস স্ট্যাটাস উপলব্ধ নয়",
    seatDirectionUnverified: "সিটের দিক যাচাইকৃত নয় / উপলব্ধ নয়",
    tentativeOwnerPreference: "Tentative owner preference — not verified",
    readyForOfficialBooking: "অফিসিয়াল বুকিংয়ের জন্য প্রস্তুত",
    officialHoldConfirmed: "অফিসিয়াল হোল্ড নিশ্চিত",
    userActionRequired: "ব্যবহারকারীর পদক্ষেপ প্রয়োজন",
    openOfficialSite: "অফিসিয়াল ই-টিকিট সাইট খুলুন",
    officialFlowSteps: "অফিসিয়াল ধাপ: Search → Select → Pay (সম্পূর্ণ ব্যবহারকারীর নিয়ন্ত্রণে)",
    noCredentialsNotice:
      "Get Ticket কখনো পাসওয়ার্ড, OTP, কুকি, টোকেন বা পেমেন্ট তথ্য সংরক্ষণ করে না।",
  },
} as const;

export type UiStringKey = keyof typeof UI_STRINGS.en;

export function t(language: UiLanguage, key: UiStringKey): string {
  return UI_STRINGS[language][key];
}
