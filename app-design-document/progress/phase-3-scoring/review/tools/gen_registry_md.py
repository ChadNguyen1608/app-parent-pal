"""Generate 02_L3_106_Assessment_Registry_REVIEW.md from data/assessment.json (single source of truth)."""
import json, os, collections
D = os.path.join(os.path.dirname(__file__), '..', 'data')
A = json.load(open(os.path.join(D, 'assessment.json')))
G = json.load(open(os.path.join(D, 'graph_results.json')))
S = lambda x: {'NOT_APPLICABLE': 'N/A', 'INDIRECT': 'IND', 'UNKNOWN': '?'}.get(str(x), str(x))
GS = lambda r: '/'.join({'UNKNOWN': 'U', 'BLOCKED': 'B', 'CONDITIONAL': 'C', 'PASS': 'P'}[r['hard_gates'][g]['status']] for g in ['G-Legal', 'G-Privacy', 'G-Safety', 'G-Feasibility'])
AP = lambda v: {'APPLICABLE': 'A', 'CONDITIONAL': 'C', 'NOT_APPLICABLE': '—', 'UNKNOWN': '?'}[v]
L = []
c_level = collections.Counter(r['assessment_level'] for r in A); c_status = collections.Counter(r['status'] for r in A)
c_tier = collections.Counter(r['tier'] for r in A); c_dom = collections.Counter(r['domain'] for r in A)
L += ['# 02 — Sổ đánh giá 106 L3 (sinh tự động từ `data/assessment.json`)', '',
      '**Trạng thái:** `REVIEW / RUBRIC R1.1a / EXPERT_HYPOTHESIS / MVP_NOT_DECIDED` · **Người soạn:** AI (Claude), chưa kiểm chứng độc lập · **Nguồn:** HEAD `9043c88`.',
      '', '> Không sửa tay file này. Sửa dữ liệu trong `tools/tier1_data.py`, `tools/tier3_data.py` rồi chạy lại `tools/build_tier1.py`, `tools/graph.py`, `tools/build_registry.py`, `tools/gen_registry_md.py`.', '',
      '## 1. Tổng', '',
      '| Chỉ số | Giá trị |', '|---|---|',
      f'| Số L3 | {len(A)} (F01 {c_dom["F01"]}, F02 {c_dom["F02"]}, F03 {c_dom["F03"]}, F04 {c_dom["F04"]}, F05 {c_dom["F05"]}, F06 {c_dom["F06"]}, F07 {c_dom["F07"]}, F08 {c_dom["F08"]}) |',
      f'| Mức đánh giá | FULL {c_level["FULL"]} · COARSE {c_level["COARSE"]} |',
      f'| Trạng thái | scored {c_status["scored"]} · blocked {c_status["blocked"]} (đã chấm, nhưng dữ liệu thật bị chặn bởi G-Legal) · partial {c_status["partial"]} (chỉ COARSE) |',
      f'| Tier | CORE_VALUE {c_tier["CORE_VALUE"]} · MIN_FOUNDATION {c_tier["MIN_FOUNDATION"]} · ADV_SECURITY_OPS {c_tier["ADV_SECURITY_OPS"]} · DEFERRED {c_tier["DEFERRED"]} |',
      '| Gate PASS | 0 (không gate nào được chấm PASS) |',
      '| Độ tin cậy | HYPOTHESIS cho mọi điểm; 4 module bị giới hạn LOW vì chưa từng được kiểm độc lập |',
      '| mvp_decision | NOT_DECIDED cho cả 106 |', '',
      'Ký hiệu: gate theo thứ tự Legal/Privacy/Safety/Feasibility, với U = UNKNOWN, B = BLOCKED, C = CONDITIONAL. Cohort A0–A5: A = APPLICABLE, C = CONDITIONAL, — = NOT_APPLICABLE. IND = INDIRECT. ? = UNKNOWN.', '',
      '## 2. Bảng tổng 106 L3', '',
      '| L3 | Tên | Tier | Vai trò | Vòng | E | Chi phí | Gate L/P/S/F | A0 A1 A2 A3 A4 A5 | Mức | Trạng thái | Workflow |',
      '|---|---|---|---|---|---|---|---|---|---|---|---|']
