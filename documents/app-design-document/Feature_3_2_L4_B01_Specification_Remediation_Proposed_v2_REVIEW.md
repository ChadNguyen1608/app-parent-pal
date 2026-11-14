# Parent-Pal — Batch 01 Specification Remediation Proposed v2

**Author:** ChatGPT (feature design / remediation). **Date:** 2026-11-13.  
**Status:** `PROPOSED / INDEPENDENT_VERIFICATION_V1_PARTIAL / V2_NOT_VERIFIED`.  
**Supersedes as review target:** [Specification Remediation v1](Feature_3_2_L4_B01_Specification_Remediation_Proposed_v1_REVIEW.md). Preserve v1 in Git for audit.  
**Authority:** 42 confirmed Owner Decisions from [Master Decision Register](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) and [Consolidation Owner Log](Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md).  
**Independent input:** `B01_Independent_Verification.zip` uploaded by Owner, 5 Markdown reports, CRC OK; 22 findings (8 HIGH, 10 MEDIUM, 4 LOW); gate PARTIAL. **This ZIP is not yet archived as immutable GitHub evidence.**  
**Scope:** Replace/clarify v1 clauses via the following overrides; all v1 clauses not contradicted remain proposed. This is a design specification and test oracle, not runtime implementation or legal clearance.

## 1. Corrections for all 8 HIGH findings

### V2-LEGAL-01 / IV-B01-001 — Revocation-aware legal gate

- Every access to real-child data **or previously derived personal data** (read, display, inference, AI memory/context, embedding retrieval, search index, cache read/write, export, report, notification, batch/worker) requires current `ALLOW` authorization and legal-basis assessment **at time of access/output**, not merely at job launch.
- `LEGAL_UNKNOWN / WITHDRAWN / EXPIRED / INVALID` means `DENY` for real-personal-data operations **including serving previously materialized results**. Do not infer lawful basis from cached `ALLOW` or immutable purpose catalog approval.
- Keep per-subject/purpose/policy assessment `authz_epoch` and `legal_basis_epoch` (or equivalent monotonic invalidation mechanism). Change events invalidate decision tokens, AI memories/indexes/caches as access sources, including device caches upon reconnect. Tokens have an epoch guard; unexpired TTL is **not** evidence of current validity.
- Long-running workers must recheck at data consumption and immediately before publication; revoke/assessment loss triggers cancellation, quarantine and no publication. Data minimization/audit must not disclose private content.
- Existing content should be quarantined from further use until lawful re-evaluation/authorized handling, **not silently permanently deleted** without retention policy.

### V2-LEGAL-02 / IV-B01-002 — Classification & test data

- All incoming/unclassified/incompletely deidentified records are treated as `POTENTIALLY_PERSONAL` and subject to the real-child-data fail-closed gate.
- Only a trusted server-side classification/provenance process may mark data as `SYNTHETIC_TEST` or adequately anonymized; flags sent by client, copied production data, staging environment name, or a sample-record label do not override.
- Synthetic tests use isolated test fixtures, no production identity linkage or reachable production records. Weak pseudonymization is **not** anonymization; unresolved reidentification risk means `POTENTIALLY_PERSONAL`.
- Source classification decisions are versioned, auditable and invalidated if provenance changes; if absent or unverified, deny under `LEGAL_UNKNOWN`.

### V2-AUTHZ-COMMIT-01 / IV-B01-003 — No time-of-check/time-of-use gap

**Atomic commit guard** must bind: `subject_id, actor_id, actor_authority_version, grant_id+revision, mode_version, caregiver_epoch, access_policy_epoch, consent/purpose decision versions, plan_id+expected_plan_version, plan_lock_epoch, constraints_revision, operation_revision`, plus approval/revision/expiry for CR-backed requests. Names are illustrative **technical version stamps**, not mandatory infrastructure schema.

