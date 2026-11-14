"""Phase A — scoring challenge (SELF_AUDIT). Reads frozen baseline_v1, never modifies it.

Part 1: automated consistency checks over all 106 records.
Part 2: manual review classification (KEEP / CLARIFY / REVIEW / BLOCKED) for the 40 COARSE modules and every FULL module flagged.
Finding basis: CONFIRMED_SOURCE (contradicts an approved/project artifact), CONFIRMED_SCRIPT (internal inconsistency found by script),
SELF_OMISSION (baseline did not read an available source), JUDGMENT (debatable expert view).
"""
import json, os, collections
B = os.path.join(os.path.dirname(__file__), '..', 'baseline_v1')
D = os.path.join(os.path.dirname(__file__), '..', 'data')
A = {r['module_id']: r for r in json.load(open(os.path.join(B, 'assessment.json')))}
G = json.load(open(os.path.join(B, 'graph_results.json')))
S = lambda x: x if isinstance(x, int) else None
auto = []
# ---- A-AUTO-1: dependency_enablement vs hard fan-in rank (Tier-3) ----
F = [r for r in A.values() if r['assessment_level'] == 'FULL']
for r in F:
    e = S(r['value']['dependency_enablement']['score']); fan = r['hard_fan_in_tier3']
    if e is not None and ((e >= 4 and fan <= 1) or (e <= 2 and fan >= 4)):
        auto.append(dict(id='AUTO-ENAB', module=r['module_id'], detail=f'enablement {e} vs hard fan-in {fan}'))
# ---- A-AUTO-2: INDIRECT used for modules that have their own UI (UX code != engine) ----
UI_MODULES = {'F04-G02-M03': 'prototype soft-cap line + "Giữ mức này" button (spec-quy-thoi-gian §1.4)',
              'F04-G01-M01': 'plan/week view is shown to parents (prototype tab Lịch tuần)',
              'F06-G05-M01': 'audience choice visible only through report templates (no own UI) - consistent'}
for m, why in UI_MODULES.items():
    r = A[m]; ca = r.get('cohort_assessment', {})
    if ca and ca['A2']['parent_value'] == 'INDIRECT' and 'consistent' not in why:
        auto.append(dict(id='AUTO-IND-UI', module=m, detail=f'parent_value INDIRECT but module has user-facing UI: {why}'))
    if r['value']['adoption_potential']['score'] == 'NOT_APPLICABLE' and 'consistent' not in why and m == 'F04-G02-M03':
        auto.append(dict(id='AUTO-ADOPT-UI', module=m, detail='adoption N/A although parents interact with soft-cap confirmation'))
# ---- A-AUTO-3: similar data-structure modules scored differently ----
pairs = [('F04-G01-M01', 'F04-G03-M01'), ('F06-G02-M01', 'F04-G02-M02'), ('F06-G04-M01', 'F06-G02-M02')]
for a, b in pairs:
    pa, pb = A[a]['cohort_assessment']['A2']['parent_value'], A[b]['cohort_assessment']['A2']['parent_value']
    if (pa == 'INDIRECT') != (pb == 'INDIRECT'):
        auto.append(dict(id='AUTO-SIMILAR', module=f'{a} vs {b}', detail=f'A2 parent_value {pa} vs {pb} for comparable engine/structure modules'))
# ---- A-AUTO-4: exec override vs inventory/3.4 default ----
for r in A.values():
    if r['exec_note'].startswith('L4 override') and r['exec_class'] == 'E2' and r['exec_32'].startswith('E1'):
        auto.append(dict(id='AUTO-EXEC', module=r['module_id'], detail=f"exec raised {r['exec_32']} -> E2 by baseline override; 3.4 UC-007 default E1, LLM optional"))
# ---- A-AUTO-5: cohort N/A vs tier1 applicability conflict / missing CORE coverage ----
for r in A.values():
    coh = r['cohorts']
    if r['tier'] in ('CORE_VALUE',) and coh['A2']['applicability'] == 'NOT_APPLICABLE' and coh['A3']['applicability'] == 'NOT_APPLICABLE':
        auto.append(dict(id='AUTO-CORE-NA', module=r['module_id'], detail='CORE_VALUE but N/A for both A2 and A3'))