for r in A:
    coh = ' '.join(AP(r['cohorts'][c]['applicability']) for c in ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'])
    wf = ','.join(r['workflows_required']) + ((' (+opt ' + ','.join(r['workflows_optional']) + ')') if r['workflows_optional'] else '')
    L.append(f"| `{r['module_id']}` | {r['name']} | {r['tier']} | {r['primary_role']} | {r['core_loop']} | {r['exec_class']} | {r['cost_band']} | {GS(r)} | {coh} | {r['assessment_level']} | {r['status']} | {wf or '—'} |")
L += ['', '## 3. Chấm đầy đủ (Tier-3, 66 module)', '',
      '### 3.1 Value và Delivery theo module', '',
      '| L3 | Loop | Adopt | Diff | Enable | Effort | Maint | OpCost | AI | Latency | Cplx | Scale | Safety | E0/E1 thay thế |',
      '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|']
F = [r for r in A if r['assessment_level'] == 'FULL']
for r in F:
    v = r['value']; d = r['delivery']
    L.append(f"| `{r['module_id']}` | {S(v['core_loop_contribution']['score'])} | {S(v['adoption_potential']['score'])} | {S(v['differentiation']['score'])} | {S(v['dependency_enablement']['score'])} | "
             f"{d['implementation_effort']} | {d['maintenance_effort']} | {d['operating_cost']} | {d['ai_cost_risk']} | {d['latency_and_reliability']} | {d['implementation_complexity']} | {d['scalability']} | {d['safety_compliance_overhead']} | {r['e0_e1_alternative'] or '—'} |")
L += ['', '### 3.2 Giá trị theo cohort (phụ huynh / trẻ; A5 = người dùng trưởng thành)', '',
      '| L3 | A0 | A1 | A2 | A3 | A4 | A5 |', '|---|---|---|---|---|---|---|']
for r in F:
    ca = r['cohort_assessment']
    cell = lambda c: (S(ca[c]['adult_user_value']) if c == 'A5' else f"{S(ca[c]['parent_value'])} / {S(ca[c]['child_value'])}")
    L.append(f"| `{r['module_id']}` | " + ' | '.join(cell(c) for c in ['A0', 'A1', 'A2', 'A3', 'A4', 'A5']) + ' |')
L += ['', 'A2, A3 đánh giá đầy đủ. A1 kế thừa A2 và A4 kế thừa A3, có ghi phần khác biệt. A0, A5 chỉ đánh giá khi liên quan. Lý do từng ô nằm trong `data/assessment.json` → `cohort_assessment.*.reason`.', '',
      '### 3.3 Lý do chấm, giả định và khoảng trống nghiên cứu', '']
for r in F:
    v = r['value']; d = r['delivery']
    L.append(f"**`{r['module_id']}` {r['name']}** · {r['tier']} · {r['exec_class']}{(' · ' + r['l4_override']) if r['l4_override'] else ''} · confidence `{r['confidence']}` · status `{r['status']}`  ")
    L.append(f"Value: loop {S(v['core_loop_contribution']['score'])} ({v['core_loop_contribution']['reason']}); adopt {S(v['adoption_potential']['score'])} ({v['adoption_potential']['reason']}); "
             f"diff {S(v['differentiation']['score'])} ({v['differentiation']['reason']}); enable {S(v['dependency_enablement']['score'])} ({v['dependency_enablement']['reason']}).  ")
    L.append(f"Delivery: {d['reason']} · Ghi chú tier: {r['note']} · Research: {r['research_gaps'] or '—'}")
    L.append('')
L += ['## 4. Module chỉ chấm thô (COARSE, 40 module)', '', '| L3 | Tên | Tier | Lý do / cách đơn giản hóa |', '|---|---|---|---|']
for r in A:
    if r['assessment_level'] == 'COARSE':
        L.append(f"| `{r['module_id']}` | {r['name']} | {r['tier']} | {r['note']} |")
L += ['', '## 5. Lý do gate và cohort', '',
      'Lý do của từng gate (`hard_gates.*.reason`) và từng ô áp dụng cohort (`cohorts.*.reason`) nằm trong `data/assessment.json`. Quy tắc sinh: `01_Method_Rubric_and_Calibration_REVIEW.md` §4. Các module có G-Legal = BLOCKED:', '']
for r in A:
    if r['hard_gates']['G-Legal']['status'] == 'BLOCKED':
        L.append(f"- `{r['module_id']}` {r['name']}: {r['hard_gates']['G-Legal']['reason']}")
open(os.path.join(D, '..', '02_L3_106_Assessment_Registry_REVIEW.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('lines', len(L))