- Evaluate the current conditions at commit. Use one transactional guard/compare-and-swap or equivalent linearizable policy-commit protocol. If rights or policy state cannot be checked atomically, **do not commit** until an equivalent concurrency-safe mechanism exists; stale snapshot returns re-evaluation/no write.
- For handover, `caregiver_epoch` change alone **does not invalidate valid child schedule grants**. Reauthorize using effective grant semantics below; require reapproval only for prior caregiver's approved-unapplied CR.
- Rights revoke, mode change, caregiver policy shift, lock, bar update and plan revision between initial decision and actual commit must be checked. No old decision can “win” a race after revocation.
- A pure read-only draft save does not mutate effective timetable; it still honors draft permissions and privacy.

### V2-GRANT-01 / IV-B01-004 — Grants survive handover by type

Define **two distinct objects**:

1. `CHILD_SCHEDULE_DELEGATION`: a bounded grant for a child to change schedule, anchored to child, action, scope, explicit expiry/revocation/constraints and delegation policy. Its ongoing validity is **not** conditional on `grantor_is_current_Primary`; handover by itself is neither revocation nor forced REVIEW_REQUIRED. Primary newly assigned may explicitly revoke/restrict it under authorized workflow. Provenance of original grantor remains for audit. This implements **B01-C-OD-01**.
2. `CAREGIVER/SUPPORTER_ACCESS_GRANT`: a grant to other adults for viewing/accessing resources, subject to the separate Access Policy / P6-AP-OD-02 review rules on caregiver handover, **not** automatically interpreted as schedule delegation.

An `APPROVED_NOT_APPLIED_CR` is an approval **not a grant**; it must be approved again by current authorized caregiver following handover. Prior Primary, now Supporter, cannot revoke a child's delegation or approve CR solely on being the original grantor; any current explicit permitted delegated role must be checked, not inferred.

No implicit new grant from mode alone; no blanket Journal access.

### V2-LOCK-01 / IV-B01-005 — Lock authority, adult autonomy and safe override

- Verify effective subject autonomy: a verified self-managed adult 18+ controls their own plan, and a caregiver's historic role grants **no authority** to lock/unlock/override their schedule. Existing caregiver-origin locks cannot defeat adult ownership transition; authorized self-managed adult can manage their own locks.
- For a non-self-managed child: only the current role with explicit schedule management permission can lock/unlock/override within authorized scope. Supporter or AI cannot lock/override by default; AI can recommend or facilitate authorized workflow, not take decision.
- `AUTHORIZED_OVERRIDE` is a **distinct audited authorization flow**, not a skip of Access Policy, latest mode/epoch, plan version, Balanced Planning or protected hard-cap. Any override failing a protected safety limit is denied.
- A lock applies to the defined **effective timetable of the subject plan**. Slot-specific granularity is **NOT APPROVED** by Owner; remove mandatory slot-lock behavior from v1 AC-LOCK-04. Shared activities must be checked independently against each affected child's plan/lock/permissions; an update cannot bypass a locked participant's effective plan.
- Reminder never changes lock. Draft/offline permitted only for an actor permitted to compose that draft; Parent-led child cannot create official schedule CR.

### V2-CR-EXPIRY-01 / IV-B01-006 — Expiry checked at write linearization

- `PENDING_REVIEW.expires_at = submitted_at+7d`. `APPROVED_NOT_APPLIED.expires_at = approved_at+7d`; each is evaluated against **authoritative server clock at atomic apply/approval transition**, `now >= expires_at` means no new approval/commit.
- A commit linearized before expiry is `APPLIED` even if response arrives, reconciliation runs or a timer fires after expiry. A request not applied by the expiry instant becomes `EXPIRED`; no commit allowed by an earlier “started before expiry” timestamp.
- After handover, prior approved-unapplied CR re-enters a review-required/pending state for current Primary as a **new authorized approval step**. Whether reapproval extends a request's original absolute lifetime must not be assumed: conservative default is **no hidden extension**; if renewal is needed, submit a new request. Expiry can never be automatically reset by reroute/review.
- Reconcile successful commit before expiry/timer logic classifies final state. A timer cannot overwrite an already finalized `APPLIED`.

