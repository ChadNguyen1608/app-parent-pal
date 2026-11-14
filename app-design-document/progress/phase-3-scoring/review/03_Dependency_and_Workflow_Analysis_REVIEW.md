# 03 — Phụ thuộc, workflow và chọn Tier-3

**Trạng thái:** `REVIEW / DEPENDENCIES CANDIDATE` · **Người soạn:** AI (Claude), chưa kiểm chứng độc lập · **Nguồn:** HEAD `9043c88`.
**Dữ liệu:** `data/dependencies.json` (95 cạnh), `data/graph_results.json`. **Script:** `tools/graph.py`.

Mọi cạnh đều ở trạng thái `CANDIDATE`: theo 3.3 §6.2, cạnh chỉ thành `CONFIRMED` sau khi được thẩm định (MR-040). Đây **không phải** sơ đồ kỹ thuật đã duyệt, cũng không phải thứ tự build.

## 1. Cách dựng

- **95 cạnh tường minh** giữa module. Mỗi cạnh có: loại F/D/P/S/O, HARD hoặc SOFT, vòng đời BUILD/TEST/RELEASE/RUN, lý do, cách thay thế và nguồn L4.
- **Bốn gói dịch vụ dùng chung:** module nào cần thì nối một cạnh tới cả gói, không tạo hàng chục cạnh trực tiếp giả tạo.

| Gói | Thành viên | Ai cần |
|---|---|---|
| `B_AUTHZ` | F01-G01-M01, F01-G01-M02, F01-G04-M01, F07-G06-M01 | Mọi module có dữ liệu cá nhân (P, RUN) |
| `B_CHILD_SCOPE` | F01-G02-M01, F01-G03-M01, F01-G04-M02, F01-G05-M01 | Mọi module có dữ liệu trẻ (P, RUN); workflow chỉ có Parent App thì bỏ phần ghép Child App |
| `B_AI_GATE` | F07-G03-M01, F07-G03-M02, F07-G04-M01, F07-G05-M01, F07-G04-M02 | Mọi đầu ra do AI sinh: OD-05, an toàn chạy trước AI (S, RELEASE) |
| `B_LIFECYCLE` | F01-G06-M01, F07-G06-M02 | Trước khi dùng dữ liệu thật của trẻ (S, RELEASE; H4 đang mở) |

- Sau khi mở rộng các gói, đồ thị có **951 cạnh** để kiểm vòng lặp và tính bao đóng của workflow.

## 2. Vòng phụ thuộc

- **Lúc build (BUILD): 0 vòng.**
- **Lúc chạy (RUN): có vòng trong lõi định danh và phân quyền.** Các module F01-G02-M01, F01-G03-M01, F01-G04-M01, F01-G04-M02, F01-G05-M01, F07-G06-M01 tham chiếu lẫn nhau. Ví dụ: tạo hồ sơ trẻ cần quyết định phân quyền, còn phân quyền lại cần chủ thể, chế độ và consent.
  - Vòng này phản ánh đúng thiết kế. Theo 3.3 §6.2 không được để thành vòng build.
  - **Đề xuất:** dựng nhóm này thành một thành phần "Identity & Authorization Core" có giao diện chung, thứ tự khởi tạo rõ ràng (bootstrap: tạo hộ → tạo hồ sơ trẻ → ghi consent → đặt mode → bật policy) và kiểm thử tích hợp chung.
  - **Rủi ro:** 4 trong 6 module này chưa từng được kiểm độc lập (Access Policy, Consent Ledger, Mode State, Purpose-bound Access).

## 3. Module nền tảng, an toàn và đường găng

- **Nền tảng (fan-in HARD trong Tier-3, đã tính gói):**
  - F01-G01-M01, F01-G04-M01, F07-G06-M01: 56;
  - F07-G06-M02 và F01-G01-M02: 55;
  - F01-G03-M01: 54;
  - F01-G02-M01, F01-G04-M02, F01-G06-M01: 53;
  - F01-G05-M01: 52.
  - Không suy ra điểm từ số cạnh. Số cạnh chỉ dùng làm căn cứ cho `dependency_enablement` (3.3 §6.2).
