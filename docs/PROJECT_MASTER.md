# Master Project Document — Get Ticket

**Status:** Planning baseline (17 November 2026)  
**Owner-facing language:** Bangla  
**Change rule:** নতুন সিদ্ধান্ত হলে `docs/DOCUMENT_CONTROL.md` মেনে এই নথি ও সংশ্লিষ্ট নথি আপডেট করতে হবে।

## 1. উদ্দেশ্য

নিজের ১–৩টি Bangladesh Railway ticket-এর জন্য **Get Ticket** নামে একটি দ্রুত, পরিষ্কার এবং ব্যক্তিগত booking-assistance tool তৈরি করা। এটি একসঙ্গে দুইটি browser extension হবে:

- **Desktop:** Google Chrome ও Microsoft Edge, Manifest V3
- **Android:** Kiwi Browser, আলাদা compatibility-tested build

এটি standalone desktop/mobile app, PWA, Electron app, SaaS product, full website, অথবা বাধ্যতামূলক cloud backend নয়।

## 2. ব্যবহারকারীর প্রধান flow

1. ব্যবহারকারী origin, destination, journey date, passenger count, train/class preference ও budget দিয়ে Journey Profile বানাবেন।
2. বর্তমান/নিকটবর্তী যাত্রার জন্য user-initiated search-এ যাচাইকৃত official availability, fare এবং schedule দেখা যাবে।
3. অনুমোদিত official source থাকলে train service status—চলবে, cancelled, suspended বা route segment-এ প্রভাব—তার source ও checked time-সহ দেখা যাবে।
4. আগাম যাত্রার জন্য ticket release reminder এবং অনুমোদিত monitoring schedule থাকবে।
5. ticket পাওয়া গেলে notification এবং official booking page-এ দ্রুত handoff থাকবে।
6. user CAPTCHA, OTP, queue, payment এবং final confirmation সম্পন্ন করবেন।

প্রতিটি profile-এ owner-ranked class/coach preference এবং outbound/return-এর জন্য আলাদা seat-direction preference থাকতে পারবে। বিস্তারিত ও accuracy rule `docs/PREFERENCE_ENGINE.md`-এ আছে।

## 3. Live-data policy

“Live” কেবল তখন লেখা যাবে যখন অনুমোদিত official source থেকে বর্তমান তথ্য সফলভাবে এসেছে। প্রতিটি ফলাফলে `source`, `checkedAt`, `confidence`, ও `status` থাকবে।

- Official API/integration সবচেয়ে অগ্রাধিকার পাবে।
- Published official timetable/fare data দ্বিতীয় অগ্রাধিকার।
- অনুমোদিত হলে user-visible official web interaction ব্যবহার করা যেতে পারে।
- অনুমতি নেই, source ব্যর্থ, বা তথ্য পুরোনো হলে যথাক্রমে `unavailable`, `source error`, অথবা `stale` দেখাতে হবে।
- Coach/seat count কেবল উৎসে নির্ভরযোগ্যভাবে প্রদর্শিত হলে দেখানো যাবে। অনুমান করা যাবে না।
- Live train cancellation/suspension/closure status-ও একই evidence, date/segment scope এবং freshness নিয়ম অনুসরণ করবে।

## 4. Route intelligence

Alternative station/route suggestion করার আগে train stop, ticket validity, fare, timetable এবং onward connection যাচাই করতে হবে। ঢাকা–জামালপুরের ticket ময়মনসিংহ পর্যন্ত ভ্রমণের অনুমতি দেয় না; সেটি আলাদা destination বা multi-leg journey হিসেবে পরিষ্কারভাবে দেখাতে হবে।

## 4.1 Preference-aware matching

একটি permitted check-এ সব enabled class/coach preference rank অনুযায়ী মূল্যায়ন করা হবে—প্রথম পছন্দ না পেলে দ্বিতীয়/পরের পছন্দ দেখা হবে। এটি fast repeat refresh নয়। Seat number দেখে forward/backward direction অনুমান করা যাবে না; নির্দিষ্ট service-এর coach layout, formation ও journey direction যাচাইকৃত হলে তবেই seat-direction preference প্রয়োগ হবে।

## 5. নিষিদ্ধ কাজ ও নিরাপত্তা সীমা

