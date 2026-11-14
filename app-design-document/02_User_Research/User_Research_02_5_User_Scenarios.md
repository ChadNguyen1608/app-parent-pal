# 02.5 – USER SCENARIOS

**Product Blueprint – User Research & User Types**  
**Phiên bản:** 1.1 – Final (định hướng Product Blueprint; cần nghiên cứu các chi tiết còn mở)  
**Ngày:** 06/11/2026  
**Trạng thái:** Q1–Q4 và R1–R3 đã chốt ở mức nguyên tắc; các vấn đề nghiên cứu/kiểm định được liệt kê riêng.

> **Phạm vi:** Ghi nhận tình huống người dùng, nhu cầu, kết quả mong đợi, giả thuyết cần kiểm chứng và nguyên tắc hành vi. Chưa đặc tả màn hình, API, mô hình dữ liệu hoặc thuật toán.

## 1. Bối cảnh và mục tiêu

- Sản phẩm dài hạn phục vụ người dùng 0–23 tuổi; nhóm CORE: học sinh lớp 1–9 tại Việt Nam.
- Mô hình có phụ huynh và trẻ cùng sử dụng. Phụ huynh thiết lập gia đình trước; trẻ tham gia sau.
- Ba chế độ tự chủ: Parent-led, Child-executed, Child-directed; với người chưa thành niên phụ huynh quyết định thay đổi chế độ. Quyền của người trưởng thành phải được tôn trọng.
- AI ưu tiên lắng nghe, phản hồi và hỗ trợ thực hiện những kế hoạch đã được ủy quyền; không tự quyết định thay cha mẹ ở những việc thuộc thẩm quyền phụ huynh hoặc thay người dùng trưởng thành.

Mục tiêu của phần 2.5 là kiểm tra các tình huống sử dụng có tạo ra giá trị thiết thực, giảm khối lượng công việc của phụ huynh, tăng quyền tham gia của trẻ và bảo vệ sự tin tưởng của trẻ hay không.

## 2. Decision Log

| ID | Quyết định của người dùng | Trạng thái | Ghi chú |
|---|---|---|---|
| Q1 | Phụ huynh thiết lập trước, trẻ tham gia sau | **Đã chốt** | Không bắt buộc trẻ tham gia onboarding cùng thời điểm |
| Q2 | Chỉ những nhiệm vụ cần theo dõi mới yêu cầu báo cáo; thao tác tối giản | **Đã chốt** | Cần nghiên cứu tiêu chí “cần theo dõi” |
| Q3 / R1 | AI được phân tích nhật ký, tự động lưu **insight có cấu trúc vào hồ sơ riêng của trẻ**, chỉ chia sẻ khi trẻ cho phép | **Đã chốt** | Không lưu bản tổng hợp tường thuật AI; không đưa insight vào hồ sơ chung mặc định; đồng bộ 2.4 |
| Q4 | Phụ huynh và trẻ đều có thể yêu cầu xem xét kế hoạch; phê duyệt theo chế độ | **Đã chốt** | AI không tự ý khởi xướng thay đổi định hướng |
| N1 / R3 | Emotional Check-in được mời **sau khi trẻ về từ buổi học chính**, có thể bỏ qua hoặc tắt | **Đã chốt** | Điều chỉnh độ dài/độ khó hội thoại; chỉ số tự báo cáo, không chẩn đoán |
| N2 / R3 | Kid Journey cuối ngày là hoạt động đề xuất, tự nguyện | **Đã chốt về nguyên tắc** | Không tạo áp lực chia sẻ; thuộc chính sách Journal khi lưu nhật ký |
| R2 | Không tự động biến nội dung Journal thành nhắc nhở; chỉ dùng khi trẻ mở lại. Khả năng nhắc theo loại nội dung sẽ nghiên cứu | **Đã chốt mặc định; ngoại lệ còn mở** | Không tự nhắc từ Journal ở giai đoạn hiện tại |
| N3 | Onboarding tối đa 3–4 câu hỏi trọng tâm, nhận voice/ảnh; AI phân tích | **Mục tiêu UX** | Cần xác nhận thông tin trích xuất; thu thập bổ sung dần |

