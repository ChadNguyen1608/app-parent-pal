# Scenario Management Rules
**Product Blueprint — Feature Inventory Validation (3.2)**

- Version: **1.0**
- Date: **2026-11-09**
- Status: **WORKFLOW_RULES** — hướng dẫn làm việc, **không phải quyết định cập nhật Feature Inventory**
- Scope: Dùng trong giai đoạn kiểm chứng **3.2 Feature Inventory & Scope**, có liên kết **3.3 Prioritization** và **3.4 Use Case Mapping**.
- Nguyên tắc kiểm soát thay đổi: **Không cập nhật 01–03, L3/L4 inventory, 3.3/3.4 hoặc Master Research Backlog trước khi chủ sản phẩm chấp thuận thay đổi tương ứng.**

---

## 1. Mục đích và vị trí trong Blueprint

**Scenario không phải một domain hoặc layer mới của Product Blueprint.** Đây là **test case nghiệp vụ** dùng để xác định baseline 8 Domains / 49 Groups / 98 L3 Modules của phần 3.2 có bao phủ những kết quả người dùng thực sự muốn hay không.

```text
01 Product Vision ──┐
02 User Research ───┼──> 3.2 Feature Inventory (baseline)
03.1 Domains ───────┘                │
                                     ▼
                           Scenario-driven validation
                             SC-001, SC-002, ...
                                     │
                       Logs + gap/overlap/issue register
                                     │
                           Review & user approval
                                     │
                                     ▼
                         3.2 Revised Inventory (if approved)
                                     │
                     3.3 Scoring / Dependency Assessment
                                     │
                         MVP decisions (later stage)
```

3.3 và 3.4 đã có **khung phương pháp/baseline**, chưa có nghĩa 98 L3 đã được đánh giá đầy đủ hoặc danh mục đã được xác thực. Không thay đổi số lượng module chỉ vì một scenario có nhiều gap.

### Phương án kết hợp đã thống nhất

- **Phân tích scenario độc lập** để không giới hạn khả năng phát hiện những capability chưa từng nghĩ đến.
- **Thiết kế capability dùng chung** ở bước tổng hợp nếu cùng trách nhiệm nghiệp vụ; giữ phần đặc thù tách biệt.
- **Không gộp các log nguồn**; liên kết qua ID và bảng ánh xạ để truy vết.
- **Một workflow nghiệp vụ có owner rõ ràng**, có thể gọi nhiều capability; không đồng nhất mỗi feature group với một agent hay một backend service.
- Tách **business capability**, **dataset**, **policy**, **UI**, **integration**, **AI execution**; không phải mọi thiếu sót đều là module mới.

---

## 2. Artifact và nguồn sự thật

| Artifact | Mục đích | Khi nào cập nhật |
|---|---|---|
| `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md` | Feature Inventory chuẩn ở thời điểm hiện tại | **Chỉ sau duyệt** revision cụ thể |
| `Scenario_Change_Log_SC-###.md` | Bài toán, kỳ vọng, quyết định và gap phát hiện theo từng scenario | Sau khi chủ sản phẩm yêu cầu lưu/cập nhật log; **không** đồng nghĩa duyệt 3.2 |
| `Scenario_Management_Rules.md` | Quy trình kiểm thử, đối chiếu, gộp và phê duyệt | Khi chủ sản phẩm chốt thay đổi workflow |
| `Feature_Validation_Summary.md` *(chưa tạo)* | Bảng tổng hợp các gap/overlap/conflict và bản đề xuất thay đổi 3.2 | Khi người dùng yêu cầu bắt đầu giai đoạn consolidation |
| `3.3 Feature Prioritization` | Rubric/scoring/dependencies trên danh mục đủ ổn định | Sau kiểm chứng cấu trúc và dữ liệu đánh giá |
| `Master Research Backlog` | Những câu hỏi nghiên cứu thực sự cần nguồn/evidence | Chỉ cập nhật trong lượt được phê duyệt; không tạo MR-ID tự động trong từng log |

