"""Orchestrator decisions after reading the adversarial review (SELF_AUDIT). Edited by hand; consumed by reconcile.py."""
RECON = [
 dict(item='4 module nền BLOCKED (chưa kiểm độc lập)', adversarial='SUPPORTED; nhưng chưa được nêu là blocker của A-lite v2', decision='ACCEPT', effect='Liệt kê riêng trong phase_c (never_independently_reviewed_in_v2)'),
 dict(item='F02-G05-M02 tín hiệu mệt', adversarial='PARTLY: sai chủ sở hữu; prototype không có quy tắc giảm tải', decision='ACCEPT', effect='F02-G05-M02 REVIEW vì chấm sai phạm vi; tín hiệu mệt thành MISSING, chưa có chủ (OD-A7); rút P-E05'),
 dict(item='F04-G06-M01 đề xuất của con', adversarial='PARTLY: trái B01 CR log (PARENT_LED không có CR) và B01-MS-OD-02', decision='ACCEPT', effect='Chỉ áp dụng với CHILD_EXECUTED; hết hạn 7 ngày; không duyệt vượt hard-cap'),
 dict(item='F04-G02-M03 phạm vi', adversarial='SUPPORTED; thiếu P6-BP-OD-01..03; preset không phải Standard Bar', decision='ACCEPT', effect='Thêm ràng buộc 60 ngày / 7 ngày / protected vs family / mặc định chưa thẩm định thì UNKNOWN'),
 dict(item='F04-G02-M01 E1', adversarial='PARTLY: có căn cứ để phân loại lại, nhưng chưa có bằng chứng khả thi', decision='ACCEPT', effect='Khả thi E1 = UNKNOWN cho đến khi làm spike RG-01'),
 dict(item='F08-G04-M01 geofence', adversarial='PARTLY: ánh xạ được vào các ID có sẵn', decision='ACCEPT', effect='BLOCKED -> CLARIFY; FEATURE_GAP -> PARTIAL (đề xuất ánh xạ)'),
 dict(item='F07-G07-M02 telemetry', adversarial='PARTLY: thuộc F07-G03-M02, không phải yêu cầu của A-lite', decision='ACCEPT', effect='REVIEW -> CLARIFY; rút P-E07'),
 dict(item='F05-G01-M01 căn cứ', adversarial='PARTLY: GAP-16 đã có trong baseline', decision='ACCEPT', effect='Căn cứ đổi sang JUDGMENT'),
 dict(item='F06-G04-M02 phương án E1', adversarial='PARTLY: không có trend trong prototype; ngưỡng không có nguồn', decision='ACCEPT', effect='Chỉ hỏi bối cảnh theo cửa sổ 2 tuần; không dùng ngưỡng đếm'),
 dict(item='Ma trận độ phủ: preset và giai đoạn tạm thời', adversarial='Ghi MISSING trong khi module đã có trong v1', decision='ACCEPT', effect='Đổi thành PARTIAL; năng lực thiết yếu thiếu: 5 -> 4'),
 dict(item='Việc một lần', adversarial='Có trong spec-quy-tac E3/K3/K4', decision='ACCEPT', effect='PARTIAL, thiết yếu YES'),
 dict(item='Thời tiết', adversarial='Là L4, không phải khoảng trống L3', decision='ACCEPT', effect='PARTIAL (F04-G04-M01, F04-G07-M01)'),
 dict(item='Ảnh, giọng nói, báo đói (Plan A)', adversarial='Plan A đã chốt, nên không phải NO', decision='ACCEPT_AS_VARIANT', effect='NO cho A-lite E1, YES cho biến thể Plan A (OD-A2)'),
 dict(item='Lớp an toàn cho văn bản tự do', adversarial='Phải là thiết yếu', decision='ACCEPT_AS_VARIANT', effect='YES cho biến thể Plan A và mọi trường hợp có văn bản tự do; CONDITIONAL chỉ cho biến thể E1 chỉ nhập có cấu trúc'),
 dict(item='M1: A-lite không dùng AI, trong khi chuẩn là Pal chat', adversarial='HIGH', decision='ACCEPT', effect='Định nghĩa thêm biến thể Plan A (40 module); OD-A2 cho Owner chọn'),
 dict(item='M5: dữ liệu sức khỏe trong hồ sơ', adversarial='MEDIUM', decision='ACCEPT', effect='Thêm dòng HARD_SAFETY; cần giảm thiểu dữ liệu'),
 dict(item='M8: PIN, ghép thiết bị và mã gia đình của Plan A', adversarial='LOW', decision='ACCEPT', effect='OD-A8'),
 dict(item='Ngưỡng không có nguồn: sàn [MĐ] bị coi là HARD_SAFETY', adversarial='MEDIUM', decision='ACCEPT', effect='Chỉ sàn ngủ [NC] là HARD_SAFETY; các mục khác là [MĐ]'),
 dict(item='Ngưỡng không có nguồn: "chấp nhận mặc định cứng"', adversarial='MEDIUM', decision='ACCEPT', effect='Mặc định chưa thẩm định thì ghi UNKNOWN (P6-BP-OD-03)'),
]

