# Detailed review 04 · Effective plan changes

Pinned source `8ad3defd689db2deb975fe9b50b6797bd6a1db66`. Candidate design; synthetic oracles. Group: F04-G01-M01 Plan Structure, F04-G06-M01 Change Requests, F04-G06-M02 Change History, F04-G03-M02 Approval Routing and F04-G02-M03 Balanced Planning Validation.

- [Feature_3_2_L4_B01_Normalized_Cross_Module_Baseline_REVIEW.md](Feature_3_2_L4_B01_Normalized_Cross_Module_Baseline_REVIEW.md), blob `dee78905580c9c99c36d8b0d1d8eedee7cdb36e4`
- [Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md](Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md), blob `5acbe35c283b46e10e3d55c894f977be35cc279f`
- [Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), blob `cd4aa379cf2e96ee7d23025108171aa470e65ca9`
- [Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md), blob `2d61180315fa913fe60ba9dd31899ebbd600cf1f`

## Ownership and permission

Plan Structure owns baseline, scope, version and lock. CR owns proposed changes, approval lifecycle and reconciliation. Routing resolves the eligible approver using current plan-scoped authority. It cannot approve or apply. Balanced Planning owns validation evidence and exceptions. History owns projection of committed provenance. F07 governs shared audit. Access Policy issues the final authorization, using current grant, mode, purpose, consent and legal evidence. PARENT_LED child uses authorized communication paths; CHILD_EXECUTED may draft/propose within scope; CHILD_DIRECTED may commit under an explicit delegation and all current plan gates. The plan manager may directly edit where authorized. Direct commit records actual actor without a fabricated approver. Protected hard caps cannot be waived. Family lock persists until explicit authorized unlock or audited override, independent of draft permissions.

## Request and commit contract

Record scoped request ID, proposal digest, actor, base plan version, server submit time and context epochs. Pending expires at its approved seven-day boundary from submit; approved-but-unapplied expires at its approved seven-day boundary from approval. Version or binding changes trigger current rules for reassessment, invalidation or reapproval. Handover preserves valid grants and mode while rerouting pending requests and requiring reapproval of unapplied approved requests under B01. Reapproval must not silently extend the approved expiry under the normalized reference. A stale approver cannot authorize application. Exact clock policy and terminal precedence must be verified against the pinned remediation clauses before implementation.

Application compares scope, actor, mode, grant, lock, version, balanced evidence, expiry and applicable approval at the write boundary. Policy-dependent UNKNOWN is a failed guard. Commit creates one new plan baseline and one durable committed-history fact atomically or under an equivalent recoverable protocol. History records scoped actor, reason category, prior/new versions and actual approval refs where applicable. The audit envelope excludes raw Journal content and draft payload. Readers recheck scope and epochs, including during cursor retry. If history projection has a gap, return a scoped pending state and reconcile from the durable committed sequence.

Timeout yields OUTCOME_UNKNOWN until authoritative reconciliation. Reconcile by scoped operation and digest before retry; fence competing transitions while outcome is unknown. If commit won before expiry, report original applied outcome to currently authorized readers even after a later expiry event. Same key and payload cannot create a second version. Same key with different digest conflicts. An ineligible retry receives no protected history or plan state.

## Cohorts and execution

A0 and A1 caregiver-mediated where verified; A2 guided task/draft where authorized; A3 and A4 proposal or delegated edit according to current mode/scope; A5 verified adult controls their own plans. Cohort supplies no grant. Unknown authority keeps permitted draft work separate from effective edits. E0/E1 guards, approval and history, zero inference calls.

| Oracle | Fixture | Expected |
|---|---|---|
| D04-T01 | Proposal approved but not applied | Zero new plan versions and committed-history rows. |
| D04-T02 | Pending exact expiry boundary, then approval attempt | Proposal cannot be approved past its valid boundary; no plan write. |
| D04-T03 | Approved request races expiry, lock or handover at apply | Apply only if it wins while all current guards pass. Losing apply leaves no version/history change. Handover triggers applicable reapproval. |
| D04-T04 | Effective commit then response lost, later expiry, two retries | Original committed outcome after fresh authority check. One version, one history fact. |
| D04-T05 | Durability failure before plan/history commit boundary | No partial visible state. Unknown outcome fences retries until reconciled. |
| D04-T06 | Delegated direct mutation; role revoked just before write | Denied on stale grant. A separately valid direct commit records no fabricated approver. |
| D04-T07 | Proposal breaches protected hard cap | May remain in permitted discussion; no approval or application. |
| D04-T08 | History duplicate and out-of-order events; observer grant revoked | Idempotent projection, explicit gap until repaired, zero stale observer disclosure. |
| D04-T09 | Family bar missing and app default lacks applicable evidence | Keep eligible draft. No balanced or effective-plan claim. |
| D04-T10 | Older plan-scope lock reminder runs after policy change | No implicit unlock or plan edit; reminders obey current scoped authority. |

Runtime proof of commit/outbox atomicity, authority fencing and clock behavior remains open. P5/P6/B01 evidence gaps remain open. Next: learning evidence and report disclosure, with source provenance and no conflation of parent confirmation with teacher verification.


## 2026-11-14 Owner gate overlay — OD-04 v3.1 source inclusion

[OD-04 approved log](Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md) authorizes adding [B01 v3.1 Addendum](Feature_3_2_L4_B01_Specification_Remediation_v3_1_Addendum_REVIEW.md) exact blob `3c398a3c5e26136609ee2c2d29843a66a7a7e97f` to the [supplemental pinned reviewer manifest](Feature_3_2_L4_20261114_Owner_Finding_Remediation_Supplemental_Manifest_REVIEW.md). Its proposed authority and state fencing rules apply to Plan/CR/Approval Routing interfaces where consistent with approved Owner decisions. If clauses conflict, treat as a finding, not an implicit override. Independent v3.1 and FR-08 focused verification remain outstanding. Source pin is not acceptance or an executed test; run OD04-T01 with source-aware regression.


## FR-08 remediation — trace B01 v3.1 addendum without claiming independent closure

Owner OD-04 pinned addendum blob `3c398a3c5e26136609ee2c2d29843a66a7a7e97f`. The following normalized functional invariants are authoritative for the candidate contract pending System Design and runtime evidence: while target plan is locked a pending CR may be discussed but not transitioned into a **binding APPROVED_NOT_APPLIED**; editing a submitted pending request preserves its original server submission time/7-day deadline; terminal precedence is governed by authoritative committed-outcome proof first, otherwise expiry, invalidated approval binding, then handover reapproval; authorized **UNLOCK** controls lock state only and never automatically edits timetable or approves a CR. Shared-activity edits involving a locked plan must not mutate locked participants; if atomic split safety is unproven, deny the whole update.

**FR08-T01:** Pending CR approved while locked -> no binding approved state; unlock cannot auto-apply; new explicit approval required. **FR08-T02:** D0 submit → D5 edit → D7 timeout: expiration still anchored D0. **FR08-T03:** Commit succeeds before deadline but response lost; later expiry cannot overwrite APPLIED after authoritative proof. **FR08-T04:** Unlock under newly stricter bar can succeed by authorized lock admin without schedule mutation; subsequent noncompliant edit denied. **FR08-T05:** Shared task update with one locked participant must not commit a partial unauthorized mutation. Refer directly to addendum AC-V3.1-CR-03..05, LOCK-01, T11/T07b/T04b/T05b/SHARED-T01. Details of shared-activity partial updates remain `OPEN_TECHNICAL_DESIGN`.

Owner source inclusion != independent verification; author's reconciliation only, no tests run.
