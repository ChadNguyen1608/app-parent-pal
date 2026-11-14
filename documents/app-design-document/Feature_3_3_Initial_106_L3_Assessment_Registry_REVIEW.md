# Parent-Pal · 3.3 Initial L3 Assessment Registry — 106 Modules

**Date:** 2026-11-14  
**State:** `ASSESSMENT_INITIALIZED / VALUE_UNKNOWN / MVP_NOT_DECIDED`  
**Purpose:** mandatory full-inventory starting registry under approved 3.3 Q1–Q6, **not** a scored priority list. 3.2-R1 canonical source blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. Freeze input [L4 pinned manifest](Feature_3_2_L4_Functional_Baseline_Frozen_Manifest_20261114_REVIEW.md). 106 unique L3 parsed from canonical 3.2-R1; historical 98 counts are superseded. 3 P6 and 5 B01 prior-reviewed; other 98 new-design candidates, including the 94 later modules. L4 inherits L3 assessment **only when evidence demonstrates equivalence**; material data/consent/AI/cohort/safety differences require override.

## 1. Approved assessment methodology (no new policy)

1. **Hard Gates first**: `G-Legal, G-Privacy, G-Safety, G-Feasibility` each PASS/CONDITIONAL/BLOCKED/UNKNOWN **with scope, evidence, assessed_by, assessed_at**. Never assume PASS. Known global condition: real-child-data operations where lawful basis is UNKNOWN are **denied**; this is an operation-level release gate, not proof every module is wholly BLOCKED.
2. **Value separately** for parent, child, verified adult, core-loop contribution, adoption, differentiation, dependency enablement: 1–5 only if there are calibrated, valid inputs; otherwise UNKNOWN. No automatic aggregate score. Preserve individual six cohort perspectives. Evidence confidence UNKNOWN/HYPOTHESIS/LOW/MEDIUM/HIGH (a design hypothesis is not validation).
3. **Delivery economics** separately: implementation, maintenance, operations, AI cost, latency/reliability, complexity, scale. Mark UNKNOWN without estimates/source; E0/E1 preferred for policy/ledger and mechanical gates. No invented USD fees, developer-days or model quotas.
4. **Dependencies** as edge table: `consumer/provider/type=F|D|P|S|O/criticality/required_for/verification/cohort/evidence/workaround`. Reviewed contract does not imply runtime provider availability. Track uncertainty and cycles.
5. **Separate statuses:** `definition_status` of inventory candidates; `assessment_status=NOT_EVALUATED` until evidence, `delivery_status=NOT_PLANNED`; `mvp_decision=NOT_DECIDED`. A proposed safety role is not regulatory clearance.

## 2. Domain counts (verified against canonical unique IDs)

| Domain | L3 count | Primary context (informational only) |
|---|---:|---|
| `F01` | 13 | Identity, family, access |
| `F02` | 12 | Child context/profile |
| `F03` | 14 | Development and goals |
| `F04` | 15 | Plan and execution |
| `F05` | 12 | Companion/Journal |
| `F06` | 13 | Assessment and reporting |
| `F07` | 15 | Data, AI governance, operations |
| `F08` | 12 | Integrations and commerce |
| **Total** | **106** | |

## 3. 106-record preliminary assessment index

All cohort columns represent an **unassessed record**, *not* a NOT_APPLICABLE determination. The six cohort assessments must ultimately carry applicability, interaction pattern, distinct user values and confidence. The table intentionally does not award speculative value or implementation priority.

