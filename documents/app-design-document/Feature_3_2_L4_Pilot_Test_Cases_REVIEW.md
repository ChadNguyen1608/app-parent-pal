# PARENT-PAL — Test case giả lập cho thử nghiệm L4

**Phiên bản:** 0.1 · **Ngày:** 2026-11-10 · **Trạng thái:** `TEST_DESIGN_ONLY / NOT_EXECUTED`
**Nguồn:** `Feature_3_2_L4_Pilot_Three_Modules_REVIEW.md` và M-Q1..M-Q6 đã chốt.
**Tổng:** 43 test case thiết kế = 12 Access + 16 Assessment + 15 Balance. **Đã chạy: 0; chưa có kết quả pass/fail thực tế.**
**ID:** `TC-L4-A##`, `TC-L4-B##`, `TC-L4-C##`. Chỉ dùng dữ liệu giả lập; kết quả kỳ vọng là hợp đồng đề xuất, chưa phải chính sách pháp lý hoặc chuẩn y tế/giáo dục đã xác minh.

## 1. Dữ liệu giả lập dùng chung

| Mã | Dữ liệu giả lập | Ghi chú |
|---|---|---|
| FAMILY-A | P1, P2 là người giám hộ; C8 là trẻ 8 tuổi; Y16 là trẻ 16 tuổi | Quan hệ gia đình không tự động đồng nghĩa có quyền |
| FAMILY-B | PX là phụ huynh khác gia đình; CX là trẻ khác | Dùng kiểm tra truy cập chéo gia đình |
| ADULT-A5 | A19, 19 tuổi, sở hữu tài khoản của mình | Không mặc định người giám hộ được truy cập |
| ACTOR-SERVICE | Worker nội bộ có định danh service và phạm vi hạn chế | Service không có quyền bao trùm |
| POLICY-V1 | Quy tắc giả lập cho P1 sửa lịch C8; không tự cấp quyền đọc Journal | Chỉ là fixture, không phải kết luận pháp lý |
| POLICY-V2 | Bản cập nhật V1, thu hồi quyền sửa lịch | Kiểm lại quyền tại thời điểm ghi |
| CONSENT-REV | Đồng ý theo mục đích đã bị thu hồi trước khi đọc dữ liệu | Áp dụng khi policy đã duyệt yêu cầu consent |
| SCHOOL-1 | Bài lớp 3 của C8, submission S-101, nguồn child_self_report | Đã nộp không có nghĩa đã đúng hay được giáo viên xác minh |
| RUBRIC-R1 | Rubric thử nghiệm giả lập: phép tính 2+3=5, phiên bản R1, Toán lớp 3 | Không phải rubric chương trình đã được phê duyệt |
| RUBRIC-R2 | Phiên bản R2 có chính sách chấm khác | Không âm thầm thay R1 đã khóa |
| SCHOOL-IMAGE | Metadata ảnh chữ viết tay giả lập không đọc được | Phải trả không thể đánh giá |
| SCHEDULE-1 | Trường 07:30–16:15; English 17:00–18:00; Piano 17:30–18:30; Asia/Ho_Chi_Minh | Phát hiện trùng lịch thuộc owner L3 khác |
| BAR-1 | Quy tắc **giả lập do gia đình đặt**: tối thiểu 60 phút chơi/ngày; giờ trường là hard; mục tiêu soft 90 phút học tự chọn | Các số không phải khuyến nghị y khoa/phát triển |
| EXAM-1 | Đề xuất ngoại lệ ôn thi 2026-11-12 đến 2026-12-12 | Có hạn, chưa tự duyệt |
| EXAM-EXPIRED | Ngoại lệ giả lập đã duyệt hết hạn 2026-12-12; job chạy 2026-12-13 | Chỉ đánh dấu/đề xuất kiểm tra, không tự sửa lịch |

**Loại kiểm thử:** `contract` = kiểm tra đầu ra; `workflow` = ranh giới nhiều L4; `security` = kiểm tra quyền và đường lỗi; `state` = phiên bản/retry/đồng thời. **Mọi test đều có `execution_status=NOT_RUN`.**

## 2. Access Policy — 12 test case

