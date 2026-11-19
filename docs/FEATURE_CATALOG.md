# Get Ticket — Feature Catalogue

This is the single index of planned product capabilities. A capability is not marked supported until its phase, source evidence, browser compatibility, and tests are complete.

| Area | Planned capability | Current status | Primary reference |
| --- | --- | --- | --- |
| Journey Profiles | Save, enable/disable, and restore route/date/passenger preferences | Implemented & unit-tested (local storage) | `PROJECT_MASTER.md` |
| Search | Origin, destination, date, class, train results, fare and schedule | UI form & static reference links implemented; live search blocked | `PHASE0_PUBLIC_SITE_INSPECTION_2026-11-17.md` |
| Availability | Verified class/coach/seat availability with timestamp and confidence | Blocked by official source audit (`Unavailable` state enforced) | `DATA_AND_EVIDENCE_REGISTRY.md` |
| Preference Sheet | Ranked classes, coach fallback, fare/time tie-breakers | Implemented & unit-tested (`rankCandidateOptions` + UI) | `PREFERENCE_ENGINE.md` |
| Seat Direction | Outbound/return forward-facing preferences with confidence | Implemented with `unverified` label & optional disabled-by-default `SEAT-001` | `PREFERENCE_ENGINE.md` |
| Alternative Routes | Valid alternative station and multi-leg suggestions | Validation & search logic unit-tested; live station graph unverified | `PROJECT_MASTER.md` |
| Release Planner | User-configurable advance-sale date/time reminders | Implemented & unit-tested (local alarms + fallback) | `PROJECT_MASTER.md` |
| Monitoring | Local, permission-respecting scheduled checks and alerts | Safe state machine & challenge-pause unit-tested; live polling blocked | `SECURITY_AND_PERFORMANCE.md` |
| Service Status | Verified running/cancelled/suspended/segment impact status | Blocked by official source audit (`Unavailable` state enforced) | `SERVICE_STATUS_AND_BOOKING_HANDOFF.md` |
| Notifications | Priority-match, source failure, stale data, challenge-pause alerts | Implemented with in-app fallback & unit-tested | `SERVICE_STATUS_AND_BOOKING_HANDOFF.md` |
| Booking Handoff | User-controlled opening/preparation of official flow | Implemented & tested (`ready_for_official_booking`, allowlisted HTTPS only) | `SERVICE_STATUS_AND_BOOKING_HANDOFF.md` |
| Official Hold | Show hold only if official system explicitly confirms it | Type-safe conditional model implemented; never fabricated | `SERVICE_STATUS_AND_BOOKING_HANDOFF.md` |
| Privacy & Security | Local-first, least privilege, no credentials/OTP/card/session storage | Implemented & audited (`tests/security/security-audit.test.ts`) | `SECURITY_AND_PERFORMANCE.md` |
| UI & Accessibility | Premium minimal desktop/mobile UI, Bangla/English, dark/light, clear states | Implemented in `packages/ui-components` & bundled | `UI_IMPLEMENTATION_BRIEF.md` |
| Browser Packaging | Separate Chrome, Edge and Kiwi builds with installation guides | Unpacked builds generated (`370 KB`); manual browser/Kiwi device tests pending | `INSTALLATION_GUIDE_CHROME_EDGE_KIWI.md` |

## Non-negotiable platform rules

- No fake live data, fabricated hold, or unsupported seat direction.
- No password, OTP, payment detail, cookie, token, or private endpoint handling.
- No CAPTCHA/queue/rate-limit bypass, automatic payment, or final booking confirmation.
- Every externally sourced result must be traceable to source and check time.

## Audit rule

Before a feature is implemented, link its task to this catalogue, its applicable phase in `PHASED_BUILD_PLAYBOOK.md`, and its acceptance test. When a feature changes, update this catalogue and its primary reference in the same change.
