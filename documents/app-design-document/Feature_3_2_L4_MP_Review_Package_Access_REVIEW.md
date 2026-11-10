# PARENT-PAL — Review Package: Access Policy

**L3:** `F01-G04-M01` · **Ngày:** 2026-11-10 · **Trạng thái:** `MULTI_PASS_DESK_TRIAL / OWNER_REVIEW`  
**Nguồn yêu cầu gốc:** 3.2 §F01-G04 (Access Policy, Consent Ledger); 3.2 §F07-G06; 3.4 UC-002/UC-013/UC-015/UC-024; MR-016/017/021/035; yêu cầu policy theo quốc gia do Product Owner cung cấp.

**Lưu ý về bằng chứng:** Các test MP- là **bộ test thiết kế mới từ yêu cầu gốc**, độc lập về *cách chọn yêu cầu* so với bộ TC-L4- trước đó; **không** do sub-agent/model độc lập chạy. Tất cả `execution_status=NOT_EXECUTED`. Đây là Given/When/Then ở mức đặc tả, không có kết quả thực nghiệm.

## 1. Owner Review — Đọc phần này trước

Bạn chỉ cần xem A03, A07, A08 và A11: kỳ vọng về quyền riêng tư, quốc gia và xử lý tranh chấp có đúng định hướng sản phẩm không. Các test còn lại có thể tiếp tục chỉnh theo nguyên tắc least privilege.

**Kết luận đề xuất:** **1 L4 lõi đề xuất** (Access decision); preview là hành vi read-model chờ chứng minh; case tranh chấp là workflow cần xác nhận owner. Không phải kết luận rằng module chỉ có thể có một L4 trong tương lai.

## 2. QA-first: Test case và expected output

| Test | Input / Given + When | Expected output / Then | Outcome trace | Nguồn |
|---|---|---|---|---|
| `MP-A01` | P1 được policy V1 cấp quyền sửa lịch C8, đúng scope và mục đích | ALLOW với scope C8, action và policy version; không cấp quyền Journal | `ACCESS-DECIDE` | 3.2 F01-G04; UC-002 |
| `MP-A02` | PX ở FAMILY-B thử đọc lịch C8 bằng ID đoán được | DENY trước truy xuất; không tiết lộ sự tồn tại của tài nguyên | `ACCESS-DECIDE` | 3.2 F01-G04; MR-021 |
| `MP-A03` | P1 là người trả phí, yêu cầu đọc Journal riêng của C8 | Không suy quyền từ billing/quan hệ; DENY khi thiếu authorization theo purpose | `ACCESS-DECIDE` | UC-013; L3C-03; MR-018/021 |
| `MP-A04` | Thiếu actor identity hoặc purpose | Không cho truy cập; engine có thể trả INDETERMINATE nhưng enforcement phải DENY | `ACCESS-DECIDE` | 3.2 F01-G04; MR-035 |
| `MP-A05` | Consent/policy bị thu hồi sau khi hiển thị ALLOW nhưng trước khi mutation | Kiểm lại tại thời điểm mutation; từ chối ghi theo version mới | `ACCESS-DECIDE` | UC-002; MR-017 |
| `MP-A06` | P1 có quyền xem lịch để lập kế hoạch, dùng cùng scope để yêu cầu inference Journal | Từ chối purpose khác; không đọc cache/model cho dữ liệu riêng tư | `ACCESS-DECIDE` | 3.2 F07-G06; MR-021 |
| `MP-A07` | A19 không cấp quyền cho P1; P1 dùng quan hệ cha mẹ trước đây | Không mặc định ALLOW; xử lý theo policy jurisdiction/effective date đã xác minh | `ACCESS-DECIDE` | MR-016/017; A5 |
| `MP-A08` | Một chính sách địa phương được cấu hình với ngày hiệu lực và vùng áp dụng; request không xác định jurisdiction | Không tự chọn luật thuận lợi; từ chối/chuyển review, lưu policy source/version | `ACCESS-DECIDE` | Owner input: country-specific policy; MR-016/017 |
| `MP-A09` | P1 được phép xem metadata quyền của C8 nhưng không được đọc Journal | Hiển thị danh mục quyền hợp lệ, không hiển thị Journal hay tên tài nguyên ngoài scope | `ACCESS-PREVIEW` | F01-G04; MR-021 |
| `MP-A10` | PX dò hàng loạt ID để xem trước quyền của FAMILY-A | Không trả metadata phân biệt tài nguyên tồn tại; kiểm quyền preview trước khi tổng hợp | `ACCESS-PREVIEW` | F01-G04; MR-021 |
| `MP-A11` | Hai người giám hộ có policy mâu thuẫn, không có cơ sở phân xử | INDETERMINATE → enforcement DENY; tạo hoặc chuyển hồ sơ review theo workflow có quyền, không auto-ALLOW | `ACCESS-DISPUTE` | MR-017; UC-024 |
| `MP-A12` | Một event tranh chấp được gửi lại cùng version 3 lần | Không tạo 3 case; idempotency theo event và policy version | `ACCESS-DISPUTE` | UC-024; MR-021 |
| `MP-A13` | Operator không được ủy quyền truy cập hồ sơ tranh chấp | DENY; không trả danh tính/chi tiết; audit tối thiểu | `ACCESS-DISPUTE` | UC-024; MR-021 |
| `MP-A14` | Service token chỉ có quyền đọc submission S-101 nhưng yêu cầu đọc lịch và Journal | DENY các resource khác; scope không lan sang toàn bộ child profile | `ACCESS-DECIDE` | 3.2 F07-G06; MR-021 |

