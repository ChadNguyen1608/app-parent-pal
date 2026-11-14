# 03 — Kiểm chứng workflow A-lite (Phase C)

**Loại:** `SELF_AUDIT / PROPOSAL` · **Người soạn:** AI (Claude, Opus 5.5), tự rà soát lượt chấm của chính mình, chưa kiểm chứng độc lập · **Nguồn:** HEAD `9043c88`; baseline đóng băng `baseline_v1/` (SHA256SUMS) · **Cần Owner duyệt:** mọi thay đổi đề xuất

> A-lite được đánh giá như **một ứng viên kiến trúc có thể thử nghiệm**, không phải MVP đã chọn.

**Nguồn đối chiếu:**
- luồng 10 bước trong prompt audit;
- `prototype/index.html` (các hàm như applyActs, checkDayK, judge, applyPeriod, checkPeriodExpiry, revertPeriod, renderToday, defaultBudget);
- `documents/pal/spec-quy-thoi-gian-va-tab-cua-con.md` và `spec-quy-tac-lap-lich.md`;
- SC-001 D01–D03 (USER_APPROVED_PRINCIPLE / USER_CONFIRMED_REQUIREMENT);
- 3.4 UC-007..UC-010.

**Dữ liệu:** `data/phase_c.json` (script `tools/phase_c.py`).

## 1. Kết luận

- **Ma trận độ phủ:** 39 năng lực. COVERED 13 · PARTIAL 15 · MISSING 8 · FEATURE_GAP 0 · DEFERRED_OK 3.
- **A-lite baseline (W1E1, 24 module) thiếu 4 năng lực thiết yếu** đã có trong prototype hoặc trong quyết định đã duyệt:
  - Construct proposed schedule (day ordering rules, ±30 min [MĐ])
  - Child proposals pending parent approval
  - After-school check "Ổn / Hơi mệt / Rất mệt" + relief rule (keep teacher homework only)
  - Pattern to parent, not verbatim (2-week window), asks for context, no causal claim
- **Lỗi đã xác nhận quan trọng nhất:** baseline nâng `F04-G02-M01` lên E2 (trái với Inventory E1 và 3.4 UC-007), rồi bỏ module này khỏi A-lite. Kết quả là A-lite **không có bộ dựng lịch**. Không có bước này thì vòng lặp không chạy được từ đầu đến cuối.
- **A-lite v2 (đề xuất):** 29 module (thêm: F04-G02-M01, F04-G03-M02, F04-G06-M01, F06-G02-M02, F06-G04-M01).
  - Theo mức chi tiết: SHARED 2, MINIMAL 12, FULL 13, POLICY_OPERATIONAL 2.
  - 0 module AI.
  - Module bị chặn pháp lý: F01-G06-M01, F07-G06-M02 (H4, chỉ chặn khi dùng dữ liệu thật).
  - Số module tăng nhưng chiều sâu build giảm: 12 module chỉ cần năng lực tối thiểu.
- **Bổ sung có điều kiện:**
  - mục tiêu (F03-G04-M01) tùy quyết định OD-A1;
  - tín hiệu mệt/đói: chưa có L3 chủ sở hữu rõ ràng (OD-A7);
  - mô hình định danh cho pilot: mã gia đình theo Plan A hay tài khoản + PIN theo FR-01 (OD-A8).
- **Biến thể bám Plan A (A-lite + Pal):** 40 module. Thêm gói AI, nội dung tĩnh, chụp ảnh, ghi âm, ánh xạ geofence: F04-G05-M02, F07-G01-M01, F07-G02-M01, F07-G03-M01, F07-G03-M02, F07-G03-M03, F07-G04-M01, F07-G04-M02, F07-G05-M01, F08-G04-M01, F08-G04-M02. Cần ẩn danh trước khi gọi LLM. FR-03 chỉ áp nếu trẻ dùng chat.
- **4 module nền chưa từng được kiểm độc lập** nằm trong A-lite v2: F01-G04-M01, F01-G04-M02, F01-G05-M01, F07-G06-M01.

## 2. Đặc tả workflow A-lite v2 (logic, chưa phải đặc tả kỹ thuật)

