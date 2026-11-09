# PRODUCT BLUEPRINT — PART 03: FEATURE PLANNING
## 3.4 — Feature Interaction & Use Case Mapping

| Thuộc tính | Giá trị |
|---|---|
| Trạng thái | **APPROVED — Chốt phương pháp/khung Use Case theo Q1–Q6; workflow chi tiết là baseline đề xuất, chưa phải bản phát hành** |
| Ngày chốt | 2026-11-07 |
| Cơ sở | 01 Vision; 02 User Research; 03.1 F01–F08; 03.2 49 Feature Groups, L3/L4 baseline; 03.3 ưu tiên/dependency methodology |
| Phạm vi dài hạn | 0–23 tuổi; sáu cohort A0–A5 đều được đánh giá |
| CORE | Lớp 1–9 tại Việt Nam; không tự động chọn MVP |
| Master Research Backlog | `Product_Blueprint_Master_Research_Backlog_v1_2.md` — chỉ tham chiếu `MR-###` |
| Bước tiếp theo | **Không bắt đầu 3.5** trước khi người dùng yêu cầu |

> **Ranh giới quyết định:** Các lựa chọn Q1–Q6 là **ĐÃ CHỐT**. Danh sách Use Case và workflow dưới đây là **BASELINE_PROPOSED**: mô tả nghiệp vụ có thể sửa qua change request, chưa xác nhận bằng user testing, pháp lý hoặc thiết kế kỹ thuật. Không coi biểu đồ luồng logic là đồ thị triển khai, không gán default permission từ cohort tuổi.

## 1. Quyết định Q1–Q6 và phản biện

| Q | Quyết định | Rủi ro | Cách kiểm soát |
|---|---|---|---|
| Q1 | **A:** 12 Use Case Families, phân rã hành trình cụ thể | Đếm use case theo màn hình hoặc tạo quá nhiều use case rất nhỏ | Use case được xác định bằng **actor + goal + observable outcome**, không theo số bước/UI; dùng family làm index, không mặc định mỗi family là một flow |
| Q2 | **A:** Main/Alternative flows + Permissions, Data, AI Policy, Success | Giả định đã chốt API, database, event | Chỉ ghi contract logic, chưa chốt protocol, transaction boundary hoặc model/provider |
| Q3 | **A:** một `primary_workflow_owner`, nhiều `participating_groups`; data owner riêng | “Owner duy nhất” bị hiểu thành quyền ghi mọi dữ liệu | Workflow owner điều phối/đảm bảo outcome; **data steward/owner của từng dữ liệu** kiểm tra quyền, ghi và giữ invariant |
| Q4 | **A:** 6 cohort, reuse flow chung, branch khi cần | Áp cùng hành vi cho 0–2 và 18–23 | Ma trận mỗi use case, nêu ai thao tác, khác biệt quyền và độ nhạy; không coi tuổi tự cấp quyền |
| Q5 | **A:** issue log, không tự sửa cấu trúc 3.2 | Overlap chưa được phát hiện hoặc làm mất traceability | Mỗi issue có ID, evidence, proposed change, impact, trạng thái; 3.2 chỉ đổi qua review/approval có phiên bản |
| Q6 | **A:** `UC-###` + schema; link Feature IDs, MR, permissions, E0–E3 | UC trở thành một bản sao của Feature Inventory | UC chỉ lưu link, không copy nguyên feature metadata; consistency check với registry IDs |

**Phản biện bổ sung:** (i) 12 families là danh mục khởi đầu, không phải bằng chứng mọi trường hợp đã đủ. (ii) Main flow thông thường không bao phủ sự cố riêng tư hoặc nguy cơ an toàn; phải có alternative/exception flow và release gate. (iii) Người dùng có thể nhập *một yêu cầu với nhiều intent*, nhưng chưa chắc đồng ý thực hiện mọi intent: mỗi mutation có kiểm tra quyền và xác nhận phù hợp. (iv) LLM hiểu ý định không có quyền bypass business policy. (v) Các mốc 0–23 phục vụ inventory, không được áp đặt thành khung pháp luật hay chẩn đoán phát triển.

## 2. Các khái niệm và nguyên tắc

- **Feature Group (L2):** nhóm năng lực nghiệp vụ, không phải service, screen hoặc agent.
- **Module (L3):** năng lực tái sử dụng; L4 là hành vi cụ thể. Link được bằng ID đã có trong 3.2; không sáng tạo ID L4 chưa tồn tại.
- **Use Case (UC):** mục tiêu nghiệp vụ có kết quả có thể quan sát, có actor và trigger.
- **Application Workflow:** thứ tự và quy tắc phối hợp năng lực đáp ứng UC, có các nhánh ngoại lệ.
- **Workflow owner:** chịu trách nhiệm orchestrate outcome và các trạng thái tiến trình, **không sở hữu mọi dữ liệu**.
- **Data owner:** miền/năng lực có quyền kiểm tra và sửa bản ghi chuẩn; các miền khác đọc theo mục đích/ủy quyền.
- **Cross-cutting policy:** F01 (identity, permission, autonomy), F07 (knowledge, AI governance, safety/privacy) được áp dụng theo nhu cầu ở mỗi bước, không mặc định mỗi lần là một external hop.

