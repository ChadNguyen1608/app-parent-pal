"""CP-06: descriptive statistics per MVP candidate package (no composite score; ordinal levels are counted, never summed)."""
import json, os, collections
D = os.path.join(os.path.dirname(__file__), '..', 'data')
A = {r['module_id']: r for r in json.load(open(os.path.join(D, 'assessment.json')))}
G = json.load(open(os.path.join(D, 'graph_results.json')))
C = json.load(open(os.path.join(D, 'cost_scenarios.json')))
W = G['workflows']
PK = {
 'A': dict(name='Lịch tuần cân bằng cùng con', base='W1', lite='W1E1', cost_key='A (W1, Sonnet schedule)'),
 'B': dict(name='Pal đồng hành phụ huynh', base='W2', cost_key='B (W2, Haiku Pal + recommendation)'),
 'C': dict(name='Vòng đầy đủ có tiếng nói của trẻ (điều kiện)', base='W3', cost_key='C (W1+W3, Sonnet schedule + Haiku Pal)'),
}
out = {}
for k, p in PK.items():
    req = W[p['base']]['required']; opt = W[p['base']]['optional']
    mods = [A[m] for m in req]
    eff = collections.Counter(m['delivery']['implementation_effort'] for m in mods if m.get('delivery'))
    out[k] = dict(name=p['name'], workflow=p['base'], required=len(req), optional=len(opt),
        by_tier=dict(collections.Counter(m['tier'] for m in mods)),
        effort_levels=dict(sorted(eff.items())), complexity_ge4=sorted(m['module_id'] for m in mods if m.get('delivery') and m['delivery']['implementation_complexity'] >= 4),
        safety_overhead_H=len([m for m in mods if m.get('delivery') and m['delivery']['safety_compliance_overhead'] == 'H']),
        e2=W[p['base']]['e2_required'], legal_blocked_modules=W[p['base']]['legal_blocked_required'],
        low_capped=[m['module_id'] for m in mods if m['confidence'].startswith('LOW')],
        ai_cost_vnd_per_hh_month=C['packages'][p['cost_key']],
        coarse_in_required=[m['module_id'] for m in mods if m['assessment_level'] == 'COARSE'])
    if p.get('lite'):
        out[k]['lite_required'] = W[p['lite']]['n_required']; out[k]['lite_legal_blocked'] = W[p['lite']]['legal_blocked_required']
json.dump(out, open(os.path.join(D, 'packages.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in out.items():
    print(k, v['required'], v['by_tier'], 'eff', v['effort_levels'], 'cx>=4', len(v['complexity_ge4']), 'safH', v['safety_overhead_H'], 'blocked', len(v['legal_blocked_modules']), 'lowcap', len(v['low_capped']), 'coarse', v['coarse_in_required'], v.get('lite_required'))
