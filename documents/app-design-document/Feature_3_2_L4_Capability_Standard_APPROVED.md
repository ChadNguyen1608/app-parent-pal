# PARENT-PAL — Tiêu chuẩn phân rã năng lực thành L4

**Phiên bản:** 1.0 · **Phương pháp:** `OWNER_APPROVED` (M-Q1..06) · **L4 ứng viên:** `REVIEW_ONLY`  
**Nguồn:** `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md`, 3.3, 3.4, L3C-01..07, L3T-01..08, `Feature_3_2_L4_Methodology_Decision_Log_APPROVED.md`.  
**Phạm vi:** 8 domain / 51 group / 106 L3; A0–A5 (0–23 tuổi), trọng tâm lớp 1–9 tại Việt Nam.

## 1. Định nghĩa và nguyên tắc

L4 là **hành vi sản phẩm có thể quan sát và kiểm chứng độc lập**, nằm trong phạm vi trách nhiệm của đúng một L3. Mỗi L4 có một kết quả chính và một owner chuẩn. L4 **không mặc nhiên** là nút bấm, màn hình, endpoint, method trong class, agent, bước workflow hay bảng database. Workflow có thể điều phối nhiều L4 thuộc nhiều L3; một L4 có thể phục vụ nhiều workflow.

- **Tách** khi khác kết quả chính, quyền truy cập/quyền riêng tư quan trọng, owner dữ liệu, chuyển trạng thái, điều kiện phát hành hoặc kinh tế kiểm thử/AI.
- **Gộp** khi khác biệt chỉ nằm ở UI, biến thể nhóm tuổi, API/model hoặc bước kiểm tra/thông báo nội bộ không tạo ra kết quả nghiệp vụ độc lập.
- **Tái sử dụng/chuyển owner** nếu L4 đề xuất trùng trách nhiệm của L3 khác; không tạo nguồn dữ liệu chuẩn thứ hai.

## 2. ID và trạng thái

- L3: `Fxx-Gyy-Mzz`; L4 chính thức: `Fxx-Gyy-Mzz-NNN`. Giữ nguyên ID minh họa đã có và đánh dấu `BASELINE_PROPOSED` cho đến khi review. L4 mới trong pilot dùng `CAND-<L3>-<slug>`, **không phải ID chính thức**.
- `definition_status`: `BASELINE_PROPOSED` / `REVIEWED` / `APPROVED` / `DEFERRED` / `RETIRED`.
- `assessment_status`: `NOT_EVALUATED` / `PROVISIONAL` / `EVIDENCE_BACKED` / `NEEDS_REVIEW`.
- `delivery_status`: `NOT_PLANNED` / `PLANNED` / `IN_PROGRESS` / `RELEASED`.
- `mvp_decision`: `NOT_DECIDED`. Không tự động suy ra trạng thái phê duyệt từ L3.

## 3. Schema L4 tối thiểu

Mỗi L4 phải có: `id, title, parent_module, domain, group, primary_outcome, target_users, user_value, trigger, preconditions, inputs, outputs, primary_data_owner, data_classification, authorization, autonomy_permissions, age_variants, cohort_applicability, main_flow, alternative_flows, failure_recovery, acceptance_criteria, dependencies, execution_type, ai_cost_risk, research_refs, source_trace, review_issues, definition_status, assessment_status, delivery_status, mvp_decision`.

Đây là **tên khóa schema**, được giữ nguyên tiếng Anh để bảo đảm tương thích với tài liệu/automation.

Mỗi bản ghi A0–A5 cần: `applicability` (APPLICABLE/CONDITIONAL/NOT_APPLICABLE/UNKNOWN), `interaction_pattern` (kiểu tương tác), `authorized_actor` (chủ thể có quyền), `approval_actor` (người duyệt), `data_scope` (phạm vi dữ liệu), `alternative_path` (luồng thay thế), `evidence_confidence` (mức tin cậy của bằng chứng). **Mẫu UX không cấp quyền pháp lý.** Chưa rõ quyền thì `UNKNOWN`, không được hiểu là cho phép. A5 là người trưởng thành kiểm soát dữ liệu của mình.

Mỗi phụ thuộc cần: `source_module, target_module, type(F/D/P/S/O), criticality(HARD/SOFT), verification(CONFIRMED/CANDIDATE/REJECTED), required_for(BUILD/TEST/RELEASE/RUN), cohort_scope, reason, evidence_refs, workaround`. Pilot có thể dùng bảng phụ thuộc rút gọn, nhưng phải đánh dấu cạnh chưa xác minh là `CANDIDATE`.

## 4. Bảo mật, AI và nghiệm thu

- **Từ chối mặc định**; kiểm tra quyền **trước khi đọc dữ liệu, suy luận, tra cache hoặc gọi dịch vụ bên ngoài**. Người trả tiền không mặc nhiên được xem dữ liệu riêng tư của trẻ.
- Tách owner dữ liệu: F04 nhận bài ≠ F06-G07 đánh giá ≠ F06-G05 báo cáo; F03 quản lý mục tiêu ≠ F04 lập kế hoạch; F01 policy ≠ F01 consent ledger; F04 kiểm tra cân bằng ≠ F04 phát hiện trùng khung giờ.
- Ưu tiên E0/E1 theo quy tắc xác định; chỉ dùng E2/E3 khi mục đích, quyền dữ liệu, benchmark, fallback và chi phí đã được kiểm chứng. Không tự đặt ngưỡng y tế/giáo dục theo tuổi.
- Test phải có luồng thành công và thất bại, từ chối quyền, đồng ý bị thu hồi/hết hiệu lực, nguồn dữ liệu, thay đổi đồng thời, dữ liệu không đọc được/độ tin cậy thấp, retry/idempotency và các lỗi phù hợp.
- Các cổng `G-Legal`, `G-Privacy`, `G-Safety`, `G-Feasibility`: `PASS / CONDITIONAL / BLOCKED / UNKNOWN`. `UNKNOWN` **không** tương đương `PASS`. Không dùng tài liệu này làm cơ sở duy nhất để pilot trên trẻ thật hoặc phát hành.

## 5. Quy trình P0–P6

| Giai đoạn | Đầu ra | Điều kiện qua cổng |
|---|---|---|
| P0 — Chốt đầu vào | Nguồn, owner và ranh giới L3 | Xác định được owner |
| P1 — Kiểm kê kết quả | Danh sách hành vi và lỗi ứng viên | Mỗi L4 có kết quả chính |
| P2 — Rà soát ranh giới | KEEP/SPLIT/MERGE/REUSE/MOVE | Không trùng owner |
| P3 — Đặc tả | Metadata, 6 cohort, quyền, AI, dữ liệu | Ghi rõ mọi UNKNOWN |
| P4 — Test/truy vết | Liên kết UC/SC/MR, test case giả lập | Có test dương tính và âm tính |
| P5 — Rà soát độc lập | Danh sách vấn đề và quyết định | Các owner rủi ro đã review |
| P6 — Phê duyệt | ID ổn định và bản đề xuất sửa canonical | Có ủy quyền rõ trước khi sửa |

**Wave 0:** F01-G04-M01; F06-G07-M01; F04-G02-M03. Đây là thử nghiệm phương pháp, **không** đại diện cho toàn bộ 106 L3 và chưa phải đánh giá hoàn tất.

**Ngoài phạm vi:** sửa 3.2/3.3/3.4 chính thức, chọn MVP, thay đổi code, merge PR, phê duyệt chính sách hoặc phát hành.
