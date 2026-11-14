# Product Blueprint — Scenario Change Log

**Version:** 1.0  
**Ngày ghi:** 2026-11-08  
**Scenario:** `SC-002` — Báo cáo bài tập, bài kiểm tra, lớp phụ đạo và tình hình trên lớp  
**Trạng thái:** `LOG_ONLY` — ghi nhận các quyết định trong giai đoạn Scenario, **chưa cập nhật Product Blueprint, Feature Inventory, Use Case Mapping hoặc Master Research Backlog**.  
**Liên quan:** SC-001 (Balanced Planning, Adaptive Planning). Đây là **log riêng cho Scenario 2**, không gộp quyết định vào SC-001.

## 1. Bài toán và kỳ vọng

**Yêu cầu phụ huynh:** “Tôi cần báo cáo về bài tập cũng như bài kiểm tra của con trong một tháng gần đây, bao gồm cả các lớp phụ đạo. Trên lớp con gặp vấn đề gì không?”

**Kỳ vọng:**
- Kid App lưu bài tập sau khi thực hiện và có khả năng đánh giá/chấm bài khi được triển khai; với học sinh lớp 3 cần xét phép tính, chữ viết, thời gian thực hiện và mức độ hoàn thành.
- Báo cáo tháng tổng hợp cả trường chính khóa, lớp phụ đạo và nguồn học khác; AI nêu điểm tiến bộ, vấn đề cần cải thiện, kèm mức độ chắc chắn.
- Báo cáo từ giáo viên và tích hợp nhà trường là **tính năng mở rộng sau này**, không giả định đã có dữ liệu.
- Tình hình trên lớp chỉ được tổng hợp từ các nguồn **được phép sử dụng**; Child Journal vẫn bảo vệ quyền riêng tư. AI có thể chủ động hỗ trợ trẻ tìm kiếm sự giúp đỡ trong trường hợp đáng lo ngại.
- Tính năng chấm/nhận xét bài bằng AI đáng để thử nghiệm nhưng **chưa triển khai đại trà khi chưa xác minh chi phí và độ chính xác thực tế**.

## 2. Decision Log — Đã thống nhất ở mức nguyên tắc

| ID | Quyết định | Trạng thái |
|---|---|---|
| `SC-002-D01` | Kid App có định hướng chấm bài theo nhiều cấp: bài có đáp án xác định ưu tiên quy tắc; ảnh/chữ viết và bài mở dùng AI khi cần; kết quả độ tin cậy thấp phải gắn cờ hoặc chuyển xác minh. | `USER_APPROVED_PRINCIPLE` |
| `SC-002-D02` | Learning Analytics cần xét điểm, dạng lỗi, kỹ năng, độ khó, thời gian và xu hướng tiến bộ; **không suy luận khả năng tập trung chỉ từ thời gian làm bài**. | `USER_APPROVED_PRINCIPLE` |
| `SC-002-D03` | Giữ riêng tư Child Journal: thông tin thông thường chỉ chia sẻ theo quyền/đồng ý hợp lệ; trường hợp nguy cơ đủ điều kiện xử lý qua cơ chế Safety Escalation riêng. Không lách quyền riêng tư bằng nhận xét mơ hồ gửi phụ huynh. | `USER_APPROVED_PRINCIPLE` |
| `SC-002-D04` | Khi trẻ kể về hành vi/tình huống đáng lo, AI **chủ động** giải thích vì sao nên tìm người lớn hỗ trợ, khuyến khích trẻ chia sẻ và giúp trẻ lựa chọn cách nói; không thụ động chờ phụ huynh hỏi. | `USER_APPROVED_PRINCIPLE` |
| `SC-002-D05` | AI Homework Assessment được đưa vào **prototype/pilot kiểm soát**, chưa mặc định là tính năng phát hành rộng hoặc bắt buộc của MVP. Mở rộng dựa trên benchmark chất lượng, trải nghiệm và chi phí. | `USER_APPROVED_PRINCIPLE` |
| `SC-002-D06` | Trường hợp trẻ cho rằng **người trực tiếp chăm sóc/quản lý là nguồn gây căng thẳng** phải có xử lý riêng: AI không tự kết luận, cáo buộc hay can thiệp vào xung đột thông thường khi chưa đủ thông tin; ưu tiên lắng nghe và động viên. Giữ ngoại lệ xử lý nguy cơ an toàn thực sự; không mặc định chuyển thông tin cho người bị trẻ nêu tên. | `USER_APPROVED_WITH_SAFETY_BOUNDARY` |
| `SC-002-D07` | **Chấm trình bày chữ viết theo hai tiêu chí cơ bản:** sạch sẽ và đều đặn. Đạt cả hai thì `PASS`; thiếu tiêu chí thì đề xuất cải thiện; ảnh không rõ thì `UNABLE_TO_ASSESS`. Phân biệt phần trình bày với chính tả và tính đúng sai. | `USER_APPROVED_PRINCIPLE` |

