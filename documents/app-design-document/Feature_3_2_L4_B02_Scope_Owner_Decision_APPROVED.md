# Parent-Pal — Batch 02 Scope Owner Decision

**Date:** 2026-11-14  
**Status:** `B02_SCOPE_APPROVED / B02_DESIGN_AUTHORIZED / NOT_FINAL_L4_APPROVED`  
**Decision source:** Product Owner explicitly confirmed: “Xác nhận phạm vi batch02 là cả 4 module theo đề xuất.”

## Approved Batch 02

**Workstream A (design first, may be partly parallel):**
1. `F01-G02-M01` — Parent–Child App Linking
2. `F04-G06-M02` — Change History

**Workstream B (design after required interface assumptions):**
3. `F05-G06-M01` — Child Journal Sharing
4. `F07-G06-M02` — Retention & Deletion

Design includes L4 candidates, acceptance criteria, permission/privacy/data/exception flows, cross-module contracts, proposed tests, E0–E3 and cost concerns. ChatGPT is primary designer and GitHub decision/traceability manager; Claude is focused independent reviewer only where security/privacy/consistency risk warrants, default 0 subagents, up to 1 Sonnet 5.5 when necessary. New Owner business questions only if genuinely unresolved.

## Scope accounting from 3.2-R1

Source: [Product Blueprint 3.2](Product_Blueprint_03_2_Feature_Inventory_and_Scope.md) structurally records **8 domains / 51 groups / 106 L3 candidates** (98 original +8 additional; not 98 current).

- P6: 3 distinct L3 reviewed at pilot level.
- Batch 01: 5 additional distinct L3 reviewed and conditionally normalized.
- Batch 02: 4 approved distinct L3 not yet designed.
- After Batch 02 design: **94 further L3** remaining from current structural inventory (=106−3−5−4).
- At decision time: 98 L3 not yet processed in P6/B01 (=106−8); 4 of these are now selected for B02.
- All counts denote **inventory L3 structural candidates**, not production modules, L4 count, application tests or MVP commitments.

## Boundaries

- Batch 01 conditional design baseline remains the authority for cross-module contracts; 42 earlier Owner decisions unchanged.
- No premature canonical 3.2/3.3/3.4 editing, stable L4 ID assignment, PR #17 merge, or production use of real child personal data.
- Legal basis UNKNOWN => no child personal-data processing. Journal sharing/retention design remains permissioned and fail-closed.
- Next step: ChatGPT designs `F01-G02-M01` L4 candidates first, and `F04-G06-M02` history may proceed with scoped independence.
- All findings and P5/P6 evidence gaps tracked; neither normalized status nor selection means final acceptance.
