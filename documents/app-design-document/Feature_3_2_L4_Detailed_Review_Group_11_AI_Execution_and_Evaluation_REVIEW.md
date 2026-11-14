# Detailed review 11 · AI execution and evaluation

Candidate specification. Source `6982edb238cdd1fe3be59c49a5ad83f09fb74bd5`. Synthetic fixtures only.

- [Feature_3_2_L4_B06_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B06_Design_and_Checkpoint_REVIEW.md), blob `f5f9bb07d2b242967d7cfe45ffeb49ef8283c8fa`.
- [Feature_3_2_L4_B07_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B07_Design_and_Checkpoint_REVIEW.md), blob `41170fc467246be0d016dcd7ae2747a8e02be2a1`.
- [Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md), blob `cb87b431d58fb9ff1620d426896e0ed18dbb6d29`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md). B01-PA-OD-01..04 govern authorization, purpose and lawful basis. B01-C-OD-07 governs audit. P6-AA-OD-04 leaves assessment quota, pricing and trigger open.

## F07-G03-M02 · Execution Budget

Budget owns scoped reservation, execution operation ID, requested upper bound, policy and tariff versions, reserved/settled amounts and evidence refs. Router owns route selection. A reservation does not authorize provider calls or charge the user. Require current policy limit and comparable units/currency. Atomically reserve against available capacity; competing tasks cannot oversubscribe. Identical retry returns existing reservation with current authorization. Divergent request under same scoped key conflicts.

Track RESERVED → DISPATCHED → SETTLED or RELEASED with verified evidence. Expiry before dispatch can release capacity if dispatch did not occur. Once dispatch may have occurred, timeout moves the operation to OUTCOME_UNKNOWN and retains a conservative reservation until reconciliation establishes usage or non-execution. Deduplicate receipts by provider namespace and operation. Receipt mismatch goes to reconciliation without duplicate settlement. A confirmed cost above reservation remains traceable to the real receipt; raise a budget discrepancy and block further paid execution where the current budget cannot cover it. Do not silently discard an overage or treat internal metering as a customer invoice. Exact quota, overage policy and tariff remain open.

## F07-G03-M03 · Multimodal Orchestration

Own modality session, authorized purpose, data class, provider capability version, transient retention rule, state and session epoch. Explicit user initiation plus current authority is required for capture and provider dispatch. Check approved provider processing, retention and eligibility before acquiring protected input or sending it. Missing eligibility means no protected dispatch; offer a separately eligible text/manual path when available. Modality choice does not widen Pal's approved response or disclosure scope.

Cancel advances session epoch and stops further capture, publish and persistence by stale jobs. Late output cannot become a Journal entry or appear as a response. Where input already left the system before cancellation, record cleanup as pending until a scoped provider receipt establishes its outcome. Keep evidence metadata without transcripts, recordings or raw prompts. Recheck scope before release. Safety rules retain precedence in authorized processing, including for eligible multimodal input. An applicable risk-of-harm trigger gives only the reviewed trusted-adult suggestion, with zero generated answer or outbound contact.

## F07-G04-M01 · Policy Evaluation

Own immutable evaluation run and policy comparison, with baseline/candidate hashes, fixture version, expected and observed decisions and reason categories. Access Policy still owns runtime ALLOW/DENY. Run under synthetic scope with fixture authorship and evaluator rights checked separately. Explicit mandatory-deny cases include unknown lawful basis, wrong household, revoked grant and disallowed purpose. Report missing case, incomparable fixture or unverifiable evidence as UNKNOWN. Report changed outcomes by fixture, policy version and severity. A failed mandatory rule is a regression regardless of aggregate. A review receipt records evidence and does not promote policy.

## F07-G04-M02 · Model Evaluation

Own evaluation run and reproducibility manifest: model/config/prompt/policy hashes, fixture versions, modality/language, task/coverage, expected behavior, provider status and observations. One run identity per scoped operation and manifest. Same retry reconciles prior attempts; divergent manifest conflicts. Retries may fill eligible missing fixture attempts under budget and fresh authority, with explicit attempt provenance. Partial output, provider outage and missing fixture evidence cannot be counted as a pass. Compare only like fixtures or report incomparable. Mandatory safety, rights and scope regressions block a positive recommendation for affected capability. No automatic deployment or coverage approval. Policy Evaluation can consume verified capability evidence; Router still checks current authorization and approved scope at execution.

## Actors, data and cohort scope

Requester, provider callback, evaluation reviewer and finance operator require distinct scoped authority. A0/A1 use caregiver-mediated or supervised modality only where eligible, A2 guided, A3/A4 eligible subject-led, and A5 verified self-management. Age confers no permission. Evidence fixtures are synthetic across cohorts. Real child data with unknown legal basis stays blocked. Budget, scope, cancellation and evaluation state controls are E0/E1. Inference for an eligible test or feature is separately authorized and budgeted. Internal information remains first for technical education queries; selecting voice or another modality cannot bypass that route order.

| ID | Trace | Fixture and observable result |
|---|---|---|
| D11-T01 | B06-T01 | Two equal reservations race with capacity for one. One succeeds; same-key retry changes no total. |
| D11-T02 | B06-T02 | Provider usage outcome lost after dispatch, then matching receipt delivered twice. Preserve pending reservation while unknown; settle once; no duplicate dispatch. |
| D11-T03 | B06-T02 | Verified actual exceeds reservation. Record real amount once and surface discrepancy; uncovered budget denies further paid execution under that limit. |
| D11-T04 | B06-T03 | Voice requested with unknown retention or age eligibility. No protected capture or provider dispatch; only separately eligible fallback. |
| D11-T05 | B06-T04 | Cancel while STT in flight. No later transcript, Journal write or answer. Cleanup status remains pending without provider evidence. |
| D11-T06 | D02-T01/T05 | Voice question has sufficient internal evidence; another eligible voice input triggers safety rule. First uses no external knowledge fallback. Second gives only reviewed static advice and no human contact. |
| D11-T07 | B06-T05 | Valid role with unknown lawful basis returns ALLOW in candidate engine. Report mandatory-deny regression against exact policy/fixture. |
| D11-T08 | B06-T06 | Policy comparison lacks a mandatory revoked-grant case or uses changed fixtures. Evidence is incomplete/incomparable; no promotion. |
| D11-T09 | B07-T01 | Duplicate run request and provider failure on one fixture. One run with separate attempts and partial coverage; missing output is not a pass. |
| D11-T10 | B07-T02 | Aggregate score improves while candidate leaks output on a mandatory denial case. Report the exact regression; withhold a positive recommendation for affected scope. |
| D11-T11 | B07-T01, D02-T07 | Model config or policy changes after evaluation. Prior evidence cannot approve the new combination; route needs matching current evidence. |

Open evidence: provider cost and cleanup receipts, reliable dispatch reconciliation, verified scope/capability evidence, evaluation coverage and age/provider eligibility. No Owner input required to continue this checkpoint. No runtime tests or independent re-review executed.
