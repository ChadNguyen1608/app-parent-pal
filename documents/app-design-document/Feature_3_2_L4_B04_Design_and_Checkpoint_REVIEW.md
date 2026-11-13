# Batch 04 · Identity, rights requests and private Journal

Candidate specification · synthetic design only · no stable L4 IDs · MVP undecided

## Common controls

F01-G04-M01 issues final ALLOW/DENY. F07-G06-M01 supplies purpose and legal assessment. Unavailable or stale evidence denies the protected action. Adult self-management takes precedence after verification. No real child personal data with unknown lawful basis. Compare subject, purpose, policy and resource versions at protected commit and release. Use opaque identifiers and purpose-scoped diagnostics. No Journal text, credential or uploaded identity document in audit. E0/E1 paths use zero inference calls. Cost and operational feasibility remain UNKNOWN.

| Candidate | Actor and observable outcome | Owner and contract | Acceptance criterion and synthetic oracle |
|---|---|---|---|
| CAND-F01-G03-M01-create | Authorized profile initiator establishes one scoped subject record | Core Identity owns opaque profile ID, minimum age/cohort evidence reference, household scope and version. Linking and membership retain their own records. Duplicate operation resolves to original record after fresh authorization. E0. | B04-T01. Replay the same valid creation after timeout and attempt cross-household reuse. Exactly one profile is created. Cross-scope attempt returns no profile details. |
| CAND-F01-G03-M01-resolve | Authorized consumer receives permitted profile facts with uncertainty preserved | Return an allowlisted projection with provenance, subject and version. Missing age proof remains UNKNOWN. No downstream grant is implied by a cohort. E0. | B04-T02. Request an age-dependent operation with conflicting evidence. No verified age or adult authority is inferred. |
| CAND-F01-G03-M02-propose | Subject or authorized representative submits a correction for review | Profile Integrity owns correction request, base version, reason category and restricted evidence refs. It issues a decision to Core Identity rather than overwriting the source. E1. | B04-T03. Submit an age correction and retry with a changed payload. Original request is preserved; effective age remains unchanged while pending. |
| CAND-F01-G03-M02-verify | Current verifier resolves the correction against the current profile | Verify provenance and compare base version at effective update. Keep previous fact provenance where lawful. Fence stale downstream authorization. Dispute or stale evidence routes back to review. E1. | B04-T04. Two contradictory corrections use the same base version. At most one takes effect. Old age evidence cannot authorize an operation after change. |
| CAND-F01-G06-M01-request | Verified subject or representative records a scoped export or deletion request | Lifecycle Controls owns request ID, exact scope, actor authority ref, policy version and status. F07-G06-M02 owns retention, suppression and fulfillment policy. Reconcile after uncertain response. E1. | B04-T05. Replay authorized request and try a caregiver request against adult scope. One scoped request persists. Unauthorized request has no observable existence or side effect. |
| CAND-F01-G06-M01-receive | Current eligible requester sees the scoped result or obtains authorized delivery | Status and artifact references depend on fulfillment receipts. Recheck access and visibility per release including queued exports. Do not infer fulfillment from request submission. Do not bundle other subjects’ or revoked Journal data. Export fulfillment mechanics and eligibility remain open. E1. | B04-T06. Change access or suppress a Journal item while export is queued. Stale artifact never releases. UI reports only currently permitted state. |
| CAND-F05-G04-M01-save | Eligible author explicitly saves a private entry | Private Entries owns entry/version and source provenance. Only explicitly saved content persists. Text path E1. Voice path is conditional E2, using F07-G03-M03 only with approved purpose, transient handling and provider controls. If unavailable, offer manual text. | B04-T07. Cancel voice capture and save a separate text entry. No canceled payload persists. Text remains private with no share or future recall implied. |
| CAND-F05-G04-M01-revise | Eligible author edits their private entry | Create version after current author authorization and visibility checks. B02 grants remain version-scoped in the candidate design. Suppressed roots cannot be edited into visibility. E1. | B04-T08. Edit concurrently with suppression. An edit that loses the race creates no visible new version. Existing recipient cannot see the new version under the prior grant. |
| CAND-F05-G04-M02-search | Eligible author explicitly requests retrieval within their private Journal | Journal Retrieval owns scoped query and result projection. Gate before querying, filtering and releasing results. Search index follows deletion graph and suppression. E1, bounded by authorized scope. | B04-T09. Compare results before and after a tombstone. No snippet, hit count or cached result discloses suppressed content. |
| CAND-F05-G04-M02-open | Author actively opens a selected entry | Recheck root and version at release. Explicit open carries purpose-limited context. Future AI sessions have no default recall. Recipient sharing remains F05-G06-M01. E1. | B04-T10. Author opens an eligible entry, starts a later session without selecting it and tries a stale page token after deletion. First succeeds, later session has no auto-recall, stale token discloses nothing. |

