# Parent-Pal · Batch 05 · Nguồn tri thức và định tuyến

BASELINE_PROPOSED / PROVISIONAL / NOT_PLANNED · MVP NOT_DECIDED · Synthetic fixtures

Nguồn thiết kế ghim tại `560652238efe1b1ed935a409c32680e16be5ce60`. Inventory 3.2-R1 blob `f52be52f5ae37ddce0b6a021aec915659f357db3`. Xem [manifest B02](Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md) cho 42 quyết định và baseline. B01-PA-OD-01..04 chi phối mọi xử lý và truy cập. B01-C-OD-07 chi phối audit. P6-AA-OD-04 giữ quota và giá ở trạng thái chưa quyết định. Scope batch lấy từ [queue B04](Feature_3_2_L4_B04_Design_and_Checkpoint_REVIEW.md).

- F07-G01-M01 · Content CMS
- F07-G01-M02 · Structured Retrieval
- F07-G02-M01 · Editorial Workflow
- F07-G02-M02 · Evidence Provenance
- F07-G03-M01 · Single Interface Router

## Permission, classification and cost

Access Policy quyết định cuối cùng theo actor, scope, resource, purpose và version hiện hành. Editorial, reviewer, operator và service grants phải tách theo thao tác. Dữ liệu trẻ thật có legal basis UNKNOWN bị chặn. Không ghi payload riêng tư trong audit. Trước khi gọi provider, xác nhận category, purpose, approval, retention, route và budget. E0/E1 cho state, policy và accounting. Inference E2/E3 chỉ conditional cho task được duyệt. Chi phí, benchmark, ngưỡng và release gates còn UNKNOWN. E0/E1 paths có 0 inference calls.

A0 và A1 dùng caregiver-led hoặc supervised UX trong scope được xác minh; quyền dùng modality riêng vẫn UNKNOWN. A2 dùng hướng dẫn, A3 guided use, A4 subject-led use và A5 verified self-management khi policy cho phép. Mỗi cohort đều nhận phạm vi dữ liệu tối thiểu. Reviewer hoặc provider cần quyền độc lập với cohort. Khi bằng chứng thiếu, dùng workflow thủ công đã được phép hoặc giữ unavailable. Không suy ra quyền từ tuổi.

## Candidates, AC and test oracles

| Temporary candidate | Actor and outcome | Data and interface contract | Acceptance criterion and proposed test |
|---|---|---|---|
| CAND-F07-G01-M01-publish | Biên tập viên có quyền đưa một phiên bản tri thức đã duyệt vào kho | CMS giữ nội dung và version; Editorial Workflow cung cấp quyết định duyệt theo đúng hash. Thay version hoặc thiếu evidence thì giữ draft. | B05-T01. Duyệt v1 rồi sửa thành v2 trước publish. v2 vẫn draft; v1 chỉ hiển thị nếu quyết định và hiệu lực còn hợp lệ. |
| CAND-F07-G01-M01-retire | Biên tập viên ngừng cung cấp một phiên bản | CMS lưu trạng thái retired và tăng epoch; các chỉ mục, cache và consumer kiểm tra trước phát hành. | B05-T02. Retire giữa lúc truy xuất và trả kết quả. Sau commit không trả nội dung từ phiên bản đã retire. |
| CAND-F07-G01-M02-retrieve | Consumer có quyền nhận kết quả cấu trúc và nguồn | Retrieval sở hữu kết quả tạm và provenance refs; áp purpose trước query và kiểm version nguồn trước trả. Thiếu nguồn đủ điều kiện trả no result. | B05-T03. Chèn kết quả từ tài liệu chưa duyệt và nguồn hết hạn. Không trả cả hai; mỗi kết quả hợp lệ có ref đúng phiên bản. |
| CAND-F07-G01-M02-restrict | Consumer chỉ nhận kết quả thuộc lớp quyền hiện hành | Retrieval không tự mở rộng corpus. Cache chỉ dùng trong lớp đã duyệt, đúng scope và version. | B05-T04. Hai actor gửi cùng câu hỏi nhưng chỉ một có grant. Người thứ hai không thấy nội dung, hit count hoặc ref từ cache của người đầu. |
| CAND-F07-G02-M01-submit | Tác giả gửi phiên bản bất biến để biên tập | Workflow giữ submission ID, content hash, evidence refs và trạng thái. Thay nội dung tạo bản để xét lại. | B05-T05. Gửi lại cùng operation ID rồi gửi payload khác. Có một submission gốc; payload khác không thay nội dung đã gửi. |
| CAND-F07-G02-M01-decide | Reviewer được cấp quyền ghi một quyết định theo phiên bản | Recheck quyền, hash và evidence epoch tại commit; CMS nhận decision ref, không sao chép quyền duyệt. Cơ chế phân tách nhiệm vụ cần xác nhận. | B05-T06. Hai reviewer xử lý cùng version và một reviewer mất quyền trước commit. Chỉ quyết định hợp lệ có thể có hiệu lực. |
| CAND-F07-G02-M02-record | Biên tập viên gắn nguồn có thể kiểm tra cho một luận điểm | Evidence Provenance sở hữu nguồn, mốc thời gian, phạm vi và hạn chế; không suy ra độ tin cậy từ số nguồn. | B05-T07. Gắn một nguồn thiếu version và một nguồn đủ metadata. Nguồn thiếu giữ UNKNOWN; không dùng để nâng trạng thái review. |
| CAND-F07-G02-M02-withdraw | Reviewer đánh dấu nguồn lỗi thời hoặc bị rút | Advance evidence epoch và phát sự kiện cho CMS, retrieval và reviewer. Nội dung yêu cầu nguồn đó bị loại khi không còn căn cứ. | B05-T08. Rút nguồn giữa hai lần đọc cùng cache. Lần sau không trả nội dung phụ thuộc nếu evidence bắt buộc chưa được thay hợp lệ. |
| CAND-F07-G03-M01-route | Consumer nhận tuyến xử lý phù hợp với task đã được cấp quyền | Router sở hữu routing decision ref và profile version. Dùng E0/E1 khi đáp ứng task; chỉ đề xuất E2/E3 khi policy, benchmark và budget hợp lệ. | B05-T09. Task E1 hợp lệ không gọi model. Task E2 có consent/purpose UNKNOWN không gửi payload, kể cả retry. |
| CAND-F07-G03-M01-fallback | Consumer nhận fallback được phép khi tuyến không sẵn sàng | Recheck quyền, budget và loại dữ liệu trước tuyến thay thế. Không tự nâng tier, nới purpose hay lặp vô hạn. | B05-T10. Giả lập provider timeout và fallback không đủ quyền. Trả scoped unavailable hoặc manual path; không gửi lại dữ liệu cho tuyến khác. |

## Review and issues

Deterministic structural validation: 5 canonical L3 in this group, 10 unique candidate/AC/test rows. Proposed test oracles, zero runtime executions.

- B05-I01 HIGH: validate propagation of evidence and content withdrawal across CMS/index/cache. Authority owners: CMS, Editorial Workflow, Evidence Provenance.\n- B05-I02 HIGH: confirm approved route eligibility and emergency/provider failure semantics with execution budget and policy evaluation.

Carry BI-05/10 and prior issues. Independent review pending consolidation. Next checkpoint B06. 79 untouched L3 remain, plus B02 partial-slice follow-up.

Current design amendment: [Owner decision implementation and evidence](Feature_3_2_L4_Owner_Decision_Implementation_and_Evidence_REVIEW.md). Its ODP acceptance criteria apply where this checkpoint handles the affected operation.
