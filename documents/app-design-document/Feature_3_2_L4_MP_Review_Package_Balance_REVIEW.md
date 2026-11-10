# PARENT-PAL — Review Package: Balanced Planning Validation

**L3:** `F04-G02-M03` · **Ngày:** 2026-11-10 · **Trạng thái:** `MULTI_PASS_DESK_TRIAL / OWNER_REVIEW`  
**Nguồn yêu cầu gốc:** 3.2 F04-G02-M01/M02/M03, F03-G04, F04-G01/G06, L3C-06; 3.4 UC-007/008/010; SC-001; MR-012/025/035; owner input reference standards + family Standard Bar.

**Lưu ý về bằng chứng:** Các test MP- là **bộ test thiết kế mới từ yêu cầu gốc**, độc lập về *cách chọn yêu cầu* so với bộ TC-L4- trước đó; **không** do sub-agent/model độc lập chạy. Tất cả `execution_status=NOT_EXECUTED`. Đây là Given/When/Then ở mức đặc tả, không có kết quả thực nghiệm.

## 1. Owner Review — Đọc phần này trước

Bạn nên đọc C01, C05, C06, C09 và C12: cách ứng dụng gợi ý chuẩn nghiên cứu, cho gia đình đặt chuẩn riêng, xử lý ngoại lệ và hết hạn. Những con số giả lập không phải ngưỡng khoa học.

**Kết luận đề xuất:** **2 L4 trọng tâm đề xuất**: validate balance và validate exception lifecycle (bao gồm expiry). Không tự thực hiện approval hoặc thay đổi plan.

## 2. QA-first: Test case và expected output

| Test | Input / Given + When | Expected output / Then | Outcome trace | Nguồn |
|---|---|---|---|---|
| `MP-C01` | Gia đình có BAR-1 giả lập 60 phút chơi, lịch chỉ có 30 phút | Cảnh báo thiếu 30 phút so với **BAR-1 do gia đình đặt**, không gọi đây là chuẩn y tế | `BALANCE` | SC-001; L3C-06 |
| `MP-C02` | English 17:00–18:00, Piano 17:30–18:30 | Union occupied time = 90 phút; tổng duration = 120 phút; overlap = 30 phút; xung đột slot thuộc F04-G02-M02 | `BALANCE` | F04-G02-M02/M03; UC-010 |
| `MP-C03` | Hoạt động 17:00–18:00 được gắn hai nhãn học và phát triển kỹ năng | Không nhân đôi duration khi tổng hợp theo thời gian; vẫn giữ hai nhãn | `BALANCE` | SC-001 |
| `MP-C04` | Gia đình chưa cấu hình Standard Bar và chưa có nguồn chuẩn tham chiếu được duyệt | UNKNOWN/NEEDS_INPUT; không tự đặt ngưỡng chơi/ngủ/học | `BALANCE` | MR-012; owner input |
| `MP-C05` | Có nghiên cứu chuẩn giấc ngủ theo nhóm tuổi với provenance, ngày cập nhật và phạm vi áp dụng | Gợi ý chuẩn tham chiếu phù hợp; nêu nguồn, phạm vi và giới hạn; không tự biến thành hard rule | `BALANCE` | Owner input: reference standards |
| `MP-C06` | Gia đình đặt Standard Bar cao hơn tham chiếu được khuyến nghị, chưa vi phạm hard rule xác minh | Cho phép cấu hình kèm cảnh báo/đánh đổi; không âm thầm đổi mục tiêu hoặc lịch | `BALANCE` | SC-001; L3C-06 |
| `MP-C07` | Gia đình đặt rule xung đột một hard constraint đã được xác minh bắt buộc | Không cho bypass bằng soft preference; trả conflict và kênh review có quyền | `BALANCE` | L3C-06; MR-035 |
| `MP-C08` | Một trẻ tự đề xuất lịch vượt phạm vi tự chủ đã được cấp | Chỉ tạo đề xuất được phép; không tự ghi plan baseline hoặc auto-approve | `BALANCE` | UC-007/008; MR-035 |
| `MP-C09` | P1 đề xuất ngoại lệ ôn thi 12/11–12/12 có lý do và người duyệt | Trả NEEDS_APPROVAL và affected constraints; không tự đổi lịch hay Standard Bar | `EXCEPTION` | SC-001; UC-008 |
| `MP-C10` | Đề xuất bỏ giới hạn chơi vĩnh viễn không có ngày kết thúc | Không tạo ngoại lệ vô thời hạn theo policy thử nghiệm; yêu cầu end date/review | `EXCEPTION` | SC-001; MR-035 |
| `MP-C11` | Ngoại lệ muốn vượt một hard rule đã được xác minh | Từ chối hoặc escalation; không dùng approval thông thường để vượt hard rule | `EXCEPTION` | MR-035 |
| `MP-C12` | Ngoại lệ đã duyệt hết hạn, job chạy 3 lần | Trạng thái hiệu lực EXPIRED được suy ra/ghi tại owner phù hợp, chỉ một yêu cầu review; không tự sửa lịch | `EXCEPTION` | L3C-06; UC-010 |
| `MP-C13` | Ngoại lệ hết hạn nhưng lịch hoặc Standard Bar đã thay đổi version | Không ghi đè lịch; re-evaluate theo version hiện hành, yêu cầu quyết định có quyền | `EXCEPTION` | UC-010; MR-035 |
| `MP-C14` | Ngoại lệ bị hủy trước ngày hết hạn nhưng job hết hạn vẫn chạy | Không phục hồi/commit trùng; kết quả lifecycle nhất quán theo version | `EXCEPTION` | L3C-06 |
| `MP-C15` | A19 tự quản kế hoạch không chia sẻ với phụ huynh | Không mặc định gửi approval cho phụ huynh; policy theo jurisdiction/actor/purpose | `BALANCE` | A5; MR-016/017 |
| `MP-C16` | Lịch lớp 3 07:30–16:15 và đề xuất thêm học tối nhưng thiếu thông tin giấc ngủ/sức khỏe | Nêu dữ liệu thiếu và mức không chắc chắn; không chẩn đoán hay khẳng định lịch tối ưu | `BALANCE` | SC-001; MR-012 |
| `MP-C17` | Một hoạt động lặp theo tuần qua thay đổi múi giờ/ngoại lệ ngày nghỉ | Chuẩn hóa instance/timezone trước khi tính, không tính trùng lịch sai | `BALANCE` | F04-G02-M02/M03 |

