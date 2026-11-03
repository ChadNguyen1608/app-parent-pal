# Parent-Pal: Đặc tả quỹ thời gian, giai đoạn tạm thời và tab "Hôm nay của con"

> **Quy tắc chi tiết (ngưỡng, mốc, nguồn, mức căn cứ) nằm ở `spec-quy-tac-lap-lich.md`. File đó là nguồn chuẩn.** Đặc tả này mô tả tính năng và giao diện. Nếu hai file khác nhau, theo `spec-quy-tac-lap-lich.md`.

- **Trạng thái:** bản thử, chốt với chủ sản phẩm ngày 3/11/2026. Cuối ngày đã cập nhật: học ở nhà không chấm màu, cảnh báo ghi mốc và nguồn, khung Hoạt động của con, màn Lên kế hoạch.
- **Áp dụng cho:** app thử nghiệm "Pal – Lập lịch cho con" và skill `lap-lich-sinh-hoat-tre`.
- **Liên quan:** `spec-quy-tac-lap-lich.md`; `ref-tai-va-phuc-hoi-trong-ngay.md`; đề xuất cấu trúc hệ thống (cụm Kế hoạch và thực hiện).

## 0. Bố cục app

Thanh dưới có 3 tab:
- **🧭 Lên kế hoạch**:
  - Trên máy tính: bảng quỹ thời gian ở bên trái, khung Hoạt động của con ở bên phải, trò chuyện với Pal ở bên dưới.
  - Trên điện thoại: ba phần xếp dọc theo thứ tự Hoạt động, Quỹ giờ, Trò chuyện, có nút nhảy nhanh tới từng phần.
- **🗓️ Lịch tuần**: hồ sơ, tổng quan, lịch chi tiết từng ngày, giai đoạn tạm thời.
- **🧒 Của con**.

## 1. Nguyên tắc chung

1. **Pal là người tư vấn, không chỉ làm theo yêu cầu.** Nguyên tắc cân bằng được ưu tiên hơn yêu cầu của phụ huynh. Khi yêu cầu lệch nguyên tắc, Pal khuyến cáo **đúng một lần**, ngay lúc phụ huynh chọn, rồi tôn trọng lựa chọn đó.
2. **Ba lớp quyết định:**

| Lớp | Ai quyết | Nội dung |
|---|---|---|
| Sàn cố định | Không ai chỉnh | Ngủ không dưới mức tối thiểu theo tuổi; sau giờ học có ít nhất 15 phút chơi tự do; nghỉ 3–5 phút giữa hai khối học; không bỏ bữa; không phạt thể chất; không dùng đồ ăn để thưởng hay phạt |
| Quỹ thời gian | Bố mẹ chỉnh; con được đề xuất | 6 nhóm hoạt động, hai cột: ngày đi học và cuối tuần. Bố mẹ nhập **một con số** (giờ) cho 3 nhóm, cộng mức tối đa cho màn hình. Pal được xê dịch ±30 phút khi xếp lịch |
| Thứ tự trong ngày | Pal | Nghỉ phục hồi trước khi học, không có hai khối tải cao liền nhau, chia phiên học theo độ tập trung, khoảng cách bữa, khối nhẹ trước giờ ngủ. Pal tự sửa lỗi thứ tự, không hỏi lại phụ huynh |

3. **Màu cảnh báo chỉ hiện ở bảng quỹ thời gian.** Lịch chi tiết không có màu. Cảnh báo là **một dòng chữ có biểu tượng, nằm ngay dưới ô nhập**, gồm số hiện tại, mốc tham khảo và nguồn. Mốc chưa có nguồn thì ghi "mặc định của Pal". Không dùng hộp thoại bật lên.
4. **Trần mềm:** dòng cảnh báo đỏ có nút "Giữ mức này". Khi bố mẹ bấm, ô vẫn màu đỏ, dòng chữ đổi thành "bố mẹ đã xác nhận", và Pal không nhắc lại.
5. **Tín hiệu mới từ con không tính là nhắc lại.** Ví dụ: con báo "Rất mệt" nhiều ngày liền, báo đói, than không có thời gian chơi. Pal báo bố mẹ theo **xu hướng**, không chép nguyên văn lời con, kèm một đề xuất cụ thể.

## 2. Quỹ thời gian: 6 nhóm

