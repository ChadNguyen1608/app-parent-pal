# Parent-Pal — Batch 01: Remediation Triage & Independent Verification Plan

**Ngày:** 2026-11-13  
**Owner triển khai đặc tả:** ChatGPT; **người phê duyệt nghiệp vụ:** Product Owner; **người kiểm định độc lập:** Claude Code.  
**Trạng thái:** `SPECIFICATION_CORRECTIONS_PROPOSED / REVIEW_NOT_RUN / NO_APP_TESTS`.

## 1. Sản phẩm đã được ChatGPT tạo (không phải Claude tự sửa rồi tự nghiệm thu)

- [Specification Remediation Proposed v1](Feature_3_2_L4_B01_Specification_Remediation_Proposed_v1_REVIEW.md): 8 nhóm contract/acceptance criteria được viết lại có oracle kiểm thử và tham chiếu Owner Decisions, bao gồm LEGAL_UNKNOWN, hard-cap discussion-only, delegated grant sau caregiver handover, per-child mode, lock, CR TTL/idempotency, App Default Bar, Journal/audit.
- 17 test mới NT-001..017 do Consolidation đề xuất được đối chiếu; đề xuất thêm NT-018..021 cho 8 quyết định mới.
- **Chưa chạy** các test; các con số 46 findings pending / 9 HIGH gaps / 59/64 P5 trace phản ánh báo cáo Consolidation chứ chưa phải kết quả remediation verified.
- Không sửa `Product_Blueprint_03_2/03_3/03_4`, canonical, baseline tests hoặc stable IDs. Không claim L4 accepted.

## 2. Phân loại 32 Regression Gaps C3 thành hành động

Các status dưới đây thể hiện **bản sửa đề xuất đã được ghi hay chưa**, không thể hiện actual PASS.

