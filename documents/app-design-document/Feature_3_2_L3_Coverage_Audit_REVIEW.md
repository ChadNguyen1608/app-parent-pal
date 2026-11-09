# FEATURE INVENTORY 3.2 — L3 COVERAGE AUDIT (REVIEW ONLY)
**Phiên bản:** 1.0 · **Ngày:** 2026-11-10  
**Trạng thái:** `AUDIT_FIRST_PASS / REVIEW_ONLY / NOT_APPLIED`  
**Phạm vi:** Long-term 0–23 tuổi; 6 cohort; CORE lớp 1–9 Việt Nam; không quyết định MVP, không cập nhật canonical hoặc GitHub.  
**Nguồn:** 3.2 baseline; 3.3; 3.4; Proposed Canonical Diff; Consolidation Decision Log; Package A–E; SC-001/002/003; Scenario Trace Matrix; Master Research Backlog v1.2.

> **Cảnh báo:** Đây là **kiểm toán trên tài liệu**. `COVERED` ở mức đặt tên L3 không đồng nghĩa đủ capability L4, đã được user testing, legal/safety review, hay đã triển khai. Các phát hiện mới là đề xuất của vòng audit, **không tự động trở thành quyết định sản phẩm**.

## 1. Mục tiêu, phương pháp và giới hạn
1. Đối chiếu **98 L3 baseline** với **8 L3 ADD proposed**; xác minh uniqueness, ownership và 51 Group dự kiến.
2. Với từng Group, xác định điều kiện để năng lực có thể đi qua **actor → trigger → permission → action → outcome → error/recovery**; ghi gap chứ không tự tạo L3.
3. Kiểm tra trace theo **12 Use Case Families, 24 UC mẫu** và **46 scenario/cross-case trace rows**; các số này chỉ là tập mẫu hiện có, không đại diện toàn bộ sản phẩm.
4. Phân loại vấn đề thành **L3 structure**, **L4/UC detail**, **policy/research**, **cross-domain contract**. Chỉ đề xuất L3 mới nếu ownership độc lập không thể biểu đạt trong module hiện có.
5. Không thực hiện kiểm thử code, người dùng, luật, y khoa, chi phí AI hay benchmark mô hình. Không tuyên bố độ bao phủ phần trăm từ số module.

## 2. Kết quả kiểm tra định lượng
| Hạng mục | Kết quả | Ý nghĩa |
|---|---:|---|
| L1 Domain | 8 | Không đề xuất Domain mới ở vòng này |
| L2 Group canonical | 49 | Đã có Age Matrix 49 Group |
| L2 Group proposed | +2 = 51 | `F06-G07`, `F08-G06`; chưa canonical |
| L3 baseline | 98 | 98 ID duy nhất, mỗi Group 2 L3 minh họa |
| L3 proposed ADD | +8 = 106 | 8 ID duy nhất; không dùng `F06-G03-M03` superseded |
| L4 baseline | 98 ví dụ | Không phải inventory L4 đầy đủ |
| L4 mới | 8 placeholder | Chưa có acceptance metadata hoàn chỉnh |
| Use Case Families / UC hiện có | 12 / 24 mẫu | UC-### không phải bộ kiểm thử bao phủ đầy đủ |
| Scenario Trace Matrix | 46 hàng | 10 SC-001 + 12 SC-002 + 9 SC-003 + 15 cross-case |
| Nhóm mới xuất hiện trong 3.4 | 0/2 | **Gap truy vết**, không chứng minh thiếu tính năng |
| Duplicate ID L3 trong danh sách dự kiến | 0 | Kiểm tra ID cú pháp/duy nhất, không phải semantic deduplication |

**Kết luận định lượng:** cấu trúc 106 L3 **hợp lệ ở mức đếm và định danh**; chưa có cơ sở để chốt **functional completeness**. Không khuyến nghị tự động ADD L3 vượt 8 module đã được chốt ở cấp đề xuất.

## 3. Phân tích 8 Domain
| Domain | Group dự kiến | L3 dự kiến | Đánh giá audit | Trọng tâm chưa đóng |
|---|---:|---:|---|---|
| F01 Identity & Family | 6 | 13 | `PARTIAL` | Entitlement vs billing, consent/18+, guardian conflicts |
| F02 Child Understanding | 6 | 12 | `NAMED` | Provenance, confidence, corrections, no Journal leakage |
| F03 Guidance | 6 | 14 | `PARTIAL` | Roadmap, career/admissions, approved goal boundaries |
| F04 Planning | 7 | 15 | `PARTIAL` | Balance validation, timeboxed exception, task vs assessment |
| F05 Companion & Journal | 6 | 12 | `POLICY_CRITICAL` | Privacy/retention, derived insight, safety exceptions |
| F06 Tracking | 7 | 13 | `PARTIAL` | Academic assessment group, report provenance |
| F07 Knowledge & Safety | 7 | 15 | `POLICY_CRITICAL` | AI routing/modality/cache, safety operations, human review |
| F08 Ecosystem | 6 | 12 | `PARTIAL` | Education finance, integrations, partner governance |

