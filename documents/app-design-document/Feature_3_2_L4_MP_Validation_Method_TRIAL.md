# PARENT-PAL — Thử nghiệm phương pháp Multi-Pass L4 Specification Validation

**Ngày:** 2026-11-10 · **Trạng thái:** `METHOD_TRIAL / NOT_APPROVED_CANONICAL` · **Phạm vi:** 3 L3 pilot trong PR #17.

## 1. Mục tiêu và giới hạn thực thi

Chủ sản phẩm đọc **test case, expected output, phát hiện quan trọng và câu hỏi thực sự cần quyết định**, không phải duyệt thủ công từng dòng schema L4. Hệ thống chịu trách nhiệm đối chiếu yêu cầu, tạo ứng viên L4, phản biện, kiểm tra logic, sửa đặc tả và ghi dấu vết.

**Tính trung thực của pilot này:** Không có hạ tầng gọi nhiều LLM sub-agent độc lập trong phiên làm việc này. Các vai A/B/C/D/E dưới đây là **các lượt phân tích tách biệt do cùng một trợ lý thực hiện**. Chúng tạo ra sự tách biệt về đầu vào, mục tiêu và tiêu chí review, **không tạo ra độc lập thống kê hay độc lập người đánh giá**. Không được ghi `INDEPENDENT_AGENT_VERIFIED`. Khi triển khai orchestration thật, mỗi agent phải có execution ID, model/version, prompt/version, input hash và output artifact riêng.

## 2. Vai trò và kiểm soát chống đồng thuận giả

| Lượt | Đầu vào được phép | Đầu ra | Kiểm soát |
|---|---|---|---|
| A — Architect | 3.2/3.3/3.4, scenario, research, owner decisions | Candidate L4, outcome, owner, data/permission, contract | Không coi số L4 cũ là đáp án |
| B — QA-first | **Nguồn yêu cầu gốc trước**, không dùng candidate list làm yêu cầu duy nhất | Scenario-driven Given/When/Then, negative/boundary/state tests | Mỗi test có source requirement; test không khớp L4 nào = gap |
| C — Adversarial review | Nguồn gốc + đầu ra A/B | Missing/split/merge/move, privacy, safety, counterexamples | Ghi cả phản biện chưa giải quyết, không xóa ý kiến bất đồng |
| D — Validator | Candidate + tests + sources | Trace, logic consistency, acceptance feasibility, evidence class | `DESIGN_CHECKED` ≠ `EXECUTED_PASS`; không bịa kết quả LLM |
| E — Coordinator | A/B/C/D và risk register | Sửa đề xuất, quyết định auto/owner/research, review package | Giới hạn tối đa 3 vòng; nếu không hội tụ → OPEN |

**Điều kiện kiểm tra lại:** Reviewer không được sử dụng disposition của P5 cũ như chân lý. Nếu trùng kết luận, phải có lý do từ yêu cầu và test. Không được dùng điểm tự chấm của agent để thay bằng chứng thực nghiệm.

## 3. Quy trình thử nghiệm áp dụng

1. **Freeze input:** Blueprint 3.2-R1, 3.3, 3.4, Master Research Backlog v1.2 và các quyết định sản phẩm mới trong cuộc trò chuyện (chưa canonical). Ghi rõ tài liệu nào là baseline, tài liệu nào là giả định.
2. **Extract outcomes:** Liệt kê kết quả nghiệp vụ bắt buộc từ mỗi L3, tách UI, workflow trigger và thuật toán khỏi outcome.
3. **QA-first:** Viết tình huống đầu-cuối, happy/negative/permission/state/age; đối chiếu yêu cầu, không mặc định mọi test phải khớp ứng viên cũ.
4. **Adversarial:** Cố tìm counterexample để bác bỏ split/merge/owner/permission.
5. **Validate:** Kiểm schema/test trace, kiểm toán số lượng, tính toán các ví dụ có thể xác minh; ghi rõ loại bằng chứng.
6. **Remediate:** Giữ/gộp/tách/chuyển/hoãn L4; không xóa test gốc; có thể đề xuất test bổ sung. Không tự chốt luật, ngưỡng phát triển, benchmark AI.
7. **Owner review:** Chỉ đưa test/output có rủi ro hoặc quyết định sản phẩm; các điểm kỹ thuật có cơ sở xử lý tự động trong bản nháp.
8. **Approval gate:** Owner duyệt scope và acceptance; nghiên cứu còn UNKNOWN được giữ trong backlog; **không** cấp ID ổn định hoặc merge canonical khi chưa duyệt.

