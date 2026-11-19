# Get Ticket — Bangladesh Railway Browser Extension (v2.4.0)

![Version](https://img.shields.io/badge/version-2.4.0-0b63e5)
![Manifest](https://img.shields.io/badge/Manifest-V3-116236)
![Platforms](https://img.shields.io/badge/platforms-Chrome%20%7C%20Edge%20%7C%20Kiwi%20Android-3b4b61)
![Mode](https://img.shields.io/badge/mode-Manual%20%2F%20Official%20Handoff-855200)

**Get Ticket** হলো ব্যক্তিগত ব্যবহারের জন্য (১–৩টি টিকিট) একটি হালকা, নিরাপদ ও পরিষ্কার **Bangladesh Railway** যাত্রা পরিকল্পনা, পছন্দের তালিকা (Preference Sheet), টিকিট রিলিজ রিমাইন্ডার এবং অফিসিয়াল ই-টিকিট হ্যান্ডঅফ ব্রাউজার এক্সটেনশন।

> **Current Live Mode (Option A):** Works locally right now for Journey Profiles, Ranked Class/Seat Preferences, Configurable Ticket Release Reminders, Bangla/English + Light/Dark UI, and one-click Official e-Ticket Handoff (`https://eticket.railway.gov.bd/`). Live Railway API polling remains disabled until official authorization is documented.

---

## Download Ready-to-Install Packages (`v2.4.0`)

Platform packages are strictly separated inside [`releases/`](releases/README.md) with POSIX-compatible `.zip` paths and SHA-256 verification:

| Platform | Package File | Direct Download | Install Action |
| --- | --- | --- | --- |
| **Android Mobile (Kiwi Browser)** | `get-ticket-android-kiwi-v2.4.0.zip` | [Download Android ZIP](https://github.com/rknz/geticket/raw/main/releases/android/get-ticket-android-kiwi-v2.4.0.zip) | **Do NOT extract** — load `.zip` directly in Kiwi |
| **Computer (Chrome & Edge)** | `get-ticket-desktop-chrome-edge-v2.4.0.zip` | [Download Desktop ZIP](https://github.com/rknz/geticket/raw/main/releases/desktop/get-ticket-desktop-chrome-edge-v2.4.0.zip) | **Extract** folder, then click **Load unpacked** |
| **SHA-256 Checksums** | `SHA256SUMS.txt` | [View / Download Checksums](releases/checksums/SHA256SUMS.txt) | Optional integrity verification |

- **Download checklist & what to look for:** [`releases/README.md`](releases/README.md)
- **Full step-by-step installation & usage guide:** [`docs/INSTALLATION_GUIDE_CHROME_EDGE_KIWI.md`](docs/INSTALLATION_GUIDE_CHROME_EDGE_KIWI.md)

---

## Step-by-Step Mobile Setup (Android — Kiwi Browser)

1. Install **Kiwi Browser** on your Android phone.
2. Tap **[Download Android ZIP](https://github.com/rknz/geticket/raw/main/releases/android/get-ticket-android-kiwi-v2.4.0.zip)** to save `get-ticket-android-kiwi-v2.4.0.zip` (~133 KB). **Keep it as a `.zip` file — do not extract it.**
3. Open **Kiwi Browser** → tap the **three-dot menu (`⋮`)** → tap **Extensions**.
4. Switch **Developer mode** **ON**.
5. Tap **+ (from .zip/.crx/.user.js)** and select `get-ticket-android-kiwi-v2.4.0.zip` from your Downloads folder.
6. Launch anytime from **`⋮`** → **Get Ticket (Kiwi Android)** → **Open Dashboard**.

> **Android Lifecycle Note:** Android battery optimization may suspend or stop background alarms when Kiwi is closed. Continuous background monitoring is not guaranteed on Android.

---

## Step-by-Step Computer Setup (Google Chrome & Microsoft Edge)

1. Click **[Download Desktop ZIP](https://github.com/rknz/geticket/raw/main/releases/desktop/get-ticket-desktop-chrome-edge-v2.4.0.zip)** and **extract** it to a permanent folder (e.g., `C:\Extensions\get-ticket-desktop\`).
2. Open **`chrome://extensions/`** (Chrome) or **`edge://extensions/`** (Edge).
3. Turn **Developer mode** **ON**.
4. Click **Load unpacked** and select the extracted folder (the folder containing `manifest.json`).
5. Pin **Get Ticket (Desktop)** to your browser toolbar and open the Popup or Dashboard.

---

## Key Features & How to Use

- **Journey Profiles (`নতুন যাত্রা`):** Save origin (`From`), destination (`To`), `Date of Journey`, Priority 1 class, passengers (`1–3`), outbound/return leg, and release reminder time.
- **Ranked Preference Engine (`পছন্দের তালিকা`):** Reorder travel classes (`S_CHAIR`, `SNIGDHA`, `F_CHAIR`, etc.), set separate outbound/return seat-direction preferences, and optionally enable the unverified `SEAT-001` (`1–30 / 31+`) tentative sort (`Tentative owner preference — not verified`).
- **Ticket Release Planner (`মনিটরিং`):** Calculates advance-sale reminder dates/times (10-day window configurable) with local notifications and in-app fallback.
- **User-Controlled Official Handoff (`ফলাফল`):** Prepares your journey summary (`Ready for official booking` — never claims a fake hold) and opens `https://eticket.railway.gov.bd/` so you complete **Login → Search → Select → CAPTCHA / OTP → Pay** manually.
- **Bangla & English + Light & Dark (`সেটিংস`):** Accessible responsive UI built for both desktop dashboards and `320px` mobile screens with `44px` touch targets.

---

## Security, Privacy & Non-Negotiable Rules

- **Minimal permissions:** `storage`, `alarms`, `notifications` only (zero `host_permissions`, zero `cookies`, zero content-script injection).
- **Zero credential storage:** Never reads, stores, logs, or transmits Railway passwords, OTPs, cookies, tokens, or payment details.
- **No automation or bypass:** Never bypasses CAPTCHA, OTP, queue, or rate limits, and never automates login, seat reservation, or payment.
- **Honest data provenance:** Missing or unavailable data is never shown as `sold_out`.

---

## Repository Structure

```text
apps/
  desktop-extension/      # Chrome & Edge Manifest V3 build
  android-extension/      # Kiwi Browser Android build & feature-detection fallbacks
packages/
  shared-core/            # Domain types, Zod validators, preference matcher, Bangla/English i18n
  railway-engine/         # ManualReferenceOnlyProvider & static official references
  route-intelligence/     # Station graph & segment-validity rules
  scheduler/              # Release planner, safe retry/backoff & challenge-pause policy
  notifications/          # Native notifications + in-app fallback
  storage/                # Versioned local storage & safe migrations
  security/               # Official-host allowlist, sensitive-key blocker & message validation
  ui-components/          # Shared accessible React UI & light/dark semantic tokens
releases/
  android/                # Ready-to-install Kiwi Android .zip
  desktop/                # Ready-to-install Chrome/Edge .zip
  checksums/              # SHA256SUMS.txt
tests/                    # Unit, integration, security, desktop & android Vitest suites
docs/                     # Governance, audits, specifications & guides
```

### Build & Test from Source

```powershell
pnpm install
npm run typecheck
npm run test
npm run build
```

---

## Documentation Index

1. [Master project plan](docs/PROJECT_MASTER.md)
2. [Feasibility gate](docs/FEASIBILITY_GATE.md)
3. [Document-control rules](docs/DOCUMENT_CONTROL.md)
4. [Backup and release guide](docs/BACKUP_AND_RELEASE.md)
5. [UI direction](docs/UI_DIRECTION.md)
6. [Asset inventory](docs/ASSET_INVENTORY.md)
7. [Security and lightweight engineering rules](docs/SECURITY_AND_PERFORMANCE.md)
8. [Phased low-credit build playbook](docs/PHASED_BUILD_PLAYBOOK.md)
9. [Current implementation state](docs/IMPLEMENTATION_STATE.md)
10. [Data and evidence registry](docs/DATA_AND_EVIDENCE_REGISTRY.md)
11. [Premium UI implementation brief](docs/UI_IMPLEMENTATION_BRIEF.md)
12. [Class, coach, and seat-direction preference engine](docs/PREFERENCE_ENGINE.md)
13. [Owner-provided assumptions awaiting verification](docs/ASSUMPTION_REGISTER.md)
14. [Live service status and booking-handoff rules](docs/SERVICE_STATUS_AND_BOOKING_HANDOFF.md)
15. [Public e-ticket site inspection, 17 November 2026](docs/PHASE0_PUBLIC_SITE_INSPECTION_2026-11-17.md)
16. [Complete feature catalogue and implementation status](docs/FEATURE_CATALOG.md)
17. [Desktop and Android Kiwi delivery plan](docs/PLATFORM_DELIVERY_PLAN.md)
18. [Owner-approved step-by-step execution contract](docs/STEP_BY_STEP_EXECUTION.md)
19. [Step 1 official source and terms audit](docs/PHASE0_SOURCE_TERMS_AUDIT_2026-11-17.md)
20. [Step 2 desktop and Kiwi capability test plan](docs/PHASE0_CAPABILITY_TEST_PLAN_2026-11-19.md)
21. [Step 3 Phase 0 review and owner decision](docs/PHASE0_REVIEW_AND_RECOMMENDATION_2026-11-19.md)
22. [Step 14 security, accessibility, permissions, and package-size audit](docs/SECURITY_AND_RELEASE_AUDIT_2026-11-19.md)
23. [Step 15 Chrome, Edge, and Kiwi installation guide](docs/INSTALLATION_GUIDE_CHROME_EDGE_KIWI.md)
