# FR-01 — Owner-approved Parent PIN Unlink and Re-pairing

Date: 2026-11-14. Owner gate: APPROVED_OPTION_A. Spec remediation: PROPOSED_FOR_INDEPENDENT_REVIEW (not Final L4, not implemented).

Owner explicitly decided: Parent PIN protects Unlink in Child App; notify Parent App; same-household re-pair through normal flow; pairing with a different household requires a separate verification.

## Owner-approved contract

1. Linked-child Settings/Unlink require a Parent PIN controlled by authorized caregiver, plus current account authority and explicit confirmation. A child's knowledge of a device session or access to Settings cannot complete an unlink without the required protected verification. Parent PIN is an additional check, not a substitute for server-side authorization, current binding epoch, legal basis or consent. Do not let a caregiver PIN override a verified self-managed adult age 18+.
2. On effective unlink, generate a minimal authorized Parent App notification and an audit record. Do not include PIN, pairing ID, Journal text or private reason. Failed notification delivery must be retried/visible without reversing a successfully committed unlink; delivery guarantee/fallback and exact recipients beyond the eligible caregiver remain security/UX details to validate.
3. Re-pair into the same household after unlink can use the ordinary fresh Child App pairing-ID flow and current applicable permissions. Old tokens and stale binding receipts remain invalid. Unlink must not delete child data or grant Journal access.
4. Pair into a different household only after a NEW, child-specific verification establishing that the receiving adult is authorized to manage this child; a valid adult account, household membership and knowledge of fresh pairing ID are NOT enough. If evidence absent, conflicting, expired or unavailable, no new effective binding, membership, child grant or data disclosure. A restricted pending verification state may exist with zero protected access.
5. Active household transfer is forbidden; authorized unlink and new pairing are separate operations. A household B binding never imports A's old grants, data, roles, private Journal or session authority.

## Remaining unspecified details (not implicit Owner policy)

- Exact PIN setup/rotation/recovery procedure, minimum entropy, attempt limit and cryptographic implementation: System Design/security validation.
- How new household verifies relation/authority concerning this child; proof level, dispute handling, exceptions and whether a verified third party participates: NEEDS_POLICY/LEGAL/UX DESIGN. Do not invent mandatory government ID or original-household approval.
- Authorized notification recipients, retry and backup delivery policy; ensure no protected child information leaks. No guarantee notification is read before unlink.
- Offline and server-loss semantics: proposed fail-closed on authoritative unlink; do not treat local UI state as effective revocation.

## Proposed synthetic test oracles

| ID | Scenario | Expected |
|---|---|---|
| FR01-T01 | Child tries Unlink without valid protected Parent PIN | DENY effective unlink; binding epoch unchanged |
| FR01-T02 | Wrong PIN or bypass via recovery/session | No unlink or sensitive disclosure; rate-limit and server guard |
| FR01-T03 | Authorized parent supplies PIN and confirms; response lost and replayed | Exactly one unlink and epoch advance, idempotent receipt |
| FR01-T04 | Unlink commits, Parent App push fails | Unlink remains effective, durable minimal notification retry; no Journal content in notice |
| FR01-T05 | Same-household re-pair after effective unlink with fresh ID | Permitted under ordinary current authorization; no stale ID |
| FR01-T06 | Receiving adult of household B authenticated, has code, but child-specific authority unknown | No binding or child grants; may remain pending verification without private content |
| FR01-T07 | New household B has independently verified child-specific authority after unlink | New pairing may commit under fresh Access Policy checks; A's data/grants never imported |
| FR01-T08 | B tries to pair while A binding is active | DENY active-link transfer, even with code |
| FR01-T09 | Offline, forged local PIN success, stale unlink receipt | No server-effective unauthorized unlink |
| FR01-T10 | Unlink and new link followed by Journal read | No automatic Journal disclosure, deletion or inherited consent |
| FR01-T11 | Verified adult 18+ independently manages own account | Parent PIN does not create caregiver control over adult owner |

## FR-01 status

- FR-01A (unauthorized unlink) = OWNER_POLICY_APPROVED / SPEC_AMENDMENT_PROPOSED / INDEPENDENT_RECHECK_PENDING.
- FR-01B (unverified new-household pairing) = OWNER_POLICY_APPROVED / VERIFICATION_METHOD_OPEN / INDEPENDENT_RECHECK_PENDING.
- Keep original HIGH independent-review finding OPEN until reviewer checks changed contract and residual risks. No runtime test, final L4 acceptance, canonical Blueprint changes or merge.

Precedence: this Owner decision supersedes the unrestricted Child App unlink and insufficient new-household verification assumptions in earlier candidate designs, but preserves previous policy permitting authorized new-household re-pair after effective unlink.