| ID | L4 | Given/When — Điều kiện và hành động | Then — Kết quả kỳ vọng | Loại |
|---|---|---|---|---|
| TC-L4-A01 | `001` | P1 đã xác thực; POLICY-V1 cho sửa lịch C8, đúng mục đích/phạm vi | ALLOW chỉ với lịch C8; kèm phiên bản policy và lý do | hợp đồng |
| TC-L4-A02 | `001` | PX thuộc FAMILY-B yêu cầu đọc lịch C8 | DENY; không truy xuất hay tiết lộ nội dung lịch | bảo mật |
| TC-L4-A03 | `001` | P1 đòi đọc Journal riêng của C8 vì là người trả phí | DENY nếu không có quyền theo mục đích; không đọc Journal, suy luận hay tra cache | bảo mật |
| TC-L4-A04 | `001` | Thiếu định danh đã xác thực hoặc mục đích truy cập | DENY/INDETERMINATE; không có quyền hiệu lực, không đọc tài nguyên | bảo mật |
| TC-L4-A05 | `001` | P1 có quyết định từ POLICY-V1; POLICY-V2 thu hồi quyền trước khi ghi | Kiểm lại quyền tại thời điểm ghi và từ chối; không tái dùng quyết định cũ | trạng thái |
| TC-L4-A06 | `001` | Hai người giám hộ xung đột quyền, chưa rõ thẩm quyền | INDETERMINATE được xử lý như DENY; chuyển review, không tự cấp quyền | bảo mật |
| TC-L4-A07 | `001` | P1 truy cập hồ sơ A19 chỉ dựa trên quan hệ giám hộ trước đây | DENY nếu không có ủy quyền hiện hành, độc lập của người trưởng thành | bảo mật |
| TC-L4-A08 | `001` | Service có quyền yêu cầu bằng chứng cho mục đích academic_assessment | Chỉ cấp phạm vi bài nộp/bằng chứng tối thiểu, không mở toàn bộ hồ sơ trẻ | bảo mật |
| TC-L4-A09 | `effective-access-preview` | P1 có quyền xem metadata policy của C8, yêu cầu xem quyền hiệu lực | Trả tóm tắt quyền và phiên bản policy; không trả nội dung trẻ | hợp đồng |
| TC-L4-A10 | `effective-access-preview` | PX dò ID C8 hoặc hàng loạt ID gia đình | Từ chối không tiết lộ sự tồn tại của C8 | bảo mật |
| TC-L4-A11 | `policy-conflict-review` | Cùng một sự kiện xung đột giám hộ gửi hai lần với cùng khóa | Chỉ một hồ sơ review đang mở; không cấp quyền | trạng thái |
| TC-L4-A12 | `policy-conflict-review` | Operator chưa được duyệt cố mở hồ sơ tranh chấp chứa danh tính | Từ chối chi tiết; ẩn metadata nhạy cảm; audit tối thiểu | bảo mật |

## 3. Academic Assessment — 16 test case

| ID | L4 | Given/When — Điều kiện và hành động | Then — Kết quả kỳ vọng | Loại |
|---|---|---|---|---|
| TC-L4-B01 | `rubric-eligibility` | Bài toán SCHOOL-1 và rubric RUBRIC-R1 áp dụng đúng | ELIGIBLE; khóa phiên bản R1 và tham chiếu nguồn | hợp đồng |
| TC-L4-B02 | `rubric-eligibility` | Bài toán lớp 3 nhưng đưa rubric Ngữ văn lớp 8 | INELIGIBLE; không cho điểm | hợp đồng |
| TC-L4-B03 | `rubric-eligibility` | Rubric thiếu, chưa duyệt hoặc không rõ phiên bản | UNKNOWN/INELIGIBLE; không bắt đầu chấm | bảo mật |
| TC-L4-B04 | `rubric-eligibility` | Đã khóa R1, R2 được công bố trước khi chấm xong | Giữ R1; đổi rubric phải tạo lượt đánh giá/review rõ ràng | trạng thái |
| TC-L4-B05 | `assess-submission` | Bài giả lập trả lời 2+3=5 theo R1; người gọi có quyền | Kết quả tạm liên kết R1, nguồn, phương pháp và bằng chứng; không gắn giáo viên xác nhận | hợp đồng |
| TC-L4-B06 | `assess-submission` | Bài giả lập trả lời 2+3=6 theo R1 | Nhận xét theo rubric kèm giải thích; không suy ra chẩn đoán hay nhãn năng lực chung | hợp đồng |
| TC-L4-B07 | `assess-submission` | Metadata ảnh chữ viết tay không đọc được (SCHOOL-IMAGE) | UNABLE_TO_ASSESS, không chấm 0; giữ bài gốc | hợp đồng |
| TC-L4-B08 | `assess-submission` | Bài nộp thiếu trang | Đánh dấu thiếu bằng chứng/đánh giá một phần; không bịa câu trả lời | hợp đồng |
| TC-L4-B09 | `assess-submission` | Phụ huynh/service thiếu quyền yêu cầu bằng chứng C8 | Không đọc bằng chứng, suy luận, cache hay gọi model ngoài | bảo mật |
| TC-L4-B10 | `assess-submission` | Provider vision/model timeout | UNABLE_TO_ASSESS hoặc pending; không báo thành công giả, không sửa bài nộp | trạng thái |
| TC-L4-B11 | `assess-submission` | Gửi lại cùng yêu cầu chấm với khóa idempotency | Không tạo kết quả trùng hoặc yêu cầu model tính phí trùng khi có hỗ trợ dedupe; nếu không phải ghi issue | trạng thái |
| TC-L4-B12 | `review-uncertainty` | Kết quả tạm bị đánh dấu thiếu chắc chắn bởi rule giả lập đã cấu hình | Tạo một hồ sơ review chờ; chưa gắn nhãn verified | hợp đồng |
| TC-L4-B13 | `review-uncertainty` | Hiện không có reviewer được cấp quyền | Giữ trạng thái chờ; không mở bằng chứng cho người khác hoặc tự duyệt | bảo mật |
| TC-L4-B14 | `correct-assessment` | Reviewer có quyền sửa kết quả, ghi lý do và đúng phiên bản | Tạo phiên bản mới có người sửa, liên kết lịch sử đầy đủ | trạng thái |
| TC-L4-B15 | `correct-assessment` | Hai reviewer cùng sửa một phiên bản | Một thay đổi thành công; thay đổi cũ báo xung đột/yêu cầu cập nhật, không mất dữ liệu | trạng thái |
| TC-L4-B16 | `correct-assessment` | Trẻ nộp bài; phụ huynh yêu cầu kết quả trong báo cáo gia đình | Bài nộp, đánh giá và xác minh giáo viên tách biệt; F06-G05 kiểm quyền nhận báo cáo riêng | workflow |

