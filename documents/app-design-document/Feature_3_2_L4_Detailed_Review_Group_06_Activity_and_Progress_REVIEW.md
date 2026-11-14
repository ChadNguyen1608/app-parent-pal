# Detailed review 06 · Activity events, progress and indicators

Candidate specification at source commit `fc12362fb0970832ddebcd939f591fc20e0f758a`. Synthetic fixtures only.

- [Batch 19](Feature_3_2_L4_B19_Design_and_Checkpoint_REVIEW.md), blob `8f298454b4c52a280e5035b5b9c472112ddf4d35`.
- [Detailed group 05](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md), blob `0907d5aa414e226832ec716f20d03d3c1f7c8397`. Source Metadata is revisited for ingestion and aggregation. It is counted only once.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md). B01-PA-OD-01..04 govern purpose and legal gates. B01-C-OD-07 governs shared audit. P6-AA-OD-01/03 govern verification and attempt history.

## Event intake · F06-G01-M01

The authorized producer submits an event type, opaque subject, source event ID, occurrence timestamp and offset, source evidence reference, schema version and minimum allowed payload. Activity Event Log derives household and producer namespace from verified authorization, records server receipt time separately and owns the durable activity fact. Source time alone cannot prove authorization, school verification or receipt. Missing identity, unsupported schema, unknown subject scope or an ineligible producer results in no accepted event. Quarantine, if allowed, stores only approved evidence within the same legal scope.

Use an idempotency identity scoped by producer namespace, subject and source event ID, with a canonical digest. Compare current write authority at commit. Authorized identical retry returns the original receipt; divergent payload conflicts without overwriting the original. Corrections link to the original through a new authorized event. A correction advances the affected evidence version and invalidates projections that used the old facts. Historical payload access remains subject to current purpose and retention. An event with a verified past occurrence time may arrive late; use receipt time for processing trace and the rule's explicit occurrence window for eligibility.

## Source metadata · F06-G01-M02

Own source type, asserted verifier, attestation ref, verification state and version. Keep source claim distinct from verified authority. A self-report, model assessment, caregiver confirmation and teacher confirmation have different provenance. Imports preserve this distinction. Only independently verified and applicable teacher evidence may support a teacher label. A missing or mismatched attestation is UNVERIFIED; disputed evidence stays distinguishable. A later attestation correction does not silently rewrite earlier receipts. Publish the corrected version and invalidate dependent projections. Shared audit contains only allowlisted opaque references and disposition, never raw work, Journal content or provider credentials.

## Progress rules · F06-G02-M01

Progress Rules owns versioned calculation, evidence eligibility, window and result status. Pin rule version, indicator version, scope, window boundaries/time zone, input evidence versions, eligible exception version and calculation timestamp. Count each eligible source fact once. Record numerator, denominator and coverage only in authorized projections. An absent denominator, zero denominator without an explicit applicable rule, or missing mandatory evidence yields UNKNOWN. Zero eligible completions with a known positive denominator can yield an actual zero. Pending and conflicting evidence cannot be silently promoted. A result cursor pins one calculation snapshot and rechecks scope and evidence versions at release. An invalidated snapshot is held for rebuild and supplies no stale values or counts.

## Exceptions · F06-G02-M02

An authorized reviewer may propose an exception against an exact rule version, subject, metric, date range and reason code. Store evidence refs, base version, review decision and effective interval. Proposed, rejected and expired exceptions do not affect a new calculation. Compare approval authority and overlap at commit. For this candidate, overlapping incompatible exceptions cannot both be effective. A conflict goes to review while any already-valid exception remains in effect. Exceptions modify calculation eligibility only as allowed by the rule. They never alter source facts, grant access or relax safety limits. Retroactive adjustments require separately approved policy; preserve historical evidence subject to current rights.

## Indicator publication · F06-G03-M01

Registry owns indicator definition, unit, cohort applicability, required evidence, compatible rule versions, effective interval and version. Editor proposes; a current authorized publisher publishes against the reviewed draft hash and active pointer. A candidate lacking required evidence metadata or compatibility remains draft. One guarded publish updates the active pointer. Prior calculations retain original definitions; comparison across incompatible versions is unavailable unless a separately approved mapping exists. A retired definition is unavailable for new calculations after its effective end. User-facing consumers receive only authorized indicator projections.

## Permission and cohort boundaries

F01 Access Policy decides final authorization using actor, subject, action, current purpose and scope. Producer may submit only its own event namespace. Verifier can attest only its assigned source. Reviewer/publisher rights do not give access to other children or raw evidence. Report viewer gets only current field-level scope. Recheck after scope changes before commit or disclosure. For A0/A1, use conditional caregiver-mediated evidence, without assumed direct child reporting. A2 uses eligible assisted reporting. A3/A4 use eligible subject-led reporting and scoped views. A5 uses verified adult self-management with voluntary family sharing. Where authority or evidence is unavailable, keep the affected result UNKNOWN or deny disclosure as applicable. All core operations E0/E1, zero inference calls. Real child data with unknown legal basis remains blocked.

| ID | Candidate / baseline | Synthetic fixture | Expected outcome |
|---|---|---|---|
| D06-T01 | record / B19-T01 | Response lost after accepted event; identical retry then changed payload | One event and receipt; identical authorized retry returns receipt; divergent retry conflicts. |
| D06-T02 | record / B19-X01 | Producer loses scope before commit; unrelated household retries with same source ID | No unauthorized event or receipt; no protected existence signal. |
| D06-T03 | record → calculate | Authorized late correction changes an in-window fact after result published | Original provenance retained within policy; old snapshot invalidated; recompute once using corrected eligible fact. |
| D06-T04 | attribute / B19-T02, X02 | Parent-confirmed event imported with claimed teacher label and mismatched evidence | No teacher verification; display eligible parent confirmation only when independently established. |
| D06-T05 | calculate / B19-T03 | Compare 0/4, 0/0 and unavailable denominator under a rule with no zero-denominator semantics | 0/4 yields zero; other two UNKNOWN. Replay same immutable inputs yields identical result. |
| D06-T06 | calculate / B19-X03 | Metric rule changes between report pages; then viewer scope revoked | First stale cursor held for rebuild, no mixed versions; revoked viewer receives no rows or counts. |
| D06-T07 | except / B19-T04, X04 | Two incompatible exceptions race approval; accepted one later expires | At most one effective exception; conflict goes to review; expired exception excluded from new calculations. |
| D06-T08 | register / B19-T05, X05 | Publish draft with missing evidence metadata; then two eligible drafts contend for same active version | Invalid draft stays draft. At most one eligible publish wins; old outputs retain their definition. |
| D06-T09 | attribute → calculate → report | Verification withdrawn after projection build but before delivery | No stale verified label or derived metric released; authorized rebuild uses current evidence or returns UNKNOWN. |
| D06-T10 | all | Same operation presented by eligible assisted child, unrelated actor and verified adult in their own scope | Each result depends on current scoped authority; unrelated actor sees no evidence, metrics or status. |

Open evidence: provider attestation formats, late-event reconciliation, signed source correction semantics, concurrency of publication and release fencing, and approved rule treatment for retroactivity. Detailed candidate checkpoint only. Zero runtime tests; independent re-review pending.
