# Preference Engine — Class, Coach, and Seat Direction

## Purpose

Each Journey Profile can contain an ordered preference sheet. During one permitted availability check, the engine evaluates every approved option in rank order and presents the best verified match. This is a selection and recommendation system; it does not automatically reserve, buy, or lock a ticket.

## 1. Ranked travel-class preference

The owner can create a priority list for a journey, for example:

1. Shovon Chair
2. First Class Chair
3. Any explicitly allowed fallback class

Rules:

- Each class has a unique rank; the owner can add, remove, reorder, or disable a class.
- Only classes actually returned by a verified source can be evaluated.
- A higher-ranked available class is presented ahead of a lower-ranked one.
- If the owner’s first choice is unavailable, the system continues through the configured list during the same permitted check; it must not create an aggressive repeat-refresh loop.
- “No data” and “unverified” are not equivalent to unavailable.

## 2. Coach preference

The owner may rank coach types or named coaches only when the official source reliably exposes them. Example policy: preferred coach A/B first, then any coach in the chosen class.

- Coach identifiers must come from verified source data; do not invent coach letters or numbers.
- If coach-level data is unavailable, explain that the class match is known but coach preference cannot be applied.
- The owner can choose whether a class fallback is acceptable when the preferred coach is not available.

## 3. Forward- and backward-facing seat preference

The owner can choose, separately for outbound and return journeys:

1. Prefer forward-facing seat
2. Accept neutral/sideways seat
3. Accept backward-facing seat only as fallback
4. Accept any seat

The preference must be separately stored for each direction because the same physical seat can face differently on the return service.

### Critical accuracy rule

A seat number alone does **not** prove its travel direction. The engine may label a seat as forward/backward only when all of the following are verified for the specific train service and journey direction:

- coach layout and seat orientation;
- train formation/coach order;
- direction of travel for that service on that date; and
- reliable mapping from the ticketing source to the seat identifier.

If any item is missing or uncertain, the UI must display **Seat direction unavailable / unverified**. It may still show the seat number supplied by the official source, but must not call it forward-facing.

### Owner-provided tentative rule

The owner reports this specific pattern for Dhaka → Mymensingh: seats `1–30` are normally backward-facing and seats `31+` are normally forward-facing. For Mymensingh → Dhaka and Dewanganj → Dhaka return patterns, seats `1–30` are normally forward-facing and seats `31+` are normally backward-facing. This is recorded as `SEAT-001` in `docs/ASSUMPTION_REGISTER.md`.

It may eventually support an **optional tentative sort** only after the owner confirms the exact boundary and scope. It must never automatically label or buy a seat as forward-facing, and it cannot override verified train- and coach-specific mapping. The UI must label such a result `Tentative owner preference — not verified`.

## 4. Matching order

For every verified option, evaluate in this order:

1. Journey date, route, passenger count, and explicit hard constraints
2. Class priority rank
3. Coach priority rank, when verified
4. Seat direction priority for the relevant outbound/return leg, when verified
5. Fare, departure time, and any other owner-selected tie-breakers

Tentative owner heuristics rank after verified mapping and before generic tie-breakers only when the owner explicitly enables them.

The result page must show *why* an option was selected: e.g. `Class priority 1 · coach preference matched · forward seat direction unverified`.

## 5. Planned preference fields

```ts
type RankedClassPreference = {
  classCode: string;
  rank: number;
  enabled: boolean;
  allowAnyCoachFallback: boolean;
};

type SeatDirectionPreference =
  | "forward_first"
  | "neutral_then_backward"
  | "any_direction";

type LegSeatPreference = {
  direction: "outbound" | "return";
  preference: SeatDirectionPreference;
  allowUnverifiedSeatDirection: boolean;
};
```

These are planned models, not proof that class, coach, seat-map, or direction data will be available.

## 6. Monitoring behavior

The monitoring job assesses all enabled, ranked options only at the next permitted scheduled check. It stores which option matched, source timestamp, confidence, and any unsupported preference. On CAPTCHA, queue, rate limit, or source error it pauses as defined in the security policy.
