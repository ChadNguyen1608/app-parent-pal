# Parent-Pal — Post-P6 / Batch 01 Normalized Cross-Module Baseline

**Ngày:** 2026-11-13  
**Trạng thái:** `B01_NORMALIZED_REFERENCE_BASELINE / REVIEW_ONLY / OWNER_GATE_PENDING`.  
**Phạm vi:** 5 module Batch 01 + 3 module P6 làm hợp đồng phụ thuộc. **Không đồng nghĩa tất cả 8 module đã được nghiệm thu L4.**  
**Nơi lưu:** Draft PR #17, branch `docs/l4-pilot-three-modules-20261110`. Không sửa canonical Blueprint 3.2/3.3/3.4, không merge, không cấp stable L4 ID.

## 1. Document set and precedence

1. **Approved business authority:** [Owner Decision Master Index](Feature_3_2_L4_Owner_Decision_Register_INDEX.md) and its 8 module logs + [8 Consolidation decisions](Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md) = 42 Owner decisions. Do not infer changed business policy from Claude's pilot findings.
2. **Normalized B01 candidate inventory:** [25-entry L4 registry](Feature_3_2_L4_B01_Normalized_Candidate_Registry_REVIEW.md); preserve temporary `B01C-L4-01..25`.
3. **Corrective technical specification:** [v1](Feature_3_2_L4_B01_Specification_Remediation_Proposed_v1_REVIEW.md) → [v2](Feature_3_2_L4_B01_Specification_Remediation_Proposed_v2_REVIEW.md) → [v3](Feature_3_2_L4_B01_Specification_Remediation_Proposed_v3_REVIEW.md) → [v3.1 addendum](Feature_3_2_L4_B01_Specification_Remediation_v3_1_Addendum_REVIEW.md). Later versions supersede **only contradictory technical clauses**; v3 lock and CR HIGH areas passed independent spec-level review, v3.1 details are still **proposed**, not independently checked.
4. **Consolidation evidence:** `B01_Consolidation.zip` (C0–C5 including C4 full-detail draft candidate inventory and C3 392 design-test registry), **not represented as a permanently archived GitHub release**; pilot ZIP assets are pinned in private `parent-pal-evidence@4209d52af3f233f69af26898fdf5e71988a477d7`.
5. **Quality gate:** [Batch 01 Design Gate Review recommendation](Feature_3_2_L4_B01_Design_Gate_Review_RECOMMENDATION.md) = conditional recommendation only. Product Owner has **authorized normalization**, not approved Batch 02 yet.

If two sources conflict, never silently pick an arbitrary text: the Owner log controls policy, and record the conflicting AC/test in issue register until reconciled.

## 2. Eight L3 module scope and current boundaries

| Phase | L3 | Owner capability | Reported temporary L4 candidates | Status and contract |
|---|---|---|---:|---|
| P6 | F01-G04-M01 Access Policy | Family/role/delegation grants, final authorization | 4 | Owner decisions approved; exact L4 temporary inventory remains in P6 pilot ZIP; decision vs derived rights always rechecked |
| P6 | F06-G07-M01 Academic Assessment | Local homework assessment, hints, disputes, parent verification | 4 | Independent from plan-commit; AI review never teacher-verified; quota/cost research open |
| P6 | F04-G02-M03 Balanced Planning | Standard Bar, constraints, soft-cap exceptions | 3 | Source of constraint validity for Plan Structure & CR; research-backed defaults not yet complete |
| B01 | F01-G04-M02 Consent Ledger | Consent evidence/revoke/status/history | 6 original, 6 normalized entries incl DEFER | Primary Caregiver revokes caregiver-managed consent; child Journal controls separate; legal authority not inferred |
| B01 | F01-G05-M01 Mode State | Child-specific autonomy mode versioning | 2 | One mode per child, no per-plan or family global mode |
| B01 | F07-G06-M01 Purpose-bound Access | Purposes/legal assessments, derived/cache gates | 4 | F01 final ALLOW/DENY; unknown legal basis with real child PII denies processing |
| B01 | F04-G01-M01 Plan Structure | Draft, baseline commit, lock, version history, lifecycle | 11 originals → 9 normalized entries (14–21 plus 13) | Plan commit is atomic/idempotent, lock-admin separate from child editing; SPLIT history to F04-G06-M02 |
| B01 | F04-G06-M01 Change Requests | Submit/approve/expiry/reconcile workflow | 5 originals → 4 normalized entries (22–25) | APPROVED != APPLIED; state machine v3 + v3.1 proposed refinements |

