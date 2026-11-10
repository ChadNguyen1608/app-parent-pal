# PARENT-PAL — L4 Pilot Synthetic Test Cases

**Version:** 0.1 · **Date:** 2026-11-10 · **Status:** `TEST_DESIGN_ONLY / NOT_EXECUTED`  
**Source:** `Feature_3_2_L4_Pilot_Three_Modules_REVIEW.md` and approved M-Q1..M-Q6.  
**Total:** 43 designed cases = 12 Access + 16 Assessment + 15 Balance. **0 executed, 0 actual pass/fail.**  
**Test IDs:** `TC-L4-A##`, `TC-L4-B##`, `TC-L4-C##`. Synthetic fixtures only; no real children's records. Expected results are **proposed contracts** for product review, not verified policies or clinical/education standards.

## 1. Shared synthetic fixtures

| Fixture | Synthetic data | Note |
|---|---|---|
| FAMILY-A | Guardian P1, guardian P2, child C8 (age 8), youth Y16 (age 16) | Relationship and authorization deliberately separate; age alone never grants access |
| FAMILY-B | Unrelated guardian PX, child CX | Cross-family negative tests |
| ADULT-A5 | A19, age 19, owns own account | No default guardian access |
| ACTOR-SERVICE | Internal assessment/balance worker with narrowly scoped service identity | Service identity is not blanket permission |
| POLICY-V1 | Authoritative policy allows P1 to edit C8 schedule; no Journal read by default | Test fixture, **not** legal conclusion |
| POLICY-V2 | Policy V1 updated to revoke schedule edit | Decision must be re-evaluated at mutation |
| CONSENT-REV | Purpose-specific consent revoked before data access | Relevant if consent is required by approved policy |
| SCHOOL-1 | C8 Grade 3 task, submission S-101 with source `child_self_report` | Submitted does not imply correct or teacher-verified |
| RUBRIC-R1 | Synthetic approved-for-test rubric: arithmetic 2+3=5, version R1, Grade 3 math | **Fixture only**; not real approved curriculum rubric |
| RUBRIC-R2 | Version R2 has a different scoring policy | Must never silently replace locked R1 |
| SCHOOL-IMAGE | Synthetic unreadable handwriting image metadata, no personal image | Must return unable-to-assess |
| SCHEDULE-1 | School 07:30–16:15; English 17:00–18:00; Piano 17:30–18:30, Asia/Ho_Chi_Minh | Schedule overlap is separate F04-G02-M02 responsibility |
| BAR-1 | **Synthetic family-selected** rule: at least 60 minutes leisure/day; hard school commitment; soft 90-minute discretionary-study target | Numbers are **test inputs**, not recommended medical/development thresholds |
| EXAM-1 | Exception proposed 2026-11-12 to 2026-12-12, purpose exam preparation | Finite exception, not automatic approval |
| EXAM-EXPIRED | Approved test exception expired 2026-12-12; job runs 2026-12-13 | Flag/revalidation, not silent mutation |

**Execution levels:** `contract` (feature decision/output), `workflow` (multi-L4 boundary), `security` (negative/authorization), `state` (version/retry). **Run status for every case:** `NOT_RUN`. Review acceptance criteria before implementation.

## 2. Access Policy — 12 cases

| ID | L4 candidate | Given / When | Expected Then | Type |
|---|---|---|---|---|
| TC-L4-A01 | `...M01-001` | P1 authenticated, POLICY-V1 grants C8 schedule edit; requests same purpose/scope | `ALLOW` only for C8 schedule edit, with policy version and reason | contract |
| TC-L4-A02 | `...M01-001` | PX from FAMILY-B requests C8 schedule read | `DENY`; no schedule content fetched or exposed | security |
| TC-L4-A03 | `...M01-001` | P1 requests C8 private Journal on basis of being subscription payer | `DENY` absent purpose-specific authorization; no Journal read, inference or cache | security |
| TC-L4-A04 | `...M01-001` | Actor missing authenticated identity or requested purpose | `DENY/INDETERMINATE`, effective access false, no resource read | security |
| TC-L4-A05 | `...M01-001` | P1 obtained decision under POLICY-V1; POLICY-V2 revokes edit before commit | Commit reauthorizes and is denied; old decision cannot be replayed | state |
| TC-L4-A06 | `...M01-001` | Two guardians' permissions conflict; authority unresolved | `INDETERMINATE` treated as deny; conflict escalated without auto-grant | security |
| TC-L4-A07 | `...M01-001` | P1 attempts to access A19 adult records based solely on prior guardianship | `DENY` unless independent, current adult authorization exists | security |
| TC-L4-A08 | `...M01-001` | Authorized service requests assessment evidence for purpose `academic_assessment` | Decision limited to minimal submission/evidence scope, not full child profile | security |
| TC-L4-A09 | `effective-access-preview` | P1 authorized to view C8 policy metadata; requests effective rights | Return scoped rights summary and policy version, no child content | contract |
| TC-L4-A10 | `effective-access-preview` | PX enumerates C8 identifier or many family IDs | Return non-disclosing denial; no evidence that C8 exists | security |
| TC-L4-A11 | `policy-conflict-review` | Same guardian conflict event delivered twice (same stable event key) | Exactly one open review case; no access grant | state |
| TC-L4-A12 | `policy-conflict-review` | Unapproved operator attempts to open conflict case containing identities | Deny case details, redact sensitive metadata, record minimal audit event | security |

