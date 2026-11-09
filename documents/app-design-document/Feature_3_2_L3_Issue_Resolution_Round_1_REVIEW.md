# PARENT-PAL — FEATURE INVENTORY 3.2
## L3 Issue Resolution — Round 1

**Ngày:** 2026-11-10  
**Phiên bản:** 1.0  
**Trạng thái:** `PROPOSED_RESOLUTIONS / AWAITING_OWNER_DECISIONS / NOT_APPLIED`  
**Phạm vi:** AUD-01..AUD-17 từ `Feature_3_2_L3_Coverage_Audit_REVIEW.md`. Không triển khai L4, không sửa 3.2/3.3/3.4, không commit/merge GitHub.  
**Nguồn:** Blueprint 3.2 baseline, Proposed Canonical Diff 3.2, Consolidation Decision Log, Package A–E, Scenario Trace Matrix, 3.4 Use Case Mapping và L3 Coverage Audit.

> **Nguyên tắc:** Phê duyệt Package A–E và Consolidation là phê duyệt *đề xuất*, không phải phê duyệt canonical. Tài liệu này đưa ra khuyến nghị chuyên môn và các câu hỏi cần chủ sản phẩm chốt. Không dùng `RESOLVED_FOR_L3` để tuyên bố đã thẩm định chính sách, hoàn tất L4 hoặc nghiệm thu sản phẩm.

---

## 1. Kết luận điều hành

1. **Đề xuất giữ 8 Domain, 51 Group, 106 L3 làm cấu trúc ứng viên**, không thêm L3 thứ 107 trong vòng này. Có **8 ADD L3 / 2 ADD L2** đã được chốt ở cấp proposal; các vấn đề còn lại chủ yếu là ranh giới trách nhiệm, trace, quyền, L4, nghiên cứu và chính sách.
2. **Sửa phân loại của audit:** `AUD-02` (L4 chưa đầy đủ) **không phải blocker để chốt L3**. `AUD-01` (hai Group mới chưa có UC trong 3.4) là **traceability gap**, có thể đóng ở cấp L3 bằng owner/contract/UC proposal tối thiểu, chưa cần hoàn thiện 3.4.
3. **Chưa thể cập nhật canonical ngay:** cần người dùng duyệt danh mục 8 ADD, hai Group mới, 7 ranh giới ownership/contract và các điều kiện chuyển giao sang L4. Một số policy/safety còn `UNKNOWN` nhưng có thể được giữ làm release gate nếu không làm đổi ownership L3.
4. **Không tuyên bố full feature coverage**: 106 L3 là inventory ứng viên; SC-001/002/003 và 24 UC mẫu không chứng minh đầy đủ nhu cầu 0–23 tuổi.
5. **Không gán MR-ID mới hoặc số lượng L4 cuối** khi chưa đối chiếu backlog và kiểm chứng thực tế.

### 1.1. Phân loại lại 17 issue

| Phân loại chính | Issue | Số lượng | Ý nghĩa với L3 |
|---|---|---:|---|
| `L3_TRACE` | AUD-01, AUD-03 | 2 | Cần đóng owner, cohort applicability và trace tối thiểu trước khi canonical |
| `L3_CONTRACT` | AUD-04, AUD-05, AUD-06, AUD-08, AUD-09, AUD-13, AUD-14, AUD-17 | 8 | Chốt ranh giới module/source-of-truth; chi tiết implementation chuyển L4/Policy |
| `L4_DETAIL` | AUD-02, AUD-11, AUD-12, AUD-16 | 4 | Không làm thay đổi số L3 theo bằng chứng hiện tại |
| `POLICY_RESEARCH` | AUD-07, AUD-10, AUD-15 | 3 | Ghi safety/research/release gates; không tự tạo module |
| **Tổng** | **AUD-01..17** | **17** | Mỗi issue có thể có phụ thuộc chéo; bảng phân theo đầu mối xử lý chính |