## 3. Danh mục User Scenarios

| ID | Tình huống | Nhân vật chính | Mức ưu tiên giả thuyết |
|---|---|---|---|
| S01 | Gia đình khởi tạo hồ sơ và onboarding | Phụ huynh | CORE |
| S02 | Xây dựng mục tiêu/định hướng phát triển | Phụ huynh | CORE |
| S03 | Chuyển mục tiêu thành kế hoạch khả thi | Phụ huynh + AI | CORE |
| S04 | Trẻ thực thi và báo cáo tối giản | Trẻ | CORE |
| S05 | Trẻ gặp khó khăn, thảo luận và đề xuất điều chỉnh | Trẻ + phụ huynh | CORE |
| S06 | Trẻ tâm sự và lưu nhật ký riêng tư | Trẻ | Quan trọng, yêu cầu bảo vệ dữ liệu |
| S07 | Gia đình đánh giá tiến độ và xem xét lại kế hoạch | Phụ huynh + trẻ | CORE |
| S08 | Trẻ khám phá sở thích, năng lực, nghề nghiệp | Trẻ | CORE về giá trị |
| S09 | Emotional Check-in điều chỉnh nhịp tương tác | Trẻ | Giả thuyết CORE |
| S10 | Daily Reflection / Kid Journey cuối ngày | Trẻ | Cần kiểm chứng hành vi duy trì |
| S11 | Nhập liệu tự nhiên bằng text, voice, ảnh | Phụ huynh | CORE về trải nghiệm |

## 4. Mô tả chi tiết tình huống

### S01 – Phụ huynh thiết lập gia đình trước

**Bối cảnh:** Một gia đình có nhiều con, mỗi con có lịch học và nhu cầu khác nhau. Phụ huynh không muốn nhập biểu mẫu dài.

**Đầu vào kỳ vọng:** Tên/cách xưng hô, thông tin cơ bản của trẻ, cách phụ huynh nhìn nhận mục tiêu phát triển, sở thích/tính cách được quan sát, lưu ý quan trọng (nếu có). Không buộc cung cấp toàn bộ dữ liệu nhạy cảm.

**Kết quả:** Hồ sơ gia đình và hồ sơ trẻ được khởi tạo; thông tin thiếu, chưa xác nhận và khác biệt giữa nguồn được đánh dấu rõ. Trẻ được mời tham gia sau với ngôn ngữ phù hợp lứa tuổi.

**Cần thử nghiệm:** 3–4 câu hỏi mở đầu có đủ tạo giá trị đầu tiên không? Phụ huynh có tin kết quả tóm tắt không?

### S02 – Định hướng phát triển

Phụ huynh muốn hiểu con đang cần gì và nên ưu tiên mục tiêu nào. AI cung cấp các góc nhìn từ kiến thức được kiểm chứng, làm rõ mức chắc chắn và giới hạn, nhưng không gắn nhãn trẻ hoặc ra quyết định thay phụ huynh. Kết quả là mục tiêu được xác nhận, có căn cứ và phù hợp bối cảnh.

### S03 – Chuyển mục tiêu thành kế hoạch

AI hỗ trợ phân rã mục tiêu thành hoạt động phù hợp lịch gia đình, thời lượng và mức tự chủ. Kế hoạch quan trọng cần được người có thẩm quyền chấp thuận. AI chỉ hỗ trợ thực hiện trong phạm vi kế hoạch đã chốt; các gợi ý phát triển mới chưa được tự động đưa ra khi chưa có cơ chế kiểm chứng.

### S04 – Trẻ thực thi và báo cáo

Trẻ chỉ báo cáo những nhiệm vụ được định nghĩa là cần theo dõi, bằng thao tác ngắn, giọng nói hoặc hình ảnh khi phù hợp. Trạng thái hoàn thành là dữ liệu tự báo cáo, **không** mặc nhiên chứng minh tiến bộ năng lực. Những hoạt động không cần báo cáo không bị biến thành nghĩa vụ nhập liệu.

