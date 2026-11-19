import React from "react";
import { createRoot } from "react-dom/client";
import { DashboardApp } from "@get-ticket/ui-components";
import { createDesktopBridge } from "../platform/index.js";

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <DashboardApp bridge={createDesktopBridge()} />
    </React.StrictMode>,
  );
}