## 3. Academic Assessment — 16 cases

| ID | L4 candidate | Given / When | Expected Then | Type |
|---|---|---|---|---|
| TC-L4-B01 | `rubric-eligibility` | SCHOOL-1 math submission + applicable RUBRIC-R1 | `ELIGIBLE`, locked R1 and source reference | contract |
| TC-L4-B02 | `rubric-eligibility` | Grade 3 math submission + Grade 8 language rubric | `INELIGIBLE`; no score | contract |
| TC-L4-B03 | `rubric-eligibility` | Rubric missing, unapproved or version unknown | `UNKNOWN/INELIGIBLE`; assessment not started | security |
| TC-L4-B04 | `rubric-eligibility` | RUBRIC-R1 locked, R2 published before assessment completes | Evaluation keeps R1; version change requires explicit new assessment/review | state |
| TC-L4-B05 | `assess-submission` | Authorized synthetic answer 2+3=5 under R1 | Produce provisional result linked to rubric R1, source, method and evidence; no teacher verification | contract |
| TC-L4-B06 | `assess-submission` | Answer 2+3=6 under synthetic R1 | Produce rubric-consistent finding and explanation; no unsupported diagnosis or broad ability label | contract |
| TC-L4-B07 | `assess-submission` | SCHOOL-IMAGE unreadable handwriting | `UNABLE_TO_ASSESS`; **not** zero points; retain source unchanged | contract |
| TC-L4-B08 | `assess-submission` | Submission has only partial pages | Mark missing evidence/partial assessment; no fabricated answers | contract |
| TC-L4-B09 | `assess-submission` | Unauthorized parent/service requests C8 evidence | No evidence retrieval, inference, cache lookup or external model call | security |
| TC-L4-B10 | `assess-submission` | External vision/model provider times out | Explicit unable-to-assess or pending; no false success, no modification of submission | state |
| TC-L4-B11 | `assess-submission` | Same assessment request retried with same stable request key | No duplicate assessment result or duplicate chargeable model request where dedupe is supported; otherwise cost/race issue flagged | state |
| TC-L4-B12 | `review-uncertainty` | Provisional result marked uncertain by **configured test rule**, no real-world threshold assumed | Create one pending review case, result not marked verified | contract |
| TC-L4-B13 | `review-uncertainty` | No reviewer currently authorized | Remain pending/unavailable; do not expose evidence to random parent or auto-approve | security |
| TC-L4-B14 | `correct-assessment` | Authorized reviewer corrects finding with reason and current version | New attributed version linked to prior version; audit lineage intact | state |
| TC-L4-B15 | `correct-assessment` | Two reviewers edit same version concurrently | One succeeds; stale edit receives conflict/rebase requirement, no lost update | state |
| TC-L4-B16 | `correct-assessment` | Learner submits work; assessment result requested for family report | Submission/assessment/teacher verification remain distinct; report owner F06-G05 applies independent audience authorization | workflow |

## 4. Balanced Planning Validation — 15 cases