1. **Hồ sơ và đầu vào:** thời khóa biểu, thẻ hoạt động cố định (thứ, giờ, thời lượng, đi lại), tuổi/lớp (`F02-G01-M01`). Mục tiêu là tùy chọn, chờ OD-A1.
2. **Quỹ thời gian:**
   - 6 nhóm × (ngày đi học, cuối tuần);
   - mức mặc định của app chỉ là bar khi đã được thẩm định, nếu không thì ghi UNKNOWN (P6-BP-OD-03);
   - preset: Bình thường; Thi cử và Nghỉ hè là ngoại lệ có thời hạn, không phải Standard Bar dài hạn (SC-001-D03);
   - sàn ngủ [NC] không ai chỉnh được; các mục sàn khác là quy tắc sản phẩm [MĐ], phân biệt protected_hard và family_hard (P6-BP-OD-02);
   - trần mềm, có nút "Giữ mức này";
   - cảnh báo một lần, kèm nguồn (`F04-G02-M03`, `F03-G03-M01` tùy chọn).
3. **Dựng lịch E1:** mẫu theo lớp (`F04-G01-M02`) + quy tắc thứ tự trong ngày + xê dịch ±30 phút quanh số phụ huynh nhập, rồi kiểm xung đột (`F04-G02-M02`) và kiểm cân bằng (`F04-G02-M03`).
4. **Phê duyệt:**
   - ở chế độ PARENT_LED (và UNSET), phụ huynh lưu là phê duyệt (`F04-G01-M01` có version); con chỉ gửi mong muốn, không tạo Change Request chính thức (B01 CR log);
   - chỉ khi phụ huynh đặt con ở CHILD_EXECUTED (`F01-G05-M01`), đề xuất của con mới thành Change Request (`F04-G06-M01` tối thiểu, `F04-G03-M02` tối thiểu): hết hạn sau 7 ngày, không thể duyệt vượt hard-cap.
5. **Thực hiện:** tab "Hôm nay của con" có nhãn "Bây giờ", tiến độ x/y, không chấm điểm (`F04-G04-M01`). Nhắc việc tôn trọng giờ yên lặng (`F04-G07-M01/M02`).
6. **Ghi nhận:** nút ✓ Xong (`F04-G05-M01`) → sự kiện (`F06-G01-M01`, nguồn `F06-G01-M02` tùy chọn).
7. **Phản hồi:**
   - sau giờ học hỏi "Ổn / Hơi mệt / Rất mệt"; chọn "Rất mệt" thì áp quy tắc giảm tải trong spec §4. Prototype chưa cài quy tắc này. **Chưa có L3 chủ sở hữu** (OD-A7);
   - phụ huynh nhận mẫu 2 tuần (spec-quy-tac L2) dưới dạng câu hỏi về bối cảnh, không nhận nguyên văn, không kết luận nguyên nhân (`F06-G04-M01`, `F06-G05-M01`);
   - ngày nghỉ, ngày ốm không bị tính là chưa hoàn thành (`F06-G02-M02`).
8. **Đánh giá:** tiến độ (`F06-G02-M01`) → tóm tắt tuần theo đối tượng xem (`F06-G05-M01/M02`).
9. **Điều chỉnh:** giai đoạn tạm thời có thời hạn (tối đa 60 ngày liên tục cho cùng ràng buộc; ≥7 ngày trống giữa các ngoại lệ tương tự, theo P6-BP-OD-01):
   - cảnh báo một lần;
   - liệt kê các kiểm tra được nới;
   - lưu bản lịch cũ;
   - hết hạn thì cho 3 lựa chọn;
   - nếu dài hơn 6 tuần thì 2 tuần xem lại một lần;
   - sàn ngủ và protected_hard không bao giờ được nới;
   - thay đổi một lần trong tuần (nghỉ một buổi, học bù, ngày ốm) theo spec-quy-tac E3/K3/K4.

**Nhánh ngoại lệ tối thiểu** (theo 3.4 UC-010):
- không có slot hợp lệ: hiện trade-off, không ép chọn;
- thiếu dữ liệu: hỏi lại, không tự giả định giờ ngủ;
- phụ huynh từ chối đề xuất: giữ lịch cũ;
- thiếu quyền: đề xuất ở trạng thái pending.

