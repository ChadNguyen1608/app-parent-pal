# PRODUCT BLUEPRINT 3.2 — SCENARIO TRACE MATRIX (REVIEW)
**Phiên bản:** 1.0 · **Ngày:** 2026-11-09  
**Trạng thái:** `REVIEW_ONLY / TRACEABILITY_NOT_ACCEPTANCE`  
**Dữ liệu đầu vào:** SC-001, SC-002 logs, SC-003 discussion + Package C fixture, Package A–E logs, Consolidation CON-D01..04.  
**LƯU Ý:** 3 scenario là mẫu validation, không chứng minh coverage mọi nhóm tuổi, mọi L4 hoặc sự vận hành thực tế.

## 1. Legend
- `COVERED_IN_PROPOSAL`: đã có owner/capability đề xuất, **chưa có L4/implementation test**.
- `PARTIAL`: có owner nhưng policy, data contract hoặc acceptance còn thiếu.
- `RESEARCH_REQUIRED`: chưa đủ bằng chứng/yêu cầu chuyên môn.
- `PENDING_SYSTEM_TEST`: chỉ test cấu trúc hoặc chưa chạy thực tế.
- `AGE`: A0=0–2, A1=3–5, A2=6–10, A3=11–14, A4=15–17, A5=18–23.
- `SC-003` log mới là `LOG_ONLY`, không phải scenario gốc đã ban hành từ trước.

## 2. SC-001 — Parent-led Guidance, Balance & Long-term Goals
| Test ID | User requirement / input | Primary owner | Dependencies | Expected outcome / negative gate | Coverage | Open validation |
|---|---|---|---|---|---|---|
| S1-01 | Trẻ lớp 3, mục tiêu trường tốt + IELTS 7 trước ĐH, hồ sơ thiếu | `F03-G04-M01/M02` | F02-G01; F03-G05-M01 | Hỏi thêm thông tin, không kết luận kế hoạch tự động | COVERED_IN_PROPOSAL | Data completeness rules |
| S1-02 | Mục tiêu theo năm/giai đoạn, milestone | `F03-G04-M03` ADD | F04-G01-M01 | Roadmap rõ, versioned; plan liên kết mốc | COVERED_IN_PROPOSAL | L4 acceptance |
| S1-03 | Standard Bar 4 presets có chỉnh khung thời gian 24h | `F04-G02-M03` ADD | F01-G04; F04-G01 | Check total duration, fixed/sleep/leisure/buffer; preset không là chuẩn khoa học | PARTIAL | Age health thresholds |
| S1-04 | Soft/Hard Cap, duyệt chuẩn và không spam | `F04-G02-M03` | F04-G06-M02; F04-G07 | Warn khi setup, prevent hard, avoid repeats when same bar/context | PARTIAL | Safety policy |
| S1-05 | Bơi/cờ: primary training, leisure bonus nhưng giữ thời gian vui chơi thực | `F04-G02-M01/M03` | F03-G02-M01 | 60m bơi vẫn = 60m timeline; không tự trừ 30–60m khỏi protected leisure | COVERED_IN_PROPOSAL | Multi-dimensional load data |
| S1-06 | Học→bơi→học | `F04-G02-M01/M03` | F02-G04-M01 | Xếp xen kẽ nếu phù hợp; bơi nặng không thay thế nghỉ cần thiết | PARTIAL | Recovery validation |
| S1-07 | Ngoại lệ ôn thi 1 tháng, tự khôi phục | `F04-G06-M01/M02` | F04-G07 | Approved temporary exception; expire/restore/remind | COVERED_IN_PROPOSAL | Overlap with standard bar |
| S1-08 | Mệt mỏi theo tuần/tháng, điều chỉnh theo nguyên nhân | `F06-G04-M01/M02` | F02-G06; F04-G06 | Evidence/hypothesis separation, no unilateral goal change | PARTIAL | Causality confidence |
| S1-09 | Mùa đông/hè, mưa, nhiệt độ, AQI | `F04-G02-M01/M03` | F02-G04-M01; F07-G01/G02 | Re-time/substitute; no silent Standard Bar change | PARTIAL | Forecast, local risk rules |
| S1-10 | Admissions info trường/năm/điều kiện | `F03-G05-M01` | F07-G01/G02 | Approved sources and review; cache alone not verification | PARTIAL | Data licensing/update |