**Contract logic:** `input → access/purpose checks → capability operations → approval/gates → committed outcome → authorized notifications`. Không có bước ghi dữ liệu nhạy cảm trước khi xét quyền, không có thông báo thay đổi thành công trước khi commit. Yêu cầu có nhiều intent được chia thành các action có trạng thái/consent riêng; thao tác đọc độc lập có thể song song khi được phép, còn sửa dữ liệu cần owner và consistency control.

**Cost-aware:** E0 CRUD/data; E1 rules/templates/algorithm; E2 LLM có chủ đích; E3 workflow AI phức tạp chỉ khi có benchmark. Không ánh xạ `1 group = 1 agent`, `1 step = 1 API/LLM call` hoặc `1 user input = 1 model call`. `MR-025`, `MR-027`, `MR-028`, `MR-029` chưa đóng.

## 3. ID, coverage và schema dùng chung

### 3.1 Quy tắc ID

- `UCF-01` ... `UCF-12`: Use Case **Family** (index), không đồng nghĩa feature group.
- `UC-001` ...: Use Case cụ thể; ID bất biến khi đổi tên; lưu alias/deprecation nếu chuyển family.
- `WF-UC-001` ...: logic workflow của UC; một UC có thể có hơn một version; cùng workflow logic có thể được tái sử dụng từ nhiều entry point.
- Tham chiếu: `Fxx-Gyy` / `Fxx-Gyy-Mzz` / mã L4 chính thức trong 3.2; `MR-###` từ master backlog; issue `FI-3.4-###` để theo dõi overlap mà **không tự sửa 3.2**.

### 3.2 Schema chuẩn

```yaml
id: UC-004
family_id: UCF-04
name: "Tạo kế hoạch và trình phê duyệt"
definition_status: BASELINE_PROPOSED
actors: [parent, child, system]
trigger: "Yêu cầu tạo kế hoạch từ mục tiêu đã chọn"
goal: "Kế hoạch khả thi, được người có quyền xác nhận"
entry_points: [parent_app, child_app, ai_interface]
preconditions: [identity_checked, goal_available]
primary_workflow_owner: F04-G01
participating_groups: [F01-G04, F03-G04, F04-G01, F04-G02, F04-G06, F07-G02]
data_owners:
  approved_goal: F03-G04
  draft_plan: F04-G01
  approval_state: F04-G06
permissions:
  rule: "Authoritative policy from F01-G04/F01-G05; no decision from LLM"
  approval: "According to autonomy mode, age/legal rights, and authorized scope"
main_flow: [validate_actor, load_authorized_goal, propose_plan, validate_constraints, request_approval, commit_if_approved]
alternative_flows: [missing_goal, invalid_constraints, denied_permission, approval_rejected, concurrent_change]
data_flow: [goal_reference, schedule_constraints, draft_plan, approval_result]
execution_policy:
  default: E1
  llm_optional: "Natural-language input/explanation only after safe context filtering"
  llm_budget: UNKNOWN
success_criteria: [valid_plan, correct_approval_state, no_unauthorized_disclosure]
cohort_variants: [A0, A1, A2, A3, A4, A5]
research_refs: [MR-012, MR-015, MR-017, MR-025, MR-035]
release_gates: [permission_review, usability_validation]
assessment_status: NOT_VALIDATED
mvp_decision: NOT_DECIDED
```

`UNKNOWN`, `BASELINE_PROPOSED` và `NOT_VALIDATED` là trạng thái có chủ ý; không coi là lỗi. Kết quả `success` phải kiểm được từ hành động/dữ liệu cho phép, không dựa trên lời khẳng định do AI tự tạo.

## 4. Danh mục 12 Use Case Families

