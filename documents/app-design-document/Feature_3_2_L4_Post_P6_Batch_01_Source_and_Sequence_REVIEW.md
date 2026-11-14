# Parent-Pal — Batch 01 sau P6: Thứ tự L3, nguồn và cổng phản biện

**Ngày chuẩn bị:** 2026-11-12  
**Trạng thái (2026-11-13):** `B01_ALL_FIVE_MODULES_REVIEWED / ALL_22_B01_OQ_CONFIRMED / CONSOLIDATION_PLAN_CREATED / CONSOLIDATION_NOT_EXECUTED`  
**Chỉ định:** Claude Code chỉ chạy review và xuất ZIP; ChatGPT quản lý decision/Git; Owner chốt vấn đề nghiệp vụ.  
**Không thay đổi:** P5/P6 baseline, Blueprint canonical, stable L4 IDs; PR #17 vẫn Draft; PR #18 không dùng.

## 1. Tại sao chọn batch này

Nhằm mở rộng từ ba pilot P6 (Access, Academic, Balance) sang các ranh giới **consent, autonomy, purpose-bound data, plan, approval** có nhiều giao diện liên module và tính nền tảng. L3 được xác minh có mặt trong 3.2-R1. Việc sắp thứ tự là **đề xuất thiết kế review**, không phải dependency graph topo đã được kiểm chứng hoặc kết luận MVP.

| Thứ tự | L3 / tên trong Inventory | Trọng tâm kiểm tra | Truy vết nguồn gốc | Regression & quan hệ |
|---:|---|---|---|---|
| 1 | `F01-G04-M02` — **Consent Ledger** | Consent lifecycle, actor/scope/purpose, capture/revoke/version, dữ liệu trẻ và quyền hợp lệ, phân biệt consent với role/grant | 3.2-R1 L3 `F01-G04-M02`, MR-016/017, UC-002; P6 Access Owner Decision Log | F01-G04-M01 access decision; Journal non-disclosure; caregiver grant không tự thay consent |
| 2 | `F01-G05-M01` — **Mode State** | Parent-led / Child-executed / Child-directed, scope, owner, transitions chỉ đọc trạng thái không tự đổi, 18+ tự quản | 3.2-R1 `F01-G05-M01`, MR-015/017, UCF-01; P6 Access OQ-4/OQ-5 | Một caregiver/family; một manager/plan scope; quyền đề xuất/draft/approval/commit tách rõ |
| 3 | `F07-G06-M01` — **Purpose-bound Access** | Data purpose scope, privacy controls, authorization before AI/cache/export, revocation | 3.2-R1 `F07-G06-M01`, MR-016/018/021, UCF-07/UCF-10 | F01-G04 owns policy decision; F07-G06 governs data privacy; Journal và safety scoped; không duplicate authorize() |
| 4 | `F04-G01-M01` — **Plan Structure** | Plan baseline ownership, actor/scope, draft/version, child plan vs adult self-managed, boundaries between plan baseline and validation | 3.2-R1 `F04-G01-M01`, UC-007, 3.4 cross-module flow; P6 Balanced/Access | F04-G02 candidate schedule, F04-G06 approval, F01-G04 permissions, soft/hard-cap không auto commit |
| 5 | `F04-G06-M01` — **Change Requests** | Proposal → review/approve/reject → commit request, idempotency, race/authorization, plan revision/rollback | 3.2-R1 `F04-G06-M01`, MR-035, UC-008/010/012; P6 Balanced F-021 | Child/observer propose; primary approve; F04-G01 commits plan baseline; exception approval 60/7; 18+ autonomy |

**Lưu ý:** Các mối liên hệ trong 3.3 được ghi `CANDIDATE/UNKNOWN`; Claude phải đối chiếu chứ không được tự nâng thành `HARD` hoặc `APPROVED`. Nếu thứ tự phụ thuộc thiếu L3 nền tảng (ví dụ `F01-G05-M02`), mở issue và review contract theo source; không tự thay scope batch.

**Cập nhật sau Module 01:** Consent Ledger (`F01-G04-M02`) đã có ZIP review và bốn câu hỏi Owner được chốt. Đọc thêm [B01 Consent Ledger Owner Decision Log](Feature_3_2_L4_B01_Consent_Ledger_Owner_Decision_Log_APPROVED.md). Không đánh dấu Module 01 là accepted/final cho đến khi xử lý trace warning, privacy/authority caveats và kiểm chứng liên module. Module 02 (`F01-G05-M01`) cũng đã chạy, Owner đã chốt OQ-B01M2-1..4; xem [B01 Mode State Owner Decision Log](Feature_3_2_L4_B01_Mode_State_Owner_Decision_Log_APPROVED.md). Lượt tiếp theo là Module 03 (`F07-G06-M01`) và cần giữ policy per-child mode, caregiver overwrite/lock theo scope và sự riêng tư Journal.

