"""Phase C — A-lite workflow validation (SELF_AUDIT). A-lite is a testable architecture candidate, NOT the selected MVP.

Coverage sources: prompt 10-step workflow; prototype/index.html behaviour (functions listed); spec-quy-thoi-gian-va-tab-cua-con.md;
spec-quy-tac-lap-lich.md; SC-001 D01-D03 (USER_APPROVED_PRINCIPLE/USER_CONFIRMED_REQUIREMENT); 3.4 UC-007..UC-010.
Status: COVERED (in baseline A-lite W1E1) | PARTIAL | MISSING (no module in A-lite though an L3 exists) | FEATURE_GAP (no L3) | DEFERRED_OK
"""
import json, os, collections
B = os.path.join(os.path.dirname(__file__), '..', 'baseline_v1')
D = os.path.join(os.path.dirname(__file__), '..', 'data')
A = {r['module_id']: r for r in json.load(open(os.path.join(B, 'assessment.json')))}
G = json.load(open(os.path.join(B, 'graph_results.json')))
PB = json.load(open(os.path.join(D, 'phase_b.json')))
W1E1 = set(G['workflows']['W1E1']['required'])

# (step, capability, constraint class, source, modules, status, essential?, deterministic?, note)
# constraint class: HARD_SAFETY | USER_CONFIGURABLE | ADVISORY | OPERATIONAL | FUNCTIONAL
C = [
 ('1 Goal', 'Parent/child sets development goal', 'FUNCTIONAL', '3.4 UC-007 precondition goal_available; prototype tool cap_nhat_tong_quan (parent goals in overview)', 'F03-G04-M01', 'PARTIAL', 'CONDITIONAL', 'E1', 'Parent goals are captured in plan overview; only the approved-goal precondition of UC-007 is absent. Owner decision OD-A1.'),
 ('2 Activities', 'Identify tasks/activities (fixed activity cards)', 'FUNCTIONAL', 'spec-quy-thoi-gian §2.3; prototype renderActs/applyActs', 'F02-G01-M01 (or F02-G04-M01)', 'PARTIAL', 'YES', 'E1', 'Better L3 home may be F02-G04-M01 Environment Context (DEFERRED tier): essential capability sits in a deferred module (adversarial). Pal-created cards from chat are E2.'),
 ('2 Activities', 'Child profile incl. health info (allergy, medication)', 'HARD_SAFETY', 'prototype tool luu_ho_so (suc_khoe); spec-quy-tac B2', 'F01-G03-M01, F02-G01-M01', 'PARTIAL', 'YES', 'E0', 'Health data is a sensitive child-data category not reflected in baseline data_class; minimise or exclude in pilot (MR-021).'),
 ('3 Estimate', 'Task duration estimates', 'USER_CONFIGURABLE', 'spec §2.1; spec-quy-tac D defaults [MĐ]', 'F02-G01-M01, F04-G02-M03', 'PARTIAL', 'YES', 'E0', 'Parent-entered. Shipped defaults (e.g. per-grade homework time) are [MĐ] and must be labelled unverified/UNKNOWN unless vetted (P6-BP-OD-03).'),
 ('3 Estimate', 'Time availability from school + commute', 'OPERATIONAL', 'spec §2.1 fixed group from timetable', 'F02-G01-M01', 'COVERED', 'YES', 'E0', ''),
 ('3 Estimate', 'Sleep minimum', 'HARD_SAFETY', 'spec-quy-tac sleep [NC]', 'F04-G02-M03', 'COVERED', 'YES', 'E1', 'Only the sleep floor is [NC]-sourced; other "sàn" items are product rules [MĐ]; per-domain protected_hard_cap is UNKNOWN (P6 BP log §3).'),
 ('3 Estimate', 'Other fixed-floor product rules (free play after school, breaks, meals)', 'USER_CONFIGURABLE', 'spec §1.2 [MĐ]; P6-BP-OD-02', 'F04-G02-M03', 'COVERED', 'YES', 'E1', 'Not universal HARD_SAFETY: treat as app-default protections pending vetting; never bypassed by emergency shortcut (OD-02).'),
 ('3 Estimate', '6-group time budget (school-day/weekend) + screen max', 'USER_CONFIGURABLE', 'spec §2; prototype getBudget/setBudget/defaultBudget; P6-BP-OD-03', 'F04-G02-M03, F03-G03-M01', 'PARTIAL', 'YES', 'E1', 'App Default Standard Bar must be vetted, else UNKNOWN; hard-coded defaults are not acceptable as a validated bar.'),
 ('3 Estimate', 'Budget presets (Bình thường, Thi cử, Nghỉ hè…)', 'USER_CONFIGURABLE', 'spec §2.1; prototype presetDirty; SC-001-D03', 'F04-G02-M03, F04-G01-M01', 'PARTIAL', 'YES', 'E0', 'Modules are in A-lite v1 (so PARTIAL, not MISSING). Thi cử/Nghỉ hè are time-bound exceptions, not long-term Standard Bar (SC-001-D03).'),
 ('4 Construct', 'Construct proposed schedule (day ordering rules, ±30 min [MĐ])', 'FUNCTIONAL', 'spec §1.2; Inventory E1; prototype ordering via LLM prompt RULES; checkDayK only validates', 'F04-G02-M01', 'MISSING', 'YES', 'E1', 'CONFIRMED gap: W1E1 dropped F04-G02-M01. No deterministic builder exists today: E1 feasibility UNKNOWN until spike (RG-01). In a Plan-A-aligned variant Pal (E2) constructs.'),
 ('4 Construct', 'Template-based generation', 'FUNCTIONAL', 'prototype presets; F04-G01-M02', 'F04-G01-M02', 'COVERED', 'YES', 'E1', ''),
 ('4 Construct', 'Recurring tasks', 'FUNCTIONAL', 'activity cards with weekdays', 'F04-G03-M01, F02-G01-M01', 'COVERED', 'YES', 'E0', ''),
 ('4 Construct', 'One-time / week-only changes (skip a session, make-up class, sick-day cancel)', 'USER_CONFIGURABLE', 'spec-quy-tac E3, K3, K4; prototype tools pham_vi chi_tuan_nay, xoa_ngoai_le', 'F04-G01-M01, F04-G02-M03', 'PARTIAL', 'YES', 'E0', 'Adversarial correction: specified in spec-quy-tac; essential as week-only exception.'),
 ('5 Check', 'Time-budget check + one-line warning with source', 'ADVISORY', 'spec §1.3, §2.2; prototype judge', 'F04-G02-M03', 'COVERED', 'YES', 'E1', ''),
 ('5 Check', 'Soft cap "Giữ mức này", warn exactly once', 'USER_CONFIGURABLE', 'spec §1.1, §1.4; spec-quy-tac A2, D6', 'F04-G02-M03', 'PARTIAL', 'YES', 'E1', 'Not stated in baseline scope (Phase A REVIEW).'),
 ('5 Check', 'Overlap conflicts', 'OPERATIONAL', 'UC-010; prototype checkDay', 'F04-G02-M02', 'COVERED', 'YES', 'E1', 'Edge direction fixed by P-E02.'),
 ('5 Check', 'Total > 24h detection', 'OPERATIONAL', 'spec §2.1', 'F04-G02-M03', 'COVERED', 'YES', 'E0', ''),
 ('6 Approve', 'Parent saves = approval (parent-led)', 'FUNCTIONAL', '3.4 UC-008; B01-MS-OD-04', 'F04-G01-M01, F01-G04-M01', 'COVERED', 'YES', 'E0', 'UNSET behaves as PARENT_LED.'),
 ('6 Approve', 'Child proposals pending parent approval', 'FUNCTIONAL', 'spec §3-4; 3.4 UC-010; B01 CR log (PARENT_LED: no official CR); B01-MS-OD-02', 'F04-G06-M01 (minimal), F04-G03-M02 (minimal), F01-G05-M01', 'MISSING', 'YES (only for children set to CHILD_EXECUTED)', 'E0', 'Requires parent to set child mode CHILD_EXECUTED; 7-day expiry; hard-cap NOT_APPROVABLE; PARENT_LED children send informal wish note only. Structured choices avoid verbatim free-text leak.'),
 ('7 Execute', 'Child "Hôm nay" view, "Bây giờ" label, progress x/y, no scores', 'FUNCTIONAL', 'spec §4; prototype renderToday/liveBlocks', 'F04-G04-M01', 'COVERED', 'YES', 'E0', ''),
 ('7 Execute', 'Reminders on time incl. morning alarm, "Xong" action in notification, re-schedule all reminders after plan edits, parent-to-child push', 'OPERATIONAL', 'Plan A §1, §5-6 (<1 min); device log +45 s', 'F04-G07-M01, F04-G07-M02, F04-G05-M01', 'PARTIAL', 'YES', 'E1', 'Adversarial addition: sub-behaviours from Plan A not in baseline rows. Hidden platform requirement: notification service + exact alarm.'),
 ('7 Execute', 'Weather pack reminder (Soạn cặp)', 'ADVISORY', 'spec §4; spec-quy-tac I4; Plan A §5', 'F04-G04-M01, F04-G07-M01', 'PARTIAL', 'NO (A-lite E1) / YES (Plan-A variant)', 'E0', 'Adversarial correction: L4-level behaviour fitting existing modules, not an L3 FEATURE_GAP.'),
 ('8 Evidence', 'Check-off "✓ Xong"', 'FUNCTIONAL', 'spec §4', 'F04-G05-M01', 'COVERED', 'YES', 'E0', ''),
 ('8 Evidence', 'Photo capture "Chụp gửi" (no AI grading)', 'FUNCTIONAL', 'Plan A §1 item 4; device log 2026-11-05 PASS', 'F04-G05-M02', 'MISSING', 'NO (A-lite E1) / YES (Plan-A variant)', 'E0', 'Split from AI grading (adversarial).'),
 ('8 Evidence', 'AI feedback on photo homework', 'FUNCTIONAL', 'spec §5; SC-002-D05 pilot only', 'F06-G07-M01, F07-G03-M03', 'DEFERRED_OK', 'NO', 'E2', 'Controlled pilot only.'),
 ('8 Evidence', 'Voice "Kể cho Pal" / recording', 'FUNCTIONAL', 'spec §4; Plan A §1 item 3', 'F07-G03-M03', 'DEFERRED_OK', 'NO (A-lite E1) / YES (Plan-A variant)', 'E2', 'Prototype button only pre-fills chat; recording is Plan A feature 3.'),
 ('8 Evidence', 'Parent sees ✓ and completion time in week view', 'FUNCTIONAL', 'spec §4', 'F06-G01-M01, F06-G05-M02', 'COVERED', 'YES', 'E0', ''),
 ('9 Feedback', 'After-school check "Ổn / Hơi mệt / Rất mệt" + relief rule (keep teacher homework only)', 'ADVISORY', 'spec §4; spec-quy-tac G3; SC-001-D02', '— (owner TBD; candidates F04-G04/F04-G05)', 'MISSING', 'YES', 'E1', 'Adversarial correction: no clean L3 owner (F02-G05-M02 is profile contest); relief rule is in spec §4 but not implemented in prototype (index.html:1036-1038 records only). OD-A7.'),
 ('9 Feedback', 'Hunger signal "Con thấy đói" to parent queue', 'ADVISORY', 'spec §4; spec-quy-tac H5; Plan A §5-6 step 5', '— (owner TBD)', 'MISSING', 'NO (A-lite E1) / YES (Plan-A variant)', 'E0', 'Same ownership issue as fatigue.'),
 ('9 Feedback', 'Pattern to parent, not verbatim (2-week window), asks for context, no causal claim', 'ADVISORY', 'spec §1.5; spec-quy-tac L2; SC-001-D02', 'F06-G04-M01, F06-G05-M01', 'MISSING', 'YES', 'E1', 'F06-G04-M01 was absent from A-lite (adversarial); added in v2. No unsourced count threshold: threshold UNKNOWN until sourced.'),
 ('9 Feedback', 'Weekly summary for parent', 'FUNCTIONAL', '3.4 UC-015', 'F06-G05-M02, F06-G02-M01', 'COVERED', 'YES', 'E1', ''),
 ('10 Adjust', 'Temporary phase: duration, warn once, relaxed rules listed, snapshot, expiry with 3 choices; max 60 continuous days same constraint; >=7 empty days between similar exceptions', 'USER_CONFIGURABLE', 'spec §3; SC-001-D01; P6-BP-OD-01; prototype applyPeriod/checkPeriodExpiry/revertPeriod/snapshotPlan', 'F04-G02-M03, F04-G01-M01', 'PARTIAL', 'YES', 'E0', 'Modules in v1 (PARTIAL). Prototype creates the phase via LLM prompt (index.html:497); E0 needs a structured form.'),
 ('10 Adjust', 'Schedule revisions with version history', 'FUNCTIONAL', 'prototype historyText/snapshotPlan; B01 Plan Structure', 'F04-G01-M01, F04-G06-M02', 'PARTIAL', 'YES', 'E0', ''),
 ('10 Adjust', 'Progress exceptions (sick/rest day not failure)', 'ADVISORY', 'spec-quy-tac K4', 'F06-G02-M02', 'MISSING', 'NO (recommended)', 'E0', 'Recommended so relief/sick days are not counted as failure.'),
 ('10 Adjust', 'Family review session', 'FUNCTIONAL', '3.4 UC-016', 'F06-G06-M01', 'DEFERRED_OK', 'NO', 'E1', ''),
 ('X Safety', 'Safety layer before AI + static 111/113/115 content for any free-text input', 'HARD_SAFETY', 'CLAUDE.md; OD-03; Plan A §4, §6 step 2; spec-quy-tac N1-N2', 'F07-G05-M01, F07-G01-M01', 'PARTIAL', 'YES (Plan-A variant; any free text) / CONDITIONAL (strict structured E1 variant)', 'E1', 'Adversarial correction: prototype standard behaviour has free text everywhere; HARD_SAFETY must not depend on the audit choosing structured inputs.'),
 ('X Safety', 'Pseudonymise child name/school before external LLM call', 'HARD_SAFETY', 'CLAUDE.md; Plan A pal-chat', 'platform requirement (no L3)', 'MISSING', 'YES (Plan-A variant)', 'E0', 'Hidden platform requirement.'),
 ('X Identity', 'Two-device pairing + Parent PIN on unlink / child settings', 'HARD_SAFETY', 'FR-01 APPROVED; spec-quy-thoi-gian §4 limits (shared account, no PIN)', 'F01-G02-M01, F01-G01-M02', 'PARTIAL', 'YES', 'E0', 'Plan A defers per-person accounts (family code) while FR-01 requires PIN: identity model for pilot is an Owner decision (OD-A8).'),
 ('X Platform', 'Plan A geofence (Home/School/Tutoring), events only', 'OPERATIONAL', 'spec-phuong-an-a §1-2, §4 (Owner chốt 04/11)', 'F08-G04-M01/M02, F01-G04-M02, F06-G01-M01, F04-G07-M01 (mapping proposed)', 'PARTIAL', 'NO (A-lite E1) / YES (Plan-A variant)', 'E0', 'Adversarial correction: mappable to existing IDs; not a clean FEATURE_GAP. Location is a distinct sensitive category (OD-A3).'),
]
caps = [dict(step=c[0], capability=c[1], constraint_class=c[2], source=c[3], modules=c[4], status=c[5], essential=c[6], exec=c[7], note=c[8]) for c in C]