- **Lõi nghiệp vụ có fan-in cao:**
  - F04-G01-M01 Plan Structure và F07-G01-M01 Content CMS: 5;
  - F07-G04-M01, F07-G03-M02, F07-G05-M01: 4;
  - F02-G01-M01, F04-G03-M01, F04-G04-M01, F06-G02-M01, F07-G03-M01: 3.
- **An toàn bắt buộc (S, HARD):**
  - F04-G02-M03 Balanced Planning: kiểm mọi lịch được soạn;
  - F05-G01-M02 Guardrails: chặn trước mọi câu trả lời hội thoại;
  - F07-G05-M01 Safety Triage: chạy trước định tuyến AI;
  - F07-G01-M01 Content CMS: chứa nội dung tĩnh OD-03;
  - F02-G03-M02 Non-labeling Review: bắt buộc khi có observation hoặc insight.
- **Đường găng (chuỗi HARD dài nhất, BUILD+RUN):**
  - **W1:** Summary Rendering → Progress Rules → Activity Event Log → Check-off → Daily Task View → Task Ownership → Plan Structure → Identity & Authorization Core.
  - **W2:** Correction → Versioned Profile → Intake → Identity & Authorization Core.
  - Cả hai đường đều kết thúc ở lõi định danh, nên lõi này là nút cổ chai chung.

## 4. Workflow giả thuyết

Workflow là **công cụ để quyết định chấm sâu ở đâu**, không phải quyết định MVP. Mọi workflow đều đi theo vòng: Hiểu trẻ → Định hướng → Kế hoạch → Thực hiện → Phản hồi → Đánh giá.

| Mã | Tên | App | Cohort | Module bắt buộc (bao đóng HARD) | Tùy chọn | E2 bắt buộc | Module có G-Legal = BLOCKED trong bao đóng |
|---|---|---|---|---|---|---|---|
| W1 | Lập lịch & thực thi cùng con | Parent + Child App | A2–A3 (A1/A4 có điều kiện) | 32 | 11 | F04-G02-M01 | F01-G06-M01, F07-G06-M02 (H4); F07-G05-M01 (FR-03, xem §5) |
| W1E1 | W1 không dùng LLM | Parent + Child App | A2–A3 | 24 | 0 | — | F01-G06-M01, F07-G06-M02 (H4) |
| W2 | Pal đồng hành phụ huynh | Chỉ Parent App | Phụ huynh của A0–A3 | 26 | 7 | F05-G01-M01, F03-G05-M01 | H4 (2); FR-03 (3, xem §5) |
| W3 | Tiếng nói của trẻ (mở rộng W1) | Parent + Child App | A2–A4 | 49 | 0 | F04-G02-M01, F05-G01-M01 | 9 module: H4, FR-03, Nhật ký |

## 5. Gate theo ngữ cảnh

Theo 3.3 §3, gate được xét theo module, cohort và ngữ cảnh dữ liệu, không áp chung cho mọi trường hợp.
- **FR-03** chỉ áp cho việc **xử lý yêu cầu của trẻ** khi cơ sở pháp lý là UNKNOWN.
  - Trong W1, Safety Triage và AI chỉ xử lý đầu vào của **phụ huynh**. Trong W2, Pal chỉ phục vụ **phụ huynh**. Vì vậy FR-03 không chặn hai workflow này. G-Legal tại đó trở về UNKNOWN chung: dữ liệu thật của trẻ vẫn bị từ chối cho đến khi có cơ sở pháp lý.
  - Trong W3, trẻ trò chuyện trực tiếp với Pal, nên FR-03 **chặn thật**.
- **H4** áp cho **mọi** workflow có dữ liệu thật: xóa và lưu giữ là điều kiện bắt buộc trước khi dùng dữ liệu thật.

## 6. Giá trị của từng phần vòng lặp

