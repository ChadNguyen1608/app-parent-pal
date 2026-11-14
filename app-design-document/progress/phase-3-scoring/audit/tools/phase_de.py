"""Phase D (delivery economics: Build / Run / Change kept separate) and Phase E (sensitivity) — SELF_AUDIT.
Band rules are documented mappings from baseline 3.3 keys; they are NOT an aggregation and produce no single score.
"""
import json, os, collections
B = os.path.join(os.path.dirname(__file__), '..', 'baseline_v1')
D = os.path.join(os.path.dirname(__file__), '..', 'data')
A = {r['module_id']: r for r in json.load(open(os.path.join(B, 'assessment.json')))}
G = json.load(open(os.path.join(B, 'graph_results.json')))
COST = json.load(open(os.path.join(B, 'cost_scenarios.json')))
PB = json.load(open(os.path.join(D, 'phase_b.json')))
PC = json.load(open(os.path.join(D, 'phase_c.json')))
PA = {r['module_id']: r for r in json.load(open(os.path.join(D, 'phase_a.json')))['rows']}
LV = {'L': 0, 'M': 1, 'H': 2}; BAND = ['L', 'M', 'H']
CONTENT_EVAL = {'F07-G01-M01': 'approved content upkeep + expert review', 'F07-G04-M02': 'Vietnamese eval suite upkeep', 'F05-G01-M01': 'prompts/evals/model migration',
                'F07-G04-M01': 'scope allowlist/threshold upkeep', 'F05-G01-M02': 'safety rules + static content', 'F07-G05-M01': 'safety rules + static content',
                'F03-G05-M01': 'retrieval/prompt/eval upkeep', 'F04-G02-M03': 'sourced thresholds + Standard Bar policy', 'F03-G03-M01': 'age tables'}
HUMAN_OPS = {'F07-G02-M01': 'expert editorial review', 'F07-G01-M01': 'content approval', 'F01-G06-M01': 'manual deletion runbook (pilot)', 'F07-G06-M02': 'manual purge runbook (pilot)'}
LEGAL_DEP = {'F01-G04-M02', 'F07-G06-M01', 'F01-G06-M01', 'F07-G06-M02', 'F05-G06-M02', 'F01-G04-M01'}
MIN = set(PB['mincap'])


def bands(r, minimal_view=False):
    d = r['delivery']; mid = r['module_id']
    b = 2 if (d['implementation_effort'] >= 4 or d['implementation_complexity'] >= 4) else (1 if (d['implementation_effort'] == 3 or d['implementation_complexity'] == 3 or d['safety_compliance_overhead'] == 'H') else 0)
    if minimal_view and mid in MIN and b > 0: b -= 1
    ai = d['ai_cost_risk']
    if mid == 'F04-G02-M01' and minimal_view: ai = 'L'  # Phase A REVIEW: E1 default
    run = 2 if ai == 'H' else (1 if (d['operating_cost'] == 'H' or ai == 'M' or d['scalability'] == 'H' or mid in HUMAN_OPS) else 0)
    ch = 2 if (d['maintenance_effort'] >= 4 or mid in ('F05-G01-M01', 'F07-G01-M01', 'F07-G04-M02')) else (1 if (d['maintenance_effort'] == 3 or r['hard_fan_in_tier3'] >= 4 or mid in LEGAL_DEP or mid in CONTENT_EVAL) else 0)
    drivers = dict(build=f"effort {d['implementation_effort']}, complexity {d['implementation_complexity']}, safety {d['safety_compliance_overhead']}" + (' (minimal capability -1)' if minimal_view and mid in MIN else ''),
                   run=f"ai {ai}, op {d['operating_cost']}, scale {d['scalability']}" + (f"; human ops: {HUMAN_OPS[mid]}" if mid in HUMAN_OPS else ''),
                   change=f"maint {d['maintenance_effort']}, fan-in {r['hard_fan_in_tier3']}" + (f"; {CONTENT_EVAL[mid]}" if mid in CONTENT_EVAL else '') + ('; legal-text dependent' if mid in LEGAL_DEP else ''))
    return BAND[b], BAND[run], BAND[ch], drivers


