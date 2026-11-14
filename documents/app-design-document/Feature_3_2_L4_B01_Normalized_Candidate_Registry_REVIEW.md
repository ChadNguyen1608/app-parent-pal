# Parent-Pal — Batch 01 Normalized L4 Candidate Registry

**Date:** 2026-11-13  
**Status:** `NORMALIZED_REFERENCE / CANDIDATES_ONLY / NOT_CANONICAL_ACCEPTED`  
**Scope:** the **five Batch 01 L3 modules**; P6 three pilot modules are kept in a separate contract/dependency matrix, **not** counted in the 25 entries.  
**Evidence:** Original C4 Consolidation `B01_Consolidation.zip/B01_Consolidation/C4_Consolidated_L4_Candidate_Inventory.md`; evidence repo `parent-pal-evidence@4209d52af3f233f69af26898fdf5e71988a477d7`. C4's historical implementation statements are superseded when inconsistent with later 42 Owner Decisions or v1→v3.1 corrections. Original C4 ZIP is not claimed to be immutably stored in the evidence repository.  
**Policy precedence:** approved Owner Decision Logs → applicable canonical Product Blueprint → independently verified nonconflicting spec-level fixes (v3 lock/CR) → v3.1 proposed clarifications (review pending) → C4 original reference → prior pilots. For `LEGAL_UNKNOWN`, real child personal data processing stays DENIED.

## 1. Normalized index (original temporary IDs preserved)

| ID | L3 owner | Normalized capability | C4 disposition | Scope/status |
|---|---|---|---|---|
| B01C-L4-01 | F01-G04-M02 | Capture scoped consent + authority provenance | KEEP | CONDITIONAL; legal provenance gate |
| B01C-L4-02 | F01-G04-M02 | Revoke caregiver-managed consent, independent child Journal revoke | KEEP | CONDITIONAL; no supporter revoke |
| B01C-L4-03 | F01-G04-M02 | Reassess consent validity on context change | KEEP | CONDITIONAL; no blanket handover revoke |
| B01C-L4-04 | F01-G04-M02 | Resolve consent evidence/state for Access Policy | KEEP | CONDITIONAL; cannot independently ALLOW |
| B01C-L4-05 | F01-G04-M02 ↔ F05-G06-M01 | Child assent / sharing consent evidence | DEFER | `DEFERRED_WITH_GATE`; Journal sharing disabled pending owner module |
| B01C-L4-06 | F01-G04-M02 | View versioned consent history | KEEP | CONDITIONAL; access-scoped |
| B01C-L4-07 | F01-G05-M01 | Commit per-child autonomy mode | KEEP | CONDITIONAL; authorized caregiver or verified adult |
| B01C-L4-08 | F01-G05-M01 | Resolve effective autonomy mode | KEEP | CONDITIONAL; UNSET fail-closed for schedule |
| B01C-L4-09 | F07-G06-M01 | Purpose binding assessment gate | KEEP | CONDITIONAL; final DENY/ALLOW belongs Access Policy |
| B01C-L4-10 | F07-G06-M01 | Govern versioned purpose catalog | KEEP | CONDITIONAL; Owner-approved purpose does not establish lawful basis |
| B01C-L4-11 | F07-G06-M01 | Restrict/quarantine derived data, caches, indexes | KEEP | CONDITIONAL; unknown lineage fail-closed |
| B01C-L4-12 | F07-G06-M01 | Propagate revocation and invalidate access decisions | KEEP | CONDITIONAL; async consumers recheck |
| B01C-L4-13 | F04-G01-M01 | Author/save plan draft | KEEP | CONDITIONAL; failed Standard Bar draft allowed |
| B01C-L4-14 | F04-G01-M01 | Baseline commit + version restore through same safety gate | MERGE | CONDITIONAL; no bypass on restore |
| B01C-L4-15 | F04-G01-M01 | Resolve effective plan state and validation snapshot | KEEP | CONDITIONAL; stale verdict rejected |
| B01C-L4-16 | F04-G01-M01 + F04-G06-M02 | Version lineage/snapshot **split from** reason/approver history | SPLIT | **Two effective parts; second depends on unpiloted history module** |
| B01C-L4-17 | F04-G01-M01 | Plan lock/unlock/authorized override | KEEP | CONDITIONAL; independent lock-admin permission |
| B01C-L4-18 | F04-G01-M01 | Caregiver-authorized plan overwrite | KEEP | CONDITIONAL; adult/safety constraints |
| B01C-L4-19 | F04-G01-M01 | Plan lifecycle and primary subject | KEEP | CONDITIONAL; archive/restore rules |
| B01C-L4-20 | F04-G01-M01 | Goal/milestone and schedule reference integrity | MERGE | CONDITIONAL; shared activity scope |
| B01C-L4-21 | F04-G01-M01 | External plan import into draft | DEFER | `DEFERRED_OUT_OF_CURRENT_SCOPE` |
| B01C-L4-22 | F04-G06-M01 | Submit/withdraw Change Request | MERGE | CONDITIONAL; no fake APPROVED for direct edit |
| B01C-L4-23 | F04-G06-M01 | Approver decision on exact proposal revision | KEEP | CONDITIONAL; no approval on locked plan/hard-cap fail |
| B01C-L4-24 | F04-G06-M01 | Approval validity, reassessment, expiry, handover | KEEP | CONDITIONAL; complete CR state machine |
| B01C-L4-25 | F04-G06-M01 ↔ F04-G01-M01 | Commit handoff, result reconciliation and idempotency | KEEP | CONDITIONAL; APPROVED ≠ APPLIED |