## Cohort and permission profiles

A0 uses conditional caregiver-led profile and rights workflows after verified authority. Direct Journal participation UNKNOWN. A1 uses conditional supervised identity interaction and verified rights support, with direct private Journal participation UNKNOWN. A2 uses assisted profile correction and explicitly initiated Journal interaction if policy and age evidence permit. A3 uses guided subject requests and private Journal controls. A4 favors subject-led flows with verified eligibility. A5 applies verified self-management and voluntary family sharing. All ages use subject scope only. Correction approver is the verified role under current policy, and Journal author actions require lawful eligibility. Unresolved authority routes to verified support without revealing private content. Minor legal eligibility and accessibility evidence confidence UNKNOWN. Mode never expands identity or Journal authority.

## Trace, triage and handoff

| Module | Upstream authority / dependency | Open issue |
|---|---|---|
| F01-G03-M01/M02 | Canonical 3.2-R1, MR-016; P6-AP-OD-01/04; B01-CL-OD-01; B03 Account Access and Membership | B04-I01 HIGH. Proof threshold for age disputes and household conflicts requires research and verification. |
| F01-G06-M01 | MR-016/018; B01-PA-OD-01..04; B02 retention and B03 graph | B04-I02 HIGH. Verify export artifact generation and delivery fences. F07 export policy slice remains open. |
| F05-G04-M01/M02 | MR-018/030; B01-CL-OD-04; B01-PA-OD-03/04; B02 Journal/retention; B03 graph | B04-I03 HIGH. Verify voice transience and no automatic recall through search or memory. Defer voice if provider guarantees are unavailable. |

Ten candidate/AC-oracle pairs, zero runtime executions. Independent review pending consolidation. G-Legal BLOCKED for real child data; privacy, safety and feasibility gates UNKNOWN. Policy questions remain queued for consolidation after research.

## Pinned sources and internal queue

