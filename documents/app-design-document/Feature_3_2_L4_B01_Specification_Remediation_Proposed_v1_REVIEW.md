# Parent-Pal — Batch 01 Specification Remediation (ChatGPT proposed v1)

**Ngày:** 2026-11-13  
**Trạng thái:** `PROPOSED_SPEC_CORRECTIONS / NOT_INDEPENDENTLY_REVERIFIED`  
**Nguồn đối chiếu:** `B01_Consolidation.zip` (C0–C5, owner-provided); [B01 Consolidation Owner Decision Log](Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md); [Master Index](Feature_3_2_L4_Owner_Decision_Register_INDEX.md).  
**Evidence origin:** `parent-pal-evidence@4209d52af3f233f69af26898fdf5e71988a477d7` chứa 5 pilot ZIP. Consolidation ZIP là attachment riêng, **không khẳng định đã lưu trong evidence repo**.
**Hiệu lực:** Đặc tả sửa đổi **đề xuất có truy vết**, KHÔNG phải sửa canonical Blueprint, không cấp stable L4 ID, không đồng nghĩa 46 findings đã được verified/closed.

## A. Phương pháp và phạm vi

- ChatGPT giữ vai trò **Feature Designer / Remediation Owner**: chuyển 42 Owner decisions thành những điều khoản testable; Claude chỉ nhận phần **kiểm định độc lập trên đặc tả do ChatGPT xuất bản**, không tự sửa và tự chấm đạt.
- Nguồn được đọc: Consolidation C2, C3, C4, C5 và báo cáo/registry liên quan; bản thiết kế của Claude là input cần kiểm tra, không được tự xem như đã accepted.
- Ưu tiên ngăn mâu thuẫn nghiệp vụ mức HIGH, hợp đồng API xuyên module và oracle test. Những điểm pháp lý, nghiên cứu tâm lý/độ tuổi, evidence thiếu hoặc implementation chưa thực hiện giữ `OPEN / RESEARCH_REQUIRED / INDEPENDENT_VERIFICATION_REQUIRED`.
- Không chốt bất kỳ quy tắc nghiệp vụ mới nào ngoài 42 Owner decisions. Những lựa chọn chi tiết về schema, mã trạng thái trong tài liệu này chỉ là **proposed implementation contracts** để reviewer kiểm tra.

## B. Bản sửa acceptance criteria/contract theo capability

### SR-01 — Purpose legal-basis gate [HIGH; RG-12; PA:F-015; CP-11]

**Thay thế logic cũ tại** `purpose-catalog-governance#AC-16`, `purpose-binding-gate#AC-27` và mọi consumer có khả năng trả ALLOW khi `LEGAL_UNKNOWN` với dữ liệu cá nhân thật.

**AC-LEGAL-01 (proposed):** Với request xử lý **dữ liệu cá nhân thật của trẻ**, nếu không có kết quả đánh giá căn cứ pháp lý *phù hợp cho đúng operation, purpose, subject, jurisdiction và thời điểm xử lý*, Purpose-bound Access trả `INDETERMINATE`/non-allow. Access Policy **DENY/fail-closed**, không thực hiện read, write, inference, report, cache population hoặc downstream processing.

**AC-LEGAL-02:** Purpose được Product Owner phê duyệt, role phụ huynh, consent ACTIVE, risk level LOW hoặc app feature “core” **không** được coi thay thế cho legal-basis assessment.

**AC-LEGAL-03:** Với dữ liệu synthetic/không còn là dữ liệu cá nhân theo kiểm tra phù hợp, gate chỉ được tiến hành theo ngữ cảnh test; vẫn cần Access Policy ALLOW và purpose constraints. Không đưa một flag client `is_mock=true` thành cách vượt quyền đối với dữ liệu thực.

**AC-LEGAL-04:** Mọi consumer (AI context assembly, reporting, exports, caches, background workers) phải dùng cùng policy decision snapshot có version/expiry và recheck trước data access; không cho consumer phụ sử dụng `COMPATIBLE` làm final ALLOW.

