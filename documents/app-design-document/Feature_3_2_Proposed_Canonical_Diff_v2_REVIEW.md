# PARENT-PAL — FEATURE INVENTORY 3.2
## Proposed Canonical Diff v2 — L3 Resolution Incorporated

**Version:** 2.0  
**Date:** 2026-11-10  
**Status:** `OWNER_APPROVED_L3_RESOLUTION / PROPOSED_CANONICAL_PATCH / NOT_APPLIED`  
**Target (NOT edited):** `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md`, baseline approved 2026-11-07.  
**Decision basis:** Package A–E proposal decisions, `CON-D01..04`, `L3R1-D01..06`, and AUD-01..17 dispositions in `Feature_3_2_L3_Resolution_Decision_Log_APPROVED.md`.  
**Scope control:** This is a **reviewable semantic patch**, not an applied git diff. No changes to 3.2/3.3/3.4, code, Research Backlog or GitHub. Applying this document requires a **separate owner instruction**.

## 0. Summary of v2 versus v1

| Item | v1 (2026-11-09) | v2 (this proposal) |
|---|---|---|
| Candidate totals | 8 Domains / 51 Groups / 106 L3 | **Unchanged** |
| New Groups / L3 | 2 / 8 | **Unchanged**, IDs checked |
| Decision status | Consolidation choices approved, canonical pending | **Round 1 R1-Q1..Q6 approved**, still canonical pending |
| Ownership | Cross-domain contracts in v1 | Add **explicit `L3C-01..07`** and clear source-of-truth exclusions |
| Trace | Scenario matrix in separate file | Add **`L3T-01..08`** candidate links, not official UC IDs |
| Cohort | Two new Group rows suggested | Two rows **owner-accepted as proposal**, with `P*` / participation caveats |
| Audit | Broad unresolved items | Add **AUD-01..17 dispositions** and downstream gates |
| L4 | Eight illustrative placeholders | Explicitly **defer L4 completeness**; not an L3 blocker |
| GitHub | Not applied | **Not applied; no PR authorized** |

### Rebuttal / non-obvious constraints

- **Do not relabel the baseline's 98 L3 as fully validated.** Only structural candidate decisions are approved.
- **Do not turn a sample-count convention into a rule:** `F06-G07` legitimately has **one** L3; the old “2 modules per Group” describes only the 49-Group baseline.
- **Do not claim AUD-01 closed in 3.4:** the eight trace contracts are minimum ownership evidence; full UC flows and official IDs are pending.
- **Do not silently rewrite `F01-G06-M02` historical ID:** keep ID and annotate the narrowed entitlement scope; billing lifecycle belongs to new `M03`.
- **Do not treat safety/retention/age as approved implementation:** they remain validation and release gates.

## 1. Exact section-by-section proposed changes to official 3.2

### Patch P-01 — Header, revision history, and status

**Existing header:** `APPROVED — 3.2 / Q1–Q6` dated 2026-11-07, 49 Groups.  
**Proposed action:** preserve original approval and date as **baseline history**. Append revision entry *only when applied*:

> `Revision 3.2-R1 (application date: TBD): L3 structural expansion approved by L3R1-D01..06; 8 Domains / 51 Groups / 106 illustrative/candidate L3. L4 and 3.4 UC completeness not approved; MVP not selected.`

Do not retroactively claim that the 2026-11-07 approval included the eight new L3. If applied, use status such as `APPROVED_STRUCTURE_REVISION / L4_PENDING`, not `ALL_FEATURES_APPROVED`.

### Patch P-02 — Section 1 (Q1–Q6) and Section 2 (hierarchy/IDs)

- Preserve all original Q1–Q6 decisions and rationale.
- Under Q4, annotate **49 Groups was the approved historical baseline**; controlled additions `F06-G07`, `F08-G06` yield 51 Group candidates for the next approved revision.
- Preserve four levels `L1 Domain → L2 Group → L3 Module/Capability → L4 Individual Feature` and immutable ID rules.
- Clarify **two L3/L4 examples per Group** was a baseline *illustration*, not an invariant for new Groups. Do not generate dummy `F06-G07-M02` to force equal counts.
- Keep L4 metadata schema; **do not** create “complete” L4 records in this patch.

