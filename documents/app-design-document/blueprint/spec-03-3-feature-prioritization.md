# PRODUCT BLUEPRINT — PART 03: FEATURE PLANNING
## 3.3 — Feature Prioritization & Dependency Mapping

| Thuộc tính | Giá trị |
|---|---|
| **Trạng thái** | **APPROVED — 3.3 / Q1–Q6** (chốt phương pháp, không chốt bảng ưu tiên hay MVP) |
| Ngày chốt | 2026-11-07 |
| Nguồn gốc | 3.1 — 8 Feature Domains; 3.2 — 49 Groups, 98 L3 modules baseline và 98 L4 examples |
| Độ tuổi | A0: 0–2; A1: 3–5; A2: 6–10; A3: 11–14; A4: 15–17; A5: 18–23 |
| Quyết định MVP | **NOT_DECIDED** |
| Research SSOT | `Product_Blueprint_Master_Research_Backlog_v1_2.md` — chỉ dùng `MR-###` |
| Bước tiếp theo | **Chưa triển khai 3.4**; đợi người dùng yêu cầu |

> **Phạm vi được chốt:** mô hình đánh giá giá trị và phụ thuộc + yếu tố kinh tế/rủi ro; đánh giá L3 trước và L4 chỉ kế thừa như mặc định, được override với lý do rõ. Chưa gán điểm định lượng hoặc thứ tự ưu tiên có vẻ khách quan cho các module khi thiếu bằng chứng. Đây là tài liệu phương pháp và register chờ đánh giá; không phải bản kết quả khảo sát.

## 1. Quyết định Q1–Q6 và phản biện

| Q | Đã chốt | Rủi ro khi áp dụng máy móc | Biện pháp/kiểm soát |
|---|---|---|---|
| Q1 | **A**: Đánh giá Value + Dependency + Cost/Risk, không chọn MVP | Nhầm mức đáng đầu tư với kế hoạch phát hành | Ghi riêng `assessment`, `sequencing` và `mvp_decision=NOT_DECIDED` |
| Q2 | **A**: L3 đánh giá trước; L4 kế thừa có thể override | Trung bình module che lấp feature L4 rủi ro cao | L4 phải tách đánh giá khi khác người dùng, quyền, dữ liệu, safety, cohort, model cost hoặc dependency |
| Q3 | **A**: Hard Gates → Value → Delivery Economics | Thang điểm tổng hợp có thể che lấp blocker an toàn | Gate không được bù bằng điểm Value; không tổng hợp thành một số khi chưa có calibration |
| Q4 | **A**: Giá trị riêng cho 6 cohort 0–23 | Giả định cùng hành vi ở mọi tuổi, hoặc nhân sáu lần feature | Sáu hàng đánh giá riêng / module; `NOT_APPLICABLE` có giải thích; tập trung đánh giá phương thức người chăm sóc ở A0–A1 |
| Q5 | **A**: Functional, Data, Permission, Safety; Operational khi cần | Vẽ sơ đồ thứ tự triển khai theo giả định, tạo vòng phụ thuộc giả | Phân biệt `required` / `candidate`, `hard` / `soft`, thời điểm cần, owner, bằng chứng, workaround |
| Q6 | **A**: Đánh giá sơ bộ có confidence; thiếu căn cứ = UNKNOWN | Điểm giả gây ảo giác chính xác | Mỗi tiêu chí cần evidence, người đánh giá, thời điểm; UNKNOWN không bị quy thành 0 |

**Phản biện bổ sung:** Các nhãn `ROLE-V`, `ROLE-F`, `ROLE-S`, `ROLE-E` là **vai trò** chứ không phải thứ hạng (không dùng P1–P4 vì trùng ưu tiên research). Một module có thể có nhiều vai trò, ví dụ VALUE + SAFETY. Giữ một `primary_role` cùng danh sách `secondary_roles` khi cần. Safety/Compliance là điều kiện triển khai, không đồng nghĩa mọi tính năng F07 đều được xây trước tất cả tính năng khác. Việc triển khai phải theo đúng phạm vi năng lực được kích hoạt.