| Phần vòng lặp | Có tự tạo kết quả hữu ích không? | Ghi chú |
|---|---|---|
| Kế hoạch + Thực hiện (W1E1) | **Có.** Có lịch tuần cân bằng, nhắc việc, đánh dấu hoàn thành, tóm tắt tuần | Không cần AI. Prototype và Plan A đã có phần lớn hành vi |
| Kế hoạch có Pal soạn (W1) | Có, thêm giá trị khác biệt (Pal soạn lịch từ mô tả) | Thêm 8 module: gói AI và nội dung tĩnh |
| Định hướng/hiểu trẻ không có Kế hoạch (W2) | Có một phần: trả lời và gợi ý cho phụ huynh, nhưng **không khép vòng** nếu thiếu bước thực hiện | Phụ thuộc kho tri thức **đã duyệt**. Hiện toàn bộ nội dung kiến thức đang ở trạng thái "nháp, người soạn AI" |
| Phản hồi/phản tư của trẻ (W3) | Chỉ có ý nghĩa khi đã có W1 | Có 9 module bị chặn pháp lý |

## 7. Chọn Tier-3 và quy tắc cho quay lại

- **Tier-3 = 66 module:** hợp của phần bắt buộc và tùy chọn của W1, W2, W3, cộng các module được đưa vào lại.
  - Theo tier: CORE_VALUE 39 · MIN_FOUNDATION 25 · DEFERRED 2 (F02-G03-M01, tùy chọn của W2; F02-G03-M02, được đưa lại vì là phụ thuộc an toàn HARD của F02-G03-M01).
  - Con số này **lớn hơn khoảng 30–45 mà prompt dự kiến**, vì W3 tự nó đã cần 49 module. Tôi giữ nguyên 66 thay vì cắt bớt, để không bỏ sót phần nền tảng.
- **Chỉ chấm thô (COARSE): 40 module.** Danh sách ở `02_L3_106_Assessment_Registry_REVIEW.md` §4.
- **Theo dõi theo độ nhạy (CP-05), chưa kích hoạt:**
  - F07-G03-M03 Multimodal: nếu nhập thời khóa biểu bằng tay quá vướng (MR-010). Prototype có đọc ảnh thời khóa biểu.
  - F03-G03-M02 Accessibility: nếu nhóm thử nghiệm có trẻ có nhu cầu đặc biệt.

## 8. Đồ thị cấp L2 (chỉ từ 95 cạnh tường minh, không tính gói)