| RG | Severity nguồn | ChatGPT xử lý | Việc còn cần và bên nhận |
|---|---|---|---|
| RG-01 | MEDIUM | SR-03: consent/grant/authorization rõ loại và scope | Claude check P6-AP-OD-02 vs B01-CL-OD-03, OQ-B01C-1; test/trace |
| RG-02 | HIGH | SR-03: cập nhật oracle CL:QT-012/019/033/052 | Claude verify consent can't be suspended by unauthorized revoke |
| RG-03 | HIGH | SR-02: CR:QT-099 discussion-only hard-cap | Claude adversarial prove no approval/commit paths |
| RG-04 | HIGH | SR-04: per-child capability vs blanket A0–A2 ban | Claude verify fail-closed without adding age policy unsupported by MR-015 |
| RG-05 | HIGH | SR-04: mode per child not plan manager | Claude verify isolation of two children |
| RG-06 | HIGH | SR-05: lock blocks owner too until unlock or audited override | Claude verify stale/offline/race |
| RG-07 | MEDIUM | SR-04: Parent-led may express wishes through F05 but not official CR | Claude check P5 MP-C21 historical supersession |
| RG-08 | MEDIUM | SR-06: 7-day pending + full expiry boundary | Claude check NT-009 |
| RG-09 | MEDIUM | SR-06: approved-unapplied expiry 7 days after approval | Already Owner-chosen (B01-C-OD-03); Claude verify NT-018 |
| RG-10 | HIGH | SR-08: F01-G02-M01 Child App account-link dependency | **NOT REMEDIATED** by B01 only; defer to independent F01-G02 module design + verify NT-015 contract |
| RG-11 | HIGH | SR-08: Journal delete vs revoke distinction, 60-day rule | **NOT REMEDIATED** by B01 only; F07-G06-M02 retention owner and F05-G06 sharing required; verify NT-004 |
| RG-12 | HIGH | SR-01: lawful basis UNKNOWN fail-closed all consumers | Claude highest-priority verification; production real-child-data gate stays CLOSED |
| RG-13 | HIGH | No legal ruling fabricated | RESEARCH_REQUIRED, legal/privacy review; gate CLOSED |
| RG-14 | MEDIUM | SR-08: F07 audit governance, infra storage | Already Owner-chosen (B01-C-OD-07); needs audit subsystem technical owner assignment |
| RG-15 | MEDIUM | SR-04: no automatic blanket age allow/deny as replacement | RESEARCH_REQUIRED MR-015; interim deny action with insufficient capability evidence |
| RG-16 | MEDIUM | Adult verified authority stays protected | RESEARCH_REQUIRED MR-017 for age 18+ verification |
| RG-17 | MEDIUM | SR-07: revisioned exception changes revalidate | Claude check NT-010 and MP-C26, require real M03 contract later |
| RG-18 | MEDIUM | SR-07: F04-G02-M03 owns soft-cap lifecycle/reminder | Already Owner-chosen (B01-C-OD-04); verify no duplicate owner |
| RG-19 | MEDIUM | SR-04: F05 owns Parent-led communication channel | Already Owner-chosen (B01-C-OD-08); verify no implicit CR |
| RG-20 | LOW | Marked proposed removal of stale consent assent AC crossref | Needs exact line-level edit in owner source L4 artifact and validator run; do not mark RESOLVED |
| RG-21 | LOW | Source 2.3 decision cross-reference documented | Requires source trace to 2.3 doc, not just business recollection |
| RG-22 | MEDIUM | SR-06 & SR-05 define commit gate terms | Need exact CG-01..CG-18 to AC→test mapping and 3 missing PS regression tests; incomplete |
| RG-23 | MEDIUM | SR-06 state machine + idempotent reconcile specified | Need state-machine transition table differential against SC-CR-LIFECYCLE and CR:F-022/F-025 |
| RG-24 | MEDIUM | 42 confirmed decisions listed as authority | Need test-registry mechanical migration of ~75 blocked_by labels into decision_refs; not done |
| RG-25 | MEDIUM | Dependency P6 retained | Need underlying P6 pilot documents/evidence for Academic F-023 and Balanced F-021; missing B01 ZIP is not evidence those were fixed |
| RG-26 | MEDIUM | SR-04 plus NT-001 | Need independent oracle verification |
| RG-27 | MEDIUM | SR-01 plus NT-005/014 | Need independent multi-consumer no data access oracle |
| RG-28 | MEDIUM | SR-07 plus NT-012 | Need verify App Default Standard Bar positive/negative paths |
| RG-29 | LOW | SR-05: lock no max TTL and no auto unlock | Already Owner-chosen (B01-C-OD-05); verify reminder can't mutate lock |
| RG-30 | MEDIUM | SR-05: draft/offline allowed, effective commit blocked | Already Owner-chosen (B01-C-OD-06); verify permission/sync gates |
| RG-31 | MEDIUM | No safety legal/clinical oracle invented | RESEARCH/TECH DESIGN: normalize ROUTE_CONTROLLED_ONLY vs SAFETY_ROUTE_REQUIRED vs NOT_APPLICABLE_SAFETY_ROUTE |
| RG-32 | MEDIUM | Evidence gap explicitly retained | **BLOCKED_EVIDENCE**: P5 missing ID MP-B15, C05, C06, C18, C19 + nine ambiguous ID semantics; do not fabricate baseline |

**HIGH count C3:** RG-02,03,04,05,06,10,11,12,13 = 9. Of these, 6 have proposed B01 corrections (02..06,12); RG-10/11 need unpiloted owner modules, RG-13 research/legal. Thus **0/9 independently verified closed** at publication.

## 3. Findings/Owner decision reconciliation

- Consolidation reports 114 pilot findings and 46 spec edits remaining. ChatGPT has **created common corrected contracts**, but this does **not constitute closure of 46 discrete findings** without per-finding change pointer and test evidence.
- Previously unresolved Owner questions `OQ-B01C-1..8` are answered in [Consolidation Owner Log](Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md). In C2/C3 output, all claims that these eight OQ remain `NEW_OWNER_DECISION_REQUIRED` must become `OWNER_DECIDED / SPEC_MAPPING_PENDING`.
- `OQ-B01C-1`: current child schedule delegation **survives Primary handover**. A contrary suggestion of `AUTO_SUSPEND` is superseded, not adopted.
- `OQ-B01C-3`: approved-unapplied CR TTL newly fixed at 7 days from approval, not confused with pending 7 days from submission.
- `OQ-B01C-5/6`: lock cannot be auto-released, draft/offline changes may exist but never apply to effective timetable while locked.
- **46 individual findings need source-level remediation mapping in next review artifact:** `finding_id → source/AC/test → proposed SR/patch → verification evidence → status`. For now `PENDING_INDEPENDENT_REVIEW` unless explicitly supported.
- **25 temporary L4 entries** stay candidates, including KEEP/MERGE/SPLIT/DEFER labels from C4, not final.

