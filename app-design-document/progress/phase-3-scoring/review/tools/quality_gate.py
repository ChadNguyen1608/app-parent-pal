"""Final quality gate: reconcile Markdown reports with data, check integrity rules."""
import json, os, re, glob, collections, sys
R = os.path.join(os.path.dirname(__file__), '..')
D = os.path.join(R, 'data')
A = json.load(open(os.path.join(D, 'assessment.json')))
P = json.load(open(os.path.join(D, 'packages.json')))
C = json.load(open(os.path.join(D, 'cost_scenarios.json')))
G = json.load(open(os.path.join(D, 'graph_results.json')))
docs = {os.path.basename(f): open(f, encoding='utf-8').read() for f in glob.glob(os.path.join(R, '*.md'))}
checks = []
def ck(name, ok, detail=''): checks.append(dict(check=name, result='PASS' if ok else 'FAIL', detail=detail))
ids = [r['module_id'] for r in A]
ck('106 unique L3', len(ids) == 106 and len(set(ids)) == 106)
inv = {r['module_id'] for r in json.load(open(os.path.join(D, 'inventory_106.json')))}
ck('no invented/omitted IDs vs inventory', set(ids) == inv)
ck('all 8 domains present', {r['domain'] for r in A} == {f'F0{i}' for i in range(1, 9)})
ck('no gate PASS anywhere', all(v['status'] != 'PASS' for r in A for v in r['hard_gates'].values()))
ck('mvp_decision NOT_DECIDED everywhere', all(r['mvp_decision'] == 'NOT_DECIDED' for r in A))
ck('six cohort records per module', all(set(r['cohorts']) == {'A0', 'A1', 'A2', 'A3', 'A4', 'A5'} for r in A))
ck('every NOT_APPLICABLE cohort has reason', all(v['reason'] for r in A for v in r['cohorts'].values() if v['applicability'] == 'NOT_APPLICABLE'))
F = [r for r in A if r['assessment_level'] == 'FULL']
ck('FULL records have value+delivery reasons', all(all(x['reason'] for x in r['value'].values()) and r['delivery']['reason'] for r in F))
ck('FULL cohort reasons present', all(all(v['reason'] for v in r['cohort_assessment'].values()) for r in F))
ck('no composite score field', not any(k in r for r in A for k in ('total_score', 'composite', 'rank')))
ck('blocked modules not marked released', all(r.get('delivery_status', 'NOT_PLANNED') == 'NOT_PLANNED' for r in A))
ck('estimates labelled (delivery label ESTIMATE)', all(r['delivery']['label'] == 'ESTIMATE' for r in F))
cnt = collections.Counter(r['assessment_level'] for r in A); st = collections.Counter(r['status'] for r in A)
reg = docs['02_L3_106_Assessment_Registry_REVIEW.md']
ck('registry counts match data', f"FULL {cnt['FULL']} · COARSE {cnt['COARSE']}" in reg and f"scored {st['scored']}" in reg and f"blocked {st['blocked']}" in reg)
ck('registry has 106+66+66+40 rows', len(re.findall(r'^\| `F\d{2}-G\d{2}-M\d{2}`', reg, re.M)) == 106 + 66 + 66 + cnt['COARSE'])
m05 = docs['05_MVP_Candidates_and_Recommendation_REVIEW.md']
ck('package sizes in 05 match data', all(f"**{P[k]['required']}**" in m05 for k in 'ABC') and f"**{P['A']['lite_required']}**" in m05)
ck('package tier splits in 05 match', all(f"{P[k]['by_tier'].get('CORE_VALUE',0)} CORE_VALUE + {P[k]['by_tier'].get('MIN_FOUNDATION',0)} MIN_FOUNDATION" in m05 for k in 'ABC'))
fmt = lambda n: f"{n:,}".replace(',', '.')
c04 = docs['04_Cost_Gaps_and_Sensitivity_REVIEW.md']
base_vals = [fmt(r['vnd_per_hh_month']) for r in C['rows'] if r['scenario'] == 'Base']
ck('cost table values in 04 match data', all(v in c04 for v in base_vals), str(base_vals))
pk = [fmt(v['Base']['vnd_per_hh_month']) for v in C['packages'].values() if v['Base']['vnd_per_hh_month']]
ck('package cost values in 04 match data', all(v in c04 for v in pk))
ck('tier3 count consistent', G['tier3_count'] == cnt['FULL'] == 66)
ck('no build-time cycles', G['build_cycles'] == [])
deps = json.load(open(os.path.join(D, 'dependencies.json')))
ck('every HARD edge has reason', all(e['reason'] for e in deps if e['criticality'] == 'HARD'))
ck('all edges CANDIDATE (none falsely CONFIRMED)', all(e['verification'] == 'CANDIDATE' for e in deps))
allt = '\n'.join(docs.values()) + json.dumps(A, ensure_ascii=False)
ck('no secrets/emails in outputs', not re.search(r'sk-ant|@gmail|BEGIN PRIVATE|SUPABASE_SERVICE', allt))
ck('no claim of legal compliance', not re.search(r'tuân thủ pháp luật đã|legal(ly)? compliant|đã đạt pháp lý', allt, re.I))
ck('no claim of independent L4 regression', not re.search(r'đã (chạy|thực hiện) (review|kiểm) hồi quy', allt))
json.dump(checks, open(os.path.join(D, 'quality_gate_results.json'), 'w'), ensure_ascii=False, indent=1)
for c in checks: print(c['result'], c['check'], c['detail'][:80] if c['result'] == 'FAIL' else '')
sys.exit(0 if all(c['result'] == 'PASS' for c in checks) else 1)
