# Parent-Pal — Specification Remediation v3.1 Addendum (ChatGPT)

**Ngày:** 2026-11-13  
**Trạng thái:** `PROPOSED / FOCUSED_V3_ACCEPTED / V3.1_NOT_REVERIFIED`.  
**Nguồn:** [Specification v3](Feature_3_2_L4_B01_Specification_Remediation_Proposed_v3_REVIEW.md); `B01_Focused_Verification_v3.zip` (3 Markdown reports, 0 CRC error). Claude gate: `FOCUSED_VERIFICATION_ACCEPTED`, RV2-B01-001/002 `CLOSED_AT_SPEC_LEVEL`; new findings 4 MEDIUM + 3 LOW; no new HIGH/CRITICAL, no application runtime test.  
**Authority:** [Owner Decisions](Feature_3_2_L4_Owner_Decision_Register_INDEX.md); [Change Requests Owner Log](Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md); [Plan Structure Owner Log](Feature_3_2_L4_B01_Plan_Structure_Owner_Decision_Log_APPROVED.md); [Consolidation Owner Log](Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md).  
**Scope:** Addendum clarifies v3 clauses without rewriting canonical Blueprint. New test IDs are proposals, not executed tests.

## 1. Finding corrections — four MEDIUM

### FV3-B01-001 (MEDIUM): Approval invalidation on authority and validation changes

**AC-V3.1-CR-01:** For `APPROVED_NOT_APPLIED` or `REAPPROVAL_REQUIRED`, changes to any binding of the approval — `approver authority/grant revision`, `plan version`, `lock state/epoch`, `mode/permission`, `caregiver authority`, `proposal revision`, `Balanced Planning verdict/Standard Bar constraint revision`, `purpose/consent/legal policy revision` — force `INVALIDATED` when the change invalidates the conditions under which the approval was granted. Apply must fail closed. Returning to previously permitted values or regranting the same actor **does not resurrect old approval**. A fresh CR/approval under current context is required. Ordinary irrelevant metadata changes should not invalidate approvals unless binding changes; implementations must identify binding scope.

**Test `V3.1-CR-T09a/b`:** approved → approver grant revoked → INVALIDATED; regrant → still INVALIDATED. Approved → Bar tightened/revision changed → INVALIDATED; loosen later → still INVALIDATED.

### FV3-B01-002 (MEDIUM): Unknown commit outcome is fenced against withdraw/reject

**AC-V3.1-CR-02:** `REVIEW_STATES = {PENDING_REVIEW, REASSESSMENT_REQUIRED, REAPPROVAL_REQUIRED}` (and `DRAFT` only for draft-withdraw/cancel UI; no approval). `APPROVED_NOT_APPLIED` may be explicitly withdrawn by authorized requester **only before any commit attempt is issued**, if there is reliable server-side proof no commit is in flight, otherwise treat as `OUTCOME_UNKNOWN` and reconcile first. Once `OUTCOME_UNKNOWN`, reject/withdraw/expire/timeout/lock/caregiver/timer cannot force terminal status until authoritative ledger reconciliation. If ledger proves APPLIED, final is `APPLIED`; if proves no commit, transition according to current invalidation/withdraw/expiry and authorization rules. If unresolved, fence mutation and raise operational alert without a second write.

**Test `V3.1-CR-T10`:** commit succeeded + response lost + withdraw attempt → defer/reject withdraw pending reconciliation; authoritative ledger → APPLIED once, never WITHDRAWN.

### FV3-B01-003 (MEDIUM): Approval blocked when plan is already locked

**AC-V3.1-CR-03:** With a lock active on the target effective timetable, a pending CR stays visible for discussion/review, but transition to **binding** `APPROVED_NOT_APPLIED` is DENIED. A discussion-only acknowledgement is not an approval and cannot later be applied after unlock. Unlock alone never promotes a discussion-only result to APPROVED; full fresh approval is needed when unlocked. Existing approved-unapplied CR invalidates on lock activation. Any authorized override must use a distinct audited flow subject to policy/version/safety, never an old CR approval.

**Test `V3.1-CR-T11`:** pending + locked + approve attempt → no APPROVED state; unlock + automated worker cannot commit; new explicit approval after unlock required.

### FV3-B01-004 (MEDIUM): Request revision does not reset expiry

**AC-V3.1-CR-04:** In a previously submitted `PENDING_REVIEW` CR, editing proposal payload creates a new immutable revision in the **same request identity**, clears any revision-specific assessment, returns/keeps it in `PENDING_REVIEW` or `REASSESSMENT_REQUIRED` until validated; `submitted_at` and `submitted_at+7d` **remain unchanged**. Only an explicitly submitted *new* CR has a new 7-day pending window, and cannot silently inherit approvals. An approved CR cannot be edited in place; revision requires new proposal and approval lifecycle.

**Test `V3.1-CR-T07b`:** submit D0 (hard-cap discussion), revise D5 to safe plan → fresh validation, same submitted_at D0, expires D7 if unapproved.

## 2. LOW clarifications

