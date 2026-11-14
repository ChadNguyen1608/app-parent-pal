# Detailed review 23 · Indicator evidence, trends and progress review

Candidate specification at `30387a2f9280894ad56d346b39a236c2477327a6`. Synthetic fixtures only.

- [Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B20_Design_and_Checkpoint_REVIEW.md), blob `41c8bc2a22a5d30e1f98edd7b7a62cb8ca751894`.
- [Feature_3_2_L4_B21_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B21_Design_and_Checkpoint_REVIEW.md), blob `19932152cafb1b56e7d3d9477559dfc0a7a631cc`.
- [Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md), blob `9fa0c3f20769880520d4463f59a7fd43eb07e17e`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), including B01-PA-OD-01..04 and B01-C-OD-07.
- [Group 05](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) owns audience and rendering boundaries. [Group 20](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) covers separate goal reassessment and proposals.

## F06-G03-M02 · Indicator Evidence

Own the indicator-scoped evidence assessment: subject, indicator revision, measurement window, required-evidence checklist, source revisions, coverage and eligibility status. Source owners retain canonical events and verification. Build from an authorized snapshot. Deduplicate by original source fact, including equivalent imports with a verified link to the same fact. Unknown equivalence cannot support an independent corroboration claim. A low-confidence or unverified source cannot become verified through repetition. Use INSUFFICIENT or DISPUTED for eligible views when mandatory evidence is absent or conflicting. A withdrawn source cannot contribute to a new assessment. If it becomes ineligible before release, withhold the affected old assessment and rebuild from current scope; disclose no withdrawn source, count or identifier.

## F06-G04-M01 · Deterministic Trends

Own the trend calculation and input manifest with metric/rule revision, window boundaries, time-zone semantics, units, denominator definition, coverage and eligible exception versions. Compare windows only if their measurement definitions and coverage satisfy the applicable comparability rule, or an approved versioned mapping explicitly allows comparison. A missing period is a gap, never zero. An actual measured zero remains zero where the rule supports it. A missing denominator or unresolved comparability yields UNKNOWN or NOT_COMPARABLE as appropriate, with no direction claim. Corrections produce a new calculation version under approved rule semantics; no silent retroactive exception application. Recompute deterministically from identical immutable inputs. Any input withdrawal or version mismatch fences old cache, cursors and downstream render artifacts.

## F06-G04-M02 · Cautious Insights

Own an advisory interpretation, exact trend/evidence versions, limitations, current authorized purpose and output disposition. Prefer deterministic summaries of verified comparable facts. Conflicting, sparse or incomparable evidence cannot support directional, causal, diagnostic or capability labels. Keep numerical statements tied to the approved snapshot and make gaps visible in an authorized view. Any model use requires checkpoint 02's independent scope, purpose, provider and budget checks. UNKNOWN AI scope yields no generated interpretation, including retry or cache. Revalidate actual content and evidence before release. Withdraw affected output when an input loses eligibility. Advice does not modify goals, plans, assessment records or audience grants.

## F06-G06-M01 · Review Sessions

Own the scoped session, agenda, source snapshot refs, participant permissions, review notes, decisions and receipt. An eligible participant opens a review and records a discussion outcome against the exact session and source versions. Record comments as attributed comments and proposed changes as proposals. Closing a session can produce one review outcome; no effective plan, goal or profile mutation. Compare current assignment, authority and session revision at commit. A changed source snapshot needs reassessment before it can support a current conclusion. A timeout requires scoped reconciliation before retry; identical authorized replay returns one outcome, changed payload conflicts. Historical notes remain restricted and governed by current release rights. Handover does not permit former reviewers to finish a stale write.

## F06-G06-M02 · Feedback Handoff

Own the internal dispatch, scoped destination domain, target revision, feedback digest, provenance and receipt. Send only authorized and necessary information to the plan, goal or profile owner. Receiving a handoff does not approve or apply its content. The destination verifies current authority, target version, applicable rules and duplicate receipt before processing. Stale target goes to reassessment; rejected or unknown outcome cannot count as a successful change. A retry uses the same operation and scope. An already delivered receipt reconciles without redispatch or duplicate effects. No outside contact or live safety response arises from this workflow.

## Actors, cohorts and data

Access Policy supplies final authorization; Purpose-bound Access evaluates scope and lawful basis. Indicator consumers, review participants and receiving owners need separate permissions. A0/A1 authorized caregiver-mediated or supervised use where eligible; A2 guided review; A3/A4 eligible subject-led review; A5 verified adult self-management with voluntary family access. Age grants no rights. Real child data with unknown legal basis stays blocked. E0/E1 for evidence, trend, review and handoff; inference is conditional. Audit carries scoped refs, disposition and versions without raw private material.

| Oracle | Trace | Synthetic fixture and expected result |
|---|---|---|
| D23-T01 | B20-T01 | Two copies of one unverified source are submitted. One underlying fact at most, no verified indicator claim from duplication. |
| D23-T02 | B20-X01 | Mandatory source withdrawn after assessment. Old output withheld without source details; fresh eligible assessment is INSUFFICIENT if required support is missing. |
| D23-T03 | B20-T02, D06-T05 | One period is missing and another has a verified zero. Show a gap and a zero distinctly; no interpolation or invented observation. |
| D23-T04 | B20-X02 | Adjacent windows use incompatible metric revisions with no approved mapping. NOT_COMPARABLE; no increase or decrease claim. |
| D23-T05 | D06-T03/T06 | Authorized correction changes evidence while an old cursor is open. Recompute using current inputs; no mixed-version release. |
| D23-T06 | B20-T03/X03 | Valid trend with UNKNOWN AI scope and separately conflicting trend evidence. No generated interpretation for either fixture; authorized deterministic view may show only verified facts and applicable uncertainty. |
| D23-T07 | B21-T01/X01, D05-T08 | Journal-derived input suppressed after rendering. Stale artifact and insight withheld; authorized rebuild cannot include withdrawn data. |
| D23-T08 | B21-T02 | Review closes, response lost, then same and divergent retry. One outcome, one authorized receipt, divergent conflict, zero effective plan writes. |
| D23-T09 | B21-X02 | Former reviewer loses assignment before close. No new outcome or unauthorized session receipt. |
| D23-T10 | B21-T03/X03 | Duplicate handoff receipt, followed by stale target revision. No duplicate delivery effect; stale target routed to reassessment, no implicit change. |
| D23-T11 | B20-T04/X04, B21-T03 | Unrelated actor replays report cursor and handoff receipt. No rows, counts, target metadata or action. |

Open evidence: evidence comparability thresholds, late-source correction and historical recalculation policy, release fencing and handoff reconciliation. No Owner input needed for this checkpoint. No runtime tests or independent re-review executed.