| Family ID | Family / outcome | Primary business domain | Groups thường tham gia | Ghi chú |
|---|---|---|---|---|
| UCF-01 | Family onboarding, identity, consent và phân quyền | F01 | F01-G01/G02/G03/G04/G05/G06; F07-G06 | Phân biệt quyền người lớn và hồ sơ trẻ |
| UCF-02 | Thu thập/xác minh/cập nhật hiểu biết về trẻ | F02 | F02-G01/G02/G03/G04/G05/G06; F01-G04; F07-G06 | Dữ kiện khác với suy luận; không truy cập Journal mặc định |
| UCF-03 | Xác định định hướng, mục tiêu phát triển | F03 | F03-G01/G02/G03/G04/G05/G06; F02-G05; F07-G01/G02/G04 | Khuyến nghị có bằng chứng, không tự quyết định |
| UCF-04 | Tạo kế hoạch và phê duyệt | F04 | F04-G01/G02/G03/G06; F01-G04; F03-G04 | Approval thực thi theo quyền |
| UCF-05 | Thực hiện, báo cáo, điều chỉnh kế hoạch | F04 | F04-G02/G04/G05/G06/G07; F06-G01 | Tối giản báo cáo, không nhắc từ Journal mặc định |
| UCF-06 | Child Companion trong phạm vi an toàn | F05 | F05-G01; F07-G03/G04/G05; F01-G04 | Có khả năng E2, cấm suy diễn quyền truy cập |
| UCF-07 | Journal riêng tư, insight, chia sẻ, xóa | F05 | F05-G04/G05/G06; F01-G04; F07-G05/G06 | Privacy boundary độc lập, safety exception tách riêng |
| UCF-08 | Tracking, review và điều chỉnh mục tiêu | F06 | F06-G01/G02/G03/G04/G05/G06; F03-G06; F02-G06 | Không đánh đồng completion với outcome |
| UCF-09 | Truy xuất tri thức và governance khuyến nghị | F07 | F07-G01/G02/G03/G04; F03-G05 | Knowledge provenance và giới hạn khuyến nghị |
| UCF-10 | Nhận diện/triage và ứng phó tình huống an toàn | F07 | F07-G05/G06/G07; F01-G04; F05-G01 | Không hứa tự động phát hiện tất cả nguy cơ |
| UCF-11 | Tích hợp học đường, thiết bị, chuyên gia, hoạt động, commerce | F08 | F08-G01/G02/G03/G04/G05; F01-G04; F07-G06 | Không mặc định tích hợp/marketplace đã hợp pháp/khả thi |
| UCF-12 | Quản trị vận hành, subscription và lifecycle | F01/F07 (owner theo UC) | F01-G06; F07-G01/G02/G07; F07-G06 | Billing dữ liệu khác với Journal; admin không quyền tuyệt đối |

### 4.1. Use Case Register — 24 hành trình sơ bộ (2/family để đảm bảo coverage tối thiểu, **không** đặt trần 2)

