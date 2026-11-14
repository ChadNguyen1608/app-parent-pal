# PARENT-PAL — Review Package: Academic Assessment

**L3:** `F06-G07-M01` · **Ngày:** 2026-11-10 · **Trạng thái:** `MULTI_PASS_DESK_TRIAL / OWNER_REVIEW`  
**Nguồn yêu cầu gốc:** 3.2 F06-G07-M01, L3C-02, F04-G05-M02, F06-G05; SC-002; 3.4 chưa có UC chi tiết cho đánh giá học tập; MR-023/025/030/031; owner input ưu tiên lớp 1–9 và thử nghiệm LLM.

**Lưu ý về bằng chứng:** Các test MP- là **bộ test thiết kế mới từ yêu cầu gốc**, độc lập về *cách chọn yêu cầu* so với bộ TC-L4- trước đó; **không** do sub-agent/model độc lập chạy. Tất cả `execution_status=NOT_EXECUTED`. Đây là Given/When/Then ở mức đặc tả, không có kết quả thực nghiệm.

## 1. Owner Review — Đọc phần này trước

Bạn nên tập trung B04, B05, B10, B14 và B17: phản hồi của AI, trường hợp không chấm được, review của người, và khác biệt giữa AI/giáo viên. Chất lượng model phải được thử nghiệm sau, không quyết bằng đọc tài liệu.

**Kết luận đề xuất:** **3 L4 trọng tâm đề xuất**: đánh giá (gồm rubric validation), review thiếu chắc chắn có vòng đời, sửa kết quả. Bốn hành vi ban đầu không nhất thiết thành bốn L4.

## 2. QA-first: Test case và expected output

| Test | Input / Given + When | Expected output / Then | Outcome trace | Nguồn |
|---|---|---|---|---|
| `MP-B01` | Bài lớp 3 có rubric đúng môn/lớp/chương trình, nguồn được phép, version R1 | Khóa R1 cho lượt đánh giá, có provenance; không tự nâng R2 | `ASSESS` | 3.2 F06-G07; L3C-02 |
| `MP-B02` | Rubric môn Văn lớp 8 được dùng cho bài Toán lớp 3 | INELIGIBLE; không gọi model để chấm | `ASSESS` | 3.2 F06-G07 |
| `MP-B03` | Không có rubric phù hợp hoặc rubric thiếu nguồn/approval | UNABLE_TO_ASSESS/NEEDS_RUBRIC; không bịa rubric | `ASSESS` | F07-G02; MR-023 |
| `MP-B04` | Trẻ nộp câu trả lời 2+3=6 theo rubric giả lập xác nhận 2+3=5 | Phản hồi tạm sai theo rubric, kèm giải thích và provenance; không gắn giáo viên xác nhận | `ASSESS` | SC-002; L3C-02 |
| `MP-B05` | Ảnh chữ viết tay mờ, model không đọc được | UNABLE_TO_ASSESS, không tự chấm 0 hay khẳng định học lực | `ASSESS` | SC-002; MR-030 |
| `MP-B06` | Ảnh bài nộp có trang thiếu và nội dung riêng tư ngoài phạm vi | Đánh dấu thiếu bằng chứng; chỉ gửi dữ liệu tối thiểu theo quyền, không tự suy đáp án | `ASSESS` | MR-021/030 |
| `MP-B07` | Phụ huynh chưa được quyền đọc bài của trẻ, yêu cầu AI chấm | Không truy xuất ảnh, cache hoặc gọi model; từ chối có lý do phù hợp | `ASSESS` | F01-G04; F07-G06 |
| `MP-B08` | Model/provider timeout hoặc trả JSON không hợp lệ | Không báo hoàn thành; giữ trạng thái retry/UNABLE_TO_ASSESS; không sửa submission | `ASSESS` | MR-025/030 |
| `MP-B09` | Một submission được đánh giá hai lần do retry; provider không hỗ trợ idempotency billing | Không tạo hai kết quả cuối cùng; ghi nhận rủi ro phí provider, không hứa exactly-once billing | `ASSESS` | MR-025 |
| `MP-B10` | Kết quả AI không chắc chắn theo rule đã cấu hình, reviewer hợp lệ có thể nhận việc | Tạo đúng một review case trạng thái PENDING, không tự verified | `REVIEW` | L3C-02; MR-023 |
| `MP-B11` | Không có reviewer hợp lệ hoặc quyền reviewer bị thu hồi giữa chừng | Giữ PENDING/REASSIGN_REQUIRED; không lộ evidence, không tự approve | `REVIEW` | MR-021; L3C-02 |
| `MP-B12` | Reviewer được ủy quyền sửa kết quả tạm và có lý do | Tạo assessment version mới, giữ bản cũ, actor và evidence link | `CORRECT` | 3.2 F06-G07 |
| `MP-B13` | Hai reviewer cùng sửa từ version N | Chỉ một commit từ N thành N+1; còn lại báo conflict, không mất lịch sử | `CORRECT` | 3.2 F06-G07 |
| `MP-B14` | Phụ huynh mở báo cáo sau khi bài được sửa | F06-G05 kiểm quyền nhận báo cáo và version; không mặc nhiên công bố kết quả thô hoặc claim teacher verified | `CORRECT` | L3C-02; UC-015 |
| `MP-B15` | Đánh giá trên bài lớp 1 hoặc lớp 9 với rubric tương ứng | Cần rule/UX đúng lớp, không dùng một rubric chung; chưa coi mô hình LLM đã đáp ứng | `ASSESS` | Owner input lớp 1–9; MR-023 |
| `MP-B16` | Bộ ảnh chữ viết tay tiếng Việt có nhãn chuyên gia chưa được cung cấp | Không kết luận độ chính xác AI; đặt benchmark và ngưỡng review là RESEARCH_REQUIRED | `ASSESS` | MR-023/030 |
| `MP-B17` | Giáo viên xác nhận kết quả khác với AI, nguồn và chữ ký chưa được xác minh | Giữ hai provenance riêng; không gắn teacher verified nếu chưa xác thực | `CORRECT` | L3C-02 |

