# 02 — User Research & User Types

**Bản tổng kết quyết định 02.1–02.6**  
**Ngày:** 06/11/2026  
**Trạng thái:** Hoàn tất Product Blueprint giai đoạn xác định nhóm người dùng và giả thuyết; **chưa hoàn thành nghiên cứu thị trường thực địa**.

## 1. Kết luận điều hành

Sản phẩm có **hai người dùng nhận giá trị khác nhau nhưng liên kết:**

- **Phụ huynh** là người quyết định/chi trả chính; muốn hiểu con, định hướng dài hạn, giảm công sức lập kế hoạch và phối hợp thực thi.
- **Trẻ** là người dùng chủ động; cần được hướng dẫn phù hợp, hỗ trợ thực thi, có tiếng nói, được lắng nghe và phát triển dần tính tự chủ.

**CORE:** học sinh Việt Nam **lớp 1–9** (tiểu học và THCS). Nghiên cứu nhu cầu cả ba cấp phổ thông; phát triển dài hạn hướng đến 0–23 tuổi. **Giả thuyết sống còn:** trẻ có tự nguyện dùng và thực thi với AI, hay chỉ làm vì phụ huynh yêu cầu?

**Vòng lặp ưu tiên:** Hiểu trẻ → Định hướng/kế hoạch → Trẻ thực thi → Trẻ phản hồi → Gia đình đánh giá/điều chỉnh.

## 2. Tóm tắt từng tiểu mục

### 02.1 — User Ecosystem

- **Primary users:** phụ huynh/người giám hộ và trẻ; Parent App, Child App cùng chia sẻ dữ liệu theo quyền.
- **Experts:** đóng góp, kiểm định và bảo trì tri thức cho hệ thống; không mặc định là người tư vấn trực tiếp trong MVP.
- **Schools/teachers:** nguồn thông tin ngữ cảnh do gia đình cung cấp; không là nhóm người dùng mục tiêu của MVP.
- **Gia đình:** hỗ trợ nhiều phụ huynh và nhiều trẻ từ nền tảng; quan hệ/permission tách biệt với hồ sơ trẻ. Quyền người chăm sóc mở rộng có thể triển khai từng giai đoạn.

### 02.2 — Parent Segmentation

- **B — Time-constrained** và **C — Development-oriented:** nhóm trọng tâm, có thể trùng nhau.
- **D — Problem-solving:** nhóm nhu cầu bổ sung theo tình huống; **A — Research-driven:** nhóm thứ cấp.
- **Giá trị chính:** hiểu con và có định hướng phát triển; **giá trị thứ hai:** giảm thời gian/công sức tìm hiểu, lên kế hoạch và tổ chức hoạt động.
- Gia đình dùng linh hoạt với một người quản lý chính, nhiều thành viên tham gia theo quyền.

### 02.3 — Child Segmentation

- Phân loại theo **cấp học thực tế**, không cố định cứng theo tuổi: 0–5 tiền tiểu học; lớp 1–5 (~6–10); lớp 6–9 (~11–14); lớp 10–12 (~15–17); sau phổ thông (~18–23).
- **CORE:** lớp 1–9; nghiên cứu cả lớp 10–12 từ đầu để định hướng mở rộng.
- Ba chế độ **Parent-led / Child-executed / Child-directed** theo năng lực, không gắn trần tuổi cứng. Phụ huynh quyết định chuyển chế độ của trẻ chưa thành niên; **một chế độ chung cho mọi hoạt động**.
- Trẻ được giải thích, phản hồi, đề nghị sửa kế hoạch. Người trưởng thành giữ quyền tự quyết và chủ động chia sẻ với phụ huynh.

### 02.4 — User Needs & Pain Points