### Patch P-03 — Section 3, Age Coverage Matrix

Change section heading **“49 Feature Groups × 6 giai đoạn” → “51 Feature Groups × 6 giai đoạn (revised structure)”** only at application time. Keep the existing 49 rows unchanged; add exactly two rows in the appropriate domain order:

| Group | 0–2 (A0) | 3–5 (A1) | 6–10 (A2) | 11–14 (A3) | 15–17 (A4) | 18–23 (A5) |
|---|---|---|---|---|---|---|
| `F06-G07` | `P*` | `P*` | `S` | `C` | `Y` | `U` |
| `F08-G06` | `P` | `P` | `P/S*` | `S*` | `S/Y*` | `U` |

**Required footnote:** `*` = participation depends on relevance, consent and authorized role. `P/S/C/Y/U` are **interaction patterns, not permission grants**. For A0/A1, academic assessment is not compulsory school grading; for A5, no implicit parent access to an adult user's data. At L4, each action needs its own permission/age assessment.

### Patch P-04 — Section 4, Feature Inventory (precise ADD/EXTEND)

**4.1 ADD two Groups**

| New L2 | Domain | Definition | New L3 |
|---|---|---|---|
| `F06-G07` Academic Learning Assessment | F06 Tracking & Insights | Rubric-based assessment, review/correction, provenance of learning results; **not** task submission or general developmental indicator taxonomy | `F06-G07-M01` |
| `F08-G06` Education Finance | F08 Extended Ecosystem | Family education budget, planned/actual expenses, non-payment approvals and authorized reporting; **not** subscription charges, payment gateway, marketplace settlement or wallet | `F08-G06-M01`, `F08-G06-M02` |

**4.2 ADD exactly eight L3**

| Insertion location | ID | Title | Scope statement | Explicit non-owner | Source |
|---|---|---|---|---|---|
| F01-G06, after M02 | `F01-G06-M03` | Subscription Billing Lifecycle | Verified subscription state transitions, renewal/refund/restore, audit/idempotency responsibility | Entitlement authorization, Journal access, education spending | D / CP-11; L3C-04 |
| F03-G04, after M02 | `F03-G04-M03` | Development Roadmap & Milestones | Versioned goals→milestones; controlled approval; handoff to plans | Plan execution and assessment | A / CP-01; L3C-01 |
| F03-G05, after M02 | `F03-G05-M03` | Career Exploration Guidance | Sourced career/industry/skill exploration, exploratory completion without deterministic career verdict | Approval of knowledge sources, public publishing | C / CP-08; L3C-07 |
| F04-G02, after M02 | `F04-G02-M03` | Balanced Planning Validation | Family Standard Bar, hard/soft constraints, leisure preservation, load and season/weather-aware checks | Development goal ownership, unapproved threshold values | A / CP-02; L3C-06 |
| F06-G07, new Group | `F06-G07-M01` | Academic Assessment | Rubric/assessment outcome/review/correction/provenance, AI grading pilot only | Task submission, teacher verification by inference | B / CP-06; CON-D01; L3C-02 |
| F07-G03, after M02 | `F07-G03-M03` | Multimodal Interaction Orchestration | STT/TTS/realtime/vision adapters, modality fallback and consent-sensitive handling | E0–E3 task routing, authorization, automatic raw Journal audio retention | E / CP-14; L3C-05 |
| F08-G06, new Group | `F08-G06-M01` | Education Budget Planning | Budget/forecast/limits linked to children/goals/periods | Payment processing, subscription ledger | D / CP-12; L3C-04 |
| F08-G06, new Group | `F08-G06-M02` | Expense & Approval Management | Education expense records, recurring items, approval and authorized reconciliation | Wallet/stored-value, implicit payment | D / CP-12; L3C-04 |

