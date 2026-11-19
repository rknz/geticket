import React, { useEffect, useMemo, useState } from "react";
import {
  createDefaultPreferenceSheet,
  journeyProfileSchema,
  t,
  type AppSettings,
  type JourneyProfile,
  type SeatDirectionPreference,
} from "@get-ticket/shared-core";
import {
  OFFICIAL_ETICKET_URL,
  OFFICIAL_RAILWAY_HOSTS,
} from "@get-ticket/security";
import type { GetTicketStoreState } from "@get-ticket/storage";
import {
  ManualReferenceOnlyProvider,
  OFFICIAL_STATIC_REFERENCES,
} from "@get-ticket/railway-engine";
import { computeReleaseReminder } from "@get-ticket/scheduler";
import { StatusBadge } from "./StatusBadge.js";
import { CalendarPicker } from "./CalendarPicker.js";
import {
  CLASS_OPTIONS,
  POPULAR_STATIONS,
  STATIC_TRAIN_REFERENCES,
} from "./reference-data.js";
import "./tokens.css";

export interface PlatformCapabilities {
  platformName: string;
  alarmsSupported: boolean;
  notificationsSupported: boolean;
  popupSupported: boolean;
  lifecycleNote: string;
}

export interface PlatformBridge {
  capabilities: PlatformCapabilities;
  loadState(): Promise<GetTicketStoreState>;
  saveProfile(profile: JourneyProfile): Promise<GetTicketStoreState>;
  deleteProfile(profileId: string): Promise<GetTicketStoreState>;
  updateSettings(settings: AppSettings): Promise<GetTicketStoreState>;
  clearAllData(): Promise<GetTicketStoreState>;
  openOfficialUrl(url: string, profileId?: string): Promise<void>;
  openDashboardTab?(): Promise<void>;
  scheduleReleaseReminder?(profileId: string, triggerAtIso: string): Promise<boolean>;
}

type TabId = "home" | "plan" | "preferences" | "status" | "settings";

const provider = new ManualReferenceOnlyProvider();