## 3. Ma trận độ phủ từ đầu đến cuối

| Bước | Năng lực | Lớp ràng buộc | Nguồn | Module | Trạng thái (so với A-lite baseline) | Thiết yếu | E | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| 1 Goal | Parent/child sets development goal | FUNCTIONAL | 3.4 UC-007 precondition goal_available; prototype tool cap_nhat_tong_quan (parent goals in overview) | F03-G04-M01 | **PARTIAL** | CONDITIONAL | E1 | Parent goals are captured in plan overview; only the approved-goal precondition of UC-007 is absent. Owner decision OD-A1. |
| 2 Activities | Identify tasks/activities (fixed activity cards) | FUNCTIONAL | spec-quy-thoi-gian §2.3; prototype renderActs/applyActs | F02-G01-M01 (or F02-G04-M01) | **PARTIAL** | YES | E1 | Better L3 home may be F02-G04-M01 Environment Context (DEFERRED tier): essential capability sits in a deferred module (adversarial). Pal-created cards from chat are E2. |
| 2 Activities | Child profile incl. health info (allergy, medication) | HARD_SAFETY | prototype tool luu_ho_so (suc_khoe); spec-quy-tac B2 | F01-G03-M01, F02-G01-M01 | **PARTIAL** | YES | E0 | Health data is a sensitive child-data category not reflected in baseline data_class; minimise or exclude in pilot (MR-021). |
| 3 Estimate | Task duration estimates | USER_CONFIGURABLE | spec §2.1; spec-quy-tac D defaults [MĐ] | F02-G01-M01, F04-G02-M03 | **PARTIAL** | YES | E0 | Parent-entered. Shipped defaults (e.g. per-grade homework time) are [MĐ] and must be labelled unverified/UNKNOWN unless vetted (P6-BP-OD-03). |
| 3 Estimate | Time availability from school + commute | OPERATIONAL | spec §2.1 fixed group from timetable | F02-G01-M01 | **COVERED** | YES | E0 | — |
| 3 Estimate | Sleep minimum | HARD_SAFETY | spec-quy-tac sleep [NC] | F04-G02-M03 | **COVERED** | YES | E1 | Only the sleep floor is [NC]-sourced; other "sàn" items are product rules [MĐ]; per-domain protected_hard_cap is UNKNOWN (P6 BP log §3). |
| 3 Estimate | Other fixed-floor product rules (free play after school, breaks, meals) | USER_CONFIGURABLE | spec §1.2 [MĐ]; P6-BP-OD-02 | F04-G02-M03 | **COVERED** | YES | E1 | Not universal HARD_SAFETY: treat as app-default protections pending vetting; never bypassed by emergency shortcut (OD-02). |
| 3 Estimate | 6-group time budget (school-day/weekend) + screen max | USER_CONFIGURABLE | spec §2; prototype getBudget/setBudget/defaultBudget; P6-BP-OD-03 | F04-G02-M03, F03-G03-M01 | **PARTIAL** | YES | E1 | App Default Standard Bar must be vetted, else UNKNOWN; hard-coded defaults are not acceptable as a validated bar. |
| 3 Estimate | Budget presets (Bình thường, Thi cử, Nghỉ hè…) | USER_CONFIGURABLE | spec §2.1; prototype presetDirty; SC-001-D03 | F04-G02-M03, F04-G01-M01 | **PARTIAL** | YES | E0 | Modules are in A-lite v1 (so PARTIAL, not MISSING). Thi cử/Nghỉ hè are time-bound exceptions, not long-term Standard Bar (SC-001-D03). |
| 4 Construct | Construct proposed schedule (day ordering rules, ±30 min [MĐ]) | FUNCTIONAL | spec §1.2; Inventory E1; prototype ordering via LLM prompt RULES; checkDayK only validates | F04-G02-M01 | **MISSING** | YES | E1 | CONFIRMED gap: W1E1 dropped F04-G02-M01. No deterministic builder exists today: E1 feasibility UNKNOWN until spike (RG-01). In a Plan-A-aligned variant Pal (E2) constructs. |
| 4 Construct | Template-based generation | FUNCTIONAL | prototype presets; F04-G01-M02 | F04-G01-M02 | **COVERED** | YES | E1 | — |
| 4 Construct | Recurring tasks | FUNCTIONAL | activity cards with weekdays | F04-G03-M01, F02-G01-M01 | **COVERED** | YES | E0 | — |
| 4 Construct | One-time / week-only changes (skip a session, make-up class, sick-day cancel) | USER_CONFIGURABLE | spec-quy-tac E3, K3, K4; prototype tools pham_vi chi_tuan_nay, xoa_ngoai_le | F04-G01-M01, F04-G02-M03 | **PARTIAL** | YES | E0 | Adversarial correction: specified in spec-quy-tac; essential as week-only exception. |
| 5 Check | Time-budget check + one-line warning with source | ADVISORY | spec §1.3, §2.2; prototype judge | F04-G02-M03 | **COVERED** | YES | E1 | — |
| 5 Check | Soft cap "Giữ mức này", warn exactly once | USER_CONFIGURABLE | spec §1.1, §1.4; spec-quy-tac A2, D6 | F04-G02-M03 | **PARTIAL** | YES | E1 | Not stated in baseline scope (Phase A REVIEW). |
| 5 Check | Overlap conflicts | OPERATIONAL | UC-010; prototype checkDay | F04-G02-M02 | **COVERED** | YES | E1 | Edge direction fixed by P-E02. |
| 5 Check | Total > 24h detection | OPERATIONAL | spec §2.1 | F04-G02-M03 | **COVERED** | YES | E0 | — |
| 6 Approve | Parent saves = approval (parent-led) | FUNCTIONAL | 3.4 UC-008; B01-MS-OD-04 | F04-G01-M01, F01-G04-M01 | **COVERED** | YES | E0 | UNSET behaves as PARENT_LED. |
| 6 Approve | Child proposals pending parent approval | FUNCTIONAL | spec §3-4; 3.4 UC-010; B01 CR log (PARENT_LED: no official CR); B01-MS-OD-02 | F04-G06-M01 (minimal), F04-G03-M02 (minimal), F01-G05-M01 | **MISSING** | YES (only for children set to CHILD_EXECUTED) | E0 | Requires parent to set child mode CHILD_EXECUTED; 7-day expiry; hard-cap NOT_APPROVABLE; PARENT_LED children send informal wish note only. Structured choices avoid verbatim free-text leak. |
| 7 Execute | Child "Hôm nay" view, "Bây giờ" label, progress x/y, no scores | FUNCTIONAL | spec §4; prototype renderToday/liveBlocks | F04-G04-M01 | **COVERED** | YES | E0 | — |
| 7 Execute | Reminders on time incl. morning alarm, "Xong" action in notification, re-schedule all reminders after plan edits, parent-to-child push | OPERATIONAL | Plan A §1, §5-6 (<1 min); device log +45 s | F04-G07-M01, F04-G07-M02, F04-G05-M01 | **PARTIAL** | YES | E1 | Adversarial addition: sub-behaviours from Plan A not in baseline rows. Hidden platform requirement: notification service + exact alarm. |
| 7 Execute | Weather pack reminder (Soạn cặp) | ADVISORY | spec §4; spec-quy-tac I4; Plan A §5 | F04-G04-M01, F04-G07-M01 | **PARTIAL** | NO (A-lite E1) / YES (Plan-A variant) | E0 | Adversarial correction: L4-level behaviour fitting existing modules, not an L3 FEATURE_GAP. |
| 8 Evidence | Check-off "✓ Xong" | FUNCTIONAL | spec §4 | F04-G05-M01 | **COVERED** | YES | E0 | — |
| 8 Evidence | Photo capture "Chụp gửi" (no AI grading) | FUNCTIONAL | Plan A §1 item 4; device log 2026-11-05 PASS | F04-G05-M02 | **MISSING** | NO (A-lite E1) / YES (Plan-A variant) | E0 | Split from AI grading (adversarial). |
| 8 Evidence | AI feedback on photo homework | FUNCTIONAL | spec §5; SC-002-D05 pilot only | F06-G07-M01, F07-G03-M03 | **DEFERRED_OK** | NO | E2 | Controlled pilot only. |
| 8 Evidence | Voice "Kể cho Pal" / recording | FUNCTIONAL | spec §4; Plan A §1 item 3 | F07-G03-M03 | **DEFERRED_OK** | NO (A-lite E1) / YES (Plan-A variant) | E2 | Prototype button only pre-fills chat; recording is Plan A feature 3. |
| 8 Evidence | Parent sees ✓ and completion time in week view | FUNCTIONAL | spec §4 | F06-G01-M01, F06-G05-M02 | **COVERED** | YES | E0 | — |
| 9 Feedback | After-school check "Ổn / Hơi mệt / Rất mệt" + relief rule (keep teacher homework only) | ADVISORY | spec §4; spec-quy-tac G3; SC-001-D02 | — (owner TBD; candidates F04-G04/F04-G05) | **MISSING** | YES | E1 | Adversarial correction: no clean L3 owner (F02-G05-M02 is profile contest); relief rule is in spec §4 but not implemented in prototype (index.html:1036-1038 records only). OD-A7. |
| 9 Feedback | Hunger signal "Con thấy đói" to parent queue | ADVISORY | spec §4; spec-quy-tac H5; Plan A §5-6 step 5 | — (owner TBD) | **MISSING** | NO (A-lite E1) / YES (Plan-A variant) | E0 | Same ownership issue as fatigue. |
| 9 Feedback | Pattern to parent, not verbatim (2-week window), asks for context, no causal claim | ADVISORY | spec §1.5; spec-quy-tac L2; SC-001-D02 | F06-G04-M01, F06-G05-M01 | **MISSING** | YES | E1 | F06-G04-M01 was absent from A-lite (adversarial); added in v2. No unsourced count threshold: threshold UNKNOWN until sourced. |
| 9 Feedback | Weekly summary for parent | FUNCTIONAL | 3.4 UC-015 | F06-G05-M02, F06-G02-M01 | **COVERED** | YES | E1 | — |
| 10 Adjust | Temporary phase: duration, warn once, relaxed rules listed, snapshot, expiry with 3 choices; max 60 continuous days same constraint; >=7 empty days between similar exceptions | USER_CONFIGURABLE | spec §3; SC-001-D01; P6-BP-OD-01; prototype applyPeriod/checkPeriodExpiry/revertPeriod/snapshotPlan | F04-G02-M03, F04-G01-M01 | **PARTIAL** | YES | E0 | Modules in v1 (PARTIAL). Prototype creates the phase via LLM prompt (index.html:497); E0 needs a structured form. |
| 10 Adjust | Schedule revisions with version history | FUNCTIONAL | prototype historyText/snapshotPlan; B01 Plan Structure | F04-G01-M01, F04-G06-M02 | **PARTIAL** | YES | E0 | — |
| 10 Adjust | Progress exceptions (sick/rest day not failure) | ADVISORY | spec-quy-tac K4 | F06-G02-M02 | **MISSING** | NO (recommended) | E0 | Recommended so relief/sick days are not counted as failure. |
| 10 Adjust | Family review session | FUNCTIONAL | 3.4 UC-016 | F06-G06-M01 | **DEFERRED_OK** | NO | E1 | — |
| X Safety | Safety layer before AI + static 111/113/115 content for any free-text input | HARD_SAFETY | CLAUDE.md; OD-03; Plan A §4, §6 step 2; spec-quy-tac N1-N2 | F07-G05-M01, F07-G01-M01 | **PARTIAL** | YES (Plan-A variant; any free text) / CONDITIONAL (strict structured E1 variant) | E1 | Adversarial correction: prototype standard behaviour has free text everywhere; HARD_SAFETY must not depend on the audit choosing structured inputs. |
| X Safety | Pseudonymise child name/school before external LLM call | HARD_SAFETY | CLAUDE.md; Plan A pal-chat | platform requirement (no L3) | **MISSING** | YES (Plan-A variant) | E0 | Hidden platform requirement. |
| X Identity | Two-device pairing + Parent PIN on unlink / child settings | HARD_SAFETY | FR-01 APPROVED; spec-quy-thoi-gian §4 limits (shared account, no PIN) | F01-G02-M01, F01-G01-M02 | **PARTIAL** | YES | E0 | Plan A defers per-person accounts (family code) while FR-01 requires PIN: identity model for pilot is an Owner decision (OD-A8). |
| X Platform | Plan A geofence (Home/School/Tutoring), events only | OPERATIONAL | spec-phuong-an-a §1-2, §4 (Owner chốt 04/11) | F08-G04-M01/M02, F01-G04-M02, F06-G01-M01, F04-G07-M01 (mapping proposed) | **PARTIAL** | NO (A-lite E1) / YES (Plan-A variant) | E0 | Adversarial correction: mappable to existing IDs; not a clean FEATURE_GAP. Location is a distinct sensitive category (OD-A3). |