**Điều chỉnh mức chặn:**
- `AUD-01`: `BLOCKER_TO_L3_TRACE_APPROVAL`, **không phải** blocker bắt buộc phải hoàn thiện mọi UC 3.4.
- `AUD-02`: chuyển `BLOCKER` → `L4_ENTRY_REQUIREMENT` (được phép chốt L3 trước khi phân rã L4).
- `AUD-03`: `L3_APPROVAL_GATE` cho hai Group mới và quyền người trưởng thành.
- `AUD-04/05/06/08/09/13/14/17`: chỉ phần **ownership/contract** cần đóng trước canonical; state machines, rubric, TTL, retention feasibility, legal review là gate riêng.
- `AUD-07`: safety policy chưa được thẩm định là **release blocker**, không tự động là **L3 structure blocker**.

---

## 2. Issue Resolution Register — đủ 17 vấn đề

**Status dùng trong vòng này:** `PROPOSED_L3_RESOLUTION` = đã có phương án, chờ chủ sản phẩm; `DEFER_TO_L4` = không đòi L3 mới; `RESEARCH_REQUIRED` = chưa có bằng chứng/policy; `RECONCILIATION_REQUIRED` = cần so với tài liệu hiện hành. Không issue nào được đánh dấu `OWNER_APPROVED` trong vòng này.

| Issue | Mức audit | Phân loại | Khuyến nghị xử lý ở L3 | Phần chuyển tiếp | Status |
|---|---|---|---|---|---|
| **AUD-01** Trace 3.4 | Blocker | L3_TRACE | Giữ `F06-G07`, `F08-G06`; bổ sung **UC proposal** gắn hai Group với actor/trigger/owner/outcome, không tự sửa 3.4 | Main/alt flows, error, permissions ở UC/L4 | `PROPOSED_L3_RESOLUTION` |
| **AUD-02** L4 completeness | Blocker | L4_DETAIL | **Không yêu cầu phân rã đủ L4 trước khi chốt L3**; chỉ bắt buộc scope statement + boundary + dependencies cho mỗi L3 mới | L4 matrix toàn 106 L3, acceptance | `DEFER_TO_L4` |
| **AUD-03** Cohort | High | L3_TRACE | Thêm hai hàng Age Matrix có `PROPOSED` và giải thích actor/guardian/adult boundary; không tự suy quyền từ P/S/C/Y/U | 6 cohort UX/permission per L4 | `PROPOSED_L3_RESOLUTION` |
| **AUD-04** Billing/entitlement | High | L3_CONTRACT | `F01-G06-M02` = entitlement/child slots; `M03` = subscription payment lifecycle; `F07-G03-M02` = execution budget/quota; `F07-G07-M02` = ops/cost | Payment verification, restore, refund, idempotency, quotas, pricing | `PROPOSED_L3_RESOLUTION` |
| **AUD-05** Academic | High | L3_CONTRACT | `F04-G05` = task evidence/submission; `F06-G07-M01` = rubric/assessment/reviewed result; `F06-G05` = authorized reports | Rubric, confidence, appeal, benchmark AI grading pilot | `PROPOSED_L3_RESOLUTION` |
| **AUD-06** Journal lineage | High | L3_CONTRACT | `F05-G04` = private source; `G05` = private derived insight; `G06` = sharing/deletion graph; `F07-G06` = cross-domain purpose access/retention | Provider/backup deletion feasibility, data lineage tests, legal exceptions | `PROPOSED_L3_RESOLUTION` |
| **AUD-07** Safety escalation | High | POLICY_RESEARCH | Giữ `F07-G05-M01/M02`; `F01-G04` cung cấp rights, `F05-G01` child-facing support. Không thêm L3 mới | Expert/legal review, safe recipient, false positives, SLA | `RESEARCH_REQUIRED` |
| **AUD-08** Balance | High | L3_CONTRACT | `F04-G02-M03` sở hữu validation; `F03` owns goal/taxonomy, `F04-G06` owns exception/change approval | Evidence-based caps, load/recovery, weather source, testing | `PROPOSED_L3_RESOLUTION` |
| **AUD-09** AI routing/cache | High | L3_CONTRACT | `F07-G03-M01` task router E0–E3; `M02` budget/quota; `M03` modality; `F07-G06` authorization; `F07-G01/G02` knowledge provenance | TTL/key/invalidation/provider retention, policy tests | `PROPOSED_L3_RESOLUTION` |
| **AUD-10** Knowledge provenance | Medium | POLICY_RESEARCH | Không tạo Career/Admissions repository L3 riêng; `F07-G01/G02` owns sourced content lifecycle; `F03-G05` consumes approved knowledge | Locale/date, human review workflow, revocation | `RESEARCH_REQUIRED` |
| **AUD-11** Data imports | Medium | L4_DETAIL | `F08-G01/G04` imports; `F06-G01` events/source metadata; không nhân bản L3 | Dedup, conflict, stale sync, revoke | `DEFER_TO_L4` |
| **AUD-12** Operations | Medium | L4_DETAIL | `F07-G07` operations, `F04-G07` notification prefs/delivery, `F01-G06-M03` billing lifecycle; không thêm admin Domain | Support/dispute/incident UCs, role matrix, audit | `DEFER_TO_L4` |
| **AUD-13** Education Finance | Medium | L3_CONTRACT | `F08-G06-M01` budget; `M02` expense/approval **non-payment**; subscription `F01-G06`, marketplace `F08-G05`, wallet DEFER | Expense ledger, recurring, payer permissions, report | `PROPOSED_L3_RESOLUTION` |
| **AUD-14** Goal/exploration | Medium | L3_CONTRACT | `F03-G04-M03` owns roadmap; `F03-G05-M03` career exploration; `F03-G06` goal revision; `F04` execution; `F06` feedback | Exploration completion w/o career commitment; version/approval UCs | `PROPOSED_L3_RESOLUTION` |
| **AUD-15** Research linkage | Medium | POLICY_RESEARCH | Không tạo L3; đánh dấu `UNKNOWN`/research_ref pending, đối chiếu MR backlog khi canonical revision | MR mapping, 3.3 scoring/validation | `RESEARCH_REQUIRED` |
| **AUD-16** Age/accessibility | Medium | L4_DETAIL | `F03-G03-M02` owns adaptation guidance, mỗi feature có age_variant; không tạo Group Accessibility mới | Assistive-tech tests, A0 alternatives, A5 adult consent | `DEFER_TO_L4` |
| **AUD-17** Blueprint vs app code | Medium | L3_CONTRACT | **Không đồng nhất** Product Blueprint nghiên cứu với implementation hiện có. Chốt docs precedence và lập conflict register trước khi đưa thành dev task | Đối chiếu `documents/pal/`, code, migration strategy | `RECONCILIATION_REQUIRED` |