CORRECTIONS = [
 dict(module='F04-G02-M01', key='exec_class', original='E2 (L4 override)', proposed='E1 default; E2 optional for natural-language input', basis='CONFIRMED_SOURCE: Inventory E1/Low; 3.4 UC-007 execution_policy default E1; SC-001 §5', status='PROPOSED'),
 dict(module='F04-G02-M01', key='ai_cost_risk', original='M', proposed='L (default path); M only if E2 enabled', basis='Follows exec correction', status='PROPOSED'),
 dict(module='F04-G02-M01', key='dependency_enablement', original='4', proposed='3 (or keep 4 if P-E01 accepted)', basis='CONFIRMED_SCRIPT: 0 direct HARD dependents', status='PROPOSED'),
 dict(module='F04-G02-M01', key='G-Safety', original='CONDITIONAL (whole module)', proposed='CONDITIONAL only for optional E2 path; E1 path UNKNOWN (no AI output)', basis='Follows exec correction; OD-05 applies to AI output', status='PROPOSED'),
 dict(module='F04-G02-M01', key='workflow membership', original='W1 only', proposed='W1 and A-lite (W1E1 -> A-lite v2)', basis='Phase C step 4 essential', status='PROPOSED'),
 dict(module='F04-G02-M03', key='adoption_potential', original='NOT_APPLICABLE', proposed='3', basis='CONFIRMED_SOURCE: spec-quy-thoi-gian §1.3-1.4 user-facing warning + "Giữ mức này"', status='PROPOSED'),
 dict(module='F04-G02-M03', key='scope note', original='Balanced planning validation (hard/soft caps, play time, load)', proposed='+ Family Standard Bar presets + time-bounded exceptions (SC-001-D01/D03)', basis='CONFIRMED_SOURCE: SC-001; Inventory R1 text already names Standard Bar', status='PROPOSED'),
 dict(module='F04-G06-M01', key='implementation_effort (A-lite minimal capability)', original='4 (full B01 v3.1)', proposed='2-3 for minimal CR (CHILD_EXECUTED only, single approver, 7-day expiry, hard-cap NOT_APPROVABLE); 4 retained for full module', basis='Phase B MINCAP; B01 CR log; B01-MS-OD-02', status='PROPOSED'),
 dict(module='F04-G06-M01', key='workflow membership', original='W1 optional, W3 required', proposed='A-lite v2 required (minimal; only for children in CHILD_EXECUTED)', basis='CONFIRMED_SOURCE: spec §3-4; 3.4 UC-010; B01-MS-OD-02', status='PROPOSED'),
 dict(module='F02-G05-M02', key='core_loop_contribution', original='3 (Feedback on tasks)', proposed='2 (Understand: child contests profile assertions)', basis='CONFIRMED_SOURCE: Inventory F02-G05-M02-001 scope; adversarial review', status='PROPOSED'),
 dict(module='F02-G05-M02', key='value reasons (all cohorts)', original='task/plan feedback (too hard, too much)', proposed='rewrite on real scope; values kept as HYPOTHESIS pending rescoring', basis='CONFIRMED_SOURCE: scope error', status='PROPOSED'),
 dict(module='F06-G04-M01', key='workflow membership', original='W1 optional', proposed='A-lite v2 required (2-week pattern -> context question, no causal claim)', basis='CONFIRMED_SOURCE: spec §1.5; spec-quy-tac L2; SC-001-D02', status='PROPOSED'),
 dict(module='F06-G02-M02', key='workflow membership', original='W1 optional', proposed='A-lite v2 required (sick/rest day not failure)', basis='JUDGMENT: needed so fatigue relief is not counted as failure', status='PROPOSED'),
 dict(module='F06-G01-M01', key='dependency_enablement', original='4', proposed='3 (direct), transitive note', basis='CONFIRMED_SCRIPT', status='PROPOSED'),
 dict(module='F03-G05-M03', key='tier rationale', original='mainly A4-A5; outside CORE grades 1-9', proposed='CORE-relevant A3 exploration (SC-003 grade 8); deferred as non-essential to planning loop', basis='CONFIRMED_SOURCE: SC-003 §1', status='PROPOSED'),
 dict(module='F07-G03-M02', key='minimum capability', original='Per-household daily cap', proposed='+ AI calls/cost per successful outcome when any E2 path is enabled', basis='3.4 §9; SC-002-G10; adversarial: better home than F07-G07-M02', status='PROPOSED'),
 dict(module='F04-G02-M03', key='defaults / constraints', original='age defaults acceptable; floor treated as universal', proposed='App Default Standard Bar only if vetted else UNKNOWN; only sleep floor [NC] is HARD_SAFETY; P6-BP-OD-01/02 constraints in scope', basis='CONFIRMED_SOURCE: P6 Balanced Planning Owner Decision Log OD-01..03', status='PROPOSED'),
]