## 2. Câu hỏi đánh giá: cái gì, cho ai, để quyết định gì?

- **Đối tượng:** 98 module L3 baseline được định danh ở 3.2; L4 kế thừa đánh giá L3 *chỉ nếu* không có khác biệt đáng kể. Feature Group L2 và Domain L1 được tổng hợp để thấy coverage, không tính điểm bằng trung bình cơ học.
- **Đối tượng hưởng lợi:** phụ huynh/người chăm sóc (`parent_value`), trẻ/người dùng trẻ (`child_value`), người dùng 18–23 tự chủ (`adult_user_value` khi áp dụng), và giá trị sản phẩm (`core_loop`, `adoption`, `differentiation`). Với A0–A1, phản ánh giá trị **cho trẻ** thông qua kết quả/tác động được người chăm sóc hỗ trợ; không giả định trẻ tương tác trực tiếp.
- **Người đánh giá:** chủ sản phẩm, research, chuyên gia phát triển trẻ và kỹ thuật/cost theo từng vấn đề; **chưa chỉ định owner cụ thể**. AI có thể soạn bảng nhưng không tự xác nhận bằng chứng.
- **Đầu ra sử dụng về sau:** (a) danh sách giả thuyết ưu tiên nghiên cứu, (b) quan hệ phụ thuộc/điều kiện an toàn, (c) so sánh giá trị-chi phí để chuẩn bị lựa chọn MVP/roadmap. **Không thực hiện quyết định MVP tại 3.3.**

## 3. Layer 1 — Hard Gates (không quy thành điểm cộng)

| Gate | Cần kiểm tra | Kết quả hợp lệ | Tham chiếu |
|---|---|---|---|
| G-Legal | Tuổi, đồng ý, luật dữ liệu, quyền chủ thể | PASS / CONDITIONAL / BLOCKED / UNKNOWN | MR-016, MR-017 |
| G-Privacy | Mục đích, nguồn, quyền chia sẻ, vòng đời và xóa liên đới | PASS / CONDITIONAL / BLOCKED / UNKNOWN | MR-018, MR-019, MR-021 |
| G-Safety | Rủi ro tâm lý, hỗ trợ trẻ, phân luồng/escalation, không để AI thay quyết định người có quyền | PASS / CONDITIONAL / BLOCKED / UNKNOWN | MR-022, MR-023, MR-024, MR-035 |
| G-Feasibility | Dữ liệu/nguồn phụ thuộc thật sự sẵn có, khả thi ở phạm vi thử nghiệm | PASS / CONDITIONAL / BLOCKED / UNKNOWN | MR-025, MR-033, MR-040 |

- `PASS`: đã có bằng chứng và người có thẩm quyền nội bộ xác nhận phạm vi cụ thể. Không đồng nghĩa được phép phát hành ở mọi thị trường/giai đoạn.
- `CONDITIONAL`: có điều kiện phải hoàn thành, xác định rõ **điều kiện**, người chịu trách nhiệm và thời điểm. Không vượt gate khi điều kiện release chưa hoàn thành.
- `BLOCKED`: xác định có rào cản chưa giải quyết; không thử nghiệm/triển khai phần rủi ro tương ứng với người thật.
- `UNKNOWN`: chưa đủ bằng chứng; không coi là PASS và không tự đánh giá là BLOCKED.
- Gate phải được xét theo **module + cohort + dữ liệu/ngữ cảnh sử dụng**, không blanket cho tất cả feature trong domain. Các hard gate cần được rà soát lại khi thay phạm vi chức năng, dữ liệu hoặc luật áp dụng.

## 4. Layer 2 — Value Assessment

### 4.1. Các tiêu chí