**Oracle:** `LEGAL_UNKNOWN + REAL_CHILD_DATA` → `DENY / NO_DATA_ACCESSED / NO_DERIVED_CACHE_WRITTEN` cho mọi consumer. **Bản sửa contract này chưa chứng minh legal basis đã được nghiên cứu, và gate dữ liệu thật tiếp tục đóng.**

### SR-02 — Hard-cap proposal vs approval [HIGH; RG-03; CR:QT-099; B01-CR-OD-05]

**AC-HARD-01:** Cho phép `SAVE_DRAFT` và `SUBMIT_FOR_DISCUSSION` dù đề xuất vi phạm protected hard-cap; lưu warning, violation codes và trạng thái riêng `NOT_APPROVABLE` hoặc invariant tương đương.

**AC-HARD-02:** Không cho `APPROVE`, `AUTO_APPROVE`, `APPLY`, `COMMIT` nếu còn protected hard-cap violation; cả Parent/AI/Child-directed đều không có quyền waive.

**AC-HARD-03:** Khi đề xuất được sửa thành hợp lệ, phải chạy Balanced Planning cho đúng revision mới; không tái sử dụng PASS của bản cũ.

**Oracle sửa `CR:QT-099`:** SUBMIT thành công ở discussion-only; APPROVE/APPLY bị DENY. **Không được đặt proposal nguy hiểm vào queue có khả năng tự duyệt.**

### SR-03 — Consent revoke, dispute và handover [HIGH; RG-01/02; CL:F-004/005; OQ-B01C-1]

**AC-CONSENT-01:** Việc thay Primary Caregiver **không tự revoke, reconfirm, suspend** consent history/state đã ghi. Provenance grantor giữ nguyên, current authorization luôn kiểm tra lại.

**AC-CONSENT-02:** Chỉ actor có quyền revoke caregiver-managed consent mới tạo event `REVOKED`. Supporter/Observer hoặc actor chưa xác minh không được khiến consent ACTIVE đổi sang REVOKED hoặc tình trạng “treo” bằng request revoke không có thẩm quyền. Có thể ghi `DISPUTE_REQUESTED` tách khỏi hiệu lực consent nếu quyền ghi dispute hợp lệ.

**AC-CONSENT-03:** **Delegated schedule-edit grants hợp lệ của trẻ được GIỮ NGUYÊN sau handover** (B01-C-OD-01), không tự suspend/chờ xác nhận lại của Primary mới. Từng mutation vẫn re-authorize theo current policy, scope, grant validity, lock và constraints. New Primary có thể thay đổi/revoke grants về sau.

**AC-CONSENT-04:** Riêng CR đã được Primary cũ APPROVED nhưng chưa APPLIED phải được new Primary duyệt lại; không được đồng nhất CR approval với delegated grants.

**Test cũ cần thay oracle:** `CL:QT-012/019/033/052` và `NT-003`; không để `REVIEW_REQUIRED` trong consent record bị hiểu là auto revoke/grant suspended. Nếu P6-AP-OD-02 có câu chữ áp cho loại grant khác child schedule delegation, ghi rõ loại grant và phạm vi trong bảng contract, không suy ra auto-suspend mọi grant.

### SR-04 — Mode ownership & age [HIGH; RG-04/05]

**AC-MODE-01:** Mỗi child profile có đúng một effective autonomy mode chung cho hoạt động của trẻ; chuyển mode của C1 không được thay mode, version hoặc request của C2. `UNSET` là trạng thái nội bộ, quyền sửa lịch fail-closed như PARENT_LED.

**AC-MODE-02:** Quyền chuyển mode thuộc người có quyền theo child/family, **không** được xác định bởi Primary Manager của một plan scope đơn lẻ. Plan-specific grants chi phối action cụ thể nhưng không biến thành per-plan mode.

**AC-MODE-03:** `PARENT_LED`: child không tạo official schedule CR, nhưng có thể bày tỏ nguyện vọng qua F05; `CHILD_EXECUTED`: tạo draft + submit và đợi caregiver approval; `CHILD_DIRECTED`: direct timetable edit khi bounded delegation cho phép, không bắt buộc tạo CR. Out-of-scope phải vào workflow approval.

