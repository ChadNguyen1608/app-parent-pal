# PRODUCT BLUEPRINT — PART 03: FEATURE PLANNING
## 3.2 — Feature Inventory & Scope Definition

| Thuộc tính | Giá trị |
|---|---|
| **Trạng thái** | **APPROVED — 3.2 / Q1–Q6** (inventory baseline, không phải MVP) |
| Ngày chốt | 2026-11-07 |
| Phạm vi | 0–23 tuổi; **phân rã có độ chi tiết cấu trúc ngang nhau** cho mọi nhóm tuổi |
| Phạm vi CORE đã chốt | Lớp 1–9 tại Việt Nam; **không bỏ các độ tuổi khác khỏi inventory** |
| Feature Groups | 49 nhóm làm baseline, có thể thay đổi có kiểm soát |
| Research tracking | Chỉ sử dụng **Product_Blueprint_Master_Research_Backlog.md**, tham chiếu `MR-###` |
| Bước tiếp theo | **Chưa triển khai**; chỉ tiến hành khi người dùng yêu cầu |

> **Phân biệt:** Quyết định cấu trúc, mã định danh và nguyên tắc điều hành đã chốt. Các module/individual feature phía dưới là **inventory baseline được đề xuất để bao phủ toàn bộ phạm vi**, chưa được nghiệm thu như yêu cầu chức năng cuối cùng. Việc nghiên cứu, pháp lý, khả năng sử dụng và triển khai từng feature vẫn cần kiểm chứng tương ứng.

## 1. Quyết định và phản biện Q1–Q6

| Mã | Quyết định đã chốt | Phản biện / biện pháp tránh phình scope |
|---|---|---|
| Q1 | **C — 4 cấp:** Domain → Group → Module/Capability → Individual Feature | Module là **đơn vị năng lực sản phẩm**, không mặc định là package/service/agent riêng; chỉ tách module khi có trách nhiệm, quyền hoặc vòng đời dữ liệu rõ. |
| Q2 | **B — phân rã 0–23 ngang độ chi tiết** | **Ngang về mức đặc tả**, không ép trẻ 0–2 tuổi dùng trực tiếp AI hay giả định cùng UI. Áp dụng module chung có chính sách tuổi/bối cảnh và biến thể cụ thể; tránh nhân 6 bản feature giống nhau. |
| Q3 | **A — E0–E3, rules-first** | Phương thức là đặc tính *từng feature/action*, không quyết định một lần cho cả domain. E3 phải có benchmark E0–E2 và ngân sách chặn fan-out. |
| Q4 | **A — giữ 49 groups** | 49 là **baseline có versioning**, không phải định mức bất biến. Gộp/tách chỉ khi đã đối chiếu trùng lặp, quyền dữ liệu, traceability. |
| Q5 | **A — vận hành trong domain liên quan** | Admin F07-G07, content management F07-G01/02, safety ops F07-G05, billing entitlement F01-G06 và billing operations F07-G07; không tạo F09 mặc định. |
| Q6 | **A — metadata bắt buộc** | Không viết sớm acceptance criteria hàng trăm feature; dùng schema gọn và link research, quyền, dữ liệu, cost để tránh tài liệu không thể bảo trì. |

**Phản biện bổ sung:** Yêu cầu 'chi tiết ngang nhau' tạo thêm khối lượng biên tập, kiểm thử và nghiên cứu. Không đồng nhất *coverage của Blueprint* với *coverage của MVP*. Điểm khác biệt về tuổi, năng lực và quan hệ giám hộ phải thể hiện minh bạch; cách tổ chức này giữ khả năng triển khai modular, không khuyến khích xây toàn bộ tính năng ngay.

## 2. Cấu trúc 4 cấp và quy tắc ID

| Cấp | Đối tượng | Ví dụ | Sở hữu |
|---|---|---|---|
| L1 | Feature Domain | `F04` | Ranh giới trách nhiệm sản phẩm |
| L2 | Feature Group | `F04-G02` | Một nhóm hành trình/chức năng |
| L3 | Feature Module/Capability | `F04-G02-M01` | Năng lực tái sử dụng, dữ liệu, chính sách |
| L4 | Individual Feature | `F04-G02-M01-001` | Kết quả/hoạt động cụ thể của người dùng hoặc vận hành |

**Định danh:** ID không đổi sau khi đã phát hành danh mục; đổi tên không đổi ID. Khi chuyển chủ sở hữu module/feature, giữ `legacy_id` và ghi `moved_to`; không tái sử dụng ID đã nghỉ. Group hiện có hai module/feature tiêu biểu để thiết lập baseline đồng mức; những module/feature tiếp theo được đánh số tăng tuần tự. **Không coi một module = một AI agent, một service, một database hay một màn hình.**

**Yêu cầu bắt buộc ở L4:** `id`, `title`, `domain/group/module`, `target_users`, `user_value`, `age_variants`, `autonomy_permissions`, `inputs`, `outputs`, `data_classification`, `dependencies`, `execution_type`, `ai_cost_risk`, `research_refs`, `definition_status`; tùy chọn `event_metrics`, `security_controls`, `release_gate`, `operational_owner`. Chuẩn `definition_status`: `BASELINE_PROPOSED`, `REVIEWED`, `APPROVED`, `DEFERRED`, `RETIRED`.

## 3. Age Coverage Matrix — chi tiết ngang nhau, không đồng nhất hành vi

Để bao phủ từ 0–23 tuổi, inventory áp dụng **6 cohort theo giai đoạn tương tác**. Các mốc là khung nghiên cứu, **không phải chuẩn năng lực hoặc căn cứ xác định quyền theo luật** (`MR-012`, `MR-015`, `MR-016`, `MR-017`).