| Group nguồn (cần) | Group đích (cung cấp) | HARD/SOFT | Số cạnh module |
|---|---|---|---|
| `F01-G02` | `F01-G01` | HARD | 1 |
| `F01-G03` | `F01-G02` | HARD | 1 |
| `F01-G04` | `F01-G03` | HARD | 1 |
| `F01-G04` | `F01-G05` | HARD | 1 |
| `F01-G05` | `F01-G03` | HARD | 1 |
| `F01-G06` | `F07-G06` | HARD | 1 |
| `F02-G02` | `F01-G03` | HARD | 1 |
| `F02-G05` | `F02-G01` | HARD | 1 |
| `F02-G05` | `F04-G01` | SOFT | 1 |
| `F02-G06` | `F02-G05` | HARD | 1 |
| `F03-G04` | `F03-G03` | SOFT | 1 |
| `F03-G05` | `F03-G03` | SOFT | 1 |
| `F03-G05` | `F07-G01` | HARD | 1 |
| `F03-G05` | `F07-G02` | HARD | 1 |
| `F04-G01` | `F03-G04` | SOFT | 1 |
| `F04-G01` | `F03-G05` | SOFT | 1 |
| `F04-G02` | `F02-G01` | HARD | 1 |
| `F04-G02` | `F03-G03` | SOFT | 2 |
| `F04-G02` | `F04-G01` | HARD | 1 |
| `F04-G03` | `F01-G04` | HARD | 1 |
| `F04-G03` | `F04-G01` | HARD | 1 |
| `F04-G04` | `F04-G03` | HARD | 1 |
| `F04-G04` | `F07-G01` | SOFT | 1 |
| `F04-G05` | `F04-G04` | HARD | 2 |
| `F04-G06` | `F04-G01` | HARD | 2 |
| `F04-G06` | `F04-G02` | HARD | 1 |
| `F04-G06` | `F04-G03` | HARD | 1 |
| `F04-G07` | `F04-G03` | HARD | 1 |
| `F05-G01` | `F02-G05` | SOFT | 1 |
| `F05-G01` | `F07-G01` | HARD | 2 |
| `F05-G01` | `F07-G02` | HARD | 1 |
| `F05-G01` | `F07-G02` | SOFT | 1 |
| `F05-G02` | `F04-G03` | SOFT | 1 |
| `F05-G03` | `F07-G01` | HARD | 1 |
| `F05-G04` | `F05-G06` | HARD | 1 |
| `F05-G04` | `F07-G06` | HARD | 1 |
| `F05-G05` | `F05-G04` | HARD | 1 |
| `F05-G05` | `F05-G06` | HARD | 1 |
| `F05-G06` | `F05-G04` | HARD | 1 |
| `F05-G06` | `F07-G06` | HARD | 1 |
| `F06-G01` | `F04-G05` | HARD | 1 |
| `F06-G02` | `F04-G03` | HARD | 1 |
| `F06-G02` | `F06-G01` | HARD | 1 |
| `F06-G04` | `F02-G03` | HARD | 1 |
| `F06-G04` | `F06-G02` | HARD | 1 |
| `F06-G05` | `F06-G02` | HARD | 1 |
| `F06-G05` | `F06-G04` | SOFT | 1 |
| `F06-G06` | `F04-G06` | HARD | 1 |
| `F06-G06` | `F06-G05` | HARD | 1 |
| `F06-G07` | `F06-G01` | HARD | 1 |
| `F07-G01` | `F07-G02` | HARD | 1 |
| `F07-G02` | `F07-G01` | HARD | 1 |
| `F07-G03` | `F07-G04` | HARD | 1 |
| `F07-G03` | `F07-G05` | HARD | 1 |
| `F07-G05` | `F07-G01` | HARD | 1 |
| `F07-G06` | `F01-G04` | HARD | 1 |
| `F07-G07` | `F07-G03` | HARD | 1 |
| `F08-G03` | `F02-G02` | SOFT | 1 |

## 9. Danh sách 95 cạnh module

