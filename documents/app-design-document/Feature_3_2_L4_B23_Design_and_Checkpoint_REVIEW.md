# Parent-Pal · Batch 23 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `453daf8b632fdc6dce5e63ae43fb8f54bbaf2958`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F08-G03-M02 · Resource Matching
- F08-G04-M01 · Device Consents
- F08-G04-M02 · External Data Import
- F08-G05-M01 · Commerce Catalog

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F08-G03-M02-match | Eligible user receives explainable scoped resource matches | Matching uses approved listings and optional authorized preferences. E1 first; no undisclosed commerce influence. | B23-T01. Missing preference leaves broad matches; commercial signal cannot silently override stated relevance. |
| CAND-F08-G04-M01-consent | Eligible actor grants or withdraws scoped device connection | Own connection policy ref and revocation epoch; Consent Ledger remains evidence authority. E1. | B23-T02. Withdrawal fences future import and queued requests; no blanket permissions inferred. |
| CAND-F08-G04-M02-import | Worker stages authorized external data with source | Own staged payload metadata, scope, source and idempotency key; canonical data promoted by owner. E1. | B23-T03. Duplicate event stages once; source revoked before commit yields no new staged data. |
| CAND-F08-G05-M01-catalog | User views current commercial listing with disclosure | Catalog owns offer version, merchant ref and sponsorship marker. E0. | B23-T04. Expired price remains unavailable; sponsorship displayed with eligible listing. |

## Trace and triage

- F08-G03-M02 → pinned inventory → candidate above → B23-T01. Provider guarantees and exact resource classification remain to verify before release.
- F08-G04-M01 → pinned inventory → candidate above → B23-T02. Provider guarantees and exact resource classification remain to verify before release.
- F08-G04-M02 → pinned inventory → candidate above → B23-T03. Provider guarantees and exact resource classification remain to verify before release.
- F08-G05-M01 → pinned inventory → candidate above → B23-T04. Provider guarantees and exact resource classification remain to verify before release.
- B23-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 4 unique canonical parents, 4 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 7 untouched L3 remain, plus B02 partial slices.
