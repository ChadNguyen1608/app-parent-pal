# PRODUCT BLUEPRINT 3.2 — CONSOLIDATION A–E (BẢN CHUẨN BỊ REVIEW)

**Ngày:** 2026-11-09  
**Trạng thái:** `PRE_REVIEW / NOT_APPLIED`  
**Nguồn:** Feature Inventory 3.2 baseline; Decision Logs Package A, B, C, D và E; SC-001/002; yêu cầu SC-003. Không sửa bất kỳ tài liệu chính thức nào.

## 1. Summary

- Baseline chính thức: **8 Domain / 49 Group / 98 L3** (98 L3 chỉ là baseline 2 module mỗi group, **không phải inventory đầy đủ đã được thẩm định**).
- Tổng thay đổi A–E ở cấp *đề xuất được người dùng chốt*: **+8 L3 / +1 Group**, tạm tính **8 Domain / 50 Group / 106 L3** nếu áp dụng nguyên trạng.
- Phải kiểm tra owner/Group của `F06-G03-M03` Academic Assessment trước khi chốt chính thức (F06-G03 đang tên Development Indicators).
- AI Response & Execution Routing Matrix mới được đề xuất, **chưa được user duyệt**, không tự động tăng L3.
- `MVP` chưa chốt; `L3 Scoring 3.3` chưa hoàn thành; `Use Case Mapping 3.4` chưa đầy đủ, không suy ra đã sẵn sàng triển khai.

## 2. Thay đổi L3 và Group đề xuất

| Package | Action | ID | Trách nhiệm mới |
|---|---|---|---|
| A / CP-01 | ADD | `F03-G04-M03` | Development Roadmap & Milestones |
| A / CP-02 | ADD | `F04-G02-M03` | Balanced Planning Validation; standard bar, protected leisure, seasonal/environment |
| B / CP-06 | ADD | `F06-G03-M03` | Academic Assessment; vị trí Group cần thẩm định |
| C / CP-08 | ADD | `F03-G05-M03` | Career Exploration Guidance |
| D / CP-11 | ADD | `F01-G06-M03` | Subscription Billing Lifecycle |
| D / CP-12 | ADD GROUP | `F08-G06` | Education Finance |
| D / CP-12 | ADD | `F08-G06-M01` | Education Budget Planning |
| D / CP-12 | ADD | `F08-G06-M02` | Expense & Approval Management |
| E / CP-14 | ADD | `F07-G03-M03` | Multimodal Interaction Orchestration |

## 3. Các quy tắc cross-package phải bảo toàn

1. **A:** Family Standard Bar có preset, tùy chỉnh và hard/soft caps; phân loại Primary Activity không đếm trùng time budget, recreation benefit là thuộc tính phụ; thời gian giải trí độc lập; seasonal/weather-aware lên lịch thay vì tự sửa Standard Bar; cause-aware adaptation không tự thay goal.
2. **B:** Assignment vs Submission vs Assessment vs Insights tách nhau; AI homework grading ở pilot; Journal và derivations riêng tư, Safety Escalation có luồng được thẩm định, không mặc định parent access.
3. **C:** Career data có source/provenance; `cached != verified != approved`; child career exploration dùng chung roadmap/tasks; public publishing là conditional, không mặc định MVP; trẻ không bị gán 'hợp nghề' bằng suy luận.
4. **D:** Entitlement ≠ Billing ≠ Marketplace ≠ Education Finance ≠ Wallet; one family subscription with child slots và parent AI đi kèm là mô hình đang nghiên cứu, chưa có biểu giá; người trả phí không đồng nghĩa chủ sở hữu dữ liệu Journal; Wallet hoãn.
5. **E:** AI Voice C (STT/TTS/realtime dài hạn); quota hybrid đã chốt cấu trúc, chưa chốt trị số; notification quyền/channels; support role không mặc định đọc Journal; accessibility theo tuổi và nhu cầu; routing E0/E1/E2/E3 cần policy matrix đầy đủ.

## 4. Các xung đột/điểm cần xác minh khi Consolidation

| ID | Vấn đề | Hành động đề nghị | Trạng thái |
|---|---|---|---|
| CON-01 | `F06-G03` Development Indicators chứa assessment engine liệu đúng Group? | So sánh giữ vị trí vs tạo nhóm Academic Learning & Assessment; kiểm tra 49→50 count nếu bổ sung Group | OPEN |
| CON-02 | `F07-G03-M01` router E0–E3 vs `F07-G03-M03` orchestration modality | Phân định policy routing với STT/TTS/realtime/vision orchestration | OPEN |
| CON-03 | Parent-led AI cost, child-specific quota và family shared pool | Chốt attribution không đồng nghĩa billing, test data/usage | OPEN |
| CON-04 | Knowledge cache freshness/review/consent | Định nghĩa cache types, version, invalidation, no-cache Journal; routing policy | OPEN |
| CON-05 | Safety exception vs quota, notifications và caregiver relations | Tạo test matrix cho tình huống nguy cơ cao; expert validation | OPEN |
| CON-06 | Education Finance vs Premium Billing vs Marketplace | Xác định source of truth cho payment status vs spending entry | OPEN |
| CON-07 | Phân quyền chuyển tuổi trưởng thành 18+ vs lịch sử family data | Thiết kế migration/transition use cases | OPEN |
| CON-08 | Chuyển Scenario SC-003 chưa có log riêng vào traceability | Tạo log sau review, không tự giả là tài liệu chính thức | OPEN |
| CON-09 | Baseline 98 L3 cố ý lấy 2/group, chưa đủ evidence completeness | Validation L3/L4 theo use case, 6 cohorts, operation/risk, not just counts | OPEN |
| CON-10 | Capability routing response policy chưa có acceptance criteria | Quyết định policy owner, rule table, model threshold, fallback và evaluation | OPEN |

## 5. Research Delta dự kiến — chưa thêm vào Master Research Backlog

- Benchmark LLM/voice/vision và chi phí E0–E3 trên use cases trọng điểm; cache hit rate, privacy isolation, invalidation.
- Ngưỡng sức khỏe, thời gian nghỉ/hoạt động và tín hiệu thời tiết theo nhóm tuổi: nguồn và chuyên gia duyệt.
- Academic Assessment Pilot: chất lượng chữ viết tiếng Việt, dạng lỗi, chi phí/đánh giá, đánh giá lại.
- Child safety/consent/notification public publishing; kiểm định chuyên môn và chính sách nền tảng.
- Career taxonomy và thị trường, provenance, expiration, đối chiếu nguồn mâu thuẫn.
- Family Subscription parent-led/child-led economics, tier/slot và khả năng chi trả.
- Education Finance ownership và phạm vi transaction/no-wallet.
- Accessibility cho 6 cohort và người có nhu cầu hỗ trợ khác nhau.

## 6. Quy trình duyệt đề xuất

1. Kiểm tra từng `ADD/EXTEND/REUSE/DEFER` của A–E với baseline; gắn owner và dependency.
2. Xử lý CON-01..10, nhất là vị trí Assessment L3 và AI Routing.
3. Validation bằng scenario/fixture giả lập, sau đó test các điều kiện quyền, nguồn và quyền lợi.
4. Trình diff 3.2 dự kiến và Research Delta cho người dùng duyệt **trước** khi áp dụng.
5. Sau phê duyệt, cập nhật 3.2 và reconcile ảnh hưởng 3.3/3.4 trong một bước có kiểm soát, không thay nội dung chưa chốt.

**Đây là bản chuẩn bị Consolidation, không phải yêu cầu user phải duyệt toàn bộ thay đổi ngay bây giờ.**