**Quy ước:** `NAMED` = có chủ thể L3 được đặt tên; `PARTIAL` = còn hợp đồng/UC quan trọng; `POLICY_CRITICAL` = chưa thể coi là sẵn sàng phát hành do policy/safety/privacy chưa được thẩm định. Các trạng thái **không phải điểm số chất lượng**.

## 4. L2 Group coverage — 51/51 Group đã được rà soát
| Group | L3 | Ưu tiên audit | Vấn đề phải đóng ở L4/UC/policy | Hướng xử lý |
|---|---:|---|---|---|
| `F01-G01` Account & Authentication | 2 | N | Khôi phục tài khoản, thiết bị mới, thu hồi session; trẻ không tự nhận quyền người lớn | `L4 / SEC` |
| `F01-G02` Family & Member Management | 2 | M | Đồng giám hộ, rời gia đình, chuyển quyền, tranh chấp và lịch sử chia sẻ | `L4 / POLICY` |
| `F01-G03` Child Identity & Basic Profile | 2 | N | Tách hồ sơ trẻ với tài khoản đăng nhập; xác minh/chỉnh dữ liệu gốc | `L4 / DATA` |
| `F01-G04` Roles, Permissions & Consent | 2 | H | Consent theo purpose + scope + thời hạn; quyền bị thu hồi ngay cả khi cache còn | `L4 / POLICY` |
| `F01-G05` Autonomy Mode Management | 2 | H | Parent-led/Child-executed/Child-directed và 18+; chuyển mode không tăng quyền ngầm | `L4 / POLICY` |
| `F01-G06` Account & Data Lifecycle | 3 | H | Entitlement vs payment state vs quota; billing lifecycle M03 chưa canonical | `ADD + L4` |
| `F02-G01` Child Information Collection | 2 | N | Thông tin thiếu/không chắc; hỏi bổ sung mà không gây gánh nặng nhập liệu | `L4 / UX` |
| `F02-G02` Interests & Preferences | 2 | N | Sở thích đổi theo thời gian, do trẻ xác nhận và có nguồn | `L4 / DATA` |
| `F02-G03` Strengths, Needs & Challenges | 2 | M | Quan sát/nhu cầu khác với suy luận nhạy cảm; tránh dán nhãn | `L4 / SAFETY` |
| `F02-G04` Contextual Understanding | 2 | N | Ngữ cảnh học đường/gia đình có nguồn, thời hạn và quyền truy cập | `L4 / DATA` |
| `F02-G05` Child Understanding Profile | 2 | M | Hồ sơ có phiên bản; trẻ có thể xem và phản đối nhận định | `L4 / POLICY` |
| `F02-G06` Information Reliability & Review | 2 | M | Provenance, độ tin cậy, conflict resolution, rút lại suy luận | `L4 / DATA` |
| `F03-G01` Development Framework | 2 | N | Khung tham chiếu có phiên bản; không suy ra chuẩn lâm sàng từ taxonomy | `L4 / RESEARCH` |
| `F03-G02` Development Areas & Dimensions | 2 | N | Phân loại đa chiều, một hoạt động không bị đếm thời lượng hai lần | `L4 / RULE` |
| `F03-G03` Age & Stage Guidance | 2 | M | Sáu cohort và accessibility; không lấy tuổi làm luật cấp quyền | `L4 / UX` |
| `F03-G04` Goal Discovery & Definition | 3 | H | Mục tiêu dài hạn → roadmap/milestone M03, owner F03; F04 chỉ thực thi | `ADD + L4` |
| `F03-G05` Personalized Guidance | 3 | M | Career M03, Admissions sources; CACHED ≠ VERIFIED ≠ APPROVED | `ADD + L4` |
| `F03-G06` Goal Review & Adjustment | 2 | M | Điều chỉnh mục tiêu có bằng chứng và phê duyệt; không auto-override | `L4 / POLICY` |
| `F04-G01` Plan Creation & Management | 2 | N | Plan version gắn mục tiêu/milestone; template không mặc nhiên đã duyệt | `L4 / DATA` |
| `F04-G02` Activity Planning & Scheduling | 3 | H | Standard Bar M03, tải lượng/hồi phục, weather, lịch xung đột | `ADD + L4` |
| `F04-G03` Task Assignment & Delegation | 2 | N | Người được giao, người duyệt và người trả phí không đồng nhất | `L4 / POLICY` |
| `F04-G04` Daily Execution | 2 | N | Thực thi hỗ trợ, hoạt động offline, tình trạng không hoàn thành | `L4 / UX` |
| `F04-G05` Progress Reporting | 2 | M | Task complete ≠ submitted ≠ assessed ≠ reviewed; bài làm có provenance | `L4 / DATA` |
| `F04-G06` Plan Adjustment & Approval | 2 | M | Ngoại lệ ôn thi có expiry/restore; concurrent edits/approval audit | `L4 / RULE` |
| `F04-G07` Reminder & Notification | 2 | M | Quiet hours, timezone, retry, recipient policy và safety exception | `L4 / OPS` |
| `F05-G01` Child AI Companion | 2 | H | Trợ lý trẻ em có giới hạn quan hệ, kiểm quyền, voice fallback | `L4 / SAFETY` |
| `F05-G02` Emotional Check-in | 2 | N | Check-in tự nguyện, có thể bỏ qua, không biến thành chẩn đoán | `L4 / SAFETY` |
| `F05-G03` Daily Reflection / Kid Journey | 2 | N | Reflection khác Journal; không tự đưa bản ghi sang parent report | `L4 / DATA` |
| `F05-G04` Private Child Journal | 2 | H | Journal riêng tư, voice tạm, không tự retrieval khi trẻ không mở | `L4 / PRIVACY` |
| `F05-G05` Private Insight Management | 2 | H | Insight dẫn xuất có lineage và quyền sửa/xóa, không leak qua báo cáo | `L4 / PRIVACY` |
| `F05-G06` Journal Privacy, Sharing & Deletion | 2 | H | Xóa hiển thị ngay, xử lý 60 ngày/backup/provider, safety exceptions | `L4 / PRIVACY` |
| `F06-G01` Activity Tracking | 2 | N | Nguồn tự khai/giáo viên/phụ đạo, timestamp, de-duplication | `L4 / DATA` |
| `F06-G02` Goal Progress Monitoring | 2 | N | Tiến độ có mẫu số/điều kiện và missing-data state | `L4 / RULE` |
| `F06-G03` Development Indicators | 2 | M | Development Indicators không sở hữu học thuật assessment | `L4 / BOUNDARY` |
| `F06-G04` Trend & Pattern Analysis | 2 | M | Trends đủ mẫu; nguyên nhân chỉ là hypothesis, không verdict | `L4 / EVIDENCE` |
| `F06-G05` Reports & Dashboards | 2 | H | Parent report chỉ từ nguồn được phép; không inference từ Journal | `L4 / PRIVACY` |
| `F06-G06` Review & Feedback Loop | 2 | N | Review và handoff chỉ tạo đề nghị, không tự thay goal/plan | `L4 / POLICY` |
| `F06-G07` Academic Learning Assessment [NEW] | 1 | H | Rubric, grading pilot, unable-to-assess, appeal; nhóm mới chưa trong 3.4 | `ADD + UC` |
| `F07-G01` Knowledge Repository | 2 | N | Knowledge status, nguồn cập nhật, vùng/địa phương, cache invalidation | `L4 / DATA` |
| `F07-G02` Knowledge Validation & Evidence | 2 | N | Thẩm định human, ngày xem xét, thu hồi nguồn, evidence quality | `L4 / RESEARCH` |
| `F07-G03` AI Interaction & Orchestration | 3 | H | E0–E3 task routing khác modality M03; 4 cache classes, quota | `ADD + POLICY` |
| `F07-G04` AI Quality & Behavior Governance | 2 | H | Eval safety/quality/age/tiếng Việt, model fallback và release gate | `L4 / EVAL` |
| `F07-G05` Child Safety & Escalation | 2 | H | Risk triage, người nhận an toàn, không auto-notify người bị cáo buộc | `L4 / SAFETY` |
| `F07-G06` Privacy & Data Governance | 2 | H | Authorization trước retrieval, provider retention, export/deletion lineage | `L4 / PRIVACY` |
| `F07-G07` Audit & Operational Controls | 2 | H | Incident/support/refund, role-based admin, audited break-glass | `L4 / OPS` |
| `F08-G01` School & Education Integration | 2 | M | School/manual/tutoring sources; teacher-verified chỉ khi có xác nhận | `L4 / DATA` |
| `F08-G02` Expert & Professional Services | 2 | N | Xác minh chuyên gia, consent referral, không mặc định can thiệp | `L4 / POLICY` |
| `F08-G03` Learning Resources & Activities | 2 | N | Nguồn địa phương/độ tuổi, availability và suitability chưa kiểm chứng | `L4 / RESEARCH` |
| `F08-G04` Device & External Data Integration | 2 | M | Thu hồi consent, dữ liệu stale, de-duplication, provider outage | `L4 / DATA` |
| `F08-G05` Commercial Ecosystem | 2 | M | Sponsored disclosure, transaction conflicts, partner verification | `L4 / COMMERCE` |
| `F08-G06` Education Finance [NEW] | 2 | H | Education budget/expense ≠ subscription payment ≠ wallet; nhóm mới chưa trong 3.4 | `ADD + UC` |

