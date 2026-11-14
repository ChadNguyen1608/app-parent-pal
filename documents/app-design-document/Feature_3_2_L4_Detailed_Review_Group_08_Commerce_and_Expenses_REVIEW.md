# Detailed review 08 · Commerce and education expenses

Candidate specification. Pinned source `c1ae07561fffb03e45f842aa7c34371f06437383`. Synthetic fixtures only.

- [Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md) blob `daad24765e949cce0d588629c37be84975a6b9d8`.
- [Feature_3_2_L4_B24_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B24_Design_and_Checkpoint_REVIEW.md) blob `d4689e1945c5dc396ef553285a8695d7d41560cb`.
- [Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md) blob `981580ed13a614d854a529450cf50a5da3e052b5`.

## F08-G05-M01 · Commerce Catalog

Catalog owns the offer version, merchant reference, exact amount and currency, expiry, eligibility, and sponsorship disclosure. An authorized publisher makes an eligible offer discoverable. A draft, withdrawn or expired offer cannot start checkout. Discovery shows sponsorship alongside the offer. Recommendation and preference scopes stay with their respective owners. The catalog does not disclose private preferences or child records to a merchant.

Checkout binds the exact merchant, offer version, amount, currency and disclosure shown to the purchaser. Before initiating payment, compare that snapshot with the current offer. A material change requires fresh confirmation and applicable expense reapproval. A later catalog change does not rewrite the terms of a transaction already sent; reconcile against the original confirmed snapshot.

## F08-G05-M02 · Transaction & Conflict Controls

Transaction owns purchaser scope, confirmed terms, conflict-check evidence, operation identity, provider reference, and verified payment/refund facts. Check current purchaser authority, any required approval and applicable conflict/disclosure rules before external dispatch. If mandatory evidence is unavailable, keep payment unavailable. Conflict thresholds and merchant rules require separate policy evidence. Send only the authorized payment payload, without child profile or Journal content.

Track CREATED → CONFIRMED → DISPATCHED → PAID or FAILED when verified evidence establishes the outcome. A timeout after potential dispatch moves the intent to OUTCOME_UNKNOWN. Reconcile against the original provider operation. Do not dispatch again while the outcome is unknown. After verified non-execution, a retry requires fresh authority, unchanged confirmed terms and a provider mechanism that prevents duplicate payment. An authorized replay returns the same verified outcome; changed payload under the same operation identity conflicts.

A payment fact requires verified provider evidence matching the operation, merchant, amount and currency. An authenticated but mismatched receipt goes to reconciliation without setting PAID. Deduplicate callbacks and apply verified causal order. If a refund arrives before the associated payment, hold the projection for reconciliation. Once both are verified, the current projection reflects the net outcome. Preserve separate payment and refund facts rather than overwriting history.

## F08-G06-M01 · Education Budget Planning

Budget Planning owns a scoped scenario, version, period, currency, planned allocations and provenance. A scenario is a planning artifact. Saving it neither authorizes a purchase nor sends payment. Compare current editor authority and base version at save. A stale write conflicts. A retry with identical operation and payload returns the existing authorized save. No implicit currency conversion. Distinguish planned, approved and settled amounts using references to the respective owners. Unverified or ambiguous settlement remains unknown in the projection. Over-budget handling, caps and enforcement remain policy decisions; do not infer an automatic block or override from the scenario.

## F08-G06-M02 · Expense & Approval Management

Expense owns the expense request, exact proposed terms, scope, approver evidence, version and status. An eligible requester submits. A current authorized approver may approve or reject the exact request version. Observers have no approval by role. Material amount, currency, merchant or purpose changes invalidate the old approval for dispatch and require a fresh decision where applicable. Do not infer self-approval rights, approval thresholds or mandatory approval from household membership.

Expense projects approval separately from payment. APPROVED means an authorized decision was recorded. PAID and refund states derive only from verified transaction facts for the same request terms. A changed budget scenario does not rewrite a recorded payment. Subscription charges and entitlements remain owned by F01 billing. Finance operations may consume scoped receipts; their aggregate projections confer no purchase or child-data authority.

## Permission and cohort boundaries

Access Policy supplies the final decision for actor, role, resource, purpose and scope. Purchaser, expense approver, catalog editor and finance reviewer require separate operation permissions. Compare authority at commit and dispatch and before releasing receipts. Generic denials reveal no transaction, household or budget existence. Audit keeps scoped refs, decisions and timestamps without payment credentials or raw private content.

A0–A1 use verified caregiver interaction where applicable. A2 may participate in a guided budget discussion if permitted. A3–A4 may propose an expense if eligible, with purchase and approval rights separately verified. A5 uses verified adult self-management and voluntary family sharing. These are conditional interaction patterns. Keep any unverified purchase eligibility unavailable. Candidate controls use E0/E1 and no inference. Provider guarantees, real-data eligibility, fees and legal terms remain unverified.

## Acceptance criteria and synthetic oracles

| ID | Trace | Fixture and observable result |
|---|---|---|
| D08-T01 | B23-T04 | Authorized viewer opens an active sponsored offer. Disclosure is visible with the offer. A withdrawn or expired offer cannot start checkout. |
| D08-T02 | B23-X04 | Price changes after confirmation and before dispatch. Zero provider calls under old terms; require confirmation of current terms and reapproval if applicable. |
| D08-T03 | B24-T01/X01 | Provider accepts then response is lost. Outcome remains unknown until reconciled; verified acceptance yields one payment and no second dispatch. |
| D08-T04 | B24-T01 | Retry while provider result cannot be verified. No duplicate dispatch and no success claim. Divergent payload under original operation ID conflicts. |
| D08-T05 | B24-X03 | Verified refund arrives before matching payment evidence. Hold projection for reconciliation. After verified linkage, a full refund produces REFUNDED; duplicate receipts do not change net amount. |
| D08-T06 | B24-T03/X03 | Matching approval but wrong currency or merchant in receipt. Approval remains recorded; no PAID projection. |
| D08-T07 | B24-T02/X02 | Two edits contend for one scenario version and the second actor loses scope. At most one authorized save; no purchase, authorization or debit from scenario changes. |
| D08-T08 | B24-T03 | Observer attempts approval, then an eligible approver approves exact version. First has no effect; second produces APPROVED with zero payment facts. |
| D08-T09 | B24-T03, B23-X04 | Merchant changes after expense approval. Old approval cannot authorize dispatch under new terms. |
| D08-T10 | B24-T01, B25-T01 | Authorized payer purchases an item; unrelated household asks for receipt; payer requests child Journal. Receipt remains scoped; neither payment nor subscription creates Journal authority. |
| D08-T11 | B23-T04, B24-T01 | Mandatory conflict or disclosure evidence is unknown. No dispatch and no transaction success claim. |

Open evidence: merchant/processor event ordering and reconciliation guarantees, applicable purchase and disclosure policies, budget enforcement and approver authority where not yet specified. No new Owner decision needed to continue design. No runtime or independent review executed.


## 2026-11-14 Owner gate overlay — OD-02

[Owner-approved OD-02](Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md) excludes sponsored listings, offers, rankings and purchase entry-points from **all minor-facing A0–A4 (under 18) views in initial release**. Prior provisional wording allowing minor-facing sponsored content with only disclosure is superseded. Parent/verified-adult surfaces still require current access, suitable disclosures and commercial/legal authorization. Enforce recipient and content sponsorship filters at release, cache, paging and AI response boundaries. Cases OD02-T01..03 proposed and not independently verified.
