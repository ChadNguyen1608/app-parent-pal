# Parent-Pal — Execution Tracker to Phase 3 System Design

**Date:** 2026-11-14  
**Status:** `ACTIVE_EXECUTION_PLAN / DESIGN_ONLY`  
**Gate source:** [Batch 01 Conditional Baseline Owner Gate](Feature_3_2_L4_B01_Conditional_Design_Baseline_Owner_Gate_APPROVED.md).  
**Operating principle:** ChatGPT drafts and maintains GitHub, Claude only independent reviewer as needed (normally 0 agents), Owner approves new policy / scope / MVP / phase gates.

| ID | Stage | Deliverable | Owner (executor) | Reviewer / approver | Status | Exit condition |
|---|---|---|---|---|---|---|
| A1 | B01 | Conditional baseline decision log + source index | ChatGPT | Owner confirmed | DONE | Explicit limited approval registered |
| A2 | B01 | 46 finding-to-AC/test crosswalk and disposition | ChatGPT | Claude focused if risk | IN_PROGRESS / partial sources | Do not label resolved without per-item evidence |
| A3 | B01/P5/P6 | P5 missing 5 IDs, 9 semantic ambiguities, P6 F-023/F-021 | ChatGPT | Claude targeted | OPEN_EVIDENCE | Exact test IDs and source/version recovered |
| A4 | B01 | v3.1 4 MEDIUM + 3 LOW evidence review | ChatGPT | Claude if high-risk | PROPOSED_FIX/NOT_VERIFIED | Verify against original test oracle |
| A5 | B02 | Dependency/scope proposal | ChatGPT | Owner | DONE / B02 SCOPE APPROVED | Owner confirmed four B02 slices |
| A6 | B02+ | Design L3→L4 by approved batch with AC/tests/trace | ChatGPT | Claude for critical | CANDIDATE DRAFTS RECORDED | Complete candidate design and documented dispositions across agreed inventory |
| A7 | Coverage | L3 disposition coverage inventory across entire agreed scope | ChatGPT | Owner | 106/106 DISPOSITIONS RECORDED | Every in-scope L3 designed or deferred with rationale |
| A8 | Coverage | Cross-batch consolidation + contract/duplicate audit | ChatGPT | Claude selective | DESIGNER REVIEW RECORDED / INDEPENDENT REVIEW PENDING | Traceable, noncontradictory module contracts |
| A9 | Quality gate | Final L4 approval per ready module | ChatGPT review package | Owner | OWNER PACKAGE READY / FINAL ACCEPTANCE PENDING | Evidence and unresolved risks clearly classified |
| B1 | 3.3 | Update L3/L4 hard gates, value, economics, dependency scoring | ChatGPT | Owner | NOT_STARTED | Scoring with confidence, missing=UNKNOWN |
| B2 | 3.4 | Expand 12 use case families to flows/permission/data/AI-policy | ChatGPT | Claude focused | NOT_STARTED | Main/alternative/error paths trace to L4 |
| B3 | 3.5+ | Complete remaining Feature Planning as authorized | ChatGPT | Owner | WAIT_FOR_STAGE_GATE | Do not jump stages unapproved |
| B4 | Product Scope | MVP, deferred modules and safety constraints | ChatGPT | Owner | NOT_STARTED | Decision log, trace to value and dependency |
| B5 | User Flow | Parent/Child/Adult/Admin end-to-end flows | ChatGPT | Owner | NOT_STARTED | Permission/consent/privacy reflected |
| C1 | Product Design | IA, screen hierarchy/navigation | ChatGPT | Owner | NOT_STARTED | Critical role screens mapped |
| C2 | Product Design | UX flows, wireframes & failure states | ChatGPT | Owner | NOT_STARTED | Usable, minimal reporting/cost |
| C3 | Product Design | UI system, accessibility/responsiveness | ChatGPT | Owner | NOT_STARTED | Cross-device consistency |
| C4 | Product Design | Security/privacy/role consistency review | ChatGPT | Claude for critical | NOT_STARTED | No silent bypass |
| C5 | Validation | Prototype + user validation (where feasible) | ChatGPT prepares; humans test | Owner | NOT_STARTED | Evidence-based changes |
| D1 | System Design handoff | Product requirements/capability contracts | ChatGPT | Owner | NOT_STARTED | Stable interface boundaries |
| D2 | System Design handoff | Entities/state/event/integration inventory | ChatGPT | Claude selective | NOT_STARTED | Traceable, versioned |
| D3 | System Design handoff | NFRs/security/privacy/cost/ops | ChatGPT | Owner | NOT_STARTED | Risk and constraints explicit |
| D4 | Entry gate | Phase 3 System Design readiness package | ChatGPT | Owner | NOT_STARTED | Owner authorizes phase transition |

## Current execution notes

