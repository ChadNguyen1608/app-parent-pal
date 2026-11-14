# Detailed review 16 · Context, purpose permissions and profile snapshots

Candidate specification at `a2ca06dc7d2d1d12690bc67d7682d91859c3e54b`. Synthetic fixtures only.

- [Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md), blob `e16d7e630a417a5885aef86afb5a98208b6c5fe2`.
- [Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md), blob `b348c6688c204a48f4dd540185e1cdd235332ea9`.
- [Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md](Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md), blob `9ced7c8971c73c06d857dcef8a5c946e5aa76a98`.

## F02-G03-M02 · Non-labeling Review

Review owns the interpretation disposition, its target observation versions, reviewer authority, reason and review-policy version. Evidence-linked Observations remains the source owner. An eligible reviewer may mark an interpretation eligible within its evidenced context, unsupported, or requiring additional evidence. A specific observed behavior does not justify a stable trait or diagnostic label. Conflicting evidence stays visible to eligible reviewers as a dispute. Review does not overwrite the observation or elevate its evidence quality. Record the disposition only after comparing current reviewer authority, target versions and prior disposition revision. An identical authorized retry returns the original receipt. An amended observation needs a fresh assessment. Superseded, unsupported and disputed interpretations cannot serve as verified profile facts.

## F02-G04-M01 · Environment Context

Own a scoped context assertion with subject, data class, minimized value, source, confidence, effective interval, recorded time and revision. Examples include school hours and learning environment constraints. Collect exact school or address details only where necessary for an approved purpose. Declared and verified context stay distinguishable. School import can supply a reviewed source reference through checkpoint 07; it cannot overwrite a verified fact directly. An authorized actor creates or corrects against the current revision, with scoped idempotency. Preserve provenance and prevent stale or conflicting updates from replacing current facts. Downstream proposals pin context revisions. A correction or expiry requires re-evaluating an affected pending proposal before application, with no implicit edit of an already committed plan.

## F02-G04-M02 · Context Permissions

Own binding evidence for the context resource class, subject, consumer action and approved purpose version. B01-PA-OD-01 assigns final ALLOW/DENY to F01 Access Policy; F07 Purpose-bound Access assesses scope and lawful basis, and Consent Ledger provides applicable consent evidence. B01-PA-OD-02 assigns purpose-catalog approval to the Owner. This module cannot create a new purpose or grant. Consumer-supplied labels, matching household, successful authentication or a previous ALLOW are insufficient. Check current scope, purpose, consent and legal evidence before protected reads, cache lookup, computation or external dispatch. Authorization for school planning does not carry over to marketing or a separate report. Revocation or a purpose-version change invalidates dependent materializations even if physical cache eviction is delayed. Unknown lawful basis for real child data yields DENY.

## F02-G05-M01 · Versioned Profile

Own the derived profile snapshot and input manifest. Record purpose, projection schema, subject, source record versions and required evidence/authorization epochs. Source owners retain canonical values. Include only allowlisted fields eligible for the current purpose, preserving source categories, confidence and disputes where visible to the actor. Mark missing required evidence UNKNOWN for an authorized view. A role or household transition does not carry permission to historical data. Exclude Journal content and derivatives absent independently approved authority and complete lineage.

Compare current input and permission versions when assembling, committing and releasing a snapshot, including for reports, cache and continuation cursors. Where the actor remains eligible for the profile but a required input becomes ineligible, withhold the entire old snapshot and return scoped REBUILD_PENDING without identifying the withdrawn input. An authorized rebuild uses current eligible sources, including UNKNOWN where required. Where profile-level authority itself is absent, return generic denial without status or existence hints. Previously delivered copies remain subject to the applicable lifecycle. Audit uses only permitted scoped refs and outcomes under B01-C-OD-07.

## Actors, cohorts and execution

Recorder, verifier, reviewer and consumer use separate operation scopes. A0/A1 use conditional authorized representative or supervised flows; A2 assisted input/review; A3/A4 eligible subject-led flows; A5 verified adult self-management and voluntary family access. Cohort supplies no permission. E0/E1 for capture, review and projection, zero inference. Missing authority keeps protected inputs unavailable. Do not use absence as a negative label.

| ID | Trace | Synthetic fixture and expected outcome |
|---|---|---|
| D16-T01 | B11-T01 | One scoped observation is proposed as a stable trait. Reject the interpretation, preserve original observation and scope. |
| D16-T02 | B11-X01 | Reviewer loses rights before deciding; eligible reviewer commits and retries. Revoked actor changes nothing; eligible retry returns one receipt. |
| D16-T03 | B11-T01, D15-T09 | Observation corrected after disposition. Old interpretation cannot be verified against the new source revision. |
| D16-T04 | B11-T02 | Correct school schedule while dependent proposal is pending. Proposal requires reassessment; no implicit effective plan change. |
| D16-T05 | B11-X02 | School context reaches effective end before a new schedule is built. Expired input excluded; no reliance on stale cached value. |
| D16-T06 | B11-T02, D15-T02 | Identical context retry and conflicting edit from same base. One receipt for replay; stale edit cannot replace current value. |
| D16-T07 | B11-T03/X03 | Same actor changes from approved planning to unapproved marketing with warm cache. Deny before lookup or dispatch; no metadata disclosure. |
| D16-T08 | B01-PA-OD-04 | Role and consent are valid but lawful basis is UNKNOWN. No protected read, computation or provider dispatch. |
| D16-T09 | B11-T04/X04 | One of two required sources loses authority after build; actor retains profile access. Zero bytes from old snapshot; REBUILD_PENDING without source hints. |
| D16-T10 | B11-T04, D01-T05 | Profile grant removed before next page or child pairs to another household. Old cursor discloses no rows, counts, status or historical source references. |
| D16-T11 | B11-X04, D03-T02 | Journal-derived dependency loses share authority before report release. Old snapshot and dependent artifact remain unavailable; rebuild excludes unauthorized material. |

Open evidence: context field catalog, source and interpretation criteria, scope-version propagation and complete snapshot invalidation. No new Owner decision required for this checkpoint. No application tests or independent re-review executed.
