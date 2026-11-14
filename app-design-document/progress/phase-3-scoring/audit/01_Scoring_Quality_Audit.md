# 01 — Audit chất lượng scoring (Phase A)

**Loại:** `SELF_AUDIT / PROPOSAL` · **Người soạn:** AI (Claude, Opus 5.5), tự rà soát lượt chấm của chính mình, chưa kiểm chứng độc lập; có 1 lượt phản biện bằng subagent · **Nguồn:** HEAD `9043c88`; baseline đóng băng `baseline_v1/` (SHA256SUMS) · **Cần Owner duyệt:** mọi thay đổi đề xuất

**Dữ liệu:**
- `data/phase_a.json` (script `tools/phase_a.py`);
- phản biện: `work/adversarial_review.json` (subagent Sonnet 5.5);
- đối chiếu: `data/adversarial_reconciled.json`.

## 1. Báo cáo chất lượng scoring

| Chỉ số | Giá trị |
|---|---|
| Module được audit | 106: 40 COARSE được rà thủ công từng module; 66 FULL được kiểm tự động, module nào bị cờ thì rà thủ công |
| Phân loại | KEEP 80 · CLARIFY 17 · REVIEW 5 · BLOCKED 4 |
| Trong 40 COARSE | KEEP 28 · CLARIFY 11 · REVIEW 1 · BLOCKED 0 |
| Căn cứ của các mục rà thủ công (54) | CONFIRMED_SOURCE 24 · CONFIRMED_SCRIPT 4 · SELF_OMISSION 9 · JUDGMENT 17 |
| Cờ tự động | 9, đã xử lý hết |
| Phản biện subagent | 17 phát hiện được phản biện: SUPPORTED 8, PARTLY_SUPPORTED 9; 20 mục độ phủ; 8 mục bị bỏ sót được nêu |

**Kết luận:**
- **Đủ nhất quán để dùng tiếp, nhưng có điều kiện.** Baseline không có lỗi số học hay lỗi gate. Không gate nào bị chấm PASS sai, không có điểm tổng.
- **Lỗi đáng kể nằm ở phạm vi workflow và lý do chấm, không nằm ở số điểm.**
  - **Lỗi nặng nhất:** `F04-G02-M01` bị nâng lên E2, trái với Inventory và 3.4. Hệ quả là A-lite mất bộ dựng lịch.
  - **Tự bỏ sót:** baseline không đọc 3.4, SC-001..003 và spec lập lịch. Vì vậy có 10 phát hiện loại SELF_OMISSION.
- **Mọi giá trị vẫn là EXPERT_HYPOTHESIS.** Audit này **không** biến điểm nào thành đã kiểm chứng.

**Phân biệt:**
- **Lỗi đã xác nhận** (CONFIRMED_SOURCE, CONFIRMED_SCRIPT): mâu thuẫn với tài liệu đã duyệt hoặc mâu thuẫn nội bộ đo được bằng script.
- **Bỏ sót** (SELF_OMISSION): nguồn có sẵn mà baseline không đọc.
- **Nhận định chủ quan** (JUDGMENT): có thể tranh luận.

## 2. Sổ bất thường

