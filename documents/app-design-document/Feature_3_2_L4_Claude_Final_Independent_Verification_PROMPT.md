# Claude Code — Independent Final L4 Verification Prompt (Parent-Pal)

**Prepared:** 2026-11-14  
**Execution:** NOT RUN — this document is the instruction to paste/run with Claude Code, not evidence of Claude completing a review.  
**Repository:** `ChadNguyen1608/app-parent-pal`  
**Branch:** `docs/l4-pilot-three-modules-20261110`, PR #17 Draft.  
**Source baseline:** [pinned 24-group manifest](Feature_3_2_L4_Functional_Baseline_Frozen_Manifest_20261114_REVIEW.md); verify every listed Git blob SHA before using it. Historic pin at `2e33afb9e5d97c4603a8230cb8f183fddb31bdb1`. The branch may have advanced afterward; **do not silently substitute moving HEAD for pinned sources**.

---

## COPY TO CLAUDE CODE — START

You are **Claude Code, an independent adversarial reviewer** of the Parent-Pal app's 3.2 L3→L4 functional specifications. Your task is **READ-ONLY VERIFICATION**, NOT authoring or auto-fixing. The ChatGPT author must not grade its own fixes. No code runtime or real child data is available; never pretend that synthetic test cases were executed.

### Mandatory input and precedence

1. Read `documents/app-design-document/Feature_3_2_L4_Functional_Baseline_Frozen_Manifest_20261114_REVIEW.md`. For the **24 numbered Detailed Review groups**, use pinned Git blob hashes from the manifest (or explicit evidence of source unavailability). Confirm these are the exact 24 files and their SHA-1 blob identities.
2. Read `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md` (106 distinct L3), `Product_Blueprint_03_3_Feature_Prioritization_and_Dependency_Mapping.md` (methodology only), `Feature_3_2_L4_Consolidation_and_Owner_Decision_Package_REVIEW.md`, `Feature_3_2_L4_Consolidation_Owner_Decision_Log_APPROVED.md`, `Feature_3_2_L4_Independent_Review_9aa4c8a_Disposition_REVIEW.md`, `Feature_3_2_L4_Independent_Review_Owner_Followup.md`, `Feature_3_2_L4_Owner_Decision_Implementation_and_Evidence_REVIEW.md`, `Feature_3_2_L4_B01_Normalized_Cross_Module_Baseline_REVIEW.md` and `Feature_3_2_L4_B01_Baseline_Open_Issues_and_Handoff_REVIEW.md`; inspect original 42 Owner Decisions via `Feature_3_2_L4_Owner_Decision_Register_INDEX.md` where necessary.
3. **Authority:** approved Owner policy/decisions > provisional design contracts > candidate amendments. Newer detailed documents may supersede older *candidate designs*, never an approved Owner policy. If source documents conflict or reference another revision, report exact conflicts; never invent a reconciliation.
4. Verify user-decided specifics: child-generated pairing ID (guardian enters), explicit child unlink and authorized fresh pairing to another household *only after effective unlink*; active cross-household transfer denied; no old household grants. Journal child-controlled sharing/revocation, no automatic caregiver disclosure of originals or derivatives; immediate visible deletion, product 60-day purge baseline subject to earlier verified legal deadline and lawful exceptions; irreversible after accepted deletion. Safety signal: only approved static suggestion to speak with trusted adult, zero human case, automatic contact, family notification or AI-generated advice. Ordinary education/training answer uses internal info, then scoped web/LLM fallback only under valid permission, approved answer-scope evidence and gates. Other content categories are not auto-approved.
5. This is a feature *functional specification* review; there are **no API/db/implementation tests** and no Final L4 approval.

### Verification protocol

**V1 — Complete inventory census**: enumerate all 106 canonical L3 IDs and review disposition for each; distinguish 3 P6 + 5 B01 prior-reviewed, 4 B02, 94 others; detect missing/duplicate/orphan IDs; count temporary L4 candidates, cross-reference AC and test oracles. Do not confuse **98 newly designed L3** with 94 beyond B02. Check that partial slices (Family Structure/Retention Export) are not falsely considered whole-module closure.

**V2 — Depth & test quality**: sample or review all L3 using risk-weighted strategy, always produce a 106-ID coverage table, per-ID status `PASS_SPEC / GAP / BLOCKED_BY_POLICY / NOT_REVIEWED`, and explain evidence selection. Check observable outcome, actors, consent/permission, state/preconditions, success/failure/retry, version/epochs, data owner, cohort applicability A0–A5, E0–E3, expected synthetic oracle. Mark weak one-oracle-only modules where needed; do not convert `test proposed` to `test passed`.

