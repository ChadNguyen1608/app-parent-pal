# PARENT-PAL — Review Package: Access Policy

**L3:** `F01-G04-M01` · **Ngày:** 2026-11-10 · **Trạng thái:** `MULTI_PASS_DESK_TRIAL / OWNER_REVIEW`  
**Nguồn yêu cầu gốc:** 3.2 §F01-G04 (Access Policy, Consent Ledger); 3.2 §F07-G06; 3.4 UC-002/UC-013/UC-015/UC-024; MR-016/017/021/035; yêu cầu policy theo quốc gia do Product Owner cung cấp.

**Lưu ý về bằng chứng:** Các test MP- là **bộ test thiết kế mới từ yêu cầu gốc**, độc lập về *cách chọn yêu cầu* so với bộ TC-L4- trước đó; **không** do sub-agent/model độc lập chạy. Tất cả `execution_status=NOT_EXECUTED`. Đây là Given/When/Then ở mức đặc tả, không có kết quả thực nghiệm.

## 1. Owner Review — Đọc phần này trước

**Product Owner feedback vòng 1 (2026-11-10):** Trong một gia đình có **một người quản lý kế hoạch chính**; thành viên quản lý khác mặc định ở vai trò **observer/supporter**: quan sát dữ liệu đã được cấp quyền, hỗ trợ và gửi đề xuất, nhưng **không được sửa, phê duyệt hoặc commit kế hoạch**. Không đồng nhất vai trò quản lý kế hoạch trong app với quyền đại diện/giám hộ theo pháp luật. **Owner xác nhận các test còn lại OK ở mức định hướng thiết kế; không phải legal sign-off hoặc test đã chạy.**

Bạn nên xem lại A11 và ba case mới A15–A17 về phân quyền một manager, observer và bàn giao quyền. Các trường hợp hiếm về tranh chấp thẩm quyền pháp lý giữ trong research thay vì biến mọi gia đình nhiều người thành trường hợp tranh chấp.

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
| `MP-A11` | Gia đình có P1 **primary plan manager** và P2 **observer/supporter**. P2 đăng nhập và cố trực tiếp sửa/xóa/duyệt lịch C8 | P2 được **xem nội dung trong phạm vi đã được phép** và **gửi đề xuất/hỗ trợ**; nhưng hành động sửa, duyệt, commit hoặc xóa kế hoạch bị `DENY`. P1 được quản lý kế hoạch trong scope hợp lệ. Không phát sinh tranh chấp chỉ vì gia đình có nhiều người lớn; nếu policy owner thực sự mâu thuẫn hoặc thiếu primary manager thì fail-closed và escalation riêng | `ACCESS-DECIDE` | Owner feedback 2026-11-10; F01-G04/G05; UC-007/008; MR-017 |
| `MP-A12` | Một event tranh chấp được gửi lại cùng version 3 lần | Không tạo 3 case; idempotency theo event và policy version | `ACCESS-DISPUTE` | UC-024; MR-021 |
| `MP-A13` | Operator không được ủy quyền truy cập hồ sơ tranh chấp | DENY; không trả danh tính/chi tiết; audit tối thiểu | `ACCESS-DISPUTE` | UC-024; MR-021 |
| `MP-A14` | Service token chỉ có quyền đọc submission S-101 nhưng yêu cầu đọc lịch và Journal | DENY các resource khác; scope không lan sang toàn bộ child profile | `ACCESS-DECIDE` | 3.2 F07-G06; MR-021 |
| `MP-A15` | P2 là observer/supporter muốn giúp P1 bằng cách **đề xuất** đổi lịch hoặc ghi nhận xét, không trực tiếp thay đổi plan | Cho phép gửi **proposal/comment** trong phạm vi được quyền tham gia; trạng thái `PENDING`/hành động không tự ghi plan; P1 là người có quyền xem xét và quyết định. Không dùng proposal làm đường vòng để commit | `ACCESS-DECIDE` | Owner feedback; F04-G06; UC-008/010 |
| `MP-A16` | P1 đang là primary manager; P2 muốn trở thành primary manager và thử tự đổi role | P2 không được tự nâng quyền; cần **handover/role transition** có xác nhận theo policy và version/audit. Sau chuyển giao hiệu lực, chỉ có một primary plan manager cho cùng phạm vi quản lý; quyền cũ bị thu hồi, requests cũ kiểm lại trước commit | `ACCESS-DECIDE` | Owner feedback; F01-G04/G05; MR-017 |
| `MP-A17` | Hai người cùng được gắn cờ primary manager cho cùng một phạm vi hoặc chưa chọn primary manager | Không cho thực hiện mutation dựa trên cấu hình bất nhất; trả trạng thái cần xử lý, **không mặc nhiên chọn một người**. Cho phép các tác vụ quan sát/đề xuất nếu quyền hợp lệ; chuyển việc định danh primary tới workflow có thẩm quyền | `ACCESS-DISPUTE` | Owner feedback; F01-G04/G05; MR-017 |

**Số test thiết kế sau phản hồi Owner:** 17 (14 case ban đầu, sửa MP-A11 và bổ sung MP-A15–A17). Không cộng với 43 test gốc thành số test đã chạy. Test được xây dựng để phủ outcome, negative cases, role/permission, trạng thái và ranh giới giữa L3.

## 3. Architect: Kết quả L4 sau rà soát