**Cập nhật Module 03:** Purpose-bound Access (`F07-G06-M01`) đã chạy và Owner chốt OQ-B01M3-1..4, xem [B01 Purpose-bound Access Owner Decision Log](Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md). Giữ gate pháp lý trước khi dùng dữ liệu cá nhân thật của trẻ; Access Policy là điểm quyết định ALLOW/DENY cuối cùng, Purpose-bound Access trả purpose sub-decision. Cần hồi quy và theo dõi các nghiên cứu chưa xong. Module 04 (`F04-G01-M01` Plan Structure) chưa chạy.

**Cập nhật Module 04:** Plan Structure (`F04-G01-M01`) đã chạy và Owner đã chốt OQ-B01M4-1..5. Đọc [Plan Structure Owner Decision Log](Feature_3_2_L4_B01_Plan_Structure_Owner_Decision_Log_APPROVED.md) trước khi chạy Change Requests. Đặc biệt: fallback App Default Standard Bar, draft lưu được dù không đạt bar; Parent lock chặn sửa thời khóa biểu hiện tại, chỉ unlock/authorized override có version/audit; F04-G06 quản change proposal/approval còn F04-G01 commit plan baseline. Module 05 chưa chạy; regression F-023/F-027 còn mở.

**Cập nhật Module 05:** Change Requests (`F04-G06-M01`) đã chạy và 5 OQ được Owner xác nhận; [Decision Log](Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md). Khuyến nghị Child-directed direct mutation trong delegated scope có đủ gates; CR pending tự hết hạn 7 ngày; proposal vi phạm protected hard-cap có thể submit để thảo luận nhưng không APPROVE/APPLY; stale approved invalidation/revalidation theo context. **Batch 01 đã có đủ 5 pilot**. Thực hiện [Consolidation C0–C5](Feature_3_2_L4_B01_Consolidation_and_Cross_Module_Review_Plan_REVIEW.md) trước khi xem xét Batch 02.

## 2. Source Manifest — quy tắc đọc

