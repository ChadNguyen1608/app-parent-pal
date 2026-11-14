# PARENT-PAL — P5: Hợp đồng chức năng L4, phản biện độc lập về mục tiêu và điều kiện chuyển P6

**Ngày:** 2026-11-10 · **Owner Review:** 2026-11-11 · **Trạng thái:** `P5_OWNER_APPROVED_AT_SPEC_LEVEL / P6_BLOCKED_NO_INDEPENDENT_AGENT_RUNTIME`; **phạm vi** chỉ ba L3 thử nghiệm.  
**Nền tảng:** Blueprint 3.2-R1/3.3/3.4, phương pháp rà soát nhiều lượt (Multi-Pass) thử nghiệm, phản hồi của Chủ sản phẩm về Phân quyền/Cân bằng kế hoạch và danh mục test hợp nhất P5.  
**Thực tế triển khai:** Các vai thiết kế, kiểm thử, phản biện và tổng hợp được phân tích qua những lượt riêng, **chưa có sub-agent hoặc mô hình độc lập thực sự được khởi chạy**; chưa chạy kiểm thử phần mềm hay benchmark của nhà cung cấp AI. Ghi riêng `independent_review_status=NOT_AVAILABLE`.

## 1. Cấu trúc L4 ứng viên sau hợp nhất

| L3 | Kết quả chức năng ứng viên | Đề xuất xử lý | Điều kiện nghiệm thu và giới hạn | Phụ thuộc và đơn vị phụ trách |
|---|---|---|---|---|
| F01-G04-M01 | `ACCESS-DECIDE` (ID minh họa `F01-G04-M01-001`) | **KEEP** | `authorize(actor, action, resource, purpose, scope, policy_version)` → ALLOW/DENY/INDETERMINATE; enforcement fail-closed; kiểm lại trước mutation/model call; role primary manager vs observer theo plan scope | F01-G04 policy; F01-G05 role transition; F07-G06 purpose-bound data controls; F04-G06 approval |
| F01-G04-M01 | `ACCESS-PREVIEW` | **DEFER** | Chỉ xem metadata quyền sau authorize riêng; không tiết lộ nội dung hay existence resource ngoài scope | Read model/UI F01, chưa chứng minh outcome L4 độc lập |
| F01-G04-M01 | `ACCESS-DISPUTE` | **MOVE/DEFER** | Không tự tạo tranh chấp chỉ vì nhiều adults; khi 0 hoặc >1 primary trong cùng scope, deny mutation, chuyển workflow giải quyết theo quyền | F01 policy state; F07-G07 audit/ops có thể hỗ trợ; case owner UNKNOWN |
| F06-G07-M01 | `ASSESS` | **KEEP** | Input: authorized submission+exact approved rubric; output: temporary evidence-linked result hoặc UNABLE_TO_ASSESS; rubric eligibility là precondition, rubric provenance F07 | F04-G05 submission; F07-G02 knowledge source; F06 assessment |
| F06-G07-M01 | `REVIEW` | **GIỮ_CÓ_ĐIỀU_KIỆN** | PENDING/ASSIGNED/RESOLVED/REASSIGN_REQUIRED với reviewer đúng quyền, case idempotency; không auto-verified | F06 reviewer workflow. Nếu queue không có outcome nghiệp vụ riêng thì MERGE thành assessment state |
| F06-G07-M01 | `CORRECT` | **KEEP** | Authorized versioned correction; optimistic concurrency; giữ history; reports enforce data rights và cache version | F06 assessment owner; F06-G05 rendering/report permission |
| F04-G02-M03 | `BALANCE` | **KEEP** | Validate candidate weekly schedule, family bar → reviewed default bar, protected hard-cap > preference, explain infeasible/uncertain, no direct commit; scope owner dữ liệu phải rõ | F04-G02-M02 tạo phương án/slot; F04-G02-M03 validation; F04-G01 plan baseline |
| F04-G02-M03 | `EXCEPTION` | **KEEP** | Soft-cap only; P1/authorized primary approval; max 60 calendar days; at least 7 full days between similar exceptions; reject protected hard-cap; expiry/re-evaluation idempotent; don't mutate plan automatically | F04-G02-M03 evaluate/expiry; F04-G06 approve/commit request; F04-G01 plan baseline |
| F04-G02-M03 | `EXPIRY` | **MERGE** | Expiration is a trigger of exception lifecycle, not independent value | F04-G02-M03 → F04-G06 when adjustment needed |

