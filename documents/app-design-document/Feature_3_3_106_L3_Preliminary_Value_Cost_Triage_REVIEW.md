# Parent-Pal · 3.3 — Preliminary Value / Cost Exposure Scoring, Full 106 L3

**Date:** 2026-11-14  
**Status:** `PROVISIONAL_QUALITATIVE_TRIAGE / NUMERIC_SCORES_UNKNOWN / MVP_NOT_DECIDED`  
**Inputs:** approved [3.3 methodology](Product_Blueprint_03_3_Feature_Prioritization_and_Dependency_Mapping.md) blob `43683dc6e0e7e2a94411f9bb6499ab61b3ef93cb`; [3.2-R1 inventory](Product_Blueprint_03_2_Feature_Inventory_and_Scope.md) blob `f52be52f5ae37ddce0b6a021aec915659f357db3`; [24-group detailed crosswalk](Feature_3_2_L4_Detailed_Review_Group_24_Final_Inventory_REVIEW.md) blob `fdbb8682a70bc0ef9c712c989a5ec46f8294f940`, [pinned manifest](Feature_3_2_L4_Functional_Baseline_Frozen_Manifest_20261114_REVIEW.md). Four B02 and eight P6/B01 prior-reviewed entries use linked earlier sources. **All 106 records covered, 51 canonical group UX codes inherited exactly; 94 crosswalk rows + 12 prior/B02.**

## 1. What is and is NOT scored

This is a **source-grounded first scoring pass of product role and cost exposure**, not validated user desirability or an engineering estimate. It is intended to prioritize *evidence collection and dependency review*. Q1–Q6 of 3.3 prohibit invented calibrated numerical rankings. Thus:

| 3.3 axis | Current disposition | Reason |
|---|---|---|
| G-Legal, G-Privacy, G-Safety, G-Feasibility | `UNKNOWN` **per actual use/cohort** | Design oracles, legal assumptions and draft clauses cannot prove release compliance; unknown lawful basis means deny real child personal-data processing |
| Parent Value / Child Value / Adult User Value, A0–A5 | `UNKNOWN` numeric | No directly linked segmented adoption, user testing or validated outcome study for each L3; **role/value hypothesis** below is design inference only |
| Adoption, differentiation | `UNKNOWN` numeric | No verified comparative or field data in source snapshots |
| Dependency enablement | `HYPOTHESIS` role tag | Interface/ownership evidence is available; complete provider-consumer graph not yet verified |
| Implementation effort, maintenance, operating cost, AI cost per outcome, cost USD | `UNKNOWN` numeric | No scoped estimates, production usage, model benchmark, provider tariffs or staffing assumptions verified |
| Cost exposure surface | Tagged `HYPOTHESIS` | Only signals where costs/complexity are likely to arise (not price or effort magnitude) |
| `mvp_decision` | `NOT_DECIDED` for all 106 | Product Owner decision after 3.3 + 3.4 |

**Role classes** follow approved 3.3 `ROLE-V` (user-value), `ROLE-F` (foundation), `ROLE-S` (safety/compliance), `ROLE-E` (extension), each provisional and **not numeric prioritization or regulatory approval**. A module can have additional roles; below lists **one hypothesized primary** solely for triage. Explicit Owner deferral of Human Response preserved.

**Value hypotheses**: `CORE_OR_SUPPORTING_FLOW` (potentially in Understand→Orient→Plan→Execute→Feedback→Evaluate), `ENABLER_OF_USER_VALUE` (indirect enabling value), `PROTECTED_WORKFLOW` (security/safety condition), `EXTENSION_OR_PROVIDER` (optional/cost/market risk), not relative score or MVP membership.

**Cost exposure codes**: `DATA_PRIVACY` (privacy/lineage/legal), `MODEL_OR_EVAL` (model, evidence or AI evaluation scope), `STATE_REPLAY` (versioning/idempotency/transaction), `EXTERNAL_OR_COMMERCIAL` (vendor/payment/platform), `CONTENT_EVIDENCE` (human validation/governance), `EVENT_OR_DELIVERY`, `BASELINE_RUNTIME`. These codes are **transparent review triggers based on L3 names/design domains, not confirmed engineering effort**.

