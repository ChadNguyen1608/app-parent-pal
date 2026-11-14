# 02 — Sổ đánh giá 106 L3 (sinh tự động từ `data/assessment.json`)

**Trạng thái:** `REVIEW / RUBRIC R1.1a / EXPERT_HYPOTHESIS / MVP_NOT_DECIDED` · **Người soạn:** AI (Claude), chưa kiểm chứng độc lập · **Nguồn:** HEAD `9043c88`.

> Không sửa tay file này. Sửa dữ liệu trong `tools/tier1_data.py`, `tools/tier3_data.py` rồi chạy lại `tools/build_tier1.py`, `tools/graph.py`, `tools/build_registry.py`, `tools/gen_registry_md.py`.

## 1. Tổng

| Chỉ số | Giá trị |
|---|---|
| Số L3 | 106 (F01 13, F02 12, F03 14, F04 15, F05 12, F06 13, F07 15, F08 12) |
| Mức đánh giá | FULL 66 · COARSE 40 |
| Trạng thái | scored 57 · blocked 9 (đã chấm, nhưng dữ liệu thật bị chặn bởi G-Legal) · partial 40 (chỉ COARSE) |
| Tier | CORE_VALUE 39 · MIN_FOUNDATION 25 · ADV_SECURITY_OPS 4 · DEFERRED 38 |
| Gate PASS | 0 (không gate nào được chấm PASS) |
| Độ tin cậy | HYPOTHESIS cho mọi điểm; 4 module bị giới hạn LOW vì chưa từng được kiểm độc lập |
| mvp_decision | NOT_DECIDED cho cả 106 |

Ký hiệu: gate theo thứ tự Legal/Privacy/Safety/Feasibility, với U = UNKNOWN, B = BLOCKED, C = CONDITIONAL. Cohort A0–A5: A = APPLICABLE, C = CONDITIONAL, — = NOT_APPLICABLE. IND = INDIRECT. ? = UNKNOWN.

## 2. Bảng tổng 106 L3