| Nguồn (cần) | Đích | Loại | HARD/SOFT | Vòng đời | Lý do | Cách thay thế | Căn cứ |
|---|---|---|---|---|---|---|---|
| `F01-G02-M01` | `F01-G01-M01` | F | HARD | BUILD | Pairing and Parent PIN need authenticated caregiver account | — | G01 |
| `F01-G02-M02` | `F01-G02-M01` | F | HARD | BUILD | Members belong to an existing household | — | G01 |
| `F01-G03-M01` | `F01-G02-M01` | P | HARD | BUILD | Child profile creation scope derives from current household authorization (G14) | — | G14 |
| `F01-G05-M01` | `F01-G03-M01` | D | HARD | BUILD | Mode is per child subject | — | B01 Mode State log |
| `F01-G04-M02` | `F01-G03-M01` | D | HARD | BUILD | Consent recorded per subject | — | B01 Consent log |
| `F01-G04-M01` | `F01-G05-M01` | P | HARD | RUN | Delegated rights depend on effective autonomy mode | — | P6 Access Policy log |
| `F01-G04-M01` | `F01-G04-M02` | P | HARD | RUN | Authorization checks consent where processing relies on it | — | P6/B01 |
| `F07-G06-M01` | `F01-G04-M02` | P | HARD | RUN | Purpose-bound access evaluates consent/lawful basis | — | B01 Purpose-bound log |
| `F01-G03-M02` | `F01-G03-M01` | F | HARD | BUILD | Corrections target Core Identity facts | Direct caregiver edit in Core Identity | G14 |
| `F01-G05-M02` | `F01-G05-M01` | F | HARD | BUILD | Transitions commit through Mode State | Caregiver sets Mode State directly | G24 |
| `F01-G06-M01` | `F07-G06-M02` | F | HARD | RELEASE | Account deletion executes retention/purge rules | Manual purge runbook in pilot (synthetic data only) | G03 |
| `F02-G01-M02` | `F02-G01-M01` | F | HARD | BUILD | Answers enter profile only via Intake | — | G15 |
| `F02-G05-M01` | `F02-G01-M01` | D | HARD | BUILD | Profile versions are built from accepted intake facts | — | G16 |
| `F02-G02-M01` | `F01-G03-M01` | D | HARD | BUILD | Preferences are per child subject | — | G15 |
| `F02-G06-M02` | `F02-G05-M01` | F | HARD | BUILD | Corrections apply to remembered profile facts | — | G17 |
| `F02-G05-M02` | `F04-G01-M01` | F | SOFT | RUN | Child feedback targets plan/task items | Free-text feedback without plan link | G17 |
| `F02-G03-M01` | `F02-G03-M02` | S | HARD | RELEASE | Observations must pass non-labeling review before display | — | G16 |
| `F03-G05-M01` | `F07-G01-M02` | D | HARD | RUN | Grounded recommendation retrieves approved knowledge first | — | 3.3 §6.1 / G19 |
| `F03-G05-M01` | `F07-G02-M02` | D | HARD | RUN | Recommendations cite source tier (3.3 §6.1 example) | — | 3.3 §6.1 |
| `F03-G05-M01` | `F03-G03-M01` | D | SOFT | RUN | Age-appropriate scope | Age filter from Core Identity | G19 |
| `F03-G05-M02` | `F03-G05-M01` | F | HARD | BUILD | Review acts on generated recommendations | — | G20 |
| `F03-G04-M01` | `F03-G03-M01` | D | SOFT | RUN | Goal options per stage | Free-form goals | G19 |
| `F04-G01-M01` | `F03-G04-M01` | F | SOFT | RUN | Plans may link to goals | Plans without goals | G19/G21 |
| `F04-G01-M01` | `F03-G05-M02` | F | SOFT | RUN | Accepted recommendations become plan items | Parent adds items manually | G20 |
| `F04-G01-M02` | `F04-G01-M01` | F | HARD | BUILD | Templates instantiate plan structure | — | G21 |
| `F04-G02-M01` | `F04-G01-M01` | F | HARD | BUILD | Schedule is a version of a plan | — | G21 |
| `F04-G02-M01` | `F02-G01-M01` | D | HARD | RUN | Needs timetable/fixed activities/age from intake | — | prototype |
| `F04-G02-M01` | `F03-G03-M01` | D | SOFT | RUN | Age default budgets (prototype defaultBudget) | Hard-coded defaults | prototype |
| `F04-G02-M01` | `F04-G02-M03` | S | HARD | RUN | Every drafted schedule validated against hard/soft caps before release | — | P6 Balanced Planning log |
| `F04-G02-M02` | `F04-G02-M01` | F | SOFT | RUN | Conflict check on constructed schedule (3.3 §6.1: may use external calendar) | External calendar source | 3.3 §6.1 |
| `F04-G02-M03` | `F03-G03-M01` | D | SOFT | RUN | Age-based caps | Owner-approved fixed caps | P6 |
| `F04-G03-M01` | `F04-G01-M01` | F | HARD | BUILD | Tasks belong to plan | — | G21 |
| `F04-G03-M02` | `F01-G04-M01` | P | HARD | RUN | Routing resolves eligible approver from current authority | — | G04 |
| `F04-G06-M01` | `F04-G03-M02` | P | HARD | RUN | Change requests need an eligible approver | Restrict edits to primary caregiver | G04 |
| `F04-G06-M01` | `F04-G02-M03` | S | HARD | RUN | Approval binds Balanced Planning verdict (B01 v3.1) | — | G04/ADD |
| `F04-G06-M01` | `F04-G01-M01` | F | HARD | BUILD | Requests target plan version/lock | — | G04 |
| `F04-G06-M02` | `F04-G01-M01` | D | HARD | BUILD | History records committed plan versions | — | G04 |
| `F04-G04-M01` | `F04-G03-M01` | D | HARD | RUN | Daily view shows owned tasks for today | — | G22 |
| `F04-G04-M02` | `F04-G04-M01` | F | HARD | BUILD | Support attaches to a displayed task | — | G22 |
| `F04-G04-M02` | `F07-G01-M01` | D | SOFT | RUN | Approved help templates | Static hints in app bundle | G22 |
| `F04-G05-M01` | `F04-G04-M01` | F | HARD | BUILD | Check-off acts on a displayed task | Check-off from notification action (Plan A) | G22 |
| `F04-G05-M02` | `F04-G04-M01` | F | HARD | BUILD | Evidence attaches to a task | — | G05 |
| `F04-G07-M01` | `F04-G03-M01` | D | HARD | RUN | Reminders derived from scheduled tasks | — | G22 |
| `F04-G07-M01` | `F04-G07-M02` | P | HARD | RUN | Delivery obeys quiet hours/preferences | Fixed default quiet hours | G22 |
| `F05-G01-M01` | `F05-G01-M02` | S | HARD | RELEASE | Guardrails and output validation before any answer | — | G02 |
| `F05-G01-M01` | `F07-G01-M02` | D | HARD | RUN | Internal-first answers (FR-02 / KMAP §1.1) | — | G02 |
| `F05-G01-M01` | `F07-G02-M02` | D | HARD | RUN | Per-claim source and "chưa kiểm chứng" label | — | G02 FR02 |
| `F05-G01-M01` | `F07-G02-M01` | O | SOFT | RUN | Verification queue for external claims | Manual queue file (ref-hang-doi-kiem-chung.md) | G02 FR02 |
| `F05-G01-M01` | `F02-G05-M01` | D | SOFT | RUN | Pal memory/profile context | Stateless answers | CLAUDE.md memory |
| `F05-G01-M02` | `F07-G01-M01` | D | HARD | RELEASE | Reviewed static safety catalog (OD-03) | — | OD-03 |
| `F07-G05-M01` | `F07-G01-M01` | D | HARD | RELEASE | Static trusted-adult / 111/113/115 content | — | OD-03 |
| `F05-G02-M02` | `F05-G02-M01` | F | HARD | BUILD | Controls govern check-in invitations | — | G12 |
| `F05-G02-M01` | `F04-G03-M01` | D | SOFT | RUN | Timing from schedule (MR-032) | Fixed time window | G12 |
| `F05-G03-M02` | `F05-G03-M01` | F | HARD | BUILD | Review of drafted reflection | — | G12 |
| `F05-G03-M01` | `F07-G01-M01` | D | HARD | RUN | Approved prompt templates | — | G12 |
| `F05-G04-M02` | `F05-G04-M01` | F | HARD | BUILD | Retrieval over private entries | — | G13 |
| `F05-G04-M01` | `F05-G06-M02` | D | HARD | RELEASE | Journal data must have deletion lineage before real data (3.3 §6.1 pattern) | — | 3.3 §6.1/G03 |
| `F05-G04-M01` | `F07-G06-M01` | P | HARD | RUN | Private entries need purpose-bound access (3.3 §6.1 example) | — | 3.3 §6.1 |
| `F05-G06-M01` | `F05-G04-M01` | F | HARD | BUILD | Sharing grants over entries | — | G03 |
| `F05-G05-M01` | `F05-G06-M02` | D | HARD | RELEASE | Derived insight deletion (3.3 §6.1 example) | — | 3.3 §6.1 |
| `F05-G05-M01` | `F05-G04-M02` | D | HARD | RUN | Insight derived from retrieved entries | — | G13 |
| `F05-G05-M02` | `F05-G05-M01` | F | HARD | BUILD | Correction of insights | — | G13 |
| `F05-G06-M02` | `F07-G06-M02` | F | HARD | RELEASE | Deletion executes retention/backup purge | — | G03 |
| `F06-G01-M01` | `F04-G05-M01` | D | HARD | RUN | Completion events come from check-off | — | G06 |
| `F06-G01-M01` | `F06-G01-M02` | D | SOFT | RUN | Events carry source type | Single implicit source | G05/G06 |
| `F06-G02-M01` | `F06-G01-M01` | D | HARD | RUN | Progress computed from events | — | G06 |
| `F06-G02-M01` | `F04-G03-M01` | D | HARD | RUN | Denominator = planned tasks | — | G06 |
| `F06-G02-M02` | `F06-G02-M01` | F | HARD | BUILD | Exceptions adjust progress windows | — | G06 |
| `F06-G04-M01` | `F06-G02-M01` | D | HARD | RUN | Trends over progress results | — | G23 |
| `F06-G05-M02` | `F06-G02-M01` | D | HARD | RUN | Report content | — | G05 |
| `F06-G05-M02` | `F06-G05-M01` | P | HARD | RUN | Audience-specific disclosure (child vs parent view) | — | G05 |
| `F06-G05-M02` | `F06-G04-M01` | D | SOFT | RUN | Trend section | Current-week only | G23 |
| `F06-G06-M01` | `F06-G05-M02` | D | HARD | RUN | Review session uses summary | — | G23 |
| `F06-G06-M02` | `F06-G06-M01` | F | HARD | BUILD | Handoff from review outcome | — | G23 |
| `F06-G06-M02` | `F04-G06-M01` | F | HARD | RUN | Outcome becomes a plan change request | Parent edits plan directly | G23 |
| `F06-G04-M02` | `F06-G04-M01` | D | HARD | RUN | Insights interpret deterministic trends | — | G23 |
| `F06-G04-M02` | `F02-G03-M02` | S | HARD | RELEASE | Non-labeling review of generated interpretation | — | G23 |
| `F06-G07-M01` | `F06-G01-M02` | D | HARD | RUN | Assessment provenance (parent-confirmed vs teacher-verified) | — | G05 |
| `F07-G01-M02` | `F07-G01-M01` | D | HARD | BUILD | Retrieval over approved content | — | G10 |
| `F07-G01-M01` | `F07-G02-M01` | O | HARD | RELEASE | Only editorially approved content is published | Manual review in doc process | G10 |
| `F07-G02-M02` | `F07-G01-M01` | D | HARD | BUILD | Provenance attached to content revisions | — | G10 |
| `F07-G03-M01` | `F07-G04-M01` | S | HARD | RUN | Route guards use approved-scope policy (OD-05) | — | G02/OD-05 |
| `F07-G03-M01` | `F07-G03-M02` | O | HARD | RUN | Budget reservation before model dispatch | — | G11 |
| `F07-G03-M01` | `F07-G05-M01` | S | HARD | RUN | Safety rules before routing (H3 closed) | — | G02 |
| `F07-G04-M01` | `F07-G04-M02` | O | SOFT | RELEASE | Policy regression cases in evaluation suite | Manual review sample | G11 |
| `F07-G03-M03` | `F07-G03-M01` | F | HARD | BUILD | Modality orchestration behind router | — | G11 |
| `F07-G07-M02` | `F07-G03-M02` | D | HARD | RUN | Cost ops reconcile budget reservations | — | G09 |
| `F08-G01-M02` | `F08-G01-M01` | F | HARD | BUILD | Review of staged school data | — | G07 |
| `F08-G02-M02` | `F08-G02-M01` | F | HARD | BUILD | Referral to discovered expert | — | G07/G24 |
| `F08-G03-M02` | `F08-G03-M01` | D | HARD | RUN | Matching over directory listings | — | G24 |
| `F08-G03-M02` | `F02-G02-M01` | D | SOFT | RUN | Optional preferences | Broad matches | G24 |
| `F08-G04-M02` | `F08-G04-M01` | P | HARD | RUN | Import requires device consent | — | G07 |
| `F08-G05-M02` | `F08-G05-M01` | F | HARD | BUILD | Transactions on catalog offers | — | G08 |
| `F08-G06-M02` | `F08-G06-M01` | F | SOFT | RUN | Expenses against budgets | Expense log without budget | G08 |
| `F01-G06-M03` | `F01-G06-M02` | F | HARD | BUILD | Billing facts project entitlements | — | G09 |

