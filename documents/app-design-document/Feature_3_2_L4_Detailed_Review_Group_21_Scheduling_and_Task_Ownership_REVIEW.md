# Detailed review 21 · Schedule construction and task ownership

Candidate specification at `cf60b7273c8ead08f52bc8f25d2c88783bf9df8f`. Synthetic fixtures only.

- [Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B16_Design_and_Checkpoint_REVIEW.md), blob `2d61180315fa913fe60ba9dd31899ebbd600cf1f`.
- [Feature_3_2_L4_Detailed_Review_Group_04_Plan_Changes_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_04_Plan_Changes_REVIEW.md), blob `f490a72bbb68750ccc79dbec9eb2acd76b40f013`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), including B01-PS, B01-MS, B01-CR, P6-AP and P6-BP.

## F04-G01-M02 · Plan Templates

Own reviewed template version, source, applicability, reusable defaults and lifecycle. Template instantiation creates a scoped draft via Plan Structure. Check current template eligibility, subject, actor and purpose before reading and at draft creation. Clone approved reusable fields only; never copy another child's identity, assignments, consents or approvals. Store exact template version as provenance. Identical authorized replay returns the draft receipt; divergent replay conflicts. Retirement prevents new instantiations. Existing drafts retain provenance and undergo current validation; if the template was withdrawn for a safety reason, the affected draft must be reassessed before application. Replacement does not silently rebase drafts or alter effective plans.

## F04-G02-M01 · Schedule Construction

Own candidate arrangement and build manifest with input/context revisions, base plan version, rule version, recurrence and time-zone evidence, horizon and validation refs. A currently eligible planner can save a draft. Resolve fixed constraints and eligible availability, request scoped Conflict and Balanced Planning evidence, and report conflicts or unresolved conditions without labelling an invalid schedule ready. Missing applicable Standard Bar yields UNKNOWN and keeps an eligible draft only. Protected hard caps cannot be overridden. An arrangement can be reviewed or regenerated when inputs change. Construction does not write the effective plan. Plan Structure applies only through the current guarded commit contract in checkpoint 04; a lock, changed plan version, lost delegation or stale evidence prevents application. Old build jobs cannot overwrite a newer draft.

## F04-G02-M02 · Schedule Conflict

Own deterministic result for a declared scope, bounded horizon, interval set and time-zone/recurrence version. Resolve instants consistently before comparing half-open intervals [start, end). Adjacency is not overlap. Reject invalid intervals. For ambiguous/nonexistent local time without a valid explicit resolution, return UNKNOWN for the affected occurrence. Conflict checks distinguish eligible conflicting records from UNKNOWN due to inaccessible or missing mandatory evidence. A user-facing result reveals only authorized detail; a redacted constraint never exposes another subject's event or count. Empty valid horizon differs from unchecked coverage. Conflict evidence does not certify balance, authority or approval. Recompute when inputs or zone rules change.

## F04-G03-M01 · Task Ownership

Own scoped task-assignee relation, responsibility type, base task revision, proposed/effective status and actor provenance. Validate actor, task, assignee and current eligibility against the exact plan scope. A proposed assignment is effective only after the owning plan workflow commits it where the assignment is part of an effective plan. Validate at write, including handover, re-pairing and membership change. Same operation with same digest returns one authorized receipt; stale or divergent changes conflict or go to reassessment. Effective assignment does not grant schedule edit, approval, lock admin or private-data access. Changes in effective task responsibility fence stale task views and queued notifications through current authority and task revision.

## Shared gates and cohorts

Access Policy issues final authorization. Mode State supplies current mode. In Parent-led, child does not submit an official schedule change; authorized communication is separate. In Child-executed, eligible child can propose/draft within scope; Child-directed may apply only with current delegation and checkpoint 04 guards. Existing Approval Routing is an interface dependency, already deepened in checkpoint 04. A0/A1 caregiver-mediated where eligible; A2 guided draft or task view as permitted; A3/A4 eligible subject-led operations per current mode and grant; A5 verified adult self-management. Purpose and lawful basis remain independent. Real child data with unknown lawful basis stays blocked. E0/E1 deterministic, zero inference. Audit carries opaque refs, versions and outcome, excluding raw private content.

| Oracle | Trace | Synthetic fixture and expected result |
|---|---|---|
| D21-T01 | B16-T01 | Instantiate eligible template, lose response and retry with same then divergent payload. One draft, original authorized receipt, divergent conflict, no effective write. |
| D21-T02 | B16-T01/X01 | Retire or replace template after draft creation. No fresh draft from retired version; old draft retains provenance and requires current guards before apply. |
| D21-T03 | B16-T02 | All arrangements violate protected cap or mandatory bar evidence is missing. Retain eligible draft; no ready/effective claim. |
| D21-T04 | B16-X02, D04-T03 | Lock or plan/context revision changes while build runs. Eligible draft may remain; stale build cannot apply or replace newer draft. |
| D21-T05 | B16-T03 | [09:00,10:00) and [10:00,11:00) do not overlap; [09:59,10:30) intersects both when evaluated in the same resolved time zone. |
| D21-T06 | B16-X03 | Recurrence crosses a daylight-saving gap or fold without valid resolution. Affected occurrence UNKNOWN; no conflict-free claim. |
| D21-T07 | B16-T03 | Mandatory constraint record cannot be evaluated within approved scope. Return scoped UNKNOWN without exposing the record or its count. |
| D21-T08 | B16-T04/X04 | Assign within authorized scope, then attempt reassignment after assignee or planner loses eligibility. Denied change; no additional grants. |
| D21-T09 | B16-T04, D04-T01 | Draft assignment saved or approval recorded, then apply fails. No effective task responsibility or queued effective notification. |
| D21-T10 | B16-T05/X05, D04-T03 | Handover after routing. Former approver cannot apply; reevaluate routing without modifying effective schedule. |
| D21-T11 | B16-T04, D01-T05 | Re-pair child into new household and replay old task action or read. Old binding alone authorizes nothing; no protected task details or action. |

Open evidence: exact recurrence/zone contract, authorized conflict projection, template withdrawal semantics and runtime commit/invalidation. No Owner decision needed for this checkpoint. No runtime or independent re-review executed.
