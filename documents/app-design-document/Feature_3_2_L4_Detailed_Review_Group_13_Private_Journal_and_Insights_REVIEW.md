# Detailed review 13 · Private Journal and insight management

Candidate specification at `b3afe94e7e3224811d0f24cd4f4e2197475b43c8`. Synthetic fixtures only.

- [Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md), blob `ff449269a5dd84563ec0673a8054d04b41ba5da5`.
- [Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md), blob `f128bcb57934f4da6a00959e2b103cae659172c5`.
- [Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md), blob `dfa715531d0456b7e1687d2d6418b7e2d8f821a9`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md). B01-CL-OD-04, B01-PA-OD-01..04 and B01-C-OD-02/07 govern privacy, purpose, withdrawal and audit.

## F05-G04-M01 · Private Entries

Own entry root, immutable content version, subject, creation provenance and server timestamp. Draft review belongs to Reflection Review. An eligible author explicitly submits save or edit with a scoped operation key and canonical digest. Compare current subject authority, base version and root visibility at commit. Accepted save creates one private version and receipt; identical retry returns the authorized original receipt; different content under the same operation conflicts. An edit creates a new version. An older version-specific share grants no access to the new version. Suppression fences all versions and prevents stale edits from restoring the entry.

Text is the E1 candidate path. Optional voice requires checkpoint 11 provider/retention gates and separate eligibility. Capture, transcription and saving are separate actions. Cancel invalidates capture and processing epochs; late results cannot become entries, previews or later AI context. Provider cleanup stays pending absent evidence. Journal content is restricted; operational audit carries only approved opaque refs, version and outcome.

## F05-G04-M02 · Journal Retrieval

Own author-facing query, scoped cursor and authorized projection, referencing content and visibility versions. An eligible author actively searches or selects an entry. Authorize before query and cache access, then recheck before each release. Stale index or cached count cannot disclose suppressed or unauthorized entries. Use opaque cursor binding to subject, query scope and current authorization. Return no protected content, snippets, counts or identifiers on denial. Recipient release is a separate explicit sharing flow under checkpoint 03.

Opening an entry allows only the requested view. Sending selected Journal material into an AI interaction requires separate user action and applicable purpose/data gates. Do not automatically reuse Journal entries in a later session, reports, search outside the Journal, or provider requests. A new household has no access by pairing alone.

## F05-G05-M01 · Structured Insight

Own private derived record, version, derivation purpose, source/claim manifest, uncertainty, evaluation version and lifecycle state. A candidate derivation starts only from an eligible explicit author action and selected versions; no background Journal mining in this proposal. Check purpose, consent and legal authority before fetch or inference. Register complete lineage with Deletion Graph before making a result visible. Before publication and on read, check all root versions, visibility and applicable grant epochs. Missing lineage or stale mandatory evidence holds the entire output unavailable and records minimal quarantine metadata. No diagnostic or definitive personal label from weak evidence. E2 inference remains conditional; deterministic rights and lineage gates use E1. When model or privacy evidence is unavailable, there is no generated insight.

Insight remains private to the eligible author. No profile, caregiver report, future companion memory or external export gains access from derivation alone. Any independently approved downstream use requires separate current purpose and full lineage authorization. Source suppression invalidates dependent results even if a cache or worker has not refreshed.

## F05-G05-M02 · Insight Correction

Own correction/dispute request, scoped operation identity, exact target version, status and minimal provenance. Eligible author may inspect, correct, contest or request deletion. Corrections create a new private version through Structured Insight; preserve author attribution and source lineage. Disputes prevent use as a verified inference while pending. An accepted deletion uses the Retention lifecycle, advances visibility and fences correction workers. Deleting a derived insight alone does not delete original entries. Correction never edits Journal content. A stale correction conflicts or remains for reassessment with no visible overwrite. A late retry or re-derivation of the same suppressed artifact cannot make it visible. Policies for a later explicitly requested new derivation remain open.

## Permission and cohort boundaries

Access Policy supplies final ALLOW/DENY. Purpose-bound Access assesses lawful use. Author identity, device binding, caregiver role and payment state establish separate facts. Caregivers and operators get no inherited private-entry or insight access. A0/A1 direct use is not assumed; where authority is unclear keep data private and use only verified rights support. A2 uses guided private controls if eligible. A3/A4 can use subject-led controls where lawful. A5 uses verified adult self-management. Age supplies no access grant. Unknown legal basis blocks real child data. Protected drafts, entries and derived claims stay out of general audit and test fixtures.

| ID | Trace | Fixture and expected outcome |
|---|---|---|
| D13-T01 | B04-T07 | Save private text, lose response and retry. One version, one receipt, no share or automatic recall. Divergent retry conflicts. |
| D13-T02 | B04-T07, D11-T05 | Cancel voice before save; transcript arrives late. No entry or output released, provider cleanup status independent. |
| D13-T03 | B04-T08, D03-T01 | Edit shared v1 to v2 and race an independent suppression. Old grant cannot see v2; an edit losing to suppression never becomes visible. |
| D13-T04 | B04-T09 | Tombstone a root while search index and cached cursor are stale. Zero affected results, snippets or counts. |
| D13-T05 | B04-T10 | Author opens entry, later starts conversation without selecting it. Authorized Journal view succeeds; later session carries no Journal context. |
| D13-T06 | B04-T09, D01-T05 | Old or new household requests author search after re-pairing. Neither gains access from binding alone; no existence signal. |
| D13-T07 | B09-T02/X02 | Two-root derivation with missing lineage or revoked source authority before release. Entire output held; no cache or report release. |
| D13-T08 | B09-T02 | Derivation requested with unknown purpose evidence or disabled provider. No external call, generated insight or promoted profile fact. |
| D13-T09 | B09-T03 | Competing corrections on same base; author disputes winning version. At most one correction commits; disputed version cannot be used as verified; source entry unchanged. |
| D13-T10 | B09-X03, D03-T11 | Insight suppression commits before correction or replayed derivation. No resurrection; source entry remains separately governed. |
| D13-T11 | D03-T02, B09-X02 | Downstream report is queued when a contributing root's grant is withdrawn. Zero affected derived fields or counts; active authorized author view is evaluated independently. |

Open evidence: approved derivation eligibility, provider transience, lineage completeness, release fencing and correction/delete precedence in runtime. No Owner decision needed to continue design. Zero runtime tests; independent re-review pending.
