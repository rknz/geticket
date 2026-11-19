import React from "react";
import { createRoot } from "react-dom/client";
import { DashboardApp } from "@get-ticket/ui-components";
import { createKiwiBridge } from "../platform/index.js";

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <DashboardApp bridge={createKiwiBridge()} />
    </React.StrictMode>,
  );
}
