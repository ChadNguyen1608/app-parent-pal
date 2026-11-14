# Detailed review 07 · Third-party data and referrals

Candidate specification. Pinned source `e9fb67c7c73c65c7274290dd46776bebaabffa70`. Synthetic fixtures only.

- [Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md) blob `b283251233b08183d71570f03c81f6c80492fd8c`.
- [Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md) blob `daad24765e949cce0d588629c37be84975a6b9d8`.
- [Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md](Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md) blob `9ced7c8971c73c06d857dcef8a5c946e5aa76a98`.

## Trust boundaries and module contracts

| Module / existing candidate | Entry, ownership and state | Commit, denial and recovery |
|---|---|---|
| F08-G01-M01 · connect | School Data Connectors owns connection ID, verified institution/provider ref, subject mapping, allowlisted data classes, purpose/consent refs and connection epoch. An eligible actor requests a connection. Incomplete verification stays pending; a verified, authorized connection becomes active. | Gate scheduled fetches and callbacks against the same current scope. Revocation fences new fetches and queued jobs. Late responses cannot publish. Provider outage leaves a scoped pending/error receipt without claiming data was imported. |
| F08-G01-M02 · review | School Data Review owns staged record and disposition against an exact staged version, source attestation and canonical target version. Eligible subject or verified representative reviews the record. | Conflicting identity or evidence remains quarantined or staged with no promotion. Approved disposition requests promotion from the canonical data owner, who rechecks target version and authority. Changed input requires fresh review; identical retry cannot promote twice. A school channel supplies provenance only. Teacher verification requires separately established evidence. |
| F08-G02-M02 · refer | Expert Referral owns request, exact recipient and allowlisted payload version, requester evidence, authorization version, receipt and state. Requester sees and explicitly confirms what will be sent. Recipient eligibility comes from Expert Discovery or separately approved provider evidence. | Verify recipient, purpose, scope, legal basis and authorization at dispatch. Never auto-send because of a safety trigger. If dispatch outcome is unknown, reconcile the same external operation before retry. Without a verifiable reconciliation path, keep outcome unknown. A later revocation prevents further sends. An earlier confirmed disclosure remains subject to the applicable downstream rights workflow. |
| F08-G04-M01 · consent | Device Consents owns connection scope and revocation epoch. Consent Ledger owns consent evidence. Record device/provider, subject, eligible data categories and purpose; verify each independently. | Withdrawal commits epoch advance; prior fetch or import permissions expire at the boundary. Re-grant creates a new epoch and cannot revive earlier jobs. Independent authorization is required for any remaining access to data previously collected. |
| F08-G04-M02 · import | External Data Import owns authenticated source envelope, staged record, provider namespace, source event ID, scoped digest and receipt. Data owner owns promotion. An eligible import may stage for review. | Recheck source, subject, scope, legal basis and epoch before staging and promotion. Identical authorized retries return original receipt. Different payload under same scoped key conflicts. Unmapped subjects receive no automatic association. Suppressed data and stale callbacks cannot republish through import. |

## Shared controls and data lifecycle

Access Policy issues final authorization. Purpose-bound Access assesses purpose and lawful basis before provider calls, reads, writes and release. Consent evidence, account association, provider credentials and receipt each establish distinct facts. A connection alone supplies no standing permission to repurpose data. Current school or device epochs fence queued work and callbacks. Use separate operation scope for referral dispatch versus import. Persist scope and version at each transition. Ensure user-visible receipts describe the confirmed state only. Authorization at dispatch and each release is required; verify race semantics before implementation. Route withdrawal/deletion requests through applicable lifecycle and retention contracts. Scoped audit can record action, provider reference, outcome and policy version with no raw student record, device credential or Journal material.

All proposed controls are E0/E1. Production provider eligibility, approved data classes, external purpose/legal terms, provider-side deletion evidence and operational costs remain unverified. Real child personal data remains blocked when legal basis is UNKNOWN. Existing approved no-human-response safety scope still applies; user-initiated referrals in this group are a separate feature design and confer no release authorization.

## Actor and cohort applicability

A0–A1 use only an authorized representative when the provider and policy permit. A2 uses guided review with current authority. A3–A4 may review or request a referral where policy independently permits the actor and exact data. A5 uses verified adult self-management and voluntary sharing. Import workers and provider callbacks receive only a scoped operation identity. Teachers, schools, experts and device providers get no automatic rights to Family or Journal data. Unknown eligibility keeps the protected action unavailable, with a generic status that exposes no other household or subject.

## Acceptance criteria and synthetic oracles

| ID | Trace | Fixture and observable result |
|---|---|---|
| D07-T01 | B22-T01 | Connect eligible actor and exact provider mapping. One active connection. Retry returns the same authorized result. Missing provider or legal evidence leaves no active fetch path. |
| D07-T02 | B22-X01 | Withdraw after fetch starts but before staging. Already-sent request is recorded accurately; response cannot create visible staged or canonical data. |
| D07-T03 | B22-T02/X02 | Review conflicting subject or stale target version. No canonical overwrite; record stays staged for reassessment. Valid repeat promotion produces one canonical update. |
| D07-T04 | D05-T04 | School feed asserts teacher verification without required attestation. Eligible user sees source provenance without a teacher-verified label. |
| D07-T05 | B22-T04/X04 | Confirm referral, then revoke or change recipient before dispatch. Zero external payload. Retry under stale authorization also sends nothing. |
| D07-T06 | B22-T04 | Eligible referral dispatch loses response. Mark outcome unknown and reconcile using original operation. With evidence of accepted dispatch, no second send; without evidence and safe reconciliation, no blind retry. |
| D07-T07 | B23-T02/X02 | Withdraw and then re-grant a device connection. Old queued job is denied; a newly authorized job uses the new epoch and scope. |
| D07-T08 | B23-T03/X03 | Replay authenticated callback identically then with changed payload. One staged fact; divergent retry conflicts. Unrelated household receives no receipt or existence signal. |
| D07-T09 | B23-T03, D03-T07 | Subject is unmapped or data suppressed while callback is pending. No auto-link, active staging or promotion. No deleted data restored. |
| D07-T10 | B01-PA-OD-02/04 | Provider scope covers education but purpose switches to marketing, or lawful basis is UNKNOWN. No provider call, protected read or write. |
| D07-T11 | Owner safety follow-up | Safety trigger occurs with no user-initiated referral. Only applicable approved child-facing advice may appear. Zero referral, external contact, human case or disclosure. |

Open evidence: provider sandbox receipts, issuer verification, callback replay and release fencing, verified downstream retention/delete capabilities. No new Owner policy decision needed to continue design. Deployment eligibility and provider selection remain open. No runtime or independent tests executed.
