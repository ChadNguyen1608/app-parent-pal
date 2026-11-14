# 02 — Audit mức độ chi tiết của phụ thuộc (Phase B)

**Loại:** `SELF_AUDIT / PROPOSAL` · **Người soạn:** AI (Claude, Opus 5.5), tự rà soát lượt chấm của chính mình, chưa kiểm chứng độc lập · **Nguồn:** HEAD `9043c88`; baseline đóng băng `baseline_v1/` (SHA256SUMS) · **Cần Owner duyệt:** mọi thay đổi đề xuất

**Dữ liệu:** `data/phase_b.json` (script `tools/phase_b.py`). Baseline giữ nguyên 95 cạnh; v2 chỉ thêm chiều "granularity" và các thay đổi đề xuất.

## 1. Kết quả chính

| Granularity (95 cạnh baseline) | Số cạnh |
|---|---|
| `FULL_MODULE_REQUIRED` | 35 |
| `MINIMAL_CAPABILITY_REQUIRED` | 36 |
| `OPTIONAL_DEPENDENCY` | 17 |
| `POLICY_OPERATIONAL_REQUIREMENT` | 4 |
| `SHARED_PLATFORM_SERVICE` | 3 |

- **36/95 cạnh chỉ cần một phần năng lực (MINIMAL), không cần cả module.** Baseline đếm như thể cần cả module, nên phạm vi build bị phóng đại, nhất là phần nền tảng. Ví dụ:
  - Access Policy: chỉ cần bảng phân quyền cố định;
  - Purpose-bound Access: chỉ cần cờ dữ liệu giả lập;
  - Change Requests: chỉ cần hàng đề xuất và nút duyệt.
- **17 cạnh là tùy chọn (SOFT),** 4 cạnh là yêu cầu vận hành hoặc chính sách, 3 cạnh là dịch vụ nền dùng chung.
- **Đổi chiều 1 cạnh:** E029 `F04-G02-M02 → F04-G02-M01` sai chiều; đúng ra bước dựng lịch phải gọi bước kiểm xung đột (cạnh đề xuất P-E02).
- **5 cạnh đề xuất mới** (P-E01..P-E04, P-E06), đều ở trạng thái CANDIDATE và cần Owner duyệt, MR-040. Sau phản biện, rút lại 2 cạnh: P-E05 (F02-G05-M02 không phải chủ của tín hiệu mệt) và P-E07 (ghi chi phí AI thuộc F07-G03-M02, đã có cạnh E082).
- **Vòng phụ thuộc** (chỉ tính cạnh tường minh, sau thay đổi v2): 0 vòng lúc build, 0 vòng lúc chạy. Vòng lúc chạy trong lõi định danh mà baseline báo là do mở rộng gói `B_AUTHZ`/`B_CHILD_SCOPE`. Nó phản ánh tham chiếu lẫn nhau lúc chạy, không phải vòng giữa các cạnh tường minh.
- **Module mồ côi** (không có cạnh tường minh nào): 19. Phần lớn là module chỉ chấm thô. Baseline không mô hình hóa phụ thuộc cho các module này, nên **chưa kiểm được** việc hoãn chúng có kéo theo hệ quả ẩn hay không. Đây là khoảng trống bằng chứng, chưa phải lỗi đã xác nhận.

## 2. Audit 4 gói dịch vụ dùng chung

