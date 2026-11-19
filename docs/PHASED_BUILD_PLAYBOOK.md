# Phased Build Playbook — Low-Credit, Safe Continuation

## Goal

The project must be buildable through short, independent tasks. A paused conversation, exhausted credit limit, or interrupted work session must not leave an undocumented or silently broken implementation.

## Rules for every task

1. Work on one approved task only.
2. Read `docs/IMPLEMENTATION_STATE.md` first.
3. State the exact files that will change before editing.
4. Keep the change small enough to review in one diff.
5. Run the smallest relevant test, lint, type-check, or build check.
6. Update implementation state, decision log, and affected documentation in the same task.
7. Stop after reporting changed files, verification, limitations, and the next single recommended task.

Never begin a later phase merely because the folder already exists.

The owner-facing numbered sequence is maintained in `docs/STEP_BY_STEP_EXECUTION.md`. When a step completes, stop and wait for explicit approval to start the next step.

## Atomic work sequence

| ID | Small deliverable | Completion evidence |
| --- | --- | --- |
| P0.1 | Official source and terms evidence log | Links, date checked, permission conclusion |
| P0.2 | Chrome/Edge capability checklist | Test record and limitations |
| P0.3 | Kiwi real-device checklist | Test record and limitations |
| P0.4 | Final Phase 0 recommendation | Owner approval recorded |
| P1.1 | Root workspace/tooling only | Clean install and type-check |
| P1.2 | Shared domain types and validators | Unit tests pass |
| P1.3 | Storage abstraction and safe migrations | Unit tests pass |
| P2.1 | Desktop Manifest V3 shell with minimal permissions | Load-unpacked test |
| P2.2 | Popup/dashboard shell and design tokens | Visual review + build |
| P3.1 | Kiwi manifest capability adapter | Real-device test result |
| P4.1 | Journey Profile create/edit/restore UI | Unit + manual test |
| P5.1 | One explicitly approved source adapter | Provenance/status test |
| P5.2 | One explicitly approved service-status adapter | Date/segment/freshness provenance test |
| P6.1 | Search-results UI with loading/error/stale states | Test + visual review |
| P6.2 | Segment-valid alternative-route logic | Unit tests |
| P7.1 | Local scheduler and persisted safe backoff | Unit tests |
| P7.2 | Notification and challenge-pause flow | Manual/browser test |
| P8.1 | User-controlled official booking handoff | Manual test |
| P9.1 | Permissions/security/accessibility review | Audit report |
| P10.1 | Browser packages and installation guides | Install verification |

## Resume prompt

Use this when continuing after a pause:

> Read `README.md`, `docs/PROJECT_MASTER.md`, `docs/IMPLEMENTATION_STATE.md`, and the current task entry in `docs/PHASED_BUILD_PLAYBOOK.md`. Continue only the next approved incomplete task. Do not broaden scope, invent Railway data, bypass security controls, or modify unrelated files. First report your intended changed files; then implement, verify, update state, and stop.
