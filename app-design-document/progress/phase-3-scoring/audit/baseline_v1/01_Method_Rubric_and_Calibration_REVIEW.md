# 01 — Phương pháp, rubric và hiệu chuẩn (3.3 scoring)

**Trạng thái:** `REVIEW / RUBRIC R1.1 / NOT_APPROVED` · **Người soạn:** AI (Claude), chưa kiểm chứng độc lập · **Ngày:** 14/11/2026
**Nguồn:** HEAD `9043c88`; phương pháp 3.3 đã duyệt Q1–Q6 (`Product_Blueprint_03_3_Feature_Prioritization_and_Dependency_Mapping.md`); chỉ đạo trọng tâm của Owner ngày 14/11/2026 (prompt v2 §0.4). Chi tiết nguồn: `00_Source_Authority_Manifest.md`.

## 1. Cấu trúc ba lớp (giữ nguyên 3.3 Q3)

**Hard Gates → Value Assessment → Delivery Economics.**
- Gate không bao giờ được bù bằng điểm Value.
- Không có điểm tổng hợp. Không xếp hạng MVP bằng một con số.
- Mọi bản ghi giữ `mvp_decision = NOT_DECIDED`.

## 2. Phễu đánh giá

| Tầng | Phạm vi | Mức đánh giá |
|---|---|---|
| Tier-1 (CP-02) | Cả 106 L3 | `COARSE`: tier, vai trò, bước vòng lặp, E0–E3, mức chi phí L/M/H, 4 gate, 6 cohort (áp dụng hay không), mức độ dữ liệu nhạy cảm |
| Tier-3 (CP-04) | Module mà ít nhất một workflow giả thuyết cần, cộng các module "lưng chừng" | `FULL`: đủ khóa 3.3, cohort A2/A3 đầy đủ, A1/A4 kế thừa kèm khác biệt, A0/A5 khi liên quan |

**Quy tắc cho quay lại:** module chỉ có Tier-1 được đưa lên Tier-3 khi có một trong các điều sau:
- một module Tier-3 phụ thuộc HARD vào nó;
- đường an toàn hoặc phân quyền cần đến nó;
- phân tích độ nhạy (CP-05) cho thấy nó có thể làm đổi một ứng viên.

## 3. Tier (chỉ đạo của Owner, không phải quyết định MVP)

| Tier | Nghĩa | Cách chấm |
|---|---|---|
| `CORE_VALUE` | Đồng hành, lập lịch/nhắc việc, báo cáo, hỗ trợ trẻ thực hiện | FULL |
| `MIN_FOUNDATION` | Tài khoản, liên kết con (PIN FR-01), phân quyền, đồng ý, chế độ, riêng tư/xóa, lớp an toàn AI | FULL, chấm theo "bản đơn giản nhất mà vẫn an toàn" |
| `ADV_SECURITY_OPS` | Bảo mật/vận hành nâng cao | COARSE + đề xuất đơn giản hóa |
| `DEFERRED` | Thanh toán, thương mại, tích hợp, phản hồi bởi người, mở rộng | COARSE + lý do hoãn |

## 4. Hard Gates (Layer 1): quy tắc xác định

Giá trị hợp lệ: `PASS / CONDITIONAL / BLOCKED / UNKNOWN`. Không gate nào được chấm PASS trong lượt này, vì chưa có bằng chứng và chưa có xác nhận của người có thẩm quyền.

| Gate | Quy tắc áp dụng (script `tools/build_tier1.py`) |
|---|---|
| G-Legal | `BLOCKED`:<br>• module xóa/lưu giữ (H4): F01-G06-M01, F05-G06-M02, F07-G06-M02;<br>• module xử lý yêu cầu của trẻ khi chưa có cơ sở pháp lý (FR-03): F05-G01-M01, F05-G01-M02, F07-G05-M01;<br>• module Nhật ký (dữ liệu chịu H4).<br>`UNKNOWN`: các module còn lại. Riêng module không có dữ liệu cá nhân thì ghi rõ mức phơi nhiễm thấp. |
| G-Privacy | `UNKNOWN` cho cả 106 module, vì chưa làm PIA (MR-021). Ghi mức phơi nhiễm: NONE / PERSONAL / CHILD / JOURNAL. |
| G-Safety | `CONDITIONAL` cho 10 module AI có đầu ra tới trẻ hoặc phụ huynh. Điều kiện: bằng chứng phạm vi OD-05, nội dung tĩnh OD-03 đã duyệt, đánh giá an toàn AI tiếng Việt (MR-023).<br>`UNKNOWN`: các module còn lại. |
| G-Feasibility | `CONDITIONAL` cho 5 module đã có bằng chứng kỹ thuật một phần (nhật ký test thiết bị Plan A, prototype).<br>`UNKNOWN`: các module còn lại. |