| UC | Family | Actor & mục tiêu | Trigger | Primary workflow owner | Participating groups (tối thiểu) | Execution baseline | Research refs |
|---|---|---|---|---|---|---|---|
| UC-001 | UCF-01 | Phụ huynh thiết lập gia đình và hồ sơ trẻ | Onboarding | F01-G02 | F01-G01/G02/G03/G04 | E0/E1 | MR-016, MR-017 |
| UC-002 | UCF-01 | Người có quyền cấp/thu hồi quyền thành viên | Thay đổi role/consent | F01-G04 | F01-G02/G04/G05; F07-G06 | E1 | MR-016, MR-017, MR-021 |
| UC-003 | UCF-02 | Phụ huynh/trẻ cập nhật quan sát có nguồn | Check-in hồ sơ | F02-G01 | F02-G01/G05/G06; F01-G04 | E1; E2 optional | MR-010, MR-013 |
| UC-004 | UCF-02 | Trẻ xem và phản đối nhận định về mình | Trẻ yêu cầu sửa | F02-G05 | F02-G05/G06; F01-G04 | E1 | MR-015, MR-019 |
| UC-005 | UCF-03 | Phụ huynh/trẻ chọn mục tiêu phát triển | Goal discovery | F03-G04 | F02-G05; F03-G01/G03/G04; F07-G02 | E1/E2 optional | MR-011, MR-012, MR-015 |
| UC-006 | UCF-03 | Người có quyền xem xét điều chỉnh mục tiêu | Goal review | F03-G06 | F03-G04/G05/G06; F06-G06 | E1 | MR-014, MR-035 |
| UC-007 | UCF-04 | Gia đình tạo kế hoạch từ mục tiêu đã duyệt | Create plan | F04-G01 | F03-G04; F04-G01/G02/G03/G06; F01-G04 | E1; E2 optional | MR-012, MR-025, MR-035 |
| UC-008 | UCF-04 | Phụ huynh duyệt/không duyệt kế hoạch | Plan submission | F04-G06 | F04-G01/G06; F01-G04 | E1 | MR-017, MR-035 |
| UC-009 | UCF-05 | Trẻ thực hiện và báo cáo hoạt động tối giản | Task available | F04-G04 | F04-G04/G05; F06-G01 | E0/E1 | MR-007, MR-031 |
| UC-010 | UCF-05 | Trẻ/phụ huynh đề nghị sửa lịch bị xung đột | Plan conflicts | F04-G06 | F04-G01/G02/G06; F01-G04 | E1; E2 optional | MR-012, MR-035 |
| UC-011 | UCF-06 | Trẻ hỏi AI về một khó khăn học tập | Child opens chat | F05-G01 | F05-G01; F07-G03/G04/G05 | E2 | MR-023, MR-024, MR-029 |
| UC-012 | UCF-06 | Trẻ yêu cầu AI giúp đề xuất thay đổi kế hoạch | Chat + action intent | F04-G06 | F05-G01; F04-G06; F01-G04; F07-G03 | E2 interpret + E1 execute | MR-023, MR-028, MR-035 |
| UC-013 | UCF-07 | Trẻ tạo/xem/xóa mục Journal | Journal action | F05-G04 | F05-G04/G06; F01-G04; F07-G06 | E0/E1, E2 optional | MR-018, MR-021 |
| UC-014 | UCF-07 | Trẻ xem/sửa/xóa insight riêng có nguồn Journal | Insight review | F05-G05 | F05-G05/G06; F07-G06 | E1; E2 extraction optional | MR-018, MR-019 |
| UC-015 | UCF-08 | Phụ huynh/trẻ xem tiến độ có kiểm soát | Open dashboard | F06-G05 | F06-G01/G02/G03/G05; F01-G04 | E0/E1 | MR-014, MR-021 |
| UC-016 | UCF-08 | Người có quyền review và đề nghị sửa mục tiêu | Scheduled review | F06-G06 | F06-G04/G06; F03-G06; F02-G06 | E1/E2 optional | MR-014, MR-035 |
| UC-017 | UCF-09 | Người dùng tra cứu hướng dẫn có nguồn | Ask for guidance | F07-G03 | F07-G01/G02/G03/G04; F03-G05 | E1/E2 | MR-011, MR-023, MR-025 |
| UC-018 | UCF-09 | Biên tập viên duyệt cập nhật nguồn tri thức | Evidence update | F07-G02 | F07-G01/G02/G07 | E0/E1 | MR-011, MR-023 |
| UC-019 | UCF-10 | Hệ thống/phụ trách triage tín hiệu an toàn | Risk signal | F07-G05 | F07-G05/G06/G07; F01-G04 | Rules + specialized safety workflow, model only if validated | MR-022, MR-023 |
| UC-020 | UCF-10 | Người được ủy quyền xử lý/đóng incident | Human review | F07-G05 | F07-G05/G07; F07-G06 | E0/E1 | MR-022, MR-021 |
| UC-021 | UCF-11 | Gia đình kết nối/thu hồi nguồn school/device | Integration request | F08-G01 (school) / F08-G04 (device) | F08-G01/G04; F01-G04; F07-G06 | E0/E1 | MR-021, MR-033 |
| UC-022 | UCF-11 | Gia đình tìm dịch vụ/hoạt động ngoài và xem quảng cáo rõ ràng | Browse resources | F08-G03 | F08-G02/G03/G05; F07-G02 | E1 | MR-033, MR-034 |
| UC-023 | UCF-12 | Gia đình thay đổi gói và xem quyền lợi | Subscription change | F01-G06 | F01-G06; F07-G07 | E0/E1 | MR-003, MR-027 |
| UC-024 | UCF-12 | Người vận hành thẩm tra audit/budget theo quyền | Operations review | F07-G07 | F07-G06/G07; F01-G04 | E0/E1 | MR-021, MR-027, MR-029 |

**Chú thích:** Các UC-021 (school vs device) được phân nhánh cùng một mục đích nhưng **khác data owner theo connector**; khi triển khai có thể tách nếu quyền/luồng thu hồi khác biệt. UC-012 thuộc family Companion theo điểm vào nhưng F04-G06 sở hữu **outcome điều chỉnh**, minh họa rõ rằng family không bắt buộc là owner. UC-017 là entry point AI, không làm F07 sở hữu mục tiêu phát triển của F03.

## 5. Cohort coverage — đánh giá đủ sáu nhóm tuổi

**Legend:** `P` người chăm sóc chủ đạo; `J` trẻ cùng tham gia với người lớn; `C` trẻ thao tác theo quyền; `Y` thanh thiếu niên thao tác, các yêu cầu quyền riêng tư chặt hơn; `U` người trưởng thành tự chủ; `N` không có luồng tương tác trực tiếp, thay bằng caregiver/proxy workflow; `O` chỉ triển khai khi thích hợp/được cho phép. Cohort là **UX variant**, không tự xác lập quyền pháp lý.

