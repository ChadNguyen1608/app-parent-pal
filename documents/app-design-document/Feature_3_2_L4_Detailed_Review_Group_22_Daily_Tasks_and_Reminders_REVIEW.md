# Detailed review 22 · Daily tasks, completion claims and reminders

Candidate specification. Pinned source `b902ff3eac89e9e50b76ef6983d84f46fc110a8d`. Synthetic fixtures only.

- [Feature_3_2_L4_B17_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B17_Design_and_Checkpoint_REVIEW.md), blob `622e68f16c0d5ffcb60d3bee3a5176d4571d7cd8`.
- [Feature_3_2_L4_B18_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B18_Design_and_Checkpoint_REVIEW.md), blob `0c84ec14a75f6a4437d13acaed5b4828fa219041`.
- [Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md), blob `ceafb5821edc8de239f5769789e3a07aa78f6b12`.
- [Pal response design](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) and [learning evidence](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md).
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), including B01-PA-OD-01..04, B01-C-OD-07 and P6-AA-OD-02.

## F04-G04-M01 · Daily Task View

Own the authorized day projection keyed by actor, subject, local day, resolved time zone, effective plan version and task-assignment revisions. Plan Structure owns the effective schedule. Include only currently eligible task occurrences. Pending proposals and drafts cannot appear as effective tasks. Distinguish a verified empty day from an unavailable or unresolved snapshot. Bind page cursors to scope and snapshot; a version change requires refresh and a loss of rights returns no rows or counts. Offline display of protected details requires separately verified cache and revocation guarantees. Without current evidence, the candidate presents a generic unavailable state and does not serve protected cached details.

## F04-G04-M02 · Execution Support

Own the scoped help request, exact task occurrence/revision, selected assistance type, approved guidance refs and response disposition. The child explicitly requests help within current task scope. Use eligible internal instructions first and optional model assistance only under checkpoint 02's independent authority, capability, privacy and budget gates. A homework hint uses guiding prompts within approved scope and never supplies the final answer. If scope or evidence is insufficient, withhold the generated response. Run authorized safety rules before ordinary assistance; an eligible risk-of-harm signal yields only the reviewed trusted-adult suggestion. Assistance does not edit the task, submit work, record completion or contact anyone.

## F04-G05-M01 · Lightweight Check-off

Own a scoped completion claim with exact task occurrence and base revision, actor, source and receipt. An eligible child or separately authorized actor may record a claim. Store occurrence and reported time separately from server receipt time. A queued offline action remains local/pending until the server checks current assignment, scope, occurrence and base revision. At commit, atomically record one claim and receipt per scoped operation and canonical digest. Identical authorized retry returns the original receipt; divergent replay conflicts. If a task was reassigned, canceled or materially changed, reject a revoked actor or require review of a stale occurrence for a still-eligible actor. Never re-target an offline action to a different occurrence. Check-off is a completion claim and does not create an assessment, proof of learning, parent confirmation or plan edit. Evidence Submission and Academic Assessment retain their checkpoint 05 responsibilities.

## F04-G07-M01 · Schedule Notifications

Own a scoped reminder operation binding recipient, authorized destination, task occurrence, effective plan version, preference version, due window and delivery outcome. Enqueue from effective plan only. At the dispatch boundary recheck current recipient, assignment, task version, preference epoch, time window and authority. Drop a stale job; any rescheduled reminder needs a new eligible operation. Candidate external notifications carry approved generic wording without task text, mood or Journal content. A timeout after possible send leaves outcome unknown. Reconcile against the same provider operation before any retry. If provider evidence cannot establish a safe retry, do not send again. Record confirmed provider acceptance separately from device delivery. A notification accepted externally before opt-out may already be in flight; opt-out fences new dispatches and any subsequent app deep link rechecks rights.

## F04-G07-M02 · Notification Preferences

Own recipient-scoped channel, timing and category preferences, current version and delivery epoch. Verify authorization to edit the exact recipient and channel. Preferences cannot grant task access. Compare base version at write. A committed opt-out advances epoch and takes precedence over an older queued enable or channel update. A later explicit authorized opt-in uses the new version and does not revive old jobs. Unknown channel ownership, schedule or policy prevents protected delivery. Exact defaults, quiet hours and delegated preference management remain open.

## Actors, cohorts and data

Access Policy supplies final authorization; Mode State and effective assignments supply separate evidence. A0/A1 use conditional caregiver-mediated or supervised flows; A2 guided task actions; A3/A4 eligible subject-led actions within current mode and grants; A5 verified self-management and voluntary family access. Age or assignment alone grants no administrative or private-data rights. Core controls are E0/E1; optional inference is separate. Real child data with unknown lawful basis remains blocked. Audit uses opaque refs and outcomes.

| Oracle | Trace | Synthetic fixture and expected result |
|---|---|---|
| D22-T01 | B17-T01/X01 | Day view includes an effective task and a draft, then viewer loses rights before next page. Only effective authorized task appears initially; stale page discloses no rows or counts. |
| D22-T02 | B17-T01, D21-T11 | Offline device retains a snapshot after re-pairing. Without verified current cache eligibility, no protected task detail is displayed. |
| D22-T03 | B17-T02/X02 | Child asks for a final homework answer. Give eligible guiding hint only when approved, otherwise withhold AI output. No task or plan mutation. |
| D22-T04 | D02-T05 | Safety trigger during eligible help. Only reviewed trusted-adult suggestion; no generated advice, contact or human case. |
| D22-T05 | B17-T03 | Authorized offline claim syncs twice after a lost response. One claim, same authorized receipt, no assessment or verification status. |
| D22-T06 | B17-X03, D21-T08 | Assignment revoked or occurrence revised before sync. No stale claim applied; revoked actor sees no prior receipt. |
| D22-T07 | B18-T02 | Task moves after enqueue. Old job does not dispatch; newly eligible reminder requires current task/preference versions. |
| D22-T08 | B18-X02 | Job for child A carries child B destination. Zero dispatch and no protected data to B. |
| D22-T09 | B18-T02 | Provider accepts but response is lost. Unknown until reconciled; no second dispatch without evidence of safe retry. |
| D22-T10 | B18-T03/X03 | Channel update races opt-out. Committed opt-out fences stale write and queued job; later authorized opt-in does not revive it. |
| D22-T11 | B18-T02/X03 | Opt-out takes effect after provider acceptance; stale notification deep link is opened after scope loss. No new dispatch or protected app disclosure. |

Open evidence: offline cache invalidation, claim persistence and reconciliation, provider deduplication, delivery semantics and channel defaults. No new Owner decision required for this checkpoint. Runtime and independent re-review pending.
