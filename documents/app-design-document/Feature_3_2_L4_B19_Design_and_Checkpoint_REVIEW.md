# Parent-Pal · Batch 19 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `5af3c5c7a89ecbd491972dfe315f8633ff7306bf`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F06-G01-M01 · Activity Event Log
- F06-G01-M02 · Source Metadata
- F06-G02-M01 · Progress Rules
- F06-G02-M02 · Progress Exceptions
- F06-G03-M01 · Indicator Registry

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F06-G01-M01-record | Authorized producer records a scoped activity event | Event Log owns source key, time, type and immutable provenance ref. E1. | B19-T01. Duplicate source event writes once; changed payload conflicts. |
| CAND-F06-G01-M02-attribute | Consumer gets verified metadata about event source | Source Metadata owns source kind, confidence and receipt. E1. | B19-T02. Self report cannot be represented as verified school or teacher evidence. |
| CAND-F06-G02-M01-calculate | Eligible consumer sees progress calculated under current rule | Progress Rules owns versioned metric expression and evidence scope. E1. | B19-T03. Missing denominator yields UNKNOWN; equal fixture and rule yields identical result. |
| CAND-F06-G02-M02-except | Authorized reviewer records scoped progress exception | Keep rationale, evidence and effective range; preserve base inputs. E1. | B19-T04. Expired exception excluded from new calculation; historical trace stays linked. |
| CAND-F06-G03-M01-register | Reviewer publishes a defined indicator and required evidence | Registry owns metric definition, applicability and effective version. E0. | B19-T05. Conflicting draft version cannot replace active definition without approved publish. |

## Trace and triage

- F06-G01-M01 → pinned inventory → candidate above → B19-T01. Provider guarantees and exact resource classification remain to verify before release.
- F06-G01-M02 → pinned inventory → candidate above → B19-T02. Provider guarantees and exact resource classification remain to verify before release.
- F06-G02-M01 → pinned inventory → candidate above → B19-T03. Provider guarantees and exact resource classification remain to verify before release.
- F06-G02-M02 → pinned inventory → candidate above → B19-T04. Provider guarantees and exact resource classification remain to verify before release.
- F06-G03-M01 → pinned inventory → candidate above → B19-T05. Provider guarantees and exact resource classification remain to verify before release.
- B19-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 5 unique canonical parents, 5 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 23 untouched L3 remain, plus B02 partial slices.