### S05 – Trẻ phản hồi khó khăn

Trẻ có thể giải thích vì sao hoạt động không phù hợp. AI ưu tiên lắng nghe, xác định ngữ cảnh, giúp trẻ diễn đạt lập luận, chuẩn bị đối thoại với bố mẹ. Trẻ/phụ huynh đều có thể yêu cầu xem lại kế hoạch. Thay đổi quan trọng tuân thủ quyền phê duyệt của chế độ tự chủ đang áp dụng.

### S06 – Child Journal riêng tư

Trẻ có không gian viết/kể chuyện, xem lại nhật ký và tự chọn chia sẻ nội dung. Không lưu voice gốc theo định hướng đã nêu. Ngoại lệ an toàn nghiêm trọng phải theo chính sách bảo vệ, không đồng nghĩa với việc phụ huynh được đọc toàn bộ nhật ký.

**Chính sách xóa đã thống nhất ở 2.4:** Ẩn ngay khi trẻ yêu cầu xóa, dự kiến xóa vĩnh viễn sau 60 ngày cùng dữ liệu suy ra có thể truy vết, trừ ngoại lệ lưu giữ hợp lệ đã công khai. Trẻ phải được giải thích thời gian xử lý và giới hạn thực tế, nhất là dữ liệu đã chia sẻ.

**Quyết định Q3/R1:** AI có thể tự động trích xuất **insight có cấu trúc để lưu trong hồ sơ riêng của trẻ**, chỉ được chia sẻ với phụ huynh khi trẻ cho phép. **Không lưu bản tóm tắt tường thuật do AI tạo ra** như một bản nhật ký thứ hai. Các insight phải có nguồn gốc truy vết để xử lý xóa liên đới theo Q7. Loại insight được phép lưu, cách phản đối/sửa và giới hạn thông tin nhạy cảm là yêu cầu nghiên cứu/thiết kế tiếp theo.

**Quyết định R2:** Mặc định không tự động nhắc hoặc gợi lại nội dung Nhật ký ở phiên khác; AI chỉ sử dụng khi trẻ mở lại mục đó. Mong muốn nhắc theo **loại nội dung** được đưa vào danh mục nghiên cứu; không mặc định triển khai cho đến khi có tiêu chí và quyền rõ ràng. Ngoại lệ an toàn được xử lý theo quy trình riêng.

### S07 – Đánh giá tiến độ

Phụ huynh hoặc trẻ yêu cầu đánh giá. AI phân biệt quan sát, dữ liệu tự báo cáo, điều chưa rõ và giả thuyết. Trẻ được phản hồi. AI không tự ý chuyển chế độ, thay mục tiêu hoặc phê duyệt quyết định thay người có thẩm quyền.

### S08 – Khám phá và định hướng tương lai

Trẻ khám phá sở thích, hoạt động, kỹ năng, nghề nghiệp và trường học phù hợp giai đoạn. Sản phẩm giúp trẻ đặt câu hỏi, tìm thông tin, chuẩn bị đối thoại với gia đình; tránh khẳng định chắc chắn “trẻ hợp với nghề X”. Nội dung nghề nghiệp có thể bắt đầu sớm, không phải chờ đến cấp ba.

### S09 – Emotional Check-in

**Bối cảnh:** Sau khi trẻ trở về từ **buổi học chính ở trường**, ứng dụng có thể đưa ra một lời mời check-in nhẹ nhàng. Trẻ có thể mệt, hào hứng, chán nản, không muốn nói nhiều hoặc đang cần hỗ trợ. Đây không phải lịch bắt buộc.

**Kịch bản:** Khi đã bật lời mời, ứng dụng hỏi ngắn sau buổi học chính (thời điểm dựa trên lịch đã xác nhận hoặc tương tác của trẻ, không tự suy đoán vị trí). Trẻ có thể bỏ qua hoặc tắt lời mời. AI đưa lựa chọn đơn giản về cảm xúc/trạng thái. Khi trẻ báo đang mệt, AI có thể hỏi ít hơn, giảm độ phức tạp, rút ngắn phiên hoặc đề nghị dừng. Khi trẻ muốn nói, AI lắng nghe theo nhịp của trẻ.