| Family | A0 0–2 | A1 3–5 | A2 6–10 | A3 11–14 | A4 15–17 | A5 18–23 | Điều kiện branch quan trọng |
|---|---|---|---|---|---|---|---|
| UCF-01 Identity | P | P | P/J | P/C | P/Y | U | guardian vs adult account; không tự transfer dữ liệu nhạy cảm |
| UCF-02 Understanding | P | P/J | P/J | C/P | Y/P | U | child review rights, evidence and consent |
| UCF-03 Guidance | P | P/J | P/J | C/P | Y/P | U | cách trình bày, ai xác nhận mục tiêu |
| UCF-04 Planning | P | P/J | P/J | C/P | Y/P | U | approval mode, caregiver schedule |
| UCF-05 Execution | P | J | C/P | C/P | Y/P | U | reporting nhẹ, mức trợ giúp |
| UCF-06 Companion | N | O/J | C/O | C | Y | U | interaction gating, dependence/safety |
| UCF-07 Journal | N | O/J | C/O | C | Y | U | Journal riêng, năng lực hiểu quyền xóa/chia sẻ |
| UCF-08 Tracking | P | P/J | C/P | C/P | Y/P | U | self-report ≠ objective assessment |
| UCF-09 Knowledge | P | P/J | C/P | C | Y | U | mức độ bằng chứng và ngôn ngữ |
| UCF-10 Safety | P* | P* | C/P* | C/P* | Y/P* | U* | *escalation theo nguy cơ, không mặc định caregiver là người an toàn |
| UCF-11 Ecosystem | P | P/J | P/J | C/P | Y/P | U | tích hợp và consent theo nguồn |
| UCF-12 Operations | P† | P† | P† | P† | P† | U† | †admin nội bộ là vai trò riêng, billing family/adult |

**Các nhánh bắt buộc được xem xét trong từng UC cụ thể:** `caregiver-operated`, `child-supervised`, `child-active`, `youth-active`, `adult-owner`; 3 chế độ Parent-led/Child-executed/Child-directed (người chưa thành niên), quyền của người trưởng thành, accessibility, ngôn ngữ phù hợp, dữ liệu có được chia sẻ hay không, ngoại lệ an toàn. `N` không có nghĩa nhóm tuổi không được hưởng lợi: người chăm sóc có thể dùng một use case thay thế.

## 6. Use Cases chi tiết — minh họa theo cùng schema

### 6.1 UC-010 — Điều chỉnh lịch khi xung đột (F04; E1 mặc định)

- **Actors / trigger:** Phụ huynh hoặc trẻ nhận thấy lịch chồng chéo, hoặc hệ thống phát hiện xung đột trong lịch đã được phép kiểm tra.
- **Goal / success:** Có phương án lịch hợp lệ; chỉ áp dụng sau khi đúng người có quyền duyệt; không có xung đột mới chưa được xét; trạng thái rõ `APPLIED` hoặc `PENDING_APPROVAL`/`REJECTED`.
- **Preconditions:** Có plan được phép xem, constraints đã biết, principal identity hợp lệ; không tự suy ra quyền từ cohort.
- **Owner:** `F04-G06` cho outcome change request/phê duyệt. **Data owners:** `F04-G01` kế hoạch chuẩn; `F04-G02` proposal xung đột/alternatives; `F04-G06` phê duyệt; `F01-G04` chính sách quyền.
- **Groups / refs:** `F04-G01-M01`, `F04-G02-M02`, `F04-G06-M01/M02`, `F01-G04-M01`; MR-012, MR-017, MR-025, MR-035.
- **Main flow:** (1) check principal + purpose + access; (2) load plan & verified constraints; (3) deterministic conflict check và thử các slots khác; (4) trình phương án/giải thích; (5) tạo change request nếu cần; (6) xác nhận quyền + phiên bản plan khi commit; (7) ghi thay đổi, notify sau commit nếu được phép.
- **Alternative flows:** không có slot hợp lệ → hiển thị trade-off, không ép chọn; thay đổi đồng thời → yêu cầu refresh/re-evaluate; child thiếu quyền → proposal pending; người duyệt từ chối → giữ lịch cũ; dữ liệu thiếu → yêu cầu xác nhận, không tự giả định giờ ngủ.
- **Permissions:** `Parent-led` parent approves; `Child-executed` child proposes / parent approves; `Child-directed` trong scope đã ủy quyền; adult tự quyết theo policy. Không dùng chat response làm bằng chứng đã phê duyệt.
- **Data / privacy:** approved_plan, schedule_slots, restrictions → proposal, change_request, versioned_plan; family planning có kiểm soát phân quyền, không lấy Journal gốc.
- **AI / cost:** E1 overlap detection + constraint solving; E2 **tùy chọn** khi diễn giải yêu cầu bằng lời hoặc giải thích trade-off. Không cho AI tự write; `llm_budget=UNKNOWN` đến khi MR-027/028 hoàn tất.
- **Release gates:** permission matrix test, conflict regression, concurrency/idempotency validation, UX review.

### 6.2 UC-013/014 — Journal riêng tư → structured insight và xóa liên đới

