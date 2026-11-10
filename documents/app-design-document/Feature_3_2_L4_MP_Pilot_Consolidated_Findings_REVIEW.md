# PARENT-PAL — Multi-Pass Pilot: Tổng hợp kết quả và kiểm tra chéo

**Ngày:** 2026-11-10 · **Trạng thái:** `TRIAL_COMPLETE_AT_DOCUMENT_LEVEL / OWNER_REVIEW_PENDING`  
**Nguồn:** Blueprint 3.2-R1, 3.3, 3.4, Master Research Backlog v1.2; 43 test gốc, 60 cohort rows, P5 Review Report và ba Review Package MP.  
**Độ độc lập:** **Một trợ lý thực hiện nhiều lượt phân tích tách vai; KHÔNG có nhiều sub-agent độc lập thực sự được khởi chạy.** Kết luận chỉ có giá trị desk review. **Không chạy LLM, service, code ứng dụng hay kiểm chứng pháp lý/khoa học.**

## 1. Kết quả thử nghiệm phương pháp

| Đầu ra | Kết quả kiểm tra |
|---|---|
| L3 được thử | 3: `F01-G04-M01`, `F06-G07-M01`, `F04-G02-M03` |
| Test case QA-first mới | **55** = 14 Access + 17 Assessment + **24 Balance** (sau 6 phản hồi Owner, bổ sung 7 ca biên), có Given/When và expected output |
| Test case pilot cũ | **43** = 12 + 16 + 15; **không sửa, không xóa** |
| Test bổ sung ở P5 Gap Register | **24 đề xuất**; chưa hợp nhất/dedupe với 55 test QA-first |
| Cohort matrix cũ | **60 dòng** = 10 L4 × 6 cohort, chưa xác minh quyền |
| L4 trọng tâm khuyến nghị | **6** = 1 Access + 3 Assessment + 2 Balance; **chưa phê duyệt** |
| Thực thi test trên app/model | **0**; tất cả `NOT_EXECUTED` |
| Kiểm tra cấu trúc tự động | ID QA-first 55/55 duy nhất; trace test → outcome hiện hữu 55/55; test cũ 43/43 ID duy nhất |
| Kiểm tra số học giả lập | 17:00–18:00 + 17:30–18:30: overlap **30**, occupied union **90**, sum durations **120** phút |
| Cổng legal/privacy/safety/feasibility | **UNKNOWN**; không có kết quả PASS |

**Lưu ý đếm:** 55 QA-first và 43 test cũ có nhiều tình huống tương tự, không thể cộng để khẳng định 98 yêu cầu riêng hoặc 98 test đã chạy. 24 test gap còn có thể trùng cả hai bộ. Cần dedupe theo requirement/outcome và variant trước khi tạo test suite cuối cùng.

## 2. So sánh QA-first với kết luận P5 trước

| Module | Điều rút ra khi đi từ yêu cầu → test → L4 | Thay đổi đáng chú ý |
|---|---|---|
| **Access** | `ACCESS-DECIDE` là outcome độc lập; preview có thể là read-model; dispute case cần workflow khác | **Mới:** test policy theo jurisdiction, effective date, purpose mismatch, metadata enumeration và service scope. Không tự gán luật nước ngoài. |
| **Assessment** | Rubric eligibility là precondition của đánh giá; reviewer queue và correction có lifecycle khác nhau | **Mới:** test lớp 1–9, provider double billing, conflict giữa kết quả AI và giáo viên, không đọc evidence khi chưa có quyền. |
| **Balance** | Validation cân bằng khác conflict detection; expiry là trigger của exception lifecycle | **Mới:** test chuẩn tham chiếu có nguồn, family bar cao hơn chuẩn, plan version race, timezone/recurrence và quyền A5. **Owner Feedback 2026-11-10:** weekly feasible-search trước escalation, default bar fallback, trẻ luôn được đề xuất, P1 duyệt soft-cap trong quyền, hard-cap không vượt, exception max 60 ngày + cách 7 ngày, self-managed sharing tự nguyện. |

**Kết luận phản biện:** Lượt QA-first không đưa ra bằng chứng buộc phải tăng số L4 so với 6 outcome đề xuất; tuy nhiên nó tìm thêm **điều kiện nghiệm thu, quyền và nghiên cứu** mà một lượt đọc danh sách L4 dễ bỏ qua. Đây không phải xác nhận độc lập rằng “6 là tối ưu toàn cục”. Cần owner review các expected output và có thể thay đổi số L4.

## 3. Lỗi/khác biệt phát hiện trong quá trình tự kiểm tra