- **A0:** 0–2 tuổi — người chăm sóc thao tác chính; theo dõi nhu cầu nền tảng, không khuyến khích tương tác trực tiếp với AI.
- **A1:** 3–5 tuổi — người chăm sóc dẫn dắt; hoạt động trực quan, ngắn; trẻ chỉ tham gia với giám sát phù hợp.
- **A2:** 6–10 tuổi — tiểu học giai đoạn đầu; kế hoạch ngắn, thao tác trực quan, hỗ trợ bởi phụ huynh.
- **A3:** 11–14 tuổi — tiểu học cuối/THCS; trẻ tăng chủ động lập kế hoạch, phản hồi và đề xuất.
- **A4:** 15–17 tuổi — THPT; tăng hỗ trợ tự định hướng, tránh giám sát quá mức.
- **A5:** 18–23 tuổi — người dùng trưởng thành tự quyết; người nhà chỉ xem khi được cho phép theo quyền phù hợp.

**Ký hiệu trong ma trận:** `P` = người chăm sóc thực hiện; `S` = cùng sử dụng/giám sát; `C` = trẻ sử dụng tích cực theo quyền được cấp; `Y` = thanh thiếu niên chủ động hơn theo quyền; `U` = người trưởng thành tự chủ; `—` = không thiết kế tương tác trực tiếp, chỉ có luồng thay thế phù hợp. Các mã này mô tả **pattern UX**, không tự cấp quyền pháp lý.

**Nguyên tắc thực thi:** cả sáu cohort được mô tả ở **mọi Group** trong bảng; module/feature có thể có capability chung nhưng có bản trình bày, ngôn ngữ, phương pháp nhập liệu, quyền và ngưỡng an toàn khác nhau. Những khác biệt quan trọng buộc tạo `age_variant` riêng. Đối với trẻ 0–5, Parent-led không chỉ là cách hiển thị nhỏ hơn: cần luồng thực thi do người chăm sóc; với người 18–23, không mặc nhiên cho phụ huynh truy cập. Tránh điều chỉnh dựa *duy nhất* vào ngày sinh.

### 3.1. Ma trận áp dụng 49 Feature Groups × 6 giai đoạn

| Group | 0–2 | 3–5 | 6–10 | 11–14 | 15–17 | 18–23 |
|---|---|---|---|---|---|---|

| `F01-G01` | P | P | S | C | Y | U |
| `F01-G02` | P | P | S | C | Y | U |
| `F01-G03` | P | P | S | C | Y | U |
| `F01-G04` | P | P | S | C | Y | U |
| `F01-G05` | P | P | S | C | Y | U |
| `F01-G06` | P | P | S | C | Y | U |
| `F02-G01` | P | P | S | C | Y | U |
| `F02-G02` | P | P | S | C | Y | U |
| `F02-G03` | P | P | S | C | Y | U |
| `F02-G04` | P | P | S | C | Y | U |
| `F02-G05` | P | P | S | C | Y | U |
| `F02-G06` | P | P | S | C | Y | U |
| `F03-G01` | P | P | S | C | Y | U |
| `F03-G02` | P | P | S | C | Y | U |
| `F03-G03` | P | P | S | C | Y | U |
| `F03-G04` | P | P | S | C | Y | U |
| `F03-G05` | P | P | S | C | Y | U |
| `F03-G06` | P | P | S | C | Y | U |
| `F04-G01` | P | P | S | C | Y | U |
| `F04-G02` | P | P | S | C | Y | U |
| `F04-G03` | P | P | S | C | Y | U |
| `F04-G04` | P | S | C | C | Y | U |
| `F04-G05` | P | S | C | C | Y | U |
| `F04-G06` | P | P | S | C | Y | U |
| `F04-G07` | P | P | S | C | Y | U |
| `F05-G01` | — | S | C | C | Y | U |
| `F05-G02` | P | S | C | C | Y | U |
| `F05-G03` | P | S | C | C | Y | U |
| `F05-G04` | — | S | C | C | Y | U |
| `F05-G05` | — | S | C | C | Y | U |
| `F05-G06` | P | S | C | C | Y | U |
| `F06-G01` | P | P | S | C | Y | U |
| `F06-G02` | P | P | S | C | Y | U |
| `F06-G03` | P | P | S | C | Y | U |
| `F06-G04` | P | P | S | C | Y | U |
| `F06-G05` | P | P | S | C | Y | U |
| `F06-G06` | P | S | C | C | Y | U |
| `F07-G01` | P | P | S | C | Y | U |
| `F07-G02` | P | P | S | C | Y | U |
| `F07-G03` | P | P | S | C | Y | U |
| `F07-G04` | P | P | S | C | Y | U |
| `F07-G05` | P | P | S | C | Y | U |
| `F07-G06` | P | P | S | C | Y | U |
| `F07-G07` | P | P | S | C | Y | U |
| `F08-G01` | P | P | S | C | Y | U |
| `F08-G02` | P | P | S | C | Y | U |
| `F08-G03` | P | P | S | C | Y | U |
| `F08-G04` | P | P | S | C | Y | U |
| `F08-G05` | P | P | S | C | Y | U |

### 3.2. Khác biệt thiết kế bắt buộc của từng giai đoạn