| Gói | Thành viên | Phát hiện | Đề xuất |
|---|---|---|---|
| `B_AUTHZ` | F01-G01-M01, F01-G01-M02, F01-G04-M01, F07-G06-M01 | Mixed granularity: auth/session are SHARED_PLATFORM_SERVICE; Access Policy and Purpose-bound Access are MINIMAL (fixed role matrix, synthetic-data flag). Baseline counted fan-in 56 as if full modules were required. | Split into SHARED (auth, session) + MINIMAL (policy matrix, purpose flag) |
| `B_CHILD_SCOPE` | F01-G02-M01, F01-G03-M01, F01-G04-M02, F01-G05-M01 | Applies to A0-A4 only; A5 (verified adult) should not inherit child scope. Baseline applied by data class regardless of cohort. | Condition: A0-A4; for parent-only workflows pairing (F01-G02-M01) not needed (already modelled) |
| `B_AI_GATE` | F07-G03-M01, F07-G03-M02, F07-G04-M01, F07-G05-M01, F07-G04-M02 | Applied to every E2 module including optional E2 paths; F04-G02-M01 override made A-lite look AI-dependent. Safety triage (F07-G05-M01) is required for any free-text input even without LLM (CLAUDE.md "lớp an toàn chạy trước AI" and parent emergencies OD-03) — hidden requirement when free-text chat exists in A-lite. | Apply only to enabled E2 paths; add rule: free-text input -> F07-G05-M01 rule layer + F07-G01-M01 static catalog, even in E1 workflows |
| `B_LIFECYCLE` | F01-G06-M01, F07-G06-M02 | Required before real child data (H4), not before synthetic-data pilot; baseline treated as RELEASE (correct) but readers may read as BUILD. | Label POLICY_OPERATIONAL_REQUIREMENT for synthetic pilot; FULL before real-data pilot |

## 3. Yêu cầu năng lực tối thiểu (MINIMAL_CAPABILITY_REQUIRED)

| Module cha | Năng lực tối thiểu | Có thể hoãn | Không được hoãn | Tái sử dụng | Điều kiện trước |
|---|---|---|---|---|---|
| `F01-G02-M01` | One household; Child App pairing by child-generated ID; Parent PIN on unlink; Parent App notice | Cross-household re-pair verification, multi-device, recovery assistance | PIN server assurance, epoch revoke of Child App session (FR-01) | YES (all Child App flows) | F01-G01-M01 |
| `F01-G05-M01` | Parent-set autonomy mode per child (B01-MS-OD-01); UNSET behaves as PARENT_LED (OD-04); must support parent switching a child to CHILD_EXECUTED if child proposals are offered | Child-proposed transitions (F01-G05-M02) | Mode read by Access Policy | YES | F01-G03-M01 |
| `F01-G04-M02` | Versioned consent per purpose; withdrawal stops processing | Granular purposes, child assent UX variants | Legal text once MR-016 resolves; audit | YES | F01-G03-M01 |
| `F01-G04-M01` | Fixed role matrix (primary caregiver, co-caregiver, child) enforced server-side, deny-by-default | Subject/purpose-aware delegation engine, A5 ownership transfer | Server-side enforcement, child-scope check, audit | YES (every protected read/write) | F01-G05-M01, F01-G04-M02 |
| `F07-G06-M01` | Synthetic-data flag; deny real child data while lawful basis UNKNOWN | Full lawful-basis evaluation per purpose | Deny-by-default for real child data | YES | F01-G04-M02 |
| `F02-G01-M01` | Timetable, fixed activity cards (weekday, time, duration, commute), age/grade | Incremental questions, environment context | Data minimisation, guarded update | YES (planning + Pal) | B_AUTHZ, B_CHILD_SCOPE |
| `F04-G01-M01` | Single active weekly plan, version on save, snapshot/restore (needed for temporary exceptions) | Multiple plan scopes, B01 lock semantics | Version id on every mutation | YES | — |
| `F04-G02-M03` | Sleep floor [NC] + protected_hard vs family_hard distinction (P6-BP-OD-02) + 6-group time budget (App Default Standard Bar only if vetted, else UNKNOWN: P6-BP-OD-03) + soft-cap confirm + time-bounded exceptions (max 60 continuous days same constraint, >=7 empty days between similar exceptions: P6-BP-OD-01) | Holistic/context-aware validation (SC-001-G03), cause-aware adaptation (SC-001-G05) | Floor never relaxed; sources on thresholds (SC-001-D01) | YES (construction, change approval) | F02-G01-M01, F04-G01-M01 |
| `F04-G03-M02` | Single approver = primary caregiver | Multi-approver routing, delegation (FI-3.4-001 overlap) | Approver resolved from Access Policy | YES | F01-G04-M01 |
| `F04-G06-M01` | Change requests only for children in CHILD_EXECUTED (B01-MS-OD-02; B01 CR log: PARENT_LED child expresses wishes, no official CR); single approver; 7-day expiry; hard-cap NOT_APPROVABLE; pending never applied | Full B01 v3.1 state machine (TTL, lock precedence, OUTCOME_UNKNOWN) | Proposal never applied without approval | YES | F04-G01-M01, F04-G03-M02 |
| `F04-G07-M02` | Default quiet hours + on/off | Per-category preferences | Quiet hours respected | YES | — |
| `F07-G01-M01` | Approved static catalog: safety messages (OD-03), help/prompt templates, with review status | Full CMS, versioned editorial UI | Only approved items served | YES | F07-G02-M01 (process) |
| `F07-G01-M02` | Keyword/tag retrieval over approved subset with scope filter | Semantic search, ranking | Scope filter before retrieval | YES | F07-G01-M01 |
| `F07-G02-M02` | NG-xxx source code + review status per item | Evidence grading workflow | Unverified flag for external content | YES | F07-G01-M01 |
| `F07-G04-M01` | Allowlist of (task, audience) scopes + rule-based output checks | Model-based policy evaluation, thresholds | No output without scope evidence (OD-05) | YES (all E2) | — |
| `F05-G06-M02` | Entry-level deletion (no derived data in pilot) | Derived-data lineage graph | Deletion log | NO (Journal-specific) | F07-G06-M02 |
| `F06-G05-M01` | Two fixed audience templates (parent, child) | Configurable audiences | Journal never in parent template | YES | — |
| `F06-G01-M02` | Source field: child self-report / parent-confirmed / teacher-verified | Full provenance model (F02-G06-M01) | Displayed label | YES | — |
| `F02-G05-M01` | Single current profile + change log | Full versioned projection | Visible and editable (transparency rule) | YES | F02-G01-M01 |
| `F03-G03-M01` | Age default table from spec-quy-tac-lap-lich, used as bar only if vetted; otherwise labelled UNKNOWN/[MĐ] (P6-BP-OD-03) | Stage catalog content | Sourced values | YES | — |

