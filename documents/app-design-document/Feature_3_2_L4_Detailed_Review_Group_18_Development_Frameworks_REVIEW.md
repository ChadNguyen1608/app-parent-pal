# Detailed review 18 · Development frameworks and stage guidance

Candidate design. Source `d36ff1229281455f7de0ce3c32ecf4131472f121`. Synthetic fixtures only.

- [Feature_3_2_L4_B13_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B13_Design_and_Checkpoint_REVIEW.md), blob `d9ecfef1614738483b061a879f2b38f0e0ef5519`.
- [Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md), blob `58420cfcd6a860553b344b72cf33ae10ae56621d`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), B01-PA-OD-01..04 and B01-C-OD-07.

## F03-G01-M01 · Framework Registry

Own immutable framework revisions, content digest, applicable scope/locale, effective interval, approved manifest reference and active pointer. An editor submits a draft and a currently authorized publisher activates only the exact reviewed revision after checking mandatory evidence and taxonomy dependencies. Check eligibility and compare the active pointer at the write boundary. A change to reviewed content or dependency manifest requires fresh review. Activation of a replacement ends eligibility of the prior active revision for new guidance. Historical references remain version-bound under applicable rights and retention. Retire advances the serving revision; stale cache cannot supply current guidance. Idempotent activation replay returns an authorized original receipt; a divergent payload conflicts. Editorial workflow owns review decisions and knowledge CMS owns its own publication; neither replaces framework activation.

## F03-G01-M02 · Evidence Alignment

Own the link between an exact framework claim revision and its evidence manifest, including applicability, review disposition, known limitations and the required references. Evidence Provenance in checkpoint 10 owns source revisions and withdrawal. To mark a claim supported, verify each required reference is applicable and current for the approved scope; unresolved contradiction or missing required evidence yields UNKNOWN for an otherwise eligible view. If a required source is withdrawn, invalidate the claim for serving even before rebuild. The replacement must be reviewed against its own manifest. The count of references cannot substitute for evidence quality or applicability. Neither a claim nor an alignment record asserts that an individual child is at a particular developmental stage.

## F03-G02-M01 · Dimension Taxonomy

Own stable dimension IDs, definition revisions, locale display names, aliases and lifecycle state. Resolve aliases only in the requested taxonomy version and locale. A label-only change preserves identity and older history. A semantic replacement needs explicit versioned review and cannot silently reclassify existing observations, goals or reports. Conflicting aliases in the same lookup scope keep the proposed revision unpublished. A removed term remains traceable in eligible historical records and cannot be selected for new use. Guard publish by base revision and current permission.

## F03-G02-M02 · Domain Mapping

Own the reviewed crosswalk binding an exact taxonomy revision and dimension to an exact domain catalog revision and scope, with review and confidence evidence. Eligible consumer supplies trusted source and target versions. Use only active, applicable reviewed mappings. If multiple targets remain plausible without approved disambiguation, return AMBIGUOUS with no selected mapping to an authorized consumer. Missing approved mapping yields UNKNOWN. A changed domain or taxonomy does not inherit the prior mapping. Downstream calculations and plans pin version references; a mapping change triggers re-evaluation of affected pending work, with no automatic historical or effective-plan rewrite.

## F03-G03-M01 · Stage Catalog

Own guidance entry, exact framework, dimension and source references, age/cohort applicability, locale and effective window. Use verified current applicable evidence from its owner when the entry requires a cohort. Core Identity owns age facts, and Access Policy owns authority. The catalog never infers an age from activity, school level or inferred ability. When stage evidence is unknown, use only a separately approved general entry eligible for the actor and purpose. Otherwise return UNKNOWN and no guidance. Recheck framework, claim, taxonomy, applicability and authority before display and on replay. A stale eligible projection can be withheld pending rebuild; denial leaks no protected guidance or applicability details. Guidance is informational and does not establish a diagnosis, capability label or permission.

## Actors and cohorts

Separate scoped editor, reviewer, publisher and consumer permissions. Access Policy decides final authorization. Apply current purpose and lawful-basis evidence before protected reads, cache lookup or release. A0 caregiver-mediated, A1 supervised, A2 guided, A3/A4 eligible subject-led and A5 verified adult self-management are interaction profiles only. Unknown eligibility prevents cohort-specific selection. Shared audit holds allowlisted opaque refs and dispositions only. E0/E1, zero inference for these controls. Unknown lawful basis blocks real child data.

| ID | Trace | Synthetic fixture and expected result |
|---|---|---|
| D18-T01 | B13-T01 | Edit approved v1 into v2 and attempt activation with old receipt. v2 remains ineligible; serving pointer unchanged. |
| D18-T02 | B13-X01 | Two authorized activations compare same active pointer; lose winning response, then retry. One transition; identical authorized replay gets original receipt; divergent replay conflicts. |
| D18-T03 | B13-T02/X02 | Withdraw required source after review but before activation. New revision does not activate. If withdrawal occurs after activation, the affected claim cannot be served from stale cache. |
| D18-T04 | B13-T02 | Only available source is out of scope or conflicts with another mandatory reference. Eligible result UNKNOWN; no supported claim. |
| D18-T05 | B13-T03 | Rename a dimension without semantic change. Stable ID persists; historical label/version and prior reports remain intact. |
| D18-T06 | B13-X03 | Introduce colliding aliases in one locale/version. Candidate rejected, active taxonomy unchanged. |
| D18-T07 | B13-T04 | Two plausible mappings without reviewed disambiguation. Authorized result AMBIGUOUS with no chosen target. |
| D18-T08 | B13-X04 | Domain catalog changes before applying a pending proposal. Old mapping cannot apply to new versions; reassess without editing active plans. |
| D18-T09 | B13-T05/X05 | Age evidence unknown; general approved entry exists, then expires. First serves only eligible general entry; second returns UNKNOWN and no content. |
| D18-T10 | B13-T05, D10-T03 | Verified stage changes or framework retires after selection and before release. Stale stage-specific guidance withheld; next eligible result requires fresh selection. |
| D18-T11 | B01-PA-OD-01/04 | Actor loses scope between cached selection and release or actor belongs to unrelated household. No protected material or applicability metadata disclosed. |

Open evidence: claim applicability criteria, domain crosswalk review rules, age-specific content validation and cache/version fencing. No new Owner decision needed for this checkpoint. Runtime and independent re-review pending.
