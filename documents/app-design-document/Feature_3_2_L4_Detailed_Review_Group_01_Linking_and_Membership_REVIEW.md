# Detailed review 01 · Child App linking and membership

Source snapshot `d051681a0063b5bac1d7aee19ad29bd005fe4238`. Authority: [Owner follow-up](Feature_3_2_L4_Independent_Review_Owner_Followup.md). Candidate specifications and synthetic oracles.

Scope: F01-G02-M01 Family Structure, F01-G02-M02 Member Relationships, F01-G01-M02 Session Security. Family Structure owns the current Child App binding. Membership owns household participation. Session Security attests identity/freshness. Access Policy is final, with fresh purpose/consent/legal evidence where required. Protected operations are E0/E1.

## Binding contract

Child App requests a distinct pairing ID from its own authenticated flow. Proposed mechanics: one active opaque, expiring, single-use ID per eligible child app identity/epoch, with server validation and throttled attempts. A code exposes no profile data and gives no authority by itself. Raw code stays out of logs. Whether the app creates randomness locally or requests it from the service, precise TTL and recovery proof remain technical choices. A verified guardian enters the ID and selects a household within their current authorized scope. Confirm any required child-side proof before commit. Atomically compare ID state, child identity, current binding epoch and guardian authority, then consume the ID and establish one binding. A retry of the same authorized operation returns the committed result; conflicting input gets a generic conflict with no private details.

Child App unlink checks current authority and binding version, then revokes the binding and advances its epoch. Old ID, queued actions and prior permissions tied to the binding fail on their next protected commit or release. Independently authorized account functions can remain available. A new pairing can target A or a different household B after effective unlink, using a fresh ID and current authorization. A current A binding cannot be moved in place. The new B binding cannot carry A's history, data, roles or grants. Retain historical evidence only under applicable policy. Old-household data, including an independently authorized subject access path, remains subject to its own policy.

Member invites cannot establish or replace a Child App binding or provide child-participation authority around pairing. Access Policy evaluates independently authorized membership actions; detailed multi-household membership policy is still open. Session renewal cannot re-create a binding. Account recovery can re-establish identity evidence but cannot bypass active-binding checks. A disputed identity or unknown current authority denies affected mutations, while independently authorized revocation remains possible.

## Data and cohort applicability

Binding facts: opaque child/app and household refs, state, epoch, provenance and server time. Pairing artifact: digest, intended child/app ref, issue epoch, expiry and consumption state. Session and membership records reference current state through scoped interfaces. A0 caregiver-mediated, A1 supervised, A2 assisted, A3 guided, A4 subject-led and A5 verified adult self-management are conditional interaction patterns. Legal authority, direct child interaction and assisted unlink require applicable evidence. No cohort implies a permission; unresolved authority routes to scoped verification.

| Oracle | Fixture | Expected outcome |
|---|---|---|
| D01-T01 | Child App issues an ID, guardian A verifies and matches | One active A binding, one consumed ID. ID lookup alone discloses no profile. |
| D01-T02 | Guardians A and B try the same ID concurrently | At most one commit. Losing operation creates no grant, membership or binding and learns no protected details. |
| D01-T03 | Attempt pairing B with A active, including recovery or a new profile target | Denied. A binding and grants unchanged. Membership path supplies no binding or substitute authority. |
| D01-T04 | Child unlinks A, response lost; stale A read and mutation then retry | One epoch advance; stale read releases zero protected bytes and stale mutation commits nothing. Authorized retry returns original result. |
| D01-T05 | After unlink, B tries an old ID, then an eligible fresh ID | Old ID denied. Fresh pairing may establish B. No A data, grants or history included. |
| D01-T06 | ID expires at commit or guardian loses authority before commit | No binding or side effect. Failure remains generic. |
| D01-T07 | Refresh old session or resume old offline action after B pairing | Independently authorized session functions may proceed; A-scoped operation denied. |

H1/M3 design amended. Runtime proof of atomic transitions, version fences, identity assurance and legal scope remains open. No runtime or independent re-review performed.


## 2026-11-14 — FR-01 Owner decision superseding prior candidate Unlink/Pairs

Authoritative business decision: [FR-01 Parent PIN Unlink and Re-pairing](Feature_3_2_L4_FR01_Parent_PIN_Unlink_and_Repairing_Owner_Decision_APPROVED.md). Prior wording in this candidate document that Child App may unlink without a caregiver-controlled PIN, or household B may pair from a fresh code solely by virtue of B adult authentication, is **superseded**. For linked-child Unlink require authorized Parent PIN, explicit confirmation and current server-side Access Policy. On effective unlink, notify eligible Parent App and preserve unrelated child data/Journal. Same-household re-pair retains normal current-auth flow. Different-household re-pair requires independently verified **child-specific authority of receiving adult**, beyond a valid account or pairing ID; missing proof denies the binding. Active link transfer remains denied; no A grants/data migrate to B. PIN recovery details, B proof method and recipient notification policy still require design/verification. Test references FR01-T01..T11 are proposed, not executed; independent Claude focused re-review required. Historic original candidate prose retained as source history only.


## FR-04 boundary clarification — multi-household adult membership (no policy invention)

An adult may have independently valid memberships in multiple households, but **membership in household B never expands access to the child bound to household A**. Every protected read, notification and mutation requires the exact active child/household/resource scope, current effective permissions, purpose and legal evidence at release/commit; household switch, mixed cached list/pagination, account recovery and cross-household invitation cannot move or copy A-bound grants. When an actor is authorized in both households, the currently selected household is a **scoping input only**, not a child-rights proof. A request missing explicit household scope denies or returns a generic no-content result. The detailed product policy for multihousehold member invitation and cross-household identity disputes remains OPEN (FR-04) and is not presumed approved here.

**FR04-T01:** Adult X belongs to A and B, child bound to A; X switches UI to B and lists child records -> A-bound child is absent and A's private refs do not leak. **FR04-T02:** Old A cache/notification payload is replayed in B -> no A bytes at B release, recheck scope and version. **FR04-T03:** B member invite for A child -> does not replace binding or grant child rights. These are proposed spec tests only.
