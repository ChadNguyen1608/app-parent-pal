# Detailed review 03 · Journal sharing and lifecycle

Source commit `bdec6a6070430acb12379ed16fc5bcf3463eeefe`. Candidate specification. Synthetic fixtures only. Group: F05-G06-M01 Selective Sharing, F05-G06-M02 Deletion Graph, F07-G06-M02 Retention & Export, F01-G06-M01 Lifecycle Controls. Private Entries owns content/version. Structured Insight owns derivation. Access Policy issues the final decision and Purpose-bound Access provides current purpose and legal assessment.

- [Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) blob `cd4aa379cf2e96ee7d23025108171aa470e65ca9`
- [Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md) blob `83ef28d0f608a3fda6c0a10308843afa63d763ac`
- [Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md) blob `ff449269a5dd84563ec0673a8054d04b41ba5da5`
- [Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md) blob `f128bcb57934f4da6a00959e2b103cae659172c5`
- [Feature_3_2_L4_B26_Partial_Slices_and_Cross_Module_Review_REVIEW.md](Feature_3_2_L4_B26_Partial_Slices_and_Cross_Module_Review_REVIEW.md) blob `af863aa29fb02fc2a02e2862ed39aa989d16fae2`

## Author grant and recipient release

A share is an explicit selection of recipient, root, entry version and allowed representation. Record only scoped opaque references, assent/policy version, grant state and epoch. A caregiver role, a newly linked household or an active session does not supply a Journal grant. Editing the entry does not expand an older grant. Each derivative must cite all contributing roots and versions and have current authority for each before release. Missing or inconsistent lineage makes the entire derivative unavailable. Use generic denial for unauthorized actors, with no counts or existence hints.

Withdraw commits a new grant epoch. Check it at disclosure, including on cached results, worker retries and each streamed chunk. Cancel or discard work bearing a stale epoch. The original remains available to the eligible author if there is no tombstone. Default is no separate notification. If the child explicitly selects notification, authorize that delivery independently using approved static content with no Journal details. An unavailable notification never delays withdrawal.

## Deletion state and authority

Lifecycle Controls owns the request surface and status projection. Retention owns acceptance, policy/deadline, visibility tombstone and completion evidence. F05 Deletion Graph supplies lineage, and store owners perform scoped purge. A request needs current requester authority and explicit confirmation. Abandoning before acceptance creates no tombstone. Acceptance atomically creates request receipt, accepted timestamp, policy/deadline evidence, tombstone and new visibility epoch. Retry can return the existing receipt to a currently authorized requester and cannot change acceptance time or deadline. Confirmed acceptance has no user or support withdrawal or restore path, subject to verified legal requirements. Revoke-share does not initiate deletion.

State progression is confirmed request → accepted/suppressed → purge pending → verified complete. Failed or missing evidence stays pending with scoped failure status. A verified lawful hold applies only to the identified copies and never restores visibility. Legal configuration must specify the applicable clock start, deadline, controlled-store scope and any verified exceptions. The 60-day product baseline cannot serve as a production default while legal applicability is unverified or conflicts. Keep the legal blocker from the independent review open.

## Copy, export and restore contracts

Graph coverage includes content stores, derived views, search/embeddings, export staging, caches and backup restore paths. Before publishing a derivative, register source refs and compare current root visibility versions. Duplicate edges resolve to one scoped ref. Cycles, uncovered stores or incomplete provenance block verified completion. Store purge commands carry scoped opaque ref, deletion ID and policy/deadline evidence. Record idempotent receipts without raw Journal data. An unverifiable backup or delayed processor response prevents verified completion and is tracked under the applicable deadline. Restore service reapplies tombstones before any serving path becomes available. A staged export validates all subject/visibility epochs again at release. Stale artifacts are held for rebuild, never returned on the original URL or cache.

## Actors and cohort profiles

| Cohort | Interaction | Authority and fallback |
|---|---|---|
| A0 | No assumed direct sharing | Private by default. Lawfully authorized rights support only. |
| A1 | Supervised interaction if approved | No sharing authority assumed. Use verified rights support when eligibility is unclear. |
| A2 | Guided author selection and withdrawal where eligible | Keep private if scope or lawful eligibility is unknown. |
| A3 | Guided or author-led controls | Evaluate recipient grant separately from author rights; protected request support remains available subject to policy. |
| A4 | Author-led controls where eligible | Scope disclosures to explicit selections. Verify any representative request. |
| A5 | Verified adult self-management | Own grants and rights requests. Family participation is voluntary. |

Age does not create consent or eligibility. Human response is outside initial release scope. E0/E1 lifecycle and policy controls require zero inference calls. G-Legal remains BLOCKED for real child data; store completeness and restore feasibility remain UNKNOWN.

## Acceptance criteria and proposed oracles

| ID | Fixture | Expected state and outward result |
|---|---|---|
| D03-T01 | Recipient has a valid v1 grant; author creates v2; same recipient moves households | No v2 or inherited household access. Any existing explicit v1 grant requires its own current eligibility. |
| D03-T02 | Worker assembles a two-root report; one grant is withdrawn before release | No stale report or counts. Author still sees eligible original. Default produces no notification. |
| D03-T03 | Child explicitly selects withdrawal notification, then delivery policy denies it | Withdrawal still takes effect once, zero notification delivered. |
| D03-T04 | User abandons confirmation, then submits and retries an authorized accepted request | Abandonment produces no tombstone. Acceptance produces one receipt and one epoch change with unchanged dates on retry. |
| D03-T05 | Concurrent Journal edit, staged export and stale search cursor race with acceptance | If suppression commits first, no late edit can publish, no stale export or search data releases. |
| D03-T06 | Purge partially fails then repeats across two stores | Completed copy action is idempotent; missing receipt keeps status pending until verified. |
| D03-T07 | Restore a backup with a suppressed root and an unregistered derivative | No restored data serves before reconciliation. Unknown lineage stays quarantined; missing coverage blocks verified completion. |
| D03-T08 | Verified hold for one copy and unrelated pending worker | Only held copy's purge is withheld; all copies remain suppressed. A pending worker cannot claim verified completion. |
| D03-T09 | Synthetic verified policy deadline is earlier than product baseline | A later scheduled purge fails the deadline gate. In unknown policy configuration, real-data release stays blocked. |
| D03-T10 | Unrelated observer requests deletion status or replays a valid URL | No request existence, content or artifact reference disclosed. |
| D03-T11 | Accepted deletion, then user withdraws, old device syncs or support tries restore | Tombstone and original deadline preserved. No source or derived content is republished. |

Design review only. Recheck legal authority, backup receipts, concurrent release fencing and store inventory before independent acceptance. Continue with plan change/approval/history as the next detailed group.
