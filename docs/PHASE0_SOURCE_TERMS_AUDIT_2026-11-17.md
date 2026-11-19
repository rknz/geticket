# Step 1 — Official Source and Terms Audit

**Audit date:** 17 November 2026  
**Scope:** Public official sources and public unauthenticated e-ticket interface. No login, disclaimer acceptance, account creation, search submission, reservation, payment, reverse engineering, private endpoint inspection, or automated refresh was performed.

## Executive decision

**No live Railway data adapter, automatic availability monitoring, coach/seat integration, service-status integration, or booking automation is approved.** Public sources establish useful reference material, but this audit found no public authorization for an extension to automate or poll the e-ticket service and no public API documentation.

The product may later link users to official pages and, after each relevant approval, use verified official published reference data. It must not claim live status or use an unofficial/private endpoint.

## Evidence register

| ID | Official source | What is publicly established | Integration conclusion |
| --- | --- | --- | --- |
| BR-ETICKET-PUBLIC | `https://eticket.railway.gov.bd/` | Public search fields: From, To, Date of Journey, Class; stated flow: Search → Select trip/seats → Pay; page states online tickets can be bought ten days in advance | Public UI reference only. No API, polling permission, rate limit, or live field access authorization found |
| BR-ETICKET-PROCEDURE-2022 | `https://railway.gov.bd/pages/static-pages/691997d2933eb65569ddf747` | Official guidance, updated 2022, describes sign-up, email activation, login with a security code, then ticket purchase and seat/fare result | Historical/user-guidance reference only. Its age and security-code step reinforce that the extension must not automate login or security checks |
| BR-SCHEDULE-PUBLIC | `https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2` | Official schedule index, content updated 11 June 2026, links Eastern/Western schedule pages | Public reference; not a live service-status feed and no reuse/API permission found |
| BR-SCHEDULE-PDF | `https://railway.gov.bd/sites/default/files/files/railway.portal.gov.bd/page/e64d9448_0615_4316_87f0_deb10f5c847d/Intercity%20Trains%20%2827%29.pdf` | Published timetable fields include train number/name, off day, origin, departure, destination, arrival | Static timetable reference only; dates/changes must be checked before display |
| BR-FARE-EAST | `https://railway.gov.bd/pages/files/69199762933eb65569ddc6b9` | Official Eastern fare-list page, content updated 13 February 2025, with downloadable language variants | Published reference only; fare can change, and no live fare API/reuse permission found |
| BR-TTMS | `https://railway.gov.bd/pages/static-pages/691997af933eb65569dddf3a` | Official site exposes a TTMS entry, but its page only provides an old downloadable item | Not evidence of a public live-tracking API or permission to integrate |

## Findings that affect product design

1. Keep all ticket release times configurable. The public landing page confirms a ten-day advance window but no universal release time.
2. Treat official schedules and fares as dated reference sources, not current live availability.
3. Keep existing `Search → Select → Pay` language in the UI, but never impersonate the official site.
4. Do not automate login, security code/CAPTCHA, search submission, seat selection, reservation, payment, or confirmation.
5. Do not implement polling until Railway provides/permits an access method and a safe rate/interval.
6. Show `Live availability integration unavailable` and link to the official e-ticket page until authorization is documented.

## Terms and permission gap

The rendered e-ticket application displays a full-screen disclaimer and links Terms and Privacy pages, but reviewing the application beyond that point would require accepting the disclaimer. No user account or legal acceptance was performed during this audit. No public official source located in this audit grants third-party extension/API automation, scraping, background monitoring, or session reuse.

**Required before any live integration:** written/official confirmation of permitted data fields, access method, authentication/session rules, automation limits, rate limits, data retention, and prohibited actions.

## Risk register

| Risk | Level | Required mitigation |
| --- | --- | --- |
| Unauthorized access/polling triggers account or anti-bot controls | High | No integration without permission; no retries on challenge/rate limit |
| Public schedule/fare data becomes stale | Medium | Date every record; show source and freshness; do not label it live |
| Outdated procedure conflicts with current e-ticket application | High | Use it only as historical guidance; test current user flow manually later |
| TTMS mistaken for an integration API | High | Treat as unavailable until official API/permission evidence exists |
| Account/session credentials exposed by extension | High | Never read/store/transmit credentials, OTPs, tokens, or cookies |

## Step 1 completion

This step is complete as a feasibility audit with a **live-integration blocker**. The next step remains Step 2 (platform capability test plan) and requires owner instruction.
