# Parent-Pal · Batch 07 · Model evaluation and safety response

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED · Synthetic fixtures only

Pinned source commit `d3d2d700af0222f9aade1a241febe6c4a68bba76`; canonical inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 source manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) supplies decision logs and baseline. Scope follows [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md).

## Permissions, source authority and boundaries

F07-G04-M02 owns evaluation records. F07-G05-M01 owns safety signal triage. F07-G05-M02 owns assigned human cases and response provenance. Access Policy remains the final gate; Purpose-bound Access owns legal and purpose assessment (B01-PA-OD-01..04). Journal sharing and safety purpose remain separate (B01-CL-OD-04, B01-C-OD-02); F07 audit governance applies (B01-C-OD-07). Policy Evaluation supplies pinned policy-version expectations and Router provides model/profile identifiers. No unrestricted Journal read, automatic family disclosure, or diagnosis. Unknown lawful basis blocks real-child-data processing. Expired scope or unavailable evidence denies case access and outward disclosure. E0/E1 for routing, evidence, state, and response authorization. Candidate E2/E3 evaluation runs require separate approval and synthetic fixtures. Thresholds, staffing, costs and operational feasibility are UNKNOWN.

| Temporary candidate | Actor and result | Data and interface contract | AC and proposed oracle |
|---|---|---|---|
| CAND-F07-G04-M02-run | Authorized evaluator obtains reproducible evaluation evidence | Own run ID, model/config/prompt/policy/fixture hashes, per-case expected and observed class, and provider status. Store scoped test evidence; failures and missing runs remain visible. E1 control plane. | B07-T01. Replay same run after lost response; inject provider failure on one fixture. One run record, partial evidence clearly labeled, absent output never scored as a pass. |
| CAND-F07-G04-M02-compare | Reviewer identifies model regression against a pinned baseline | Compare matching fixtures and safety criteria under explicit versions. Incomparable fixtures remain UNKNOWN; deployment authorization is separate. E1. | B07-T02. Candidate passes more fixtures but regresses a mandatory denial case. Report exact regression, no approval from aggregate score. |
| CAND-F07-G05-M01-triage | Authorized safety intake records a signal and candidate routing result | Own signal ID, permitted source/ref, provenance, confidence/unknown and policy version. Use reviewed rules; do not convert ambiguity into confirmed harm. Keep signal metadata minimal. E1. | B07-T03. Intake ambiguous synthetic signal and replay operation. One signal, uncertainty retained, no family notification or clinical label. |
| CAND-F07-G05-M01-refer | Eligible safety signal is referred to a reviewed human route | Commit one scoped referral, case reason category, and permitted evidence refs. If no authorized route or policy, retain controlled pending state and provide only reviewed user-facing support content. E1. | B07-T04. Revoke case-routing authorization before handoff; retry after lost response on another valid case. Revoked route receives nothing. Valid case produces at most one referral. |
| CAND-F07-G05-M02-assign | Current authorized reviewer receives minimum case evidence | Own case, assignment, evidence scope and access epoch. Authorize each release. Handoff between reviewers fences the outgoing scope, and unavailable assignment remains pending. E1. | B07-T05. Reassign case while outgoing reviewer opens a stale cursor. New reviewer obtains permitted projection; outgoing reviewer receives no private evidence. |
| CAND-F07-G05-M02-record-response | Authorized reviewer records decision and approved follow-up | Record decision ref, actor, reason category, policy and outcome. Outward communication requires independent scope/purpose authority and idempotent delivery. No raw private content in general audit. E1. | B07-T06. Reviewer prepares a follow-up then loses authority; replay a separately committed authorized response. First sends nothing; second is delivered at most once with scoped provenance. |

## Cohort interaction

A0 caregiver-led interface in verified scope; A1 supervised interaction; A2 guided self-report where eligible; A3 assisted or subject-led intake; A4 subject-led intake with protected confidentiality; A5 verified adult self-management. Each pattern is conditional. Legal authority, age-specific routes and approved escalation policy are UNKNOWN. Neither role nor age creates disclosure permission. Safety reviewers need explicit scoped case assignment and independent policy clearance. If route or evidence is missing, use approved limited fallback and avoid claiming that a human is available or has responded.

## Trace and triage

- F07-G04-M02 → B06 policy evaluation and routing version contracts → B07-T01/02. B07-I01 HIGH: agree fixture gates and representative coverage before comparing models for release.
- F07-G05-M01 → B01-PA-OD-01/02/04 and B02 Journal safety boundary → B07-T03/04. B07-I02 HIGH: review escalation policy, evidence minimization and safe fallback. Candidate thresholds stay unset.
- F07-G05-M02 → F07 audit governance, B01-PA-OD-03/04, B02 disclosure fencing → B07-T05/06. B07-I03 HIGH: verify human staffing, response responsibility and purpose-scoped evidence. Bring unresolved authority/notification policy to consolidated Owner review after research.
- BI-05/10 remain blocking for real data. Independent review deferred to consolidation. Six proposed test oracles, zero runtime executions. 73 untouched L3 remain plus B02 partial-slice follow-up. Next B08.

Current design amendment: [Owner decision implementation and evidence](Feature_3_2_L4_Owner_Decision_Implementation_and_Evidence_REVIEW.md). Its ODP acceptance criteria apply where this checkpoint handles the affected operation.

## Current detailed design amendment

[Detailed group 02: Pal responses](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) applies to this checkpoint and supersedes conflicting earlier candidate clauses and oracles. Earlier text remains source history where superseded.