**Yêu cầu:** Không ép khai báo; không tự ý hỏi lặp nếu trẻ bỏ qua/tắt; không gắn nhãn bệnh lý; không xem một lượt check-in là chẩn đoán; không mặc định báo cáo trạng thái cảm xúc riêng tư cho phụ huynh. Muốn dùng dữ liệu cảm xúc làm chỉ số dài hạn cần chính sách thông báo, quyền truy cập và lưu trữ riêng.

**Đo lường thử nghiệm:** tỷ lệ trẻ tự nguyện trả lời, tỷ lệ bỏ qua, mức độ hoàn tất hội thoại, phản hồi của trẻ về mức dễ chịu. Không sử dụng một thang điểm đơn giản để suy ra sức khỏe tâm thần.

### S10 – Daily Reflection / Kid Journey

**Bối cảnh:** Trước khi ngủ, trẻ có thể muốn ghi lại chuyện đã xảy ra trong ngày.

**Kịch bản:** Trẻ **tùy chọn** viết hoặc kể ngắn trước khi ngủ; AI lắng nghe và đặt ít câu hỏi phù hợp trạng thái cảm xúc, không kéo dài tương tác nếu trẻ muốn nghỉ. Nhật ký được lưu để trẻ đọc lại. Không lưu bản tổng hợp tường thuật AI; insight có cấu trúc có thể vào hồ sơ riêng của trẻ theo R1, có khả năng xóa liên đới.

**Ví dụ:** Trẻ kể đã quên mang sách và bị giáo viên nhắc. **Theo R2 hiện tại, AI không tự động dùng sự kiện trong nhật ký để nhắc trẻ hôm sau**. AI có thể trao đổi khi trẻ tự mở lại nhật ký. Trường hợp tương lai muốn biến một số loại sự kiện thành nhắc nhở, phải nghiên cứu loại thông tin được phép, mục đích, sự đồng ý, mức độ nhạy cảm và cách tránh tiết lộ cho phụ huynh; không mặc định tự động bật.

**Cần kiểm chứng:** Trẻ có thực sự muốn ghi nhật ký vào buổi tối không? Hoạt động này có tạo áp lực không? Có nên có lựa chọn không nhắc hoặc đổi thời gian?

### S11 – Low-friction Data Collection

**Mục tiêu UX:** Tối đa 3–4 câu hỏi thiết yếu tại bước đầu; phần còn lại được bổ sung theo ngữ cảnh sử dụng.

**Kênh:** văn bản, voice, ảnh lịch học/tài liệu phù hợp. AI trích xuất rồi hỏi phụ huynh xác nhận các dữ liệu quan trọng (ví dụ ngày/giờ, tên, lưu ý sức khỏe). Không tự đoán dữ liệu còn thiếu.

**Đề xuất bốn nhóm câu hỏi bắt đầu:**
1. Ai đang tham gia gia đình? Tên/cách gọi, tuổi hoặc lớp của trẻ.
2. Phụ huynh mong muốn điều gì từ ứng dụng, và khó khăn lớn nhất hiện tại?
3. Phụ huynh đang quan sát điều gì ở trẻ: sở thích, điểm mạnh, những khó khăn cần lưu ý?
4. Có thông tin cần biết ngay để lập kế hoạch an toàn không (ví dụ lịch học, yêu cầu chăm sóc quan trọng)? Có thể bổ sung bằng ảnh, voice hoặc sau này.

Không buộc nhập dữ liệu sức khỏe nếu không cần cho một mục đích rõ ràng. Ảnh tài liệu cần được xem trước/kiểm tra để tránh thu thập dữ liệu người khác không cần thiết.

**Quy chuẩn UX giả thuyết:** giải thích tại sao hỏi; một lần hỏi một ý; cho phép bỏ qua; cho phép sửa thông tin; ưu tiên nội dung đã biết; tránh lặp câu hỏi; hỏi thêm theo nhu cầu có thật thay vì ép hoàn thiện 100% hồ sơ.

