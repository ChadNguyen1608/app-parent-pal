# App Design Document — Product Blueprint

**Ngày nhập tài liệu:** 2026-11-09  
**Nguồn:** Product Blueprint và Decision Logs từ quá trình thiết kế ứng dụng hỗ trợ phụ huynh và trẻ.  
**Trạng thái:** **Tài liệu nghiên cứu/thiết kế**, không phải yêu cầu triển khai đã duyệt toàn bộ.

## Cấu trúc

- `blueprint/`: các phần 3.1–3.4 của Product Blueprint (3.2 vẫn là **baseline 98 L3 / 49 groups**).
- `decisions/`: quyết định Package A–E và Consolidation đã **chốt ở cấp đề xuất**, không đồng nghĩa đã áp dụng vào Inventory chính thức.
- `scenarios/`: SC-001, SC-002, SC-003 và quy tắc quản lý tình huống; SC-003 được tổng hợp hồi tố, trạng thái review.
- `reviews/`: coverage audit, AI Routing Policy, Consolidation Review, **Proposed Canonical Diff**, Scenario Trace Matrix; **không phải canonical**.
- `research/`: Master Research Backlog v1.2 và dữ liệu/plan kiểm thử Career Exploration **giả lập**.

## Kiểm soát thay đổi

1. `blueprint/spec-03-2-feature-inventory-baseline.md` là bản **gốc, chưa chỉnh sửa** của Feature Inventory 3.2.
2. Bản đề xuất `reviews/ref-03-2-proposed-canonical-diff.md` có đích **8 Domains / 51 Groups / 106 L3**, nhưng **CHƯA áp dụng**.
3. Không suy diễn rằng các L4 minh họa, pricing, AI routing TTL, safety thresholds hoặc MVP đã được phê duyệt.
4. Mọi thay đổi sau này nên dùng branch riêng, PR và commit, có changelog, cập nhật status, trace CP/CON/SC.
5. Không tự động sửa tài liệu hiện có tại `documents/app/`, `documents/knowledge/`, `documents/pal/` hoặc code app.
6. **Repo public:** không commit thông tin nhận dạng trẻ thật, hồ sơ riêng tư, credential, token, ảnh/giọng nói người dùng.

## Ranh giới với tài liệu Parent-Pal hiện có

Thư mục này lưu **Product Blueprint nghiên cứu** từ một luồng thiết kế riêng; một số quy tắc/kiến trúc có thể chưa trùng với `documents/pal/` hoặc `documents/knowledge/`. Không coi nội dung ở đây tự động thay thế các quy tắc hiện hành của Pal. Các khác biệt cần được review và chốt trước khi chuyển thành requirement triển khai.

## Quy ước file và provenance

File được đặt tên chữ thường, gạch ngang, tiền tố `spec-`/`ref-` theo quy ước repo. Nội dung Markdown/JSON được **sao chép từ bản nguồn**, không âm thầm sửa nội dung chỉ để đồng bộ với tài liệu repo. Để truy nguyên, xem bảng đối chiếu:

| File trong thư mục | File nguồn |
|---|---|
| `blueprint/spec-03-1-nhom-tinh-nang.md` | `Product_Blueprint_03_1_Feature_Domains.md` |
| `blueprint/ref-03-1-research-backlog.md` | `Product_Blueprint_03_1_Feature_Domains_Research_Backlog.md` |
| `blueprint/spec-03-2-feature-inventory-baseline.md` | `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md` |
| `blueprint/spec-03-3-feature-prioritization.md` | `Product_Blueprint_03_3_Feature_Prioritization_and_Dependency_Mapping.md` |
| `blueprint/spec-03-4-use-case-mapping.md` | `Product_Blueprint_03_4_Feature_Interaction_and_Use_Case_Mapping.md` |
| `research/ref-master-research-backlog-v1-2.md` | `Product_Blueprint_Master_Research_Backlog_v1_2.md` |
| `scenarios/ref-scenario-management-rules.md` | `Scenario_Management_Rules.md` |
| `scenarios/ref-sc-001.md` | `Scenario_Change_Log_SC-001.md` |
| `scenarios/ref-sc-002.md` | `Scenario_Change_Log_SC-002.md` |
| `scenarios/ref-sc-003-review.md` | `Scenario_Change_Log_SC-003_REVIEW.md` |
| `decisions/spec-package-a.md` | `Package_A_Decision_Log_3_2_APPROVED_PROPOSAL.md` |
| `decisions/spec-package-b.md` | `Package_B_Decision_Log_3_2_APPROVED_PROPOSAL.md` |
| `decisions/spec-package-c.md` | `Package_C_Decision_Log_3_2_APPROVED_PROPOSAL.md` |
| `decisions/spec-package-d.md` | `Package_D_Decision_Log_3_2_APPROVED_PROPOSAL.md` |
| `decisions/spec-package-e.md` | `Package_E_Decision_Log_3_2_APPROVED_PROPOSAL.md` |
| `decisions/spec-consolidation.md` | `Feature_3_2_Consolidation_Decision_Log_APPROVED.md` |
| `reviews/ref-03-2-coverage-audit.md` | `Feature_3_2_Bao_Cao_Ra_Soat_va_De_Xuat_Thay_Doi_BAN_REVIEW_TV.md` |
| `reviews/ref-03-2-consolidation-pre-review.md` | `Feature_3_2_Consolidation_A-E_PRE_REVIEW.md` |
| `reviews/ref-03-2-consolidation-review.md` | `Feature_3_2_Consolidation_Review_A-E_V1.md` |
| `reviews/ref-03-2-ai-routing-policy-draft.md` | `Feature_3_2_AI_Routing_Policy_SPEC_DRAFT.md` |
| `reviews/ref-03-2-proposed-canonical-diff.md` | `Feature_3_2_Proposed_Canonical_Diff_REVIEW.md` |
| `reviews/ref-03-2-scenario-trace-matrix.md` | `Feature_3_2_Scenario_Trace_Matrix_REVIEW.md` |
| `research/ref-career-test-plan-review.md` | `Package_C_Career_Test_Plan_REVIEW.md` |
| `research/ref-career-test-fixture-synthetic.json` | `Package_C_Career_Test_Fixture_SYNTHETIC.json` |

**Chưa nhập:** các bản backlog cũ trùng lặp, bản audit tiếng Anh trùng mục đích, file ZIP, hoặc tài liệu ngoài phạm vi Stage 3.