**Kết quả đề xuất:** 6 L4 trọng tâm = 1 Phân quyền, 3 Đánh giá học tập, 2 Cân bằng kế hoạch. ID minh họa cũ vẫn chỉ để tham chiếu, chưa được phê duyệt chính thức. Chưa cấp ID ổn định mới.

## 2. Hợp đồng nghiệm thu và các điều kiện an toàn không được vi phạm

### Phân quyền truy cập (Access Policy)
- `plan_scope` defines the unique manager constraint (one primary per scope, versioned) while observer can `read` authorized data and `propose/comment` but not `update/delete/approve/commit`.
- Application role ≠ legal custody. Consent, Journal access and adulthood are purpose/jurisdiction specific; neither primary nor paying parent automatically reads Journal.
- Proposed handover: authorized review, change version, audit, revoke previous rights, recheck pending mutations. On ambiguity fail-closed.
- `INDETERMINATE` must be translated into enforcement DENY; never allow AI/model to override authorization.

### Đánh giá học tập (Academic Assessment)
- Rubric must match `curriculum/subject/grade/scope/version` and source approval; pin version for assessment run.
- Result states: `REQUESTED → ELIGIBILITY_CHECKED → PENDING_ASSESSMENT → PROVISIONAL|UNABLE_TO_ASSESS`. `PROVISIONAL → REVIEW_PENDING → REVIEW_RESOLVED` if human review exists. `PROVISIONAL/REVIEW_RESOLVED → CORRECTED_VERSION`, never overwrite earlier result.
- `teacher_verified` requires independently verified teacher provenance; never inferred from caregiver/reviewer click.
- Provider timeout, unreadable handwriting or partial evidence cannot be mislabeled as wrong answer. Retention, AI efficacy and cost per successful assessment require benchmark.
- Reports are F06-G05 responsibility and must revalidate access and data version; provider billing is not guaranteed exactly-once by app dedupe.

### Cân bằng kế hoạch (Balanced Planning)
- `resolve_bar()`: authorized family config if applicable → approved default by cohort/context/version → `UNKNOWN` if no applicable valid standard; BAR-1 fixture never becomes default.
- `find_weekly_options()` in F04-G02-M02; `validate_balance(option)` in F04-G02-M03. Return suggestions when valid; only `NO_FEASIBLE_OPTION` after bounded eligible weekly slots/options are evaluated against the defined constraints. `INSUFFICIENT_DATA` is different from mathematical infeasibility.
- `primary manager` approves within scope; child and observer can propose, cannot silently commit. A self-managed user is not required to share plan with parents.
- Exception requests apply only to soft/normal caps, not protected hard-cap; duration ≤60 calendar days and similarity gap ≥7 complete days, versioned anti-stacking; amendment requires revalidation/approval. **Similarity, dates and emergency policy remain open.**
- `occupied_minutes=90`, `sum_activity_minutes=120`, `overlap=30` for 17:00–18:00 and 17:30–18:30; these do not define physiologic/educational effort load.

## 3. Phản biện đối kháng: chủ động tìm giả định sai