- PR #17 source commit `8e137faf619c607c89a70f4aa9dec1ba49cad693`.
- 3.2-R1 inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`.
- Batch 03 checkpoint blob `7bb9bc610a23cf924ba1f3e5bac557ee0c91b685`.
- Execution tracker blob `ce85d295b23ff40f1b87f6d68e355595b3cd1511`.
- [Batch 02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins the nine decision logs and normalized B01 sources.

| Batch | Proposed execution order |
|---|---|
| 5 | F07-G01-M01 Content CMS · F07-G01-M02 Structured Retrieval · F07-G02-M01 Editorial Workflow · F07-G02-M02 Evidence Provenance · F07-G03-M01 Single Interface Router |
| 6 | F07-G03-M02 Execution Budget · F07-G03-M03 Multimodal Interaction Orchestration · F07-G04-M01 Policy Evaluation |
| 7 | F07-G04-M02 Model Evaluation · F07-G05-M01 Safety Triage · F07-G05-M02 Human Response Workflow |
| 8 | F05-G01-M01 Child Conversation · F05-G01-M02 Companion Guardrails · F05-G02-M01 Opt-in Check-in · F05-G02-M02 Check-in Controls · F05-G03-M01 Reflection Prompts |
| 9 | F05-G03-M02 Reflection Review · F05-G05-M01 Structured Insight · F05-G05-M02 Insight Correction |
| 10 | F02-G01-M01 Intake & Updates · F02-G01-M02 Incremental Questions · F02-G02-M01 Preference Registry · F02-G02-M02 Preference Revision · F02-G03-M01 Evidence-linked Observations |
| 11 | F02-G03-M02 Non-labeling Review · F02-G04-M01 Environment Context · F02-G04-M02 Context Permissions · F02-G05-M01 Versioned Profile |
| 12 | F02-G05-M02 Child Feedback · F02-G06-M01 Provenance · F02-G06-M02 Correction & Confidence |
| 13 | F03-G01-M01 Framework Registry · F03-G01-M02 Evidence Alignment · F03-G02-M01 Dimension Taxonomy · F03-G02-M02 Domain Mapping · F03-G03-M01 Stage Catalog |
| 14 | F03-G03-M02 Accessibility Adaptation · F03-G04-M01 Goal Discovery · F03-G04-M02 Goal Constraints · F03-G04-M03 Development Roadmap & Milestones · F03-G05-M01 Grounded Recommendation |
| 15 | F03-G05-M02 Recommendation Review · F03-G05-M03 Career Exploration Guidance · F03-G06-M01 Goal Reassessment · F03-G06-M02 Goal Change Proposal |
| 16 | F04-G01-M02 Plan Templates · F04-G02-M01 Schedule Construction · F04-G02-M02 Schedule Conflict · F04-G03-M01 Task Ownership · F04-G03-M02 Approval Routing |
| 17 | F04-G04-M01 Daily Task View · F04-G04-M02 Execution Support · F04-G05-M01 Lightweight Check-off |
| 18 | F04-G05-M02 Evidence Submission · F04-G07-M01 Schedule Notifications · F04-G07-M02 Notification Preferences |
| 19 | F06-G01-M01 Activity Event Log · F06-G01-M02 Source Metadata · F06-G02-M01 Progress Rules · F06-G02-M02 Progress Exceptions · F06-G03-M01 Indicator Registry |
| 20 | F06-G03-M02 Indicator Evidence · F06-G04-M01 Deterministic Trends · F06-G04-M02 Cautious Insights · F06-G05-M01 Audience Views |
| 21 | F06-G05-M02 Summary Rendering · F06-G06-M01 Review Sessions · F06-G06-M02 Feedback Handoff |
| 22 | F08-G01-M01 School Data Connectors · F08-G01-M02 School Data Review · F08-G02-M01 Expert Discovery · F08-G02-M02 Expert Referral · F08-G03-M01 Activity Directory |
| 23 | F08-G03-M02 Resource Matching · F08-G04-M01 Device Consents · F08-G04-M02 External Data Import · F08-G05-M01 Commerce Catalog |
| 24 | F08-G05-M02 Transaction & Conflict Controls · F08-G06-M01 Education Budget Planning · F08-G06-M02 Expense & Approval Management |
| 25 | F01-G06-M02 Entitlements & Billing · F01-G06-M03 Subscription Billing Lifecycle · F07-G07-M01 Operational Console · F07-G07-M02 Billing & Cost Operations |

Structural validation executed: 106 unique source L3, 22 distinct L3 with prior review or a design slice, 84 untouched L3 mapped once in groups of 3–5, ten unique B04 candidates and ten unique proposed test IDs. Cross-group dependencies remain conditional until their provider design is verified. B02 Family Structure and F07 export partial slices remain open in addition to the queue.

Current design amendment: [Owner decision implementation and evidence](Feature_3_2_L4_Owner_Decision_Implementation_and_Evidence_REVIEW.md). Its ODP acceptance criteria apply where this checkpoint handles the affected operation.
