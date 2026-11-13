# Parent-Pal · Batch 24 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `78c227ca282f3d1a1f0d5989381e74677b99baff`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F08-G05-M02 · Transaction & Conflict Controls
- F08-G06-M01 · Education Budget Planning
- F08-G06-M02 · Expense & Approval Management

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F08-G05-M02-control | Authorized purchaser receives consistent transaction and conflict status | Own scoped transaction intent, disclosure, conflict checks and external receipt. Terms/payment integrations remain conditional. E1. | B24-T01. Timeout after provider acceptance requires reconciliation; replay cannot charge twice. |
| CAND-F08-G06-M01-plan | Eligible household actor creates education budget scenario | Budget Planning owns scoped scenario and version; no execution or spend implied. E0. | B24-T02. Edit scenarios concurrently; stale version cannot overwrite active scenario. |
| CAND-F08-G06-M02-approve | Authorized actor records expense approval within scope | Own expense intent, approver and state; payment evidence separate. E1. | B24-T03. Observer or stale approver denied, approved expense does not claim paid. |

## Trace and triage

- F08-G05-M02 → pinned inventory → candidate above → B24-T01. Provider guarantees and exact resource classification remain to verify before release.
- F08-G06-M01 → pinned inventory → candidate above → B24-T02. Provider guarantees and exact resource classification remain to verify before release.
- F08-G06-M02 → pinned inventory → candidate above → B24-T03. Provider guarantees and exact resource classification remain to verify before release.
- B24-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 3 unique canonical parents, 3 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 4 untouched L3 remain, plus B02 partial slices.

## Additional acceptance criteria · authorization, concurrency and recovery

For each synthetic fixture, inspect the authorized response and relevant durable state, including downstream release, worker receipts and versions where applicable. Use A0–A1 caregiver/supervised, A2 guided, A3–A4 subject-led where eligible, and A5 verified self-managed adult as applicable. For private child data, compare an authorized actor, an unrelated household and an actor with revoked scope. An age group supplies no permission. A denied response must omit protected contents, identifiers and counts. All tests are proposed.

| Candidate | Prior oracle | Additional oracle |
|---|---|---|
| CAND-F08-G05-M02-control | B24-T01 | B24-X01. Receipt chưa xác nhận sau timeout: không thu lại hoặc báo thành công. |
| CAND-F08-G06-M01-plan | B24-T02 | B24-X02. Actor mất quyền khi đang lưu scenario: version hiện hành giữ nguyên. |
| CAND-F08-G06-M02-approve | B24-T03 | B24-X03. Approval và refund đến đảo thứ tự: trạng thái paid cần receipt đúng; không suy ra từ approval. |
