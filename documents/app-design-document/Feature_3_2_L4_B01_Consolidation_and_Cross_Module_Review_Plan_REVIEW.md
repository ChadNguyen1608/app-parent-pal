# Parent-Pal — Batch 01 Consolidation & Cross-Module Review Plan

**Ngày lập:** 2026-11-13  
**Status:** `CONSOLIDATION_EXECUTED / OWNER_8_OQ_CONFIRMED / TARGETED_REMEDIATION_PENDING`  
**Scope:** 5 L3 của Batch 01, 3 P6 pilot là regression dependencies.  
**Source branch:** `docs/l4-pilot-three-modules-20261110`, Draft PR #17.  
**Không phải:** phê duyệt L4 cuối cùng, sửa canonical, merge PR, lập trình app, bắt đầu Batch 02.

## 1. Mục tiêu và dữ liệu đầu vào

### 1.1 Batch 01 5 L3

| Thứ tự | L3 | ZIP Claude Owner cung cấp | L4 candidate | Design test | Findings | Owner OQ | Outcome |
|---|---|---|---:|---:|---:|---:|---|
| 01 | `F01-G04-M02` Consent Ledger | `B01_F01-G04-M02.zip` | 6 | 62 | 21 | 4 | Owner confirmed, regression pending |
| 02 | `F01-G05-M01` Mode State | `B01_F01-G05-M01.zip` | 2 | 59 | 18 | 4 | Owner confirmed, regression pending |
| 03 | `F07-G06-M01` Purpose-bound Access | `B01_F07-G06-M01.zip` | 4 | 75 | 23 | 4 | Owner confirmed, legal/research pending |
| 04 | `F04-G01-M01` Plan Structure | `B01_F04-G01-M01.zip` | 11 | 96 | 27 | 5 | Owner confirmed, open technical |
| 05 | `F04-G06-M01` Change Requests | `B01_F04-G06-M01.zip` | 5 | 103 | 25 | 5 | Owner confirmed, open technical/conflict |

**Tổng thô (self-reported): 28 L4 candidates, 395 design tests, 114 findings, 22 Owner OQ cho Batch 01**. Số liệu chưa dedupe/validate cross-ZIP; chưa phải test ứng dụng hoặc nghiệm thu.

### 1.2 Authoritative Git source

1. [Master Owner Decision Index](Feature_3_2_L4_Owner_Decision_Register_INDEX.md), bao gồm 3 P6 + 5 B01 và **34 Owner decisions** (P6 12, B01 22).
2. [B01 Consent Decisions](Feature_3_2_L4_B01_Consent_Ledger_Owner_Decision_Log_APPROVED.md).
3. [B01 Mode State Decisions](Feature_3_2_L4_B01_Mode_State_Owner_Decision_Log_APPROVED.md).
4. [B01 Purpose Decisions](Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md).
5. [B01 Plan Structure Decisions](Feature_3_2_L4_B01_Plan_Structure_Owner_Decision_Log_APPROVED.md).
6. [B01 Change Requests Decisions](Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md).
7. P5/P6 Owner decisions, Blueprint 3.2/3.3/3.4, L4 standards, P5 test registry, Scenario & MR backlog.

For a reproducible consolidation, the **5 ZIPs need to be made available together** to Coordinator in local work area. Earlier uploaded ZIPs are not guaranteed to be visible to Claude; if missing, produce `MISSING_EVIDENCE`, **do not invent test cases or reconstruct agents' outputs from narrative summaries**. Git remains authoritative for approved Owner decisions, while the ZIPs evidence pilot outputs.

## 2. Execution phases and Deliverable Gates

### Phase C0 — Source Freeze & Evidence Verification

- Read PR17 branch and current SHA; inventory 5 ZIPs, check ZIP integrity/manifest and SHA hashes for individual files if available.
- Record per-module source commit, test counts, findings states, L4 candidate IDs; check names, ids and references cross ZIP.
- Compare with Git Owner Decision Logs. Logs take precedence for confirmed business decisions; mark superseded design outputs and sources.
- Deliverable: `C0_Source_Manifest_and_Evidence_Gaps.md`. If any ZIP missing or corrupt, mark `MISSING_EVIDENCE` and no false coverage claim.

### Phase C1 — Cross-Module Ownership & Contract Matrix