**Giải thích H/M/N:** H = cần làm rõ trước khi canonical/đặc tả L4 nhạy cảm; M = cần trong vòng L4/UC; N = kiểm tra tiêu chuẩn trước khi phát triển. Không phải MVP priority hay user value.

## 5. Issue Register — 17 khoảng trống cần xử lý
| ID | Mức | Chủ đề | Vị trí | Phát hiện / evidence từ tài liệu | Hành động đề xuất |
|---|---|---|---|---|---|
| AUD-01 | BLOCKER | Traceability 3.4 | F06-G07; F08-G06 | Hai Group mới không xuất hiện trong 3.4; 24 UC là mẫu, không phủ toàn bộ hành trình | Bổ sung UC ứng viên cho assessment, education finance và error/approval flows; không tự sửa 3.4 |
| AUD-02 | BLOCKER | L4 completeness | Toàn bộ 106 L3 | 98 L4 baseline chỉ là 1 ví dụ/module; 8 L4 mới cũng placeholder | Tạo L4 capability matrix theo observable outcome, quyền, dữ liệu, E0–E3, acceptance; chưa đếm số L4 cuối |
| AUD-03 | HIGH | Cohort coverage | F06-G07; F08-G06; F01-G05 | Age Matrix mới chỉ có 49 hàng, không có 2 Group mới; Group-level UX ≠ module permissions | Review sáu cohort và autonomy cho 2 Group mới; kiểm 18+ chuyển quyền |
| AUD-04 | HIGH | Billing & AI entitlement | F01-G06; F07-G03/G07 | Chưa có contract chi tiết trial→purchase→renew→refund→restore, actor/beneficiary, quota cost | Đặc tả state transitions/idempotency/verified source; family subscription không cấp Journal access |
| AUD-05 | HIGH | Academic assessment | F04-G05; F06-G07; F06-G05 | Chưa có end-to-end trạng thái bài nộp/chấm/duyệt, unable-to-assess, giáo viên/phụ đạo | Thiết kế grading pilot + rubric + review/correction + provenance + benchmark |
| AUD-06 | HIGH | Journal lineage | F05-G04/G05/G06; F07-G06 | Chưa chứng minh xóa liên đới insight/cache/provider/backups và phân quyền trong report | Dựng data lineage + deletion contract; test deny-by-default và 60-day policy feasibility |
| AUD-07 | HIGH | Safety escalation | F07-G05; F01-G04; F05-G01 | Không có validated recipient selection, false positive/negative và human escalation SLA | Safety policy/legal/expert review; adverse caregiver case; không tự báo người bị cáo buộc |
| AUD-08 | HIGH | Balance rule evidence | F04-G02; F03-G02; F04-G06 | Family Standard Bar và tải lượng chưa có rubric/threshold được kiểm chứng | Tách hard/soft cap, protected leisure, one-count duration, timeboxed exceptions; research thresholds |
| AUD-09 | HIGH | AI routing & cache | F07-G03/G04/G06 | Chưa có per-action authorization, key scope, TTL, invalidation và provider-retention contract | Spec test matrix E0–E3 vs modality; four cache classes; denied retrieval must never hit cache |
| AUD-10 | MEDIUM | Knowledge provenance | F07-G01/G02; F03-G05 | Career/Admissions dữ liệu thay đổi; cache không đồng nghĩa approved; human review chưa có workflow kiểm thử | Dataset lifecycle, source withdrawal, locale/date, correction and publication status |
| AUD-11 | MEDIUM | Data imports | F08-G01/G04; F06-G01 | Trùng lặp/nguồn mâu thuẫn/manual vs teacher-verified chưa có acceptance | Import mapping, dedupe, confidence, revoke, stale and failed sync cases |
| AUD-12 | MEDIUM | Operational completeness | F07-G07; F04-G07; F01-G06 | Support/refund/incident/notification retries chưa có role/access/error contracts | Ops UC: refund dispute, notification duplicate, quiet hours, audited break-glass |
| AUD-13 | MEDIUM | Financial boundary | F08-G06; F01-G06; F08-G05 | Education budget không là payment/wallet; approval/ledger semantics chưa có UC | Budget→expense→approval→report, no payment side effect, payer vs data access |
| AUD-14 | MEDIUM | Goal and exploration lifecycle | F03-G04/G05/G06; F04-G01; F06-G06 | Exploration có thể kết thúc không theo nghề; goal/roadmap versions vs plan approval chưa end-to-end | UC cho goal-oriented/exploration-oriented; change proposal, stop/close, milestone version |
| AUD-15 | MEDIUM | Research & validation linkage | 3.2 / 3.3 / 3.4 / MR | Chưa gán MR-ID cho tất cả gap, L3 value/confidence/dependency chưa chấm đầy đủ | Đối chiếu MR hiện có; chỉ đề xuất MR mới nếu thật sự thiếu; không giả định user validation |
| AUD-16 | MEDIUM | Age & accessibility | F03-G03; F04-G04; F05-G01; F07-G04 | Group matrix 6 cohort chưa đảm bảo L4 UX, disability và input alternatives | Thiết kế representative cohort/assistive-tech acceptance, không ép tương tác trực tiếp 0–2 |
| AUD-17 | MEDIUM | Scope boundary vs app code | Tất cả Domain | Blueprint nghiên cứu có thể khác quy tắc hiện hành của Pal; chưa có mapping implementation | Review conflicts với docs/pal và code riêng trước khi biến thành development requirements |