### 2.1. Phản biện các phương án khác

- **Thêm L3 mới cho mỗi concern (safety recipient, cache, school import, refund, accessibility): không đề xuất.** Đây là hành vi/phương án trong owner hiện có. Chỉ tách khi chứng minh có *lifecycle, quyền hoặc nguồn dữ liệu độc lập* và không thể mô tả trong L3 hiện hành.
- **Bắt buộc hoàn tất toàn bộ L4 rồi mới chốt L3: không đề xuất.** Mâu thuẫn thứ tự đã được chủ sản phẩm xác nhận, tăng rủi ro làm lại. Có thể cần *ví dụ hành vi tối thiểu* để thử ownership, nhưng không phải full L4 inventory.
- **Đưa toàn bộ safety/retention vào F07: không đề xuất.** F05 sở hữu private Journal và lineage, F07 sở hữu cross-domain policy/response. Trộn nguồn dữ liệu với policy làm mờ quyền và trách nhiệm.
- **Coi tài liệu repo hiện có là tương đương canonical Blueprint: không đề xuất.** Phải có mapping và conflict decision trước khi biến thiết kế thành task code.

---

## 3. Proposed L3 Structure — không thêm module thứ 107

### 3.1. Hai Group mới

| Group | Tên đề xuất | Ranh giới dữ liệu / trách nhiệm | Không sở hữu |
|---|---|---|---|
| `F06-G07` | Academic Learning Assessment | Rubric và kết quả đánh giá học tập, correction/review, assessment provenance | Task scheduling, submission ownership, general developmental indicator taxonomy |
| `F08-G06` | Education Finance | Education budget, planned/actual spending, approval metadata | Subscription charge, marketplace settlement, wallet/stored value, payment gateway |

### 3.2. Tám L3 ADD đã có proposal decision