Lớp ràng buộc:
- **HARD_SAFETY:** sàn ngủ [NC], lớp an toàn trước AI, ẩn danh, PIN. Không ai được nới.
- **USER_CONFIGURABLE:** quỹ thời gian, preset, ngoại lệ.
- **ADVISORY:** cảnh báo, xu hướng.
- **OPERATIONAL:** thời gian thực tế, xung đột, tổng 24 giờ.
Audit **không đưa ra giới hạn thời gian chung nào mới**. Mọi ngưỡng lấy từ `spec-quy-tac-lap-lich.md`, kèm mức căn cứ đã ghi tại đó.

## 4. Balanced Planning làm được gì

| Năng lực | Phát hiện vi phạm | Giải thích | Gợi ý điều chỉnh | Tự giải quyết | Cần ai duyệt |
|---|---|---|---|---|---|
| Sàn ngủ [NC] / protected_hard | Có | Có (kèm nguồn) | Có | **Có**: thứ tự trong ngày do hệ thống tự sửa, không hỏi lại (spec §1.2) | Không. Không ai được nới, kể cả ngoại lệ khẩn (P6-BP-OD-02) |
| family_hard (gia đình tự đặt) | Có | Có | Có | Không | Người có quyền đổi, có audit, version, thời hạn (P6-BP-OD-02) |
| Quỹ thời gian / trần mềm | Có | Có (một dòng, kèm nguồn) | Có | Không | Phụ huynh xác nhận "Giữ mức này" |
| Xung đột lịch | Có | Có | Có (slot khác) | Không. Hiện trade-off | Phụ huynh, hoặc con đề xuất rồi phụ huynh duyệt |
| Giai đoạn tạm thời | Có (hết hạn) | Có | Có (3 lựa chọn) | Không | Phụ huynh; đề xuất của con ở trạng thái chờ |
| Tín hiệu mệt | Có (mẫu 2 tuần) | Có (hỏi bối cảnh, không kết luận nguyên nhân) | Có (một đề xuất cụ thể) | Giảm tải trong ngày theo spec §4 (chưa có trong prototype) | Thay đổi lâu dài cần phụ huynh duyệt |

