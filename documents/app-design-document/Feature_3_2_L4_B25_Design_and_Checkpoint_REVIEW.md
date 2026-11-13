# Parent-Pal · Batch 25 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `152bc9e0f74bb22714a7a242a1f7fcf5047c1e80`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F01-G06-M02 · Entitlements & Billing
- F01-G06-M03 · Subscription Billing Lifecycle
- F07-G07-M01 · Operational Console
- F07-G07-M02 · Billing & Cost Operations

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F01-G06-M02-resolve | Consumer gets entitlement from authoritative subscription facts | Entitlements owns scoped projection of verified billing state; no data grants inferred. E0. | B25-T01. Payer active subscription does not permit Journal read. Stale status cannot extend access beyond authorized terms. |
| CAND-F01-G06-M03-reconcile | Authorized actor sees verified subscription charge/refund/restore state | Lifecycle owns provider receipt and idempotency ledger. Verify issuer and ordering. E1. | B25-T02. Duplicate and out-of-order refund notifications do not reinstate or duplicate charge. |
| CAND-F07-G07-M01-operate | Scoped operator reviews and resolves operational issue | Console owns case actions and restricted audit refs; no default child data access. E1. | B25-T03. Support operator opens sensitive case without scope; no content or existence disclosed. |
| CAND-F07-G07-M02-account | Finance operator sees reconciled usage and billing cost | Cost Ops owns aggregated cost ledger, tariff versions, receipts and unknowns. E1. | B25-T04. Usage without invoice remains estimate; duplicate receipt does not increase verified cost. |

## Trace and triage

- F01-G06-M02 → pinned inventory → candidate above → B25-T01. Provider guarantees and exact resource classification remain to verify before release.
- F01-G06-M03 → pinned inventory → candidate above → B25-T02. Provider guarantees and exact resource classification remain to verify before release.
- F07-G07-M01 → pinned inventory → candidate above → B25-T03. Provider guarantees and exact resource classification remain to verify before release.
- F07-G07-M02 → pinned inventory → candidate above → B25-T04. Provider guarantees and exact resource classification remain to verify before release.
- B25-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 4 unique canonical parents, 4 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 0 untouched L3 remain, plus B02 partial slices.
