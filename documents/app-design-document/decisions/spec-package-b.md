# PRODUCT BLUEPRINT — 3.2 FEATURE INVENTORY
## PACKAGE B — DECISION LOG (CHỐT ĐỀ XUẤT, CHƯA SỬA INVENTORY)

**Ngày:** 2026-11-09  
**Phạm vi:** Package B — Child Learning & Safety (`CP-06`, `CP-07`, `CP-16`, `CP-17`).  
**Trạng thái:** `PACKAGE_B_PROPOSALS_APPROVED / BLUEPRINT_UNCHANGED`  
**Nguồn:** Feature Inventory 3.2 (8 domains, 49 groups, 98 L3 baseline), Scenario Change Log SC-002 (D01–D07), cuộc trao đổi phê duyệt Package B.  
**Nguyên tắc:** Đây là log lưu quyết định sản phẩm và L3 change mapping dự kiến, **không phải** revision Feature Inventory. Không cập nhật 3.2, 3.3, 3.4, Scenario Logs hay Master Research Backlog trước khi duyệt consolidated revision.

## 1. Quyết định của chủ sản phẩm

| Câu hỏi | Lựa chọn đã chốt | Trạng thái |
|---|---|---|
| Q1 — Academic Assessment | **A:** Đề xuất tạo `F06-G03-M03` dùng chung cho quản lý đánh giá bài làm, môn/dạng bài có rubric riêng | `APPROVED_PROPOSAL` |
| Q2 — Child Journal & Safety Disclosure | **A:** Tách luồng Private Journal / Authorized Feedback / Safety Escalation theo mục đích; mở rộng F05/F07 | `APPROVED_PROPOSAL` |
| Q3 — Learning Data Sources | **A:** Hỗ trợ nhập tay, nguồn phụ huynh/trẻ/giáo viên và tích hợp bên thứ ba sau này, dùng F06/F08 hiện có | `APPROVED_PROPOSAL` |
| Q4 — Child Safety Operations | **A:** Mở rộng `F07-G05` Risk Triage và Human Response, không tạo L3 riêng cho Sensitive Caregiver Cases | `APPROVED_PROPOSAL` |

**Góp ý bổ sung của chủ sản phẩm:** Không có.

## 2. CP-06 — Academic Assessment & Learning Analytics

### Đề xuất cấu trúc
- **ADD (proposed):** `F06-G03-M03 — Academic Assessment`.
- **EXTEND:** `F04-G05-M02 — Evidence Submission`: phân biệt bài được giao, bài đã nộp/bài làm, ảnh/minh chứng, trạng thái hoàn thành.
- **EXTEND:** `F06-G03-M02 — Indicator Evidence`: độ tin cậy, nguồn và tình trạng chấm, tiêu chí liên quan.
- **EXTEND:** `F06-G04-M01/M02 — Trend & Pattern Analysis`: phân tích kỹ năng, dạng lỗi, độ khó, tiến bộ và giới hạn bằng chứng.
- **EXTEND:** `F06-G05-M01/M02 — Reports & Dashboards`: báo cáo tháng theo người xem và nguồn dữ liệu được phép.

### Hợp đồng nghiệp vụ đề xuất cho Academic Assessment
1. Request/Submission → chọn đáp án/rubric/method → evaluation → result với confidence → correction/review → cập nhật insights có căn cứ.
2. Tách **task completed**, **submission received**, **assessment completed**, **assessment reviewed**. Không suy luận bài đã đúng chỉ vì hoàn thành.
3. `E1` deterministic/rules cho dạng có đáp án rõ; `E2` Vision/LLM có kiểm soát cho ảnh/bài mở; human verification khi thiếu độ tin cậy. Không cam kết một AI chấm được mọi dạng bài.
4. Chữ viết giai đoạn thử nghiệm chỉ đánh giá **sạch sẽ** và **đều đặn**; cả hai đạt → `PASS`, thiếu → khuyến nghị cải thiện, ảnh không đủ rõ → `UNABLE_TO_ASSESS`; không trộn với đúng/sai hoặc chính tả.
5. Bài học có độ khó và nguồn đánh giá khác nhau không so sánh trực tiếp một cách thiếu căn cứ. Không kết luận mức tập trung từ thời gian làm bài đơn lẻ.
6. AI homework assessment **chỉ prototype / controlled pilot** đến khi có benchmark chất lượng, hiệu quả, latency, cost/page, cost/assessment, human correction rate và ngưỡng rollout được phê duyệt. Không tự động đưa vào MVP hoặc general availability.