| # | Loại (A2) | Module | Phát hiện | Căn cứ |
|---|---|---|---|---|
| AN-01 | Module tương tự chấm khác nhau | F04-G01-M01 vs F04-G03-M01; F06-G02-M01 vs F04-G02-M02; F06-G04-M01 vs F06-G02-M02 | Quy tắc INDIRECT của R1.1a chưa đủ chặt; module cấu trúc/tính toán lúc ghi INDIRECT, lúc ghi điểm | CONFIRMED_SCRIPT |
| AN-02 | Điểm cao dù bằng chứng yếu | F04-G02-M01 (phụ huynh A2 = 5), F04-G02-M03 (khác biệt = 5), F04-G04-M01 (adoption = 5) | Không có dữ liệu người dùng; là các điểm cao nhất nhưng đều là giả thuyết (CA-01, CA-02) | JUDGMENT |
| AN-03 | Điểm thấp vì giá trị nằm ở module khác | F06-G02-M01, F06-G04-M01 (INDIRECT) | Đúng chủ đích của R1.1a, nhưng làm mờ đóng góp workflow; đã tách đóng góp workflow ở file 05 | JUDGMENT |
| AN-04 | Yêu cầu an toàn/nền tảng chấm như tính năng thường | — | Không thấy: các module nền dùng INDIRECT, gate tách riêng | CONFIRMED_SCRIPT (không có bất thường) |
| AN-05 | Đếm trùng năng lực dùng chung | Gói B_AUTHZ / B_CHILD_SCOPE | Fan-in 52–56 của nền tảng đến từ việc mở rộng gói; enablement của các module này hợp lý (5), nhưng phạm vi build bị phóng đại (Phase B) | CONFIRMED_SCRIPT |
| AN-06 | Năng lực mở khóa workflow bị đánh giá thấp | F04-G06-M01, F06-G04-M01, F04-G02-M03 (ngoại lệ) | Bị để là tùy chọn hoặc vắng mặt trong A-lite dù prototype và SC-001 coi là cốt lõi | CONFIRMED_SOURCE |
| AN-07 | Chấm sai phạm vi module | F02-G05-M02 | Baseline chấm như phản hồi về việc; Inventory: trẻ xem và đề nghị sửa hiểu biết về mình (phản biện phát hiện) | CONFIRMED_SOURCE |
| AN-08 | Bỏ qua quyết định Owner đã duyệt | F04-G02-M03, F04-G06-M01, F03-G03-M01 | P6-BP-OD-01..03, B01 CR log, B01-MS-OD-01..04 không được áp (phản biện phát hiện) | CONFIRMED_SOURCE |
| AN-09 | Điểm phụ thuộc giả định không có căn cứ | F04-G02-M01 (E2), F04-G06-M01 (effort 4 = máy trạng thái đầy đủ) | Giả định về cách triển khai quyết định điểm chi phí | CONFIRMED_SOURCE |
| AN-10 | Enablement lệch với số phụ thuộc trực tiếp | F04-G02-M01 (4 vs 0), F06-G01-M01 (4 vs 1) | Rubric đếm phụ thuộc trực tiếp | CONFIRMED_SCRIPT |
| AN-11 | Lý do sai với scenario đã duyệt | F03-G05-M03 | Ghi "chủ yếu A4–A5" trong khi SC-003 là học sinh lớp 8 (A3) | CONFIRMED_SOURCE |
| AN-12 | Tính năng Owner đã chốt không có L3 đứng tên | Geofence Plan A | Ánh xạ được vào F08-G04-M01/M02 + F01-G04-M02 + F06-G01 + F04-G07; chờ Owner chấp nhận | CONFIRMED_SOURCE |

## 2b. Đối chiếu với lượt phản biện (subagent Sonnet 5.5)

