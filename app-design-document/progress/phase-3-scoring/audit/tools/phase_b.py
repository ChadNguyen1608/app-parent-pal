"""Phase B — dependency granularity audit (SELF_AUDIT). Baseline edges are kept verbatim; v2 adds a granularity
dimension and proposed changes. Nothing here is CONFIRMED (MR-040)."""
import json, os, collections
B = os.path.join(os.path.dirname(__file__), '..', 'baseline_v1')
D = os.path.join(os.path.dirname(__file__), '..', 'data')
E = json.load(open(os.path.join(B, 'dependencies.json')))
A = {r['module_id']: r for r in json.load(open(os.path.join(B, 'assessment.json')))}

SHARED = {'F01-G01-M01': 'Managed authentication (provider auth, OTP)', 'F01-G01-M02': 'Session handling + revoke-on-unlink',
          'F07-G03-M02': 'Per-household/device AI quota counter + AI calls/cost per successful outcome when E2 enabled (3.4 §9; SC-002-G10)', 'F07-G03-M01': 'Single guarded AI call path'}
# target -> (minimum capability, can defer, cannot defer, reusable, prerequisites)
MINCAP = {
 'F01-G02-M01': ('One household; Child App pairing by child-generated ID; Parent PIN on unlink; Parent App notice', 'Cross-household re-pair verification, multi-device, recovery assistance', 'PIN server assurance, epoch revoke of Child App session (FR-01)', 'YES (all Child App flows)', 'F01-G01-M01'),
 'F01-G05-M01': ('Parent-set autonomy mode per child (B01-MS-OD-01); UNSET behaves as PARENT_LED (OD-04); must support parent switching a child to CHILD_EXECUTED if child proposals are offered', 'Child-proposed transitions (F01-G05-M02)', 'Mode read by Access Policy', 'YES', 'F01-G03-M01'),
 'F01-G04-M02': ('Versioned consent per purpose; withdrawal stops processing', 'Granular purposes, child assent UX variants', 'Legal text once MR-016 resolves; audit', 'YES', 'F01-G03-M01'),
 'F01-G04-M01': ('Fixed role matrix (primary caregiver, co-caregiver, child) enforced server-side, deny-by-default', 'Subject/purpose-aware delegation engine, A5 ownership transfer', 'Server-side enforcement, child-scope check, audit', 'YES (every protected read/write)', 'F01-G05-M01, F01-G04-M02'),
 'F07-G06-M01': ('Synthetic-data flag; deny real child data while lawful basis UNKNOWN', 'Full lawful-basis evaluation per purpose', 'Deny-by-default for real child data', 'YES', 'F01-G04-M02'),
 'F02-G01-M01': ('Timetable, fixed activity cards (weekday, time, duration, commute), age/grade', 'Incremental questions, environment context', 'Data minimisation, guarded update', 'YES (planning + Pal)', 'B_AUTHZ, B_CHILD_SCOPE'),
 'F04-G01-M01': ('Single active weekly plan, version on save, snapshot/restore (needed for temporary exceptions)', 'Multiple plan scopes, B01 lock semantics', 'Version id on every mutation', 'YES', '—'),
 'F04-G02-M03': ('Sleep floor [NC] + protected_hard vs family_hard distinction (P6-BP-OD-02) + 6-group time budget (App Default Standard Bar only if vetted, else UNKNOWN: P6-BP-OD-03) + soft-cap confirm + time-bounded exceptions (max 60 continuous days same constraint, >=7 empty days between similar exceptions: P6-BP-OD-01)', 'Holistic/context-aware validation (SC-001-G03), cause-aware adaptation (SC-001-G05)', 'Floor never relaxed; sources on thresholds (SC-001-D01)', 'YES (construction, change approval)', 'F02-G01-M01, F04-G01-M01'),
 'F04-G03-M02': ('Single approver = primary caregiver', 'Multi-approver routing, delegation (FI-3.4-001 overlap)', 'Approver resolved from Access Policy', 'YES', 'F01-G04-M01'),
 'F04-G06-M01': ('Change requests only for children in CHILD_EXECUTED (B01-MS-OD-02; B01 CR log: PARENT_LED child expresses wishes, no official CR); single approver; 7-day expiry; hard-cap NOT_APPROVABLE; pending never applied', 'Full B01 v3.1 state machine (TTL, lock precedence, OUTCOME_UNKNOWN)', 'Proposal never applied without approval', 'YES', 'F04-G01-M01, F04-G03-M02'),
 'F04-G07-M02': ('Default quiet hours + on/off', 'Per-category preferences', 'Quiet hours respected', 'YES', '—'),
 'F07-G01-M01': ('Approved static catalog: safety messages (OD-03), help/prompt templates, with review status', 'Full CMS, versioned editorial UI', 'Only approved items served', 'YES', 'F07-G02-M01 (process)'),
 'F07-G01-M02': ('Keyword/tag retrieval over approved subset with scope filter', 'Semantic search, ranking', 'Scope filter before retrieval', 'YES', 'F07-G01-M01'),
 'F07-G02-M02': ('NG-xxx source code + review status per item', 'Evidence grading workflow', 'Unverified flag for external content', 'YES', 'F07-G01-M01'),
 'F07-G04-M01': ('Allowlist of (task, audience) scopes + rule-based output checks', 'Model-based policy evaluation, thresholds', 'No output without scope evidence (OD-05)', 'YES (all E2)', '—'),
 'F05-G06-M02': ('Entry-level deletion (no derived data in pilot)', 'Derived-data lineage graph', 'Deletion log', 'NO (Journal-specific)', 'F07-G06-M02'),
 'F06-G05-M01': ('Two fixed audience templates (parent, child)', 'Configurable audiences', 'Journal never in parent template', 'YES', '—'),
 'F06-G01-M02': ('Source field: child self-report / parent-confirmed / teacher-verified', 'Full provenance model (F02-G06-M01)', 'Displayed label', 'YES', '—'),
 'F02-G05-M01': ('Single current profile + change log', 'Full versioned projection', 'Visible and editable (transparency rule)', 'YES', 'F02-G01-M01'),
 'F03-G03-M01': ('Age default table from spec-quy-tac-lap-lich, used as bar only if vetted; otherwise labelled UNKNOWN/[MĐ] (P6-BP-OD-03)', 'Stage catalog content', 'Sourced values', 'YES', '—'),
}
POLICY = {'F07-G06-M02': 'Retention schedule + manual purge runbook (pilot, synthetic data)', 'F01-G06-M01': 'Manual deletion/export request handling with log (pilot)',
          'F07-G02-M01': 'Manual expert editorial review', 'F07-G04-M02': 'Pre-release evaluation set'}