**Lưu ý:** Trạng thái “đã thống nhất nguyên tắc” không đồng nghĩa đã phê duyệt thay đổi Module L3/L4, schema dữ liệu, thuật toán hay chính sách an toàn cuối cùng.

## 3. Chi tiết nghiệp vụ quan trọng

### 3.1. Homework & Assessment

- Lưu riêng **bài được giao**, **bài đã thực hiện**, **kết quả đánh giá/chấm** và **insight phân tích**.
- Gắn `learning_source` (trường, lớp phụ đạo, tự học, bài app đề xuất), môn/năng lực, thời gian, độ khó, độ tin cậy kết quả và người/nguồn chấm.
- Không gộp “đã làm xong” với “đã được chấm đúng”. Không so sánh điểm giữa các bài khác độ khó mà không ghi nhận giới hạn.
- Đánh giá chữ viết: sạch sẽ, đều đặn; không tự chẩn đoán thiếu tập trung hay vấn đề vận động tinh từ ảnh bài viết.
- Khi chưa có teacher integration, báo cáo không được khẳng định “trên lớp không có vấn đề” chỉ vì thiếu dữ liệu từ giáo viên.

### 3.2. Child Journal & School Wellbeing

- AI có thể nhận diện tín hiệu trẻ gặp khó khăn, nhưng **nội dung Journal và insight dẫn xuất vẫn chịu chính sách quyền riêng tư đã chốt**.
- Với khó khăn thông thường: lắng nghe, hỗ trợ; khuyến khích chia sẻ nếu phù hợp.
- Với hành vi có thể gây hại (ví dụ trẻ kể bị bạn đánh): giải thích rằng trẻ đáng được giúp đỡ, chủ động khuyến khích tìm người lớn đáng tin cậy, hỗ trợ cách chia sẻ; chỉ hỏi thêm tối thiểu để đánh giá an toàn.
- Với trường hợp trẻ cho rằng người chăm sóc trực tiếp gây căng thẳng: không tự đưa nhận định buộc tội và **không gửi thông báo cho chính người bị nhắc đến chỉ vì họ là phụ huynh**.
- Nếu xuất hiện dấu hiệu nguy hiểm nghiêm trọng/tức thời hoặc điều kiện escalation được chính sách thẩm định xác nhận: có thể cần hành động bảo vệ phù hợp; **không áp dụng quy tắc “chỉ động viên, tuyệt đối không can thiệp” cho mọi tình huống**.
- Đề xuất phân biệt: quan sát, đánh giá nguy cơ, trẻ đồng ý chia sẻ, và ngoại lệ bảo vệ an toàn; không coi AI là cơ quan xác minh sự việc.

### 3.3. AI Economics & Rollout

- `Prototype`: dữ liệu bài mẫu; đánh giá độ chính xác, độ trễ, chi phí.
- `Controlled Pilot`: nhóm người dùng giới hạn, tính chi phí thực và tỷ lệ sửa kết quả.
- `General Availability`: chỉ sau khi đạt tiêu chí chất lượng và unit economics được duyệt.
- Metrics đề xuất: cost/page, cost/assessment, accuracy, error-classification accuracy, human-correction rate, latency, cost/active child, phân bố usage theo tháng.
- Ưu tiên E1 cho câu hỏi có đáp án xác định; chỉ sử dụng vision/LLM tại những bước cần; tránh tái chấm bài không thay đổi và tránh inference không cần thiết.

## 4. Capability Gap Register — Chưa phải Module mới

