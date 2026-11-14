# 08 — Khoảng trống nghiên cứu và quyết định

**Loại:** `SELF_AUDIT / PROPOSAL` · **Người soạn:** AI (Claude, Opus 5.5), tự rà soát lượt chấm của chính mình, chưa kiểm chứng độc lập; có 1 lượt phản biện bằng subagent · **Nguồn:** HEAD `9043c88`; baseline đóng băng `baseline_v1/` (SHA256SUMS) · **Cần Owner duyệt:** mọi thay đổi đề xuất

## 1. Quyết định cần Owner

### OD-A1 — A-lite bắt đầu từ mục tiêu (3.4 UC-007) hay từ thời khóa biểu (prototype)?

- **Phương án:** (a) Từ thời khóa biểu, mục tiêu tùy chọn; (b) Bắt buộc chọn mục tiêu ngắn trước khi lập lịch; (c) Có cả hai nhánh
- **Khuyến nghị:** (a)
- **Lý do:** Prototype và nỗi đau chính là xếp tuần học; UC-007 là BASELINE_PROPOSED, có thể sửa qua change request; mục tiêu thêm sau được mà không phải làm lại.

### OD-A2 — A-lite để kiểm thử là biến thể nào?

- **Phương án:** (a) A-lite E1: 29 module, không AI, chỉ nhập có cấu trúc, kiểm giả thuyết E1; (b) A-lite Plan A: 40 module, Pal chat như prototype, cần gói AI, nội dung an toàn tĩnh, ẩn danh; (c) Làm (a) trước, (b) là nấc 2
- **Khuyến nghị:** (c)
- **Lý do:** v1 (24) không chạy được từ đầu đến cuối. (a) học nhanh hành vi lõi với ít rủi ro an toàn; nhưng CLAUDE.md coi prototype (có Pal chat) là chuẩn, nên (b) phải có lộ trình rõ.

### OD-A3 — Geofence của Plan A: chấp nhận ánh xạ vào F08-G04-M01/M02 + F01-G04-M02 + F06-G01-M01 + F04-G07-M01 không?

- **Phương án:** (a) Chấp nhận ánh xạ, ghi quy tắc riêng cho dữ liệu vị trí; (b) Mở change request thêm L3 vị trí; (c) Bỏ geofence khỏi phạm vi sản phẩm
- **Khuyến nghị:** (a) kèm issue theo dõi
- **Lý do:** Phản biện cho thấy ánh xạ được vào ID có sẵn; nhưng vị trí của trẻ là loại dữ liệu nhạy cảm riêng, cần quy tắc giữ ít dữ liệu nhất (chỉ sự kiện vào/ra, theo Plan A §4).

### OD-A4 — Duyệt các sửa điểm và rubric R1.2 (file 01 §3, PC-13)?

- **Phương án:** (a) Duyệt toàn bộ; (b) Duyệt từng mục; (c) Chờ reviewer độc lập
- **Khuyến nghị:** (c) cho mục JUDGMENT; (a) cho mục CONFIRMED_SOURCE
- **Lý do:** Mục CONFIRMED_SOURCE chỉ khôi phục quyết định đã duyệt; mục chủ quan cần người khác.

### OD-A5 — Ai làm Adversarial MVP Review?

- **Phương án:** (a) Reviewer khác (ChatGPT hoặc phiên Claude mới); (b) Claude phiên này
- **Khuyến nghị:** (a)
- **Lý do:** Phiên này đã chấm và tự audit; cần độc lập. Khi đó cần commit hoặc gửi kèm 2 thư mục review.

### OD-A6 — Chủ sở hữu hội thoại Pal với phụ huynh: F05-G01-M01 hay F07-G03 (UC-017)?

- **Phương án:** (a) F05-G01-M01 (theo L4 G02); (b) F07-G03 làm entry, F03-G05 làm outcome (theo 3.4); (c) Mở change request thêm L3
- **Khuyến nghị:** (b) để thảo luận
- **Lý do:** 3.4 đã chốt khung (UC-017 do F07-G03 làm owner); L4 G02 giao cho Companion; cần thống nhất trước khi chấm W2.

### OD-A7 — Tín hiệu mệt/đói của trẻ (spec §4, SC-001-D02) thuộc L3 nào?

- **Phương án:** (a) F04-G05 (ghi nhận thực hiện); (b) F04-G04 (hỗ trợ thực hiện); (c) Mở change request
- **Khuyến nghị:** (a) để thảo luận
- **Lý do:** F02-G05-M02 là trẻ phản đối nhận định về mình, không phải tín hiệu mệt; tín hiệu gắn với khối trong ngày nên gần F04-G05 nhất.

### OD-A8 — Mô hình định danh cho pilot: mã gia đình theo Plan A hay tài khoản + Parent PIN theo FR-01?

- **Phương án:** (a) Theo FR-01 ngay (2 máy, ghép, PIN); (b) Mã gia đình trong spike kỹ thuật, FR-01 trước pilot có người dùng; (c) Chỉ một máy dùng chung như prototype
- **Khuyến nghị:** (b)
- **Lý do:** Plan A là spike kỹ thuật, đã hoãn tài khoản riêng; FR-01 đã duyệt nên phải có trước pilot với gia đình thật.

## 2. Khoảng trống nghiên cứu (gắn MR hiện có; đề xuất mới chỉ ghi ở đây)

| # | Câu hỏi | MR | Chặn gì | Ưu tiên |
|---|---|---|---|---|
| RG-01 | Thuật toán xếp lịch E1 có đạt chất lượng gần prototype LLM không (spike) | MR-025 | Build A-lite; quyết định E1/E2 | 1 |
| RG-02 | Trẻ A2–A3 có tự dùng tab Hôm nay và nút Xong không | MR-007 | Giá trị phía trẻ | 1 |
| RG-03 | Phụ huynh có bớt phải nhắc và thấy lịch cân bằng có ích không | MR-001, MR-002 | Đề xuất giá trị lõi | 1 |
| RG-04 | Pháp lý: thời hạn xóa (H4), cơ sở xử lý dữ liệu trẻ, đồng ý người giám hộ | MR-016, MR-017, MR-018 | Dữ liệu thật | 1 |
| RG-05 | Ngưỡng quỹ thời gian và sàn cố định được chuyên gia chấp nhận | MR-012 | Balanced Planning thật | 2 |
| RG-06 | Kênh tín hiệu mệt 3 lựa chọn có gây áp lực hoặc bị lạm dụng không | MR-009, MR-031 | PC-04 | 2 |
| RG-07 | Độ tin cậy thông báo đúng giờ trên các dòng Android | — (Plan A test) | F04-G07-M01 | 2 |
| RG-08 | Thẩm định cạnh phụ thuộc CANDIDATE và P-E01..07 | MR-040 | Thứ tự phát triển | 2 |
| RG-09 | Hiệu chuẩn rubric với nhiều người chấm | MR-039 | Độ tin cậy điểm | 3 |
| RG-10 | Định vị geofence trong inventory và quy tắc riêng tư vị trí | MR-021 (đề xuất PMR-04) | Plan A bước 4 | 3 |

Master Research Backlog **không bị sửa**. Các đề xuất PMR-01..04 chỉ là ứng viên.