**Source of truth đối với quyết định:** quyết định người dùng nói rõ trong hội thoại, được ghi lại trong log theo mã `SC-###-D##`; log chỉ ghi nhận, không thể tự nâng trạng thái từ PROPOSED thành APPROVED.

---

## 3. Workflow chuẩn cho mỗi Scenario

### Step 0 — Nhận scenario

**Input tối thiểu:** bài toán người dùng, bối cảnh đã biết, kết quả kỳ vọng. Không bắt người dùng điền form hoặc trả lời nhiều câu hỏi khi có thể kiểm thử sơ bộ.

Tạo ID tăng dần: `SC-001`, `SC-002`, ...; ghi rõ dữ liệu nào là giả định, dữ liệu nào đã có và dữ liệu nào chưa được xác nhận. Kế thừa các ràng buộc từ scenario trước chỉ khi người dùng nói chúng còn áp dụng hoặc thuộc nguyên tắc sản phẩm chung.

### Step 1 — Expected Output Simulation

Viết **câu trả lời hoặc hành vi mẫu của Parent/Child App** như thể hệ thống vận hành. Phải phân biệt:
- Thông tin chắc chắn đã có và có nguồn.
- Suy luận/khuyến nghị có điều kiện.
- Kết quả minh họa bằng dữ liệu giả định (không coi là dữ liệu của trẻ).
- Không thể kết luận nếu thiếu data hay bị giới hạn quyền.

Đánh giá theo **đúng mục tiêu và trải nghiệm người dùng**, không bắt đầu từ việc tìm module để lắp vào.

### Step 2 — Coverage Mapping đến 3.2/3.4

Với mỗi outcome, xác định:
1. Capability / workflow cần thiết;
2. Domain/Group/Module L3 đang có (nếu tìm thấy);
3. Owner chính và các module tham gia;
4. Dữ liệu, quyền, safety, knowledge và integration phụ thuộc;
5. Chế độ thực thi E0/E1/E2/E3 nếu có liên quan.

Coverage status: `SUPPORTED` / `PARTIAL` / `MISSING` / `UNKNOWN`; trạng thái khác được thêm kèm, ví dụ `DATA_REQUIRED`, `POLICY_REQUIRED`, `RESEARCH_REQUIRED`.

**`SUPPORTED` chỉ có nghĩa là đủ năng lực theo đặc tả Blueprint**, không khẳng định đã có code hay dataset vận hành.

### Step 3 — Gap Analysis

Mỗi gap phải được phân loại, không mặc định là chức năng mới:
- `FEATURE_CAPABILITY_GAP`: thiếu trách nhiệm nghiệp vụ/cách vận hành;
- `DATA_GAP`: thiếu dữ liệu, schema, nguồn hoặc độ cập nhật;
- `KNOWLEDGE_GAP`: thiếu nội dung/tri thức cần thẩm định;
- `PERMISSION_SAFETY_GAP`: thiếu policy và ngưỡng xử lý;
- `INTEGRATION_GAP`: cần hệ thống bên ngoài;
- `UX_WORKFLOW_GAP`: cần luồng tương tác khác;
- `EVIDENCE_COST_GAP`: chưa đo độ chính xác, chi phí, hiệu quả.

Đặt mã `SC-###-G##`. Một gap có thể thuộc nhiều loại; cần chỉ rõ *vì sao* module hiện tại chưa đủ.

### Step 4 — Kiểm tra trùng lặp & xung đột

Sau mỗi scenario hoặc theo đợt:
- **Duplicate/Overlap:** các gap khác nhau cần chung một capability?
- **Conflict:** một điều kiện trong scenario có vi phạm quyết định trước, quyền dữ liệu hoặc safety không?
- **Dependency:** nghiệp vụ nào phải tồn tại trước? Dataset nào cần human approval?
- **Ownership:** một thành phần dùng chung do ai sở hữu?
- **Design decision vs research:** những điểm nào có thể tự kiểm tra logic, điểm nào buộc phải có bằng chứng/thử nghiệm?