**4.3 EXTEND / NARROW existing L3 without changing IDs**

| Existing ID / Group | Precise delta | Guardrail |
|---|---|---|
| `F01-G06-M02` | Clarify entitlement/child slots/family benefits; subscription billing lifecycle moves to new M03; optionally rename display title **Entitlements & Subscription Benefits** | Preserve ID, legacy wording in change log, don't duplicate payment authority |
| `F07-G03-M01` / `M02` | M01 owns E0–E3 task routing; M02 execution budget/quota; M03 modality | Authorization from F07-G06 precedes retrieval and execution |
| `F04-G05-M02`, `F06-G05-M01/M02` | Submission provenance distinct from assessment and authorized report | Completion/submission ≠ correctness/teacher verification |
| `F05-G04/G05/G06`, `F07-G06` | Private Journal source/insights/sharing/deletion; purpose-bound cross-domain authorization | No raw/derived leak; NO_CACHE not equal deleting authorized storage |
| `F03-G04/G05/G06`, `F04-G01/G06`, `F06-G06` | Goal/roadmap/career exploration; plan and review handoff | No autonomous major goal changes |
| `F04-G02/G06`, `F03-G02` | Balanced planning, single-count duration, timeboxed approved exceptions | Family Standard Bar cannot be silently overwritten |
| `F07-G01/G02`, `F03-G05`, `F08-G01/G04` | Knowledge provenance, human review, Admissions/Career source lifecycle and external import | `CACHED != VERIFIED != APPROVED` |
| `F07-G05`, `F01-G04`, `F05-G01` | Child safety triage, appropriate recipient selection and child-facing response | No auto-notification to potentially harmful caregiver |
| `F07-G07`, `F04-G07`, `F01-G06` | Support/refund/incident operations and notification delivery constraints | No general support access to private Journal |
| `F08-G05`, `F08-G06`, `F01-G06` | Commerce/finance/billing boundary and sponsored disclosure | Wallet remains DEFERRED |

This table is **not** a license to rewrite all baseline module descriptions. At application, modify only entries needed to express the boundary, and preserve unchanged L3/L4 examples, research refs and historical approval notes.

### Patch P-05 — Section 5, Data Ownership / Cross-Domain Contracts

Append a compact subsection **“3.2-R1 L3 Ownership Contracts”** referencing `L3C-01..07`:

| Contract | Owner chain | Data/permission boundary |
|---|---|---|
| `L3C-01` | F03 → F04 → F06 | Goal/roadmap → plan/execution → assessment/report/feedback |
| `L3C-02` | F04 → F06-G07 → F06-G05 | Evidence submission → assessment → authorized report |
| `L3C-03` | F05 ↔ F07 | Private Journal/derived insight, purpose-bound access and safety workflow |
| `L3C-04` | F01 ↔ F07 ↔ F08 | Subscription entitlement/billing vs AI quota/cost vs education finance/commerce |
| `L3C-05` | F07-G03 ↔ F07-G06/G01/G02 | Task routing/budget/modality vs access and source approval |
| `L3C-06` | F03 ↔ F04 | Development goals/taxonomy vs balanced plan/exception approval |
| `L3C-07` | F07 ↔ F03 ↔ F08 | Knowledge provenance/approval vs guidance vs external connectors |

State explicitly that contracts are **product ownership boundaries**, not committed APIs, physical databases or AI agents. Keep the baseline's Journal source/insight and consent invariants.

### Patch P-06 — Section 6 AI Execution and Section 7 Operations

