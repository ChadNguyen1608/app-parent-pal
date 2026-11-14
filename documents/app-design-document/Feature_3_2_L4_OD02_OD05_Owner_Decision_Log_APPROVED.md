# Parent-Pal — OD-02..OD-05 Owner Decisions (Claude L4 Independent Review)

**Date:** 2026-11-14
**Status:** `OWNER_DECISIONS_APPROVED / SPEC_REMEDIATION_PROPOSED / INDEPENDENT_RECHECK_PENDING`
**Source:** Owner: "OD02-05 làm theo đề xuất", referencing the five-question summary of Claude's `Owner_Decisions_Only.md` from `L4_Final_Independent_Verification_20261114.zip` and assistant's proposed implementation. This file records **only OD-02, OD-03, OD-04 and OD-05**; OD-01/FR-01 has a separate approved decision: [FR-01 Option A](Feature_3_2_L4_FR01_Parent_PIN_Unlink_and_Repairing_Owner_Decision_APPROVED.md).
**No Final L4 approval, no legal clearance, no runtime test.**

## OD-02 — Sponsored content in child-facing experiences (FR-06 MEDIUM)

**APPROVED:** In the initial release, **do not display sponsored offers or sponsored listings to minors under 18 (A0–A4)** in Child App or other minor-facing views; sponsor content is eligible only in appropriately authorized adult/parent-facing experiences under separate advertising, transparency, suitability and commerce gates. No sponsored purchase links/buttons or indirect sponsored placement through Resource Matching in child-facing output. Age/capability and recipient authorization must be checked at release, cached response, pagination and fallback. At A5, verified adult access does not imply ads automatically approved; other gates still apply.

**Clarification:** The Claude report's option OD-02(a) describes "dưới 15 tuổi (A0–A4)", which is internally inconsistent with the approved cohort mapping (`A4=15–17`). The Owner approved the recommendation **as presented by ChatGPT: under 18**, so this log uses A0–A4 correctly. This is a product-design scope, not a legal conclusion or final advertising policy.

**Impacted:** F08-G03-M01 Activity Directory; F08-G03-M02 Resource Matching; F08-G05-M01 Commerce Catalog; F08-G05-M02 Transaction & Conflict Controls; F05-G01-M01 Child Conversation.

## OD-03 — Static emergency help information (FR-09 MEDIUM)

**APPROVED:** Child-facing risk-of-harm response retains the approved static recommendation **to speak with a trusted adult who can help**, and **may include the static, reviewed child-protection hotline 111**. This is an explicit narrow qualification of the earlier "only talk to trusted adult" wording, not permission to add AI-generated safety advice. Show the reviewed text only when the relevant safety routing is eligible. Do not auto-contact, send child content, notify household, create human case or claim live response.

For an emergency described by an eligible **parent/adult** (e.g. child is unconscious or in imminent danger), safety handling is prior to ordinary AI answer generation and may show **reviewed static 115/113/111 information when situation-appropriate**, without diagnosis, model-generated medical/legal instructions, paid offers or automatic emergency calls. The exact service mappings, current number validity, locale, child/adult-safe wording and accessibility need external expert/operational verification before production. No inferred ability to offer local emergency services without verified locale.

**Critical unresolved boundary:** Claude FR-03 asks whether even a static E0 safety notice may be triggered when lawful basis to process child input is UNKNOWN. **OD-03 does not waive G-Legal** or authorize handling real child messages without verified legal basis. Product/legal review remains required. Ineligible processing remains denied; design the appropriate non-data-processing static UI fallback separately with legal validation.

**Impacted:** F05-G01-M01 Child Conversation; F05-G01-M02 Companion Guardrails; F07-G05-M01 Safety Triage; approved static safety content catalog.

## OD-04 — Pin Batch01 v3.1 remediation addendum (FR-08 MEDIUM)

**APPROVED:** Include [B01 v3.1 Specification Remediation Addendum](Feature_3_2_L4_B01_Specification_Remediation_v3_1_Addendum_REVIEW.md) with exact Git blob `3c398a3c5e26136609ee2c2d29843a66a7a7e97f` in a **new supplemental manifest** rather than mutate the original frozen source manifest. It is a proposed spec-level amendment applicable to the affected normalized B01 CR/plan contracts, and should be checked against later detailed Group 04 and Owner policies.