**Counts:** 25 original C4 registry entries = KEEP 19 + MERGE 3 + SPLIT 1 + DEFER 2. Entry 16 has two scope components, so **23 non-deferred entries yielding 24 effective capability parts**; these 24 are **not stable/accepted feature IDs**. P6 reported 4 Access Policy +4 Academic Assessment +3 Balanced Planning L4 candidates **separately**; no cross-cohort distinct L4 total is asserted.

## 2. Controlling invariants, mapped to candidate IDs and Owner decisions

| Reference | Candidate IDs | Normative contract / test oracle | Owner anchors |
|---|---|---|---|
| NORM-01 | 01–04,06,09–12 | Access Policy provides final ALLOW/DENY; consent evidence, purpose assessment and legal basis are distinct; `UNKNOWN` with real-child PII → DENY across cache, AI, worker, export | P6-AP-OD-01..05; B01-CL-OD-01..04; B01-PA-OD-01..04 |
| NORM-02 | 02,03,05,11,12 | Journal share revoke is immediate for new access; derived data/unknown lineage quarantined; notification opt-in, default off; delete separately via 60-day policy | B01-C-OD-02; B01-PA-OD-03; B01-CL-OD-04 |
| NORM-03 | 07,08,13,17,22 | One mode per child, Parent-led intent only through F05, Child-executed draft/proposal, Child-directed bounded direct edit; mode never grants Journal or lock-admin | B01-MS-OD-01..04; B01-C-OD-08 |
| NORM-04 | 07,08,17,18,22–25 | Child schedule delegated rights **survive Primary handover** with fresh mutation rights checks; caregiver-manage grants separate; approved-but-not-applied CR needs new Primary reapproval | B01-C-OD-01; B01-CR-OD-02; P6-AP-OD-02 |
| NORM-05 | 13–15,17,18,20,25 | Lock prevents effective timetable mutation; permitted draft/offline allowed; `schedule:*` never implies lock-admin; no auto-unlock, explicit unlock or audited override only | B01-PS-OD-04; B01-C-OD-05/06 |
| NORM-06 | 13–15,18,20,23–25 | Draft may violate Standard Bar; discussion-only hard-cap proposal allowed; protected hard-cap cannot APPROVE/APPLY/COMMIT; verified default bar used when no family bar | B01-PS-OD-02; B01-CR-OD-05; P6-BP-OD-01..03 |
| NORM-07 | 14–16,22–25 | F04-G06 handles request/approval; F04-G01 commits actual version; F04-G06-M02 retains reason/approver history; same idempotency key cannot create second commit | B01-PS-OD-01; B01-CR-OD-01..04 |
| NORM-08 | 22–25 | Pending TTL 7d from submit; approved-but-not-applied TTL 7d from approval; handover reapproval and context invalidation, authoritative server boundary | B01-CR-OD-02/04; B01-C-OD-03 |
| NORM-09 | 17,18,19,20,23 | Self-managed verified adult has final authority for own timetable; former caregiver cannot override; shared activities cannot bypass another plan lock | P6-AP-OD-04; B01-PS-OD-04/05 |
| NORM-10 | 09–12,14–17,24,25 | F07 owns audit governance, infra owns logging mechanism; no raw Journal content in audit; no use of private data for CR/plan AI without permission | B01-C-OD-07; B01-PA-OD-01/03 |

