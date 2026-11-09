# Product Blueprint — Scenario Change Log

**Version:** 1.0  
**Ngày ghi:** 2026-11-08  
**Scenario:** SC-001 — Định hướng học tập dài hạn cho trẻ lớp 3 (8 tuổi), Hà Nội  
**Trạng thái:** `LOG_ONLY` — lưu quyết định và đề xuất, **chưa sửa bất kỳ bản Blueprint, Feature Inventory, Use Case Mapping hoặc Master Research Backlog nào**.

## 1. Input & expected outcome

- Lịch trường được cung cấp: 07:30–16:15, thứ Hai đến thứ Sáu; thứ Bảy–Chủ nhật nghỉ.
- Trẻ: 8 tuổi, lớp 3, cao 1,20m, nặng 45kg (thông tin giả định để kiểm thử).
- Mục tiêu: THCS công lập chất lượng cao tại Hà Nội; IELTS 7.0 trước thời điểm thi đại học.
- AI phải giải quyết trực tiếp lo lắng chính về định hướng học và tuyển sinh, nhưng không bỏ qua các lĩnh vực phát triển khác; không giả định học lực, sở thích hoặc sức khỏe khi chưa có dữ liệu.
- Đầu ra cuối mong muốn: lộ trình nhiều năm → kế hoạch chi tiết phù hợp → phê duyệt → thực thi → đánh giá/điều chỉnh.
- Việc hỏi thông tin dần theo thời gian và mức ưu tiên là cần thiết, **nhưng quy tắc hội thoại chưa phải trọng tâm cần xử lý lúc này**.

## 2. Decision log — Những nguyên tắc đã được thống nhất

| ID | Quyết định / yêu cầu | Trạng thái |
|---|---|---|
| **SC-001-D01** | **Balanced Planning** phải là phần bắt buộc của quy trình lập kế hoạch. Khuyến nghị cân bằng dựa trên nghiên cứu công bố và ý kiến chuyên gia; gia đình có quyền điều chỉnh phân bổ trong giới hạn an toàn. | `USER_APPROVED_PRINCIPLE` |
| **SC-001-D02** | **Cause-Aware Adaptive Planning**: không chỉ đếm số lần mệt; tìm hiểu bối cảnh và nguyên nhân khả dĩ, kiểm tra có thật là cùng nguyên nhân lặp lại không, rồi đánh giá hiệu quả sau điều chỉnh. | `USER_APPROVED_PRINCIPLE` |
| **SC-001-D03** | **Family Standard Bar**: gia đình đặt kỳ vọng/mức ưu tiên khác nhau, kể cả tăng thời gian học và rèn luyện, giảm phần chơi linh hoạt; Planning phải phản ánh ưu tiên đó, đồng thời đưa ra cảnh báo và duy trì yêu cầu an toàn. | `USER_CONFIRMED_REQUIREMENT` |

### D01 — Context-aware balance & temporary exceptions

- Phân biệt **safety boundaries**, **recommended balance** và **temporary exceptions**.
- Gia đình được lựa chọn mức tải cao hơn khuyến nghị trong phạm vi an toàn; không xem lựa chọn của gia đình là quyền vô hiệu hóa cơ chế bảo vệ sức khỏe.
- Ngoại lệ ôn thi hoặc hoàn cảnh đặc biệt phải có **thời hạn/điều kiện kết thúc**, rà soát lại lịch khi kết thúc và có thể nhắc/điều chỉnh sớm hơn khi có dấu hiệu nguy cơ.
- Không tự tạo tỷ lệ thời gian học–chơi–ngủ hoặc ngưỡng sức khỏe giả khoa học; các ràng buộc cần có nguồn và được thẩm định.

### D02 — Cause-aware adaptation

- Thu thập phản hồi **tự nguyện** về cảm xúc, độ mệt, độ khó, cùng dữ liệu thực thi và quan sát hợp lệ của phụ huynh.
- Phân biệt `observation`, `cause_hypothesis`, `verified_cause`; không khẳng định chính xác quan hệ nhân quả chỉ từ tương quan.
- Phân biệt hiện tượng lặp lại, bối cảnh lặp lại và **nguyên nhân** lặp lại.
- Có review hàng tuần/hàng tháng, nhưng trường hợp an toàn nghiêm trọng không chờ kỳ review.
- Điều chỉnh kế hoạch quan trọng cần cơ chế phê duyệt; kiểm tra hiệu quả sau thay đổi.
- Không tự sử dụng Child Journal riêng tư trong báo cáo phụ huynh hay lập lịch nếu chưa được phép.

### D03 — Family Standard Bar

- Lưu mức kỳ vọng và ưu tiên gia đình; có thể áp dụng theo từng trẻ và lĩnh vực — **đề xuất cấu trúc, chưa chốt schema**.
- Standard Bar dài hạn khác với **Temporary Balance Exception** có thời hạn.
- Đổi Standard Bar phải ảnh hưởng thực tế tới các phương án lập lịch; không đơn giản trừ cùng một tỷ lệ khỏi mọi loại thời gian chơi.
- App có trách nhiệm cảnh báo phù hợp; không tự thay đổi sở thích của gia đình khi phát hiện phản hồi tiêu cực, nhưng có thể đề nghị điều chỉnh.
- Những mức `Relaxed / Balanced / Ambitious / Intensive` chỉ là nhãn ví dụ, **chưa được duyệt**.

## 3. Gap register — Chưa là thay đổi L3/L4

