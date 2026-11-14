"""Generate reports 02-05 from data/*.json (tables) with fixed narrative. SELF_AUDIT."""
import json, os
R = os.path.join(os.path.dirname(__file__), '..'); D = os.path.join(R, 'data')
PB = json.load(open(os.path.join(D, 'phase_b.json'))); PC = json.load(open(os.path.join(D, 'phase_c.json'))); PDE = json.load(open(os.path.join(D, 'phase_de.json')))
HDR = ('**Loại:** `SELF_AUDIT / PROPOSAL` · **Người soạn:** AI (Claude, Opus 5.5), tự rà soát lượt chấm của chính mình, chưa kiểm chứng độc lập · '
       '**Nguồn:** HEAD `9043c88`; baseline đóng băng `baseline_v1/` (SHA256SUMS) · **Cần Owner duyệt:** mọi thay đổi đề xuất')
W = lambda name, L: open(os.path.join(R, name), 'w', encoding='utf-8').write('\n'.join(L) + '\n')

# ---------------- 02 ----------------
e = PB['edges_v2']; base = [x for x in e if x['edge_id'].startswith('E')]; prop = [x for x in e if x['edge_id'].startswith('P-')]
gc = PB['baseline_granularity']
L = ['# 02 — Audit mức độ chi tiết của phụ thuộc (Phase B)', '', HDR, '',
     '**Dữ liệu:** `data/phase_b.json` (script `tools/phase_b.py`). Baseline giữ nguyên 95 cạnh; v2 chỉ thêm chiều "granularity" và các thay đổi đề xuất.', '',
     '## 1. Kết quả chính', '',
     '| Granularity (95 cạnh baseline) | Số cạnh |', '|---|---|'] + [f'| `{k}` | {v} |' for k, v in sorted(gc.items())] + [
     '', '- **36/95 cạnh chỉ cần một phần năng lực (MINIMAL), không cần cả module.** Baseline đếm như thể cần cả module, nên phạm vi build bị phóng đại, nhất là phần nền tảng. Ví dụ:',
     '  - Access Policy: chỉ cần bảng phân quyền cố định;',
     '  - Purpose-bound Access: chỉ cần cờ dữ liệu giả lập;',
     '  - Change Requests: chỉ cần hàng đề xuất và nút duyệt.',
     '- **17 cạnh là tùy chọn (SOFT),** 4 cạnh là yêu cầu vận hành hoặc chính sách, 3 cạnh là dịch vụ nền dùng chung.',
     '- **Đổi chiều 1 cạnh:** E029 `F04-G02-M02 → F04-G02-M01` sai chiều; đúng ra bước dựng lịch phải gọi bước kiểm xung đột (cạnh đề xuất P-E02).',
     '- **5 cạnh đề xuất mới** (P-E01..P-E04, P-E06), đều ở trạng thái CANDIDATE và cần Owner duyệt, MR-040. Sau phản biện, rút lại 2 cạnh: P-E05 (F02-G05-M02 không phải chủ của tín hiệu mệt) và P-E07 (ghi chi phí AI thuộc F07-G03-M02, đã có cạnh E082).',
     '- **Vòng phụ thuộc** (chỉ tính cạnh tường minh, sau thay đổi v2): 0 vòng lúc build, 0 vòng lúc chạy. Vòng lúc chạy trong lõi định danh mà baseline báo là do mở rộng gói `B_AUTHZ`/`B_CHILD_SCOPE`. Nó phản ánh tham chiếu lẫn nhau lúc chạy, không phải vòng giữa các cạnh tường minh.',
     f"- **Module mồ côi** (không có cạnh tường minh nào): {len(PB['integrity']['orphans_explicit'])}. Phần lớn là module chỉ chấm thô. Baseline không mô hình hóa phụ thuộc cho các module này, nên **chưa kiểm được** việc hoãn chúng có kéo theo hệ quả ẩn hay không. Đây là khoảng trống bằng chứng, chưa phải lỗi đã xác nhận.",
     '', '## 2. Audit 4 gói dịch vụ dùng chung', '', '| Gói | Thành viên | Phát hiện | Đề xuất |', '|---|---|---|---|'] + [
     f"| `{b['bundle']}` | {b['members']} | {b['finding']} | {b['proposal']} |" for b in PB['bundles']] + [
     '', '## 3. Yêu cầu năng lực tối thiểu (MINIMAL_CAPABILITY_REQUIRED)', '',
     '| Module cha | Năng lực tối thiểu | Có thể hoãn | Không được hoãn | Tái sử dụng | Điều kiện trước |', '|---|---|---|---|---|---|'] + [
     f"| `{k}` | {v[0]} | {v[1]} | {v[2]} | {v[3]} | {v[4]} |" for k, v in PB['mincap'].items()] + [
     '', 'Không tạo bản cài đặt trùng: mỗi năng lực tối thiểu nằm trong đúng module cha. Ví dụ, preset quỹ thời gian thuộc `F04-G02-M03` (Standard Bar), không tách thành module mới.',
     '', '## 4. Báo cáo toàn vẹn đồ thị', '',
     '**Yêu cầu nền tảng ẩn** (không phải module, nhưng bắt buộc):'] + [f'- {x}' for x in PB['integrity']['hidden_platform_requirements']] + [
     '', '**Yêu cầu an toàn bị bỏ sót khi dựng workflow:**'] + [f'- {x}' for x in PB['integrity']['safety_omissions']] + [
     '', '**Phụ thuộc thay đổi theo cohort hoặc chế độ tự chủ:**'] + [f"- `{x['edge_id']}` {x['source']} → {x['target']}: {x['cohort_or_mode_condition']}" for x in e if x['cohort_or_mode_condition']] + [
     '', '**Trực tiếp hay bắc cầu:** mọi cạnh trong ma trận là cạnh trực tiếp. Phụ thuộc bắc cầu (ví dụ báo cáo → Activity Event Log qua Progress Rules) không được tính vào `dependency_enablement` (xem phát hiện F06-G01-M01 ở file 01).',
     '', '## 5. Nhật ký thay đổi phụ thuộc', '', '| Edge | Nguồn → Đích | Hành động | Ghi chú |', '|---|---|---|---|'] + [
     f"| `{x['edge_id']}` | {x['source']} → {x['target']} | {x['v2_action']} | {x['v2_note'] or x['reason']} |" for x in e if x['v2_action'] != 'KEEP'] + [
     '', '## 6. Ma trận phụ thuộc v2 (đề xuất)', '', '| Edge | Nguồn (cần) | Đích | Loại | HARD/SOFT | Vòng đời | Granularity | Năng lực tối thiểu | FI | Điều kiện cohort/mode | v2 |',
     '|---|---|---|---|---|---|---|---|---|---|---|'] + [
     f"| `{x['edge_id']}` | `{x['source']}` | `{x['target']}` | {x['type']} | {x['criticality']} | {x['required_for']} | {x['granularity']} | {x.get('minimum_capability', '') or '—'} | {x['fi_issue'] or '—'} | {x['cohort_or_mode_condition'] or '—'} | {x['v2_action']} |" for x in e] + [
     '', '## 7. Quyết định phụ thuộc chưa giải quyết', '',
     '1. **FI-3.4-001:** F04-G03 Approval Routing hay F04-G06 Plan Approval quyết định trạng thái phê duyệt. Ảnh hưởng tới E033.',
     '2. **FI-3.4-003:** phạm vi xóa giữa F01-G06, F05-G06, F07-G06. Ảnh hưởng tới E010, E059, E062.',
     '3. **FI-3.4-004:** F06-G06 chỉ đề xuất; F03-G06 hoặc F04-G06 là bên quyết định. Ảnh hưởng tới E074.',
     '4. **Định vị geofence của Plan A:** đề xuất ánh xạ vào F08-G04-M01/M02 + F01-G04-M02 + F06-G01 + F04-G07 (theo phản biện). Owner quyết ánh xạ này có chấp nhận được không (OD-A3).',
     '5. **Chủ sở hữu tín hiệu mệt/đói** (OD-A7). P-E05 sẽ được thêm lại khi có chủ.',
     '6. **Chuyển các cạnh P-E01..P-E04, P-E06 và mọi cạnh CANDIDATE → CONFIRMED:** cần MR-040.', '',
     '**Độ tin cậy:** HYPOTHESIS cho mọi phân loại. **Câu hỏi còn mở:** các mục 1–5. **Cần Owner duyệt:** có, trước khi dùng v2 làm thứ tự phát triển.']
