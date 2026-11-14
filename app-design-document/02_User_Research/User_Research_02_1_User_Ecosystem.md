# 02.1 – USER ECOSYSTEM

**Dự án:** Nền tảng AI đồng hành phát triển trẻ và thanh thiếu niên  
**Thuộc phần:** 02 – User Research & User Types  
**Trạng thái:** Đã thống nhất về nhóm vai trò và nguyên tắc; quyền truy cập chi tiết còn cần thiết kế/kiểm chứng  
**Ngày cập nhật:** 06/11/2026

> **Quy ước:** **[Đã chốt]** là định hướng người xây dựng sản phẩm xác nhận; **[Giả thuyết]** cần nghiên cứu/kiểm chứng; **[Còn mở]** chưa quyết định. Phần 2.1 xác định hệ sinh thái vai trò; chưa phải đặc tả tính năng hay mô hình phân quyền kỹ thuật.

## 2.1.1. Mục tiêu

Xác định ai trực tiếp sử dụng sản phẩm, ai quản lý/ra quyết định, ai đóng góp kiến thức, ai cung cấp thông tin bên ngoài và những quan hệ cần có trong một gia đình. Làm rõ ranh giới giữa **người dùng trực tiếp**, **người góp phần xây dựng chất lượng tri thức** và **nguồn thông tin**.

## 2.1.2. Nhóm người dùng chính – Primary Users

### A. Phụ huynh / người giám hộ

**[Đã chốt]** Phụ huynh đồng thời là người tương tác với AI, tham gia lập định hướng, quản lý hoặc giám sát kế hoạch và ra quyết định trong phạm vi trách nhiệm phù hợp.

Các vai trò chức năng có thể đồng thời tồn tại:

- **Decision Maker:** thống nhất mục tiêu và quyết định các hoạt động cần sự đồng ý của người giám hộ.
- **AI Collaborator:** trao đổi với AI để hiểu con, kiểm tra đề xuất và điều chỉnh định hướng.
- **Development Coordinator:** phối hợp nguồn lực, lịch trình, trường lớp và các thành viên liên quan.

**Nguyên tắc:** Không thiết kế sản phẩm theo giả định phụ huynh phải tự nhập mọi dữ liệu, tự nghiên cứu mọi lựa chọn và tự lập toàn bộ kế hoạch. AI cần giảm công việc tổ chức và phân tích, đồng thời giữ quyền phê duyệt phù hợp cho con người.

### B. Trẻ / thanh thiếu niên / người dùng trưởng thành

**[Đã chốt]** Trẻ là **người dùng chủ động**, không đơn thuần là hồ sơ để phụ huynh theo dõi. Trẻ có thể giao tiếp với AI, thực hiện hoạt động, báo cáo tiến độ, nêu cảm nhận và đề xuất điều chỉnh tùy năng lực.

Phân biệt:

- **Active User:** thực sự sử dụng ứng dụng và đóng góp thông tin/đánh giá.
- **Autonomous User:** có mức quyền tự định hướng và quyết định cao hơn.

Hai thuộc tính này không đồng nhất. Mức tự chủ được điều chỉnh theo năng lực, hoàn cảnh và phạm vi quyết định, không chỉ theo tuổi.

## 2.1.3. Chế độ tự chủ – Autonomy Modes

**[Đã chốt]** Phạm vi phát triển sản phẩm dài hạn là **0–23 tuổi**; ba chế độ dưới đây là **mặc định tham chiếu theo tuổi**, không phải mức trần cứng:

| Chế độ | Nhóm tuổi tham chiếu | Cách vận hành chính |
|---|---|---|
| **Parent-led** | 0–6 | Phụ huynh tổ chức và trực tiếp hỗ trợ thực hiện; giao diện thiên về phụ huynh |
| **Child-executed** | 6–15 – **trọng tâm sản phẩm** | Trẻ tự thực hiện và báo cáo ở mức phù hợp; phụ huynh định hướng, hỗ trợ, giám sát |
| **Child-directed** | Trên 15 | Người trẻ chủ động đề xuất định hướng/kế hoạch, thực thi; phụ huynh chuyển dần sang vai trò tư vấn |

**[Đã chốt]** Phụ huynh có thể lựa chọn mức tự chủ theo năng lực thực tế của trẻ. Độ tuổi không tự động xác định toàn bộ quyền và trách nhiệm.

**Lưu ý:** Từ 18 tuổi trở lên, sản phẩm không giả định phụ huynh có quyền giám sát mặc định. Chia sẻ dữ liệu và sự tham gia của phụ huynh cần dựa trên quyền của người dùng trưởng thành và thỏa thuận phù hợp. Ở giai đoạn này, giá trị sản phẩm thiên về tư vấn định hướng phát triển, học tập và nghề nghiệp.

**[Còn mở]** Các quy tắc chuyển chế độ, quyền đồng ý, ngoại lệ đối với từng hoạt động và mức tự chủ cụ thể theo năng lực sẽ được làm rõ trong phần phân quyền và thiết kế trải nghiệm.

## 2.1.4. Người đóng góp tri thức – Knowledge Contributors

### C. Chuyên gia / nhà nghiên cứu / người thẩm định

**[Đã chốt]** Vai trò chính trong giai đoạn đầu là **phát triển, thẩm định và cập nhật hệ thống kiến thức**, không phải nhóm người dùng tư vấn trực tiếp trong MVP.

Các trách nhiệm có thể gồm:

- Đề xuất hoặc thẩm định nội dung theo từng chuyên môn.
- Làm rõ phạm vi áp dụng và giới hạn của khuyến nghị.
- Xem xét thay đổi khi bằng chứng hoặc hướng dẫn chuyên môn cập nhật.

