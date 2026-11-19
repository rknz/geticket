# Security, Account Safety, and Lightweight Engineering

## Product rule

Get Ticket must preserve the approved feature scope while remaining small, fast, and least-privilege. “Lightweight” never means hiding errors, skipping validation, weakening security, or making unsupported live-data claims.

## Account and login safety

- The user signs in directly on the official Railway website; the extension never implements a Railway login form.
- Never store, copy, sync, log, or transmit Railway passwords, OTPs, payment details, session cookies, access tokens, or page authentication headers.
- Do not attempt automatic login, repeated login, form-submit retries, CAPTCHA solving, queue bypass, or challenge dismissal.
- On a CAPTCHA, queue, bot-warning, unusual verification page, authentication failure, or source error: immediately pause the relevant job, show a notification, and require an explicit user action before any permitted resume.
- A website may still apply its own protections. The extension can reduce avoidable risk; it cannot guarantee that an external website will never lock an account.

## Safe monitoring behavior

- Monitoring begins only after the source terms and permitted access pattern are verified.
- Use an owner-configurable, documented minimum interval; never implement rapid refresh loops.
- Persist the next permitted check time, failure count, and pause reason in extension storage.
- Use bounded exponential backoff after network errors. Do not retry challenge, login, authorization, or rate-limit pages automatically.
- Stop when the browser/device lifecycle does not support safe execution; never pretend continuous Android background monitoring is guaranteed.

## Lightweight implementation rules

- Use one TypeScript monorepo with shared core code; no duplicate application logic between desktop and Android builds.
- Prefer native WebExtension APIs, Web Crypto, `Intl`, and browser storage before adding libraries.
- Add a dependency only when it materially improves correctness, accessibility, security, or testability; document why it is required.
- Use code splitting and lazy-load dashboard screens that are not initially visible.
- Keep image exports optimized; include only browser-required icon sizes in each final build.
- No mandatory backend, analytics SDK, remote executable code, database, or cloud SDK in the first release.
- Build production packages without source maps unless a release-support need is explicitly approved.

## Permission and network policy

- Use an official-domain allowlist, exact host permissions where possible, and no broad browsing-data permission.
- Every permission and network destination must be documented and justified before release.
- Validate all messages between UI, service worker, and content scripts; treat website content as untrusted.
- Do not send personal journey details to a third party unless the owner explicitly approves a documented feature.

## Release checklist additions

Before a release, verify: minimal package size, no secret files, no sensitive console logs, no unused permission, no automatic challenge retry, and accurate monitoring limitations.