## 4. Balanced Planning Validation — 15 test case

| ID | L4 | Given/When — Điều kiện và hành động | Then — Kết quả kỳ vọng | Loại |
|---|---|---|---|---|
| TC-L4-C01 | `validate-balance` | SCHEDULE-1, BAR-1 và bản nháp được phép kiểm tra | Trả cảnh báo hard/soft/thời gian chơi cùng phiên bản quy tắc; không sửa lịch | hợp đồng |
| TC-L4-C02 | `validate-balance` | English 17:00–18:00 và Piano 17:30–18:30 đều là học; tính tải hoạt động | 30 phút chồng lấn chỉ tính một lần; phát hiện xung đột chi tiết thuộc F04-G02-M02 | hợp đồng |
| TC-L4-C03 | `validate-balance` | BAR-1 giả lập yêu cầu 60 phút chơi; lịch chỉ có 30 phút | Báo thiếu 30 phút theo quy tắc gia đình giả lập, không gọi đó là ngưỡng y khoa | hợp đồng |
| TC-L4-C04 | `validate-balance` | Lịch có 90 phút chơi, không vi phạm hard constraint | Không báo thiếu thời gian chơi theo BAR-1; không tự nhận lịch tối ưu | hợp đồng |
| TC-L4-C05 | `validate-balance` | Giờ học 07:30–16:15 là hard constraint; hoạt động mới chồng giờ học | Trả cảnh báo hard; không tự bỏ quy tắc hoặc sửa lịch trường | hợp đồng |
| TC-L4-C06 | `validate-balance` | Thiếu Standard Bar, bản cũ hoặc chưa rõ người có quyền đặt | UNKNOWN/NEEDS_INPUT; không bịa giới hạn theo tuổi/sức khỏe | hợp đồng |
| TC-L4-C07 | `validate-balance` | Trẻ đề xuất lịch ngoài phạm vi được phép sửa | Không ghi thay đổi; chỉ đề xuất/yêu cầu duyệt khi có quyền | bảo mật |
| TC-L4-C08 | `validate-balance` | Một hoạt động có hai nhãn: học tập và bồi dưỡng | Thời lượng tính một lần; vẫn giữ được hai nhãn phân loại | hợp đồng |
| TC-L4-C09 | `evaluate-exception` | P1 có quyền đề xuất EXAM-1 ôn thi với thời hạn hữu hạn | Trả đề xuất có lý do, ngày và ràng buộc bị ảnh hưởng; NEEDS_APPROVAL | hợp đồng |
| TC-L4-C10 | `evaluate-exception` | Yêu cầu bỏ giới hạn thời gian chơi vô thời hạn, không có ngày kết thúc | Từ chối hoặc yêu cầu ngày hết hạn; không tự duyệt ngoại lệ vĩnh viễn | hợp đồng |
| TC-L4-C11 | `evaluate-exception` | Trẻ xin ngoại lệ nhưng không có quyền tự phê duyệt | Chỉ ghi đề xuất nếu được phép; F04-G06 phải duyệt; không sửa mục tiêu/lịch | bảo mật |
| TC-L4-C12 | `evaluate-exception` | Yêu cầu vượt hard protected rule | Từ chối hoặc chuyển review policy; phê duyệt thường không vượt được hard rule | bảo mật |
| TC-L4-C13 | `expiry-recheck` | EXAM-EXPIRED; job chạy sau ngày hết hạn | Đánh dấu EXPIRED, tạo yêu cầu kiểm tra/khôi phục; giữ nguyên lịch | trạng thái |
| TC-L4-C14 | `expiry-recheck` | Job hết hạn chạy lại ba lần | Một yêu cầu khôi phục còn mở cho cùng ngoại lệ/phiên bản; idempotent | trạng thái |
| TC-L4-C15 | `expiry-recheck` | Ngoại lệ hết hạn nhưng lịch đã đổi đồng thời, phiên bản hiện tại khác | Không ghi đè; đánh giá lại theo lịch hiện hành và yêu cầu người có quyền giải quyết | trạng thái |