# ---- Part 2: manual classification ----
# (status, basis, finding, proposed change or None, confidence, approval)
M = {
# ===== COARSE (40) =====
'F01-G03-M02': ('KEEP', 'JUDGMENT', 'Verified correction workflow; pilot substitute (caregiver edits declared facts) is consistent with UC-004 needing child review later.', None, 'MEDIUM', 'NO'),
'F01-G05-M02': ('CLARIFY', 'SELF_OMISSION', '3.4 UC-002 and §5 require mode branches; deferral is fine only if Mode State supports parent-set changes with audit. Rationale should cite UC-002.', 'Add UC-002 trace to note; keep ADV_SECURITY_OPS', 'MEDIUM', 'NO'),
'F01-G06-M02': ('KEEP', 'CONFIRMED_SOURCE', 'Owner guidance 14/11: billing deferred; UC-023 exists but no pilot need.', None, 'HIGH', 'NO'),
'F01-G06-M03': ('KEEP', 'CONFIRMED_SOURCE', 'Same as F01-G06-M02.', None, 'HIGH', 'NO'),
'F02-G02-M02': ('KEEP', 'JUDGMENT', 'Formal revision folded into registry edit.', None, 'MEDIUM', 'NO'),
'F02-G04-M01': ('CLARIFY', 'SELF_OMISSION', 'SC-001 lists family context/commute as planning input; prototype captures commute in activity cards (spec-quy-thoi-gian §2.3). Coverage via Intake must be stated explicitly.', 'Note: minimal commute/fixed-activity context handled in F02-G01-M01 intake', 'MEDIUM', 'NO'),
'F02-G04-M02': ('KEEP', 'JUDGMENT', 'Only needed with F02-G04-M01.', None, 'MEDIUM', 'NO'),
'F02-G06-M01': ('KEEP', 'JUDGMENT', 'Pilot uses source field (F06-G01-M02); SC-002 "đã làm ≠ đã chấm đúng" satisfied by that field.', None, 'MEDIUM', 'NO'),
'F03-G01-M01': ('KEEP', 'JUDGMENT', 'Framework registry not needed for pilot; knowledge files used directly.', None, 'MEDIUM', 'NO'),
'F03-G01-M02': ('KEEP', 'JUDGMENT', 'Extension.', None, 'MEDIUM', 'NO'),
'F03-G02-M01': ('KEEP', 'JUDGMENT', 'Extension.', None, 'MEDIUM', 'NO'),
'F03-G02-M02': ('KEEP', 'JUDGMENT', 'Extension.', None, 'MEDIUM', 'NO'),
'F03-G03-M02': ('CLARIFY', 'JUDGMENT', 'Accessibility deferral creates inclusion risk (MR-037); re-entry trigger defined but not tied to pilot recruitment criteria.', 'Add pilot recruitment rule as explicit re-entry trigger', 'MEDIUM', 'YES (pilot scope)'),
'F03-G04-M02': ('KEEP', 'JUDGMENT', 'Extension of goals.', None, 'MEDIUM', 'NO'),
'F03-G04-M03': ('CLARIFY', 'SELF_OMISSION', 'SC-001 expected output is a multi-year roadmap (SC-001-G02) and SC3-D04 reuses roadmap/task/review. Deferral may still be right for A-lite, but baseline did not weigh these approved scenario principles.', 'Record SC-001-G02/SC3-D04 in rationale; keep DEFERRED for A-lite pending Owner', 'MEDIUM', 'YES'),
'F03-G05-M03': ('REVIEW', 'CONFIRMED_SOURCE', 'Baseline rationale "mainly A4-A5; outside CORE grades 1-9" contradicts SC-003 (approved Package C decisions) whose scenario is a grade-8 child (A3, inside CORE).', 'Tier stays DEFERRED (not required by any workflow) but rationale -> "CORE-relevant A3 exploration, deferred as non-essential to planning loop"; A3 applicability APPLICABLE', 'HIGH', 'NO (correction of rationale)'),
'F03-G06-M01': ('CLARIFY', 'SELF_OMISSION', 'FI-3.4-004: F03-G06 vs F06-G06 ownership overlap is REVIEW_REQUIRED; baseline ignored it.', 'Mark ownership issue FI-3.4-004 on both modules', 'MEDIUM', 'NO'),
'F03-G06-M02': ('CLARIFY', 'SELF_OMISSION', 'Same FI-3.4-004.', 'Same', 'MEDIUM', 'NO'),
'F05-G05-M01': ('KEEP', 'CONFIRMED_SOURCE', '3.4 §6.2 hard gates MR-016/018/019/021/022/030 before real data; deferral justified.', None, 'HIGH', 'NO'),
'F05-G05-M02': ('KEEP', 'CONFIRMED_SOURCE', 'Same.', None, 'HIGH', 'NO'),
'F06-G03-M01': ('CLARIFY', 'SELF_OMISSION', 'Project doc "bo-chi-so-theo-doi-tre" and SC-002-D02 (learning analytics) exist; baseline did not consider them. Deferral still plausible for A-lite.', 'Cite sources; keep DEFERRED', 'LOW', 'NO'),
'F06-G03-M02': ('KEEP', 'JUDGMENT', 'Follows F06-G03-M01.', None, 'MEDIUM', 'NO'),
'F06-G04-M02': ('CLARIFY', 'SELF_OMISSION', 'SC-001-D02 cause-aware adaptation needs observation -> hypothesis -> verified cause; deferral removes the generated-insight path. Adversarial correction: there is no trend code in the prototype; the only sourced window is 2 weeks (spec-quy-tac L2) and D02 warns against counting fatigue alone.', 'E1 alternative may only flag a 2-week pattern to ask for context (no causal conclusion, no unsourced count threshold)', 'MEDIUM', 'NO'),
'F06-G07-M01': ('KEEP', 'CONFIRMED_SOURCE', 'SC-002-D05: AI homework assessment only in controlled prototype/pilot, not default MVP.', None, 'HIGH', 'NO'),
'F07-G03-M03': ('CLARIFY', 'SELF_OMISSION', 'Prototype sends images to Pal (index.html:1076); TTS is browser-local. Photo capture and recording are two of five Owner-confirmed Plan A features (photo logged PASS 2026-11-05). Deferral is acceptable only for the strict-E1 A-lite variant, not for a Plan-A-aligned variant.', 'Keep DEFERRED for A-lite E1; include capture (F04-G05-M02) and recording path in Plan-A variant', 'MEDIUM', 'YES (variant choice)'),
'F07-G05-M02': ('KEEP', 'CONFIRMED_SOURCE', 'Owner decision: human response deferred. Note 3.4 UC-019/020 envisage human oversight -> conflict recorded in 3.4 as baseline proposal only.', None, 'HIGH', 'NO'),
'F07-G07-M01': ('KEEP', 'JUDGMENT', 'Ops console; DB admin for pilot.', None, 'MEDIUM', 'NO'),
'F07-G07-M02': ('CLARIFY', 'CONFIRMED_SOURCE', '3.4 §9 metric "AI calls per successful outcome" and SC-002-G10 cost-gated rollout are real, but they are validation measures, not an A-lite requirement (A-lite E1 has no AI). Per-device daily cap in Plan A maps better to F07-G03-M02 Execution Budget.', 'When any E2 path is enabled, record AI calls/cost per outcome in F07-G03-M02; F07-G07-M02 stays ADV', 'MEDIUM', 'NO'),
'F08-G01-M01': ('KEEP', 'CONFIRMED_SOURCE', '3.4 UCF-11: integrations not assumed feasible; MR-033.', None, 'HIGH', 'NO'),
'F08-G01-M02': ('KEEP', 'CONFIRMED_SOURCE', 'Same.', None, 'HIGH', 'NO'),
'F08-G02-M01': ('KEEP', 'JUDGMENT', 'Partner extension.', None, 'MEDIUM', 'NO'),
'F08-G02-M02': ('KEEP', 'CONFIRMED_SOURCE', 'Never auto-sent on safety trigger; deferred.', None, 'HIGH', 'NO'),
'F08-G03-M01': ('KEEP', 'CONFIRMED_SOURCE', 'OD-02.', None, 'HIGH', 'NO'),
'F08-G03-M02': ('KEEP', 'CONFIRMED_SOURCE', 'OD-02, FR-05.', None, 'HIGH', 'NO'),
'F08-G04-M01': ('CLARIFY', 'CONFIRMED_SOURCE', 'Plan A (Owner-confirmed 04/11, in device testing) includes geofence events. No inventory item names location, but adversarial review shows it is plausibly mappable to existing IDs: F08-G04-M01/M02 (device consent + staged events), F01-G04-M02 (consent), F06-G01 (events), F04-G07 (parent alert). Location of a child is a distinct sensitive data category.', 'Owner decides whether this mapping is acceptable or a change request is needed; no new ID created', 'MEDIUM', 'YES'),
'F08-G04-M02': ('KEEP', 'JUDGMENT', 'Deferred with integrations.', None, 'MEDIUM', 'NO'),
'F08-G05-M01': ('KEEP', 'CONFIRMED_SOURCE', 'OD-02 + Owner guidance.', None, 'HIGH', 'NO'),
'F08-G05-M02': ('KEEP', 'CONFIRMED_SOURCE', 'Same.', None, 'HIGH', 'NO'),
'F08-G06-M01': ('KEEP', 'JUDGMENT', 'Finance extension.', None, 'MEDIUM', 'NO'),
'F08-G06-M02': ('KEEP', 'JUDGMENT', 'Finance extension.', None, 'MEDIUM', 'NO'),
# ===== FULL modules flagged =====
'F06-G01-M01': ('CLARIFY', 'CONFIRMED_SCRIPT', 'dependency_enablement 4 but only one direct HARD dependent (F06-G02-M01); reports depend on it transitively. Rubric counts direct dependents.', 'enablement 4 -> 3 (direct) with transitive note', 'MEDIUM', 'NO'),
'F04-G02-M01': ('REVIEW', 'CONFIRMED_SOURCE', 'Baseline override E1->E2 contradicts Inventory (E1/Low), 3.4 UC-007 (default E1, LLM optional) and SC-001 §5. Consequence: W1E1 (A-lite) dropped schedule construction. Enablement 4 but 0 direct HARD dependents. Adversarial caveat accepted: no deterministic builder exists today (checkDayK only validates; ordering is done by the LLM prompt), so E1 feasibility is UNKNOWN until a spike.', 'exec E1 default + optional E2; ai_cost_risk L for default path; include in A-lite; enablement 4 -> 3 unless P-E01 accepted; G-Feasibility stays UNKNOWN pending spike (RG-01)', 'HIGH (classification) / LOW (feasibility)', 'NO (restores approved baseline)'),
'F04-G02-M03': ('REVIEW', 'CONFIRMED_SOURCE', 'Prototype/spec show direct parent interaction (warning line, soft-cap "Giữ mức này", presets). Baseline scored adoption N/A. Scope must include approved Owner rules P6-BP-OD-01 (same-constraint relaxation max 60 continuous days; >=7 empty days between similar exceptions), OD-02 (protected_hard_cap vs family_hard, no emergency bypass) and OD-03 (App Default Standard Bar must be vetted, else UNKNOWN). Presets are not automatically Standard Bar: SC-001-D03 separates long-term bar from time-bound exceptions (Thi cử, Nghỉ hè are time-bound).', 'adoption N/A -> 3; scope note adds Standard Bar + time-bounded exceptions with P6-BP-OD-01..03 constraints; unvetted defaults labelled UNKNOWN', 'MEDIUM', 'NO'),
'F04-G01-M01': ('CLARIFY', 'CONFIRMED_SCRIPT', 'parent_value INDIRECT while comparable F04-G03-M01 scored 3; plan/week view is user-facing in prototype.', 'Either both INDIRECT (structure) or plan view value moved to F04-G04-M01; rubric R1.1a rule needed', 'LOW', 'NO'),
'F04-G06-M01': ('REVIEW', 'CONFIRMED_SOURCE', 'Child proposals are core in spec §3-4 and 3.4 UC-010, but approved B01 decisions constrain them: in PARENT_LED a child may express wishes but not create an official Change Request (B01 CR log); proposals need mode CHILD_EXECUTED per child (B01-MS-OD-01/02), UNSET behaves as PARENT_LED (OD-04); 7-day expiry and hard-cap NOT_APPROVABLE apply. Baseline effort 4 assumes the full B01 v3.1 state machine.', 'Minimal capability in A-lite: CR only for children set to CHILD_EXECUTED, single approver, 7-day expiry, hard-cap not approvable; PARENT_LED children use informal wish note. Effort 4 retained for full module', 'MEDIUM', 'YES (A-lite scope)'),
'F02-G05-M02': ('REVIEW', 'CONFIRMED_SOURCE', 'Baseline scored F02-G05-M02 as task/plan feedback ("too hard, too much"; core_loop=Feedback 3; edge to F04-G01-M01). Inventory scope is "Trẻ xem và đề nghị sửa hiểu biết về mình" (agree/contest profile assertions, F02-G05-M02-001). Value reasons and loop step rest on the wrong scope; its STABLE_HIGH result in Phase E is therefore an artefact. The fatigue signal required by SC-001-D02/spec §4 has no clean L3 owner.', 'Rescore F02-G05-M02 on its real scope: core_loop 3 -> 2 (Understand), keep child_value A3 4 (autonomy over how child is described) as hypothesis; edge E015 reason to be rewritten; fatigue signal ownership decision OD-A7', 'HIGH (scope error) / HYPOTHESIS (new values)', 'YES'),
'F05-G01-M01': ('CLARIFY', 'JUDGMENT', 'Ownership ambiguity already recorded in baseline as GAP-16 (adversarial correction: not a self-omission). Group 02 also leaves general conversation outside the clarified category undecided, which bears on Plan A pal-chat. 3.4 UC-017 assigns guidance lookup to F07-G03.', 'Owner decision on parent Pal conversation owner (OD-A6)', 'MEDIUM', 'YES'),
'F06-G02-M01': ('CLARIFY', 'CONFIRMED_SCRIPT', 'R1.1a set INDIRECT for computation modules but F04-G02-M02 (also computation, with visible warnings) keeps numbers; rule wording needs tightening.', 'Rubric note: "own UI or own user decision -> number; else INDIRECT"', 'LOW', 'NO'),
'F06-G04-M01': ('CLARIFY', 'CONFIRMED_SCRIPT', 'Same rubric ambiguity as F06-G02-M01; F06-G02-M02 kept numbers.', 'Same', 'LOW', 'NO'),
'F01-G04-M01': ('BLOCKED', 'CONFIRMED_SOURCE', 'Never independently reviewed; foundation of every workflow; scores capped LOW. Cannot be improved by audit without independent L4 review.', None, 'LOW', 'YES (review authorisation)'),
'F01-G04-M02': ('BLOCKED', 'CONFIRMED_SOURCE', 'Same; legal content of consent unknown (MR-016).', None, 'LOW', 'YES'),
'F01-G05-M01': ('BLOCKED', 'CONFIRMED_SOURCE', 'Never independently reviewed.', None, 'LOW', 'YES'),
'F07-G06-M01': ('BLOCKED', 'CONFIRMED_SOURCE', 'Never independently reviewed; lawful basis UNKNOWN.', None, 'LOW', 'YES'),
'F04-G03-M02': ('CLARIFY', 'SELF_OMISSION', 'FI-3.4-001: overlap between F04-G03 Approval Routing and F04-G06 Plan Approval is REVIEW_REQUIRED; baseline edge F04-G06-M01 -> F04-G03-M02 presumes G03 resolves approver.', 'Tag FI-3.4-001 on edge and modules', 'MEDIUM', 'NO'),
}
rows = []
for mid, r in A.items():
    if mid in M:
        st, basis, finding, prop, conf, appr = M[mid]
    elif r['assessment_level'] == 'FULL':
        st, basis, finding, prop, conf, appr = ('KEEP', 'AUTOMATED', 'No anomaly flagged by automated checks; not individually re-reviewed (FULL, prompt: do not rescore all).', None, 'HYPOTHESIS', 'NO')
    else:
        raise SystemExit('COARSE without manual classification: ' + mid)
    rows.append(dict(module_id=mid, name=r['name'], level=r['assessment_level'], tier=r['tier'], audit_status=st, basis=basis, finding=finding,
                     proposed_change=prop, confidence=conf, owner_approval=appr,
                     auto_flags=[a['id'] + ': ' + a['detail'] for a in auto if mid in a['module']]))
coarse = [x for x in rows if x['level'] == 'COARSE']
assert len(coarse) == 40 and all(x['module_id'] in M for x in coarse)
# every auto flag must be addressed by a manual entry
unaddressed = [a for a in auto if not any(part in M for part in a['module'].split(' vs '))]
json.dump(dict(auto_flags=auto, rows=rows, unaddressed_auto=unaddressed), open(os.path.join(D, 'phase_a.json'), 'w'), ensure_ascii=False, indent=1)
c = collections.Counter(x['audit_status'] for x in rows); cb = collections.Counter(x['basis'] for x in rows if x['audit_status'] != 'KEEP' or x['basis'] != 'AUTOMATED')
print('auto flags', len(auto)); [print(' ', a) for a in auto]
print('status', dict(c)); print('COARSE status', dict(collections.Counter(x['audit_status'] for x in coarse)))
print('basis (manual)', dict(cb)); print('unaddressed', unaddressed)
