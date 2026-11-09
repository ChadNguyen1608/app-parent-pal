# PRODUCT BLUEPRINT 3.2 — CONSOLIDATION REVIEW A–E

**Phiên bản:** 1.0 — 2026-11-09  
**Trạng thái:** `REVIEW_ONLY / USER_APPROVAL_REQUIRED`  
**Không chỉnh sửa:** `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md`, 3.3, 3.4, Master Research Backlog, hay Scenario Change Logs.  
**Nguồn đối chiếu:** Baseline 3.2 (8 Domains, 49 Groups, 98 L3 mẫu, 2/group); Decision Log A, B, C, D, E; Consolidation A–E Pre-Review.

## I. Kết quả kiểm tra cấu trúc

- Toàn bộ **24 CP (CP-01 đến CP-24)** đã được phân vào 5 package A–E và được chốt ở cấp *đề xuất*. Mức duyệt này **không** chứng nhận đầy đủ tính năng L4, usability, nghiên cứu, pháp lý hoặc MVP.
- **8 L3 được đề xuất thêm**: `F03-G04-M03`, `F04-G02-M03`, `F06-G03-M03`, `F03-G05-M03`, `F01-G06-M03`, `F08-G06-M01`, `F08-G06-M02`, `F07-G03-M03`.
- **1 L2 Group được đề xuất thêm**: `F08-G06` — Education Finance.
- Tính cộng dồn nếu giữ nguyên đề xuất: **8 Domains / 50 Groups / 106 L3**. Đây chưa phải một inventory phân rã đầy đủ: baseline 98 L3 vốn được lấy cơ học bằng cách gán hai ví dụ cho mỗi group.
- Cần quyết định **CON-01** về vị trí Academic Assessment trước khi tạo canonical diff. Một phương án khác làm tăng Group từ 50 lên 51 nhưng **không tăng thêm L3 so với 106**, do chuyển vị trí module đề xuất, không nhân đôi module.

## II. ADD Map và đề xuất disposition

| CP | ID đề xuất đã chốt | Status audit | Owner / dependency | Kết luận |
|---|---|---|---|---|
| 01 | `F03-G04-M03` Roadmap & Milestones | FIT | F03 owns goal/roadmap; F04 executes | KEEP ADD |
| 02 | `F04-G02-M03` Balanced Planning Validation | FIT | Standard Bar; activity load, protected leisure, seasonal/weather context | KEEP ADD; tách safety hard gates |
| 06 | `F06-G03-M03` Academic Assessment | **STRUCTURAL TENSION** | F06-G03 là Development Indicators, trong khi đánh giá bài là một workflow | HOLD ID pending decision CON-01 |
| 08 | `F03-G05-M03` Career Exploration Guidance | FIT WITH DATA BOUNDARY | F03 guidance; F07 sources; F04 tasks | KEEP ADD |
| 11 | `F01-G06-M03` Subscription Billing Lifecycle | FIT WITH BOUNDARY | F01 subscription state; payment provider trusted event; F07 operations | KEEP ADD |
| 12 | `F08-G06-M01` Education Budget Planning | FIT | F08 budget, not payment | KEEP ADD (new group) |
| 12 | `F08-G06-M02` Expense & Approval Management | FIT | F01 permissions; expenses not wallet | KEEP ADD |
| 14 | `F07-G03-M03` Multimodal Interaction Orchestration | FIT IF LIMITED | STT/TTS/realtime/vision; must not duplicate AI task router | KEEP ADD with boundary |

## III. CON-01 — Academic Assessment ownership (cần phê duyệt)

**Baseline:** `F06-G03` có tên `Development Indicators` gồm `M01 Indicator Registry`, `M02 Indicator Evidence`. `F06-G03-M03 Academic Assessment` vừa tạo/đánh giá result, khác với phân tích chỉ báo.

| Phương án | Thiết kế | Ưu điểm | Tradeoff | Cơ cấu dự kiến |
|---|---|---|---|---|
| A — **Khuyến nghị** | Tạo `F06-G07 Academic Learning Assessment`, chuyển **đề xuất chưa ban hành** `F06-G03-M03` thành `F06-G07-M01`; `F06-G03` vẫn sở hữu indicators, F06-G04 trends | Ranh giới logic rõ; dễ bổ sung rubric, review, nhiều loại bài | Thêm một L2 Group; cần cập nhật mapping trong Decision Log bằng `supersedes_proposed_id` khi duyệt | **8 / 51 / 106** |
| B — Ít thay đổi | Giữ `F06-G03-M03`, mở rộng tiêu đề/phạm vi F06-G03 bao gồm Assessment | Giữ **8 / 50 / 106**, ít điều chỉnh ID | Nhóm rộng, ghép workflow chấm bài với danh mục indicator; về lâu dài khó phân định | **8 / 50 / 106** |

**Khuyến nghị kỹ thuật:** A. Vì `F06-G03-M03` mới là **ID đề xuất**, chưa phát hành vào Inventory chính thức, có thể điều chỉnh trước khi ban hành; ghi trace `original_proposal_id=F06-G03-M03`, `canonical_candidate_id=F06-G07-M01`, **không áp dụng tự động**. Không nhân đôi `F06-G03-M03` và `F06-G07-M01`.

## IV. CON-02/04/10 — AI Routing & Cache ownership