| Gap ID | Nội dung | Phân loại |
|---|---|---|
| `SC-001-G01` | **Admissions Intelligence:** kho tuyển sinh theo trường, năm, địa bàn, phương thức, điều kiện và nguồn; cập nhật định kỳ, **human review/approval**; tra cứu ngoài khi cần nhưng tách thông tin chưa xác minh. | `DATA_GAP` |
| `SC-001-G02` | **Long-term Roadmap & Milestones:** mục tiêu nhiều năm → giai đoạn/cấp học/năm → học kỳ → tuần → nhiệm vụ, có phiên bản và phê duyệt. | `CAPABILITY_GAP_TO_VALIDATE` |
| `SC-001-G03` | **Holistic/Context-aware Balance Validation:** ràng buộc phát triển toàn diện, phân bổ học/rèn luyện/nghỉ/chơi theo hoàn cảnh và bằng chứng. | `CAPABILITY_GAP_TO_VALIDATE` |
| `SC-001-G04` | **Progressive Profiling & Contextual Follow-up:** hỏi dần, đúng mức ưu tiên; người dùng yêu cầu **tạm chưa đi sâu**. | `DEFERRED` |
| `SC-001-G05` | **Cause-Aware Adaptive Planning:** phản hồi, giả thuyết nguyên nhân, đối chiếu lặp lại và đánh giá hậu điều chỉnh. | `CAPABILITY_GAP_TO_VALIDATE` |
| `SC-001-G06` | **Temporary Balance Exception Management:** ngoại lệ có thời hạn, rà soát khi kết thúc và dừng sớm theo nguy cơ. | `CAPABILITY_GAP_TO_VALIDATE` |
| `SC-001-G07` | **Family Standard Bar & Development Priorities:** quyền đặt ưu tiên, áp dụng vào kế hoạch, theo dõi mức phù hợp. | `CAPABILITY_GAP_TO_VALIDATE` |

**Lưu ý:** Gap không mặc định tương ứng một Module L3 mới. Phải đối chiếu F01/F02/F03/F04/F06/F07 trước khi đề nghị gộp/tách/thêm module.

## 4. Dữ liệu / Knowledge Base cần được định nghĩa, thẩm định

| Dataset hoặc policy | Mục đích | Điều kiện quan trọng |
|---|---|---|
| `school_admissions` | Tư vấn tuyển sinh từng trường / chu kỳ tuyển sinh | Nguồn, năm áp dụng, hiệu lực, người duyệt, ngày xác minh; phân biệt dữ liệu approved và dữ liệu tra cứu mới |
| `english_learning_progression` | Lộ trình tiếng Anh và IELTS theo năng lực | Phân biệt năng lực ngôn ngữ và luyện thi; nguồn, phạm vi áp dụng |
| `child_development_framework` | Định hướng nhiều lĩnh vực | Cơ sở khoa học, độ tuổi, giới hạn áp dụng |
| `activity_workload_recovery` | Tải lượng, ngủ, nghỉ, vận động, vui chơi | Không tự đặt tỷ lệ tối ưu; có phản biện chuyên môn |
| `family_standard_bar` | Sở thích và ưu tiên theo gia đình/trẻ | Quyền sửa, lịch sử thay đổi, tác động đến kế hoạch |
| `balance_exception` | Giai đoạn ôn thi / thay đổi ngắn hạn | Ngày bắt đầu/kết thúc, lý do, phê duyệt, rà soát |
| `child_feedback_context` | Cảm xúc, độ mệt, độ khó, bối cảnh và giả thuyết nguyên nhân | Có quyền và nguồn hợp lệ; không tự lấy Journal |
| `roadmap_milestones_plan` | Liên kết lộ trình với kế hoạch và thực thi | Traceability, version, review, approval |

**Trạng thái:** Đây là yêu cầu dữ liệu khái niệm, không chứng minh hệ thống đã có các bảng/dataset này. Nếu triển khai thực tế, cần kiểm tra dữ liệu trước.

## 5. Những đề xuất/điểm chưa chốt

- Cách phân rã D01–D03 thành các Group/Module/Feature cụ thể: **chưa chốt**.
- Cách ánh xạ Family Standard Bar thành ràng buộc và phân bổ tính toán được: **cần nghiên cứu/kiểm chứng**.
- Ngưỡng an toàn, thời lượng nghỉ và tải lượng học tập theo độ tuổi, phương pháp đo cảm xúc/mệt mỏi: **cần nguồn và thẩm định chuyên gia**.
- Phương án kỹ thuật ưu tiên E0/E1 cho lịch, kiểm tra ràng buộc, thống kê, kiểm tra thời hạn; chỉ dùng E2 cho giải thích/đề xuất phức tạp khi cần. **Chưa thiết kế backend/API**.
- Các giả thuyết về nguyên nhân mệt mỏi không phải chẩn đoán y tế; thiếu bằng chứng phải giữ `UNKNOWN`.

## 6. Chính sách quản lý thay đổi giai đoạn Scenario

1. File này **chỉ ghi log**; không tự sửa Product Blueprint 3.1–3.4, Feature Inventory hay Master Research Backlog.
2. Chưa cấp MR-ID mới; chỉ cập nhật Master Research Backlog **khi chủ sản phẩm duyệt gói thay đổi**, tránh thay đổi tài liệu trong giai đoạn Scenario.
3. Scenario kế tiếp dùng mã `SC-002`; tiếp tục tách **yêu cầu của người dùng**, **đề xuất của trợ lý**, **vấn đề cần kiểm chứng**.
4. Không chuyển gap thành module hay quyết định triển khai trước khi đối chiếu và được duyệt.

**SC-001 — Đã ghi log, sẵn sàng sang scenario tiếp theo.**