**Not approved:** declaring FV3-B01-001..007 closed or fully regression-tested merely because the source was pinned. Claude independently rechecks current snapshot and the exact cited oracles. No automatic change of earlier historical evidence or canonical Feature Inventory.

**Impacted:** F04-G06-M01 Change Requests; F04-G01-M01 Plan Structure; F04-G06-M02 Change History; F04-G03-M02 Approval Routing; F04-G02-M03 Balanced Planning Validation.

## OD-05 — Approved AI response-scope gate applies globally (previous H2)

**APPROVED:** For **all user-facing AI-generated output** — including Child Conversation, educational help, insights, summaries, goals, recommendations, adult/parent answers and modalities — enforce a currently approved task/audience/model/version capability or reviewed-content scope, with current purpose/permission/provider/budget checks and validation of **actual output before release**. Unknown, unavailable, expired or out-of-scope evidence -> **no AI-generated answer bytes**, including retry, cache, fallback or streaming. A non-AI operational status or separately approved static safety information is not a model-generated answer and stays under its own policy.

**Source routing is distinct from output-scope eligibility:** The prior Owner rule of internal knowledge first, then optionally vetted web/LLM for **education/training questions** remains as specified; this decision does **not** extend arbitrary web fallback to non-education questions, endorse web claims as verified, or relax the existing KMAP rule on advance disclosure, "chưa kiểm chứng" labeling, source citations, verification queue, and clinical/drug/emergency exclusions. Other categories need their own approved sourcing policy. No blanket model approval merely from training.

**Impacted:** F07-G03-M01 Single Interface Router; F07-G04-M01 Policy Evaluation; F07-G04-M02 Model Evaluation; F05-G01-M01 Child Conversation; F06-G04-M02 Cautious Insights; recommendation/summaries and any other user-facing generative L4.

## Synthetic regression oracles (PROPOSED ONLY)

| ID | Scope | Fixture | Required outcome |
|---|---|---|---|
| OD02-T01 | Sponsored listings | A2 child opens a directory with a sponsor-eligible entry | Sponsor content/listing absent in child-facing response; no sponsored buy action; nonsponsored eligible results remain available |
| OD02-T02 | Sponsored recommendation | Child A4 receives Resource Matching after cache or pagination | Sponsor listing cannot leak through ranking, cached content, UI promotion or AI fallback |
| OD02-T03 | Adult views | Verified parent/adult requests directory | Sponsored placement permitted only where separate adult/ads/commerce authorization and disclosure gates pass |
| OD03-T01 | Child risk | A3 child risk-of-harm signal under verified processing authority | Only approved static talk-to-trusted-adult message, optionally reviewed 111; zero generated advice/contact/case/disclosure |
| OD03-T02 | Parent emergency | Parent reports acute child emergency | Appropriate reviewed static 115/113/111 info with correct eligibility; no diagnosis, paid offer or auto call |
| OD03-T03 | Legal unknown | Child safety event with unknown lawful-basis evidence | No unauthorized protected input processing; do not claim this decision grants legal exception; route to separately verified safe static UI behavior |
| OD04-T01 | Pin and regression | Resolve addendum exact blob, cross-check Group 04 and Owner CR decision logs | No missing v3.1 clause; stale approval, unknown-commit and retry cases not contradicted; unresolved stays open |
| OD05-T01 | All AI answers | Child/parent/adult non-education AI answer with UNKNOWN approved scope | No generated output, irrespective of model route; reviewed static safety and status remain independently policy-gated |
| OD05-T02 | Educational fallback | Education question lacks internal info but approved external route; external facts returned | External route only under existing policies; label/cite and queue per KMAP, output validated before release; unverified claim is not approved fact |
| OD05-T03 | Streaming/retry | Output scope expires after initial preflight and before release | No stale or partial AI answer bytes; downstream release fenced; retry with expired evidence remains denied |

## Status / handoff

- `OD-02..05 = OWNER_APPROVED`. Claude findings `FR-06, FR-09, FR-08, H2` remain `SPEC_FIX_PROPOSED / INDEPENDENT_RECHECK_PENDING`, not automatically CLOSED.
- FR-01/OD-01 is separately approved and pending verification.
- FR-02, FR-05 and FR-07 are pre-existing rule/trace corrections; FR-03 and H4 remain legal-gate research. Not silently closed by these four Owner decisions.
- The original pinned L4 24-group manifest remains immutable as review history; new decisions and addendum are overlays until a complete rerun pin is reviewed.
