# Parent-Pal · Batch 20 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `c8a4f019a0252cf2379d55dab32eca8144b608ef`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F06-G03-M02 · Indicator Evidence
- F06-G04-M01 · Deterministic Trends
- F06-G04-M02 · Cautious Insights
- F06-G05-M01 · Audience Views

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F06-G03-M02-qualify | Consumer gets scoped evidence quality for an indicator | Indicator Evidence owns evidence projection and insufficiency flags. E1. | B20-T01. Two low-confidence records do not become verified by duplication. |
| CAND-F06-G04-M01-trend | Eligible viewer sees reproducible trend from comparable data | Version metric/window, coverage and source refs. E1. | B20-T02. Missing period yields explicit gap and no invented observation. |
| CAND-F06-G04-M02-interpret | Eligible viewer sees bounded interpretation with uncertainty | Use deterministic summary first, E2 conditional. Track source and confidence, no diagnosis. E1/E2. | B20-T03. Conflicting trend evidence yields uncertain interpretation or abstention. |
| CAND-F06-G05-M01-project | Actor sees audience-specific authorized report fields | Audience Views owns projection definition; Access Policy gates each field and release. E0. | B20-T04. Supporter loses grant during export; cached view does not disclose restricted field. |

## Trace and triage

- F06-G03-M02 → pinned inventory → candidate above → B20-T01. Provider guarantees and exact resource classification remain to verify before release.
- F06-G04-M01 → pinned inventory → candidate above → B20-T02. Provider guarantees and exact resource classification remain to verify before release.
- F06-G04-M02 → pinned inventory → candidate above → B20-T03. Provider guarantees and exact resource classification remain to verify before release.
- F06-G05-M01 → pinned inventory → candidate above → B20-T04. Provider guarantees and exact resource classification remain to verify before release.
- B20-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 4 unique canonical parents, 4 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 19 untouched L3 remain, plus B02 partial slices.