FI = {('F04-G06-M01', 'F04-G03-M02'): 'FI-3.4-001', ('F06-G06-M02', 'F04-G06-M01'): 'FI-3.4-004 (F06 proposes, F03/F04 decides)',
      ('F05-G05-M01', 'F05-G06-M02'): 'FI-3.4-003', ('F05-G06-M02', 'F07-G06-M02'): 'FI-3.4-003', ('F01-G06-M01', 'F07-G06-M02'): 'FI-3.4-003'}
COHORT_DEP = {('F04-G06-M01', 'F04-G03-M02'): 'Only when child proposes (CHILD_EXECUTED/CHILD_DIRECTED, A2-A4); none for A0/A1; A5 self-approves',
              ('F02-G05-M02', 'F04-G01-M01'): 'Child feedback A1-A4 only', ('F05-G04-M01', 'F05-G06-M02'): 'Journal A1(O)-A4; A0 none',
              ('F04-G07-M01', 'F04-G07-M02'): 'Child device quiet hours set by parent for A1-A3, by teen for A4'}


def classify(e):
    s, t = e['source'], e['target']
    if e['criticality'] == 'SOFT': return 'OPTIONAL_DEPENDENCY'
    if e['type'] == 'O': return 'POLICY_OPERATIONAL_REQUIREMENT'
    if t in SHARED: return 'SHARED_PLATFORM_SERVICE'
    if t in POLICY and e['required_for'] == 'RELEASE': return 'POLICY_OPERATIONAL_REQUIREMENT'
    if t in MINCAP: return 'MINIMAL_CAPABILITY_REQUIRED'
    return 'FULL_MODULE_REQUIRED'


v2 = []
for i, e in enumerate(E):
    g = classify(e)
    rec = dict(edge_id=f'E{i:03d}', **e, granularity=g, fi_issue=FI.get((e['source'], e['target']), ''),
               cohort_or_mode_condition=COHORT_DEP.get((e['source'], e['target']), ''), v2_action='KEEP', v2_note='')
    if g == 'MINIMAL_CAPABILITY_REQUIRED': rec['minimum_capability'] = MINCAP[e['target']][0]
    if g == 'POLICY_OPERATIONAL_REQUIREMENT' and e['target'] in POLICY: rec['minimum_capability'] = POLICY[e['target']]
    v2.append(rec)
