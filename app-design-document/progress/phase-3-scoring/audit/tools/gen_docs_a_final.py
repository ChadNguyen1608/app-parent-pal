"""Generate 01, 06, 07, 08 from data + adversarial review. SELF_AUDIT."""
import json, os, collections
R = os.path.join(os.path.dirname(__file__), '..'); D = os.path.join(R, 'data')
PA = json.load(open(os.path.join(D, 'phase_a.json'))); PB = json.load(open(os.path.join(D, 'phase_b.json')))
PC = json.load(open(os.path.join(D, 'phase_c.json'))); PDE = json.load(open(os.path.join(D, 'phase_de.json')))
ADV = json.load(open(os.path.join(D, 'adversarial_reconciled.json')))
BASE = {r['module_id']: r for r in json.load(open(os.path.join(R, 'baseline_v1', 'assessment.json')))}
HDR = ('**Loại:** `SELF_AUDIT / PROPOSAL` · **Người soạn:** AI (Claude, Opus 5.5), tự rà soát lượt chấm của chính mình, chưa kiểm chứng độc lập; có 1 lượt phản biện bằng subagent · '
       '**Nguồn:** HEAD `9043c88`; baseline đóng băng `baseline_v1/` (SHA256SUMS) · **Cần Owner duyệt:** mọi thay đổi đề xuất')
