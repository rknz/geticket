# Premium Minimal UI Implementation Brief

## Design intent

Get Ticket should feel like a polished travel tool: calm, clear, spacious, and dependable. It must not imitate a specific Behance, Pinterest, or third-party design; use original components and licensed/owned assets only.

## Visual system

- One neutral background, one restrained brand accent, and semantic colours only for states.
- 8px spacing rhythm, large readable Bangla/English type, rounded but not oversized surfaces.
- Clear hierarchy: journey summary first, current availability second, next user action third.
- Use icons with labels for unfamiliar actions; never convey ticket status only by colour.
- Dark and light themes use the same semantic tokens, not separate ad-hoc colours.

## Screen-level standards

| Screen | Primary job | Required states |
| --- | --- | --- |
| Overview | Show active journeys and alerts | Empty, due soon, paused, source unavailable |
| New Journey | Create a profile quickly | Validation, no station match, saved confirmation |
| Results | Compare verified options | Loading, live, stale, unknown, unavailable |
| Train Service Status | Explain running/cancelled/suspended service information | Live, stale, unavailable, partial route impact |
| Preference Sheet | Rank classes, coaches, and seat-direction fallback | Empty, reordered, unsupported preference |
| Alternative Routes | Explain valid alternatives | Verified, multi-leg, unverified, not recommended |
| Monitoring Center | Control schedules safely | Active, paused, challenge, backoff, unsupported |
| Data Source Status | Build trust | Verified, partial, unavailable, last checked |
| Security & Privacy | Explain data handling | Permissions, local data, user-controlled actions |

## Responsive rules

- Desktop: centred dashboard with readable max width and a persistent journey summary.
- Android: one-column, touch targets at least 44px, primary action reachable with one hand.
- Popup: compact status and shortcut only; complex work opens the dashboard.

## Visual quality gates

Before a UI task is complete, verify keyboard use, screen-reader labels, contrast, loading/error/empty states, 320px mobile width, dark mode, and Bangla text wrapping. No motion should imply a ticket is reserved or live unless verified.

Preference results must explain the matching reason and clearly identify any unverified seat-direction information; a seat number must never be visually presented as proof of forward-facing travel.

Booking UI must visually distinguish `Ready for official booking` from `Official hold confirmed`; a prepared selection is never styled or worded as a reservation.

The initial search form must use familiar labels aligned with the official public flow: From, To, Date of Journey, and Class. Get Ticket may add its own priority and monitoring controls around that flow without impersonating the official site.