- Create 5xN contract matrix: owner, API input/output, authorization, consent, purpose, mode, plan baseline, CR approval, derived data/caches, audit and event/version.
- Identify duplicate/overlapping L4 candidates; options `KEEP / MERGE / SPLIT / MOVE / DEFER`, **proposals only** without final stable IDs.
- Verify Access Policy final ALLOW/DENY; Purpose sub-decision; Consent evidence; Mode per child; CR approval vs Plan Structure commit; Change History owner distinct.
- Lock consistency: locked effective timetable cannot be changed, except authorized unlock or explicitly audited override. No silent bypass.
- Deliverable: `C1_Ownership_and_Contract_Matrix.md`.

### Phase C2 — Owner-Decision Propagation & Conflict Resolution

- Map 22 B01 Owner OQ onto original affected findings, L4 AC, QA cases, traceability and changes.
- Source precedence by applicability: newer **confirmed Owner decision** clarifies previous recommendations; explicit contradictory decisions require `OWNER_REVIEW`, **not hidden overwrite**.
- Resolve known conflicts (at least):
  1. Old Parent-led test vs Owner: child expresses wishes but does **not** submit official schedule CR.
  2. Prior age hard-block A0–A2 vs capability + grants + safety policy.
  3. Lock semantics among Plan Structure and Change Requests.
  4. Approved != applied, commit idempotency and stale retries.
  5. Child-directed within scope direct mutation (no mandatory CR), full security/validation checks.
  6. Caregiver handover keeps consent history, current permissions reevaluated.
  7. Family Standard Bar fallback to App Default; noncompliant draft may be saved; hard cap never approved/applied.
  8. Journal revoke immediately blocks derived access even if summary exists.
  9. Child real personal data processing gated on verified lawful basis.
- Deliverable: `C2_Decision_Propagation_and_Conflict_Register.md` with exact source references and status `RESOLVED / TECH_FIX / RESEARCH / OWNER_DECISION / OPEN`.

### Phase C3 — Consolidated Test & Regression Registry

- Build a **deduplicated** test registry with original IDs preserved; one canonical cross-batch test key may reference many original test IDs.
- Mark `EQUIVALENT / PARTIAL / MISSING / CONFLICT`; distinguish design-level test from executed app test.
- Re-evaluate P5 baseline 64, P6 pilots 3 and Batch 01 all 5 L3.
- Cross-module sequences covering: multi-child modes, consent → purpose → access, caregiver transition, Child Journal revoke + caches, plan save → standard bar validation → CR approval → plan commit → history, lock/race, event replay, 7-day expiry, server clock, protected hard-cap violations visible as proposal but never approved/applied.
- Track known technical findings explicitly: Consent F-021 reference outdated AC; Mode 2 partial tests; Purpose legal/audit; Plan Structure F-023, F-027 / 3 partial; Change Requests F-022, F-025 / 4 partial +1 conflict; P6 Academic F-023, Balanced F-021.
- Require **every open item** to have severity, owner, source, remediation and verification/test ID.
- Deliverables: `C3_Consolidated_Test_Registry.md`, `C3_Regression_Gaps.md`.

### Phase C4 — L4 Capability Consolidation & Economics

- Assemble all L4 candidates with proposed ownership, explicit user outcome, Data Owner, Functional Owner, dependencies, Execution E0–E3, AI cost exposure and research dependencies.
- Propose candidate list after deduplication with stable **temporary** IDs, count changes explained, no automatic canonical edit.
- Flag excessive LLM usage; default to deterministic E0/E1 for authorization, consent and plan mutation gates; AI assists when user benefit clear and under approval.
- Deliverable: `C4_Consolidated_L4_Candidate_Inventory.md`.

### Phase C5 — Final QA, Owner Review & Go/No-go

- Run deterministic checks plus adversarial review on merged model.
- Calculate coverage by module, cross-module and baseline; do not claim 100% when partials or evidence absent.
- Produce a concise owner package: new OQ **only** for genuine business conflicts, technical fixes separate, research backlog linked.
- Gate categories:
  - `GO_FOR_NEXT_BATCH_DESIGN`: no unresolved critical cross-module security/authorization conflict, source/manifests traceable, owner policy propagated; technical/research debt tracked with owners and explicit constraints.
  - `CONDITIONAL_GO_FOR_NEXT_BATCH_DESIGN`: noncritical partials remain, each with remediation and no false final acceptance.
  - `BLOCKED`: unresolved critical permission/privacy/lock/hard-cap conflict, fabricated/missing evidence blocking substantive coverage, or unowned conflicts.
