# PARENT-PAL — L4 Capability Decomposition Standard

**Version:** 1.0 · **Method status:** `OWNER_APPROVED` (M-Q1..06) · **Candidate L4 status:** `REVIEW_ONLY`  
**Source:** `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md`, 3.3, 3.4, L3C-01..07, L3T-01..08, `Feature_3_2_L4_Methodology_Decision_Log_APPROVED.md`.  
**Scope:** 8 Domains / 51 Groups / 106 L3; A0–A5 (0–23), core Vietnam grades 1–9.

## 1. Contract

An L4 is an **independently observable and testable product behavior** within a single L3's responsibility. One L4 has one primary outcome and one canonical owner. It is **not** a button, screen, endpoint, class method, agent, workflow step, or database table. A workflow can orchestrate multiple L4 across L3 boundaries; a single L4 can serve multiple workflows.

**Split when:** distinct primary outcomes, independently significant authorization/privacy/data owner, state transition, release gate, or evaluation economics.  
**Merge when:** differences are only UI, cohort variant, API/model, or internal validation/notification with no independently managed outcome.  
**Reuse or move when:** a proposed L4 duplicates another L3's canonical responsibility; never create a second data source of truth.

## 2. Identity and status

- L3 `Fxx-Gyy-Mzz`; official L4 `Fxx-Gyy-Mzz-NNN`. Preserve any existing illustrative IDs and label them `BASELINE_PROPOSED` until review. New pilot candidates use `CAND-<L3>-<slug>`, **not official L4 IDs**.
- `definition_status`: BASELINE_PROPOSED / REVIEWED / APPROVED / DEFERRED / RETIRED.
- Independent `assessment_status`: NOT_EVALUATED / PROVISIONAL / EVIDENCE_BACKED / NEEDS_REVIEW; `delivery_status`: NOT_PLANNED / PLANNED / IN_PROGRESS / RELEASED; `mvp_decision`: NOT_DECIDED.
- L3 assessment inheritance requires override on model usage, sensitive data, permissions, safety, cohort, cost or dependency changes. No automatic approvals.

## 3. Minimum L4 schema

Each L4 record requires:
`id, title, parent_module, domain, group, primary_outcome, target_users, user_value, trigger, preconditions, inputs, outputs, primary_data_owner, data_classification, authorization, autonomy_permissions, age_variants, cohort_applicability, main_flow, alternative_flows, failure_recovery, acceptance_criteria, dependencies, execution_type, ai_cost_risk, research_refs, source_trace, review_issues, definition_status, assessment_status, delivery_status, mvp_decision`.

Each **A0–A5** age record must cover `applicability` (APPLICABLE/CONDITIONAL/NOT_APPLICABLE/UNKNOWN), `interaction_pattern`, `authorized_actor`, `approval_actor`, `data_scope`, `alternative_path`, `evidence_confidence`. UX patterns do **not** grant legal permission. An unknown actor/right is `UNKNOWN`, not `allow`. Adult A5 controls own data.

For each dependency edge record `source_module, target_module, type(F/D/P/S/O), criticality(HARD/SOFT), verification(CONFIRMED/CANDIDATE/REJECTED), required_for(BUILD/TEST/RELEASE/RUN), cohort_scope, reason, evidence_refs, workaround`. Pilot can use a compact dependency table but must mark unverified edges as CANDIDATE.

## 4. Security, AI, acceptance

- Deny by default; authorize **before reading, inference, cache lookup, or external call**. Payer/subscriber does not gain access to private child data.
- Maintain separate canonical data ownership: F04 submission ≠ F06-G07 assessment ≠ F06-G05 reporting; F03 goals ≠ F04 planning; F01 policy ≠ F01 consent ledger; F04 balance ≠ F04 schedule-conflict detection.
- Rules-first E0/E1; E2/E3 only if purpose, data authorization, benchmark, fallback and cost are verified. Never infer numeric clinical/educational thresholds from age alone.
- Acceptance must test positive and negative paths, denied access, stale/revoked consent, data provenance, concurrent mutations, low-confidence/unreadable input, retry/idempotency, and failures appropriate to the feature.
- G-Legal, G-Privacy, G-Safety, G-Feasibility ∈ PASS / CONDITIONAL / BLOCKED / UNKNOWN. `UNKNOWN` ≠ PASS. No real-child pilot or release based solely on these documents.

## 5. P0–P6

| Step | Deliverable | Gate |
|---|---|---|
| P0 Input freeze | Source trace, L3 ownership | Owner known |
| P1 Outcome inventory | Candidate actions and failures | Primary outcome defined |
| P2 Boundary review | KEEP/SPLIT/MERGE/REUSE/MOVE | No conflicting owner |
| P3 Contract | Full L4 metadata, six cohorts, auth, AI | UNKNOWN explicitly tracked |
| P4 Test/trace | UC/SC/MR mapping, synthetic test cases | Positive + negative tests |
| P5 Independent review | Issue/decision register | Risk owners review |
| P6 Owner approval | Stable IDs, canonical diff proposal | Explicit authorization before canonical changes |

**Wave 0:** F01-G04-M01; F06-G07-M01; F04-G02-M03. The three-module pilot is a method validation, **not** representative coverage of all 106 L3 or a completed assessment.  
**Out of scope:** update canonical 3.2/3.3/3.4, select MVP, change code, merge PR, approve policies or publish.
