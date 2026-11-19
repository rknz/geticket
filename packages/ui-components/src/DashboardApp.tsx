import React, { useEffect, useState } from "react";
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
}

type ViewId =
  | "overview"
  | "new-journey"
  | "results"
  | "service-status"
  | "preferences"
  | "alt-routes"
  | "monitoring"
  | "data-sources"
  | "security"
  | "settings";

const provider = new ManualReferenceOnlyProvider();

export function DashboardApp({ bridge }: { bridge: PlatformBridge }) {
  const [state, setState] = useState<GetTicketStoreState | null>(null);
  const [view, setView] = useState<ViewId>("overview");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // New Journey form state (aligned with official From / To / Date of Journey / Class)
  const [fromStation, setFromStation] = useState("Dhaka");
  const [toStation, setToStation] = useState("Mymensingh");
  const [journeyDate, setJourneyDate] = useState(() => {
    const d = new Date(Date.now() + 7 * 86400_000);
    return d.toISOString().slice(0, 10);
  });
  const [primaryClass, setPrimaryClass] = useState("S_CHAIR");
  const [passengerCount, setPassengerCount] = useState(1);
  const [direction, setDirection] = useState<"outbound" | "return">("outbound");
  const [releaseTimeLocal, setReleaseTimeLocal] = useState("08:00");

  useEffect(() => {
    void bridge.loadState().then((loaded) => {
      setState(loaded);
      if (loaded.profiles[0]) {
        setSelectedProfileId(loaded.profiles[0].id);
      }
    });
  }, [bridge]);

  if (!state) {
    return (
      <main className="gt-shell" aria-busy="true">
        <div className="gt-card">Loading Get Ticket…</div>
      </main>
    );
  }

  const lang = state.settings.language;
  const activeProfile =
    state.profiles.find((p) => p.id === selectedProfileId) ?? state.profiles[0] ?? null;

  const navItems: Array<{ id: ViewId; label: string }> = [
    { id: "overview", label: t(lang, "navOverview") },
    { id: "new-journey", label: t(lang, "navNewJourney") },
    { id: "results", label: t(lang, "navResults") },
    { id: "service-status", label: t(lang, "navServiceStatus") },
    { id: "preferences", label: t(lang, "navPreferences") },
    { id: "alt-routes", label: t(lang, "navAltRoutes") },
    { id: "monitoring", label: t(lang, "navMonitoring") },
    { id: "data-sources", label: t(lang, "navDataSources") },
    { id: "security", label: t(lang, "navSecurity") },
    { id: "settings", label: t(lang, "navSettings") },
  ];

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setNotice(null);

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
      preferredTrainNumbers: [],
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
    setNotice(`Saved journey profile: ${parsed.data.label}`);
    setView("overview");
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

  const handoff = activeProfile ? provider.prepareOfficialHandoff(activeProfile) : null;
  const releasePlan = activeProfile
    ? computeReleaseReminder(activeProfile.journeyDate, activeProfile.releaseReminder)
    : null;

  return (
    <div data-theme={state.settings.theme} style={{ minHeight: "100vh", background: "var(--gt-bg)" }}>
      <main className="gt-shell">
        <header className="gt-header">
          <div className="gt-brand">
            <div>
              <h1>{t(lang, "appName")}</h1>
              <div className="gt-muted">{t(lang, "tagline")}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <StatusBadge tone="unavailable" label={t(lang, "liveAvailabilityUnavailable")} />
            <StatusBadge tone="ready" label={bridge.capabilities.platformName} />
          </div>
        </header>

        <nav className="gt-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="gt-nav-btn"
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {notice && (
          <div className="gt-card" role="status">
            <strong>{notice}</strong>
          </div>
        )}

        {view === "overview" && (
          <section aria-label="Overview">
            <div className="gt-card">
              <h2>{t(lang, "navOverview")}</h2>
              <p className="gt-muted">{t(lang, "officialFlowSteps")}</p>
              <div className="gt-btn-row">
                <StatusBadge tone="unavailable" label={t(lang, "liveAvailabilityUnavailable")} />
                <StatusBadge tone="unavailable" label={t(lang, "liveServiceStatusUnavailable")} />
              </div>
              <div className="gt-btn-row">
                <button
                  type="button"
                  className="gt-btn gt-btn-primary"
                  onClick={() => void bridge.openOfficialUrl(OFFICIAL_ETICKET_URL, activeProfile?.id)}
                >
                  {t(lang, "openOfficialSite")}
                </button>
                <button
                  type="button"
                  className="gt-btn"
                  onClick={() => setView("new-journey")}
                >
                  + {t(lang, "navNewJourney")}
                </button>
              </div>
            </div>

            <div className="gt-card">
              <h3>Saved Journey Profiles ({state.profiles.length})</h3>
              {state.profiles.length === 0 ? (
                <p className="gt-muted">
                  No journey profiles saved yet. Create one to configure ranked preferences and
                  ticket release reminders.
                </p>
              ) : (
                <ul className="gt-list">
                  {state.profiles.map((p) => (
                    <li key={p.id} className="gt-list-item">
                      <div>
                        <strong>{p.label}</strong>
                        <div className="gt-muted">
                          {p.passengerCount} passenger(s) · {p.direction} · Release reminder:{" "}
                          {p.releaseReminder.advanceDays}d @ {p.releaseReminder.releaseTimeLocal}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="gt-btn"
                          onClick={() => {
                            setSelectedProfileId(p.id);
                            setView("results");
                          }}
                        >
                          {t(lang, "readyForOfficialBooking")}
                        </button>
                        <button
                          type="button"
                          className="gt-btn"
                          onClick={async () => {
                            const next = await bridge.deleteProfile(p.id);
                            setState(next);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {view === "new-journey" && (
          <section className="gt-card" aria-label="New Journey">
            <h2>{t(lang, "navNewJourney")}</h2>
            <p className="gt-muted">
              Aligned with official public fields: From, To, Date of Journey, and Class.
            </p>
            <form onSubmit={(e) => void handleCreateProfile(e)}>
              <div className="gt-grid">
                <div className="gt-field">
                  <label htmlFor="gt-from">From</label>
                  <input
                    id="gt-from"
                    value={fromStation}
                    onChange={(e) => setFromStation(e.target.value)}
                    required
                  />
                </div>
                <div className="gt-field">
                  <label htmlFor="gt-to">To</label>
                  <input
                    id="gt-to"
                    value={toStation}
                    onChange={(e) => setToStation(e.target.value)}
                    required
                  />
                </div>
                <div className="gt-field">
                  <label htmlFor="gt-date">Date of Journey</label>
                  <input
                    id="gt-date"
                    type="date"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    required
                  />
                </div>
                <div className="gt-field">
                  <label htmlFor="gt-class">Choose Class (Priority 1)</label>
                  <select
                    id="gt-class"
                    value={primaryClass}
                    onChange={(e) => setPrimaryClass(e.target.value)}
                  >
                    <option value="S_CHAIR">S_CHAIR (Shovon Chair)</option>
                    <option value="SNIGDHA">SNIGDHA</option>
                    <option value="F_CHAIR">F_CHAIR (First Class Chair)</option>
                    <option value="AC_S">AC_S</option>
                    <option value="SHOVAN">SHOVAN</option>
                  </select>
                </div>
                <div className="gt-field">
                  <label htmlFor="gt-pax">Passengers (1–3 personal use)</label>
                  <select
                    id="gt-pax"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>
                <div className="gt-field">
                  <label htmlFor="gt-dir">Journey Leg</label>
                  <select
                    id="gt-dir"
                    value={direction}
                    onChange={(e) =>
                      setDirection(e.target.value === "return" ? "return" : "outbound")
                    }
                  >
                    <option value="outbound">Outbound</option>
                    <option value="return">Return</option>
                  </select>
                </div>
                <div className="gt-field">
                  <label htmlFor="gt-release">Configurable Release Reminder Time</label>
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
                  Save Journey Profile
                </button>
              </div>
            </form>
          </section>
        )}

        {view === "results" && (
          <section className="gt-card" aria-label="Results">
            <h2>{t(lang, "navResults")}</h2>
            <StatusBadge tone="unavailable" label={t(lang, "liveAvailabilityUnavailable")} />
            <p className="gt-muted" style={{ marginTop: 12 }}>
              Source: BR-ETICKET-PUBLIC · Confidence: unverified · Status: unavailable. Missing
              data is never shown as sold out.
            </p>
            {handoff && handoff.kind === "ready_for_official_booking" && (
              <div className="gt-list-item" style={{ marginTop: 12 }}>
                <div>
                  <StatusBadge tone="ready" label={t(lang, "readyForOfficialBooking")} />
                  <p className="gt-muted" style={{ margin: "8px 0 0 0" }}>
                    {handoff.note}
                  </p>
                </div>
                <button
                  type="button"
                  className="gt-btn gt-btn-primary"
                  onClick={() => void bridge.openOfficialUrl(handoff.officialUrl, activeProfile?.id)}
                >
                  {t(lang, "openOfficialSite")}
                </button>
              </div>
            )}
          </section>
        )}

        {view === "service-status" && (
          <section className="gt-card" aria-label="Service Status">
            <h2>{t(lang, "navServiceStatus")}</h2>
            <StatusBadge tone="unavailable" label={t(lang, "liveServiceStatusUnavailable")} />
            <p className="gt-muted" style={{ marginTop: 12 }}>
              No authorized real-time train cancellation or suspension feed is configured. Get
              Ticket never guesses service status from seat availability.
            </p>
            <div className="gt-btn-row">
              <button
                type="button"
                className="gt-btn"
                onClick={() => void bridge.openOfficialUrl(OFFICIAL_ETICKET_URL)}
              >
                {t(lang, "openOfficialSite")}
              </button>
            </div>
          </section>
        )}

        {view === "preferences" && (
          <section className="gt-card" aria-label="Preference Sheet">
            <h2>{t(lang, "navPreferences")}</h2>
            {!activeProfile ? (
              <p className="gt-muted">Create a Journey Profile first to configure preferences.</p>
            ) : (
              <>
                <p className="gt-muted">Active profile: {activeProfile.label}</p>
                <h3>Ranked Travel Classes</h3>
                <ul className="gt-list">
                  {[...activeProfile.preferences.rankedClasses]
                    .sort((a, b) => a.rank - b.rank)
                    .map((cls, idx) => (
                      <li key={cls.classCode} className="gt-list-item">
                        <span>
                          <strong>#{cls.rank}</strong> {cls.classCode}{" "}
                          {cls.enabled ? "(Enabled)" : "(Disabled)"}
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            className="gt-btn"
                            onClick={() => void handleMoveClassRank(idx, -1)}
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            className="gt-btn"
                            onClick={() => void handleMoveClassRank(idx, 1)}
                          >
                            Down
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>

                <h3 style={{ marginTop: 16 }}>Seat Direction Preferences</h3>
                <StatusBadge tone="stale" label={t(lang, "seatDirectionUnverified")} />
                <div className="gt-grid" style={{ marginTop: 12 }}>
                  <div className="gt-field">
                    <label htmlFor="gt-out-seat">Outbound Seat Direction</label>
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
                      <option value="forward_first">Prefer forward-facing</option>
                      <option value="neutral_then_backward">Neutral / backward fallback</option>
                      <option value="any_direction">Accept any seat</option>
                    </select>
                  </div>
                  <div className="gt-field">
                    <label htmlFor="gt-ret-seat">Return Seat Direction</label>
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
                      <option value="forward_first">Prefer forward-facing</option>
                      <option value="neutral_then_backward">Neutral / backward fallback</option>
                      <option value="any_direction">Accept any seat</option>
                    </select>
                  </div>
                </div>

                <div className="gt-list-item" style={{ marginTop: 16 }}>
                  <div>
                    <strong>Optional SEAT-001 Heuristic (1–30 / 31+)</strong>
                    <div className="gt-muted">{t(lang, "tentativeOwnerPreference")}</div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={activeProfile.preferences.tentativeSeatRule.enabled}
                      onChange={(e) => void handleToggleTentativeSeatRule(e.target.checked)}
                    />
                    Enable tentative sort
                  </label>
                </div>
              </>
            )}
          </section>
        )}

        {view === "alt-routes" && (
          <section className="gt-card" aria-label="Alternative Routes">
            <h2>{t(lang, "navAltRoutes")}</h2>
            <StatusBadge tone="unavailable" label="Station graph & stop validity unverified" />
            <p className="gt-muted" style={{ marginTop: 12 }}>
              Get Ticket only recommends alternative stations or multi-leg routes after train
              stops, ticket validity, fare, and onward connections are verified. A ticket for one
              destination never implies validity for an unverified destination.
            </p>
          </section>
        )}

        {view === "monitoring" && (
          <section className="gt-card" aria-label="Monitoring Center">
            <h2>{t(lang, "navMonitoring")}</h2>
            <div className="gt-btn-row" style={{ marginTop: 0, marginBottom: 12 }}>
              <StatusBadge tone="paused" label={t(lang, "liveAvailabilityUnavailable")} />
              {!bridge.capabilities.alarmsSupported && (
                <StatusBadge tone="stale" label={t(lang, "statusUnsupported")} />
              )}
            </div>
            <p className="gt-muted">{bridge.capabilities.lifecycleNote}</p>
            {releasePlan && (
              <div className="gt-list-item" style={{ marginTop: 12 }}>
                <div>
                  <strong>{t(lang, "navReleasePlanner")}</strong>
                  <div className="gt-muted">
                    Release date: {releasePlan.releaseDate} · {releasePlan.note}
                  </div>
                </div>
                <StatusBadge tone="ready" label="Local reminder only" />
              </div>
            )}
          </section>
        )}

        {view === "data-sources" && (
          <section className="gt-card" aria-label="Data Source Status">
            <h2>{t(lang, "navDataSources")}</h2>
            <ul className="gt-list">
              {OFFICIAL_STATIC_REFERENCES.map((ref) => (
                <li key={ref.sourceId} className="gt-list-item">
                  <div>
                    <strong>
                      {ref.sourceId} — {ref.title}
                    </strong>
                    <div className="gt-muted">
                      Verified: {ref.lastVerified} · {ref.scopeNote}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="gt-btn"
                    onClick={() => void bridge.openOfficialUrl(ref.url)}
                  >
                    Open Official Link
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {view === "security" && (
          <section className="gt-card" aria-label="Security and Privacy">
            <h2>{t(lang, "navSecurity")}</h2>
            <p>{t(lang, "noCredentialsNotice")}</p>
            <p className="gt-muted">
              Allowlisted official hosts: {OFFICIAL_RAILWAY_HOSTS.join(", ")}. Login, CAPTCHA,
              OTP, queue, payment, and final confirmation remain 100% manual on the official site.
            </p>
            <div className="gt-btn-row">
              <button
                type="button"
                className="gt-btn"
                onClick={async () => {
                  const cleared = await bridge.clearAllData();
                  setState(cleared);
                  setSelectedProfileId(null);
                  setNotice("All local Get Ticket data cleared.");
                }}
              >
                Clear All Local Data
              </button>
            </div>
          </section>
        )}

        {view === "settings" && (
          <section className="gt-card" aria-label="Settings">
            <h2>{t(lang, "navSettings")}</h2>
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
                <label htmlFor="gt-theme">Theme</label>
                <select
                  id="gt-theme"
                  value={state.settings.theme}
                  onChange={(e) =>
                    void handleSettingsPatch({
                      theme: e.target.value as AppSettings["theme"],
                    })
                  }
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