**Số test thiết kế mới:** 17. Không cộng với 43 test gốc thành số test đã chạy. Test được xây dựng để phủ outcome, negative cases, role/permission, trạng thái và ranh giới giữa L3.

## 3. Architect: Kết quả L4 sau rà soát

| Outcome | Hợp đồng / ranh giới | Disposition đề xuất | Candidate hiện có |
|---|---|---|---|
| `BALANCE` | Kiểm tra mức phù hợp của lịch với hard/soft constraints và family bar, không tự sửa lịch | `KEEP` | `CAND-F04-G02-M03-validate-balance` |
| `EXCEPTION` | Đánh giá ngoại lệ có hạn, kiểm lại hiệu lực khi hết hạn và tạo yêu cầu điều chỉnh, không tự duyệt/commit | `KEEP + MERGE EXPIRY` | `CAND-F04-G02-M03-evaluate-exception` |
| `EXPIRY` | Hết hạn là trigger của vòng đời ngoại lệ, không nhất thiết là outcome L4 độc lập | `MERGE` | `CAND-F04-G02-M03-expiry-recheck` |

**Quy tắc:** Các outcome ở trên chỉ là ứng viên. Nếu outcome không có vòng đời/giá trị độc lập thì không cấp L4 ID. Giữ các test cho hành vi gộp/hoãn/chuyển owner.

## 4. Adversarial review: Vấn đề và đề xuất

| # | Nhóm | Counterexample / lỗ hổng | Đề xuất |
|---|---|---|---|
| 1 | DESIGN | C02 phân biệt occupied time 90 phút, sum durations 120 phút và effort load không thể suy trực tiếp. | Tự sửa contract, kiểm tính toán; giao conflict detection cho F04-G02-M02. |
| 2 | OWNER | Standard Bar có thể là mục tiêu phát triển F03, family preference F04 hoặc safety hard policy F07. | Đề xuất phân loại: goal F03, family planning bar F04, protected constraints theo governance; chờ owner phê duyệt phân loại. |
| 3 | RESEARCH | Chuẩn giấc ngủ/vui chơi/vận động theo tuổi không thể bịa; nguồn nghiên cứu phải có hiệu lực và phạm vi. | Tạo registry có provenance và version; chuyên gia đánh giá nguồn trước khi đưa vào app. |
| 4 | DESIGN | Expiry-recheck chỉ khác trigger; approval thuộc F04-G06, plan baseline F04-G01. | Gộp lifecycle exception; không cho L4 này tự commit. |
| 5 | OWNER | Trạng thái hiệu lực ngoại lệ và bản ghi đã duyệt thuộc L3 nào? | Đề xuất F04-G02-M03 sở hữu validation + hiệu lực; F04-G06 sở hữu quyết định phê duyệt; F04-G01 plan baseline. |
| 6 | RESEARCH | Khuyến nghị cân bằng không thể suy từ Standard Bar giả lập BAR-1. | Giữ RESEARCH_REQUIRED cho ngưỡng/age variants và kiểm thực nghiệm. |

## 5. Validator: Phạm vi kiểm tra thực tế

- **Đã đối chiếu:** Các test có nguồn yêu cầu; các outcome có test; ranh giới L3 trong 3.2/3.4; tính nhất quán đầu vào/đầu ra ở mức văn bản.
- **Chưa làm:** Chạy code, gọi LLM chấm bài, chạy authorization service, kiểm thử với người dùng/trẻ, legal review, đo latency/cost, xác minh nguồn nghiên cứu.
- **Các expected output chưa có bằng chứng:** Các quy tắc theo quốc gia/tuổi, mức học–chơi phù hợp, độ chính xác LLM, UX và role được ủy quyền.
- **Trạng thái:** `SOURCE_TRACED / DESIGN_CHECKED / NOT_EXECUTED`, kèm `OWNER_REVIEW` và `RESEARCH_REQUIRED` ở các hàng tương ứng. Không có `TEST_PASSED`.

## 6. Phản hồi Product Owner

Có thể phản hồi bằng `MP-Balance: sửa test MP-... thành ...` hoặc `đồng ý expected output, nhưng đổi quyền/nguồn ...`. Không cần duyệt từng ID L4; Coordinator sẽ suy ra diff từ các test và giữ log thay đổi.

**Không tự cập nhật canonical Blueprint hoặc merge PR #17.**