| L3 ID | Tên | Owner và contract tối thiểu | Quyết định đề xuất |
|---|---|---|---|
| `F03-G04-M03` | Development Roadmap & Milestones | F03 owns goal→milestone version; F04 consumes for planning | `KEEP_ADD` |
| `F04-G02-M03` | Balanced Planning Validation | F04 owns approved family Standard Bar validation; no auto goal change | `KEEP_ADD` |
| `F06-G07-M01` | Academic Assessment | F06 owns assessment outcome; F04 owns submission; AI grading pilot only | `KEEP_ADD` |
| `F03-G05-M03` | Career Exploration Guidance | F03 owns evidence-grounded exploration; F07 owns knowledge approval | `KEEP_ADD` |
| `F01-G06-M03` | Subscription Billing Lifecycle | F01 owns verified subscription state transitions; not Journal access | `KEEP_ADD` |
| `F08-G06-M01` | Education Budget Planning | F08 owns family education budget/forecast, not payment | `KEEP_ADD` |
| `F08-G06-M02` | Expense & Approval Management | F08 owns education expense/approval non-payment record | `KEEP_ADD` |
| `F07-G03-M03` | Multimodal Interaction Orchestration | F07 owns modality adapters, distinct from task routing and authorization | `KEEP_ADD` |

**ID safety:** `F06-G03-M03` là ID *proposed-only superseded*, **không tạo**. Không đổi ID của 98 module baseline. Không thêm Domain F09 hoặc Wallet module. Các L4 placeholder hiện tại vẫn chỉ là ví dụ, không phải acceptance.

### 3.3. Bảy hợp đồng cần phê duyệt ở mức L3

| Contract ID | Hợp đồng ownership / dữ liệu | Nếu không chốt, rủi ro |
|---|---|---|
| `L3C-01` | F03 goal/roadmap → F04 plan/execute → F06 assessment/report/feedback | Trùng source-of-truth giữa mục tiêu, thực thi và đánh giá |
| `L3C-02` | F04 submission ≠ F06 academic assessment ≠ F06 authorized report | Bài đã nộp bị hiểu là bài đúng hoặc đã được giáo viên xác nhận |
| `L3C-03` | F05 Journal/derived insight private; F07 authorization/safety; payer ≠ data access | Rò rỉ thông tin Journal qua báo cáo, AI cache hoặc người trả phí |
| `L3C-04` | F01 entitlement ≠ billing lifecycle ≠ F07 quota/cost ≠ F08 education finance/marketplace | Tính phí trùng, trộn chi tiêu giáo dục với thanh toán premium |
| `L3C-05` | F07 task routing E0–E3 ≠ modality; authorization trước retrieval/cache; cache không tự chứng thực nguồn | AI bỏ qua kiểm quyền hoặc dùng nguồn stale/không approved |
| `L3C-06` | F04 owns balanced scheduling/exception approval; F03 owns development taxonomy/goal | AI tự đổi mục tiêu, tính thời lượng hai lần hoặc bỏ leisure |
| `L3C-07` | F07-G01/G02 owns provenance/approval for Admissions/Career; F03 consumes; F08 owns external connectors | Gợi ý tuyển sinh/nghề dựa dữ liệu không kiểm chứng hoặc nhầm quyền sở hữu |

**Bất biến:** Safety escalation là policy-validated workflow, không tự động báo người chăm sóc có thể là nguồn gây hại. `NO_CACHE` không đồng nghĩa xóa dữ liệu Journal được lưu hợp lệ. 18+ không mặc nhiên kế thừa quyền truy cập của phụ huynh. Các nguyên tắc này đã có trong Consolidation/Package decisions; các điều kiện cụ thể vẫn cần thẩm định.

---

## 4. Trace tối thiểu để đóng AUD-01 ở cấp L3

Các UC bên dưới là **candidate UC contracts**, không cấp UC-### chính thức và không chỉnh 3.4. Việc lập flow đầy đủ thuộc 3.4/L4.

