# Phase 0 — Public E-ticket Site Inspection

**Inspection date:** 17 November 2026  
**Scope:** Public, unauthenticated landing page only. No disclaimer accepted, login, registration, field entry, search, reservation, payment, or CAPTCHA interaction occurred.

## Confirmed public landing-page flow

The official e-ticket landing page exposes these search inputs:

- `From`
- `To`
- `Date of Journey`
- `Choose Class`
- `Search Trains`

It describes the booking journey as:

1. Search origin, destination, and journey date
2. Select trip and seats
3. Pay through the official flow

The page publicly states that tickets can be bought online ten days in advance.

## Public navigation observed

- Login
- Register
- Train Information
- Contact Us
- Terms and Conditions
- Privacy Policy

## Important observed limits

- A full-screen terms/disclaimer overlay with an `I AGREE` control appeared and was not accepted.
- The landing page did not visibly provide a separate live train-status, schedule, queue, CAPTCHA, release-time, seat-count, coach-count, or route-availability display.
- Therefore this inspection does **not** establish that any availability, coach, seat, booking, service-status, or monitoring data can be used by the extension.
- Linked terms, privacy, train-information, and contact pages are JavaScript-rendered; their contents still require a separate, permission-respecting review.

## Product changes based on this inspection

- Get Ticket’s search form will map to the observed public fields: origin, destination, journey date, and class.
- The dashboard must represent the official sequence as `Search → Select → Pay`, keeping all final payment and confirmation user-controlled.
- The release planner default must remain user-configurable; no release time was confirmed.
- No feature may claim live inventory, coach data, or temporary hold based on this landing-page evidence.

## Sources

- Official e-ticket site: <https://eticket.railway.gov.bd/>
- Official government e-ticket reference: <https://railway.gov.bd/pages/static-pages/691997c4933eb65569ddefd0>
- Official Railway internal e-services index: <https://railway.gov.bd/pages/internal-eservices/>