- Open B01 issues tracked in [BI-01..BI-12](Feature_3_2_L4_B01_Baseline_Open_Issues_and_Handoff_REVIEW.md).
- Proposed Batch 02 scope: [Dependency & Scope Proposal](Feature_3_2_L4_B02_Dependency_and_Scope_Proposal_REVIEW.md). Scope remains pending Owner decision.
- 42 Owner Decisions unchanged, no acceptance of 25 L4 final candidates, no app runtime tests, no production processing of real child data.
- Avoid over-automation: only run independent Claude when evidence warrants; do not run every original design test for process theater.


## Update 2026-11-14 — Batch 02 scope confirmed

Owner explicitly approved **all four** Batch 02 L3 modules in proposed workstream order; see [B02 Scope Owner Decision](Feature_3_2_L4_B02_Scope_Owner_Decision_APPROVED.md). This approval supersedes any older `B02_SCOPE_PROPOSAL / NOT_OWNER_APPROVED` or `BLOCKED_BY_SCOPE_GATE` status in this historical document. **B02 design is authorized**, but no L4 deliverable has yet been accepted. Product Blueprint 3.2-R1 contains **106 L3**; 3 P6 + 5 B01 already reviewed, 4 B02 selected, **94 remain beyond B02**. ChatGPT starts F01-G02-M01, then F04-G06-M02; Journal and Retention follow dependency gates. No canonical changes or production child data use.

## Execution checkpoint — B02 and B03

- [Batch 02](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) at `6f2c31bb9c700d4c1912ce7f923c35f3a8eff83a`: four approved slices, 11 candidates, 22 proposed design tests.
- [Batch 03](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md) at `3e3fd9139f64da1f7641aa4cb514454e321ad7e9`: five dependency modules, 10 candidates, 17 proposed design tests.
- A6 in progress. 89 distinct inventory L3 remain outside P6/B01/B02/B03; B02 partial-slice dispositions remain open. A7–A9 remain open. No runtime tests or independent Claude review have been executed.

## Consolidation checkpoint

- [Consolidation and Owner Decision Package](Feature_3_2_L4_Consolidation_and_Owner_Decision_Package_REVIEW.md) at `90de65088ec0866894531c23da54e8c2908c9d8d`. B02–B26 cover 98 L3 in candidate design, with eight prior P6/B01 review dispositions. Total 106/106 accounted for. 129 new candidate IDs and 148 new proposed test IDs; zero runtime runs.
- B26 addresses the B02 household and export partial slices. Owner review has three questions. Independent Claude handoff is prepared. Final L4 approval, stable IDs and canonical edits remain separately gated.

## Detailed review checkpoints

Detailed review expands the prior inventory coverage. Track candidate depth separately from independent verification, Owner acceptance and runtime evidence.

| Group | Scope | Status |
|---|---|---|
| [01](Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md) | Child App pairing, membership, sessions | Detailed draft |
| [02](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) | Education answers, companion guardrails, routing, safety | Detailed draft |
| [03](Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md) | Journal sharing, lineage, lifecycle, purge/export | Detailed draft; legal and backup gates open |
| [04](Feature_3_2_L4_Detailed_Review_Group_04_Plan_Changes_REVIEW.md) | Plan baseline, approval, routing, balance, history | Detailed draft; commit/clock evidence pending |
| [05](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) | Submission, assessment provenance and audience-safe reports | Detailed draft; P6 evidence pending |
| [06](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md) | Activity events, provenance, progress rules/exceptions and indicator registry | Detailed draft; four additional distinct L3, Source Metadata revisited |
| [07](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) | School connector/review, expert referral, device consent and external import | Detailed draft; five additional distinct L3 |
| [08](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) | Commerce catalog, transactions, education budgets and expense approvals | Detailed draft; four additional distinct L3 |
| [09](Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md) | Subscription entitlements, billing, operational console and cost reconciliation | Detailed draft; four additional distinct L3 |
| [10](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md) | Content CMS, retrieval, editorial workflow and evidence provenance | Detailed draft; four additional distinct L3 |
| [11](Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md) | AI execution budget, modality, policy and model evaluation | Detailed draft; four additional distinct L3 |
| [12](Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md) | Check-in invitations, reminder controls, reflection prompts and private draft review | Detailed draft; four additional distinct L3 |
| [13](Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md) | Private Journal entries, retrieval, structured insights and corrections | Detailed draft; four additional distinct L3 |

Of the original 94 L3, 46 have detailed checkpoints and 48 remain at candidate depth. At 3–5 new L3 per checkpoint, plan for approximately 10–16 additional checkpoints, with 12 at four per checkpoint. Exact grouping depends on dependencies.

Next, checkpoint child identity, profile integrity and verification boundaries. Continue in groups of 3–5 L3. Exit a group when authority/data owners, entry states, exceptional transitions, cohort applicability, positive/negative/retry oracles, upstream trace and pending evidence are recorded. A whole-catalog depth claim requires an explicit per-L3 crosswalk. Consolidated independent re-review and runtime evidence remain pending.