**Change-rule override:** v3 lock-admin split and complete CR transitions were independently accepted at *specification* level in focused review; v3.1 clauses about invalidation, OUTCOME_UNKNOWN fencing, approval on locked plan, revision TTL, UNLOCK validation and extra test oracles remain **proposed** and must be explicitly preserved in later detailed design. Neither is an app test.

## 3. Concrete interface contracts for Batch 02 consumers (proposed technical shape)

| Interface ID | Provider → Consumer | Minimum output and fail condition |
|---|---|---|
| IC-01 | Consent Ledger → Access Policy | consent_state, scope, version, provenance, current authority validity; missing/unknown is non-allow |
| IC-02 | Purpose-bound Access → Access Policy | purpose_assessment + legal_basis status by operation/resource/purpose/time; unknown cannot ALLOW real PII |
| IC-03 | Mode State → Access Policy, Plan Structure, CR | child effective mode + mode_version; UNSET limits schedule authority |
| IC-04 | Access Policy → Plan Structure and CR | final authorization decision + actor/subject/grant/scope version; stale invalid |
| IC-05 | Balanced Planning → Plan Structure and CR | validation verdict + constraint revision + protected hard-cap codes; UNKNOWN not PASS |
| IC-06 | Change Requests → Plan Structure | approval evidence + exact revision + original expiry + expected plan_version + stable op id; approval is not commit |
| IC-07 | Plan Structure → Change Requests/History | commit outcome (APPLIED/version/ledger receipt or OUTCOME_UNKNOWN), durable idempotency correlation |
| IC-08 | F05 Journal sharing → F07 Purpose/Access | explicit child sharing state/epoch, revoke events + lineage; absent module → no sharing |
| IC-09 | F07 Audit Governance → Infra | event schema, retention/access/minimization constraints; infra persists integrity-protected audit |
| IC-10 | F01 Child App linking → Consent/Mode/Plan | verified child-parent account binding and revocation; unverified identity cannot access parent's plan |

These are **contracts to check**, not claimed implemented APIs. All actual reads/commits require server-side gate, not trust client-provided mode, mock, approval, legal-basis, grant or lock flags.

## 4. Open issues, not silently closed

1. 46 consolidation findings requiring spec edit are **not** individually closed without finding→AC/test evidence; this normalized index records the controlling contracts, not 46 verified patches.
2. 9 HIGH regression gaps from consolidation are **not** all closed by the two focused v3 findings; 2 need unpiloted module designs, 1 legal research. Keep RG-10,11,13 and related research open.
3. 59/64 P5 baseline matched IDs (five missing, nine ambiguous) and P6 unresolved Academic F-023, Balanced F-021 remain evidence gaps.
4. Unpiloted dependencies: F01-G02-M01 Child App link, F05-G06-M01 Journal sharing, F07-G06-M02 deletion/retention, F04-G06-M02 history; also Mode transition F01-G05-M02 and grant lifecycle concerns.
5. Real child data gate CLOSED pending privacy/legal research MR-016/017/021/022 and per-purpose lawful basis determination. No inference of legal compliance from Owner consent choices.
6. C4 original 392 design tests after dedup, 17 proposed NT tests, extra corrections NT-018..022 & V3/v3.1 are **proposed design oracles**, not runtime PASS. Do not add to a falsely deduped count without mechanical registry check.
7. No final L4 acceptance, no product implementation gate, no automatic Batch 02 go.

## 5. Traceability and change governance

- **Original C4 labels and original candidate source ID** are retained in `B01_Consolidation.zip`. This file provides the safe cross-module normalized reference index, not re-authoring all 64 KB of original candidate narratives.
- Every future feature spec must trace: `L3 → B01C-L4-xx → NORM/IC → OwnerDecision → AC → DesignTest → Finding/Evidence → Status`.
- Maintain `DEFER` items as explicitly blocked capabilities; deferred Journal sharing/assent must not be enabled by another module as an implicit shortcut.
- Changing an Owner rule requires a new Owner decision log; not permitted as a silent “technical refinement”.
