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

Mục lục và quy ước đặt tên: `documents/README.md`.

| File, thư mục | Nội dung |
|---|---|
| `documents/knowledge/spec-ban-do-kien-thuc.md` | Bản đồ bộ kiến thức: phạm vi, nguyên tắc, khung 17 nhóm, trục tuổi, lưới độ phủ, cấu trúc dữ liệu, hai lớp kho, kiểm soát chất lượng. **Đọc trước khi viết hay xếp bất kỳ nội dung lời khuyên nào** |
| `documents/knowledge/ref-kho-nguon.md` | Kho nguồn có mã `NG-xxx` |
| `documents/knowledge/ref-hang-doi-kiem-chung.md` | Hàng đợi thông tin Pal tra trên mạng, chờ tìm bổ sung và duyệt |
| `documents/knowledge/by-age/` | Nội dung kiến thức theo giai đoạn tuổi (hiện có `age-00-06-early-childhood/`, `age-06-11-primary-school/`; nháp, người soạn AI) |
| `documents/knowledge/foundations/` | Kiến thức nền: lăng kính 4 nhu cầu tâm lý (an toàn, gắn kết, năng lực, tự chủ), sự tự tin theo tuổi, cơ chế tâm lý trong nuôi dạy |
| `documents/knowledge/seasonal/` | Nội dung theo mùa: bệnh hay tăng theo tháng và vùng, cách phòng, dấu hiệu cần đi khám |
| `documents/knowledge/methods/` | Bài phương pháp giáo dục và chăm sóc (Montessori, STEM, EASY…), có lợi hại và hiểu lầm |
| `documents/knowledge/ref-muc-quan-tam-tim-kiem.md` | Mức quan tâm tìm kiếm các phương pháp (Google Trends), thứ tự ưu tiên |
| `documents/knowledge/procedures/` | Thủ tục hành chính, xếp theo lĩnh vực (không theo tuổi); gồm các chương trình, chính sách hỗ trợ của Nhà nước cho trẻ và gia đình (tiêm chủng mở rộng, bảo hiểm y tế, học phí, hỗ trợ học tập, trợ cấp, bảo vệ trẻ em) |
| `documents/pal/guide-cach-pal-tra-loi.md` | Cách Pal trả lời câu hỏi lập kế hoạch |
| `documents/pal/examples/` | Ví dụ câu trả lời chuẩn |

Quy tắc khi sửa tài liệu:
- Trục dọc là tuổi: tiền mang thai → thai kỳ → 0–6 → 6–11 → 11–15 → 15–18 → 18–24.
- Mỗi nội dung thuộc **1 nhóm chính** trong 17 nhóm: lớp **Nền** an toàn; cấp **A** phát triển cốt lõi (1–6); cấp **B** môi trường (7–12); **C1** định hướng xuyên suốt (13, 14, 16); **C2** định hướng giai đoạn (15, 17). Xếp nhóm theo cây quyết định và sổ quyết định phân loại trong bản đồ, không tự đặt nhóm mới.
- Không điểm tổng, không so sánh trẻ với trẻ khác; tín hiệu an toàn luôn được ưu tiên.
- Mọi ý trong lớp bằng chứng có mã nguồn; ý không có nguồn gắn nhãn `đề xuất nội bộ`; lời khuyên suy từ một cơ chế có nguồn nhưng chưa được kiểm trực tiếp gắn nhãn `suy từ lý thuyết` (bản đồ §2 mục 3a: trỏ tới cơ chế trong `foundations/`, Pal nói rõ "chưa có nghiên cứu kiểm trực tiếp", không dùng cho an toàn, sức khỏe, thuốc); lời khuyên mượn từ nhóm tuổi kề bên gắn nhãn `áp tuổi liền kề`; nguồn thứ cấp đánh dấu ○.
- Nội dung do AI soạn ghi `người soạn: AI` và không được tự chuyển sang "đã duyệt".
- **Nguồn trả lời** (bản đồ §1.1): Pal tìm trong kho chuẩn trước. Thông tin chưa có trong kho (mọi loại) thì Pal báo cho phụ huynh trước, rồi đưa thông tin tra trên mạng kèm nguồn, gắn nhãn **chưa kiểm chứng**, và ghi vào `documents/knowledge/ref-hang-doi-kiem-chung.md` để tìm bổ sung và duyệt. Không tra mạng cho chẩn đoán, thuốc, tình huống khẩn.
- **Phương pháp** (bản đồ §1.3): Pal dựa vào bài phương pháp để tư vấn có hợp với con không, sửa hiểu lầm có nguồn, không kết luận chắc chắn; **đề xuất cuối luôn là cho con học thử** (mọi phương pháp), ngay trước đó nói rõ nghiên cứu nói gì, giúp được gì, mức chắc chắn.
- **Trường, trung tâm cụ thể:** được nêu tên, chỉ đưa dữ kiện từ nguồn, gắn nhãn chưa kiểm chứng; **không nhận xét** chất lượng nếu kho chưa có.
- **Agent:** chỉ tạo agent (tìm nguồn, kiểm chứng) khi chủ sản phẩm cho phép. Không có agent thì Claude tự tìm, tự mở lại nguồn và ghi "chưa kiểm chứng độc lập".
- **Tâm lý trẻ** (bản đồ §7.10): với mỗi gợi ý, Pal kiểm việc đó nuôi hay làm tổn thương nhu cầu nào trong 4 nhu cầu; nghe nhu cầu đằng sau lời kể, không chẩn đoán. **Không chấm điểm tự tin, lòng tự trọng**; chỉ quan sát, mô tả theo từng việc, so con với chính con.
- **Hai lớp kho** (bản đồ §1.2): lớp bằng chứng (có nguồn) và lớp thực thi (trò chơi, món ăn, sách, cơ sở dịch vụ, sản phẩm; có chi phí). Mục đối tác hoặc sản phẩm mẫu có cờ "ẩn khi phát hành".
- Khi đổi tên hoặc chuyển file, sửa mọi đường dẫn trỏ tới nó trong `documents/`, kiểm tra mã nguồn `NG-xxx` được dùng đều có trong `ref-kho-nguon.md`, và cập nhật bản sao trong project Parent-Pal trên claude.ai.

## Viết tài liệu

- Viết tiếng Việt; tên tài liệu gốc và link nguồn giữ nguyên tiếng Anh.
- Chữ thường, nối bằng gạch ngang. Tên thư mục bằng tiếng Anh. Tên file có **tiền tố theo loại** bằng tiếng Anh (`spec-`, `guide-`, `ref-`, `content-`, `procedure-`, `example-`) và **phần mô tả bằng tiếng Việt không dấu**, ví dụ `content-03-tap-di-12-18-thang.md`. Chi tiết: `documents/README.md`.
- Câu ngắn, rõ; bảng cho dữ liệu nhiều chiều; không dùng ký hiệu khó hiểu mà không giải thích.
