# Parent-Pal · Batch 03 L4 dependency checkpoint

2026-11-14 · BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED / MVP NOT_DECIDED

Source snapshot: `6f2c31bb9c700d4c1912ce7f923c35f3a8eff83a`. [Batch 02 source manifest and checkpoint](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) records the canonical inventory, B01 baseline, 42 approved decisions and policy precedence. Batch 03 selects five prerequisites for B02: account identity, session freshness, household membership, mode transitions and Journal deletion lineage. The B02 slices continue to depend on the interfaces below. Contract mechanics here are proposals. Unknown legal basis for real child personal data blocks processing. All examples are synthetic.

## Shared permission and version contract

Authentication owns principal proof and session freshness. Membership owns affiliation facts. Access Policy evaluates operation authority, with Consent Ledger, Purpose-bound Access and Mode State providing separate evidence. One verified Primary Caregiver per family and a separately scoped Primary Manager per plan are upstream Access Policy invariants. Each consumer checks current scope and relevant epochs before disclosure or commit, including retry, batch, and background work. Mode and household membership supply no Journal entitlement. Verified self-managed adults retain authority over their own account, plans and data. A missing provider or contradictory evidence denies the affected operation. No inference calls in these designs. Delivery cost, throughput and storage overhead remain UNKNOWN.

## F01-G01-M01 · Account Access

| Temporary candidate / execution | Trigger, actors and outcome | Contract and recovery | AC |
|---|---|---|---|
| CAND-F01-G01-M01-authenticate · E0 | Account subject presents registered proof to establish identity | Account Access owns opaque account ref and verification outcome. It supplies proof level, freshness and authentication version to Session Security. Invalid or unavailable proof produces no authenticated state. Public outcome is generic to avoid account enumeration. Family link and legal authority resolve elsewhere. | A1 |
| CAND-F01-G01-M01-recover · E1 | Subject requests recovery and proves entitlement through an approved path | Use a scoped, single-use, time-bound recovery operation. Replace credentials and advance account security epoch atomically on accepted proof. Bind replay to scoped operation and canonical input. A lost response triggers reconciliation. Unresolved claims go to protected support; support cannot derive recovery authority from family membership alone. | A2–A3 |

Data class: restricted credentials and account proof metadata. Recovery secrets are excluded from audit and diagnostics. Account Access has write authority for credential state. Support staff have scoped case access only. Candidate hard dependencies: Purpose-bound Access for sensitive processing and Session Security for recovery invalidation. Trace: MR-016/021, B01-CL-OD-01, P6-AP-OD-04, B01-PA-OD-01/04. Recovery proof standards and channel selection need validation.

## F01-G01-M02 · Session Security

| Temporary candidate / execution | Trigger, actors and outcome | Contract and recovery | AC |
|---|---|---|---|
| CAND-F01-G01-M02-establish · E0 | Authenticated subject begins or renews an authorized session | Session Security owns scoped session ref, account epoch, freshness, expiry and state. Issue only on current Account Access evidence. Refresh compares current session and account epoch at issuance. Deny stale or unavailable proof. Child Link version is checked by consumers for link-dependent operations. | S1 |
| CAND-F01-G01-M02-terminate · E1 | Authorized subject ends session or account recovery invalidates prior sessions | Commit session revocation or account epoch advance, then fence operations carrying outdated evidence. Support or risk workflows require explicit scoped authority. A delayed cache invalidation cannot extend a revoked session. Retry is idempotent. | S2–S3 |

Data class: restricted session material. Credentials and tokens stay out of audit. Session providers attest identity and freshness; Access Policy decides resource access. Hard dependencies: Account Access and policy enforcement. Trace: MR-016/021, B01-CL-OD-01, B01-PA-OD-01/04, B02 L4–L5. Timeout/rotation tuning stays open.

## F01-G02-M02 · Member Relationships

| Temporary candidate / execution | Trigger, actors and outcome | Contract and recovery | AC |
|---|---|---|---|
| CAND-F01-G02-M02-invite-member · E0 | Actor with membership authority invites a specific eligible account | Own scoped invite ref, intended subject, household ref, lifecycle state, expiry and authority version. Accept with current subject proof and current issuer authority; commit membership once and emit a scoped membership fact. An invitation cannot appoint a primary or bind a child device. Invalid or mismatched claim reveals no household details. | M1–M2 |
| CAND-F01-G02-M02-end-membership · E1 | Authorized actor requests membership removal or eligible member leaves | Commit current scoped membership change and epoch. Access Policy governs primary handover and any conflicting authority before removal can take effect. Preserve lawful history; deny subsequent access relying on old affiliation. Withdrawal by a verified adult follows adult authority. Disputed relationships route to verification. | M3–M4 |

