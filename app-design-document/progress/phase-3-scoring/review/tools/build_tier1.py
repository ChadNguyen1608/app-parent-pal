"""CP-02: build Tier-1 coarse records for all 106 L3 with deterministic gate and cohort rules."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from tier1_data import T1
D = os.path.join(os.path.dirname(__file__), '..', 'data')
inv = {r['module_id']: r for r in json.load(open(os.path.join(D, 'inventory_106.json')))}

# --- prelim triage source links (L4 reference) ---
tri = open(os.path.join(D, '..', '..', 'Feature_3_3_106_L3_Preliminary_Value_Cost_Triage_REVIEW.md'), encoding='utf-8').read()
l4ref = {m: s for m, s in re.findall(r'^\| `(F\d{2}-G\d{2}-M\d{2})` \|.*\[source\]\(([^)]+)\)', tri, re.M)}
prelim_role = {m: r for m, r in re.findall(r'^\| `(F\d{2}-G\d{2}-M\d{2})` \| [^|]+\| ([^|]+?) \|', tri, re.M)}

H4 = {'F01-G06-M01', 'F05-G06-M02', 'F07-G06-M02'}
FR03 = {'F05-G01-M01', 'F05-G01-M02', 'F07-G05-M01'}
NOT_INDEP = {'F01-G04-M01', 'F01-G04-M02', 'F01-G05-M01', 'F07-G06-M01'}
AI_CHILD_FACING = {'F05-G01-M01', 'F05-G01-M02', 'F07-G05-M01', 'F03-G05-M01', 'F04-G02-M01', 'F06-G04-M02',
                   'F05-G05-M01', 'F07-G03-M03', 'F03-G05-M03', 'F06-G07-M01'}
FEAS_EVIDENCE = {'F04-G07-M01': 'Plan A device log 2026-11-05: local reminder +45s (threshold <1 min), exact-alarm permission added, re-measure pending',
                 'F04-G05-M02': 'Plan A device log 2026-11-05: photo capture PASS',
                 'F04-G02-M01': 'prototype/index.html implements Pal schedule drafting (no recorded user test results)',
                 'F04-G02-M03': 'prototype checkDayK/judge implements balance checks (no recorded test results)',
                 'F04-G04-M01': 'prototype "Của con" tab implements daily blocks (no recorded test results)'}
UXMAP = {'P': ('APPLICABLE', 'caregiver_only'), 'P*': ('CONDITIONAL', 'caregiver_only'), 'S': ('APPLICABLE', 'child_supervised'),
         'S*': ('CONDITIONAL', 'child_supervised'), 'C': ('APPLICABLE', 'child_active'), 'Y': ('APPLICABLE', 'youth_active'),
         'U': ('APPLICABLE', 'independent_adult'), '—': ('NOT_APPLICABLE', 'none'), 'P/S*': ('CONDITIONAL', 'caregiver_or_supervised'),
         'S/Y*': ('CONDITIONAL', 'supervised_or_youth')}
COH = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5']


def gates(mid, data, tier):
    g = {}
    if mid in H4:
        g['G-Legal'] = ('BLOCKED', 'H4: verified deletion deadlines unresolved; 60-day baseline cannot be production default (Remediation Register status discipline). Synthetic data only.')
    elif mid in FR03:
        g['G-Legal'] = ('BLOCKED', 'FR-03: lawful basis to process child request when UNKNOWN is open; release blocker for real child processing.')
    elif data == 'JOURNAL':
        g['G-Legal'] = ('BLOCKED', 'Journal data subject to H4 deletion-deadline blocker (MR-018); synthetic data only.')
    elif data == 'NONE':
        g['G-Legal'] = ('UNKNOWN', 'No personal data expected; low legal exposure but no internal legal confirmation (PASS requires evidence).')
    else:
        g['G-Legal'] = ('UNKNOWN', 'Personal/child data; lawful basis UNKNOWN (MR-016) -> real child data denied by approved policy.')
    g['G-Privacy'] = ('UNKNOWN', {'NONE': 'Low exposure (no personal data).', 'PERSONAL': 'Adult personal data; PIA not done (MR-021).',
                                  'CHILD': 'Child personal data; PIA not done (MR-021).', 'JOURNAL': 'Highest exposure: private Journal (MR-018..020).'}[data])
    if mid in AI_CHILD_FACING:
        g['G-Safety'] = ('CONDITIONAL', 'Conditions: OD-05 approved-scope evidence + output validation; OD-03 reviewed static content (111/113/115 verified); Vietnamese AI safety eval (MR-023). Owner of conditions: Product Owner + child-safety expert (unassigned).')
    elif mid == 'F07-G05-M02':
        g['G-Safety'] = ('UNKNOWN', 'Deferred by Owner; not a failed obligation and no auto-contact substitute.')
    elif data in ('CHILD', 'JOURNAL'):
        g['G-Safety'] = ('UNKNOWN', 'Child-facing or child data; safety review per MR-022/024 not done.' if data == 'JOURNAL' else 'Child data; no specific safety review yet.')
    else:
        g['G-Safety'] = ('UNKNOWN', 'Low safety exposure; not reviewed.')
    if mid in FEAS_EVIDENCE:
        g['G-Feasibility'] = ('CONDITIONAL', 'Partial technical evidence: ' + FEAS_EVIDENCE[mid] + '. Condition: rebuild/measure in Plan A/B stack.')
    elif mid in ('F08-G01-M01', 'F08-G04-M02'):
        g['G-Feasibility'] = ('UNKNOWN', 'No partner/API identified (MR-033).')
    else:
        g['G-Feasibility'] = ('UNKNOWN', 'No implementation evidence yet.')
    return g


def cohorts(mid, ux, over):
    ov = {}
    for part in filter(None, over.split(';')):
        c, a, r = part.split(':', 2)
        ov[c] = ({'NA': 'NOT_APPLICABLE', 'C': 'CONDITIONAL', 'A': 'APPLICABLE'}[a], r)
    out = {}
    for i, c in enumerate(COH):
        app, pat = UXMAP.get(ux[i], ('UNKNOWN', 'unknown'))
        reason = f'3.2 group UX "{ux[i]}" -> {pat}'
        if c in ov:
            app, reason = ov[c][0], ov[c][1]
            if app == 'NOT_APPLICABLE':
                pat = 'none'
        if app == 'NOT_APPLICABLE' and c not in ov:
            reason = '3.2 group UX "—": no direct use in this cohort'
        out[c] = dict(applicability=app, interaction_pattern=pat, reason=reason)
    return out


recs, errs = [], []
for mid in sorted(inv):
    if mid not in T1:
        errs.append('missing ' + mid); continue
    tier, role, loop, ex, exnote, cost, data, over, note = T1[mid]
    r = inv[mid]
    rec = dict(module_id=mid, name=r['name'], domain=r['domain'], group=r['group'], group_name=r['group_name'],
               tier=tier, primary_role=role, prelim_role=prelim_role.get(mid, '').strip(), core_loop=loop,
               exec_class=ex, exec_32=r['exec_32'], exec_note=exnote, ai_cost_32=r['ai_cost_32'], cost_band=cost,
               data_class=data, hard_gates={k: dict(status=v[0], reason=v[1]) for k, v in gates(mid, data, tier).items()},
               cohorts=cohorts(mid, r['ux_32'], over), l4_ref=l4ref.get(mid), note=note,
               confidence=('LOW_CAPPED_NOT_INDEPENDENTLY_REVIEWED' if mid in NOT_INDEP else 'HYPOTHESIS'),
               spec_status='AUTHOR_REMEDIATED_NOT_INDEPENDENTLY_VERIFIED', assessment_level='COARSE',
               evidence_label='EXPERT_HYPOTHESIS', mvp_decision='NOT_DECIDED')
    recs.append(rec)
extra = set(T1) - set(inv)
if extra: errs.append('invented ids ' + str(extra))
for r in recs:
    if r['tier'] not in ('CORE_VALUE', 'MIN_FOUNDATION', 'ADV_SECURITY_OPS', 'DEFERRED'): errs.append('bad tier ' + r['module_id'])
    if r['exec_class'] not in ('E0', 'E1', 'E2', 'E3'): errs.append('bad exec ' + r['module_id'])
    if r['cost_band'] not in 'LMH': errs.append('bad cost ' + r['module_id'])
    if not r['l4_ref']: errs.append('no l4 ref ' + r['module_id'])
    for c, v in r['cohorts'].items():
        if v['applicability'] == 'NOT_APPLICABLE' and not v['reason']: errs.append('NA without reason ' + r['module_id'] + c)
json.dump(recs, open(os.path.join(D, 'tier1_106.json'), 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print('records', len(recs), 'errors', errs)
print('tiers', Counter(r['tier'] for r in recs))
print('exec', Counter(r['exec_class'] for r in recs), 'overrides', sum(1 for r in recs if r['exec_note']))
print('gates', {g: Counter(r['hard_gates'][g]['status'] for r in recs) for g in ['G-Legal', 'G-Privacy', 'G-Safety', 'G-Feasibility']})
print('NA cohort cells', sum(1 for r in recs for v in r['cohorts'].values() if v['applicability'] == 'NOT_APPLICABLE'))
sys.exit(1 if errs else 0)
