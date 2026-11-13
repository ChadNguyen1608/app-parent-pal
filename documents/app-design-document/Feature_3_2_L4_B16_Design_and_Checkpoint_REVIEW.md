# Parent-Pal · Batch 16 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `b132037ca84cef7252221a09c3d1db60655f49a9`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F04-G01-M02 · Plan Templates
- F04-G02-M01 · Schedule Construction
- F04-G02-M02 · Schedule Conflict
- F04-G03-M01 · Task Ownership
- F04-G03-M02 · Approval Routing

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F04-G01-M02-instantiate | Authorized planner creates a draft from approved template | Template owns version and applicability; clone scoped draft via Plan Structure. E0. | B16-T01. Retired template rejects fresh instantiation; prior draft lineage persists. |
| CAND-F04-G02-M01-construct | Planner builds candidate schedule from current inputs | Own draft arrangement; call conflict and Balanced Planning; Plan Structure commits. E1. | B16-T02. No valid arrangement because of protected cap. Keep draft and reasons; no effective timetable. |
| CAND-F04-G02-M02-detect | Planner receives deterministic conflicts | Compare scoped intervals, versioned time zone and recurrence. E1. | B16-T03. Adjacent intervals pass overlap oracle; intersecting intervals report conflict; ambiguous local time remains UNKNOWN. |
| CAND-F04-G03-M01-assign | Authorized planner records scoped task ownership | Own assignee and responsibility facts; Access Policy owns grants. E1. | B16-T04. Assign to unrelated subject fails; assigning in scope does not grant plan administration. |
| CAND-F04-G03-M02-route | Eligible proposal reaches current approver | Approval Routing resolves current role and scope; CR owns decision and apply. E1. | B16-T05. Handover after enqueue. Former approver cannot decide; route re-evaluates without modifying baseline. |

## Trace and triage

- F04-G01-M02 → pinned inventory → candidate above → B16-T01. Provider guarantees and exact resource classification remain to verify before release.
- F04-G02-M01 → pinned inventory → candidate above → B16-T02. Provider guarantees and exact resource classification remain to verify before release.
- F04-G02-M02 → pinned inventory → candidate above → B16-T03. Provider guarantees and exact resource classification remain to verify before release.
- F04-G03-M01 → pinned inventory → candidate above → B16-T04. Provider guarantees and exact resource classification remain to verify before release.
- F04-G03-M02 → pinned inventory → candidate above → B16-T05. Provider guarantees and exact resource classification remain to verify before release.
- B16-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 5 unique canonical parents, 5 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 34 untouched L3 remain, plus B02 partial slices.