**Số test thiết kế mới:** 14. Không cộng với 43 test gốc thành số test đã chạy. Test được xây dựng để phủ outcome, negative cases, role/permission, trạng thái và ranh giới giữa L3.

## 3. Architect: Kết quả L4 sau rà soát

| Outcome | Hợp đồng / ranh giới | Disposition đề xuất | Candidate hiện có |
|---|---|---|---|
| `ACCESS-DECIDE` | Giữ L4 quyền truy cập theo actor/action/resource/purpose/scope; quyết định có policy version | `KEEP` | `F01-G04-M01-001` |
| `ACCESS-PREVIEW` | Xem trước quyền chỉ là read-model/UX của policy, quyền xem metadata phải kiểm riêng | `DEFER` | `CAND-F01-G04-M01-effective-access-preview` |
| `ACCESS-DISPUTE` | Tranh chấp giám hộ: Access Policy từ chối khi chưa rõ; hồ sơ xử lý là workflow vận hành chưa rõ owner | `MOVE/DEFER` | `CAND-F01-G04-M01-policy-conflict-review` |

**Quy tắc:** Các outcome ở trên chỉ là ứng viên. Nếu outcome không có vòng đời/giá trị độc lập thì không cấp L4 ID. Giữ các test cho hành vi gộp/hoãn/chuyển owner.

## 4. Adversarial review: Vấn đề và đề xuất

| # | Nhóm | Counterexample / lỗ hổng | Đề xuất |
|---|---|---|---|
| 1 | DESIGN | Tách quyết định quyền `INDETERMINATE` khỏi hành vi enforcement `DENY`; không được xem INDETERMINATE là ALLOW. | Tự sửa contract/test. |
| 2 | OWNER | Ai sở hữu vòng đời hồ sơ tranh chấp giám hộ: F01 policy operations hay F07-G07 operational case? | Đề xuất F01 sở hữu policy state; F07-G07 hỗ trợ operator/audit; owner hồ sơ = UNKNOWN tới khi xác định workflow. |
| 3 | RESEARCH | Cơ sở pháp lý và quyền riêng tư theo từng quốc gia/tuổi, nguồn policy và thời gian hiệu lực. | MR-016/017; thiết kế policy registry trước, legal review trước production. |
| 4 | DESIGN | Preview có thật sự là outcome độc lập hay chỉ UI read-model? | Giữ test A09–A10; DEFER ID riêng. |
| 5 | RESEARCH | Xung đột giữa người giám hộ và quyền riêng tư trẻ có thể cần cơ chế giải quyết khác nhau theo nước. | Không mã hóa quy tắc Việt Nam như universal default. |

## 5. Validator: Phạm vi kiểm tra thực tế

- **Đã đối chiếu:** Các test có nguồn yêu cầu; các outcome có test; ranh giới L3 trong 3.2/3.4; tính nhất quán đầu vào/đầu ra ở mức văn bản.
- **Chưa làm:** Chạy code, gọi LLM chấm bài, chạy authorization service, kiểm thử với người dùng/trẻ, legal review, đo latency/cost, xác minh nguồn nghiên cứu.
- **Các expected output chưa có bằng chứng:** Các quy tắc theo quốc gia/tuổi, mức học–chơi phù hợp, độ chính xác LLM, UX và role được ủy quyền.
- **Trạng thái:** `SOURCE_TRACED / DESIGN_CHECKED / NOT_EXECUTED`, kèm `OWNER_REVIEW` và `RESEARCH_REQUIRED` ở các hàng tương ứng. Không có `TEST_PASSED`.

## 6. Phản hồi Product Owner

Có thể phản hồi bằng `MP-Access: sửa test MP-... thành ...` hoặc `đồng ý expected output, nhưng đổi quyền/nguồn ...`. Không cần duyệt từng ID L4; Coordinator sẽ suy ra diff từ các test và giữ log thay đổi.

**Không tự cập nhật canonical Blueprint hoặc merge PR #17.**