| Trace ID | Actor/trigger | Owner L3 | Outcome mong đợi | Bất biến / alternate path |
|---|---|---|---|---|
| `L3T-01` | Trẻ/phụ huynh nộp bài | F04-G05-M02 | Bài có provenance và submission state | Nộp ≠ đã chấm; missing/illegible state |
| `L3T-02` | Người có quyền yêu cầu đánh giá bài | F06-G07-M01 | Assessment có rubric, confidence và review state | Không chấm được → `UNABLE_TO_ASSESS`; AI pilot, không giả teacher-verified |
| `L3T-03` | Phụ huynh xem báo cáo học tập | F06-G05-M01/M02 | Báo cáo chỉ dùng dữ liệu được phép, phân biệt nguồn | Không truy cập Journal private hoặc suy luận tiết lộ gián tiếp |
| `L3T-04` | Gia đình lập ngân sách học tập | F08-G06-M01 | Budget theo mục tiêu/trẻ/giai đoạn | Không tạo payment/charge |
| `L3T-05` | Người được phép ghi khoản chi/yêu cầu duyệt | F08-G06-M02 | Expense/approval record có owner/status | Người trả tiền không mặc nhiên xem dữ liệu riêng tư khác |
| `L3T-06` | Người có quyền xem báo cáo ngân sách | F08-G06-M01/M02 | Tổng hợp budget vs actual theo quyền | Không đồng bộ subscription charge như education expense nếu không có rule rõ |
| `L3T-07` | Người dùng đổi family plan/quota | F01-G06-M02/M03; F07-G03-M02 | Entitlement từ verified payment state; quota được kiểm tra | Pending/refund không cấp quyền ngầm; no Journal privilege |
| `L3T-08` | Trẻ yêu cầu xóa Journal hoặc safety signal xuất hiện | F05-G06; F07-G05/G06 | Deletion/share/safety routing theo purpose | Không tự công khai cho người có nguy cơ gây hại |

**Điều kiện đóng AUD-01 ở cấp L3:** xác nhận 8 trace contract trên có owner rõ, không thiếu module bắt buộc; sau đó mở issue để cập nhật UC 3.4 theo PR riêng hoặc cùng PR canonical *nếu chủ sản phẩm yêu cầu*. Không tuyên bố full UC coverage.

---

## 5. Age Matrix — đề xuất ở cấp Group, chưa là cấp quyền

| Group mới | A0 (0–2) | A1 (3–5) | A2 (6–10) | A3 (11–14) | A4 (15–17) | A5 (18–23) | Ghi chú |
|---|---|---|---|---|---|---|---|
| `F06-G07` Academic Assessment | `P*` | `P*` | `S` | `C` | `Y` | `U` | `P*` = người chăm sóc thao tác nếu có hoạt động đánh giá phù hợp; không mặc định bài tập/học thuật cho 0–5 |
| `F08-G06` Education Finance | `P` | `P` | `P/S*` | `S*` | `S/Y*` | `U` | `*` = chỉ participation/view/propose nếu được cấp quyền; quyết định chi tiêu vẫn theo policy và vai trò, không suy từ tuổi |

Các ký hiệu P/S/C/Y/U là **UX pattern**, không phải legal authorization. Với A5, account và dữ liệu tài chính do người trưởng thành kiểm soát theo quyền; không mặc nhiên cho gia đình cũ truy cập. Với A0/A1, không ép trẻ tương tác trực tiếp. Không đưa ma trận này vào canonical trước khi chủ sản phẩm duyệt.

---

## 6. Exit Criteria của vòng L3 (không phụ thuộc full L4)

### Cần đóng trước khi yêu cầu cập nhật canonical 3.2

- [ ] `L3-G01`: chủ sản phẩm duyệt **8 ADD / 2 Group** và xác nhận **không ADD module thứ 107 trong vòng này**.
- [ ] `L3-G02`: chủ sản phẩm duyệt 7 hợp đồng ownership `L3C-01..07`.
- [ ] `L3-G03`: chủ sản phẩm duyệt trace owner tối thiểu `L3T-01..08` và cách xử lý gap 3.4.
- [ ] `L3-G04`: chủ sản phẩm duyệt ma trận Group mới A0–A5 với ghi chú **UX ≠ permission**.
- [ ] `L3-G05`: mỗi AUD-01..17 có disposition: `RESOLVE_AT_L3`, `DEFER_TO_L4`, `POLICY_RESEARCH`, `RECONCILE`; không còn issue *unowned* có khả năng đổi ranh giới L3.
- [ ] `L3-G06`: kiểm lại 106 ID, không duplicate; 2 Group unique; 98 ID gốc giữ nguyên; không có unintended deletion.
- [ ] `L3-G07`: người dùng **cho phép rõ ràng** áp dụng diff vào canonical 3.2 và tạo GitHub PR. Việc đồng ý review tài liệu này **không tự động** là cho phép merge.