Không tạo bản cài đặt trùng: mỗi năng lực tối thiểu nằm trong đúng module cha. Ví dụ, preset quỹ thời gian thuộc `F04-G02-M03` (Standard Bar), không tách thành module mới.

## 4. Báo cáo toàn vẹn đồ thị

**Yêu cầu nền tảng ẩn** (không phải module, nhưng bắt buộc):
- Push/local notification delivery service incl. Android exact-alarm permission and OEM battery settings (Plan A §6; F04-G07-M01 latency H)
- Offline storage/sync for Child App (expo-sqlite, Plan A)
- Pseudonymisation before external LLM call (CLAUDE.md, Plan A pal-chat)
- Secrets management (Claude key only in Supabase secret)
- Device location service for Plan A geofence (no L3 owner: Feature gap)

**Yêu cầu an toàn bị bỏ sót khi dựng workflow:**
- Free-text input without LLM still needs safety rule layer + static catalog (B_AI_GATE finding)
- Temporary exceptions must never relax the fixed floor (spec §3) - enforced in F04-G02-M03 minimal capability
- Fatigue signal must reach parent as trend, not verbatim (spec §1.5) - privacy constraint on P-E05

**Phụ thuộc thay đổi theo cohort hoặc chế độ tự chủ:**
- `E015` F02-G05-M02 → F04-G01-M01: Child feedback A1-A4 only
- `E033` F04-G06-M01 → F04-G03-M02: Only when child proposes (CHILD_EXECUTED/CHILD_DIRECTED, A2-A4); none for A0/A1; A5 self-approves
- `E043` F04-G07-M01 → F04-G07-M02: Child device quiet hours set by parent for A1-A3, by teen for A4
- `E056` F05-G04-M01 → F05-G06-M02: Journal A1(O)-A4; A0 none

**Trực tiếp hay bắc cầu:** mọi cạnh trong ma trận là cạnh trực tiếp. Phụ thuộc bắc cầu (ví dụ báo cáo → Activity Event Log qua Progress Rules) không được tính vào `dependency_enablement` (xem phát hiện F06-G01-M01 ở file 01).

## 5. Nhật ký thay đổi phụ thuộc