CHANGES = [
 dict(id='PC-14', features='F02-G05-M02', existing='scored as task/plan feedback', proposed='Rescore on inventory scope (child views/contests profile assertions); core_loop 3 -> 2; fatigue signal moves to owner decision OD-A7', evidence='Inventory F02-G05-M02-001; adversarial review', downstream='Phase E STABLE_HIGH artefact; edge E015 reason; A-lite fatigue row', confidence='HIGH', approval='Owner'),
 dict(id='PC-15', features='F04-G02-M03, F03-G03-M01', existing='hard-coded defaults acceptable; spec floors treated as HARD_SAFETY', proposed='Apply P6-BP-OD-01..03: 60-day / 7-day exception rules; protected_hard vs family_hard; unvetted App Default Standard Bar = UNKNOWN; only sleep floor [NC] is HARD_SAFETY', evidence='P6 Balanced Planning Owner Decision Log APPROVED', downstream='A-lite budget UI shows UNKNOWN/[MĐ] labels; RG-05', confidence='HIGH', approval='No (applies approved decisions) - recorded'),
 dict(id='PC-16', features='A-lite definition', existing='A-lite = LLM-free W1E1', proposed='Keep two testable variants: A-lite E1 (29 modules, no AI, structured input) and A-lite Plan-A (40 modules: + AI gate, static safety catalog, editorial, photo capture, recording, geofence mapping, pseudonymisation)', evidence='CLAUDE.md prototype is standard behaviour; Plan A §1, §6; adversarial M1', downstream='Choice drives AI gate, FR-03 exposure and safety workload', confidence='HIGH', approval='Owner (OD-A2)'),
 dict(id='PC-01', features='F04-G02-M01', existing='exec E2 override; excluded from A-lite', proposed='E1 default + optional E2; included in A-lite', evidence='Inventory E1/Low; 3.4 UC-007; SC-001 §5', downstream='A-lite gains schedule builder; AI gate not required; build risk CU-01', confidence='HIGH', approval='Owner (restores approved baseline)'),
 dict(id='PC-02', features='F04-G02-M03', existing='adoption N/A; scope without exceptions/presets', proposed='adoption 3; scope incl. Standard Bar presets + time-bounded exceptions', evidence='spec-quy-thoi-gian §1-3; SC-001-D01/D03', downstream='P-E03/P-E04 edges; A-lite capability rows', confidence='MEDIUM', approval='Owner'),
 dict(id='PC-03', features='F04-G06-M01, F04-G03-M02, F01-G05-M01', existing='optional in W1; absent in A-lite', proposed='Minimal CR in A-lite v2 only for children set to CHILD_EXECUTED; PARENT_LED children send informal wish note; 7-day expiry; hard-cap NOT_APPROVABLE; single approver', evidence='spec §3-4; 3.4 UC-008/010; B01 CR log; B01-MS-OD-01..04', downstream='+2 modules (minimal); Mode State must support parent switch; FI-3.4-001', confidence='MEDIUM', approval='Owner (A-lite scope)'),
 dict(id='PC-04', features='F06-G04-M01, F06-G02-M02, (fatigue signal owner TBD)', existing='optional in W1', proposed='A-lite v2 adds 2-week pattern -> context question (F06-G04-M01) and rest/sick-day exception (F06-G02-M02); fatigue signal capability pending owner decision', evidence='SC-001-D02; spec §1.5, §4; spec-quy-tac L2, K4', downstream='Privacy: pattern not verbatim; no unsourced threshold; MR-009/031', confidence='MEDIUM', approval='Owner (A-lite scope + OD-A7)'),
 dict(id='PC-05', features='E029 (F04-G02-M02 -> F04-G02-M01)', existing='SOFT edge construction<-conflict', proposed='Reverse: P-E02 F04-G02-M01 -> F04-G02-M02 HARD (minimal)', evidence='prototype checkDay; UC-010 main flow step 3', downstream='Construction cannot ship without conflict check', confidence='HIGH', approval='MR-040 review'),
 dict(id='PC-06', features='P-E01, P-E03, P-E04, P-E06 (P-E05, P-E07 withdrawn)', existing='not modelled', proposed='Add as CANDIDATE edges', evidence='see 02 §5', downstream='A-lite v2 closure; enablement of F04-G02-M01', confidence='MEDIUM', approval='MR-040 review'),
 dict(id='PC-07', features='36 baseline edges', existing='granularity not recorded (treated as full module)', proposed='Tag MINIMAL_CAPABILITY_REQUIRED with minimum capability per target', evidence='Phase B', downstream='Pilot foundation scope smaller; full modules remain in inventory', confidence='MEDIUM', approval='Owner (methodology addendum)'),
 dict(id='PC-08', features='B_AI_GATE', existing='applied to every E2 module incl. optional E2 paths', proposed='Apply only when E2 path enabled; add free-text rule (safety layer + static catalog even without LLM)', evidence='CLAUDE.md safety layer; OD-03; Phase B', downstream='A-lite without free text needs no AI gate', confidence='MEDIUM', approval='Owner'),
 dict(id='PC-09', features='F03-G05-M03', existing='rationale "mainly A4-A5"', proposed='rationale CORE-relevant A3, deferred as non-essential to planning loop', evidence='SC-003', downstream='None on A-lite', confidence='HIGH', approval='No (rationale correction) — recorded for transparency'),
 dict(id='PC-10', features='F07-G03-M02', existing='quota only', proposed='Also record AI calls/cost per successful outcome when any E2 path is enabled', evidence='3.4 §9; SC-002-G10', downstream='W1 with E2; Plan-A variant', confidence='MEDIUM', approval='Owner'),
 dict(id='PC-11', features='Plan A geofence -> F08-G04-M01/M02, F01-G04-M02, F06-G01-M01, F04-G07-M01', existing='no explicit owner; F08-G04 deferred', proposed='Record proposed mapping as inventory issue; Owner decides acceptance or change request (location = distinct sensitive category); no ID created', evidence='spec-phuong-an-a §1-2, §4; Group 07; adversarial review', downstream='Plan-A variant pulls F08-G04-M01/M02 out of DEFERRED', confidence='MEDIUM', approval='Owner'),
 dict(id='PC-12', features='Parent-facing Pal conversation (F05-G01-M01 / F07-G03 UC-017)', existing='ambiguous ownership across 3.2, 3.4, L4', proposed='Owner chooses owner L3; record as inventory issue', evidence='3.4 UC-017; G02 FR02; Inventory name', downstream='W2 scope and scoring', confidence='MEDIUM', approval='Owner'),
 dict(id='PC-13', features='Rubric R1.1a', existing='INDIRECT rule ambiguous', proposed='"Own UI or own user decision -> score; otherwise INDIRECT"; reapply to 6 modules', evidence='Phase A AUTO-SIMILAR', downstream='F04-G01-M01, F04-G02-M02, F06-G02-M01, F06-G02-M02, F06-G04-M01, F04-G03-M01', confidence='MEDIUM', approval='Owner (rubric R1.2)'),
]

