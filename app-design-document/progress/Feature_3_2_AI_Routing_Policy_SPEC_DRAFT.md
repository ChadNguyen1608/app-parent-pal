# AI Response & Execution Routing Policy — Draft Specification

**Trạng thái:** `PROPOSED / NOT APPROVED`, ngày 2026-11-09.  
**Owner đề xuất:** `F07-G03-M01` (routing); `F07-G03-M02` (budget); `F07-G03-M03` (modality); F07-G01/G02 (knowledge); F07-G04 (policy/evaluation). **Không** phải thiết kế kiến trúc backend cuối cùng.

## 1. Policy order

1. **Classify** actor, beneficiary, intent, capability, modality, data sensitivity, explicit purpose and requested action.
2. **Authorize before accessing data**. Deny or request permitted alternative if access/consent missing. No LLM may bypass this gate.
3. **Safety/data minimization gate**: dedicated safety procedure when appropriate, including policy-bound escalation; do not equate AI hypothesis with verified fact.
4. **Plan route**: use E0 (DB) / E1 (rule, approved templates, approved retrieval) when sufficient; E2 (LLM/Vision) for genuinely generative/complex needs; E3 (multi-step) only with explicit caps and evaluation.
5. **Freshness and cache eligibility**: reject stale, unapproved, out-of-scope or revoked results; cache key must incorporate authorization/data-version boundaries for private content.
6. **Budget and modality**: check entitlement + shared allowance + child fairness + capability limits; account for parent-led actions and safety-aware fallback.
7. **Execute**, validate correctness/safety/grounding, disclose uncertainty, redact secrets, record privacy-preserving audit and usage data.

### Distinguish task vs modality

E0–E3 denotes **execution method**, not input modality. Voice STT/TTS may wrap E0/E1/E2; voice does not imply LLM is needed for a request such as “hôm nay con có việc gì?”. Vision may be required to interpret an image, followed by deterministic grading or a gated model.

## 2. Cache policy (principles to approve)

| Cache class | Examples | Policy proposal | Invalidation |
|---|---|---|---|
| PUBLIC_APPROVED_KNOWLEDGE | Age guidance, reviewed admissions, career description | Shared cache possible only for approved version, geography, validity window; preserve citations | Source correction, approval revoke, version/expiry |
| SCOPED_NON_SENSITIVE | Family schedule summary, authorized goal view, derived plan | Key by family/child, role, purpose, policy version, relevant data version; short-lived; never cross family | Goal/plan revision, consent/role change, deletion, age-policy change |
| SENSITIVE_RESTRICTED | Child private insight, potentially sensitive assessments | Default minimal caching or no persistent response cache; require explicit necessity, strict access | Consent revocation, deletion, safety policy, membership change |
| NO_CACHE | Raw Journal, safety escalation payload, transient voice audio by default | No general/shared response cache, no reuse for different request. Ephemeral processing only with governed retention | Lifecycle/policy restrictions; verify provider processing logs |

**Important:** Raw Journal may be stored in its *authorized private journal store* according to product policy; `NO_CACHE` here refers to **response/retrieval cache**, not deleting the journal itself. A cache hit never confers data access permission. Logs and upstream AI provider retention need independent review.

## 3. Initial decision matrix

| Scenario / intent | Preferred execution | Optional escalation | Forbidden/constraint |
|---|---|---|---|
| Read schedule/tasks | E0 data | E2 explanation if truly useful | LLM must not invent tasks |
| Build balanced schedule | E1 constraints | E2 explain alternatives | Hard caps never waived by LLM |
| Seasonal/weather-aware adjustments | E1 policy with trusted local weather inputs | E2 narrative alternatives | Forecast is not verified safety diagnosis |
| Development/career/admissions knowledge | E1 approved retrieval | E2 grounded synthesis | Cached unapproved content not asserted as fact |
| Goal progress arithmetic | E1 deterministic | E2 narrative only | Never let LLM overwrite numeric source of truth |
| Academic homework assessment | E1 answer-key/rubric; E2 pilot for images/open answer | Human review if uncertain | Low-confidence must not be reported as confirmed |
| Monthly report | E0/1 aggregation/template | E2 interpretation if authorized | No private Journal inference leakage |
| Child open dialogue | E2 with guardrails | Human safety workflow where policy requires | No arbitrary diagnosis; no paywall abruptly cutting minimal safety support |
| Parent-led planning conversation | E1/E2 per intent | E3 for justified tasks | Parent payer doesn't inherit Journal access |
| Realtime voice | Modality STT+TTS/realtime adapter, task E0–E3 independent | Text fallback | Voice not stored by default for Journal |
| Multi-step research | E3 only when need demonstrated | Human review | Source freshness + fan-out cap |

## 4. Failure modes and fallback

| Failure | Default response |
|---|---|
| Missing consent | Deny protected access; offer approved channel/request permission |
| Cache hit but stale/unapproved | Do not use as verified fact; retrieval/explicit uncertainty |
| Quota exhausted | Degrade to E0/E1 or concise limited assistance, preserve vetted child safety route; anti-abuse policy |
| Model returns unsupported numeric claim | Drop unsupported claim; explain evidence limit |
| Provider outage | Static approved content or transparent unavailability; queue only when safe and explicitly designed |
| Child requests share to unsafe caregiver | No automatic forwarding; safety recipient assessment under specialized policy |
| Deleted Journal with derived insight | Invalidate/delete dependent cache and derived data under deletion policy |
| Voice request interrupted | Text fallback if user permits and privacy is preserved |

## 5. Routing evaluation checklist

- Unauthorized raw/derived Journal read: 0 permitted test outcomes.
- Reuse cached sensitive data across families/children: 0 permitted test outcomes.
- Cache based on unapproved knowledge presented as authoritative: 0 permitted test outcomes.
- Deterministic operations use LLM only with explicit justified override, not default.
- Safety escalation follows separate threshold/recipient policy; tests include false positives and unsafe caregiver.
- Metering logs actor, beneficiary, task/capability, execution tier, modality, cache hit, policy version, estimated/actual cost **without exposing sensitive content**.
- Quota policies tested for Parent-led, Child-executed, Child-directed, multi-parent same family, and 18+ transitions.
- Audit/report metrics: cost/household/month, cost/child, cost/task, tokens/minutes, cache hit/miss, grounded-answer success, escalation false alerts, privacy leakage, latency.

## 6. Still unapproved

Exact cache keys, TTLs, encryption/key management, model vendor, pricing, safety thresholds, provider transcript/log retention, response templates and per-capability E0–E3 assignment must be validated in System Design/Technical Specification and with experts where appropriate. This file is an architecture-policy proposal, **not tested runtime logic**.