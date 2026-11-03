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