W('02_Dependency_Granularity_Audit.md', L)

# ---------------- 03 ----------------
caps = PC['capabilities']
L = ['# 03 — Kiểm chứng workflow A-lite (Phase C)', '', HDR, '',
     '> A-lite được đánh giá như **một ứng viên kiến trúc có thể thử nghiệm**, không phải MVP đã chọn.', '',
     '**Nguồn đối chiếu:**',
     '- luồng 10 bước trong prompt audit;',
     '- `prototype/index.html` (các hàm như applyActs, checkDayK, judge, applyPeriod, checkPeriodExpiry, revertPeriod, renderToday, defaultBudget);',
     '- `documents/pal/spec-quy-thoi-gian-va-tab-cua-con.md` và `spec-quy-tac-lap-lich.md`;',
     '- SC-001 D01–D03 (USER_APPROVED_PRINCIPLE / USER_CONFIRMED_REQUIREMENT);',
     '- 3.4 UC-007..UC-010.',
     '',
     '**Dữ liệu:** `data/phase_c.json` (script `tools/phase_c.py`).', '',
     '## 1. Kết luận', '',
     f"- **Ma trận độ phủ:** {len(caps)} năng lực. COVERED {PC['status_counts'].get('COVERED', 0)} · PARTIAL {PC['status_counts'].get('PARTIAL', 0)} · MISSING {PC['status_counts'].get('MISSING', 0)} · FEATURE_GAP {PC['status_counts'].get('FEATURE_GAP', 0)} · DEFERRED_OK {PC['status_counts'].get('DEFERRED_OK', 0)}.",
     f"- **A-lite baseline (W1E1, 24 module) thiếu {len(PC['essential_missing_in_baseline'])} năng lực thiết yếu** đã có trong prototype hoặc trong quyết định đã duyệt:"] + [f'  - {x}' for x in PC['essential_missing_in_baseline']] + [
     '- **Lỗi đã xác nhận quan trọng nhất:** baseline nâng `F04-G02-M01` lên E2 (trái với Inventory E1 và 3.4 UC-007), rồi bỏ module này khỏi A-lite. Kết quả là A-lite **không có bộ dựng lịch**. Không có bước này thì vòng lặp không chạy được từ đầu đến cuối.',
     f"- **A-lite v2 (đề xuất):** {PC['alite_v2_count']} module (thêm: {', '.join(PC['added_vs_v1'])}).",
     '  - Theo mức chi tiết: ' + ', '.join(f'{k} {v}' for k, v in PC['alite_v2_granularity'].items()) + '.',
     '  - 0 module AI.',
     f"  - Module bị chặn pháp lý: {', '.join(PC['legal_blocked_in_v2'])} (H4, chỉ chặn khi dùng dữ liệu thật).",
     '  - Số module tăng nhưng chiều sâu build giảm: 12 module chỉ cần năng lực tối thiểu.',
     '- **Bổ sung có điều kiện:**',
     '  - mục tiêu (F03-G04-M01) tùy quyết định OD-A1;',
     '  - tín hiệu mệt/đói: chưa có L3 chủ sở hữu rõ ràng (OD-A7);',
     '  - mô hình định danh cho pilot: mã gia đình theo Plan A hay tài khoản + PIN theo FR-01 (OD-A8).',
     f"- **Biến thể bám Plan A (A-lite + Pal):** {PC['alite_plana_count']} module. Thêm gói AI, nội dung tĩnh, chụp ảnh, ghi âm, ánh xạ geofence: {', '.join(PC['plana_added_vs_v2'])}. Cần ẩn danh trước khi gọi LLM. FR-03 chỉ áp nếu trẻ dùng chat.",
     f"- **4 module nền chưa từng được kiểm độc lập** nằm trong A-lite v2: {', '.join(PC['never_independently_reviewed_in_v2'])}.",
     '', '## 2. Đặc tả workflow A-lite v2 (logic, chưa phải đặc tả kỹ thuật)', '',
     '1. **Hồ sơ và đầu vào:** thời khóa biểu, thẻ hoạt động cố định (thứ, giờ, thời lượng, đi lại), tuổi/lớp (`F02-G01-M01`). Mục tiêu là tùy chọn, chờ OD-A1.',
     '2. **Quỹ thời gian:**',
     '   - 6 nhóm × (ngày đi học, cuối tuần);',
     '   - mức mặc định của app chỉ là bar khi đã được thẩm định, nếu không thì ghi UNKNOWN (P6-BP-OD-03);',
     '   - preset: Bình thường; Thi cử và Nghỉ hè là ngoại lệ có thời hạn, không phải Standard Bar dài hạn (SC-001-D03);',
     '   - sàn ngủ [NC] không ai chỉnh được; các mục sàn khác là quy tắc sản phẩm [MĐ], phân biệt protected_hard và family_hard (P6-BP-OD-02);',
     '   - trần mềm, có nút "Giữ mức này";',
     '   - cảnh báo một lần, kèm nguồn (`F04-G02-M03`, `F03-G03-M01` tùy chọn).',
     '3. **Dựng lịch E1:** mẫu theo lớp (`F04-G01-M02`) + quy tắc thứ tự trong ngày + xê dịch ±30 phút quanh số phụ huynh nhập, rồi kiểm xung đột (`F04-G02-M02`) và kiểm cân bằng (`F04-G02-M03`).',
     '4. **Phê duyệt:**',
     '   - ở chế độ PARENT_LED (và UNSET), phụ huynh lưu là phê duyệt (`F04-G01-M01` có version); con chỉ gửi mong muốn, không tạo Change Request chính thức (B01 CR log);',
     '   - chỉ khi phụ huynh đặt con ở CHILD_EXECUTED (`F01-G05-M01`), đề xuất của con mới thành Change Request (`F04-G06-M01` tối thiểu, `F04-G03-M02` tối thiểu): hết hạn sau 7 ngày, không thể duyệt vượt hard-cap.',
     '5. **Thực hiện:** tab "Hôm nay của con" có nhãn "Bây giờ", tiến độ x/y, không chấm điểm (`F04-G04-M01`). Nhắc việc tôn trọng giờ yên lặng (`F04-G07-M01/M02`).',
     '6. **Ghi nhận:** nút ✓ Xong (`F04-G05-M01`) → sự kiện (`F06-G01-M01`, nguồn `F06-G01-M02` tùy chọn).',
     '7. **Phản hồi:**',
     '   - sau giờ học hỏi "Ổn / Hơi mệt / Rất mệt"; chọn "Rất mệt" thì áp quy tắc giảm tải trong spec §4. Prototype chưa cài quy tắc này. **Chưa có L3 chủ sở hữu** (OD-A7);',
     '   - phụ huynh nhận mẫu 2 tuần (spec-quy-tac L2) dưới dạng câu hỏi về bối cảnh, không nhận nguyên văn, không kết luận nguyên nhân (`F06-G04-M01`, `F06-G05-M01`);',
     '   - ngày nghỉ, ngày ốm không bị tính là chưa hoàn thành (`F06-G02-M02`).',
     '8. **Đánh giá:** tiến độ (`F06-G02-M01`) → tóm tắt tuần theo đối tượng xem (`F06-G05-M01/M02`).',
     '9. **Điều chỉnh:** giai đoạn tạm thời có thời hạn (tối đa 60 ngày liên tục cho cùng ràng buộc; ≥7 ngày trống giữa các ngoại lệ tương tự, theo P6-BP-OD-01):',
     '   - cảnh báo một lần;',
     '   - liệt kê các kiểm tra được nới;',
     '   - lưu bản lịch cũ;',
     '   - hết hạn thì cho 3 lựa chọn;',
     '   - nếu dài hơn 6 tuần thì 2 tuần xem lại một lần;',
     '   - sàn ngủ và protected_hard không bao giờ được nới;',
     '   - thay đổi một lần trong tuần (nghỉ một buổi, học bù, ngày ốm) theo spec-quy-tac E3/K3/K4.',
     '',
     '**Nhánh ngoại lệ tối thiểu** (theo 3.4 UC-010):',
     '- không có slot hợp lệ: hiện trade-off, không ép chọn;',
     '- thiếu dữ liệu: hỏi lại, không tự giả định giờ ngủ;',
     '- phụ huynh từ chối đề xuất: giữ lịch cũ;',
     '- thiếu quyền: đề xuất ở trạng thái pending.',
     '', '## 3. Ma trận độ phủ từ đầu đến cuối', '',
     '| Bước | Năng lực | Lớp ràng buộc | Nguồn | Module | Trạng thái (so với A-lite baseline) | Thiết yếu | E | Ghi chú |', '|---|---|---|---|---|---|---|---|---|'] + [
     f"| {c['step']} | {c['capability']} | {c['constraint_class']} | {c['source']} | {c['modules']} | **{c['status']}** | {c['essential']} | {c['exec']} | {c['note'] or '—'} |" for c in caps] + [
     '', 'Lớp ràng buộc:',
     '- **HARD_SAFETY:** sàn ngủ [NC], lớp an toàn trước AI, ẩn danh, PIN. Không ai được nới.',
     '- **USER_CONFIGURABLE:** quỹ thời gian, preset, ngoại lệ.',
     '- **ADVISORY:** cảnh báo, xu hướng.',
     '- **OPERATIONAL:** thời gian thực tế, xung đột, tổng 24 giờ.',
     'Audit **không đưa ra giới hạn thời gian chung nào mới**. Mọi ngưỡng lấy từ `spec-quy-tac-lap-lich.md`, kèm mức căn cứ đã ghi tại đó.',
     '', '## 4. Balanced Planning làm được gì', '',
     '| Năng lực | Phát hiện vi phạm | Giải thích | Gợi ý điều chỉnh | Tự giải quyết | Cần ai duyệt |', '|---|---|---|---|---|---|',
     '| Sàn ngủ [NC] / protected_hard | Có | Có (kèm nguồn) | Có | **Có**: thứ tự trong ngày do hệ thống tự sửa, không hỏi lại (spec §1.2) | Không. Không ai được nới, kể cả ngoại lệ khẩn (P6-BP-OD-02) |',
     '| family_hard (gia đình tự đặt) | Có | Có | Có | Không | Người có quyền đổi, có audit, version, thời hạn (P6-BP-OD-02) |',
     '| Quỹ thời gian / trần mềm | Có | Có (một dòng, kèm nguồn) | Có | Không | Phụ huynh xác nhận "Giữ mức này" |',
     '| Xung đột lịch | Có | Có | Có (slot khác) | Không. Hiện trade-off | Phụ huynh, hoặc con đề xuất rồi phụ huynh duyệt |',
     '| Giai đoạn tạm thời | Có (hết hạn) | Có | Có (3 lựa chọn) | Không | Phụ huynh; đề xuất của con ở trạng thái chờ |',
     '| Tín hiệu mệt | Có (mẫu 2 tuần) | Có (hỏi bối cảnh, không kết luận nguyên nhân) | Có (một đề xuất cụ thể) | Giảm tải trong ngày theo spec §4 (chưa có trong prototype) | Thay đổi lâu dài cần phụ huynh duyệt |',
     '', 'Mọi việc tự động phải tôn trọng chế độ tự chủ:',
     '- **PARENT_LED:** chỉ phụ huynh được commit.',
     '- **CHILD_EXECUTED:** con đề xuất, phụ huynh duyệt.',
     '- **CHILD_DIRECTED:** con quyết trong phạm vi đã được ủy quyền.',
     '', '## 5. Năng lực thiết yếu và năng lực hoãn được', '',
     '**Thiết yếu:** các mục có cột Thiết yếu = YES ở §3.', '',
     '**Hoãn được:**',
     '- ảnh và giọng nói có AI chấm (SC-002-D05 chỉ cho pilot);',
     '- họp gia đình;',
     '- việc một lần;',
     '- báo đói;',
     '- thời tiết;',
     '- lịch sử thay đổi đầy đủ;',
     '- máy trạng thái B01 đầy đủ;',
     '- ghép khác hộ.',
     '', '**Quá mức cho pilot:**',
     '- máy trạng thái Change Request B01 v3.1 (TTL, lock precedence, OUTCOME_UNKNOWN), khi chỉ có một người duyệt;',
     '- engine Access Policy đầy đủ;',
     '- quy trình xóa có nhiều tầng lưu trữ, khi pilot chỉ dùng dữ liệu giả lập.',
     '', '**Trường hợp thật sự cần LLM:**'] + [f'- {x}' for x in PC['e2_genuinely_needed']] + [
     '', '## 6. Sổ khoảng trống lập lịch', '', '| # | Khoảng trống | Loại | Module | Đề xuất |', '|---|---|---|---|---|'] + [
     f"| SG-{i+1:02d} | {c['capability']} | {c['status']} | {c['modules']} | {c['note'] or '—'} |" for i, c in enumerate([c for c in caps if c['status'] in ('MISSING', 'FEATURE_GAP', 'PARTIAL')])] + [
     '', '## 7. Đánh giá khả thi', '',
     '**A-lite v2: khả thi về mặt kỹ thuật, có điều kiện.**',
     '- **Bằng chứng ủng hộ:**',
     '  - prototype đã chạy toàn bộ luồng trên một máy;',
     '  - Plan A đo được nhắc việc (+45 giây) và chụp ảnh;',
     '  - quy tắc lập lịch có mức căn cứ.',
     '- **Rủi ro chính:**',
     '  - (1) Thứ tự trong ngày hiện do LLM làm theo prompt `RULES`; `checkDayK` chỉ kiểm, không dựng. Chưa có bộ dựng xác định nào, nên **khả thi E1 là UNKNOWN** cho đến khi làm spike (RG-01). Build ở mức H; đây là rủi ro lớn nhất.',
     '  - (2) Prototype dùng chung tài khoản, chưa có PIN; cần lõi định danh (FR-01).',
     '  - (3) Nhắc việc đúng giờ trên Android.',
     '  - (4) H4 trước khi dùng dữ liệu thật.',
     '- **Độ tin cậy:** MEDIUM cho độ phủ (đối chiếu với tài liệu và code thật); HYPOTHESIS cho giá trị.',
     '- **Mâu thuẫn với chuẩn của repo:** CLAUDE.md coi `prototype/index.html` là hành vi chuẩn, và prototype dựa trên Pal chat. A-lite E1 vì vậy là **giả thuyết kiến trúc để kiểm**, không phải bản port của prototype. Biến thể bám Plan A tồn tại để Owner chọn (OD-A2).',
     '- **Câu hỏi còn mở:** OD-A1 (mục tiêu), OD-A2 (A-lite E1 hay biến thể Plan A), OD-A3 (geofence), OD-A7 (chủ của tín hiệu mệt), OD-A8 (mô hình định danh).',
     '- **Cần Owner duyệt:** có.']
