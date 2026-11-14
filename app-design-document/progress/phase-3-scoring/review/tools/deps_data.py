"""CP-03 dependency data (author: Claude). All edges verification=CANDIDATE (3.3 §6: CONFIRMED needs MR-040 review).

Platform bundles are shared services. A module that needs a bundle gets ONE bundle edge, expanded only for graph checks,
instead of inventing many direct module edges (prompt CP-03 rule).
Edge tuple: (source_needs, target_provides, type F/D/P/S/O, HARD|SOFT, lifecycle, reason, workaround, evidence)
"""
BUNDLES = {
 'B_AUTHZ': (['F01-G01-M01', 'F01-G01-M02', 'F01-G04-M01', 'F07-G06-M01'],
             'Authenticated actor + Access Policy decision + purpose/lawful-basis check before any protected read/write.'),
 'B_CHILD_SCOPE': (['F01-G02-M01', 'F01-G03-M01', 'F01-G04-M02', 'F01-G05-M01'],
             'Child-scoped processing needs household/child binding, child profile, consent record and effective autonomy mode.'),
 'B_AI_GATE': (['F07-G03-M01', 'F07-G03-M02', 'F07-G04-M01', 'F07-G05-M01', 'F07-G04-M02'],
             'Any user-facing generated output: router, budget cap, OD-05 approved-scope evidence + output validation, safety rules before AI, pre-release model evaluation.'),
 'B_LIFECYCLE': (['F01-G06-M01', 'F07-G06-M02'],
             'Deletion/export and retention before real personal data (H4 open).'),
}

