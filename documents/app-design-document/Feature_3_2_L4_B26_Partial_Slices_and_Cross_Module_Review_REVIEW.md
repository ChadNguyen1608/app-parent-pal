# Parent-Pal · B26 · Partial slices and cross-module review

Design candidates · Source commit `d28ea9ba58584c67b7e6ff7b1bb7bd095f2a5d51` · inventory blob `f52be52f5ae37ddce0b6a021aec915659f357db3` · see [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md).

This three-module integration group closes the draft disposition for the two B02 partial slices and reconciles the existing F01 lifecycle interface with F07 export. Source authority remains the 42 approved Owner decisions. No approval, runtime test or legal clearance is implied.

| Candidate / interface | Owner and scope | Acceptance criteria and oracle |
|---|---|---|
| CAND-F01-G02-M01-establish-household | Family Structure establishes one scoped household with version and initiator provenance. Membership, role, verified child identity and legal authority stay with their respective owners. Where valid owner evidence is unavailable, creation yields setup pending and no protected permissions. E0. | B26-T01. Replay same creation after timeout and try divergent payload. One household fact, conflicting replay rejected. No caregiver or child data grant inferred. |
| CAND-F01-G02-M01-update-household | Authorized actor updates permitted household metadata with current scope and base version. Removal, relationship and primary handover use their own workflows. E0. | B26-T02. Concurrent updates based on same version yield at most one commit. A household metadata change cannot add an account or promote a caregiver. |
| CAND-F07-G06-M02-fulfill-export | F07 owns fulfillment policy and evidence. Classify authorized resource versions, stage only current permitted data, record scope and policy/visibility epochs. F01-G06-M01 handles the requester workflow. Expired/revoked authorization or suppression invalidates staged artifact before delivery and triggers scoped cleanup. E1. | B26-T03. Request contains two subjects and one later tombstone. Release only permitted data under fresh authorization or hold the artifact for rebuild. No unauthorized existence signal. |
| F01-G06-M01 existing receive interface | Lifecycle Controls exposes status and authorized delivery reference. F07 evidence is authoritative for fulfillment; releasing a status cannot release content. Both staged data and status require subject/purpose scope. E1. | B26-T04. Artifact built successfully then requester loses rights. Status/artifact reference denied; replay cannot regenerate or release under the old scope. |

Synthetic only. For A0–A1, authorized caregiver setup or rights workflow is conditional. For A2–A4, guided or subject-led rights request is conditional on current policy and verified authority. A5 retains verified adult control. Scope uncertainty routes to verified assistance. Cohort supplies no authority. Operational cost and proof thresholds UNKNOWN. The data owners above have distinct write authorities. No raw sensitive evidence or Journal content in audit.

## Cross-module review findings and dispositions

| Surface | Constraint and source | Review disposition |
|---|---|---|
| Family membership / account / authorization | B02/B03/B04, P6-AP-OD-01/03/04, B01-CL-OD-01. Authentication supplies identity, household supplies scope, membership supplies affiliation, link supplies binding, Access Policy issues permission. | Candidate ownership aligns. ODP-01 prohibits cross-household transfer, including via support or recovery. Dispute verification remains open without transfer authority. |
| Plan version / CR / history | B01-PS-OD-01, B01-CR-OD-01..05 and B01-C-OD-01/03/05/06. F04 proposal and routing cannot commit. Plan Structure commits with durable history evidence. | Candidate owner split aligns across B02/B03/B16–B18. Linearization and replay remain verification gates. |
| Journal / insights / sharing / deletion | B01-CL-OD-04, B01-PA-OD-03/04, B01-C-OD-02. All derivatives need source lineage and current release authority. Revoke is immediate and distinct from deletion. | B02/B03/B04/B08/B09/B20/B21/B26 share the same ownership contract. Graph completeness, voice processing and backup behavior remain open. |
| Routing / policies / budget / billing | B05–B07/B25, P6-AA-OD-04. Product approval covers evaluation/routing design; tariff, quota, price and deployment eligibility remain open. | Inference stays conditional; usage reservation, subscription and invoice reconciliation have separate owners. Runtime negative evidence pending. |
| Learning submissions and claims | B18–B21, P6-AA-OD-01..04. Task evidence, parent verification, school provenance and reports are distinct. | Evidence owner boundaries align. Historic P5/P6 evidence gaps remain open. |
| Integrations / referrals / commerce | B22–B25 and B01-PA-OD-01..04. External release requires purpose, current scoped authorization and a reviewed recipient. | Provider readiness and business policies remain unresolved; fail closed on uncertain authority or outcome. |

Structural check: three canonical modules, three additional unique candidate IDs, four new synthetic oracles. B26-I01 HIGH: prove expiry, epoch fencing and cleanup across export stores and delivery. Existing BI-01..10 and BI-12 remain subject to their recorded dispositions. Independent Claude review pending.

Current design amendment: [Owner decision implementation and evidence](Feature_3_2_L4_Owner_Decision_Implementation_and_Evidence_REVIEW.md). Its ODP acceptance criteria apply where this checkpoint handles the affected operation.
