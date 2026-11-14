# 01 – PRODUCT VISION

**Dự án:** Nền tảng AI đồng hành phát triển trẻ và thanh thiếu niên  
**Trạng thái:** Bản làm việc, cập nhật theo các quyết định đến 06/11/2026  
**Phạm vi dài hạn:** 0–23 tuổi  
**Trọng tâm sản phẩm ban đầu:** Nhóm trẻ có khả năng tự thực thi, dự kiến 6–15 tuổi

> **Quy ước:** **[Đã chốt]** là định hướng do chủ sản phẩm xác nhận; **[Giả thuyết]** cần kiểm chứng với người dùng hoặc nghiên cứu; **[Còn mở]** chưa quyết định.

## 1.1. Product Concept — Ý tưởng sản phẩm

**[Đã chốt]** Ứng dụng là nền tảng hỗ trợ phụ huynh hiểu, định hướng và đồng hành cùng quá trình phát triển của con. Nền tảng sử dụng AI kết hợp với hệ thống kiến thức giáo dục và phát triển con người đã được kiểm chứng để đề xuất định hướng phù hợp với từng cá nhân, hỗ trợ thực hiện, theo dõi tiến độ và điều chỉnh theo thời gian.

Sản phẩm phục vụ **hai nhóm người dùng trực tiếp**:

- **Phụ huynh/người giám hộ:** hiểu con, xây dựng định hướng, phối hợp kế hoạch, theo dõi và hỗ trợ ra quyết định.
- **Trẻ/thanh thiếu niên/người dùng trưởng thành:** hiểu bản thân, tham gia xây dựng mục tiêu, thực hiện hoạt động, phản hồi và tăng dần quyền tự chủ.

**[Đã chốt]** Trọng tâm không chỉ là đưa ra lời khuyên hoặc nhắc việc: AI cần **giảm khối lượng nghiên cứu, phân tích, lập kế hoạch và tổ chức thực hiện** mà phụ huynh đang phải tự làm.

## 1.2. Problem Statement — Vấn đề cần giải quyết

**[Đã chốt]**

1. Phụ huynh khó xác định đầy đủ những lĩnh vực phát triển quan trọng, cách định hướng phù hợp và cách đánh giá tiến bộ.
2. Kiến thức giáo dục, dinh dưỡng, tâm lý và phát triển trẻ phân tán; phương pháp khác nhau và khó đánh giá mức độ chứng cứ, tính phù hợp với từng trẻ.
3. Dữ liệu về sở thích, năng lực, tính cách, khó khăn, trải nghiệm và thay đổi của con thường nằm rải rác trong trí nhớ, ghi chú và nhiều ứng dụng.
4. Công cụ quản lý hiện có có thể giúp nhắc việc, nhưng phụ huynh vẫn phải tự đảm nhận phần lớn việc tìm hiểu, lựa chọn, lập kế hoạch và điều chỉnh.
5. Trẻ cần một cách phù hợp với lứa tuổi để tham gia, thực hiện, phản hồi và dần hiểu bản thân thay vì chỉ làm theo chỉ đạo.

**[Giả thuyết]** Một hệ thống có thể tích lũy hiểu biết về cá nhân, gắn kiến thức đã thẩm định với hành động hằng ngày và hỗ trợ cả hai phía sẽ tạo giá trị sử dụng lâu dài.

## 1.3. Target Users — Người dùng mục tiêu

**[Đã chốt]**

- **Người trả tiền:** phụ huynh/gia đình trong mô hình ban đầu.
- **Người sử dụng trực tiếp:** phụ huynh và trẻ; hai trải nghiệm riêng, liên kết dữ liệu theo quyền.
- **Phạm vi định hướng dài hạn:** 0–23 tuổi.
- **Trọng tâm triển khai ban đầu:** giai đoạn trẻ có thể tự thực hiện và báo cáo, dự kiến 6–15 tuổi; thiết kế bao quát nhóm này nhưng lựa chọn một phân nhóm để kiểm chứng trước.
- **Cấu trúc gia đình:** hỗ trợ nhiều phụ huynh/người chăm sóc và nhiều hồ sơ trẻ từ đầu, với vai trò và quyền phù hợp.
- **Chuyên gia:** đóng góp, kiểm định và duy trì kho kiến thức; không mặc định là người cung cấp tư vấn trực tiếp trong MVP.
- **Trường học:** không phải nhóm người dùng mục tiêu ở giai đoạn đầu; thông tin học đường có thể là nguồn đầu vào do gia đình/trẻ cung cấp.

### Hai trục phân loại cần tách biệt

**Development Stage — Giai đoạn phát triển:** theo độ tuổi, đặc điểm và nhu cầu phát triển; dùng để chọn kiến thức, hoạt động và tiêu chí phù hợp.

**Autonomy Mode — Chế độ tự chủ:** theo năng lực thực tế để tham gia quyết định, thực hiện và báo cáo. **Tuổi không phải giới hạn cứng**; phụ huynh có thể chọn hoặc điều chỉnh chế độ phù hợp với trẻ chưa thành niên.

