# Parent-Pal — Batch 01 Specification Remediation v3 (proposed)
**Ngày:** 2026-11-13  
**Trạng thái:** `PROPOSED / NOT_INDEPENDENTLY_REVERIFIED / NO_APP_TESTS`.  
**Baseline:** [v2](Feature_3_2_L4_B01_Specification_Remediation_Proposed_v2_REVIEW.md); [42 Owner Decisions](Feature_3_2_L4_Owner_Decision_Register_INDEX.md); [Change Requests Owner Log](Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md); [Plan Structure Owner Log](Feature_3_2_L4_B01_Plan_Structure_Owner_Decision_Log_APPROVED.md).  
**Evidence:** Claude `B01_Independent_Reverification_v2.zip` supplied by Owner; report `REVERIFICATION_PARTIAL`, seven of eight original HIGH closed at specification level, two new HIGH findings `RV2-B01-001/002`. No app runtime tests. This document is an **addendum replacing conflicting v2 clauses only**, not a canonical update.

## 1. RV2-B01-001 — Schedule delegation cannot bypass lock

**Owner anchors:** B01-PS-OD-04, B01-CR-OD-01/03, B01-C-OD-01/05/06; adult 18+ autonomy.

**AC-V3-LOCK-01:** Explicitly separate `EDIT_EFFECTIVE_TIMETABLE` from `LOCK_ADMIN` operations (`LOCK`, `UNLOCK`, `AUTHORIZED_OVERRIDE`, `MANAGE_LOCK_POLICY`). A `CHILD_SCHEDULE_DELEGATION`, including wildcard `schedule:*` or legacy broad grant, permits only ordinary edits inside authorized plan scope while unlocked; it **never** implies `LOCK_ADMIN`. Mode `CHILD_DIRECTED` does not imply lock administration.

**AC-V3-LOCK-02:** For a child not self-managed, unlock/override requires current explicit caregiver/plan-manager authority through Access Policy, correct lock version, audit, Balanced Planning and protected hard-cap gate. No AI or supporter default override. Former Primary after handover does not keep lock-admin authority solely from historic status.

**AC-V3-LOCK-03:** Child schedule-edit grant valid before Primary handover **remains valid afterwards**, no auto-suspend/reconfirm; grant cannot remove a pre-existing lock. New Primary may explicitly revoke/restrict grant. Old approved-but-not-applied CR requires new Primary reapproval, as a separate object.

**AC-V3-LOCK-04:** Verified self-managed adult controls their own effective plan and lock; former caregiver has no authority to lock/unlock/override. Schedule lock applies to the specified effective timetable, **not** the entire account, Journal or drafts. Do not introduce mandatory slot-lock policy without Owner approval.

**AC-V3-LOCK-05:** Multi-plan shared activity mutation must guard *all* affected plan locks/versions/rights; if an affected plan is locked or unauthorized, do not partially alter that plan or allow indirect mutation. Transaction strategy remains technical design, with fail-closed behavior when atomicity is unavailable.

**Regression oracles:** 
- `V3-LOCK-T01`: Child-directed with `schedule:*`, locked plan → UNLOCK and OVERRIDE DENY; effective edit DENY; permitted draft save may pass.
- `V3-LOCK-T02`: Mother→father handover → child delegation continues; father with explicit lock-admin may unlock, mother without current grant cannot.
- `V3-LOCK-T03`: Verified self-managed 18+ adult refuses former caregiver override.
- `V3-LOCK-T04`: Shared activity on locked child A + unlocked child B cannot mutate A through B's operation.
- `V3-LOCK-T05`: Parent unlock/override still fails protected hard-cap or stale-version validation.

## 2. RV2-B01-002 — Close missing Change Request transitions

**Owner anchors:** B01-CR-OD-02/04, B01-C-OD-03, B01-PS-OD-01.  
**Primary owner:** F04-G06-M01 approval/workflow; F04-G01-M01 version/commit; F04-G02-M03 balance; Access Policy authorization; F04-G06-M02 audit/history.