DECISIONS = [
 dict(id='OD-A1', question='A-lite bắt đầu từ mục tiêu (3.4 UC-007) hay từ thời khóa biểu (prototype)?', options='(a) Từ thời khóa biểu, mục tiêu tùy chọn; (b) Bắt buộc chọn mục tiêu ngắn trước khi lập lịch; (c) Có cả hai nhánh', recommendation='(a)', rationale='Prototype và nỗi đau chính là xếp tuần học; UC-007 là BASELINE_PROPOSED, có thể sửa qua change request; mục tiêu thêm sau được mà không phải làm lại.'),
 dict(id='OD-A2', question='A-lite để kiểm thử là biến thể nào?', options='(a) A-lite E1: 29 module, không AI, chỉ nhập có cấu trúc, kiểm giả thuyết E1; (b) A-lite Plan A: 40 module, Pal chat như prototype, cần gói AI, nội dung an toàn tĩnh, ẩn danh; (c) Làm (a) trước, (b) là nấc 2', recommendation='(c)', rationale='v1 (24) không chạy được từ đầu đến cuối. (a) học nhanh hành vi lõi với ít rủi ro an toàn; nhưng CLAUDE.md coi prototype (có Pal chat) là chuẩn, nên (b) phải có lộ trình rõ.'),
 dict(id='OD-A3', question='Geofence của Plan A: chấp nhận ánh xạ vào F08-G04-M01/M02 + F01-G04-M02 + F06-G01-M01 + F04-G07-M01 không?', options='(a) Chấp nhận ánh xạ, ghi quy tắc riêng cho dữ liệu vị trí; (b) Mở change request thêm L3 vị trí; (c) Bỏ geofence khỏi phạm vi sản phẩm', recommendation='(a) kèm issue theo dõi', rationale='Phản biện cho thấy ánh xạ được vào ID có sẵn; nhưng vị trí của trẻ là loại dữ liệu nhạy cảm riêng, cần quy tắc giữ ít dữ liệu nhất (chỉ sự kiện vào/ra, theo Plan A §4).'),
 dict(id='OD-A4', question='Duyệt các sửa điểm và rubric R1.2 (file 01 §3, PC-13)?', options='(a) Duyệt toàn bộ; (b) Duyệt từng mục; (c) Chờ reviewer độc lập', recommendation='(c) cho mục JUDGMENT; (a) cho mục CONFIRMED_SOURCE', rationale='Mục CONFIRMED_SOURCE chỉ khôi phục quyết định đã duyệt; mục chủ quan cần người khác.'),
 dict(id='OD-A5', question='Ai làm Adversarial MVP Review?', options='(a) Reviewer khác (ChatGPT hoặc phiên Claude mới); (b) Claude phiên này', recommendation='(a)', rationale='Phiên này đã chấm và tự audit; cần độc lập. Khi đó cần commit hoặc gửi kèm 2 thư mục review.'),
 dict(id='OD-A6', question='Chủ sở hữu hội thoại Pal với phụ huynh: F05-G01-M01 hay F07-G03 (UC-017)?', options='(a) F05-G01-M01 (theo L4 G02); (b) F07-G03 làm entry, F03-G05 làm outcome (theo 3.4); (c) Mở change request thêm L3', recommendation='(b) để thảo luận', rationale='3.4 đã chốt khung (UC-017 do F07-G03 làm owner); L4 G02 giao cho Companion; cần thống nhất trước khi chấm W2.'),
]

