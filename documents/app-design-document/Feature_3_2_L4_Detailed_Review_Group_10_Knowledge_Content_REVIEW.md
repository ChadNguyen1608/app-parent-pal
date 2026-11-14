# Detailed review 10 · Knowledge publication and retrieval

Candidate specification. Pinned source `a91afce1a7d32d99d938ddd944b42442f5c7af9e`. Synthetic fixtures only.

- [Feature_3_2_L4_B05_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B05_Design_and_Checkpoint_REVIEW.md), blob `5890d9b8607d1fe250bffd2c6b7f365c0f1468b3`.
- [Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md), blob `cb87b431d58fb9ff1620d426896e0ed18dbb6d29`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md). B01-PA-OD-01..04 apply to access, purpose and lawful basis. B01-C-OD-07 applies to shared audit.

## F07-G01-M01 · Content CMS

CMS owns content ID, immutable version and digest, scope/classification, effective window and serving state. An editor creates a draft. A reviewer decides on its exact submission. A publisher with current scope activates an approved version only when decision, content digest, required evidence and effective window match at commit. Publication records the winning version and advances the serving epoch. A stale base version cannot replace the current pointer. A draft edit never inherits the previous approval. Retirement advances the serving epoch without granting access to retained history. Index and cache are projections; neither may serve a version after its authoritative serving state becomes ineligible. Record opaque IDs and decision refs in shared audit, without sensitive content.

## F07-G02-M01 · Editorial Workflow

Workflow owns immutable submission, draft digest, claim/evidence manifest, review scope and decision receipt. States are submitted, approved, rejected or superseded. Resubmitting the same scoped operation and digest returns the existing authorized receipt; changed input conflicts. An edit requires a new submission. Reviewer scope and source validity must still hold when recording a decision. Concurrent decisions against the same undecided submission yield one effective decision. CMS reads the decision receipt at publish and does not infer publication from approval. Exact separation-of-duties rules and any reviewer quorum remain open; author status alone supplies no review or publish permission.

## F07-G02-M02 · Evidence Provenance

Evidence Provenance owns immutable source revisions, claim-to-source references, required versus supplementary designation, scope, verification/validity metadata and withdrawal epoch. Mark missing verification or unsupported applicability UNKNOWN. A required reference becoming unavailable fences dependent claims even before asynchronous rebuild. A supplementary withdrawal removes that source and its dependent material; release requires a projection with independently valid remaining support. Replacement evidence creates a new manifest for editorial review, with no silent revision substitution under an older approval. Disputed or expired evidence stays out of eligible grounding. Historical provenance remains available only to authorized reviewers under retention policy.

## F07-G01-M02 · Structured Retrieval

Access Policy issues the final decision using current actor, purpose, subject scope and resource classification before retrieval or a cache lookup. Retrieval owns the result projection with content/version refs, eligible evidence refs and serving/evidence epochs. Candidate retrieval classes and query scope derive from trusted policy, never from consumer-supplied widening. Unavailable mandatory state yields no protected result. Recheck current eligibility before return, continuation, cached replay or answer release. A stale result must be rebuilt or withheld; no protected hit counts, snippets or citations on denial. A public-approved corpus does not authorize mixing scoped child context into a shared cache.

For education questions, Pal uses eligible internal results first. Only currently authorized and sufficient evidence counts as internal coverage. The Router owns sufficiency and any permitted fallback under checkpoint 02. An internal no-result or unavailable result does not authorize an external call by itself. If a required source changes while Pal builds a response, revalidate grounding before any answer bytes release. If already delivering a validated answer, stop further affected bytes on revocation. E0/E1 content workflow and retrieval controls; no inference required for these module contracts.

## Actors and cohort applicability

Editor, reviewer, publisher, retrieval consumer and indexing worker require operation-specific scope. Each actor acts only within current rights. A0 caregiver-mediated and A1 supervised display where eligible. A2 guided use. A3/A4 eligible subject-led educational use. A5 verified adult self-management. These interaction patterns do not grant resource access. Unknown age applicability cannot yield cohort-specific material; only separately eligible general material may serve. Real child data with unknown lawful basis remains blocked.

| ID | Trace | Fixture and observable result |
|---|---|---|
| D10-T01 | B05-T01 | Approve v1 then edit to v2. Publishing v2 using v1 approval fails. A separate valid v1 publish requires matching current evidence. |
| D10-T02 | B05-T01/T06 | Two approved eligible versions contend for same serving pointer. Exactly one wins; loser cannot overwrite with stale base. |
| D10-T03 | B05-T02 | Retire version after query but before release, with index and cache still stale. No old content, citation or protected count released. |
| D10-T04 | B05-T03 | Candidate results contain active, draft, expired and wrong-scope versions. Return only the eligible active version with correct provenance. |
| D10-T05 | B05-T04 | Same query by authorized actor and unrelated household; reuse old cursor after revocation. No cross-scope cache hit, protected count or citation. |
| D10-T06 | B05-T05 | Submission accepted then response lost; same digest retry and divergent retry. One submission; authorized identical retry returns receipt, divergent retry conflicts. |
| D10-T07 | B05-T06 | Two reviewers race; one loses authority before commit. Revoked actor cannot decide; at most one effective decision. |
| D10-T08 | B05-T07 | Required claim evidence is UNKNOWN while an unrelated supplementary source is valid. No verified claim or publication eligibility. |
| D10-T09 | B05-T08 | Required source withdrawn after approval and before publish or answer release. Old manifest cannot publish or ground the answer; replacement requires fresh review. |
| D10-T10 | D02-T01/T02/T07 | Internal evidence becomes insufficient and external route is unapproved. No external call or stale answer; independently approved fallback must pass its own gates. |
| D10-T11 | B05-T02/T08 | Index is unavailable during a withdrawal. Serving remains blocked for affected stale results; retry with reconciled current evidence returns only eligible material. |

Open evidence: serving and provenance epoch fences, cache/index rebuild and lag, corpus permissions, required-evidence workflow and applicability criteria. No new Owner decision needed to continue design. Runtime and independent re-review pending.