- **Actors / trigger:** Trẻ tạo, xem, yêu cầu xóa Journal hoặc mở mục để xem xét insight riêng. Người quản trị/phụ huynh không tự động có quyền truy cập.
- **Goal / success:** Nội dung được lưu trong vùng riêng hợp lệ; structured insight (nếu được phép) ở **hồ sơ riêng của trẻ**; child có cơ chế phản đối/sửa; yêu cầu xóa tác động tới thông tin dẫn xuất theo policy đã kiểm chứng, không rò rỉ sang Parent App.
- **Preconditions:** consent/purpose phù hợp; phân quyền thực thi; safety exception được định nghĩa rõ trước triển khai thực tế.
- **Owner:** `F05-G04` entry CRUD; `F05-G05` insight review; `F05-G06` sharing/deletion workflow. **Data owners:** `F05-G04` journal entry; `F05-G05` private derived insight; `F05-G06` share/deletion requests; `F07-G06` retention policy; F02 *không* mặc định sở hữu hoặc truy cập insight riêng.
- **Groups / refs:** `F05-G04-M01/M02`, `F05-G05-M01/M02`, `F05-G06-M01/M02`, `F01-G04`, `F07-G05/G06`; MR-016, MR-018, MR-019, MR-020, MR-021, MR-022, MR-030.
- **Main flow:** (1) authorization for private journal area; (2) create entry; với voice, xử lý input tạm theo policy và không lưu raw audio theo định hướng đã chốt; (3) nếu phù hợp với loại dữ liệu được phép, trích xuất **structured insight** riêng có traceable provenance (không lưu AI narrative summary như bản nhật ký thứ hai); (4) trẻ kiểm tra, sửa, phản đối hoặc xóa; (5) chia sẻ từng nội dung khi có hành động cho phép; (6) yêu cầu xóa → truy vết derived links → áp dụng lifecycle phù hợp và audit tối thiểu.
- **Alternative flows:** revoked consent → ngừng processing tiếp theo; extraction uncertain → không lưu thành fact; safety signal → chuyển *safety workflow* riêng theo policy, không tự gửi toàn bộ Journal cho parent; deletion conflict with legal retention → hạn chế mục đích/quyền, giải thích đúng thay vì hứa xóa ngay tất cả; privacy check failed → deny.
- **Permissions / age:** A0 không có Child Journal direct; A1 chỉ nghiên cứu hành vi phù hợp và giám sát; A2–A4 phù hợp capacity/consent, quyền parent không mặc định được đọc; A5 account owner controls. Autonomy mode không override privacy rules.
- **AI / cost:** E0/E1 cho CRUD/sharing/deletion; E2 có thể dùng xử lý ngôn ngữ/trích xuất nhưng phải qua safety+privacy validation. Không truy hồi Journal phiên khác khi trẻ chưa chủ động mở lại; không nhắc từ Journal theo mặc định (R2 đã chốt).
- **Hard gates:** `MR-016`, `MR-018`, `MR-019`, `MR-021`, `MR-022`, `MR-030` tương ứng trước khi xử lý dữ liệu thật/phát hành tính năng liên quan. **Chưa phải workflow được duyệt phát hành.**

### 6.3 UC-019 — Triage tín hiệu an toàn có human oversight

- **Actors / trigger:** Luồng tương tác có tín hiệu cần đánh giá an toàn; hoặc người được phép gửi báo cáo.
- **Goal / success:** Không bỏ qua tuyến escalation đã xác lập; không tiết lộ quá phạm vi; có owner và audit; quy tắc phản ứng hợp tác với chuyên gia trước thử nghiệm thật.
- **Owner:** `F07-G05` (safety workflow); **Data owner:** incident record có retention riêng theo `F07-G06`, nguồn Journal vẫn do F05 quản lý.
- **Groups / refs:** `F07-G05-M01/M02`, `F07-G06`, `F07-G07`, `F01-G04`; MR-016, MR-021, MR-022, MR-023, MR-024.
- **Main flow đề xuất:** (1) triage theo policy được thẩm định; (2) phân loại mức khẩn cấp/độ bất định; (3) xác định recipient/đội hỗ trợ được phép; (4) chuyển tuyến phù hợp, tối thiểu hóa dữ liệu chia sẻ; (5) audit và review outcome.
- **Alternative flows:** model uncertain → fallback và human review theo mức độ; suspected harmful caregiver → **không mặc định thông báo chính caregiver đó**; system unavailable → safety-preserving fallback; false alarm → correction/audit; emergency → protocol khẩn cấp đã được chuyên gia xác nhận, không chỉ đợi xu hướng dài hạn.
- **AI / cost:** logic và vận hành ưu tiên deterministic + quy trình người thật, mô hình nếu dùng phải được kiểm chứng chuyên biệt. Budget caps **không được âm thầm chặn phản ứng khẩn cấp**.
- **Release gates:** MR-022/MR-023 và pháp lý còn blocker. Đây là **mô hình yêu cầu cần nghiên cứu**, không tuyên bố hệ thống hiện có năng lực phát hiện/chẩn đoán khẩn cấp.

