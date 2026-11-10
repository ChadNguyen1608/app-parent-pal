# PARENT-PAL — L4 Methodology Decision Log

**Date:** 2026-11-10  
**Decision:** M-Q1=A; M-Q2=A; M-Q3=A; M-Q4=A; M-Q5=A; M-Q6=A  
**Status:** `OWNER_APPROVED_METHODOLOGY / PILOT_REVIEW_ONLY`  
**Baseline:** Blueprint 3.2-R1 on `main`, 8 domains / 51 groups / 106 L3. PR #16 merged.  
**Scope of this PR:** L4 method and pilot for exactly three L3; no canonical changes.

| Decision | Approved rule |
|---|---|
| M-Q1 | One independently testable primary outcome per L4; no fixed number of L4 per L3 |
| M-Q2 | Complete 3.2 schema plus authorization, data ownership, six cohorts, workflow, trace, acceptance and failure cases; `UNKNOWN` with issue |
| M-Q3 | Preserve published illustrative L4 IDs; use `CAND-` IDs for new proposals until boundary review |
| M-Q4 | Apply P0–P6 risk-first; open L3 change request rather than silently rewriting owner boundaries |
| M-Q5 | Pilot `F01-G04-M01`, `F06-G07-M01`, `F04-G02-M03` |
| M-Q6 | Publish methodology/pilot/test cases on review PR; do not edit 3.2/3.3/3.4 or merge without separate approval |

**Clarification:** Approval here concerns *method*, not candidate L4, age/legal rights, safety thresholds, model quality, release gates, implementation or MVP.

**Review sequence:** P0 source/boundary → P1 candidate outcomes → P2 split/merge/reuse/move → P3 contracts → P4 trace/tests → P5 cross-functional review → P6 owner approval and proposed canonical diff. Current work reaches **P4 draft**; P5/P6 remain pending.

**Required sign-off:** Product Owner on boundaries and candidate list; privacy/legal for authorization and data, education/assessment expert for rubric/feedback, child-development/safety review for balance claims; engineering for technical feasibility. No test execution has occurred.
