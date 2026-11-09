# App Design Document — Product Blueprint

Tài liệu thiết kế sản phẩm Parent-Pal được lưu **nguyên tên file gốc** để dễ tìm và đối chiếu với bản xuất từ ChatGPT.

## Phạm vi
- `Product_Blueprint_03_1_*.md` đến `Product_Blueprint_03_4_*.md`: Blueprint các phần 3.1–3.4.
- `Package_[A-E]_Decision_Log_3_2_APPROVED_PROPOSAL.md`: quyết định A–E ở cấp **đề xuất đã chốt**, chưa áp dụng Inventory.
- `Feature_3_2_Consolidation_Decision_Log_APPROVED.md`: C-Q1–C-Q4 đã chốt; **không có nghĩa canonical 3.2 đã được sửa**.
- `Feature_3_2_Proposed_Canonical_Diff_REVIEW.md`, `Feature_3_2_Scenario_Trace_Matrix_REVIEW.md`: bản **để review**.
- `Scenario_Change_Log_SC-00*.md` và `Scenario_Management_Rules.md`: kịch bản và thay đổi; SC-003 là bản review.
- `Product_Blueprint_Master_Research_Backlog_v1_2.md`: backlog nghiên cứu.
- `Feature_3_2_AI_Routing_Policy_SPEC_DRAFT.md`: policy **draft**, chưa phải yêu cầu triển khai.

## Trạng thái thay đổi
- **Blueprint 3.2 chính thức:** 8 Domains / 49 Groups / 98 L3 minh họa, chưa sửa.
- **Proposed Canonical Diff 3.2:** 8 Domains / 51 Groups / 106 L3 đề xuất, **chưa áp dụng**.
- 3.3 scoring, 3.4 UC coverage, AI Routing, giá, quota và MVP còn phải thẩm định/chốt.
- Các tài liệu ở đây không tự động ghi đè quy tắc hiện hành trong `documents/pal/` và `documents/knowledge/`.

## Quy tắc Git
Thay đổi tài liệu qua branch → PR → chủ sản phẩm review → merge. Không tự merge hay thay đổi baseline khi chưa có quyết định áp dụng rõ ràng.

**Lưu ý:** repository public. Không đưa dữ liệu thật của trẻ, thông tin cá nhân nhạy cảm, token, secret hoặc credential vào Git.