| Edge | Nguồn → Đích | Hành động | Ghi chú |
|---|---|---|---|
| `E029` | F04-G02-M02 → F04-G02-M01 | REVERSE | Construction must call conflict detection (not the reverse). Replace by P-E02. |
| `P-E01` | F04-G03-M01 → F04-G02-M01 | ADD_PROPOSED | Proposed in self-audit; needs Owner/MR-040 review |
| `P-E02` | F04-G02-M01 → F04-G02-M02 | ADD_PROPOSED | Proposed in self-audit; needs Owner/MR-040 review |
| `P-E03` | F04-G02-M03 → F02-G01-M01 | ADD_PROPOSED | Proposed in self-audit; needs Owner/MR-040 review |
| `P-E04` | F04-G02-M03 → F04-G01-M01 | ADD_PROPOSED | Proposed in self-audit; needs Owner/MR-040 review |
| `P-E06` | F04-G06-M01 → F01-G05-M01 | ADD_PROPOSED | Proposed in self-audit; needs Owner/MR-040 review |

## 6. Ma trận phụ thuộc v2 (đề xuất)

| Edge | Nguồn (cần) | Đích | Loại | HARD/SOFT | Vòng đời | Granularity | Năng lực tối thiểu | FI | Điều kiện cohort/mode | v2 |
|---|---|---|---|---|---|---|---|---|---|---|
| `E000` | `F01-G02-M01` | `F01-G01-M01` | F | HARD | BUILD | SHARED_PLATFORM_SERVICE | — | — | — | KEEP |
| `E001` | `F01-G02-M02` | `F01-G02-M01` | F | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | One household; Child App pairing by child-generated ID; Parent PIN on unlink; Parent App notice | — | — | KEEP |
| `E002` | `F01-G03-M01` | `F01-G02-M01` | P | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | One household; Child App pairing by child-generated ID; Parent PIN on unlink; Parent App notice | — | — | KEEP |
| `E003` | `F01-G05-M01` | `F01-G03-M01` | D | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E004` | `F01-G04-M02` | `F01-G03-M01` | D | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E005` | `F01-G04-M01` | `F01-G05-M01` | P | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Parent-set autonomy mode per child (B01-MS-OD-01); UNSET behaves as PARENT_LED (OD-04); must support parent switching a child to CHILD_EXECUTED if child proposals are offered | — | — | KEEP |
| `E006` | `F01-G04-M01` | `F01-G04-M02` | P | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Versioned consent per purpose; withdrawal stops processing | — | — | KEEP |
| `E007` | `F07-G06-M01` | `F01-G04-M02` | P | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Versioned consent per purpose; withdrawal stops processing | — | — | KEEP |
| `E008` | `F01-G03-M02` | `F01-G03-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E009` | `F01-G05-M02` | `F01-G05-M01` | F | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Parent-set autonomy mode per child (B01-MS-OD-01); UNSET behaves as PARENT_LED (OD-04); must support parent switching a child to CHILD_EXECUTED if child proposals are offered | — | — | KEEP |
| `E010` | `F01-G06-M01` | `F07-G06-M02` | F | HARD | RELEASE | POLICY_OPERATIONAL_REQUIREMENT | Retention schedule + manual purge runbook (pilot, synthetic data) | FI-3.4-003 | — | KEEP |
| `E011` | `F02-G01-M02` | `F02-G01-M01` | F | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Timetable, fixed activity cards (weekday, time, duration, commute), age/grade | — | — | KEEP |
| `E012` | `F02-G05-M01` | `F02-G01-M01` | D | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Timetable, fixed activity cards (weekday, time, duration, commute), age/grade | — | — | KEEP |
| `E013` | `F02-G02-M01` | `F01-G03-M01` | D | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E014` | `F02-G06-M02` | `F02-G05-M01` | F | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Single current profile + change log | — | — | KEEP |
| `E015` | `F02-G05-M02` | `F04-G01-M01` | F | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | Child feedback A1-A4 only | KEEP |
| `E016` | `F02-G03-M01` | `F02-G03-M02` | S | HARD | RELEASE | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E017` | `F03-G05-M01` | `F07-G01-M02` | D | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Keyword/tag retrieval over approved subset with scope filter | — | — | KEEP |
| `E018` | `F03-G05-M01` | `F07-G02-M02` | D | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | NG-xxx source code + review status per item | — | — | KEEP |
| `E019` | `F03-G05-M01` | `F03-G03-M01` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E020` | `F03-G05-M02` | `F03-G05-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E021` | `F03-G04-M01` | `F03-G03-M01` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E022` | `F04-G01-M01` | `F03-G04-M01` | F | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E023` | `F04-G01-M01` | `F03-G05-M02` | F | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E024` | `F04-G01-M02` | `F04-G01-M01` | F | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Single active weekly plan, version on save, snapshot/restore (needed for temporary exceptions) | — | — | KEEP |
| `E025` | `F04-G02-M01` | `F04-G01-M01` | F | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Single active weekly plan, version on save, snapshot/restore (needed for temporary exceptions) | — | — | KEEP |
| `E026` | `F04-G02-M01` | `F02-G01-M01` | D | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Timetable, fixed activity cards (weekday, time, duration, commute), age/grade | — | — | KEEP |
| `E027` | `F04-G02-M01` | `F03-G03-M01` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E028` | `F04-G02-M01` | `F04-G02-M03` | S | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Sleep floor [NC] + protected_hard vs family_hard distinction (P6-BP-OD-02) + 6-group time budget (App Default Standard Bar only if vetted, else UNKNOWN: P6-BP-OD-03) + soft-cap confirm + time-bounded exceptions (max 60 continuous days same constraint, >=7 empty days between similar exceptions: P6-BP-OD-01) | — | — | KEEP |
| `E029` | `F04-G02-M02` | `F04-G02-M01` | F | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | REVERSE |
| `E030` | `F04-G02-M03` | `F03-G03-M01` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E031` | `F04-G03-M01` | `F04-G01-M01` | F | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Single active weekly plan, version on save, snapshot/restore (needed for temporary exceptions) | — | — | KEEP |
| `E032` | `F04-G03-M02` | `F01-G04-M01` | P | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Fixed role matrix (primary caregiver, co-caregiver, child) enforced server-side, deny-by-default | — | — | KEEP |
| `E033` | `F04-G06-M01` | `F04-G03-M02` | P | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Single approver = primary caregiver | FI-3.4-001 | Only when child proposes (CHILD_EXECUTED/CHILD_DIRECTED, A2-A4); none for A0/A1; A5 self-approves | KEEP |
| `E034` | `F04-G06-M01` | `F04-G02-M03` | S | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Sleep floor [NC] + protected_hard vs family_hard distinction (P6-BP-OD-02) + 6-group time budget (App Default Standard Bar only if vetted, else UNKNOWN: P6-BP-OD-03) + soft-cap confirm + time-bounded exceptions (max 60 continuous days same constraint, >=7 empty days between similar exceptions: P6-BP-OD-01) | — | — | KEEP |
| `E035` | `F04-G06-M01` | `F04-G01-M01` | F | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Single active weekly plan, version on save, snapshot/restore (needed for temporary exceptions) | — | — | KEEP |
| `E036` | `F04-G06-M02` | `F04-G01-M01` | D | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Single active weekly plan, version on save, snapshot/restore (needed for temporary exceptions) | — | — | KEEP |
| `E037` | `F04-G04-M01` | `F04-G03-M01` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E038` | `F04-G04-M02` | `F04-G04-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E039` | `F04-G04-M02` | `F07-G01-M01` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E040` | `F04-G05-M01` | `F04-G04-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E041` | `F04-G05-M02` | `F04-G04-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E042` | `F04-G07-M01` | `F04-G03-M01` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E043` | `F04-G07-M01` | `F04-G07-M02` | P | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Default quiet hours + on/off | — | Child device quiet hours set by parent for A1-A3, by teen for A4 | KEEP |
| `E044` | `F05-G01-M01` | `F05-G01-M02` | S | HARD | RELEASE | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E045` | `F05-G01-M01` | `F07-G01-M02` | D | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Keyword/tag retrieval over approved subset with scope filter | — | — | KEEP |
| `E046` | `F05-G01-M01` | `F07-G02-M02` | D | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | NG-xxx source code + review status per item | — | — | KEEP |
| `E047` | `F05-G01-M01` | `F07-G02-M01` | O | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E048` | `F05-G01-M01` | `F02-G05-M01` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E049` | `F05-G01-M02` | `F07-G01-M01` | D | HARD | RELEASE | MINIMAL_CAPABILITY_REQUIRED | Approved static catalog: safety messages (OD-03), help/prompt templates, with review status | — | — | KEEP |
| `E050` | `F07-G05-M01` | `F07-G01-M01` | D | HARD | RELEASE | MINIMAL_CAPABILITY_REQUIRED | Approved static catalog: safety messages (OD-03), help/prompt templates, with review status | — | — | KEEP |
| `E051` | `F05-G02-M02` | `F05-G02-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E052` | `F05-G02-M01` | `F04-G03-M01` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E053` | `F05-G03-M02` | `F05-G03-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E054` | `F05-G03-M01` | `F07-G01-M01` | D | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Approved static catalog: safety messages (OD-03), help/prompt templates, with review status | — | — | KEEP |
| `E055` | `F05-G04-M02` | `F05-G04-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E056` | `F05-G04-M01` | `F05-G06-M02` | D | HARD | RELEASE | MINIMAL_CAPABILITY_REQUIRED | Entry-level deletion (no derived data in pilot) | — | Journal A1(O)-A4; A0 none | KEEP |
| `E057` | `F05-G04-M01` | `F07-G06-M01` | P | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Synthetic-data flag; deny real child data while lawful basis UNKNOWN | — | — | KEEP |
| `E058` | `F05-G06-M01` | `F05-G04-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E059` | `F05-G05-M01` | `F05-G06-M02` | D | HARD | RELEASE | MINIMAL_CAPABILITY_REQUIRED | Entry-level deletion (no derived data in pilot) | FI-3.4-003 | — | KEEP |
| `E060` | `F05-G05-M01` | `F05-G04-M02` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E061` | `F05-G05-M02` | `F05-G05-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E062` | `F05-G06-M02` | `F07-G06-M02` | F | HARD | RELEASE | POLICY_OPERATIONAL_REQUIREMENT | Retention schedule + manual purge runbook (pilot, synthetic data) | FI-3.4-003 | — | KEEP |
| `E063` | `F06-G01-M01` | `F04-G05-M01` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E064` | `F06-G01-M01` | `F06-G01-M02` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E065` | `F06-G02-M01` | `F06-G01-M01` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E066` | `F06-G02-M01` | `F04-G03-M01` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E067` | `F06-G02-M02` | `F06-G02-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E068` | `F06-G04-M01` | `F06-G02-M01` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E069` | `F06-G05-M02` | `F06-G02-M01` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E070` | `F06-G05-M02` | `F06-G05-M01` | P | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Two fixed audience templates (parent, child) | — | — | KEEP |
| `E071` | `F06-G05-M02` | `F06-G04-M01` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E072` | `F06-G06-M01` | `F06-G05-M02` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E073` | `F06-G06-M02` | `F06-G06-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E074` | `F06-G06-M02` | `F04-G06-M01` | F | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Change requests only for children in CHILD_EXECUTED (B01-MS-OD-02; B01 CR log: PARENT_LED child expresses wishes, no official CR); single approver; 7-day expiry; hard-cap NOT_APPROVABLE; pending never applied | FI-3.4-004 (F06 proposes, F03/F04 decides) | — | KEEP |
| `E075` | `F06-G04-M02` | `F06-G04-M01` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E076` | `F06-G04-M02` | `F02-G03-M02` | S | HARD | RELEASE | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E077` | `F06-G07-M01` | `F06-G01-M02` | D | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Source field: child self-report / parent-confirmed / teacher-verified | — | — | KEEP |
| `E078` | `F07-G01-M02` | `F07-G01-M01` | D | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Approved static catalog: safety messages (OD-03), help/prompt templates, with review status | — | — | KEEP |
| `E079` | `F07-G01-M01` | `F07-G02-M01` | O | HARD | RELEASE | POLICY_OPERATIONAL_REQUIREMENT | Manual expert editorial review | — | — | KEEP |
| `E080` | `F07-G02-M02` | `F07-G01-M01` | D | HARD | BUILD | MINIMAL_CAPABILITY_REQUIRED | Approved static catalog: safety messages (OD-03), help/prompt templates, with review status | — | — | KEEP |
| `E081` | `F07-G03-M01` | `F07-G04-M01` | S | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Allowlist of (task, audience) scopes + rule-based output checks | — | — | KEEP |
| `E082` | `F07-G03-M01` | `F07-G03-M02` | O | HARD | RUN | POLICY_OPERATIONAL_REQUIREMENT | — | — | — | KEEP |
| `E083` | `F07-G03-M01` | `F07-G05-M01` | S | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E084` | `F07-G04-M01` | `F07-G04-M02` | O | SOFT | RELEASE | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E085` | `F07-G03-M03` | `F07-G03-M01` | F | HARD | BUILD | SHARED_PLATFORM_SERVICE | — | — | — | KEEP |
| `E086` | `F07-G07-M02` | `F07-G03-M02` | D | HARD | RUN | SHARED_PLATFORM_SERVICE | — | — | — | KEEP |
| `E087` | `F08-G01-M02` | `F08-G01-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E088` | `F08-G02-M02` | `F08-G02-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E089` | `F08-G03-M02` | `F08-G03-M01` | D | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E090` | `F08-G03-M02` | `F02-G02-M01` | D | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E091` | `F08-G04-M02` | `F08-G04-M01` | P | HARD | RUN | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E092` | `F08-G05-M02` | `F08-G05-M01` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `E093` | `F08-G06-M02` | `F08-G06-M01` | F | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | KEEP |
| `E094` | `F01-G06-M03` | `F01-G06-M02` | F | HARD | BUILD | FULL_MODULE_REQUIRED | — | — | — | KEEP |
| `P-E01` | `F04-G03-M01` | `F04-G02-M01` | F | SOFT | RUN | OPTIONAL_DEPENDENCY | — | — | — | ADD_PROPOSED |
| `P-E02` | `F04-G02-M01` | `F04-G02-M02` | F | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | — | — | — | ADD_PROPOSED |
| `P-E03` | `F04-G02-M03` | `F02-G01-M01` | D | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Timetable, fixed activity cards (weekday, time, duration, commute), age/grade | — | — | ADD_PROPOSED |
| `P-E04` | `F04-G02-M03` | `F04-G01-M01` | D | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Single active weekly plan, version on save, snapshot/restore (needed for temporary exceptions) | — | — | ADD_PROPOSED |
| `P-E06` | `F04-G06-M01` | `F01-G05-M01` | P | HARD | RUN | MINIMAL_CAPABILITY_REQUIRED | Parent-set autonomy mode per child (B01-MS-OD-01); UNSET behaves as PARENT_LED (OD-04); must support parent switching a child to CHILD_EXECUTED if child proposals are offered | — | — | ADD_PROPOSED |

## 7. Quyết định phụ thuộc chưa giải quyết

1. **FI-3.4-001:** F04-G03 Approval Routing hay F04-G06 Plan Approval quyết định trạng thái phê duyệt. Ảnh hưởng tới E033.
2. **FI-3.4-003:** phạm vi xóa giữa F01-G06, F05-G06, F07-G06. Ảnh hưởng tới E010, E059, E062.
3. **FI-3.4-004:** F06-G06 chỉ đề xuất; F03-G06 hoặc F04-G06 là bên quyết định. Ảnh hưởng tới E074.
4. **Định vị geofence của Plan A:** đề xuất ánh xạ vào F08-G04-M01/M02 + F01-G04-M02 + F06-G01 + F04-G07 (theo phản biện). Owner quyết ánh xạ này có chấp nhận được không (OD-A3).
5. **Chủ sở hữu tín hiệu mệt/đói** (OD-A7). P-E05 sẽ được thêm lại khi có chủ.
6. **Chuyển các cạnh P-E01..P-E04, P-E06 và mọi cạnh CANDIDATE → CONFIRMED:** cần MR-040.

**Độ tin cậy:** HYPOTHESIS cho mọi phân loại. **Câu hỏi còn mở:** các mục 1–5. **Cần Owner duyệt:** có, trước khi dùng v2 làm thứ tự phát triển.