Data class: restricted family membership facts. Invitees accept their own invitation subject to policy. Supporter/observer cannot promote themselves. Access Policy owns grants/handover. Family Structure owns child app binding. Hard dependencies: Account Access, Session Security, Access Policy and downstream epoch consumers. Trace: P6-AP-OD-01..04, B01-CL-OD-01/03, B01-C-OD-01, MR-017. Cross-household rules remain with B02-I01.

## F01-G05-M02 · Mode Transitions

| Temporary candidate / execution | Trigger, actors and outcome | Contract and recovery | AC |
|---|---|---|---|
| CAND-F01-G05-M02-propose · E1 | Eligible child or caregiver records scoped transition proposal | Own immutable proposal reference, current/proposed mode, subject scope, evidence refs and versions. Proposal state has no effect on effective mode or grants. Invalid or unsupported transition is rejected or routed for verification. | T1 |
| CAND-F01-G05-M02-resolve · E1 | Current authorized decision-maker approves or declines a valid proposal | Recheck scope, authority, adult self-management and base mode version. Commit approved transition with Mode State under a single guarded protocol; resolve races against stale proposals. Access Policy owns delegated grants. CR and plan services recheck mode, grant, lock and validation at apply. Caregiver handover by itself preserves effective mode and valid delegated grants while approved/unapplied CR reapproval rules remain. | T2–T3 |

Data class: restricted mode/proposal evidence. Approval rights come from current policy. Age and AI recommendations supply no decision authority. Hard dependencies: Mode State, Access Policy and CR/plan consumers. Trace: B01-MS-OD-01..04, B01-C-OD-01, B01-CR-OD-02, P6-AP-OD-03..05, MR-015/017. Exact transition eligibility and child participation criteria remain research-dependent.

## F05-G06-M02 · Deletion Graph

| Temporary candidate / execution | Trigger, actors and outcome | Contract and recovery | AC |
|---|---|---|---|
| CAND-F05-G06-M02-record-lineage · E1 | Authorized producer creates a derivative with traceable Journal sources | Graph owns root/derived opaque refs, store locator references, graph version and provenance. Producer registers all roots and current suppression evidence before making output visible. Unknown or incomplete lineage quarantines the output. No Journal content or model payload stored in graph. | G1–G2 |
| CAND-F05-G06-M02-resolve-lineage · E1 | Authorized retention coordinator resolves copies affected by a tombstone | Return scoped transitive derivative/store references and coverage evidence. Visit each opaque ref once; missing edges, cross-scope data or unexpected cycles block verified completion and route for investigation. Restore and late outputs must honor tombstone before visibility. Retention owns deadline/hold and commands, store owners execute and attest deletion, Journal Sharing owns revoke. | G3–G4 |

Data class: restricted, content-free lineage metadata. Producers write only own derived refs. Retention worker reads only policy-authorized graph scope and cannot browse content. Hard dependencies: Journal Sharing, Purpose-bound Access, Retention, and producer/store inventories. Trace: B01-PA-OD-01/03/04, B01-C-OD-07, B02 J3–J4/R3–R5, MR-016/018/022. Proof that the graph covers all approved stores remains open.

## Cohort, autonomy and recovery

These candidate profiles specify interaction only. Minor legal authority, approval rules and evidence confidence are UNKNOWN until verified. Access, Session and Membership carry only account/household evidence. Mode applies per child; operational authority remains grant- and plan-scoped. Deletion graph is service-only for all ages; a requester uses the authorized retention flow and receives a scoped status, never graph details.

| Cohort | Access / Session / Membership | Mode proposal and approval | Alternative path |
|---|---|---|---|
| A0 | Conditional caregiver-led setup within verified scope | Conditional caregiver interaction; no direct transition flow assumed | Defer direct interaction, use verified support |
| A1 | Conditional supervised interaction, caregiver manages own credentials | Conditional assisted input; authorized caregiver decision if eligible | Defer if actor/authority unknown |
| A2 | Conditional assisted subject proof without credential sharing | Conditional guided subject proposal; current policy resolves approval | Verified recovery/support |
| A3 | Conditional guided account/member confirmation | Conditional subject proposal within policy; current approver rechecked | Escalate disputed authority |
| A4 | Conditional subject-led verification within approved policy | Conditional subject proposal and scoped decision; no inferred grant | Verify status before proceeding |
| A5 | Conditional self-managed adult controls credentials and participation | Adult self-management prevails over caregiver transitions | Adult-controlled recovery and rights path |