| Mục | Phản biện | Quyết định | Tác động |
|---|---|---|---|
| 4 module nền BLOCKED (chưa kiểm độc lập) | SUPPORTED; nhưng chưa được nêu là blocker của A-lite v2 | ACCEPT | Liệt kê riêng trong phase_c (never_independently_reviewed_in_v2) |
| F02-G05-M02 tín hiệu mệt | PARTLY: sai chủ sở hữu; prototype không có quy tắc giảm tải | ACCEPT | F02-G05-M02 REVIEW vì chấm sai phạm vi; tín hiệu mệt thành MISSING, chưa có chủ (OD-A7); rút P-E05 |
| F04-G06-M01 đề xuất của con | PARTLY: trái B01 CR log (PARENT_LED không có CR) và B01-MS-OD-02 | ACCEPT | Chỉ áp dụng với CHILD_EXECUTED; hết hạn 7 ngày; không duyệt vượt hard-cap |
| F04-G02-M03 phạm vi | SUPPORTED; thiếu P6-BP-OD-01..03; preset không phải Standard Bar | ACCEPT | Thêm ràng buộc 60 ngày / 7 ngày / protected vs family / mặc định chưa thẩm định thì UNKNOWN |
| F04-G02-M01 E1 | PARTLY: có căn cứ để phân loại lại, nhưng chưa có bằng chứng khả thi | ACCEPT | Khả thi E1 = UNKNOWN cho đến khi làm spike RG-01 |
| F08-G04-M01 geofence | PARTLY: ánh xạ được vào các ID có sẵn | ACCEPT | BLOCKED -> CLARIFY; FEATURE_GAP -> PARTIAL (đề xuất ánh xạ) |
| F07-G07-M02 telemetry | PARTLY: thuộc F07-G03-M02, không phải yêu cầu của A-lite | ACCEPT | REVIEW -> CLARIFY; rút P-E07 |
| F05-G01-M01 căn cứ | PARTLY: GAP-16 đã có trong baseline | ACCEPT | Căn cứ đổi sang JUDGMENT |
| F06-G04-M02 phương án E1 | PARTLY: không có trend trong prototype; ngưỡng không có nguồn | ACCEPT | Chỉ hỏi bối cảnh theo cửa sổ 2 tuần; không dùng ngưỡng đếm |
| Ma trận độ phủ: preset và giai đoạn tạm thời | Ghi MISSING trong khi module đã có trong v1 | ACCEPT | Đổi thành PARTIAL; năng lực thiết yếu thiếu: 5 -> 4 |
| Việc một lần | Có trong spec-quy-tac E3/K3/K4 | ACCEPT | PARTIAL, thiết yếu YES |
| Thời tiết | Là L4, không phải khoảng trống L3 | ACCEPT | PARTIAL (F04-G04-M01, F04-G07-M01) |
| Ảnh, giọng nói, báo đói (Plan A) | Plan A đã chốt, nên không phải NO | ACCEPT_AS_VARIANT | NO cho A-lite E1, YES cho biến thể Plan A (OD-A2) |
| Lớp an toàn cho văn bản tự do | Phải là thiết yếu | ACCEPT_AS_VARIANT | YES cho biến thể Plan A và mọi trường hợp có văn bản tự do; CONDITIONAL chỉ cho biến thể E1 chỉ nhập có cấu trúc |
| M1: A-lite không dùng AI, trong khi chuẩn là Pal chat | HIGH | ACCEPT | Định nghĩa thêm biến thể Plan A (40 module); OD-A2 cho Owner chọn |
| M5: dữ liệu sức khỏe trong hồ sơ | MEDIUM | ACCEPT | Thêm dòng HARD_SAFETY; cần giảm thiểu dữ liệu |
| M8: PIN, ghép thiết bị và mã gia đình của Plan A | LOW | ACCEPT | OD-A8 |
| Ngưỡng không có nguồn: sàn [MĐ] bị coi là HARD_SAFETY | MEDIUM | ACCEPT | Chỉ sàn ngủ [NC] là HARD_SAFETY; các mục khác là [MĐ] |
| Ngưỡng không có nguồn: "chấp nhận mặc định cứng" | MEDIUM | ACCEPT | Mặc định chưa thẩm định thì ghi UNKNOWN (P6-BP-OD-03) |

Không có phát hiện nào bị bác hoàn toàn (0 NOT_SUPPORTED). 9 phát hiện chỉ đúng một phần và đã được sửa. Phản biện tìm thêm 8 điểm bị bỏ sót; tất cả đã được ghi nhận.

## 3. Đề xuất chấm lại có chọn lọc (giữ cả điểm gốc và điểm đề xuất)

