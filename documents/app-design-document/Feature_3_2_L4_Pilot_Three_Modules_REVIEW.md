# PARENT-PAL — L4 Pilot Decomposition: Three Representative L3

**Version:** 0.1 · **Date:** 2026-11-10 · **Status:** `P0–P4_DRAFT / REVIEW_ONLY`  
**Method gate:** M-Q1..M-Q6 = A, approved by Product Owner.  
**Canonical input:** Blueprint 3.2-R1 on `main`, PR #16 merged; 3.3, 3.4, L3C-01..07, L3T-01..08, Master Research Backlog.  
**Scope:** `F01-G04-M01`, `F06-G07-M01`, `F04-G02-M03`.  
**Explicit exclusions:** no edits to 3.2/3.3/3.4, no official new L4 IDs, no approved child legal rights/AI grading/safety thresholds, no code, no real-child test, no MVP decision.

## 1. P0 — Source, ownership, baseline

| L3 | Canonical owner / business outcome | Existing L4 | Sources |
|---|---|---|---|
| `F01-G04-M01` Access Policy | F01; authorization decision by actor, action, resource, purpose, scope; no consent ledger mutation | `F01-G04-M01-001` — Phân quyền theo chủ thể và mục đích (illustrative, preserve ID) | L3C-03, 3.2 §5, UC-004/007/013/015, MR-016/017/021/035 |
| `F06-G07-M01` Academic Assessment | F06-G07; rubric-based assessment with provenance and correction; not homework submission or authorized reporting | None; L4 pending | L3C-02, L3T-02, SC-002, AUD-05, MR-023/025/030/031 |
| `F04-G02-M03` Balanced Planning Validation | F04; evaluate proposed schedule against family Standard Bar, hard/soft limits, protected leisure and timeboxed exceptions; no goal mutation | None; L4 pending | L3C-06, SC-001, AUD-08, UC-007/010, MR-012/025/035 |

**Critical owner separations:** `F01-G04-M02` owns consent ledger; `F01-G05` owns autonomy mode state. `F04-G05-M02` owns homework evidence submission; `F06-G05` owns authorized reports. `F04-G02-M02` owns time-slot conflict detection/alternatives; `F04-G02-M01` owns schedule construction; `F04-G06` owns change request/approval; `F03` owns goal and roadmap.

## 2. P1–P2 — Candidate L4 and boundary decisions

| Candidate / official illustrative ID | Primary outcome | Boundary decision | Why |
|---|---|---|---|
| `F01-G04-M01-001` | `ALLOW/DENY/INDETERMINATE` authorization decision with policy reason and scope | **KEEP + refine**; do not rename/reassign ID | Core published illustrative L4; deny if indeterminate |
| `CAND-F01-G04-M01-effective-access-preview` | Authorized actor receives safe preview of *effective* permissions without protected content | **SPLIT** from evaluation | Different user-facing outcome; needs anti-enumeration tests |
| `CAND-F01-G04-M01-policy-conflict-review` | Operator receives policy-conflict case for human resolution without granting access | **SPLIT, REVIEW** | Distinct operations lifecycle; verify whether F07 governance should own case workflow |
| `CAND-F06-G07-M01-rubric-eligibility` | Versioned rubric is applicable to a specific submission or returns reason not assessable | **SPLIT, REVIEW** | Rubric version/provenance may warrant independent release gate |
| `CAND-F06-G07-M01-assess-submission` | Provisional assessment findings tied to evidence and rubric, or explicit unable-to-assess | **KEEP as core** | Assessment ≠ completion ≠ teacher verification |
| `CAND-F06-G07-M01-review-uncertainty` | Ambiguous/low-confidence assessment is routed to authorized human review | **SPLIT, REVIEW** | Human queue and case lifecycle; may be merged if no independent operation |
| `CAND-F06-G07-M01-correct-assessment` | Authorized reviewer produces attributed, versioned correction | **SPLIT** | Separate write permission and audit trail |
| `CAND-F04-G02-M03-validate-balance` | Schedule receives hard/soft constraint findings without silently changing goals/plan | **KEEP as core** | Deterministic, independently testable outcome |
| `CAND-F04-G02-M03-evaluate-exception` | Proposed timeboxed exception receives validation decision and approval requirement | **SPLIT** | Explicit exception lifecycle, not self-approval |
| `CAND-F04-G02-M03-expiry-recheck` | Expired exception is flagged and a revalidation/restoration request is produced | **SPLIT, REVIEW** | Triggered by time/state, requires idempotent handoff; schedule mutation owned elsewhere |