E = [
 # ---- platform bundle edges (applied to modules listed in BUNDLE_USERS below) ----
 # ---- Identity / family ----
 ('F01-G02-M01', 'F01-G01-M01', 'F', 'HARD', 'BUILD', 'Pairing and Parent PIN need authenticated caregiver account', '', 'G01'),
 ('F01-G02-M02', 'F01-G02-M01', 'F', 'HARD', 'BUILD', 'Members belong to an existing household', '', 'G01'),
 ('F01-G03-M01', 'F01-G02-M01', 'P', 'HARD', 'BUILD', 'Child profile creation scope derives from current household authorization (G14)', '', 'G14'),
 ('F01-G05-M01', 'F01-G03-M01', 'D', 'HARD', 'BUILD', 'Mode is per child subject', '', 'B01 Mode State log'),
 ('F01-G04-M02', 'F01-G03-M01', 'D', 'HARD', 'BUILD', 'Consent recorded per subject', '', 'B01 Consent log'),
 ('F01-G04-M01', 'F01-G05-M01', 'P', 'HARD', 'RUN', 'Delegated rights depend on effective autonomy mode', '', 'P6 Access Policy log'),
 ('F01-G04-M01', 'F01-G04-M02', 'P', 'HARD', 'RUN', 'Authorization checks consent where processing relies on it', '', 'P6/B01'),
 ('F07-G06-M01', 'F01-G04-M02', 'P', 'HARD', 'RUN', 'Purpose-bound access evaluates consent/lawful basis', '', 'B01 Purpose-bound log'),
 ('F01-G03-M02', 'F01-G03-M01', 'F', 'HARD', 'BUILD', 'Corrections target Core Identity facts', 'Direct caregiver edit in Core Identity', 'G14'),
 ('F01-G05-M02', 'F01-G05-M01', 'F', 'HARD', 'BUILD', 'Transitions commit through Mode State', 'Caregiver sets Mode State directly', 'G24'),
 ('F01-G06-M01', 'F07-G06-M02', 'F', 'HARD', 'RELEASE', 'Account deletion executes retention/purge rules', 'Manual purge runbook in pilot (synthetic data only)', 'G03'),
 # ---- Understanding ----
 ('F02-G01-M02', 'F02-G01-M01', 'F', 'HARD', 'BUILD', 'Answers enter profile only via Intake', '', 'G15'),
 ('F02-G05-M01', 'F02-G01-M01', 'D', 'HARD', 'BUILD', 'Profile versions are built from accepted intake facts', '', 'G16'),
 ('F02-G02-M01', 'F01-G03-M01', 'D', 'HARD', 'BUILD', 'Preferences are per child subject', '', 'G15'),
 ('F02-G06-M02', 'F02-G05-M01', 'F', 'HARD', 'BUILD', 'Corrections apply to remembered profile facts', '', 'G17'),
 ('F02-G05-M02', 'F04-G01-M01', 'F', 'SOFT', 'RUN', 'Child feedback targets plan/task items', 'Free-text feedback without plan link', 'G17'),
 ('F02-G03-M01', 'F02-G03-M02', 'S', 'HARD', 'RELEASE', 'Observations must pass non-labeling review before display', '', 'G16'),
 # ---- Orientation ----
 ('F03-G05-M01', 'F07-G01-M02', 'D', 'HARD', 'RUN', 'Grounded recommendation retrieves approved knowledge first', '', '3.3 §6.1 / G19'),
 ('F03-G05-M01', 'F07-G02-M02', 'D', 'HARD', 'RUN', 'Recommendations cite source tier (3.3 §6.1 example)', '', '3.3 §6.1'),
 ('F03-G05-M01', 'F03-G03-M01', 'D', 'SOFT', 'RUN', 'Age-appropriate scope', 'Age filter from Core Identity', 'G19'),
 ('F03-G05-M02', 'F03-G05-M01', 'F', 'HARD', 'BUILD', 'Review acts on generated recommendations', '', 'G20'),
 ('F03-G04-M01', 'F03-G03-M01', 'D', 'SOFT', 'RUN', 'Goal options per stage', 'Free-form goals', 'G19'),
 ('F04-G01-M01', 'F03-G04-M01', 'F', 'SOFT', 'RUN', 'Plans may link to goals', 'Plans without goals', 'G19/G21'),
 ('F04-G01-M01', 'F03-G05-M02', 'F', 'SOFT', 'RUN', 'Accepted recommendations become plan items', 'Parent adds items manually', 'G20'),
 # ---- Planning ----
 ('F04-G01-M02', 'F04-G01-M01', 'F', 'HARD', 'BUILD', 'Templates instantiate plan structure', '', 'G21'),
 ('F04-G02-M01', 'F04-G01-M01', 'F', 'HARD', 'BUILD', 'Schedule is a version of a plan', '', 'G21'),
 ('F04-G02-M01', 'F02-G01-M01', 'D', 'HARD', 'RUN', 'Needs timetable/fixed activities/age from intake', '', 'prototype'),
 ('F04-G02-M01', 'F03-G03-M01', 'D', 'SOFT', 'RUN', 'Age default budgets (prototype defaultBudget)', 'Hard-coded defaults', 'prototype'),
 ('F04-G02-M01', 'F04-G02-M03', 'S', 'HARD', 'RUN', 'Every drafted schedule validated against hard/soft caps before release', '', 'P6 Balanced Planning log'),
 ('F04-G02-M02', 'F04-G02-M01', 'F', 'SOFT', 'RUN', 'Conflict check on constructed schedule (3.3 §6.1: may use external calendar)', 'External calendar source', '3.3 §6.1'),
 ('F04-G02-M03', 'F03-G03-M01', 'D', 'SOFT', 'RUN', 'Age-based caps', 'Owner-approved fixed caps', 'P6'),
 ('F04-G03-M01', 'F04-G01-M01', 'F', 'HARD', 'BUILD', 'Tasks belong to plan', '', 'G21'),
 ('F04-G03-M02', 'F01-G04-M01', 'P', 'HARD', 'RUN', 'Routing resolves eligible approver from current authority', '', 'G04'),
 ('F04-G06-M01', 'F04-G03-M02', 'P', 'HARD', 'RUN', 'Change requests need an eligible approver', 'Restrict edits to primary caregiver', 'G04'),
 ('F04-G06-M01', 'F04-G02-M03', 'S', 'HARD', 'RUN', 'Approval binds Balanced Planning verdict (B01 v3.1)', '', 'G04/ADD'),
 ('F04-G06-M01', 'F04-G01-M01', 'F', 'HARD', 'BUILD', 'Requests target plan version/lock', '', 'G04'),
 ('F04-G06-M02', 'F04-G01-M01', 'D', 'HARD', 'BUILD', 'History records committed plan versions', '', 'G04'),
 ('F04-G04-M01', 'F04-G03-M01', 'D', 'HARD', 'RUN', 'Daily view shows owned tasks for today', '', 'G22'),
 ('F04-G04-M02', 'F04-G04-M01', 'F', 'HARD', 'BUILD', 'Support attaches to a displayed task', '', 'G22'),
 ('F04-G04-M02', 'F07-G01-M01', 'D', 'SOFT', 'RUN', 'Approved help templates', 'Static hints in app bundle', 'G22'),
 ('F04-G05-M01', 'F04-G04-M01', 'F', 'HARD', 'BUILD', 'Check-off acts on a displayed task', 'Check-off from notification action (Plan A)', 'G22'),
 ('F04-G05-M02', 'F04-G04-M01', 'F', 'HARD', 'BUILD', 'Evidence attaches to a task', '', 'G05'),
 ('F04-G07-M01', 'F04-G03-M01', 'D', 'HARD', 'RUN', 'Reminders derived from scheduled tasks', '', 'G22'),
 ('F04-G07-M01', 'F04-G07-M02', 'P', 'HARD', 'RUN', 'Delivery obeys quiet hours/preferences', 'Fixed default quiet hours', 'G22'),
 # ---- Companion / Journal ----
 ('F05-G01-M01', 'F05-G01-M02', 'S', 'HARD', 'RELEASE', 'Guardrails and output validation before any answer', '', 'G02'),
 ('F05-G01-M01', 'F07-G01-M02', 'D', 'HARD', 'RUN', 'Internal-first answers (FR-02 / KMAP §1.1)', '', 'G02'),
 ('F05-G01-M01', 'F07-G02-M02', 'D', 'HARD', 'RUN', 'Per-claim source and "chưa kiểm chứng" label', '', 'G02 FR02'),
 ('F05-G01-M01', 'F07-G02-M01', 'O', 'SOFT', 'RUN', 'Verification queue for external claims', 'Manual queue file (ref-hang-doi-kiem-chung.md)', 'G02 FR02'),
 ('F05-G01-M01', 'F02-G05-M01', 'D', 'SOFT', 'RUN', 'Pal memory/profile context', 'Stateless answers', 'CLAUDE.md memory'),
 ('F05-G01-M02', 'F07-G01-M01', 'D', 'HARD', 'RELEASE', 'Reviewed static safety catalog (OD-03)', '', 'OD-03'),
 ('F07-G05-M01', 'F07-G01-M01', 'D', 'HARD', 'RELEASE', 'Static trusted-adult / 111/113/115 content', '', 'OD-03'),
 ('F05-G02-M02', 'F05-G02-M01', 'F', 'HARD', 'BUILD', 'Controls govern check-in invitations', '', 'G12'),
 ('F05-G02-M01', 'F04-G03-M01', 'D', 'SOFT', 'RUN', 'Timing from schedule (MR-032)', 'Fixed time window', 'G12'),
 ('F05-G03-M02', 'F05-G03-M01', 'F', 'HARD', 'BUILD', 'Review of drafted reflection', '', 'G12'),
 ('F05-G03-M01', 'F07-G01-M01', 'D', 'HARD', 'RUN', 'Approved prompt templates', '', 'G12'),
 ('F05-G04-M02', 'F05-G04-M01', 'F', 'HARD', 'BUILD', 'Retrieval over private entries', '', 'G13'),
 ('F05-G04-M01', 'F05-G06-M02', 'D', 'HARD', 'RELEASE', 'Journal data must have deletion lineage before real data (3.3 §6.1 pattern)', '', '3.3 §6.1/G03'),
 ('F05-G04-M01', 'F07-G06-M01', 'P', 'HARD', 'RUN', 'Private entries need purpose-bound access (3.3 §6.1 example)', '', '3.3 §6.1'),
 ('F05-G06-M01', 'F05-G04-M01', 'F', 'HARD', 'BUILD', 'Sharing grants over entries', '', 'G03'),
 ('F05-G05-M01', 'F05-G06-M02', 'D', 'HARD', 'RELEASE', 'Derived insight deletion (3.3 §6.1 example)', '', '3.3 §6.1'),
 ('F05-G05-M01', 'F05-G04-M02', 'D', 'HARD', 'RUN', 'Insight derived from retrieved entries', '', 'G13'),
 ('F05-G05-M02', 'F05-G05-M01', 'F', 'HARD', 'BUILD', 'Correction of insights', '', 'G13'),
 ('F05-G06-M02', 'F07-G06-M02', 'F', 'HARD', 'RELEASE', 'Deletion executes retention/backup purge', '', 'G03'),
 # ---- Tracking / reports ----
 ('F06-G01-M01', 'F04-G05-M01', 'D', 'HARD', 'RUN', 'Completion events come from check-off', '', 'G06'),
 ('F06-G01-M01', 'F06-G01-M02', 'D', 'SOFT', 'RUN', 'Events carry source type', 'Single implicit source', 'G05/G06'),
 ('F06-G02-M01', 'F06-G01-M01', 'D', 'HARD', 'RUN', 'Progress computed from events', '', 'G06'),
 ('F06-G02-M01', 'F04-G03-M01', 'D', 'HARD', 'RUN', 'Denominator = planned tasks', '', 'G06'),
 ('F06-G02-M02', 'F06-G02-M01', 'F', 'HARD', 'BUILD', 'Exceptions adjust progress windows', '', 'G06'),
 ('F06-G04-M01', 'F06-G02-M01', 'D', 'HARD', 'RUN', 'Trends over progress results', '', 'G23'),
 ('F06-G05-M02', 'F06-G02-M01', 'D', 'HARD', 'RUN', 'Report content', '', 'G05'),
 ('F06-G05-M02', 'F06-G05-M01', 'P', 'HARD', 'RUN', 'Audience-specific disclosure (child vs parent view)', '', 'G05'),
 ('F06-G05-M02', 'F06-G04-M01', 'D', 'SOFT', 'RUN', 'Trend section', 'Current-week only', 'G23'),
 ('F06-G06-M01', 'F06-G05-M02', 'D', 'HARD', 'RUN', 'Review session uses summary', '', 'G23'),
 ('F06-G06-M02', 'F06-G06-M01', 'F', 'HARD', 'BUILD', 'Handoff from review outcome', '', 'G23'),
 ('F06-G06-M02', 'F04-G06-M01', 'F', 'HARD', 'RUN', 'Outcome becomes a plan change request', 'Parent edits plan directly', 'G23'),
 ('F06-G04-M02', 'F06-G04-M01', 'D', 'HARD', 'RUN', 'Insights interpret deterministic trends', '', 'G23'),
 ('F06-G04-M02', 'F02-G03-M02', 'S', 'HARD', 'RELEASE', 'Non-labeling review of generated interpretation', '', 'G23'),
 ('F06-G07-M01', 'F06-G01-M02', 'D', 'HARD', 'RUN', 'Assessment provenance (parent-confirmed vs teacher-verified)', '', 'G05'),
 # ---- Knowledge / AI platform ----
 ('F07-G01-M02', 'F07-G01-M01', 'D', 'HARD', 'BUILD', 'Retrieval over approved content', '', 'G10'),
 ('F07-G01-M01', 'F07-G02-M01', 'O', 'HARD', 'RELEASE', 'Only editorially approved content is published', 'Manual review in doc process', 'G10'),
 ('F07-G02-M02', 'F07-G01-M01', 'D', 'HARD', 'BUILD', 'Provenance attached to content revisions', '', 'G10'),
 ('F07-G03-M01', 'F07-G04-M01', 'S', 'HARD', 'RUN', 'Route guards use approved-scope policy (OD-05)', '', 'G02/OD-05'),
 ('F07-G03-M01', 'F07-G03-M02', 'O', 'HARD', 'RUN', 'Budget reservation before model dispatch', '', 'G11'),
 ('F07-G03-M01', 'F07-G05-M01', 'S', 'HARD', 'RUN', 'Safety rules before routing (H3 closed)', '', 'G02'),
 ('F07-G04-M01', 'F07-G04-M02', 'O', 'SOFT', 'RELEASE', 'Policy regression cases in evaluation suite', 'Manual review sample', 'G11'),
 ('F07-G03-M03', 'F07-G03-M01', 'F', 'HARD', 'BUILD', 'Modality orchestration behind router', '', 'G11'),
 ('F07-G07-M02', 'F07-G03-M02', 'D', 'HARD', 'RUN', 'Cost ops reconcile budget reservations', '', 'G09'),
 # ---- Ecosystem (deferred) ----
 ('F08-G01-M02', 'F08-G01-M01', 'F', 'HARD', 'BUILD', 'Review of staged school data', '', 'G07'),
 ('F08-G02-M02', 'F08-G02-M01', 'F', 'HARD', 'BUILD', 'Referral to discovered expert', '', 'G07/G24'),
 ('F08-G03-M02', 'F08-G03-M01', 'D', 'HARD', 'RUN', 'Matching over directory listings', '', 'G24'),
 ('F08-G03-M02', 'F02-G02-M01', 'D', 'SOFT', 'RUN', 'Optional preferences', 'Broad matches', 'G24'),
 ('F08-G04-M02', 'F08-G04-M01', 'P', 'HARD', 'RUN', 'Import requires device consent', '', 'G07'),
 ('F08-G05-M02', 'F08-G05-M01', 'F', 'HARD', 'BUILD', 'Transactions on catalog offers', '', 'G08'),
 ('F08-G06-M02', 'F08-G06-M01', 'F', 'SOFT', 'RUN', 'Expenses against budgets', 'Expense log without budget', 'G08'),
 ('F01-G06-M03', 'F01-G06-M02', 'F', 'HARD', 'BUILD', 'Billing facts project entitlements', '', 'G09'),
]

# Modules using each bundle (HARD P/S unless noted). Lifecycle: RUN for authz, RELEASE for AI gate and lifecycle.
BUNDLE_USERS = {
 'B_AUTHZ': 'ALL_PERSONAL',          # every module with data_class != NONE (except the bundle members themselves)
 'B_CHILD_SCOPE': 'ALL_CHILD',       # every module with data_class CHILD/JOURNAL (except members)
 'B_AI_GATE': 'ALL_E2',              # every module with exec_class E2/E3 + F05-G01-M02 (output validation) excluded as member-adjacent
 'B_LIFECYCLE': 'ALL_CHILD_REAL_DATA',  # RELEASE-only: before real child data
}
