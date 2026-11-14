# Sổ quyết định của chủ sản phẩm, 15/11/2026

*Ghi lại bởi: AI, theo trả lời của chủ sản phẩm trong phiên làm việc ngày 15/11/2026. Trạng thái: APPROVED theo lời chủ sản phẩm. Không sửa các sổ quyết định cũ; chỗ nào khác với sổ cũ thì sổ này ghi rõ là quyết định mới hơn.*

Nguồn câu hỏi:
- OD-A1..A8: `progress/phase-3-scoring/audit/08_Research_Gaps_and_Decisions.md`.
- OC-01..04 và C-09: `progress/Constraint_Register_Approved_Decisions.md`.
- UF-Q01..Q13: `04_User_Flow/User_Flow_04_1_Scheduling_Loop.md` §9.
- Câu hỏi của spike: `progress/spike-e1-scheduler/Spike_E1_Scheduler_Report.md` §7.

## 1. Bước 3.3 và gói A-lite

| Mã | Câu hỏi | Quyết định |
|---|---|---|
| Q1 | Đưa kết quả chấm điểm, tự kiểm toán lên repo? | Đồng ý. Đưa vào `progress/phase-3-scoring/` qua nhánh và PR (PR #20) |
| OD-A1 | A-lite bắt đầu từ mục tiêu hay từ thời khóa biểu? | **(a)** Từ thời khóa biểu của con. Đặt mục tiêu là tùy chọn |
| OD-A2 | Biến thể A-lite nào để kiểm thử? | **(c)** Làm A-lite E1 trước (29 module, không AI, nhập có cấu trúc). A-lite Plan A (có Pal trò chuyện) là nấc 2 |
| OD-A3 | Geofence của Plan A | **(a)** Chấp nhận ánh xạ vào F08-G04-M01/M02, F01-G04-M02, F06-G01-M01, F04-G07-M01. Ghi quy tắc riêng cho dữ liệu vị trí: chỉ lưu sự kiện vào/ra. Mở issue theo dõi |
| OD-A4 | Duyệt sửa điểm và rubric R1.2 | Duyệt các mục `CONFIRMED_SOURCE`. Mục `JUDGMENT` chờ người duyệt độc lập (OD-A5) |
| OD-A5 | Ai làm Adversarial MVP Review? | Một phiên Claude khác, không phải phiên đã chấm điểm |
| OD-A6 | Chủ sở hữu hội thoại Pal với phụ huynh | **(b)** F07-G03 làm entry, F03-G05 làm outcome, theo 3.4 UC-017 |
| OD-A7 | Tín hiệu mệt, đói của trẻ thuộc L3 nào | **(a)** F04-G05 (ghi nhận thực hiện) |
| OD-A8 | Định danh cho pilot | **(b)** Mã gia đình trong spike kỹ thuật. FR-01 (tài khoản, ghép máy, Parent PIN) phải có trước pilot với gia đình thật |

## 2. Xung đột giữa các quyết định và nguồn chuẩn

| Mã | Câu hỏi | Quyết định |
|---|---|---|
| D-01 (OC-01) | Plan A test với 1–3 gia đình quen, trong khi PA-OD-04 và Gate cấm dữ liệu trẻ thật | **(b)** Coi là thử nghiệm nội bộ, có đồng ý bằng văn bản, ghi thành **ngoại lệ có giới hạn**. Điều kiện tối thiểu (AI đề xuất, chờ chủ sản phẩm xem): bố mẹ ký đồng ý, trẻ được giải thích bằng lời dễ hiểu; tối đa 3 gia đình; có hạn kết thúc; chỉ thu dữ liệu cần cho 5 tính năng thử; xóa khi kết thúc; không đưa dữ liệu lên repo công khai; không dùng cho mục đích khác. **Cổng pháp lý H4, FR-03 vẫn mở, không coi là PASS.** Ngoại lệ này không áp cho pilot rộng hơn |
| D-02 (UF-Q01, B-1 của User Flow) | Ô Ngủ đỏ: có nút "Giữ mức này" không? | **Không.** Giờ ngủ không được giữ dưới mức tối thiểu. Nút "Giữ mức này" chỉ áp cho các nhóm khác. Khớp C1 và P6-BP-OD-02 |
| D-03 (UF-Q02, B-2 của User Flow) | Báo phụ huynh khi con hay chọn "Rất mệt" | Báo **xu hướng mệt liên quan đến lịch**, không báo cảm xúc. Trẻ được biết phụ huynh nhận thông tin này |
| D-04 (OC-02) | Mã gia đình của Plan A so với FR-01 | Như OD-A8 |
| D-05 (OC-04) | Phạm vi tra mạng | Theo **OD-05**: tra web hoặc LLM ngoài kho chỉ cho câu hỏi giáo dục, đào tạo; loại khác cần chính sách riêng. Cập nhật CLAUDE.md và bản đồ kiến thức §1.1 cho khớp |
| D-06 (C-09) | Lời khuyên an toàn cho trẻ | Theo **OD-03**: trẻ nhận lời "nói với người lớn tin cậy", có thể kèm 111. Số 113, 115 dành cho người lớn. Sửa A-lite cho khớp |
| D-07 (OC-03) | Đổi người quản lý chính thì quyền cũ của trẻ ra sao? | **Quyền cũ của trẻ giữ nguyên.** Theo B01-CL-OD-03 và B01-C-OD-01; phần "grant cũ chuyển `REVIEW_REQUIRED`" của P6-AP-OD-02 không áp cho quyền của trẻ. CR đã duyệt nhưng chưa áp dụng vẫn phải duyệt lại (B01-C-OD-01) |

## 3. Thông số và chính sách lập lịch

| Mã | Câu hỏi | Quyết định |
|---|---|---|
| D-08 | Bảng thông số lập lịch (khoảng 20 giá trị: thời lượng khối sinh hoạt, nghỉ giữa khối, giãn cách trước giờ ngủ…) | Dùng giá trị mặc định của spike E1 (`out/params.json`), gắn nhãn **mặc định chưa kiểm chứng**, chờ thẩm định chuyên môn ở bước 14b |
| D-09 (UF-Q07, B-9 của spike) | Giai đoạn tạm thời cần dài hơn 60 ngày | **Không cho quá 60 ngày.** Hết hạn thì tự về lại hồ sơ lịch trước giai đoạn. Khớp P6-BP-OD-01 |
| D-10 (UF-Q03) | Con chọn "Rất mệt" có tự đổi lịch hôm nay không? | **Không tự đổi.** Muốn đổi lịch, trẻ phải đi qua bước đề xuất (ở `PARENT_LED` là mong muốn gửi bố mẹ, vì chế độ này không có CR chính thức) |
| D-11 (UF-Q04) | Con chưa có máy riêng | **App yêu cầu con có thiết bị.** Không có thiết bị thì chỉ dùng được phần lập lịch phía phụ huynh, không có phần theo dõi trên máy của con |

## 4. Đưa kết quả lên repo

| Mã | Quyết định |
|---|---|
| D-12 | Đưa 4 kết quả ngày 14/11 (đối thủ và kế hoạch thực địa, User Flow đợt 1, spike E1, sổ ràng buộc và bộ câu hỏi pháp lý) lên repo qua PR |
| D-13 | Làm tiếp: User Flow đợt 2, chuẩn bị phương án MVP để chủ sản phẩm chọn (không tự chọn), gom Business Logic cho module lập lịch |

## 5. Việc còn mở

- Câu hỏi UF-Q05, Q06, Q08..Q13 của User Flow: chưa có quyết định, giữ nhánh mặc định có nhãn.
- Câu hỏi B-1, B-2, B-11 của spike (khoảng nghỉ 3–5′ hay 5–10′, "bớt học ở nhà" hay "bỏ ôn bài", nhận diện khối): xử lý trong Business Logic; nếu cần chủ sản phẩm chọn thì hỏi lại.
- Chọn MVP: chưa quyết.