**Repository:** `ChadNguyen1608/app-parent-pal`  
**Branch tài liệu:** `docs/l4-pilot-three-modules-20261110` (PR #17, chưa merge).  
**Canonical Blueprint:** 3.2-R1, 3.3, 3.4 trên phiên bản chủ đạo của repo, xác minh SHA và đường dẫn trước mỗi lượt.  
**Reviewed/approved context:** P5 Owner Decision Log; P6 Access/Academic/Balance Owner Decision Log; P6 Method Approval and Rollout Review; P6 plan; P5 L4 capability/methodology/test registry/contract; 3 Scenario Change Log và Master Research Backlog khi liên quan.

Các tệp trọng tâm:
- `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md`
- `Product_Blueprint_03_3_Feature_Prioritization_and_Dependency_Mapping.md`
- `Product_Blueprint_03_4_Feature_Interaction_and_Use_Case_Mapping.md`
- `Feature_3_2_L4_P5_Owner_Decision_Log_APPROVED.md`
- `Feature_3_2_L4_P6_Access_Policy_Owner_Decision_Log_APPROVED.md`
- `Feature_3_2_L4_P6_Academic_Assessment_Owner_Decision_Log_APPROVED.md`
- `Feature_3_2_L4_P6_Balanced_Planning_Owner_Decision_Log_APPROVED.md`
- `Feature_3_2_L4_P6_Method_Approval_and_Rollout_Review.md`
- `Feature_3_2_L4_Post_P6_Batch_Execution_Plan_REVIEW.md`
- `Product_Blueprint_Master_Research_Backlog_v1_2.md`

**Phân quyền nguồn:** Owner decision được chốt ưu tiên trong phạm vi áp dụng, nhưng không biến proposal mới thành canonical; tài liệu P5/P6 trên Draft PR #17 phải đọc từ branch này, không giả định có ở `main`. Không đọc nguyên repo vào mọi sub-agent, chỉ các đoạn source có trace cần thiết.

## 3. Execution Policy — giới hạn bắt buộc

1. **Một L3 mỗi lần chạy** theo thứ tự. Xuất 1 ZIP/module. Chỉ chạy lượt kế tiếp khi lượt hiện tại **không có CRITICAL/HIGH chưa được xử lý** và source version còn phù hợp; nếu có `OWNER_DECISION_REQUIRED` gây block, dừng và trả về Owner.
2. **Tối đa ba sub-agent đang dùng cho mỗi lượt L3:** `QA`, `Architect`, `Adversarial Reviewer`. Coordinator là Claude phiên chính; Validator là Python/script trong phiên chính. **Không spawn agent con lồng nhau**.
3. **Model Sonnet 5.5** chỉ khi có model ID hỗ trợ được xác minh. Không tự fallback Opus hoặc model khác; nếu không có, dừng `MODEL_UNAVAILABLE` và báo Owner.
4. QA và Architect phải nhận nguồn gốc riêng, không truyền kết luận của nhau ở vòng đầu; Reviewer nhận cả nguồn gốc, QA và Architect sau đó; reviewer findings lưu bằng chứng. Max **2 revision** tự động; vòng 3 chỉ với blocker và trong ngân sách cấu hình đã được Owner cho phép.
5. **Không cấp API/GitHub quyền ghi** cho sub-agent. Claude chỉ đọc repository và viết output cục bộ ngoài repo. Không commit, push, PR, sửa Decision Log, research backlog, canonical, không merge.
6. Không coi agent review là science/legal/app test; các nguồn thiếu là `UNKNOWN/RESEARCH_REQUIRED`. Không thay đổi decision đã chốt. Không thu thập dữ liệu thật của trẻ.
7. Không có ngân sách USD cố định được Owner chốt. Kiểm tra token/quota/cost trước khi gọi; không tự đặt claim budget đã được Owner duyệt. Giữ giới hạn theo môi trường thực tế; dừng nếu không thể quản lý.

## 4. Gate sau mỗi L3

| Gate | Điều kiện |
|---|---|
| `SOURCE_LOCK` | Đã ghi commit, hash nguồn chính, khác biệt `main` vs PR #17 |
| `INDEPENDENCE` | Có execution evidence của 3 vai, QA-first trước Architect, review thực, không mock |
| `TRACE` | Requirements→L4 candidates→tests→findings, source refs đúng, không tự stable IDs |
| `VALIDATION` | Validator/code checks thực chạy; chưa chạy app tests phải ghi rõ |
| `REGRESSION` | Đối chiếu 64 baseline theo *tính liên quan* (không phải bắt 64 test chạy mỗi L3), các OQ/P5 quyết định liên quan |
| `OWNER` | Chỉ hỏi những quyết định nghiệp vụ chưa được phê duyệt; không đóng findings chỉ vì Owner đã trả lời |
| `ECONOMICS` | Token/cost đã đo nếu có; phát sinh unknown ghi rõ, không tự đoán |
| `GO_NEXT` | Không còn critical/high blocker, owner-sensitive issues được phân loại/đưa Owner, source vẫn đúng |

## 5. Output Contract

Mỗi ZIP/module: source manifest, QA-first test, Architect L4, Adversarial findings, Validator, Revision Log, Traceability, Test Registry, Cross-module regression, Owner Review, Execution Evidence, Issue Register và short summary tiếng Việt. Không ghi kết quả vào GitHub.

Sau khi nhận từng ZIP, **ChatGPT** kiểm tra nội dung, cập nhật Decision Log và tracking trên PR #17 sau Owner confirmation. **Không đợi hết năm L3 mới rà soát**, để giảm lỗi lan truyền.

## 6. Bước tiếp theo sau Batch 01

- ChatGPT lập `Batch_01_Consolidation & Cross-Module Review` và chấm gate sau từng L3, sau đó là toàn batch: ownership, authorization, consent, autonomy, plan approvals, test coverage, regression và chi phí.
- Owner chỉ quyết định các câu hỏi sản phẩm phát sinh hoặc đổi chuẩn của hệ thống.
- Nếu gate đạt: thiết kế Batch 02 theo dependency và độ ưu tiên; tăng số L3/batch có kiểm soát. **Không nhảy ngay tới lập trình app**: hoàn tất phân rã L4 theo các batch, kiểm tra tính nhất quán xuyên domain và chốt stable IDs/canonical qua vòng phê duyệt riêng.
- Rà soát `MR-040` trace chưa giải quyết và baseline lịch sử 49/98 vs 51/106; không sửa âm thầm.

## 7. Change Log

- `B01-PLAN-01`: Chọn 5 L3 có trong Feature Inventory 3.2-R1 theo thứ tự.
- `B01-PLAN-02`: Đặt giới hạn Sonnet 5.5 / tối đa 3 sub-agent / Claude read-only Git.
- `B01-PLAN-03`: Gate từng ZIP → ChatGPT Owner Review → batch consolidation.
- `B01-PLAN-04` (2026-11-12): cập nhật Module 01 đã chạy và OQ-B01-1..4 được ghi; còn regression & research, chưa cho auto-promote.
- `B01-PLAN-05` (2026-11-12): Module 02 Mode State đã chạy, bốn OQ được chốt; từng trẻ có mode riêng, ba mức quyền lịch trình, Access Policy sở hữu delegation, UNSET mặc định parent-controlled.
- `B01-PLAN-06` (2026-11-12): Module 03 Purpose-bound Access đã chạy, OQ-B01M3-1..4 được chốt; gate pháp lý và revision/regression còn mở; Module 04 là lượt kế tiếp.

- `B01-PLAN-07` (2026-11-13): Module 04 Plan Structure đã chạy, năm OQ được chốt; module 05 Change Requests là lượt kế tiếp, chưa chạy; technical regression còn mở.

- `B01-PLAN-08` (2026-11-13): Module 05 Change Requests Owner OQ-B01M5-1..5 đã ghi. 5/5 module hoàn thành pilot review; consolidation C0–C5 được lập kế hoạch nhưng chưa chạy, không tự mở Batch 02.