- **This is permission to continue design batches only**, not L4 final acceptance or real-child-data processing.
- Deliverables: `C5_Consolidation_Summary.md`, `C5_Owner_Review_Package.md`, `C5_Issue_and_Research_Backlog.md`.

## 3. Claude Code execution constraints

- **Orchestrator/Coordinator:** keep existing model; do **not** force Sonnet.
- **Maximum 3 sub-agents total:** independent QA, Architect, Adversarial Reviewer, **Sonnet 5.5 if available** (verify exact ID; no silent fallback).
- Non-agent deterministic validation executed by Coordinator.
- Independent first-pass QA + Architect, Reviewer reads both; no nesting; 2 automated revision rounds max, escalate critical blockers.
- Read GitHub sources **without writing Git**.
- **Output ZIP outside repository**, suggested name `B01_Consolidation.zip`, include C0–C5 outputs, model IDs and token evidence.
- No merge, canonical edits, stable L4 ID finalization, Batch 02 execution, or app code.

## 4. Readiness checklist

- [x] All five module pilot outcomes presented to Product Owner.
- [x] All 22 Batch 01 Owner OQ decisions captured in GitHub Decision Logs.
- [x] Owner Decision Register and Batch 01 Plan maintained on PR #17.
- [ ] All five local ZIP evidence packages verified available together for consolidation.
- [ ] Source freeze/sha and duplicate L4/test reconciliation performed.
- [ ] Cross-module conflict fixes and full re-review complete.
- [ ] Owner Review of consolidated result and explicit next gate decision.

## 5. Consolidation results and remediation handoff

- Claude delivered `B01_Consolidation.zip` (reported 73 archive entries). Reported 28 → 25 L4 entries, 395 → 392 deduplicated design tests, 46 spec findings requiring remediation, 9 HIGH gaps, 17 proposed new tests; 34 prior Owner decisions traced but incomplete propagation. Design-level results only.
- Product Owner confirmed 8 decisions at [Consolidation Owner Decision Log](Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md). **OQ-B01C-1 deviates from prior recommendation: Preserve child delegated schedule-edit permissions on caregiver handover, no auto-suspend.** Fresh authorization still required; prior approved-unapplied Change Request still requires reapproval under B01-CR-OD-02.
- Next: Targeted Remediation of contradictory acceptance criteria, high-risk cross-module regressions, missing five P5 test IDs, and 17 proposed tests. Re-run deterministic validator and independent QA/reviewer, then Owner reviews actual gate. No Batch 02 yet.

**ChatGPT-led Remediation update (2026-11-13):** [Specification Remediation Proposed v1](Feature_3_2_L4_B01_Specification_Remediation_Proposed_v1_REVIEW.md) and [RG Triage/Independent Verification](Feature_3_2_L4_B01_Remediation_Triage_and_Independent_Verification_Plan_REVIEW.md) were committed to PR17. Eight areas of normative AC/contract proposals prepared; 32 regression gaps triaged. **Claude verification not yet run**, 46 findings not auto-closed, P5 evidence still incomplete, real child data legal gate still closed. Workflow: ChatGPT creates corrections -> Claude checks independently -> ChatGPT integrates validated edits -> Owner gate.

## 6. Status

`B01_FIVE_MODULES_REVIEWED`  
`B01_OWNER_DECISIONS_RECORDED`  
`B01_CONSOLIDATION_COMPLETED_AS_DESIGN_REVIEW`  
`B01_CONSOLIDATION_8_OWNER_DECISIONS_RECORDED`  
`B01_TARGETED_SPEC_REMEDIATION_PROPOSED_V1`  
`B01_INDEPENDENT_VERIFICATION_NOT_EXECUTED`  
`B01_FINAL_L4_ACCEPTANCE_NOT_GRANTED`

**Next:** run Targeted Remediation using consolidation evidence and the 8 new Owner Decisions. No Batch 02 until remediation and Owner gate are reviewed.