| Module | Khóa | Điểm gốc (baseline_v1) | Đề xuất | Căn cứ | Phản biện subagent | Trạng thái |
|---|---|---|---|---|---|---|
| `F04-G02-M01` | exec_class | E2 (L4 override) | E1 default; E2 optional for natural-language input | CONFIRMED_SOURCE: Inventory E1/Low; 3.4 UC-007 execution_policy default E1; SC-001 §5 | PARTLY_SUPPORTED | PROPOSED |
| `F04-G02-M01` | ai_cost_risk | M | L (default path); M only if E2 enabled | Follows exec correction | PARTLY_SUPPORTED | PROPOSED |
| `F04-G02-M01` | dependency_enablement | 4 | 3 (or keep 4 if P-E01 accepted) | CONFIRMED_SCRIPT: 0 direct HARD dependents | PARTLY_SUPPORTED | PROPOSED |
| `F04-G02-M01` | G-Safety | CONDITIONAL (whole module) | CONDITIONAL only for optional E2 path; E1 path UNKNOWN (no AI output) | Follows exec correction; OD-05 applies to AI output | PARTLY_SUPPORTED | PROPOSED |
| `F04-G02-M01` | workflow membership | W1 only | W1 and A-lite (W1E1 -> A-lite v2) | Phase C step 4 essential | PARTLY_SUPPORTED | PROPOSED |
| `F04-G02-M03` | adoption_potential | NOT_APPLICABLE | 3 | CONFIRMED_SOURCE: spec-quy-thoi-gian §1.3-1.4 user-facing warning + "Giữ mức này" | SUPPORTED | PROPOSED |
| `F04-G02-M03` | scope note | Balanced planning validation (hard/soft caps, play time, load) | + Family Standard Bar presets + time-bounded exceptions (SC-001-D01/D03) | CONFIRMED_SOURCE: SC-001; Inventory R1 text already names Standard Bar | SUPPORTED | PROPOSED |
| `F04-G06-M01` | implementation_effort (A-lite minimal capability) | 4 (full B01 v3.1) | 2-3 for minimal CR (CHILD_EXECUTED only, single approver, 7-day expiry, hard-cap NOT_APPROVABLE); 4 retained for full module | Phase B MINCAP; B01 CR log; B01-MS-OD-02 | PARTLY_SUPPORTED | PROPOSED |
| `F04-G06-M01` | workflow membership | W1 optional, W3 required | A-lite v2 required (minimal; only for children in CHILD_EXECUTED) | CONFIRMED_SOURCE: spec §3-4; 3.4 UC-010; B01-MS-OD-02 | PARTLY_SUPPORTED | PROPOSED |
| `F02-G05-M02` | core_loop_contribution | 3 (Feedback on tasks) | 2 (Understand: child contests profile assertions) | CONFIRMED_SOURCE: Inventory F02-G05-M02-001 scope; adversarial review | PARTLY_SUPPORTED | PROPOSED |
| `F02-G05-M02` | value reasons (all cohorts) | task/plan feedback (too hard, too much) | rewrite on real scope; values kept as HYPOTHESIS pending rescoring | CONFIRMED_SOURCE: scope error | PARTLY_SUPPORTED | PROPOSED |
| `F06-G04-M01` | workflow membership | W1 optional | A-lite v2 required (2-week pattern -> context question, no causal claim) | CONFIRMED_SOURCE: spec §1.5; spec-quy-tac L2; SC-001-D02 | — | PROPOSED |
| `F06-G02-M02` | workflow membership | W1 optional | A-lite v2 required (sick/rest day not failure) | JUDGMENT: needed so fatigue relief is not counted as failure | — | PROPOSED |
| `F06-G01-M01` | dependency_enablement | 4 | 3 (direct), transitive note | CONFIRMED_SCRIPT | — | PROPOSED |
| `F03-G05-M03` | tier rationale | mainly A4-A5; outside CORE grades 1-9 | CORE-relevant A3 exploration (SC-003 grade 8); deferred as non-essential to planning loop | CONFIRMED_SOURCE: SC-003 §1 | SUPPORTED | PROPOSED |
| `F07-G03-M02` | minimum capability | Per-household daily cap | + AI calls/cost per successful outcome when any E2 path is enabled | 3.4 §9; SC-002-G10; adversarial: better home than F07-G07-M02 | — | PROPOSED |
| `F04-G02-M03` | defaults / constraints | age defaults acceptable; floor treated as universal | App Default Standard Bar only if vetted else UNKNOWN; only sleep floor [NC] is HARD_SAFETY; P6-BP-OD-01/02 constraints in scope | CONFIRMED_SOURCE: P6 Balanced Planning Owner Decision Log OD-01..03 | SUPPORTED | PROPOSED |

Baseline **không bị ghi đè**. Mọi đề xuất nằm ở cột riêng và chỉ áp dụng khi Owner duyệt. Khi đó sẽ tạo `assessment_v1_1.json`.

## 4. Phân loại từng module (KEEP / CLARIFY / REVIEW / BLOCKED)

