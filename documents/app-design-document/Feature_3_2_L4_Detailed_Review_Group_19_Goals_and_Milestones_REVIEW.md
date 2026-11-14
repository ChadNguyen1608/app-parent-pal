# Detailed review 19 · Accessible guidance, goals and milestones

Candidate design. Source `7e5a25d451e8e233d53a54dc7521ba811394d9b2`. Synthetic fixtures only.

- [Feature_3_2_L4_B14_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B14_Design_and_Checkpoint_REVIEW.md), blob `d813f9775e4c61a1616dbbc3ab361839c1154603`.
- [Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md), blob `0ef82b41aef07ddb151fcffc42fa8b69de569f3c`.
- [Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md), blob `cb87b431d58fb9ff1620d426896e0ed18dbb6d29`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), B01-PA-OD-01..04 and B01-C-OD-07.

## F03-G03-M02 · Accessibility Adaptation

Own approved format mappings and their equivalence evidence, applicability, locale and version. Select an eligible alternative only from the actor's current authorized projection. Preserve instructions, qualifications, source references and limitations relevant to the action; accessible formatting cannot create a different approval outcome or include hidden fields. User-selected format is a presentation preference and provides no evidence of disability or developmental stage. Compare source projection, mapping and authority at release, including replay. If no equivalent eligible format is available, show a scoped unavailable state and offer the original only when independently authorized and usable by choice. Unverified transformations cannot substitute for reviewed content.

## F03-G04-M01 · Goal Discovery

Own scoped candidate goal, source of intent, version, state and any framework reference. An eligible actor may enter or explicitly select a goal; recommendations and caregiver suggestions remain attributed. Skipping or exiting creates no goal. A draft has no effective milestone or schedule impact. At save, compare current authority, base version for edits and operation digest. Identical authorized retry returns prior receipt; divergent replay conflicts. Two edits against the same base require reconciliation. Selecting a suggested goal may create a draft only on explicit eligible action. Caregiver proposal does not imply child assent or automatic approval.

## F03-G04-M02 · Goal Constraints

Own a versioned assessment tied to the exact candidate goal, subject, applicable constraints and input versions. Distinguish pass, fail and unknown by criterion; mandatory failure or missing mandatory evidence prevents a ready-to-approve result. An eligible draft remains available with scoped reasons. Missing capacity is not treated as zero, and optional evidence does not substitute for a mandatory criterion. Evidence revisions, expiry and scope changes invalidate dependent assessments. Compare current input versions before roadmap commit. This assessment does not waive protected plan constraints; F04 Balanced Planning retains schedule validation authority. Concrete thresholds and evidence criteria remain open.

## F03-G04-M03 · Development Roadmap & Milestones

Own versioned roadmap, goal and milestone relations, acceptance criteria, approval reference and effective state. Authorized approval binds exact proposal, constraints assessment and base roadmap version. Only an eligible commit creates the effective milestone revision. Compare actor scope, approval validity and all mandatory constraints at commit. Concurrent writes against one base yield at most one commit. If a response is lost, reconcile by scoped operation and digest before retry. Same authorized replay cannot create another milestone. Preserve lawful provenance and notify downstream consumers through a scoped change reference. F04 owns schedules and task execution; roadmap approval does not mutate them. Any later change uses the appropriate goal or roadmap proposal path.

## F03-G05-M01 · Grounded Recommendation

Own recommendation candidate, purpose, goal/context versions, source manifest, route and review eligibility. Advisory output may be selected by the user into discovery; it never creates an effective goal, milestone or schedule itself. Use current approved framework and internal content first for technical education queries, prefer E0/E1 rules where sufficient, and allow web or model fallback only under checkpoint 02's independent authority, purpose, scope and provider gates. Minimize data sent externally and keep Journal out absent a separately approved workflow. Missing or conflicting required evidence yields abstention for affected advice. Check the actual answer against question scope and sources before release. Withdrawal after preflight invalidates stale output and cache; any new answer requires independent eligibility. Safety signals follow the reviewed trusted-adult suggestion path. No diagnostic label or unsupported certainty.

## Authority, cohorts and data

Access Policy issues final ALLOW/DENY; Purpose-bound Access supplies current purpose/legal evidence. Subject, caregiver, editor, approver and reviewer permissions are distinct. A0/A1 caregiver-mediated or supervised where eligible, A2 assisted choice, A3/A4 eligible subject-led input and feedback, A5 verified adult self-management and voluntary family sharing. Format preference and cohort never grant authority. Unknown lawful basis blocks real child data. Audit carries scoped IDs and outcome metadata, without raw private inputs. Core state transitions and checks are E0/E1; optional inference remains conditional.

| Oracle | Trace | Synthetic fixture and expected result |
|---|---|---|
| D19-T01 | B14-T01/X01 | Accessible format requested from a projection with a restricted field; scope revoked before release. Adaptation never includes that field and the stale response discloses nothing. |
| D19-T02 | B14-T01 | Equivalent approved mapping missing or retired. No fabricated replacement; only independently authorized alternatives may be offered. |
| D19-T03 | B14-T02/X02 | Child skips or actor loses draft authority before save. No new goal, milestone or schedule change. |
| D19-T04 | B14-T02 | Explicit selection of advisory recommendation, followed by identical and divergent retries. One draft; changed payload conflicts; no effective milestone. |
| D19-T05 | B14-T03 | Mandatory capacity evidence missing, optional evidence valid. Draft remains available; readiness UNKNOWN and no activation. |
| D19-T06 | B14-X03, D16-T04 | Context changes after constraints pass but before milestone commit. Old assessment cannot authorize commit; reassess from current evidence. |
| D19-T07 | B14-T04 | Two eligible milestone approvals target same base; winning response lost. At most one revision, authorized retry reconciles, zero schedule writes. |
| D19-T08 | B14-X04 | Approval expires or approver loses authority before commit. No effective roadmap or milestone change. |
| D19-T09 | B14-T05/X05 | Grounding or model eligibility withdrawn while answer builds. No stale AI output through initial response, cache or fallback. |
| D19-T10 | D02-T01/T02 | Adequate internal evidence versus insufficient internal evidence and unapproved external route. First yields scoped internal guidance; second abstains with no external call. |
| D19-T11 | D02-T05, B14-T05 | Eligible safety signal during goal guidance. Only reviewed trusted-adult suggestion; no generated recommendation, external contact or roadmap action. |

Open evidence: accessibility equivalence, constraint thresholds, approval eligibility and runtime version/release fencing. No new Owner decision needed for this design checkpoint. No runtime tests or independent re-review executed.
