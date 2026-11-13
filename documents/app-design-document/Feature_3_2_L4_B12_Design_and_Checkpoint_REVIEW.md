# Parent-Pal · Batch 12 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `6e68660a92fa0f79edd5099ffec921fc2015c6be`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F02-G05-M02 · Child Feedback
- F02-G06-M01 · Provenance
- F02-G06-M02 · Correction & Confidence

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F02-G05-M02-respond | Trẻ đủ điều kiện phản hồi về dữ kiện hoặc diễn giải của mình | Child Feedback giữ feedback ref, target version và trạng thái. Không buộc trẻ chọn đồng ý với suy luận để tiếp tục. E1. | B12-T01. Gửi phản hồi cho hồ sơ v1 sau khi v2 có hiệu lực. Giữ phản hồi trỏ v1, không áp ngầm lên v2. |
| CAND-F02-G06-M01-attribute | Consumer có quyền thấy dữ kiện kèm loại nguồn và mức xác nhận | Provenance giữ source type, evidence ref và version; nguồn đã thu hồi mất khả năng dùng. E1. | B12-T02. Một báo cáo phụ huynh và một suy luận cùng trường. Projection phân biệt hai loại, không hợp nhất thành sự thật đã xác minh. |
| CAND-F02-G06-M02-resolve | Reviewer xử lý bất đồng và cập nhật mức tin cậy có lý do | Correction & Confidence sở hữu disposition, evidence refs và correction version. Domain nguồn thực hiện cập nhật. E1. | B12-T03. Reviewer mất quyền trước commit và một reviewer hợp lệ giải quyết sau đó. Chỉ quyết định có quyền được ghi; cache cũ bị fence. |

## Trace and triage

- F02-G05-M02 → pinned inventory → candidate above → B12-T01. Provider guarantees and exact resource classification remain to verify before release.
- F02-G06-M01 → pinned inventory → candidate above → B12-T02. Provider guarantees and exact resource classification remain to verify before release.
- F02-G06-M02 → pinned inventory → candidate above → B12-T03. Provider guarantees and exact resource classification remain to verify before release.
- B12-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 3 unique canonical parents, 3 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 53 untouched L3 remain, plus B02 partial slices.

## Additional acceptance criteria · authorization, concurrency and recovery

For each synthetic fixture, inspect the authorized response and relevant durable state, including downstream release, worker receipts and versions where applicable. Use A0–A1 caregiver/supervised, A2 guided, A3–A4 subject-led where eligible, and A5 verified self-managed adult as applicable. For private child data, compare an authorized actor, an unrelated household and an actor with revoked scope. An age group supplies no permission. A denied response must omit protected contents, identifiers and counts. All tests are proposed.

| Candidate | Prior oracle | Additional oracle |
|---|---|---|
| CAND-F02-G05-M02-respond | B12-T01 | B12-X01. Retry phản hồi cùng key nhưng khác payload: báo conflict, không đổi phản hồi gốc. |
| CAND-F02-G06-M01-attribute | B12-T02 | B12-X02. Nguồn đã rút khỏi scope: không lộ source ref qua provenance projection. |
| CAND-F02-G06-M02-resolve | B12-T03 | B12-X03. Bằng chứng xung đột sau khi review bắt đầu: bắt buộc đánh giá lại ở version mới. |
