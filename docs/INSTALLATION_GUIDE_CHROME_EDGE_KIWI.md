# Get Ticket (v2.4.0) — Complete Download, Installation & Usage Guide

**Repository:** <https://github.com/rknz/geticket>  
**Releases page:** <https://github.com/rknz/geticket/releases/tag/v2.4>  
**Release mode:** Manual / Reference-Only + Official-Site Handoff Mode (Option A)

---

## 1. Where to Download

### Option A — Ready-to-Install Release Archives (Recommended)
Download from the **GitHub Releases** page (<https://github.com/rknz/geticket/releases/tag/v2.4>) or locate the locally generated packages in `dist/releases/`:

| Platform | File to Download | Size | SHA-256 Checksum |
| --- | --- | --- | --- |
| **Computer (Chrome & Edge)** | `get-ticket-desktop-chrome-edge-v2.4.0.zip` | 142.5 KB | `ada14f2343dd6510de1189de5d6c3596812af26af11f8eb340acca697ec2a0d0` |
| **Mobile (Kiwi Browser Android)** | `get-ticket-android-kiwi-v2.4.0.zip` | 142.5 KB | `a576c29ee68e5bb4882ae4af7ca2354c817ed98fee00e9cbd476e61b425c5ab7` |
| **Checksums** | `SHA256SUMS.txt` | 209 B | Verifies integrity of both archives |

### Option B — Build from Source (Developers)
```powershell
git clone https://github.com/rknz/geticket.git
cd geticket
pnpm install
npm run build
```
Built unpacked folders appear at:
- Desktop: `apps/desktop-extension/dist/`
- Android Kiwi: `apps/android-extension/dist/`

---

## 2. Computer Installation (Windows 11 — Google Chrome & Microsoft Edge)

### Google Chrome
1. Download `get-ticket-desktop-chrome-edge-v2.4.0.zip` and **extract** it to a permanent folder (e.g., `C:\Extensions\get-ticket-desktop\`).
   - *(Or use `apps/desktop-extension/dist` directly if you built from source.)*
2. Open Chrome and navigate to `chrome://extensions/`.
3. Turn **ON** **Developer mode** (top-right corner).
4. Click **Load unpacked**.
5. Select the extracted folder containing `manifest.json`.
6. Click the **Extensions puzzle icon** in the toolbar and **pin** **Get Ticket (Desktop)**.

### Microsoft Edge
1. Extract `get-ticket-desktop-chrome-edge-v2.4.0.zip` to a permanent folder.
2. Open Edge and navigate to `edge://extensions/`.
3. Turn **ON** **Developer mode** (left sidebar).
4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. Pin **Get Ticket (Desktop)** to the toolbar.

---

## 3. Mobile Installation (Android — Kiwi Browser)

> **Important Android Notice:** Kiwi Browser must be installed on your Android phone. Unlike desktop, Kiwi Browser loads `.zip` extensions directly without extracting. Real-device testing on your phone is recommended to check how your Android battery settings handle alarms and notifications.

1. Download **Kiwi Browser** on your Android phone (if not already installed).
2. Download `get-ticket-android-kiwi-v2.4.0.zip` directly onto your Android phone (keep it as a `.zip` file — **do not extract**).
3. Open **Kiwi Browser**, tap the **three-dot menu (`⋮`)** → **Extensions**.
4. Turn **ON** **Developer mode**.
5. Tap **+ (from .zip/.crx/.user.js)**.
6. Browse to your **Downloads** folder and select `get-ticket-android-kiwi-v2.4.0.zip`.
7. **Get Ticket (Kiwi Android)** will appear in your extensions list.
8. To open it anytime, tap the **three-dot menu (`⋮`)**, scroll down, and tap **Get Ticket (Kiwi Android)** (tap **Open Dashboard** for the full mobile-friendly interface).

---

## 4. How to Use Get Ticket (Step-by-Step)

### A. Popup Quick Controls
- Clicking the extension icon opens a compact popup showing:
  - Current platform & live-integration status (`Live availability integration unavailable`)
  - Number of saved Journey Profiles
  - Quick buttons: **Open Dashboard** and **Open Official e-Ticket Site** (`https://eticket.railway.gov.bd/`).

### B. Dashboard Views
1. **Overview (`সারসংক্ষেপ`):**
   - View all saved Journey Profiles, active release reminder settings, and quick official handoff actions.
2. **New Journey (`নতুন যাত্রা`):**
   - Create a Journey Profile using fields aligned with the official e-ticket portal:
     - **From** (Origin station) & **To** (Destination station — must differ from origin)
     - **Date of Journey** (`YYYY-MM-DD`)
     - **Choose Class (Priority 1)** (`S_CHAIR`, `SNIGDHA`, `F_CHAIR`, `AC_S`, `SHOVAN`)
     - **Passengers** (`1–3` personal-use limit)
     - **Journey Leg** (`Outbound` or `Return`)
     - **Configurable Release Reminder Time** (defaults to 10-day advance window; adjust time as needed).
3. **Preferences (`পছন্দের তালিকা`):**
   - Reorder your **Ranked Travel Classes** (`Up` / `Down`) so Priority 1, 2, 3 are evaluated in order.
   - Set **Outbound** and **Return** seat-direction preferences separately.
   - **Seat Direction Honesty Rule:** Seat numbers alone never prove travel direction (`Seat direction unavailable / unverified`).
   - **Optional `SEAT-001` (`1–30 / 31+`) Heuristic:** Disabled by default. You may optionally enable it as a tentative sort; it is always explicitly labelled `Tentative owner preference — not verified`.
4. **Results & Official Booking Handoff (`ফলাফল`):**
   - Displays current provenance (`Live availability integration unavailable` until an official Bangladesh Railway API is authorized).
   - Shows **Ready for official booking** (strictly distinct from an official hold) with one click to open `https://eticket.railway.gov.bd/`.
   - Complete **Login → Search → Select → CAPTCHA / OTP → Pay** manually on the official site.
5. **Service Status (`সার্ভিস স্ট্যাটাস`):**
   - Shows `Live service status unavailable` (never guesses cancellations from seat counts) and links to official Railway pages.
6. **Alternative Routes (`বিকল্প রুট`):**
   - Explains validated segment rules (e.g., a Dhaka → Jamalpur ticket does not imply validity for Mymensingh without verified stop/ticketing rules).
7. **Monitoring & Release Planner (`মনিটরিং`):**
   - Displays your user-configured advance-sale release reminder date/time and honest browser lifecycle notes (including Android battery/background limits).
8. **Data Sources (`তথ্য উৎস`):**
   - Lists verified official static references (`BR-ETICKET-PUBLIC`, `BR-SCHEDULE-PUBLIC`, `BR-FARE-EAST`) with direct links.
9. **Security & Privacy (`নিরাপত্তা ও গোপনীয়তা`):**
   - Shows declared permissions (`storage`, `alarms`, `notifications` only), allowlisted hosts, and a one-click **Clear All Local Data** button.
10. **Settings (`সেটিংস`):**
    - Switch **Language** between **বাংলা (Bangla)** and **English**.
    - Switch **Theme** between **System**, **Light**, and **Dark**.

---

## 5. Security, Privacy & Limitations

- **Zero sensitive data stored:** Get Ticket never reads, stores, logs, or transmits Railway passwords, OTPs, session cookies, tokens, or payment/card details.
- **No automation or bypass:** No CAPTCHA solving, OTP automation, queue bypass, rapid polling, or automatic payment/booking confirmation.
- **Minimal permissions:** Only `storage`, `alarms`, and `notifications` (zero `host_permissions`, zero `cookies`, zero content-script injection).
- **Android Kiwi lifecycle:** Android may suspend or kill background workers to save battery; continuous background reminders are not guaranteed when Kiwi is closed.