## 3. SC-002 — Homework, Monthly Learning Report & Safety
| Test ID | User requirement / input | Primary owner | Dependencies | Expected outcome / negative gate | Coverage | Open validation |
|---|---|---|---|---|---|---|
| S2-01 | Bài giao vs bài đã làm | `F04-G05-M01/M02` | F06-G01 | Completed != assessed; evidence status stored | COVERED_IN_PROPOSAL | Submission model |
| S2-02 | Phép tính có đáp án | `F06-G07-M01` ADD | F07-G03-M01 | Deterministic rubric first, result/provenance separated | PARTIAL | Benchmark |
| S2-03 | Ảnh chữ viết sạch/đều, ảnh không rõ | `F06-G07-M01` | F07-G03-M03; F07-G04 | PASS only if both criteria; image unclear UNABLE_TO_ASSESS | PARTIAL | Vision pilot, Vietnamese sample |
| S2-04 | Bài mở khó chấm, kết quả AI không chắc chắn | `F06-G07-M01` | F07-G04-M02 | Confidence, review/correction; no inflated result | PARTIAL | Human correction |
| S2-05 | Lỗi/độ khó/thời gian/tiến bộ | `F06-G04-M01/M02` | F06-G07, F06-G01 | Trends contextual; never diagnose focus from duration alone | PARTIAL | Comparison calibration |
| S2-06 | Lớp chính, lớp phụ đạo, học ở nhà | `F06-G01-M02` | F08-G01; F04-G05 | Mark source provenance, import manual possible | COVERED_IN_PROPOSAL | Source normalization |
| S2-07 | Báo cáo tháng, dữ liệu lớp học thiếu | `F06-G05-M01/M02` | F01-G04; F06-G01/G07 | Only authorized source; no claim “no issue at school” from missing data | COVERED_IN_PROPOSAL | Reporting transparency |
| S2-08 | Trẻ tâm sự riêng tư trong Journal | `F05-G04/G05/G06` | F07-G06-M01 | No parent access or inferred leak without authorization | PARTIAL | Permission penetration test |
| S2-09 | Trẻ bị bạn đánh | `F07-G05-M01/M02` | F05-G01-M02; F01 | Child guidance, trusted adult; limited escalation if policy | RESEARCH_REQUIRED | Safety expert review |
| S2-10 | Người chăm sóc được nêu là nguồn áp lực | `F07-G05-M01/M02` | F01-G04; F07-G06 | Do not auto notify accused caregiver; don't automatically accuse | RESEARCH_REQUIRED | Recipient routing |
| S2-11 | Voice journal input | `F05-G04-M01` | F07-G03-M03 | Do not persist raw voice by default; provider retention verify | PARTIAL | End-to-end retention |
| S2-12 | Xóa Journal và insights | `F05-G06-M02` | F07-G06-M02 | Hide promptly, 60-day deletion rule with lawful exceptions; derived graph covered | PARTIAL | Backup/legal validation |

## 4. SC-003 — Age 13 career/streamer exploration
| Test ID | Requirement / input | Primary owner | Dependencies | Expected outcome / negative gate | Coverage | Open validation |
|---|---|---|---|---|---|---|
| S3-01 | Nghề streamer liên quan nhiều ngành | `F03-G05-M03` ADD | F07-G01/G02 | N:N taxonomy, not single rigid sales hierarchy | COVERED_IN_PROPOSAL | Taxonomy curation |
| S3-02 | Nghề và nhóm kỹ năng cần thiết | `F03-G05-M03` | F07-G01/G02 | Link documented skills, no unsupported career-fit verdict | PARTIAL | Skills evidence |
| S3-03 | Market statistics and incomes | `F07-G01/G02` | F03-G05-M03 | Require geography, year, source; no fabricated rate | PARTIAL | External dataset quality |
| S3-04 | Trial project quay video, phản tư | `F04-G01-M01` | F03-G04-M03; F04-G05; F06-G06 | Exploration can complete even if child dislikes job | COVERED_IN_PROPOSAL | Pilot UX |
| S3-05 | Artefact video initially private | `F04-G05-M02` | F01-G04; F07-G06 | No automatic publication, no auto transfer to Journal | PARTIAL | Storage/ACL |
| S3-06 | Share to mentor; revoke later | `F01-G04-M01/M02` | F07-G06; F04-G05 | Scoped permission and revoke enforcement | PARTIAL | Integration test |
| S3-07 | Public publishing as child aged 13 | `F01-G04-M01` | F07-G04/G05; platform | Block until legal/platform/policy criteria satisfied, parent consent alone not enough | RESEARCH_REQUIRED | Platform age rules |
| S3-08 | Career knowledge cached but not approved | `F07-G01/G02` | F07-G03-M01 | Not displayed as authoritative | COVERED_IN_PROPOSAL | Cache invalidation runtime |
| S3-09 | Adult age 19 direct account ownership | `F01-G04/G05/G06` | F07-G06 | Adult consent and account autonomy, no automatic parent access | PARTIAL | Transition data migration |

