import React, { useEffect, useState } from "react";
import { t } from "@get-ticket/shared-core";
import { OFFICIAL_ETICKET_URL } from "@get-ticket/security";
import type { GetTicketStoreState } from "@get-ticket/storage";
import { computeReleaseReminder } from "@get-ticket/scheduler";
import type { PlatformBridge } from "./DashboardApp.js";
import { StatusBadge } from "./StatusBadge.js";
import "./tokens.css";

export function PopupApp({ bridge }: { bridge: PlatformBridge }) {
  const [state, setState] = useState<GetTicketStoreState | null>(null);

  useEffect(() => {
    void bridge.loadState().then(setState);
  }, [bridge]);

  const lang = state?.settings.language ?? "bn";
  const isBn = lang === "bn";
  const theme = state?.settings.theme ?? "system";
  const activeProfile = state?.profiles[0] ?? null;
  const releasePlan = activeProfile
    ? computeReleaseReminder(activeProfile.journeyDate, activeProfile.releaseReminder)
    : null;

  return (
    <div data-theme={theme} className="gt-popup">
      <div className="gt-brand" style={{ marginBottom: 12 }}>
        <span className="gt-logo-mark" aria-hidden="true">
          GT
        </span>
        <div>
          <h1 style={{ margin: 0, fontSize: 17 }}>{t(lang, "appName")}</h1>
          <div className="gt-muted">
            {isBn ? "Bangladesh Railway প্ল্যানার" : "Bangladesh Railway Planner"}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <StatusBadge
          tone="live"
          label={isBn ? "সক্রিয় · লোকাল প্ল্যানার মোড" : "Active · Local Planner Mode"}
        />
      </div>

      <div className="gt-card" style={{ padding: 14, marginBottom: 12 }}>
        {activeProfile ? (
          <>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              {activeProfile.fromStation} → {activeProfile.toStation}
            </div>
            <div className="gt-muted">
              {activeProfile.journeyDate} · {activeProfile.passengerCount}{" "}
              {isBn ? "টি টিকিট" : "ticket(s)"}
            </div>
            {releasePlan && (
              <div className="gt-muted" style={{ marginTop: 4 }}>
                {isBn ? "রিলিজ রিমাইন্ডার:" : "Release reminder:"}{" "}
                <strong>{releasePlan.releaseDate}</strong>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              {isBn ? "স্বাগতম! শুরু করতে ড্যাশবোর্ড খুলুন" : "Welcome! Open Dashboard to Start"}
            </div>
            <div className="gt-muted">
              {isBn
                ? "স্টেশন, ক্যালেন্ডার থেকে তারিখ এবং ট্রেন সেভ করে রাখুন — তারপর এক ক্লিকে অফিসিয়াল সাইটে বুক করুন।"
                : "Save your stations, calendar date, and preferred trains — then open the official e-ticket portal in one click."}
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bridge.openDashboardTab && (
          <button
            type="button"
            className="gt-btn gt-btn-primary"
            onClick={() => void bridge.openDashboardTab?.()}
          >
            {isBn ? "ড্যাশবোর্ড খুলুন (যাত্রা ও ক্যালেন্ডার)" : "Open Full Dashboard"}
          </button>
        )}
        <button
          type="button"
          className="gt-btn"
          onClick={() => void bridge.openOfficialUrl(OFFICIAL_ETICKET_URL)}
        >
          {t(lang, "openOfficialSite")} →
        </button>
      </div>
    </div>
  );
}