| L3 | Module name from 3.2 | L4 evidence path | A0 (0–2) | A1 (3–5) | A2 (6–10) | A3 (11–14) | A4 (15–17) | A5 (18–23) | MVP |
|---|---|---|---|---|---|---|---|---|---|
| `F01-G01-M01` | Account Access | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G01-M02` | Session Security | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G02-M01` | Family Structure | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G02-M02` | Member Relationships | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G03-M01` | Core Identity | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G03-M02` | Profile Integrity | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G04-M01` | Access Policy | P6_REFERENCE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G04-M02` | Consent Ledger | B01_CONDITIONAL | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G05-M01` | Mode State | B01_CONDITIONAL | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G05-M02` | Mode Transitions | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G06-M01` | Lifecycle Controls | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G06-M02` | Entitlements & Billing | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F01-G06-M03` | Subscription Billing Lifecycle | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G01-M01` | Intake & Updates | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G01-M02` | Incremental Questions | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G02-M01` | Preference Registry | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G02-M02` | Preference Revision | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G03-M01` | Evidence-linked Observations | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G03-M02` | Non-labeling Review | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G04-M01` | Environment Context | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G04-M02` | Context Permissions | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G05-M01` | Versioned Profile | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G05-M02` | Child Feedback | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G06-M01` | Provenance | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F02-G06-M02` | Correction & Confidence | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G01-M01` | Framework Registry | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G01-M02` | Evidence Alignment | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G02-M01` | Dimension Taxonomy | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G02-M02` | Domain Mapping | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G03-M01` | Stage Catalog | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G03-M02` | Accessibility Adaptation | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G04-M01` | Goal Discovery | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G04-M02` | Goal Constraints | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G04-M03` | Development Roadmap & Milestones | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G05-M01` | Grounded Recommendation | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G05-M02` | Recommendation Review | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G05-M03` | Career Exploration Guidance | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G06-M01` | Goal Reassessment | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F03-G06-M02` | Goal Change Proposal | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G01-M01` | Plan Structure | B01_CONDITIONAL | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G01-M02` | Plan Templates | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G02-M01` | Schedule Construction | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G02-M02` | Schedule Conflict | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G02-M03` | Balanced Planning Validation | P6_REFERENCE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G03-M01` | Task Ownership | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G03-M02` | Approval Routing | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G04-M01` | Daily Task View | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G04-M02` | Execution Support | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G05-M01` | Lightweight Check-off | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G05-M02` | Evidence Submission | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G06-M01` | Change Requests | B01_CONDITIONAL | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G06-M02` | Change History | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G07-M01` | Schedule Notifications | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F04-G07-M02` | Notification Preferences | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G01-M01` | Child Conversation | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G01-M02` | Companion Guardrails | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G02-M01` | Opt-in Check-in | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G02-M02` | Check-in Controls | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G03-M01` | Reflection Prompts | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G03-M02` | Reflection Review | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G04-M01` | Private Entries | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G04-M02` | Journal Retrieval | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G05-M01` | Structured Insight | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G05-M02` | Insight Correction | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G06-M01` | Selective Sharing | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F05-G06-M02` | Deletion Graph | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G01-M01` | Activity Event Log | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G01-M02` | Source Metadata | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G02-M01` | Progress Rules | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G02-M02` | Progress Exceptions | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G03-M01` | Indicator Registry | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G03-M02` | Indicator Evidence | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G04-M01` | Deterministic Trends | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G04-M02` | Cautious Insights | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G05-M01` | Audience Views | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G05-M02` | Summary Rendering | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G06-M01` | Review Sessions | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G06-M02` | Feedback Handoff | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F06-G07-M01` | Academic Assessment | P6_REFERENCE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G01-M01` | Content CMS | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G01-M02` | Structured Retrieval | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G02-M01` | Editorial Workflow | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G02-M02` | Evidence Provenance | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G03-M01` | Single Interface Router | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G03-M02` | Execution Budget | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G03-M03` | Multimodal Interaction Orchestration | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G04-M01` | Policy Evaluation | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G04-M02` | Model Evaluation | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G05-M01` | Safety Triage | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G05-M02` | Human Response Workflow | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G06-M01` | Purpose-bound Access | B01_CONDITIONAL | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G06-M02` | Retention & Export | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G07-M01` | Operational Console | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F07-G07-M02` | Billing & Cost Operations | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G01-M01` | School Data Connectors | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G01-M02` | School Data Review | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G02-M01` | Expert Discovery | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G02-M02` | Expert Referral | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G03-M01` | Activity Directory | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G03-M02` | Resource Matching | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G04-M01` | Device Consents | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G04-M02` | External Data Import | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G05-M01` | Commerce Catalog | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G05-M02` | Transaction & Conflict Controls | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G06-M01` | Education Budget Planning | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |
| `F08-G06-M02` | Expense & Approval Management | NEW_L4_CANDIDATE | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | `NOT_DECIDED` |

