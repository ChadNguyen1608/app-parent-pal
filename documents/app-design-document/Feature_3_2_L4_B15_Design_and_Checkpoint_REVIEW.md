# Parent-Pal · Batch 15 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `36bfc471ee8732ce60744880c84cf3f779514559`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F03-G05-M02 · Recommendation Review
- F03-G05-M03 · Career Exploration Guidance
- F03-G06-M01 · Goal Reassessment
- F03-G06-M02 · Goal Change Proposal

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F03-G05-M02-review | Authorized reviewer accepts or rejects a recommendation for presentation | Review owns decision/version, evidence and reasons; no automatic goal commit. E1. | B15-T01. Recommendation changed after review; new version cannot reuse approval. |
| CAND-F03-G05-M03-explore | Eligible subject compares sourced education or career options | Provide versioned options and limitations. E1 first, E2 conditional. No deterministic suitability labels. | B15-T02. Sparse profile plus outdated source yields limited exploration and explicit gaps, no ranking from unsupported facts. |
| CAND-F03-G06-M01-reassess | Subject reviews goal progress and continued fit | Reassessment owns dated review and evidence refs. Insufficient signals stay UNKNOWN. E1. | B15-T03. Stale progress evidence does not mark goal failed or trigger automatic change. |
| CAND-F03-G06-M02-propose | Authorized actor proposes goal change | Own proposal and base goal version; roadmap owns commit. E1. | B15-T04. Concurrent goal replacement invalidates stale proposal; no effective mutation from proposal alone. |

## Trace and triage

- F03-G05-M02 → pinned inventory → candidate above → B15-T01. Provider guarantees and exact resource classification remain to verify before release.
- F03-G05-M03 → pinned inventory → candidate above → B15-T02. Provider guarantees and exact resource classification remain to verify before release.
- F03-G06-M01 → pinned inventory → candidate above → B15-T03. Provider guarantees and exact resource classification remain to verify before release.
- F03-G06-M02 → pinned inventory → candidate above → B15-T04. Provider guarantees and exact resource classification remain to verify before release.
- B15-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 4 unique canonical parents, 4 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 39 untouched L3 remain, plus B02 partial slices.