| Thuộc tính | Câu hỏi | Thang dự kiến | Ghi chú |
|---|---|---|---|
| `parent_value` | Có giảm công, tăng hiểu biết hoặc cải thiện quyết định của phụ huynh không? | 1–5 / UNKNOWN / N/A | Đánh giá người chăm sóc ở A0–A1 |
| `child_value` | Trẻ nhận giá trị phù hợp năng lực và quyền chủ động không? | 1–5 / UNKNOWN / N/A | Đánh giá tác động, không chỉ mức sử dụng |
| `adult_user_value` | Người dùng A5 tự chủ nhận được giá trị gì? | 1–5 / UNKNOWN / N/A | Có thể thay cho parent_value ở A5 tùy capability |
| `core_loop_contribution` | Đóng góp bước nào vào Hiểu→Định hướng→Kế hoạch→Thực thi→Phản hồi→Đánh giá? | 1–5 / UNKNOWN | Không đồng nghĩa buộc có trong MVP |
| `adoption_potential` | Nhóm người dùng sẽ thực sự quay lại và dùng đúng cách? | 1–5 / UNKNOWN | Phụ thuộc research thực tế |
| `differentiation` | Có ưu thế so với giải pháp thay thế? | 1–5 / UNKNOWN | Benchmark thị trường cần cập nhật |
| `dependency_enablement` | Mở khóa năng lực có giá trị nào khác? | 1–5 / UNKNOWN | Dựa dependency graph, không suy số lượng |

**Anchors sơ bộ của thang 1–5 (chưa hiệu chuẩn, MR-039):** 1 = rất hạn chế, 2 = thấp, 3 = vừa, 4 = cao, 5 = rất cao, theo *từng tiêu chí* và nhóm tuổi. Không tự chuyển `UNKNOWN` thành 1 hoặc 0. Không áp dụng cộng điểm thô hay trọng số mặc định. Hai góc nhìn parent/child phải hiển thị riêng; không tự bù trừ nhau. Với những module về backend, giá trị có thể gián tiếp qua enabling/permission/safety, không ép đánh giá tương đương một feature UX.

### 4.2. Evidence Confidence

Confidence đánh giá **độ mạnh của bằng chứng**, không phải độ chắc chắn của trẻ hay dự đoán LLM.

| Mức | Quy tắc tối thiểu |
|---|---|
| UNKNOWN | Chưa có dữ liệu hoặc chưa rà soát |
| HYPOTHESIS | Ý kiến thiết kế/giả thuyết, chưa xác thực |
| LOW | Bằng chứng gián tiếp/hẹp hoặc còn mâu thuẫn |
| MEDIUM | Đã có phỏng vấn, khảo sát, thử nghiệm hoặc tài liệu phù hợp nhưng còn giới hạn |
| HIGH | Nhiều nguồn, đối tượng đúng phân khúc và kết quả kiểm chứng tương đối nhất quán |

Lưu `evidence_refs`, `method`, `sample_scope`, `assessed_by`, `assessed_at`, `limitations`. Không biến `HYPOTHESIS` thành độ tin cậy định lượng. Đối với legal/safety, vẫn phải qua gate, dù confidence của User Value là HIGH.

### 4.3. Sáu cohort: đánh giá ngang mức chi tiết, không giống nhau về hành vi

| Cohort | Đối tượng đánh giá giá trị | Trọng tâm kiểm tra |
|---|---|---|
| A0 — 0–2 | Người chăm sóc + lợi ích/giới hạn đối với trẻ | Hoạt động do caregiver thực hiện, không giả định trẻ dùng AI |
| A1 — 3–5 | Người chăm sóc + lợi ích/giới hạn đối với trẻ | Đồng hành, trực quan, ngắn, kiểm chứng khả năng thích ứng |
| A2 — 6–10 | Phụ huynh + trẻ | Hỗ trợ hiểu và thao tác, giảm gánh nặng báo cáo |
| A3 — 11–14 | Phụ huynh + trẻ | Tự thực thi, phản hồi, quyền đề xuất |
| A4 — 15–17 | Phụ huynh + thanh thiếu niên | Tự định hướng, quyền riêng tư, giảm giám sát không cần thiết |
| A5 — 18–23 | Người dùng trưởng thành (+ người hỗ trợ khi được phép) | Tính tự chủ, consent, giá trị trực tiếp cho người trưởng thành |

