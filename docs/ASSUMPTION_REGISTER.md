# Assumption Register

This register holds owner-provided operational knowledge that is useful for design but has not yet been independently verified. An assumption must never silently become a verified live-data fact.

| ID | Assumption | Scope | Status | Product treatment |
| --- | --- | --- | --- | --- |
| SEAT-001 | On the owner’s Dhaka → Mymensingh journey pattern, seats `1–30` are normally backward-facing and seats `31+` are normally forward-facing. On Mymensingh → Dhaka or Dewanganj → Dhaka return patterns, seats `1–30` are normally forward-facing and seats `31+` are normally backward-facing. | Specific train service, class, coach, and formation still unknown | Owner-provided, unverified | Optional tentative sort only; never show as verified direction |

## Scope still to verify for SEAT-001

The seat boundary is confirmed as `1–30 / 31+`. Before implementation, identify the exact train service, travel date pattern, class, and coach types to which it applies. A different formation, coach layout, or service may use a different orientation.

## Promotion rule

An assumption becomes `verified` only after source evidence or repeatable real-world test evidence identifies train/service, journey direction, coach, seat range, date/version, and result. Until then users must see `Tentative owner preference — not verified`.