| L3 | Mức | Tier | Trạng thái audit | Căn cứ | Phát hiện | Đề xuất | Tin cậy | Cần Owner | Phản biện |
|---|---|---|---|---|---|---|---|---|---|
| `F02-G05-M02` | FULL | CORE_VALUE | **REVIEW** | CONFIRMED_SOURCE | Baseline scored F02-G05-M02 as task/plan feedback ("too hard, too much"; core_loop=Feedback 3; edge to F04-G01-M01). Inventory scope is "Trẻ xem và đề nghị sửa hiểu biết về mình" (agree/contest profile assertions, F02-G05-M02-001). Value reasons and loop step rest on the wrong scope; its STABLE_HIGH result in Phase E is therefore an artefact. The fatigue signal required by SC-001-D02/spec §4 has no clean L3 owner. | Rescore F02-G05-M02 on its real scope: core_loop 3 -> 2 (Understand), keep child_value A3 4 (autonomy over how child is described) as hypothesis; edge E015 reason to be rewritten; fatigue signal ownership decision OD-A7 | HIGH (scope error) / HYPOTHESIS (new values) | YES | PARTLY_SUPPORTED |
| `F03-G05-M03` | COARSE | DEFERRED | **REVIEW** | CONFIRMED_SOURCE | Baseline rationale "mainly A4-A5; outside CORE grades 1-9" contradicts SC-003 (approved Package C decisions) whose scenario is a grade-8 child (A3, inside CORE). | Tier stays DEFERRED (not required by any workflow) but rationale -> "CORE-relevant A3 exploration, deferred as non-essential to planning loop"; A3 applicability APPLICABLE | HIGH | NO (correction of rationale) | SUPPORTED |
| `F04-G02-M01` | FULL | CORE_VALUE | **REVIEW** | CONFIRMED_SOURCE | Baseline override E1->E2 contradicts Inventory (E1/Low), 3.4 UC-007 (default E1, LLM optional) and SC-001 §5. Consequence: W1E1 (A-lite) dropped schedule construction. Enablement 4 but 0 direct HARD dependents. Adversarial caveat accepted: no deterministic builder exists today (checkDayK only validates; ordering is done by the LLM prompt), so E1 feasibility is UNKNOWN until a spike. | exec E1 default + optional E2; ai_cost_risk L for default path; include in A-lite; enablement 4 -> 3 unless P-E01 accepted; G-Feasibility stays UNKNOWN pending spike (RG-01) | HIGH (classification) / LOW (feasibility) | NO (restores approved baseline) | PARTLY_SUPPORTED |
| `F04-G02-M03` | FULL | CORE_VALUE | **REVIEW** | CONFIRMED_SOURCE | Prototype/spec show direct parent interaction (warning line, soft-cap "Giữ mức này", presets). Baseline scored adoption N/A. Scope must include approved Owner rules P6-BP-OD-01 (same-constraint relaxation max 60 continuous days; >=7 empty days between similar exceptions), OD-02 (protected_hard_cap vs family_hard, no emergency bypass) and OD-03 (App Default Standard Bar must be vetted, else UNKNOWN). Presets are not automatically Standard Bar: SC-001-D03 separates long-term bar from time-bound exceptions (Thi cử, Nghỉ hè are time-bound). | adoption N/A -> 3; scope note adds Standard Bar + time-bounded exceptions with P6-BP-OD-01..03 constraints; unvetted defaults labelled UNKNOWN | MEDIUM | NO | SUPPORTED |
| `F04-G06-M01` | FULL | CORE_VALUE | **REVIEW** | CONFIRMED_SOURCE | Child proposals are core in spec §3-4 and 3.4 UC-010, but approved B01 decisions constrain them: in PARENT_LED a child may express wishes but not create an official Change Request (B01 CR log); proposals need mode CHILD_EXECUTED per child (B01-MS-OD-01/02), UNSET behaves as PARENT_LED (OD-04); 7-day expiry and hard-cap NOT_APPROVABLE apply. Baseline effort 4 assumes the full B01 v3.1 state machine. | Minimal capability in A-lite: CR only for children set to CHILD_EXECUTED, single approver, 7-day expiry, hard-cap not approvable; PARENT_LED children use informal wish note. Effort 4 retained for full module | MEDIUM | YES (A-lite scope) | PARTLY_SUPPORTED |
| `F01-G04-M01` | FULL | MIN_FOUNDATION | **BLOCKED** | CONFIRMED_SOURCE | Never independently reviewed; foundation of every workflow; scores capped LOW. Cannot be improved by audit without independent L4 review. | — | LOW | YES (review authorisation) | SUPPORTED |
| `F01-G04-M02` | FULL | MIN_FOUNDATION | **BLOCKED** | CONFIRMED_SOURCE | Same; legal content of consent unknown (MR-016). | — | LOW | YES | SUPPORTED |
| `F01-G05-M01` | FULL | MIN_FOUNDATION | **BLOCKED** | CONFIRMED_SOURCE | Never independently reviewed. | — | LOW | YES | SUPPORTED |
| `F07-G06-M01` | FULL | MIN_FOUNDATION | **BLOCKED** | CONFIRMED_SOURCE | Never independently reviewed; lawful basis UNKNOWN. | — | LOW | YES | SUPPORTED |
| `F01-G05-M02` | COARSE | ADV_SECURITY_OPS | **CLARIFY** | SELF_OMISSION | 3.4 UC-002 and §5 require mode branches; deferral is fine only if Mode State supports parent-set changes with audit. Rationale should cite UC-002. | Add UC-002 trace to note; keep ADV_SECURITY_OPS | MEDIUM | NO | PARTLY_SUPPORTED |
| `F02-G04-M01` | COARSE | DEFERRED | **CLARIFY** | SELF_OMISSION | SC-001 lists family context/commute as planning input; prototype captures commute in activity cards (spec-quy-thoi-gian §2.3). Coverage via Intake must be stated explicitly. | Note: minimal commute/fixed-activity context handled in F02-G01-M01 intake | MEDIUM | NO | — |
| `F03-G03-M02` | COARSE | DEFERRED | **CLARIFY** | JUDGMENT | Accessibility deferral creates inclusion risk (MR-037); re-entry trigger defined but not tied to pilot recruitment criteria. | Add pilot recruitment rule as explicit re-entry trigger | MEDIUM | YES (pilot scope) | — |
| `F03-G04-M03` | COARSE | DEFERRED | **CLARIFY** | SELF_OMISSION | SC-001 expected output is a multi-year roadmap (SC-001-G02) and SC3-D04 reuses roadmap/task/review. Deferral may still be right for A-lite, but baseline did not weigh these approved scenario principles. | Record SC-001-G02/SC3-D04 in rationale; keep DEFERRED for A-lite pending Owner | MEDIUM | YES | SUPPORTED |
| `F03-G06-M01` | COARSE | DEFERRED | **CLARIFY** | SELF_OMISSION | FI-3.4-004: F03-G06 vs F06-G06 ownership overlap is REVIEW_REQUIRED; baseline ignored it. | Mark ownership issue FI-3.4-004 on both modules | MEDIUM | NO | — |
| `F03-G06-M02` | COARSE | DEFERRED | **CLARIFY** | SELF_OMISSION | Same FI-3.4-004. | Same | MEDIUM | NO | — |
| `F04-G01-M01` | FULL | CORE_VALUE | **CLARIFY** | CONFIRMED_SCRIPT | parent_value INDIRECT while comparable F04-G03-M01 scored 3; plan/week view is user-facing in prototype. | Either both INDIRECT (structure) or plan view value moved to F04-G04-M01; rubric R1.1a rule needed | LOW | NO | — |
| `F04-G03-M02` | FULL | CORE_VALUE | **CLARIFY** | SELF_OMISSION | FI-3.4-001: overlap between F04-G03 Approval Routing and F04-G06 Plan Approval is REVIEW_REQUIRED; baseline edge F04-G06-M01 -> F04-G03-M02 presumes G03 resolves approver. | Tag FI-3.4-001 on edge and modules | MEDIUM | NO | SUPPORTED |
| `F05-G01-M01` | FULL | CORE_VALUE | **CLARIFY** | JUDGMENT | Ownership ambiguity already recorded in baseline as GAP-16 (adversarial correction: not a self-omission). Group 02 also leaves general conversation outside the clarified category undecided, which bears on Plan A pal-chat. 3.4 UC-017 assigns guidance lookup to F07-G03. | Owner decision on parent Pal conversation owner (OD-A6) | MEDIUM | YES | PARTLY_SUPPORTED |
| `F06-G01-M01` | FULL | CORE_VALUE | **CLARIFY** | CONFIRMED_SCRIPT | dependency_enablement 4 but only one direct HARD dependent (F06-G02-M01); reports depend on it transitively. Rubric counts direct dependents. | enablement 4 -> 3 (direct) with transitive note | MEDIUM | NO | — |
| `F06-G02-M01` | FULL | CORE_VALUE | **CLARIFY** | CONFIRMED_SCRIPT | R1.1a set INDIRECT for computation modules but F04-G02-M02 (also computation, with visible warnings) keeps numbers; rule wording needs tightening. | Rubric note: "own UI or own user decision -> number; else INDIRECT" | LOW | NO | — |
| `F06-G03-M01` | COARSE | DEFERRED | **CLARIFY** | SELF_OMISSION | Project doc "bo-chi-so-theo-doi-tre" and SC-002-D02 (learning analytics) exist; baseline did not consider them. Deferral still plausible for A-lite. | Cite sources; keep DEFERRED | LOW | NO | — |
| `F06-G04-M01` | FULL | CORE_VALUE | **CLARIFY** | CONFIRMED_SCRIPT | Same rubric ambiguity as F06-G02-M01; F06-G02-M02 kept numbers. | Same | LOW | NO | — |
| `F06-G04-M02` | COARSE | DEFERRED | **CLARIFY** | SELF_OMISSION | SC-001-D02 cause-aware adaptation needs observation -> hypothesis -> verified cause; deferral removes the generated-insight path. Adversarial correction: there is no trend code in the prototype; the only sourced window is 2 weeks (spec-quy-tac L2) and D02 warns against counting fatigue alone. | E1 alternative may only flag a 2-week pattern to ask for context (no causal conclusion, no unsourced count threshold) | MEDIUM | NO | PARTLY_SUPPORTED |
| `F07-G03-M03` | COARSE | DEFERRED | **CLARIFY** | SELF_OMISSION | Prototype sends images to Pal (index.html:1076); TTS is browser-local. Photo capture and recording are two of five Owner-confirmed Plan A features (photo logged PASS 2026-11-05). Deferral is acceptable only for the strict-E1 A-lite variant, not for a Plan-A-aligned variant. | Keep DEFERRED for A-lite E1; include capture (F04-G05-M02) and recording path in Plan-A variant | MEDIUM | YES (variant choice) | PARTLY_SUPPORTED |
| `F07-G07-M02` | COARSE | ADV_SECURITY_OPS | **CLARIFY** | CONFIRMED_SOURCE | 3.4 §9 metric "AI calls per successful outcome" and SC-002-G10 cost-gated rollout are real, but they are validation measures, not an A-lite requirement (A-lite E1 has no AI). Per-device daily cap in Plan A maps better to F07-G03-M02 Execution Budget. | When any E2 path is enabled, record AI calls/cost per outcome in F07-G03-M02; F07-G07-M02 stays ADV | MEDIUM | NO | PARTLY_SUPPORTED |
| `F08-G04-M01` | COARSE | DEFERRED | **CLARIFY** | CONFIRMED_SOURCE | Plan A (Owner-confirmed 04/11, in device testing) includes geofence events. No inventory item names location, but adversarial review shows it is plausibly mappable to existing IDs: F08-G04-M01/M02 (device consent + staged events), F01-G04-M02 (consent), F06-G01 (events), F04-G07 (parent alert). Location of a child is a distinct sensitive data category. | Owner decides whether this mapping is acceptable or a change request is needed; no new ID created | MEDIUM | YES | PARTLY_SUPPORTED |
| `F01-G01-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F01-G01-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F01-G02-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F01-G02-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F01-G03-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F01-G03-M02` | COARSE | ADV_SECURITY_OPS | **KEEP** | JUDGMENT | Verified correction workflow; pilot substitute (caregiver edits declared facts) is consistent with UC-004 needing child review later. | — | MEDIUM | NO | — |
| `F01-G06-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F01-G06-M02` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | Owner guidance 14/11: billing deferred; UC-023 exists but no pilot need. | — | HIGH | NO | — |
| `F01-G06-M03` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | Same as F01-G06-M02. | — | HIGH | NO | — |
| `F02-G01-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F02-G01-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F02-G02-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F02-G02-M02` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Formal revision folded into registry edit. | — | MEDIUM | NO | — |
| `F02-G03-M01` | FULL | DEFERRED | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F02-G03-M02` | FULL | DEFERRED | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F02-G04-M02` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Only needed with F02-G04-M01. | — | MEDIUM | NO | — |
| `F02-G05-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F02-G06-M01` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Pilot uses source field (F06-G01-M02); SC-002 "đã làm ≠ đã chấm đúng" satisfied by that field. | — | MEDIUM | NO | — |
| `F02-G06-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F03-G01-M01` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Framework registry not needed for pilot; knowledge files used directly. | — | MEDIUM | NO | — |
| `F03-G01-M02` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Extension. | — | MEDIUM | NO | — |
| `F03-G02-M01` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Extension. | — | MEDIUM | NO | — |
| `F03-G02-M02` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Extension. | — | MEDIUM | NO | — |
| `F03-G03-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F03-G04-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F03-G04-M02` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Extension of goals. | — | MEDIUM | NO | — |
| `F03-G05-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F03-G05-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G01-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G02-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G03-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G04-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G04-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G05-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G05-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G06-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G07-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F04-G07-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F05-G01-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F05-G02-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F05-G02-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F05-G03-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F05-G03-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F05-G04-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F05-G04-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F05-G05-M01` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | 3.4 §6.2 hard gates MR-016/018/019/021/022/030 before real data; deferral justified. | — | HIGH | NO | — |
| `F05-G05-M02` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | Same. | — | HIGH | NO | — |
| `F05-G06-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F05-G06-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F06-G01-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F06-G02-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F06-G03-M02` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Follows F06-G03-M01. | — | MEDIUM | NO | — |
| `F06-G05-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F06-G05-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F06-G06-M01` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F06-G06-M02` | FULL | CORE_VALUE | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F06-G07-M01` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | SC-002-D05: AI homework assessment only in controlled prototype/pilot, not default MVP. | — | HIGH | NO | — |
| `F07-G01-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G01-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G02-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G02-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G03-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G03-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G04-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G04-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G05-M01` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G05-M02` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | Owner decision: human response deferred. Note 3.4 UC-019/020 envisage human oversight -> conflict recorded in 3.4 as baseline proposal only. | — | HIGH | NO | — |
| `F07-G06-M02` | FULL | MIN_FOUNDATION | **KEEP** | AUTOMATED | No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all). | — | HYPOTHESIS | NO | — |
| `F07-G07-M01` | COARSE | ADV_SECURITY_OPS | **KEEP** | JUDGMENT | Ops console; DB admin for pilot. | — | MEDIUM | NO | — |
| `F08-G01-M01` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | 3.4 UCF-11: integrations not assumed feasible; MR-033. | — | HIGH | NO | — |
| `F08-G01-M02` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | Same. | — | HIGH | NO | — |
| `F08-G02-M01` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Partner extension. | — | MEDIUM | NO | — |
| `F08-G02-M02` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | Never auto-sent on safety trigger; deferred. | — | HIGH | NO | — |
| `F08-G03-M01` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | OD-02. | — | HIGH | NO | — |
| `F08-G03-M02` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | OD-02, FR-05. | — | HIGH | NO | — |
| `F08-G04-M02` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Deferred with integrations. | — | MEDIUM | NO | — |
| `F08-G05-M01` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | OD-02 + Owner guidance. | — | HIGH | NO | — |
| `F08-G05-M02` | COARSE | DEFERRED | **KEEP** | CONFIRMED_SOURCE | Same. | — | HIGH | NO | — |
| `F08-G06-M01` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Finance extension. | — | MEDIUM | NO | — |
| `F08-G06-M02` | COARSE | DEFERRED | **KEEP** | JUDGMENT | Finance extension. | — | MEDIUM | NO | — |

## 5. Sổ khoảng trống độ tin cậy và bằng chứng

| # | Khoảng trống | Ảnh hưởng | MR |
|---|---|---|---|
| CE-01 | Không có dữ liệu người dùng cho mọi giá trị | Tất cả | MR-001, MR-002, MR-007 |
| CE-02 | Chỉ một người chấm, cộng một subagent; chưa có hội đồng chuyên gia | Tất cả | MR-039 |
| CE-03 | 4 module nền chưa từng được kiểm độc lập | Lõi định danh | — (cần cho phép review) |
| CE-04 | Module COARSE không có cạnh phụ thuộc | 19 module mồ côi | MR-040 |
| CE-05 | Bản tóm tắt L4 dùng cho QA bị trống ở một số module | Chất lượng QA lần trước | — |
| CE-06 | Quy tắc INDIRECT chưa chặt | 6 module | MR-039 |
| CE-07 | Chưa rà hết các Owner Decision Log đã duyệt (B01 Plan Structure, Consent Ledger, Purpose-bound Access, P6 Access Policy, P5, P6 Academic Assessment) | Lõi định danh, kế hoạch | — (rà trước Adversarial MVP Review) |

**Câu hỏi còn mở:** xem `08_Research_Gaps_and_Decisions.md`. **Cần Owner duyệt:** có, cho mọi đề xuất ở §3.
