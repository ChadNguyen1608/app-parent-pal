# Detailed review 05 · Learning evidence and report disclosure

Pinned source `c60ee2f14bf31b2ecd7f06a0cff3a9b320dc5d48`. Candidate specification and synthetic oracles. Scope F04-G05-M02 Evidence Submission, F06-G07-M01 Academic Assessment, F06-G01-M02 Source Metadata, F06-G05-M01 Audience Views and F06-G05-M02 Summary Rendering.

- [Feature_3_2_L4_B18_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B18_Design_and_Checkpoint_REVIEW.md), blob `0c84ec14a75f6a4437d13acaed5b4828fa219041`
- [Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md), blob `8f298454b4c52a280e5035b5b9c472112ddf4d35`
- [Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md), blob `41c8bc2a22a5d30e1f98edd7b7a62cb8ca751894`
- [Feature_3_2_L4_B21_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B21_Design_and_Checkpoint_REVIEW.md), blob `19932152cafb1b56e7d3d9477559dfc0a7a631cc`
- [Feature_3_2_L4_P6_Academic_Assessment_Owner_Decision_Log_APPROVED.md](Feature_3_2_L4_P6_Academic_Assessment_Owner_Decision_Log_APPROVED.md), blob `df9e3fdf7e7d7c0e120ca5ce011d94fb27bbae4c`

## Source and ownership contract

Submission owns scoped immutable attempt ID, payload reference, submitter, provenance and source version. Same operation and digest returns the original attempt after current authorization; changed digest conflicts. A correction resubmission creates a new attempt linked to the previous attempt. Attachment access is separate from metadata access. Unknown scope or rights denies submission and attachment release.

Academic Assessment owns a result per attempt/version, with actor, method, rationale category, evidence quality and review history. Result is provisional for AI assessment. Parent confirmation requires authorized human action for the exact current attempt and records actor and time. Teacher verification requires its own verified source and cannot be derived from parent confirmation, self report, import channel or AI confidence. Source Metadata tracks source kind, evidence and revisions. If a provider claim conflicts with provenance, preserve the dispute and exclude verified presentation. A disputed or unreadable answer can stay unverified; avoid presenting uncertainty as certainty.

A child may request an eligible recheck. Recheck consumes a separate review-operation reference and preserves original assessment history. If disagreement remains, authorized caregiver verification or adjustment follows the approved flow. AI recheck and hint cannot set parent-confirmed status. Hint only on child request, with guided prompts and no direct answers. Use applicable safety and approved educational source routing. Assessment quota, trigger and pricing stay undecided.

## Audience projection and release

Audience Views owns a field-level projection from current access, purpose and consent. Summary Rendering receives an authorized projection and versions of its sources, then checks authorization and visibility again before release. Derived fields require permitted lineage. No Journal-derived field may appear if a root is unavailable or share is revoked. Apply same check before cached pages, downloads, scheduled reports and continuation tokens. Drop stale artifacts or return scoped pending state. Audience denial does not reveal absent or filtered counts, identifiers or source evidence. Reports display the actual verifier category and version. E0/E1 projection and rendering by default. Inference remains conditional with separate assessment and hint measurements.

## Cohorts and actors

A0/A1 caregiver-led only where eligibility is proven; no assumed direct academic assessment. A2 guided submission and help within child rights. A3/A4 eligible subject-led submissions, rechecks and scoped report views. A5 verified adult self-management with voluntary family sharing. Caregiver confirmation needs explicit current authority. Observers may see only granted projection fields. Operator, teacher or provider roles supply no general Journal access. Eligibility and reliability confidence stay UNKNOWN where source evidence is unavailable.

| Oracle | Fixture | Expected |
|---|---|---|
| D05-T01 | Submission response lost; same and then changed payload retries | One attempt for identical retry; changed digest conflicts, no overwrite. |
| D05-T02 | Resubmit while earlier assessment worker completes | New attempt gets separate identity. Late result may only attach to the original eligible attempt; no overwrite of current view. |
| D05-T03 | Parent confirms work completed at home | Result displays PARENT_CONFIRMED with actor/time/version; teacher status remains unsupported. |
| D05-T04 | Imported event marked teacher-verified without verified issuer proof | Metadata remains unverified; report does not display teacher confirmation. |
| D05-T05 | Unreadable answer, then recheck and caregiver dispute resolution | Initial evidence insufficient, no forced mark. Recheck preserves old history and does not confirm; only authorized caregiver action may confirm or adjust. |
| D05-T06 | Child requests final solution in hint flow | Eligible guiding prompt or abstention; no direct answer and no mutation of result. |
| D05-T07 | Report render uses grant then viewer loses grant before release | No stale artifact, page, attachment or filtered count disclosed. |
| D05-T08 | Derived report mixes two roots; one Journal share withdrawn | Artifact with affected derivative is held from release; any rebuild uses only current scope. |
| D05-T09 | Stale parent confirmation after re-submission or scope revocation | Prior approval cannot confirm new attempt; revoked authority cannot commit. |

P6-AA-OD-01..04 traced to the contracts above. F-023 remains evidence pending. No runtime tests or independent re-review. Next: evidence aggregation and progress calculations, then integrations with third-party data boundaries.