- Phụ huynh: hiểu con, định hướng, lập kế hoạch, hỗ trợ thực thi, đánh giá và xử lý khó khăn.
- Trẻ: hiểu việc cần làm, được hỗ trợ, có quyền phản hồi, được lắng nghe, khám phá bản thân, nhìn thấy tiến bộ.
- Trọng tâm không phải công cụ chỉ nhắc việc, mà **AI hỗ trợ công việc thực tế trong phạm vi được ủy quyền**.
- **AI Authority:** Listening & Reflection và Authorized Assistance; Development Recommendation bị giới hạn trước kiểm chứng; không tự quyết định thay cha mẹ/người dùng trưởng thành. Giúp trẻ trình bày, phản biện và đối thoại tôn trọng.
- **Child Journal:** riêng tư, trẻ chọn chia sẻ; insight có cấu trúc có thể lưu vào **hồ sơ riêng của trẻ**, không tự động lộ cho phụ huynh; không lưu bản tổng hợp tường thuật AI lâu dài. Trẻ có quyền xóa với quy trình ẩn ngay/xóa sau 60 ngày kèm dữ liệu suy ra có thể truy vết, trừ ngoại lệ hợp lệ được công khai; cần kiểm tra pháp lý/kỹ thuật. Ngoại lệ bảo vệ an toàn nghiêm trọng phải có quy trình riêng.

### 02.5 — User Scenarios

- **S01:** phụ huynh khởi tạo trước, sau đó trẻ tham gia; **S02:** định hướng; **S03:** kế hoạch; **S04:** thực thi và báo cáo; **S05:** khó khăn/đề xuất; **S06:** Child Journal; **S07:** đánh giá; **S08:** khám phá bản thân; **S09:** Emotional Check-in; **S10:** Kid Journey; **S11:** nhập liệu tối giản.
- Chỉ nhiệm vụ thực sự cần theo dõi mới yêu cầu báo cáo; giao diện nhập liệu cần đơn giản.
- **Emotional Check-in:** lời mời tự nguyện sau buổi học chính, được bỏ qua/tắt; dùng để điều chỉnh nhịp hội thoại, không chẩn đoán.
- **Kid Journey:** nhật ký cuối ngày tự nguyện. AI không tự dùng chuyện riêng trong nhật ký để tạo nhắc nhở lần sau; khả năng nhắc có chọn lọc là hướng nghiên cứu sau, chưa được cấp quyền mặc định.
- **Onboarding:** mục tiêu 3–4 câu hỏi ban đầu, hỗ trợ voice, ảnh lịch học và xác nhận dữ liệu do AI trích xuất; bổ sung dần khi cần.

### 02.6 — User Prioritization

- **Q1=A:** Ưu tiên kiểm chứng vòng lặp cốt lõi.
- **Q2=A:** Nghiên cứu sâu cả tiểu học/THCS; THPT khảo sát định hướng.
- **Q3=B:** Giả thuyết cần kiểm chứng đầu tiên là **trẻ tự nguyện sử dụng và thực thi cùng AI**.
- **Q4=A:** Nghiên cứu rộng, sau đó mới chọn phạm vi MVP theo bằng chứng.
- P0: hiểu trẻ, kế hoạch, thực thi, phản hồi, đánh giá, onboarding tối giản. P1: Emotional Check-in, Self-discovery, Child Journal/Kid Journey; P2: hệ sinh thái mở rộng. **P0/P1 là ưu tiên nghiên cứu/giá trị, không phải danh sách cam kết tính năng MVP.**

## 3. Ma trận vai trò và quyền — ở mức nguyên tắc

| Hoạt động | Phụ huynh | Trẻ | AI |
|---|---|---|---|
| Thiết lập gia đình / hồ sơ ban đầu | Chủ động, xác nhận | Bổ sung theo khả năng | Hỗ trợ hỏi/trích xuất, không tự điền suy đoán quan trọng |
| Mục tiêu/kế hoạch đối với trẻ chưa thành niên | Quyết định theo chế độ và quyền | Được tham gia, đề xuất | Cung cấp thông tin, hỗ trợ trong phạm vi đã được phép |
| Thực hiện/báo cáo | Giám sát phù hợp | Chủ động làm, phản hồi, có thể từ chối | Hướng dẫn và lắng nghe, không ép buộc |
| Chuyển Autonomy Mode (trẻ chưa thành niên) | Quyết định | Có thể đề xuất | Không tự chuyển |
| Nhật ký riêng | Không tự động xem | Kiểm soát chia sẻ/xóa | Chỉ dùng theo chính sách, ngoại lệ an toàn giới hạn |
| Insight từ Journal | Chỉ nhận khi trẻ cho phép | Nằm ở hồ sơ riêng; quyền xem/sửa/xóa cần thiết kế | Không tự chia sẻ sang hồ sơ chung |
| Trên 18 tuổi | Tư vấn/tham gia khi được cho phép | Người dùng tự quyết | Hỗ trợ, không quyết định thay |

