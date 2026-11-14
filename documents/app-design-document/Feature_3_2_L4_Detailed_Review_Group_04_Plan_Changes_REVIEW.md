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