| ID | Phát hiện | Hành động đề xuất | Tình trạng |
|---|---|---|---|
| MP-F01 | `INDETERMINATE` là kết quả engine; enforcement phải deny khi thiếu quyền. Test cũ A04 ghi `DENY/INDETERMINATE` dễ nhập nhằng. | Tách hai lớp trong contract, giữ log reason/version. | `DESIGN_CHECKED` |
| MP-F02 | `L3C-03` nói về F05/F07 Journal, không phải hợp đồng owner Access Policy. | Sửa trace trong bản nháp P5; không sửa canonical. | `SOURCE_TRACED` |
| MP-F03 | `RUBRIC` và `EXPIRY` là outcome được ghi để giải thích **MERGE**, không phải outcome có test độc lập mới. | Alias `RUBRIC → ASSESS`, `EXPIRY → EXCEPTION`; giữ test của các nhánh. | `DESIGN_CHECKED` |
| MP-F04 | Chồng lịch 30 phút có `occupied=90`, `sum durations=120`; `effort load` chưa có công thức/nguồn. | Không dùng occupied time thay effort load; conflict thuộc F04-G02-M02. | `SYNTHETIC_CALC_CHECKED` |
| MP-F05 | P5 trước gợi ý F04-G02-M01 là owner plan state; 3.4 nói F04-G01 là owner plan baseline. | Giữ F04-G01 baseline; F04-G02 schedule/validation; F04-G06 approval. | `SOURCE_TRACED` |
| MP-F06 | Không thể bảo đảm exactly-once billing cho LLM provider bằng local idempotency. | Kiểm application dedupe riêng, đo phí provider thực tế, đặt cost cap. | `RESEARCH_REQUIRED` |
| MP-F07 | Mốc 18 tuổi và luật theo quốc gia chưa đủ để định nghĩa mọi quyền đại diện/consent. | Policy registry có jurisdiction, legal source, version, effective dates; expert review. | `RESEARCH_REQUIRED` |
| MP-F08 | 3.4 thiếu UC đánh giá học tập chi tiết; 3.3 dùng baseline trước R1; MR-040 không thấy trong Master v1.2. | Ghi issue đồng bộ nguồn, không tự cấp UC/MR mới. | `SPEC_GAP` |

## 4. Owner Review: các test đáng đọc trước

Đọc toàn bộ bảng Given/When/Then trong ba Review Package; nếu muốn tiết kiệm thời gian, ưu tiên:

| Module | Test cần chú ý | Điều bạn cần đánh giá |
|---|---|---|
| Access | `MP-A03`, `MP-A07`, `MP-A08`, `MP-A11` | Journal privacy; chuyển quyền tuổi trưởng thành; jurisdiction; tranh chấp người giám hộ |
| Assessment | `MP-B04`, `MP-B05`, `MP-B10`, `MP-B14`, `MP-B17` | Chấm sai/không chấm được; người review; chia sẻ kết quả; teacher verification |
| Balance | `MP-C01`, `MP-C05`, `MP-C06`, `MP-C09`, `MP-C12` | Standard Bar, chuẩn nghiên cứu, ngoại lệ ôn thi và xử lý hết hạn |

**Cách sửa:** Ghi ví dụ `MP-B04: expected output phải ...` hoặc `MP-C06: family bar được ...`. Coordinator sẽ đối chiếu lại L4, test và ownership, không yêu cầu bạn duyệt từng schema field.

## 5. Các vấn đề không được tự coi là đã giải quyết

| Nhóm | Phương án thiết kế mặc định | Bằng chứng còn thiếu |
|---|---|---|
| **Legal / country** | Policy registry theo jurisdiction + effective date; Việt Nam trước, mốc 18 là giả định cần đối chiếu; trẻ có quyền riêng tư | MR-016/017, legal source và review cho từng quốc gia/role |
| **Academic AI** | Ưu tiên pilot LLM/vision cho lớp 1–9, có `UNABLE_TO_ASSESS`, human review và provenance | Rubric/benchmark từng môn/lớp, tiếng Việt, provider retention, calibration |
| **Reference standards** | Registry nguồn nghiên cứu lớn, scope theo tuổi, ngày review; family bar riêng có cảnh báo | Chọn/đánh giá nguồn, mức áp dụng, hard/soft và UX |
| **Cost** | Instrument latency, success rate, retry, tokens/ảnh, phí mỗi bài chấm thành công | Model benchmark và giá thực tế |
| **Age cohorts** | A0–A5 cùng capability, override quyền/UX khi có bằng chứng; tập trung lớp 1–9 | Permission matrix và UX testing theo cohort |