### 6.4 UC-007 và UC-015 — Trao đổi dữ liệu giữa lập kế hoạch và đo lường

- `UC-007`: mục tiêu đã được phê duyệt (`F03-G04`) → plan draft (`F04-G01`) → constraints/schedule (`F04-G02`) → approval (`F04-G06`) → plan baseline. Không tự khởi tạo mục tiêu phát triển L3 mới từ AI mà chưa qua review.
- `UC-015`: execution evidence (`F04-G05`, `F06-G01`) → progress aggregates (`F06-G02`) → display (`F06-G05`) theo quyền (`F01-G04`). Phân biệt task completed, self-report, quan sát, inference; không tự khẳng định phát triển thực chất.
- Phản hồi về mục tiêu nằm ở `F06-G06` → proposal `F03-G06`; vẫn cần authority check. `F06` không trực tiếp sửa mục tiêu/plan gốc.
- **Lý do tách:** Ngăn analytics làm thành nguồn sự thật độc lập hoặc phát động hành động khi chưa được phê duyệt. MR-011, MR-014, MR-035.

## 7. Interaction/Ownership Rules và nguyên tắc consistency

| Tình huống | Quy tắc |
|---|---|
| Một input kích hoạt nhiều groups | Workflow theo **goal**, không phải multi-agent; tách action intent và kiểm tra permission cho mỗi mutation |
| Hai groups cùng có thể sửa một entity | Chỉ **canonical data owner** được commit entity đó; group khác gửi proposal/command có hợp đồng |
| Chưa xác định data owner | `OWNERSHIP_UNKNOWN`, ghi issue FI; không xây hai bản ghi cạnh tranh |
| User input bằng chat | LLM (nếu dùng) chỉ parse/giải thích; backend kiểm tra policy và validation |
| Đọc nhiều nguồn | Chỉ truy vấn những nguồn được phép, tối thiểu cần thiết, có thể song song khi các quyền đã được xác minh |
| Approval | Bảo tồn trạng thái `PENDING/APPROVED/REJECTED`; người dùng cần được xác định bằng hệ thống identity, không dựa vào nội dung chat |
| Commit + notify | Notify/derived updates chỉ sau commit thành công; lỗi retry phải bảo đảm không tạo tác dụng lặp không mong muốn |
| Workflow thất bại | Giữ outcome nhất quán, trả trạng thái rõ ràng; không đưa dữ liệu riêng tư vào log không cần thiết |
| Dữ liệu suy ra từ Journal | Giữ provenance/deletion links trong private boundary; không dùng F02 chung làm lối truy cập mặc định |
| Người dùng đủ tuổi trưởng thành | Quyền chia sẻ do account owner và chính sách pháp lý điều chỉnh; phụ huynh không mặc định giữ quyền |

**Dependency status:** UC participation ≠ hard technical dependency. Chỉ kết luận dependency cứng khi có xác nhận trong `MR-040`. Trong tài liệu này việc map groups là *logical participation*, không thể dùng trực tiếp làm implementation ordering.

## 8. Issue Register — overlap/gaps cần review, **chưa sửa inventory 3.2**

| ID | Vấn đề quan sát từ baseline | Đề xuất xử lý | Ảnh hưởng | Trạng thái |
|---|---|---|---|---|
| FI-3.4-001 | F04-G03 Approval Routing và F04-G06 Plan Approval có thể cùng xử lý routing | Định nghĩa G03 chỉ phân phát tác vụ/đến đúng người, G06 quyết định trạng thái thay đổi plan | L3 ownership | REVIEW_REQUIRED |
| FI-3.4-002 | F05-G05 private insight và F02-G05 Child Understanding Profile có thể chồng data model | Tách private-derived insight (F05) và public/consented profile (F02), data bridge chỉ khi policy cho phép | Privacy boundary | REVIEW_REQUIRED — linked MR-019/021 |
| FI-3.4-003 | F01-G06 Data Lifecycle, F05-G06 Journal Deletion và F07-G06 Retention khác phạm vi | F01 account request; F05 Journal deletion semantics; F07 enforce retention across stores | Deletion consistency | REVIEW_REQUIRED — linked MR-018 |
| FI-3.4-004 | F03-G06 Goal Adjustment và F06-G06 Review Feedback có thể cùng sở hữu change | F06 tạo evidence/proposal; F03 quyết định state of goal, authority check theo F01 | Cross-domain outcome | REVIEW_REQUIRED |
| FI-3.4-005 | UCF-12 gom operational admin và billing của F01/F07 | Giữ family cho index, owner theo từng UC; không tạo giả định một service/cơ sở dữ liệu | Architecture boundary | REVIEW_REQUIRED |
| FI-3.4-006 | UC-021 gộp school connector và device connector, consent/revocation khác nhau | Giữ parent UC, tách variant/UC khi test cho thấy quy trình, retention hoặc API khác biệt đáng kể | F08 integrations | REVIEW_REQUIRED — linked MR-033 |
| FI-3.4-007 | Nội dung hướng dẫn F03-G05 và kho tri thức F07-G01/G02 | F07 đảm bảo nguồn và chứng cứ; F03 chịu outcome cá nhân hóa/giới hạn khuyến nghị | Provenance / ownership | REVIEW_REQUIRED |

