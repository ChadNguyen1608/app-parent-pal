"""Final consistency checks for the audit package."""
import json, os, re, glob, subprocess, sys
R = os.path.join(os.path.dirname(__file__), '..'); D = os.path.join(R, 'data')
inv = {r['module_id'] for r in json.load(open(os.path.join(R, 'baseline_v1', 'inventory_106.json'))) } if os.path.exists(os.path.join(R, 'baseline_v1', 'inventory_106.json')) else None
if inv is None:
    inv = {r['module_id'] for r in json.load(open(os.path.join(R, 'baseline_v1', 'assessment.json')))}
PA = json.load(open(os.path.join(D, 'phase_a.json'))); PB = json.load(open(os.path.join(D, 'phase_b.json'))); PC = json.load(open(os.path.join(D, 'phase_c.json')))
docs = {os.path.basename(f): open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(R, '0*.md')))}
ck = []
def c(n, ok, d=''): ck.append(dict(check=n, result='PASS' if ok else 'FAIL', detail=d))
r = subprocess.run(['sha256sum', '-c', '--quiet', 'SHA256SUMS'], cwd=os.path.join(R, 'baseline_v1'), capture_output=True, text=True)
c('baseline_v1 unchanged (sha256)', r.returncode == 0, r.stdout + r.stderr)
c('8 deliverables exist', len(docs) == 8, ','.join(docs))
c('106 modules classified in Phase A', len(PA['rows']) == 106 and {x['module_id'] for x in PA['rows']} == inv)
c('40 COARSE manually reviewed', sum(1 for x in PA['rows'] if x['level'] == 'COARSE' and x['basis'] != 'AUTOMATED') == 40)
c('95 baseline edges preserved', sum(1 for e in PB['edges_v2'] if e['edge_id'].startswith('E')) == 95)
ids_in_docs = set(re.findall(r'F0\d-G\d\d-M\d\d', ' '.join(docs.values())))
c('no invented Feature IDs in reports', ids_in_docs <= inv, str(sorted(ids_in_docs - inv)))
c('no hard gate marked PASS in proposals', not re.search(r'G-(Legal|Privacy|Safety|Feasibility)[^|\n]{0,20}-> ?PASS', ' '.join(docs.values())))
c('every report states sources/confidence/approval', all(('Nguồn' in t or 'nguồn' in t) and ('tin cậy' in t or 'Tin cậy' in t) and ('Owner' in t) for t in docs.values()))
c('MVP not selected', not re.search(r'(?<!không phải )(MVP (đã|được) chọn|chọn MVP là)', ' '.join(docs.values())))
c('A-lite v2 count consistent', str(PC['alite_v2_count']) in docs['03_A_Lite_Workflow_Validation.md'] and str(PC['alite_v2_count']) in docs['06_MVP_Readiness_Summary.md'])
c('original and proposed scores both shown', 'Điểm gốc (baseline_v1)' in docs['01_Scoring_Quality_Audit.md'])
c('no secrets/emails', not re.search(r'sk-ant|@gmail|BEGIN PRIVATE', ' '.join(docs.values())))
json.dump(ck, open(os.path.join(D, 'quality_gate.json'), 'w'), ensure_ascii=False, indent=1)
for x in ck: print(x['result'], x['check'], x['detail'][:100] if x['result'] == 'FAIL' else '')
sys.exit(0 if all(x['result'] == 'PASS' for x in ck) else 1)
