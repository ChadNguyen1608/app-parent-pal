# Detailed review 17 · Child feedback, provenance and corrections

Candidate design. Pinned source `350a65c130dc15d49c7f2c791c7ea11915c70dff`. Synthetic fixtures only.

- [Feature_3_2_L4_B12_Design_and_Checkpoint_REVIEW.md](Feature_3_2_L4_B12_Design_and_Checkpoint_REVIEW.md), blob `99ba141c9c0785d34c9ddee93cf0433c4042c71f`.
- [Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md](Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md), blob `631547269a877407f42f568ed78436000491fcd5`.
- [B02 authority manifest](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md), B01-PA-OD-01..04 and B01-C-OD-07.

## F02-G05-M02 · Child Feedback

Own opaque feedback ID, subject, referenced fact or interpretation and displayed version, feedback category, restricted payload reference and receipt. An eligible child may agree, add context, contest or leave without responding. Silence never confirms the assertion. Verify subject, current action and target access before opening or committing feedback. A valid response to a superseded version remains linked to that version and can enter reassessment; it does not change the newer version. If the old target is no longer accessible, deny without confirming its existence. Feedback is not an effective correction. Scope retry by actor, subject and operation ID; compare payload digest and recheck authority before returning a receipt. Identical authorized retry returns the original disposition; divergent replay conflicts.

## F02-G06-M01 · Provenance

Own attributed claim/source links, asserted source kind, verification state, scope, validity interval and revision. Source domain owns underlying content and evidence. An authorized producer supplies the exact claim and source revision. Record self report, caregiver report, observed fact and inference distinctly; verification of origin does not prove the claim. Preserve contradictory eligible assertions and confidence reasons where allowed. Repeated copies of one source do not constitute corroboration. Unknown or disputed evidence cannot supply a verified claim. Source or permission withdrawal fences protected read, cache and downstream release before exposing any content, source ref, count or verification detail. Where actor retains profile access but an input became ineligible, use checkpoint 16's scoped REBUILD_PENDING behavior. An unauthorized actor receives generic denial. Audit stores only permitted refs, categories and versions.

## F02-G06-M02 · Correction & Confidence

Own dispute/correction case, target assertion and base revision, evidence manifest, reviewer scope, disposition and traceable confidence rationale. Proposed states: submitted, in review, needs reassessment, decided, applied. Dismissal or insufficient evidence does not silently turn a disputed inference into a verified fact. An eligible reviewer decides against an exact evidence manifest. Recheck reviewer authority, target revision and current evidence at decision. New conflicting evidence or stale base requires reassessment; at most one decision wins for the same undecided revision.

The source owner separately applies an eligible disposition after checking current authority, decision binding, evidence and target version. A decision is not an applied correction. On successful application advance fact/evidence versions, preserve lawful provenance and fence stale projections and reports. Reconcile any uncertain apply by scoped operation ID before retry; do not create a second fact revision. If the fact owner cannot apply because of change or revocation, leave the source unchanged and record a scoped reassessment or denial. A suppressed record cannot be republished by a correction. Confidence remains descriptive and evidence-based; thresholds and disputed-evidence eligibility are unverified. No diagnostic labels or implicit access expansion.

## Authority and cohort applicability

Access Policy issues final ALLOW/DENY. Purpose-bound Access supplies lawful-purpose evidence. An account, household binding, reviewer assignment or caregiver role supplies no blanket evidence access. Check actor and resource scope separately for submission, review, source apply and projection release. A0/A1 require eligible representative or supervised interaction; keep representative statements attributed. A2 uses guided feedback and an explicit skip. A3/A4 may contest their own claims within current scope. A5 uses verified self-management and voluntary family access. Age supplies no authority. E0/E1 with no inference. Real child data with unknown legal basis remains blocked.

| Oracle | Trace | Synthetic fixture and expected result |
|---|---|---|
| D17-T01 | B12-T01 | Submit eligible feedback to v1 after v2 is effective. Receipt points to v1; v2 remains unchanged and any proposed reassessment is separately scoped. |
| D17-T02 | B12-X01 | Lose submit response then replay same and different payload. One feedback record; same authorized retry gets receipt, different payload conflicts. |
| D17-T03 | B12-T01 | Child skips; caregiver subsequently reads eligible profile. No assent, preference or verification inferred from silence. |
| D17-T04 | B12-T02 | Caregiver report, child self-report and inferred claim conflict. Source types stay distinct; no automatic verified result or corroboration by duplicated import. |
| D17-T05 | B12-X02, D16-T09 | Withdraw source between build and release. Eligible profile reader gets REBUILD_PENDING without old source metadata. Unauthorized actor gets no status or existence signal. |
| D17-T06 | B12-T03 | Reviewer authority revoked before decision, then eligible reviewer decides. Only eligible decision persists and source is unchanged until guarded apply. |
| D17-T07 | B12-X03 | Conflicting evidence arrives after decision but before source apply. No effective correction or confidence promotion; reassessment uses current manifest. |
| D17-T08 | B12-T03 | Two eligible decisions race on same revision, then source apply response lost. At most one winning decision and one effective source revision; retry reconciles. |
| D17-T09 | D16-T11, D13-T10 | Source or derived record suppressed before queued correction. No republication through correction or cache; audit does not expose protected evidence. |
| D17-T10 | B01-PA-OD-02/04 | Operator or other household attempts evidence lookup or export without purpose and scope. No protected lookup, dispatch or disclosure. |

Open evidence: eligible reviewer assignments, source attestation and confidence criteria, dispute/remedy rules, and atomic source application and release fencing. No Owner decision required for this checkpoint. Runtime and independent re-review pending.