**Quy tắc:** Mỗi module phải có 6 record cohort, mỗi record gồm `applicability` (APPLICABLE / CONDITIONAL / NOT_APPLICABLE / UNKNOWN), `interaction_pattern`, `user_value(s)`, `evidence_confidence`. `NOT_APPLICABLE` phải nêu lý do; không coi là điểm thấp. Nếu cohort chỉ cần caregiver workflow, không tạo child-facing flow giả tạo.

## 5. Layer 3 — Delivery Economics & Cost-Aware Design

| Tiêu chí | Nội dung đánh giá | Điều cần ghi chú |
|---|---|---|
| `implementation_effort` | Thiết kế, phát triển, accessibility, QA cho cả sáu cohort | 1–5 / UNKNOWN là thang tương đối, **không phải số ngày công** |
| `maintenance_effort` | Chỉnh sửa rule, nội dung, xử lý lỗi, biến thể tuổi | 1–5 / UNKNOWN |
| `operating_cost` | DB, compute, notification, hosting, storage, support | Mức/range có giả định; không đồng nhất AI cost |
| `ai_cost_risk` | Giá model, tokens, số lần gọi, fan-out, retries, heavy-users | Low/Medium/High/UNKNOWN + căn cứ |
| `latency_and_reliability` | Latency, độ ổn định, offline/fallback nếu cần | Ràng buộc UX thực tế |
| `implementation_complexity` | Phụ thuộc chéo, tích hợp bên ngoài, dữ liệu nhạy cảm | 1–5 / UNKNOWN |
| `scalability` | Tăng theo active user, frequency và workload | Dùng ước lượng kịch bản, chưa giả định tuyến tính |

**Evaluation của AI:** Mỗi module (hoặc L4 nếu khác biệt) ghi `execution_type: E0/E1/E2/E3`, phương án E0/E1 tương đương nếu có, lý do cần model, cost per successful outcome, model calls/action, usage assumptions và fallback. E3 không mặc định = multi-agent. Đánh giá năng lực không dùng AI trước; dùng MR-025–MR-029 để kiểm chứng. Safety checks bắt buộc không được bị loại bỏ để giảm chi phí.

**Không đặt ngân sách USD cố định trong 3.3:** Chưa có benchmark thực tế về traffic, tokens và chi phí vận hành. Công thức tham khảo: `monthly_inference_cost ≈ DAU × eligible_actions_per_day × avg_model_calls_per_action × avg_cost_per_call × days` (đã cần điều chỉnh cho cache, routing, token volume, retries, cohort và peak). Chỉ tính khi có dữ liệu đầu vào hợp lý (MR-027).

## 6. Dependency Mapping — loại, độ chắc chắn, phạm vi

| Type | Code | Ví dụ | Ý nghĩa |
|---|---|---|---|
| Functional | F | Báo cáo tiến độ cần activity data | Phụ thuộc hành vi/chức năng |
| Data | D | Hướng dẫn cá nhân hóa cần nguồn hồ sơ phù hợp | Phụ thuộc dữ liệu hợp lệ, không có quyền mặc định |
| Permission | P | Sửa kế hoạch phải xác định người phê duyệt | Phụ thuộc kiểm tra quyền |
| Safety | S | Child Companion cần policy, escalation phù hợp | Phụ thuộc điều kiện an toàn |
| Operational | O | Các xử lý phức tạp cần monitoring/human response | Chỉ thêm khi cần |

Mỗi cạnh dependency cần `source_module`, `target_module`, `type`, `criticality` (HARD/SOFT), `verification` (CONFIRMED/CANDIDATE/REJECTED), `required_for` (BUILD/TEST/RELEASE/RUN), `cohort_scope`, `reason`, `evidence_refs`, `workaround` (nếu có). **Không xem minh họa dependency là sơ đồ kỹ thuật đã phê duyệt.**

### 6.1. Ví dụ để hiểu phân biệt dependency