| Nhóm | Gồm | Không gồm |
|---|---|---|
| Ở trường và đi lại | Giờ học ở trường, đường đi và về | — |
| Học thêm và tập luyện ngoài trường | Trung tâm, gia sư, năng khiếu; thể thao có huấn luyện viên, võ, múa, tập để thi đấu. Tính cả thời gian đi lại | Đi bơi chơi, đá bóng với bạn |
| Học và rèn luyện ở nhà | Bài tập cô giao, ôn bài, học theo định hướng của bố mẹ, tự luyện nhạc cụ, luyện chữ, đọc sách theo yêu cầu | Đọc truyện con tự chọn trước khi ngủ, soạn cặp |
| Chơi tự do, vận động vui, nghỉ ngơi | Chơi tự do, bơi chơi, đạp xe dạo, thời gian trống, một nửa thời gian các bữa ăn. **Màn hình giải trí** là một dòng phụ của nhóm này | — |
| Ăn uống, vệ sinh, việc cá nhân | Bữa ăn, tắm, vệ sinh, thay đồ, soạn cặp, đọc truyện trước khi ngủ, nhật ký | — |
| Ngủ | Từ lúc tắt đèn đến lúc dậy hôm sau | — |

- Mỗi hoạt động có một nhóm chính và tối đa một nhóm phụ. Bữa ăn chỉ tính **một nửa thời gian** vào nghỉ ngơi và không thay được khối phục hồi sau giờ học.
- Tổng 24 giờ: mỗi hoạt động chỉ được tính một lần, theo nhóm chính.

### 2.1 Cách có số liệu cho từng nhóm

| Nhóm | Số liệu lấy từ đâu |
|---|---|
| Ở trường và đi lại | Cố định, lấy từ thời khóa biểu |
| Học thêm và tập luyện ngoài trường | Cố định, lấy từ **khung Hoạt động của con** (giờ học + đi lại); không nhập tay |
| Học và rèn luyện ở nhà | Bố mẹ nhập số giờ. **Không chấm màu** |
| Ăn uống, vệ sinh, việc cá nhân | Bố mẹ nhập số giờ |
| Ngủ | Bố mẹ nhập số giờ (không thấp hơn mức tối thiểu theo tuổi) |
| Chơi tự do, vận động vui, nghỉ ngơi | **App tự tính**: 24 giờ trừ các nhóm trên, cộng một nửa giờ ăn |
| ↳ Màn hình giải trí | Bố mẹ nhập mức tối đa |

- Pal xê dịch ±30 phút quanh số bố mẹ nhập. Giờ ngủ không được thấp hơn số đã nhập quá 30 phút.
- Nếu tổng vượt 24 giờ, dòng chơi tự do báo đỏ kèm số giờ bị vượt.
- **Preset:** Bình thường, Thi cử, Nghỉ hè, Nghỉ lễ… có các nút Lưu, Lưu thành mới, Xóa. Mỗi preset giữ riêng các xác nhận vùng đỏ của nó. Sau khi đổi preset, bố mẹ bấm "Nhờ Pal xếp lịch theo quỹ này".

### 2.2 Ngưỡng màu

Xem bảng ngưỡng ở mục D của `spec-quy-tac-lap-lich.md`. Màu xét theo con số bố mẹ nhập. Với nhóm cố định và nhóm tự tính, màu xét theo ngày nặng nhất trong tuần.

### 2.3 Khung Hoạt động của con

- Mỗi thẻ gồm: tên, loại, các thứ trong tuần, giờ, thời lượng, đi lại, địa điểm, ghi chú. Đầu khung có dải T2…CN, cuối khung có tổng giờ mỗi tuần.
- Pal tạo thẻ khi bố mẹ kể trong trò chuyện. Thẻ vừa tạo có viền xanh và nhãn "● Pal vừa ghi".
- Bố mẹ tự sửa, xóa hoặc thêm được. Sau khi tự sửa, khung hiện "Lịch tuần chưa cập nhật" kèm nút "Nhờ Pal cập nhật lịch".

## 3. Giai đoạn tạm thời (bất khả kháng)