## 4. Chỉ định Claude làm công việc thực sự độc lập

Claude không được nhận nhiệm vụ tự viết lại toàn bộ feature hoặc tự sửa tiếp 46 findings rồi tự xác nhận PASS.

### Phase V1 — Independent critique of ChatGPT remediation (mandatory)

- Read 42 Owner decisions + **ChatGPT Specification Remediation v1** as the review target, and source ZIPs only for verification.
- QA independently derive **negative/edge test oracles** from Owner logs *before* using ChatGPT's test list; compare then identify missed cases.
- Architect independent contract & state-machine review: policy chain, lock/CR commit, handover grants, Journal derived access.
- Reviewer adversarially challenge especially `LEGAL_UNKNOWN` fail-open, hard-cap approve paths, lock override, stale approval and permission-epoch races.
- Return `ACCEPT / REJECT / PARTIAL` per SR-01..SR-08, with exact counterexample; **no self-repair** within verification report.

### Phase V2 — Evidence & registry checks (targeted)

- Establish source-to-diff mapping for 46 findings without inventing fixes; check 32 RG oracles and 17+4 proposed NTs for sufficiency.
- Verify what can/cannot be checked from P5/P6 source. Mark missing baseline `EVIDENCE_MISSING`.
- Provide minimally sufficient exact patch proposals for any rejected SR; ChatGPT remains author of follow-up spec amendments.
- Return a lean ZIP, not rerun all five pilot decompositions or all Consolidation C0–C5.

### Proposed gate for this review

- `REMEDIATION_DESIGN_VERIFIED`: all 8 SR contracts independently reviewed, HIGH safety/privacy oracles coherent, no unresolved critical contradictions; research/missing P5 documented (this does **not** imply production-ready).
- `REMEDIATION_PARTIAL`: noncritical gaps or evidence missing, but security protections remain fail-closed.
- `REMEDIATION_BLOCKED`: critical contradiction, fail-open data access, hard-cap approval vulnerability, unsupported owner assumptions.

## 5. Remaining owner & external tasks

| Item | Owner | Next action |
|---|---|---|
| Legal basis of real child data by purpose | Legal/privacy research & Owner | Determine lawful grounds, document jurisdiction and safeguard; prohibit real data until verified |
| Age/capability policy | Research | Evidence-backed thresholds, not blanket hard ban or permissive auto-grant |
| F01-G02-M01 Child App link | Future design module | Link/revoke security + NT-015 |
| F05-G06-M01 Journal grant | Future design module | Share/revoke semantics & privacy default |
| F07-G06-M02 Retention/Delete | Future design module | 60-day deletion pipeline and exceptions |
| F04-G06-M02 History | Future design module | Approval-vs-plan-lineage audit split |
| Missing P5 baseline raw descriptions | Evidence/QA | Recover original test IDs and semantics; don't fabricate |
| P6 Academic/Balanced unresolved | Future regression | Read original source before closure |

## 6. Preservation & execution

- GitHub PR #17 branch: source for confirmed decisions plus proposed remediation docs. **No merge/canonical edits.**
- Evidence repo commit pinned for original 5 ZIPs. Consolidation ZIP must be explicitly present for Claude independent review; do not reconstruct from summaries.
- Coordinator model unchanged; <=3 Sonnet 5.5 sub-agents only when warranted. The 3 agents are optional for a focused independent check.
- Claude can read both repositories but **no Git writes**, no Owner decisions, no app implementation.
