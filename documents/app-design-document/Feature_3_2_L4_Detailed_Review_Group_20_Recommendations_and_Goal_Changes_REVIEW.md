# Detailed review 20 · Recommendation review, career exploration and goal changes

Candidate specification. Pinned source `d5ad3a389477b83253d7a64d951f911923bdf1ee`. Synthetic fixtures only.

- [Feature_3_2_L4_B15_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B15_Design_and_Checkpoint_REVIEW.md), blob `71bbe121c17c5102f008e3cdbdbfc87ae1673a7f`.
- [Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md), blob `5c2c81a05fc39372d31e520648f5b069f51d9aa6`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), B01-PA-OD-01..04 and B01-C-OD-07.
- [Pal response design](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) and [profile permissions](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md).

## F03-G05-M02 · Recommendation Review

Own scoped review decision, recommendation version/digest, reviewed evidence manifest, reviewer authority, review policy and reason. An authorized reviewer can approve for presentation, reject or return for revision. An unresolved review cannot supply approval. Compare reviewer authority, recommendation digest and evidence versions at decision commit. An eligible review receipt is bound to that exact version and scope. Changing the recommendation or mandatory evidence requires re-review. At release, confirm current decision and grounding; a cached approval cannot revive withdrawn evidence. Approval for presentation never writes a goal, milestone or schedule.

Scope replay by operation, actor and target. Identical authorized retries return the original receipt; divergent payload conflicts. Concurrent reviewers against the same undecided revision yield at most one effective decision. Preserve prior authorized decisions as historical provenance subject to retention. A receipt supplies no broader access to underlying child data.

## F03-G05-M03 · Career Exploration Guidance

Own scoped exploration result and exact option/source manifest, eligibility criteria, coverage gaps, and version. Offer sourced education or career options as informational choices with limitations. Avoid definitive suitability labels, ranking from unsupported profile assumptions, or converting age and preference into a capability judgment. Treat personal fit as UNKNOWN when current authorized evidence is insufficient; where eligible present only sourced general information. Do not use skipped answers, Journal, or disputed profile assertions as implicit input.

Use current approved internal information first for technical education/training questions. External web or LLM fallback requires independent authorization, purpose, provider and scope gates. Minimize external requests and exclude protected context absent a separately approved workflow. Unapproved skills or unresolved evidence do not yield a generated option. Recheck the actual content, source validity and authority before release and on retry. Safety signals follow the reviewed trusted-adult suggestion path. An exploration result does not create a goal or send a referral.

## F03-G06-M01 · Goal Reassessment

Own dated reassessment record, target goal version, comparison window, input manifest and disposition. Source domains own progress and context facts. An eligible actor requests review. Distinguish sufficient evidence for a scoped conclusion, missing or stale evidence, and contradictory evidence. Missing or disputed progress cannot mark a goal failed or justify an automatic goal change. If an input used by the pending output is withdrawn, return scoped ABSTAINED to the still-authorized requester and withhold the old conclusion and metadata. Generic denial applies if requester authority is lost. Reassessment can inform a separately requested change proposal and cannot amend a roadmap or schedule.

## F03-G06-M02 · Goal Change Proposal

Own proposal ID, actor/subject scope, exact base goal and roadmap versions, proposed change, evidence refs, state and receipt. Eligible actors may create or withdraw a pending proposal under current authority. Proposal acceptance for review is not effective application. Roadmap owns the guarded effective commit against current constraints, base versions, policy and exact approval. A competing replacement makes an earlier proposal stale and requires reassessment before any apply. Recheck rights and versions at submit, review and handoff. Identical replay returns the original scoped receipt when currently authorized; divergent replay conflicts. Reconcile an uncertain outcome before retry. Neither proposal nor roadmap action edits an effective F04 schedule automatically.

## Actors, data and cohorts

Access Policy makes final decisions; Purpose-bound Access provides current legal and purpose assessment. Requester, reviewer and roadmap approver have separate action permissions. Use A0 caregiver-mediated and A1 supervised when eligible; no direct career suitability assumed. A2 guided choices, A3/A4 eligible subject-led exploration and proposal, A5 verified adult self-management and voluntary family sharing. Age supplies no authority. Unknown lawful basis blocks real child data. E0/E1 for state, review and rules. Optional E2 requires separate evidence and authorization. Audit uses opaque scoped refs and outcomes only.

| Oracle | Trace | Synthetic fixture and expected result |
|---|---|---|
| D20-T01 | B15-T01 | Approve v1 then change content or mandatory evidence. Receipt cannot approve or release v2; no goal or schedule write. |
| D20-T02 | B15-X01 | Lose review response, then same and divergent replay. One decision; authorized identical retry returns receipt and divergent payload conflicts. |
| D20-T03 | B15-T01, D19-T09 | Reviewer loses rights before decision; required source later withdrawn from separately approved result. No unauthorized decision; stale result not released. |
| D20-T04 | B15-T02 | Sparse profile and expired option source. Exclude stale option. Only eligible grounded general information, no personalized fit label. |
| D20-T05 | B15-X02, D02-T02 | Insufficient internal coverage with an unapproved external capability, including retry. No external dispatch or generated option. |
| D20-T06 | B15-T03 | Progress inputs stale or incomparable. No goal-failed status or automatic change. |
| D20-T07 | B15-X03 | Input withdrawn between build and release; requester still authorized. ABSTAINED, zero old conclusion or withdrawn metadata. |
| D20-T08 | B15-T04 | Goal replaced while earlier proposal is pending. Old proposal cannot apply; current roadmap and effective schedule unchanged. |
| D20-T09 | B15-X04 | Actor loses proposal permission before commit. No new proposal, receipt disclosure or goal change. |
| D20-T10 | B15-T04, D19-T07 | Valid proposal response lost, then identical and divergent retry. One proposal, authorized replay returns prior receipt, divergent replay conflicts and no effective mutation from submit. |
| D20-T11 | D02-T05 | Eligible risk-of-harm signal during exploration. Reviewed trusted-adult suggestion only; zero generated advice, outreach or goal change. |

Open evidence: provider/option applicability, actor approval rules, reassessment coverage and source/release fencing. No Owner decision required for this checkpoint. No runtime tests or independent re-review executed.