**AC-MODE-04:** Không hard-block **toàn bộ** A0–A2 chỉ do tuổi nếu đã có mode/capability/authorization thích hợp; tuy nhiên không được tự mặc định cấp năng lực cho trẻ nhỏ vì thiếu research. Trường hợp thiếu evidence/capability: `UNKNOWN / fail-closed` cho hành động chưa được phép. Cần xác minh tuổi/capability policy theo MR-015 trước production.

**Test sửa:** `MS:QT-018`, `PS:QT-094`, `PS:QT-080`, `CR:QT-102`; supersede oracle P5 `MP-C21` chỉ ở phần mâu thuẫn Owner mới, giữ lịch sử baseline.

### SR-05 — Lock semantics & offline drafts [HIGH; RG-06; OQ-B01C-5/6]

**AC-LOCK-01:** Lock khóa **effective timetable**; bất kỳ direct mutation/commit thông thường nào, **kể cả người tạo lock**, đều bị chặn khi lịch còn LOCKED. Chỉ luồng `UNLOCK` hợp lệ hoặc `AUTHORIZED_OVERRIDE` có scope/version/audit mới thay hiệu lực lịch.

**AC-LOCK-02:** Lock không có maximum TTL cố định và không tự unlock. Reminder review là notification, không đổi trạng thái lock.

**AC-LOCK-03:** Actor được quyền vẫn có thể soạn/sửa draft và tạo nội dung offline dù effective timetable locked; lúc sync phải recheck mode/grant/lock/base version/constraints, không tự apply.

**AC-LOCK-04:** Lock một plan/slot chỉ có hiệu lực trong scope chính xác; không khóa Journal, toàn bộ child account hoặc các hoạt động nằm ngoài scope.

**Test sửa:** `plan-lock-control#AC-14`, `PS:QT-087`, `MS:QT-009`; thêm NT-006/007 và conflict/offline matrix.

### SR-06 — Change Request states, TTLs & handoff [RG-08/09/23; B01-C-OD-03]

**AC-CR-01:** `PENDING_REVIEW` hết hạn tại `submitted_at + 7 days` theo server time; `APPROVED` nhưng chưa `APPLIED` hết hạn tại `approved_at + 7 days`. At `now >= expires_at` không được approve/apply; CR mới có thể tạo lại.

**AC-CR-02:** Kế hoạch đổi version: pending chuyển REASSESSMENT_REQUIRED (không tự approve/apply); approved-unapplied INVALIDATED/new request. Lock: pending có thể giữ để review nhưng không apply, approved-unapplied invalidated. Caregiver đổi: pending chuyển người có quyền mới; approved-unapplied reapproval. Mode đổi làm mất quyền hoặc plan archived: pending/approved-unapplied invalidated.

**AC-CR-03:** `APPROVED` chỉ là authorization decision ở thời điểm duyệt, `APPLIED` chỉ sau kết quả commit được Plan Structure xác nhận trên baseline version mới.

**AC-CR-04:** Commit timeout/mất response dẫn tới `OUTCOME_UNKNOWN` hoặc trạng thái nội bộ tương đương; worker **reconcile trạng thái thật bằng idempotency key** trước retry. Không tạo duplicate plan version/history. `COMMIT_PENDING` không tự chuyển `COMMIT_FAILED` chỉ do timeout.

**AC-CR-05:** Người quản lý hợp lệ có thể sửa trực tiếp trong scope (không self-approve lần hai); child-directed direct mutation trong scope cũng đi qua F04-G01 commit gate, không cần tạo giả CR APPROVED.

**Ownership:** F04-G06-M01 review/approval + handoff, F04-G01-M01 plan commit/version, F04-G06-M02 reason & approver history; F04-G02-M03 validation. Phải chuẩn hóa state machine `SC-CR-LIFECYCLE` vs CR:F-022/025 ở vòng kiểm định độc lập.

### SR-07 — App Default Standard Bar, soft exceptions [RG-17/28]