W('03_A_Lite_Workflow_Validation.md', L)

# ---------------- 04 ----------------
mx = PDE['delivery_matrix']; wc = PDE['workflow_comparison']; br = PDE['band_rules']
L = ['# 04 — Phân tích kinh tế triển khai (Phase D)', '', HDR, '',
     '**Dữ liệu:** `data/phase_de.json` (script `tools/phase_de.py`); chi phí AI từ `baseline_v1/cost_scenarios.json` (giả định).',
     'Ba chiều **Build / Run / Change được giữ riêng**. Không gộp thành một điểm, vì chưa có quy tắc gộp nào được duyệt.', '',
     '## 1. Quy tắc phân mức (ánh xạ từ khóa 3.3, không phải điểm tổng)', '',
     f"- **Build:** {br['build']}", f"- **Run:** {br['run']}", f"- **Change:** {br['change']}", '',
     'Chi phí Build gồm: độ phức tạp kỹ thuật và tích hợp, dữ liệu, kiểm thử, an toàn, giao diện.',
     'Chi phí Run gồm: token, tần suất gọi model, API, lưu trữ, job nền, giám sát, can thiệp của con người.',
     'Chi phí Change gồm: sửa tính năng, cập nhật kho tri thức, prompt và bộ đánh giá, đổi model hoặc nhà cung cấp, thay đổi quyền riêng tư, nợ kỹ thuật, kiểm thử hồi quy, mức liên kết chéo giữa module.',
     'Không có con số tiền nào ngoài kịch bản AI đã ghi giả định.',
     '', '## 2. So sánh theo workflow (đếm số module theo mức, không cộng)', '',
     '| Workflow | Module | Build L/M/H | Run L/M/H | Change L/M/H | AI VND/hộ/tháng (Base, giả định) | Build H | Change H |', '|---|---|---|---|---|---|---|---|'] + [
     f"| {k} | {v['modules']} | {v['build'].get('L',0)}/{v['build'].get('M',0)}/{v['build'].get('H',0)} | {v['run'].get('L',0)}/{v['run'].get('M',0)}/{v['run'].get('H',0)} | {v['change'].get('L',0)}/{v['change'].get('M',0)}/{v['change'].get('H',0)} | {v['ai_vnd_per_hh_month_base_ASSUMPTION']:,} | {', '.join(v['build_H']) or '—'} | {', '.join(v['change_H']) or '—'} |".replace(',', '.') if False else
     f"| {k} | {v['modules']} | {v['build'].get('L',0)}/{v['build'].get('M',0)}/{v['build'].get('H',0)} | {v['run'].get('L',0)}/{v['run'].get('M',0)}/{v['run'].get('H',0)} | {v['change'].get('L',0)}/{v['change'].get('M',0)}/{v['change'].get('H',0)} | {v['ai_vnd_per_hh_month_base_ASSUMPTION']} | {', '.join(v['build_H']) or '—'} | {', '.join(v['change_H']) or '—'} |" for k, v in wc.items()] + [
     '', 'A-lite v2 tính theo góc nhìn năng lực tối thiểu (Phase B): module MINIMAL được hạ một mức Build, và F04-G02-M01 ở chế độ E1 nên AI = L. Các workflow khác tính theo baseline.',
     '', '## 3. Yếu tố chi phí chính', '',
     '1. **Viết lại phần xếp thứ tự trong ngày từ prompt LLM thành thuật toán E1** (`F04-G02-M01`, Build H). Đây là chi phí lớn nhất của A-lite v2, và chưa có thiết kế.',
     '2. **Lõi định danh và phân quyền:** 4 module chưa từng được kiểm độc lập. Build giảm từ H xuống M nếu chỉ làm năng lực tối thiểu, nhưng chi phí Change ở mức M vì phụ thuộc văn bản pháp lý (MR-016).',
     '3. **Xóa và lưu giữ** (`F01-G06-M01`, `F07-G06-M02`): Build H, phụ thuộc H4. Pilot dùng runbook thủ công.',
     '4. **Mọi workflow có AI:** chi phí Change ở mức H nằm ở kho nội dung (F07-G01-M01), bộ đánh giá (F07-G04-M02), phạm vi OD-05 (F07-G04-M01) và quy tắc an toàn (F07-G05-M01). Với W2, 7 module có Change H, cao nhất trong các workflow.',
     '5. **Run:** chi phí AI không quyết định việc chọn workflow nếu dùng model nhỏ (baseline CP-05). Rủi ro Run thật nằm ở công vận hành của con người: chuyên gia duyệt nội dung, runbook xóa.',
     '', '## 4. Khuyến nghị LLM hay xác định (deterministic)', '',
     '| Năng lực | Hiện trạng (prototype) | Khuyến nghị | Lý do |', '|---|---|---|---|',
     '| Xếp thứ tự trong ngày, xê dịch ±30 phút | LLM theo prompt `RULES` + bộ kiểm `checkDayK` | **E1** (thuật toán có ràng buộc) | Quy tắc đã viết rõ; SC-001 §5 ưu tiên E0/E1; kiểm chứng được |',
     '| Kiểm quỹ thời gian, màu cảnh báo, tổng 24 giờ | JS (`judge`, `validBudget`) | **E0/E1** | Đã xác định sẵn |',
     '| Tạo thẻ hoạt động từ lời kể | LLM | **E1 form** mặc định; E2 tùy chọn | Tiện, nhưng không bắt buộc |',
     '| Giải thích trade-off | LLM | **Mẫu câu E1**; E2 tùy chọn | 3.4 UC-010 cho E2 là tùy chọn |',
     '| Giai đoạn tạm thời, hết hạn | JS (`applyPeriod`, `checkPeriodExpiry`) | **E0** | Đã xác định sẵn |',
     '| Tín hiệu mệt → giảm tải | Quy tắc spec §4 | **E1** | Đã xác định sẵn |',
     '| Chấm bài qua ảnh | LLM thị giác | **E2, chỉ pilot** (SC-002-D05) | Chất lượng và chi phí cần benchmark |',
     '| Pal hội thoại | LLM | E2 sau gói AI và OD-05 | Không thuộc A-lite |',
     '', '## 5. Sổ bất định về chi phí', '', '| # | Biến chưa biết | Ảnh hưởng | Cần gì |', '|---|---|---|---|',
     '| CU-01 | Công viết thuật toán xếp lịch E1 | Build A-lite | Spike kỹ thuật (MR-025) |',
     '| CU-02 | Chi phí và năng lực chuyên gia duyệt nội dung | Run/Change W1-AI, W2 | Báo giá (đề xuất PMR-02) |',
     '| CU-03 | Model tiếng Việt: Haiku có đủ không | Run W2 (khoảng 20×) | MR-026 |',
     '| CU-04 | Độ tin cậy thông báo trên các dòng máy Android | Run/Build F04-G07-M01 | Test Plan A bước 2–5 |',
     '| CU-05 | Công pháp lý (H4, MR-016) | Build/Change lõi | Nghiên cứu pháp lý |',
     '| CU-06 | Giới hạn gói miễn phí Supabase ở quy mô pilot | Run | Kiểm hạn mức gói |',
     '| CU-07 | Lưu trữ ảnh, nếu bật chụp ảnh | Run | Giả định 30 ngày (đề xuất nội bộ, Plan A) |',
     '', '## 6. Ma trận kinh tế triển khai (66 module FULL)', '',
     '| L3 | Tier | E | Build | Run | Change | Build (tối thiểu) | Trong A-lite v2 | Yếu tố |', '|---|---|---|---|---|---|---|---|---|'] + [
     f"| `{x['module_id']}` | {x['tier']} | {x['exec']} | {x['build']} | {x['run']} | {x['change']} | {x['build_minimal']} | {'✓' if x['in_alite_v2'] else ''} | B: {x['drivers']['build']}; R: {x['drivers']['run']}; C: {x['drivers']['change']} |" for x in mx] + [
     '', '**Độ tin cậy:** ESTIMATE / HYPOTHESIS. **Câu hỏi còn mở:** CU-01..07. **Cần Owner duyệt:** không, vì đây chỉ là phân tích. Quy tắc phân mức là đề xuất.']