| ID | L4 candidate | Given / When | Expected Then | Type |
|---|---|---|---|---|
| TC-L4-C01 | `validate-balance` | SCHEDULE-1 and BAR-1; plan draft authorized | Return separate hard/soft/leisure findings with rule versions; no plan mutation | contract |
| TC-L4-C02 | `validate-balance` | English 17:00–18:00 and Piano 17:30–18:30 both marked “study”; total activity load requested | Overlapping 30 minutes counted once in load totals; collision details delegated to F04-G02-M02 | contract |
| TC-L4-C03 | `validate-balance` | BAR-1 60-minute leisure fixture; plan has 30 minutes leisure | Report 30-minute shortfall against **family fixture**, not clinical threshold | contract |
| TC-L4-C04 | `validate-balance` | Plan has 90 minutes leisure, no hard violation | No leisure violation under BAR-1; no fabricated “optimal” claim | contract |
| TC-L4-C05 | `validate-balance` | School 07:30–16:15 hard commitment; proposed activity overlaps school | Hard constraint finding; do not silently waive or change school schedule | contract |
| TC-L4-C06 | `validate-balance` | Standard Bar missing, stale or family authority unclear | `UNKNOWN/NEEDS_INPUT`; no invented default age/health limit | contract |
| TC-L4-C07 | `validate-balance` | Child proposes a plan outside permitted edit scope | No protected mutation; return proposal/approval-required outcome | security |
| TC-L4-C08 | `validate-balance` | Same activity listed in two categories (learning and enrichment) | Duration counted once; categories can both be retained as tags | contract |
| TC-L4-C09 | `evaluate-exception` | P1 authorized to propose EXAM-1 finite exam exception | Return reviewable exception proposal with reason, dates and affected constraints; status `NEEDS_APPROVAL` | contract |
| TC-L4-C10 | `evaluate-exception` | Request to suspend leisure limit indefinitely (no end date) | Reject or require finite end date; never auto-approve permanent override | contract |
| TC-L4-C11 | `evaluate-exception` | Child requests exception without authority to approve | Record proposal only if permitted; F04-G06 approval required; no plan/goal mutation | security |
| TC-L4-C12 | `evaluate-exception` | Request attempts to override a hard protected rule | Reject or escalate to authorized policy review; ordinary approval cannot bypass hard rule | security |
| TC-L4-C13 | `expiry-recheck` | EXAM-EXPIRED job runs after expiry | Flag `EXPIRED`, generate revalidation/restoration request, leave schedule unchanged | state |
| TC-L4-C14 | `expiry-recheck` | Expiry job retried three times | One outstanding restoration request for same exception/version; idempotent | state |
| TC-L4-C15 | `expiry-recheck` | Exception expired but schedule changed concurrently; current plan version differs | No blind overwrite; re-evaluate against current plan and request authorized resolution | state |

## 5. Test coverage / trace matrix

| Contract / risk | Cases | Source |
|---|---|---|
| Access authorization, scope, deny-by-default, adult autonomy | A01–A08 | L3C-03, MR-016/017/021/035 |
| Preview and non-enumeration | A09–A10 | F01-G04-M01 candidate; privacy gate |
| Policy conflict, idempotency, operator authority | A06, A11–A12 | PILOT-02, MR-017 |
| Rubric validity, version locking | B01–B04 | L3C-02, AUD-05 |
| Assessment positive/negative, evidence, provider failure | B05–B11 | SC-002, L3T-02, MR-023/025 |
| Human review, correction, reporting boundary | B12–B16 | L3C-02, PILOT-03/04 |
| Standard Bar, hard/soft, leisure, overlap one-count | C01–C08 | SC-001, L3C-06, AUD-08 |
| Temporary exception authorization and expiry | C09–C15 | UC-007/010, MR-035, PILOT-05/06 |

**Six-cohort test matrix (to execute at P5/P6):** All cases require authorization variants A0–A5; A0/A1 school-grading cases are `NOT_APPLICABLE` for school rubric (verify safe alternative path rather than a score). A2–A4 test child/guardian autonomy according to verified policy; A5 test independent adult. Do not multiply 43 by six and claim 258 executed cases: this is a **parameterization plan**.

## 6. Review gates and implementation test plan

- **Product contract review:** Verify split/merge and owner boundaries; decide `PILOT-02` and `PILOT-07`.
- **Legal/privacy review:** Replace synthetic rights with jurisdiction-specific authority matrix before any real data.
- **Education review:** Validate real rubric suitability, age context, explainability, human correction and teacher source.
- **Safety/child development:** Validate Standard Bar semantics and timeboxed exceptions; test values above are family fixtures only.
- **Engineering QA:** Implement unit/property-based tests for intervals/authorization, integration tests for state/consent, contract tests for assessment and authorization; inject provider timeout, retry, race, version mismatch. Add nonfunctional budgets and performance targets only with evidence.
- **AI evaluation:** If E2 is proposed, use a curated Vietnamese evaluation set and pre-agreed quality/safety thresholds; neither dataset nor benchmark is provided here.
- **Release gating:** G-Legal/G-Privacy/G-Safety/G-Feasibility remain UNKNOWN until reviewed; **no release or testing with real children**.

## 7. Test execution record template

```yaml
test_case_id: TC-L4-B07
design_status: REVIEW_ONLY
execution_status: NOT_RUN
environment: UNKNOWN
build_sha: UNKNOWN
run_at: null
actual_result: null
pass_fail: NOT_EVALUATED
evidence_link: null
reviewer: null
blocking_issue: PILOT-03
```

**Result of this deliverable:** 43 synthetic **test designs** created; **not** 43 successful software tests. P5 review and owner decision required before promoting candidates to official L4 IDs or canonical 3.2.