**Dữ liệu thật của trẻ:** bị chặn với mọi module có G-Legal khác PASS. Dữ liệu giả lập được phép.

## 5. Value (Layer 2): khóa 3.3 và anchor R1.1

Mọi điểm là `EXPERT_HYPOTHESIS`, độ tin cậy `HYPOTHESIS`. Đặc tả L4 chứng minh được độ phức tạp và phụ thuộc, nhưng **không** chứng minh được lợi ích cho người dùng.

**Theo cohort** (`parent_value`, `child_value`, `adult_user_value`):

| Điểm | Anchor |
|---|---|
| 1 | Người hưởng lợi theo thiết kế, nhưng tác động gần như không đáng kể |
| 2 | Tiện ích nhỏ, thỉnh thoảng |
| 3 | Giúp rõ rệt cho một việc cụ thể hằng tuần (với trẻ: hỗ trợ một việc cụ thể, đúng mức tự chủ) |
| 4 | Gỡ một gánh nặng lặp lại hoặc cải thiện một quyết định quan trọng (với trẻ: tăng rõ năng lực tự thực hiện, tự chủ hoặc cảm giác được ghi nhận) |
| 5 | Là lý do chính để dùng app hằng ngày hoặc hằng tuần |
| `INDIRECT` | Không phải người hưởng lợi trực tiếp theo thiết kế (hạ tầng, hoặc vai trò bị loại trừ có chủ đích, ví dụ phụ huynh với Nhật ký). Không quy ra số, không lấy trung bình |
| `N/A` | Cohort không áp dụng; có lý do |
| `UNKNOWN` | Chưa đủ căn cứ |

**Theo module:**

| Khóa | 1 | 3 | 5 |
|---|---|---|---|
| `core_loop_contribution` | Không đóng góp | Hỗ trợ một bước | Thiếu nó thì vòng lặp không khép được |
| `adoption_potential` | Khó được dùng đúng cách | Dùng định kỳ, có ma sát | Thói quen hằng ngày, ma sát thấp |
| `differentiation` | Ứng dụng nào cũng có | Khác biệt ở cách kết hợp | Đề xuất giá trị riêng |
| `dependency_enablement` | Không mở khóa gì | Mở khóa một module lõi | Nền cho phần lớn vòng lặp |

- `adoption_potential` được đo theo khả năng người dùng hoàn thành hoặc dùng đúng cách ở tần suất tự nhiên của tính năng, không theo tần suất thô. Module chạy ngầm ghi `N/A`.
- `dependency_enablement` dựa trên đồ thị CP-03 (số module Tier-3 phụ thuộc HARD), nhưng **không** quy đổi máy móc từ số cạnh.
- Không cộng, không đặt trọng số. Giá trị cho phụ huynh và cho trẻ hiển thị riêng, không bù trừ cho nhau.

## 6. Delivery Economics (Layer 3)

| Khóa | Thang | Anchor |
|---|---|---|
| `implementation_effort` | 1–5 tương đối, **không phải ngày công** | 1 CRUD/cấu hình; 3 tính năng có trạng thái/phiên bản; 5 xuyên suốt nhiều module, có đánh giá ML hoặc đồng bộ phức tạp |
| `maintenance_effort` | 1–5 | 1 ổn định; 3 cập nhật quy tắc/nội dung định kỳ; 5 liên tục cập nhật nội dung, đánh giá, biến thể theo tuổi |
| `operating_cost` (không tính AI) | L/M/H | L chỉ DB cơ bản; M có thông báo, media, job nền; H lưu trữ hoặc vận hành nặng |
| `ai_cost_risk` | L/M/H | L không gọi model; M có số lần gọi giới hạn mỗi hành động; H hội thoại mở, đa phương thức, fan-out |
| `latency_and_reliability` (rủi ro) | L/M/H | L chịu được trễ; M trễ làm giảm trải nghiệm; H trễ là hỏng kết quả (nhắc trễ giờ, thông điệp an toàn đến muộn) |
| `implementation_complexity` | 1–5 | Mức phụ thuộc chéo, tích hợp ngoài, dữ liệu nhạy cảm |
| `scalability` (rủi ro) | L/M/H | L gần như phẳng; M tăng tuyến tính; H tăng siêu tuyến tính hoặc dồn vào người dùng nặng |
| `safety_compliance_overhead` (cột bổ sung) | L/M/H | Công an toàn, pháp lý, kiểm duyệt nội dung |

