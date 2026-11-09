# FEATURE INVENTORY 3.2 — PROPOSED CANONICAL DIFF (REVIEW ONLY)
**Phiên bản:** 1.0 · **Ngày:** 2026-11-09  
**Trạng thái:** `PROPOSED_DIFF / NOT_APPLIED_TO_CANONICAL`  
**Baseline:** `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md` (APPROVED 2026-11-07, **8 Domain / 49 Group / 98 illustrative L3**, 98 illustrative L4).  
**Nguồn:** Package A–E Decision Logs + `CON-D01..04` (Consolidation).

> Tài liệu này là **semantic diff theo mục và ID**, không phải patch đã chạy hay toàn văn 3.2 thay thế. Tên/ID đề xuất chưa phải canonical. Không thay đổi bản gốc, 3.3, 3.4 hoặc Research Backlog.

## 1. Đầu ra đích nếu áp dụng sau phê duyệt
- 8 Domain (không đổi).
- 51 Group = 49 + `F06-G07 Academic Learning Assessment` + `F08-G06 Education Finance`.
- 106 L3 = 98 + 8. Không tạo module `F06-G03-M03`; đó là proposed ID đã được `CON-D01` thay thế bởi `F06-G07-M01`.
- L4 count **CHƯA CHỐT**: baseline 98 L4 minh họa; có thể tạo một **L4 minh họa cho mỗi L3 mới** để giữ phong cách bảng, nhưng không được coi là đặc tả L4 đầy đủ hoặc yêu cầu nghiệm thu.

## 2. ADD L2 Group
| Proposed L2 | Domain | Definition draft | New L3 | Rationale |
|---|---|---|---|---|
| `F06-G07` Academic Learning Assessment | F06 Tracking & Insights | Sở hữu kết quả đánh giá học tập, rubric, workflow chấm, độ tin cậy/kiểm tra lại; không quản task hay taxonomy chỉ báo | `F06-G07-M01` | `CON-D01`; tránh ghép assessment vào `F06-G03 Development Indicators` |
| `F08-G06` Education Finance | F08 Extended Ecosystem | Budget và thực chi giáo dục, không là payment gateway/Wallet | `F08-G06-M01/M02` | Package D CP-12 |

**Age Matrix update:** Bổ sung đúng hai hàng `F06-G07` và `F08-G06` vào ma trận 6 cohort. Trạng thái cấp Group phải làm rõ Parent-led/Shared/Child-led/Adult, không sao chép máy móc ma trận từ Group khác. Gợi ý: A0/A1 parent-led; A2–A4 tham gia tùy capability và quyền; A5 user adult. Các ký hiệu cụ thể vẫn `PROPOSED`, cần review module-level.

## 3. ADD L3 — 8 module đề xuất
| Package | CP | L3 ID | Name | Parent group | Responsibility (draft) | Dependencies | Scenario |
|---|---|---|---|---|---|---|---|
| A | CP-01 | `F03-G04-M03` | Development Roadmap & Milestones | `F03-G04` | Mục tiêu→giai đoạn→mốc; quyền phê duyệt; phiên bản; execution nằm F04 | F03-G04-M01/M02; F04-G01-M01 | SC-001/003 |
| A | CP-02 | `F04-G02-M03` | Balanced Planning Validation | `F04-G02` | Family Standard Bar versioned, caps, protected leisure, activity load, seasonal/weather validation | F02-G04-M01; F04-G02-M01; F04-G06; F07-G02 | SC-001 |
| B | CP-06 / CON-D01 | `F06-G07-M01` | Academic Assessment | `F06-G07 NEW` | Rubric, chấm bài, độ tin cậy, review và correction; không trộn task completion | F04-G05; F06-G03; F06-G04/G05; F07-G04 | SC-002 |
| C | CP-08 | `F03-G05-M03` | Career Exploration Guidance | `F03-G05` | Career discovery, nghề–ngành–kỹ năng N:N, hướng dẫn dựa bằng chứng, không verdict | F07-G01/G02; F02-G02; F04-G01 | SC-003 |
| D | CP-11 | `F01-G06-M03` | Subscription Billing Lifecycle | `F01-G06` | Vòng đời subscription; payment verified state→entitlement, refund, restore, idempotency | F01-G06-M02; F07-G07-M02; external payment | Cross-domain |
| D | CP-12 | `F08-G06-M01` | Education Budget Planning | `F08-G06 NEW` | Budget per child/goals/time period, forecasts, limits; không payment/wallet | F03 goals; F04 plans; F01 permissions | Cross-domain |
| D | CP-12 | `F08-G06-M02` | Expense & Approval Management | `F08-G06 NEW` | Expense entry, recurring, approval, discrepancy/report, non-payment ledger | F08-G06-M01; F01 permissions; F08-G05 | Cross-domain |
| E | CP-14 | `F07-G03-M03` | Multimodal Interaction Orchestration | `F07-G03` | STT/TTS/realtime/image adapters, audio/transient policy; không duplicate E0–E3 router | F07-G03-M01/M02; F07-G04; F05-G01/G04 | Cross-domain |