**Pilot count:** 10 candidate outcomes across 3 L3 (1 existing illustrative L4 ID + 9 temporary IDs). **Not approved as the final count.** No numeric L4 quota. No new official L4 IDs assigned.

## 3. P3 — Contract catalog

All ten entries inherit: `definition_status=BASELINE_PROPOSED`, `assessment_status=NOT_EVALUATED`, `delivery_status=NOT_PLANNED`, `mvp_decision=NOT_DECIDED`. All new IDs remain `CAND-`. `research_refs` are existing MR IDs only; no research item is considered resolved. Every operation must evaluate permission **before** protected reads, inference, cache, model calls or mutations.

### 3.1 Access Policy — F01-G04-M01

**Shared context:** target users = authorized parent, child/youth, adult account owner, authorized operator/service; value = prevent unauthorized access while allowing legitimate actions; classification = `identity_and_policy_metadata` (working label, taxonomy UNKNOWN); primary data owner = F01-G04-M01 for policy evaluation/decisions, while source consent records remain F01-G04-M02. Default execution E0/E1 deterministic, AI not an authority. Cost risk Low for rules-only, external enforcement/ops cost UNKNOWN.

| L4 | Trigger / preconditions | Input → output | Main flow / alternatives | Acceptance and failure recovery |
|---|---|---|---|---|
| `F01-G04-M01-001` | `authorize(action)`; authenticated actor, resource identifier and purpose; missing policy data is allowed as *input state* | actor, subject, resource, action, purpose, family relationship, consent/autonomy policy versions → decision `ALLOW/DENY/INDETERMINATE`, reason code, allowed scope, policy version | Verify identity → resolve applicable authoritative policies → deny on conflict/unknown → return scoped decision; alt: revoked consent, stale policy, multi-guardian conflict, A5 transition | No protected data read before decision; `INDETERMINATE` never grants; stale decision cannot authorize later mutation; no LLM override |
| `CAND-F01-G04-M01-effective-access-preview` | Authorized actor requests “who can access what?”; must have metadata-view authority | actor, target subject, policy references → minimal permissions summary + unknowns (no child content) | Authorize metadata-view → compute effective rights → redact unrelated identities; alt: enumeration, ambiguous guardianship, stale policy | No list of other family/child resources to unauthorized caller; preview never becomes executable grant |
| `CAND-F01-G04-M01-policy-conflict-review` | Conflicting policy/guardian/consent state detected; operator authorized for case metadata | conflict reference, policy version hashes, actors → non-sensitive review case ID/status, no permission grant | Detect conflict → create/reuse review case → notify approved operator; alt: duplicate event, operator unapproved, unresolved dispute | Duplicate input does not create duplicate cases; no auto-allow; case data excludes raw Journal/assessment content |

**Boundary:** consent capture/revoke belongs F01-G04-M02; autonomy transitions F01-G05; purpose-bound access to private Journal additionally F07-G06. Policy preview is not consent or sharing. **Open:** conflict-review workflow owner (F01 vs F07) and legally valid guardian authority.

### 3.2 Academic Assessment — F06-G07-M01

**Shared context:** target users = learner, authorized parent, authorized reviewer; value = credible feedback with limitations, not fabricated scores; primary owner = F06-G07-M01 for assessment result and revision; input submission owner = F04-G05-M02; authorized reporting owner = F06-G05; classification = `child_education_contextual` (working label, taxonomy UNKNOWN). AI default E0/E1 when rubric/rules suffice; E2 multimodal only after validated benchmarks, authorization and budget; cost risk UNKNOWN.

