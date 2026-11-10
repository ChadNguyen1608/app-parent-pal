# PARENT-PAL — Thử nghiệm phân rã L4 trên ba module đại diện

**Phiên bản:** 0.1 · **Ngày:** 2026-11-10 · **Trạng thái:** `P0–P4_DRAFT / REVIEW_ONLY`  
**Phương pháp:** Chủ sản phẩm đã chốt M-Q1..M-Q6 = A.  
**Tài liệu nguồn:** Blueprint 3.2-R1 trên `main` (PR #16 đã merge), 3.3, 3.4, L3C-01..07, L3T-01..08, Master Research Backlog.  
**Phạm vi:** `F01-G04-M01`, `F06-G07-M01`, `F04-G02-M03`.  
**Không bao gồm:** sửa 3.2/3.3/3.4, cấp ID L4 mới chính thức, chốt quyền pháp lý của trẻ, ngưỡng an toàn/AI chấm bài, viết code, thử nghiệm với trẻ thật hoặc chọn MVP.

## 1. P0 — Đối chiếu nguồn và ranh giới trách nhiệm

| L3 | Owner chuẩn / kết quả nghiệp vụ | L4 hiện có | Nguồn |
|---|---|---|---|
| `F01-G04-M01` Access Policy | F01; quyết định quyền theo chủ thể, hành động, tài nguyên, mục đích và phạm vi; không tự sửa sổ đồng ý | `F01-G04-M01-001` — Phân quyền theo chủ thể và mục đích (minh họa; giữ ID) | L3C-03, 3.2 §5, UC-004/007/013/015, MR-016/017/021/035 |
| `F06-G07-M01` Academic Assessment | F06-G07; đánh giá theo rubric có nguồn và khả năng sửa; không đồng nhất với nộp bài hay báo cáo | Chưa có; L4 đang chờ | L3C-02, L3T-02, SC-002, AUD-05, MR-023/025/030/031 |
| `F04-G02-M03` Balanced Planning Validation | F04; đánh giá lịch theo Standard Bar gia đình, ràng buộc cứng/mềm, thời gian chơi và ngoại lệ có hạn; không sửa mục tiêu | Chưa có; L4 đang chờ | L3C-06, SC-001, AUD-08, UC-007/010, MR-012/025/035 |

**Ranh giới cần giữ:** `F01-G04-M02` quản lý bản ghi đồng ý; `F01-G05` quản lý chế độ tự chủ. `F04-G05-M02` quản lý nộp bằng chứng bài tập; `F06-G05` quản lý báo cáo được cấp quyền. `F04-G02-M02` phát hiện trùng lịch và gợi ý khung giờ; `F04-G02-M01` tạo/lưu lịch; `F04-G06` quản lý yêu cầu sửa/duyệt; `F03` quản lý mục tiêu và lộ trình.

## 2. P1–P2 — L4 ứng viên và quyết định ranh giới

| ID ứng viên / ID minh họa hiện có | Kết quả chính | Đề xuất | Lý do |
|---|---|---|---|
| `F01-G04-M01-001` | Trả quyết định `ALLOW/DENY/INDETERMINATE` kèm lý do, phạm vi và phiên bản policy | **GIỮ + làm rõ**; không đổi ID | L4 minh họa đã có; không rõ quyền thì từ chối |
| `CAND-F01-G04-M01-effective-access-preview` | Chủ thể được phép xem bản tóm tắt quyền hiệu lực, không lộ nội dung được bảo vệ | **TÁCH** khỏi quyết định truy cập | Kết quả hướng người dùng khác; phải chống dò tìm tài nguyên |
| `CAND-F01-G04-M01-policy-conflict-review` | Tạo hồ sơ xung đột policy để người có thẩm quyền xử lý; không tự cấp quyền | **TÁCH, CHỜ REVIEW** | Có vòng đời vận hành riêng; cần xác minh owner F01 hay F07 |
| `CAND-F06-G07-M01-rubric-eligibility` | Xác định rubric có áp dụng cho bài nộp không, hoặc nêu lý do không thể đánh giá | **TÁCH, CHỜ REVIEW** | Phiên bản/nguồn rubric có thể cần cổng phát hành riêng |
| `CAND-F06-G07-M01-assess-submission` | Kết quả đánh giá tạm thời có liên kết bằng chứng và rubric; hoặc không thể đánh giá | **GIỮ làm lõi** | Đánh giá ≠ hoàn thành bài ≠ giáo viên xác nhận |
| `CAND-F06-G07-M01-review-uncertainty` | Chuyển kết quả thiếu chắc chắn cho người có quyền xem xét | **TÁCH, CHỜ REVIEW** | Có hàng đợi/hồ sơ xử lý riêng; có thể gộp nếu không có kết quả độc lập |
| `CAND-F06-G07-M01-correct-assessment` | Người có quyền sửa đánh giá, tạo phiên bản mới và lưu dấu vết | **TÁCH** | Quyền ghi và audit khác với quyền chấm |
| `CAND-F04-G02-M03-validate-balance` | Trả cảnh báo ràng buộc cứng/mềm, không tự sửa mục tiêu/lịch | **GIỮ làm lõi** | Kết quả độc lập, kiểm thử bằng quy tắc |
| `CAND-F04-G02-M03-evaluate-exception` | Kiểm tra ngoại lệ có hạn và xác định có cần duyệt không | **TÁCH** | Ngoại lệ không tự phê duyệt |
| `CAND-F04-G02-M03-expiry-recheck` | Phát hiện ngoại lệ hết hạn, yêu cầu đánh giá lại/khôi phục | **TÁCH, CHỜ REVIEW** | Kích hoạt theo thời gian, cần idempotency và bàn giao; không tự sửa lịch |

**Tổng:** 10 kết quả L4 ứng viên trên ba L3 (**1 ID minh họa hiện có + 9 ID `CAND-`**). **Chưa chốt số lượng cuối cùng.** Không ấn định số L4 cho mỗi L3; chưa cấp ID L4 chính thức mới.

## 3. P3 — Hợp đồng chức năng

Mười mục đều có `definition_status=BASELINE_PROPOSED`, `assessment_status=NOT_EVALUATED`, `delivery_status=NOT_PLANNED`, `mvp_decision=NOT_DECIDED`. ID mới tiếp tục mang tiền tố `CAND-`. Mã MR là tham chiếu nghiên cứu đang mở, không có nghĩa nghiên cứu đã xong. Mọi hành động phải kiểm tra quyền **trước khi** đọc dữ liệu bảo vệ, suy luận, tra cache, gọi model hoặc ghi thay đổi.

### 3.1 Access Policy — F01-G04-M01

**Bối cảnh chung:** Người dùng mục tiêu là phụ huynh, trẻ/thanh thiếu niên, chủ tài khoản trưởng thành và người vận hành/service được ủy quyền. Giá trị: chặn truy cập trái phép nhưng không cản hành động hợp lệ. Phân loại dữ liệu tạm: `identity_and_policy_metadata` (taxonomy chưa chốt). F01-G04-M01 sở hữu kết quả đánh giá quyền; bản ghi đồng ý nguồn vẫn thuộc F01-G04-M02. Mặc định E0/E1 bằng quy tắc xác định; AI không được quyết định quyền. Rủi ro chi phí AI thấp khi chỉ dùng rule; chi phí vận hành khác `UNKNOWN`.

| L4 | Kích hoạt / điều kiện trước | Đầu vào → đầu ra | Luồng chính / nhánh thay thế | Nghiệm thu và xử lý lỗi |
|---|---|---|---|---|
| `F01-G04-M01-001` | Yêu cầu `authorize(action)`; đã xác thực chủ thể, xác định tài nguyên/mục đích; policy có thể đang thiếu | Chủ thể, đối tượng, tài nguyên, hành động, mục đích, quan hệ gia đình, phiên bản consent/autonomy → `ALLOW/DENY/INDETERMINATE`, mã lý do, phạm vi và phiên bản policy | Xác thực → đọc policy có thẩm quyền → từ chối khi xung đột/không rõ → trả quyết định giới hạn; nhánh: thu hồi consent, policy cũ, nhiều người giám hộ tranh chấp, chuyển A5 | Không đọc nội dung bảo vệ trước quyết định; `INDETERMINATE` không cấp quyền; phải kiểm tra lại trước ghi; LLM không được ghi đè |
| `CAND-F01-G04-M01-effective-access-preview` | Người có quyền yêu cầu xem “ai được truy cập gì”; cần quyền xem metadata riêng | Chủ thể, đối tượng, policy → tóm tắt quyền hiệu lực và điều chưa rõ, không kèm nội dung trẻ | Kiểm tra quyền xem metadata → tổng hợp quyền → ẩn danh tính không liên quan; nhánh: dò ID, giám hộ chưa rõ, policy cũ | Không tiết lộ tài nguyên của gia đình khác; bản xem trước không thể dùng làm giấy phép truy cập |
| `CAND-F01-G04-M01-policy-conflict-review` | Phát hiện policy/consent/giám hộ xung đột; operator có quyền xem metadata hồ sơ | Mã xung đột, hash phiên bản policy, chủ thể → ID/trạng thái hồ sơ xử lý tối thiểu, không cấp quyền | Nhận diện → tạo hoặc tái dùng hồ sơ → chuyển operator được phép; nhánh: sự kiện lặp, operator thiếu quyền, tranh chấp chưa giải quyết | Một sự kiện không tạo nhiều hồ sơ; không tự `ALLOW`; không đưa nội dung Journal/bài đánh giá vào hồ sơ |

**Ranh giới:** F01-G04-M02 ghi nhận/thu hồi đồng ý; F01-G05 chuyển chế độ tự chủ; F07-G06 kiểm soát quyền theo mục đích đối với Journal riêng tư. Xem trước quyền không đồng nghĩa đồng ý hoặc chia sẻ. **Chưa chốt:** owner xử lý xung đột F01/F07 và thẩm quyền pháp lý của người giám hộ.

### 3.2 Academic Assessment — F06-G07-M01

**Bối cảnh chung:** Người học, phụ huynh có quyền, người đánh giá được ủy quyền. Giá trị: phản hồi có căn cứ và giới hạn rõ, không bịa điểm. F06-G07-M01 sở hữu kết quả/phiên bản đánh giá; F04-G05-M02 sở hữu bài nộp; F06-G05 sở hữu báo cáo có kiểm soát. Phân loại dữ liệu tạm: `child_education_contextual` (taxon chưa chốt). Ưu tiên E0/E1 khi rubric đủ rõ; E2 đa phương thức chỉ sau benchmark, quyền và ngân sách được xác nhận; chi phí AI `UNKNOWN`.

| L4 | Kích hoạt / điều kiện trước | Đầu vào → đầu ra | Luồng chính / nhánh thay thế | Nghiệm thu và xử lý lỗi |
|---|---|---|---|---|
| `CAND-F06-G07-M01-rubric-eligibility` | Yêu cầu đánh giá; có metadata bài nộp và quyền hợp lệ | Loại bài, cohort, chương trình, ID/phiên bản rubric, nguồn bằng chứng → `ELIGIBLE/INELIGIBLE/UNKNOWN`, lý do, rubric đã khóa phiên bản | Kiểm nguồn/phiên bản/phạm vi áp dụng → khóa tham chiếu; nhánh: thiếu rubric, lỗi thời, sai lớp, nguồn chưa xác minh | Không chấm khi thiếu rubric phù hợp; giữ trạng thái chưa rõ, không tự thay rubric |
| `CAND-F06-G07-M01-assess-submission` | Rubric hợp lệ và có quyền đọc bằng chứng | Tham chiếu bài nộp, bằng chứng tối thiểu, rubric đã khóa → nhận xét tạm, liên kết bằng chứng, độ không chắc chắn hoặc `UNABLE_TO_ASSESS` | Kiểm quyền → đọc bằng chứng tối thiểu → đánh giá bằng phương pháp đã kiểm chứng → lưu kết quả tạm có nguồn; nhánh: chữ không đọc được, thiếu trang, định dạng không hỗ trợ, timeout | “Đã nộp” ≠ “đúng”; chữ không đọc được không bị chấm 0; không gắn nhãn giáo viên xác nhận nếu thiếu nguồn; lỗi provider không sửa bài gốc |
| `CAND-F06-G07-M01-review-uncertainty` | Kết quả tạm cần người xem xét theo policy | ID kết quả, lý do thiếu chắc chắn, quyền reviewer → hồ sơ review trạng thái chờ | Áp quy tắc chuyển tuyến → tạo yêu cầu idempotent → chỉ mở bằng chứng cần thiết; nhánh: thiếu reviewer, hàng đợi quá hạn | Không tự đặt ngưỡng confidence; trạng thái chờ không thành “đã xác minh”; không mở cho reviewer chưa được duyệt |
| `CAND-F06-G07-M01-correct-assessment` | Người có quyền gửi bản sửa và lý do | ID/phiên bản đánh giá, lý do, người sửa, bằng chứng → phiên bản mới, người chịu trách nhiệm, trạng thái | Kiểm quyền lại → kiểm phiên bản → ghi liên kết sửa không mất dấu vết → cung cấp kết quả cho báo cáo theo policy; nhánh: phiên bản cũ, quyền bị thu hồi, sửa đồng thời | Giữ lịch sử kết quả cũ; chỉ người được phép sửa; F06-G05 vẫn tự kiểm soát đối tượng nhận báo cáo |

**Ranh giới:** Chấm ảnh chữ viết tay là *phương án thực thi* của đánh giá, không tự động là L4 riêng vì dùng vision model. Giáo viên xác nhận phải có nguồn xác minh độc lập, không suy từ nút “duyệt”. **Chưa chốt:** owner rubric, quy tắc xác minh giáo viên, benchmark chữ viết tay tiếng Việt, lưu giữ dữ liệu bởi provider và giá.

### 3.3 Balanced Planning Validation — F04-G02-M03

**Bối cảnh chung:** Phụ huynh/trẻ/người trưởng thành tùy chế độ tự chủ được cấp quyền. Giá trị: kế hoạch khả thi, thấy rõ đánh đổi, bảo vệ thời gian chơi và ngoại lệ minh bạch. F04-G02-M03 sở hữu kết quả kiểm tra; F03 sở hữu mục tiêu và ý định Standard Bar; F04-G02-M01 sở hữu trạng thái lịch; F04-G06 sở hữu trạng thái duyệt. Phân loại dữ liệu tạm: `family_planning_and_wellbeing_contextual`. Ưu tiên E0/E1; E2 chỉ giải thích tùy chọn sau review dữ liệu/chi phí. Chi phí E0/E1 thấp; E2 `UNKNOWN`.

| L4 | Kích hoạt / điều kiện trước | Đầu vào → đầu ra | Luồng chính / nhánh thay thế | Nghiệm thu và xử lý lỗi |
|---|---|---|---|---|
| `CAND-F04-G02-M03-validate-balance` | Tạo/sửa bản nháp kế hoạch; có Standard Bar có thẩm quyền hoặc ghi `UNKNOWN` | Lịch, bối cảnh tuổi, phiên bản Standard Bar, ràng buộc cứng/mềm, thời gian chơi → phát hiện theo mức độ, khung giờ bị ảnh hưởng, dữ liệu thiếu | Kiểm quyền → chuẩn hóa thời gian → kiểm hard rồi soft → giải thích bằng chứng; nhánh: hoạt động chồng nhau, thiếu giờ học, múi giờ mơ hồ | Thời lượng trùng chỉ tính một lần; không âm thầm bỏ hard constraint; không bịa ngưỡng lâm sàng; không tự sửa lịch |
| `CAND-F04-G02-M03-evaluate-exception` | Đề xuất ngoại lệ ôn thi/tình huống khác có hạn; người đề xuất được phép | Ràng buộc, lý do, ngày bắt đầu/kết thúc, thời gian chơi bị ảnh hưởng, người duyệt → `VALID/NEEDS_APPROVAL/REJECTED/UNKNOWN`, bản ghi đề xuất | Kiểm phạm vi/ngày hữu hạn → đánh dấu ràng buộc được bảo vệ → chuyển F04-G06; nhánh: thiếu ngày hết hạn, không có quyền, ngoại lệ vĩnh viễn | Không tự duyệt hay đổi Standard Bar; có lý do/hạn; hard policy được bảo vệ không bị vượt bằng yêu cầu thông thường |
| `CAND-F04-G02-M03-expiry-recheck` | Ngoại lệ đã duyệt hết hạn, do lịch chạy hoặc sự kiện | ID/phiên bản ngoại lệ, lịch hiện tại, Standard Bar → `EXPIRED/ACTIVE/UNKNOWN`, kết quả kiểm lại, yêu cầu khôi phục/sửa | Kiểm hạn chính thức → đánh dấu idempotent → gửi yêu cầu cho F04-G06/F04-G02-M01; nhánh: lịch đã đổi, job lặp, lệch đồng hồ | Không tự ghi đè lịch; chạy lặp chỉ tạo một yêu cầu; thiếu nguồn thì chờ review, không tự khôi phục |

**Ranh giới:** F04-G02-M02 phát hiện lịch trùng và gợi ý khung giờ; F04-G02-M01/F04-G06 sửa, lưu và duyệt; F03 sở hữu mục tiêu/Standard Bar. Không tự thay mục tiêu phát triển hay đưa ra diễn giải y khoa.

## 4. Hợp đồng sáu nhóm tuổi và phân quyền

Mỗi L4 ở trên tham chiếu ma trận nhóm tuổi của module; trước P6 phải có bản ghi A0–A5 và ngoại lệ riêng. **Tất cả `evidence_confidence=UNKNOWN`** tại pilot. Các nhãn actor/approver là **đề xuất**, chưa được pháp lý xác minh; quyền chưa rõ thì từ chối thao tác bảo vệ.

| Module / nhóm tuổi | A0 (0–2) | A1 (3–5) | A2 (6–10) | A3 (11–14) | A4 (15–17) | A5 (18–23) |
|---|---|---|---|---|---|---|
| Access Policy (3 L4) | Phụ huynh/người chăm sóc; dữ liệu trẻ được bảo vệ | Người chăm sóc; dữ liệu trẻ được bảo vệ | Trẻ tham gia có giám sát; quyền theo policy | Trẻ chủ động trong phạm vi được phép | Quyền riêng tư của thanh thiếu niên; giám hộ chưa chốt | Chủ tài khoản trưởng thành tự chủ; không mặc định phụ huynh xem |
| Academic Assessment (4 L4) | Chấm theo rubric học đường **KHÔNG ÁP DỤNG**; quan sát thuộc module khác | Chấm học đường **KHÔNG ÁP DỤNG**; quan sát phát triển thuộc module khác | CÓ ĐIỀU KIỆN: bài học phù hợp | CÓ ĐIỀU KIỆN: người học chủ động | CÓ ĐIỀU KIỆN: quyền riêng tư thanh thiếu niên | CÓ ĐIỀU KIỆN: người trưởng thành tự quyết |
| Balanced Planning (3 L4) | Người chăm sóc lập lịch sinh hoạt | Người chăm sóc lập lịch chơi/sinh hoạt | Phụ huynh dẫn dắt, trẻ tham gia | Trẻ có thể đề xuất; duyệt theo policy | Thanh thiếu niên tự chủ trong phạm vi được phép | Người trưởng thành tự quản, chia sẻ tùy chọn |

**Ý nghĩa các trường tuổi cho từng L4:** `interaction_pattern` = cách tương tác trong bảng; `authorized_actor` = người có quyết định quyền hiện hành (A0/A1 là người chăm sóc *nếu hợp pháp*; A2–A4 theo policy; A5 là chủ tài khoản trưởng thành); `approval_actor` = người duyệt theo policy F01/F04 hoặc A5, không phải LLM; `data_scope` = tài nguyên tối thiểu được phép; `alternative_path` = từ chối/chưa rõ thì không đọc dữ liệu, giải thích an toàn, chuyển người có quyền; `evidence_confidence=UNKNOWN`. Với Academic A0/A1, `NOT_APPLICABLE` không được chuyển thành điểm thấp. Access Policy vẫn phải bảo vệ dữ liệu A0/A1, không mặc định có UI cho trẻ.

**Ngoại lệ theo L4:**
- `effective-access-preview`: cần quyền xem metadata, không chỉ quyền đọc nội dung.
- `policy-conflict-review`: chỉ operator được ủy quyền xem metadata hồ sơ tối thiểu, không tự cấp cho mọi phụ huynh.
- `review-uncertainty` và `correct-assessment`: reviewer cần quyền review/sửa riêng; vai trò phụ huynh hoặc người học không tự cấp quyền.
- `evaluate-exception`: người dùng có thể được phép *đề xuất*, người có thẩm quyền mới được duyệt.
- `expiry-recheck`: service chỉ đánh dấu/đề xuất, không tự sửa lịch.

## 5. Phụ thuộc ứng viên và truy vết

Mọi liên kết dưới đây là **`CANDIDATE`**, chưa xác nhận kiến trúc kỹ thuật. Mức HARD/SOFT là giả thuyết thiết kế; `cohort_scope=A0..A5` trừ khi ghi khác. Mã nguồn truy vết không phải bằng chứng triển khai.

| L3 nguồn → đích | Loại / mức độ / giai đoạn cần | Lý do / phương án khi thiếu |
|---|---|---|
| F01-G04-M01 → F01-G04-M02 | D/P, HARD, RUN | Kiểm tra trạng thái consent khi cần; không có consent hợp lệ thì từ chối hành động được bảo vệ; MR-017 |
| F01-G04-M01 → F01-G05-M01 | P, HARD, RUN | Trạng thái tự chủ hiện hành; chưa rõ thì không cho sửa; MR-035 |
| F01-G04-M01 → F07-G06-M01 | P/S, HARD, RELEASE | Quyền theo mục đích với dữ liệu riêng tư; thiếu mục đích được phép thì từ chối; L3C-03 |
| F06-G07-M01 → F04-G05-M02 | F/D, HARD, RUN | Dùng tham chiếu bài nộp, không lưu bản sao chuẩn; chỉ mock khi unit test; L3C-02 |
| F06-G07-M01 → F01-G04-M01 | P, HARD, RUN | Phải kiểm quyền trước khi đọc bằng chứng; không có phương án bỏ qua quyền |
| F06-G07-M01 → F07-G02-M02 | D, SOFT, RELEASE | Xác minh nguồn/phiên bản rubric; thiếu thì không chấm theo rubric chưa được hỗ trợ |
| F04-G02-M03 → F03-G04 | D, HARD, RUN | Mục tiêu/Standard Bar đã được duyệt; thiếu thì trả `UNKNOWN` |
| F04-G02-M03 → F04-G02-M01 | F/D, HARD, RUN | Cần bản nháp/phiên bản lịch; thiếu thì không thể kiểm tra |
| F04-G02-M03 → F04-G06-M01 | F/P, HARD, RELEASE | Duyệt ngoại lệ và yêu cầu khôi phục; chờ duyệt thì không sửa |
| F04-G02-M03 → F04-G02-M02 | F, SOFT, RUN | Giao phát hiện trùng lịch cho owner tương ứng; vẫn có thể kiểm tra cân bằng độc lập |

**Truy vết:** Access: UC-004/007/013/015, L3C-03, MR-016/017/021/035. Assessment: SC-002, L3T-02, L3C-02, AUD-05, lỗ hổng UC `AUD-01` (UC mới chỉ là ứng viên, không tự đặt mã UC-###). Balance: SC-001, UC-007/010, L3C-06, AUD-08, MR-012/025/035. Không tuyên bố UC hiện có trong 3.4 đã đặc tả đầy đủ đánh giá học tập.

## 6. P4 — Thiết kế test, chưa chạy test

Dữ liệu giả lập, 43 test case, kết quả kỳ vọng và ma trận bao phủ nằm tại `Feature_3_2_L4_Pilot_Test_Cases_REVIEW.md`. Chỉ dùng tài khoản, quan hệ gia đình, bài tập, lịch và rubric **giả lập**; không có dữ liệu trẻ thật. Đây là test case ở cấp đặc tả Given/When/Then, **không phải** unit/integration test đã chạy. Quyền hoặc benchmark `UNKNOWN` dẫn đến từ chối, hoãn hoặc review, không tự coi là PASS.

## 7. P5 — Danh sách vấn đề cần phản biện

| Vấn đề | Mức độ | Cần quyết định / kiểm chứng | Owner đề xuất |
|---|---|---|---|
| PILOT-01 | BLOCKER trước phát hành | Ma trận quyền giám hộ/trẻ/A5, consent, truy cập khác gia đình, thu hồi | Pháp lý + Quyền riêng tư + Product |
| PILOT-02 | HIGH | Owner vòng đời hồ sơ tranh chấp policy: F01 hay F07 | Product + Security |
| PILOT-03 | BLOCKER cho AI chấm bài | Rubric chương trình, phiên bản nguồn, benchmark chữ viết tay/vision, giám sát người | Chuyên gia giáo dục + AI QA |
| PILOT-04 | HIGH | Phân biệt đánh giá, giáo viên xác nhận và đối tượng được nhận báo cáo | Product + Privacy |
| PILOT-05 | HIGH | Ý nghĩa hard/soft của Standard Bar, thời gian chơi được bảo vệ, phạm vi ngoại lệ ôn thi; không bịa ngưỡng sức khỏe | Product + Chuyên gia phát triển trẻ |
| PILOT-06 | HIGH | Xử lý hết hạn ngoại lệ, ai được khôi phục, retry/idempotency và cập nhật đồng thời | Product + Engineering |
| PILOT-07 | HIGH | Tách/gộp: kiểm rubric vs chấm; hàng đợi review vs sửa kết quả; owner tranh chấp policy | Product + Engineering |
| PILOT-08 | HIGH | Bằng chứng sáu nhóm tuổi, accessibility, cách tương tác thay thế; UX không suy ra quyền | UX Research + Legal |
| PILOT-09 | HIGH | MR và lỗ hổng UC 3.4 của đánh giá học tập | Research + Product |
| PILOT-10 | HIGH | Taxonomy dữ liệu, lưu giữ, audit log, provider/cache, ngân sách AI | Security + Data + AI Ops |

**Cổng kiểm chứng:** `G-Legal=UNKNOWN; G-Privacy=UNKNOWN; G-Safety=UNKNOWN; G-Feasibility=UNKNOWN` ở mức pilot, cần đánh giá riêng từng L4/cohort/mục đích. Không đồng nghĩa sẵn sàng phát hành hoặc đã test thành công.

## 8. P5/P6 — Câu hỏi chủ sản phẩm cần chốt

1. **P-Q1:** Chấp nhận **10 L4 ứng viên** làm phạm vi review (chưa chốt ID/số lượng), hay yêu cầu tách/gộp? **Đề xuất:** chấp nhận để phản biện P5.
2. **P-Q2:** Tạm đặt xử lý xung đột policy tại F01 trong khi xác minh F07? **Đề xuất:** giữ `BOUNDARY_UNKNOWN`, chưa cấp ID.
3. **P-Q3:** Tạm giữ kiểm tra rubric và review kết quả thiếu chắc chắn là L4 riêng để kiểm chứng, không mặc định là service riêng? **Đề xuất:** có.
4. **P-Q4:** Giữ kiểm tra ngoại lệ có hạn và kiểm tra hết hạn thành hai L4; F04-G06 duyệt thay đổi? **Đề xuất:** có.
5. **P-Q5:** Chấp nhận 43 test case giả lập làm **baseline thiết kế kiểm thử**, hiểu rằng chưa chạy và các cổng còn UNKNOWN? **Đề xuất:** có.
6. **P-Q6:** Sau P5 mới soạn bản diff canonical và ID L4 chính thức tại **cổng phê duyệt riêng**? **Đề xuất:** có; PR này không sửa canonical.

**Trạng thái:** Hoàn thành bản nháp P0–P4; P5 review độc lập và P6 phê duyệt ID/canonical còn chờ. Không merge hoặc coi L4 ứng viên đã được duyệt chỉ vì phương pháp được duyệt.
