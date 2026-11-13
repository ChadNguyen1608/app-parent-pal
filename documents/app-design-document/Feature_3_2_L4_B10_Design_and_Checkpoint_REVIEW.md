# Parent-Pal · Batch 10 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `ed5753099b9e25e0ef88900f5c051e8ddc34c251`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F02-G01-M01 · Intake & Updates
- F02-G01-M02 · Incremental Questions
- F02-G02-M01 · Preference Registry
- F02-G02-M02 · Preference Revision
- F02-G03-M01 · Evidence-linked Observations

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F02-G01-M01-intake | Người nhập có quyền xác nhận dữ kiện tối thiểu | Intake sở hữu proposed fact, source, timestamp và evidence version. Upstream Core Identity giữ identity. E1. | B10-T01. Sửa cùng base version từ hai thiết bị. Chỉ một commit, bản còn lại nhận trạng thái cần đối chiếu. |
| CAND-F02-G01-M02-ask | Người dùng nhận câu hỏi bối cảnh có thể bỏ qua | Incremental Questions giữ prompt ref và lý do hỏi theo scope. E1 dùng bộ câu hỏi duyệt; skip không được thay bằng suy luận. | B10-T02. Chọn bỏ qua câu hỏi nhạy cảm. Không tạo dữ kiện, không buộc trả lời để hoàn tất thao tác độc lập. |
| CAND-F02-G02-M01-register | Chủ thể ghi nhận sở thích và nguồn theo thời điểm | Registry sở hữu preference version và phân biệt tự khai, người khác báo và suy luận. E1. | B10-T03. Nhận một tự khai và một suy luận trái nhau. Giữ nguồn riêng, không biến suy luận thành xác nhận. |
| CAND-F02-G02-M02-revise | Chủ thể sửa hoặc bác bỏ sở thích trong scope | Revision chuyển sự kiện đã xác minh sang Registry; invalidate projections liên quan. E1. | B10-T04. Chủ thể bác bỏ một suy luận trong lúc worker dựng hồ sơ. Hồ sơ mới không tái khẳng định suy luận đã bác bỏ. |
| CAND-F02-G03-M01-observe | Người có quyền ghi một quan sát có nguồn và bối cảnh | Evidence-linked Observations giữ hành vi quan sát, thời điểm, nguồn và confidence. E1. Nội dung tự do không được tự nâng thành nhãn. | B10-T05. Quan sát thiếu nguồn và hai nguồn mâu thuẫn. Giữ UNKNOWN hoặc disputed; không trả kết luận chắc chắn. |

## Trace and triage

- F02-G01-M01 → pinned inventory → candidate above → B10-T01. Provider guarantees and exact resource classification remain to verify before release.
- F02-G01-M02 → pinned inventory → candidate above → B10-T02. Provider guarantees and exact resource classification remain to verify before release.
- F02-G02-M01 → pinned inventory → candidate above → B10-T03. Provider guarantees and exact resource classification remain to verify before release.
- F02-G02-M02 → pinned inventory → candidate above → B10-T04. Provider guarantees and exact resource classification remain to verify before release.
- F02-G03-M01 → pinned inventory → candidate above → B10-T05. Provider guarantees and exact resource classification remain to verify before release.
- B10-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 5 unique canonical parents, 5 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 60 untouched L3 remain, plus B02 partial slices.