# ---- proposed changes ----
def find(s, t): return next(r for r in v2 if r['source'] == s and r['target'] == t)
r = find('F04-G02-M02', 'F04-G02-M01'); r['v2_action'] = 'REVERSE'; r['v2_note'] = 'Construction must call conflict detection (not the reverse). Replace by P-E02.'
r = find('F04-G06-M01', 'F04-G02-M03'); r['v2_note'] = 'Keep HARD; under minimal capability the Balanced Planning verdict is shown to the approver before accept.'
NEW = [
 ('P-E01', 'F04-G03-M01', 'F04-G02-M01', 'F', 'SOFT', 'RUN', 'Tasks are generated from the constructed schedule; manual task entry is the substitute', 'Manual entry', 'prototype applyActs/renderPlan', 'OPTIONAL_DEPENDENCY'),
 ('P-E02', 'F04-G02-M01', 'F04-G02-M02', 'F', 'HARD', 'RUN', 'Construction must avoid overlaps (half-open intervals) before proposing', '', 'prototype checkDay; UC-010', 'MINIMAL_CAPABILITY_REQUIRED'),
 ('P-E03', 'F04-G02-M03', 'F02-G01-M01', 'D', 'HARD', 'RUN', 'Fixed groups (school+commute, tutoring) come from timetable and activity cards (spec-quy-thoi-gian §2.1)', '', 'spec-quy-thoi-gian §2.1', 'MINIMAL_CAPABILITY_REQUIRED'),
 ('P-E04', 'F04-G02-M03', 'F04-G01-M01', 'D', 'HARD', 'RUN', 'Temporary exception keeps old plan snapshot and restores on expiry (spec §3; SC-001-D01)', '', 'spec-quy-thoi-gian §3; prototype snapshotPlan/revertPeriod', 'MINIMAL_CAPABILITY_REQUIRED'),
 ('P-E06', 'F04-G06-M01', 'F01-G05-M01', 'P', 'HARD', 'RUN', 'Who may propose/approve depends on autonomy mode (3.4 UC-010 permissions)', '', '3.4 §6.1', 'MINIMAL_CAPABILITY_REQUIRED'),
]
for n in NEW:
    v2.append(dict(edge_id=n[0], source=n[1], target=n[2], type=n[3], criticality=n[4], required_for=n[5], reason=n[6], workaround=n[7],
                   evidence=n[8], verification='CANDIDATE', granularity=n[9], fi_issue='', cohort_or_mode_condition=COHORT_DEP.get((n[1], n[2]), ''),
                   v2_action='ADD_PROPOSED', v2_note='Proposed in self-audit; needs Owner/MR-040 review',
                   minimum_capability=MINCAP.get(n[2], ('',))[0] if n[9] == 'MINIMAL_CAPABILITY_REQUIRED' else ''))
# ---- bundle audit ----
BUNDLE_AUDIT = [
 dict(bundle='B_AUTHZ', members='F01-G01-M01, F01-G01-M02, F01-G04-M01, F07-G06-M01', finding='Mixed granularity: auth/session are SHARED_PLATFORM_SERVICE; Access Policy and Purpose-bound Access are MINIMAL (fixed role matrix, synthetic-data flag). Baseline counted fan-in 56 as if full modules were required.', proposal='Split into SHARED (auth, session) + MINIMAL (policy matrix, purpose flag)'),
 dict(bundle='B_CHILD_SCOPE', members='F01-G02-M01, F01-G03-M01, F01-G04-M02, F01-G05-M01', finding='Applies to A0-A4 only; A5 (verified adult) should not inherit child scope. Baseline applied by data class regardless of cohort.', proposal='Condition: A0-A4; for parent-only workflows pairing (F01-G02-M01) not needed (already modelled)'),
 dict(bundle='B_AI_GATE', members='F07-G03-M01, F07-G03-M02, F07-G04-M01, F07-G05-M01, F07-G04-M02', finding='Applied to every E2 module including optional E2 paths; F04-G02-M01 override made A-lite look AI-dependent. Safety triage (F07-G05-M01) is required for any free-text input even without LLM (CLAUDE.md "lớp an toàn chạy trước AI" and parent emergencies OD-03) — hidden requirement when free-text chat exists in A-lite.', proposal='Apply only to enabled E2 paths; add rule: free-text input -> F07-G05-M01 rule layer + F07-G01-M01 static catalog, even in E1 workflows'),
 dict(bundle='B_LIFECYCLE', members='F01-G06-M01, F07-G06-M02', finding='Required before real child data (H4), not before synthetic-data pilot; baseline treated as RELEASE (correct) but readers may read as BUILD.', proposal='Label POLICY_OPERATIONAL_REQUIREMENT for synthetic pilot; FULL before real-data pilot'),
]
# ---- integrity checks ----
expl = [(r['source'], r['target'], r['criticality'], r['required_for']) for r in v2 if r['v2_action'] != 'REVERSE']
def cycles(edges, lcs):
    adj = collections.defaultdict(set)
    for s, t, c, l in edges:
        if c == 'HARD' and l in lcs: adj[s].add(t)
    found, color = [], {}
    def dfs(u, path):
        color[u] = 1
        for v in adj[u]:
            if color.get(v) == 1: found.append(path[path.index(v):] + [v])
            elif color.get(v) is None: dfs(v, path + [v])
        color[u] = 2
    for n in list(adj):
        if color.get(n) is None: dfs(n, [n])
    return found
