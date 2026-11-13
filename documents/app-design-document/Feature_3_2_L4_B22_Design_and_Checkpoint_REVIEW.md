# Parent-Pal · Batch 22 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `ea4987e0b370c652d3094b529da6f7fb8671fb38`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F08-G01-M01 · School Data Connectors
- F08-G01-M02 · School Data Review
- F08-G02-M01 · Expert Discovery
- F08-G02-M02 · Expert Referral
- F08-G03-M01 · Activity Directory

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F08-G01-M01-connect | Eligible actor authorizes a scoped school connection | Connector owns consent/connection reference, purpose and version. External processing conditional. E1. | B22-T01. Revoke while queued fetch waits; connector makes no new fetch. |
| CAND-F08-G01-M02-review | Authorized subject reviews imported school facts before promotion | School Data Review owns staging and disposition; canonical data owner consumes approved version. E1. | B22-T02. Conflicting import remains staged; never overwrites verified record. |
| CAND-F08-G02-M01-discover | User views verified expert directory data | Discovery owns directory projection and qualification provenance. E1. | B22-T03. Expired verification is visibly uncertain or excluded per policy; no endorsement inferred. |
| CAND-F08-G02-M02-refer | Eligible subject explicitly requests scoped referral | Own referral request, destination, allowlisted payload and receipt. E1. | B22-T04. Revoke before disclosure. Third party receives nothing; valid replay sends once. |
| CAND-F08-G03-M01-list | User sees current eligible activities from approved sources | Directory owns listing provenance and validity. E0. | B22-T05. Expired listing and wrong audience excluded; no child data sent to provider. |

## Trace and triage

- F08-G01-M01 → pinned inventory → candidate above → B22-T01. Provider guarantees and exact resource classification remain to verify before release.
- F08-G01-M02 → pinned inventory → candidate above → B22-T02. Provider guarantees and exact resource classification remain to verify before release.
- F08-G02-M01 → pinned inventory → candidate above → B22-T03. Provider guarantees and exact resource classification remain to verify before release.
- F08-G02-M02 → pinned inventory → candidate above → B22-T04. Provider guarantees and exact resource classification remain to verify before release.
- F08-G03-M01 → pinned inventory → candidate above → B22-T05. Provider guarantees and exact resource classification remain to verify before release.
- B22-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 5 unique canonical parents, 5 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 11 untouched L3 remain, plus B02 partial slices.
