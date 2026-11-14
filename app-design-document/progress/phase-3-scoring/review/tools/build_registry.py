"""CP-04: merge Tier-1 + Tier-3 into the single source of truth data/assessment.json, validate, compare with blind QA."""
import json, os, sys, collections
sys.path.insert(0, os.path.dirname(__file__))
from tier3_data import T3
D = os.path.join(os.path.dirname(__file__), '..', 'data')
T1 = json.load(open(os.path.join(D, 'tier1_106.json')))
G = json.load(open(os.path.join(D, 'graph_results.json')))
errs, warns = [], []
COH = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5']
VAL = {1, 2, 3, 4, 5, 'I', 'N', 'U'}
LBL = {'I': 'INDIRECT', 'N': 'NOT_APPLICABLE', 'U': 'UNKNOWN'}
lab = lambda x: LBL.get(x, x)
tier3 = set(G['tier3'])
if set(T3) != tier3:
    errs.append(f'Tier-3 mismatch: missing {sorted(tier3 - set(T3))}, extra {sorted(set(T3) - tier3)}')
out = []
for r in T1:
    mid = r['module_id']; rec = dict(r)
    wf_member = [k for k, w in G['workflows'].items() if mid in w['required']]
    wf_opt = [k for k, w in G['workflows'].items() if mid in w['optional']]
    rec['workflows_required'] = wf_member; rec['workflows_optional'] = wf_opt
    rec['hard_fan_in_tier3'] = G['hard_fan_in_tier3'].get(mid, 0)
    if mid in T3:
        t = T3[mid]; rec['assessment_level'] = 'FULL'
        v = t['v']
        for x in v:
            if x not in VAL: errs.append(f'{mid} bad value {x}')
        if len(t['vr']) != 4 or any(not s for s in t['vr']): errs.append(f'{mid} value reasons incomplete')
        rec['value'] = {k: dict(score=lab(v[i]), reason=t['vr'][i], label='EXPERT_HYPOTHESIS')
                        for i, k in enumerate(['core_loop_contribution', 'adoption_potential', 'differentiation', 'dependency_enablement'])}
        c = t['c']
        if not (all(isinstance(c[i], int) and 1 <= c[i] <= 5 for i in (0, 1, 5)) and all(c[i] in ('L', 'M', 'H') for i in (2, 3, 4, 6, 7))):
            errs.append(f'{mid} bad delivery {c}')
        if not t.get('cr'): errs.append(f'{mid} no delivery reason')
        rec['delivery'] = dict(implementation_effort=c[0], maintenance_effort=c[1], operating_cost=c[2], ai_cost_risk=c[3],
                               latency_and_reliability=c[4], implementation_complexity=c[5], scalability=c[6], safety_compliance_overhead=c[7],
                               reason=t['cr'], label='ESTIMATE')
        # AI consistency
        if rec['exec_class'] in ('E0', 'E1') and c[3] == 'H': errs.append(f'{mid} E0/E1 with ai_cost_risk H')
        if rec['exec_class'] == 'E2' and c[3] == 'L': errs.append(f'{mid} E2 with ai_cost_risk L')
        coh = {}
        for cc in COH:
            if cc not in t['coh']: errs.append(f'{mid} missing cohort {cc}'); continue
            val = t['coh'][cc]; app = r['cohorts'][cc]['applicability']
            basis = 'FULL' if cc in ('A2', 'A3') else ('INHERIT_A2_DELTA' if cc == 'A1' else ('INHERIT_A3_DELTA' if cc == 'A4' else 'RELEVANCE'))
            if cc == 'A5':
                av, reason = val
                if av not in VAL: errs.append(f'{mid} A5 bad {av}')
                if app == 'NOT_APPLICABLE' and av != 'N': warns.append(f'{mid} A5 tier1 NA but value {av}')
                coh[cc] = dict(applicability=app, interaction_pattern=r['cohorts'][cc]['interaction_pattern'], adult_user_value=lab(av),
                               parent_value='NOT_APPLICABLE', child_value='NOT_APPLICABLE', reason=reason, basis=basis, evidence_confidence='HYPOTHESIS')
            else:
                pv, cv, reason = val
                if pv not in VAL or cv not in VAL: errs.append(f'{mid} {cc} bad {val}')
                if app == 'NOT_APPLICABLE' and not (pv == 'N' and cv == 'N') and not (pv == 'I' and cv == 'I'):
                    warns.append(f'{mid} {cc} tier1 NA but values {pv},{cv}')
                if not reason: errs.append(f'{mid} {cc} no reason')
                coh[cc] = dict(applicability=app, interaction_pattern=r['cohorts'][cc]['interaction_pattern'], parent_value=lab(pv),
                               child_value=lab(cv), adult_user_value='NOT_APPLICABLE', reason=reason, basis=basis, evidence_confidence='HYPOTHESIS')
        rec['cohort_assessment'] = coh
        rec['e0_e1_alternative'] = t.get('alt', '')
        rec['research_gaps'] = t.get('gaps', '')
        rec['l4_override'] = t.get('l4', '')
        if t.get('conf') == 'LOW_CAPPED': rec['confidence'] = 'LOW_CAPPED_NOT_INDEPENDENTLY_REVIEWED'
        # status
        legal_blocked = r['hard_gates']['G-Legal']['status'] == 'BLOCKED'
        rec['status'] = 'blocked' if legal_blocked else 'scored'
        rec['status_note'] = ('Scored at spec level; real-child-data use BLOCKED by G-Legal.' if legal_blocked else
                              'Scored (EXPERT_HYPOTHESIS); gates UNKNOWN/CONDITIONAL, not PASS.')
    else:
        rec['assessment_level'] = 'COARSE'
        rec['status'] = 'partial'
        rec['status_note'] = 'COARSE only (Tier-1); full scoring not triggered by workflows or re-entry rule.'
    out.append(rec)