- Preserve E0–E3 classification as **per action**, not per Domain/Module.
- Reference `Feature_3_2_AI_Routing_Policy_SPEC_DRAFT.md` as **draft implementation policy**; `CON-D02` approves placement of routing responsibility but not all thresholds/technical details.
- Record the four approved-in-principle cache classes: `PUBLIC_APPROVED_KNOWLEDGE`, `SCOPED_NON_SENSITIVE`, `SENSITIVE_RESTRICTED`, `NO_CACHE`. Authorization before retrieval/cache; TTL, key scope, invalidation and provider retention still open.
- Preserve F07-G07 operations, F07-G05 safety and F01-G06 entitlement; no new Admin Domain.
- Keep parent/caregiver AI and child-beneficiary attribution distinct; no approved pricing, numerical quota or subscription tiers.

### Patch P-07 — Sections 8–9 L4 schema and acceptance checklist

- Preserve existing L4 schema and sample records as **illustrations**.
- Add a **L3 structural revision checklist**: 2 Groups, 8 L3, 7 contracts, 8 trace contracts, 2 cohort rows, 17 dispositions, uniqueness/no deletion, no invented L4 completeness.
- Explicitly move `AUD-02` to `L4_ENTRY_REQUIREMENT` and do **not** block L3 revision on a full L4 matrix.
- Keep 3.4 UC expansion as an open traceability deliverable, not a completed checklist item.

### Patch P-08 — Section 10 Research and Section 11 Transition

- Add references to **AUD-01..17 dispositions** in the Round 1 Decision Log, without creating unverified MR IDs or editing the Master Research Backlog.
- Keep safety, privacy/retention, provider handling, assessment benchmark, accessibility, quota/pricing, knowledge sources, research validation and implementation conflict mapping **OPEN** with owners.
- Revise the old terminal line “Dừng tại 3.2. Không tự động chuyển 3.3” into a **versioned transition note**, preserving the historical statement: `L3 revision accepted only after explicit owner authorization; next step is L4 decomposition after canonical PR is reviewed/merged, not automatic MVP/3.3 reprioritization.`

## 2. Trace annex — accepted candidates, not canonical 3.4

| Trace | Trigger / expected outcome | Owner | Forbidden/alternate outcome | Follow-up |
|---|---|---|---|---|
| `L3T-01` | Submit homework → evidence with provenance | F04-G05-M02 | Submission is not grading; missing/illegible allowed | 3.4 UC draft |
| `L3T-02` | Authorized assessment request → rubric/confidence/review | F06-G07-M01 | `UNABLE_TO_ASSESS`, pilot only; no false teacher-verified | 3.4 UC draft, benchmark |
| `L3T-03` | Authorized parent academic report → scoped summary | F06-G05-M01/M02 | No raw/derived Journal disclosure | 3.4 UC draft, privacy tests |
| `L3T-04` | Education budget setup → scoped budget | F08-G06-M01 | No payment charge | 3.4 UC draft |
| `L3T-05` | Expense record/approval → non-payment ledger | F08-G06-M02 | Payer is not blanket data controller | 3.4 UC draft |
| `L3T-06` | Authorized budget report → budget vs actual | F08-G06-M01/M02 | No unapproved subscription/finance conflation | 3.4 UC draft |
| `L3T-07` | Subscription change → verified entitlement/quota | F01-G06-M02/M03 + F07-G03-M02 | Pending/refunded transaction cannot silently grant benefits | 3.4 UC draft, billing tests |
| `L3T-08` | Journal deletion or safety signal → purpose-bound handling | F05-G06 + F07-G05/G06 | No automatic disclosure to unsafe recipient | 3.4 UC draft, safety review |

## 3. Audit issue disposition annex — no unresolved L3 owner