| Mã | Giả định dễ sai | Tình huống phản ví dụ | Kết luận và hành động |
|---|---|---|---|
| AR-01 | “Chỉ một primary trong gia đình” | Hai trẻ trong một family có người quản lý khác nhau | Unique primary **per plan scope**, không khóa unique ở toàn family; source owner nói một manager trong phạm vi quản lý, cần giữ semantics rõ |
| AR-02 | “Observer chỉ được xem” | Observer được phép đề xuất thay đổi nhưng không thể commit | Split read/propose/comment vs mutate/approve; deny elevation |
| AR-03 | “P1 là primary được duyệt tất cả” | P1 xin ngoại lệ vượt protected hard-cap hoặc đọc Journal | Primary không vượt protected hard-cap và không có quyền Journal mặc định |
| AR-04 | “Không còn slot trong lịch là không khả thi” | Slot trống có nhưng vượt hard-cap; hoặc thuật toán chưa thử hết slot hợp lệ | Phân biệt `NO_FEASIBLE_OPTION` với `SEARCH_LIMIT_REACHED/INSUFFICIENT_DATA`; chỉ báo phụ huynh sau khi kiểm tra phạm vi tuần đã xác định |
| AR-05 | “Default standard luôn tồn tại” | Default cho lớp 3 thiếu nguồn/expired; family bar chưa set | Fallback chỉ dùng bản approved/effective, còn lại UNKNOWN. Cần Reference Standards Registry |
| AR-06 | “60 ngày + 7 ngày là mức an toàn khoa học” | Chuỗi ôn thi có đúng 60 ngày nhưng gây căng thẳng | Đây là policy Owner, không phải clinical cutoff; vẫn cần safety/wellbeing review |
| AR-07 | “7 ngày có nghĩa ngày thứ bảy có thể bắt đầu lại” | Kỳ 1 kết thúc 01/12, kỳ 2 bắt đầu 08/12 có 6 ngày trống | Cần **7 complete calendar days** giữa hai kỳ theo local timezone → với ví dụ này phải từ 09/12; rule là working default, chưa owner chốt |
| AR-08 | “LLM đã chấm được toán lớp 3 nên đạt lớp 1–9” | Chữ viết tay, nhiều môn, bài có ảnh mờ, lỗi high-confidence | Benchmark theo task/grade/mode, expert labels, negative + abstention; không kết luận từ pilot toy |
| AR-09 | “Một review case tương đương một L4 độc lập” | MVP chỉ gửi cảnh báo kết quả cần xem, không có queue reviewer | `REVIEW` GIỮ_CÓ_ĐIỀU_KIỆN, có thể MERGE nếu thiếu user/operational outcome |
| AR-10 | “Hợp nhất 43+24 vào 58 là đã đạt coverage toàn hệ thống” | Test còn thiếu on-device UX, cross-module invariants và legal country variants | 64 chỉ là candidate suite ba L3; không có thực thi, không thay P8 cross-module review |

## 4. Rà soát ranh giới trách nhiệm giữa các module

| Luồng nghiệp vụ | Module phụ trách chính | Dữ liệu/hợp đồng trao đổi | Điều kiện không được vi phạm |
|---|---|---|---|
| Child/observer proposal → change approval | F04-G06 | `proposal_id, plan_version, actor_role, approver_scope` | Không chuyển proposal thành commit; observer không approve |
| Candidate weekly options → balance validation | F04-G02-M02 → M03 | `candidate_slot, schedule_version, constraint_version` | Không chèn lịch vượt hard-cap; không gọi failed search là impossible nếu chưa exhaustive |
| Exception validation → approval → plan baseline | F04-G02-M03 → F04-G06 → F04-G01 | `exception_type, similarity_key, start/end, cap_version, approval_version` | Không override protected hard-cap, anti-stacking, không auto-rewrite baseline |
| Submission → assessment → report | F04-G05 → F06-G07 → F06-G05 | `submission/evidence_ref, rubric_ver, assessment_ver, provenance` | Temporary ≠ verified; versioned correction; report access separate |
| Authorization and privacy before AI call | F01-G04 + F07-G06 → F07-G03/F06 | `decision, purpose, scope, effective_ver, expiry` | Recheck revocation before model/cache; fail-closed |

**Các điểm chỉnh trong P5 so với tài liệu cũ:** `L3C-03` only Journal F05/F07, not general Access owner contract; F04-G01 owns plan baseline, F04-G02 schedule, F04-G06 approval; 3.3 inventory baseline stale vs 3.2-R1 (51 groups/106 L3); `MR-040` trace unresolved in Master v1.2. Do not silently overwrite canonical sources.

## 5. Điều kiện chuyển P6 (duyệt phương pháp, chưa phát hành ứng dụng)