Quy tắc: **ghi liên kết chéo, không xóa gap khỏi log nguồn**. Kết luận overlap không có nghĩa phải gộp business workflow hay thuật toán chuyên biệt.

### Step 5 — Phản biện và phê duyệt

Trình tối đa các câu hỏi cần thiết để người dùng chốt nguyên tắc; ghi từng quyết định:
- `PROPOSED`: đề xuất chưa được người dùng chốt;
- `USER_APPROVED_PRINCIPLE`: người dùng đồng ý nguyên tắc sản phẩm;
- `USER_CONFIRMED_REQUIREMENT`: người dùng xác nhận nhu cầu;
- `APPROVED_WITH_BOUNDARY`: đồng ý có ràng buộc privacy/safety;
- `RESEARCH_REQUIRED`: chưa đủ chứng cứ để chốt;
- `DEFERRED`: chưa cần xử lý trong giai đoạn hiện tại.

**Phê duyệt nguyên tắc ≠ phê duyệt cập nhật Feature Inventory, kiến trúc/schema, MVP hoặc phát hành.**

### Step 6 — Lưu Scenario Change Log

Khi được yêu cầu:
- File riêng `Scenario_Change_Log_SC-###.md`;
- Scenario, expected outputs, dữ liệu đã biết/thiếu;
- Quyết định có trạng thái; các đề xuất chưa chốt;
- Gap và mapping module hiện tại, data/evidence needs;
- Overlap/conflict với scenario khác;
- Chỉ rõ **NO BLUEPRINT CHANGE** và ngày/phiên bản.

Không sửa các log khác trừ khi chủ sản phẩm yêu cầu.

### Step 7 — Consolidation (chỉ khi được yêu cầu)

Khi có đủ scenario đại diện hoặc người dùng tuyên bố ngừng kiểm thử:
1. Đọc baseline 3.2 + 3.4 và **toàn bộ scenario logs**;
2. Tạo bảng `Scenario Gap → Existing L3 / Extend L3 / New L3 / New Group / Data only / Policy only / Research only`;
3. Gom capability tương đồng, tách chuyên môn khác nhau, nêu workflow owner;
4. Phân tích **coverage by domain/age cohort/core loop** và hành trình nghiệp vụ/nghiệp vụ vận hành còn thiếu (ví dụ subscription/payment);
5. Lập **Change Proposal**: trước/sau, thay đổi ID, use case được đáp ứng, dữ liệu, quyền, phụ thuộc, rủi ro, cost;
6. Báo cáo cho chủ sản phẩm và **đợi phê duyệt**;
7. Sau khi duyệt mới cập nhật 3.2, các cross-reference trong 3.4/3.3 (nếu cần) và Master Research Backlog theo lượt được phép.

Cần duy trì **Mapping & Decision Traceability**; không tự tạo 98+ module mới dựa trên số gap.

### Step 8 — Prioritization readiness

Chỉ dùng 3.3 để chấm điểm khi:
- module L3 có boundary, owner, value hypothesis, user/cohort, dependencies đủ rõ;
- hard gates pháp lý/privacy/safety không bị bỏ qua;
- có rubric và evidence đủ cho tiêu chí muốn chấm;
- nơi thiếu dữ liệu ghi `UNKNOWN`, không tạo điểm giả;
- đã tách **structural completeness** khỏi **user value validation** (cần phản hồi người dùng thực).

Không nhất thiết hoàn thành toàn bộ nghiên cứu mới chạy *preliminary scoring*; phải phân biệt tentative score và validated score.

---

## 4. Quy tắc tái sử dụng capability (Hybrid A + B)