| Cohort | Chủ thể tạo giá trị | Điểm khác biệt về tính năng | Đầu vào cần ưu tiên | Giới hạn AI/UI và đánh giá |
|---|---|---|---|---|
| **0–2** | Cha mẹ/người chăm sóc | Theo dõi mốc phát triển/nhu cầu, hoạt động đồng hành và quan sát; không giao nhiệm vụ cho trẻ tự dùng app | Quan sát của người chăm sóc; dữ liệu bối cảnh phù hợp | Không xây companion đối thoại trực tiếp; không suy chẩn đoán chậm phát triển |
| **3–5** | Cha mẹ + trẻ tham gia có giám sát | Gợi ý chơi/học, thói quen, ghi nhận hoạt động bằng phương tiện dễ hiểu | Phản hồi của người chăm sóc, tương tác ngắn và tự nguyện của trẻ | Không biến check-in thành đánh giá cảm xúc lâm sàng; tránh tăng thời gian màn hình |
| **6–10** | Trẻ đang học tự thực hiện + phụ huynh | Nhiệm vụ nhỏ, hướng dẫn trực quan, khen quá trình, quyền nhờ hỗ trợ | Check-off ngắn, voice/ảnh theo chính sách, lịch học | Trẻ cần hiểu khi nào AI chỉ là gợi ý và ai có quyền duyệt |
| **11–14** | Trẻ + phụ huynh đồng hành | Lập kế hoạch cùng nhau, phản tư, đề xuất điều chỉnh, journal riêng tư | Phản hồi/nhật ký theo đồng ý; dữ liệu nhiệm vụ | Tăng agency và riêng tư, chống lạm dụng giám sát; safety escalation rõ |
| **15–17** | Thanh thiếu niên chủ động + phụ huynh | Định hướng học tập/nghề nghiệp, tự quản, trao đổi mục tiêu có kiểm soát | Nguyện vọng, phản tư, nguồn học tập tự chọn | Tránh dán nhãn tiềm năng, thiên lệch định hướng và truy cập quá mức |
| **18–23** | Người dùng trưởng thành | Tự quản phát triển, mục tiêu, sức khỏe học tập/nghề; gia đình chỉ tham gia khi được cho phép | Dữ liệu do chủ tài khoản kiểm soát | Không giữ cơ chế phụ huynh phê duyệt mặc định; xác thực quyền/chia sẻ và rút consent |

**Ràng buộc phạm vi:** Một feature thể hiện *đủ 6 cohort* trong `age_variants`, nhưng không nhất thiết có 6 UI hay 6 triển khai. Nếu không phù hợp, ghi lý do và luồng thay thế; không để trống. Điều này giữ tính ngang hàng của Blueprint mà không nhân chi phí triển khai một cách máy móc.

## 4. Feature Inventory Baseline — 8 Domains / 49 Groups

Để baseline hữu ích nhưng gọn, **mỗi Group có đúng 2 Module/Capability đại diện, mỗi Module có 1 Individual Feature**. Đây là **98 Module + 98 Feature baseline** làm khung kiểm tra độ bao phủ, **không phải số lượng tính năng cuối hoặc backlog triển khai**. Đặt `BASELINE_PROPOSED` cho tất cả L3/L4 cho đến khi được review riêng.

Các trường `Execution`/`Cost` trong bảng là **ước lượng định tính của feature đại diện**; một module vẫn có thể gồm các tác vụ E0/E1/E2 khác nhau. `MR` liên kết đến **Master Research Backlog**, không sao chép mô tả nghiên cứu.

### F01 — Family & Identity (6 Groups)

| L2 Feature Group | L3 Module 1 → L4 feature | L3 Module 2 → L4 feature | Exec / AI cost | Research refs |
|---|---|---|---|---|
| **`F01-G01`** Account & Authentication | `F01-G01-M01` Account Access → `F01-G01-M01-001` Đăng nhập và khôi phục tài khoản | `F01-G01-M02` Session Security → `F01-G01-M02-001` Quản lý phiên đăng nhập | E0 / Low | `MR-016`, `MR-021` |
| **`F01-G02`** Family & Member Management | `F01-G02-M01` Family Structure → `F01-G02-M01-001` Tạo, kết nối và quản lý hộ gia đình | `F01-G02-M02` Member Relationships → `F01-G02-M02-001` Mời và gỡ thành viên theo quyền | E0 / Low | `MR-017` |
| **`F01-G03`** Child Identity & Basic Profile | `F01-G03-M01` Core Identity → `F01-G03-M01-001` Thiết lập hồ sơ cơ bản theo giai đoạn | `F01-G03-M02` Profile Integrity → `F01-G03-M02-001` Xác minh và sửa thông tin hồ sơ | E0 / Low | `MR-016` |
| **`F01-G04`** Roles, Permissions & Consent | `F01-G04-M01` Access Policy → `F01-G04-M01-001` Phân quyền theo chủ thể và mục đích | `F01-G04-M02` Consent Ledger → `F01-G04-M02-001` Ghi nhận và thu hồi đồng ý | E1 / Low | `MR-016`, `MR-017` |
| **`F01-G05`** Autonomy Mode Management | `F01-G05-M01` Mode State → `F01-G05-M01-001` Thiết lập Parent-led / Child-executed / Child-directed | `F01-G05-M02` Mode Transitions → `F01-G05-M02-001` Đề xuất và phê duyệt chuyển chế độ | E1 / Low | `MR-015`, `MR-017` |
| **`F01-G06`** Account & Data Lifecycle | `F01-G06-M01` Lifecycle Controls → `F01-G06-M01-001` Xuất và yêu cầu xóa tài khoản/dữ liệu | `F01-G06-M02` Entitlements & Billing → `F01-G06-M02-001` Quản lý gói, hóa đơn, quyền lợi theo hộ gia đình | E0 / Low | `MR-003`, `MR-016`, `MR-018` |

### F02 — Child Understanding (6 Groups)