Các điểm này không phải quyết định thuần ý chí. Không được thay `UNKNOWN` bằng `PASS` chỉ vì owner đồng ý phương án.

## 6. Những quyết định còn cần owner (giảm tối đa)

1. **Quy trình tranh chấp quyền:** Có cần một hồ sơ tranh chấp vận hành với người xử lý và vòng đời riêng ngay trong phạm vi sản phẩm, hay chỉ dừng ở DENY + yêu cầu liên hệ hỗ trợ? **Đề xuất pilot:** DENY + escalation tối thiểu; chưa tạo L4 case-management mới.
2. **Quy trình review bài AI:** Có bắt buộc hàng đợi reviewer nội bộ ngay ở MVP hay cho phép phụ huynh xem kết quả tạm và tự yêu cầu sửa? **Đề xuất pilot:** Có trạng thái review và đường sửa; hàng đợi chuyên gia là tùy chọn theo rủi ro, chưa cam kết đội reviewer vận hành.
3. **Standard Bar:** Có chấp nhận phân biệt `REFERENCE_RECOMMENDATION`, `FAMILY_PREFERENCE`, `PROTECTED_CONSTRAINT`? **Đề xuất:** Có; chỉ hard-rule khi có nguồn và chính sách xác minh, không hard-code BAR-1.

Không cần chốt ba câu ngay để đọc test/output. Chỉ khi sửa scope và chuẩn bị P6 mới cần xác nhận.

## 7. Phạm vi và bước tiếp theo

- **Hoàn thành:** Pilot multi-pass trên 3 L3, 55 QA-first test thiết kế sau phản hồi Owner vòng 1, đối chiếu 43 test cũ, kiểm tra ID/trace, tính toán overlap, ghi ranh giới/issue.
- **Chưa hoàn thành:** Multi-agent thực sự với model độc lập, test executable, đánh giá AI, legal/education review, dedupe test suite cuối cùng, owner acceptance, P6.
- **Khi nhận owner feedback:** Chỉnh test expected outputs → cập nhật outcome L4 → chạy lại kiểm tra trace → ghi diff/changelog → tạo bản `OWNER_REVIEWED` nếu được duyệt.
- **PR:** #17 tiếp tục Draft, chưa merge, không sửa canonical 3.2/3.3/3.4, không cấp ID L4 ổn định.

## 8. Cập nhật vòng phản hồi Product Owner — Balanced Planning (2026-11-10)

**Nguồn:** sáu sửa đổi trên `MP-C02/C04/C08/C09/C10/C15`. Đã cập nhật trực tiếp [Review Package Balanced Planning](Feature_3_2_L4_MP_Review_Package_Balance_REVIEW.md) và Change Log `BAL-CR-01..06`.

| Thay đổi | Tác động lên L4/workflow |
|---|---|
| Lịch tuần trước khi hỏi phụ huynh | F04-G02-M02 tìm/xếp hạng slot theo lịch tuần; F04-G02-M03 kiểm hard-cap/Standard Bar; nếu hết phương án mới escalation; F04-G06 phê duyệt đổi lịch |
| Default Standard Bar | Fallback family override hợp lệ → default có nguồn/phiên bản; thiếu cả hai mới UNKNOWN |
| Trẻ luôn được đề xuất | PROPOSE được tách khỏi APPROVE và COMMIT; parent quản lý duyệt trong phạm vi quyền |
| P1 quản lý trực tiếp | Không yêu cầu P1 duyệt lại chính mình nếu policy cho phép; ngoại lệ chỉ có thể xử lý soft/normal cap, không vượt protected hard-cap |
| Chính sách ngoại lệ 60/7 | Mỗi kỳ tối đa 60 ngày, tối thiểu 7 ngày giữa các kỳ tương tự và chống nối kỳ; 'tương tự', đếm ngày, timezone và exception class còn cần định nghĩa |
| Người dùng tự quản | Chia sẻ với phụ huynh tự nguyện, không mặc định là approval gate |

**Validation cập nhật:** QA-first mới **55 case** = 14 Access + 17 Assessment + 24 Balance. Cần phân biệt 17 case Balance ban đầu đã **được sửa sáu expected outputs** và 7 case biên mới `MP-C18..C24`; không thể gọi tất cả là test độc lập với nhau. 0 test chạy trên app. **L4 1+3+2 giữ là đề xuất**; các quy tắc 60/7 là quyết định sản phẩm, không phải giới hạn khoa học xác minh. Cần đọc các case liên quan và xác nhận phạm vi áp dụng trong P5 trước khi đề xuất P6.
