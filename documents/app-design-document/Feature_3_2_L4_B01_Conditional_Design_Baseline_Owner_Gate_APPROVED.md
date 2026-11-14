# Parent-Pal — Batch 01 Conditional Design Baseline: Owner Gate

**Ngày chốt:** 2026-11-14  
**Trạng thái:** `CONDITIONAL_DESIGN_BASELINE_APPROVED / CONDITIONAL_GO_FOR_NEXT_BATCH_DESIGN`  
**Nguồn quyết định:** Product Owner xác nhận trong hội thoại: “Được, chốt kế hoạch này, bắt đầu triển khai”, sau khi nhận đề xuất phê duyệt baseline có điều kiện và kế hoạch đến Phase 3 System Design.  
**Phạm vi cho phép:** Bắt đầu **lập kế hoạch, chọn đề xuất scope và thiết kế ứng viên L4 Batch 02**; tiếp tục giải quyết backlog Batch 01 song song. Các module cụ thể của Batch 02 vẫn cần Owner xác nhận phạm vi trước khi chính thức phân rã.

## 1. Quyết định được phê duyệt

1. Dùng [Normalized Cross-Module Baseline](Feature_3_2_L4_B01_Normalized_Cross_Module_Baseline_REVIEW.md), [25-entry Registry](Feature_3_2_L4_B01_Normalized_Candidate_Registry_REVIEW.md) và các Decision Logs đã duyệt làm **baseline thiết kế có điều kiện**.
2. Quyết định nghiệp vụ từ 42 Owner Decisions giữ nguyên; nếu hợp đồng phát sinh xung đột phải ghi finding và yêu cầu Owner chốt **chính sách mới** thực sự, không âm thầm sửa.
3. Cho phép lập Batch 02 dependency/scope và cập nhật 3.3 prioritization/3.4 use cases sau khi có bằng chứng L4 phù hợp. Phần 3.5+ chưa tự động chuyển bước nếu chưa thống nhất scope.
4. ChatGPT chịu trách nhiệm thiết kế/triage/GitHub; Claude chỉ là reviewer độc lập **khi có rủi ro đủ lớn**, mặc định 0 sub-agent, tối đa một sub-agent Sonnet 5.5 nếu cần; Product Owner quyết định policy, scope, MVP và gate.
5. Theo dõi toàn bộ vấn đề BI-01..12; không coi bản v3.1 hoặc 46 findings cũ đã được xác minh đóng chỉ nhờ chuẩn hóa baseline.

## 2. Ranh giới KHÔNG được phê duyệt

- Không phải `FINAL_L4_APPROVED`, không cấp stable L4 ID hoặc thay canonical Feature Inventory.
- Không sửa canonical Blueprint 3.2/3.3/3.4 hoặc merge PR #17.
- Không ủy quyền phát triển production, triển khai dữ liệu trẻ thật, chạy thực nghiệm app hoặc bỏ qua legal/safety gates.
- Không mặc nhiên chọn danh sách module Batch 02 từ bốn ví dụ được nhắc trong hội thoại.
- Không tự chốt MVP hoặc tự chuyển sang Phase 3 System Design khi chưa đánh giá readiness.

## 3. Gate tiếp theo

**B02_SCOPE_OWNER_REVIEW:** ChatGPT nộp đề xuất module theo functional/data/permission/safety/operational dependencies, rủi ro và chi phí; Owner xác nhận scope.  
**B02_DESIGN_GATE:** theo từng module, design candidate + AC/test/trace và independent review khi cần.  
**PRODUCT_DESIGN_TO_SYSTEM_DESIGN_GATE:** sau Feature Planning, User Flow, IA/UX/UI phù hợp và handoff coverage.

**State:** `B01_CONDITIONAL_BASELINE_APPROVED`; `B02_PLANNING_AUTHORIZED`; `B02_MODULE_SCOPE_PENDING_OWNER`.