| L2 Feature Group | L3 Module 1 → L4 feature | L3 Module 2 → L4 feature | Exec / AI cost | Research refs |
|---|---|---|---|---|
| **`F02-G01`** Child Information Collection | `F02-G01-M01` Intake & Updates → `F02-G01-M01-001` Thu thập thông tin có xác nhận và nguồn | `F02-G01-M02` Incremental Questions → `F02-G01-M02-001` Hỏi bổ sung theo ngữ cảnh, có thể bỏ qua | E1 / Low | `MR-008`, `MR-010` |
| **`F02-G02`** Interests & Preferences | `F02-G02-M01` Preference Registry → `F02-G02-M01-001` Ghi nhận sở thích theo thời điểm | `F02-G02-M02` Preference Revision → `F02-G02-M02-001` Chỉnh sửa hoặc bác bỏ suy luận sở thích | E1 / Low | `MR-013` |
| **`F02-G03`** Strengths, Needs & Challenges | `F02-G03-M01` Evidence-linked Observations → `F02-G03-M01-001` Ghi nhận thế mạnh và khó khăn theo ngữ cảnh | `F02-G03-M02` Non-labeling Review → `F02-G03-M02-001` Xem lại mức chắc chắn và tránh gán nhãn | E1 / Low | `MR-013`, `MR-014` |
| **`F02-G04`** Contextual Understanding | `F02-G04-M01` Environment Context → `F02-G04-M01-001` Ghi nhận lịch học, gia đình, tài nguyên | `F02-G04-M02` Context Permissions → `F02-G04-M02-001` Kiểm soát nguồn và phạm vi sử dụng bối cảnh | E1 / Low | `MR-021` |
| **`F02-G05`** Child Understanding Profile | `F02-G05-M01` Versioned Profile → `F02-G05-M01-001` Hồ sơ hiểu trẻ theo thời gian | `F02-G05-M02` Child Feedback → `F02-G05-M02-001` Trẻ xem và đề nghị sửa hiểu biết về mình | E1 / Low | `MR-015`, `MR-019` |
| **`F02-G06`** Information Reliability & Review | `F02-G06-M01` Provenance → `F02-G06-M01-001` Phân biệt quan sát, tự báo cáo và suy luận | `F02-G06-M02` Correction & Confidence → `F02-G06-M02-001` Kiểm tra độ tin cậy, sửa thông tin | E1 / Low | `MR-014`, `MR-023` |

### F03 — Development Guidance (6 Groups)

| L2 Feature Group | L3 Module 1 → L4 feature | L3 Module 2 → L4 feature | Exec / AI cost | Research refs |
|---|---|---|---|---|
| **`F03-G01`** Development Framework | `F03-G01-M01` Framework Registry → `F03-G01-M01-001` Quản lý khung phát triển có phiên bản | `F03-G01-M02` Evidence Alignment → `F03-G01-M02-001` Liên kết lĩnh vực với nguồn bằng chứng | E0 / Low | `MR-011` |
| **`F03-G02`** Development Areas & Dimensions | `F03-G02-M01` Dimension Taxonomy → `F03-G02-M01-001` Duy trì danh mục lĩnh vực theo tuổi | `F03-G02-M02` Domain Mapping → `F03-G02-M02-001` Ánh xạ mục tiêu vào lĩnh vực phát triển | E1 / Low | `MR-011`, `MR-012` |
| **`F03-G03`** Age & Stage Guidance | `F03-G03-M01` Stage Catalog → `F03-G03-M01-001` Tra cứu khuyến nghị theo giai đoạn | `F03-G03-M02` Accessibility Adaptation → `F03-G03-M02-001` Điều chỉnh cách trình bày theo năng lực | E1 / Low | `MR-012` |
| **`F03-G04`** Goal Discovery & Definition | `F03-G04-M01` Goal Discovery → `F03-G04-M01-001` Khám phá mục tiêu có sự tham gia của trẻ | `F03-G04-M02` Goal Constraints → `F03-G04-M02-001` Gắn thời hạn, giới hạn và quyền duyệt | E1 / Low | `MR-013`, `MR-015` |
| **`F03-G05`** Personalized Guidance | `F03-G05-M01` Grounded Recommendation → `F03-G05-M01-001` Gợi ý có giải thích và dẫn nguồn | `F03-G05-M02` Recommendation Review → `F03-G05-M02-001` Phụ huynh/người có quyền duyệt gợi ý | E2 / Medium | `MR-011`, `MR-023`, `MR-025` |
| **`F03-G06`** Goal Review & Adjustment | `F03-G06-M01` Goal Reassessment → `F03-G06-M01-001` Kiểm tra độ phù hợp của mục tiêu | `F03-G06-M02` Goal Change Proposal → `F03-G06-M02-001` Đề nghị sửa mục tiêu, không tự phê duyệt | E1 / Low | `MR-014`, `MR-035` |

### F04 — Planning & Execution (7 Groups)