## 4. Các giả thuyết thực nghiệm cần ưu tiên

1. Trẻ có **chủ động quay lại** dùng ứng dụng mà không phải vì bị bố mẹ ép hay không?
2. AI giúp phụ huynh **tiết kiệm bao nhiêu công sức** (không chỉ cảm giác)?
3. Phụ huynh có **hiểu con tốt hơn** nhờ thông tin đúng và có thể kiểm chứng không?
4. Onboarding **3–4 câu + voice/ảnh** có giảm tỷ lệ bỏ cuộc nhưng vẫn đủ chính xác không?
5. Trẻ có hiểu và tin cơ chế **nhật ký riêng, insight riêng, quyền xóa** không?
6. Emotional Check-in sau giờ học có được trẻ đón nhận và có thực sự giảm gánh nặng tương tác không?

**Mẫu khám phá ban đầu đề xuất:** khoảng 8 gia đình tiểu học, 8 gia đình THCS và 4 gia đình THPT. Đây là kế hoạch nghiên cứu định tính, **không phải mẫu đại diện thống kê**. Cần có khảo sát/quan sát với trẻ có sự đồng ý phù hợp và quy trình bảo vệ trẻ.

## 5. Những vấn đề còn mở (không coi là đã quyết định kỹ thuật)

- Khung đánh giá phát triển và cách phân biệt hoàn thành nhiệm vụ với tiến bộ thật.
- Chính sách và loại **insight có cấu trúc** được phép lưu từ nhật ký; độ tin cậy, tính nhạy cảm, nguồn và quyền sửa/xóa.
- Ngoại lệ nhắc nhở từ nhật ký theo loại nội dung nếu sau này nghiên cứu; **mặc định hiện tại không tự nhắc**.
- Điều kiện sử dụng, kiểm định và kiểm soát **Development Recommendation**.
- Thiết kế quyền truy cập theo thành viên gia đình, dữ liệu trẻ và người trưởng thành.
- Quy trình an toàn đối với trẻ, bảo vệ khi rủi ro đến từ người chăm sóc, giới hạn AI; kiểm tra pháp lý dữ liệu trẻ ở thị trường triển khai.
- Xóa sau 60 ngày: bảo đảm khả năng truy vết insight, xử lý backup/log, trường hợp lưu giữ hợp lệ; chưa được xác nhận tính tuân thủ.
- **Danh sách tính năng MVP** chưa chốt. Cần tiếp tục Feature Planning (03), MVP Scope (04) và thử nghiệm người dùng.

## 6. Định hướng chuyển sang bước 03 — Feature Planning

Từ nhu cầu và 11 scenarios, có thể **phác thảo** các nhóm chức năng để đánh giá (chưa quyết định xây):

- Family & Child Profiles, quyền và chế độ tự chủ.
- Parent guidance, goal/planning và phê duyệt.
- Child execution, phản hồi, tối giản báo cáo.
- Development observations, đánh giá, dữ liệu có nguồn.
- Emotional Check-in, Child Journal/Kid Journey, bảo vệ và quyền riêng tư.
- Self-discovery và định hướng dài hạn.
- Onboarding đa phương thức, xác nhận trích xuất thông tin.
- Hạ tầng tri thức kiểm chứng và kiểm soát quyền chủ động AI.

Bước 03 nên lập Feature Map theo **ai dùng → vấn đề → kết quả → trường hợp sử dụng → rủi ro → phụ thuộc**, chưa vội giả định tất cả là tính năng MVP.

---

## Kết luận phần 02

**Phần 02 hoàn tất về quyết định định hướng và giả thuyết nghiên cứu**, chưa phải kết quả khảo sát đã xác nhận. Điểm quan trọng nhất cần đưa sang giai đoạn tiếp theo là: **phụ huynh phải được AI trợ giúp thực tế, còn trẻ phải thật sự muốn dùng app và được phát triển tính tự chủ**, với dữ liệu riêng tư, quyền quyết định và an toàn được bảo vệ thích hợp.