### V2-IDEMPOTENCY-01 / IV-B01-007 — Result replay before fresh mutation

- Before normal mutation gates, check `(subject, operation_scope, idempotency_key, canonical_payload_hash)` against authoritative durable commit ledger.
- Same key, same payload, **already committed** → replay original `APPLIED` result (version/history IDs, time), without applying again, even if later lock, expiry or handover changed. This is readback of historical outcome, **not** authorization for a new data access: output visibility and data minimization still obey current rights.
- Same key + different payload → `IDEMPOTENCY_CONFLICT`, no write.
- Key not committed → perform **fresh** permissions/mode/grant/lock/epoch/version/expiry/constraints checks and atomically commit at most once.
- Direct Child-directed/Primary mutation also has client/server-provisioned stable operation ID across retries; don't generate new ID for each network attempt.
- Plan version and its durable history/outbox event must commit atomically or via an equivalent exactly-once durable-event protocol; no “version succeeded/history lost” or duplicate APPLIED records.
- Do not collapse `OUTCOME_UNKNOWN` into failure without reconciliation.

### V2-JOURNAL-01 / IV-B01-008 — No lineage means no distribution

- Journal share revoke must immediately block **all future parent-facing read, infer, search, AI memory, embedding, report, cache and notification paths**, including derived/mixed-source outputs. Derivatives with **unknown lineage are quarantined/denied** in impacted contexts pending trusted provenance review; inability to trace does not mean the data is safe.
- Long-running generation or export that began before revoke must recheck current sharing permission before publishing or caching output; deny/cancel on revoke.
- On-device previously cached shared Journal/summary content: purge on permission-epoch refresh, block local redisplay where the device can enforce revocation. **Offline recipient copies already physically disclosed cannot be guaranteed deleted remotely**; product must limit offline caching, apply client encryption/short validity where feasible and disclose residual risk. No claim of retrospective deletion of screenshots/exports already obtained.
- Audit events omit raw Journal text and traceable emotional insights; current journal-sharing choice does not expose activity metadata to parents.
- Delete request separate: visible removal immediately; content and traceable derivatives **must not be used during 60-day delayed permanent deletion**, except strictly disclosed lawful-retention/safety exceptions with narrow purpose and access. Timed deletion pipeline remains F07-G06-M02 future design.

## 2. MEDIUM/LOW findings disposition (specification proposal vs open dependencies)

| IV ID | Action | Status at v2 |
|---|---|---|
| 009 | For emergency scenarios with `LEGAL_UNKNOWN`, provide only static guidance that does not read child private data; any narrowly scoped legal/safety exception needs independent legal assessment and separate Owner approval | `RESEARCH_REQUIRED` |
| 010 | APPROVE on Balanced Planning verdict `UNKNOWN / UNVERIFIABLE / FAIL` → DENY; approval bound to immutable proposal_revision and exact validation snapshot; revision change invalidates approval, no reuse | `PROPOSED_FIX` |
| 011 | Shared activity across children: atomic/consistent update across affected plans or fail-closed for locked/unauthorized participant; never silently change other's effective schedule | `PROPOSED_FIX` |
| 012 | Pending CR reroute/reassessment **preserves original submitted_at TTL**, review does not pause/reset 7-day timer | `PROPOSED_FIX` |
| 013 | During 60-day pending deletion: no use of deleted Journal or traceable derived records in app/AI/report/search, lawful-retention exceptions restricted and not parent-facing by default | `PROPOSED_FIX; MODULE_F07_G06_M02_PENDING` |
| 014 | Only authorized caregiver changes a child's mode; adult self-managed controls own settings. Capability evidence is a *research input*, not an unapproved new mandatory business gate. Unknown rights → deny modification, not blanket age ban. | `PROPOSED_FIX; RESEARCH_REQUIRED` |
| 015 | Provide draft transition table in section 3 and test all state × event; reconcile with underlying F-022/025 before closure | `PROPOSED_FIX; ORIGINAL_STATE_MACHINE_EVIDENCE_PENDING` |
| 016 | Replace NT-018 by 018a-c with deterministic expiry outcomes and review reset conditions | `PROPOSED_TEST_FIX` |
| 017 | Split NT-019..021 into independent oracles, distinct share notification branches and lock/draft cases | `PROPOSED_TEST_FIX` |
| 018 | Expand legal access test across cache READ, index, AI, export, worker; hard-cap test direct mutation, unknown verdict, revision race, retry | `PROPOSED_TEST_FIX` |
| 019 | Remove slot-lock requirement; optional notification “minimal metadata” means at most generic access-status message and is a **UI proposal**, not Owner-approved payload contract. Revisioned exception revalidate is already supported by P6-BP-OD-01 | `PROPOSED_FIX` |
| 020 | Soft-cap: continuous max 60d across purpose changes; **7 complete days between similar exceptions (same scope+constraint+purpose)**; no 7-day gap rule between dissimilar purpose exceptions alone, but no 60d bypass | `PROPOSED_FIX` |
| 021 | After revoke default notification-off, parent-facing API/UI returns only generic current permission status, no Journal entry counts, activity timestamps or inferred emotional content | `PROPOSED_FIX` |
| 022 | Previous Primary loses caregiver-only grant administration/revoke/CR approval privileges unless currently re-delegated by new Primary; child's existing schedule grant remains active | `PROPOSED_FIX` |