| L2 Feature Group | L3 Module 1 → L4 feature | L3 Module 2 → L4 feature | Exec / AI cost | Research refs |
|---|---|---|---|---|
| **`F04-G01`** Plan Creation & Management | `F04-G01-M01` Plan Structure → `F04-G01-M01-001` Tạo và quản lý kế hoạch gắn mục tiêu | `F04-G01-M02` Plan Templates → `F04-G01-M02-001` Khởi tạo kế hoạch từ mẫu đã duyệt | E1 / Low | `MR-002`, `MR-025` |
| **`F04-G02`** Activity Planning & Scheduling | `F04-G02-M01` Schedule Construction → `F04-G02-M01-001` Lập lịch theo điều kiện gia đình | `F04-G02-M02` Schedule Conflict → `F04-G02-M02-001` Phát hiện xung đột và đề nghị thay thế | E1 / Low | `MR-012`, `MR-025` |
| **`F04-G03`** Task Assignment & Delegation | `F04-G03-M01` Task Ownership → `F04-G03-M01-001` Giao nhiệm vụ theo vai trò | `F04-G03-M02` Approval Routing → `F04-G03-M02-001` Gửi yêu cầu chấp thuận cho đúng người | E1 / Low | `MR-017`, `MR-035` |
| **`F04-G04`** Daily Execution | `F04-G04-M01` Daily Task View → `F04-G04-M01-001` Xem việc cần làm theo ngày | `F04-G04-M02` Execution Support → `F04-G04-M02-001` Hướng dẫn từng bước từ nội dung đã duyệt | E1 / Low | `MR-007`, `MR-012` |
| **`F04-G05`** Progress Reporting | `F04-G05-M01` Lightweight Check-off → `F04-G05-M01-001` Đánh dấu kết quả với thao tác tối giản | `F04-G05-M02` Evidence Submission → `F04-G05-M02-001` Báo cáo khi thật sự cần theo dõi | E0 / Low | `MR-031` |
| **`F04-G06`** Plan Adjustment & Approval | `F04-G06-M01` Change Requests → `F04-G06-M01-001` Đề nghị điều chỉnh khi không phù hợp | `F04-G06-M02` Change History → `F04-G06-M02-001` Lưu lý do, người duyệt và phiên bản kế hoạch | E1 / Low | `MR-035` |
| **`F04-G07`** Reminder & Notification | `F04-G07-M01` Schedule Notifications → `F04-G07-M01-001` Nhắc theo lịch và tùy chọn người dùng | `F04-G07-M02` Notification Preferences → `F04-G07-M02-001` Giới hạn tần suất và thời gian yên tĩnh | E1 / Low | `MR-009`, `MR-020` |

### F05 — Child Companion & Journal (6 Groups)

| L2 Feature Group | L3 Module 1 → L4 feature | L3 Module 2 → L4 feature | Exec / AI cost | Research refs |
|---|---|---|---|---|
| **`F05-G01`** Child AI Companion | `F05-G01-M01` Child Conversation → `F05-G01-M01-001` Hội thoại hỗ trợ học tập/phản tư có giới hạn | `F05-G01-M02` Companion Guardrails → `F05-G01-M02-001` Chặn hành vi lệ thuộc và khẳng định quá mức | E2 / High | `MR-023`, `MR-024` |
| **`F05-G02`** Emotional Check-in | `F05-G02-M01` Opt-in Check-in → `F05-G02-M01-001` Lời mời chia sẻ cảm nhận có thể bỏ qua | `F05-G02-M02` Check-in Controls → `F05-G02-M02-001` Quản lý thời điểm và tần suất xuất hiện | E1 / Medium | `MR-009`, `MR-032` |
| **`F05-G03`** Daily Reflection / Kid Journey | `F05-G03-M01` Reflection Prompts → `F05-G03-M01-001` Gợi mở phản tư nhẹ nhàng | `F05-G03-M02` Reflection Review → `F05-G03-M02-001` Cho phép trẻ xem lại hoặc không lưu | E1 / Medium | `MR-009`, `MR-024` |
| **`F05-G04`** Private Child Journal | `F05-G04-M01` Private Entries → `F05-G04-M01-001` Tạo nhật ký riêng văn bản/giọng nói xử lý tạm | `F05-G04-M02` Journal Retrieval → `F05-G04-M02-001` Tìm và mở lại mục do trẻ chủ động chọn | E2 / High | `MR-018`, `MR-030` |
| **`F05-G05`** Private Insight Management | `F05-G05-M01` Structured Insight → `F05-G05-M01-001` Trích xuất insight có cấu trúc vào hồ sơ riêng | `F05-G05-M02` Insight Correction → `F05-G05-M02-001` Trẻ xem, sửa, phản đối, xóa insight | E2 / High | `MR-019`, `MR-018` |
| **`F05-G06`** Journal Privacy, Sharing & Deletion | `F05-G06-M01` Selective Sharing → `F05-G06-M01-001` Trẻ chia sẻ nội dung theo quyền và ngoại lệ | `F05-G06-M02` Deletion Graph → `F05-G06-M02-001` Xóa mục nhật ký cùng dữ liệu dẫn xuất | E1 / High | `MR-016`, `MR-018`, `MR-022` |

### F06 — Tracking & Insights (6 Groups)

| L2 Feature Group | L3 Module 1 → L4 feature | L3 Module 2 → L4 feature | Exec / AI cost | Research refs |
|---|---|---|---|---|
| **`F06-G01`** Activity Tracking | `F06-G01-M01` Activity Event Log → `F06-G01-M01-001` Ghi nhận sự kiện thực hiện | `F06-G01-M02` Source Metadata → `F06-G01-M02-001` Đánh dấu dữ liệu tự khai và nguồn khác | E0 / Low | `MR-014` |
| **`F06-G02`** Goal Progress Monitoring | `F06-G02-M01` Progress Rules → `F06-G02-M01-001` Tính tiến độ theo mục tiêu | `F06-G02-M02` Progress Exceptions → `F06-G02-M02-001` Giải thích trường hợp thiếu dữ liệu | E1 / Low | `MR-014` |
| **`F06-G03`** Development Indicators | `F06-G03-M01` Indicator Registry → `F06-G03-M01-001` Hiển thị chỉ báo có giới hạn diễn giải | `F06-G03-M02` Indicator Evidence → `F06-G03-M02-001` Gắn điều kiện, nguồn và độ tin cậy | E1 / Medium | `MR-011`, `MR-014` |
| **`F06-G04`** Trend & Pattern Analysis | `F06-G04-M01` Deterministic Trends → `F06-G04-M01-001` Phát hiện thay đổi từ dữ liệu đủ điều kiện | `F06-G04-M02` Cautious Insights → `F06-G04-M02-001` Nêu giả thuyết, không chẩn đoán/gán nhãn | E1 / Medium | `MR-013`, `MR-014` |
| **`F06-G05`** Reports & Dashboards | `F06-G05-M01` Audience Views → `F06-G05-M01-001` Báo cáo theo quyền phụ huynh và trẻ | `F06-G05-M02` Summary Rendering → `F06-G05-M02-001` Tổng hợp dễ hiểu từ dữ liệu được phép | E1 / Low | `MR-014`, `MR-021` |
| **`F06-G06`** Review & Feedback Loop | `F06-G06-M01` Review Sessions → `F06-G06-M01-001` Tổ chức buổi nhìn lại mục tiêu | `F06-G06-M02` Feedback Handoff → `F06-G06-M02-001` Chuyển phản hồi đã chốt sang F02–F04 | E1 / Low | `MR-001`, `MR-014` |

