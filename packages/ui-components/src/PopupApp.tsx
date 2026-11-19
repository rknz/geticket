import React, { useEffect, useState } from "react";
import { t } from "@get-ticket/shared-core";
import { OFFICIAL_ETICKET_URL } from "@get-ticket/security";
import type { GetTicketStoreState } from "@get-ticket/storage";
import { computeReleaseReminder } from "@get-ticket/scheduler";
import type { PlatformBridge } from "./DashboardApp.js";
import { StatusBadge } from "./StatusBadge.js";
import { ExternalLinkIcon, TrainTicketLogo } from "./Icons.js";
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
      <div className="gt-brand" style={{ marginBottom: 14, justifyContent: "space-between" }}>
        <div className="gt-brand">
          <span className="gt-logo-mark" style={{ width: 34, height: 34, borderRadius: 10 }}>
            <TrainTicketLogo size={18} />
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: 16 }}>{t(lang, "appName")}</h1>
            <div className="gt-muted" style={{ fontSize: 12 }}>
              {isBn ? "Bangladesh Railway প্ল্যানার" : "Railway Trip Planner"}
            </div>
          </div>
        </div>
        <StatusBadge tone="live" label={isBn ? "সক্রিয়" : "Active"} />
      </div>

      <div className="gt-ticket-card" style={{ marginBottom: 14 }}>
        <div className="gt-ticket-top" style={{ padding: "14px 16px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", opacity: 0.9 }}>
            {activeProfile
              ? isBn
                ? "সক্রিয় যাত্রা"
                : "ACTIVE TRIP"
              : isBn
                ? "শুরু করুন"
                : "GET STARTED"}
          </div>
          {activeProfile ? (
            <div className="gt-ticket-route" style={{ marginTop: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{activeProfile.fromStation}</div>
              <div className="gt-ticket-track" aria-hidden="true">
                <span className="gt-ticket-track-line" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{activeProfile.toStation}</div>
            </div>
          ) : (
            <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700 }}>
              {isBn ? "প্রথম যাত্রা পরিকল্পনা করুন" : "Plan Your First Rail Trip"}
            </div>
          )}
        </div>

        <div className="gt-ticket-divider" aria-hidden="true">
          <div className="gt-ticket-perf" />
        </div>

        <div className="gt-ticket-body" style={{ padding: "4px 16px 14px" }}>
          {activeProfile ? (
            <div className="gt-muted" style={{ fontSize: 12.5 }}>
              <strong>{activeProfile.journeyDate}</strong> · {activeProfile.passengerCount}{" "}
              {isBn ? "টি টিকিট" : "ticket(s)"}
              {releasePlan && (
                <div>
                  {isBn ? "রিলিজ রিমাইন্ডার:" : "Release alert:"}{" "}
                  <strong>{releasePlan.releaseDate}</strong>
                </div>
              )}
            </div>
          ) : (
            <div className="gt-muted" style={{ fontSize: 12.5 }}>
              {isBn
                ? "স্টেশন, ক্যালেন্ডার থেকে তারিখ এবং ট্রেন সেভ করুন — তারপর এক ক্লিকে অফিসিয়াল সাইটে বুক করুন।"
                : "Pick stations, select a date on the calendar, and open the official e-ticket portal in one click."}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bridge.openDashboardTab && (
          <button
            type="button"
            className="gt-btn gt-btn-primary"
            onClick={() => void bridge.openDashboardTab?.()}
          >
            {isBn ? "পূর্ণ ড্যাশবোর্ড খুলুন" : "Open Full Dashboard"}
          </button>
        )}
        <button
          type="button"
          className="gt-btn"
          onClick={() => void bridge.openOfficialUrl(OFFICIAL_ETICKET_URL)}
        >
          <span>{t(lang, "openOfficialSite")}</span>
          <ExternalLinkIcon />
        </button>
      </div>
    </div>
  );
}
