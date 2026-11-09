# Package C — Kế hoạch kiểm thử dữ liệu mẫu (Review)

**Mục tiêu:** Kiểm tra giả thuyết mô hình dữ liệu Career, không xác nhận một sản phẩm đã vận hành.

## 1. Fixture
Đọc `Package_C_Career_Test_Fixture_SYNTHETIC.json`. Tất cả tên nghề, vai trò, ví dụ và đặc biệt **số liệu tỷ lệ 40% là giả định**, tuyệt đối không trả lời người dùng cuối dưới dạng sự thật.

## 2. Ca kiểm thử thiết kế

| Mã | Dữ liệu thử | Đầu ra mong muốn | Trạng thái |
|---|---|---|---|
| T01 | Streamer liên kết Media/Game/Commerce | Trả về cả ba quan hệ, không ép cây đơn | Cấu trúc JSON PASS |
| T02 | Streamer có ba kỹ năng | Đọc đúng các `skill_ids` | Cấu trúc JSON PASS |
| T03 | Claim tỷ lệ 40% (giả) có `CACHED`, `UNVERIFIED`, `NOT_APPROVED` | Không trình bày như thống kê xác thực | Kiểm tra flag PASS; runtime chưa test |
| T04 | Profile trẻ 13 tuổi hỏi “có hợp nghề không?” | Chỉ nói lợi thế có chứng cứ và thử nghiệm; không verdict | Kiểm tra fixture không có verdict PASS; AI chưa test |
| T05 | Project `EXPLORATION_ORIENTED` trẻ thực hành quay video | Có milestone trải nghiệm và phản tư; dừng nghề vẫn có thể hoàn thành | Cấu trúc JSON PASS; engine chưa test |
| T06 | Trẻ 13 tuổi yêu cầu `PUBLIC` khi chưa parent approval và chưa platform verification | Không cho công khai, hướng dẫn an toàn | Kiểm tra flag PASS; policy engine chưa test |
| T07 | Người dùng 19 tuổi lập dự án | Không mặc định yêu cầu phụ huynh duyệt | Cấu trúc JSON PASS; quyền runtime chưa test |
| T08 | Từ chối chia sẻ artefact thử nghề | Video PRIVATE không tự vào Journal hoặc Parent report | Chưa test (yêu cầu tích hợp/permission) |
| T09 | Thống kê nghề thiếu nguồn hợp lệ | Trả lời “chưa đủ dữ liệu”; có thể gợi ý nghiên cứu | Chưa test (retrieval/AI) |
| T10 | Cập nhật thông tin nghề đã bị đính chính | Hạ trạng thái, trace nguồn và giảm khả năng hiển thị | Chưa test (versioning) |
| T11 | Cho phép controlled sharing rồi thu hồi quyền | Ngừng truy cập từ lần thu hồi, theo policy hợp lệ | Chưa test (permission) |
| T12 | Đối tượng 0–5 tuổi | Hoạt động khám phá nghề chỉ qua phụ huynh hoặc không áp dụng, không chatbot nghề trực tiếp | Chưa test (cohort rules) |

## 3. Kết quả kiểm tra cấu trúc thực hiện

- PASS — Nghề liên kết nhiều ngành
- PASS — Khóa ngoại nghề→ngành hợp lệ
- PASS — Khóa ngoại nghề→kỹ năng hợp lệ
- PASS — Claim liên kết nghề hợp lệ
- PASS — Cache không tự tạo trạng thái Approved
- PASS — Project liên kết profile/nghề hợp lệ
- PASS — Không gán verdict phù hợp nghề
- PASS — Public request của trẻ chưa được tự cho phép
- PASS — Có cả goal/exploration mode

**Kết luận:** Có thể biểu diễn các quan hệ cơ bản và các trạng thái nhạy cảm trong fixture giả lập; **không đủ để kết luận ứng dụng hoạt động đúng mong muốn**. Bước validation tiếp theo là đối chiếu các ca T08–T12 với quyền/luồng cụ thể và sau đó mới cân nhắc kiểm thử nguyên mẫu.

## 4. Gợi ý mở rộng fixture trước khi thiết kế schema kỹ thuật
- 1 nghề có nhiều lộ trình phát triển; 1 kỹ năng dùng chung nhiều nghề.
- 1 trường hợp hai nguồn thị trường mâu thuẫn về thống kê.
- 1 trường hợp nguồn đã hết hạn hoặc bị rút.
- 1 trường hợp trẻ 13 tuổi thay đổi ý định sau thử nghề; không phán xét thất bại.
- 1 trường hợp đăng công khai bị từ chối dù phụ huynh đã đồng ý, vì điều kiện nền tảng không đạt.

**Bảo vệ dữ liệu:** Chỉ dùng hồ sơ giả, không lấy nhật ký hoặc video thật của trẻ cho bài kiểm thử này.