## 3. Draft CR state transition contract — v2, owner decision preserving

This is a **reviewable proposed normalization**, not an assertion that pilot's `SC-CR-LIFECYCLE` was found.

| Current state | Event/guard | Next state | Side effects |
|---|---|---|---|
| DRAFT | Authorized submit; even if hard-cap violated | PENDING_REVIEW | start `submitted_at`, show violation, no approve until corrected |
| PENDING_REVIEW | Approval attempted with changed plan version/actor/constraint snapshot | REASSESSMENT_REQUIRED | preserve submitted_at, require new validation |
| PENDING_REVIEW | Current authorized approver; exact revision; all gates PASS; now before submitted_at+7d | APPROVED_NOT_APPLIED | set approved_at and approved expiry; no plan commit yet |
| PENDING_REVIEW / REASSESSMENT_REQUIRED | now >= submitted_at+7d without valid approval | EXPIRED | no new approval |
| PENDING_REVIEW | Caregiver handover | PENDING_REVIEW | route to current caregiver, original submitted_at remains |
| APPROVED_NOT_APPLIED | Handover, mode permission loss, plan version change, archive, lock impacting apply | INVALIDATED / REAPPROVAL_REQUIRED (handover only) | never auto-apply; no covert expiry extension |
| APPROVED_NOT_APPLIED | Commit preflight and linearizable write before approved_at+7d; all current gates PASS | APPLIED | one plan version, one durable history event |
| APPROVED_NOT_APPLIED | now >= approved_at+7d with no committed application | EXPIRED | no write |
| APPROVED_NOT_APPLIED | Network timeout after attempted commit | OUTCOME_UNKNOWN | reconcile ledger before deciding terminal state |
| OUTCOME_UNKNOWN | Commit ledger proves original write | APPLIED | replay original outcome |
| OUTCOME_UNKNOWN | No commit and expired or invalidated | EXPIRED / INVALIDATED | explicitly choose based on recorded cause and precedence; no apply |
| OUTCOME_UNKNOWN | No commit, guards still valid, before expiry | APPROVED_NOT_APPLIED | fresh guard before retry, same idempotency key |
| APPLIED/EXPIRED/INVALIDATED | Replayed operation id | Same terminal state | no second write, no terminal overwrite |

**Open technical nuance:** `REAPPROVAL_REQUIRED` is a distinct state or flag to be agreed in detailed technical spec, not a new Owner decision; timer/invalidity precedence and race resolution depend on ledger linearization. The user-authorized rule is unchanged. If both expiry and invalidation occurred before any commit, choose terminal reason by ordered audit events, not nondeterministic client clock.