DECISIONS += [
 dict(id='OD-A7', question='Tín hiệu mệt/đói của trẻ (spec §4, SC-001-D02) thuộc L3 nào?', options='(a) F04-G05 (ghi nhận thực hiện); (b) F04-G04 (hỗ trợ thực hiện); (c) Mở change request', recommendation='(a) để thảo luận', rationale='F02-G05-M02 là trẻ phản đối nhận định về mình, không phải tín hiệu mệt; tín hiệu gắn với khối trong ngày nên gần F04-G05 nhất.'),
 dict(id='OD-A8', question='Mô hình định danh cho pilot: mã gia đình theo Plan A hay tài khoản + Parent PIN theo FR-01?', options='(a) Theo FR-01 ngay (2 máy, ghép, PIN); (b) Mã gia đình trong spike kỹ thuật, FR-01 trước pilot có người dùng; (c) Chỉ một máy dùng chung như prototype', recommendation='(b)', rationale='Plan A là spike kỹ thuật, đã hoãn tài khoản riêng; FR-01 đã duyệt nên phải có trước pilot với gia đình thật.'),
]
GAPS = [
 dict(id='RG-01', question='Thuật toán xếp lịch E1 có đạt chất lượng gần prototype LLM không (spike)', mr='MR-025', blocks='Build A-lite; quyết định E1/E2', priority='1'),
 dict(id='RG-02', question='Trẻ A2–A3 có tự dùng tab Hôm nay và nút Xong không', mr='MR-007', blocks='Giá trị phía trẻ', priority='1'),
 dict(id='RG-03', question='Phụ huynh có bớt phải nhắc và thấy lịch cân bằng có ích không', mr='MR-001, MR-002', blocks='Đề xuất giá trị lõi', priority='1'),
 dict(id='RG-04', question='Pháp lý: thời hạn xóa (H4), cơ sở xử lý dữ liệu trẻ, đồng ý người giám hộ', mr='MR-016, MR-017, MR-018', blocks='Dữ liệu thật', priority='1'),
 dict(id='RG-05', question='Ngưỡng quỹ thời gian và sàn cố định được chuyên gia chấp nhận', mr='MR-012', blocks='Balanced Planning thật', priority='2'),
 dict(id='RG-06', question='Kênh tín hiệu mệt 3 lựa chọn có gây áp lực hoặc bị lạm dụng không', mr='MR-009, MR-031', blocks='PC-04', priority='2'),
 dict(id='RG-07', question='Độ tin cậy thông báo đúng giờ trên các dòng Android', mr='— (Plan A test)', blocks='F04-G07-M01', priority='2'),
 dict(id='RG-08', question='Thẩm định cạnh phụ thuộc CANDIDATE và P-E01..07', mr='MR-040', blocks='Thứ tự phát triển', priority='2'),
 dict(id='RG-09', question='Hiệu chuẩn rubric với nhiều người chấm', mr='MR-039', blocks='Độ tin cậy điểm', priority='3'),
 dict(id='RG-10', question='Định vị geofence trong inventory và quy tắc riêng tư vị trí', mr='MR-021 (đề xuất PMR-04)', blocks='Plan A bước 4', priority='3'),
]