**State definitions:** `DRAFT`, `PENDING_REVIEW`, `REASSESSMENT_REQUIRED`, `APPROVED_NOT_APPLIED`, `REAPPROVAL_REQUIRED`, `OUTCOME_UNKNOWN`, `APPLIED`, `REJECTED`, `WITHDRAWN`, `EXPIRED`, `INVALIDATED`. These are **proposed state names**, not a claim that original `SC-CR-LIFECYCLE` implements them.

| State | Trigger | Next state | Non-negotiable guard |
|---|---|---|---|
| DRAFT | Authorized submit | PENDING_REVIEW | `submitted_at` fixed at server time; hard-cap proposal can submit for discussion but not approve |
| PENDING_REVIEW | Plan version change | REASSESSMENT_REQUIRED | Original `submitted_at` stays fixed; no approval while reassessing |
| REASSESSMENT_REQUIRED | Revalidate exact updated baseline/revision, PASS | PENDING_REVIEW | Require fresh approval, preserve original expiry |
| PENDING_REVIEW / REASSESSMENT_REQUIRED | Caregiver handover | Same pending state, rerouted | New authorized approver, no TTL reset |
| PENDING_REVIEW / REASSESSMENT_REQUIRED | Mode permission loss or plan archived | INVALIDATED | Never auto-revive |
| PENDING_REVIEW / REASSESSMENT_REQUIRED | Server time >= `submitted_at+7d` | EXPIRED | Cannot approve |
| PENDING_REVIEW | All approval gates PASS, current actor/revision, within pending TTL | APPROVED_NOT_APPLIED | `approved_at` set; baseline remains unchanged |
| APPROVED_NOT_APPLIED | Caregiver handover | REAPPROVAL_REQUIRED | Old approval cannot apply |
| REAPPROVAL_REQUIRED | Current authorized caregiver explicitly reapproves valid exact proposal before original approved expiry | APPROVED_NOT_APPLIED | No hidden seven-day extension; if expired create new CR |
| REAPPROVAL_REQUIRED | Caregiver handover again | REAPPROVAL_REQUIRED, rerouted | Must approve under current authority |
| APPROVED_NOT_APPLIED / REAPPROVAL_REQUIRED | Plan version changes, lock activated, mode rights lost, plan archived | INVALIDATED | No stale approval use |
| APPROVED_NOT_APPLIED / REAPPROVAL_REQUIRED | Server time >= `original approved_at+7d` without committed apply | EXPIRED | Reapproval must not reset original deadline |
| APPROVED_NOT_APPLIED | Apply linearized before approved expiry; all current rights/lock/version/bar/purpose gates PASS | APPLIED | Commit exactly once; `APPROVED != APPLIED` |
| APPROVED_NOT_APPLIED | Commit response lost or ambiguous | OUTCOME_UNKNOWN | Do not classify failure until ledger reconciliation |
| OUTCOME_UNKNOWN | Durable ledger confirms committed before expiry | APPLIED | Replay exact outcome; never second commit |
| OUTCOME_UNKNOWN | Ledger confirms no commit, handover | REAPPROVAL_REQUIRED | Preserve original deadline; no blind retry |
| OUTCOME_UNKNOWN | Ledger confirms no commit, version/lock/mode/archive invalidated | INVALIDATED | No commit |
| OUTCOME_UNKNOWN | Ledger confirms no commit, approved expiry reached | EXPIRED | No commit |
| OUTCOME_UNKNOWN | Ledger confirms no commit, state/gates still valid | APPROVED_NOT_APPLIED | New preflight, original idempotency key |
| OUTCOME_UNKNOWN | Ledger outcome unresolved | OUTCOME_UNKNOWN | Fence operation and escalate; no second mutation |
| Any nonterminal review state | Authorized reject / withdraw | REJECTED / WITHDRAWN | Audit, no apply |
| Terminal state | Duplicate callback/timeout/timer | Same terminal state | No overwrite/double-commit |