Mọi việc tự động phải tôn trọng chế độ tự chủ:
- **PARENT_LED:** chỉ phụ huynh được commit.
- **CHILD_EXECUTED:** con đề xuất, phụ huynh duyệt.
- **CHILD_DIRECTED:** con quyết trong phạm vi đã được ủy quyền.

## 5. Năng lực thiết yếu và năng lực hoãn được

**Thiết yếu:** các mục có cột Thiết yếu = YES ở §3.

**Hoãn được:**
- ảnh và giọng nói có AI chấm (SC-002-D05 chỉ cho pilot);
- họp gia đình;
- việc một lần;
- báo đói;
- thời tiết;
- lịch sử thay đổi đầy đủ;
- máy trạng thái B01 đầy đủ;
- ghép khác hộ.

**Quá mức cho pilot:**
- máy trạng thái Change Request B01 v3.1 (TTL, lock precedence, OUTCOME_UNKNOWN), khi chỉ có một người duyệt;
- engine Access Policy đầy đủ;
- quy trình xóa có nhiều tầng lưu trữ, khi pilot chỉ dùng dữ liệu giả lập.

**Trường hợp thật sự cần LLM:**
- Natural-language capture of activities ("Pal vừa ghi" cards) - optional convenience
- Photo/voice feedback on homework (SC-002-D05 pilot only)
- Explaining trade-offs in free language (UC-010 E2 optional)

