# Detailed review 14 · Child identity and verification

Candidate specification. Source `37eb5290924568de47e45c2edcb6875f1148e12d`. Synthetic fixtures only.

- [Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md), blob `ff449269a5dd84563ec0673a8054d04b41ba5da5`.
- [Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md), blob `83ef28d0f608a3fda6c0a10308843afa63d763ac`.
- [Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md), blob `06e607e91d5d382907eee1636b5cf4b843f6bf6c`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md). B01-CL-OD-01 distinguishes pairing from guardian authority. P6-AP-OD-04 governs verified adult self-management. B01-PA-OD-01/04 govern authorization and legal basis.

## F01-G03-M01 · Core Identity

Own stable opaque profile reference, declared/verified profile facts, evidence references and per-fact revisions. Account, binding, membership and caregiver rights have separate owners. Derive creation scope from current authorization; a client-supplied household identifier is not proof. Accepted creation uses a scoped operation and canonical digest. Identical authorized replay returns the receipt; divergent payload conflicts. Potential duplicates or ambiguous records remain separate pending verified resolution; no automatic merge or cross-household lookup. A new household binding after effective unlink changes the active association for binding-dependent authorization. It does not migrate historical data, assign caregiver rights or duplicate the child identity.

Separate DECLARED, VERIFIED, UNKNOWN and DISPUTED evidence. A projection returns only permitted fields, provenance type and current version. A declaration can support a permitted low-risk experience but not satisfy a verified-age gate. Cohort recommendation is an interaction choice, not authority. Unknown or conflicting evidence cannot establish adult status or unlock age-restricted behavior. A verified status requires current qualifying evidence under applicable policy, without exposing restricted evidence to consumers.

## F01-G03-M02 · Profile Integrity

Own scoped correction ID, target fact and base revision, reason, restricted evidence reference and disposition. Eligible subject or verified representative may propose; a currently authorized verifier records the decision. Proposed changes remain pending. Capture only evidence needed for the approved purpose. Scope evidence access separately from profile display. At effective change, Core Identity compares current verifier authority, decision, base revision, evidence and provenance, then writes one new fact revision and advances the relevant evidence epoch. An earlier value remains historical under lawful retention. Stale or disputed requests require re-evaluation. Two competing decisions against the same base cannot both change the effective fact.

Cache and queued operations must recheck evidence and current policy before protected commit or release. A verified transition to adult self-management follows current policy and access re-evaluation, without silent caregiver access continuation. A later disputed or corrected age claim does not automatically assign caregiver control. Missing evidence blocks authority changes that depend on it; independently authorized operations remain subject to their own scope. Evidence thresholds, exact documentation, retention and dispute remedies stay open.

## F01-G01-M01 · Account Access

Own account authentication and credential recovery proof. Authenticated result carries opaque account ref, proof level, freshness and security epoch. Public authentication/recovery outcomes do not reveal account or child profile existence. Require an eligible scoped recovery operation with current proof and expiring single-use evidence. Consume proof and change credentials/security epoch at one guarded transition. Replay uses the same scoped operation and digest; unknown outcomes require reconciliation. Session Security consumes the new epoch and denies stale credentials before protected use. Recovery cannot create a binding, change age, grant guardianship or bypass the active-household guard. A caregiver claim on its own is insufficient recovery proof. Disputed cases may enter separately authorized support verification without changing account state.

## Actor, data and cohort boundaries

Profile initiator, subject, representative, verifier and support operator need explicit action scopes. Access Policy is final. Verification attachments are restricted, and shared audit records only opaque refs, outcome categories, versions and time. A0/A1 use conditional representative or supervised interactions. A2 uses assisted correction; A3/A4 can initiate subject requests within verified eligibility; A5 uses verified self-management. Age does not grant proof or access. E0/E1 core controls, no inference. Real child personal data with unknown lawful basis stays blocked.

| ID | Trace | Fixture and expected outcome |
|---|---|---|
| D14-T01 | B04-T01 | Lost create response then identical and divergent replay. One profile, original receipt to authorized actor, conflict for changed payload. |
| D14-T02 | B04-T01, D01-T05 | Unrelated household requests profile details; then eligible fresh pairing after unlink. First learns nothing; second adds eligible binding only, with no transfer of old data or rights. |
| D14-T03 | B04-T02 | Self-declared age conflicts with verified evidence or required proof is missing. No unsupported adult or age-dependent authority. |
| D14-T04 | B04-T03 | Correction pending and stale client retries. Effective fact unchanged; divergent replay cannot replace original evidence. |
| D14-T05 | B04-T04 | Two conflicting corrections race on same base version. At most one effective update; stale decision goes to re-evaluation. |
| D14-T06 | B04-T04 | Fact correction or authority revocation occurs before protected release. Old evidence/cursor discloses nothing; independently authorized reread uses current facts. |
| D14-T07 | P6-AP-OD-04 | Adult status verified, then legacy caregiver tries existing authority. Apply verified adult policy; no inherited permission. A later dispute does not grant caregiver control. |
| D14-T08 | B03-T01 | Invalid proof for existing and unknown accounts. Generic failure in both; no authenticated state. |
| D14-T09 | B03-T02/T03 | Concurrent valid recovery and caregiver-only claim, then lost-response retry. At most one recovery and epoch advance, old credentials fenced, caregiver-only claim has no effect. |
| D14-T10 | D01-T03/T07 | Recovered account attempts to replace an active link or read verification attachments without scope. No transfer or protected evidence released. |

Open evidence: identity/age proof thresholds, duplicate and dispute policy, retention scope and atomic recovery/revocation. No Owner decision needed to continue design. Runtime tests and independent re-review pending.