| L4 | Trigger / preconditions | Input → output | Main flow / alternatives | Acceptance and failure recovery |
|---|---|---|---|---|
| `CAND-F06-G07-M01-rubric-eligibility` | Assessment requested; submission metadata available and actor authorized | task type, cohort, curriculum, rubric ID/version, evidence source → `ELIGIBLE/INELIGIBLE/UNKNOWN`, reason, locked rubric reference | Validate provenance/version/applicability → lock rubric reference; alt: no rubric, outdated, wrong grade, source unverified | No grade from missing/inapplicable rubric; preserve explicit unknown, never silently substitute rubric |
| `CAND-F06-G07-M01-assess-submission` | Eligible rubric and authorized evidence access | submission reference, permitted evidence, locked rubric → provisional findings, evidence links, uncertainty, `UNABLE_TO_ASSESS` | Authorize → load minimum evidence → assess via validated strategy → persist provisional result with provenance; alt: unreadable handwriting, partial answer, unsupported format, timeout | “Submitted” ≠ “correct”; unreadable is not 0; no teacher-verified flag without teacher source; provider failure leaves submission unchanged |
| `CAND-F06-G07-M01-review-uncertainty` | Provisional result requires human review under policy | result ID, uncertainty/review reason, reviewer authorization → review case with pending status | Apply reviewed routing rules → enqueue idempotently → expose minimum needed evidence; alt: no authorized reviewer, queue timeout | No invented confidence threshold; pending does not publish as verified; no unapproved reviewer access |
| `CAND-F06-G07-M01-correct-assessment` | Reviewer submits correction with authorization | assessment ID/version, correction reason, reviewer identity, evidence → new version, attribution, review status | Reauthorize → check version → record immutable correction link → make result available under reporting policy; alt: stale version, revoked reviewer, conflicting edits | Original assessment preserved in audit lineage; only authorized correction; F06-G05 independently controls audience of reports |

**Boundary:** grading a handwritten image is an execution strategy within assessment, not a new L4 just because vision model is used. Teacher verification requires independent source validation, not “reviewer clicked approve”. **Open:** rubric ownership/versioning, teacher verification policy, Vietnamese handwriting benchmarks, provider retention and pricing.

### 3.3 Balanced Planning Validation — F04-G02-M03

**Shared context:** target users = parent/child/youth/adult according to authorized autonomy; value = feasible plan with visible trade-offs, protected leisure and explicit exceptions; primary owner = F04-G02-M03 for validation findings; F03 owns goals and Standard Bar intent, F04-G02-M01 owns schedule state, F04-G06 owns approval state. Classification = `family_planning_and_wellbeing_contextual` (working label). Execution E0/E1 rules-first; E2 explanation optional only after privacy/cost review; AI cost Low for E0/E1, E2 cost UNKNOWN.

| L4 | Trigger / preconditions | Input → output | Main flow / alternatives | Acceptance and failure recovery |
|---|---|---|---|---|
| `CAND-F04-G02-M03-validate-balance` | Create/change plan draft; authoritative family bar available or explicitly UNKNOWN | schedule, age context, family Standard Bar version, hard/soft constraints, protected leisure → findings by severity, affected slots, missing inputs | Authorize → normalize times/durations → evaluate hard then soft rules → explain evidence; alt: overlapping activities, missing school hours, ambiguous timezone | Same duration counted once in load totals; hard constraints cannot be silently waived; no universal clinical limits invented; no schedule mutation |
| `CAND-F04-G02-M03-evaluate-exception` | Request temporary exam/other exception; authorized requester | constraint, reason, proposed start/end, affected leisure, requested approver → `VALID/NEEDS_APPROVAL/REJECTED/UNKNOWN`, proposed exception record | Validate allowed scope + finite dates → flag protected constraints → route proposal to F04-G06; alt: no end date, unauthorized requester, permanent exception | No automatic approval or silent Standard Bar change; timeboxed request retains reason and expiry; hard protected policy cannot be bypassed by ordinary request |
| `CAND-F04-G02-M03-expiry-recheck` | Scheduled or event-triggered expiry of approved exception | approved exception ID/version, current plan, Standard Bar → `EXPIRED/ACTIVE/UNKNOWN`, revalidation findings, restore/change request | Check authoritative expiry → idempotently flag → send proposal to F04-G06 / F04-G02-M01; alt: changed plan, repeated job, clock skew | Never silently overwrite plan; repeated trigger creates one outstanding request; if source missing, flag for review not auto-restore |

