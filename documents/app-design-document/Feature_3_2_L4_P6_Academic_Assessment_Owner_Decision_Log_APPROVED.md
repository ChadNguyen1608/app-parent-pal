# Parent-Pal — P6 Pilot 2: Academic Assessment — Owner Decision Log

**Ghi nhận:** 2026-11-12  
**L3:** `F06-G07-M01`  
**Owner Review:** `OQ-2A/B/C/D = CONFIRMED`  
**Trạng thái pilot:** `REVIEW_EXECUTED_CONDITIONAL / FINAL_REGRESSION_PENDING`  
**Phạm vi:** Chính sách nghiệp vụ được chốt, **không phải** phê duyệt toàn bộ L4 ứng viên hoặc chất lượng chấm bài thực tế.

## 1. Quyết định

| ID | Quyết định | Hợp đồng và yêu cầu kiểm thử |
|---|---|---|
| **P6-AA-OD-01 / OQ-2A** | Bài tập **làm tại nhà**: học sinh tự làm, phụ huynh kiểm tra/xác minh; trạng thái `PARENT_CONFIRMED`. Không có nghĩa giáo viên hoặc chuyên gia xác minh. | Không suy `TEACHER_VERIFIED` từ thao tác phụ huynh; lưu người xác minh, thời điểm và version. Phân biệt kết quả AI tạm và kết quả phụ huynh xác nhận. |
| **P6-AA-OD-02 / OQ-2B** | AI **đánh dấu câu có khả năng sai/cần xem lại** và cho trẻ cơ hội tự sửa. Trẻ có thể **chủ động yêu cầu trợ giúp**; AI đưa câu hỏi gợi mở theo từng bước, **không đưa trực tiếp đáp án/lời giải** trong luồng trợ giúp này. | Phân biệt `ASSESS`, `HINT_REQUEST`, `RESUBMIT`; xử lý AI không chắc chắn/không đọc được bài; không trình bày kết quả AI là giáo viên đã chấm. Tránh gọi sai chắc chắn khi evidence yếu. |
| **P6-AA-OD-03 / OQ-2C=B** | Khi trẻ không đồng ý với điểm/câu bị đánh dấu: trẻ yêu cầu xem lại → AI đánh giá lần nữa **nếu có thể và phù hợp** → nếu còn tranh cãi, phụ huynh xác minh hoặc điều chỉnh. | Giữ audit/version; **AI retry không tự sinh `PARENT_CONFIRMED`**. Trẻ sửa bài rồi nộp lại là **submission mới**, không phải sửa lịch sử chấm cũ. Lượt AI kiểm tra lại có thể phát sinh chi phí và phải được tính riêng. |
| **P6-AA-OD-04 / OQ-2D** | Giữ **tính năng AI chấm bài** trong phạm vi sản phẩm, nhưng **chưa chốt quota, giá hay cơ chế trigger**. Nghiên cứu đo và tối ưu chi phí trước quyết định economics. | Đo token, latency, tỷ lệ bài cần recheck/retry, cost per successful assessment, chi phí hint và resubmission, phân bổ theo grade/môn/modality; ưu tiên kiểm tra không-LLM nếu phù hợp. Không tự coi mức 8 USD cũ là chi phí thực tế. |

## 2. Kết quả pilot Claude được báo cáo

- Hồ sơ Owner cung cấp: `P6_Pilot_2_3_All.zip`. Bản này chưa được commit trong nhánh.
- Agent tự báo cáo: **4 L4 ứng viên**, **55 test thiết kế**, **16/19** test P5 được đánh giá tương đương đầy đủ, **3/19** tương đương một phần; **9** findings đã sửa, **9** findings đưa Owner, **4** cần nghiên cứu, **1** còn mở; Validator cuối: **0 lỗi/0 cảnh báo**.
- Các kết quả trên là **design review/coverage classification**, **không phải app test execution hoặc benchmark chấm bài có chuyên gia**.
- **F-023:** Hợp đồng kết quả đánh giá chung chưa có trace đầy đủ về L4/acceptance criteria. Giao làm rõ ownership + trace, chạy regression; **không cần hỏi lại Owner** khi có thể sửa theo nguồn hiện có.
- Quyết định trên có thể giải quyết một phần findings chờ Owner; **không được tự đóng cả 9 findings** nếu chưa có mapping và bằng chứng xử lý.

## 3. Những điều còn UNKNOWN

- Chất lượng AI cho từng lớp 1–9, môn học, chữ viết tay/ảnh không đọc được, hallucination, fairness và confidence/abstention.
- Rubric/provenance được thẩm định; quyền chia sẻ, privacy/retention và kiểm tra bởi chuyên gia nếu áp dụng.
- Định mức quota, SLA, chi phí thực tế theo modality, lượt hint, chấm lại và retry.
- Ranh giới giữa phản hồi hỗ trợ học và hiển thị kết quả trong báo cáo phát triển của trẻ.

## 4. Kết quả và việc tiếp tục

`P6_AA_OWNER_DECISIONS_RECORDED`  
`P6_AA_SPEC_REVIEW_CONDITIONAL`  
`P6_AA_FINAL_REGRESSION_PENDING`

ChatGPT quản lý thay đổi tài liệu và findings; Claude Code chỉ chạy pilot/đưa ZIP; Product Owner duyệt quyết định nghiệp vụ. Không sửa Blueprint canonical, không cấp stable L4 ID, không merge PR #17 hoặc PR #18.