## 6. Sổ khoảng trống lập lịch

| # | Khoảng trống | Loại | Module | Đề xuất |
|---|---|---|---|---|
| SG-01 | Parent/child sets development goal | PARTIAL | F03-G04-M01 | Parent goals are captured in plan overview; only the approved-goal precondition of UC-007 is absent. Owner decision OD-A1. |
| SG-02 | Identify tasks/activities (fixed activity cards) | PARTIAL | F02-G01-M01 (or F02-G04-M01) | Better L3 home may be F02-G04-M01 Environment Context (DEFERRED tier): essential capability sits in a deferred module (adversarial). Pal-created cards from chat are E2. |
| SG-03 | Child profile incl. health info (allergy, medication) | PARTIAL | F01-G03-M01, F02-G01-M01 | Health data is a sensitive child-data category not reflected in baseline data_class; minimise or exclude in pilot (MR-021). |
| SG-04 | Task duration estimates | PARTIAL | F02-G01-M01, F04-G02-M03 | Parent-entered. Shipped defaults (e.g. per-grade homework time) are [MĐ] and must be labelled unverified/UNKNOWN unless vetted (P6-BP-OD-03). |
| SG-05 | 6-group time budget (school-day/weekend) + screen max | PARTIAL | F04-G02-M03, F03-G03-M01 | App Default Standard Bar must be vetted, else UNKNOWN; hard-coded defaults are not acceptable as a validated bar. |
| SG-06 | Budget presets (Bình thường, Thi cử, Nghỉ hè…) | PARTIAL | F04-G02-M03, F04-G01-M01 | Modules are in A-lite v1 (so PARTIAL, not MISSING). Thi cử/Nghỉ hè are time-bound exceptions, not long-term Standard Bar (SC-001-D03). |
| SG-07 | Construct proposed schedule (day ordering rules, ±30 min [MĐ]) | MISSING | F04-G02-M01 | CONFIRMED gap: W1E1 dropped F04-G02-M01. No deterministic builder exists today: E1 feasibility UNKNOWN until spike (RG-01). In a Plan-A-aligned variant Pal (E2) constructs. |
| SG-08 | One-time / week-only changes (skip a session, make-up class, sick-day cancel) | PARTIAL | F04-G01-M01, F04-G02-M03 | Adversarial correction: specified in spec-quy-tac; essential as week-only exception. |
| SG-09 | Soft cap "Giữ mức này", warn exactly once | PARTIAL | F04-G02-M03 | Not stated in baseline scope (Phase A REVIEW). |
| SG-10 | Child proposals pending parent approval | MISSING | F04-G06-M01 (minimal), F04-G03-M02 (minimal), F01-G05-M01 | Requires parent to set child mode CHILD_EXECUTED; 7-day expiry; hard-cap NOT_APPROVABLE; PARENT_LED children send informal wish note only. Structured choices avoid verbatim free-text leak. |
| SG-11 | Reminders on time incl. morning alarm, "Xong" action in notification, re-schedule all reminders after plan edits, parent-to-child push | PARTIAL | F04-G07-M01, F04-G07-M02, F04-G05-M01 | Adversarial addition: sub-behaviours from Plan A not in baseline rows. Hidden platform requirement: notification service + exact alarm. |
| SG-12 | Weather pack reminder (Soạn cặp) | PARTIAL | F04-G04-M01, F04-G07-M01 | Adversarial correction: L4-level behaviour fitting existing modules, not an L3 FEATURE_GAP. |
| SG-13 | Photo capture "Chụp gửi" (no AI grading) | MISSING | F04-G05-M02 | Split from AI grading (adversarial). |
| SG-14 | After-school check "Ổn / Hơi mệt / Rất mệt" + relief rule (keep teacher homework only) | MISSING | — (owner TBD; candidates F04-G04/F04-G05) | Adversarial correction: no clean L3 owner (F02-G05-M02 is profile contest); relief rule is in spec §4 but not implemented in prototype (index.html:1036-1038 records only). OD-A7. |
| SG-15 | Hunger signal "Con thấy đói" to parent queue | MISSING | — (owner TBD) | Same ownership issue as fatigue. |
| SG-16 | Pattern to parent, not verbatim (2-week window), asks for context, no causal claim | MISSING | F06-G04-M01, F06-G05-M01 | F06-G04-M01 was absent from A-lite (adversarial); added in v2. No unsourced count threshold: threshold UNKNOWN until sourced. |
| SG-17 | Temporary phase: duration, warn once, relaxed rules listed, snapshot, expiry with 3 choices; max 60 continuous days same constraint; >=7 empty days between similar exceptions | PARTIAL | F04-G02-M03, F04-G01-M01 | Modules in v1 (PARTIAL). Prototype creates the phase via LLM prompt (index.html:497); E0 needs a structured form. |
| SG-18 | Schedule revisions with version history | PARTIAL | F04-G01-M01, F04-G06-M02 | — |
| SG-19 | Progress exceptions (sick/rest day not failure) | MISSING | F06-G02-M02 | Recommended so relief/sick days are not counted as failure. |
| SG-20 | Safety layer before AI + static 111/113/115 content for any free-text input | PARTIAL | F07-G05-M01, F07-G01-M01 | Adversarial correction: prototype standard behaviour has free text everywhere; HARD_SAFETY must not depend on the audit choosing structured inputs. |
| SG-21 | Pseudonymise child name/school before external LLM call | MISSING | platform requirement (no L3) | Hidden platform requirement. |
| SG-22 | Two-device pairing + Parent PIN on unlink / child settings | PARTIAL | F01-G02-M01, F01-G01-M02 | Plan A defers per-person accounts (family code) while FR-01 requires PIN: identity model for pilot is an Owner decision (OD-A8). |
| SG-23 | Plan A geofence (Home/School/Tutoring), events only | PARTIAL | F08-G04-M01/M02, F01-G04-M02, F06-G01-M01, F04-G07-M01 (mapping proposed) | Adversarial correction: mappable to existing IDs; not a clean FEATURE_GAP. Location is a distinct sensitive category (OD-A3). |