# ---- A-lite v2 module set (closure over baseline edges minus reversed + proposed edges, minimal-capability view, no AI) ----
seeds_v2 = sorted(set(G['workflows']['W1E1']['seeds']) | {'F04-G02-M01', 'F04-G06-M01', 'F06-G04-M01', 'F06-G02-M02'})
PLANA_EXTRA = ['F07-G03-M01', 'F07-G03-M02', 'F07-G04-M01', 'F07-G05-M01', 'F07-G04-M02', 'F07-G01-M01', 'F07-G02-M01', 'F04-G05-M02', 'F08-G04-M01', 'F08-G04-M02', 'F07-G03-M03']
edges = [(r['source'], r['target'], r['criticality']) for r in PB['edges_v2'] if r['v2_action'] != 'REVERSE']
BUNDLE_AUTHZ = ['F01-G01-M01', 'F01-G01-M02', 'F01-G04-M01', 'F07-G06-M01']
BUNDLE_CHILD = ['F01-G02-M01', 'F01-G03-M01', 'F01-G04-M02', 'F01-G05-M01']
BUNDLE_LIFE = ['F01-G06-M01', 'F07-G06-M02']
adj = collections.defaultdict(set)
for s, t, c in edges:
    if c == 'HARD': adj[s].add(t)