### Chia sẻ khi thực sự cùng trách nhiệm
- `Roadmap / Milestones / Task / Calendar / Review` có thể dùng chung cho mục tiêu học tập và dự án khám phá nghề;
- `Knowledge Source / Cache / Provenance / Human Review` là infrastructure dùng chung; dữ liệu tuyển sinh và nghề nghiệp độc lập;
- `Progress / Insights / Adaptation` dùng chung orchestration nhưng không dùng chung mọi thuật toán domain assessment;
- `Permission & Safety` dùng chung policy engine nhưng rule cụ thể có thể khác theo case.

### Giữ riêng khi bản chất nghiệp vụ khác
- Chấm phép tính/chữ viết ≠ đánh giá kỹ năng sáng tạo video;
- Journal riêng tư ≠ feedback chia sẻ cho kế hoạch;
- Standard Bar dài hạn ≠ ngoại lệ cân bằng ngắn hạn;
- Career Exploration ≠ xác nhận trẻ “phù hợp/không phù hợp nghề”.

### Ví dụ traceability

| Nguồn | Gap | Shared capability dự kiến | Riêng biệt |
|---|---|---|---|
| SC-001 | Long-term roadmap | Planning / Milestones | Admission & IELTS guidance |
| SC-003 | Career trial tasks | Planning / Milestones | Career research & youth creator constraints |
| SC-001 | Admission knowledge | Knowledge governance | School/year/location dataset |
| SC-003 | Career market knowledge | Knowledge governance | Occupation/skills/income dataset |
| SC-002 | Homework assessment | Assessment records / Progress | Math & handwriting graders |
| SC-003 | Skill project review | Assessment records / Progress | Creative project evidence and reflection |

Các mapping trên **đang là đề xuất**, không phải việc gộp module đã được phê duyệt.

---

## 5. Những điều không được suy diễn

1. Một scenario thành công **không chứng minh** toàn bộ 98 L3 module đã đầy đủ.
2. Một gap **không tự động** là một module L3 mới.
3. Một thông tin lấy từ web **không tự động** trở thành dữ liệu `APPROVED` trong KB.
4. Một capability được mô tả **không chứng minh** ứng dụng đã triển khai hoặc có dữ liệu phù hợp.
5. Dữ liệu Child Journal và suy luận từ đó **không tự động** được chia sẻ với phụ huynh hoặc Planning.
6. User approval of product principle **không đồng nghĩa** đã duyệt technical implementation.
7. `USER VALUE VALIDATION` bằng người dùng thật là bước riêng; không thể thay bằng agent tự chấm.
8. Không nhầm lẫn 24 Use Cases baseline với tổng số Use Case hoàn chỉnh.

---

## 6. Tình trạng hiện tại và bước kế tiếp

| Scenario | Nội dung | Artifact |
|---|---|---|
| `SC-001` | Định hướng IELTS/tuyển sinh, cân bằng, thích nghi, Family Standard Bar | Log đã lưu |
| `SC-002` | Bài tập, báo cáo học tập, journal & safety, AI marking pilot | Log đã lưu |
| `SC-003` | Streamer/career intelligence, kỹ năng, dự án Child App, market data | **Chưa lưu file log**; quyết định vẫn trong hội thoại |

**Gợi ý giai đoạn tiếp theo:** (1) lưu log SC-003 sau khi duyệt; (2) làm một **coverage sweep ngắn** đối với các mảng ít xuất hiện trong ba scenario, đặc biệt account/billing/premium/payment/wallet, AI voice, integrations, internal operations; (3) tổng hợp gap và trình **Change Proposal cho 3.2**; (4) sau phê duyệt mới tiến đến **3.3-A Scoring Rubric + Pilot Scoring**.

Không bắt buộc viết thêm nhiều scenario nếu số lượng thông tin bổ sung đã giảm; sử dụng **risk-based gap review** thay vì cho rằng đã bao phủ mọi tính năng.