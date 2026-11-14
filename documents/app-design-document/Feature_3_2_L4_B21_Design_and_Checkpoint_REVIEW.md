# Parent-Pal · Batch 21 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `7d960244c22fbba9b6e3f22479251dc976662664`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F06-G05-M02 · Summary Rendering
- F06-G06-M01 · Review Sessions
- F06-G06-M02 · Feedback Handoff

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F06-G05-M02-render | Authorized audience receives a versioned scoped summary | Summary owns layout and source manifest, E1 default. Recheck lineage and access before release. | B21-T01. Revoked Journal derivative among inputs does not appear or change count visible to unauthorized audience. |
| CAND-F06-G06-M01-record | Eligible participant records review outcome | Review Sessions owns agenda and scoped outcome provenance. E1. Proposed changes remain proposals. | B21-T02. Repeat submit after timeout; one outcome and no effective plan change. |
| CAND-F06-G06-M02-handoff | Authorized feedback reaches proper domain owner | Feedback Handoff stores scoped dispatch and receipt; goal/plan/profile domains decide changes. E1. | B21-T03. Duplicate or stale target delivery produces no automatic mutation; route to reassessment. |

## Trace and triage

- F06-G05-M02 → pinned inventory → candidate above → B21-T01. Provider guarantees and exact resource classification remain to verify before release.
- F06-G06-M01 → pinned inventory → candidate above → B21-T02. Provider guarantees and exact resource classification remain to verify before release.
- F06-G06-M02 → pinned inventory → candidate above → B21-T03. Provider guarantees and exact resource classification remain to verify before release.
- B21-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 3 unique canonical parents, 3 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 16 untouched L3 remain, plus B02 partial slices.

## Additional acceptance criteria · authorization, concurrency and recovery

For each synthetic fixture, inspect the authorized response and relevant durable state, including downstream release, worker receipts and versions where applicable. Use A0–A1 caregiver/supervised, A2 guided, A3–A4 subject-led where eligible, and A5 verified self-managed adult as applicable. For private child data, compare an authorized actor, an unrelated household and an actor with revoked scope. An age group supplies no permission. A denied response must omit protected contents, identifiers and counts. All tests are proposed.

| Candidate | Prior oracle | Additional oracle |
|---|---|---|
| CAND-F06-G05-M02-render | B21-T01 | B21-X01. Report đã render trước khi root Journal bị xóa: hủy artifact trước release. |
| CAND-F06-G06-M01-record | B21-T02 | B21-X02. Handover trong lúc lưu biên bản: actor cũ không thể commit sau khi mất quyền. |
| CAND-F06-G06-M02-handoff | B21-T03 | B21-X03. Consumer nhận cùng receipt hai lần: không nhân đôi phản hồi hoặc ghi lịch. |