### F07 — Knowledge, Safety & Governance (7 Groups)

| L2 Feature Group | L3 Module 1 → L4 feature | L3 Module 2 → L4 feature | Exec / AI cost | Research refs |
|---|---|---|---|---|
| **`F07-G01`** Knowledge Repository | `F07-G01-M01` Content CMS → `F07-G01-M01-001` Quản trị nguồn, phiên bản, ngôn ngữ | `F07-G01-M02` Structured Retrieval → `F07-G01-M02-001` Tra cứu nội dung có nguồn | E1 / Low | `MR-011`, `MR-025` |
| **`F07-G02`** Knowledge Validation & Evidence | `F07-G02-M01` Editorial Workflow → `F07-G02-M01-001` Thẩm định và phê duyệt kiến thức | `F07-G02-M02` Evidence Provenance → `F07-G02-M02-001` Gắn cấp bằng chứng và ngày xem xét | E1 / Low | `MR-011`, `MR-023` |
| **`F07-G03`** AI Interaction & Orchestration | `F07-G03-M01` Single Interface Router → `F07-G03-M01-001` Điều phối giao diện AI đến chức năng được phép | `F07-G03-M02` Execution Budget → `F07-G03-M02-001` Áp ngân sách và số model call tối đa | E1 / Medium | `MR-025`, `MR-028` |
| **`F07-G04`** AI Quality & Behavior Governance | `F07-G04-M01` Policy Evaluation → `F07-G04-M01-001` Kiểm tra phạm vi L1/L2/L3 và an toàn | `F07-G04-M02` Model Evaluation → `F07-G04-M02-001` Kiểm thử chất lượng tiếng Việt theo tác vụ | E1 / Medium | `MR-023`, `MR-026` |
| **`F07-G05`** Child Safety & Escalation | `F07-G05-M01` Safety Triage → `F07-G05-M01-001` Phân loại tín hiệu cần đánh giá an toàn | `F07-G05-M02` Human Response Workflow → `F07-G05-M02-001` Chuyển sự việc cho quy trình hỗ trợ phù hợp | E1 / High | `MR-022`, `MR-024` |
| **`F07-G06`** Privacy & Data Governance | `F07-G06-M01` Purpose-bound Access → `F07-G06-M01-001` Kiểm soát truy cập theo mục đích | `F07-G06-M02` Retention & Export → `F07-G06-M02-001` Thi hành retention, xuất dữ liệu, xóa theo quyền | E1 / High | `MR-016`, `MR-018`, `MR-021` |
| **`F07-G07`** Audit & Operational Controls | `F07-G07-M01` Operational Console → `F07-G07-M01-001` Bảng điều khiển vận hành/an toàn theo vai trò | `F07-G07-M02` Billing & Cost Operations → `F07-G07-M02-001` Giám sát quota, thanh toán, AI cost, lỗi | E1 / Medium | `MR-003`, `MR-027`, `MR-029` |

### F08 — Extended Ecosystem (5 Groups)

| L2 Feature Group | L3 Module 1 → L4 feature | L3 Module 2 → L4 feature | Exec / AI cost | Research refs |
|---|---|---|---|---|
| **`F08-G01`** School & Education Integration | `F08-G01-M01` School Data Connectors → `F08-G01-M01-001` Kết nối lịch học/điểm danh khi được phép | `F08-G01-M02` School Data Review → `F08-G01-M02-001` Kiểm tra nguồn và quyền thu hồi | E1 / Medium | `MR-033` |
| **`F08-G02`** Expert & Professional Services | `F08-G02-M01` Expert Discovery → `F08-G02-M01-001` Tìm nguồn chuyên gia được xác minh | `F08-G02-M02` Expert Referral → `F08-G02-M02-001` Chuyển giao có đồng ý và phạm vi rõ | E1 / Medium | `MR-022`, `MR-033` |
| **`F08-G03`** Learning Resources & Activities | `F08-G03-M01` Activity Directory → `F08-G03-M01-001` Danh mục hoạt động/địa điểm theo độ tuổi | `F08-G03-M02` Resource Matching → `F08-G03-M02-001` Lọc theo mục tiêu, địa phương và điều kiện | E1 / Low | `MR-012`, `MR-033` |
| **`F08-G04`** Device & External Data Integration | `F08-G04-M01` Device Consents → `F08-G04-M01-001` Liên kết/thu hồi nguồn thiết bị bên ngoài | `F08-G04-M02` External Data Import → `F08-G04-M02-001` Nhập và gắn mức tin cậy dữ liệu | E1 / Medium | `MR-021`, `MR-033` |
| **`F08-G05`** Commercial Ecosystem | `F08-G05-M01` Commerce Catalog → `F08-G05-M01-001` Danh mục dịch vụ có nhãn quảng cáo | `F08-G05-M02` Transaction & Conflict Controls → `F08-G05-M02-001` Kiểm soát giao dịch và lợi ích xung đột | E1 / Medium | `MR-003`, `MR-034` |