F = {m: r for m, r in A.items() if r['assessment_level'] == 'FULL'}
matrix = []
for m, r in F.items():
    b, ru, c, dr = bands(r); b2, ru2, c2, dr2 = bands(r, True)
    matrix.append(dict(module_id=m, name=r['name'], tier=r['tier'], exec=r['exec_class'], build=b, run=ru, change=c,
                       build_minimal=b2, run_minimal=ru2, change_minimal=c2, drivers=dr, drivers_minimal=dr2, in_alite_v2=m in PC['alite_v2']))
M = {x['module_id']: x for x in matrix}
WF = {'A-lite v1 (W1E1)': PC['alite_v1'], 'A-lite v2 (corrected)': PC['alite_v2'], 'W1 (E2 schedule)': G['workflows']['W1']['required'],
      'W2 (parent Pal)': G['workflows']['W2']['required'], 'W3 (child voice)': G['workflows']['W3']['required']}
wcmp = {}
for k, mods in WF.items():
    mv = k.startswith('A-lite v2')
    rows = [M[m] for m in mods if m in M]
    key = (lambda x: (x['build_minimal'], x['run_minimal'], x['change_minimal'])) if mv else (lambda x: (x['build'], x['run'], x['change']))
    bc = collections.Counter(key(x)[0] for x in rows); rc = collections.Counter(key(x)[1] for x in rows); cc = collections.Counter(key(x)[2] for x in rows)
    wcmp[k] = dict(modules=len(mods), build=dict(bc), run=dict(rc), change=dict(cc),
                   build_H=[x['module_id'] for x in rows if key(x)[0] == 'H'], change_H=[x['module_id'] for x in rows if key(x)[2] == 'H'])
ai_run = {'A-lite v1 (W1E1)': 0, 'A-lite v2 (corrected)': 0,
          'W1 (E2 schedule)': [r['vnd_per_hh_month'] for r in COST['rows'] if r['scenario'] == 'Base' and r['action'].startswith('F04-G02-M01 schedule draft (Sonnet)')][0],
          'W2 (parent Pal)': COST['packages']['B (W2, Haiku Pal + recommendation)']['Base']['vnd_per_hh_month'],
          'W3 (child voice)': COST['packages']['C (W1+W3, Sonnet schedule + Haiku Pal)']['Base']['vnd_per_hh_month']}
for k in wcmp: wcmp[k]['ai_vnd_per_hh_month_base_ASSUMPTION'] = ai_run[k]

# ---------------- Phase E ----------------
adj = collections.defaultdict(set)
for e in PB['edges_v2']:
    if e['v2_action'] != 'REVERSE' and e['criticality'] == 'HARD': adj[e['source']].add(e['target'])
AUTHZ = {'F01-G01-M01', 'F01-G01-M02', 'F01-G04-M01', 'F07-G06-M01'}; CHILD = {'F01-G02-M01', 'F01-G03-M01', 'F01-G04-M02', 'F01-G05-M01'}
FOUND = {'F01-G01-M01', 'F01-G01-M02', 'F01-G04-M01', 'F07-G06-M01', 'F01-G02-M01', 'F01-G03-M01', 'F01-G04-M02', 'F01-G05-M01', 'F01-G06-M01', 'F07-G06-M02'}
AIG = {'F07-G03-M01', 'F07-G03-M02', 'F07-G04-M01', 'F07-G05-M01', 'F07-G04-M02'}
def closure(m, ai=True):
    full = collections.defaultdict(set, {k: set(v) for k, v in adj.items()})
    for x, r in A.items():
        if r['data_class'] != 'NONE': full[x] |= AUTHZ - {x}
        if r['data_class'] in ('CHILD', 'JOURNAL'): full[x] |= CHILD - {x}
        if ai and r['exec_class'] in ('E2', 'E3'): full[x] |= AIG - {x}
    seen, st = set(), [m]
    while st:
        y = st.pop()
        if y in seen: continue
        seen.add(y); st.extend(full[y])
    return len(seen - FOUND)  # incremental scope beyond the shared identity/authorization/lifecycle foundation
def maxval(r):
    v = [r['cohort_assessment'][c][k] for c in ('A2', 'A3') for k in ('parent_value', 'child_value')]
    return max([x for x in v if isinstance(x, int)] or [0])