**[Giả thuyết]** Từng lĩnh vực như giáo dục, dinh dưỡng, tâm lý, phát triển trẻ em cần cơ chế thẩm định tương ứng; không mặc định một chuyên gia có thẩm quyền ở mọi lĩnh vực.

## 2.1.5. Nguồn thông tin bên ngoài – External Information Sources

### D. Trường học / giáo viên

**[Đã chốt]** Trường học **không phải nhóm người dùng trực tiếp** ở giai đoạn này. Sản phẩm không đặt mục tiêu trở thành hệ thống quản lý trường học.

Tuy nhiên, dữ liệu về tình hình học tập, sinh hoạt ở trường và nhận xét của giáo viên có thể hữu ích nếu được phụ huynh hoặc trẻ cung cấp phù hợp quyền và sự đồng ý.

**[Còn mở]** Cách xác minh thông tin, kết nối dữ liệu trường học và thẩm quyền sử dụng sẽ nghiên cứu sau; chưa mặc định có tích hợp với trường.

## 2.1.6. Cấu trúc gia đình – Family Structure

**[Đã chốt]** Sản phẩm cần hỗ trợ từ đầu:

- **Nhiều phụ huynh/người giám hộ** trong một gia đình.
- **Nhiều trẻ/hồ sơ phát triển** trong một gia đình.
- Quan hệ, vai trò và quyền truy cập được quản lý theo từng thành viên và từng hồ sơ trẻ.

**[Đã chốt từ 2.2]** Trải nghiệm có thể xoay quanh **một người quản lý chính**, nhưng cho phép các thành viên khác tham gia theo vai trò.

**[Còn mở]** Quyền dành cho ông bà/người chăm sóc được ủy quyền; mô hình gia đình nhiều hộ; phân xử bất đồng quyền giám hộ; các trường hợp đặc biệt có thể triển khai ở giai đoạn sau. Việc dự kiến mô hình dữ liệu linh hoạt **không đồng nghĩa** tất cả luồng quyền phức tạp phải xuất hiện trong MVP.

## 2.1.7. Nhật ký của trẻ, quyền riêng tư và an toàn

**[Đã chốt định hướng]** Trẻ có khu vực nhật ký/tâm sự với AI. Nếu trẻ sử dụng giọng nói, định hướng hiện tại là **không lưu bản ghi âm thô**, mà chỉ giữ bản tóm tắt nội dung cần thiết. Đây vẫn là dữ liệu nhạy cảm, cần được quản trị như dữ liệu riêng tư.

**[Đã chốt định hướng]** Hệ thống cần có cơ chế nhận diện tín hiệu tiêu cực kéo dài hoặc nguy cơ tự gây hại, phản ứng hỗ trợ phù hợp và quy trình chuyển tiếp đến người lớn đáng tin cậy/hỗ trợ khẩn cấp khi cần. Một dấu hiệu nguy cơ nghiêm trọng đơn lẻ cũng có thể cần hành động; không đợi xu hướng lặp lại.

**[Còn mở]** Phụ huynh được xem nội dung nào, khi nào chỉ xem tóm tắt, khi nào kích hoạt cảnh báo, mức minh bạch với trẻ, thời hạn lưu trữ/xóa, sai sót cảnh báo và trách nhiệm đánh giá chuyên môn. Không mặc định AI có thể chẩn đoán trạng thái sức khỏe tâm thần hoặc phát hiện nguy cơ với độ chính xác tuyệt đối.

**[Đã chốt định hướng]** Trẻ có thể đề xuất thay đổi mục tiêu/kế hoạch; phụ huynh phê duyệt các quyết định thuộc phạm vi giám hộ. Quyết định thường nhật ít rủi ro nên có mức tự chủ phù hợp, tránh bắt trẻ xin duyệt mọi thao tác.

## 2.1.8. Nguyên tắc thiết kế hệ sinh thái

1. **Child-centered:** phát triển và lợi ích của trẻ/người trẻ là trọng tâm.
2. **Dual-user:** phụ huynh và trẻ đều là người dùng trực tiếp, với mục tiêu và trải nghiệm riêng.
3. **Age-appropriate & capability-based autonomy:** quyền tham gia tăng theo khả năng, không khóa cứng theo tuổi.
4. **Family-based:** hỗ trợ nhiều thành viên và nhiều hồ sơ phát triển.
5. **Privacy & Permission:** quyền truy cập theo vai trò, hoàn cảnh và sự đồng ý thích hợp.
6. **Expert-validated:** nền tảng tri thức cần quy trình kiểm chứng và cập nhật chuyên môn.

## 2.1.9. Kết luận và trạng thái

**Đã chốt:** phụ huynh + trẻ là người dùng chính; chuyên gia đóng góp tri thức; trường học là nguồn thông tin bên ngoài, không phải người dùng mục tiêu; nhiều phụ huynh/nhiều trẻ ngay từ đầu; ba chế độ tự chủ linh hoạt; nhóm Child-executed là trọng tâm.

**Chưa chốt tại mục 2.1:** ma trận quyền chi tiết, quyền xem nhật ký, ngưỡng và quy trình cảnh báo, hành vi ở các trường hợp gia đình đặc biệt, tiêu chí chính xác chuyển chế độ.

**Câu hỏi cần chốt ngay để hoàn thành 2.1:** Không còn. Các vấn đề còn mở sẽ được xử lý ở phần User Needs, Privacy/Permission và thiết kế sản phẩm tương ứng.