**V3 — Critical cross-module flows**: adversarially trace Parent/Child account linking and recovery; Primary caregiver handover vs delegated grants; effective mode/locked plan and Change Request 7-day expiry, commit/history/outcome-unknown; Journal sharing/revocation/derived lineage/deletion/export/backups; academic parent-confirmed vs teacher-verified evidence; safety static versus AI/human flows; approved AI answer-scope and pre-release output validation; subscription/entitlement/wallet/replay; third-party disclosure/referrals and operator access. Search for TOCTOU, stale authorizations, cross-family disclosure, replay/out-of-order and contradictory ownership.

**V4 — Prior findings**: test whether previous H1–H4, M1–M4 and L1–L3 from independent report are **actually corrected at design-spec level** by later detailed groups; explain residual contradictions and regression risks. Check P5 missing five source IDs/nine semantic ambiguities, P6 F-023/F-021 and B01 46 findings/v3.1 verification. If old source evidence cannot be inspected, return `UNKNOWN/OPEN`, not `PASS`.

**V5 — Legal/safety release boundary**: no real child personal data when lawful basis UNKNOWN. Check for misstatements on 60-day deletion versus applicable legal timing; do not supply legal clearance. Financial, AI models and child safety must use `release gate unresolved` wherever evidence is not verified. Distinguish business-policy questions (Owner) from architectural details (Dev/System Design) and legal expert verification.

**V6 — 3.3 readiness**: verify that scorecards based on functional-design hypothesis are NOT passed off as measured adoption/benefit/cost, numeric evidence-backed scores, verified legal gates, or an approved MVP.

### Review economics

Prefer **0 subagents** and direct focused reading. If essential for adversarial review, **at most one Sonnet 5.5 reviewer subagent** if available; log exactly why it was necessary and what it checked. Avoid spawning many reviewing agents or repeating equivalent audits. Budget effort on high-impact cross-module regressions.

### Output (Vietnamese; machine-checkable Markdown)

1. `Verification_Executive_Summary.md`: scope, exact pinned SHA/branch, files inspected, evidence unavailable; total counts and conclusion `GO_FOR_3_3_ANALYSIS / CONDITIONAL / BLOCKED` (not app release or Final L4 automatically).
2. `L3_106_Coverage_Matrix.md`: 106 rows with L3 ID, module, group source(s), coverage verdict, relevant AC/oracles, reason, pending evidence.
3. `Findings_Register.md`: ID, severity CRITICAL/HIGH/MEDIUM/LOW, exact path/blob/heading or lines, approved rule vs contradictory spec, reproducible **synthetic** fixture/expected outcome, suggested correction, required Owner/legal/technical disposition, evidence/confidence. Report only verified issues, not fabricated failures.
4. `Prior_Findings_Regression_Matrix.md`: previous H1–L3 + P5/P6/B01 gaps mapped to `CLOSED_BY_INDEPENDENT_SPEC_REVIEW / STILL_OPEN / UNKNOWN` with evidence. Distinguish spec-level closure from runtime testing.
5. `Owner_Decisions_Only.md`: consolidated **genuinely new** policy choices requiring Owner, with recommended safe provisional default and impacted modules. Do not reopen existing approved policies.
6. `Source_Manifest_and_Execution_Evidence.md`: pinned blobs, review method, source retrieval failures, coverage count verification, whether tests were hypothetical or executed, known limits.

**Do not** edit GitHub, merge, assign stable L4 IDs, modify canonical documents, approve policies, choose MVP, claim production clearance, use real child data, or mark your own proposed fixes as independently verified. If time/context limited: complete the 106-ID structural census and all critical flows first, record `NOT_REVIEWED` for the remainder; never fabricate completeness.

## COPY TO CLAUDE CODE — END

## ChatGPT integration gate after Claude output

ChatGPT receives the six artifacts; verifies original source references and discrepancy counts; triages each finding without silently editing approved policy; submits genuinely new Owner decisions separately; may update provisional specs with version/trace, then sends high-risk changes for **a new focused independent re-review**. Only after this is a scoped Final L4 acceptance proposal possible. 3.3 assessment proceeds independently with legal/cost/value unknowns preserved. No runtime tests implied.