| Outcome | Hợp đồng / ranh giới | Disposition đề xuất | Candidate hiện có |
|---|---|---|---|
| `ACCESS-DECIDE` | Kiểm quyền theo actor/action/resource/purpose/scope **và vai trò primary plan manager/observer-supporter**; một primary manager cho một phạm vi kế hoạch, observer không được sửa/duyệt/commit, nhưng được đề xuất khi có quyền; quyết định có policy version | `KEEP` | `F01-G04-M01-001` |
| `ACCESS-PREVIEW` | Xem trước quyền chỉ là read-model/UX của policy, quyền xem metadata phải kiểm riêng | `DEFER` | `CAND-F01-G04-M01-effective-access-preview` |
| `ACCESS-DISPUTE` | **Chỉ xử lý cấu hình vai trò/quan hệ pháp lý thực sự bất nhất** (hai primary cùng scope, không có primary hoặc tranh chấp thẩm quyền); không coi hai người lớn cùng gia đình là tranh chấp mặc định; hồ sơ case quản trị nếu cần vẫn chưa rõ owner | `MOVE/DEFER` | `CAND-F01-G04-M01-policy-conflict-review` |

**Quy tắc:** Các outcome ở trên chỉ là ứng viên. Nếu outcome không có vòng đời/giá trị độc lập thì không cấp L4 ID. Giữ các test cho hành vi gộp/hoãn/chuyển owner.

## 4. Adversarial review: Vấn đề và đề xuất

| # | Nhóm | Counterexample / lỗ hổng | Đề xuất |
|---|---|---|---|
| 1 | DESIGN | Tách quyết định quyền `INDETERMINATE` khỏi hành vi enforcement `DENY`; không được xem INDETERMINATE là ALLOW. | Tự sửa contract/test. |
| 2 | OWNER | Một primary plan manager, các observer/supporter không được sửa/duyệt/commit; cần phân biệt **family collaboration role** với quyền giám hộ hợp pháp. | F01-G04 policy enforcement; F01-G05 role transition; F04-G06 proposal/approval workflow. Case management chỉ khi có vai trò/pháp lý bất nhất, owner case để UNKNOWN. |
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

## 7. Change Log — Owner Feedback (2026-11-10)

| CR | Phản hồi người sở hữu sản phẩm | Cách phản ánh | Trạng thái |
|---|---|---|---|
| `ACCESS-CR-01` | Gia đình có nhiều người cùng hỗ trợ, nhưng **một người quản lý/lên kế hoạch chính**; người khác là observer, không có quyền thay đổi kế hoạch | Sửa MP-A11; bổ sung MP-A15–A17. Vai trò observer được quan sát/phối hợp và đưa đề xuất, nhưng không sửa/xóa/duyệt/commit; một primary plan manager trên **cùng phạm vi** kế hoạch | `OWNER_DIRECTION_ACCEPTED / DESIGN_UPDATED` |
| `ACCESS-CR-02` | Các expected output khác trong Review Package được Owner đồng ý | Giữ nội dung đã review; không coi là kết quả pháp lý hoặc triển khai | `OWNER_REVIEWED_AT_SPEC_LEVEL` |

### Phần hệ thống có thể mặc định giải quyết, chưa cần hỏi Owner

1. **Observer/supporter:** `plan:read` theo scope đã cấp, `plan:propose` hoặc `plan:comment` theo quyền; `plan:create/update/delete/approve/commit` bị deny. Việc **đề xuất** không tự cập nhật kế hoạch hoặc tự duyệt.
2. **Primary manager:** Duy nhất trong **cùng phạm vi** quản lý kế hoạch tại một thời điểm. Đây là quy tắc vai trò ứng dụng; không loại bỏ nghĩa vụ và thẩm quyền giám hộ theo pháp luật.
3. **Bàn giao:** đề xuất luồng handover có xác nhận, version, audit, revoke quyền cũ và kiểm lại quyền trước mutation; chi tiết người đủ thẩm quyền xác nhận bàn giao giữ `RESEARCH_REQUIRED / LEGAL_POLICY_UNKNOWN`.
4. **Không có hoặc hai primary:** fail-closed cho mutation; có thể cho observer đọc/gửi đề xuất trong phạm vi còn hợp lệ. Không âm thầm chọn primary bằng ngày tạo tài khoản.
5. **Chia sẻ dữ liệu:** vai trò observer **không** mặc nhiên được xem Journal, health, học tập nhạy cảm hoặc tài nguyên khác; mọi read vẫn cần purpose-bound policy.

### Research/decision cần theo dõi, không chặn owner review ở mức thiết kế

- `MR-016/017`: pháp luật theo jurisdiction và cơ chế đồng ý/bàn giao người giám hộ; bản ghi chính sách có source/version/effective dates.
- Handover khi P1 vắng mặt, mất năng lực hoặc không thể xác nhận: cần quy trình khôi phục đã xác minh, không tự định nghĩa luật.
- Trường hợp **hai người quản lý chính ở những phạm vi khác nhau** (ví dụ hai trẻ khác nhau): mặc định cho phép cấu hình theo scope, nhưng cần kiểm trong khi mở rộng product permissions.

**Kết quả:** 17 test design, 0 executed; L4 disposition vẫn là đề xuất, không cấp ID mới hoặc sửa canonical.