### Vấn đề cần kiểm tra khi consolidation
`F06-G03` hiện là **Development Indicators**; mô hình Assessment rộng hơn Indicators. **Module ID `F06-G03-M03` mới chỉ là vị trí được chốt ở mức đề xuất**; cần kiểm tra cohesion/ownership với F04 và F06, tránh âm thầm chuyển ID khi cập nhật tài liệu. Nếu phải đổi vị trí, trình riêng cho chủ sản phẩm duyệt.

## 3. CP-07 — Child Journal Privacy & Safety Disclosure

**Quyết định:** `EXTEND`, không thêm L3.

| Luồng | Mục đích | Ranh giới quyền |
|---|---|---|
| `Private Journal` | Nhật ký và insight riêng tư của trẻ (F05-G04/G05/G06) | Không mặc nhiên hiển thị cho phụ huynh, không tự truy xuất lại ngoài quy trình đã chốt |
| `Authorized Feedback` | Phản hồi phục vụ kế hoạch, báo cáo | Chỉ đưa qua domain khác khi có quyền/mục đích hợp lệ |
| `Safety Escalation` | Hỗ trợ khi nguy cơ đạt điều kiện chính sách | Tách pipeline, nguyên tắc tối thiểu cần thiết, người nhận thích hợp, có thể không phải người chăm sóc bị nêu tên |

- `F05-G06-M01` hỗ trợ selective sharing; `F07-G06-M01` thực thi purpose-bound access **trước khi truy xuất và xử lý**, không chỉ lúc trả kết quả.
- Cấm suy luận gián tiếp để lộ Journal vào báo cáo cha mẹ (“trẻ có vẻ bị bạo lực ở lớp”) nếu chỉ có nguồn Journal riêng không được phép chia sẻ.
- Trẻ có thể chủ động chọn chia sẻ và được AI hỗ trợ cách nói với người lớn đáng tin cậy.
- Quyền xóa Nhật ký và dữ liệu suy ra có truy vết theo nguyên tắc đã chốt (ẩn ngay, xóa vĩnh viễn sau 60 ngày, ngoại lệ hợp lệ phải thẩm định); không tự coi mọi log an toàn đều được lưu vô thời hạn.

## 4. CP-16 — Multi-source Learning Data

**Quyết định:** `EXTEND`, không thêm L3.

| Module hiện có | Mở rộng dự kiến |
|---|---|
| `F06-G01-M02 — Source Metadata` | Loại nguồn: school, tutoring, self-study, app, parent/child/teacher submissions; `reported_by`, verified vs self-reported, thời gian, mức tin cậy |
| `F04-G05-M02 — Evidence Submission` | Nhập tay, ảnh bài làm, bằng chứng và đánh giá liên quan |
| `F06-G05-M02 — Summary Rendering` | Báo cáo kết hợp với provenance, phân biệt dữ liệu có/thiếu |
| `F08-G01-M01 — School Data Connectors` | Tích hợp giáo viên/trường khi đủ quyền, khả năng và đối tác |
| `F08-G01-M02 — School Data Review` | Kiểm chứng nguồn, thu hồi quyền, đồng bộ lỗi, sự kiện trùng/xung đột |

- **Manual entry trước** vẫn giúp sử dụng sản phẩm khi chưa có integrations; teacher/school reports là capability tương lai, không khẳng định hiện đã kết nối.
- Parent-entered score không được mang nhãn school-verified.
- Thông tin “tình hình ở lớp” không được suy diễn là bình thường chỉ do thiếu nguồn giáo viên.

## 5. CP-17 — Child Safety Operations

**Quyết định:** `EXTEND`, không thêm L3 độc lập cho từng tình huống.