## 4. First dependency edge hypotheses (contract-linked, not runtime-confirmed)

| Consumer | Provider | Type | Required for | Verification | Reason / key boundary |
|---|---|---|---|---|---|
| F01-G02-M01 Child App Link | F01-G04-M01 Access Policy | P | RELEASE | CANDIDATE | Final permission/authority at binding commit; independent linkage ≠ legal guardianship |
| F01-G02-M01 Child App Link | F01-G01-M02 Session Security | P | RELEASE | CANDIDATE | Account identity freshness and one-time pairing check |
| F05-G06-M01 Selective Sharing | F01-G04-M02 Consent Ledger | P | RELEASE | CANDIDATE | Child grant distinct from caregiver-managed consent |
| F05-G06-M01 Selective Sharing | F07-G06-M01 Purpose-bound Access | P/S | RELEASE | CANDIDATE | Private Journal and derived lineage; no broad parent disclosure |
| F07-G06-M02 Retention & Export | F05-G06-M02 Deletion Graph | D/S | RELEASE | CANDIDATE | Tombstone propagation/backup/export cleanup; verify ownership in detailed groups |
| F04-G06-M01 Change Requests | F04-G02-M03 Balanced Planning | F/S | RELEASE | CANDIDATE | Hard-cap veto, draft vs effective commit |
| F04-G06-M02 Change History | F04-G01-M01 Plan Structure | D | RELEASE | CANDIDATE | Committed provenance/version not a proposal |
| F06-G05-M02 Summary Rendering | F07-G06-M01 Purpose-bound Access | P | RELEASE | CANDIDATE | No Journal/withdrawn derived leak in reports |
| F07-G03-M03 Multimodal Orchestration | F07-G04-M01 Policy Evaluation | S | RELEASE | CANDIDATE | Current authorized model and output scope, no default AI allowance |
| F08-G05-M02 Transaction & Conflict Controls | F01-G06-M03 Subscription Billing Lifecycle | F/O | TEST/RELEASE | CANDIDATE | Reconcile provider acceptance/timeout; no double charging |

These edges are candidate cross-module dependency hypotheses from design contracts, not an exhaustive 106-module topological map. Before promoting to CONFIRMED, inspect both ends for contract version, valid fallback and cohort-specific safety constraints.

## 5. Evidence queue — next 3.3 execution increment

- **Gate evidence:** per-purpose lawful basis, Journal retention/suppression conflict, tested identity and release/commit authorization, safety response scope; no MVP scoring until clarified.
- **Value evidence:** six cohort user outcomes and adoption research with method/sample; core loop A2/A3 product fit highest research focus by existing 2.x decisions, **not** a pre-scored MVP winner.
- **Delivery economics:** measure actual E2/E3 calls, per-success assessment cost, provider billing/voice/storage/support and basic E0/E1 implementation risk; missing values stay UNKNOWN.
- **Dependency quality:** map 106 unique nodes; verify functional, data, permission, safety and operational edges; classify HARD/SOFT and BUILD/TEST/RELEASE/RUN; look for cycles and split interfaces.
- **Design confidence:** P5/P6/B01 gaps, Claude final independent review of 24 detailed groups, L4 override flags for sensitive subfeatures.

**Proposed next Owner gate:** only after evidence-backed 3.3 assessment and key use cases; no MVP scope is approved by this registry.