1. `F07-G03-M01` **Task/Execution Router**: xác định intent, purpose, quyền, E0–E3, versioned policy và fallback.
2. `F07-G03-M02` **Execution Budget**: hạn mức theo Family/Child/Capability/Modality, model budget, rate limit, cost policy; không quyết định ai có quyền xem Journal.
3. `F07-G03-M03` **Multimodal Orchestrator**: STT, TTS, realtime voice, image-adapter, transient processing; **không** làm nhiệm vụ chọn giữa SQL/Rules/LLM hay cấp quyền dữ liệu.
4. `F07-G01/G02` **Knowledge Governance**: nguồn, provenance, approved/reviewed status, version/freshness, invalidation; caching không thay thế thẩm định nguồn.
5. `F07-G04-M01/M02` **Policy & Evaluation**: safety/privacy/model output quality trước và sau xử lý, bao gồm fallback khi không đủ căn cứ.
6. `F07-G07-M02` **Usage Operations**: quan sát chi phí theo actor/beneficiary/capability, đối chiếu billing; cost attribution không tự suy ra giá bán.

**Đề xuất:** Không thêm L3 cho AI Response Routing; thêm **Policy Specification** và **Test Matrix** dưới F07-G03-M01/M02. Chi tiết trong `Feature_3_2_AI_Routing_Policy_SPEC_DRAFT.md`.

## V. CON-03/05/06/07 — Ranh giới xuyên package

| ID | Kiểm tra | Ownership/kiểm soát đề xuất | Test cần làm |
|---|---|---|---|
| CON-03 | Parent-led vs Child-led AI cost | F01 entitlement; F07 usage attribution. 1 subscription gia đình + child slots là **hướng thương mại**, chưa có giá/tiers | Usage actor Parent, beneficiary Child; shared family question; multiple parents; account cancellation |
| CON-05 | Safety exception vs quota, notification, caregiver | F07-G05 owns safety triage/recipient decision; F07-G03 safe fallback, F07-G07 audit; F01 access | Hết quota trong child safety chat; unsafe caregiver; false escalation; quiet hours |
| CON-06 | Education Finance vs Premium vs Marketplace | F08-G06 budget/spending records; F01-G06 subscription; F08-G05 marketplace transaction; provider confirmed payment status in billing integration | Khoản học phí nhập tay không tạo payment; thanh toán thất bại không thành expense thực trả; refund/update idempotency |
| CON-07 | Family membership vs adult data | F01 membership/consent; F07 access enforcement/retention; data owner theo từng loại, không theo payer | Chuyển 17→18, thu hồi quyền, family split, Journal private, lịch sử hóa đơn hợp lệ |

**Không chốt** quyền tự động cho phụ huynh hoặc admin chỉ vì họ chi trả/thuộc gia đình.

## VI. CON-08/09 — Traceability và độ đầy đủ

- SC-003 đã được thảo luận (trẻ lớp 8 muốn thử nghề streamer, mô hình nghề–kỹ năng nhiều-nhiều, dự án thử nghề, KB governance, giới hạn public posting) và có fixture Package C, nhưng chưa có `Scenario_Change_Log_SC-003.md` riêng. Đề xuất tạo **log truy vết mới, LOG_ONLY**, không tự sửa các Scenario log cũ.
- 106 L3 **không** chứng minh complete coverage. Trước khi phê duyệt 3.2, cần pass ít nhất: mapping các scenario SC-001/002/003 vào L3, use-case owner, độ tuổi A0–A5, input/output/permissions, failure modes, cost tier, research gap, evidence và change history.
- Baseline 98 L4 chỉ là tính năng ví dụ; những L3 mới cần L4 đại diện để giữ đúng schema, nhưng **không** tự điền L4 thiếu research như thể đã validated.

## VII. Các quyết định/điểm chặn còn mở

| Key | Mục tiêu | Khuyến nghị | Trạng thái |
|---|---|---|---|
| C-Q1 | Group/ID Academic Assessment | A: `F06-G07-M01`, thêm 1 group | **CẦN USER CHỐT** |
| C-Q2 | AI Response Routing Policy | A: bổ sung policy spec vào các L3 hiện tại, không tạo L3 mới | **CẦN USER CHỐT** |
| C-Q3 | Cache and safety | A: 3 nhóm cache + `NO_CACHE` tùy dữ liệu và quyền; strict invalidation | **CẦN USER CHỐT NGUYÊN TẮC** |
| C-Q4 | Traceability SC-003 | A: ghi log SC-003 riêng, `LOG_ONLY`; không cập nhật Blueprint cũ | **CẦN USER CHỐT** |

Các vấn đề cần research: ngưỡng health/safety, AI grading quality, retention/provider logging, platform publishing laws, cost models và tier pricing. Không tạo MR-ID mới hoặc sửa Master Research Backlog tự động.

## VIII. Next action sau duyệt review

1. Ghi `Consolidation Decision Log` với chọn lựa C-Q1..Q4.
2. Tạo **Canonical 3.2 Proposed Diff** (tài liệu riêng) gồm L2/3/4 và annotations `ADD/EXTEND`, `source_decision`, owner, dependencies.
3. Lập **Scenario Trace Matrix** và kiểm tra các trường hợp permission/safety/billing/voice/cache trong test fixture.
4. Trình proposed diff và Research Delta lần cuối để duyệt việc sửa bản chính thức.
5. Chỉ sau phê duyệt **cụ thể việc áp dụng diff** mới chỉnh `3.2`; 3.3/3.4/master research được cập nhật trong bước riêng khi được duyệt.