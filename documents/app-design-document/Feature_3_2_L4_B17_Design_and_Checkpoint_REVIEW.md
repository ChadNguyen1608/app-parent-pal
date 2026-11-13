# Parent-Pal · Batch 17 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `49fde9e946d5f68450a1cafc73cd488d2e433f67`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F04-G04-M01 · Daily Task View
- F04-G04-M02 · Execution Support
- F04-G05-M01 · Lightweight Check-off

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F04-G04-M01-view | Eligible actor sees their scoped daily tasks | Daily View owns projection over committed schedule and current permissions. E0. | B17-T01. Remove grant between cursor issuance and release. No stale task or counts. |
| CAND-F04-G04-M02-support | Child requests bounded assistance while executing task | Execution Support provides approved steps, E1 first and E2 conditional. Assessment hints follow P6-AA-OD-02. No mutation. | B17-T02. Ask for direct homework answer in hint flow. Provide permitted hint or fallback; no plan change. |
| CAND-F04-G05-M01-check | Eligible actor records a task completion claim | Check-off owns lightweight claim and source, not assessment. E1. | B17-T03. Duplicate offline sync creates one claim; revoked authorization denies subsequent sync. |

## Trace and triage

- F04-G04-M01 → pinned inventory → candidate above → B17-T01. Provider guarantees and exact resource classification remain to verify before release.
- F04-G04-M02 → pinned inventory → candidate above → B17-T02. Provider guarantees and exact resource classification remain to verify before release.
- F04-G05-M01 → pinned inventory → candidate above → B17-T03. Provider guarantees and exact resource classification remain to verify before release.
- B17-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 3 unique canonical parents, 3 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 31 untouched L3 remain, plus B02 partial slices.