W('04_Delivery_Economics_Analysis.md', L)

# ---------------- 05 ----------------
S = PDE['sensitivity']; c = S['with_phase_A_corrections']; b = S['baseline_v1']
L = ['# 05 — Phân tích độ nhạy và độ bền (Phase E)', '', HDR, '',
     '**Dữ liệu:** `data/phase_de.json`.',
     '**Phương pháp:** phương pháp 3.3 **không có trọng số và không có điểm tổng** (Q3). Vì vậy dùng **quy tắc sắp xếp theo thứ tự ưu tiên** cho từng kịch bản, chỉ để phân tích, không tạo điểm chính thức. Hard Gate giữ nguyên trong mọi kịch bản; UNKNOWN là chưa giải quyết.',
     f"- **Tập được xếp hạng:** {PDE['ranked_pool']} module FULL không thuộc nền tảng.",
     f"- **Giữ ngoài xếp hạng vì G-Legal BLOCKED:** {', '.join(PDE['gate_held_out_of_ranking'])}.",
     '- **Module nền tảng (MIN_FOUNDATION):** luôn bắt buộc theo workflow, không xếp hạng, để không bị thiệt vì chỉ có giá trị gián tiếp.',
     '', '## 1. Kịch bản', '', '| Kịch bản | Quy tắc sắp xếp |', '|---|---|',
     '| Value-oriented | Giá trị cao nhất ở A2/A3 (phụ huynh hoặc trẻ) ↓, core_loop ↓, adoption ↓ |',
     '| Cost-constrained | Build ↑, Run ↑, Change ↑ (mức L/M/H), rồi giá trị ↓ |',
     '| Dependency-constrained | Số module phải thêm ngoài nền tảng chung (bao đóng HARD, trừ lõi định danh/phân quyền/lifecycle) ↑, rồi giá trị ↓ |',
     '', f"Độ ổn định: nằm trong top-{c['top']} ở cả 3 kịch bản = STABLE_HIGH; ở 2 = MODERATE; ở 1 = VOLATILE; ở 0 = STABLE_LOW.", '',
     '## 2. Ma trận ổn định ưu tiên', '', '| Phân bố | Baseline v1 | Sau sửa của Phase A (đề xuất) |', '|---|---|---|'] + [
     f"| {k} | {b['counts'].get(k,0)} | {c['counts'].get(k,0)} |" for k in ('STABLE_HIGH', 'MODERATE', 'VOLATILE', 'STABLE_LOW')] + [
     '', '| L3 | Baseline v1 | Sau sửa | Value | Cost | Dependency |', '|---|---|---|---|---|---|'] + [
     f"| `{m}` | {b['stability'][m]} | {c['stability'][m]} | {c['rankings']['value_oriented'].index(m)+1} | {c['rankings']['cost_constrained'].index(m)+1} | {c['rankings']['dependency_constrained'].index(m)+1} |" for m in sorted(c['stability'], key=lambda x: (['STABLE_HIGH','MODERATE','VOLATILE','STABLE_LOW'].index(c['stability'][x]), x))] + [
     '', '## 3. Phát hiện', '',
     f"1. **Ưu tiên ở mức module rất không ổn định.** Chỉ {c['counts'].get('STABLE_HIGH',0)} module STABLE_HIGH ({', '.join(m for m,s in c['stability'].items() if s=='STABLE_HIGH')}), còn {c['counts'].get('VOLATILE',0)} module VOLATILE. Điều này củng cố nguyên tắc: **chọn MVP theo workflow, không theo điểm từng module.**",
     '2. **`F04-G02-M01` đứng đầu kịch bản Value nhưng tụt ở Cost và Dependency** (Build H). Đây là module "đắt mà đáng" điển hình. Quyết định nên dựa trên spike kỹ thuật (CU-01), không dựa trên điểm.',
     '3. **Các sửa đổi của Phase A làm 6 module đổi nhóm ổn định**, trong đó Intake (`F02-G01-M01`) lên STABLE_HIGH. Kết quả nhạy với chính những sửa đổi cần Owner duyệt.',
     '4. **`F02-G05-M02` STABLE_HIGH phần lớn là ảo.** Baseline chấm module này theo phạm vi sai (phản hồi về việc, trong khi phạm vi thật là trẻ xem và đề nghị sửa hiểu biết về mình). Nó đứng cao vì rẻ và ít phụ thuộc, không phải vì đã chứng minh được giá trị.',
     '5. **Độ khả thi của workflow qua các kịch bản:**', '',
     '| Workflow | Value | Cost | Dependency | Blocker |', '|---|---|---|---|---|'] + [
     f"| {k} | {v['value_oriented']} | {v['cost_constrained']} | {v['dependency_constrained']} | {v['blocker']} |" for k, v in PDE['workflow_feasibility'].items()] + [
     '', '**A-lite v2 là workflow duy nhất khả thi ở cả 3 kịch bản.** Đây là độ bền về **cấu trúc**, không chứng minh product-market fit.',
     '', '## 4. Sổ giả định then chốt', '', '| # | Giả định | Nếu sai thì | Nghiên cứu |', '|---|---|---|---|',
     '| CA-01 | Trẻ A2–A3 tự mở app và đánh dấu xong | Giá trị phía trẻ của A-lite sụp; còn lại planner cho phụ huynh | MR-007 |',
     '| CA-02 | Phụ huynh thấy lịch cân bằng có ích và bớt phải nhắc | Toàn bộ đề xuất giá trị lõi | MR-001, MR-002 |',
     '| CA-03 | Viết được thuật toán xếp lịch E1 đạt chất lượng gần prototype LLM | Phải giữ E2 → kéo theo gói AI | MR-025 |',
     '| CA-04 | 3 lựa chọn mệt là đủ, không gây áp lực | Kênh phản hồi bị bỏ, hoặc gây hại | MR-009, MR-031 |',
     '| CA-05 | Pilot chỉ gồm gia đình một hộ | Cần ghép khác hộ (FR-01) | MR-017 |',
     '| CA-06 | Dữ liệu giả lập đủ để học trước khi H4 đóng | Không học được hành vi thật | MR-016, MR-018 |',
     '| CA-07 | Ngưỡng quỹ thời gian có nguồn được chuyên gia chấp nhận | Phải sửa sàn và ngưỡng | MR-012 |',
     '', '## 5. Ưu tiên nghiên cứu', '',
     '1. Spike kỹ thuật thuật toán xếp lịch E1 (CA-03).',
     '2. Thử với người dùng hành vi của trẻ và phụ huynh (CA-01, CA-02), dùng dữ liệu giả lập hoặc thử nghiệm không định danh.',
     '3. Pháp lý H4 và MR-016 (CA-06).',
     '4. Chuyên gia duyệt ngưỡng (CA-07).',
     '', '## 6. Mức sẵn sàng cho quyết định MVP', '',
     '**`READY_WITH_CONDITIONS` cho Adversarial MVP Review, không phải cho quyết định phát triển.** Chi tiết ở `06_MVP_Readiness_Summary.md`.', '',
     '**Độ tin cậy:** HYPOTHESIS (quy tắc sắp xếp chỉ là công cụ phân tích). **Cần Owner duyệt:** không. Đây là phân tích, không phải quyết định.']
W('05_Sensitivity_Analysis.md', L)
print('docs 02-05 written')