- `F07-G05-M01 — Safety Triage`: detection/triage, risk & confidence, xem xét nguy cơ từ người nhận, tránh khẳng định hoặc quy tội khi thiếu căn cứ.
- `F07-G05-M02 — Human Response Workflow`: hỗ trợ người lớn đáng tin, escalation theo chính sách có thẩm định, tối thiểu hóa tiết lộ, review/audit.
- `F05-G01-M02 — Companion Guardrails`: AI lắng nghe và **chủ động** khuyến khích trẻ tìm sự trợ giúp khi gặp vấn đề đáng lo; hỗ trợ chọn cách chia sẻ, không ép mọi tình huống báo phụ huynh.
- Khi người chăm sóc trực tiếp bị nêu là nguồn căng thẳng thông thường: không tự cáo buộc/ can thiệp và không mặc định gửi thông báo cho chính họ. Giữ ngoại lệ nguy cơ an toàn thực sự qua quy trình an toàn đã thẩm định.
- Sai cảnh báo, sai người nhận, khiếu nại, policy version, audit quyền truy cập phải được xem xét ở triển khai; ngưỡng/escalation logic chưa được chứng nhận và cần chuyên gia.

## 6. L3 Change Mapping — Package B

| CP | L3 hiện tại / dự kiến | Action | Ý nghĩa |
|---|---|---|---|
| CP-06 | `F06-G03-M03` | `ADD (PROPOSED)` | Academic Assessment |
| CP-06 | `F04-G05-M02` | `EXTEND` | Lưu evidence/bài làm có cấu trúc |
| CP-06 | `F06-G03-M02` | `EXTEND` | Tin cậy assessment |
| CP-06 | `F06-G04-M01/M02` | `EXTEND` | Learning analytics: kỹ năng và lỗi |
| CP-06 | `F06-G05-M01/M02` | `EXTEND` | Báo cáo theo nguồn/quyền |
| CP-07 | `F05-G04/G05/G06` | `EXTEND` | Journal, insight, sharing theo mục đích |
| CP-07 | `F07-G06-M01` | `EXTEND` | Authorization trước truy xuất dữ liệu |
| CP-16 | `F06-G01-M02` | `EXTEND` | Multi-source learning provenance |
| CP-16 | `F08-G01-M01/M02` | `EXTEND` | School connectors/review và manual import |
| CP-17 | `F07-G05-M01/M02` | `EXTEND` | Triage và human response |
| CP-17 | `F05-G01-M02` | `EXTEND` | Hỗ trợ an toàn chủ động cho trẻ |

Không xóa L3 hiện tại, không thêm L2 Group, không thêm Domain. Nếu Package A đề xuất +2 L3 và B +1 L3 đều được áp dụng sau consolidation thì tạm tính **98→101**, không phải con số cuối.

## 7. Rủi ro, phụ thuộc và nghiên cứu mở

- Quyền: F01 consent/autonomy; F05 Journal; F07 policy & safety.
- Quy trình academic: F04 submission → F06 assessment/results → F06 insight/report; F08 future external data.
- Kỹ thuật: `E0/E1` first; AI `E2` khi cần, quota/fallback và cost evaluation. Không phát minh benchmark khi chưa đo.
- Safety: phân loại nguy cơ, escalation recipients, sensitive caregiver exception, human oversight, trẻ theo cohort, tuân thủ pháp lý; tất cả cần thẩm định chuyên môn.
- Chất lượng: evaluation set tiếng Việt, chữ viết, bài toán, ảnh mờ, bias, dữ liệu thiếu, error analysis; khung tiêu chí chấm có kiểm định.
- Đảm bảo privacy và xóa các derivative có truy vết, phân định dữ liệu phụ huynh được xem / trẻ được xem.
- **Chưa cập nhật Master Research Backlog** hoặc tự cấp MR ID mới.

## 8. Chốt trạng thái và bước sau

- `PACKAGE_B_PROPOSALS_APPROVED`: Q1=A; Q2=A; Q3=A; Q4=A; góp ý không có.
- `NOT_YET_APPROVED_FOR_BLUEPRINT_EDIT`: người dùng chưa phê duyệt consolidated update cho 3.2.
- **Bước tiếp theo:** Package C — Career Exploration & Knowledge (`CP-08`, `CP-09`, `CP-10`, `CP-19`), sau đó Packages D, E; cuối cùng reconciliation và đề xuất revision 3.2 để xin phê duyệt cập nhật văn bản chính thức.