**AC-V3-CR-01:** Pending TTL = 7 days from initial submit; approved-not-applied TTL = 7 days from **original** approval. The conservative no-hidden-extension behavior is a **technical proposal**; require Owner adjudication only if product policy needs a *new* extension option. `now >= expires_at` is expired. Timer and commit use authoritative server ordering, not client timestamp.

**AC-V3-CR-02:** Reassessment does not self-approve. Reapproval is an explicit *new decision* by current authorized approver after caregiver handover; it does **not** revoke unrelated child schedule-edit grants, which survive handover.

**AC-V3-CR-03:** Plan lock while pending may leave request visible for discussion/review but must block effective commit; already approved-but-not-applied is INVALIDATED by lock. Archival or mode removing right invalidates pending and approved. Plan version changed while pending requires reassessment, while approved invalidates/new request.

**AC-V3-CR-04:** `OUTCOME_UNKNOWN` must reconcile durable idempotency/transaction ledger **before** timer transitions, retry or new-actor reapproval; if ambiguous, fence and alert. Same key/same payload committed → replay previous result subject to current output visibility; same key/different payload → conflict, never mutate.

**AC-V3-CR-05:** Hard-cap-invalid requests may be saved/submitted for discussion. No APPROVE/APPLY until corrected and exact revision revalidated. `UNKNOWN/UNVERIFIABLE` Standard Bar verdict is not PASS.

**New deterministic oracles:**
- `V3-CR-T01`: PENDING + plan-version change → REASSESSMENT; PASS → PENDING without resetting submitted_at; approve when valid before 7d.
- `V3-CR-T02`: REASSESSMENT + expiry → EXPIRED; mode right loss or archive → INVALIDATED.
- `V3-CR-T03`: APPROVED + handover → REAPPROVAL_REQUIRED; new Primary approves before original approval deadline → APPROVED; timeout/expiry → EXPIRED/new CR.
- `V3-CR-T04`: OUTCOME_UNKNOWN + proof of earlier commit → APPLIED once, even if new lock/expiry; if no commit + handover → REAPPROVAL; if no commit + lock/archive → INVALIDATED.
- `V3-CR-T05`: PENDING + lock remains reviewable, no apply; APPROVED + lock → INVALIDATED.
- `V3-CR-T06`: Parent-led child may express wish via F05 but cannot use DRAFT/PENDING official CR mutation.
- `V3-CR-T07`: Hard-cap-invalid proposal submitted/discussed, APPROVE/APPLY DENY; corrected revision requires all gates.
- `V3-CR-T08`: Boundary write before expiry succeeds, write at expiry fails, response after expiry for prior committed transaction replays success.

## 3. Remaining independent questions and evidence boundaries

- The remaining MEDIUM/LOW RV2 findings are **not declared closed** by this v3; retain prior classification, require exact finding IDs and source-specific verification.
- Operational implementation details (transaction isolation, event/clock precision, canonical payload hash, structured error codes, lock epoch storage, background retry alert thresholds) belong to later technical design and must preserve the normative invariants.
- Does not prove 46 original findings closed, 392 test outcomes, or full P5/P6 coverage. Missing 5/64 baseline and safety/age/legal research remain open.
- No real child personal data processing approved. All current examples are spec-level; no runtime tests or source code fixes.
- Do **not** promote 25 L4 candidates to canonical or start Batch 02 from v3 alone.

## 4. Minimal verification handoff

A **single focused independent critique**, optionally 0 subagents, limited to `RV2-B01-001`, `RV2-B01-002`, and whether this v3 creates a new HIGH conflict against 42 Owner Decisions. Review state table exhaustiveness, time/authorization/lock interactions and the lock-admin/wildcard grant rule. Deliver evidence + PASS/PARTIAL/FAIL by invariant, not a new full Consolidation.
