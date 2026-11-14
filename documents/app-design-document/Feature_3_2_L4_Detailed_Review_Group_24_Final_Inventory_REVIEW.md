# Detailed review 24 · Autonomy, resource discovery and deferred human response

Candidate specification at `ee453d417920f37390b2fd26fd6b6e5cb90010e6`. Synthetic fixtures only.

- [Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B03_Design_and_Checkpoint_REVIEW.md), blob `83ef28d0f608a3fda6c0a10308843afa63d763ac`.
- [Feature_3_2_L4_B07_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B07_Design_and_Checkpoint_REVIEW.md), blob `41170fc467246be0d016dcd7ae2747a8e02be2a1`.
- [Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B22_Design_and_Checkpoint_REVIEW.md), blob `b283251233b08183d71570f03c81f6c80492fd8c`.
- [Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B23_Design_and_Checkpoint_REVIEW.md), blob `daad24765e949cce0d588629c37be84975a6b9d8`.
- [Feature_3_2_L4_Independent_Review_Owner_Followup.md](Feature_3_2_L4_Independent_Review_Owner_Followup.md), blob `bb7bf12cd7528a5ea600a0b322f4e4bf449f539e`.
- [Inventory 3.2-R1](Product_Blueprint_03_2_Feature_Inventory_and_Scope.md), blob `f52be52f5ae37ddce0b6a021aec915659f357db3`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), including B01-MS-OD-01..04, B01-C-OD-01/07, B01-CR-OD-02 and B01-PA-OD-01..04.

## F01-G05-M02 · Mode Transitions

Own subject-scoped proposal, requested mode, base mode revision, evidence refs, eligible decision and result receipt. Mode State owns the effective mode. Access Policy owns delegated rights. An eligible subject or caregiver proposes and an independently eligible decision-maker may approve or decline. Submission and approval evidence confer no new mode, grant or plan authority. Mode State commits the approved change only after comparing exact proposal, effective version, current decision authority, applicable policy and verified self-management status. An unknown or stale guard prevents the transition and routes the request to reassessment. At most one effective transition wins for the same base. After a lost response, reconcile the scoped operation and digest before retry. An identical authorized replay returns the original outcome; divergent input conflicts.

Handover alone preserves the current mode and still-valid delegated grants. Pending transition review follows current approver authority; old approval cannot be applied by replaying revoked authority. Plan and Change Request apply paths recheck mode, current grants, lock, validation and approved reapproval rules. Verified adult self-management takes precedence. Direct child interactions and mode eligibility remain subject to current verified scope. No proposed or effective mode grants Journal access.

## F07-G05-M02 · Human Response Workflow · Deferred for initial release

The Owner excluded live human response from the first release. A safety trigger may show only the approved static suggestion to speak with a trusted adult. It does not create a case, queue, assignment, contact, notification, or disclosure, and UI must not imply live monitoring. Generic support and user-initiated expert referral cannot substitute for this disabled safety workflow.

Future design boundary, conditional on separate approval: Human Response would own scoped case, assignment/version, permitted evidence refs, disposition and outbound receipt. Safety Triage would own the signal. Case creation, case access and outward contact would each require independently approved purpose, legal basis, and current action and recipient scope. Reassignment fences the outgoing actor at release and commit. A case decision is not proof of delivery; reconcile possible dispatch before retry. No broad Journal access. Staffing, eligibility, retention and contact policies remain open. Future-case oracles are conditional design evidence only; the initial-release oracle is zero case and zero contact.

## F08-G02-M01 · Expert Discovery

Own directory entry, verified provider identifier, public qualification scope, verification provenance and expiry, publication state and version. Authorized curator may publish only with current scoped evidence. In the candidate verified directory, expired, withdrawn, disputed or mismatched verification excludes the entry at release, including cache and pagination. Avoid presenting directory presence as endorsement, recommendation or guaranteed availability. Consumers receive only eligible public or separately authorized fields. Viewing a listing sends no child data and creates no contact. Referral requires an independently authorized and explicitly confirmed dispatch under checkpoint 07.