## 4. Quy tắc quyết định L4

Một L4 độc lập khi có **outcome nghiệp vụ quan sát được**, điều kiện nghiệm thu riêng, vòng đời/actor/permission có ý nghĩa, và không chỉ là UI, bước kiểm tra đầu vào, trigger hay phương pháp triển khai. Không có chỉ tiêu số lượng L4 cố định cho mỗi L3.

- **KEEP:** Outcome độc lập và có test truy vết.
- **MERGE:** Cùng một outcome/vòng đời, khác trigger hoặc bước nội bộ.
- **SPLIT:** Hai outcome có actor/permission/state/acceptance độc lập.
- **MOVE:** Outcome thuộc L3 khác; phải xác nhận owner đích.
- **DEFER:** Giá trị độc lập chưa đủ bằng chứng hoặc ngoài scope hiện tại.

**Tự động sửa:** lỗi ID/trace, sai phép tính, thiếu negative test, sai phân biệt test thiết kế/thực thi, inconsistency với canonical rõ ràng.  
**Owner quyết:** ranh giới sản phẩm không thể suy ra từ nguồn, ai có thẩm quyền thực hiện, trải nghiệm ưu tiên, tradeoff giá trị.  
**Research/Expert:** pháp lý theo thị trường, ngưỡng sức khỏe/giáo dục, chất lượng AI thực tế, bảo mật và chi phí đo được.

## 5. Dữ liệu quyết định sản phẩm mới (owner input, chưa xác minh pháp lý/khoa học)

- Thị trường Việt Nam trước; cấu hình policy theo quốc gia, ngày hiệu lực, actor, tuổi, purpose. Mốc 18 tuổi là **giả định thiết kế ban đầu**; phải xác minh quy định đại diện/giám hộ/đồng ý và quyền riêng tư, không suy rằng mọi quyền của cha mẹ chấm dứt đồng nhất vào ngày sinh nhật.
- Ưu tiên học sinh lớp 1–9; thử nghiệm chấm bài bằng LLM/vision có giám sát trước, nghiên cứu sâu về chất lượng, cost, privacy và tối ưu sau.
- Chuẩn tham chiếu cân bằng theo nguồn lớn có kiểm chứng và provenance, không có một ngưỡng duy nhất cho mọi trẻ; gia đình có Standard Bar riêng trong giới hạn policy được chứng minh.
- Chi phí/latency/retry cần benchmark; sáu cohort A0–A5 giữ cho thiết kế, không nhân bản UI vô ích.
- Không lấy Journal riêng tư làm dữ liệu chấm bài/lập kế hoạch nếu chưa có quyền hợp lệ theo purpose.

## 6. Hệ thống trạng thái bằng chứng

| Mã | Được phép kết luận |
|---|---|
| `SOURCE_TRACED` | Có nguồn yêu cầu xác định |
| `DESIGN_CHECKED` | Logic/expected output đã đối chiếu ở mức đặc tả |
| `SYNTHETIC_CALC_CHECKED` | Phép tính ví dụ kiểm được bằng công thức |
| `SPEC_GAP` | Yêu cầu hoặc owner chưa đủ rõ |
| `NOT_EXECUTED` | Không có implementation/model run |
| `RESEARCH_REQUIRED` | Cần bằng chứng bên ngoài hoặc chuyên gia |
| `OWNER_REVIEW` | Cần người sở hữu sản phẩm quyết định |

Không có trạng thái `PASS` cho test chức năng khi chưa chạy implementation. Không tạo điểm tin cậy số hoặc tỷ lệ coverage ảo.

## 7. Các file kết quả

- `Feature_3_2_L4_MP_Review_Package_Access_REVIEW.md`
- `Feature_3_2_L4_MP_Review_Package_Assessment_REVIEW.md`
- `Feature_3_2_L4_MP_Review_Package_Balance_REVIEW.md`
- `Feature_3_2_L4_MP_Pilot_Consolidated_Findings_REVIEW.md`

Các tài liệu trong PR #17 vẫn là Draft, không tự sửa canonical 3.2/3.3/3.4 và không merge.
