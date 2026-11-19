# Step 14 — Security, Accessibility, Permissions, and Package-Size Audit

**Audit date:** 2026-11-19  
**Build version:** `0.1.0` (Option A — Manual / Reference-Only + Official-Site Handoff Mode)

## 1. Permissions audit (both builds)

| Build | Manifest Version | Declared `permissions` | Declared `host_permissions` | Content scripts |
| --- | --- | --- | --- | --- |
| `apps/desktop-extension/dist/manifest.json` | 3 | `storage`, `alarms`, `notifications` | None | None |
| `apps/android-extension/dist/manifest.json` | 3 | `storage`, `alarms`, `notifications` | None | None |

- Verified by `tests/security/security-audit.test.ts`: zero forbidden permissions (`cookies`, `webRequest`, `webRequestBlocking`, `tabs`, `scripting`, `browsingData`, `<all_urls>`).

## 2. Network destinations & allowlist

- **Background network requests made by extension:** **None** (zero automated polling, zero telemetry, zero remote executable code).
- **Allowlisted user-initiated navigation targets (`packages/security/src/index.ts`):**
  - `https://eticket.railway.gov.bd/`
  - `https://railway.gov.bd/` (official static schedule & fare references)
- Any non-HTTPS or non-allowlisted URL is rejected before tab creation.

## 3. Credential, session & challenge-safety checks

- No Railway login form, credential storage, OTP storage, cookie reading, token caching, or payment handling exists anywhere in the codebase.
- `findForbiddenSensitiveKeys` blocks sensitive field names in both runtime messages (`validateExtensionMessage`) and local storage (`GetTicketRepository.save`).
- `evaluateRetryPolicy` pauses immediately with zero automatic retry on CAPTCHA, queue, rate-limit, auth failure, or unavailable live source, requiring explicit user confirmation to resume.

## 4. Package size & artifact cleanliness

| Build output | File count | Total unpacked size | Source maps | Secret files |
| --- | --- | --- | --- | --- |
| `apps/desktop-extension/dist/` | 16 | 370.34 KB | 0 | 0 |
| `apps/android-extension/dist/` | 16 | 370.45 KB | 0 | 0 |

- Both `dist/` directories are excluded from Git via `.gitignore` and reproducible via `npm.cmd run build`.

## 5. Accessibility & UI quality checklist

- Semantic light/dark CSS tokens (`packages/ui-components/src/tokens.css`), 8px spacing rhythm, `:focus-visible` keyboard focus rings, `role="status"` and `role="alert"` landmarks, `aria-current="page"` navigation, and icon + text status badges (never colour-only).
- Minimum `44px` interactive control height and responsive single-column mobile layout (`max-width: 480px`).
- Bangla (`bn`) and English (`en`) UI strings with `Noto Sans Bengali` fallback stack.
- Honest UI labels enforced: `Live availability integration unavailable`, `Live service status unavailable`, `Seat direction unavailable / unverified`, `Tentative owner preference — not verified`, and `Ready for official booking` (never styled as a reservation or hold).

## 6. Verification boundaries (honest status)

- **Automated checks passed (2026-11-19):** `tsc --noEmit` (0 errors), Vitest `6/6` suites (`22/22` tests passed), Vite production builds for both desktop and android extensions.
- **Manual browser/device tests still required by owner:** Loading unpacked builds in Chrome, Edge, and Kiwi Browser on a real Android device per `docs/PHASE0_CAPABILITY_TEST_PLAN_2026-11-19.md` (`CAP-01`–`CAP-08`) before recording verified entries in `configs/browser-capabilities/`.