**Note:** Counts for individual module mappings in the 25-entry C4 registry are a *structural summary* and not additional accepted stable IDs. The B01 consolidated set is 25 entries (24 effective capability parts, two DEFER), regardless of preliminary module candidate counts. P6 candidates remain distinct and are **not** added to B01's 25.

## 3. Contracts that Batch 02 must not reinterpret

### 3.1 Authority chain

`Account/ChildLink → Mode State + Grant/Consent + Purpose/Legal Assessment → Access Policy final ALLOW/DENY → operation-specific mutation validation`.

- One active family Primary Caregiver; other adults have bounded supporter grants.
- Child-specific modes: PARENT_LED cannot submit official schedule CR; CHILD_EXECUTED can draft/propose; CHILD_DIRECTED can direct-edit only within bounded grant. Mode is neither Journal permission nor Lock Admin.
- On caregiver handover, child's valid schedule-edit grant stays active without automatic reconfirmation, while an APPROVED-but-unapplied CR must be explicitly reapproved by current authorized caregiver.
- Verified self-managed adult has own authority; former caregiver cannot lock/overwrite.
- Access to child real PII with legal basis UNKNOWN or expired → DENY across cache read, AI memory, report, export, worker. No fake test-data flag bypass.

### 3.2 Plan and Change Request

`Draft/Proposal → Permission → Mode & Lock → Plan version → Bar/Hard-cap → Approval (if required) → Atomic Commit → History/Audit`.

- Hard-cap-invalid request can be saved/submitted for discussion; cannot APPROVE/APPLY. Unknown validation does not equal PASS.
- Family Standard Bar missing → verified App Default by age/context/version; if no verified bar, keep draft but no safe ACTIVE claim.
- CR Pending expiry 7d from initial submit; approved-unapplied expiry 7d from original approval; re-evaluation, handover and revisions never silently extend.
- Child-directed direct edits and Primary Manager self-authorized edits don't need a fabricated CR approval, but require **all commit gates**.
- Lock effective timetable persists until explicit authorized unlock or audited override. `schedule:*` does not include lock-admin. Draft/offline creation may continue with permission, but no locked-plan commit.
- Same idempotency key & same canonical payload returns original committed outcome without new plan write. `OUTCOME_UNKNOWN` fences competing transitions until authoritative reconciliation.
- F04-G06-M01 owns approval workflow; F04-G01-M01 owns plan version commit/snapshot; F04-G06-M02 owns reason/approver history; F04-G02-M03 owns balance validation and soft-cap lifecycle.
- Under soft-cap policy: max 60d continuous relaxation across purpose changes for same constraint; >=7 complete gap days for similar exception (same scope + constraint + purpose); protected hard caps cannot be waived.

### 3.3 Journal / governance / learning

- Child Journal revocation immediately denies further unauthorized access, including untraced derived/cache output. Notification to caregiver opt-in by child, default off. Journal delete is separate: immediate visibility removal, permanent delete after 60d subject to disclosed lawful exceptions; source module design incomplete.
- F07 audit governance policy, infrastructure for durable audit. No raw Journal in logs.
- F06 assessment: parent confirms home exercises, no teacher validation implied; hints support child self-correction rather than answer-giving; disputes can trigger AI recheck and parent resolution; AI quota & real costs remain unapproved research.
- AI cannot decide for parent; prefer E0/E1 deterministic policy, validation and rights gates; no LLM agent per capability.

## 4. Readiness / gate checklist