## 10. Bao đóng module theo workflow

- **W1** (32 bắt buộc): `F01-G01-M01`, `F01-G01-M02`, `F01-G02-M01`, `F01-G03-M01`, `F01-G04-M01`, `F01-G04-M02`, `F01-G05-M01`, `F01-G06-M01`, `F02-G01-M01`, `F04-G01-M01`, `F04-G01-M02`, `F04-G02-M01`, `F04-G02-M02`, `F04-G02-M03`, `F04-G03-M01`, `F04-G04-M01`, `F04-G05-M01`, `F04-G07-M01`, `F04-G07-M02`, `F06-G01-M01`, `F06-G02-M01`, `F06-G05-M01`, `F06-G05-M02`, `F07-G01-M01`, `F07-G02-M01`, `F07-G03-M01`, `F07-G03-M02`, `F07-G04-M01`, `F07-G04-M02`, `F07-G05-M01`, `F07-G06-M01`, `F07-G06-M02`. Tùy chọn: `F01-G02-M02`, `F02-G05-M02`, `F03-G03-M01`, `F04-G03-M02`, `F04-G04-M02`, `F04-G05-M02`, `F04-G06-M01`, `F04-G06-M02`, `F06-G01-M02`, `F06-G02-M02`, `F06-G04-M01`
- **W1E1** (24 bắt buộc): `F01-G01-M01`, `F01-G01-M02`, `F01-G02-M01`, `F01-G03-M01`, `F01-G04-M01`, `F01-G04-M02`, `F01-G05-M01`, `F01-G06-M01`, `F02-G01-M01`, `F04-G01-M01`, `F04-G01-M02`, `F04-G02-M02`, `F04-G02-M03`, `F04-G03-M01`, `F04-G04-M01`, `F04-G05-M01`, `F04-G07-M01`, `F04-G07-M02`, `F06-G01-M01`, `F06-G02-M01`, `F06-G05-M01`, `F06-G05-M02`, `F07-G06-M01`, `F07-G06-M02`
- **W2** (26 bắt buộc): `F01-G01-M01`, `F01-G01-M02`, `F01-G02-M01`, `F01-G03-M01`, `F01-G04-M01`, `F01-G04-M02`, `F01-G05-M01`, `F01-G06-M01`, `F02-G01-M01`, `F02-G05-M01`, `F02-G06-M02`, `F03-G05-M01`, `F03-G05-M02`, `F05-G01-M01`, `F05-G01-M02`, `F07-G01-M01`, `F07-G01-M02`, `F07-G02-M01`, `F07-G02-M02`, `F07-G03-M01`, `F07-G03-M02`, `F07-G04-M01`, `F07-G04-M02`, `F07-G05-M01`, `F07-G06-M01`, `F07-G06-M02`. Tùy chọn: `F02-G01-M02`, `F02-G02-M01`, `F02-G03-M01`, `F03-G03-M01`, `F03-G04-M01`, `F04-G01-M01`, `F04-G03-M01`
- **W3** (49 bắt buộc): `F01-G01-M01`, `F01-G01-M02`, `F01-G02-M01`, `F01-G03-M01`, `F01-G04-M01`, `F01-G04-M02`, `F01-G05-M01`, `F01-G06-M01`, `F02-G01-M01`, `F02-G05-M02`, `F04-G01-M01`, `F04-G01-M02`, `F04-G02-M01`, `F04-G02-M02`, `F04-G02-M03`, `F04-G03-M01`, `F04-G03-M02`, `F04-G04-M01`, `F04-G05-M01`, `F04-G06-M01`, `F04-G07-M01`, `F04-G07-M02`, `F05-G01-M01`, `F05-G01-M02`, `F05-G02-M01`, `F05-G02-M02`, `F05-G03-M01`, `F05-G03-M02`, `F05-G04-M01`, `F05-G04-M02`, `F05-G06-M01`, `F05-G06-M02`, `F06-G01-M01`, `F06-G02-M01`, `F06-G05-M01`, `F06-G05-M02`, `F06-G06-M01`, `F06-G06-M02`, `F07-G01-M01`, `F07-G01-M02`, `F07-G02-M01`, `F07-G02-M02`, `F07-G03-M01`, `F07-G03-M02`, `F07-G04-M01`, `F07-G04-M02`, `F07-G05-M01`, `F07-G06-M01`, `F07-G06-M02`

**Nhật ký đưa module vào lại:** `F02-G03-M02` (HARD S/RELEASE dependency of Tier-3 F02-G03-M01)
