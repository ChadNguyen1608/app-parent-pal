# Parent-Pal · Batch 08 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `1095a1441603bd73cb7dd5914dd99a0a644b4b99`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F05-G01-M01 · Child Conversation
- F05-G01-M02 · Companion Guardrails
- F05-G02-M01 · Opt-in Check-in
- F05-G02-M02 · Check-in Controls
- F05-G03-M01 · Reflection Prompts

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F05-G01-M01-assist | Trẻ khởi tạo lượt hội thoại học tập trong purpose đã duyệt | Lưu request ID, scope và provenance tối thiểu. E2 conditional qua router; fallback hướng dẫn đã duyệt. Journal context chỉ khi trẻ chủ động mở và quyền còn hiệu lực. | B08-T01. Lượt hỏi mới không chọn Journal và provider unavailable. Không có Journal context; fallback không tuyên bố đã gọi model. |
| CAND-F05-G01-M02-guard | Hệ thống áp kiểm soát trước khi gửi hoặc hiển thị câu trả lời | Guardrails sở hữu policy evidence theo version, dùng lớp xác định E1 và chỉ dùng model nếu được phê duyệt. Output không vượt policy dù model trả nội dung lệch. | B08-T02. Fixture output khuyến khích phụ thuộc hoặc tự nhận có thẩm quyền. Không phát hành output; fallback giữ thông tin tối thiểu. |
| CAND-F05-G02-M01-offer | Trẻ nhận lời mời check-in tùy chọn | Check-in giữ invitation ref, policy và trạng thái responded/skipped. Không suy diễn cảm xúc từ việc bỏ qua. E1. | B08-T03. Bỏ qua rồi retry cùng event. Một lần skip, không tạo dữ liệu cảm xúc hay phát lại lời mời. |
| CAND-F05-G02-M02-control | Người có quyền điều chỉnh thời điểm và tần suất lời mời | Controls giữ preference/version và điều kiện được phép. Worker recheck khi gửi. Default cụ thể chưa chốt. E1. | B08-T04. Tắt nhắc sau khi enqueue nhưng trước release. Không có nhắc được gửi sau khi tắt có hiệu lực. |
| CAND-F05-G03-M01-prompt | Trẻ chủ động nhận gợi ý phản tư phù hợp | Reflection Prompts sở hữu template ref và version theo mục đích, cohort và nguồn đã duyệt. E1, không dùng Journal cũ làm đầu vào mặc định. | B08-T05. Mở prompt khi không có template phù hợp. Không tự tạo chủ đề từ Journal; hiện lựa chọn bỏ qua. |

## Trace and triage

- F05-G01-M01 → pinned inventory → candidate above → B08-T01. Provider guarantees and exact resource classification remain to verify before release.
- F05-G01-M02 → pinned inventory → candidate above → B08-T02. Provider guarantees and exact resource classification remain to verify before release.
- F05-G02-M01 → pinned inventory → candidate above → B08-T03. Provider guarantees and exact resource classification remain to verify before release.
- F05-G02-M02 → pinned inventory → candidate above → B08-T04. Provider guarantees and exact resource classification remain to verify before release.
- F05-G03-M01 → pinned inventory → candidate above → B08-T05. Provider guarantees and exact resource classification remain to verify before release.
- B08-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 5 unique canonical parents, 5 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 68 untouched L3 remain, plus B02 partial slices.