**Research queue codes**: `GATE_PROOF` first means release blockers merit evidence; `COHORT_VALUE_RESEARCH`, `DEPENDENCY_PROOF`, `COST_FEASIBILITY`, `SCOPE_RESEARCH` are separate research tasks, **not a build priority order**.

**Cohort UX codes**: the six values are copied from 3.2 group-level matrix: `P/S/C/Y/U/—` and starred variants. UX **does not grant permission, establish applicability or score user value**. Each L3 still requires six child/user-specific applicability/value assessments with `UNKNOWN` until individually reviewed. `—` represents original group UX distinction, not official L3 `NOT_APPLICABLE`.

## 2. Structural counts of proposed triage roles

| Candidate role | Number of L3 | Interpretation |
|---|---:|---|
| ROLE-E | 14 | Hypothesis, no approval |
| ROLE-E · DEFERRED | 1 | Hypothesis, no approval |
| ROLE-F | 25 | Hypothesis, no approval |
| ROLE-S | 17 | Hypothesis, no approval |
| ROLE-V | 49 | Hypothesis, no approval |
| **Total** | **106** | |

**Research queue distribution:** `COHORT_VALUE_RESEARCH` 41; `COST_FEASIBILITY` 26; `DEPENDENCY_PROOF` 21; `GATE_PROOF` 17; `SCOPE_RESEARCH` 1.

## 3. Full 106 L3 scorecard (hypothesis only)

Source link refers to the detailed group where present; P6/B01 use the indexed decisions until targeted crosswalk closure. All rows: `Gates=UNKNOWN`, `parent_value=UNKNOWN`, `child_value=UNKNOWN`, `adult_value=UNKNOWN`, `effort=UNKNOWN`, `actual_cost=UNKNOWN`, `evidence_confidence=HYPOTHESIS`, `assessment_status=PROVISIONAL`, `delivery_status=NOT_PLANNED`, `mvp_decision=NOT_DECIDED`.

