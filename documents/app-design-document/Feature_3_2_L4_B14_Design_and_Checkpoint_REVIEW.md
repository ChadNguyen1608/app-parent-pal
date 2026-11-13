# Parent-Pal · Batch 14 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `a0a9c64444619362a48c8e1bd7a48a7000b021cc`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F03-G03-M02 · Accessibility Adaptation
- F03-G04-M01 · Goal Discovery
- F03-G04-M02 · Goal Constraints
- F03-G04-M03 · Development Roadmap & Milestones
- F03-G05-M01 · Grounded Recommendation

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F03-G03-M02-adapt | User receives an approved accessible alternative | Adaptation owns presentation choice and supported equivalence; keeps same authority and goal semantics. E1. | B14-T01. Switch format during revoked scope; adapted view cannot expose original content. |
| CAND-F03-G04-M01-discover | Subject records or selects a candidate goal | Discovery owns candidate and source of intent; roadmap owns accepted milestones. E1. | B14-T02. Skip discovery question; no inferred goal or commitment. |
| CAND-F03-G04-M02-evaluate | Planner sees goal feasibility constraints | Constraints records versioned evidence and reason. Mandatory UNKNOWN blocks readiness; draft remains. E1. | B14-T03. Missing capacity data leaves draft available, outcome unverified. |
| CAND-F03-G04-M03-stage | Authorized actor approves versioned development milestones | Roadmap owns goal-to-milestone versions and approval refs. F04 owns schedule. E1. | B14-T04. Replay approval after timeout; exactly one milestone version and no schedule mutation. |
| CAND-F03-G05-M01-recommend | Eligible subject receives sourced optional guidance | Use approved source versions and constraints. E1 rules first; E2 conditional with no unsupported conclusions. | B14-T05. Withdraw grounding during generation. Output is discarded or replaced with approved generic fallback. |

## Trace and triage

- F03-G03-M02 → pinned inventory → candidate above → B14-T01. Provider guarantees and exact resource classification remain to verify before release.
- F03-G04-M01 → pinned inventory → candidate above → B14-T02. Provider guarantees and exact resource classification remain to verify before release.
- F03-G04-M02 → pinned inventory → candidate above → B14-T03. Provider guarantees and exact resource classification remain to verify before release.
- F03-G04-M03 → pinned inventory → candidate above → B14-T04. Provider guarantees and exact resource classification remain to verify before release.
- F03-G05-M01 → pinned inventory → candidate above → B14-T05. Provider guarantees and exact resource classification remain to verify before release.
- B14-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 5 unique canonical parents, 5 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 43 untouched L3 remain, plus B02 partial slices.