## 5. Ranh giới quyền dữ liệu và ownership

| Dữ liệu / nghiệp vụ | Domain sở hữu | Quyền đọc/ghi và ràng buộc |
|---|---|---|
| Identity, quan hệ gia đình, consent, autonomy | F01 | Không dùng F01 làm kho tất cả dữ liệu của trẻ; cưỡng chế quyền tại backend |
| Hồ sơ hiểu trẻ có phiên bản | F02 | Không tự truy xuất Journal gốc; insight riêng chỉ khi mục đích/consent cho phép |
| Framework, lĩnh vực, mục tiêu phát triển | F03 | Nội dung dựa nguồn F07; quyết định thay mục tiêu phải có người có thẩm quyền |
| Kế hoạch, nhiệm vụ, trạng thái thực thi | F04 | Quyền phê duyệt theo F01; nhận đề xuất từ F03/F06, không tự suy ra quyền |
| Companion session & Journal gốc | F05 | Dữ liệu Journal và dữ liệu Companion cần tách mục đích, retention, chia sẻ; no implicit parent access |
| Insight riêng từ Journal | F05 (lưu tại phạm vi riêng của trẻ) | Quyết định đã chốt: có thể trích insight có cấu trúc; **không mặc định** đưa vào hồ sơ gia đình; không lưu bản tường thuật AI lâu dài; xóa liên đới nguồn (`MR-018`,`MR-019`) |
| Activity events, indicators, reports | F06 | Phân biệt quan sát, self-report, AI inference; chỉ tổng hợp dữ liệu được phép |
| Knowledge, policies, audit, safety workflow | F07 | Chuyên trách chính sách; không sở hữu thay nghiệp vụ mọi domain |
| External integrations & commerce catalog | F08 | Dữ liệu bên thứ ba cần provenance, quyền thu hồi và tránh xung đột lợi ích |

**Journal quyết định đã giữ nguyên:** không mặc định tự nhắc sự kiện từ Journal trong phiên tương lai; nội dung chỉ được dùng khi trẻ chủ động mở lại trừ quy trình an toàn được thẩm định; chính sách xóa 60 ngày đã chốt ở mức sản phẩm nhưng phải kiểm chứng tính hợp pháp và khả thi với bản sao lưu/insight. Quy trình an toàn không được biến thành cớ cho việc chia sẻ vô hạn.

**Thỏa thuận tác nghiệp giữa domain:** sự kiện `plan_approved`, `task_completed`, `feedback_submitted`, `consent_revoked`, `journal_entry_delete_requested`, `safety_triage_required` được xem như *ví dụ event contract*, chưa phải API đã chốt. Bất kỳ thực thi nào có ảnh hưởng đến dữ liệu nhạy cảm đều cần authorization trước khi truy xuất, không chỉ trước khi trả lời UI.

## 6. Execution type và chính sách kiểm soát AI cost

| Loại | Định nghĩa | Ví dụ | Điều kiện |
|---|---|---|---|
| **E0** | Static/CRUD/DB read/write | Lưu tick nhiệm vụ, hiển thị hồ sơ | Không gọi model |
| **E1** | Rules, scheduler, SQL, search, approved templates | Lịch, tiến độ, nội dung theo tuổi, quota | Không gọi LLM; rule kiểm chứng được |
| **E2** | AI theo yêu cầu, có kiểm soát | Tổng hợp vấn đề phức tạp, giải thích cá nhân hóa, hội thoại | Chỉ khi hữu ích vượt E0/E1; kiểm tra quyền và budget |
| **E3** | AI workflow đa bước | Nghiên cứu/đối chiếu kế hoạch có giám sát | **Không mặc định dùng sub-agent**; phải chứng minh E2 không đủ |

**E2/E3 bắt buộc khi chuyển sang triển khai:** `model_calls_max`, `token_budget`, `estimated_cost_per_success`, `p50/p95_latency`, `quota_policy`, `cache_eligibility`, `fallback_mode`, `safety_gate`, `privacy_scope`, `evaluation_suite`. Chưa chốt con số vì phụ thuộc benchmark thực tế (`MR-025`–`MR-029`).

**Định hướng ưu tiên thực thi:** Modular Monolith là **giả thuyết kỹ thuật**, chưa chốt stack; UI có thể gọi một AI interface nhưng backend thường dùng E0/E1; event-driven chỉ cho công việc có ích; sinh báo cáo AI theo yêu cầu hoặc batch có chọn lọc, không tự tổng hợp bằng LLM sau mọi hành động. Cache không được làm lộ dữ liệu riêng giữa gia đình hoặc độ tuổi. Rate limits và quota không được vô hiệu hóa các chức năng an toàn thiết yếu.

### 6.1. Cost risk

- **Low:** không bắt buộc inference LLM, chi phí phần lớn từ storage/compute cơ bản; vẫn cần tối ưu.
- **Medium:** có thể phát sinh request LLM hoặc khối lượng tích hợp/xử lý nặng, cần benchmark và hạn mức.
- **High:** hội thoại mở, multimedia, Journal insight, hoặc luồng an toàn đòi hỏi nhiều kiểm soát; cần quality/safety benchmark, kiểm soát spend và privacy.