| L3 | Source name | Proposed primary role | Value hypothesis | Cost-exposure cues | Evidence queue | 3.2 UX A0 / A1 / A2 / A3 / A4 / A5 | Evidence |
|---|---|---|---|---|---|---|---|
| `F01-G01-M01` | Account Access | ROLE-F | ENABLER_OF_USER_VALUE | DATA_PRIVACY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_14_Identity_and_Verification_REVIEW.md) |
| `F01-G01-M02` | Session Security | ROLE-F | ENABLER_OF_USER_VALUE | STATE_REPLAY, EVENT_OR_DELIVERY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md) |
| `F01-G02-M01` | Family Structure | ROLE-F | ENABLER_OF_USER_VALUE | BASELINE_RUNTIME | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) |
| `F01-G02-M02` | Member Relationships | ROLE-F | ENABLER_OF_USER_VALUE | BASELINE_RUNTIME | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md) |
| `F01-G03-M01` | Core Identity | ROLE-F | ENABLER_OF_USER_VALUE | DATA_PRIVACY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_14_Identity_and_Verification_REVIEW.md) |
| `F01-G03-M02` | Profile Integrity | ROLE-F | ENABLER_OF_USER_VALUE | DATA_PRIVACY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_14_Identity_and_Verification_REVIEW.md) |
| `F01-G04-M01` | Access Policy | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) |
| `F01-G04-M02` | Consent Ledger | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY, STATE_REPLAY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) |
| `F01-G05-M01` | Mode State | ROLE-F | ENABLER_OF_USER_VALUE | STATE_REPLAY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) |
| `F01-G05-M02` | Mode Transitions | ROLE-F | ENABLER_OF_USER_VALUE | STATE_REPLAY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_24_Final_Inventory_REVIEW.md) |
| `F01-G06-M01` | Lifecycle Controls | ROLE-S | PROTECTED_WORKFLOW | STATE_REPLAY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md) |
| `F01-G06-M02` | Entitlements & Billing | ROLE-E | EXTENSION_OR_PROVIDER | STATE_REPLAY, EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md) |
| `F01-G06-M03` | Subscription Billing Lifecycle | ROLE-E | EXTENSION_OR_PROVIDER | STATE_REPLAY, EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md) |
| `F02-G01-M01` | Intake & Updates | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) |
| `F02-G01-M02` | Incremental Questions | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) |
| `F02-G02-M01` | Preference Registry | ROLE-F | ENABLER_OF_USER_VALUE | DATA_PRIVACY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) |
| `F02-G02-M02` | Preference Revision | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) |
| `F02-G03-M01` | Evidence-linked Observations | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) |
| `F02-G03-M02` | Non-labeling Review | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md) |
| `F02-G04-M01` | Environment Context | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md) |
| `F02-G04-M02` | Context Permissions | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md) |
| `F02-G05-M01` | Versioned Profile | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md) |
| `F02-G05-M02` | Child Feedback | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_17_Feedback_and_Corrections_REVIEW.md) |
| `F02-G06-M01` | Provenance | ROLE-F | ENABLER_OF_USER_VALUE | DATA_PRIVACY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_17_Feedback_and_Corrections_REVIEW.md) |
| `F02-G06-M02` | Correction & Confidence | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_17_Feedback_and_Corrections_REVIEW.md) |
| `F03-G01-M01` | Framework Registry | ROLE-F | ENABLER_OF_USER_VALUE | CONTENT_EVIDENCE | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) |
| `F03-G01-M02` | Evidence Alignment | ROLE-F | ENABLER_OF_USER_VALUE | BASELINE_RUNTIME | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) |
| `F03-G02-M01` | Dimension Taxonomy | ROLE-V | CORE_OR_SUPPORTING_FLOW | BASELINE_RUNTIME | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) |
| `F03-G02-M02` | Domain Mapping | ROLE-F | ENABLER_OF_USER_VALUE | BASELINE_RUNTIME | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) |
| `F03-G03-M01` | Stage Catalog | ROLE-F | ENABLER_OF_USER_VALUE | CONTENT_EVIDENCE | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) |
| `F03-G03-M02` | Accessibility Adaptation | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) |
| `F03-G04-M01` | Goal Discovery | ROLE-V | CORE_OR_SUPPORTING_FLOW | BASELINE_RUNTIME | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) |
| `F03-G04-M02` | Goal Constraints | ROLE-V | CORE_OR_SUPPORTING_FLOW | BASELINE_RUNTIME | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) |
| `F03-G04-M03` | Development Roadmap & Milestones | ROLE-V | CORE_OR_SUPPORTING_FLOW | BASELINE_RUNTIME | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) |
| `F03-G05-M01` | Grounded Recommendation | ROLE-V | CORE_OR_SUPPORTING_FLOW | MODEL_OR_EVAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) |
| `F03-G05-M02` | Recommendation Review | ROLE-V | CORE_OR_SUPPORTING_FLOW | MODEL_OR_EVAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) |
| `F03-G05-M03` | Career Exploration Guidance | ROLE-E | EXTENSION_OR_PROVIDER | MODEL_OR_EVAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) |
| `F03-G06-M01` | Goal Reassessment | ROLE-V | CORE_OR_SUPPORTING_FLOW | CONTENT_EVIDENCE | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) |
| `F03-G06-M02` | Goal Change Proposal | ROLE-V | CORE_OR_SUPPORTING_FLOW | STATE_REPLAY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) |
| `F04-G01-M01` | Plan Structure | ROLE-V | CORE_OR_SUPPORTING_FLOW | STATE_REPLAY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) |
| `F04-G01-M02` | Plan Templates | ROLE-V | CORE_OR_SUPPORTING_FLOW | STATE_REPLAY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md) |
| `F04-G02-M01` | Schedule Construction | ROLE-V | CORE_OR_SUPPORTING_FLOW | STATE_REPLAY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md) |
| `F04-G02-M02` | Schedule Conflict | ROLE-V | CORE_OR_SUPPORTING_FLOW | STATE_REPLAY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md) |
| `F04-G02-M03` | Balanced Planning Validation | ROLE-S | PROTECTED_WORKFLOW | STATE_REPLAY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) |
| `F04-G03-M01` | Task Ownership | ROLE-V | CORE_OR_SUPPORTING_FLOW | STATE_REPLAY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md) |
| `F04-G03-M02` | Approval Routing | ROLE-S | PROTECTED_WORKFLOW | STATE_REPLAY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_04_Plan_Changes_REVIEW.md) |
| `F04-G04-M01` | Daily Task View | ROLE-V | CORE_OR_SUPPORTING_FLOW | BASELINE_RUNTIME | COHORT_VALUE_RESEARCH | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) |
| `F04-G04-M02` | Execution Support | ROLE-V | CORE_OR_SUPPORTING_FLOW | BASELINE_RUNTIME | COHORT_VALUE_RESEARCH | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) |
| `F04-G05-M01` | Lightweight Check-off | ROLE-V | CORE_OR_SUPPORTING_FLOW | EVENT_OR_DELIVERY | COHORT_VALUE_RESEARCH | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) |
| `F04-G05-M02` | Evidence Submission | ROLE-V | CORE_OR_SUPPORTING_FLOW | BASELINE_RUNTIME | COHORT_VALUE_RESEARCH | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) |
| `F04-G06-M01` | Change Requests | ROLE-V | CORE_OR_SUPPORTING_FLOW | STATE_REPLAY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) |
| `F04-G06-M02` | Change History | ROLE-V | CORE_OR_SUPPORTING_FLOW | STATE_REPLAY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) |
| `F04-G07-M01` | Schedule Notifications | ROLE-V | CORE_OR_SUPPORTING_FLOW | STATE_REPLAY, EVENT_OR_DELIVERY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) |
| `F04-G07-M02` | Notification Preferences | ROLE-V | CORE_OR_SUPPORTING_FLOW | EVENT_OR_DELIVERY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) |
| `F05-G01-M01` | Child Conversation | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, MODEL_OR_EVAL | COST_FEASIBILITY | — / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) |
| `F05-G01-M02` | Companion Guardrails | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY, MODEL_OR_EVAL | GATE_PROOF | — / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) |
| `F05-G02-M01` | Opt-in Check-in | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, EVENT_OR_DELIVERY | COHORT_VALUE_RESEARCH | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md) |
| `F05-G02-M02` | Check-in Controls | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, EVENT_OR_DELIVERY | COHORT_VALUE_RESEARCH | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md) |
| `F05-G03-M01` | Reflection Prompts | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, MODEL_OR_EVAL | COST_FEASIBILITY | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md) |
| `F05-G03-M02` | Reflection Review | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md) |
| `F05-G04-M01` | Private Entries | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | — / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md) |
| `F05-G04-M02` | Journal Retrieval | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY | GATE_PROOF | — / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md) |
| `F05-G05-M01` | Structured Insight | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, MODEL_OR_EVAL | COST_FEASIBILITY | — / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md) |
| `F05-G05-M02` | Insight Correction | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY, MODEL_OR_EVAL | GATE_PROOF | — / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md) |
| `F05-G06-M01` | Selective Sharing | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY | GATE_PROOF | P / S / C / C / Y / U | [source](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) |
| `F05-G06-M02` | Deletion Graph | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY, STATE_REPLAY | GATE_PROOF | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md) |
| `F06-G01-M01` | Activity Event Log | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, STATE_REPLAY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md) |
| `F06-G01-M02` | Source Metadata | ROLE-F | ENABLER_OF_USER_VALUE | DATA_PRIVACY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) |
| `F06-G02-M01` | Progress Rules | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, CONTENT_EVIDENCE | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md) |
| `F06-G02-M02` | Progress Exceptions | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md) |
| `F06-G03-M01` | Indicator Registry | ROLE-F | ENABLER_OF_USER_VALUE | DATA_PRIVACY | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md) |
| `F06-G03-M02` | Indicator Evidence | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) |
| `F06-G04-M01` | Deterministic Trends | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) |
| `F06-G04-M02` | Cautious Insights | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, MODEL_OR_EVAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) |
| `F06-G05-M01` | Audience Views | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) |
| `F06-G05-M02` | Summary Rendering | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) |
| `F06-G06-M01` | Review Sessions | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, STATE_REPLAY, EVENT_OR_DELIVERY | COHORT_VALUE_RESEARCH | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) |
| `F06-G06-M02` | Feedback Handoff | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY | COHORT_VALUE_RESEARCH | P / S / C / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) |
| `F06-G07-M01` | Academic Assessment | ROLE-V | CORE_OR_SUPPORTING_FLOW | DATA_PRIVACY, MODEL_OR_EVAL, CONTENT_EVIDENCE | COST_FEASIBILITY | P* / P* / S / C / Y / U | [source](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) |
| `F07-G01-M01` | Content CMS | ROLE-F | ENABLER_OF_USER_VALUE | CONTENT_EVIDENCE | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md) |
| `F07-G01-M02` | Structured Retrieval | ROLE-F | ENABLER_OF_USER_VALUE | MODEL_OR_EVAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md) |
| `F07-G02-M01` | Editorial Workflow | ROLE-F | ENABLER_OF_USER_VALUE | CONTENT_EVIDENCE | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md) |
| `F07-G02-M02` | Evidence Provenance | ROLE-F | ENABLER_OF_USER_VALUE | CONTENT_EVIDENCE | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md) |
| `F07-G03-M01` | Single Interface Router | ROLE-F | ENABLER_OF_USER_VALUE | MODEL_OR_EVAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) |
| `F07-G03-M02` | Execution Budget | ROLE-F | ENABLER_OF_USER_VALUE | BASELINE_RUNTIME | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md) |
| `F07-G03-M03` | Multimodal Interaction Orchestration | ROLE-E | EXTENSION_OR_PROVIDER | MODEL_OR_EVAL, EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md) |
| `F07-G04-M01` | Policy Evaluation | ROLE-S | PROTECTED_WORKFLOW | CONTENT_EVIDENCE | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md) |
| `F07-G04-M02` | Model Evaluation | ROLE-F | ENABLER_OF_USER_VALUE | MODEL_OR_EVAL, STATE_REPLAY, CONTENT_EVIDENCE | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md) |
| `F07-G05-M01` | Safety Triage | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) |
| `F07-G05-M02` | Human Response Workflow | ROLE-E · DEFERRED | EXTENSION_OR_PROVIDER | BASELINE_RUNTIME | SCOPE_RESEARCH | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_24_Final_Inventory_REVIEW.md) |
| `F07-G06-M01` | Purpose-bound Access | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) |
| `F07-G06-M02` | Retention & Export | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY, STATE_REPLAY | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) |
| `F07-G07-M01` | Operational Console | ROLE-F | ENABLER_OF_USER_VALUE | BASELINE_RUNTIME | DEPENDENCY_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md) |
| `F07-G07-M02` | Billing & Cost Operations | ROLE-F | ENABLER_OF_USER_VALUE | STATE_REPLAY, EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md) |
| `F08-G01-M01` | School Data Connectors | ROLE-E | EXTENSION_OR_PROVIDER | EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) |
| `F08-G01-M02` | School Data Review | ROLE-E | EXTENSION_OR_PROVIDER | EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) |
| `F08-G02-M01` | Expert Discovery | ROLE-E | EXTENSION_OR_PROVIDER | EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_24_Final_Inventory_REVIEW.md) |
| `F08-G02-M02` | Expert Referral | ROLE-E | EXTENSION_OR_PROVIDER | EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) |
| `F08-G03-M01` | Activity Directory | ROLE-E | EXTENSION_OR_PROVIDER | EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_24_Final_Inventory_REVIEW.md) |
| `F08-G03-M02` | Resource Matching | ROLE-E | EXTENSION_OR_PROVIDER | MODEL_OR_EVAL, EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_24_Final_Inventory_REVIEW.md) |
| `F08-G04-M01` | Device Consents | ROLE-S | PROTECTED_WORKFLOW | DATA_PRIVACY, STATE_REPLAY, EXTERNAL_OR_COMMERCIAL | GATE_PROOF | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) |
| `F08-G04-M02` | External Data Import | ROLE-V | CONDITIONAL_USER_VALUE | EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) |
| `F08-G05-M01` | Commerce Catalog | ROLE-E | EXTENSION_OR_PROVIDER | EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) |
| `F08-G05-M02` | Transaction & Conflict Controls | ROLE-E | EXTENSION_OR_PROVIDER | STATE_REPLAY, EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / S / C / Y / U | [source](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) |
| `F08-G06-M01` | Education Budget Planning | ROLE-E | EXTENSION_OR_PROVIDER | STATE_REPLAY, EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / P/S* / S* / S/Y* / U | [source](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) |
| `F08-G06-M02` | Expense & Approval Management | ROLE-E | EXTENSION_OR_PROVIDER | STATE_REPLAY, EXTERNAL_OR_COMMERCIAL | COST_FEASIBILITY | P / P / P/S* / S* / S/Y* / U | [source](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) |

