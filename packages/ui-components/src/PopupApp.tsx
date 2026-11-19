import React, { useEffect, useState } from "react";
import { t } from "@get-ticket/shared-core";
import { OFFICIAL_ETICKET_URL } from "@get-ticket/security";
import type { GetTicketStoreState } from "@get-ticket/storage";
import type { PlatformBridge } from "./DashboardApp.js";
import { StatusBadge } from "./StatusBadge.js";
import "./tokens.css";

export function PopupApp({ bridge }: { bridge: PlatformBridge }) {
  const [state, setState] = useState<GetTicketStoreState | null>(null);

  useEffect(() => {
    void bridge.loadState().then(setState);
  }, [bridge]);

  const lang = state?.settings.language ?? "bn";
  const theme = state?.settings.theme ?? "system";

  return (
    <div data-theme={theme} className="gt-popup">
      <div className="gt-brand" style={{ marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18 }}>{t(lang, "appName")}</h1>
          <div className="gt-muted">{bridge.capabilities.platformName}</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <StatusBadge tone="unavailable" label={t(lang, "liveAvailabilityUnavailable")} />
      </div>

      <div className="gt-card" style={{ marginBottom: 12 }}>
        <div className="gt-muted">
          Saved Journey Profiles: <strong>{state?.profiles.length ?? 0}</strong>
        </div>
        <div className="gt-muted" style={{ marginTop: 4 }}>
          {t(lang, "officialFlowSteps")}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bridge.openDashboardTab && (
          <button
            type="button"
            className="gt-btn gt-btn-primary"
            onClick={() => void bridge.openDashboardTab?.()}
          >
            Open Dashboard
          </button>
        )}
        <button
          type="button"
          className="gt-btn"
          onClick={() => void bridge.openOfficialUrl(OFFICIAL_ETICKET_URL)}
        >
          {t(lang, "openOfficialSite")}
        </button>
      </div>
    </div>
  );
}