| Gate | Status | Evidence or remaining action |
|---|---|---|
| 42 Owner decisions | `REGISTERED` | Master Index and 9 authoritative logs (3 P6, 5 B01, 1 Consolidation) |
| 25 B01 temporary L4 entries | `NORMALIZED_REFERENCE` | [Candidate registry](Feature_3_2_L4_B01_Normalized_Candidate_Registry_REVIEW.md); no stable IDs |
| P6 interfaces | `REFERENCED` | 3 P6 Owner logs, 11 reported pilot L4 candidates; inventory not normalized item-by-item |
| Critical lock/CR spec contradictions | `CLOSED_AT_SPEC_LEVEL` | Claude focused v3 report, 2/2 HIGH, 0 new HIGH/CRITICAL |
| v3.1 follow-up 4 MEDIUM + 3 LOW | `PROPOSED_NOT_VERIFIED` | Addendum only; independent review not mandatory for Batch 02 design if bounded |
| Original 46 spec-remediation findings | `PARTIAL_TRACE` | No item-by-item verified closure; maintain open |
| P5 baseline 64 IDs | `59/64_BY_ID` | Five missing; nine semantic mismatches; recover actual source |
| Data privacy/legal | `RESEARCH/BLOCKED_REAL_DATA` | No real child data use until purpose-specific lawful basis established |
| 392 consolidated design tests | `PROPOSED_ONLY` | No app runtime PASS; dedup/extra test count not independently frozen |
| Owner Batch 01 Design Gate | `PENDING` | Conditional GO recommendation, not approval |
| Stable L4/canonical/merge | `NOT_APPROVED` | Separate Owner gate after evidence |

## 5. Deferred work and dependency order (planning only)

1. `F01-G02-M01` Child App linking: one-time link, verify identity, recovery/revoke; design dependency for consent and child plan access.
2. `F05-G06-M01` Journal sharing/assent: child-controlled scope and revoke; privacy protections remain fail-closed until implemented.
3. `F07-G06-M02` retention/deletion: 60d lifecycle + lineage and exceptions.
4. `F04-G06-M02` Change History: plan lineage vs reason/approver audit; dependency for full CR test evidence.
5. `F01-G05-M02` mode transitions/grant lifecycle and `F01-G04-M01` role handover contract completeness.
6. P5/P6 evidence retrieval and research of law/capability/Standard Bar; independent of feature decomposition but a prerequisite for high-risk operational acceptance.

**This order is a planning suggestion, not a Product Owner-approved Batch 02 scope.**

## 6. Baseline consumption protocol

For every Batch 02 module:
1. Pin PR #17 `head_sha`, Owner Index SHA, normalized docs SHA, and evidence commit `4209d52...`.
2. Read specific authoritative Owner Decisions **before** creating AC or tests. Source is original Decision Log, not only summary.
3. Import only relevant `B01C-L4` interfaces/constraints and explicitly list upstream providers. Treat unpiloted modules as `UNKNOWN / NOT_AVAILABLE`, not fake implemented services.
4. Design new L4 candidate with temporary ID; trace `L3 → L4 → Decision → Contract → AC → test → finding → evidence`.
5. Ask Owner only for genuine new business policy; record defects, research gaps and costs separately.
6. Claude is independent reviewer by exception, normally 0 subagents and at most one for focused critical contract checks; ChatGPT does design & GitHub governance.
7. Never claim app tests run or final L4 approval. Gate stays conditional until Owner decision.

## 7. Source record

- `parent-pal-evidence` private commit: `4209d52af3f233f69af26898fdf5e71988a477d7` (5 original B01 ZIPs, SHA256SUMS).
- `B01_Consolidation.zip` (C4 inventory, C3 registry, C0–C5 reports) was user uploaded, **not currently archived as immutable artifact in GitHub**.
- `B01_Independent_Verification.zip`, `B01_Independent_Reverification_v2.zip`, `B01_Focused_Verification_v3.zip` user-supplied local evidence; only findings and status summarized in repository docs. Archive separately if long-term reproducibility is required.
- Product source branch commit must be pinned at actual use, not to an obsolete pre-remediation C4 snapshot.


## Owner Gate Update — 2026-11-14

Product Owner approved the previously proposed **conditional design baseline** and authorized commencing the **agreed execution plan through System Design readiness**. Authoritative gate record: [B01 Conditional Design Baseline Owner Gate](Feature_3_2_L4_B01_Conditional_Design_Baseline_Owner_Gate_APPROVED.md). New [B02 dependency/scope proposal](Feature_3_2_L4_B02_Dependency_and_Scope_Proposal_REVIEW.md) is **not yet a confirmed four-module scope**. [Execution tracker](Feature_3_2_to_Phase_3_Execution_Tracker_REVIEW.md) is active. Any earlier `OWNER_GATE_PENDING` / `BATCH_02_NOT_AUTHORIZED` statement in this historical document reflects its original 2026-11-13 state and is **superseded for baseline and planning** by this 2026-11-14 update. Stable/final L4 and Batch 02 module selection remain unapproved; PR #17 draft and no real-child data processing.
