# Documentation and Decision Control

## Source hierarchy

1. Owner’s newest explicit instruction
2. Safety, law, official-source permissions, and browser constraints
3. `docs/PROJECT_MASTER.md`
4. Other repository documentation

## Update procedure

When a requirement changes:

1. Record the date, change, reason and approval state in this file.
2. Update the affected master/technical document in the same change.
3. Mark unknown items as `Proposed` or `Unverified`; do not present them as confirmed.
4. Update README when the installation, project status, or user-visible capability changes.
5. Commit reviewed changes to Git with a clear message.
6. Update `docs/IMPLEMENTATION_STATE.md` whenever a task starts, completes, pauses, or is blocked.
7. Record owner-provided but unverified operational knowledge in `docs/ASSUMPTION_REGISTER.md`; do not convert it to a verified configuration without evidence.

## Decision log

| Date | Decision | Status | Reason |
| --- | --- | --- | --- |
| 2026-11-17 | Product is two personal-use browser extensions: Chrome/Edge desktop and Kiwi Android | Confirmed | Owner direction |
| 2026-11-17 | Local-first monitoring is the initial direction; hybrid relay is optional later | Proposed, not finally approved | Needs Phase 0 evidence and owner approval |
| 2026-11-17 | Live data requires an authorized verified source | Confirmed | Safety and reliability requirement |
| 2026-11-17 | No live source adapter or automated monitoring may be implemented yet | Confirmed | Step 1 found no public authorization/API for such access |
| 2026-11-19 | Desktop (Chrome/Edge) and Android (Kiwi) capability test plan established in `docs/PHASE0_CAPABILITY_TEST_PLAN_2026-11-19.md`; all browser capabilities remain unverified until Steps 6–7 | Confirmed | Step 2 completed without code or manifests |
| 2026-11-19 | Phase 0 approved (Step 3): proceed to Phase 1 in Manual / Reference-Only + Official-Site Handoff Mode; live adapters & automated polling remain blocked pending official Railway authorization | Confirmed | Owner decision in Step 3 (`docs/PHASE0_REVIEW_AND_RECOMMENDATION_2026-11-19.md`) |
| 2026-11-19 | Step 4 workspace will install and use `pnpm` to match `docs/PROJECT_MASTER.md` | Confirmed | Owner decision in Step 3 |
| 2026-11-19 | `SEAT-001` (`1–30 / 31+`) included as optional, disabled-by-default tentative sort labelled `Tentative owner preference — not verified` | Confirmed | Owner decision in Step 3 |
| 2026-11-19 | Root `pnpm` monorepo workspace created with minimal devDependencies (`typescript`, `vitest`, `@types/node`) and explicit `allowBuilds: { esbuild: true }` | Confirmed | Step 4 (`P1.1`) completed; preserves existing folder structure with no feature code or manifests |
| 2026-11-19 | Steps 5–15 completed under Option A (Manual / Reference-Only + Official-Site Handoff Mode); live adapters & polling remain blocked; Chrome/Edge/Kiwi real-device verification remains pending owner execution | Confirmed | Owner explicitly authorized proceeding through remaining steps (`2026-11-19`) |
| 2026-11-19 | Separated v2.4.0 downloadable release archives published in `releases/android/`, `releases/desktop/`, and `releases/checksums/` on GitHub (`https://github.com/rknz/geticket`) | Confirmed | Explicit owner instruction (Source Hierarchy #1) |