**Boundary:** detection of colliding time slots and suggesting alternative slots belong F04-G02-M02; direct editing/commit belongs F04-G02-M01 and F04-G06; goals/Standard Bar ownership belongs F03. No automatic changes to child development goals or medical interpretation.

## 4. Six-cohort contract and authorization (applies to every candidate)

For **each** L4 above, the six entries below are inherited by reference to its module matrix; the individual L4 must still record its own A0–A5 applicability and any override before P6. `evidence_confidence=UNKNOWN` for all cohorts at this pilot stage. Actor/approval labels are **proposals**, not verified legal permissions. `UNKNOWN` is deny-by-default for protected operations.

| L3 / cohorts | A0 (0–2) | A1 (3–5) | A2 (6–10) | A3 (11–14) | A4 (15–17) | A5 (18–23) |
|---|---|---|---|---|---|---|
| Access Policy (all 3 L4) | caregiver-facing, child data protected | caregiver-facing, child data protected | parent/child supervised; consent unknown | child active + authorized scope | youth privacy controls, guardianship unknown | independent adult owner; no default parent access |
| Academic Assessment (all 4 L4) | school rubric NOT_APPLICABLE; caregiver observation via other module | school rubric NOT_APPLICABLE; developmental observation via other module | CONDITIONAL grade-appropriate, supported | CONDITIONAL active learner | CONDITIONAL youth with privacy | CONDITIONAL adult self-directed |
| Balanced Planning (all 3 L4) | caregiver-planned routines | caregiver-planned play/routines | parent-led/child-supported | child may propose, approval by policy | youth-directed within authorized scope | adult-controlled, optional sharing |

**Common six-cohort field interpretation for each L4:** `interaction_pattern` = cell above; `authorized_actor` = only actor with current policy decision (A0/A1 caregiver when legally valid; A2–A4 actor determined by policy; A5 adult owner); `approval_actor` = F01/F04 authoritative policy or adult owner, never LLM; `data_scope` = minimum authorized child/family/assessment/schedule resource for that L4; `alternative_path` = denied/unknown → no protected read, safe explanation, authorized review or manual action; `evidence_confidence` = UNKNOWN. For academic A0/A1, `NOT_APPLICABLE` applies to school-grading outcome and must not be turned into an automatic low score. For Access Policy, authorization engine must still protect A0/A1 data; no child-facing UI is implied.

**L4-specific overrides:**
- `effective-access-preview`: authorized_actor needs metadata-view permission, not merely read permission for content.
- `policy-conflict-review`: authorized_actor is an approved operator for minimal case metadata, not automatically any parent.
- `review-uncertainty` and `correct-assessment`: reviewer must hold a specific review/correction permission; learner/parent status alone is insufficient.
- `evaluate-exception`: requester may propose; only authoritative approver may commit an exception.
- `expiry-recheck`: service trigger may flag status but may not silently mutate schedule.

## 5. Dependency candidates and trace

All edges below are **CANDIDATE**, not confirmed technical dependencies. Criticality is a design hypothesis, not an implementation verdict. `cohort_scope=A0..A5` unless stated; `evidence_refs` are source traces, not proof of runtime architecture.

| Source L3 → Target | Type / criticality / required_for | Reason / workaround |
|---|---|---|
| F01-G04-M01 → F01-G04-M02 | D/P, HARD, RUN | Consent status when relevant; no consent → deny protected action; trace MR-017 |
| F01-G04-M01 → F01-G05-M01 | P, HARD, RUN | Current autonomy state; unknown → deny mutation; trace MR-035 |
| F01-G04-M01 → F07-G06-M01 | P/S, HARD, RELEASE | Purpose-bound private data; no authorized purpose → deny; trace L3C-03 |
| F06-G07-M01 → F04-G05-M02 | F/D, HARD, RUN | Submission reference, not duplicate submission storage; mock for unit test only; L3C-02 |
| F06-G07-M01 → F01-G04-M01 | P, HARD, RUN | Authorization before assessment evidence; no fallback to unauthorized access |
| F06-G07-M01 → F07-G02-M02 | D, SOFT, RELEASE | Rubric/source provenance validation; if unavailable, no unsupported rubric grading |
| F04-G02-M03 → F03-G04 | D, HARD, RUN | Approved family goals/Standard Bar intent; missing → explicit UNKNOWN |
| F04-G02-M03 → F04-G02-M01 | F/D, HARD, RUN | Plan draft/version; missing → cannot validate |
| F04-G02-M03 → F04-G06-M01 | F/P, HARD, RELEASE | Exception approval and restoration request; pending → no mutation |
| F04-G02-M03 → F04-G02-M02 | F, SOFT, RUN | Schedule collisions/alternatives delegated to conflict owner; independent balance evaluation possible |

