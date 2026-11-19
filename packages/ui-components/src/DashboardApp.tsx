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
  BellIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CompassIcon,
  CopyIcon,
  ExternalLinkIcon,
  HomeIcon,
  PlusIcon,
  SettingsIcon,
  ShieldIcon,
  SlidersIcon,
  SwapIcon,
  TrainTicketLogo,
  TrashIcon,
} from "./Icons.js";
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
      releasePlan
        ? `Release Reminder: ${releasePlan.releaseDate} (${activeProfile.releaseReminder.releaseTimeLocal})`
        : "",
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

  const tabs: Array<{ id: TabId; label: string; shortLabel: string; icon: React.ReactNode }> = [
    { id: "home", label: isBn ? "শুরু করুন" : "Home", shortLabel: isBn ? "হোম" : "Home", icon: <HomeIcon /> },
    { id: "plan", label: isBn ? "নতুন যাত্রা" : "Plan Trip", shortLabel: isBn ? "যাত্রা" : "Plan", icon: <CompassIcon /> },
    { id: "preferences", label: isBn ? "পছন্দ ও সিট" : "Preferences", shortLabel: isBn ? "পছন্দ" : "Prefs", icon: <SlidersIcon /> },
    { id: "status", label: isBn ? "রিমাইন্ডার ও উৎস" : "Reminders", shortLabel: isBn ? "রিমাইন্ডার" : "Alerts", icon: <BellIcon /> },
    { id: "settings", label: isBn ? "সেটিংস ও সাহায্য" : "Settings", shortLabel: isBn ? "সেটিংস" : "More", icon: <SettingsIcon /> },
  ];

  const topClassCode =
    activeProfile?.preferences.rankedClasses
      .filter((c) => c.enabled)
      .sort((a, b) => a.rank - b.rank)[0]?.classCode ?? "—";

  return (
    <div className="gt-app" data-theme={state.settings.theme}>
      <header className="gt-topbar">
        <div className="gt-topbar-inner">
          <div className="gt-brand">
            <span className="gt-logo-mark">
              <TrainTicketLogo size={22} />
            </span>
            <div>
              <h1>{t(lang, "appName")}</h1>
              <div className="gt-muted">
                {isBn
                  ? "Bangladesh Railway ব্যক্তিগত ট্রিপ প্ল্যানার"
                  : "Bangladesh Railway Personal Trip Planner"}
              </div>
            </div>
          </div>
          <div className="gt-topbar-actions">
            <StatusBadge
              tone="live"
              label={isBn ? "লোকাল মোড সক্রিয়" : "Local Mode Active"}
            />
            <button
              type="button"
              className="gt-btn gt-btn-sm"
              onClick={() =>
                void handleSettingsPatch({ language: isBn ? "en" : "bn" })
              }
            >
              {isBn ? "EN" : "বাংলা"}
            </button>
          </div>
        </div>
      </header>

      <main className="gt-shell">
        {/* Desktop Navigation */}
        <nav className="gt-nav" aria-label="Primary navigation">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className="gt-nav-btn"
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
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
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div className="gt-eyebrow">
                          {isBn ? "দ্রুত শুরু" : "Quick Start"}
                        </div>
                        <h2>
                          {isBn
                            ? "৩ ধাপে আপনার রেলযাত্রা গুছিয়ে নিন"
                            : "Organize Your Rail Trip in 3 Steps"}
                        </h2>
                      </div>
                      <button
                        type="button"
                        className="gt-btn gt-btn-sm"
                        onClick={() => setShowGuide(false)}
                      >
                        {isBn ? "লুকান" : "Dismiss"}
                      </button>
                    </div>
                    <p className="gt-muted" style={{ margin: "4px 0 0 0" }}>
                      {isBn
                        ? "Get Ticket আপনার ব্রাউজারের ব্যক্তিগত Bangladesh Railway প্ল্যানার। এটি আপনার যাত্রা, পছন্দের ক্লাস ও টিকিট রিলিজ রিমাইন্ডার সেভ রাখে এবং এক ক্লিকে অফিসিয়াল ই-টিকিট পোর্টালে নিয়ে যায়।"
                        : "Get Ticket is your local browser planner for Bangladesh Railway. Save routes, class priorities, and release reminders, then jump straight to the official e-ticket portal."}
                    </p>
                    <div className="gt-steps">
                      <div className="gt-step-box">
                        <span className="gt-step-num">01</span>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {isBn ? "যাত্রা ও ট্রেন বাছাই" : "Plan Your Trip"}
                        </div>
                        <div className="gt-muted">
                          {isBn
                            ? "স্টেশন, ক্যালেন্ডার থেকে তারিখ এবং পছন্দের ট্রেন সেভ করুন।"
                            : "Pick stations, tap a date on the calendar, and select trains."}
                        </div>
                      </div>
                      <div className="gt-step-box">
                        <span className="gt-step-num">02</span>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {isBn ? "পছন্দ ও রিমাইন্ডার" : "Rank & Remind"}
                        </div>
                        <div className="gt-muted">
                          {isBn
                            ? "ক্লাস অগ্রাধিকার (#১, #২) ও ১০ দিন আগের রিমাইন্ডার সেট করুন।"
                            : "Order travel classes (#1, #2) and set advance release alerts."}
                        </div>
                      </div>
                      <div className="gt-step-box">
                        <span className="gt-step-num">03</span>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {isBn ? "অফিসিয়াল সাইটে বুক" : "Official Handoff"}
                        </div>
                        <div className="gt-muted">
                          {isBn
                            ? "এক ক্লিকে eticket.railway.gov.bd খুলে লগইন ও পেমেন্ট করুন।"
                            : "Launch eticket.railway.gov.bd for Search → Select → Pay."}
                        </div>
                      </div>
                    </div>
                    <div className="gt-btn-row">
                      <button
                        type="button"
                        className="gt-btn gt-btn-primary"
                        onClick={() => setTab("plan")}
                      >
                        <PlusIcon />
                        <span>{isBn ? "নতুন যাত্রা তৈরি করুন" : "Plan New Trip"}</span>
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
                        <span>{t(lang, "openOfficialSite")}</span>
                        <ExternalLinkIcon />
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
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div className="gt-eyebrow">{isBn ? "আপনার তালিকা" : "Your Trips"}</div>
                      <h2 style={{ margin: 0 }}>
                        {isBn
                          ? `সংরক্ষিত যাত্রাসমূহ (${state.profiles.length})`
                          : `Saved Journey Profiles (${state.profiles.length})`}
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="gt-btn gt-btn-sm gt-btn-primary"
                      onClick={() => setTab("plan")}
                    >
                      <PlusIcon />
                      <span>{isBn ? "নতুন" : "New"}</span>
                    </button>
                  </div>

                  {state.profiles.length === 0 ? (
                    <div className="gt-list-item">
                      <div>
                        <strong>
                          {isBn ? "এখনো কোনো যাত্রা সেভ করা হয়নি" : "No journeys saved yet"}
                        </strong>
                        <div className="gt-muted">
                          {isBn
                            ? "আপনার প্রথম যাত্রা তৈরি করতে 'নতুন' বাটনে ট্যাপ করুন।"
                            : "Tap 'New' to pick stations, a calendar date, and preferred trains."}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="gt-btn gt-btn-primary gt-btn-sm"
                        onClick={() => setTab("plan")}
                      >
                        {isBn ? "যাত্রা যোগ করুন" : "Create Trip"}
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
                                {p.passengerCount} {isBn ? "টি টিকিট" : "ticket(s)"} ·{" "}
                                {p.direction === "outbound"
                                  ? isBn
                                    ? "যাওয়া"
                                    : "Outbound"
                                  : isBn
                                    ? "ফেরা"
                                    : "Return"}
                                {p.preferredTrainNumbers.length > 0
                                  ? ` · Trains: ${p.preferredTrainNumbers.join(", ")}`
                                  : ""}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
                                    : "Active"
                                  : isBn
                                    ? "সিলেক্ট"
                                    : "Select"}
                              </button>
                              <button
                                type="button"
                                className="gt-btn gt-btn-sm"
                                aria-label="Delete trip"
                                onClick={async () => {
                                  const next = await bridge.deleteProfile(p.id);
                                  setState(next);
                                  showToast(isBn ? "যাত্রা মুছে ফেলা হয়েছে।" : "Trip removed.");
                                }}
                              >
                                <TrashIcon />
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

            {/* TAB 2: PLAN TRIP */}
            {tab === "plan" && (
              <section className="gt-card" aria-label="Plan New Trip">
                <div className="gt-eyebrow">{isBn ? "যাত্রা নির্মাতা" : "Journey Builder"}</div>
                <h2>{isBn ? "নতুন যাত্রা পরিকল্পনা করুন" : "Plan a New Journey"}</h2>
                <p className="gt-muted" style={{ marginTop: 0, marginBottom: 18 }}>
                  {isBn
                    ? "স্টেশন সার্চ করুন, ক্যালেন্ডার থেকে তারিখ ট্যাপ করুন এবং পছন্দের ট্রেন বেছে নিন।"
                    : "Search stations, tap a date on the calendar, and select your preferred trains."}
                </p>

                <form onSubmit={(e) => void handleCreateProfile(e)}>
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
                      <SwapIcon />
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

                  <div style={{ marginBottom: 18 }}>
                    <div className="gt-muted" style={{ marginBottom: 6 }}>
                      {isBn ? "জনপ্রিয় রুট (এক ট্যাপে সেট):" : "Popular corridors:"}
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

                  <div className="gt-field" style={{ marginBottom: 18 }}>
                    <label>
                      {isBn
                        ? "যাত্রার তারিখ (ক্যালেন্ডার থেকে ট্যাপ করুন)"
                        : "Date of Journey (Select on Calendar)"}
                    </label>
                    <CalendarPicker
                      value={journeyDate}
                      onChange={setJourneyDate}
                      language={lang}
                    />
                  </div>

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
                          ? "ট্রেনের নাম বা নম্বর লিখুন (Tista, 707, Subarna)..."
                          : "Filter by name, number, or corridor (Tista, 707, Subarna)..."
                      }
                      onChange={(e) => setTrainSearch(e.target.value)}
                    />
                    <div className="gt-dropdown" style={{ maxHeight: 195 }}>
                      {filteredTrains.length === 0 ? (
                        <div style={{ padding: 14 }} className="gt-muted">
                          {isBn
                            ? "তালিকায় মিল পাওয়া যায়নি।"
                            : "No matching train in static reference list."}
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
                                label={
                                  picked
                                    ? isBn
                                      ? "নির্বাচিত"
                                      : "Selected"
                                    : isBn
                                      ? "যোগ করুন"
                                      : "Add"
                                }
                              />
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="gt-grid">
                    <div className="gt-field">
                      <label htmlFor="gt-class">
                        {isBn ? "১ম পছন্দের ক্লাস" : "Priority #1 Travel Class"}
                      </label>
                      <select
                        id="gt-class"
                        value={primaryClass}
                        onChange={(e) => setPrimaryClass(e.target.value)}
                      >
                        {CLASS_OPTIONS.map((cls) => (
                          <option key={cls.code} value={cls.code}>
                            {isBn
                              ? `${cls.labelBn} (${cls.code})`
                              : `${cls.labelEn} (${cls.code})`}
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
                          {isBn ? "যাওয়া" : "Outbound"}
                        </button>
                        <button
                          type="button"
                          className={`gt-chip${direction === "return" ? " is-active" : ""}`}
                          onClick={() => setDirection("return")}
                        >
                          {isBn ? "ফেরা" : "Return"}
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
                <div className="gt-eyebrow">{isBn ? "পছন্দক্রম ইঞ্জিন" : "Preference Engine"}</div>
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
                      {isBn ? "সক্রিয় যাত্রা:" : "Active trip:"}{" "}
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
                                aria-label="Move up"
                                onClick={() => void handleMoveClassRank(idx, -1)}
                              >
                                <ChevronUpIcon />
                              </button>
                              <button
                                type="button"
                                className="gt-btn gt-btn-sm"
                                aria-label="Move down"
                                onClick={() => void handleMoveClassRank(idx, 1)}
                              >
                                <ChevronDownIcon />
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>

                    <h3 style={{ marginTop: 20 }}>
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

            {/* TAB 4: REMINDERS & SOURCES */}
            {tab === "status" && (
              <>
                <section className="gt-card" aria-label="Release Reminder">
                  <div className="gt-eyebrow">{isBn ? "রিলিজ অ্যালার্ট" : "Release Planner"}</div>
                  <h2>{isBn ? "টিকিট রিলিজ রিমাইন্ডার" : "Ticket Release Reminder"}</h2>
                  {releasePlan && activeProfile ? (
                    <>
                      <div className="gt-kv">
                        <span className="gt-muted">{isBn ? "সক্রিয় যাত্রা" : "Active Trip"}</span>
                        <strong>{activeProfile.label}</strong>
                      </div>
                      <div className="gt-kv">
                        <span className="gt-muted">
                          {isBn ? "অগ্রিম টিকিট খোলার তারিখ (১০ দিন আগে)" : "Advance Release Date (10d)"}
                        </span>
                        <strong>{releasePlan.releaseDate}</strong>
                      </div>
                      <div className="gt-kv">
                        <span className="gt-muted">{isBn ? "রিমাইন্ডার সময়" : "Reminder Time"}</span>
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
                          <BellIcon />
                          <span>
                            {isBn ? "ব্রাউজার রিমাইন্ডার সেট করুন" : "Schedule Browser Reminder"}
                          </span>
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

                <section className="gt-card" aria-label="Official Data Sources">
                  <div className="gt-eyebrow">{isBn ? "তথ্য স্বচ্ছতা" : "Data Provenance"}</div>
                  <h2>{isBn ? "অফিসিয়াল তথ্য উৎস ও লাইভ স্ট্যাটাস" : "Official Sources & Live Status"}</h2>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    <StatusBadge tone="unavailable" label={t(lang, "liveAvailabilityUnavailable")} />
                    <StatusBadge tone="unavailable" label={t(lang, "liveServiceStatusUnavailable")} />
                  </div>
                  <p className="gt-muted">
                    {isBn
                      ? "Bangladesh Railway-এর অনুমোদিত লাইভ API না থাকায় এই এক্সটেনশন কখনো ভুয়া সিট দেখায় না। নিচের অফিসিয়াল লিংকগুলো সরাসরি ব্যবহার করুন:"
                      : "Because Bangladesh Railway has no public authorized extension API, Get Ticket never invents seat counts. Open official pages directly below:"}
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
                          <span>{isBn ? "খুলুন" : "Open"}</span>
                          <ExternalLinkIcon />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {/* TAB 5: SETTINGS & PRIVACY */}
            {tab === "settings" && (
              <>
                <section className="gt-card" aria-label="Settings">
                  <div className="gt-eyebrow">{isBn ? "ব্যক্তিগতকরণ" : "Personalization"}</div>
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
                  <div className="gt-eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldIcon size={14} />
                    <span>{isBn ? "নিরাপত্তা ও গোপনীয়তা" : "Security & Privacy"}</span>
                  </div>
                  <h2>{isBn ? "আপনার ডাটা সম্পূর্ণ আপনার ডিভাইসে" : "Local-First Privacy Guarantee"}</h2>
                  <p>{t(lang, "noCredentialsNotice")}</p>
                  <p className="gt-muted">
                    {isBn
                      ? `অনুমোদিত অফিসিয়াল ডোমেইন: ${OFFICIAL_RAILWAY_HOSTS.join(", ")}। লগইন, CAPTCHA, OTP এবং পেমেন্ট সবসময় অফিসিয়াল সাইটে আপনি নিজে করবেন।`
                      : `Allowlisted official hosts: ${OFFICIAL_RAILWAY_HOSTS.join(", ")}. Login, CAPTCHA, OTP, and payment remain 100% manual on the official site.`}
                  </p>
                  <div className="gt-btn-row">
                    <button
                      type="button"
                      className="gt-btn"
                      onClick={() => {
                        setShowGuide(true);
                        setTab("home");
                      }}
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
                      <TrashIcon />
                      <span>{isBn ? "সব লোকাল ডাটা মুছুন" : "Clear All Local Data"}</span>
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* PERSISTENT BOARDING-PASS SUMMARY CARD */}
          <aside className="gt-sidebar-sticky" aria-label="Active Trip Boarding Pass">
            <div className="gt-ticket-card">
              <div className="gt-ticket-top">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    opacity: 0.9,
                  }}
                >
                  <span>{isBn ? "সক্রিয় ট্রিপ পাস" : "ACTIVE TRIP PASS"}</span>
                  <span>{activeProfile ? activeProfile.direction.toUpperCase() : "READY"}</span>
                </div>

                {activeProfile ? (
                  <div className="gt-ticket-route">
                    <div className="gt-ticket-station">{activeProfile.fromStation}</div>
                    <div className="gt-ticket-track" aria-hidden="true">
                      <span className="gt-ticket-track-line" />
                      <TrainTicketLogo size={18} />
                      <span className="gt-ticket-track-line" />
                    </div>
                    <div className="gt-ticket-station" style={{ textAlign: "right" }}>
                      {activeProfile.toStation}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700 }}>
                    {isBn ? "আপনার পরবর্তী রেলযাত্রা" : "Your Next Rail Journey"}
                  </div>
                )}
              </div>

              <div className="gt-ticket-divider" aria-hidden="true">
                <div className="gt-ticket-perf" />
              </div>

              <div className="gt-ticket-body">
                {activeProfile && handoff && handoff.kind === "ready_for_official_booking" ? (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <StatusBadge tone="ready" label={t(lang, "readyForOfficialBooking")} />
                    </div>

                    <div className="gt-ticket-meta-grid">
                      <div className="gt-ticket-meta-item">
                        <div className="gt-ticket-meta-label">{isBn ? "তারিখ" : "Date"}</div>
                        <div className="gt-ticket-meta-value">{activeProfile.journeyDate}</div>
                      </div>
                      <div className="gt-ticket-meta-item">
                        <div className="gt-ticket-meta-label">{isBn ? "যাত্রী" : "Tickets"}</div>
                        <div className="gt-ticket-meta-value">
                          {activeProfile.passengerCount} {isBn ? "জন" : "Pax"}
                        </div>
                      </div>
                      <div className="gt-ticket-meta-item">
                        <div className="gt-ticket-meta-label">{isBn ? "১ম ক্লাস" : "Top Class"}</div>
                        <div className="gt-ticket-meta-value">{topClassCode}</div>
                      </div>
                      <div className="gt-ticket-meta-item">
                        <div className="gt-ticket-meta-label">{isBn ? "রিলিজ" : "Release"}</div>
                        <div className="gt-ticket-meta-value">
                          {releasePlan ? releasePlan.releaseDate : "—"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button
                        type="button"
                        className="gt-btn gt-btn-primary"
                        onClick={() =>
                          void bridge.openOfficialUrl(handoff.officialUrl, activeProfile.id)
                        }
                      >
                        <span>{t(lang, "openOfficialSite")}</span>
                        <ExternalLinkIcon />
                      </button>
                      <button
                        type="button"
                        className="gt-btn"
                        onClick={() => void handleCopySummary()}
                      >
                        <CopyIcon />
                        <span>
                          {isBn ? "যাত্রার চেকলিস্ট কপি করুন" : "Copy Trip Checklist"}
                        </span>
                      </button>
                    </div>
                    <p className="gt-muted" style={{ marginTop: 12, marginBottom: 0 }}>
                      {t(lang, "officialFlowSteps")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="gt-muted" style={{ marginTop: 0 }}>
                      {isBn
                        ? "এখনো কোনো যাত্রা সিলেক্ট করা নেই। 'নতুন যাত্রা' ট্যাব থেকে আপনার প্রথম ট্রিপ সেভ করুন।"
                        : "No active trip selected yet. Plan your first journey to generate your trip pass."}
                    </p>
                    <button
                      type="button"
                      className="gt-btn gt-btn-primary"
                      style={{ width: "100%" }}
                      onClick={() => setTab("plan")}
                    >
                      <PlusIcon />
                      <span>{isBn ? "নতুন যাত্রা তৈরি করুন" : "Plan New Trip"}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <nav className="gt-mobile-nav" aria-label="Mobile navigation">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className="gt-mobile-nav-btn"
            aria-current={tab === item.id ? "page" : undefined}
            onClick={() => setTab(item.id)}
          >
            {item.icon}
            <span>{item.shortLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
