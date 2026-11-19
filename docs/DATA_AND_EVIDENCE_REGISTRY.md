# Data and Evidence Registry

This registry prevents invented, outdated, or unsupported Railway data from entering the product. Every live-data claim must have a dated evidence entry.

## Source register

| Source ID | Official URL | Data fields | Access method | Terms/permission evidence | Rate limit | Last verified | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BR-ETICKET-PUBLIC | `https://eticket.railway.gov.bd/` | Public search-field labels and stated booking sequence | Public JavaScript-rendered landing page | Disclaimer observed but not accepted; integration permission unverified | Not published on landing page | 2026-11-17 | Partial / no integration approval |
| BR-SCHEDULE-PUBLIC | `https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2` | Official Eastern/Western schedule links | Public official page | No extension/API reuse permission found | Not published | 2026-11-17 | Static reference only |
| BR-FARE-EAST | `https://railway.gov.bd/pages/files/69199762933eb65569ddc6b9` | Published Eastern fare-list downloads | Public official file page | No extension/API reuse permission found | Not published | 2026-11-17 | Static reference only |
| BR-TTMS | `https://railway.gov.bd/pages/static-pages/691997af933eb65569dddf3a` | TTMS download listing | Public official page | No public live API/integration permission found | Not published | 2026-11-17 | Not usable as a live source |
| _To be researched_ | — | — | — | — | — | — | Unverified |

## Field reliability register

| Field | Source ID | Reliability | Checked date | Display rule |
| --- | --- | --- | --- | --- |
| Train schedule | BR-SCHEDULE-PUBLIC | Partial / static | 2026-11-17 | Dated reference only; do not display as live |
| Fare | BR-FARE-EAST | Partial / static | 2026-11-17 | Dated reference only; do not display as live |
| Class availability | _TBD_ | Unverified | — | Do not display as live |
| Coach/seat count | _TBD_ | Unverified | — | Do not display unless explicitly reliable |
| Ticket release policy | _TBD_ | Unverified | — | User-configurable only |
| Online advance-sales window | BR-ETICKET-PUBLIC | Partial | 2026-11-17 | Landing page states ten days in advance; do not infer release time |
| Service cancellation/suspension status | _TBD_ | Unverified | — | Do not present as real-time |
| Coach layout/seat orientation | _TBD_ | Unverified | — | Do not label a seat forward/backward |
| Train formation and direction mapping | _TBD_ | Unverified | — | Do not apply seat-direction preference |

Owner-reported operational patterns are recorded separately in `docs/ASSUMPTION_REGISTER.md`; they are not source evidence.

## Evidence-entry standard

For every entry record the official link, access date, quoted/paraphrased permission conclusion, allowed fields, authentication requirement, documented interval/rate rule, and uncertainty. Do not record credentials, cookies, private endpoints, or personal account data.

## UI provenance requirement

Every result must carry source ID, checked timestamp, confidence (`verified`, `partial`, or `unverified`) and status (`available`, `sold_out`, `limited`, `unknown`, `stale`, or `unavailable`). Missing data is never `sold_out`.

Service-status results also require train/service, travel date, affected route/segment, effective period where provided, and source freshness.

See `docs/PHASE0_SOURCE_TERMS_AUDIT_2026-11-17.md` for current source evidence and the live-integration blocker.