**Trace:** Access: UC-004/007/013/015, L3C-03, MR-016/017/021/035. Assessment: SC-002, L3T-02, L3C-02, AUD-05, UC gap `AUD-01` (new UC only as candidate, not UC-###). Balance: SC-001, UC-007/010, L3C-06, AUD-08, MR-012/025/035. No existing 3.4 UC is claimed to fully specify academic assessment.

## 6. P4 — Test design, not test execution

Test fixture definitions, 43 synthetic cases, expected results and coverage map are in `Feature_3_2_L4_Pilot_Test_Cases_REVIEW.md`. Cases use deterministic synthetic users, family relationships, schoolwork, schedule and rubric; **no real child data**. They are specification tests (Given/When/Then), not executed unit/integration tests. Any `UNKNOWN` policy or benchmark means **expected denial, deferral or review**, not fabricated PASS.

## 7. P5 — Issue and challenge register

| Issue | Severity | What must be decided / validated | Proposed owner |
|---|---|---|---|
| PILOT-01 | BLOCKER for release | Guardian/child/A5 permission and consent legal matrix; cross-family access, revocation | Legal + Privacy + Product |
| PILOT-02 | HIGH | Whether policy conflict case lifecycle belongs F01 or F07 governance | Product + Security |
| PILOT-03 | BLOCKER for AI grading | Approved curriculum rubrics, source versions, quality benchmark for handwriting/vision, human oversight | Education expert + AI QA |
| PILOT-04 | HIGH | Separate assessment from teacher verification and report audience; role definitions | Product + Privacy |
| PILOT-05 | HIGH | Balance Standard Bar hard/soft semantics, protected leisure and exam exception scope; no unsupported health thresholds | Product + Child-development expert |
| PILOT-06 | HIGH | Timebox expiry handling, authority to restore, retry/idempotency and concurrency | Product + Engineering |
| PILOT-07 | HIGH | L4 split/merge: rubric eligibility vs assessment; uncertainty queue vs correction; policy conflict owner | Product + Engineering |
| PILOT-08 | HIGH | Six cohort evidence, accessibility and alternate interaction; permissions not inferred from age UX | UX Research + Legal |
| PILOT-09 | HIGH | Research refs and 3.4 UC coverage gaps for academic assessment | Research + Product |
| PILOT-10 | HIGH | Operational data taxonomy, retention, audit logs, provider cache/retention, AI budget | Security + Data + AI Ops |

**Gate status:** G-Legal=UNKNOWN; G-Privacy=UNKNOWN; G-Safety=UNKNOWN; G-Feasibility=UNKNOWN (pilot level; reassess per L4/cohort/data purpose). This is not a release readiness judgment or a test result.

## 8. P5/P6 — Owner questions and next action

1. **P-Q1:** Accept **10 candidates** as review scope (not final IDs/count), or request split/merge changes? Recommended: accept for P5 challenge.
2. **P-Q2:** Keep policy conflict review under F01 temporarily while investigating F07 owner? Recommended: keep as `BOUNDARY_UNKNOWN`, no official ID.
3. **P-Q3:** Keep rubric eligibility and uncertainty review separate for P5 evidence, without assuming implementation services? Recommended: yes.
4. **P-Q4:** Keep timeboxed exception validation and expiry recheck separate, with F04-G06 approving changes? Recommended: yes.
5. **P-Q5:** Approve the synthetic test coverage as a **test-design baseline**, while acknowledging no tests executed and gates UNKNOWN? Recommended: yes.
6. **P-Q6:** After P5 review, should we draft the L4 canonical diff and official IDs as a **separate gate**? Recommended: yes; do not edit canonical in this PR.

**Current status:** P0–P4 draft complete; P5 independent review and P6 official-ID/canonical approval pending. Do not merge PR or treat candidate L4 as approved merely because methodology was approved.
