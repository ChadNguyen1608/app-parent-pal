# Bản thử "Pal – Lập lịch cho con"

Một trang HTML duy nhất (`index.html`), chạy dưới dạng artifact trên claude.ai. Dùng để thử tính năng lập kế hoạch và thời khóa biểu cho trẻ 6–15 tuổi.

- **Trạng thái:** bản thử nghiệm, chưa phải app phát hành. Người viết: AI (Claude), theo trao đổi với chủ sản phẩm.
- **Quy tắc Pal dùng:** `documents/pal/spec-quy-tac-lap-lich.md` (nguồn chuẩn). Đặc tả giao diện: `documents/pal/spec-quy-thoi-gian-va-tab-cua-con.md`. Khi đổi quy tắc, sửa file quy tắc trước rồi mới sửa prompt trong `index.html`.

## Có gì

- **🧭 Lên kế hoạch:**
  - bảng quỹ thời gian, có preset;
  - khung Hoạt động của con;
  - trò chuyện với Pal bằng chữ, voice qua mic của bàn phím, và ảnh.
- **🗓️ Lịch tuần:** hồ sơ, lịch mẫu và ngoại lệ trong tuần, giai đoạn tạm thời.
- **🧒 Của con:** các khối hôm nay, nút xác nhận, chụp gửi bài, hỏi thăm, báo đói, chọn thời tiết ngày mai.

## Chạy ở đâu

- Trang cần các khả năng `sample` (gọi Claude, có ảnh), `db` và `user` của artifact claude.ai. Mở file trực tiếp trên máy thì không gọi được Pal; dữ liệu chỉ lưu tạm trong `localStorage`.
- Trong code không có khóa API hay thông tin cá nhân. Câu ví dụ trong app là dữ liệu giả.

## Nơi sửa trong code

| Phần | Tên trong code |
|---|---|
| Prompt của Pal | `RULES`, `ACT_RULES`, `LIFE_RULES`, `OUTPUT_FORMAT` |
| Kiểm tra cân bằng chạy trong app | `checkDayK` |
| Ngưỡng màu và câu cảnh báo của quỹ giờ | `judge` |
| Quỹ mặc định theo tuổi | `defaultBudget` |
| Hoạt động cố định | `applyActs`, `renderActs` |
| Tab của con | `renderToday` |

## Khác biệt với spec quy tắc từ 15/11/2026

Theo quyết định D-14 (`app-design-document/progress/Owner_Decision_Log_20261115.md`), `index.html` **giữ nguyên** làm mốc cũ, không sửa theo các quyết định mới. Khi chuyển sang app, chỗ nào dưới đây khác thì theo `documents/pal/spec-quy-tac-lap-lich.md`.

| Chỗ trong bản thử | Spec từ 15/11/2026 | Quy tắc, quyết định |
|---|---|---|
| Con chọn "Rất mệt" thì tự thêm nghỉ, bỏ phần học theo định hướng; câu với con "tối nay chỉ làm phần cô giao thôi" | Không tự đổi lịch; hỏi con có muốn nhắn bố mẹ, đi qua đề xuất hoặc mong muốn | G3, D-10 |
| Hết giai đoạn tạm thời: ba lựa chọn cho bố mẹ | Tự về lịch trước giai đoạn, báo bố mẹ; tối đa 60 ngày | J2, J6, D-09 |
| Ô Ngủ đỏ có nút "Giữ mức này" | Không có nút; lịch luôn xếp ngủ ≥ mức tối thiểu | D6, D-02 |
| Nghỉ giữa hai khối học 3′ trong `checkDayK` | Ít nhất 5′ | C3, D-23 |
| Báo xu hướng mệt cho bố mẹ theo từng lúc | Chỉ tổng hợp trong báo cáo cuối tuần | L2, D-03, D-21 |
| Số khẩn 111/113/115 dùng chung | Trẻ: "nói với người lớn con tin", có thể kèm 111 | N2, D-06 |
| Không có nút "Con cần giúp đỡ" | Có nút cố định, không ghi lại, không tự báo gia đình; gợi ý con báo bố mẹ | N3, D-26, D-30 |