for m, r in A.items():
    if r['data_class'] != 'NONE': adj[m] |= set(BUNDLE_AUTHZ) - {m}
    if r['data_class'] in ('CHILD', 'JOURNAL'): adj[m] |= (set(BUNDLE_CHILD) | set(BUNDLE_LIFE)) - {m}
seen, st = set(), list(seeds_v2)
while st:
    x = st.pop()
    if x in seen: continue
    seen.add(x); st.extend(adj[x])
alite_v2 = sorted(seen)
added = sorted(set(alite_v2) - W1E1); removed = sorted(W1E1 - set(alite_v2))
gran = {}
for m in alite_v2:
    g = 'MINIMAL' if m in PB['mincap'] else ('SHARED' if m in ('F01-G01-M01', 'F01-G01-M02') else ('POLICY_OPERATIONAL' if m in ('F01-G06-M01', 'F07-G06-M02') else 'FULL'))
    gran[m] = g
NEVER_REVIEWED = [m for m in alite_v2 if m in ('F01-G04-M01', 'F01-G04-M02', 'F01-G05-M01', 'F07-G06-M01')]
st2, seen2 = list(seeds_v2) + PLANA_EXTRA, set()
while st2:
    x = st2.pop()
    if x in seen2: continue
    seen2.add(x); st2.extend(adj[x])
