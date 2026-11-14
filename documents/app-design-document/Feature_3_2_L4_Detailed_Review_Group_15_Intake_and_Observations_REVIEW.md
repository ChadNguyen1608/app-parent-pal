# Detailed review 15 · Child profile inputs, preferences and observations

Candidate specification. Source commit `dceac139ac60e1dadbc74c2d7e56dfa7648edb6c`. Synthetic fixtures only.

- [Feature_3_2_L4_B10_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B10_Design_and_Checkpoint_REVIEW.md), blob `47ecd7b5ac5bea4ecd83979acc2ee5769c29eb70`.
- [Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B11_Design_and_Checkpoint_REVIEW.md), blob `e16d7e630a417a5885aef86afb5a98208b6c5fe2`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md): B01-PA-OD-01..04 for access and purpose; B01-C-OD-07 for audit.

## Shared evidence contract

Keep opaque subject, data kind, effective and recorded timestamps, provenance category and reference, version and purpose. Preserve subject statements, caregiver reports, direct observations and inferences as distinct provenance. Verification of who supplied a claim does not verify its content. Scope comes from Access Policy, with current identity, purpose, consent and legal evidence. Check before collecting, before commit and before release. Do not use Journal, check-in silence or restricted source content as implicit profile input. A later household pairing does not transfer historical claims or permissions. Shared audit records scoped refs, version and outcome. Raw child data with unknown lawful basis stays blocked.

## F02-G01-M01 · Intake & Updates

Intake owns proposed fact, source and submission receipt. Accept only allowlisted, necessary fields for the current purpose. Validate actor and subject scope, schema and source category. A proposal does not replace the effective profile until its owner applies a guarded update. Core Identity owns identity and verified age. Changes compare base version and current rights. An identical authorized retry returns the prior receipt; divergent payload conflicts. If scope is lost before commit, retain no new effective fact. Imported or caregiver-reported input remains attributed to its source.

## F02-G01-M02 · Incremental Questions

Own approved question reference, reason, locale and cohort applicability, scoped operation and state. Ask only where the approved purpose and current eligibility allow. Explicit skip closes the same operation, including across retry and stale devices. Skip, expiry and no response create no profile fact, preference or observation. An independent flow remains available when its requirements are otherwise met. An explicit answer can enter Intake only under its separate authority and evidence checks. With no eligible question, omit the prompt. Cadence and repeat prompts under a new operation are pending UX evidence.

## F02-G02-M01 · Preference Registry

Own scoped preference assertions, source and version, applicability time and active projection. Allow eligible subject statements and separately authorized reports. Inferred preferences need independently permitted provenance and remain visibly inferred. Conflicts retain distinct assertions and cannot silently replace a subject statement or elevate confidence. Retrieve only within current subject scope. Match results and reports reference eligible preference versions; recheck before release. No commercial or external use from preference capture alone.

## F02-G02-M02 · Preference Revision

Own scoped correction, rejection or withdrawal request against the exact assertion version. Registry applies the verified disposition using current authority and a guarded base-version check. An eligible rejection removes the disputed inferred assertion from the current eligible projection. Older copies stay historical only under lawful policy. Advance the evidence version and prevent queued inference, match or report work from republishing the rejected assertion. Conflicting requests are reassessed. A retry returns the original scoped disposition without applying it twice. No mutation of underlying source evidence from this workflow.

## F02-G03-M01 · Evidence-linked Observations

Own an observation record with concrete behavior, context, occurrence time, author/source, confidence evidence and version. An authorized actor may record a scoped observation. Keep interpretation separate from behavior. Missing mandatory provenance remains UNKNOWN and cannot ground a verified projection. Conflicting observations retain their individual scope and stay disputed in the projection where the conflict matters. Repetition is not independent corroboration. Free text cannot become a diagnostic label or stable trait by default. Evidence withdrawal fences downstream release and marks the projection for rebuild.

## Actors and cohorts

A0/A1 caregiver-mediated or supervised inputs where eligible; A2 assisted input and skip/correction controls; A3/A4 subject-led input and scoped review where eligible; A5 verified self-management and voluntary family access. Caregiver reports stay attributed and supply no rights over unrelated sources. Eligibility of readers, submitters and reviewers resolves separately per action. Use E0/E1 for core controls; no inference required. Any optional inference needs a separately approved workflow.

| ID | Trace | Synthetic fixture and expected outcome |
|---|---|---|
| D15-T01 | B10-T01/X01 | Two devices submit from the same base; one actor loses authority before commit. At most one eligible effective update. Revoked operation has no effect. |
| D15-T02 | B10-T01 | Response lost after accepted intake. Identical authorized retry returns one receipt; divergent input conflicts. |
| D15-T03 | B10-T02/X02 | Skip then offline retry and attempt unrelated flow. No prompt reopen or invented fact; independent flow remains available when eligible. |
| D15-T04 | B10-T02 | Question expires or applicable locale/cohort evidence is missing. No stale prompt and no automatic answer. |
| D15-T05 | B10-T03 | Subject report conflicts with caregiver report and inference. Preserve provenance; no inference becomes verified or replaces subject statement. |
| D15-T06 | B10-X03 | Same preference label in two profiles; unauthorized cross-household query or replay. No other subject records, counts or source references. |
| D15-T07 | B10-T04/X04 | Reject inference while match worker holds old snapshot. Old output withheld; retry cannot revive the inference. |
| D15-T08 | B10-X04 | Two corrections target the same version. One eligible guarded update at most; stale request routes to reassessment. |
| D15-T09 | B10-T05 | Missing source and conflicting observations. No verified trait or diagnostic label; retain eligible UNKNOWN/disputed states. |
| D15-T10 | B10-X05 | Withdraw observation after report generation before release. No affected data or metadata released from old artifact. |
| D15-T11 | B01-PA-OD-02/04 | Authorized education input is requested for unapproved external/marketing use. Deny before protected read, cache lookup or provider call. |

Open evidence: permitted field catalog, source-confidence criteria, age/actor eligibility and revocation fences. No new Owner decision needed for this checkpoint. No runtime testing or independent re-review.