## 4. EXTEND/REUSE/DEFER modules có sẵn (không nhân bản)
| Source | CP/Decision | Existing / proposed modules | Nội dung mở rộng hoặc reuse |
|---|---|---|---|
| A | CP-01 | `F04-G01-M01` | Plan liên kết roadmap & milestone; F03 owns goal |
| A | CP-02 | `F02-G04-M01; F03-G02-M01; F04-G01-M01; F04-G02-M01/M02; F04-G06-M02` | Environment context, multi-dimensional taxonomy, approved bar constraint, seasonal/weather planning, validation |
| A | CP-03 | `F04-G06-M01/M02; F04-G07-M01` | Ngoại lệ cân bằng có hạn, duyệt, expire/restore |
| A | CP-04 | `F02-G06-M01/M02; F06-G04-M01/M02; F06-G06-M02; F04-G06-M01` | Evidence vs hypothesis, causes, feedback and approved adaptation |
| A | CP-05 | `F07-G01-M01/M02; F07-G02-M01/M02; F03-G05-M01` | Admissions sources + human-reviewed dataset, not source-free claims |
| B | CP-06 | `F04-G05-M02; F06-G03-M02; F06-G04-M01/M02; F06-G05-M01/M02` | Submission/assessment/analytics/report separate; provenance |
| B | CP-07 | `F05-G04-M01/M02; F05-G05-M01/M02; F05-G06-M01/M02; F07-G06-M01` | Private Journal, insights, selective disclosure, deletion graphs |
| B | CP-16 | `F06-G01-M02; F08-G01-M01/M02; F04-G05-M02` | Manual school/tutoring sources and future connectors |
| B | CP-17 | `F07-G05-M01/M02; F05-G01-M02` | Risk triage, caregiver recipient check, child-facing support |
| C | CP-08 | `F03-G05-M01; F07-G01-M02` | Grounded career guidance and approved retrieval |
| C | CP-09 | `F03-G04-M03; F04-G01-M01; F04-G05-M02; F06-G06-M01/M02` | Reuse goals/plan/task/review for exploration vs performance |
| C | CP-10 | `F07-G01-M01/M02; F07-G02-M01/M02` | Knowledge provenance, freshness, correction, approval |
| C | CP-19 | `F01-G04-M01; F04-G05-M02; F07-G04-M01; F07-G05-M01/M02; F07-G06-M01` | Private create/controlled share/conditional publish and platform rules |
| D | CP-11 | `F01-G06-M02; F07-G07-M02` | Entitlement family/child; billing and usage operations separated |
| D | CP-13 | `—` | DEFER wallet, no module creation |
| D | CP-15/21 | `F01-G02-M01/M02; F01-G04-M01/M02; F01-G06-M01; F07-G06-M01/M02` | Multi-guardian, adult transition, rights, lifecycle/retention |
| D | CP-23 | `F08-G02-M01/M02; F08-G05-M01/M02` | Partner/referral, sponsored separation, transaction controls |
| E | CP-14 | `F05-G01-M01/M02; F05-G04-M01; F07-G04-M01/M02` | Voice interaction/safety, no default recording for private Journal |
| E | CP-18 | `F07-G07-M01/M02; F07-G06-M01` | Support/incident/refund access, no support access to Journal by default |
| E | CP-20 | `F01-G06-M02; F07-G03-M02; F07-G07-M02; F07-G04-M02` | Hybrid family quota + cost attribution, test quality |
| E | CP-22 | `F03-G03-M02; F04-G04-M02; F05-G01-M01; F07-G04-M01` | Accessible UI/interaction, A0–A5 variants |
| E | CP-24 | `F04-G07-M01/M02; F07-G07-M01` | Notification delivery preferences, scoped recipient/policy |
| Consolidation | CON-D02/03 | `F07-G03-M01/M02; F07-G01/G02; F07-G04-M01/M02` | E0–E3 routing policy; 4 cache classes, authorization and invalidation |

## 5. Proposed L4 examples — placeholders, chưa phê duyệt
Các L4 dưới đây chỉ để chỉ rõ **vị trí sẽ phải bổ sung**, không tạo ra yêu cầu chức năng đầy đủ khi chưa hoàn tất data/permission/cost rubric.

| Candidate L3 | Illustrative L4 candidate | Demo action | Validation gap |
|---|---|---|---|
| `F03-G04-M03` | `F03-G04-M03-001` | Tạo milestone có nguồn và quyền duyệt | Goal-version, permission, age |
| `F04-G02-M03` | `F04-G02-M03-001` | Kiểm tra lịch với Standard Bar và weather context | Hard/soft evidence, load, climate |
| `F06-G07-M01` | `F06-G07-M01-001` | Đánh giá bài đã nộp theo rubric và độ tin cậy | Pilot benchmark, appeals |
| `F03-G05-M03` | `F03-G05-M03-001` | Gợi ý hoạt động khám phá nghề có căn cứ | Taxonomy, market sources |
| `F01-G06-M03` | `F01-G06-M03-001` | Ghi nhận lifecycle của giao dịch subscription | Payment confirmation, refund |
| `F08-G06-M01` | `F08-G06-M01-001` | Lập ngân sách theo trẻ và mục tiêu | Forecasts, family permissions |
| `F08-G06-M02` | `F08-G06-M02-001` | Lưu chi phí và yêu cầu duyệt, không tự thanh toán | Ledger semantics |
| `F07-G03-M03` | `F07-G03-M03-001` | Chọn STT/TTS/realtime theo modality và consent | Voice retention, fallback |