CONFIRMED = [
 'F04-G02-M01 bị nâng E1→E2 trái Inventory/3.4/SC-001, nên A-lite baseline thiếu bộ dựng lịch (CONFIRMED_SOURCE).',
 'A-lite baseline thiếu hẳn 4 năng lực thiết yếu (bộ dựng lịch, đề xuất của con theo chế độ CHILD_EXECUTED, tín hiệu mệt, phát hiện mẫu 2 tuần) và phủ một phần preset, giai đoạn tạm thời có hạn, việc một lần (sau phản biện: 5 → 4 thiếu hẳn).',
 'F02-G05-M02 bị chấm theo phạm vi sai (baseline coi là phản hồi về việc; Inventory: trẻ xem và đề nghị sửa hiểu biết về mình).',
 'Bỏ sót các Owner Decision Log đã duyệt: P6 Balanced Planning (OD-01..03), B01 Change Requests, B01 Mode State (OD-01..04). Cả baseline lẫn lượt audit đầu đều không áp các quyết định này. Phản biện phát hiện ra.',
 'A-lite E1 không có AI, trong khi CLAUDE.md coi prototype (có Pal chat) là hành vi chuẩn. Đã thêm biến thể Plan A để Owner chọn.',
 'Cạnh E029 sai chiều (dựng lịch phải gọi kiểm xung đột).',
 'Lý do của F03-G05-M03 trái SC-003 (lớp 8 = A3, thuộc CORE).',
 'Geofence của Plan A (Owner chốt 04/11) không có L3 nào đứng tên vị trí; đề xuất ánh xạ vào các ID có sẵn.',
 'Baseline không đọc 3.4, SC-001..003, spec lập lịch (9 phát hiện SELF_OMISSION).',
 'Quy tắc INDIRECT áp không nhất quán cho 3 cặp module tương tự (CONFIRMED_SCRIPT).',
 'dependency_enablement lệch với số phụ thuộc trực tiếp ở F04-G02-M01 và F06-G01-M01.',
]