## 7. Đánh giá khả thi

**A-lite v2: khả thi về mặt kỹ thuật, có điều kiện.**
- **Bằng chứng ủng hộ:**
  - prototype đã chạy toàn bộ luồng trên một máy;
  - Plan A đo được nhắc việc (+45 giây) và chụp ảnh;
  - quy tắc lập lịch có mức căn cứ.
- **Rủi ro chính:**
  - (1) Thứ tự trong ngày hiện do LLM làm theo prompt `RULES`; `checkDayK` chỉ kiểm, không dựng. Chưa có bộ dựng xác định nào, nên **khả thi E1 là UNKNOWN** cho đến khi làm spike (RG-01). Build ở mức H; đây là rủi ro lớn nhất.
  - (2) Prototype dùng chung tài khoản, chưa có PIN; cần lõi định danh (FR-01).
  - (3) Nhắc việc đúng giờ trên Android.
  - (4) H4 trước khi dùng dữ liệu thật.
- **Độ tin cậy:** MEDIUM cho độ phủ (đối chiếu với tài liệu và code thật); HYPOTHESIS cho giá trị.
- **Mâu thuẫn với chuẩn của repo:** CLAUDE.md coi `prototype/index.html` là hành vi chuẩn, và prototype dựa trên Pal chat. A-lite E1 vì vậy là **giả thuyết kiến trúc để kiểm**, không phải bản port của prototype. Biến thể bám Plan A tồn tại để Owner chọn (OD-A2).
- **Câu hỏi còn mở:** OD-A1 (mục tiêu), OD-A2 (A-lite E1 hay biến thể Plan A), OD-A3 (geofence), OD-A7 (chủ của tín hiệu mệt), OD-A8 (mô hình định danh).
- **Cần Owner duyệt:** có.