| Source (module cần) | Target (module cung cấp) | Type | Trạng thái | Ghi chú |
|---|---|---|---|---|
| `F04-G02-M02` Schedule Conflict | `F04-G02-M01` Schedule Construction | F | CANDIDATE | Cần lịch có thể kiểm tra; có thể dùng nguồn lịch ngoài, nên chưa kết luận hard |
| `F04-G02-M02` Schedule Conflict | `F01-G04-M01` Access Policy | P | CANDIDATE | Bắt buộc kiểm quyền ở luồng thực thi, kiểm policy cụ thể sau |
| `F04-G02-M02` Schedule Conflict | `F04-G06-M01` Change Requests | F | CANDIDATE | Chỉ cần khi tạo yêu cầu phê duyệt, không nhất thiết cho phát hiện xung đột thuần |
| `F05-G04-M01` Private Entries | `F07-G06-M01` Purpose-bound Access | P/S | CANDIDATE | Quyền riêng tư bắt buộc; implementation dependency cần rà soát |
| `F05-G05-M01` Structured Insight | `F05-G06-M02` Deletion Graph | D/S | CANDIDATE | Phải bảo đảm xử lý xóa dẫn xuất trước khi chạy với dữ liệu thật |
| `F03-G05-M01` Grounded Recommendation | `F07-G02-M02` Evidence Provenance | D/S | CANDIDATE | Phụ thuộc nguồn bằng chứng và phạm vi thẩm định |

### 6.2. Graph governance

- **Không tạo vòng phụ thuộc build-time** giữa các module; nếu có vòng, phân rã giao diện chung, tách dữ liệu hoặc làm rõ trách nhiệm.
- Phân biệt phụ thuộc **để kiểm thử** và phụ thuộc **để vận hành**; một mock trong thử nghiệm nội bộ không thay cho real safety gate trước thử nghiệm với trẻ thật.
- Tránh nhầm *workflow trình bày sản phẩm* với *thứ tự code*: F02→F03→F04→F06 là luồng nghiệp vụ, không mặc định build sequence duy nhất.
- Không coi số lượng dependency là điểm cao/thấp của một module; đánh giá nó có đang mở khóa năng lực quan trọng hay trở thành bottleneck.
- Dependency chỉ được nâng thành `CONFIRMED` khi đã rà soát thiết kế, quyền, dữ liệu và phương án thay thế (MR-040).

## 7. Cách xử lý L3 / L4, vai trò và trạng thái

**L3 assessment** là baseline. L4 có thể ghi `inherits_assessment_from: Fxx-Gxx-Mxx` nhưng phải **override** các mục bị ảnh hưởng nếu: (1) thêm model/AI call, (2) dùng dữ liệu nhạy cảm, (3) thay quyền/consent, (4) có safety escalation, (5) chỉ áp dụng một số cohort, (6) có effort/dependency lớn hơn bản chung. Khi override, giữ lý do và ngày cập nhật.

Trạng thái khác nhau, không gom chung:

- `definition_status`: BASELINE_PROPOSED / REVIEWED / APPROVED / DEFERRED / RETIRED (từ 3.2).
- `assessment_status`: NOT_EVALUATED / PROVISIONAL / EVIDENCE_BACKED / NEEDS_REVIEW.
- `research_status`: liên kết Master Backlog, không tạo tình trạng độc lập thay thế MR-ID.
- `delivery_status`: NOT_PLANNED / PLANNED / IN_PROGRESS / RELEASED (mặc định NOT_PLANNED).
- `mvp_decision`: NOT_DECIDED (trong 3.3).

`priority_role`: ROLE-V (giá trị), ROLE-F (nền tảng), ROLE-S (safety/compliance), ROLE-E (mở rộng). Đây là **nhóm vai trò**, không phải điểm số xếp hạng; có thể nhiều vai trò. Chỉ gán role khi có căn cứ sản phẩm. Không dùng từ ROLE-S để tự cho rằng module đã tuân thủ pháp lý.

## 8. Một assessment record L3 minh họa (CHƯA CHẤM ĐIỂM)