**Quy trình issue:** `OPEN → EVIDENCE_COLLECTED → PROPOSAL → OWNER_REVIEW → APPROVED_CHANGE / NO_CHANGE / DEFERRED`. Chỉ áp dụng vào 3.2 khi người dùng duyệt thay đổi có version, ghi ảnh hưởng đến ID và use cases. **Không coi các issue trên là lỗi đã chứng minh.**

## 9. Quality/Release checklist (không phải acceptance criteria kỹ thuật chi tiết)

Mỗi Use Case trước khi được coi `REVIEWED` cần:

1. Có actor/trigger/outcome đo được và `primary_workflow_owner` hợp lệ.
2. Có link group/module tồn tại trong 3.2; nếu chưa có thì `FEATURE_GAP` issue, không invent feature ID.
3. Có `data_owners` cho mọi dữ liệu đọc/ghi quan trọng và mục đích truy cập.
4. Có permission matrix cho child autonomy, guardian, adult và sensitive data.
5. Có đủ main, alternative và exception flows (denied, missing data, cancel, retry, conflict, safety khi liên quan).
6. Có age-variant coverage A0–A5 với `N/O` giải thích, không ép direct child use.
7. Có default E0–E3 và lý do cho AI; limit/model budget có thể là UNKNOWN nếu chưa đo.
8. Có research refs, blockers, release gates và `definition_status`; unknown không thể diễn đạt như PASS.
9. Có success criteria **không cần LLM tự tuyên bố thành công**.
10. Có issue log khi ownership, dependency hoặc dữ liệu privacy thiếu rõ ràng.

**Thước đo cho validation sau:** task completion rate, time-to-outcome (parent/child), approval correctness, unauthorized access attempts, AI calls per successful outcome, p95 latency, error recovery, false positives/negatives của safety (theo protocol nghiên cứu), user burden của reporting. **Không gán mục tiêu định lượng trước khi benchmark.**

## 10. Research Backlog references và trạng thái kiến thức

3.4 phát sinh các câu hỏi cần review về orchestration/privacy/ownership/age variant nhưng các chủ đề này **đã được bao phủ bởi MR hiện hữu**:

- `MR-015`, `MR-016`, `MR-017`, `MR-021`, `MR-035`: autonomy, permission, approval và quyền theo tuổi.
- `MR-018`, `MR-019`, `MR-020`, `MR-022`, `MR-024`, `MR-030`: Journal, derived insight, deletion, safety, voice và privacy.
- `MR-011`, `MR-012`, `MR-014`, `MR-023`: knowledge, framework, tracking và AI quality.
- `MR-025`–`MR-029`: tính cần thiết của AI, model cost, orchestration, cap/fallback.
- `MR-033`, `MR-034`: bên thứ ba và commerce.
- `MR-037`–`MR-040`: accessibility, age variant maintenance, score calibration, dependency validation.

**Research items mới:** **0**. Không tự nhân bản MR. Master Research Backlog phiên bản **v1.2, 40 items**, giữ nguyên. Các `FI-3.4-###` là **Feature Inventory issues**, không phải mã nghiên cứu thứ hai; chỉ link tới MR khi cần bằng chứng ngoài.

**Những điểm còn thiếu cần nghiên cứu, không chặn việc chốt 3.4:** legal consent và guardianship; an toàn/triage (blocker); policy Journal và data-derived deletion (blocker); hành vi người dùng từng cohort; cost/model/latency thực tế; đánh giá dependency thực sự. Blocker vẫn phải đóng trước pilot/production có rủi ro tương ứng.

## 11. Trạng thái và quyết định kết thúc

**ĐÃ CHỐT:** Q1–Q6; quy ước Use Case ID, schema, ownership theo workflow và dữ liệu, 12-family coverage, phân nhánh theo sáu cohort, issue-based change control, cost-aware routing không mặc định multi-agent.

**BASELINE_PROPOSED:** 24 UC đại diện; các main/alternative flow minh họa; phân công owner sơ bộ, chính sách đồng ý, đặc tả release gates. Các phương án chỉ có thể triển khai sau khi chính sách pháp lý/an toàn và các phụ thuộc được xác nhận.

**CHƯA THỰC HIỆN:** chấm điểm L3/L4 chính thức, chọn MVP, đặc tả kỹ thuật/API/data schema, giải quyết toàn bộ MR, chỉnh sửa 3.2 do FI issues. Không bắt đầu 3.5.