## F08-G03-M01 · Activity Directory

Own activity version, provider/source reference, availability window, locality and eligibility descriptors, plus sponsorship disclosure when applicable. Authorized publisher verifies source and scope at activation. At selection and release, filter expired, withdrawn, wrong-audience and unverified required fields. A known withdrawal invalidates old listing versions before cache refresh. Cohort uncertainty allows only independently eligible general listings. Public browsing supplies no provider with child profile or exact location. Listing retrieval, commercial checkout and resource matching have distinct boundaries.

## F08-G03-M02 · Resource Matching

Own matching request, allowed inputs and purpose, eligible listing/version manifest, ranking rule/version, explanations and release disposition. Use approved listing metadata first, with current explicit authority for any optional preference. Missing preferences allow eligible broad matches; preferences are not inferred from Journal or skipped questions. Disclose relevant sponsorship and keep commercial signals from silently overriding the approved relevance rule. If preference access is revoked after build, withhold the entire old result; an otherwise eligible requester receives REBUILD_PENDING without withdrawn metadata. Rebuild only from current eligible inputs. If requester scope is lost, generic denial. Cache, pagination and retry recheck listing, input and authority versions. Match does not automatically book, pay, refer or create a goal.

## Actors, cohorts and execution

Access Policy owns final authorization; Purpose-bound Access evaluates legal basis and purpose. Separate requester, approver, curator, reviewer and worker scopes. A0/A1 caregiver-mediated or supervised interaction where authorized; A2 guided discovery and feedback; A3/A4 eligible subject-led proposal/discovery; A5 verified self-management and voluntary family sharing. Unknown authority cannot widen age, purpose or data scope. Real child data with unknown legal basis stays blocked. These controls use E0/E1 and no inference. Audit carries only scoped refs, versions and outcomes; no private child content.

| Oracle | Trace | Synthetic fixture and expected result |
|---|---|---|
| D24-T01 | B03 T1 | Eligible mode proposal submitted and replayed. One proposal, original authorized receipt, no effective mode or grant change. |
| D24-T02 | B03 T2, D04-T03 | Two mode decisions target same base, and one loses authority. At most one eligible effective commit. Stale plan apply cannot reuse old mode evidence. |
| D24-T03 | B03 T3 | Handover during pending mode proposal and approved unapplied CR. Current mode and valid grants persist; reroute proposal, require applicable CR reapproval. |
| D24-T04 | Owner follow-up, D02-T05 | Eligible safety trigger in first release, including retry. Reviewed trusted-adult suggestion only. No case, queue, human assignment, contact or disclosure. |
| D24-T05 | B07-T05/T06, future only | If a later approved case is reassigned while outgoing reviewer prepares release, deny old actor. Duplicate verified outbound receipt has one effect. |
| D24-T06 | B22-T03/X03 | Qualification expires after directory page is built. No stale verified entry, citation or cached claim. |
| D24-T07 | B22-T03, D07-T05 | View valid directory entry then leave without referral confirmation. No provider contact or child payload. |
| D24-T08 | B22-T05/X05 | Provider withdraws listing while cache is warm, or listing targets an ineligible audience. No stale/wrong-audience result; no provider disclosure. |
| D24-T09 | B23-T01 | Missing optional preference and sponsored listing available. Eligible broad result only; sponsorship disclosed and no hidden rank override. |
| D24-T10 | B23-X01 | Preference revoked before result release. Eligible requester gets REBUILD_PENDING with no old results or preference metadata. Revoked requester gets generic denial. |
| D24-T11 | B22-X05, B23-X01 | Replay old result cursor from another household or after source withdrawal. No protected results, counts or explanation. |

Open evidence: mode commit/replay, provider qualification and listing freshness, ranking and cache version fences. No Owner decision needed to close this design checkpoint. Human response remains deferred. Zero runtime or independent re-review executions.

## Inventory reconciliation

