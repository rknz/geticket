# Phase 0 Feasibility Gate

Implementation of live search, live availability, or monitoring cannot begin until each item is recorded with evidence.

| Gate | Required evidence | Possible outcome |
| --- | --- | --- |
| Official data source | Official API/documentation or written terms permitting the access pattern | Approved adapter, manual-only mode, or feature unavailable |
| Availability fields | Proof of which train/class/coach/seat/fare fields are reliable | Show only confirmed fields |
| Monitoring rules | Permitted refresh interval, authentication, rate limits and challenge behavior | Safe local schedule or no automation |
| Chrome/Edge | Manifest V3 permissions and lifecycle test | Supported/limited |
| Kiwi Browser | Installation, popup, storage, notification, alarm, content script and restart tests on a real device | Supported/limited/unsupported |
| Development environment | Codex works in the chosen editor | Continue there or use a supported editor |

Until the gate passes, UI must say **Live availability integration unavailable** rather than showing sample data as live.

**17 November 2026 audit result:** published official schedule/fare references exist, but no public API or authorization for automated live availability/service-status access was found. The official data-source gate is not passed.
