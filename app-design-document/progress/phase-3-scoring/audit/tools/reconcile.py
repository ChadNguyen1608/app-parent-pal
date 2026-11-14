"""Reconcile self-audit with adversarial subagent review; build change register, decisions, research gaps."""
import json, os, collections
R = os.path.join(os.path.dirname(__file__), '..'); D = os.path.join(R, 'data')
advp = os.path.join(R, 'work', 'adversarial_review.json')
ADV = json.load(open(advp)) if os.path.exists(advp) else {}
fv = ADV.get('finding_verdicts', [])
def mod_of(v):
    for k in ('module', 'module_id', 'id', 'finding', 'target'):
        if isinstance(v.get(k), str) and v[k].startswith('F0'): return v[k][:11]
    return ''
verd = []
for v in fv:
    verd.append(dict(module=mod_of(v), verdict=v.get('verdict', '?'), note=(v.get('reason') or v.get('note') or v.get('explanation') or v.get('comment') or '')[:300],
                     source=v.get('source') or v.get('evidence') or ''))
vc = collections.Counter(x['verdict'] for x in verd)
summary = f"{len(verd)} phát hiện được phản biện: " + ', '.join(f'{k} {n}' for k, n in vc.items()) + f"; {len(ADV.get('coverage_verdicts', []))} mục độ phủ; {len(ADV.get('missed', []))} mục bị bỏ sót được nêu" if ADV else 'chưa có'

# Applied reconciliation decisions are recorded in RECON (edited by orchestrator after reading the adversarial file)
import sys; sys.path.insert(0, os.path.dirname(__file__))
from reconcile_decisions import RECON, CORRECTIONS, CHANGES, DECISIONS, GAPS, CONFIRMED
json.dump(dict(summary=summary, finding_verdicts=verd, coverage_verdicts=ADV.get('coverage_verdicts', []), missed=ADV.get('missed', []),
               unsourced_limits=ADV.get('unsourced_limits', []), reconciliation=RECON, score_corrections=CORRECTIONS, change_register=CHANGES,
               owner_decisions=DECISIONS, research_gaps=GAPS, confirmed_findings=CONFIRMED),
          open(os.path.join(D, 'adversarial_reconciled.json'), 'w'), ensure_ascii=False, indent=1)
print(summary)