The 94-module depth scope is the 106 L3 in 3.2-R1 less the 12 originally reviewed or scoped in P6/B01/B02. Each row below names the first detailed checkpoint containing the module. This is design disposition coverage. Deferred scope and test execution status remain independent.

| Canonical L3 | First detailed checkpoint | Disposition |
|---|---|---|
| F01-G01-M01 | [14](Feature_3_2_L4_Detailed_Review_Group_14_Identity_and_Verification_REVIEW.md) | Detailed candidate |
| F01-G01-M02 | [01](Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md) | Detailed candidate |
| F01-G02-M02 | [01](Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md) | Detailed candidate |
| F01-G03-M01 | [14](Feature_3_2_L4_Detailed_Review_Group_14_Identity_and_Verification_REVIEW.md) | Detailed candidate |
| F01-G03-M02 | [14](Feature_3_2_L4_Detailed_Review_Group_14_Identity_and_Verification_REVIEW.md) | Detailed candidate |
| F01-G05-M02 | 24 | Detailed candidate |
| F01-G06-M01 | [03](Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md) | Detailed candidate |
| F01-G06-M02 | [09](Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md) | Detailed candidate |
| F01-G06-M03 | [09](Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md) | Detailed candidate |
| F02-G01-M01 | [15](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) | Detailed candidate |
| F02-G01-M02 | [15](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) | Detailed candidate |
| F02-G02-M01 | [15](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) | Detailed candidate |
| F02-G02-M02 | [15](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) | Detailed candidate |
| F02-G03-M01 | [15](Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md) | Detailed candidate |
| F02-G03-M02 | [16](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md) | Detailed candidate |
| F02-G04-M01 | [16](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md) | Detailed candidate |
| F02-G04-M02 | [16](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md) | Detailed candidate |
| F02-G05-M01 | [16](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md) | Detailed candidate |
| F02-G05-M02 | [17](Feature_3_2_L4_Detailed_Review_Group_17_Feedback_and_Corrections_REVIEW.md) | Detailed candidate |
| F02-G06-M01 | [17](Feature_3_2_L4_Detailed_Review_Group_17_Feedback_and_Corrections_REVIEW.md) | Detailed candidate |
| F02-G06-M02 | [17](Feature_3_2_L4_Detailed_Review_Group_17_Feedback_and_Corrections_REVIEW.md) | Detailed candidate |
| F03-G01-M01 | [18](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) | Detailed candidate |
| F03-G01-M02 | [18](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) | Detailed candidate |
| F03-G02-M01 | [18](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) | Detailed candidate |
| F03-G02-M02 | [18](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) | Detailed candidate |
| F03-G03-M01 | [18](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md) | Detailed candidate |
| F03-G03-M02 | [19](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) | Detailed candidate |
| F03-G04-M01 | [19](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) | Detailed candidate |
| F03-G04-M02 | [19](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) | Detailed candidate |
| F03-G04-M03 | [19](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) | Detailed candidate |
| F03-G05-M01 | [19](Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md) | Detailed candidate |
| F03-G05-M02 | [20](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) | Detailed candidate |
| F03-G05-M03 | [20](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) | Detailed candidate |
| F03-G06-M01 | [20](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) | Detailed candidate |
| F03-G06-M02 | [20](Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md) | Detailed candidate |
| F04-G01-M02 | [21](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md) | Detailed candidate |
| F04-G02-M01 | [21](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md) | Detailed candidate |
| F04-G02-M02 | [21](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md) | Detailed candidate |
| F04-G03-M01 | [21](Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md) | Detailed candidate |
| F04-G03-M02 | [04](Feature_3_2_L4_Detailed_Review_Group_04_Plan_Changes_REVIEW.md) | Detailed candidate |
| F04-G04-M01 | [22](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) | Detailed candidate |
| F04-G04-M02 | [22](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) | Detailed candidate |
| F04-G05-M01 | [22](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) | Detailed candidate |
| F04-G05-M02 | [05](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) | Detailed candidate |
| F04-G07-M01 | [22](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) | Detailed candidate |
| F04-G07-M02 | [22](Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md) | Detailed candidate |
| F05-G01-M01 | [02](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) | Detailed candidate |
| F05-G01-M02 | [02](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) | Detailed candidate |
| F05-G02-M01 | [12](Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md) | Detailed candidate |
| F05-G02-M02 | [12](Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md) | Detailed candidate |
| F05-G03-M01 | [12](Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md) | Detailed candidate |
| F05-G03-M02 | [12](Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md) | Detailed candidate |
| F05-G04-M01 | [13](Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md) | Detailed candidate |
| F05-G04-M02 | [13](Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md) | Detailed candidate |
| F05-G05-M01 | [13](Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md) | Detailed candidate |
| F05-G05-M02 | [13](Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md) | Detailed candidate |
| F05-G06-M02 | [03](Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md) | Detailed candidate |
| F06-G01-M01 | [06](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md) | Detailed candidate |
| F06-G01-M02 | [05](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) | Detailed candidate |
| F06-G02-M01 | [06](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md) | Detailed candidate |
| F06-G02-M02 | [06](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md) | Detailed candidate |
| F06-G03-M01 | [06](Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md) | Detailed candidate |
| F06-G03-M02 | [23](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) | Detailed candidate |
| F06-G04-M01 | [23](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) | Detailed candidate |
| F06-G04-M02 | [23](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) | Detailed candidate |
| F06-G05-M01 | [05](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) | Detailed candidate |
| F06-G05-M02 | [05](Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md) | Detailed candidate |
| F06-G06-M01 | [23](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) | Detailed candidate |
| F06-G06-M02 | [23](Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md) | Detailed candidate |
| F07-G01-M01 | [10](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md) | Detailed candidate |
| F07-G01-M02 | [10](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md) | Detailed candidate |
| F07-G02-M01 | [10](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md) | Detailed candidate |
| F07-G02-M02 | [10](Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md) | Detailed candidate |
| F07-G03-M01 | [02](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) | Detailed candidate |
| F07-G03-M02 | [11](Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md) | Detailed candidate |
| F07-G03-M03 | [11](Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md) | Detailed candidate |
| F07-G04-M01 | [11](Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md) | Detailed candidate |
| F07-G04-M02 | [11](Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md) | Detailed candidate |
| F07-G05-M01 | [02](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md) | Detailed candidate |
| F07-G05-M02 | 24 | Detailed design boundary; initial release deferred |
| F07-G07-M01 | [09](Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md) | Detailed candidate |
| F07-G07-M02 | [09](Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md) | Detailed candidate |
| F08-G01-M01 | [07](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) | Detailed candidate |
| F08-G01-M02 | [07](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) | Detailed candidate |
| F08-G02-M01 | 24 | Detailed candidate |
| F08-G02-M02 | [07](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) | Detailed candidate |
| F08-G03-M01 | 24 | Detailed candidate |
| F08-G03-M02 | 24 | Detailed candidate |
| F08-G04-M01 | [07](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) | Detailed candidate |
| F08-G04-M02 | [07](Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md) | Detailed candidate |
| F08-G05-M01 | [08](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) | Detailed candidate |
| F08-G05-M02 | [08](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) | Detailed candidate |
| F08-G06-M01 | [08](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) | Detailed candidate |
| F08-G06-M02 | [08](Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md) | Detailed candidate |


## 2026-11-14 Owner gate overlay — OD-02 and OD-05

[Owner-approved OD-02/05](Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md) applies to Activity Directory and Resource Matching: no sponsored listing/offer/rank promotion for users under 18 (A0–A4) in first release, including cached or paginated output or sponsored recommendation disguised as organic. Parent/eligible-adult commercial presentation stays separately gated. All AI-generated user-facing explanations of matches, including non-education requests, require current approved answer-scope evidence and output validation; no automatic web/LLM sourcing grant. Synthetic tests OD02-T01..03 and OD05-T01..03 pending independent re-review.
