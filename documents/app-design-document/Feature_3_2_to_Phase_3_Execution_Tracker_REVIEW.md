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
| [14](Feature_3_2_L4_Detailed_Review_Group_14_Identity_and_Verification_REVIEW.md) | Core identity, profile integrity and account recovery | Detailed draft; three additional distinct L3 |
| [15](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) | Profile intake, incremental questions, preference registration/revision and observations | Detailed draft; five additional distinct L3 |
| [16](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md) | Non-labeling review, environment context, context permissions and versioned profile | Detailed draft; four additional distinct L3 |
| [17](Feature_3_2_L4_Detailed_Review_Group_17_Feedback_and_Corrections_REVIEW.md) | Child feedback, provenance and correction/confidence | Detailed draft; three additional distinct L3 |
| [18](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) | Framework registry, evidence alignment, dimensions, mapping and stage catalog | Detailed draft; five additional distinct L3 |
| [19](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) | Accessibility, goal discovery and constraints, milestones and grounded recommendations | Detailed draft; five additional distinct L3 |
| [20](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) | Recommendation review, career exploration, goal reassessment and change proposals | Detailed draft; four additional distinct L3 |
| [21](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md) | Plan templates, schedule construction/conflicts and task ownership | Detailed draft; four additional distinct L3; Approval Routing linked from 04 |
| [22](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) | Daily task view, execution support, check-off, schedule reminders and notification preferences | Detailed draft; five additional distinct L3 |
| [23](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) | Indicator evidence, trends, cautious insights, review sessions and feedback handoff | Detailed draft; five additional distinct L3 |
| [24](Feature_3_2_L4_Detailed_Review_Group_24_Final_Inventory_REVIEW.md) | Mode transitions, deferred human response, expert/activity directories and resource matching | Detailed disposition for final five L3; human response deferred in initial release |

Of the original 94 L3, all 94 now have detailed design dispositions. No modules remain at candidate-only depth in this scope.

Next, use checkpoint 24's per-L3 crosswalk for consolidated independent re-review. Runtime evidence, legal verification, unresolved source gaps and final Owner acceptance remain pending.


## Update 2026-11-14 — Functional Baseline pinned; 3.3 initialized

- **L4 final review input FROZEN:** [Pinned 24-group Functional Baseline Manifest](Feature_3_2_L4_Functional_Baseline_Frozen_Manifest_20261114_REVIEW.md), source branch head pinned at `2e33afb9e5d97c4603a8230cb8f183fddb31bdb1`. Manifest supplies source blob SHA per group and targeted Claude Code independent read-only review instructions. **Independent re-review NOT EXECUTED by this checkpoint**, so final acceptance remains pending.
- **3.3 B1 STARTED:** [Initial 106-L3 Assessment Registry](Feature_3_3_Initial_106_L3_Assessment_Registry_REVIEW.md), every L3 across F01–F08 present and A0–A5 explicitly UNKNOWN until assessment. Approved 3.3 methodology (Hard Gates → Value → Economics, L3 first, evidence confidence) preserved. Candidate dependency examples are **not an exhaustive graph**. No numeric scores, scores for each cohort, ranking, MVP selection, canonical changes or production claim.
- **3.4 B2 NOT STARTED**. Next research increment: evidence for gates/value/economics and full dependency verification, then independent Claude review disposition and Owner gate.


## Update 2026-11-14 — Claude verification prompt & 3.3 preliminary scoring

- Prepared [Claude Code Final Independent Verification PROMPT](Feature_3_2_L4_Claude_Final_Independent_Verification_PROMPT.md) against the pinned 24-group manifest, with explicit six deliverables, 106-L3 census, 98-new/8-prior distinction, four earlier HIGH findings and no real-child-data/runtime/merge privileges. **Prompt prepared only; Claude has NOT been invoked in this turn**. A8/A9 still independent review and Final L4 acceptance pending.
- Completed a first **106/106 L3 preliminary qualitative Value/Cost exposure assessment** in [3.3 Preliminary Triage](Feature_3_3_106_L3_Preliminary_Value_Cost_Triage_REVIEW.md). It crosswalks canonical 3.2 names, 94 detailed-review links + 12 P6/B01/B02 and UX pattern six cohorts. Role classification, cost-exposure cues and research queue are `HYPOTHESIS`, not numeric evidence-backed scores or release approvals. `mvp_decision=NOT_DECIDED` across all 106.
- B1 3.3 state: `QUALITATIVE_TRIAGE_COMPLETE / NUMERIC_VALUE_AND_COST_PENDING_EVIDENCE / DEPENDENCY_GRAPH_NOT_EXHAUSTIVE`. Need cohort sample/validation, calibration MR-039, cost measurement MR-025..029, graph verification MR-040 and hard gate legal/safety evidence before numerical comparison. This is **not** an approved MVP shortlist. B2 3.4 remains `NOT_STARTED` pending agreed transition.