Đánh giá trên không đại diện **tổng chi phí sản phẩm**. Cloud storage, logging, notification, thanh toán, kiểm duyệt người thật và hạ tầng vẫn phải được ước lượng độc lập. Không lấy 49 Group × số người dùng để tính chi phí AI vì nhiều Group không phát sinh inference.

## 7. Cross-functional / Internal Operations mapping (không tạo domain thứ 9)

| Vận hành | Vị trí | Ghi chú |
|---|---|---|
| Family subscription, invoices, entitlements | `F01-G06-M02` | Chủ sở hữu dịch vụ/gói; tránh đưa dữ liệu thanh toán nhạy cảm không cần thiết vào hồ sơ trẻ |
| Content CMS, evidence approval | `F07-G01-M01`, `F07-G02-M01` | Soạn-thẩm định-phát hành-tái kiểm định nguồn nội dung |
| Safety Operations, incident processing | `F07-G05-M02`, `F07-G07-M01` | Phân quyền nhân sự, kiểm tra quy trình, hạn lưu sự cố |
| Admin Console / audit / anomaly reviews | `F07-G07-M01` | Không có admin quyền vô hạn mặc định đối với Journal |
| Quota and inference cost reporting | `F07-G07-M02` | Cost theo family/cohort/feature, p95 và heavy users |
| Third-party marketplace integrity | `F08-G05-M02` | Minh bạch quảng cáo và xung đột lợi ích |

## 8. Schema mẫu cho Individual Feature

```yaml
id: F04-G02-M02-001
title: Phát hiện xung đột và đề nghị thay thế
parent_module: F04-G02-M02
status: BASELINE_PROPOSED
target_users: [parent, child]
user_value: Giảm công điều chỉnh lịch và tránh nhiệm vụ chồng chéo
age_variants:
  A0: caregiver_only
  A1: caregiver_only
  A2: child_supervised
  A3: child_active
  A4: youth_active
  A5: independent_adult
autonomy_permissions:
  parent_led: parent_approves
  child_executed: child_suggests_parent_approves
  child_directed: child_may_adjust_within_authorized_scope
  adult: account_owner_controls
inputs: [approved_plan, calendar_slots, user_constraints]
outputs: [conflict_list, alternatives, change_request]
data_classification: family_planning
owner_domain: F04
dependencies: [F01-G04, F04-G01, F04-G06]
execution_type: E1
ai_cost_risk: Low
research_refs: [MR-012, MR-025, MR-035]
release_gates: [permission_review, usability_validation]
```

*Lưu ý:* Ví dụ chỉ để thống nhất schema; quyền chi tiết, đặc biệt `child_directed`, phải qua ma trận quyền và pháp lý; không diễn giải đây là quyền thực thi đã chốt.

## 9. Acceptance & coverage checklist cho 3.2

- [x] Có đủ 8 Domain / 49 Group ở mức baseline.
- [x] Có cấu trúc 4 cấp và quy tắc ID ổn định.
- [x] Có 2 module + 2 feature đại diện trên mỗi Group để kiểm soát độ bao phủ, không tự nhận là inventory exhaustive ở L4.
- [x] Có ma trận 6 cohort cho toàn bộ 49 Group, cộng guideline đặc thù từng giai đoạn.
- [x] Có quy tắc quyền/nguồn dữ liệu/Journal không trộn với hồ sơ cha mẹ.
- [x] Có phân loại execution E0–E3 và rủi ro chi phí.
- [x] Có vị trí Admin, Content, Safety Operations, Billing.
- [x] Có schema metadata, mapping và Research refs.
- [ ] Chưa xác thực mọi user story, feature variant, UI, acceptance criteria và pháp lý — **không thuộc kết quả đã được chốt của 3.2**.
- [ ] Chưa chọn MVP, release scope, đội ngũ, mức ngân sách hoặc nhà cung cấp AI.

## 10. Tham chiếu Master Research Backlog & vấn đề mới

File duy nhất: `Product_Blueprint_Master_Research_Backlog.md`. Các nhóm chủ yếu liên quan: `MR-001`–`MR-010` (giá trị/UX), `MR-011`–`MR-015` (phát triển theo tuổi), `MR-016`–`MR-024` (pháp lý, privacy, safety), `MR-025`–`MR-030` (AI/cost), `MR-031`–`MR-036` (reporting, ecosystem và research methods).

**Đề xuất bổ sung vào Master (không tách backlog):**
- `MR-037`: tiêu chí accessibility, khác biệt năng lực/ngôn ngữ/người khuyết tật khi thiết kế ngang độ sâu cho 0–23; so sánh nhiều cấp học và bối cảnh.
- `MR-038`: tính khả thi và tổng chi phí bảo trì/kiểm thử age variants trên các Group; phương pháp reuse capabilites thay vì nhân bản tính năng.

Các mục này là câu hỏi phải kiểm chứng, **không phải kết quả nghiên cứu**. Nếu nghiên cứu sau cho thấy khác biệt lớn, cập nhật ma trận hoặc tách/gộp Group có migration log, không tùy tiện đổi ID.

## 11. Kết luận và trạng thái chuyển tiếp

**3.2 đã được chốt về phương pháp và phạm vi theo Q1–Q6.** Inventory này là khung baseline rộng để tiếp tục phân tích, không phải yêu cầu phát triển đồng loạt 0–23 tuổi. Domain/Group/Module/Feature là cây phân loại năng lực; AI là phương tiện thực hiện được cân nhắc theo giá trị và ngân sách. Mọi thứ chưa kiểm chứng giữ nhãn đề xuất.

**Dừng tại 3.2. Không tự động chuyển 3.3.**