**AC-BAR-01:** Nếu Family Standard Bar không có thì chọn App Default có kiểm chứng phù hợp child age/context/version. Không có default đủ chứng cứ → `UNKNOWN/UNVERIFIABLE`, **draft vẫn lưu** nhưng không được đánh dấu BALANCED/ACTIVE.

**AC-BAR-02:** Không đạt Standard Bar → draft/vi phạm minh bạch; commit đòi validation hợp lệ, ngoại lệ soft-cap được phép (nếu có), **không** vượt protected hard-cap.

**AC-BAR-03:** Bảo vệ continuity 60 ngày cùng constraint dù purpose đổi; gap ≥7 ngày trống hoàn chỉnh theo quy tắc P5/P6. Quy tắc hết hạn & reminder exception do `F04-G02-M03` sở hữu.

**AC-BAR-04:** Mọi sửa ngày kết thúc/type/reason của active exception phải tăng revision và revalidate, không kế thừa verdict của bản cũ.

### SR-08 — Privacy, Journal, audit [RG-11/14]

**AC-JOURNAL-01:** Child Journal sharing revoked → immediately deny future access và quarantine mọi summary/embedding/cache traceable chưa được phép; derived data không phải đường bypass.

**AC-JOURNAL-02:** Child quyết định có gửi thông báo riêng cho parent khi revoke share; mặc định **không gửi**. Không tiết lộ nội dung riêng tư trong thông báo hoặc audit.

**AC-JOURNAL-03:** `REVOKE_SHARE` ≠ `DELETE_JOURNAL`. Yêu cầu xóa: ẩn hiển thị ngay, xóa vĩnh viễn theo chính sách 60 ngày bao gồm traceable derivatives, có ngoại lệ lawful retention đã công bố. Phần thực thi retention thuộc F07-G06-M02; child share grant lifecycle thuộc F05-G06-M01, không giả vờ 2 module đã pilot.

**AC-AUDIT-01:** F07 sở hữu chính sách audit governance; tầng hạ tầng triển khai log. Event có actor/action/scope/decision/version/correlation id nhưng **không chứa raw Journal** hoặc dữ liệu ngoài mục đích.

## C. Cross-module commit sequence (proposed architecture, not implementation)

1. Request của actor (hoặc approved CR) mang subject_id, plan_id, base_version, intended_changes, actor & delegation context.
2. F01-G04-M01 xác thực actor và authorization, dựa trên Mode State, consent evidence và purpose assessment; **không** lấy riêng purpose assessment làm ALLOW.
3. F04-G01 kiểm tra `plan.lock_epoch`, plan state và expected_version (cùng boundary nguyên tử với commit).
4. F04-G02-M03 trả validation verdict gắn chính xác plan snapshot/constraint versions; fail-closed khi UNVERIFIABLE, violation protected hard-cap.
5. Commit một version duy nhất bằng idempotency key; `APPROVED` không được coi `APPLIED` cho tới khi commit confirmed; record audit theo F07 governance.
6. Nếu source/policy/version thay đổi giữa validation và write, retry đầy đủ với fresh assessment thay vì reuse stale PASS.
7. Với Parent-led, AI conversation tại F05 không tạo official CR hay sửa plan; chỉ workflow hợp lệ mới tạo request.

## D. Danh mục test oracle đã chỉnh và test bổ sung

