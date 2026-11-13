# Parent-Pal — Batch 01 Normalized Baseline: Open Issues & Handoff

**Date:** 2026-11-13  
**Status:** `ISSUES_TRACKED / NO_AUTOMATIC_CLOSURE / BATCH_02_GATE_PENDING`  
**Baseline:** [Cross-module baseline](Feature_3_2_L4_B01_Normalized_Cross_Module_Baseline_REVIEW.md) + [25-entry candidate registry](Feature_3_2_L4_B01_Normalized_Candidate_Registry_REVIEW.md).

## 1. Blocking vs non-blocking

| ID | Evidence/source | Remaining issue | Classification | Required before |
|---|---|---|---|---|
| BI-01 | B01-C4/C3 | Original 46 specification findings not each mapped to a verified AC/test patch. 42 decisions logged, cross-cutting SR patches do not equal closure | TRACEABILITY / OPEN | Final stable L4 acceptance; design Batch 02 may reference provisional contracts |
| BI-02 | P5 baseline | 5 missing P5 test IDs MP-B15, MP-C05/06/18/19; 9 semantic ambiguities A01/A02/A10/A12/C01/C02/C07/C16/C17 | EVIDENCE_GAP | Baseline 64/64 coverage claim |
| BI-03 | P6 pilots | Access pilot residual warning, Academic F-023, Balanced Planning F-021, missing underlying updated regression evidence | REGRESSION_GAP | Stable affected capability contracts |
| BI-04 | B01 independent v3 | 4 MEDIUM + 3 LOW FV3 corrections added v3.1, not independently verified | PROPOSED_FIX | Final B01 L4 acceptance; may remain pending during early Batch 02 |
| BI-05 | Purpose PA-OD-04 | Lawful grounds for processing real personal data of children per resource, purpose, jurisdiction, time unknown | `CRITICAL_PRODUCTION_GATE_CLOSED` / RESEARCH | Any real-child-data processing or production pilot |
| BI-06 | F05-G06-M01, F07-G06-M02 | Journal sharing/revoke owner module, lineage and 60-day permanent deletion implementation not piloted | PRIVACY_DEPENDENCY | Enable Journal sharing/retention execution |
| BI-07 | F01-G02-M01 | Child-parent app linking, anti-takeover/recovery/revoke needs full design | IDENTITY_DEPENDENCY | Enable child account to access family plans |
| BI-08 | F04-G06-M02 | History reason/approver ownership is separate from plan version lineage but unpiloted | TECH_DEPENDENCY | CR state/commit/history assurance |
| BI-09 | B01 evidence | Consolidation and three independent verification ZIPs not pinned in private evidence GitHub; report text only recorded on PR #17 | REPRODUCIBILITY_GAP | Future independent artifact verification |
| BI-10 | Research backlog | MR-015 autonomy by capability, MR-016/017/021/022 legal/age/identity, age-context verified default Standard Bar, exception research | RESEARCH_REQUIRED | Safety/lawful acceptance; may design using UNKNOWN fail-closed |
| BI-11 | Owner Gate | Conditional GO *recommended*, not approved by Owner | GOVERNANCE | Start Batch 02 scope/design |
| BI-12 | Technical design | Commit/authorization linearization, idempotency ledger, CR state precedence, history outbox, lock-admin separate grants need implementation contract details and tests | TECH_OPEN | Build/security-sensitive deployment |

## 2. Baseline status summary

- **8 L3** (3 P6 pilot + 5 B01) have approved business decisions, but no claim that eight L3 have fully accepted L4 details.
- **5 B01 L3** yield **25 provisional L4 candidate entries** (19 KEEP, 3 MERGE, 1 SPLIT, 2 DEFER; 24 active capability parts by counting SPLIT as 2); these are *not* new canonical feature IDs.
- **3 P6 L3** have **11 separately reported provisional L4 candidate proposals**, only preserved via original pilot evidence and Owner decision logs; individual P6 candidates must be reconstructed from source before assigning a normalized final registry (don't infer from 25 B01).
- **42 Owner Decisions** already confirmed; no new business decision is being made in normalization.
- **392 consolidated design test cases** from C3 remain proposed/unexecuted. 17 NT proposed during Consolidation, later NT and V3/v3.1 addenda must be deduped against registry before a definitive total can be stated.
- **No runtime tests**, no production legal clearance and no final L4 sign-off.

## 3. Minimal work before Batch 02 design gate

**Must do now:** present this cross-module reference to Owner and request only `CONDITIONAL_GO_FOR_NEXT_BATCH_DESIGN` or `KEEP_GATE_PENDING`. Gate is about **planning/design**, not test completion or production.

**Can proceed later in parallel after conditional approval:** recover raw P5 test IDs, archive Consolidation/verification ZIPs into private evidence, reconcile the 46 findings individually and detail P6 temporary L4 registry. These tasks remain tracked and cannot be used as imaginary accepted outcomes.

**Must not proceed without evidence:** real child data operations; final acceptance/canonical merge; enabling Child Journal sharing/Child App link without owning security designs; production run of unsafe/mutable plan flows.

## 4. ChatGPT → Claude workload split

- ChatGPT drafts and maintains new feature/AC/interface definitions and GitHub records; Owner approves new business policies.
- Claude performs targeted independent contradiction checking only at meaningful HIGH-risk contracts; default **0 subagents**, at most **1** for complex cross-module review; never treats its own proposal as an approved rule.
- Do not run all C0–C5 again or the 392 tests automatically merely to use this baseline.

## 5. Approval required separately

**Question for Product Owner:** Approve `CONDITIONAL_GO_FOR_NEXT_BATCH_DESIGN` using the normalized baseline in two source docs, while preserving BI-01..12 as explicit open issues? This does **not** approve actual L4 stable IDs, canonical 3.2, or deployment.
