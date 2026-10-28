# Parent-Pal: hướng dẫn cho Claude

Repo này hiện **chỉ chứa tài liệu** của Parent-Pal (thư mục `documents/`). Code bản thử Expo cũ đã được gỡ ngày 28/10/2026; muốn xem hoặc khôi phục, dùng lịch sử git (commit `9abc286` là bản cuối còn code).

## Sản phẩm

App đồng hành nuôi con cho phụ huynh trẻ ở Việt Nam. Trung tâm là **Pal**, một người bạn trò chuyện có trí nhớ, giúp phụ huynh **thực thi** việc nuôi dạy con (kế hoạch, nhắc lịch, trò chơi, sách, thực đơn), không chỉ liệt kê thông tin.

- Pal xưng "mình", gọi phụ huynh theo cách họ chọn khi làm quen ("chị Lan" lần đầu, sau đó "chị").
- Nguyên tắc trò chuyện: **nghe trước, khuyên sau, gợi ý dịch vụ sau cùng**. Không gợi ý trả phí khi phụ huynh đang buồn.
- Pal không hùa theo khi phụ huynh muốn dùng đòn roi: phản biện nhẹ nhàng, thẳng thắn.
- Pal không chẩn đoán. Gọi là "đồng hành", không gọi là "tư vấn tâm lý". App không thay thế khám bệnh.

## Quyết định sản phẩm đã chốt (giữ cho lần dựng app sau)

- **Trí nhớ 4 lớp:** hồ sơ, dòng thời gian, việc đang theo dõi để Pal hỏi lại, về chính phụ huynh.
- **Hai phạm vi:** riêng (chỉ người kể thấy) và cả nhà. Cảm xúc của phụ huynh mặc định là riêng. Không đưa dữ liệu riêng của người này cho người lớn khác.
- **Minh bạch:** mọi thứ Pal nhớ phải hiện cho phụ huynh thấy và sửa, xóa, đổi phạm vi được.
- **Lớp an toàn chạy trước AI.** Tình huống khẩn chỉ đưa thông tin hỗ trợ (111 bảo vệ trẻ em, 113 công an, 115 cấp cứu).
- Không gửi tên con, trường, địa chỉ ra API hay công cụ tìm kiếm nước ngoài khi chưa ẩn danh.
- Có nhiều con mà phụ huynh không nêu tên: **hỏi lại**, không đoán.

## Tài liệu

| File | Nội dung |
|---|---|
| `documents/kien-thuc/spec-knowledge-map.md` | Bản đồ bộ kiến thức: phạm vi, nguyên tắc, khung 17 nhóm, trục tuổi, lưới độ phủ, cấu trúc dữ liệu, hai lớp kho, kiểm soát chất lượng. **Đọc trước khi viết hay xếp bất kỳ nội dung lời khuyên nào** |
| `documents/kien-thuc/nguon.md` | Kho nguồn có mã `NG-xxx` |
| `documents/kien-thuc/noi-dung/0-6/` | Nội dung nháp 0–6 tuổi (người soạn: AI, chờ chuyên gia duyệt) |
| `documents/pal/guide-pal-answers.md` | Cách Pal trả lời câu hỏi lập kế hoạch |
| `documents/pal/vi-du/` | Ví dụ câu trả lời chuẩn |

Quy tắc khi sửa tài liệu:
- Trục dọc là tuổi: tiền mang thai → thai kỳ → 0–6 → 6–11 → 11–15 → 15–18 → 18–24.
- Mỗi nội dung thuộc **1 nhóm chính** trong 17 nhóm: lớp **Nền** an toàn; cấp **A** phát triển cốt lõi (1–6); cấp **B** môi trường (7–12); **C1** định hướng xuyên suốt (13, 14, 16); **C2** định hướng giai đoạn (15, 17). Xếp nhóm theo cây quyết định và sổ quyết định phân loại trong bản đồ, không tự đặt nhóm mới.
- Không điểm tổng, không so sánh trẻ với trẻ khác; tín hiệu an toàn luôn được ưu tiên.
- Mọi ý trong lớp bằng chứng có mã nguồn; ý không có nguồn gắn nhãn `đề xuất nội bộ`; lời khuyên mượn từ nhóm tuổi kề bên gắn nhãn `áp tuổi liền kề`; nguồn thứ cấp đánh dấu ○.
- Nội dung do AI soạn ghi `người soạn: AI` và không được tự chuyển sang "đã duyệt".
- **Nguồn trả lời** (bản đồ §1.1): Pal tìm trong kho chuẩn trước. Thủ tục hành chính chưa có trong kho thì Pal báo cho phụ huynh trước, rồi mới đưa thông tin tra trên mạng kèm nguồn.
- **Hai lớp kho** (bản đồ §1.2): lớp bằng chứng (có nguồn) và lớp thực thi (trò chơi, món ăn, sách, cơ sở dịch vụ, sản phẩm; có chi phí). Mục đối tác hoặc sản phẩm mẫu có cờ "ẩn khi phát hành".
- Khi đổi tên hoặc chuyển file, sửa mọi đường dẫn trỏ tới nó trong `documents/`, kiểm tra mã nguồn `NG-xxx` được dùng đều có trong `nguon.md`, và cập nhật bản sao trong project Parent-Pal trên claude.ai.

## Viết tài liệu

- Viết tiếng Việt; tên tài liệu gốc và link nguồn giữ nguyên tiếng Anh.
- Tên file tài liệu chính: tiếng Anh, có tiền tố theo loại (`spec-` đặc tả, `guide-` hướng dẫn).
- Câu ngắn, rõ; bảng cho dữ liệu nhiều chiều; không dùng ký hiệu khó hiểu mà không giải thích.
