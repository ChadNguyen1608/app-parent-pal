"""CP-03: expand bundles, check edges, detect cycles, compute workflow closures, Tier-3 set and L2 graph."""
import json, os, sys, collections
sys.path.insert(0, os.path.dirname(__file__))
from deps_data import E, BUNDLES, BUNDLE_USERS
D = os.path.join(os.path.dirname(__file__), '..', 'data')
T1 = {r['module_id']: r for r in json.load(open(os.path.join(D, 'tier1_106.json')))}
ids = set(T1)
errs = []

WORKFLOWS = {
 'W1': dict(name='Lập lịch & thực thi cùng con (Plan → Execute → Evaluate nhẹ)', apps='Parent App + Child App', cohorts='A2-A3 (A1/A4 conditional)',
   seeds=['F02-G01-M01', 'F04-G01-M01', 'F04-G01-M02', 'F04-G02-M01', 'F04-G02-M02', 'F04-G02-M03', 'F04-G03-M01', 'F04-G04-M01',
          'F04-G05-M01', 'F04-G07-M01', 'F04-G07-M02', 'F06-G01-M01', 'F06-G02-M01', 'F06-G05-M01', 'F06-G05-M02'],
   optional=['F04-G04-M02', 'F04-G05-M02', 'F06-G04-M01', 'F02-G05-M02', 'F04-G06-M01', 'F04-G03-M02', 'F04-G06-M02', 'F06-G02-M02',
             'F03-G03-M01', 'F06-G01-M02', 'F01-G02-M02']),
 'W1E1': dict(name='W1 không dùng LLM (lịch từ mẫu + quy tắc E1)', apps='Parent App + Child App', cohorts='A2-A3',
   seeds=['F02-G01-M01', 'F04-G01-M01', 'F04-G01-M02', 'F04-G02-M02', 'F04-G02-M03', 'F04-G03-M01', 'F04-G04-M01',
          'F04-G05-M01', 'F04-G07-M01', 'F04-G07-M02', 'F06-G01-M01', 'F06-G02-M01', 'F06-G05-M01', 'F06-G05-M02'],
   optional=[], no_ai=True),
 'W2': dict(name='Pal đồng hành phụ huynh (Understand → Orient, chỉ Parent App)', apps='Parent App', cohorts='Phụ huynh của A0-A3 (A4 conditional)',
   seeds=['F05-G01-M01', 'F02-G01-M01', 'F02-G05-M01', 'F02-G06-M02', 'F03-G05-M01', 'F03-G05-M02', 'F07-G02-M01'],
   optional=['F02-G01-M02', 'F02-G02-M01', 'F03-G03-M01', 'F03-G04-M01', 'F04-G01-M01', 'F04-G03-M01', 'F02-G03-M01'], no_child_app=True),
 'W3': dict(name='Tiếng nói của trẻ: check-in, phản tư, Nhật ký riêng (mở rộng W1)', apps='Parent App + Child App', cohorts='A2-A4',
   seeds=['F05-G02-M01', 'F05-G02-M02', 'F05-G03-M01', 'F05-G03-M02', 'F05-G04-M01', 'F05-G04-M02', 'F05-G06-M01', 'F05-G06-M02',
          'F02-G05-M02', 'F06-G06-M01', 'F06-G06-M02', 'F05-G01-M01'],
   optional=[], extends='W1'),
}

for e in E:
    s, t, ty, cr, lc = e[:5]
    if s not in ids or t not in ids: errs.append(f'unknown id in edge {s}->{t}')
    if ty not in 'FDPSO' or cr not in ('HARD', 'SOFT') or lc not in ('BUILD', 'TEST', 'RELEASE', 'RUN'): errs.append(f'bad enum {e[:5]}')
    if cr == 'HARD' and not e[5]: errs.append(f'HARD without reason {s}->{t}')


def bundle_targets(mid, no_ai=False, no_child_app=False):
    r = T1[mid]; out = []
    members = {m for b in BUNDLES.values() for m in b[0]}
    if r['data_class'] != 'NONE' and mid not in BUNDLES['B_AUTHZ'][0]: out.append(('B_AUTHZ', 'P', 'RUN'))
    if r['data_class'] in ('CHILD', 'JOURNAL') and mid not in BUNDLES['B_CHILD_SCOPE'][0]: out.append(('B_CHILD_SCOPE', 'P', 'RUN'))
    if r['exec_class'] in ('E2', 'E3') and not no_ai and mid not in BUNDLES['B_AI_GATE'][0]: out.append(('B_AI_GATE', 'S', 'RELEASE'))
    if r['data_class'] in ('CHILD', 'JOURNAL') and mid not in BUNDLES['B_LIFECYCLE'][0]: out.append(('B_LIFECYCLE', 'S', 'RELEASE'))
    return out


def expanded_edges(no_ai=False, no_child_app=False):
    out = [(e[0], e[1], e[2], e[3], e[4]) for e in E]
    for mid in ids:
        for b, ty, lc in bundle_targets(mid, no_ai, no_child_app):
            for t in BUNDLES[b][0]:
                if t == mid: continue
                if no_child_app and t == 'F01-G02-M01' and b == 'B_CHILD_SCOPE':
                    continue  # parent-only workflow: household record still needed but no Child App pairing
                out.append((mid, t, ty, 'HARD', lc))
    return out


def closure(seeds, edges, hard_only=True):
    adj = collections.defaultdict(set)
    for s, t, ty, cr, lc in edges:
        if cr == 'HARD' or not hard_only: adj[s].add(t)
    seen, stack = set(), list(seeds)
    while stack:
        m = stack.pop()
        if m in seen: continue
        seen.add(m); stack.extend(adj[m])
    return seen