```yaml
module_id: F04-G02-M02
module_name: Schedule Conflict
definition_status: BASELINE_PROPOSED
assessment_status: NOT_EVALUATED
mvp_decision: NOT_DECIDED
delivery_status: NOT_PLANNED
primary_role: ROLE-V # ví dụ phân loại sơ bộ, chưa duyệt
hard_gates:
  legal: UNKNOWN
  privacy: UNKNOWN
  safety: UNKNOWN
  feasibility: UNKNOWN
cohort_assessments:
  A0: {applicability: UNKNOWN, interaction_pattern: caregiver_only, parent_value: null, child_value: null, confidence: UNKNOWN}
  A1: {applicability: UNKNOWN, interaction_pattern: caregiver_only, parent_value: null, child_value: null, confidence: UNKNOWN}
  A2: {applicability: UNKNOWN, interaction_pattern: child_supervised, parent_value: null, child_value: null, confidence: UNKNOWN}
  A3: {applicability: UNKNOWN, interaction_pattern: child_active, parent_value: null, child_value: null, confidence: UNKNOWN}
  A4: {applicability: UNKNOWN, interaction_pattern: youth_active, parent_value: null, child_value: null, confidence: UNKNOWN}
  A5: {applicability: UNKNOWN, interaction_pattern: independent_adult, adult_user_value: null, confidence: UNKNOWN}
value:
  core_loop_contribution: null
  adoption_potential: null
  differentiation: null
  dependency_enablement: null
  evidence_confidence: UNKNOWN
economics:
  implementation_effort: null
  maintenance_effort: null
  operating_cost: UNKNOWN
  ai_cost_risk: Low # kế thừa inventory 3.2; cần xác minh khi benchmark
  execution_type: E1 # kế thừa inventory, chưa khóa design triển khai
  cost_per_successful_outcome: null
  model_calls_per_action: 0 # chỉ khi triển khai E1 thuần túy
dependencies:
  - {target: F04-G02-M01, type: F, verification: CANDIDATE}
  - {target: F01-G04-M01, type: P, verification: CANDIDATE}
  - {target: F04-G06-M01, type: F, verification: CANDIDATE}
research_refs: [MR-012, MR-025, MR-035, MR-039, MR-040]
evidence_refs: []
assessed_by: null
assessed_at: null
notes: 'Chưa có dữ liệu để chấm điểm hoặc chốt thứ tự triển khai.'
```

**Lưu ý:** `null` = chưa có đánh giá; `NOT_APPLICABLE` chỉ được dùng khi đã xác nhận tính năng không phù hợp với cohort; ví dụ interaction patterns từ 3.2 không tự chứng minh adoption hoặc hiệu quả.

## 9. Kết quả và cách dùng: không chọn MVP ở 3.3

**Kết quả đã chốt ở 3.3:** rubric ba lớp, cơ chế evidence/confidence, đơn vị L3, quy tắc kế thừa L4, dependency edge schema, coverage sáu cohort, cost-aware criteria và phương án ghi kết quả chưa có bằng chứng.

**Kết quả chưa có:** xếp hạng thực tế 98 module; điểm giá trị theo cohort; ước lượng effort/cost đáng tin; dependency graph được xác minh; go/no-go cho từng feature; shortlist MVP; release roadmap. Những hạng mục này sẽ được lấp bằng nghiên cứu và đánh giá có kiểm chứng. Không biến "đã chốt phương pháp" thành "đã đánh giá xong module".

**Phương án vận hành sau nghiên cứu:** gate review → đánh giá giá trị theo cohort → đối chiếu cost/effort → phân nhóm đáng đầu tư/đáng nghiên cứu thêm/trì hoãn/không triển khai → lập dependency graph được thẩm định → chủ sản phẩm quyết định MVP sau. Không tự chọn tính năng bằng một điểm tổng hợp.

## 10. Research References — không tạo backlog trong từng section

| Research ID | Câu hỏi cần chứng minh cho 3.3 |
|---|---|
| MR-001, MR-002, MR-005–MR-010 | Giá trị, hành vi, cohort và willingness to adopt của phụ huynh/trẻ |
| MR-011–MR-015 | Development evidence, outcomes và khả năng thích ứng theo tuổi |
| MR-016–MR-024, MR-035 | Hard Gates: quyền dữ liệu, Journal, safety và AI authority |
| MR-025–MR-029 | E0/E1 so với E2/E3, cost, quota, latency và benchmarks |
| MR-033, MR-034, MR-037, MR-038 | Ecosystem, accessibility và chi phí duy trì sáu cohort |
| **MR-039 (MỚI)** | Rubric calibration, độ nhất quán giữa người đánh giá và cohort |
| **MR-040 (MỚI)** | Thẩm định dependency và xác minh đường găng thật |

