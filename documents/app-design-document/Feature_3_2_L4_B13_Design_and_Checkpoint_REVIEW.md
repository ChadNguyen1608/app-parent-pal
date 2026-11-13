# Parent-Pal · Batch 13 · L4 candidate checkpoint

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED

Source commit `ba00140b8b44b218ac2dbce884102bf09302e55a`, inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) pins all 42 decisions. [B04 queue](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) records scope.

- F03-G01-M01 · Framework Registry
- F03-G01-M02 · Evidence Alignment
- F03-G02-M01 · Dimension Taxonomy
- F03-G02-M02 · Domain Mapping
- F03-G03-M01 · Stage Catalog

## Permission and applicability

B01-PA-OD-01..04 apply to every candidate. Access Policy issues the final decision using current subject, purpose, resource, consent and policy versions. Real child data is blocked where lawful basis is UNKNOWN. Recheck at commit and release. F07 audit governance applies per B01-C-OD-07; private content stays out of shared audit. Each actor acts only in current scope. A0 conditional caregiver-mediated, A1 supervised, A2 guided, A3 assisted or subject-led, A4 subject-led when eligible, A5 verified adult self-management. These interaction profiles supply no authority. Missing mandatory evidence denies protected processing; manual path only within existing rights. E0/E1 means zero inference calls. E2/E3 remains conditional and budgeted. Costs and evidence confidence remain UNKNOWN.

## Candidate contracts and test oracles

| Temporary L4 | Actor and observable outcome | Ownership, flow and data contract | Acceptance criterion and synthetic test |
|---|---|---|---|
| CAND-F03-G01-M01-activate | Editor activates reviewed framework | Registry owns version, effective window and decision ref. E0. | B13-T01. Activate unreviewed version while reviewed version active. No replacement. |
| CAND-F03-G01-M02-align | Reviewer maps framework claim to evidence | Alignment owns claim, evidence provenance and limitations. E1. | B13-T02. Withdraw only applicable evidence. Claim becomes UNKNOWN, downstream no longer treats it as grounded. |
| CAND-F03-G02-M01-classify | Editor publishes versioned development dimensions | Taxonomy owns stable source terms and aliases. E0. | B13-T03. Rename a dimension. Existing records keep historical version and mapping. |
| CAND-F03-G02-M02-map | Reviewer maps a source dimension to an approved domain | Mapping owns versioned crosswalk and confidence. E1. | B13-T04. Two possible mappings without disambiguation. Return ambiguous, no forced mapping. |
| CAND-F03-G03-M01-select | Consumer receives appropriate published stage guidance | Stage Catalog owns cohort applicability and source, never identity or permission. E0. | B13-T05. Unknown stage evidence yields generic reviewed fallback, no age inference. |

## Trace and triage

- F03-G01-M01 → pinned inventory → candidate above → B13-T01. Provider guarantees and exact resource classification remain to verify before release.
- F03-G01-M02 → pinned inventory → candidate above → B13-T02. Provider guarantees and exact resource classification remain to verify before release.
- F03-G02-M01 → pinned inventory → candidate above → B13-T03. Provider guarantees and exact resource classification remain to verify before release.
- F03-G02-M02 → pinned inventory → candidate above → B13-T04. Provider guarantees and exact resource classification remain to verify before release.
- F03-G03-M01 → pinned inventory → candidate above → B13-T05. Provider guarantees and exact resource classification remain to verify before release.
- B13-I01 HIGH. Verify authorization and version fencing for the module-specific denial and retry cases above; inherit BI-05/10 and related provider issues. Research and implementation validation remain open.
- Structural check: 5 unique canonical parents, 5 unique candidate and test IDs. Zero runtime executions. Independent review pending consolidation. 48 untouched L3 remain, plus B02 partial slices.