def cycles(edges, lifecycles=('BUILD',)):
    adj = collections.defaultdict(set)
    for s, t, ty, cr, lc in edges:
        if cr == 'HARD' and lc in lifecycles: adj[s].add(t)
    found, color = [], {}
    def dfs(u, path):
        color[u] = 1
        for v in adj[u]:
            if color.get(v) == 1: found.append(path[path.index(v):] + [v] if v in path else [u, v])
            elif color.get(v) is None: dfs(v, path + [v])
        color[u] = 2
    for n in list(adj):
        if color.get(n) is None: dfs(n, [n])
    return found


EX = expanded_edges()
res = {'errors': errs, 'explicit_edges': len(E), 'expanded_edges': len(EX)}
res['build_cycles'] = cycles(EX, ('BUILD',))
res['run_cycles'] = cycles(EX, ('BUILD', 'RUN'))
wf = {}
for k, w in WORKFLOWS.items():
    edges = expanded_edges(no_ai=w.get('no_ai', False), no_child_app=w.get('no_child_app', False))
    seeds = list(w['seeds']) + (WORKFLOWS[w['extends']]['seeds'] if w.get('extends') else [])
    hard = closure(seeds, edges)
    opt = set(w['optional'])
    blocked = sorted(m for m in hard if T1[m]['hard_gates']['G-Legal']['status'] == 'BLOCKED')
    deferred_in = sorted(m for m in hard if T1[m]['tier'] == 'DEFERRED')
    wf[k] = dict(name=w['name'], apps=w['apps'], cohorts=w['cohorts'], seeds=sorted(seeds), required=sorted(hard),
                 optional=sorted(opt - hard), n_required=len(hard), n_optional=len(opt - hard),
                 legal_blocked_required=blocked, deferred_pulled_in=deferred_in,
                 e2_required=sorted(m for m in hard if T1[m]['exec_class'] in ('E2', 'E3')))
res['workflows'] = wf
tier3 = set()
for k in ('W1', 'W2', 'W3'):
    tier3 |= set(wf[k]['required']) | set(wf[k]['optional'])
# re-entry rule part 1: anything a Tier-3 module HARD-depends on
reentry = []
changed = True
while changed:
    changed = False
    for s, t, ty, cr, lc in EX:
        if cr == 'HARD' and s in tier3 and t not in tier3:
            tier3.add(t); reentry.append(dict(module=t, trigger=f'HARD {ty}/{lc} dependency of Tier-3 {s}')); changed = True
res['tier3'] = sorted(tier3); res['tier3_count'] = len(tier3); res['reentry_log'] = reentry
res['tier3_by_tier'] = dict(collections.Counter(T1[m]['tier'] for m in tier3))
res['coarse_only'] = sorted(ids - tier3)
# fan-in among Tier-3 (hard dependents) -> informs dependency_enablement
fan = collections.Counter(t for s, t, ty, cr, lc in EX if cr == 'HARD' and s in tier3 and s != t)
res['hard_fan_in_tier3'] = dict(fan.most_common())
# L2 aggregated graph (explicit edges only, no bundles)
l2 = collections.Counter((s[:7], t[:7], cr) for s, t, ty, cr, lc in [(e[0], e[1], e[2], e[3], e[4]) for e in E] if s[:7] != t[:7])
res['l2_edges'] = [dict(source=a, target=b, criticality=c, module_edges=n) for (a, b, c), n in sorted(l2.items())]
# critical path: longest HARD chain (BUILD+RUN) within W1 required set
def longest(nodes, edges):
    adj = collections.defaultdict(list)
    for s, t, ty, cr, lc in edges:
        if cr == 'HARD' and s in nodes and t in nodes and lc in ('BUILD', 'RUN'): adj[s].append(t)
    memo = {}
    def lp(u, stack=()):
        if u in memo and not stack: return memo[u]
        if u in stack: return []
        best = [u]
        for v in adj[u]:
            p = lp(v, stack + (u,))
            if len(p) + 1 > len(best): best = [u] + p
        memo[u] = best; return best
    return max((lp(n) for n in nodes), key=len)
res['critical_path_W1'] = longest(set(wf['W1']['required']), EX)
res['critical_path_W2'] = longest(set(wf['W2']['required']), expanded_edges(no_child_app=True))
json.dump(res, open(os.path.join(D, 'graph_results.json'), 'w'), ensure_ascii=False, indent=1)
json.dump([dict(source=e[0], target=e[1], type=e[2], criticality=e[3], required_for=e[4], reason=e[5], workaround=e[6],
                evidence=e[7], verification='CANDIDATE') for e in E], open(os.path.join(D, 'dependencies.json'), 'w'), ensure_ascii=False, indent=1)
print('errors', errs, '| edges', len(E), 'expanded', len(EX))
print('build cycles', res['build_cycles'][:5]); print('run cycles', res['run_cycles'][:8])
for k, v in wf.items(): print(k, 'required', v['n_required'], 'optional', v['n_optional'], 'blocked', v['legal_blocked_required'], 'deferred', v['deferred_pulled_in'], 'E2', v['e2_required'])
print('tier3', res['tier3_count'], res['tier3_by_tier']); print('reentry', [r['module'] for r in reentry])
print('crit W1', ' > '.join(res['critical_path_W1'])); print('crit W2', ' > '.join(res['critical_path_W2']))
sys.exit(1 if errs else 0)
