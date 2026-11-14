# Detailed review 09 · Subscription and operational controls

Candidate specification. Pinned source `63d9ee2ce9279138194bc2df2a8c64ca7195c4a8`. Synthetic fixtures only.

- [Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B25_Design_and_Checkpoint_REVIEW.md) blob `981580ed13a614d854a529450cf50a5da3e052b5`.
- [Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) blob `020ff863d8d15df1591a8d194f9265b9203f58ce`.

## F01-G06-M02 · Entitlements

Entitlements owns the household/account feature projection from verified subscription facts and a versioned product-to-feature mapping. Project exact feature, beneficiary scope, effective window and source billing revision. Unknown, expired or mismatched billing or mapping evidence supplies no new entitlement. Existing verified entitlements are evaluated against their own terms. A cached view cannot outlive scope or entitlement expiry. At release, compare current authorization, effective time and source revision. A purchase or subscription supplies no consent, caregiver role, data grant or Journal access. Promotions, grace periods and beneficiary eligibility need separate policy approval.

## F01-G06-M03 · Subscription Billing Lifecycle

Billing Lifecycle owns the provider subscription link, operation ID, payload digest, verified charge/refund records and subscription facts. Confirm provider identity, payer authority, product, billing terms and scope before dispatch. Record dispatch and result separately. If dispatch may have succeeded but confirmation is unavailable, mark OUTCOME_UNKNOWN and reconcile the original operation before retry. Authorized same-payload replay returns existing result; divergent replay conflicts. A retry after proven non-execution still requires current authority and a provider deduplication guarantee.

Authenticate receipts and bind them to provider account, subscription, operation, currency and applicable charge. Deduplicate by provider event identity within its namespace. Older or causally incomplete events cannot overwrite a newer verified subscription projection. When delivery order is uncertain, reconcile from authoritative provider evidence. A restore request checks current account ownership and provider evidence; it cannot rebind another household's subscription. Refund facts remain distinct from subscription eligibility. If their effect on the current term is undefined by policy, do not infer cancellation, extension or restoration from refund alone. Retail expense transactions remain in checkpoint 08's owner boundary.

## F07-G07-M01 · Operational Console

Console owns operational case, assigned actor and scope, permitted action types, case revision and evidence refs. On assignment, grant minimum access for case purpose; verify before opening a case, reading each sensitive field, or committing a case action. Reassignment revokes the old operator's case access unless separately authorized. Support, billing and finance scopes are distinct. No general child data or Journal browsing. An operator may request reconciliation through the owning service, but cannot mark an unverified charge as settled, assign paid entitlement, override Access Policy, or delete/restore data outside its own authorized workflow. Idempotent actions write a scoped audit receipt. Status and audit reads avoid leaking case existence or protected evidence to an unauthorized actor.

## F07-G07-M02 · Billing & Cost Operations

Cost Ops owns a versioned accounting projection with usage facts, pricing/tariff version, estimated amount, invoice amount and reconciliation status. Store currencies and periods explicitly; do not sum across currencies without an approved conversion policy. A verified amount requires an authenticated invoice or receipt and matching provider, billing period and line identity. Usage-based calculation is an estimate. Missing or mismatched invoice evidence stays UNVERIFIED or DISPUTED, preserving the last verified view with clear period and scope. Replayed evidence adds no duplicate amount. Corrections are versioned and trace to the original line; no unverified overwrite. Cost records do not grant entitlement or authorize a charge. Minimize usage records to scoped metering and cost provenance; no raw prompt, Journal or payment credential in audit.

## Actors, cohorts and release controls

Access Policy makes the final decision per actor, resource, purpose and scope. Payer, beneficiary, case operator, provider callback and finance reviewer have separate authorities. A0/A1 use verified caregiver controls where eligible; A2 guided view of permitted feature state; A3/A4 eligible subject-facing status without inferred purchase rights; A5 verified adult self-management and voluntary family participation. Age never grants access. E0/E1 deterministic design, zero inference. Real child data remains blocked when lawful basis is UNKNOWN. Provider guarantees, price/quota, grace periods, refund policy and operational cost remain open.

| ID | Trace | Fixture and observable result |
|---|---|---|
| D09-T01 | B25-T01/X01 | Verified subscription activates eligible feature, then term expires before release. No stale entitlement is returned. Payer still has no Journal access by purchase alone. |
| D09-T02 | B25-T01 | Billing fact is verified but feature mapping or beneficiary scope unavailable. No new feature entitlement. |
| D09-T03 | B25-T02 | Provider accepts purchase, response lost, same-operation retry then changed payload. Unknown until reconciliation, one charge, divergent replay conflicts. |
| D09-T04 | B25-T02/X02 | Old refund arrives after newer verified renewal and repeats. Record verified refund once. Do not change newer entitlement without applicable policy and current facts. |
| D09-T05 | B25-T02 | Verified restore request references a different household. Deny without revealing subscription existence. |
| D09-T06 | B25-T02 | Signed receipt mismatches product, currency or subscription. Reconcile; no paid or restored projection. |
| D09-T07 | B25-T03/X03 | Operator reassigned while reading a case or committing action. Old actor gets no protected contents and no action commits after revocation. |
| D09-T08 | B25-T03 | Support operator attempts to mark payment settled without authoritative receipt. No settlement, entitlement or access change. |
| D09-T09 | B25-T04/X04 | Estimate has no matching invoice, then valid invoice arrives twice. Remain unverified until match; invoice contributes once. |
| D09-T10 | B25-T04 | Invoice correction and earlier duplicate arrive out of order; one other line in different currency. Preserve correction provenance and separate currencies; no double counting. |

Open technical evidence: provider reconciliation, receipt ordering, atomic entitlement invalidation and operator authorization at commit. No Owner decision required to proceed with design. No runtime or independent re-review executed.