## 5. Core Loop đề xuất

1. Phụ huynh giúp hệ thống hiểu bối cảnh trẻ.
2. Gia đình xác nhận mục tiêu và kế hoạch.
3. Trẻ thực thi với sự hỗ trợ được ủy quyền.
4. Trẻ phản hồi tối giản; có thể yêu cầu xem xét.
5. Gia đình đánh giá, cân nhắc và phê duyệt điều chỉnh.
6. Hồ sơ phát triển được cập nhật từ các nguồn dữ liệu được phép, với nguồn gốc và độ tin cậy rõ ràng.

**Child Journal/Kid Journey** là trải nghiệm riêng tư. AI có thể cập nhật **hồ sơ riêng của trẻ** bằng insight có cấu trúc theo R1, nhưng không tự chuyển sang hồ sơ dùng chung hay gửi phụ huynh. R2 chưa cho phép chủ động nhắc từ nội dung Journal. Khi xóa nhật ký cần xóa liên đới insight có thể truy vết.

## 6. Rủi ro và phản biện

- **R1 được đồng bộ với 2.4:** Cập nhật hồ sơ riêng tự động vẫn có nguy cơ lưu thông tin nhạy cảm, tạo suy luận sai hoặc tiết lộ gián tiếp nếu phân quyền lỗi. Không chia sẻ insight mặc định; cần cơ chế kiểm tra, sửa và xóa.
- **Xóa dữ liệu:** Nếu nhật ký đã tạo ra thuộc tính hồ sơ, xóa nhật ký phải xử lý cả dữ liệu suy ra có thể truy vết theo chính sách Q7, trừ ngoại lệ đã công khai. Điều này cần được thiết kế chứ không chỉ tuyên bố.
- **Cảm xúc:** Dữ liệu tự khai không phải kết quả đánh giá lâm sàng; cần phòng tránh kết luận quá mức và xếp hạng cảm xúc.
- **Nhắc việc từ nhật ký:** R2 hiện không cho phép tự động nhắc. Muốn mở rộng theo loại nội dung cần nghiên cứu riêng tiêu chí, đồng ý, tính hữu ích và rủi ro lộ nội dung.
- **Trải nghiệm cuối ngày:** Không nên làm gián đoạn giấc ngủ, kéo dài tương tác hoặc gây áp lực phải chia sẻ.
- **Voice/ảnh:** Trích xuất có thể sai; cần xác nhận trước khi lưu dữ liệu quan trọng.
- **Onboarding 3–4 câu:** Là mục tiêu thiết kế chứ không phải bảo đảm phù hợp mọi gia đình; cần thử nghiệm tỷ lệ hoàn tất và chất lượng dữ liệu.
- **Thông tin độ tuổi:** Người chưa thành niên và người từ 18 tuổi có chính sách quyền khác nhau; không dùng phụ huynh làm người phê duyệt mặc định cho người trưởng thành.

## 7. Quyết định R1–R3 đã chốt và câu hỏi nghiên cứu còn mở

### R1 — ĐÃ CHỐT: Hồ sơ riêng của trẻ
- **Chọn C:** AI tự động lưu thông tin suy ra có cấu trúc từ Journal trong **hồ sơ riêng của trẻ**; chỉ chia sẻ khi trẻ cho phép.
- Không lưu bản tóm tắt tường thuật AI lâu dài, không tự cập nhật hồ sơ chung hoặc báo cáo cho cha mẹ.
- **Còn mở để nghiên cứu:** loại insight nào được phép tự động tạo, phân biệt sở thích với cảm xúc/sự kiện nhạy cảm, cơ chế để trẻ kiểm tra/sửa, thời hạn lưu và xóa dây chuyền từ nguồn Journal.

