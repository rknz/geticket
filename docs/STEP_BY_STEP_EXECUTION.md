# Step-by-Step Execution Contract

The owner uses a free-plan workflow. Complete and report one step only; wait for an explicit instruction before beginning the next step. A later step is never implicitly approved.

| Step | Work | Output before stopping |
| --- | --- | --- |
| 1 | Official Railway source, terms, and permitted-access audit | Complete 2026-11-17: evidence log + live-integration blocker; no code |
| 2 | Desktop and Kiwi capability test plan | Complete 2026-11-19: `docs/PHASE0_CAPABILITY_TEST_PLAN_2026-11-19.md` checklist & matrix; no code |
| 3 | Review Phase 0 findings | Complete 2026-11-19: `docs/PHASE0_REVIEW_AND_RECOMMENDATION_2026-11-19.md`; Option A (manual/reference + handoff), `pnpm`, optional `SEAT-001` |
| 4 | Root TypeScript workspace and minimal tooling | Complete 2026-11-19: `pnpm` workspace (11 projects), strict `tsconfig`, `vitest`; clean install & typecheck |
| 5 | Shared data models, validators, storage migration design | Complete 2026-11-19: `packages/shared-core`, `packages/storage`, `packages/security`, unit tests pass |
| 6 | Chrome/Edge MV3 foundation | Complete 2026-11-19: `apps/desktop-extension` MV3 build (`370.34 KB`), minimal permissions; manual browser load pending |
| 7 | Kiwi foundation and real-device tests | Complete 2026-11-19 (build & fallbacks): `apps/android-extension` Kiwi build (`370.45 KB`); real-device test pending owner run |
| 8 | Premium shared UI shell, theme, language, settings | Complete 2026-11-19: `packages/ui-components` (Bangla/English, light/dark semantic tokens, responsive) |
| 9 | Journey profiles and preference sheet | Complete 2026-11-19: Journey Profile CRUD, ranked classes, seat-direction & optional `SEAT-001` |
| 10 | Approved source adapter and provenance UI | Complete 2026-11-19 (Option A): `ManualReferenceOnlyProvider` + provenance/unavailable UI; live API remains blocked |
| 11 | Search, route intelligence, and service-status display | Complete 2026-11-19: `packages/route-intelligence` + honest unavailable/static-reference views |
| 12 | Safe local monitoring and notifications | Complete 2026-11-19: `packages/scheduler`, `packages/notifications`, release planner & challenge-pause policy; live polling blocked |
| 13 | User-controlled official booking handoff | Complete 2026-11-19: allowlisted `ready_for_official_booking` handoff, zero login/payment automation |
| 14 | Security, accessibility, permissions, and package-size audit | Complete 2026-11-19: `docs/SECURITY_AND_RELEASE_AUDIT_2026-11-19.md` + 22/22 automated tests pass |
| 15 | Chrome, Edge, and Kiwi release packages + install guides | Complete 2026-11-19: unpacked builds + `docs/INSTALLATION_GUIDE_CHROME_EDGE_KIWI.md` (manual install verification pending) |

## Required completion report

Every completed step must state:

1. Changed files
2. Tests/checks run and results
3. Features now truly supported
4. Known limitations or blockers
5. Exact next step; then stop

## Start command

When ready, the owner can say: `Start Step 1 only.`