## 5. Cross-scenario / cost / safety / routing tests
| Cross ID | Scenario test | Modules | Expected/forbidden | Status |
|---|---|---|---|---|
| X-01 | Parent-led (A1) asks AI to build plan for 3 children | F01-G06-M02; F07-G03/G07 | One Family Subscription concept; actor vs beneficiary vs household; no multiply-bill | PROPOSED |
| X-02 | Shared family AI request concerns multiple children | F07-G07-M02 | Single request metered once, analytics allocation separate | PROPOSED |
| X-03 | Family quota depleted during safety dialogue | F07-G03-M02; F07-G05 | Safety-aware limited path; abuse prevention, no sudden unsafe cutoff | RESEARCH_REQUIRED |
| X-04 | Cache holds previously authorized child data after consent revoked | F07-G03-M01; F07-G06 | Authorization rechecked; cache invalidated and inaccessible | PENDING_SYSTEM_TEST |
| X-05 | One family attempts read another's plan/cache | F01-G04; F07-G03/G06 | Deny, no cross-family data leakage | PENDING_SYSTEM_TEST |
| X-06 | Journal transcript/audio sent to provider then user requests deletion | F05-G06; F07-G03/G06 | Provider retention and cache/data deletion constraints verified; don't claim unavailable deletion | RESEARCH_REQUIRED |
| X-07 | Schedule asks fresh weather data, provider outage | F04-G02; F07-G03 | Fall back safely, mark no current forecast; don't invent current weather | PROPOSED |
| X-08 | Subscriber payer also asks to read private Journal | F01-G06; F07-G06 | Deny unless separate, valid authorization/safety procedure | PENDING_SYSTEM_TEST |
| X-09 | Education expense manually entered | F08-G06; F01-G06-M03 | Expense logged; **no payment triggered** | PROPOSED |
| X-10 | Upgrade Family 1→3 children while subscription payment pending | F01-G06-M02/M03 | Entitlement changes based on trusted state; idempotent update | PENDING_SYSTEM_TEST |
| X-11 | Cached admissions/career source retracted | F07-G01/G02/G03 | Revoke, invalidate, disclose insufficient data | PENDING_SYSTEM_TEST |
| X-12 | Parent asked to explain computed progress from database | F06-G02/G04; F07-G03 | E0/E1 source truth; LLM cannot recalculate contradictory number | PROPOSED |
| X-13 | Safety alert notification at quiet hours | F07-G05; F04-G07; F07-G07 | Only policy-authorized recipient and content; no private Journal preview | RESEARCH_REQUIRED |
| X-14 | User aged 18 transitions away from guardianship | F01-G04/G06; F07-G06 | Revoke inherited access, honor lawful retention, no blanket deletion | PENDING_SYSTEM_TEST |
| X-15 | AI response uses a cached sensitive result with mismatched purpose | F07-G03; F07-G06 | Deny/recompute only if permitted; cache hit never grants access | PENDING_SYSTEM_TEST |

## 6. Coverage / residual risks
- **Mapped**: 10 SC-001 + 12 SC-002 + 9 SC-003 + 15 cross-case = **46 trace rows**.
- Mapping shows **design-level traceability, not feature completeness**. Each row still needs owner sign-off, success/alternate flow, explicit permissions, error cases, L4 acceptance, source evidence, cost route.
- A0–A5: this matrix spot-checks representative cohorts (A1, A2, A3, A5); **full six-cohort module inventory remains pending**.
- Permission/Safety/Data retention cannot be validated just by reading this document. Route through 3.3/3.4 and later Stage 08–10 reviews.
- `F06-G03-M03` from Package B is **superseded proposed ID**, never part of canonical.
- Do not silently turn any of these expected outputs into an approved policy threshold.

## 7. Trace decision and files
- `CON-D01`: `F06-G07-M01 Academic Assessment`.
- `CON-D02`: AI routing policy owned by F07-G03-M01/M02, modality by F07-G03-M03.
- `CON-D03`: four response cache classifications.
- `CON-D04`: SC-003 log separate.
- Sources: Package A–E Decision Logs; `Scenario_Change_Log_SC-001.md`, `Scenario_Change_Log_SC-002.md`, `Scenario_Change_Log_SC-003_REVIEW.md`, `Feature_3_2_AI_Routing_Policy_SPEC_DRAFT.md`, `Feature_3_2_Proposed_Canonical_Diff_REVIEW.md`.

**NO OFFICIAL BLUEPRINT EDITS.**