- **Áp dụng khi:** bố mẹ nêu một lý do có thời hạn, như ôn thi, chỉ định của bác sĩ, hồi phục sau ốm, thi đấu.
- **Quy trình:**
  1. Xác nhận thời hạn. Nếu dài hơn 6 tuần thì cứ 2 tuần xem lại một lần.
  2. Cảnh báo nhẹ một lần.
  3. Lập bộ quy tắc tạm thời, ghi rõ những kiểm tra được nới.
  4. Lưu lại lịch cũ.
  5. Khi hết hạn, báo bố mẹ kèm ba lựa chọn: quay về lịch cũ, nhờ Pal sắp xếp lại, hoặc giữ lịch hiện tại.
- **Sàn cố định không bao giờ được nới.**
- **Ăn uống, giảm cân:** chỉ làm theo chỉ định cụ thể của bác sĩ. Pal không tự đặt số calo hay mục tiêu cân nặng, và không nói về cân nặng với con.
- **Đề xuất từ con:** giai đoạn ở trạng thái "chờ bố mẹ xác nhận" và chưa áp vào lịch.
- **Chưa chốt (đề xuất):**
  - Trong giai đoạn tạm thời, Pal vẫn báo bố mẹ một lần khi tín hiệu mệt của con lặp lại.
  - Pal không tự đề xuất thêm giờ học, kể cả khi nhóm học đang được nới.
  - Có thể gắn mỗi giai đoạn với một preset (ví dụ "Thi cử"), hết hạn thì tự chuyển về "Bình thường".

## 4. Tab "Hôm nay của con"

- Danh sách các khối của hôm nay, chữ to, lời đơn giản. Khối đang diễn ra có nhãn "Bây giờ". Có thanh tiến độ "Đã xong x/y". Không chấm điểm, không xếp hạng.
- **Nút trên mỗi khối, tùy cách xác nhận:**
  - Con bấm Xong: nút **✓ Xong**.
  - Ảnh: nút **📷 Chụp gửi**. Pal chấm bài, trả lời con bằng lời động viên và gợi ý, không đưa đáp án. Bố mẹ nhận bản tóm tắt.
  - Giọng nói: nút **🎤 Kể cho Pal**.
  - Tự động: hiện chữ "Tự ghi nhận".
  - Bố mẹ xác nhận: hiện chữ "Chờ bố mẹ".
  - Không cần xác nhận: không có nút.
- **Hỏi thăm sau giờ học:** Ổn / Hơi mệt / Rất mệt. Nếu con chọn "Rất mệt": kéo dài thời gian nghỉ, bỏ phần học theo định hướng của bố mẹ, chỉ giữ bài cô giao.
- **🍎 Con thấy đói** (đầu tab): ghi giờ con báo. Lần báo đầu trong ngày được gửi vào hàng đề xuất cho bố mẹ, kèm bữa gần nhất và bữa tiếp theo. Với con, app chỉ nhắc uống nước hoặc chờ bữa sắp tới.
- **Thời tiết ở khối Soạn cặp:** "Ngày mai trời thế nào?" với 4 lựa chọn ☀️ / 🌧 / 🧥 / 🌤. Chọn xong hiện đồ cần mang; sáng hôm sau khối thay đồ nhắc lại.
- Con **xem được quỹ thời gian** (không sửa) và có nút "Con muốn đề xuất". Đề xuất và báo đói vào hàng chờ ở màn Lên kế hoạch.
- Ở tab **Lịch tuần**, bố mẹ thấy dấu ✓ và giờ con làm xong từng việc trong hôm nay, kèm tóm tắt nhận xét bài làm.
- **Giới hạn của bản thử:**
  - Con và bố mẹ dùng chung một tài khoản trên cùng một máy, chưa có mã PIN.
  - Pal chưa tự nhận ra lời than thở khi con trò chuyện (cần chế độ "Con đang dùng").
  - Chưa lấy được dự báo thời tiết tự động.

## 5. Phản hồi bài làm qua ảnh

- **Gửi bố mẹ:** gạch đầu dòng, mỗi dòng dưới 20 chữ, tối đa 7 dòng, theo thứ tự:
  1. Kết quả.
  2. Bài sai: sai ở bước nào, gợi ý cách sửa.
  3. Trình bày.
  4. Chữ viết (chỉ nhắc khi thật sự khó đọc).
  5. Một điểm con làm tốt.
  6. Việc tiếp theo.
- **Gửi con:** tối đa 5 dòng, khen cụ thể, gợi ý bằng câu hỏi, không đưa đáp án.
- Pal tự tính lại từng phép tính. Chỗ nào không đọc rõ thì ghi là chưa đọc rõ, không đoán.
