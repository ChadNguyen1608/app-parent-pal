# Parent-Pal · Independent review disposition

Reviewed snapshot `9aa4c8a08cc10fb0771303299843cb7ab8d83b46`. Source: Owner-supplied Claude report, 0 CRITICAL / 4 HIGH / 4 MEDIUM / 3 LOW. This disposition records candidate amendments and outstanding decisions. The supplied review covered documents and structural checks, with zero runtime tests. All changed clauses await independent re-review.

| Finding | Disposition |
|---|---|
| H1 | Owner scope confirmation pending. Interim fail-closed design: check known child account association at both pairing and member acceptance, even after unlink and when target profile ID differs. Missing/conflicting association evidence denies cross-household mutations. Family Structure is proposed owner of the association. New permanent account exclusivity policy awaits Owner. |
| H2 | Owner confirmation pending for AI scope beyond safety. Human-response scope remains undecided. Keep strict draft gate pending clarification. |
| H3 | Candidate amendment: within authorized processing, run approved deterministic safety rules before the AI scope gate. An eligible safety trigger can select reviewed static support independently of AI scope. No generated response, automatic family disclosure or human case follows from this contract. Eligibility/content and live routing stay subject to approved safety policy. |
| H4 | Release blocker. Article 5(4) of [Decree 356/2025/NĐ-CP](https://chinhphu.vn/?classid=0&docid=216387&pageid=27160) sets 2 working days to respond, 20 days for execution and a 30-day branch involving processors/third parties, plus a conditional one-time extension of up to 20 days. Confirm applicability, start event, backup treatment, exceptions and extension evidence. Immediate suppression alone is insufficient evidence of completion. 60 days remains a product baseline, unavailable as a release default while legal configuration is unverified or conflicts. |
| M1 | Candidate amendment: validate the whole generated answer before releasing its first byte. After validation, recheck current epochs before delivery, including per chunk if transport is streamed. |
| M2 | Candidate ownership: Policy Evaluation maintains versioned scope evidence with expiry and revocation; Product Owner approves policy. Router consumes evidence at preflight. Response producer uses a separate output check on the actual response, with grounded or evaluated capability evidence independent of the input classification result. Missing, expired or mismatched evidence yields UNKNOWN. Thresholds and runtime proof remain open. |
| M3 | Freeze only disputed mutations and deny when current authority cannot be established. An independently verified same-household revocation can proceed under existing policy. Possible dispositions under already applicable verified authority are no change, revoke invalid permission, or route a valid deletion request to Lifecycle. No household transfer. Detailed dispute authority and remedy rules await research. |
| M4 | B11-X04 and B23-X01 return REBUILD_PENDING without old output; B15-X03 returns ABSTAINED without old output. |
| L1 | B02 points to ODP-01/02 and tracks only dispute and legal questions. |
| L2 | Operational status, if used, is an approved static template with no prompt echo, scope rationale or protected metadata. |
| L3 | B15-X01 returns CONFLICT for divergent replay. B13-X05 references versioned approved Stage Catalog content with an explicit no-content outcome when unavailable. |

## Candidate regression oracles

- IR-T01A: account associated with household A is unlinked, then B attempts pairing through a new profile. No binding, permission or membership change and no unauthorized existence disclosure. IR-T01B: B instead invites that account as a member. Same denial. Same-household verified relinking remains eligible.
- IR-T02: use a synthetic applicable deletion policy with earlier legal deadline than product baseline. With legal applicability unresolved, release stays blocked. With a verified earlier deadline, a later configured purge cannot satisfy the gate. Suppression and retry leave the original recorded dates unchanged.
- IR-T03: authorized safety processing, an approved deterministic safety trigger and UNKNOWN AI scope. Only the eligible approved static support output may be delivered. Zero AI answer bytes and no automatic human case or family message.
- IR-T04: generated answer ends outside approved scope even though prefix appears eligible. Zero answer bytes. Revoke evidence after validation and before release, including during delivery: no further bytes released.
- IR-T05: input classifier marks request in scope, actual output exceeds evidenced capability. Separate output check denies release. Expired evidence on retry produces UNKNOWN.

No approved decision log, canonical Blueprint or final L4 status changes. P5/P6/B01 evidence gaps remain open.
