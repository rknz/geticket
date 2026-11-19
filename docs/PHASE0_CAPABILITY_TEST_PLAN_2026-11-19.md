# Step 2 — Desktop and Kiwi Capability Test Plan

**Plan date:** 2026-11-19  
**Phase / Task:** Phase 0 — Step 2 (`P0.2` / `P0.3` planning)  
**Scope:** Test checklist, device/browser matrix, pass/fallback criteria, and evidence-recording template for Chrome Desktop, Edge Desktop, and Kiwi Browser Android. **No extension code, manifests, or browser capability claims are created in this step.**

## 1. Execution rules

- Do not claim any browser or API as `Supported` until the corresponding test case is executed and logged with dated evidence.
- Do not add files to `configs/browser-capabilities/` until real browser/device tests are executed in their approved build steps (Steps 6 and 7).
- Do not test against live Bangladesh Railway endpoints, login flows, or automated polling during capability checks; use local extension test fixtures only.
- On Android, never assume uninterrupted background execution when the OS suspends, battery-optimizes, or kills Kiwi Browser.

## 2. Target device and browser matrix

| Matrix ID | Platform | Browser | Target OS / Device | Build target | Current status |
| --- | --- | --- | --- | --- | --- |
| ENV-CHROME | Desktop | Google Chrome (latest stable) | Windows 11 | `apps/desktop-extension` (MV3) | Pending (Step 6) |
| ENV-EDGE | Desktop | Microsoft Edge (latest stable) | Windows 11 | `apps/desktop-extension` (MV3) | Pending (Step 6) |
| ENV-KIWI | Android | Kiwi Browser (exact installed version TBD) | Real Android device (model & OS version TBD) | `apps/android-extension` (Kiwi build) | Pending (Step 7) |
| ENV-DEV | Development | Local workspace & editor tooling | Windows 11 | Monorepo tooling (`pnpm`, Node, TypeScript) | Pending (Step 3/4 check) |

> Fill exact browser version, OS build, device brand/model, and Android battery-optimization setting when each test is run.

## 3. Capability test checklist

Every capability from `docs/PLATFORM_DELIVERY_PLAN.md` must be verified per target environment before support is claimed.

| Test ID | Capability | Test procedure (to run in Steps 6–7) | Pass criteria | Fallback if limited/unsupported |
| --- | --- | --- | --- | --- |
| CAP-01 | Extension installation | Load unpacked build (Chrome/Edge) or install local ZIP/CRX package (Kiwi). Confirm icon, name, version, and zero manifest errors. | Installs cleanly with zero fatal errors and minimal declared permissions. | Document exact install steps or mark browser build unsupported. |
| CAP-02 | Popup & dashboard rendering | Open extension popup and full dashboard tab. Check layout at desktop width and `320px` mobile width, `44px` minimum touch targets, light/dark themes, and Bangla/English text wrapping. | Popup opens reliably; dashboard renders cleanly with readable Bangla/English and accessible controls. | Open dashboard directly in a tab if popup rendering is unstable on Kiwi. |
| CAP-03 | Local storage & migrations | Write, read, update, and delete a sample Journey Profile in `chrome.storage.local`. Verify schema version key and data integrity. | Read/write succeeds deterministically with zero data loss. | Disable persistence-dependent features and show clear notice. |
| CAP-04 | Notifications | Request/check notification permission and trigger a local test alert (priority match / challenge pause). Test both foreground and background states. | Notification displays with title, message, and click-to-open behavior (or permission state is detected accurately). | Fall back to in-app alert banner and clearly explain OS/browser notification limits. |
| CAP-05 | Alarms & background lifecycle | Schedule a non-aggressive test alarm via `chrome.alarms`, wait for MV3 service-worker idle/sleep, and verify wake-up. On Android, test screen-off / app-background / battery-saver behavior. | Service worker wakes cleanly on alarm and restores persisted state; Android limitations are accurately observed and documented. | Fall back to reminder-only / manual refresh mode; never promise continuous background monitoring. |
| CAP-06 | Content script & tab action | Open an allowlisted test/public URL via explicit user click (`chrome.tabs.create` or narrowly scoped content script). Confirm no broad host permissions are required. | Tab opens cleanly on user action; content script runs only on allowlisted origin if enabled. | Fall back to official-site link handoff only (no content-script injection). |
| CAP-07 | Restart recovery | Force-close and reopen the browser (and reboot/relaunch Kiwi on Android). Verify saved Journey Profiles, pause reasons, and next-check timestamps reload intact. | Saved state and pause status recover cleanly without triggering automatic retries. | Restore saved state on next manual open and display last-known status as stale/paused. |
| CAP-08 | Least-privilege & message safety | Inspect loaded manifest permissions, host permissions, and extension storage/console output. Send a malformed internal message to verify rejection. | Only documented permissions exist; zero credentials/tokens/cookies stored or logged; malformed messages rejected. | Block release until violation is fixed (no fallback). |

## 4. Platform-specific focus areas

### 4.1 Chrome & Edge Desktop (Windows 11)
- Confirm Manifest V3 service-worker idle termination (~30s inactivity) does not lose in-memory scheduling state (all state must live in `chrome.storage.local`).
- Confirm Edge-specific notification center behavior and unpacked loading match Chrome or document any divergence.
- Verify keyboard navigation, focus states, and screen-reader labels in popup, dashboard, and options views.

### 4.2 Kiwi Browser Android (Real Device)
- Record exact Android version, OEM skin (e.g., Samsung One UI, Xiaomi HyperOS, stock Android), Kiwi version, and battery-optimization setting (`Unrestricted` vs `Optimized`).
- Verify whether extension popup opens cleanly from Kiwi's menu or requires a dedicated dashboard tab fallback.
- Explicitly test whether `chrome.alarms` and `chrome.notifications` fire when Kiwi is backgrounded or swiped away; record actual behavior without assuming parity with desktop.
- Verify one-handed reachability, `44px` touch targets, and `320px` narrow-viewport rendering.

## 5. Feasibility gate decision outcomes

Each tested capability in each browser must be classified using one of three outcomes:

| Outcome | Meaning | Required product action |
| --- | --- | --- |
| `Supported` | Passed all acceptance checks with dated evidence | Enable capability for that browser build |
| `Limited` | Works with documented OS/browser constraints (e.g., Android background sleep) | Enable with explicit UI notice and safe fallback |
| `Unsupported` | API unavailable, broken, or fails safety checks | Hide/disable capability and show `Not supported in this browser` |

## 6. Evidence record template (for future `configs/browser-capabilities/` entries)

After executing tests in Steps 6 and 7, record each browser/device run in `configs/browser-capabilities/` with these required fields (per `configs/browser-capabilities/README.md`):

```text
Record ID:        CAP-REC-YYYYMMDD-<browser>
Browser / Version: <e.g., Chrome 13x.x / Edge 13x.x / Kiwi xxx.x>
Device / OS:       <e.g., Windows 11 24H2 / Android 14 (Device Model)>
Date Tested:       YYYY-MM-DD
Tested API / ID:   <CAP-01 .. CAP-08 and WebExtension API name>
Result:            Supported | Limited | Unsupported
Limitation:        <Exact observed constraint, or "None">
Evidence:          <Test log summary, screenshot ref, or manual verification note>
```

## 7. Step 2 completion

This plan completes Step 2 (`P0.2` / `P0.3` planning) with **no implementation code or manifests created**. All browser capabilities remain `Pending` until executed in Steps 6 and 7. The next step is **Step 3** (review Phase 0 findings and record owner decision on scope and approved data source).