W = lambda name, L: open(os.path.join(R, name), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
rows = PA['rows']; sc = collections.Counter(r['audit_status'] for r in rows)
coarse = [r for r in rows if r['level'] == 'COARSE']; cc = collections.Counter(r['audit_status'] for r in coarse)
manual = [r for r in rows if r['basis'] != 'AUTOMATED']; bc = collections.Counter(r['basis'] for r in manual)
adv = {v['module']: v for v in ADV['finding_verdicts']}
CORR = ADV['score_corrections']  # list of dicts module,key,original,proposed,basis,status

# ---------------- 01 ----------------
L = ['# 01 — Audit chất lượng scoring (Phase A)', '', HDR, '',
     '**Dữ liệu:**',
     '- `data/phase_a.json` (script `tools/phase_a.py`);',
     '- phản biện: `work/adversarial_review.json` (subagent Sonnet 5.5);',
     '- đối chiếu: `data/adversarial_reconciled.json`.',
     '',
     '## 1. Báo cáo chất lượng scoring', '',
     '| Chỉ số | Giá trị |', '|---|---|',
     '| Module được audit | 106: 40 COARSE được rà thủ công từng module; 66 FULL được kiểm tự động, module nào bị cờ thì rà thủ công |',
     f"| Phân loại | KEEP {sc['KEEP']} · CLARIFY {sc['CLARIFY']} · REVIEW {sc['REVIEW']} · BLOCKED {sc['BLOCKED']} |",
     f"| Trong 40 COARSE | KEEP {cc['KEEP']} · CLARIFY {cc['CLARIFY']} · REVIEW {cc['REVIEW']} · BLOCKED {cc['BLOCKED']} |",
     f"| Căn cứ của các mục rà thủ công ({len(manual)}) | CONFIRMED_SOURCE {bc['CONFIRMED_SOURCE']} · CONFIRMED_SCRIPT {bc['CONFIRMED_SCRIPT']} · SELF_OMISSION {bc['SELF_OMISSION']} · JUDGMENT {bc['JUDGMENT']} |",
     f"| Cờ tự động | {len(PA['auto_flags'])}, đã xử lý hết |",
     f"| Phản biện subagent | {ADV['summary']} |",
     '',
     '**Kết luận:**',
     '- **Đủ nhất quán để dùng tiếp, nhưng có điều kiện.** Baseline không có lỗi số học hay lỗi gate. Không gate nào bị chấm PASS sai, không có điểm tổng.',
     '- **Lỗi đáng kể nằm ở phạm vi workflow và lý do chấm, không nằm ở số điểm.**',
     '  - **Lỗi nặng nhất:** `F04-G02-M01` bị nâng lên E2, trái với Inventory và 3.4. Hệ quả là A-lite mất bộ dựng lịch.',
     '  - **Tự bỏ sót:** baseline không đọc 3.4, SC-001..003 và spec lập lịch. Vì vậy có 10 phát hiện loại SELF_OMISSION.',
     '- **Mọi giá trị vẫn là EXPERT_HYPOTHESIS.** Audit này **không** biến điểm nào thành đã kiểm chứng.',
     '',
     '**Phân biệt:**',
     '- **Lỗi đã xác nhận** (CONFIRMED_SOURCE, CONFIRMED_SCRIPT): mâu thuẫn với tài liệu đã duyệt hoặc mâu thuẫn nội bộ đo được bằng script.',
     '- **Bỏ sót** (SELF_OMISSION): nguồn có sẵn mà baseline không đọc.',
     '- **Nhận định chủ quan** (JUDGMENT): có thể tranh luận.',
     '', '## 2. Sổ bất thường', '', '| # | Loại (A2) | Module | Phát hiện | Căn cứ |', '|---|---|---|---|---|']
an = [
 ('Module tương tự chấm khác nhau', 'F04-G01-M01 vs F04-G03-M01; F06-G02-M01 vs F04-G02-M02; F06-G04-M01 vs F06-G02-M02', 'Quy tắc INDIRECT của R1.1a chưa đủ chặt; module cấu trúc/tính toán lúc ghi INDIRECT, lúc ghi điểm', 'CONFIRMED_SCRIPT'),
 ('Điểm cao dù bằng chứng yếu', 'F04-G02-M01 (phụ huynh A2 = 5), F04-G02-M03 (khác biệt = 5), F04-G04-M01 (adoption = 5)', 'Không có dữ liệu người dùng; là các điểm cao nhất nhưng đều là giả thuyết (CA-01, CA-02)', 'JUDGMENT'),
 ('Điểm thấp vì giá trị nằm ở module khác', 'F06-G02-M01, F06-G04-M01 (INDIRECT)', 'Đúng chủ đích của R1.1a, nhưng làm mờ đóng góp workflow; đã tách đóng góp workflow ở file 05', 'JUDGMENT'),
 ('Yêu cầu an toàn/nền tảng chấm như tính năng thường', '—', 'Không thấy: các module nền dùng INDIRECT, gate tách riêng', 'CONFIRMED_SCRIPT (không có bất thường)'),
 ('Đếm trùng năng lực dùng chung', 'Gói B_AUTHZ / B_CHILD_SCOPE', 'Fan-in 52–56 của nền tảng đến từ việc mở rộng gói; enablement của các module này hợp lý (5), nhưng phạm vi build bị phóng đại (Phase B)', 'CONFIRMED_SCRIPT'),
 ('Năng lực mở khóa workflow bị đánh giá thấp', 'F04-G06-M01, F06-G04-M01, F04-G02-M03 (ngoại lệ)', 'Bị để là tùy chọn hoặc vắng mặt trong A-lite dù prototype và SC-001 coi là cốt lõi', 'CONFIRMED_SOURCE'),
 ('Chấm sai phạm vi module', 'F02-G05-M02', 'Baseline chấm như phản hồi về việc; Inventory: trẻ xem và đề nghị sửa hiểu biết về mình (phản biện phát hiện)', 'CONFIRMED_SOURCE'),
 ('Bỏ qua quyết định Owner đã duyệt', 'F04-G02-M03, F04-G06-M01, F03-G03-M01', 'P6-BP-OD-01..03, B01 CR log, B01-MS-OD-01..04 không được áp (phản biện phát hiện)', 'CONFIRMED_SOURCE'),
 ('Điểm phụ thuộc giả định không có căn cứ', 'F04-G02-M01 (E2), F04-G06-M01 (effort 4 = máy trạng thái đầy đủ)', 'Giả định về cách triển khai quyết định điểm chi phí', 'CONFIRMED_SOURCE'),
 ('Enablement lệch với số phụ thuộc trực tiếp', 'F04-G02-M01 (4 vs 0), F06-G01-M01 (4 vs 1)', 'Rubric đếm phụ thuộc trực tiếp', 'CONFIRMED_SCRIPT'),
 ('Lý do sai với scenario đã duyệt', 'F03-G05-M03', 'Ghi "chủ yếu A4–A5" trong khi SC-003 là học sinh lớp 8 (A3)', 'CONFIRMED_SOURCE'),
 ('Tính năng Owner đã chốt không có L3 đứng tên', 'Geofence Plan A', 'Ánh xạ được vào F08-G04-M01/M02 + F01-G04-M02 + F06-G01 + F04-G07; chờ Owner chấp nhận', 'CONFIRMED_SOURCE'),
]
L += [f'| AN-{i+1:02d} | {a[0]} | {a[1]} | {a[2]} | {a[3]} |' for i, a in enumerate(an)]
L += ['', '## 2b. Đối chiếu với lượt phản biện (subagent Sonnet 5.5)', '', '| Mục | Phản biện | Quyết định | Tác động |', '|---|---|---|---|']
L += [f"| {x['item']} | {x['adversarial']} | {x['decision']} | {x['effect']} |" for x in ADV['reconciliation']]
L += ['', 'Không có phát hiện nào bị bác hoàn toàn (0 NOT_SUPPORTED). 9 phát hiện chỉ đúng một phần và đã được sửa. Phản biện tìm thêm 8 điểm bị bỏ sót; tất cả đã được ghi nhận.',
      '', '## 3. Đề xuất chấm lại có chọn lọc (giữ cả điểm gốc và điểm đề xuất)', '',
      '| Module | Khóa | Điểm gốc (baseline_v1) | Đề xuất | Căn cứ | Phản biện subagent | Trạng thái |', '|---|---|---|---|---|---|---|']
L += [f"| `{c['module']}` | {c['key']} | {c['original']} | {c['proposed']} | {c['basis']} | {adv.get(c['module'], {}).get('verdict', '—')} | {c['status']} |" for c in CORR]
L += ['', 'Baseline **không bị ghi đè**. Mọi đề xuất nằm ở cột riêng và chỉ áp dụng khi Owner duyệt. Khi đó sẽ tạo `assessment_v1_1.json`.',
      '', '## 4. Phân loại từng module (KEEP / CLARIFY / REVIEW / BLOCKED)', '',
      '| L3 | Mức | Tier | Trạng thái audit | Căn cứ | Phát hiện | Đề xuất | Tin cậy | Cần Owner | Phản biện |', '|---|---|---|---|---|---|---|---|---|---|']
for r in sorted(rows, key=lambda x: (['REVIEW', 'BLOCKED', 'CLARIFY', 'KEEP'].index(x['audit_status']), x['module_id'])):
    L.append(f"| `{r['module_id']}` | {r['level']} | {r['tier']} | **{r['audit_status']}** | {r['basis']} | {r['finding']} | {r['proposed_change'] or '—'} | {r['confidence']} | {r['owner_approval']} | {adv.get(r['module_id'], {}).get('verdict', '—')} |")
L += ['', '## 5. Sổ khoảng trống độ tin cậy và bằng chứng', '', '| # | Khoảng trống | Ảnh hưởng | MR |', '|---|---|---|---|',
      '| CE-01 | Không có dữ liệu người dùng cho mọi giá trị | Tất cả | MR-001, MR-002, MR-007 |',
      '| CE-02 | Chỉ một người chấm, cộng một subagent; chưa có hội đồng chuyên gia | Tất cả | MR-039 |',
      '| CE-03 | 4 module nền chưa từng được kiểm độc lập | Lõi định danh | — (cần cho phép review) |',
      '| CE-04 | Module COARSE không có cạnh phụ thuộc | 19 module mồ côi | MR-040 |',
      '| CE-05 | Bản tóm tắt L4 dùng cho QA bị trống ở một số module | Chất lượng QA lần trước | — |',
      '| CE-06 | Quy tắc INDIRECT chưa chặt | 6 module | MR-039 |',
      '| CE-07 | Chưa rà hết các Owner Decision Log đã duyệt (B01 Plan Structure, Consent Ledger, Purpose-bound Access, P6 Access Policy, P5, P6 Academic Assessment) | Lõi định danh, kế hoạch | — (rà trước Adversarial MVP Review) |',
      '', '**Câu hỏi còn mở:** xem `08_Research_Gaps_and_Decisions.md`. **Cần Owner duyệt:** có, cho mọi đề xuất ở §3.']
W('01_Scoring_Quality_Audit.md', L)

# ---------------- 07 change register ----------------
CH = ADV['change_register']
L = ['# 07 — Sổ thay đổi đề xuất', '', HDR, '',
     'Mọi mục ở trạng thái `PROPOSED`. Không mục nào được tự áp dụng. Không đổi Feature ID, không gộp hay xóa module, không sửa Blueprint.', '',
     '| ID | Feature ID bị ảnh hưởng | Hiện trạng | Đề xuất | Bằng chứng / lý do | Hệ quả hạ nguồn | Tin cậy | Cần duyệt |', '|---|---|---|---|---|---|---|---|']
L += [f"| {c['id']} | {c['features']} | {c['existing']} | {c['proposed']} | {c['evidence']} | {c['downstream']} | {c['confidence']} | {c['approval']} |" for c in CH]
W('07_Proposed_Change_Register.md', L)

# ---------------- 08 research gaps & decisions ----------------
L = ['# 08 — Khoảng trống nghiên cứu và quyết định', '', HDR, '',
     '## 1. Quyết định cần Owner', '']
for d in ADV['owner_decisions']:
    L += [f"### {d['id']} — {d['question']}", '', f"- **Phương án:** {d['options']}", f"- **Khuyến nghị:** {d['recommendation']}", f"- **Lý do:** {d['rationale']}", '']
L += ['## 2. Khoảng trống nghiên cứu (gắn MR hiện có; đề xuất mới chỉ ghi ở đây)', '', '| # | Câu hỏi | MR | Chặn gì | Ưu tiên |', '|---|---|---|---|---|']
L += [f"| {g['id']} | {g['question']} | {g['mr']} | {g['blocks']} | {g['priority']} |" for g in ADV['research_gaps']]
L += ['', 'Master Research Backlog **không bị sửa**. Các đề xuất PMR-01..04 chỉ là ứng viên.']
W('08_Research_Gaps_and_Decisions.md', L)

# ---------------- 06 readiness ----------------
L = ['# 06 — Tổng hợp mức sẵn sàng cho MVP (không chọn MVP)', '', HDR, '',
     '## Trạng thái: `READY_WITH_CONDITIONS` cho bước Adversarial MVP Review', '',
     'Nhãn này **không** cho phép sửa Blueprint, chọn MVP hay bắt đầu phát triển.', '',
     '**Điều kiện** (theo tiêu chí đã thống nhất với Owner):',
     '1. **Không còn mâu thuẫn với quyết định đã duyệt.**',
     '   - Đã tìm ra các mâu thuẫn trong baseline:',
     '     - E2 của F04-G02-M01, trái 3.4/Inventory;',
     '     - A-lite thiếu phần thực thi SC-001-D01 (ngoại lệ có hạn) và D02 (phản hồi tự nguyện);',
     '     - lý do của F03-G05-M03 trái SC-003;',
     '     - chưa áp P6-BP-OD-01..03 và B01 CR / Mode State (phản biện phát hiện);',
     '     - F02-G05-M02 chấm sai phạm vi.',
     '   - Tất cả đều có đề xuất sửa (file 07), **cần Owner duyệt**.',
     '   - Chưa rà hết các Owner Decision Log khác (B01 Plan Structure, Consent Ledger, Purpose-bound Access, P6 Access Policy, P5). Đây là điều kiện còn mở.',
     '2. **Mọi khoảng trống thiết yếu của A-lite đều có hướng xử lý:**',
     '   - 4 năng lực thiếu hẳn đã có đề xuất trong A-lite v2, trừ tín hiệu mệt đang chờ chủ sở hữu (OD-A7);',
     '   - mục tiêu, biến thể A-lite, geofence, định danh chờ Owner quyết (OD-A1, A2, A3, A8).',
     '3. **Gate pháp lý là điều kiện trước khi dùng dữ liệu thật, không phải trước khi review:** H4, FR-03, MR-016/017/018/021 vẫn mở; không gate nào PASS.',
     '', '## 1. Phát hiện đã xác nhận', '']
L += [f'- {x}' for x in ADV['confirmed_findings']]
L += ['', '## 2. Sửa có căn cứ và giả thuyết', '',
      '- **Sửa có căn cứ** (CONFIRMED_SOURCE / CONFIRMED_SCRIPT): xem cột "Căn cứ" ở file 01 §3–4.',
      '- **Giả thuyết:** mọi điểm giá trị, mọi mức chi phí, quy tắc sắp xếp kịch bản.',
      '', '## 3. Hard Gate chưa giải quyết', '',
      '- **H4:** thời hạn xóa.',
      '- **FR-03:** xử lý yêu cầu của trẻ khi chưa rõ cơ sở pháp lý.',
      '- **G-Legal / G-Privacy UNKNOWN** cho mọi module có dữ liệu cá nhân.',
      '- **G-Safety CONDITIONAL** cho module AI.',
      '- **4 module nền** chưa từng được kiểm độc lập.',
      '', '## 4. Thay đổi phụ thuộc có tác động lớn nhất', '',
      '1. 36/95 cạnh chỉ cần năng lực tối thiểu → phạm vi nền tảng của pilot nhỏ hơn đáng kể.',
      '2. `B_AI_GATE` chỉ áp khi E2 thật sự được bật → A-lite không cần gói AI.',
      '3. Đổi chiều E029 và thêm P-E02..P-E04 → bộ dựng lịch, quỹ thời gian và ngoại lệ trở thành chuỗi bắt buộc.',
      '4. Rút P-E05 (sai chủ sở hữu) và P-E07 (ghi chi phí thuộc F07-G03-M02) sau phản biện.',
      '', '## 5. A-lite còn khả thi không?', '',
      f"- **Có thể, nhưng chưa chứng minh được:** A-lite E1 gồm {PC['alite_v2_count']} module (12 module chỉ cần năng lực tối thiểu) và 0 module AI. Đây là workflow duy nhất khả thi về cấu trúc ở cả 3 kịch bản độ nhạy.",
      '- **Bộ dựng lịch xác định (E1) chưa tồn tại.** Prototype giao việc xếp thứ tự cho LLM, nên khả thi E1 là UNKNOWN cho đến spike RG-01.',
      f"- **Biến thể Plan A** (bám prototype): {PC['alite_plana_count']} module, có gói AI. Khả thi hơn về hành vi vì prototype đã chạy, nhưng gánh nặng an toàn và chi phí thay đổi cao hơn.",
      '', '## 6. Rủi ro lớn về chi phí triển khai', '',
      '- CU-01: thuật toán xếp lịch;',
      '- CU-02: chuyên gia duyệt nội dung (với workflow có AI);',
      '- CU-03: chọn model tiếng Việt;',
      '- CU-04: thông báo trên Android;',
      '- CU-05: pháp lý.',
      '', '## 7. Cần kiểm chứng bằng nghiên cứu người dùng', '',
      '- CA-01: trẻ tự dùng app;',
      '- CA-02: phụ huynh bớt phải nhắc;',
      '- CA-04: kênh phản hồi mệt không gây áp lực;',
      '- giá trị thật của preset và Standard Bar.',
      '', 'Theo Scenario Management Rules §5.7, **agent không thể thay thế bước kiểm chứng giá trị với người dùng thật**.',
      '', '## 8. Có đủ để sang Adversarial MVP Review chưa?', '',
      '**Đủ, nếu kèm điều kiện.**',
      '- Có baseline đóng băng, sổ thay đổi, ma trận độ phủ, ma trận phụ thuộc v2 và phân tích độ nhạy.',
      '- Review đó **nên do một reviewer khác thực hiện**, không phải Claude của phiên này. Lúc đó cần commit hoặc gửi kèm `phase-3-scoring-review/` và `phase-3-scoring-audit/`.',
      '', '**Độ tin cậy:** MEDIUM cho các phát hiện về cấu trúc; HYPOTHESIS cho giá trị. **Cần Owner duyệt:** có (file 07, 08).']
W('06_MVP_Readiness_Summary.md', L)
print('01, 06, 07, 08 written')