### FV3-B01-005 — deterministic precedence

**AC-V3.1-CR-05:** On reconciliation, first establish whether the operation had **already linearized a successful commit**. If yes, `APPLIED` wins over later timers/context invalidation for that committed operation (current access limits visibility of replay). If proof no commit, terminal precedence follows recorded event times: `EXPIRED` when deadline reached without committed application; otherwise `INVALIDATED` on binding break; otherwise `REAPPROVAL_REQUIRED` after caregiver handover; otherwise `APPROVED_NOT_APPLIED` when safe. Reassessment failure stays `REASSESSMENT_REQUIRED` (no approval), with warning/remediation option, until repaired, rejected, invalidated or expired.

**Test `V3.1-CR-T04b`:** no commit + simultaneous handover and expiry → EXPIRED. Commit completed before expiry + response lost + later expiry → APPLIED.

### FV3-B01-006 — separate UNLOCK from mutation

**AC-V3.1-LOCK-01:** `UNLOCK` changes lock control state only; requires current explicit lock-admin authorization, correct lock version and audit, **not** a positive Balanced Planning verdict on the old timetable. It may be allowed precisely so an already noncompliant timetable can be fixed. Every **subsequent mutation** or `AUTHORIZED_OVERRIDE` that changes the effective timetable must still pass current authorization, plan version, Balanced Planning, protected hard-cap and atomic commit gates. No implicit schedule mutation in unlock.

**Test `V3.1-LOCK-T05b`:** protected hard-cap becomes stricter while plan locked; current Primary unlocks with proper rights → ALLOW; noncompliant edit → DENY; corrective compliant edit → ALLOW.

### FV3-B01-007 — add positive/negative oracle branches

- `V3.1-LOCK-T03b`: verified self-managed adult lock/unlock own timetable → ALLOW; former caregiver cannot.
- `V3.1-LOCK-T01b`: child grant carrying legacy `UNLOCK` token or `schedule:*` **without independent explicit lock-admin authority from a legally/policy permitted actor type** → DENY; treating the token as a grant of lock-admin rights to child is invalid under current Owner lock authority rules. No assumed child lock-administration capability.
- `V3.1-SHARED-T01`: shared activity affects child A locked and child B unlocked: A effective plan must remain unchanged; whether B can update independently is conditional on whether shared activity edits can be split safely without mutating A. If atomic all-or-nothing update is required and unavailable, reject whole operation and keep both plans unchanged. Detailed group-activity partial update semantics remain separate `OPEN_TECHNICAL_DESIGN`.
- Boundary tests use deterministic fake authoritative server clock and versioned event ordering; client timestamp cannot choose expiry status.

## 3. Updated transition deltas to v3 (do not rewrite prior evidence)

| Current | Event/condition | Result |
|---|---|---|
| APPROVED_NOT_APPLIED / REAPPROVAL_REQUIRED | Any approval-binding authority/validation/policy revision invalidated | INVALIDATED, not revivable |
| PENDING_REVIEW / REASSESSMENT_REQUIRED | In-request proposal revision | PENDING_REVIEW or REASSESSMENT_REQUIRED, submitted_at unchanged, new validation |
| PENDING_REVIEW | Plan locked; binding approval attempted | DENIED/no state change; discussion-only allowed |
| APPROVED_NOT_APPLIED | Authorized withdraw with definitive proof commit not started | WITHDRAWN, audited |
| OUTCOME_UNKNOWN | Reject/withdraw/any competing lifecycle event, reconciliation not done | OUTCOME_UNKNOWN fenced; do not overwrite |
| OUTCOME_UNKNOWN | Ledger proves committed prior to expiry | APPLIED, replay once |
| OUTCOME_UNKNOWN | Ledger proves no commit + expired | EXPIRED |
| OUTCOME_UNKNOWN | Ledger proves no commit + invalidated context | INVALIDATED |
| OUTCOME_UNKNOWN | Ledger proves no commit + handover, before expiry, other gates valid | REAPPROVAL_REQUIRED |
| REASSESSMENT_REQUIRED | Revalidate FAIL | Stays REASSESSMENT_REQUIRED, approval blocked |
| Any locked effective plan | Authorized UNLOCK | Lock cleared, **no timetable mutation**, audit; schedule edits separately validated |

## 4. Status and gate boundaries

- Claude closed RV2-B01-001/002 at **specification level** in focused verification; the 7 findings FV3-B01-001..007 have **ChatGPT proposal fixes** in this addendum, **not independent closure**.
- Older 14 MEDIUM +2 LOW from RV2 were not exhaustively reverified; other 46 pilot findings and P5 59/64 trace are not declared fully resolved.
- The legal gate for real child personal data remains **CLOSED** until researched/approved. Journal sharing/deletion, child account linking, audit/history module dependencies still need owner modules and later runtime validation.
- No stable L4 approval, no canonical Blueprint change, no runtime test, no Batch 02 authorization. Next: ChatGPT Batch 01 Design Gate review may recommend **conditional continuation** based on risk isolation.