### 5.1. Phân biệt lỗi cấu trúc và thiếu đặc tả
- **L3 structural gap đã được đề xuất và có quyết định cấp proposal:** đúng 8 ADD trong Proposed Diff; chưa phát hiện chứng cứ đủ mạnh để thêm L3 thứ 9 ở vòng desk audit này.
- **Trace/UC gap:** hai Group mới chưa có mặt trong 3.4; một số hành trình billing, finance, academic, safety cần UC độc lập hoặc alternate flow. Không suy ra phải tạo Group mới.
- **L4 gap:** phần lớn 106 module mới ở mức tên/năng lực; cần chia hành vi có outcome và acceptance. Không áp dụng quy tắc 1 L3 = 1 L4.
- **Policy/research gap:** safety, retention, 18+, pricing/quota, academic assessment, weather/health standards và model quality; cần thẩm định, không tự điền threshold.

## 6. Coverage theo hành trình / scenario
| Hành trình | Có owner chính | Đã trace | Gap nổi bật | Kết luận |
|---|---|---|---|---|
| Onboard → identity/consent → child profile | F01/F02 | UCF-01/02; UC mẫu | guardian conflict, 18+ transition, consent revocation | PARTIAL |
| Hiểu trẻ → goal → roadmap → approved plan | F02/F03/F04 | SC-001; UCF-03/04 | M03 roadmap, balance constraints, age approval, expiry | PARTIAL |
| Execute → submit homework → assess → parent report | F04/F06 | SC-002; UCF-05/08 | F06-G07 absent in 3.4; provenance, unable-to-assess | TRACE_GAP |
| Private Journal → insight → optional share/delete | F05/F07 | SC-002; UCF-07/10 | derived data lineage, provider retention, adverse caregiver | POLICY_CRITICAL |
| Career exploration → trial project → reflection | F03/F04/F06/F07 | SC-003; UCF-03/05/08/09 | career sources, exploration termination, public sharing gates | PARTIAL |
| Subscribe → verify payment → quota/restore | F01/F07 | UCF-12 | payment state, actor/beneficiary, refunds, failover | UC_EXPANSION |
| Education budget → expense → approval → report | F08/F01 | Cross-case X-09/10 | F08-G06 absent in 3.4; no payment side effect | TRACE_GAP |
| Safety signal → triage → authorized human response | F07/F01 | SC-002; UCF-10 | recipient selection, legal policy, false positives | POLICY_CRITICAL |
| AI request → authorize → route → respond/fallback | F07/F01 | UCF-06/09/12 | E0–E3 vs modality, cache scope/TTL, provider retention | POLICY_CRITICAL |

