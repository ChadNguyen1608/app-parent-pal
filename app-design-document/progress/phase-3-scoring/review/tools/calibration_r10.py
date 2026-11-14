"""CP-02 calibration pilot: first-pass scores with rubric R1.0 (before calibration changes).

Kept for audit only. Final scores live in tier3_data.py (rubric R1.1).
Cohort tuple: (parent_value, child_value) for A2 and A3; values 1-5.
"""
CAL_R10 = {
 # id: (loop, adopt, diff, enab, A2(pv,cv), A3(pv,cv), eff, mnt, op, ai, lat, cx, scal)
 'F01-G02-M01': (2, 2, 2, 5, (2, 1), (2, 1), 3, 2, 'L', 'L', 'M', 4, 'L'),
 'F04-G02-M01': (5, 3, 4, 4, (5, 2), (4, 3), 4, 3, 'L', 'M', 'M', 3, 'M'),
 'F04-G04-M01': (4, 5, 2, 3, (3, 4), (3, 4), 2, 2, 'L', 'L', 'M', 2, 'L'),
 'F05-G01-M01': (3, 3, 4, 2, (4, 3), (4, 4), 4, 5, 'M', 'H', 'M', 5, 'H'),
 'F05-G04-M01': (2, 2, 3, 2, (1, 3), (1, 4), 3, 3, 'M', 'L', 'L', 4, 'M'),
 'F06-G05-M02': (4, 3, 3, 1, (4, 1), (4, 2), 2, 2, 'L', 'L', 'L', 2, 'L'),
 'F07-G01-M02': (2, 1, 2, 4, (1, 1), (1, 1), 3, 3, 'L', 'L', 'M', 3, 'M'),
 'F08-G05-M01': (1, 2, 2, 1, (2, 1), (2, 1), 3, 3, 'M', 'L', 'L', 4, 'M'),
}

FINDINGS = [
 ('CAL-01', 'Foundation modules (F01-G02-M01, F07-G01-M02) received parent/child value 1-2 because they have no direct UX. '
            'This penalises enabling modules for indirect value (3.3 §4.1 note; CP-03 gate).',
  'R1.1: cohort parent/child value may be INDIRECT for ROLE-F/ROLE-S infrastructure; their value is carried by dependency_enablement '
  'and workflow contribution. INDIRECT is not a number and is never averaged.'),
 ('CAL-02', 'adoption_potential was scored by raw frequency: F07-G01-M02 (used invisibly on every Pal answer) got 1, '
            'F01-G02-M01 (one-time pairing) got 2. Frequency is not adoption for set-up or invisible modules.',
  'R1.1: adoption_potential = likelihood that the target user completes/uses the capability as intended at its natural frequency; '
  'NOT_APPLICABLE for invisible infrastructure (no user decision to adopt). Set-up modules judged by completion likelihood.'),
 ('CAL-03', 'F06-G05-M02 child_value scored 1-2 although the report is parent-facing; F05-G04-M01 parent_value scored 1 although parents must '
            'not see the Journal. Low numbers mixed "not intended for this user" with "low benefit".',
  'R1.1: when a user role is not an intended beneficiary by design, record INDIRECT (or N/A with reason), not 1. '
  'Scores 1-5 only for intended beneficiaries.'),
 ('CAL-04', 'core_loop and dependency_enablement double-counted for F04-G02-M01 (both high for the same reason: plan exists).',
  'R1.1: core_loop = the module\'s own contribution to a loop step; dependency_enablement = how many CORE/FOUNDATION modules '
  'hard-depend on it (from CP-03 graph). Enablement is finalised only after the graph is built.'),
 ('CAL-05', 'F05-G01-M01 maintenance 5 and complexity 5 vs F04-G02-M01 4/3: interpretation consistent with anchors (open conversation + '
            'safety layer), no change needed.', 'No change.'),
 ('CAL-06', 'F08-G05-M01 (deferred) received full scores with no decision use; scoring deferred modules adds false precision.',
  'R1.1: DEFERRED modules stay COARSE unless the re-entry rule fires.'),
 ('CAL-07', 'latency_and_reliability was read as performance for some modules and as on-time delivery for reminders.',
  'R1.1 anchor: risk that latency/unavailability breaks the user outcome (L tolerant; M noticeable degradation; H outcome fails, e.g. '
  'missed reminder, safety message delayed).'),
]