function defaultFutureDate(daysAhead: number): string {
  const d = new Date(Date.now() + daysAhead * 86400_000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DashboardApp({ bridge }: { bridge: PlatformBridge }) {
  const [state, setState] = useState<GetTicketStoreState | null>(null);
  const [tab, setTab] = useState<TabId>("home");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  // Plan Trip form state
  const [fromStation, setFromStation] = useState("Dhaka");
  const [toStation, setToStation] = useState("Mymensingh");
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [journeyDate, setJourneyDate] = useState(() => defaultFutureDate(7));
  const [primaryClass, setPrimaryClass] = useState("S_CHAIR");
  const [passengerCount, setPassengerCount] = useState(1);
  const [direction, setDirection] = useState<"outbound" | "return">("outbound");
  const [releaseTimeLocal, setReleaseTimeLocal] = useState("08:00");
  const [trainSearch, setTrainSearch] = useState("");
  const [selectedTrains, setSelectedTrains] = useState<string[]>([]);

  useEffect(() => {
    void bridge.loadState().then((loaded) => {
      setState(loaded);
      if (loaded.profiles[0]) {
        setSelectedProfileId(loaded.profiles[0].id);
      }
    });
  }, [bridge]);

  const filteredFromStations = useMemo(() => {
    const q = fromStation.trim().toLowerCase();
    if (!q) return POPULAR_STATIONS;
    return POPULAR_STATIONS.filter(
      (s) =>
        s.nameEn.toLowerCase().includes(q) ||
        s.nameBn.includes(fromStation.trim()) ||
        s.code.toLowerCase().includes(q),
    );
  }, [fromStation]);

  const filteredToStations = useMemo(() => {
    const q = toStation.trim().toLowerCase();
    if (!q) return POPULAR_STATIONS;
    return POPULAR_STATIONS.filter(
      (s) =>
        s.nameEn.toLowerCase().includes(q) ||
        s.nameBn.includes(toStation.trim()) ||
        s.code.toLowerCase().includes(q),
    );
  }, [toStation]);

  const filteredTrains = useMemo(() => {
    const q = trainSearch.trim().toLowerCase();
    if (!q) return STATIC_TRAIN_REFERENCES;
    return STATIC_TRAIN_REFERENCES.filter(
      (tr) =>
        tr.nameEn.toLowerCase().includes(q) ||
        tr.nameBn.includes(trainSearch.trim()) ||
        tr.trainNumber.includes(q) ||
        tr.corridor.toLowerCase().includes(q),
    );
  }, [trainSearch]);

  if (!state) {
    return (
      <main className="gt-shell" aria-busy="true">
        <div className="gt-card">Loading Get Ticket…</div>
      </main>
    );
  }

  const lang = state.settings.language;
  const isBn = lang === "bn";
  const activeProfile =
    state.profiles.find((p) => p.id === selectedProfileId) ?? state.profiles[0] ?? null;

  const handoff = activeProfile ? provider.prepareOfficialHandoff(activeProfile) : null;
  const releasePlan = activeProfile
    ? computeReleaseReminder(activeProfile.journeyDate, activeProfile.releaseReminder)
    : null;

  function showToast(msg: string) {
    setToast(msg);
  }

  function toggleTrainSelection(trainNumber: string) {
    setSelectedTrains((prev) =>
      prev.includes(trainNumber)
        ? prev.filter((id) => id !== trainNumber)
        : [...prev, trainNumber],
    );
  }

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const now = new Date().toISOString();
    const defaultPrefs = createDefaultPreferenceSheet();
    const rankedClasses = defaultPrefs.rankedClasses.map((c, idx) =>
      idx === 0 ? { ...c, classCode: primaryClass, enabled: true } : c,
    );

    const candidate: JourneyProfile = {
      id: `jp-${Date.now()}`,
      label: `${fromStation.trim()} → ${toStation.trim()} (${journeyDate})`,
      fromStation: fromStation.trim(),
      toStation: toStation.trim(),
      journeyDate,
      direction,
      passengerCount,
      preferredTrainNumbers: selectedTrains,
      enabled: true,
      preferences: { ...defaultPrefs, rankedClasses },
      releaseReminder: {
        enabled: true,
        advanceDays: 10,
        releaseTimeLocal,
        notifyMinutesBefore: 15,
      },
      createdAt: now,
      updatedAt: now,
    };

    const parsed = journeyProfileSchema.safeParse(candidate);
    if (!parsed.success) {
      setFormError(parsed.error.issues.map((i) => i.message).join("; "));
      return;
    }

    const updated = await bridge.saveProfile(parsed.data);
    setState(updated);
    setSelectedProfileId(parsed.data.id);
    showToast(
      isBn
        ? `যাত্রা সেভ হয়েছে: ${parsed.data.label}`
        : `Trip saved: ${parsed.data.label}`,
    );
    setTab("home");
  }

  async function handleMoveClassRank(index: number, delta: -1 | 1) {
    if (!activeProfile) return;
    const list = [...activeProfile.preferences.rankedClasses].sort(
      (a, b) => a.rank - b.rank,
    );
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const current = list[index];
    const swap = list[target];
    if (!current || !swap) return;
    list[index] = swap;
    list[target] = current;
    const reRanked = list.map((item, idx) => ({ ...item, rank: idx + 1 }));
    const updated = await bridge.saveProfile({
      ...activeProfile,
      preferences: { ...activeProfile.preferences, rankedClasses: reRanked },
      updatedAt: new Date().toISOString(),
    });
    setState(updated);
    showToast(isBn ? "ক্লাস অগ্রাধিকার আপডেট হয়েছে।" : "Class priority order updated.");
  }

  async function handleToggleClassEnabled(classCode: string) {
    if (!activeProfile) return;
    const nextClasses = activeProfile.preferences.rankedClasses.map((c) =>
      c.classCode === classCode ? { ...c, enabled: !c.enabled } : c,
    );
    const updated = await bridge.saveProfile({
      ...activeProfile,
      preferences: { ...activeProfile.preferences, rankedClasses: nextClasses },
      updatedAt: new Date().toISOString(),
    });
    setState(updated);
  }

  async function handleToggleTentativeSeatRule(enabled: boolean) {
    if (!activeProfile) return;
    const updated = await bridge.saveProfile({
      ...activeProfile,
      preferences: {
        ...activeProfile.preferences,
        tentativeSeatRule: {
          ...activeProfile.preferences.tentativeSeatRule,
          enabled,
        },
      },
      updatedAt: new Date().toISOString(),
    });
    setState(updated);
  }

  async function handleSeatPrefChange(
    leg: "outbound" | "return",
    pref: SeatDirectionPreference,
  ) {
    if (!activeProfile) return;
    const nextPrefs =
      leg === "outbound"
        ? {
            ...activeProfile.preferences,
            outboundSeat: { ...activeProfile.preferences.outboundSeat, preference: pref },
          }
        : {
            ...activeProfile.preferences,
            returnSeat: { ...activeProfile.preferences.returnSeat, preference: pref },
          };
    const updated = await bridge.saveProfile({
      ...activeProfile,
      preferences: nextPrefs,
      updatedAt: new Date().toISOString(),
    });
    setState(updated);
  }

  async function handleSettingsPatch(patch: Partial<AppSettings>) {
    if (!state) return;
    const updated = await bridge.updateSettings({ ...state.settings, ...patch });
    setState(updated);
  }

  async function handleCopySummary() {
    if (!activeProfile) return;
    const topClasses = [...activeProfile.preferences.rankedClasses]
      .filter((c) => c.enabled)
      .sort((a, b) => a.rank - b.rank)
      .map((c) => `#${c.rank} ${c.classCode}`)
      .join(", ");
    const trains =
      activeProfile.preferredTrainNumbers.length > 0
        ? activeProfile.preferredTrainNumbers.join(", ")
        : "Any";
    const summary = [
      `Route: ${activeProfile.fromStation} -> ${activeProfile.toStation}`,
      `Date: ${activeProfile.journeyDate} (${activeProfile.direction})`,
      `Passengers: ${activeProfile.passengerCount}`,
      `Trains: ${trains}`,
      `Class Priority: ${topClasses}`,
      releasePlan ? `Release Reminder: ${releasePlan.releaseDate} (${activeProfile.releaseReminder.releaseTimeLocal})` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      showToast(isBn ? "যাত্রার তথ্য কপি হয়েছে!" : "Trip checklist copied to clipboard!");
    } catch {
      showToast(summary);
    }
  }

  async function handleScheduleReminder() {
    if (!activeProfile || !releasePlan) return;
    if (bridge.scheduleReleaseReminder) {
      const ok = await bridge.scheduleReleaseReminder(
        activeProfile.id,
        releasePlan.notifyAtIso,
      );
      showToast(
        ok
          ? isBn
            ? `রিমাইন্ডার সেট হয়েছে (${releasePlan.releaseDate} · ${activeProfile.releaseReminder.releaseTimeLocal})`
            : `Browser reminder scheduled for ${releasePlan.releaseDate} (${activeProfile.releaseReminder.releaseTimeLocal}).`
          : isBn
            ? "রিমাইন্ডার সময় অতীত বা ব্রাউজার অ্যালার্ম উপলব্ধ নয়।"
            : "Reminder time is in the past or browser alarms are unavailable.",
      );
    } else {
      showToast(
        isBn
          ? `রিমাইন্ডার তারিখ: ${releasePlan.releaseDate} (${activeProfile.releaseReminder.releaseTimeLocal})`
          : `Reminder target: ${releasePlan.releaseDate} (${activeProfile.releaseReminder.releaseTimeLocal})`,
      );
    }
  }

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "home", label: isBn ? "১. শুরু করুন" : "1. Home" },
    { id: "plan", label: isBn ? "২. নতুন যাত্রা" : "2. Plan Trip" },
    { id: "preferences", label: isBn ? "৩. পছন্দ ও সিট" : "3. Preferences" },
    { id: "status", label: isBn ? "৪. রিমাইন্ডার ও উৎস" : "4. Reminders & Sources" },
    { id: "settings", label: isBn ? "৫. সেটিংস ও সাহায্য" : "5. Settings & Help" },
  ];

  return (
    <div className="gt-app" data-theme={state.settings.theme}>
      <header className="gt-topbar">
        <div className="gt-topbar-inner">
          <div className="gt-brand">
            <span className="gt-logo-mark" aria-hidden="true">
              GT
            </span>
            <div>
              <h1>{t(lang, "appName")}</h1>
              <div className="gt-muted">
                {isBn
                  ? "ব্যক্তিগত Bangladesh Railway ট্রিপ প্ল্যানার ও অফিসিয়াল হ্যান্ডঅফ"
                  : "Personal Bangladesh Railway Trip Planner & Official Handoff"}
              </div>
            </div>
          </div>
          <div className="gt-topbar-actions">
            <StatusBadge
              tone="live"
              label={isBn ? "এক্সটেনশন সক্রিয় (Local)" : "Extension Active (Local)"}
            />
            <button
              type="button"
              className="gt-btn gt-btn-sm"
              onClick={() =>
                void handleSettingsPatch({ language: isBn ? "en" : "bn" })
              }
            >
              {isBn ? "English" : "বাংলা"}
            </button>
          </div>
        </div>
      </header>

      <main className="gt-shell">
        <nav className="gt-nav" aria-label="Primary navigation">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className="gt-nav-btn"
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {toast && (
          <div className="gt-toast" role="status">
            ✓ {toast}
          </div>
        )}

        <div className="gt-layout">
          <div>
            {/* TAB 1: HOME */}
            {tab === "home" && (
              <>
                {showGuide && (
                  <section className="gt-hero-card" aria-label="How it works">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <h2>
                        {isBn
                          ? "Get Ticket কীভাবে কাজ করে?"
                          : "How Get Ticket Works (3 Simple Steps)"}
                      </h2>
                      <button
                        type="button"
                        className="gt-btn gt-btn-sm"
                        onClick={() => setShowGuide(false)}
                      >
                        {isBn ? "লুকান" : "Hide"}
                      </button>
                    </div>
                    <p className="gt-muted" style={{ margin: "4px 0 0 0" }}>
                      {isBn
                        ? "এটি কোনো ওয়েবসাইট নয় — এটি আপনার ব্রাউজারের ব্যক্তিগত Bangladesh Railway টিকিট প্ল্যানার। অফিসিয়াল API অনুমতি না থাকায় এটি নিজে টিকিট কাটবে না; বরং আপনার যাত্রার তথ্য, পছন্দের ক্লাস ও রিমাইন্ডার গুছিয়ে রাখবে এবং এক ক্লিকে অফিসিয়াল ই-টিকিট সাইটে নিয়ে যাবে।"
                        : "This is a local browser extension — your personal Bangladesh Railway booking assistant. It organizes your trips, class priorities, and release reminders, then opens the official e-ticket portal so you complete booking safely yourself."}
                    </p>
                    <div className="gt-steps">
                      <div className="gt-step-box">
                        <span className="gt-step-num">1</span>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {isBn ? "যাত্রা ও ট্রেন বাছাই" : "Plan Your Trip"}
                        </div>
                        <div className="gt-muted">
                          {isBn
                            ? "স্টেশন, ক্যালেন্ডার থেকে তারিখ এবং পছন্দের ট্রেন সেভ করুন।"
                            : "Pick stations, select a date on the calendar, and choose trains."}
                        </div>
                      </div>
                      <div className="gt-step-box">
                        <span className="gt-step-num">2</span>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {isBn ? "পছন্দ ও রিমাইন্ডার" : "Rank & Remind"}
                        </div>
                        <div className="gt-muted">
                          {isBn
                            ? "ক্লাস অগ্রাধিকার (#১, #২) ও ১০ দিন আগের রিমাইন্ডার সেট করুন।"
                            : "Set class priority (#1, #2) and advance ticket release reminders."}
                        </div>
                      </div>
                      <div className="gt-step-box">
                        <span className="gt-step-num">3</span>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {isBn ? "অফিসিয়াল সাইটে বুক" : "Book on Official Site"}
                        </div>
                        <div className="gt-muted">
                          {isBn
                            ? "এক ক্লিকে eticket.railway.gov.bd খুলে লগইন ও পেমেন্ট করুন।"
                            : "Open eticket.railway.gov.bd in one click for Search → Select → Pay."}
                        </div>
                      </div>
                    </div>
                    <div className="gt-btn-row">
                      <button
                        type="button"
                        className="gt-btn gt-btn-primary"
                        onClick={() => setTab("plan")}
                      >
                        + {isBn ? "নতুন যাত্রা তৈরি করুন" : "Plan a New Trip"}
                      </button>
                      <button
                        type="button"
                        className="gt-btn"
                        onClick={() =>
                          void bridge.openOfficialUrl(
                            OFFICIAL_ETICKET_URL,
                            activeProfile?.id,
                          )
                        }
                      >
                        {t(lang, "openOfficialSite")} →
                      </button>
                    </div>
                  </section>
                )}

                <section className="gt-card" aria-label="Saved journeys">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <h2 style={{ margin: 0 }}>
                      {isBn
                        ? `সংরক্ষিত যাত্রাসমূহ (${state.profiles.length})`
                        : `Saved Trips (${state.profiles.length})`}
                    </h2>
                    <button
                      type="button"
                      className="gt-btn gt-btn-sm gt-btn-primary"
                      onClick={() => setTab("plan")}
                    >
                      + {isBn ? "নতুন যাত্রা" : "New Trip"}
                    </button>
                  </div>

                  {state.profiles.length === 0 ? (
                    <div className="gt-list-item">
                      <div>
                        <strong>
                          {isBn
                            ? "এখনো কোনো যাত্রা সেভ করা হয়নি"
                            : "No trips saved yet"}
                        </strong>
                        <div className="gt-muted">
                          {isBn
                            ? "শুরু করতে উপরের 'নতুন যাত্রা' বাটনে ক্লিক করুন এবং স্টেশন ও তারিখ নির্বাচন করুন।"
                            : "Click 'New Trip' above to pick your stations, calendar date, and preferred trains."}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="gt-btn gt-btn-primary"
                        onClick={() => setTab("plan")}
                      >
                        {isBn ? "প্রথম যাত্রা যোগ করুন" : "Create First Trip"}
                      </button>
                    </div>
                  ) : (
                    <ul className="gt-list">
                      {state.profiles.map((p) => {
                        const isSelected = activeProfile?.id === p.id;
                        return (
                          <li
                            key={p.id}
                            className={`gt-list-item${isSelected ? " is-active" : ""}`}
                          >
                            <div>
                              <strong>{p.label}</strong>
                              <div className="gt-muted">
                                {p.passengerCount}{" "}
                                {isBn ? "জন যাত্রী" : "passenger(s)"} ·{" "}
                                {p.direction === "outbound"
                                  ? isBn
                                    ? "যাওয়া (Outbound)"
                                    : "Outbound"
                                  : isBn
                                    ? "ফেরা (Return)"
                                    : "Return"}
                                {p.preferredTrainNumbers.length > 0
                                  ? ` · Trains: ${p.preferredTrainNumbers.join(", ")}`
                                  : ""}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                type="button"
                                className={`gt-btn gt-btn-sm${
                                  isSelected ? " gt-btn-primary" : ""
                                }`}
                                onClick={() => setSelectedProfileId(p.id)}
                              >
                                {isSelected
                                  ? isBn
                                    ? "নির্বাচিত"
                                    : "Selected"
                                  : isBn
                                    ? "সিলেক্ট"
                                    : "Select"}
                              </button>
                              <button
                                type="button"
                                className="gt-btn gt-btn-sm"
                                onClick={async () => {
                                  const next = await bridge.deleteProfile(p.id);
                                  setState(next);
                                  showToast(isBn ? "যাত্রা মুছে ফেলা হয়েছে।" : "Trip removed.");
                                }}
                              >
                                {isBn ? "মুছুন" : "Delete"}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </>
            )}

            {/* TAB 2: PLAN TRIP (WITH STATION PICKER, CALENDAR, TRAIN SEARCH) */}
            {tab === "plan" && (
              <section className="gt-card" aria-label="Plan New Trip">
                <h2>{isBn ? "নতুন যাত্রা পরিকল্পনা করুন" : "Plan a New Journey"}</h2>
                <p className="gt-muted" style={{ marginTop: 0, marginBottom: 16 }}>
                  {isBn
                    ? "নিচের তালিকা থেকে স্টেশন, ক্যালেন্ডার থেকে তারিখ এবং পছন্দের ট্রেন বেছে নিন — কিছুই ম্যানুয়ালি মুখস্থ লিখতে হবে না।"
                    : "Pick stations from the searchable list, tap a date on the calendar, and select your preferred trains."}
                </p>

                <form onSubmit={(e) => void handleCreateProfile(e)}>
                  {/* Route Row with Searchable Dropdowns + Swap */}
                  <div className="gt-route-row">
                    <div className="gt-field">
                      <label htmlFor="gt-from">
                        {isBn ? "যাত্রা শুরু (From)" : "From Station"}
                      </label>
                      <input
                        id="gt-from"
                        value={fromStation}
                        placeholder={isBn ? "স্টেশন খুঁজুন..." : "Search station..."}
                        onFocus={() => setShowFromList(true)}
                        onBlur={() => setTimeout(() => setShowFromList(false), 180)}
                        onChange={(e) => {
                          setFromStation(e.target.value);
                          setShowFromList(true);
                        }}
                        required
                      />
                      {showFromList && (
                        <div className="gt-dropdown" role="listbox">
                          {filteredFromStations.map((st) => (
                            <button
                              key={st.code}
                              type="button"
                              className="gt-dropdown-item"
                              onMouseDown={() => {
                                setFromStation(st.nameEn);
                                setShowFromList(false);
                              }}
                            >
                              <span>
                                <strong>{st.nameEn}</strong> · {st.nameBn}
                              </span>
                              <span className="gt-muted">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="gt-btn"
                      aria-label="Swap stations"
                      title="Swap From and To"
                      onClick={() => {
                        const tmp = fromStation;
                        setFromStation(toStation);
                        setToStation(tmp);
                      }}
                    >
                      ⇄
                    </button>

                    <div className="gt-field">
                      <label htmlFor="gt-to">
                        {isBn ? "গন্তব্য (To)" : "To Station"}
                      </label>
                      <input
                        id="gt-to"
                        value={toStation}
                        placeholder={isBn ? "স্টেশন খুঁজুন..." : "Search station..."}
                        onFocus={() => setShowToList(true)}
                        onBlur={() => setTimeout(() => setShowToList(false), 180)}
                        onChange={(e) => {
                          setToStation(e.target.value);
                          setShowToList(true);
                        }}
                        required
                      />
                      {showToList && (
                        <div className="gt-dropdown" role="listbox">
                          {filteredToStations.map((st) => (
                            <button
                              key={st.code}
                              type="button"
                              className="gt-dropdown-item"
                              onMouseDown={() => {
                                setToStation(st.nameEn);
                                setShowToList(false);
                              }}
                            >
                              <span>
                                <strong>{st.nameEn}</strong> · {st.nameBn}
                              </span>
                              <span className="gt-muted">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Route Chips */}
                  <div style={{ marginBottom: 18 }}>
                    <div className="gt-muted" style={{ marginBottom: 6 }}>
                      {isBn ? "জনপ্রিয় রুট (এক ট্যাপে সেট):" : "Quick popular routes:"}
                    </div>
                    <div className="gt-chip-row">
                      {[
                        ["Dhaka", "Mymensingh"],
                        ["Mymensingh", "Dhaka"],
                        ["Dhaka", "Dewanganj Bazar"],
                        ["Dhaka", "Chattogram"],
                        ["Dhaka", "Sylhet"],
                        ["Dhaka", "Rajshahi"],
                      ].map(([f, to]) => (
                        <button
                          key={`${f}-${to}`}
                          type="button"
                          className={`gt-chip${
                            fromStation === f && toStation === to ? " is-active" : ""
                          }`}
                          onClick={() => {
                            setFromStation(f!);
                            setToStation(to!);
                          }}
                        >
                          {f} → {to}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Visual Calendar Picker */}
                  <div className="gt-field" style={{ marginBottom: 18 }}>
                    <label>
                      {isBn
                        ? "যাত্রার তারিখ (ক্যালেন্ডার থেকে ক্লিক করুন)"
                        : "Date of Journey (Click a date on the calendar)"}
                    </label>
                    <CalendarPicker
                      value={journeyDate}
                      onChange={setJourneyDate}
                      language={lang}
                    />
                  </div>

                  {/* Searchable Train Picker (Static Reference) */}
                  <div className="gt-field" style={{ marginBottom: 18 }}>
                    <label htmlFor="gt-train-search">
                      {isBn
                        ? "পছন্দের ট্রেন খুঁজুন (ঐচ্ছিক · Static Reference)"
                        : "Preferred Trains (Optional · Static Reference)"}
                    </label>
                    <input
                      id="gt-train-search"
                      value={trainSearch}
                      placeholder={
                        isBn
                          ? "ট্রেনের নাম বা নম্বর লিখুন (যেমন: Tista, 707, Subarna)..."
                          : "Search train name, number, or route (e.g., Tista, 707, Subarna)..."
                      }
                      onChange={(e) => setTrainSearch(e.target.value)}
                    />
                    <div className="gt-dropdown" style={{ maxHeight: 190 }}>
                      {filteredTrains.length === 0 ? (
                        <div style={{ padding: 12 }} className="gt-muted">
                          {isBn
                            ? "তালিকায় মিল পাওয়া যায়নি। এটি শুধু জনপ্রিয় ইন্টারসিটি ট্রেনের স্ট্যাটিক তালিকা।"
                            : "No match in the static reference list."}
                        </div>
                      ) : (
                        filteredTrains.map((tr) => {
                          const picked = selectedTrains.includes(tr.trainNumber);
                          return (
                            <button
                              key={tr.trainNumber}
                              type="button"
                              className="gt-dropdown-item"
                              onClick={() => toggleTrainSelection(tr.trainNumber)}
                            >
                              <div>
                                <strong>
                                  {picked ? "✓ " : ""}
                                  {tr.nameEn} ({tr.trainNumber})
                                </strong>{" "}
                                <span className="gt-muted">· {tr.nameBn}</span>
                                <div className="gt-muted" style={{ fontSize: 12 }}>
                                  {tr.corridor} · Off day: {tr.offDay}
                                </div>
                              </div>
                              <StatusBadge
                                tone={picked ? "live" : "unavailable"}
                                label={picked ? (isBn ? "নির্বাচিত" : "Selected") : (isBn ? "যোগ করুন" : "Add")}
                              />
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Class, Passengers, Direction, Reminder Time */}
                  <div className="gt-grid">
                    <div className="gt-field">
                      <label htmlFor="gt-class">
                        {isBn ? "১ম পছন্দের ক্লাস (Class)" : "Priority #1 Travel Class"}
                      </label>
                      <select
                        id="gt-class"
                        value={primaryClass}
                        onChange={(e) => setPrimaryClass(e.target.value)}
                      >
                        {CLASS_OPTIONS.map((cls) => (
                          <option key={cls.code} value={cls.code}>
                            {isBn ? `${cls.labelBn} (${cls.code})` : `${cls.labelEn} (${cls.code})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="gt-field">
                      <label>{isBn ? "যাত্রী সংখ্যা (১–৩)" : "Passengers (1–3)"}</label>
                      <div className="gt-chip-row" style={{ marginTop: 0 }}>
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            type="button"
                            className={`gt-chip${passengerCount === num ? " is-active" : ""}`}
                            onClick={() => setPassengerCount(num)}
                          >
                            {num} {isBn ? "জন" : num === 1 ? "Ticket" : "Tickets"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="gt-field">
                      <label>{isBn ? "যাত্রার দিক" : "Journey Leg"}</label>
                      <div className="gt-chip-row" style={{ marginTop: 0 }}>
                        <button
                          type="button"
                          className={`gt-chip${direction === "outbound" ? " is-active" : ""}`}
                          onClick={() => setDirection("outbound")}
                        >
                          {isBn ? "যাওয়া (Outbound)" : "Outbound"}
                        </button>
                        <button
                          type="button"
                          className={`gt-chip${direction === "return" ? " is-active" : ""}`}
                          onClick={() => setDirection("return")}
                        >
                          {isBn ? "ফেরা (Return)" : "Return"}
                        </button>
                      </div>
                    </div>

                    <div className="gt-field">
                      <label htmlFor="gt-release">
                        {isBn ? "টিকিট রিলিজ রিমাইন্ডার সময়" : "Release Reminder Time"}
                      </label>
                      <input
                        id="gt-release"
                        type="time"
                        value={releaseTimeLocal}
                        onChange={(e) => setReleaseTimeLocal(e.target.value)}
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="gt-error" role="alert">
                      {formError}
                    </div>
                  )}

                  <div className="gt-btn-row">
                    <button type="submit" className="gt-btn gt-btn-primary">
                      ✓ {isBn ? "যাত্রা সেভ করুন" : "Save Trip Profile"}
                    </button>
                    <button
                      type="button"
                      className="gt-btn"
                      onClick={() => setTab("home")}
                    >
                      {isBn ? "বাতিল" : "Cancel"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* TAB 3: PREFERENCES */}
            {tab === "preferences" && (
              <section className="gt-card" aria-label="Preferences">
                <h2>{isBn ? "ক্লাস ও সিট পছন্দক্রম" : "Class & Seat Preferences"}</h2>
                {!activeProfile ? (
                  <p className="gt-muted">
                    {isBn
                      ? "প্রথমে 'নতুন যাত্রা' ট্যাব থেকে একটি যাত্রা তৈরি করুন।"
                      : "Create a trip in 'Plan Trip' first to customize preferences."}
                  </p>
                ) : (
                  <>
                    <p className="gt-muted">
                      {isBn ? "নির্বাচিত যাত্রা:" : "Active trip:"}{" "}
                      <strong>{activeProfile.label}</strong>
                    </p>
                    <h3>{isBn ? "ক্লাস অগ্রাধিকার তালিকা" : "Ranked Travel Classes"}</h3>
                    <ul className="gt-list">
                      {[...activeProfile.preferences.rankedClasses]
                        .sort((a, b) => a.rank - b.rank)
                        .map((cls, idx) => (
                          <li key={cls.classCode} className="gt-list-item">
                            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <input
                                type="checkbox"
                                checked={cls.enabled}
                                onChange={() => void handleToggleClassEnabled(cls.classCode)}
                              />
                              <span>
                                <strong>#{cls.rank}</strong> {cls.classCode}
                              </span>
                            </label>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                className="gt-btn gt-btn-sm"
                                onClick={() => void handleMoveClassRank(idx, -1)}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="gt-btn gt-btn-sm"
                                onClick={() => void handleMoveClassRank(idx, 1)}
                              >
                                ↓
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>

                    <h3 style={{ marginTop: 18 }}>
                      {isBn ? "সিটের দিক পছন্দ (যাওয়া / ফেরা)" : "Seat Direction (Outbound / Return)"}
                    </h3>
                    <StatusBadge tone="stale" label={t(lang, "seatDirectionUnverified")} />
                    <div className="gt-grid" style={{ marginTop: 12 }}>
                      <div className="gt-field">
                        <label htmlFor="gt-out-seat">
                          {isBn ? "যাওয়ার সিট পছন্দ" : "Outbound Seat Preference"}
                        </label>
                        <select
                          id="gt-out-seat"
                          value={activeProfile.preferences.outboundSeat.preference}
                          onChange={(e) =>
                            void handleSeatPrefChange(
                              "outbound",
                              e.target.value as SeatDirectionPreference,
                            )
                          }
                        >
                          <option value="forward_first">
                            {isBn ? "সামনের দিকে মুখ করা সিট অগ্রাধিকার" : "Prefer forward-facing"}
                          </option>
                          <option value="neutral_then_backward">
                            {isBn ? "নিউট্রাল / বিকল্প হিসেবে পেছনের দিক" : "Neutral / backward fallback"}
                          </option>
                          <option value="any_direction">
                            {isBn ? "যেকোনো সিট গ্রহণযোগ্য" : "Accept any seat"}
                          </option>
                        </select>
                      </div>
                      <div className="gt-field">
                        <label htmlFor="gt-ret-seat">
                          {isBn ? "ফেরার সিট পছন্দ" : "Return Seat Preference"}
                        </label>
                        <select
                          id="gt-ret-seat"
                          value={activeProfile.preferences.returnSeat.preference}
                          onChange={(e) =>
                            void handleSeatPrefChange(
                              "return",
                              e.target.value as SeatDirectionPreference,
                            )
                          }
                        >
                          <option value="forward_first">
                            {isBn ? "সামনের দিকে মুখ করা সিট অগ্রাধিকার" : "Prefer forward-facing"}
                          </option>
                          <option value="neutral_then_backward">
                            {isBn ? "নিউট্রাল / বিকল্প হিসেবে পেছনের দিক" : "Neutral / backward fallback"}
                          </option>
                          <option value="any_direction">
                            {isBn ? "যেকোনো সিট গ্রহণযোগ্য" : "Accept any seat"}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="gt-list-item" style={{ marginTop: 14 }}>
                      <div>
                        <strong>
                          {isBn
                            ? "ঐচ্ছিক SEAT-001 নিয়ম (১–৩০ / ৩১+)"
                            : "Optional SEAT-001 Heuristic (1–30 / 31+)"}
                        </strong>
                        <div className="gt-muted">{t(lang, "tentativeOwnerPreference")}</div>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={activeProfile.preferences.tentativeSeatRule.enabled}
                          onChange={(e) =>
                            void handleToggleTentativeSeatRule(e.target.checked)
                          }
                        />
                        {isBn ? "চালু করুন" : "Enable"}
                      </label>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* TAB 4: REMINDERS & DATA SOURCES */}
            {tab === "status" && (
              <>
                <section className="gt-card" aria-label="Release Reminder">
                  <h2>{isBn ? "টিকিট রিলিজ রিমাইন্ডার" : "Ticket Release Reminder"}</h2>
                  {releasePlan && activeProfile ? (
                    <>
                      <div className="gt-kv">
                        <span>{isBn ? "নির্বাচিত যাত্রা" : "Active Trip"}</span>
                        <strong>{activeProfile.label}</strong>
                      </div>
                      <div className="gt-kv">
                        <span>{isBn ? "অগ্রিম টিকিট খোলার তারিখ (১০ দিন আগে)" : "Advance Release Date (10d)"}</span>
                        <strong>{releasePlan.releaseDate}</strong>
                      </div>
                      <div className="gt-kv">
                        <span>{isBn ? "রিমাইন্ডার সময়" : "Configured Reminder Time"}</span>
                        <strong>{activeProfile.releaseReminder.releaseTimeLocal}</strong>
                      </div>
                      <p className="gt-muted" style={{ marginTop: 10 }}>
                        {bridge.capabilities.lifecycleNote}
                      </p>
                      <div className="gt-btn-row">
                        <button
                          type="button"
                          className="gt-btn gt-btn-primary"
                          onClick={() => void handleScheduleReminder()}
                        >
                          {isBn ? "ব্রাউজার রিমাইন্ডার সেট করুন" : "Schedule Browser Reminder"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="gt-muted">
                      {isBn
                        ? "রিমাইন্ডার দেখতে আগে একটি যাত্রা সেভ করুন।"
                        : "Save a trip first to calculate your advance release reminder."}
                    </p>
                  )}
                </section>

                <section className="gt-card" aria-label="Live Data & Official Sources">
                  <h2>{isBn ? "অফিসিয়াল তথ্য উৎস ও লাইভ স্ট্যাটাস" : "Official Data Sources & Live Status"}</h2>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    <StatusBadge tone="unavailable" label={t(lang, "liveAvailabilityUnavailable")} />
                    <StatusBadge tone="unavailable" label={t(lang, "liveServiceStatusUnavailable")} />
                  </div>
                  <p className="gt-muted">
                    {isBn
                      ? "Bangladesh Railway-এর কোনো অনুমোদিত পাবলিক লাইভ API না থাকায় এই এক্সটেনশন কখনো ভুয়া সিট সংখ্যা বা অটো-পোলিং দেখায় না। নিচের অফিসিয়াল লিংকগুলো সরাসরি ব্যবহার করুন:"
                      : "Because Bangladesh Railway has no public authorized extension API, Get Ticket never invents seat counts or runs unauthorized polling. Open official links directly below:"}
                  </p>
                  <ul className="gt-list">
                    {OFFICIAL_STATIC_REFERENCES.map((ref) => (
                      <li key={ref.sourceId} className="gt-list-item">
                        <div>
                          <strong>{ref.title}</strong>
                          <div className="gt-muted">
                            {ref.sourceId} · Verified {ref.lastVerified}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="gt-btn gt-btn-sm"
                          onClick={() => void bridge.openOfficialUrl(ref.url)}
                        >
                          {isBn ? "খুলুন →" : "Open →"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {/* TAB 5: SETTINGS & HELP */}
            {tab === "settings" && (
              <>
                <section className="gt-card" aria-label="Settings">
                  <h2>{isBn ? "ভাষা ও থিম সেটিংস" : "Language & Theme Settings"}</h2>
                  <div className="gt-grid">
                    <div className="gt-field">
                      <label htmlFor="gt-lang">Language / ভাষা</label>
                      <select
                        id="gt-lang"
                        value={state.settings.language}
                        onChange={(e) =>
                          void handleSettingsPatch({
                            language: e.target.value === "en" ? "en" : "bn",
                          })
                        }
                      >
                        <option value="bn">বাংলা (Bangla)</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="gt-field">
                      <label htmlFor="gt-theme">{isBn ? "থিম (Theme)" : "Theme"}</label>
                      <select
                        id="gt-theme"
                        value={state.settings.theme}
                        onChange={(e) =>
                          void handleSettingsPatch({
                            theme: e.target.value as AppSettings["theme"],
                          })
                        }
                      >
                        <option value="system">{isBn ? "সিস্টেম (System)" : "System"}</option>
                        <option value="light">{isBn ? "হালকা (Light)" : "Light"}</option>
                        <option value="dark">{isBn ? "ডার্ক (Dark)" : "Dark"}</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="gt-card" aria-label="Privacy and Help">
                  <h2>{isBn ? "নিরাপত্তা, গোপনীয়তা ও সাহায্য" : "Security, Privacy & Quick FAQ"}</h2>
                  <p>{t(lang, "noCredentialsNotice")}</p>
                  <p className="gt-muted">
                    {isBn
                      ? `অনুমোদিত অফিসিয়াল ডোমেইন: ${OFFICIAL_RAILWAY_HOSTS.join(", ")}। লগইন, CAPTCHA, OTP এবং পেমেন্ট সবসময় অফিসিয়াল সাইটে আপনি নিজে করবেন।`
                      : `Allowlisted official hosts: ${OFFICIAL_RAILWAY_HOSTS.join(", ")}. Login, CAPTCHA, OTP, and payment are always completed manually by you on the official site.`}
                  </p>
                  <div className="gt-btn-row">
                    <button
                      type="button"
                      className="gt-btn"
                      onClick={() => setShowGuide(true)}
                    >
                      {isBn ? "হোম পেজে গাইড আবার দেখান" : "Show 3-Step Guide Again"}
                    </button>
                    <button
                      type="button"
                      className="gt-btn"
                      onClick={async () => {
                        const cleared = await bridge.clearAllData();
                        setState(cleared);
                        setSelectedProfileId(null);
                        showToast(
                          isBn ? "সব লোকাল ডাটা মুছে ফেলা হয়েছে।" : "All local data cleared.",
                        );
                      }}
                    >
                      {isBn ? "সব লোকাল ডাটা মুছুন" : "Clear All Local Data"}
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* PERSISTENT RIGHT SUMMARY SIDEBAR */}
          <aside className="gt-card gt-sidebar-card" aria-label="Active Trip Summary">
            <h3 style={{ marginBottom: 8 }}>
              {isBn ? "সক্রিয় যাত্রার সারসংক্ষেপ" : "Active Trip Summary"}
            </h3>
            {activeProfile && handoff && handoff.kind === "ready_for_official_booking" ? (
              <>
                <StatusBadge tone="ready" label={t(lang, "readyForOfficialBooking")} />
                <div style={{ marginTop: 12 }}>
                  <div className="gt-kv">
                    <span className="gt-muted">{isBn ? "রুট" : "Route"}</span>
                    <strong>
                      {activeProfile.fromStation} → {activeProfile.toStation}
                    </strong>
                  </div>
                  <div className="gt-kv">
                    <span className="gt-muted">{isBn ? "তারিখ" : "Date"}</span>
                    <strong>{activeProfile.journeyDate}</strong>
                  </div>
                  <div className="gt-kv">
                    <span className="gt-muted">{isBn ? "যাত্রী" : "Tickets"}</span>
                    <strong>{activeProfile.passengerCount}</strong>
                  </div>
                  <div className="gt-kv">
                    <span className="gt-muted">{isBn ? "১ম ক্লাস" : "Top Class"}</span>
                    <strong>
                      {activeProfile.preferences.rankedClasses
                        .filter((c) => c.enabled)
                        .sort((a, b) => a.rank - b.rank)[0]?.classCode ?? "—"}
                    </strong>
                  </div>
                  {releasePlan && (
                    <div className="gt-kv">
                      <span className="gt-muted">{isBn ? "রিলিজ তারিখ" : "Release Date"}</span>
                      <strong>{releasePlan.releaseDate}</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                  <button
                    type="button"
                    className="gt-btn gt-btn-primary"
                    onClick={() =>
                      void bridge.openOfficialUrl(handoff.officialUrl, activeProfile.id)
                    }
                  >
                    {t(lang, "openOfficialSite")} →
                  </button>
                  <button
                    type="button"
                    className="gt-btn"
                    onClick={() => void handleCopySummary()}
                  >
                    {isBn ? "যাত্রার চেকলিস্ট কপি করুন" : "Copy Trip Checklist"}
                  </button>
                </div>
                <p className="gt-muted" style={{ marginTop: 10, marginBottom: 0 }}>
                  {t(lang, "officialFlowSteps")}
                </p>
              </>
            ) : (
              <>
                <p className="gt-muted" style={{ marginTop: 0 }}>
                  {isBn
                    ? "এখনো কোনো যাত্রা সিলেক্ট করা নেই। 'নতুন যাত্রা' ট্যাব থেকে আপনার প্রথম ট্রিপ সেভ করুন।"
                    : "No trip selected yet. Use 'Plan Trip' to pick stations, date, and trains."}
                </p>
                <button
                  type="button"
                  className="gt-btn gt-btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => setTab("plan")}
                >
                  + {isBn ? "নতুন যাত্রা তৈরি করুন" : "Plan a New Trip"}
                </button>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