| Test | Đặc tả cần áp dụng | Sửa lỗi |
|---|---|---|
| `CL:QT-012/019/033/052`, NT-013 | Unauthorized revoke → dispute only, current consent unchanged; handover preserves consent | RG-02 |
| `CR:QT-099`, NT-011 | Hard-cap SUBMIT discussion-only PASS; APPROVE/APPLY DENY | RG-03 |
| `PS:QT-094`, `CR:QT-102` | Không blanket age block; capability/rights/safety still checked | RG-04 |
| `MS:QT-018`, NT-001 | Mode per child, không theo plan manager | RG-05 |
| `plan-lock-control#AC-14`, NT-006/007 | Lock ngăn người đặt khóa edit active schedule trước unlock | RG-06 |
| `PS:QT-080`, `MP-C21` | Parent-led request intent qua F05, không official CR | RG-07 |
| NT-008 | Plan version change invalidates approved; pending requires re-evaluation | RG-08/23 |
| NT-009 + **NT-018 proposed** | Pending TTL 7d from submit, approved-not-applied TTL 7d from approve | RG-09 |
| NT-014 + PA:QT-001/014/016/041/044 | Legal UNKNOWN + real child data → no processing by any consumer | RG-12 |
| NT-004 | Journal deletion 60d is not share revoke | RG-11 |
| NT-010 | 60-day and 7-full-gap, purpose change no bypass | RG-17 |
| NT-012 | App Default Bar fallback positive path + draft save | RG-28 |
| NT-016/017 | Commit reconcile before retry, no duplicate commit/history | RG-23 |
| **NT-019 proposed** | Handover preserves child delegated schedule edits + new Primary can revoke; old approved CR still reapprove | B01-C-OD-01 |
| **NT-020 proposed** | Journal revoke notification opt-in/default off; no content leak | B01-C-OD-02 |
| **NT-021 proposed** | Lock no auto-unlock across arbitrary reminder events; offline draft editable, commit rejected | B01-C-OD-05/06 |

**NT-018..021 là test *đề xuất bổ sung bởi ChatGPT*, không phải test được thực thi hoặc ID của QA pilot.** Toàn bộ NT-001..017 trong Consolidation là test đề xuất, không được đánh dấu PASS. Khi lập registry cuối, giữ original IDs và provenance.

### Test-case drafts for NT-018..021

- **NT-018:** Given approved-but-not-applied CR approved at T, no context change; When at T+7d−1s vs T+7d (server time); Then trước biên có thể apply nếu commit gates pass, từ biên INVALIDATED/EXPIRED không được apply; pending TTL tính từ submitted_at riêng.
- **NT-019:** Given child delegated schedule edit valid under mother Primary, un-applied approved CR exists; When mother→father handover; Then delegated grant remains valid, child edit allowed if current gates pass; old CR approval requires reapproval; father can revoke child grant later.
- **NT-020:** Given child opts default notification off and parent was previously sharing Journal; When child revokes Journal sharing; Then access immediately denied, no push to parent; if child opts in, parent receives only minimal metadata and no Journal content.
- **NT-021:** Given schedule locked by Primary, reminder triggered and offline child draft synced; When reminder expires/worker retries; Then lock remains effective, draft can be stored subject permission, effective schedule unchanged; only authorized unlock/override can commit.

## E. Vấn đề chưa được tuyên bố resolved

1. **Independent verification required:** All AC changes above have not been challenged by a reviewer independent from ChatGPT; proposed replacements do not erase original findings until mapped/tested.
2. **Evidence coverage:** P5 baseline 59/64 by ID; missing MP-B15, MP-C05, C06, C18, C19 and semantic ambiguities A01, A02, A10, A12, C01, C02, C07, C16, C17; cannot invent originals.
3. **Security:** Real-child-data legal basis remains research pending (MR-016/017/021/022) and production gate closed. Identity/relink (F01-G02-M01), Journal share (F05-G06-M01), retention (F07-G06-M02), history (F04-G06-M02) still lack full module-level pilot evidence.
4. **Backend/runtime:** No implementation tests; all results here are spec/test oracle proposals.
5. **Change control:** 25 consolidated L4 entries are temporary, not stable accepted IDs; no canonical edit; future changes should be proposed as diffs preserving provenance.
6. **Open design details:** status code normalization for safety-route, lock granularity/version, audit event taxonomy, exact error codes, clock boundaries, P6 idempotency evidence and exhaustive 46-finding closure need explicit follow-up and targeted verification.

## F. Change Log

- `REM-SR-01..08`: proposed normative corrections to replace incorrect or underspecified AC/contract logic.
- `REM-NT-018..021`: proposed additional cases for consolidation decisions not present in the 17 NT list.
- **Next:** independent critique of specified contracts and evidence trace, not another full L3 decomposition.