**Không thực hiện:** tự động đánh dấu các dòng này `APPROVED`, phát sinh đủ metadata L4 hay coi là 8 tiêu chí nghiệm thu đã test.

## 6. Proposed amendments to existing 3.2 sections
1. **Header/Status:** giữ lại ngày chốt baseline 2026-11-07; khi được duyệt áp dụng, thêm revision history mới và `change_source=CON-D01..04 / CP-01..24` thay vì xóa dấu vết baseline.
2. **Section 1 Q1–Q6:** Q4 “49 groups baseline” cần annotation version: approved revision có 51 groups qua controlled additions, không tuyên bố Q4 trước đây sai.
3. **Section 2 hierarchy/IDs:** giữ quy tắc ID immutability; `F06-G03-M03` là proposed-only superseded ID, không phải module lịch sử đã triển khai.
4. **Section 3 Age Matrix:** tăng 49→51 hàng, yêu cầu 6 cohort cho 2 group mới; annotate `MVP` chưa chốt.
5. **Section 4 Inventory:** ADD 2 groups/8 L3 tại đúng F01/F03/F04/F06/F07/F08; giữ nguyên 98 L3 gốc và không đụng module khác ngoại trừ định nghĩa cần `EXTEND`.
6. **Section 5 Data Ownership:** thêm ranh giới Assessment (F06), Learning Sources (F08), Education Finance (F08), Parent AI billing vs privacy, Response Router/Modality (F07), source/cache (F07).
7. **Execution Policy:** gắn reference đến `Feature_3_2_AI_Routing_Policy_SPEC_DRAFT.md`; nguyên tắc 4 cache class và routing owner đã chốt, còn cấu hình cụ thể chưa phê duyệt.
8. **Research:** chỉ thêm `RESEARCH_DELTA_PROPOSED`, chưa tự ghi vào Master Research Backlog.
9. **Change Log/Trace:** liên kết `SC-001/002/003`, package logs và Consolidation Decisions; không rewrite log SC-001/002.

## 7. Cross-domain contracts — cần giữ
| Contract | Source-of-truth | Consumers / constraint |
|---|---|---|
| Family/identity/consent | F01 | F02–F08 require purpose-specific authorization |
| Goal/roadmap/standard bar | F03 goal, F04 approved bar | F04 planning; no auto goal/bar override |
| Homework submission | F04 | F06 academic assessment, report; no auto “completed = correct” |
| Academic result | F06-G07 | F06-G03 indicators, F06-G04 trend; assessment provenance retained |
| Private Journal | F05 | Only authorized feedback; safety exception through F07 |
| Knowledge provenance/approval | F07-G01/G02 | F03 guidance; cached not automatically approved |
| Subscription entitlements | F01-G06-M02 | F07 usage; payer never inherits data rights |
| Subscription payment lifecycle | F01-G06-M03 | Trusted verified payment state; F08 finance separately |
| Education budget/spending | F08-G06 | No implicit payment, Wallet or subscription charge |
| AI execution routing/modality | F07-G03-M01/M03 | Safety + authorization before external processing |
| AI cost | F07-G07-M02 | actor/beneficiary/scope usage; no double subscription |
| Safety response | F07-G05 | guardian recipient suitability, minimal disclosure |

## 8. Known unresolved matters — BLOCKERS TO FULL APPROVAL
- 106 L3 reflects a controlled proposal; **baseline incompleteness** remains. Need use-case coverage validation beyond 3 scenarios and 98 illustrative L4.
- Academic Group scope/taxonomy benchmark, safety/health rules, data retention/provider policies, payment compliance.
- `CACHED ≠ VERIFIED ≠ APPROVED`; TTL/invalidation implementation, policy routing acceptance and 6-cohort variants remain `UNKNOWN`.
- Pricing tier/slot rates, provider settlement and actual AI cost require tests/research; Wallet deferred.
- L4 metadata, future UC IDs, MR IDs must be reconciled, not invented as validated.

## 9. Review gates BEFORE canonical edit
- [ ] Verify 8 ADD IDs unique, 2 new Groups unique, zero unintended deletions.
- [ ] Confirm all 24 CPs have disposition and SC-001/002/003 coverage checks.
- [ ] Validate age/cohort/purpose/privacy rules for new L3.
- [ ] Resolve canonical L4 placeholders and research deltas sufficiently for a controlled revision.
- [ ] **Explicit user approval to apply this diff to the official 3.2 file.**

**CURRENT STATE: REVIEW ONLY — NOT APPLIED.**