## Acceptance criteria and design-test oracles

| AC / test | Fixture and action | Observable oracle |
|---|---|---|
| A1 / B03-T01 | Valid subject proof, then invalid proof for existing and unknown accounts | Only first produces scoped identity evidence; generic outward failure for both invalid cases. |
| A2 / B03-T02 | Concurrent recovery claims with identical operation ID; lose first response | One accepted recovery and epoch advance; reconcile returns same scoped outcome without a second credential change. |
| A3 / B03-T03 | Claimed caregiver tries to recover subject account using family membership alone | No credential, account epoch or session changes; request requires independent proof. |
| S1 / B03-T04 | Renew session at expiry or after account epoch change | No successor session based on stale evidence. |
| S2 / B03-T05 | Terminate session while a protected read prepares response | If revocation commits before disclosure, no unauthorized response leaves the service. |
| S3 / B03-T06 | Repeat termination and retry with recovered account under fresh evidence | Old epoch remains fenced; fresh session requires independent valid proof and current authorization. |
| M1 / B03-T07 | Eligible invite accepted by intended subject; repeat accept | Exactly one membership and one committed fact, no role or device binding inferred. |
| M2 / B03-T08 | Wrong subject, revoked issuer, and expired invitation | No membership, no household disclosure. |
| M3 / B03-T09 | Membership removal races with old scoped access | If removal wins, stale epoch cannot authorize access. Authorized historical provenance persists where permitted. |
| M4 / B03-T10 | Observer attempts self-promotion; removal would leave ambiguous primary | No silent primary assignment, scope expansion or permission transfer. Route through Access Policy. |
| T1 / B03-T11 | Eligible child submits proposal then attempts mutation relying on it | Proposal exists, effective mode/version and grants unchanged, new permission denied. |
| T2 / B03-T12 | Competing approvals for same base mode version, or authority lost before commit | At most one effective transition; stale or unauthorized decision has no effect. |
| T3 / B03-T13 | Primary handover during pending proposal and approved unapplied CR | Effective mode and still-valid grants persist. Current authority determines proposal action. CR follows reapproval; old approval cannot apply. |
| G1 / B03-T14 | Producer registers derivative from two roots and both are current | Exactly two source edges with versioned evidence; disclosure still requires current scoped grant. |
| G2 / B03-T15 | Producer omits one root or receives stale suppression epoch | No publication; quarantine evidence remains scoped and content-free. |
| G3 / B03-T16 | Traverse shared derivative with missing store, duplicate paths and cycle | Deduplicate discovered refs; unresolved coverage prevents verified completion and raises scoped finding. |
| G4 / B03-T17 | Restore backup or race a late derivative after tombstone | No visibility from restored or late copy. Store receipt required before verified completion. |

## Triage and next checkpoint

- B03-I01 HIGH: prove account/session revocation across security boundaries and recovery proof sufficiency. B02-I01 remains open.
- B03-I02 HIGH: verify handover, member departure and mode transition against concurrent plan commit. Inherits BI-03/12 and B02-I02.
- B03-I03 HIGH: establish completeness of store/producer coverage and late-write fencing. Inherits B02-I03/04.
- BI-05/10 and B02-I05 stay open for legal basis and age/authority evidence. No new legal, recovery or membership policy is adopted. Park genuine choices for the consolidated Owner package after research.
- Deterministic structural check below covers candidate and test identifiers. Test execution and independent Claude review remain pending. G-Legal BLOCKED for real child data; remaining release gates UNKNOWN.
- After B02 and B03, 89 distinct inventory L3 remain outside P6/B01/B02/B03, plus partial-slice follow-up on B02. Next candidates: F01-G03-M01, F01-G03-M02, F01-G06-M01 and relevant Journal source-owner modules. Reconfirm canonical scope and source heads before writing. Full consolidation and Owner package remain open.

Structural check executed: five canonical parents, ten unique candidates and 17 unique proposed test IDs.

Current design amendment: [Owner decision implementation and evidence](Feature_3_2_L4_Owner_Decision_Implementation_and_Evidence_REVIEW.md). Its ODP acceptance criteria apply where this checkpoint handles the affected operation.