## 2026-11-14 — Owner FR-01A/B gate

[Approved FR-01 Option A](Feature_3_2_L4_FR01_Parent_PIN_Unlink_and_Repairing_Owner_Decision_APPROVED.md) added: Parent PIN for linked child Unlink, minimal Parent App notification, normal same-household re-pair, separate child-specific authority verification before different-household link. Group 01 candidate amended by explicit supersession note; FR01-T01..T11 proposed. FR-01 HIGH **OPEN / SPEC_REVIEW_PENDING**; exact PIN security parameters and cross-household verification method not decided. No real-data processing, canonical edit, release or PR merge.


## 2026-11-14 — Claude OD-02..OD-05 Owner gate recorded

Owner has approved OD-02 under-18 sponsored-content exclusion; OD-03 reviewed static 111 child safety and parent emergency 111/113/115 with no generated advice/outbound action; OD-04 B01 v3.1 supplemental pin; OD-05 global AI-output approved-scope gate without blanket external sourcing. See [Decision Log](Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md) and [Supplemental Reviewer Manifest](Feature_3_2_L4_20261114_Owner_Finding_Remediation_Supplemental_Manifest_REVIEW.md). Detailed groups 02/04/08/24 have explicit supersession annotations. FR-01 earlier approved with Parent PIN and new household verification. Claude focused recheck required for FR-01, FR-06, FR-09, FR-08, H2; FR-03/H4 legal gates remain open. Value/Cost 3.3 scoring still provisional; no MVP selection, Final L4 or PR merge.


## 2026-11-14 — Author-only L4 Remediation (Owner declined Claude recheck; Claude owns scoring)

Owner directed ChatGPT to handle **L4 remediation only**, without focused Claude regression; **Claude will handle 3.3 scoring**. Read the uploaded final Claude report with 0 CRITICAL / 1 HIGH / 6 MEDIUM / 2 LOW and 92 PASS_SPEC, 9 GAP, 1 BLOCKED_BY_POLICY, 4 NOT_REVIEWED at historical snapshot. [Author Remediation Register](Feature_3_2_L4_Claude_Final_Report_Author_Remediation_Register_20261114_REVIEW.md) now traces all nine findings FR01/02/03/09/05/06/08/04/07, approved FR-01 + OD-02..05, updated group 01/02/04/08/24 and explicit supersession of retired IR-T01A. New oracles are **proposed, no runtime execution**.

FR-02 knowledge-source notice, per-claim "chưa kiểm chứng" and verification queue; FR-05 no proactive paid suggestion during parent distress; FR-07 historical oracle supersession; FR-04 cross-household scoped access; FR-08 B01 v3.1 source plus normalized invariants; FR-01 PIN and separate new-family authority; OD-02 minors sponsor suppression; OD-03 static 111/113/115; OD-05 global AI generated-answer gate. FR-03/legal authority, H4 deletion deadlines, FR-01 exact re-pair verification method and B01/shared-activity technical semantics **remain OPEN**. Four original NOT_REVIEWED remain such; no claim of 106 independently verified.

Checkpoint status: `L4_AUTHOR_REMEDIATION_RECORDED / FINAL_L4_APPROVAL_PENDING / NO_FOCUSED_CLAUDE_RECHECK_BY_OWNER_CHOICE`. 3.3 qualitative preliminary materials preserved unchanged; future 3.3 scoring assigned to Claude. 3.4 NOT_STARTED; MVP NOT_DECIDED. No canonical edit, production child data, PR merge or release approval.