**Số test thiết kế mới:** 17. Không cộng với 43 test gốc thành số test đã chạy. Test được xây dựng để phủ outcome, negative cases, role/permission, trạng thái và ranh giới giữa L3.

## 3. Architect: Kết quả L4 sau rà soát

| Outcome | Hợp đồng / ranh giới | Disposition đề xuất | Candidate hiện có |
|---|---|---|---|
| `ASSESS` | Kiểm rubric áp dụng và đánh giá bài là một outcome; trả đánh giá tạm hoặc UNABLE_TO_ASSESS | `KEEP + MERGE RUBRIC` | `CAND-F06-G07-M01-assess-submission` |
| `REVIEW` | Tạo/quản lý hồ sơ review kết quả thiếu chắc chắn, chỉ khi có vòng đời và reviewer riêng | `KEEP_CONDITIONAL` | `CAND-F06-G07-M01-review-uncertainty` |
| `CORRECT` | Sửa đánh giá có attribution, version và audit, không ghi đè kết quả cũ | `KEEP` | `CAND-F06-G07-M01-correct-assessment` |
| `RUBRIC` | Rubric eligibility chỉ là precondition; source approval của F07 không chuyển owner | `MERGE` | `CAND-F06-G07-M01-rubric-eligibility` |

**Quy tắc:** Các outcome ở trên chỉ là ứng viên. Nếu outcome không có vòng đời/giá trị độc lập thì không cấp L4 ID. Giữ các test cho hành vi gộp/hoãn/chuyển owner.

## 4. Adversarial review: Vấn đề và đề xuất

| # | Nhóm | Counterexample / lỗ hổng | Đề xuất |
|---|---|---|---|
| 1 | DESIGN | Rubric eligibility chưa có outcome độc lập, nhưng rubric source/approval phải giữ ở F07-G02. | Gộp vào ASSESS; giữ B01–B03 làm preconditions. |
| 2 | OWNER | Chưa có UC chi tiết trong 3.4 cho chấm bài và reviewer; quy trình giáo viên xác nhận chưa xác định. | Đề xuất bổ sung UC riêng sau P5; F04 submission → F06 assessment → F06 report. |
| 3 | RESEARCH | LLM/vision OCR tiếng Việt và rubric lớp 1–9 chưa có dataset đánh giá, lỗi theo môn/lớp. | Thử nghiệm có giám sát, theo từng grade/task; không tự động hóa kết quả quan trọng trước benchmark. |
| 4 | RESEARCH | Chi phí mỗi bài đánh giá thành công, retention provider, retry và latency chưa đo. | Thiết kế instrumentation và cost cap, benchmark E0/E1 vs LLM/vision. |
| 5 | DESIGN | Review-uncertainty có thể chỉ là nhánh trạng thái nếu không có queue/actor/transition thực. | KEEP_CONDITIONAL; nếu không có lifecycle riêng thì MERGE. |
| 6 | OWNER | Ai có quyền xác minh giáo viên, sửa bài và chia sẻ báo cáo? | Đề xuất role theo purpose; không coi người nhập dữ liệu là người xác minh. |

## 5. Validator: Phạm vi kiểm tra thực tế

- **Đã đối chiếu:** Các test có nguồn yêu cầu; các outcome có test; ranh giới L3 trong 3.2/3.4; tính nhất quán đầu vào/đầu ra ở mức văn bản.
- **Chưa làm:** Chạy code, gọi LLM chấm bài, chạy authorization service, kiểm thử với người dùng/trẻ, legal review, đo latency/cost, xác minh nguồn nghiên cứu.
- **Các expected output chưa có bằng chứng:** Các quy tắc theo quốc gia/tuổi, mức học–chơi phù hợp, độ chính xác LLM, UX và role được ủy quyền.
- **Trạng thái:** `SOURCE_TRACED / DESIGN_CHECKED / NOT_EXECUTED`, kèm `OWNER_REVIEW` và `RESEARCH_REQUIRED` ở các hàng tương ứng. Không có `TEST_PASSED`.

## 6. Phản hồi Product Owner

Có thể phản hồi bằng `MP-Assessment: sửa test MP-... thành ...` hoặc `đồng ý expected output, nhưng đổi quyền/nguồn ...`. Không cần duyệt từng ID L4; Coordinator sẽ suy ra diff từ các test và giữ log thay đổi.

**Không tự cập nhật canonical Blueprint hoặc merge PR #17.**