ids = [r['module_id'] for r in out]
if len(ids) != 106 or len(set(ids)) != 106: errs.append('census != 106')
json.dump(out, open(os.path.join(D, 'assessment.json'), 'w'), ensure_ascii=False, indent=1)
# ---- QA comparison ----
qa_path = os.path.join(D, '..', 'work', 'qa_agent_scores.json')
qa_cmp = []
if os.path.exists(qa_path):
    qa = json.load(open(qa_path))
    norm = lambda x: x if isinstance(x, int) else str(x).upper()[:3]
    def get(d, *keys):
        for k in keys:
            if isinstance(d, dict) and k in d: d = d[k]
            else: return None
        if isinstance(d, dict): d = d.get('score', d.get('value'))
        return d
    A = {r['module_id']: r for r in out}
    for mid, q in qa.items():
        if mid not in A: continue
        a = A[mid]
        for k in ['core_loop_contribution', 'adoption_potential', 'differentiation', 'dependency_enablement']:
            mine = a['value'][k]['score']; theirs = get(q, k) if get(q, k) is not None else get(q, 'value', k)
            qa_cmp.append(dict(module=mid, key=k, claude=mine, qa=theirs))
        for cc in ('A2', 'A3'):
            for k in ('parent_value', 'child_value'):
                mine = a['cohort_assessment'][cc][k]
                theirs = get(q, cc, k)
                if theirs is None: theirs = get(q, 'cohorts', cc, k)
                qa_cmp.append(dict(module=mid, key=f'{cc}.{k}', claude=mine, qa=theirs))
        for k in ['implementation_effort', 'maintenance_effort', 'operating_cost', 'ai_cost_risk', 'latency_and_reliability', 'implementation_complexity', 'scalability']:
            theirs = get(q, k) if get(q, k) is not None else get(q, 'delivery', k)
            qa_cmp.append(dict(module=mid, key=k, claude=a['delivery'][k], qa=theirs))
    def agree(x, y):
        if isinstance(x, int) and isinstance(y, int): return 'EXACT' if x == y else ('ADJACENT' if abs(x - y) == 1 else 'DIVERGENT')
        sx, sy = str(x).upper(), str(y).upper()
        if sx[:1] == sy[:1]: return 'EXACT'
        if sx in ('L', 'M', 'H') and sy[:1] in ('L', 'M', 'H'):
            return 'ADJACENT' if abs('LMH'.index(sx) - 'LMH'.index(sy[:1])) == 1 else 'DIVERGENT'
        return 'LABEL_MISMATCH'
    for c in qa_cmp: c['agreement'] = agree(c['claude'], c['qa'])
    json.dump(dict(comparisons=qa_cmp, summary=dict(collections.Counter(c['agreement'] for c in qa_cmp)),
                   rubric_ambiguities=qa.get('rubric_ambiguities')), open(os.path.join(D, 'qa_comparison.json'), 'w'), ensure_ascii=False, indent=1)
print('errors', errs); print('warnings', warns)
print('levels', collections.Counter(r['assessment_level'] for r in out), 'status', collections.Counter(r['status'] for r in out))
if qa_cmp: print('QA', collections.Counter(c['agreement'] for c in qa_cmp), 'n', len(qa_cmp))
sys.exit(1 if errs else 0)