mods = set(A)
touched = {r['source'] for r in v2} | {r['target'] for r in v2}
orphans = sorted(mods - touched)
integrity = dict(build_cycles_v2=cycles(expl, ('BUILD',)), run_cycles_v2=cycles(expl, ('BUILD', 'RUN')),
                 orphans_explicit=orphans, orphans_note='Orphans rely only on platform bundles or are standalone extensions; not an error by itself',
                 hidden_platform_requirements=['Push/local notification delivery service incl. Android exact-alarm permission and OEM battery settings (Plan A §6; F04-G07-M01 latency H)',
                                               'Offline storage/sync for Child App (expo-sqlite, Plan A)', 'Pseudonymisation before external LLM call (CLAUDE.md, Plan A pal-chat)',
                                               'Secrets management (Claude key only in Supabase secret)', 'Device location service for Plan A geofence (no L3 owner: Feature gap)'],
                 safety_omissions=['Free-text input without LLM still needs safety rule layer + static catalog (B_AI_GATE finding)',
                                   'Temporary exceptions must never relax the fixed floor (spec §3) - enforced in F04-G02-M03 minimal capability',
                                   'Fatigue signal must reach parent as trend, not verbatim (spec §1.5) - privacy constraint on P-E05'])
gc = collections.Counter(r['granularity'] for r in v2 if not r['edge_id'].startswith('P-'))
json.dump(dict(edges_v2=v2, bundles=BUNDLE_AUDIT, mincap=MINCAP, integrity=integrity, baseline_granularity=dict(gc)),
          open(os.path.join(D, 'phase_b.json'), 'w'), ensure_ascii=False, indent=1)
print('baseline edges', sum(1 for r in v2 if r['edge_id'].startswith('E')), 'granularity', dict(gc))
v2.append(dict(edge_id='P-E05', source='(owner TBD: fatigue signal)', target='F04-G02-M03', type='S', criticality='SOFT', required_for='RUN', reason='Fatigue signal triggers relief rule (spec §4); WITHDRAWN as F02-G05-M02 edge after adversarial review: F02-G05-M02 is not the owner', workaround='', evidence='spec-quy-thoi-gian §4; SC-001-D02', verification='CANDIDATE', granularity='OPTIONAL_DEPENDENCY', fi_issue='', cohort_or_mode_condition='', v2_action='WITHDRAWN', v2_note='Re-add when OD-A7 assigns an owner', minimum_capability=''))
v2.append(dict(edge_id='P-E07', source='F07-G03-M01', target='F07-G07-M02', type='O', criticality='HARD', required_for='RUN', reason='Cost telemetry per outcome', workaround='', evidence='3.4 §9; SC-002-G10', verification='CANDIDATE', granularity='POLICY_OPERATIONAL_REQUIREMENT', fi_issue='', cohort_or_mode_condition='', v2_action='WITHDRAWN', v2_note='Adversarial review: requirement belongs to F07-G03-M02 (existing edge E082); no new edge', minimum_capability=''))
print('proposed', len(NEW), 'reversed', sum(1 for r in v2 if r['v2_action'] == 'REVERSE'))
print('build cycles', integrity['build_cycles_v2'], '| run cycles count', len(integrity['run_cycles_v2']))
print('orphans', len(orphans), orphans)
