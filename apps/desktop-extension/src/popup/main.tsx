import React from "react";
import { createRoot } from "react-dom/client";
import { PopupApp } from "@get-ticket/ui-components";
import { createDesktopBridge } from "../platform/index.js";

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <PopupApp bridge={createDesktopBridge()} />
    </React.StrictMode>,
  );
}
