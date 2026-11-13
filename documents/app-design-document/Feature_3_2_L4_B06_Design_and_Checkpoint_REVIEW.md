# Parent-Pal · Batch 06 · Ngân sách, đa phương thức và policy evaluation

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED · Synthetic fixtures

Nguồn thiết kế ghim tại `ea1d177ba600ca3fa4e00b99ec777eacdb5856d3`. Inventory 3.2-R1 blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. Xem [manifest B02](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) cho 42 quyết định và baseline. B01-PA-OD-01..04 chi phối mọi xử lý và truy cập. B01-C-OD-07 chi phối audit. P6-AA-OD-04 giữ quota và giá ở trạng thái chưa quyết định. Scope batch lấy từ [queue B04](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md).

- F07-G03-M02 · Execution Budget
- F07-G03-M03 · Multimodal Interaction Orchestration
- F07-G04-M01 · Policy Evaluation

## Permission, classification and cost

Access Policy quyết định cuối cùng theo actor, scope, resource, purpose và version hiện hành. Editorial, reviewer, operator và service grants phải tách theo thao tác. Dữ liệu trẻ thật có legal basis UNKNOWN bị chặn. Không ghi payload riêng tư trong audit. Trước khi gọi provider, xác nhận category, purpose, approval, retention, route và budget. E0/E1 cho state, policy và accounting. Inference E2/E3 chỉ conditional cho task được duyệt. Chi phí, benchmark, ngưỡng và release gates còn UNKNOWN. E0/E1 paths có 0 inference calls.

A0 và A1 dùng caregiver-led hoặc supervised UX trong scope được xác minh; quyền dùng modality riêng vẫn UNKNOWN. A2 dùng hướng dẫn, A3 guided use, A4 subject-led use và A5 verified self-management khi policy cho phép. Mỗi cohort đều nhận phạm vi dữ liệu tối thiểu. Reviewer hoặc provider cần quyền độc lập với cohort. Khi bằng chứng thiếu, dùng workflow thủ công đã được phép hoặc giữ unavailable. Không suy ra quyền từ tuổi.

## Candidates, AC and test oracles

| Temporary candidate | Actor and outcome | Data and interface contract | Acceptance criterion and proposed test |
|---|---|---|---|
| CAND-F07-G03-M02-reserve | Task được phép nhận reservation chi phí có giới hạn | Execution Budget giữ operation ID, tariff version, limit ref và số đã đặt trước. Policy quota chưa chốt; thiếu limit hợp lệ thì chặn tuyến trả phí. | B06-T01. Hai task tranh phần budget chỉ đủ một. Tối đa một reservation thành công; retry không cộng tiền hai lần. |
| CAND-F07-G03-M02-settle | Vận hành đối soát chi phí thực tế và phần chưa rõ | Ghi settle/release bằng receipt. Timeout chưa có receipt giữ outcome unknown; đối soát trước retry. Giữ usage riêng với billing. | B06-T02. Mất response sau provider charge rồi nhận receipt hai lần. Một lần settle; không tự ghi phí lần hai. |
| CAND-F07-G03-M03-select | Người dùng chọn modality hợp lệ và fallback | Orchestration sở hữu modality/session plan; kiểm data class, provider controls và E0–E3 route. Text/manual fallback nếu được phép. | B06-T03. Voice yêu cầu provider chưa xác nhận retention. Không gửi âm thanh; hiển thị fallback văn bản nếu chính sách cho phép. |
| CAND-F07-G03-M03-cancel | Người dùng hủy modality và chặn kết quả muộn | Fence session version khi cancel, loại payload tạm và kết quả muộn theo policy; receipt kỹ thuật không chứa nội dung. | B06-T04. Hủy khi STT đang chạy rồi kết quả đến muộn. Không ghi Journal, không phát lại transcript; cleanup còn thiếu receipt ở trạng thái pending. |
| CAND-F07-G04-M01-evaluate | Reviewer đánh giá một phiên bản policy trên fixture xác định | Policy Evaluation sở hữu evidence run, expected/actual và policy hash; runtime final ALLOW thuộc Access Policy. | B06-T05. Fixture thiếu legal basis nhưng role hợp lệ. Oracle là DENY; nếu engine trả ALLOW thì ghi mismatch theo version. |
| CAND-F07-G04-M01-compare | Reviewer nhận diff quyết định giữa hai phiên bản | So cùng fixture, ghi số case khác và evidence. Thiếu coverage hoặc provenance giữ UNKNOWN; không tự promote. | B06-T06. Policy mới thay đổi outcome ở case revoke. Diff liệt kê đúng ID và hai outcome; trạng thái chính sách production không đổi. |

## Review and issues

Deterministic structural validation: 3 canonical L3 in this group, 6 unique candidate/AC/test rows. Proposed test oracles, zero runtime executions.

- B06-I01 HIGH: prove cost reservation and usage reconciliation against duplicate charges. Commercial quota and pricing await evidence.\n- B06-I02 HIGH: verify transient modality cleanup and provider retention with B04-I03.\n- B06-I03 HIGH: policy fixture coverage requires actual engine versions and denial regression evidence.

Carry BI-05/10 and prior issues. Independent review pending consolidation. Next checkpoint B07. 76 untouched L3 remain, plus B02 partial-slice follow-up.