Không có con số chi phí đo được. Kịch bản USD/VND chỉ làm cho module E2/E3 (CP-05), dựa trên giả định được ghi rõ.

## 7. Cohort (Q4: đủ 6 bản ghi mỗi module)

- **A2, A3:** đánh giá độc lập đầy đủ (trọng tâm CORE lớp 1–9).
- **A1, A4:** kế thừa từ cohort gần nhất, ghi rõ khác biệt (cách tương tác, mức tự chủ, an toàn, giá trị).
- **A0, A5:** chỉ đánh giá khi liên quan (A0 qua người chăm sóc; A5 người trưởng thành tự quản đã xác minh). Không liên quan thì ghi `N/A` kèm lý do.
- Không suy giá trị cho trẻ từ giá trị cho người lớn, và ngược lại.

## 8. Hiệu chuẩn (CP-02): R1.0 → R1.1

Mẫu 8 module, cố ý trộn nhiều loại:
- F01-G02-M01: định danh;
- F04-G02-M01: lập lịch;
- F04-G04-M01: lõi phía trẻ;
- F05-G01-M01: hội thoại AI;
- F05-G04-M01: Nhật ký;
- F06-G05-M02: báo cáo phía phụ huynh;
- F07-G01-M02: tri thức;
- F08-G05-M01: thương mại (bị hoãn).

Điểm R1.0 lưu ở `tools/calibration_r10.py`.

| Mã | Vấn đề phát hiện | Thay đổi trong R1.1 |
|---|---|---|
| CAL-01 | Module nền tảng bị chấm 1–2 cho giá trị phụ huynh/trẻ chỉ vì không có giao diện, tức bị phạt vì giá trị gián tiếp | Thêm nhãn `INDIRECT`; giá trị của module nền thể hiện qua `dependency_enablement` và đóng góp cho workflow |
| CAL-02 | `adoption_potential` bị chấm theo tần suất thô (F07-G01-M02 = 1, F01-G02-M01 = 2) | Đo theo khả năng dùng đúng cách ở tần suất tự nhiên; module chạy ngầm ghi `N/A`; module thiết lập chấm theo khả năng hoàn thành |
| CAL-03 | Chấm 1 cho người dùng không phải đối tượng theo thiết kế (trẻ với báo cáo phụ huynh; phụ huynh với Nhật ký) | Ghi `INDIRECT` hoặc `N/A` kèm lý do; điểm 1–5 chỉ dành cho người hưởng lợi theo thiết kế |
| CAL-04 | `core_loop` và `dependency_enablement` đếm trùng một lý do | Tách nghĩa: `core_loop` là đóng góp của chính module cho một bước; `enablement` lấy từ đồ thị và chỉ chốt sau CP-03 |
| CAL-05 | Độ phức tạp của hội thoại so với lập lịch | Diễn giải nhất quán, không đổi |
| CAL-06 | Chấm đầy đủ cho module bị hoãn, tạo độ chính xác giả | Module DEFERRED giữ COARSE trừ khi quy tắc quay lại kích hoạt |
| CAL-07 | `latency_and_reliability` lúc được hiểu là hiệu năng, lúc là đúng giờ | Anchor mới: rủi ro trễ hoặc gián đoạn làm hỏng kết quả cho người dùng |

**Giới hạn còn lại (MR-039):**
- Chỉ một người chấm (AI). Không có hội đồng chuyên gia.
- Lượt QA độc lập bằng 1 subagent ở CP-04 chỉ kiểm độ nhất quán diễn giải. Nó không phải hiệu chuẩn với người dùng thật.