| Issue | L3 disposition | Remaining work / gate |
|---|---|---|
| `AUD-01` | `L3_TRACE_ACCEPTED` | Expand 3.4 UCs; **not full trace coverage** |
| `AUD-02` | `DEFER_TO_L4` | 106 L3 → actual L4 capabilities and acceptance |
| `AUD-03` | `GROUP_AGE_PATTERN_ACCEPTED` | Per-action cohort and adult rights at L4 |
| `AUD-04` | `OWNERSHIP_ACCEPTED` | Billing state, refund, idempotency, quota |
| `AUD-05` | `OWNERSHIP_ACCEPTED` | Academic rubric, pilot, review/correction |
| `AUD-06` | `OWNERSHIP_ACCEPTED` | Journal lineage, deletion, backups/providers |
| `AUD-07` | `POLICY_RESEARCH_GATE` | Child safety recipient policy, expert/legal review |
| `AUD-08` | `OWNERSHIP_ACCEPTED` | Balance evidence and seasonal validation |
| `AUD-09` | `OWNERSHIP_ACCEPTED` | Routing/cache tests and provider retention |
| `AUD-10` | `POLICY_RESEARCH_GATE` | Admissions/Career knowledge validation |
| `AUD-11` | `DEFER_TO_L4` | Data imports, source conflict/dedupe |
| `AUD-12` | `DEFER_TO_L4` | Support/notification/ops alternate flows |
| `AUD-13` | `OWNERSHIP_ACCEPTED` | Non-payment finance ledger and rights |
| `AUD-14` | `OWNERSHIP_ACCEPTED` | Exploration closure, goal versioning |
| `AUD-15` | `RESEARCH_MAPPING_GATE` | Map to existing MR backlog; 3.3 scoring later |
| `AUD-16` | `DEFER_TO_L4` | Accessibility/cohort variants |
| `AUD-17` | `IMPLEMENTATION_RECONCILIATION_GATE` | Conflict map against existing Pal docs/code **before development tasking** |

## 4. Application integrity checklist (run only after explicit approval)

- [ ] Product Owner separately authorizes **apply Diff v2 to official 3.2** and **create GitHub PR**; PR merge remains manual.
- [ ] Re-read `main` baseline and check no concurrent conflicting edits; use a new branch, no force push.
- [ ] Preserve the 98 original L3 IDs and 49 original Group IDs; **zero unintended deletions**.
- [ ] Add exactly 2 Group IDs (`F06-G07`, `F08-G06`) and exactly 8 L3 IDs; **do not create `F06-G03-M03`**.
- [ ] Check revised totals 8 Domains / 51 Groups / 106 distinct L3 IDs; Age Matrix exactly 51 distinct Group rows.
- [ ] Keep L4 placeholder/example status honest; no forced 1 L3 = 1 L4 and no fabricated research/UC IDs.
- [ ] Preserve Q1–Q6 baseline history and mark Round 1 decisions with their own date/source.
- [ ] Update README/decision references if needed, but do not modify 3.3, 3.4 or Research Backlog without separate permission.
- [ ] Review `AUD-17` conflict mapping before using revised Blueprint as an implementation task source; any true contradiction needs a separate decision.
- [ ] PR description explicitly lists unresolved safety/privacy/legal/research gates; **do not auto-merge**.

## 5. Owner review gate — decisions needed before applying

| Gate | Recommended choice | Alternative |
|---|---|---|
| **V2-Q1** Apply 2 Groups + 8 L3 and update counts/history? | **A — Approve patch P-01..P-04** | B — Request changes |
| **V2-Q2** Incorporate L3C-01..07 and L3T-01..08 as *structural contracts*, without editing 3.4? | **A — Approve P-05 and trace annex** | B — Request changes |
| **V2-Q3** Adopt the two six-cohort rows with explicit UX ≠ permissions caveat? | **A — Approve P-03** | B — Request changes |
| **V2-Q4** Record all 17 dispositions and preserve L4/policy/research/implementation gates? | **A — Approve P-06..P-08 and annex** | B — Request changes |
| **V2-Q5** After approval, edit **only canonical 3.2** on a new GitHub branch and create a PR for owner merge (no automatic merge)? | **A — Authorize canonical edit + PR** | B — Review only, no repository changes |

**Current state:** `PROPOSED_CANONICAL_PATCH / NOT_APPLIED`. R1 approval alone **does not** authorize V2-Q5. No file in the official Blueprint or GitHub repository has been changed as part of preparing this v2 proposal.