**Single source of truth:** `Product_Blueprint_Master_Research_Backlog_v1_2.md` chứa chi tiết hai câu hỏi mới. Không tạo appendix Research Backlog độc lập trong file 3.3.

## 11. Điều kiện kết thúc và transition control

- [x] Q1–Q6 đã chốt.
- [x] Định nghĩa lớp đánh giá và cách xử lý thiếu bằng chứng.
- [x] Bảo toàn cấu trúc 4 cấp, 6 cohort, 49 Group và 98 Module baseline của 3.2.
- [x] Quy định dependencies và giới hạn AI cost.
- [x] Research mới cập nhật vào Master Research Backlog.
- [ ] Chấm điểm module và xác minh dependency (đợi bằng chứng; **không phải yêu cầu hoàn thành để chốt phương pháp 3.3**).
- [ ] Chọn MVP (**ngoài phạm vi 3.3**).
- [ ] Bắt đầu 3.4 (**không được tự động thực hiện**).

**Section 3.3: APPROVED về phương pháp; module-level assessment: NOT_EVALUATED.**

## PHỤ LỤC — Assessment Register L3 từ baseline 3.2 (98 modules)

Bảng này chỉ nhằm giữ đủ ID và bảo đảm không bỏ module khi đánh giá. Các trường `Gate`, `Value`, `Economics` là **UNKNOWN** tại thời điểm xuất tài liệu; không phải kết luận âm tính. Cần dùng record schema ở mục 8 để nhập đánh giá chính thức theo cohort và bằng chứng.