| L3 | Tên | Tier | Vai trò | Vòng | E | Chi phí | Gate L/P/S/F | A0 A1 A2 A3 A4 A5 | Mức | Trạng thái | Workflow |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `F01-G01-M01` | Account Access | MIN_FOUNDATION | ROLE-F | - | E0 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W2,W3 |
| `F01-G01-M02` | Session Security | MIN_FOUNDATION | ROLE-F | - | E0 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W2,W3 |
| `F01-G02-M01` | Family Structure | MIN_FOUNDATION | ROLE-F | - | E0 | M | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W2,W3 |
| `F01-G02-M02` | Member Relationships | MIN_FOUNDATION | ROLE-F | - | E0 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W1) |
| `F01-G03-M01` | Core Identity | MIN_FOUNDATION | ROLE-F | U | E0 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W2,W3 |
| `F01-G03-M02` | Profile Integrity | ADV_SECURITY_OPS | ROLE-F | U | E0 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F01-G04-M01` | Access Policy | MIN_FOUNDATION | ROLE-S | - | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W2,W3 |
| `F01-G04-M02` | Consent Ledger | MIN_FOUNDATION | ROLE-S | - | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W2,W3 |
| `F01-G05-M01` | Mode State | MIN_FOUNDATION | ROLE-F | - | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W2,W3 |
| `F01-G05-M02` | Mode Transitions | ADV_SECURITY_OPS | ROLE-F | - | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F01-G06-M01` | Lifecycle Controls | MIN_FOUNDATION | ROLE-S | - | E0 | M | B/U/U/U | A A A A A A | FULL | blocked | W1,W1E1,W2,W3 |
| `F01-G06-M02` | Entitlements & Billing | DEFERRED | ROLE-E | - | E0 | M | U/U/U/U | C C — — — A | COARSE | partial | — |
| `F01-G06-M03` | Subscription Billing Lifecycle | DEFERRED | ROLE-E | - | E0 | H | U/U/U/U | C C — — — A | COARSE | partial | — |
| `F02-G01-M01` | Intake & Updates | CORE_VALUE | ROLE-V | U | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W2,W3 |
| `F02-G01-M02` | Incremental Questions | CORE_VALUE | ROLE-V | U | E1 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W2) |
| `F02-G02-M01` | Preference Registry | CORE_VALUE | ROLE-V | U | E1 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W2) |
| `F02-G02-M02` | Preference Revision | DEFERRED | ROLE-V | U | E1 | L | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F02-G03-M01` | Evidence-linked Observations | DEFERRED | ROLE-V | U | E1 | M | U/U/U/U | A A A A A A | FULL | scored |  (+opt W2) |
| `F02-G03-M02` | Non-labeling Review | DEFERRED | ROLE-S | U | E1 | L | U/U/U/U | A A A A A A | FULL | scored | — |
| `F02-G04-M01` | Environment Context | DEFERRED | ROLE-V | U | E1 | L | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F02-G04-M02` | Context Permissions | DEFERRED | ROLE-S | U | E1 | L | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F02-G05-M01` | Versioned Profile | CORE_VALUE | ROLE-V | U | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W2 |
| `F02-G05-M02` | Child Feedback | CORE_VALUE | ROLE-V | F | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W3 (+opt W1) |
| `F02-G06-M01` | Provenance | DEFERRED | ROLE-F | U | E1 | L | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F02-G06-M02` | Correction & Confidence | MIN_FOUNDATION | ROLE-S | U | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W2 |
| `F03-G01-M01` | Framework Registry | DEFERRED | ROLE-F | O | E0 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F03-G01-M02` | Evidence Alignment | DEFERRED | ROLE-F | O | E0 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F03-G02-M01` | Dimension Taxonomy | DEFERRED | ROLE-V | O | E1 | L | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F03-G02-M02` | Domain Mapping | DEFERRED | ROLE-F | O | E1 | L | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F03-G03-M01` | Stage Catalog | CORE_VALUE | ROLE-F | O | E1 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W1,W2) |
| `F03-G03-M02` | Accessibility Adaptation | DEFERRED | ROLE-V | O | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F03-G04-M01` | Goal Discovery | CORE_VALUE | ROLE-V | O | E1 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W2) |
| `F03-G04-M02` | Goal Constraints | DEFERRED | ROLE-V | O | E1 | L | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F03-G04-M03` | Development Roadmap & Milestones | DEFERRED | ROLE-V | O | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F03-G05-M01` | Grounded Recommendation | CORE_VALUE | ROLE-V | O | E2 | M | U/U/C/U | A A A A A A | FULL | scored | W2 |
| `F03-G05-M02` | Recommendation Review | CORE_VALUE | ROLE-S | O | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W2 |
| `F03-G05-M03` | Career Exploration Guidance | DEFERRED | ROLE-E | O | E2 | M | U/U/C/U | — — — A A A | COARSE | partial | — |
| `F03-G06-M01` | Goal Reassessment | DEFERRED | ROLE-V | E | E1 | L | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F03-G06-M02` | Goal Change Proposal | DEFERRED | ROLE-V | E | E1 | L | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F04-G01-M01` | Plan Structure | CORE_VALUE | ROLE-V | P | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 (+opt W2) |
| `F04-G01-M02` | Plan Templates | CORE_VALUE | ROLE-V | P | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F04-G02-M01` | Schedule Construction | CORE_VALUE | ROLE-V | P | E2 | M | U/U/C/C | A A A A A A | FULL | scored | W1,W3 |
| `F04-G02-M02` | Schedule Conflict | CORE_VALUE | ROLE-V | P | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F04-G02-M03` | Balanced Planning Validation | CORE_VALUE | ROLE-S | P | E1 | L | U/U/U/C | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F04-G03-M01` | Task Ownership | CORE_VALUE | ROLE-V | P | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 (+opt W2) |
| `F04-G03-M02` | Approval Routing | CORE_VALUE | ROLE-S | P | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W3 (+opt W1) |
| `F04-G04-M01` | Daily Task View | CORE_VALUE | ROLE-V | X | E1 | L | U/U/U/C | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F04-G04-M02` | Execution Support | CORE_VALUE | ROLE-V | X | E1 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W1) |
| `F04-G05-M01` | Lightweight Check-off | CORE_VALUE | ROLE-V | X | E0 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F04-G05-M02` | Evidence Submission | CORE_VALUE | ROLE-V | X | E0 | M | U/U/U/C | A A A A A A | FULL | scored |  (+opt W1) |
| `F04-G06-M01` | Change Requests | CORE_VALUE | ROLE-V | P | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W3 (+opt W1) |
| `F04-G06-M02` | Change History | CORE_VALUE | ROLE-V | P | E1 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W1) |
| `F04-G07-M01` | Schedule Notifications | CORE_VALUE | ROLE-V | X | E1 | M | U/U/U/C | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F04-G07-M02` | Notification Preferences | CORE_VALUE | ROLE-V | X | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F05-G01-M01` | Child Conversation | CORE_VALUE | ROLE-V | O | E2 | H | B/U/C/U | C A A A A A | FULL | blocked | W2,W3 |
| `F05-G01-M02` | Companion Guardrails | MIN_FOUNDATION | ROLE-S | - | E1 | M | B/U/C/U | C A A A A A | FULL | blocked | W2,W3 |
| `F05-G02-M01` | Opt-in Check-in | CORE_VALUE | ROLE-V | F | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W3 |
| `F05-G02-M02` | Check-in Controls | CORE_VALUE | ROLE-V | F | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W3 |
| `F05-G03-M01` | Reflection Prompts | CORE_VALUE | ROLE-V | F | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W3 |
| `F05-G03-M02` | Reflection Review | CORE_VALUE | ROLE-V | F | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W3 |
| `F05-G04-M01` | Private Entries | CORE_VALUE | ROLE-V | F | E0 | M | B/U/U/U | — A A A A A | FULL | blocked | W3 |
| `F05-G04-M02` | Journal Retrieval | MIN_FOUNDATION | ROLE-S | F | E1 | M | B/U/U/U | — A A A A A | FULL | blocked | W3 |
| `F05-G05-M01` | Structured Insight | DEFERRED | ROLE-V | E | E2 | H | B/U/C/U | — A A A A A | COARSE | partial | — |
| `F05-G05-M02` | Insight Correction | DEFERRED | ROLE-S | E | E1 | M | B/U/U/U | — A A A A A | COARSE | partial | — |
| `F05-G06-M01` | Selective Sharing | MIN_FOUNDATION | ROLE-S | F | E1 | M | B/U/U/U | A A A A A A | FULL | blocked | W3 |
| `F05-G06-M02` | Deletion Graph | MIN_FOUNDATION | ROLE-S | - | E1 | H | B/U/U/U | A A A A A A | FULL | blocked | W3 |
| `F06-G01-M01` | Activity Event Log | CORE_VALUE | ROLE-V | E | E0 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F06-G01-M02` | Source Metadata | CORE_VALUE | ROLE-F | E | E0 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W1) |
| `F06-G02-M01` | Progress Rules | CORE_VALUE | ROLE-V | E | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F06-G02-M02` | Progress Exceptions | CORE_VALUE | ROLE-V | E | E1 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W1) |
| `F06-G03-M01` | Indicator Registry | DEFERRED | ROLE-F | E | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F06-G03-M02` | Indicator Evidence | DEFERRED | ROLE-V | E | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F06-G04-M01` | Deterministic Trends | CORE_VALUE | ROLE-V | E | E1 | L | U/U/U/U | A A A A A A | FULL | scored |  (+opt W1) |
| `F06-G04-M02` | Cautious Insights | DEFERRED | ROLE-V | E | E2 | M | U/U/C/U | A A A A A A | COARSE | partial | — |
| `F06-G05-M01` | Audience Views | CORE_VALUE | ROLE-S | E | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F06-G05-M02` | Summary Rendering | CORE_VALUE | ROLE-V | E | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W3 |
| `F06-G06-M01` | Review Sessions | CORE_VALUE | ROLE-V | F | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W3 |
| `F06-G06-M02` | Feedback Handoff | CORE_VALUE | ROLE-V | F | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W3 |
| `F06-G07-M01` | Academic Assessment | DEFERRED | ROLE-V | E | E2 | H | U/U/C/U | C C A A A A | COARSE | partial | — |
| `F07-G01-M01` | Content CMS | MIN_FOUNDATION | ROLE-F | O | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W2,W3 |
| `F07-G01-M02` | Structured Retrieval | MIN_FOUNDATION | ROLE-F | O | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W2,W3 |
| `F07-G02-M01` | Editorial Workflow | MIN_FOUNDATION | ROLE-F | O | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W2,W3 |
| `F07-G02-M02` | Evidence Provenance | MIN_FOUNDATION | ROLE-F | O | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W2,W3 |
| `F07-G03-M01` | Single Interface Router | MIN_FOUNDATION | ROLE-F | - | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W1,W2,W3 |
| `F07-G03-M02` | Execution Budget | MIN_FOUNDATION | ROLE-F | - | E1 | L | U/U/U/U | A A A A A A | FULL | scored | W1,W2,W3 |
| `F07-G03-M03` | Multimodal Interaction Orchestration | DEFERRED | ROLE-E | U | E2 | H | U/U/C/U | A A A A A A | COARSE | partial | — |
| `F07-G04-M01` | Policy Evaluation | MIN_FOUNDATION | ROLE-S | - | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W1,W2,W3 |
| `F07-G04-M02` | Model Evaluation | MIN_FOUNDATION | ROLE-F | - | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W1,W2,W3 |
| `F07-G05-M01` | Safety Triage | MIN_FOUNDATION | ROLE-S | - | E1 | M | B/U/C/U | A A A A A A | FULL | blocked | W1,W2,W3 |
| `F07-G05-M02` | Human Response Workflow | DEFERRED | ROLE-E | - | E1 | H | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F07-G06-M01` | Purpose-bound Access | MIN_FOUNDATION | ROLE-S | - | E1 | M | U/U/U/U | A A A A A A | FULL | scored | W1,W1E1,W2,W3 |
| `F07-G06-M02` | Retention & Export | MIN_FOUNDATION | ROLE-S | - | E1 | M | B/U/U/U | A A A A A A | FULL | blocked | W1,W1E1,W2,W3 |
| `F07-G07-M01` | Operational Console | ADV_SECURITY_OPS | ROLE-F | - | E1 | M | U/U/U/U | — — — — — — | COARSE | partial | — |
| `F07-G07-M02` | Billing & Cost Operations | ADV_SECURITY_OPS | ROLE-F | - | E1 | M | U/U/U/U | — — — — — — | COARSE | partial | — |
| `F08-G01-M01` | School Data Connectors | DEFERRED | ROLE-E | U | E1 | H | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F08-G01-M02` | School Data Review | DEFERRED | ROLE-E | U | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F08-G02-M01` | Expert Discovery | DEFERRED | ROLE-E | O | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F08-G02-M02` | Expert Referral | DEFERRED | ROLE-E | O | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F08-G03-M01` | Activity Directory | DEFERRED | ROLE-E | O | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F08-G03-M02` | Resource Matching | DEFERRED | ROLE-E | O | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F08-G04-M01` | Device Consents | DEFERRED | ROLE-S | U | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F08-G04-M02` | External Data Import | DEFERRED | ROLE-V | U | E1 | M | U/U/U/U | A A A A A A | COARSE | partial | — |
| `F08-G05-M01` | Commerce Catalog | DEFERRED | ROLE-E | - | E1 | H | U/U/U/U | A A — — — A | COARSE | partial | — |
| `F08-G05-M02` | Transaction & Conflict Controls | DEFERRED | ROLE-E | - | E1 | H | U/U/U/U | A A — — — A | COARSE | partial | — |
| `F08-G06-M01` | Education Budget Planning | DEFERRED | ROLE-E | P | E1 | M | U/U/U/U | A A C C C A | COARSE | partial | — |
| `F08-G06-M02` | Expense & Approval Management | DEFERRED | ROLE-E | P | E1 | M | U/U/U/U | A A C C C A | COARSE | partial | — |

## 3. Chấm đầy đủ (Tier-3, 66 module)

### 3.1 Value và Delivery theo module

| L3 | Loop | Adopt | Diff | Enable | Effort | Maint | OpCost | AI | Latency | Cplx | Scale | Safety | E0/E1 thay thế |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `F01-G01-M01` | 1 | N/A | 1 | 5 | 2 | 2 | L | L | M | 2 | L | M | Managed provider auth; phone/email OTP; recovery via support runbook in pilot |
| `F01-G01-M02` | 1 | N/A | 1 | 4 | 2 | 1 | L | L | L | 2 | L | M | Provider session + revoke-all on unlink |
| `F01-G02-M01` | 2 | 4 | 2 | 5 | 3 | 2 | L | L | M | 4 | L | H | Pilot: same-household re-pair only; cross-household pairing disabled until verification method decided |
| `F01-G02-M02` | 1 | 3 | 1 | 2 | 2 | 2 | L | L | L | 3 | L | M | Single household, invite by link, remove by primary |
| `F01-G03-M01` | 2 | 4 | 1 | 5 | 2 | 2 | L | L | L | 2 | L | M | Declared-only profile; no verified facts in pilot |
| `F01-G04-M01` | 1 | N/A | 1 | 5 | 4 | 3 | L | L | M | 5 | M | H | Pilot: small fixed role matrix (primary caregiver, co-caregiver, child) + deny-by-default; full policy engine later |
| `F01-G04-M02` | 1 | 3 | 1 | 4 | 3 | 3 | L | L | L | 4 | L | H | Single versioned consent per purpose; withdrawal = stop processing + manual purge in pilot |
| `F01-G05-M01` | 2 | N/A | 3 | 4 | 2 | 2 | L | L | L | 3 | L | M | Parent picks mode in settings; default by cohort |
| `F01-G06-M01` | 1 | 2 | 1 | 3 | 3 | 2 | L | L | L | 4 | L | H | Pilot with synthetic/consented test data; manual deletion runbook with log |
| `F02-G01-M01` | 3 | 4 | 2 | 4 | 2 | 2 | L | L | L | 3 | L | M | Form-based intake; timetable photo parsing (E2) excluded |
| `F02-G01-M02` | 2 | 3 | 3 | 2 | 2 | 3 | L | L | L | 2 | L | M | Fixed question list with skip |
| `F02-G02-M01` | 2 | 3 | 2 | 2 | 2 | 2 | L | L | L | 2 | L | L | Simple tag list |
| `F02-G03-M01` | 2 | 3 | 3 | 2 | 3 | 3 | L | L | L | 3 | L | H | Free-text notes visible only to author |
| `F02-G03-M02` | 1 | N/A | 3 | 2 | 2 | 3 | L | L | L | 3 | L | H | Block free-text labels from display; review queue |
| `F02-G05-M01` | 3 | N/A | 3 | 3 | 3 | 2 | L | L | L | 3 | L | M | Single current profile + change log |
| `F02-G05-M02` | 3 | 3 | 3 | 2 | 2 | 2 | L | L | L | 2 | L | M | Emoji/3-option feedback per task |
| `F02-G06-M02` | 1 | 3 | 3 | 2 | 2 | 2 | L | L | L | 2 | L | M | Memory screen with edit/delete |
| `F03-G03-M01` | 2 | N/A | 2 | 3 | 2 | 3 | L | L | L | 2 | L | M | Hard-coded age defaults from spec-quy-tac-lap-lich |
| `F03-G04-M01` | 3 | 2 | 3 | 2 | 2 | 3 | L | L | L | 2 | L | M | Pick from short goal list |
| `F03-G05-M01` | 3 | 3 | 4 | 2 | 3 | 4 | L | M | M | 4 | M | H | Curated suggestion library filtered by age/preferences (E1) |
| `F03-G05-M02` | 2 | 3 | 3 | 2 | 2 | 2 | L | L | L | 2 | L | M | Accept/decline buttons |
| `F04-G01-M01` | 5 | N/A | 2 | 4 | 3 | 2 | L | L | L | 3 | L | M | Single active weekly plan, version on save |
| `F04-G01-M02` | 3 | 4 | 3 | 2 | 2 | 3 | L | L | L | 2 | L | L | — |
| `F04-G02-M01` | 5 | 3 | 4 | 4 | 4 | 3 | L | M | M | 3 | M | M | E1 template + rule fill (W1E1); LLM only for free-text parsing |
| `F04-G02-M02` | 3 | N/A | 2 | 2 | 2 | 1 | L | L | L | 2 | L | L | — |
| `F04-G02-M03` | 4 | N/A | 5 | 3 | 2 | 3 | L | L | L | 3 | L | M | — |
| `F04-G03-M01` | 4 | N/A | 2 | 3 | 2 | 2 | L | L | L | 2 | L | L | — |
| `F04-G03-M02` | 2 | 3 | 2 | 2 | 2 | 2 | L | L | L | 3 | L | M | Primary caregiver is the only approver |
| `F04-G04-M01` | 4 | 5 | 2 | 3 | 2 | 2 | L | L | M | 2 | L | L | — |
| `F04-G04-M02` | 3 | 3 | 3 | 1 | 2 | 3 | L | L | L | 2 | L | M | Static hints |
| `F04-G05-M01` | 4 | 4 | 1 | 3 | 1 | 1 | L | L | M | 1 | L | L | — |
| `F04-G05-M02` | 2 | 3 | 2 | 2 | 2 | 2 | M | L | L | 2 | M | M | Text note instead of photo |
| `F04-G06-M01` | 3 | 3 | 3 | 2 | 4 | 3 | L | L | M | 4 | L | M | Child sends "đề xuất đổi" message; parent edits plan directly |
| `F04-G06-M02` | 2 | 2 | 1 | 1 | 2 | 1 | L | L | L | 2 | L | L | Plan version list |
| `F04-G07-M01` | 4 | 4 | 2 | 2 | 3 | 2 | M | L | H | 3 | M | L | Local-only notifications (no server) |
| `F04-G07-M02` | 2 | 3 | 1 | 1 | 1 | 1 | L | L | L | 1 | L | L | Fixed quiet hours |
| `F05-G01-M01` | 3 | 4 | 4 | 2 | 4 | 5 | L | H | M | 5 | H | H | FAQ/knowledge search (E1) + approved templates |
| `F05-G01-M02` | 1 | N/A | 3 | 3 | 4 | 4 | L | M | H | 4 | M | H | Rules + blocklist + static templates; model-based check only where needed |
| `F05-G02-M01` | 3 | 3 | 3 | 1 | 2 | 2 | L | L | L | 3 | L | M | — |
| `F05-G02-M02` | 2 | 3 | 2 | 1 | 1 | 1 | L | L | L | 2 | L | M | — |
| `F05-G03-M01` | 3 | 2 | 3 | 1 | 2 | 3 | L | L | L | 2 | L | M | — |
| `F05-G03-M02` | 2 | 2 | 2 | 1 | 1 | 1 | L | L | L | 2 | L | M | — |
| `F05-G04-M01` | 2 | 3 | 3 | 2 | 3 | 2 | M | L | L | 4 | M | H | — |
| `F05-G04-M02` | 1 | N/A | 2 | 2 | 2 | 2 | L | L | L | 3 | L | H | — |
| `F05-G06-M01` | 2 | 2 | 4 | 2 | 3 | 2 | L | L | L | 4 | L | H | Share single entry snapshot; revoke = delete parent copy |
| `F05-G06-M02` | 1 | N/A | 2 | 3 | 4 | 3 | L | L | L | 4 | L | H | No derived data in pilot -> deletion graph reduces to entry deletion |
| `F06-G01-M01` | 4 | N/A | 1 | 4 | 2 | 1 | L | L | L | 2 | M | M | — |
| `F06-G01-M02` | 2 | N/A | 3 | 2 | 1 | 1 | L | L | L | 2 | L | L | Single source field |
| `F06-G02-M01` | 4 | N/A | 2 | 3 | 2 | 2 | L | L | L | 2 | L | L | — |
| `F06-G02-M02` | 2 | N/A | 2 | 1 | 1 | 1 | L | L | L | 2 | L | L | "Nghỉ" toggle per day |
| `F06-G04-M01` | 3 | N/A | 2 | 2 | 2 | 1 | L | L | L | 2 | L | L | — |
| `F06-G05-M01` | 2 | N/A | 3 | 3 | 2 | 2 | L | L | L | 3 | L | M | Two fixed templates (parent/child) |
| `F06-G05-M02` | 4 | 3 | 3 | 2 | 2 | 2 | L | L | L | 2 | L | M | — |
| `F06-G06-M01` | 3 | 2 | 3 | 2 | 2 | 2 | L | L | L | 2 | L | M | Checklist screen |
| `F06-G06-M02` | 3 | 2 | 3 | 1 | 2 | 2 | L | L | L | 3 | L | L | Parent edits plan from review screen |
| `F07-G01-M01` | 2 | N/A | 3 | 4 | 2 | 4 | L | L | L | 2 | L | H | Reuse documents/knowledge files with review status |
| `F07-G01-M02` | 2 | N/A | 3 | 3 | 3 | 3 | L | L | M | 3 | M | M | Keyword search over approved docs |
| `F07-G02-M01` | 1 | N/A | 2 | 2 | 2 | 3 | L | L | L | 2 | L | M | Doc-based review + queue file |
| `F07-G02-M02` | 1 | N/A | 3 | 3 | 2 | 2 | L | L | L | 2 | L | M | — |
| `F07-G03-M01` | 1 | N/A | 2 | 3 | 3 | 3 | L | M | M | 4 | M | H | Single direct call path with guards for pilot |
| `F07-G03-M02` | 1 | N/A | 1 | 3 | 2 | 2 | L | L | L | 2 | L | L | Per-household daily cap |
| `F07-G04-M01` | 1 | N/A | 3 | 3 | 3 | 4 | L | M | M | 4 | M | H | Allowlist of task/audience scopes + rule checks |
| `F07-G04-M02` | 1 | N/A | 2 | 3 | 3 | 4 | L | M | L | 3 | L | M | Small fixed eval set + manual review |
| `F07-G05-M01` | 1 | N/A | 3 | 3 | 3 | 4 | L | L | H | 3 | L | H | — |
| `F07-G06-M01` | 1 | N/A | 1 | 5 | 3 | 3 | L | L | M | 4 | M | H | Pilot: synthetic-data flag + deny-by-default |
| `F07-G06-M02` | 1 | N/A | 1 | 3 | 3 | 3 | M | L | L | 4 | L | H | Short retention + manual purge runbook |

### 3.2 Giá trị theo cohort (phụ huynh / trẻ; A5 = người dùng trưởng thành)

| L3 | A0 | A1 | A2 | A3 | A4 | A5 |
|---|---|---|---|---|---|---|
| `F01-G01-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F01-G01-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F01-G02-M01` | IND / N/A | IND / N/A | 3 / IND | 3 / IND | 2 / IND | N/A |
| `F01-G02-M02` | 3 / IND | 3 / IND | 3 / IND | 3 / IND | 2 / IND | N/A |
| `F01-G03-M01` | 2 / IND | 2 / IND | 2 / IND | 2 / IND | 2 / IND | 2 |
| `F01-G04-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F01-G04-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F01-G05-M01` | IND / N/A | IND / N/A | IND / IND | IND / IND | IND / IND | IND |
| `F01-G06-M01` | 2 / IND | 2 / IND | 2 / IND | 2 / IND | 2 / IND | 3 |
| `F02-G01-M01` | 3 / IND | 3 / IND | 3 / IND | 3 / 2 | 2 / 3 | 3 |
| `F02-G01-M02` | 3 / IND | 3 / IND | 3 / IND | 2 / 2 | 2 / 2 | 2 |
| `F02-G02-M01` | 2 / IND | 2 / 2 | 2 / 3 | 2 / 3 | 2 / 3 | 3 |
| `F02-G03-M01` | 3 / IND | 3 / IND | 3 / IND | 2 / IND | 2 / IND | N/A |
| `F02-G03-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F02-G05-M01` | 3 / IND | 3 / IND | 3 / IND | 3 / IND | 2 / IND | 3 |
| `F02-G05-M02` | N/A / N/A | 2 / 2 | 3 / 3 | 3 / 4 | 3 / 4 | N/A |
| `F02-G06-M02` | 3 / IND | 3 / IND | 3 / IND | 3 / 2 | 2 / 3 | 3 |
| `F03-G03-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F03-G04-M01` | 2 / IND | 2 / IND | 3 / 2 | 3 / 3 | 2 / 4 | 3 |
| `F03-G05-M01` | 4 / IND | 4 / IND | 4 / IND | 3 / IND | 2 / 2 | 2 |
| `F03-G05-M02` | 3 / IND | 3 / IND | 3 / IND | 3 / 2 | 2 / 3 | 3 |
| `F04-G01-M01` | IND / N/A | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F04-G01-M02` | 3 / IND | 3 / IND | 4 / IND | 4 / 2 | 3 / 3 | 3 |
| `F04-G02-M01` | 3 / IND | 3 / IND | 5 / 3 | 4 / 4 | 3 / 4 | 3 |
| `F04-G02-M02` | IND / N/A | IND / IND | 3 / IND | 3 / IND | 2 / IND | 2 |
| `F04-G02-M03` | IND / N/A | 3 / 3 | 4 / 4 | 4 / 4 | 3 / 3 | 2 |
| `F04-G03-M01` | IND / N/A | IND / IND | 3 / 3 | 3 / 3 | 3 / 3 | 2 |
| `F04-G03-M02` | N/A / N/A | N/A / N/A | 2 / 2 | 3 / 3 | 3 / 3 | N/A |
| `F04-G04-M01` | 3 / N/A | 3 / 2 | 3 / 4 | 3 / 4 | 2 / 4 | 3 |
| `F04-G04-M02` | N/A / N/A | 2 / 3 | 2 / 3 | 2 / 3 | 1 / 2 | N/A |
| `F04-G05-M01` | 2 / N/A | 2 / 3 | 3 / 4 | 3 / 4 | 2 / 3 | 3 |
| `F04-G05-M02` | N/A / N/A | 2 / 2 | 3 / 2 | 2 / 2 | 1 / 1 | N/A |
| `F04-G06-M01` | N/A / N/A | N/A / N/A | 2 / 3 | 3 / 4 | 3 / 4 | N/A |
| `F04-G06-M02` | 2 / N/A | 2 / N/A | 2 / IND | 2 / 2 | 2 / 2 | 2 |
| `F04-G07-M01` | 3 / N/A | 3 / N/A | 4 / 3 | 4 / 3 | 3 / 3 | 3 |
| `F04-G07-M02` | 2 / N/A | 2 / N/A | 2 / 2 | 2 / 3 | 2 / 3 | 2 |
| `F05-G01-M01` | 4 / IND | 4 / 2 | 4 / 3 | 3 / 3 | 2 / 3 | 3 |
| `F05-G01-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F05-G02-M01` | N/A / N/A | 2 / 2 | IND / 3 | IND / 3 | IND / 3 | N/A |
| `F05-G02-M02` | N/A / N/A | 2 / 2 | 2 / 3 | 2 / 3 | 2 / 3 | N/A |
| `F05-G03-M01` | N/A / N/A | N/A / N/A | 2 / 3 | 2 / 3 | 2 / 3 | N/A |
| `F05-G03-M02` | N/A / N/A | N/A / N/A | IND / 2 | IND / 3 | IND / 3 | N/A |
| `F05-G04-M01` | N/A / N/A | IND / 2 | IND / 3 | IND / 4 | IND / 4 | N/A |
| `F05-G04-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F05-G06-M01` | N/A / N/A | 2 / 2 | 3 / 3 | 3 / 4 | 3 / 4 | N/A |
| `F05-G06-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F06-G01-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F06-G01-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F06-G02-M01` | IND / N/A | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F06-G02-M02` | IND / N/A | IND / N/A | 2 / 2 | 2 / 3 | 2 / 3 | 2 |
| `F06-G04-M01` | IND / N/A | IND / N/A | IND / IND | IND / IND | IND / IND | IND |
| `F06-G05-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F06-G05-M02` | 2 / IND | 3 / IND | 4 / IND | 4 / 2 | 3 / 3 | 2 |
| `F06-G06-M01` | N/A / N/A | 2 / 2 | 3 / 3 | 3 / 3 | 2 / 3 | N/A |
| `F06-G06-M02` | N/A / N/A | 2 / N/A | 3 / 2 | 3 / 3 | 2 / 3 | N/A |
| `F07-G01-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G01-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G02-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G02-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G03-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G03-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G04-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G04-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G05-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G06-M01` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |
| `F07-G06-M02` | IND / IND | IND / IND | IND / IND | IND / IND | IND / IND | IND |

A2, A3 đánh giá đầy đủ. A1 kế thừa A2 và A4 kế thừa A3, có ghi phần khác biệt. A0, A5 chỉ đánh giá khi liên quan. Lý do từng ô nằm trong `data/assessment.json` → `cohort_assessment.*.reason`.

### 3.3 Lý do chấm, giả định và khoảng trống nghiên cứu

**`F01-G01-M01` Account Access** · MIN_FOUNDATION · E0 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (No loop step itself); adopt N/A (Invisible once set up -> N/A (R1.1)); diff 1 (Commodity sign-in); enable 5 (Every personal-data module depends on authenticated actor (fan-in 56 incl. bundle)).  
Delivery: Managed auth (Plan A: Supabase Auth) keeps build small; recovery without existence disclosure (G14) adds care; outage blocks all use -> M latency risk. · Ghi chú tier: Parent/child sign-in and recovery. Use managed auth (e.g. Supabase Auth per Plan A); keep recovery minimal. · Research: MR-016, MR-021

**`F01-G01-M02` Session Security** · MIN_FOUNDATION · E0 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (No loop step); adopt N/A (Invisible); diff 1 (Commodity); enable 4 (Security epoch on unlink/revocation needed by Child App pairing and FR-01).  
Delivery: Mostly platform sessions; non-trivial part = revoke Child App session on unlink (FR-01). · Ghi chú tier: Session handling largely provided by auth platform; security epoch on unlink/revocation is the non-trivial part. · Research: MR-021

**`F01-G02-M01` Family Structure** · MIN_FOUNDATION · E0 · FR-01 overlay (G01) · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Enables Child App participation in Plan/Execute); adopt 4 (One-time pairing: completion likely if flow is short; PIN adds a step); diff 2 (Pairing is common; Parent PIN + notice is standard); enable 5 (All Child App flows need binding (fan-in 53)).  
Delivery: FR-01: Parent PIN (server assurance), Parent App notice, epoch fencing, cross-household verification method undecided -> complexity 4, safety overhead H. · Ghi chú tier: Household + Child App pairing incl. FR-01 Parent PIN unlink and Parent App notice. Simplest safe version: one household, same-household re-pair only; cross-household re-pair deferred until verification method exists. · Research: MR-017, MR-021

**`F01-G02-M02` Member Relationships** · MIN_FOUNDATION · E0 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (Peripheral); adopt 3 (Second caregiver invite plausible in many families); diff 1 (Commodity); enable 2 (Enables co-parent access to plans/reports).  
Delivery: Single-household invite/remove is small; multi-household policy open (FR-04) excluded. · Ghi chú tier: Invite/remove second caregiver in the same household. Multi-household membership policy is OPEN (FR-04) -> exclude from pilot. · Research: MR-017

**`F01-G03-M01` Core Identity** · MIN_FOUNDATION · E0 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Understand step: age/grade); adopt 4 (Basic profile completion very likely); diff 1 (Commodity); enable 5 (Child scope for almost everything (fan-in 54)).  
Delivery: Declared facts + revisions; dedupe/verification pending stays simple in pilot. · Ghi chú tier: Child basic profile (age/grade). Needed by every child-scoped feature. · Research: MR-016

**`F01-G04-M01` Access Policy** · MIN_FOUNDATION · E1 · confidence `LOW_CAPPED_NOT_INDEPENDENTLY_REVIEWED` · status `scored`  
Value: loop 1 (No step); adopt N/A (Invisible); diff 1 (Commodity concept; correctness is the value); enable 5 (Every protected read/write (fan-in 56)).  
Delivery: Subject/purpose/mode-aware decisions, three autonomy modes, A5 ownership; never independently reviewed -> highest complexity among foundations. · Ghi chú tier: Central authorization decision. Never independently reviewed (cap technical confidence LOW). · Research: MR-016, MR-017, MR-021

**`F01-G04-M02` Consent Ledger** · MIN_FOUNDATION · E1 · confidence `LOW_CAPPED_NOT_INDEPENDENTLY_REVIEWED` · status `scored`  
Value: loop 1 (No step); adopt 3 (Consent screens are completed when mandatory; withdrawal rare); diff 1 (Commodity); enable 4 (Purpose-bound access and child processing rely on it).  
Delivery: (QA reconciliation: complexity 3->4) Ledger + withdrawal propagation; legal content of consent unknown (MR-016) -> maintenance as law clarifies. · Ghi chú tier: Record/withdraw consent. Never independently reviewed (cap LOW). Legal content of consent depends on MR-016. · Research: MR-016, MR-017

**`F01-G05-M01` Mode State** · MIN_FOUNDATION · E1 · confidence `LOW_CAPPED_NOT_INDEPENDENTLY_REVIEWED` · status `scored`  
Value: loop 2 (Shapes who plans/executes (P/X)); adopt N/A (Invisible state); diff 3 (Explicit autonomy modes are distinctive vs typical parental-control apps); enable 4 (Access Policy and planning flows read the mode).  
Delivery: State per child; transitions deferred; correctness tied to Access Policy. · Ghi chú tier: Effective autonomy mode per child. Never independently reviewed (cap LOW). Pilot: parent sets mode directly. · Research: MR-015, MR-017

**`F01-G06-M01` Lifecycle Controls** · MIN_FOUNDATION · E0 · confidence `HYPOTHESIS` · status `blocked`  
Value: loop 1 (No step); adopt 2 (Rarely used but must work); diff 1 (Commodity); enable 3 (Required before real data for all candidates (B_LIFECYCLE)).  
Delivery: Deletion across stores/backups with deadlines unresolved (H4); export formats. · Ghi chú tier: Account/data deletion and export requests. Required before real data; deletion deadline legal gate H4 open. · Research: MR-016, MR-018

**`F02-G01-M01` Intake & Updates** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Understand step for planning input); adopt 4 (Short intake (3-4 questions) likely completed (MR-010 open)); diff 2 (Common onboarding); enable 4 (Schedule construction and Pal context depend on it).  
Delivery: Allowlisted fields, guarded update; data minimisation; child data (QA reconciliation: complexity 2->3). · Ghi chú tier: Minimal intake (age, grade, timetable, fixed activities) feeds planning and Pal context. · Research: MR-008, MR-010

**`F02-G01-M02` Incremental Questions** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Fills profile gaps over time); adopt 3 (Skip rate unknown; fatigue risk (MR-010)); diff 3 (Conversational follow-up is somewhat distinctive); enable 2 (Feeds profile/Pal memory).  
Delivery: Approved question bank per cohort needs maintenance. · Ghi chú tier: Incremental follow-up questions with explicit skip. Swing: needed if Pal memory is in scope. · Research: MR-008, MR-010

**`F02-G02-M01` Preference Registry** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Activity choice in plans); adopt 3 (Set once, updated rarely); diff 2 (Common); enable 2 (Plans/recommendations may use it).  
Delivery: Assertions with source; no inference in pilot. · Ghi chú tier: Child likes/dislikes used for activity choice in plans. Swing. · Research: MR-012

**`F02-G03-M01` Evidence-linked Observations** · DEFERRED · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Timeline memory supports Understand); adopt 3 (Parents may log sporadically); diff 3 (Evidence-linked observations distinctive if done well); enable 2 (Feeds Pal memory/insights).  
Delivery: Requires non-labeling review and correction; labeling risk (MR-013). · Ghi chú tier: Evidence-linked observations (timeline memory). Re-entry candidate if Pal memory timeline is in scope (CLAUDE 4-layer memory). · Research: MR-013, MR-014

**`F02-G03-M02` Non-labeling Review** · DEFERRED · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (Guard, no step); adopt N/A (Invisible review); diff 3 (Non-labeling stance is distinctive); enable 2 (Required by observations/insights).  
Delivery: Rule list + review; expert content. · Ghi chú tier: Non-labeling review; required together with observations/insights, not needed while those are excluded. · Research: MR-013

**`F02-G05-M01` Versioned Profile** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Pal "hồ sơ" memory for Understand/Orient); adopt N/A (Background projection); diff 3 (Transparent versioned memory is distinctive); enable 3 (Pal conversation and planning context).  
Delivery: Versioning + scope recheck at release. · Ghi chú tier: Versioned child profile = Pal "hồ sơ" memory layer. Swing (simplify to single current profile with history). · Research: MR-019

**`F02-G05-M02` Child Feedback** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Feedback step: child voice); adopt 3 (Child willingness unknown (MR-007)); diff 3 (Child voice in plan is distinctive vs parent-control apps); enable 2 (Feeds review/plan changes).  
Delivery: Small UI + routing. · Ghi chú tier: Child feedback on tasks/plan (too hard, too much). Gives child voice in the loop. · Research: MR-007, MR-031

**`F02-G06-M02` Correction & Confidence** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (Supports trust in memory); adopt 3 (Used when wrong memory noticed); diff 3 (Transparency rule is distinctive (CLAUDE.md)); enable 2 (Required wherever Pal remembers).  
Delivery: CRUD with base-version check. · Ghi chú tier: Correction of remembered facts. Required by product transparency rule: everything Pal remembers can be viewed/edited/deleted (CLAUDE.md). · Research: MR-019

**`F03-G03-M01` Stage Catalog** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Age defaults for Plan); adopt N/A (Content catalog, invisible); diff 2 (Common); enable 3 (Schedule/balance/recommendation defaults).  
Delivery: Expert-reviewed age content; maintenance per age band. · Ghi chú tier: Age/stage catalog: age-appropriate defaults (time budgets, content scope). Swing. · Research: MR-011, MR-012

**`F03-G04-M01` Goal Discovery** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Orient step); adopt 2 (Goal setting often abandoned without follow-up); diff 3 (Moderately distinctive); enable 2 (Links plans to purpose).  
Delivery: Goal options per stage need content. · Ghi chú tier: Goal discovery (Orient step). Swing: plans can exist without goals. · Research: MR-012, MR-013

**`F03-G05-M01` Grounded Recommendation** · CORE_VALUE · E2 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Orient: suggests activities/approaches); adopt 3 (Value depends on quality; trust builds slowly); diff 4 (Grounded, sourced suggestions is a key differentiator); enable 2 (Feeds plan via review).  
Delivery: Retrieval + provenance + OD-05 validation + FR-02 labels; model eval. · Ghi chú tier: Grounded recommendation (activities/approaches) from approved knowledge. Swing; OD-05 scope gate applies. · Research: MR-023, MR-025, MR-026

**`F03-G05-M02` Recommendation Review** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Human decision before plan); adopt 3 (Accept/reject is quick); diff 3 (Explicit "AI không quyết thay phụ huynh" is distinctive); enable 2 (Gate between recommendation and plan).  
Delivery: Review UI + state. · Ghi chú tier: Parent reviews/accepts recommendation before it affects plan (AI does not decide for parents). · Research: MR-035

**`F04-G01-M01` Plan Structure** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 5 (Plan step cannot exist without plan baseline); adopt N/A (Data structure, invisible); diff 2 (Common); enable 4 (Schedules, tasks, change requests, history (fan-in 5)).  
Delivery: Versioning + lock (B01) adds state complexity. · Ghi chú tier: Plan baseline, scope, version and lock (B01). · Research: MR-040

**`F04-G01-M02` Plan Templates** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Fast plan start); adopt 4 (Presets reduce setup friction); diff 3 (Age-aware VN presets moderately distinctive); enable 2 (Used by construction).  
Delivery: Template content per grade needs upkeep. · Ghi chú tier: Plan templates/presets by age (prototype has presets). · Research: MR-012

**`F04-G02-M01` Schedule Construction** · CORE_VALUE · E2 · Exec override E1->E2 (prototype behaviour) · confidence `HYPOTHESIS` · status `scored`  
Value: loop 5 (Core Plan step); adopt 3 (Weekly use plausible; trust in AI draft unproven); diff 4 (Pal drafting a balanced VN school-week plan is the core differentiator); enable 4 (Tasks, reminders, daily view, progress depend on it).  
Delivery: E2 drafting + E1 validation + versioning; prototype exists (reuse prompt/rules). · Ghi chú tier: Schedule construction; core of Owner-named planning value. · Research: MR-012, MR-025, MR-026

**`F04-G02-M02` Schedule Conflict** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Plan validity); adopt N/A (Invisible check); diff 2 (Common); enable 2 (Approvals/changes use it).  
Delivery: Interval overlap rules (half-open intervals). · Ghi chú tier: Deterministic conflict detection. · Research: —

**`F04-G02-M03` Balanced Planning Validation** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 4 (Plan quality/safety); adopt N/A (Invisible check with visible warnings); diff 5 (Balance rules (play, rest, load) are a unique VN proposition); enable 3 (Construction and change approvals bind its verdict).  
Delivery: Rules exist in prototype; Standard Bar policy upkeep. · Ghi chú tier: Balanced planning validation (hard/soft caps, play time, load). · Research: MR-012, MR-031

**`F04-G03-M01` Task Ownership** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 4 (Assigns execution); adopt N/A (Invisible); diff 2 (Common); enable 3 (Daily view, reminders, progress denominators).  
Delivery: Simple assignment. · Ghi chú tier: Who does which task (parent/child/caregiver). · Research: MR-015

**`F04-G03-M02` Approval Routing** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Plan change governance); adopt 3 (Used when child proposes changes); diff 2 (Common); enable 2 (Change requests need it).  
Delivery: Approver resolution from current authority. · Ghi chú tier: Approval routing for plan changes. Swing: pilot can restrict edits to primary caregiver. · Research: MR-035

**`F04-G04-M01` Daily Task View** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 4 (Execute step entry point); adopt 5 (Daily habit plausible (prototype "Của con" tab)); diff 2 (Common in task apps); enable 3 (Check-off, evidence, support attach to it).  
Delivery: Read view; offline needed (expo-sqlite). · Ghi chú tier: Child/parent daily task view ("Của con" tab in prototype). · Research: MR-007

**`F04-G04-M02` Execution Support** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Helps execution); adopt 3 (Use depends on helpfulness); diff 3 (Step hints for kids moderately distinctive); enable 1 (Little depends on it).  
Delivery: Approved help templates. · Ghi chú tier: Execution support (step hints, timers) using approved templates. · Research: MR-031

**`F04-G05-M01` Lightweight Check-off** · CORE_VALUE · E0 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 4 (Closes Execute -> feeds Evaluate); adopt 4 (One tap; also from notification (Plan A)); diff 1 (Commodity); enable 3 (Event log/progress).  
Delivery: Trivial CRUD; offline sync. · Ghi chú tier: One-tap check-off. · Research: MR-031

**`F04-G05-M02` Evidence Submission** · CORE_VALUE · E0 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Optional evidence); adopt 3 (Photo per task adds friction (MR-031)); diff 2 (Common); enable 2 (Feeds assessment later).  
Delivery: Media storage cost; device test PASS. · Ghi chú tier: Photo/work evidence submission (Plan A device test: photo capture PASS). · Research: MR-031

**`F04-G06-M01` Change Requests** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Child-initiated plan change (Feedback->Plan)); adopt 3 (Used weekly at most); diff 3 (Negotiated plans distinctive); enable 2 (Review handoff uses it).  
Delivery: B01 + v3.1: TTL, lock, OUTCOME_UNKNOWN, terminal precedence -> high state complexity. · Ghi chú tier: Change requests (child proposes, parent approves; B01 + v3.1). Swing. · Research: MR-035, MR-040

**`F04-G06-M02` Change History** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Traceability); adopt 2 (Rarely viewed); diff 1 (Commodity); enable 1 (Little depends).  
Delivery: Append-only list. · Ghi chú tier: Change history (who changed what). Swing; simplify to audit list. · Research: —

**`F04-G07-M01` Schedule Notifications** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 4 (Drives Execute on time); adopt 4 (Push/alarm useful daily; fatigue risk); diff 2 (Common; morning alarm on child phone mildly distinctive); enable 2 (Execution relies on it).  
Delivery: Local notifications + exact alarm + push between devices; device test +45s; delivery reliability on Android OEMs. · Ghi chú tier: Schedule reminders/notifications (Plan A device test: local reminder +45s, borderline PASS). · Research: MR-031

**`F04-G07-M02` Notification Preferences** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Controls reminders); adopt 3 (Set once); diff 1 (Commodity); enable 1 (Reminders obey it).  
Delivery: Settings. · Ghi chú tier: Notification preferences/quiet hours. · Research: MR-032

**`F05-G01-M01` Child Conversation** · CORE_VALUE · E2 · confidence `HYPOTHESIS` · status `blocked`  
Value: loop 3 (Orient/Understand support via conversation); adopt 4 (Conversational use plausible but unproven (MR-001)); diff 4 (Pal with memory + VN knowledge is the central proposition); enable 2 (Recommendations/plans can follow conversation).  
Delivery: Open conversation + OD-05 scope evidence + output validation + FR-02 labels + safety; continuous eval; heavy users drive cost. · Ghi chú tier: Pal conversation (education/companion answers). OD-05 scope gate + output validation; FR-03 legal gate for child processing. · Research: MR-001, MR-023, MR-024, MR-026, MR-027

**`F05-G01-M02` Companion Guardrails** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `blocked`  
Value: loop 1 (Guard); adopt N/A (Invisible); diff 3 (Strong guardrails are a trust differentiator); enable 3 (All conversation output depends on it).  
Delivery: Rule layer + output check; static content; must not delay safety message. · Ghi chú tier: Companion guardrails: safety rules before routing, output validation, static OD-03 messages. · Research: MR-022, MR-023, MR-024

**`F05-G02-M01` Opt-in Check-in** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Feedback step (wellbeing)); adopt 3 (Opt-in; novelty decay risk (MR-009)); diff 3 (Moderately distinctive); enable 1 (Feeds reflection/review).  
Delivery: Template invitations; timing rules; emotional data sensitivity (QA reconciliation: complexity 2->3). · Ghi chú tier: Opt-in emotional/daily check-in. Swing (MR-009, MR-032). · Research: MR-009, MR-032

**`F05-G02-M02` Check-in Controls** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Controls check-in); adopt 3 (Set once); diff 2 (Common); enable 1 (Check-in needs it).  
Delivery: Settings + visibility rules. · Ghi chú tier: Check-in controls (timing, skip, who sees). Required with check-in. · Research: MR-032

**`F05-G03-M01` Reflection Prompts** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Feedback/reflection); adopt 2 (Children may ignore prompts (MR-007)); diff 3 (Moderately distinctive); enable 1 (Feeds review).  
Delivery: Approved prompt templates per cohort. · Ghi chú tier: Reflection prompts. Swing. · Research: MR-007, MR-009

**`F05-G03-M02` Reflection Review** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Child controls reflection before save/share); adopt 2 (Occasional); diff 2 (Common); enable 1 (Little).  
Delivery: Draft state UI. · Ghi chú tier: Child reviews own reflection draft before saving/sharing. · Research: MR-019

**`F05-G04-M01` Private Entries** · CORE_VALUE · E0 · Exec override group E2 -> E0 for storage · confidence `HYPOTHESIS` · status `blocked`  
Value: loop 2 (Feedback (private expression)); adopt 3 (Journaling habit varies widely); diff 3 (Private-by-default child journal in a parenting app is distinctive); enable 2 (Insights/sharing depend on it).  
Delivery: Private storage, encryption, lineage; H4 legal blocker. · Ghi chú tier: Private Journal entries. Swing; heavy privacy/legal gates (H4). · Research: MR-018, MR-019, MR-020, MR-024

**`F05-G04-M02` Journal Retrieval** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `blocked`  
Value: loop 1 (Guarded retrieval); adopt N/A (Invisible); diff 2 (Common); enable 2 (Insights/sharing).  
Delivery: Child-only retrieval, no parent path. · Ghi chú tier: Journal retrieval restricted to the child; required if Journal in scope. · Research: MR-019, MR-021

**`F05-G06-M01` Selective Sharing** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `blocked`  
Value: loop 2 (Child chooses what to share (Feedback)); adopt 2 (Occasional use); diff 4 (Child-controlled sharing/revocation is distinctive); enable 2 (Parent-visible journal content only via grants).  
Delivery: Grants with epochs, revocation, derived-data suppression. · Ghi chú tier: Child-controlled selective sharing/revocation; required if Journal in scope. · Research: MR-019, MR-020

**`F05-G06-M02` Deletion Graph** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `blocked`  
Value: loop 1 (No step); adopt N/A (Invisible); diff 2 (Common requirement); enable 3 (Required by Journal and derived data before real data).  
Delivery: Lineage across derived data, backups; H4. · Ghi chú tier: Deletion graph incl. derived data; required before real personal data; H4 legal deadline open. · Research: MR-018, MR-021

**`F06-G01-M01` Activity Event Log** · CORE_VALUE · E0 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 4 (Evaluate input); adopt N/A (Invisible); diff 1 (Commodity); enable 4 (Progress/trends/reports).  
Delivery: Append-only events; scope recheck. · Ghi chú tier: Activity event log feeding progress/report. · Research: MR-014

**`F06-G01-M02` Source Metadata** · CORE_VALUE · E0 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Report honesty (self vs verified)); adopt N/A (Invisible); diff 3 (Honest provenance labels moderately distinctive); enable 2 (Reports/assessment).  
Delivery: Field + display label. · Ghi chú tier: Source metadata (self-report vs parent-confirmed vs teacher-verified). Simplify to a field. · Research: MR-014

**`F06-G02-M01` Progress Rules** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 4 (Evaluate step); adopt N/A (Invisible computation); diff 2 (Common; UNKNOWN denominators careful); enable 3 (Trends/reports/review).  
Delivery: Versioned rules; deterministic. · Ghi chú tier: Progress rules (completion over window, UNKNOWN denominators). · Research: MR-014

**`F06-G02-M02` Progress Exceptions** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Fair progress); adopt N/A (Invisible); diff 2 (Common); enable 1 (Little).  
Delivery: Exception flags. · Ghi chú tier: Progress exceptions (sick days, holidays). Swing. · Research: MR-014

**`F06-G04-M01` Deterministic Trends** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Evaluate over time); adopt N/A (Invisible); diff 2 (Common); enable 2 (Reports).  
Delivery: Deterministic aggregation. · Ghi chú tier: Deterministic weekly trends. · Research: MR-014

**`F06-G05-M01` Audience Views** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Privacy boundary of Evaluate); adopt N/A (Invisible); diff 3 (Audience-safe child vs parent views distinctive); enable 3 (Every report/summary).  
Delivery: Audience rules; Journal never leaks. · Ghi chú tier: Audience-specific views (child vs parent), privacy boundary for reports. · Research: MR-019, MR-021

**`F06-G05-M02` Summary Rendering** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 4 (Evaluate output to parent); adopt 3 (Weekly report read if short (unproven)); diff 3 (Balanced, non-comparative report moderately distinctive); enable 2 (Review sessions).  
Delivery: Template rendering; no AI (OD-05 avoided). · Ghi chú tier: Weekly summary/report rendering (templates). · Research: MR-001, MR-014

**`F06-G06-M01` Review Sessions** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Feedback/Evaluate ritual); adopt 2 (Weekly family review needs habit); diff 3 (Guided family review moderately distinctive); enable 2 (Handoff to plan changes).  
Delivery: Session state + notifications. · Ghi chú tier: Family review session. Swing. · Research: MR-007

**`F06-G06-M02` Feedback Handoff** · CORE_VALUE · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 3 (Closes loop back to Plan); adopt 2 (Depends on review habit); diff 3 (Moderately distinctive); enable 1 (Little).  
Delivery: Creates change requests. · Ghi chú tier: Review outcome -> plan change proposal. Swing. · Research: MR-007

**`F07-G01-M01` Content CMS** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Knowledge for Orient); adopt N/A (Invisible); diff 3 (Curated VN knowledge base is a differentiator); enable 4 (Retrieval, safety catalog, templates (fan-in 5)).  
Delivery: Content upkeep and expert review are the main cost (knowledge drafts are AI-authored, unapproved). · Ghi chú tier: Approved content store incl. static safety catalog (OD-03). Pilot: reuse documents/knowledge with review status. · Research: MR-011, MR-023

**`F07-G01-M02` Structured Retrieval** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 2 (Internal-first answers); adopt N/A (Invisible); diff 3 (Grounding moderately distinctive); enable 3 (Pal and recommendations).  
Delivery: Search/index; scope filters before retrieval. · Ghi chú tier: Structured retrieval for internal-first answers (FR-02/KMAP §1.1). · Research: MR-025

**`F07-G02-M01` Editorial Workflow** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (Governance); adopt N/A (Staff); diff 2 (Common); enable 2 (Content publication + verification queue).  
Delivery: Manual expert review is ongoing human cost. · Ghi chú tier: Editorial review/approval. Pilot: manual expert review via doc process; no auto-approval of AI-drafted content. · Research: MR-036

**`F07-G02-M02` Evidence Provenance** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (Source labels); adopt N/A (Invisible); diff 3 ("Chưa kiểm chứng" honesty is distinctive); enable 3 (FR-02 labels, recommendations).  
Delivery: NG-xxx source codes exist. · Ghi chú tier: Source provenance (NG-xxx codes exist) enabling "chưa kiểm chứng" labels. · Research: MR-023

**`F07-G03-M01` Single Interface Router** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (No step); adopt N/A (Invisible); diff 2 (Common); enable 3 (All E2 features).  
Delivery: Route guards, safety-first ordering, scope gates. · Ghi chú tier: Single AI interface router (E0-E3 routing). · Research: MR-028

**`F07-G03-M02` Execution Budget** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (No step); adopt N/A (Invisible); diff 1 (Commodity); enable 3 (Caps AI spend; cost telemetry).  
Delivery: Quota counters. · Ghi chú tier: Execution budget/quota caps; also the minimal cost telemetry for the pilot. · Research: MR-027, MR-029

**`F07-G04-M01` Policy Evaluation** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (No step); adopt N/A (Invisible); diff 3 (Scope-gated AI is a trust differentiator); enable 3 (OD-05 for all generated output).  
Delivery: Approved-scope evidence + output validation; thresholds UNKNOWN. · Ghi chú tier: Policy evaluation / approved-scope evidence (OD-05). · Research: MR-023, MR-035

**`F07-G04-M02` Model Evaluation** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `scored`  
Value: loop 1 (No step); adopt N/A (Staff); diff 2 (Common); enable 3 (Release gate for E2).  
Delivery: Eval suites in Vietnamese; batch runs. · Ghi chú tier: Model evaluation suite before release (MR-023, MR-026). Offline/batch. · Research: MR-023, MR-026

**`F07-G05-M01` Safety Triage** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `blocked`  
Value: loop 1 (No step); adopt N/A (Invisible); diff 3 (Static, non-escalating safety response is distinctive); enable 3 (Router and companion depend on it).  
Delivery: Rule-based detection + static content; must never be delayed; FR-03. · Ghi chú tier: Safety triage (risk-of-harm detection -> OD-03 static response). FR-03 legal gate. · Research: MR-022, MR-023

**`F07-G06-M01` Purpose-bound Access** · MIN_FOUNDATION · E1 · confidence `LOW_CAPPED_NOT_INDEPENDENTLY_REVIEWED` · status `scored`  
Value: loop 1 (No step); adopt N/A (Invisible); diff 1 (Commodity concept); enable 5 (Denies real data when basis UNKNOWN; every protected access).  
Delivery: Purpose/lawful basis evaluation; never independently reviewed. · Ghi chú tier: Purpose-bound access / lawful basis evaluation. Never independently reviewed (cap LOW). Denies real child data while basis UNKNOWN. · Research: MR-016, MR-021

**`F07-G06-M02` Retention & Export** · MIN_FOUNDATION · E1 · confidence `HYPOTHESIS` · status `blocked`  
Value: loop 1 (No step); adopt N/A (Invisible); diff 1 (Commodity); enable 3 (Deletion/lifecycle before real data).  
Delivery: Retention schedules, backup purge; H4. · Ghi chú tier: Retention rules required; export/backup purge parts can be manual in pilot. H4 open. · Research: MR-018, MR-021

## 4. Module chỉ chấm thô (COARSE, 40 module)

| L3 | Tên | Tier | Lý do / cách đơn giản hóa |
|---|---|---|---|
| `F01-G03-M02` | Profile Integrity | ADV_SECURITY_OPS | Verified correction workflow with verifier/evidence. Pilot substitute: caregiver edits own declared facts in Core Identity. |
| `F01-G05-M02` | Mode Transitions | ADV_SECURITY_OPS | Child-proposed mode transitions with approval. Pilot substitute: caregiver changes Mode State directly; child proposals later. |
| `F01-G06-M02` | Entitlements & Billing | DEFERRED | Owner guidance: billing/entitlements deferred; pilot can run free. |
| `F01-G06-M03` | Subscription Billing Lifecycle | DEFERRED | Owner guidance: payments deferred. High integration/reconciliation cost. |
| `F02-G02-M02` | Preference Revision | DEFERRED | Formal revision/rejection flow; pilot folds simple edit/delete into Preference Registry + memory transparency. |
| `F02-G04-M01` | Environment Context | DEFERRED | Environment/family context; minimal context captured in Intake for pilot. |
| `F02-G04-M02` | Context Permissions | DEFERRED | Context permissions; needed only with Environment Context. |
| `F02-G06-M01` | Provenance | DEFERRED | Full provenance model; pilot keeps a source field (self/parent/teacher) on records. |
| `F03-G01-M01` | Framework Registry | DEFERRED | Formal framework registry. Pilot uses the existing knowledge map/content files directly. |
| `F03-G01-M02` | Evidence Alignment | DEFERRED | Evidence alignment of frameworks; content-governance extension. |
| `F03-G02-M01` | Dimension Taxonomy | DEFERRED | Development dimension taxonomy; extension. |
| `F03-G02-M02` | Domain Mapping | DEFERRED | Domain mapping; extension. |
| `F03-G03-M02` | Accessibility Adaptation | DEFERRED | Accessibility adaptation (MR-037). Inclusion risk noted; re-entry if pilot recruits children with specific needs. |
| `F03-G04-M02` | Goal Constraints | DEFERRED | Goal constraints; extension of goal discovery. |
| `F03-G04-M03` | Development Roadmap & Milestones | DEFERRED | Development roadmap & milestones; longer-horizon extension. |
| `F03-G05-M03` | Career Exploration Guidance | DEFERRED | Career exploration mainly A4-A5; outside CORE grades 1-9 focus. |
| `F03-G06-M01` | Goal Reassessment | DEFERRED | Goal reassessment; follows goals extension. |
| `F03-G06-M02` | Goal Change Proposal | DEFERRED | Goal change proposal; follows goals extension. |
| `F05-G05-M01` | Structured Insight | DEFERRED | Structured insight from Journal (E2, MR-019). Highest privacy exposure; defer. |
| `F05-G05-M02` | Insight Correction | DEFERRED | Insight correction; needed only with Structured Insight. |
| `F06-G03-M01` | Indicator Registry | DEFERRED | Formal indicator registry; pilot uses completion/consistency only. |
| `F06-G03-M02` | Indicator Evidence | DEFERRED | Indicator evidence; follows indicator registry. |
| `F06-G04-M02` | Cautious Insights | DEFERRED | Cautious generated insights; defer (OD-05 + non-labeling + MR-013). |
| `F06-G07-M01` | Academic Assessment | DEFERRED | Academic assessment (P6). Teacher-verification, rubric validity and AI grading risk; defer. |
| `F07-G03-M03` | Multimodal Interaction Orchestration | DEFERRED | Multimodal orchestration. Re-entry candidate: timetable photo parsing used by the prototype. |
| `F07-G05-M02` | Human Response Workflow | DEFERRED | Owner decision: human response workflow deferred from initial release. |
| `F07-G07-M01` | Operational Console | ADV_SECURITY_OPS | Operational console; pilot uses DB admin with audit by small team. |
| `F07-G07-M02` | Billing & Cost Operations | ADV_SECURITY_OPS | Billing & cost operations; minimal AI cost telemetry via Execution Budget. |
| `F08-G01-M01` | School Data Connectors | DEFERRED | School data connectors: no partner/API identified (MR-033). Deferred. |
| `F08-G01-M02` | School Data Review | DEFERRED | School data review; follows connectors. |
| `F08-G02-M01` | Expert Discovery | DEFERRED | Expert discovery; marketplace/partner extension. |
| `F08-G02-M02` | Expert Referral | DEFERRED | Expert referral; never auto-sent on safety trigger. Deferred. |
| `F08-G03-M01` | Activity Directory | DEFERRED | Activity directory; OD-02 bans sponsored listings to under-18. Deferred. |
| `F08-G03-M02` | Resource Matching | DEFERRED | Resource matching; follows directory; FR-05 distress suppression. |
| `F08-G04-M01` | Device Consents | DEFERRED | Third-party device consents; no device integration in pilot (Plan A uses phone OS permissions only). |
| `F08-G04-M02` | External Data Import | DEFERRED | External data import; deferred with integrations. |
| `F08-G05-M01` | Commerce Catalog | DEFERRED | Commerce catalog; Owner guidance + OD-02. |
| `F08-G05-M02` | Transaction & Conflict Controls | DEFERRED | Transaction controls; deferred with commerce. |
| `F08-G06-M01` | Education Budget Planning | DEFERRED | Education budget planning; finance extension. |
| `F08-G06-M02` | Expense & Approval Management | DEFERRED | Expense & approval management; finance extension (no auto payment). |

## 5. Lý do gate và cohort

Lý do của từng gate (`hard_gates.*.reason`) và từng ô áp dụng cohort (`cohorts.*.reason`) nằm trong `data/assessment.json`. Quy tắc sinh: `01_Method_Rubric_and_Calibration_REVIEW.md` §4. Các module có G-Legal = BLOCKED:

- `F01-G06-M01` Lifecycle Controls: H4: verified deletion deadlines unresolved; 60-day baseline cannot be production default (Remediation Register status discipline). Synthetic data only.
- `F05-G01-M01` Child Conversation: FR-03: lawful basis to process child request when UNKNOWN is open; release blocker for real child processing.
- `F05-G01-M02` Companion Guardrails: FR-03: lawful basis to process child request when UNKNOWN is open; release blocker for real child processing.
- `F05-G04-M01` Private Entries: Journal data subject to H4 deletion-deadline blocker (MR-018); synthetic data only.
- `F05-G04-M02` Journal Retrieval: Journal data subject to H4 deletion-deadline blocker (MR-018); synthetic data only.
- `F05-G05-M01` Structured Insight: Journal data subject to H4 deletion-deadline blocker (MR-018); synthetic data only.
- `F05-G05-M02` Insight Correction: Journal data subject to H4 deletion-deadline blocker (MR-018); synthetic data only.
- `F05-G06-M01` Selective Sharing: Journal data subject to H4 deletion-deadline blocker (MR-018); synthetic data only.
- `F05-G06-M02` Deletion Graph: H4: verified deletion deadlines unresolved; 60-day baseline cannot be production default (Remediation Register status discipline). Synthetic data only.
- `F07-G05-M01` Safety Triage: FR-03: lawful basis to process child request when UNKNOWN is open; release blocker for real child processing.
- `F07-G06-M02` Retention & Export: H4: verified deletion deadlines unresolved; 60-day baseline cannot be production default (Remediation Register status discipline). Synthetic data only.
