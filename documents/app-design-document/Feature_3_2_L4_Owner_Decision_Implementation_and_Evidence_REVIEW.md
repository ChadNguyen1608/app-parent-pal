# Parent-Pal · Owner decisions implementation and evidence

Design revision only. Source commit `7d008616c5fdd9cbd55cbf98ce43c375e468341c`. [Approved Owner decisions](Feature_3_2_L4_Consolidation_Owner_Decision_Log_APPROVED.md).

## ODP-01 · Household binding

Family Structure owns the scope check. Invitation, acceptance, recovery, support and administrative operations must reject a change of household for the existing child profile. Credential revocation alone does not unlink. After effective Child App unlink, a fresh authorized pairing may target the same or a different household. If association cannot be determined or is disputed, deny the mutation and allow scoped verification without transfer. Check canonical association and binding epoch at commit; a prior invite or recovery receipt does not authorize a subsequent commit. On denial, no new binding, membership, access grant or unauthorized profile existence signal.

- ODP-X01 · Race a same-household recovery with a cross-household acceptance. Only the eligible same-household mutation can commit. A stale claim or support bypass is denied; a fresh authorized pairing after effective unlink may establish a new household binding with no prior grants.

## ODP-02 · Journal deletion

F01 Lifecycle presents explicit confirmation; F07 Retention owns acceptance, suppression and purge evidence. Before acceptance a user can abandon the confirmation. After acceptance there is no user/support withdrawal or restore. Persist the confirmation receipt, scope, accepted time, policy version, tombstone/visibility epoch and original due reference atomically. Retry returns the same receipt when currently authorized. Retain the established immediate suppression and 60-day permanent-deletion baseline, subject to verified legal requirements and disclosed lawful exceptions. A verified hold affects only its allowed purge scope. A backup restore may never republish a suppressed record. F05 owns lineage and each controlled store supplies its receipt. Legal, calendar and backup verification remain open.

- ODP-X02 · Race a withdrawal, stale sync and backup restore after acceptance. None releases content or changes acceptance or deadline. Replaying deletion returns the original authorized receipt. Before confirmation, abandoning creates no tombstone.

## ODP-03 · Approved answer scope

Candidate evidence contract for Router, Policy Evaluation and response producers. For a supported response, require a current approved response/template or reviewed source capability with a versioned coverage record. For trained scope, require an approved evaluation record binding task, model/configuration, supported intent, audience, language/modality and limitations to representative tests. General model knowledge, provider assertions or confidence alone are insufficient. Catalog ownership and validation thresholds are implementation proposals. Existing purpose, authorization, privacy, safety and budget controls also apply.

Resolve scope before invoking a model; evaluate emitted content against the same approved scope before release. Invalid, stale or unavailable evidence is UNKNOWN. OUT_OF_SCOPE or UNKNOWN yields zero AI answer bytes, including from fallback, retry, cached result or alternate model. Any replacement answer must independently pass the same checks. An operational status, if present, is separate from an AI answer. No human response, escalation authority or family notification follows from this decision. This applies to user-facing AI content from companion, learning/hints, insights, recommendations and summaries, across modalities. Rules-based controls may run without inference. Preserve P6-AA-OD-02 hint limits. Candidate release strategy buffers output until validation where streaming cannot guarantee the gate.

- ODP-X03 · Verify allowed scope, out-of-scope request, mismatched model version, and withdrawal before delivery. Only the first may return a scoped answer. On fallback, re-evaluate independently; never release partial or cached AI output after a denial.

## Evidence triage

| Prior evidence | Current disposition | Required evidence |
|---|---|---|
| P5 BI-02 | Open. Missing MP-B15, MP-C05/06/18/19 and nine semantic ambiguities are preserved. | Exact source fixtures and expected outcomes, then per-ID semantic reconciliation. |
| P6 BI-03 | Open. Access residual warning, F-023 and F-021 remain distinct. | Source run version, fixture, observed result and independent review of each affected oracle. |
| B01 BI-01/04/09 | Open. Forty-six finding-to-AC mappings and v3.1 verification remain incomplete. | Recover C3/C4 and independent run artifacts, pin per-item evidence and verify dispositions. |
| BI-05/06/07/08/10/12 | Design amended; legal and runtime gates remain open. | Purpose and lawful-basis evidence, link/plan commit verification, lineage and backup receipts. |

B08–B25 now include 73 module-specific supplemental oracles. They extend the existing candidates and do not claim full schema, cohort matrix or runtime coverage. Review priority: B08/B09 Journal and AI, B16–B18 plan concurrency, B19–B21 reporting provenance, B22–B25 third-party and financial controls. Use the new cases for independent review after source freeze. Zero runtime executions.

## Current detailed design amendment

[Detailed group 01: linking](Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md) and [Detailed group 02: Pal responses](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) applies to this checkpoint and supersedes conflicting earlier candidate clauses and oracles. Earlier text remains source history where superseded.
