# Detailed review 12 · Check-in and reflection

Candidate specification. Pinned source `b9fa3665d9c0c87ebb7608116ae24c133da0b0b3`. Synthetic fixtures only.

- [Feature_3_2_L4_B08_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B08_Design_and_Checkpoint_REVIEW.md), blob `1bdc0dbe8684bdba6d3a8b1cd2340ef200334194`.
- [Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B09_Design_and_Checkpoint_REVIEW.md), blob `f128bcb57934f4da6a00959e2b103cae659172c5`.
- [Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md), blob `cb87b431d58fb9ff1620d426896e0ed18dbb6d29`.
- [Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md), blob `dfa715531d0456b7e1687d2d6418b7e2d8f821a9`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md). B01-PA-OD-01..04 govern purpose, authorization and lawful basis; B01-C-OD-07 governs audit.

## F05-G02-M01 · Opt-in Check-in

Own invitation ID, opaque subject, policy and preference version, eligibility window and interaction state. An eligible child can open an invitation, skip it, or explicitly begin check-in. An invitation, open, skip, expiry or absence of response is interaction state only. It produces no emotional observation, caregiver report, or inferred profile fact. Any protected response processing requires a separate current purpose and authority. No response text belongs in the invitation record.

For the candidate state model, a current explicit skip closes an unanswered invitation; timeout closes delivery eligibility. If timeout wins before a valid in-flight skip is recorded, accept the skip only as a terminal acknowledgement of the same unanswered invitation, without reopening it. Both paths leave the invitation unavailable for further prompting. Duplicate skip returns the original authorized disposition. Stale access is denied without an existence signal. A new scheduled invitation needs independent eligibility under current controls.

## F05-G02-M02 · Check-in Controls

Own scoped preference version, enabled state, approved schedule/channel settings and delivery epoch. Turning reminders off changes future delivery; it does not remove an independently available voluntary check-in. Never infer consent from enabled reminders or role alone. Recheck current preference, subject, purpose and eligibility at enqueue and delivery. Preference update compares base version; concurrent changes do not overwrite each other. An off-then-on sequence invalidates previously queued jobs and needs a freshly eligible event. External push, if approved, carries generic text without mood, Journal or prompt content. Exact defaults, cadence, channels and actor precedence remain open; unverified schedules cannot send.

## F05-G03-M01 · Reflection Prompts

Own prompt selection receipt with approved template/version, locale, age applicability and purpose. Trigger from eligible child interaction. Use an applicable approved template; missing or expired templates yield a skip/exit option without a generated replacement. Revalidate the template and scope at display. Templates avoid diagnostic labels or pressure to respond. The prompt selector cannot pull Journal history or build emotional profiles. When separately authorized response processing identifies a risk-of-harm trigger, follow checkpoint 02: only the reviewed suggestion to talk to a trusted adult, with no generated advice, human case, contact or disclosure. Skip or silence alone is no safety signal.

## F05-G03-M02 · Reflection Review

Own limited-lived private draft reference, version, subject scope and state. The child can review, discard or explicitly save an eligible draft. Private Entries owns the Journal entry, and saving requires current authority, matching draft version and an explicit save action. Use a scoped operation ID and digest. A committed save creates at most one private Journal entry and does not create a sharing grant. If save outcome is uncertain, reconcile before retry. A valid discard invalidates the draft and advances its epoch. If discard wins, an offline or stale save creates nothing. If save already committed, discard cannot claim the Journal entry was deleted; any deletion follows checkpoint 03. Discard cleanup follows the approved draft retention policy and may remain pending until verified. No autosave into Journal, default future recall or publication to reports. Exact draft storage and lifetime remain unverified; without approved handling, protected drafts cannot persist.

## Actors and cohorts

Access Policy decides final authority for actor, action, subject, purpose and resource. Child control of participation and draft actions is distinct from any verified caregiver permission to manage allowed reminders. A0/A1 direct check-in is not assumed; use only eligible supervised interaction. A2 may use guided prompts with clear skip/discard choices. A3/A4 use eligible subject-led interaction and private review. A5 uses verified adult self-management. Age alone supplies no authorization. Restricted draft content is excluded from shared audit; allowlisted state/version metadata only. E0/E1 for prompts and state. Unknown lawful basis blocks real child data.

| ID | Trace | Fixture and expected outcome |
|---|---|---|
| D12-T01 | B08-T03/X03 | Skip and timeout race; then replay skip. One closed unanswered invitation, no repeat delivery, no mood record or report. |
| D12-T02 | B08-T03 | Child opens then leaves without responding. No mood, profile, safety or caregiver signal is derived. |
| D12-T03 | B08-T04 | Opt out after a reminder is queued. No queued delivery after the effective epoch change; independently authorized manual check-in remains available. |
| D12-T04 | B08-X04 | Concurrent same-version edits, then off and on. One initial write wins; old queued job stays ineligible even after re-enable. |
| D12-T05 | B08-T04 | Unrelated household attempts read or update of controls. No preference change or existence signal. |
| D12-T06 | B08-T05/X05 | Approved template expires before display or lacks cohort coverage. No stale prompt or Journal-derived fallback; skip/exit available. |
| D12-T07 | D02-T05 | Authorized response processing triggers safety rules. Only reviewed trusted-adult suggestion; zero AI-generated answer, contact or case. |
| D12-T08 | B09-T01/X01 | Discard wins before an offline save arrives. No Journal entry or draft republication; cleanup receipt is separate. |
| D12-T09 | B09-T01 | Explicit valid save wins and response is lost; retry and then try a different payload under same key. Exactly one private entry, authorized receipt on identical retry, conflict for divergent payload, no grant. |
| D12-T10 | B09-T01, D03-T04 | Save already committed when a stale discard arrives. Entry remains private; eligible user may invoke Journal deletion separately. No false deletion claim. |
| D12-T11 | D03-T01, D02-T07 | Recipient scope revoked before draft review/save or caregiver attempts reading a private draft with reminder controls only. No unauthorized payload or save. |

Open evidence: cohort eligibility, schedule defaults and actor precedence, consent/legal basis, draft retention and cleanup, offline transition and delivery fencing. No Owner decision needed to continue design. Runtime tests and independent re-review pending.