**Kiểm tra phủ 6 cohort:** hiện 49 Group có ma trận UX cấp Group; **2 Group mới chưa có ma trận**, và **chưa thể suy ra 106 × 6 biến thể L4 đã được thiết kế**. Cần ghi rõ `not_applicable + alternative` khi không phù hợp, đặc biệt 0–2 và 18–23.

## 7. Registry 106 L3 — kiểm tra tên/owner/status (không phải nghiệm thu)
`BASELINE_NAMED` = module hiện diện trong canonical; `PROPOSED_ADD` = module có trong diff, chưa canonical. Cột Review focus dẫn tới Group audit ở mục 4, không gán sai rằng L4 đã đủ.
| L3 ID | Module | Source | Review focus |
|---|---|---|---|
| `F01-G01-M01` | Account Access | `BASELINE_NAMED` | `L4 / SEC` |
| `F01-G01-M02` | Session Security | `BASELINE_NAMED` | `L4 / SEC` |
| `F01-G02-M01` | Family Structure | `BASELINE_NAMED` | `L4 / POLICY` |
| `F01-G02-M02` | Member Relationships | `BASELINE_NAMED` | `L4 / POLICY` |
| `F01-G03-M01` | Core Identity | `BASELINE_NAMED` | `L4 / DATA` |
| `F01-G03-M02` | Profile Integrity | `BASELINE_NAMED` | `L4 / DATA` |
| `F01-G04-M01` | Access Policy | `BASELINE_NAMED` | `L4 / POLICY` |
| `F01-G04-M02` | Consent Ledger | `BASELINE_NAMED` | `L4 / POLICY` |
| `F01-G05-M01` | Mode State | `BASELINE_NAMED` | `L4 / POLICY` |
| `F01-G05-M02` | Mode Transitions | `BASELINE_NAMED` | `L4 / POLICY` |
| `F01-G06-M01` | Lifecycle Controls | `BASELINE_NAMED` | `ADD + L4` |
| `F01-G06-M02` | Entitlements & Billing | `BASELINE_NAMED` | `ADD + L4` |
| `F01-G06-M03` | Subscription Billing Lifecycle | `PROPOSED_ADD` | `ADD + L4` |
| `F02-G01-M01` | Intake & Updates | `BASELINE_NAMED` | `L4 / UX` |
| `F02-G01-M02` | Incremental Questions | `BASELINE_NAMED` | `L4 / UX` |
| `F02-G02-M01` | Preference Registry | `BASELINE_NAMED` | `L4 / DATA` |
| `F02-G02-M02` | Preference Revision | `BASELINE_NAMED` | `L4 / DATA` |
| `F02-G03-M01` | Evidence-linked Observations | `BASELINE_NAMED` | `L4 / SAFETY` |
| `F02-G03-M02` | Non-labeling Review | `BASELINE_NAMED` | `L4 / SAFETY` |
| `F02-G04-M01` | Environment Context | `BASELINE_NAMED` | `L4 / DATA` |
| `F02-G04-M02` | Context Permissions | `BASELINE_NAMED` | `L4 / DATA` |
| `F02-G05-M01` | Versioned Profile | `BASELINE_NAMED` | `L4 / POLICY` |
| `F02-G05-M02` | Child Feedback | `BASELINE_NAMED` | `L4 / POLICY` |
| `F02-G06-M01` | Provenance | `BASELINE_NAMED` | `L4 / DATA` |
| `F02-G06-M02` | Correction & Confidence | `BASELINE_NAMED` | `L4 / DATA` |
| `F03-G01-M01` | Framework Registry | `BASELINE_NAMED` | `L4 / RESEARCH` |
| `F03-G01-M02` | Evidence Alignment | `BASELINE_NAMED` | `L4 / RESEARCH` |
| `F03-G02-M01` | Dimension Taxonomy | `BASELINE_NAMED` | `L4 / RULE` |
| `F03-G02-M02` | Domain Mapping | `BASELINE_NAMED` | `L4 / RULE` |
| `F03-G03-M01` | Stage Catalog | `BASELINE_NAMED` | `L4 / UX` |
| `F03-G03-M02` | Accessibility Adaptation | `BASELINE_NAMED` | `L4 / UX` |
| `F03-G04-M01` | Goal Discovery | `BASELINE_NAMED` | `ADD + L4` |
| `F03-G04-M02` | Goal Constraints | `BASELINE_NAMED` | `ADD + L4` |
| `F03-G04-M03` | Development Roadmap & Milestones | `PROPOSED_ADD` | `ADD + L4` |
| `F03-G05-M01` | Grounded Recommendation | `BASELINE_NAMED` | `ADD + L4` |
| `F03-G05-M02` | Recommendation Review | `BASELINE_NAMED` | `ADD + L4` |
| `F03-G05-M03` | Career Exploration Guidance | `PROPOSED_ADD` | `ADD + L4` |
| `F03-G06-M01` | Goal Reassessment | `BASELINE_NAMED` | `L4 / POLICY` |
| `F03-G06-M02` | Goal Change Proposal | `BASELINE_NAMED` | `L4 / POLICY` |
| `F04-G01-M01` | Plan Structure | `BASELINE_NAMED` | `L4 / DATA` |
| `F04-G01-M02` | Plan Templates | `BASELINE_NAMED` | `L4 / DATA` |
| `F04-G02-M01` | Schedule Construction | `BASELINE_NAMED` | `ADD + L4` |
| `F04-G02-M02` | Schedule Conflict | `BASELINE_NAMED` | `ADD + L4` |
| `F04-G02-M03` | Balanced Planning Validation | `PROPOSED_ADD` | `ADD + L4` |
| `F04-G03-M01` | Task Ownership | `BASELINE_NAMED` | `L4 / POLICY` |
| `F04-G03-M02` | Approval Routing | `BASELINE_NAMED` | `L4 / POLICY` |
| `F04-G04-M01` | Daily Task View | `BASELINE_NAMED` | `L4 / UX` |
| `F04-G04-M02` | Execution Support | `BASELINE_NAMED` | `L4 / UX` |
| `F04-G05-M01` | Lightweight Check-off | `BASELINE_NAMED` | `L4 / DATA` |
| `F04-G05-M02` | Evidence Submission | `BASELINE_NAMED` | `L4 / DATA` |
| `F04-G06-M01` | Change Requests | `BASELINE_NAMED` | `L4 / RULE` |
| `F04-G06-M02` | Change History | `BASELINE_NAMED` | `L4 / RULE` |
| `F04-G07-M01` | Schedule Notifications | `BASELINE_NAMED` | `L4 / OPS` |
| `F04-G07-M02` | Notification Preferences | `BASELINE_NAMED` | `L4 / OPS` |
| `F05-G01-M01` | Child Conversation | `BASELINE_NAMED` | `L4 / SAFETY` |
| `F05-G01-M02` | Companion Guardrails | `BASELINE_NAMED` | `L4 / SAFETY` |
| `F05-G02-M01` | Opt-in Check-in | `BASELINE_NAMED` | `L4 / SAFETY` |
| `F05-G02-M02` | Check-in Controls | `BASELINE_NAMED` | `L4 / SAFETY` |
| `F05-G03-M01` | Reflection Prompts | `BASELINE_NAMED` | `L4 / DATA` |
| `F05-G03-M02` | Reflection Review | `BASELINE_NAMED` | `L4 / DATA` |
| `F05-G04-M01` | Private Entries | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F05-G04-M02` | Journal Retrieval | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F05-G05-M01` | Structured Insight | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F05-G05-M02` | Insight Correction | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F05-G06-M01` | Selective Sharing | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F05-G06-M02` | Deletion Graph | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F06-G01-M01` | Activity Event Log | `BASELINE_NAMED` | `L4 / DATA` |
| `F06-G01-M02` | Source Metadata | `BASELINE_NAMED` | `L4 / DATA` |
| `F06-G02-M01` | Progress Rules | `BASELINE_NAMED` | `L4 / RULE` |
| `F06-G02-M02` | Progress Exceptions | `BASELINE_NAMED` | `L4 / RULE` |
| `F06-G03-M01` | Indicator Registry | `BASELINE_NAMED` | `L4 / BOUNDARY` |
| `F06-G03-M02` | Indicator Evidence | `BASELINE_NAMED` | `L4 / BOUNDARY` |
| `F06-G04-M01` | Deterministic Trends | `BASELINE_NAMED` | `L4 / EVIDENCE` |
| `F06-G04-M02` | Cautious Insights | `BASELINE_NAMED` | `L4 / EVIDENCE` |
| `F06-G05-M01` | Audience Views | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F06-G05-M02` | Summary Rendering | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F06-G06-M01` | Review Sessions | `BASELINE_NAMED` | `L4 / POLICY` |
| `F06-G06-M02` | Feedback Handoff | `BASELINE_NAMED` | `L4 / POLICY` |
| `F06-G07-M01` | Academic Assessment | `PROPOSED_ADD` | `ADD + UC` |
| `F07-G01-M01` | Content CMS | `BASELINE_NAMED` | `L4 / DATA` |
| `F07-G01-M02` | Structured Retrieval | `BASELINE_NAMED` | `L4 / DATA` |
| `F07-G02-M01` | Editorial Workflow | `BASELINE_NAMED` | `L4 / RESEARCH` |
| `F07-G02-M02` | Evidence Provenance | `BASELINE_NAMED` | `L4 / RESEARCH` |
| `F07-G03-M01` | Single Interface Router | `BASELINE_NAMED` | `ADD + POLICY` |
| `F07-G03-M02` | Execution Budget | `BASELINE_NAMED` | `ADD + POLICY` |
| `F07-G03-M03` | Multimodal Interaction Orchestration | `PROPOSED_ADD` | `ADD + POLICY` |
| `F07-G04-M01` | Policy Evaluation | `BASELINE_NAMED` | `L4 / EVAL` |
| `F07-G04-M02` | Model Evaluation | `BASELINE_NAMED` | `L4 / EVAL` |
| `F07-G05-M01` | Safety Triage | `BASELINE_NAMED` | `L4 / SAFETY` |
| `F07-G05-M02` | Human Response Workflow | `BASELINE_NAMED` | `L4 / SAFETY` |
| `F07-G06-M01` | Purpose-bound Access | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F07-G06-M02` | Retention & Export | `BASELINE_NAMED` | `L4 / PRIVACY` |
| `F07-G07-M01` | Operational Console | `BASELINE_NAMED` | `L4 / OPS` |
| `F07-G07-M02` | Billing & Cost Operations | `BASELINE_NAMED` | `L4 / OPS` |
| `F08-G01-M01` | School Data Connectors | `BASELINE_NAMED` | `L4 / DATA` |
| `F08-G01-M02` | School Data Review | `BASELINE_NAMED` | `L4 / DATA` |
| `F08-G02-M01` | Expert Discovery | `BASELINE_NAMED` | `L4 / POLICY` |
| `F08-G02-M02` | Expert Referral | `BASELINE_NAMED` | `L4 / POLICY` |
| `F08-G03-M01` | Activity Directory | `BASELINE_NAMED` | `L4 / RESEARCH` |
| `F08-G03-M02` | Resource Matching | `BASELINE_NAMED` | `L4 / RESEARCH` |
| `F08-G04-M01` | Device Consents | `BASELINE_NAMED` | `L4 / DATA` |
| `F08-G04-M02` | External Data Import | `BASELINE_NAMED` | `L4 / DATA` |
| `F08-G05-M01` | Commerce Catalog | `BASELINE_NAMED` | `L4 / COMMERCE` |
| `F08-G05-M02` | Transaction & Conflict Controls | `BASELINE_NAMED` | `L4 / COMMERCE` |
| `F08-G06-M01` | Education Budget Planning | `PROPOSED_ADD` | `ADD + UC` |
| `F08-G06-M02` | Expense & Approval Management | `PROPOSED_ADD` | `ADD + UC` |

## 8. Trình tự thực hiện sau vòng audit này
1. **Review issue register**: xác nhận thứ tự và phân loại AUD-01..17; đóng/hoãn issue không phù hợp. Không đổi canonical ngay.
2. **L3 ownership/contract closure**: kiểm 8 ADD, ranh giới cross-domain và dependency; xác nhận không cần ADD thêm ở cấp L3.
3. **L4 Capability Matrix**: phân rã ưu tiên theo H trước (Identity/Consent, Journal/Safety, Assessment, AI Routing, Balance, Billing), sau đó M/N; mỗi L4 có actor, observable outcome, alternate flow, data owner, age variants, permission, E0–E3, research, status.
4. **UC coverage expansion**: cập nhật **bản đề xuất** 3.4 cho `F06-G07`, `F08-G06`, safety/billing; liên kết với 46 scenario rows; không thay file 3.4 chính thức nếu chưa được duyệt.
5. **Decision Gate**: chỉ khi người dùng duyệt mới áp dụng Proposed Canonical Diff vào 3.2, cập nhật change log, MR delta và tạo PR GitHub riêng để merge.

## 9. Câu hỏi cần chốt trước khi sang L4
| Câu hỏi | Phương án đề xuất | Phương án khác / hệ quả |
|---|---|---|
| **Q1.** Có chấp nhận 106 L3 là **candidate structural baseline**, chưa tuyên bố exhaustive? | **A:** Có, giữ 8 ADD hiện tại, L4 audit tiếp | B: Tiếp tục nghiên cứu L3 trước khi L4 |
| **Q2.** Xử lý hai Group mới chưa có UC trong 3.4? | **A:** Viết UC proposal riêng, không sửa canonical 3.4 | B: Hoãn UC đến vòng 3.4 kế tiếp |
| **Q3.** Thứ tự L4? | **A:** Policy/safety/ownership critical trước, rồi theo vòng lặp người dùng | B: Theo Domain F01→F08 |
| **Q4.** Cách xử lý 17 issue? | **A:** Review theo từng issue, có `ACCEPT / REVISE / DEFER`, giữ UNKNOWN | B: Chỉ xử lý blocker/high trước |
| **Q5.** Lưu GitHub? | **A:** Sau khi bạn duyệt bản audit, tạo PR review-only, không sửa Blueprint gốc | B: Tạo PR review-only ngay, vẫn không merge |

## 10. Source-of-truth & thay đổi đã thực hiện
- Đã **đọc/đối chiếu**: `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md`, `Product_Blueprint_03_4_Feature_Interaction_and_Use_Case_Mapping.md`, `Feature_3_2_Proposed_Canonical_Diff_REVIEW.md`, `Feature_3_2_Scenario_Trace_Matrix_REVIEW.md`, `Feature_3_2_Consolidation_Decision_Log_APPROVED.md`, Package A–E Decision Logs và Master Research Backlog.
- Đã **tạo**: chính tài liệu review này. **Không** sửa 3.2/3.3/3.4, Decision Logs, Scenario Logs, Research Backlog hoặc repository GitHub.
- `AUD-##` là issue ID mới **trong tài liệu audit**, không phải UC/CP/MR-ID chính thức. Không suy diễn mọi issue cần một module mới.

**KẾT LUẬN:** 106 L3 là một **khung cấu trúc hợp lý để tiếp tục phân rã**, nhưng chưa đủ bằng chứng về end-to-end coverage, L4 acceptance, quyền/retention/safety và dữ liệu nghiên cứu. **Review required — not canonical.**