| Gap ID | Capability cần kiểm tra | Trạng thái |
|---|---|---|
| `SC-002-G01` | Academic Assessment Engine | `UNVALIDATED_CAPABILITY_GAP` |
| `SC-002-G02` | Learning Skill & Error Analysis | `UNVALIDATED_CAPABILITY_GAP` |
| `SC-002-G03` | Learning Source Management (school/tutoring/self-study/app) | `UNVALIDATED_CAPABILITY_GAP` |
| `SC-002-G04` | Learning Efficiency Analysis (có điều kiện, không chẩn đoán mức tập trung) | `UNVALIDATED_CAPABILITY_GAP` |
| `SC-002-G05` | School Wellbeing Insights (chỉ trên nguồn được phép) | `UNVALIDATED_CAPABILITY_GAP` |
| `SC-002-G06` | Privacy-Aware Safety Disclosure / Escalation | `POLICY_DESIGN_REQUIRED` |
| `SC-002-G07` | Proactive Child Safety Guidance | `UNVALIDATED_CAPABILITY_GAP` |
| `SC-002-G08` | Sensitive Caregiver Relationship Handling | `SAFETY_POLICY_REQUIRED` |
| `SC-002-G09` | Basic Handwriting Presentation Assessment | `PILOT_VALIDATION_REQUIRED` |
| `SC-002-G10` | Cost-Gated AI Assessment Rollout & Usage Controls | `COST_VALIDATION_REQUIRED` |

Các gap chỉ là đầu mục cần đối chiếu với Feature Inventory hiện có; **không quyết định thêm 10 module mới**.

## 5. Dữ liệu và nghiên cứu còn cần

- **Bài tập/đề kiểm tra:** nguồn, môn, mục tiêu kiến thức, dạng bài, độ khó, đáp án/tiêu chí chấm, bản bài làm, thời gian, trạng thái và kết quả; dữ liệu từ lớp phụ đạo có thể được nhập thủ công ở giai đoạn đầu.
- **Bộ tiêu chí chữ viết:** mô tả kiểm chứng được cho “sạch sẽ” và “đều đặn”; bộ mẫu chữ viết tay tiếng Việt thực tế, chất lượng ảnh và mức đồng thuận khi chấm bởi con người.
- **Chất lượng AI:** benchmark trên phép tính, chữ viết, đáp án ngắn và bài mở; sai số, mức độ chắc chắn và sửa lỗi.
- **Chi phí:** giá xử lý ảnh/LLM, tần suất sử dụng thực, chi phí mỗi trẻ và các ngưỡng pilot/rollout (chưa chốt số).
- **An toàn & quyền dữ liệu:** thẩm định cách phân loại nguy cơ, ngưỡng chuyển tiếp, người nhận phù hợp; phân biệt người gây căng thẳng với người được phép hỗ trợ; tránh tiết lộ Journal trực tiếp/gián tiếp ngoài quyền.
- **Teacher reports:** là nguồn dữ liệu/tích hợp tương lai, không dùng làm giả định cho đầu ra hiện tại.

## 6. Tác động dự kiến lên Blueprint — Chưa phê duyệt

- Có thể liên quan F04 (thực thi/bài tập), F06 (tracking/insights), F05 (Kid Companion & Journal), F07 (Safety/Governance), F02/F03 (hiểu trẻ và kế hoạch), F08 (tích hợp trường/trung tâm trong tương lai).
- SC-002 cung cấp thêm tín hiệu học tập cho Adaptive Planning ở SC-001; mọi tín hiệu phải có provenance và quyền sử dụng thích hợp.
- Chưa xác định cần bổ sung Module L3 nào, chưa phân rã L4, chưa chốt schema hoặc mô hình triển khai.

## 7. Quy tắc quản lý thay đổi

1. **Giữ log SC-002 riêng biệt với SC-001**; có thể tham chiếu chéo, không gộp nội dung.
2. Chỉ ghi quyết định/gap trong giai đoạn Scenario; **không sửa** Product Blueprint, Feature Inventory, Use Case Mapping hoặc Master Research Backlog trước khi chủ sản phẩm duyệt thay đổi.
3. Những vấn đề cần nghiên cứu chưa được tự gán MR-ID hoặc ghi vào Master Research Backlog cho đến khi được yêu cầu tổng hợp.
4. Bản này là biên bản quyết định và đề xuất; không được hiểu là chứng nhận tính chính xác học thuật, an toàn hay khả thi thương mại.

**Kết luận:** SC-002 đã thống nhất D01–D07 ở cấp nguyên tắc; các gap G01–G10 và vấn đề nghiên cứu chờ đối chiếu/đánh giá trước khi đề xuất điều chỉnh tài liệu chính thức.