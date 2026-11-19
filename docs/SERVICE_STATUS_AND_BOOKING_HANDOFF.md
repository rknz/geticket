# Live Service Status and Booking Handoff

## 1. Train service-status tracking

Get Ticket will support a verified service-status layer in addition to seat availability. It should tell the user when reliably available:

- train running, cancelled, suspended, or partially unavailable;
- affected train/service, travel date, route segment, origin/destination, and class where applicable;
- effective start/end time or expected duration of the disruption;
- source, source timestamp, extension check timestamp, confidence, and status;
- whether a journey profile is affected and what safe alternative search is available.

### Accuracy rules

- “Cancelled”, “closed”, “suspended”, or “running” may be shown only when a verified official source provides that status.
- The extension must distinguish `live`, `stale`, `unavailable`, `partial`, and `unverified`; it must not call old information real-time news.
- If official service-status data is not available or permitted, the UI shows `Live service status unavailable` and links the user to the official source. It does not guess from seat availability.
- Every cancellation/suspension record must identify the affected date and route/segment. A cancellation for one date or segment must not be applied to all train services.
- No private endpoints, scraping bypass, aggressive refresh, or unauthorised data use is allowed.

## 2. Priority-match alert

At a permitted scheduled check, a priority match exists only when the selected route, date, passenger count, class/coach/seat preferences, service status, and source confidence satisfy the owner’s configured rules. The extension can then:

1. create a local alert with match reasons and checked time;
2. notify the user immediately, subject to browser/device notification limits;
3. show the official booking handoff action.

## 3. Booking handoff and conditional official hold

The extension may prepare search criteria and open the official booking journey **only after explicit user action** and only where Railway terms and browser capabilities permit it. It must not silently submit a search, passenger form, seat selection, reservation request, or booking request.

An official system may or may not create a temporary ticket hold. The extension must follow these rules:

- Never claim that a ticket is held/locked unless the official page or authorized integration explicitly confirms it.
- If an official, user-initiated booking flow returns a confirmed hold/expiry time, show it as `Official hold confirmed` with the displayed expiry and source timestamp.
- Do not manufacture a five-minute timer, reserve seats locally, or imply that a local selection has reserved anything on the Railway system.
- CAPTCHA, OTP, queue, payment, and final confirmation remain manual user actions.
- On challenge, queue, rate limit, or source error, pause and hand control to the user; do not retry or attempt to retain the selection automatically.

## 4. Planned UI states

| State | Meaning |
| --- | --- |
| Live service status | Verified official service information is current |
| Stale service status | Latest known verified value is older than its stated freshness limit |
| Service status unavailable | No permitted current source is available |
| Priority match found | A verified available option meets configured preferences |
| Ready for official booking | Search details are prepared; no reservation is claimed |
| Official hold confirmed | Official system explicitly returned a temporary hold and expiry |
| User action required | CAPTCHA, OTP, queue, payment, or confirmation needs the user |