| Chế độ vận hành | Độ tuổi tham chiếu | Người chủ động chính | Vai trò của AI |
|---|---|---|---|
| Parent-led — Phụ huynh thực thi | Khoảng 0–6 | Phụ huynh tổ chức và hỗ trợ thực hiện | Tư vấn và hỗ trợ phụ huynh |
| Child-executed — Trẻ tự thực thi | Khoảng 6–15; **CORE** | Trẻ thực hiện, phản hồi; phụ huynh định hướng/giám sát | Đồng hành với cả trẻ và phụ huynh |
| Child-directed — Người trẻ dẫn dắt | Khoảng trên 15–23 | Người trẻ đề xuất, lập kế hoạch và thực hiện | Tư vấn phát triển cá nhân, định hướng học tập/nghề nghiệp |

**Lưu ý quan trọng:** Các mốc tuổi chỉ là tham chiếu thiết kế, không phải chuẩn năng lực. Từ 18 tuổi, quyền riêng tư và quyền quyết định của người dùng trưởng thành không mặc định thuộc phụ huynh. Việc chia sẻ thông tin/nhận hỗ trợ dựa trên sự đồng ý và thỏa thuận phù hợp; trọng tâm chuyển từ quản lý sang tư vấn.

## 1.4. Core Values — Giá trị cốt lõi

1. **Child Understanding:** hình thành hiểu biết liên tục, có ngữ cảnh về sở thích, nhu cầu, điểm mạnh, khó khăn và thay đổi của cá nhân; không gán nhãn cố định.
2. **Development Guidance:** hỗ trợ xác lập mục tiêu và định hướng phù hợp giai đoạn phát triển, điều kiện gia đình và đặc điểm riêng.
3. **Active Assistance:** AI hỗ trợ nghiên cứu, tổng hợp, đề xuất và điều phối các bước thực tế; không chỉ nhắc việc.
4. **Self-discovery & Agency:** giúp trẻ khám phá sở thích, khả năng, trải nghiệm và tăng dần quyền tham gia quyết định.
5. **Development Tracking:** theo dõi hoạt động, phản hồi và thay đổi theo thời gian, với nhận định có giới hạn và mức độ chắc chắn rõ ràng.
6. **Connection:** về dài hạn, tạo điều kiện kết nối gia đình với chuyên gia, trung tâm và các nguồn lực phát triển phù hợp.

## 1.5. Differentiation — Điểm khác biệt dự kiến

**[Đã chốt về định hướng; chưa xác thực lợi thế thị trường]**

- **Parent Management Tool → AI Parenting/Development Assistant:** giảm việc phụ huynh phải tự lập kế hoạch và tự nghiên cứu.
- **Evidence-based Knowledge:** ưu tiên kho kiến thức do đơn vị vận hành thẩm định, quy tắc có cấu trúc và phản hồi có điều kiện; không coi nội dung internet bất kỳ là bằng chứng.
- **Multidimensional Development:** không giới hạn ở thành tích học tập.
- **Continuous Understanding:** tích lũy thông tin theo thời gian và cập nhật nhận định khi có dữ liệu mới.
- **Dual-user Experience:** phụ huynh và trẻ có trải nghiệm, quyền hạn và mục đích tương tác khác nhau.
- **Adaptive Autonomy:** chế độ vận hành điều chỉnh theo năng lực, không khóa cứng theo tuổi.
- **Potential Discovery:** hỗ trợ khám phá sở thích, thế mạnh và lựa chọn tương lai mà không dự đoán định mệnh hay áp đặt nhãn năng lực.

**[Giả thuyết]** Vòng lặp giá trị trọng tâm: **Định hướng → Thực thi → Phản hồi → Phân tích → Điều chỉnh → Tiếp tục thực thi**.

## 1.6. Long-term Vision — Tầm nhìn dài hạn

**[Đã chốt về định hướng]** Trong 3–5 năm, phát triển nền tảng hỗ trợ liên tục từ tuổi nhỏ đến giai đoạn trưởng thành sớm, kết hợp dữ liệu phát triển, kiến thức đã thẩm định và hỗ trợ quyết định.

Các hướng mở rộng dự kiến:

1. **AI Child Understanding Engine:** hiểu biết liên tục về bối cảnh, sở thích, phản hồi và thay đổi.
2. **Long-term Development Guidance:** định hướng và kế hoạch thay đổi theo giai đoạn; bao gồm khám phá nghề nghiệp từ trước 18 tuổi và tư vấn học tập/nghề nghiệp sau 18 tuổi.
3. **Expert & Education Center Ecosystem:** kết nối nguồn lực chuyên môn và hoạt động phù hợp.
4. **Activity & Social Matching:** gợi ý hoạt động nhóm, môi trường trải nghiệm và kết nối dựa trên sở thích, kèm bảo vệ an toàn cho trẻ.
5. **Learning & Family Shopping:** sản phẩm, công cụ học tập và dịch vụ liên quan; là khả năng mở rộng, không mặc định thuộc MVP.
6. **Family & Education Support:** hỗ trợ phối hợp giữa những người chăm sóc và các bên liên quan khi được cho phép.