alite_plana = sorted(seen2)
ai_in = [m for m in alite_v2 if m in ('F07-G03-M01', 'F07-G04-M01', 'F07-G05-M01', 'F07-G03-M02', 'F07-G04-M02')]
blocked = [m for m in alite_v2 if A[m]['hard_gates']['G-Legal']['status'] == 'BLOCKED']
stat = collections.Counter(c['status'] for c in caps)
ess_missing = [c for c in caps if c['status'] in ('MISSING', 'FEATURE_GAP') and c['essential'].startswith('YES') and 'Plan-A variant)' not in c['essential']]
res = dict(capabilities=caps, status_counts=dict(stat), essential_missing_in_baseline=[c['capability'] for c in ess_missing],
           alite_v1=sorted(W1E1), alite_v2=alite_v2, alite_v2_count=len(alite_v2), added_vs_v1=added, removed_vs_v1=removed,
           alite_v2_granularity=dict(collections.Counter(gran.values())), alite_v2_granularity_by_module=gran,
           ai_modules_in_v2=ai_in, legal_blocked_in_v2=blocked, never_independently_reviewed_in_v2=NEVER_REVIEWED, alite_plana=alite_plana, alite_plana_count=len(alite_plana), plana_added_vs_v2=sorted(set(alite_plana)-set(alite_v2)), plana_legal_blocked=[m for m in alite_plana if A[m]['hard_gates']['G-Legal']['status']=='BLOCKED'],
           conditional_additions=dict(goal=['F03-G04-M01'], fatigue_signal='owner TBD (OD-A7)', identity_model='OD-A8'),
           e2_genuinely_needed=['Natural-language capture of activities ("Pal vừa ghi" cards) - optional convenience', 'Photo/voice feedback on homework (SC-002-D05 pilot only)',
                                'Explaining trade-offs in free language (UC-010 E2 optional)'])
json.dump(res, open(os.path.join(D, 'phase_c.json'), 'w'), ensure_ascii=False, indent=1)
print('caps', len(caps), dict(stat)); print('essential missing', len(ess_missing)); [print('  -', c['step'], c['capability'][:70]) for c in ess_missing]
print('A-lite v1', len(W1E1), '-> v2', len(alite_v2), 'added', added, 'removed', removed)
print('granularity', res['alite_v2_granularity'], 'AI modules', ai_in, 'blocked', blocked, 'never reviewed', NEVER_REVIEWED)
print('Plan-A variant', len(alite_plana), sorted(set(alite_plana)-set(alite_v2)), res['plana_legal_blocked'])