## 5. Ma trận bao phủ và truy vết

| Hợp đồng / rủi ro | Test case | Nguồn |
|---|---|---|
| Quyền truy cập, phạm vi, từ chối mặc định, người trưởng thành | A01–A08 | L3C-03, MR-016/017/021/035 |
| Xem trước quyền và chống dò tài nguyên | A09–A10 | F01-G04-M01, privacy gate |
| Xung đột policy, idempotency, quyền operator | A06, A11–A12 | PILOT-02, MR-017 |
| Rubric hợp lệ, khóa phiên bản | B01–B04 | L3C-02, AUD-05 |
| Đánh giá đúng/sai, bằng chứng, lỗi provider | B05–B11 | SC-002, L3T-02, MR-023/025 |
| Người review, sửa kết quả, ranh giới báo cáo | B12–B16 | L3C-02, PILOT-03/04 |
| Standard Bar, hard/soft, thời gian chơi, chống tính trùng | C01–C08 | SC-001, L3C-06, AUD-08 |
| Quyền xin ngoại lệ, hết hạn và xử lý lặp | C09–C15 | UC-007/010, MR-035, PILOT-05/06 |

**Ma trận kiểm thử theo nhóm tuổi:** Tất cả case cần biến thể quyền A0–A5. A0/A1: chấm học đường theo rubric `NOT_APPLICABLE`, phải kiểm luồng thay thế an toàn thay vì cho điểm. A2–A4: kiểm quyền trẻ/người giám hộ theo policy đã xác minh. A5: kiểm quyền người trưởng thành độc lập. **Không được nhân 43×6 rồi tuyên bố đã chạy 258 test**; đây mới là kế hoạch tham số hóa.

## 6. Cổng review và kế hoạch kiểm thử khi triển khai

- **Product:** Rà soát tách/gộp và owner; xử lý PILOT-02, PILOT-07.
- **Pháp lý/quyền riêng tư:** Thay quyền giả lập bằng ma trận thẩm quyền phù hợp pháp luật trước khi dùng dữ liệu thật.
- **Giáo dục:** Xác minh rubric thực, tuổi, khả năng giải thích, sửa bởi người và nguồn giáo viên.
- **An toàn/phát triển trẻ:** Kiểm chứng Standard Bar và ngoại lệ có hạn; mọi số trong BAR-1 chỉ là dữ liệu giả lập của gia đình.
- **Engineering QA:** Viết unit/property-based test cho khoảng thời gian và quyền; integration test cho trạng thái/consent; contract test cho đánh giá; thử timeout, retry, race, sai phiên bản. Chỉ chốt hiệu năng/chi phí khi có bằng chứng.
- **Đánh giá AI:** Nếu dùng E2, cần tập đánh giá tiếng Việt có kiểm soát và ngưỡng chất lượng/an toàn được chốt trước; chưa có benchmark ở đây.
- **Release:** G-Legal/G-Privacy/G-Safety/G-Feasibility vẫn `UNKNOWN`; **không thử với trẻ thật hoặc phát hành** dựa trên tài liệu này.

## 7. Mẫu ghi kết quả chạy test

```yaml
test_case_id: TC-L4-B07
design_status: REVIEW_ONLY
execution_status: NOT_RUN
environment: UNKNOWN
build_sha: UNKNOWN
run_at: null
actual_result: null
pass_fail: NOT_EVALUATED
evidence_link: null
reviewer: null
blocking_issue: PILOT-03
```

**Kết luận:** Đã tạo **43 test case giả lập ở mức thiết kế**, **không phải 43 test đã pass**. Cần P5 review và quyết định của chủ sản phẩm trước khi cấp ID L4 chính thức hoặc sửa 3.2.
