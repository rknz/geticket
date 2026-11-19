# Get Ticket — Per-Browser Installation Guide (v0.1.0)

**Release mode:** Manual / Reference-Only + Official-Site Handoff Mode (Option A)  
**Build command:** Run `npm.cmd run build` from the repository root to generate fresh unpacked builds in `apps/desktop-extension/dist/` and `apps/android-extension/dist/`.

---

## Important Limitations (Read Before Installing)

- **Live availability & service status are unavailable:** No public Bangladesh Railway API or automated polling permission is documented. The extension shows `Live availability integration unavailable` and `Live service status unavailable` and links to the official e-ticket portal.
- **User-controlled booking only:** Login, CAPTCHA, OTP, queue, seat selection, payment, and final confirmation are completed manually by you on `https://eticket.railway.gov.bd/`.
- **Minimal permissions:** `storage`, `alarms`, `notifications` only. No `host_permissions`, no `cookies`, no `tabs` read, and no credentials or payment details are stored.
- **Android Kiwi truth:** Kiwi Browser on Android has **not** yet been verified on a real device. Android OS battery policies may suspend or kill background alarms; continuous background monitoring is not guaranteed.

---

## 1. Google Chrome (Desktop — Windows 11)

1. Build the desktop package: `npm.cmd run build:desktop`.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked**.
5. Select the folder: `apps/desktop-extension/dist`.
6. Pin **Get Ticket (Desktop)** from the toolbar extensions menu, open the popup, and click **Open Dashboard**.
7. Verify items `CAP-01`–`CAP-08` from `docs/PHASE0_CAPABILITY_TEST_PLAN_2026-11-19.md`.

---

## 2. Microsoft Edge (Desktop — Windows 11)

1. Build the desktop package: `npm.cmd run build:desktop`.
2. Open Microsoft Edge and go to `edge://extensions/`.
3. Enable **Developer mode** (left sidebar toggle).
4. Click **Load unpacked**.
5. Select the folder: `apps/desktop-extension/dist`.
6. Pin **Get Ticket (Desktop)** to the toolbar and open the popup or dashboard.
7. Verify items `CAP-01`–`CAP-08` from `docs/PHASE0_CAPABILITY_TEST_PLAN_2026-11-19.md`.

---

## 3. Kiwi Browser (Android — Real Device Testing Required)

> **Notice:** Real-device testing on your Android phone is required before considering Kiwi Browser `Supported`. If popup rendering or alarms behave inconsistently on your device/OS, use the dashboard tab and manual handoff fallback.

1. Build the Android package: `npm.cmd run build:android`.
2. Compress the contents of `apps/android-extension/dist` into a `.zip` file (e.g., `get-ticket-kiwi-0.1.0.zip`, with `manifest.json` at the archive root) and transfer it to your Android device.
3. Open **Kiwi Browser** on Android and tap the menu (`⋮`) → **Extensions**.
4. Enable **Developer mode**.
5. Tap **+ (from .zip/.crx/.user.js)** and select `get-ticket-kiwi-0.1.0.zip`.
6. Open **Get Ticket (Kiwi Android)** from Kiwi's menu (`⋮`).
7. Run real-device checks `CAP-01`–`CAP-08` from `docs/PHASE0_CAPABILITY_TEST_PLAN_2026-11-19.md` and record observed results in `configs/browser-capabilities/`.