## 4. Corrected test oracles — deterministic Given/When/Then

All are **design test proposals only**, not executed.

- **NT-003 revised:** after mother→father handover, Supporter adult grant requiring reassessment follows Access Policy review; child bounded schedule grant is separate and remains effective. Source grant category must be explicit.
- **NT-004 revised:** delete at T0 → app immediately hides Journal/traceable derived outputs, T+59d still inaccessible, T+60d deletion job removes eligible originals/derivatives; legal retention exception never grants parent-facing reuse.
- **NT-011a-d:** discussion-only SUBMIT with hard-cap violation allowed; APPROVE/APPLY/direct Child-directed edit DENY while violation persists; `UNVERIFIABLE` verdict APPROVE DENY; stale proposal revision APPROVE DENY; repeated operation id never double writes.
- **NT-014a-g:** legal-basis revoked/UNKNOWN + real child data or unclassified data → AI context, report, export, cache read/write, embedding retrieval, long-running worker, and device sync all deny/withhold output; cached ALLOW not reusable; trusted isolated synthetic fixture is separate positive case.
- **NT-016/017 revised:** successful commit + lost response + lock/expiry/handover on retry returns original APPLIED without second write, same key/different payload rejects, direct mutation with stable key commits once, history/outbox coherent.
- **NT-018a:** approved TTL `T+7d−1ms` with atomic write → APPLIED; at `T+7d` with no prior commit → EXPIRED, 0 version; do not mix with pending TTL tested in NT-009.
- **NT-018b:** worker starts before TTL but reaches atomic write after boundary → EXPIRED; response for commit finalized before boundary may be reconciled after boundary → APPLIED once.
- **NT-018c:** handover invalidates prior caregiver approval (reapproval required), does not extend original CR lifetime invisibly. If expires before valid reapproval, EXPIRED.
- **NT-019a:** delegated child schedule grant issued by old Primary remains effective after handover with *no* new Primary reconfirmation or automatic REVIEW_REQUIRED. Exact grant scope and all other gates pass; child direct edit → APPLIED once.
- **NT-019b:** old Primary now Supporter, without new delegated admin right, cannot revoke child's grant; new Primary can revoke explicitly; next child edit denied.
- **NT-020a:** default notification disabled, revoke Journal share → 0 new parent push/email; API current permission status only.
- **NT-020b:** explicit child opt-in, revoke Journal share → only generic permission-state notification per approved future UX payload; no raw/derived Journal content.
- **NT-020c:** after revoke, parent opens prior Journal screen → permission unavailable; no counts, timestamps, mood labels or cache replay.
- **NT-021a:** scheduled lock reminder → no lock-state change; effective timetable unchanged.
- **NT-021b:** actor permitted to draft while locked, offline draft save is possible; sync cannot commit locked effective plan.
- **NT-021c:** Parent-led child cannot use offline draft route to create official Change Request; adult self-managed user cannot be overridden by former caregiver.
- **NT-022a:** same shared activity update requested across two children with different modes/locks; unauthorized or locked participant plan remains unchanged, transaction must not partly change others.

## 5. What is intentionally NOT closed

- No independent second-round verification of v2; all 22 IV findings are **`PROPOSED_FIX / OPEN_VERIFICATION`**, not RESOLVED.
- Legal basis for real child data, emergency exception, age/capability guidelines remain `RESEARCH_REQUIRED`, real-child-data gate closed.
- Modules unpiloted: F01-G02-M01 (Child App linking), F05-G06-M01 (Journal sharing), F07-G06-M02 (deletion), F04-G06-M02 (history). No invented contracts as final.
- P5 baseline 5 missing IDs and 9 ambiguous IDs, P6 F-023/F-021 original evidence unresolved.
- Validation scripts and runtime application tests **not run**.
- Draft state transition normalization does not prove original SC-CR-LIFECYCLE consistency.
- Neither 25 consolidated L4 candidates nor 46 pilot findings are marked accepted/closed. No Batch 02 authorization.