কোনো CAPTCHA, OTP, queue, fraud/anti-bot control বা rate limit bypass করা যাবে না। Bulk buying, resale, multiple-account bypass, payment automation, final booking confirmation automation, password/OTP/card storage এবং unauthorized/private API ব্যবহার নিষিদ্ধ। Challenge দেখলে monitoring থামবে, ব্যবহারকারীকে জানাবে এবং explicit user action ছাড়া পুনরায় শুরু হবে না।

Railway account login কেবল official site-এ ব্যবহারকারী নিজে করবেন। Extension password, OTP, session cookie, token, payment detail বা authentication header read/store/transmit/log করবে না এবং automatic login বা repeated login retry করবে না. কোনো external site account lock না করার নিশ্চয়তা দেওয়া সম্ভব নয়; documented rate limit, backoff, explicit user action এবং immediate challenge pause দিয়ে avoidable risk কমানো হবে। বিস্তারিত নিয়ম `docs/SECURITY_AND_PERFORMANCE.md`-এ আছে।

Priority match পাওয়া মানে ticket lock/hold নয়। User-initiated official flow যদি hold ও expiry explicitly নিশ্চিত করে তবেই সেটি দেখানো যাবে; extension নিজে locally বা silently কোনো reservation তৈরি/দাবি করবে না। বিস্তারিত `docs/SERVICE_STATUS_AND_BOOKING_HANDOFF.md`-এ আছে।

## 6. Phase plan and approval gates

| Phase | কাজ | শুরু করার শর্ত |
| --- | --- | --- |
| 0 | Official source/terms audit, Kiwi test plan, Codex environment check, risk register | Owner approval |
| 1 | Monorepo, TypeScript, shared models, validation, test tooling | Phase 0 report approved |
| 2 | Chrome/Edge extension shell, storage, dashboard | Phase 1 approved |
| 3 | Kiwi extension shell and real-device compatibility tests | Phase 2 approved |
| 4 | Journey Profiles, UI, language/theme settings | Phase 3 scope approved |
| 5 | Authorized data-source adapter and provenance/status UI | Source explicitly approved |
| 6 | Search and validated alternative-route intelligence | Phase 5 verified |
| 7 | Local monitoring, alarms, persistence, safe alerts | Terms/lifecycle constraints verified |
| 8 | User-controlled official booking handoff | Phase 7 approved |
| 9 | Security, permissions, accessibility and browser tests | Feature work complete |
| 10 | Signed/package builds, installation guide, release notes | Acceptance checks pass |
| 11 | Optional hybrid relay | Separate explicit owner approval and authorized server-side source |

No phase automatically authorizes a later phase.

## 7. Planned repository layout

```text
apps/
  desktop-extension/       # Chrome/Edge Manifest V3 build
  android-extension/       # Kiwi-specific manifest/build after validation
packages/
  shared-core/             # types, validation, utilities
  railway-engine/          # approved providers, timetable, availability
  route-intelligence/      # station graph and segment validation
  scheduler/               # alarms, monitoring state, retry policy
  notifications/
  storage/
  security/
  ui-components/
configs/
  browser-capabilities/
  railway-sources/
docs/
tests/
  unit/
  integration/
  security/
  desktop/
  android/
```

Folders are intentionally placeholders until the applicable phase is approved. Package tooling (`pnpm`, Vite, React, TypeScript, Zod, Vitest, and optional Playwright) will be added in Phase 1 rather than guessed now. The build will reuse a shared core, prefer native browser APIs, lazy-load noncritical screens, and include only required assets so it stays lightweight without reducing approved features.

Platform-specific structure and real-device compatibility rules are maintained in `docs/PLATFORM_DELIVERY_PLAN.md`. Free-plan step control is maintained in `docs/STEP_BY_STEP_EXECUTION.md`.

## 8. Quality and release target

The finished product must have separate browser builds/manifests, reusable shared core, data provenance, no fake availability, accessible Bangla/English UI, documented lifecycle limits, tests for claimed functionality, and browser-specific installation instructions. Kiwi support is only claimed after actual validation.

## 9. Brand assets — Get Ticket

Keep the original editable logo in `assets/branding/source/`. Browser-ready exports belong in `assets/branding/exports/`; social/promotional artwork belongs in `assets/branding/social/`. Each app has its own `assets/icons/` and `assets/branding/` directory so the final builds remain self-contained.

Required extension icon exports are square PNG files: `icon-16.png`, `icon-32.png`, `icon-48.png`, and `icon-128.png`. Create the logo artwork first as SVG if possible, plus a transparent 1024×1024 PNG master; derive all smaller PNGs from that master. Do not put the only original logo file inside an app build folder.