| Điều kiện | Trạng thái | Bằng chứng cần có |
|---|---|---|
| Owner response recorded | **APPROVED_AT_SPEC_LEVEL** | R1=A, R2=A, R3=A, gồm 6 test mới trong baseline 64; xem P5 Owner Decision Log |
| Trace test old/new | **DESIGN_CHECKED** | 43/43 old, 24/24 gap mapped, 6 added, 64 candidate suite |
| Contract boundaries | **DESIGN_CHECKED_CONDITIONAL** | 6 L4 candidates + AR-01..10; case owner unknown giữ open |
| Independent sub-agent reviewer | **BLOCKED / NOT_AVAILABLE** | PR #18 đã Closed, không còn được dùng; chỉ mở P6 khi có agent thay thế với lượt chạy thực, context riêng, model/prompt/version/run IDs và log đối chiếu |
| Legal/privacy/safety/education validation | **UNKNOWN** | MR/legal-review/safety standards; không phải điều kiện chặn phê duyệt *phương pháp*, nhưng chặn production |
| Runnable code tests/LLM benchmarking | **NOT_EXECUTED** | Sau design approval mới chuẩn bị dataset/prototype/QA |
| Stable IDs, canonical updates | **NOT_APPROVED** | Không sửa 3.2/3.3/3.4, không merge PR #17 |

## 6. Phương pháp mở rộng sang 103 L3 còn lại

- Chạy QA-first từ 3.2/3.3/3.4 và scenario, tạo candidates, adversarial challenge và rework, sau đó owner review expected outputs.
- **Mỗi batch:** cross-module interface scan với L3 liền kề; **sau mọi batch:** regression vào test đã duyệt, không đợi đến P8 mới biết owner conflict.
- **Nếu sub-agent thực sự được provision:** mỗi review stage phải chạy trong context tách biệt với primary source và evidence; mã reviewer không được dùng nhận xét/đề xuất ban đầu làm nguồn chân lý. Bắt buộc có output artifact, trace, disagreement log và deterministic validation.
- Nếu hạ tầng **không** hỗ trợ sub-agent độc lập, công bố `ROLE_SEPARATED_SINGLE_MODEL` và dùng phương án phản biện tách lượt, không gắn nhãn độc lập.
- Không tự quyết khoa học/luật khi thiếu nghiên cứu; mở backlog with evidence requirement, owner scope và release gate.

## 7. Những quyết định Chủ sản phẩm đã chốt

- **R1=A, ĐÃ CHỐT:** Dùng 64 test thiết kế làm baseline pilot, không phải chứng nhận 64 test đã chạy.
- **R2=A, ĐÃ CHỐT:** `similar` = cùng `plan_scope`, cùng `constraint` được nới và cùng `purpose`, chống đổi nhãn; tối đa 60 ngày mỗi kỳ, cách 7 ngày trống hoàn chỉnh; không vượt protected hard-cap.
- **R3=A, ĐÃ CHỐT:** Không có Primary Manager hợp lệ hoặc role xung đột thì fail-closed cho plan mutation; cung cấp luồng xác minh/bàn giao; Observer không tự nâng quyền.

**Phạm vi:** P5 được phê duyệt ở **mức đặc tả**; P6 đang `BLOCKED_NO_INDEPENDENT_AGENT_RUNTIME`, không tự chuyển sang `P6_APPROVED`. Xem [Decision Log](Feature_3_2_L4_P5_Owner_Decision_Log_APPROVED.md) và [P6 Plan](Feature_3_2_L4_P6_Live_Validation_Plan_REVIEW.md).

## 8. Nhật ký thay đổi

`P5-CONTRACT-01` consolidated 6 L4 core + 3 deferred/merged outcomes; `P5-AR-01` phản biện 10 counterexamples; `P5-XMOD-01` cross-module boundary audit; `P5-GATE-01` gate P6 và future sub-agent requirements.

**Cập nhật phụ thuộc (2026-11-11):** PR #18 đã Closed / chưa merge, không còn là lựa chọn chạy P6. Kế hoạch P6 và nhật ký quyết định P5 đã được chỉnh để yêu cầu xác minh hệ thống phản biện thay thế. **Không sửa canonical, không cấp stable L4 ID, không merge PR #17.**
