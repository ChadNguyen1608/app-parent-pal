# Parent-Pal · Batch 18 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `0eafe805c6b9befe486967be0c63ff85fb5dba0b`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F04-G05-M02 · Evidence Submission
- F04-G07-M01 · Schedule Notifications
- F04-G07-M02 · Notification Preferences

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F04-G05-M02-submit | Eligible student submits permitted evidence for a task | Own submission ref, version, provenance and status. F06 owns assessment. E1. | B18-T01. Resubmission becomes new version; prior submission remains historical; no PARENT_CONFIRMED inferred. |
| CAND-F04-G07-M01-deliver | Worker sends authorized schedule reminder once | Use current plan/version, preference and recipient scope. E1. Minimize notification content. | B18-T02. Task moved or permission revoked before send. Drop stale reminder; retry valid send at most once. |
| CAND-F04-G07-M02-configure | Eligible recipient changes allowed reminder settings | Preferences owns channel/time/category settings and version. E0. | B18-T03. Opt-out races queued job. Worker sees new preference and suppresses release. |

## Trace and triage

- F04-G05-M02 → pinned inventory → candidate above → B18-T01. Provider guarantees and exact resource classification remain to verify before release.
- F04-G07-M01 → pinned inventory → candidate above → B18-T02. Provider guarantees and exact resource classification remain to verify before release.
- F04-G07-M02 → pinned inventory → candidate above → B18-T03. Provider guarantees and exact resource classification remain to verify before release.
- B18-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 3 unique canonical parents, 3 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 28 untouched L3 remain, plus B02 partial slices.