| L3 module ID | Feature Group | Module / Capability | Gate | Value | Economics | Assessment |
|---|---|---|---|---|---|---|
| `F01-G01-M01` | `F01-G01` | Account Access | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G01-M02` | `F01-G01` | Session Security | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G02-M01` | `F01-G02` | Family Structure | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G02-M02` | `F01-G02` | Member Relationships | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G03-M01` | `F01-G03` | Core Identity | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G03-M02` | `F01-G03` | Profile Integrity | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G04-M01` | `F01-G04` | Access Policy | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G04-M02` | `F01-G04` | Consent Ledger | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G05-M01` | `F01-G05` | Mode State | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G05-M02` | `F01-G05` | Mode Transitions | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G06-M01` | `F01-G06` | Lifecycle Controls | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F01-G06-M02` | `F01-G06` | Entitlements & Billing | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G01-M01` | `F02-G01` | Intake & Updates | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G01-M02` | `F02-G01` | Incremental Questions | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G02-M01` | `F02-G02` | Preference Registry | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G02-M02` | `F02-G02` | Preference Revision | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G03-M01` | `F02-G03` | Evidence-linked Observations | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G03-M02` | `F02-G03` | Non-labeling Review | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G04-M01` | `F02-G04` | Environment Context | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G04-M02` | `F02-G04` | Context Permissions | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G05-M01` | `F02-G05` | Versioned Profile | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G05-M02` | `F02-G05` | Child Feedback | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G06-M01` | `F02-G06` | Provenance | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F02-G06-M02` | `F02-G06` | Correction & Confidence | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G01-M01` | `F03-G01` | Framework Registry | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G01-M02` | `F03-G01` | Evidence Alignment | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G02-M01` | `F03-G02` | Dimension Taxonomy | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G02-M02` | `F03-G02` | Domain Mapping | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G03-M01` | `F03-G03` | Stage Catalog | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G03-M02` | `F03-G03` | Accessibility Adaptation | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G04-M01` | `F03-G04` | Goal Discovery | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G04-M02` | `F03-G04` | Goal Constraints | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G05-M01` | `F03-G05` | Grounded Recommendation | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G05-M02` | `F03-G05` | Recommendation Review | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G06-M01` | `F03-G06` | Goal Reassessment | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F03-G06-M02` | `F03-G06` | Goal Change Proposal | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G01-M01` | `F04-G01` | Plan Structure | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G01-M02` | `F04-G01` | Plan Templates | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G02-M01` | `F04-G02` | Schedule Construction | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G02-M02` | `F04-G02` | Schedule Conflict | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G03-M01` | `F04-G03` | Task Ownership | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G03-M02` | `F04-G03` | Approval Routing | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G04-M01` | `F04-G04` | Daily Task View | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G04-M02` | `F04-G04` | Execution Support | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G05-M01` | `F04-G05` | Lightweight Check-off | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G05-M02` | `F04-G05` | Evidence Submission | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G06-M01` | `F04-G06` | Change Requests | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G06-M02` | `F04-G06` | Change History | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G07-M01` | `F04-G07` | Schedule Notifications | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F04-G07-M02` | `F04-G07` | Notification Preferences | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G01-M01` | `F05-G01` | Child Conversation | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G01-M02` | `F05-G01` | Companion Guardrails | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G02-M01` | `F05-G02` | Opt-in Check-in | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G02-M02` | `F05-G02` | Check-in Controls | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G03-M01` | `F05-G03` | Reflection Prompts | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G03-M02` | `F05-G03` | Reflection Review | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G04-M01` | `F05-G04` | Private Entries | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G04-M02` | `F05-G04` | Journal Retrieval | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G05-M01` | `F05-G05` | Structured Insight | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G05-M02` | `F05-G05` | Insight Correction | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G06-M01` | `F05-G06` | Selective Sharing | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F05-G06-M02` | `F05-G06` | Deletion Graph | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G01-M01` | `F06-G01` | Activity Event Log | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G01-M02` | `F06-G01` | Source Metadata | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G02-M01` | `F06-G02` | Progress Rules | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G02-M02` | `F06-G02` | Progress Exceptions | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G03-M01` | `F06-G03` | Indicator Registry | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G03-M02` | `F06-G03` | Indicator Evidence | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G04-M01` | `F06-G04` | Deterministic Trends | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G04-M02` | `F06-G04` | Cautious Insights | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G05-M01` | `F06-G05` | Audience Views | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G05-M02` | `F06-G05` | Summary Rendering | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G06-M01` | `F06-G06` | Review Sessions | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F06-G06-M02` | `F06-G06` | Feedback Handoff | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G01-M01` | `F07-G01` | Content CMS | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G01-M02` | `F07-G01` | Structured Retrieval | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G02-M01` | `F07-G02` | Editorial Workflow | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G02-M02` | `F07-G02` | Evidence Provenance | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G03-M01` | `F07-G03` | Single Interface Router | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G03-M02` | `F07-G03` | Execution Budget | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G04-M01` | `F07-G04` | Policy Evaluation | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G04-M02` | `F07-G04` | Model Evaluation | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G05-M01` | `F07-G05` | Safety Triage | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G05-M02` | `F07-G05` | Human Response Workflow | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G06-M01` | `F07-G06` | Purpose-bound Access | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G06-M02` | `F07-G06` | Retention & Export | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G07-M01` | `F07-G07` | Operational Console | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F07-G07-M02` | `F07-G07` | Billing & Cost Operations | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G01-M01` | `F08-G01` | School Data Connectors | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G01-M02` | `F08-G01` | School Data Review | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G02-M01` | `F08-G02` | Expert Discovery | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G02-M02` | `F08-G02` | Expert Referral | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G03-M01` | `F08-G03` | Activity Directory | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G03-M02` | `F08-G03` | Resource Matching | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G04-M01` | `F08-G04` | Device Consents | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G04-M02` | `F08-G04` | External Data Import | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G05-M01` | `F08-G05` | Commerce Catalog | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |
| `F08-G05-M02` | `F08-G05` | Transaction & Conflict Controls | UNKNOWN | UNKNOWN | UNKNOWN | NOT_EVALUATED |

---

*Tài liệu 3.3 chỉ chốt cách đánh giá. Không mặc định đổi quyết định Product Vision, Journal, age autonomy hay policy safety của các section trước.*