num = lambda x: x if isinstance(x, int) else 0
cand = [r for r in F.values() if r['tier'] != 'MIN_FOUNDATION' and r['hard_gates']['G-Legal']['status'] != 'BLOCKED']
GATE_HELD = sorted(r['module_id'] for r in F.values() if r['tier'] != 'MIN_FOUNDATION' and r['hard_gates']['G-Legal']['status'] == 'BLOCKED')
def rank(keyf): return [r['module_id'] for r in sorted(cand, key=keyf)]
def scen(corrected):
    def bm(r): return bands(r, corrected)
    LO = {'F02-G05-M02': 2} if corrected else {}
    val = rank(lambda r: (-maxval(r), -LO.get(r['module_id'], num(r['value']['core_loop_contribution']['score'])), -num(r['value']['adoption_potential']['score']), r['module_id']))
    cost = rank(lambda r: (LV[bm(r)[0]], LV[bm(r)[1]], LV[bm(r)[2]], -maxval(r), r['module_id']))
    dep = rank(lambda r: (closure(r['module_id'], ai=not (corrected and r['module_id'] == 'F04-G02-M01')), -maxval(r), r['module_id']))
    return dict(value_oriented=val, cost_constrained=cost, dependency_constrained=dep)
TOP = 15
out_s = {}
for label, corr in (('baseline_v1', False), ('with_phase_A_corrections', True)):
    s = scen(corr); top = {k: set(v[:TOP]) for k, v in s.items()}
    stab = {}
    for r in cand:
        n = sum(r['module_id'] in t for t in top.values())
        stab[r['module_id']] = {3: 'STABLE_HIGH', 2: 'MODERATE', 1: 'VOLATILE', 0: 'STABLE_LOW'}[n]
    out_s[label] = dict(rankings=s, top=TOP, stability=stab, counts=dict(collections.Counter(stab.values())))
moved = {m: (out_s['baseline_v1']['stability'][m], out_s['with_phase_A_corrections']['stability'][m]) for m in out_s['baseline_v1']['stability']
         if out_s['baseline_v1']['stability'][m] != out_s['with_phase_A_corrections']['stability'][m]}
WF_FEAS = {
 'A-lite v2 (corrected)': dict(value_oriented='FEASIBLE', cost_constrained='FEASIBLE (0 AI run cost)', dependency_constrained='FEASIBLE (29 modules, 12 minimal, no AI gate)', blocker='H4/lawful basis before real data'),
 'W1 (E2 schedule)': dict(value_oriented='FEASIBLE', cost_constrained='FEASIBLE with Haiku; sensitive to model choice', dependency_constrained='CONDITIONAL (+AI gate, static catalog, eval)', blocker='H4; OD-05; MR-023/026'),
 'W2 (parent Pal)': dict(value_oriented='CONDITIONAL (approved KB needed)', cost_constrained='FEASIBLE with Haiku; H if Sonnet', dependency_constrained='NOT_FEASIBLE now (0 approved knowledge items)', blocker='KB review, GAP-16 ownership, H4'),
 'W3 (child voice)': dict(value_oriented='CONDITIONAL', cost_constrained='MODERATE', dependency_constrained='NOT_FEASIBLE (9 legally blocked modules)', blocker='FR-03, H4, PIA'),
}
json.dump(dict(gate_held_out_of_ranking=GATE_HELD, ranked_pool=len(cand), delivery_matrix=matrix, workflow_comparison=wcmp, sensitivity=out_s, moved_by_corrections=moved, workflow_feasibility=WF_FEAS,
               band_rules=dict(build='H if effort>=4 or complexity>=4; M if effort=3 or complexity=3 or safety overhead H; else L; minimal-capability view lowers one level for MINIMAL targets',
                               run='H if ai_cost_risk H; M if operating_cost H or ai M or scalability H or human ops; else L',
                               change='H if maintenance>=4 or content/eval-bound core (F05-G01-M01, F07-G01-M01, F07-G04-M02); M if maintenance 3 or hard fan-in>=4 or content/eval/legal dependent; else L')),
          open(os.path.join(D, 'phase_de.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in wcmp.items(): print(k, v['modules'], 'B', v['build'], 'R', v['run'], 'C', v['change'], 'AI', v['ai_vnd_per_hh_month_base_ASSUMPTION'])
for k, v in out_s.items(): print(k, v['counts']); print('  STABLE_HIGH', [m for m, s in v['stability'].items() if s == 'STABLE_HIGH'])
print('moved', moved)