### Được phép tồn tại dưới dạng `UNKNOWN / DEFERRED` khi chốt L3

- Full L4 matrix/acceptance; 3.3 prioritization; UC flows chi tiết 3.4; usability; provider retention; model benchmark; pricing/quota số cụ thể; safety thresholds/legal review; accessibility test; research MR-ID mapping chi tiết.
- Tuy nhiên những mục này phải có owner, backlog và release gate phù hợp; **không được đánh dấu đã hoàn thành hoặc triển khai production**.

---

## 7. Quyết định chủ sản phẩm cần chốt (Round 1)

| ID | Câu hỏi | **A — Khuyến nghị** | B — Phương án khác / hệ quả |
|---|---|---|---|
| **R1-Q1** | Có giữ cấu trúc ứng viên 8 Domain / 51 Group / 106 L3, không thêm module mới ở vòng này? | **A. Có**, giữ 8 ADD đã chốt cấp proposal; tiếp tục coverage L4/UC sau khi canonical | B. Chưa, tiếp tục tìm L3 mới trước; kéo dài audit |
| **R1-Q2** | Có chấp nhận phân loại lại AUD-02, không dùng thiếu L4 làm blocker chốt L3? | **A. Có**, L4 là bước sau, L3 cần scope/owner/dependency tối thiểu | B. Buộc hoàn thành L4 trước, trái trình tự vừa thống nhất |
| **R1-Q3** | Có duyệt 7 ownership contracts L3C-01..07 như phạm vi L3? | **A. Duyệt nguyên tắc**, implementation/policy chi tiết còn `UNKNOWN` | B. Yêu cầu sửa contract cụ thể trước |
| **R1-Q4** | Có chấp nhận 8 candidate trace L3T-01..08 và hai hàng Age Matrix mới? | **A. Chấp nhận làm proposal để đưa vào revision 3.2**, chưa sửa 3.4 và chưa cấp quyền pháp lý | B. Yêu cầu bổ sung hoặc sửa trace/cohort |
| **R1-Q5** | Xử lý AUD-07 safety, AUD-10 knowledge, AUD-15 research, AUD-17 code mismatch thế nào? | **A. Giữ owner L3, mở policy/research/reconciliation gates**, không tự thêm module | B. Dừng L3 cho đến khi có nghiên cứu/đối chiếu code hoàn chỉnh |
| **R1-Q6** | Sau khi chốt R1-Q1..05, cách cập nhật GitHub? | **A. Soạn Canonical Diff v2 và L3 Decision Log để duyệt; chỉ sau đó sửa 3.2 và tạo PR, không tự merge** | B. Sửa canonical ngay khi duyệt Q1..05; nhanh hơn nhưng khó review delta |

**Mẫu trả lời:** `R1-Q1=A; R1-Q2=A; R1-Q3=A; R1-Q4=A; R1-Q5=A; R1-Q6=A; Góp ý: ...`

---

## 8. Danh mục bàn giao cho vòng tiếp theo

Nếu R1-Q1..06 được duyệt:
1. Lập **L3 Resolution Decision Log** có trạng thái `APPROVED_L3_STRUCTURE / NOT_APPLIED`.
2. Lập **Proposed Canonical Diff 3.2 v2** với 8 ADD, 2 Group, 7 contracts, Age Matrix và Change Log; kiểm tra không ghi đè nội dung baseline không liên quan.
3. Đối chiếu AUD-17 với tài liệu Pal hiện hành ở cấp *conflict mapping*; không sửa code.
4. Người dùng duyệt riêng việc **apply canonical diff** → cập nhật file `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md`, mở GitHub PR và chờ merge.
5. Sau khi cấu trúc L3 được merge, bắt đầu **L4 Capability Decomposition**, không làm ngược trình tự.

**Không thực hiện trong vòng này:** sửa canonical 3.2, viết lại 3.4, gán toàn bộ MR-ID, phân rã L4, chốt MVP, chỉnh code hoặc tạo GitHub PR.