## 1.7. Product Principles — Nguyên tắc sản phẩm

1. **Evidence-based:** phân biệt bằng chứng, khuyến nghị chuyên môn và giả thuyết; công khai giới hạn hiểu biết.
2. **Child-centered:** ưu tiên lợi ích, an toàn và nhu cầu phát triển của trẻ.
3. **Individualized:** điều chỉnh theo cá nhân, không áp một lịch trình hay thang đo cho mọi trẻ.
4. **Privacy-first:** dữ liệu của trẻ, kể cả bản tóm tắt nhật ký, là dữ liệu nhạy cảm cần chính sách truy cập, lưu giữ, xóa và mục đích sử dụng rõ ràng.
5. **Human-in-control:** AI hỗ trợ quyết định, không thay thế phụ huynh/chuyên gia hoặc quyền tự quyết phù hợp của người dùng.
6. **Agency & Autonomy:** trẻ được tham gia mục tiêu và phản hồi theo khả năng; quyền tự chủ tăng dần.
7. **Safety by design:** AI không tự nhận chẩn đoán tâm lý hay đảm bảo phát hiện mọi nguy cơ. Cần quy trình xử lý dấu hiệu nguy cơ, đặc biệt ý định tự làm hại bản thân, và minh bạch giới hạn riêng tư với trẻ.

## 1.8. Các quyết định liên quan đến Child Journal

**[Đã chốt về định hướng]** Trẻ có khu vực nhật ký/tâm sự; có thể trao đổi bằng giọng nói nhưng không lưu bản ghi âm gốc, thay vào đó lưu tóm tắt nội dung phù hợp. AI cần chú ý xu hướng cảm xúc tiêu cực và các dấu hiệu nguy cơ nghiêm trọng.

**[Còn mở]** Ai được đọc nội dung nào, cơ chế thông báo/escalation, lưu giữ và xóa tóm tắt, xác thực rủi ro, quy trình phản ứng khẩn cấp, khả năng trẻ hiểu và đồng ý với giới hạn bảo mật. Không nên chờ xu hướng kéo dài mới phản ứng với dấu hiệu nguy cơ cấp tính.

## 1.9. Những câu hỏi nghiên cứu còn mở

- **Development Framework:** kết hợp những khung phát triển nào, phạm vi áp dụng và mức độ bằng chứng?
- **Age-based Development:** mục tiêu, hoạt động và phương pháp thay đổi ra sao theo tuổi?
- **Autonomy & Permissions:** đánh giá và điều chỉnh chế độ tự chủ thế nào; quyền riêng tư của trẻ và người trưởng thành được xử lý ra sao?
- **AI Authority:** AI được phép đề xuất, tự động thực hiện và từ chối điều gì?
- **Potential Assessment:** khám phá năng lực mà không gán nhãn hoặc tạo thiên kiến thế nào?
- **Progress Measurement:** phân biệt tiến độ hoàn thành nhiệm vụ với sự phát triển thực chất ra sao?
- **Parent Workload:** đo lường công sức phụ huynh được giảm bằng chỉ số nào?
- **Ecosystem:** thứ tự ưu tiên, rủi ro và tính khả thi của các dịch vụ mở rộng?
- **Market Validation:** nhóm nào thực sự sẵn sàng trả tiền và duy trì sử dụng?

## 1.10. Glossary — Thuật ngữ

- **Product Vision:** tầm nhìn và lý do tồn tại của sản phẩm.
- **Child Understanding Engine:** hệ thống hình thành, cập nhật hiểu biết về cá nhân theo thời gian.
- **Development Stage:** giai đoạn phát triển; không đồng nhất với quyền sử dụng ứng dụng.
- **Autonomy Mode:** chế độ vận hành theo mức độ tự chủ.
- **Active Assistance:** AI hỗ trợ công việc thực tế, không chỉ tư vấn/nhắc việc.
- **Agency:** khả năng tham gia lựa chọn và tác động đến quyết định liên quan đến bản thân.
- **Evidence-based:** dựa trên bằng chứng được đánh giá về chất lượng và phạm vi áp dụng.
- **MVP:** phiên bản tối thiểu nhằm kiểm chứng giả thuyết sản phẩm, không phải toàn bộ tầm nhìn.

---

## Trạng thái cuối phần 1

**Đã chốt:** định hướng sản phẩm, hai nhóm người dùng, giá trị cốt lõi, trọng tâm child-executed, phạm vi dài hạn 0–23, nguyên tắc và hướng mở rộng.  
**Cần kiểm chứng:** hiệu quả thực tế, lợi thế cạnh tranh, động lực trả tiền, độ phù hợp từng nhóm tuổi.  
**Chưa chốt:** chi tiết framework phát triển, đo lường, quyền truy cập nhật ký, quy trình an toàn và phạm vi MVP chính xác.