## 4. Initial cohort-and-gate scoring procedure

For every L3, create six *distinct* assessment records (A0–A5) rather than multiply an inherited value score. For each cohort assess `applicability` (APPLICABLE/CONDITIONAL/NOT_APPLICABLE/UNKNOWN), `interaction_pattern` as 3.2 **UX only**, `parent_value`, `child_value`, `adult_user_value`, `sample_scope`, `limitations`, `evidence_confidence`, `assessed_by`, `assessed_at`. Where source lacks cohort-level evidence, keep numbers `UNKNOWN`. Specifically:
- A0/A1: evaluate caregiver-mediated value and child outcome, not assumed direct child AI use; F05-G01/G04 group pattern `—` in A0.
- A2/A3: CORE cohort under approved 2.x decisions; prioritize value research about child willingness to use and execute, without assuming adoption is high.
- A4: assess adolescent agency and consent; no default transfer of Journal data to adults.
- A5: verified adult owns their data; caregiver approval is not assumed.

Each formal 1–5 assessment needs a calibrated rubric (MR-039), dated evidence and reviewer. `UNKNOWN` cannot become 0, and high Value cannot override G-Legal/G-Privacy/G-Safety.

## 5. Evidence collection tasks to permit actual numerical Value/Cost

1. **Gates and provider contracts:** legal basis, deletion deadlines applicable in Vietnam, consent/identity/retention, safety response and media/provider processing (MR-016..024/035). Current real-data release remains denied wherever legal basis is UNKNOWN.
2. **6-cohort Value evidence:** parent/child usability, core loop willingness, over-questioning fatigue, task completion and engagement outcomes (MR-001/002/005..010, MR-011..015). Do not assert measured value from specification.
3. **Delivery estimates:** for each MVP *candidate* flow only, small engineering decomposition plus E0/E1 baseline, AI-call demand, provider tariffs, stored assets, support operations and retries (MR-025..029, MR-033/034/037/038). Record estimate ranges with scenario assumptions; unknown remains unknown.
4. **Dependency review (MR-040):** convert design-linked hypotheses to `CONFIRMED` only after both endpoint contracts, explicit release-versus-build scope and alternate path checks; detect cycles. Do not use unverified graph degree as an importance score.
5. **Independent L4 check:** [Claude final review prompt](Feature_3_2_L4_Claude_Final_Independent_Verification_PROMPT.md) is PREPARED, not RUN. Route closure of contradictory spec-level findings through that gate.

## 6. How to use this review

- This scorecard provides **full module-level coverage and concrete research/complexity surfaces**, with honest empty quantitative fields.
- The first *real* scored shortlist must combine six-cohort research + gate status + validated effort/cost and dependency. It will not be 106 fabricated numbers.
- Do not call a ROLE-V module 'high-priority MVP' or a ROLE-E module 'excluded' solely from this preliminary role classification. A backend role-F or role-S module may be compulsory for a small end-to-end MVP even when direct parent/child value is not observable.
- **Next draft deliverable:** evidence-backed per-cohort scoring on a focused comparative set of core workflows, then dependency-closed MVP candidate bundles for Owner review; 3.4 use cases after permission to move stage.