### R2 — ĐÃ CHỐT MẶC ĐỊNH: Không tự nhắc từ Journal
- **Chọn C:** AI không tự động nhắc dựa trên nội dung nhật ký; dùng nội dung đó khi trẻ chủ động mở lại.
- **Bổ sung đã ghi nhận:** Không phải mọi nội dung đều đáng nhắc. Nghiên cứu riêng khả năng nhắc **theo loại nội dung**, có quy tắc và sự đồng ý thích hợp. Chưa coi việc nghiên cứu này là quyền thực thi mặc định.
- Ngoại lệ an toàn Q6 của phần 2.4 là quy trình riêng, không phải nhắc nhở thông thường.

### R3 — ĐÃ CHỐT: Tùy chọn và có ngữ cảnh
- **Chọn A:** Emotional Check-in và Kid Journey không bắt buộc, trẻ được bỏ qua hoặc tắt lời mời.
- **Bổ sung:** Emotional Check-in được **đề xuất sau mỗi buổi học chính khi trẻ trở về từ trường**, không phải câu hỏi liên tục sau mọi hoạt động. Thời điểm cần dựa trên lịch/thiết lập hoặc xác nhận, không mặc định biết chính xác trẻ ở đâu.
- Kid Journey là lời mời nhẹ trước giờ ngủ nếu trẻ muốn, không được làm giảm thời gian nghỉ ngơi.

### Câu hỏi chưa bắt buộc chốt trong 2.5
1. Quy tắc phân loại **insight có cấu trúc** được phép lưu trong hồ sơ riêng; khả năng trẻ xem và sửa kết quả AI diễn giải sai.
2. Quy tắc **nhắc nhở có chọn lọc** từ nội dung riêng tư nếu sản phẩm quyết định triển khai sau: loại nội dung, quyền cho phép, phương thức thông báo, ngữ cảnh nhạy cảm và cơ chế thu hồi.
3. Cách xác định **thời điểm sau buổi học chính** và tối đa số lần mời check-in; dữ liệu cảm xúc có được lưu dài hạn không, ai có quyền xem.
4. Xử lý insight liên quan nhiều nguồn khi trẻ xóa một mục Journal; dữ liệu an toàn ngoại lệ; hạn lưu và pháp lý về xóa sau 60 ngày.
5. Quy chuẩn onboarding 3–4 câu hỏi, kiểm chứng chất lượng trích xuất voice/ảnh và quy trình xác nhận thông tin sức khỏe/lịch học.

## 8. Điều kiện hoàn thiện

**2.5 đã chốt ở mức Product Blueprint** theo Q1–Q4 và R1–R3. Các điểm còn mở ở trên là hạng mục nghiên cứu/thiết kế, **không phải quyết định mặc định được phép triển khai**. Chính sách R1–R3 được đồng bộ sang tài liệu 2.4, trong khi điều kiện an toàn Q6 và xóa liên đới Q7 vẫn giữ nguyên.

## 9. Phương pháp kiểm chứng đề xuất

- Phỏng vấn phụ huynh tiểu học, THCS và THPT (mục tiêu nghiên cứu cả ba cấp); trẻ tham gia nghiên cứu phải có quy trình phù hợp độ tuổi và sự đồng ý cần thiết.
- Kiểm tra thời gian hoàn thành onboarding và mức độ sửa dữ liệu do AI trích xuất.
- Cho trẻ thử báo cáo nhiệm vụ, từ chối hoạt động, đề nghị sửa lịch và bỏ qua Emotional Check-in.
- Kiểm tra trẻ có hiểu sự khác biệt giữa nhật ký gốc, insight riêng do AI suy ra và dữ liệu được chủ động chia sẻ; liệu trẻ có nhận ra dữ liệu suy ra sai và có thể yêu cầu xóa.
- Đo phản hồi của trẻ với Kid Journey một cách tự nguyện, không thưởng/phạt dựa trên mức độ chia sẻ tâm sự.

---

*Tài liệu này phân biệt quyết định đã chốt, định hướng sản phẩm, giả thuyết nghiên cứu và vấn đề còn mở; chưa được xem là kết quả khảo sát hoặc tuyên bố bảo đảm pháp lý/kỹ thuật.*
