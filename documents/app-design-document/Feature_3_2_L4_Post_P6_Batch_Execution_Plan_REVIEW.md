# Parent-Pal — Kế hoạch chuẩn bị các batch L4 sau ba pilot P6

**Ngày:** 2026-11-12  
**Trạng thái:** `BATCH_PREPARATION_AUTHORIZED / FIRST_BATCH_NOT_STARTED`  
**Căn cứ:** [P6 Method Approval and Rollout Review](Feature_3_2_L4_P6_Method_Approval_and_Rollout_Review.md). Owner đồng ý tiếp tục theo hướng CONDITIONAL_GO giới hạn. PR #17 còn Draft, PR #18 đóng.

## 1. Phạm vi

- Ba L3 pilot của P6 **đã chạy lượt phản biện**: Access `F01-G04-M01`, Academic `F06-G07-M01`, Balanced `F04-G02-M03`.
- **103 L3 còn lại** (đếm theo Inventory 3.2-R1: 106 L3 trừ 3 pilot) là backlog mở rộng; **không** gọi tất cả 103 lượt tiếp theo là “pilot P6”. Mỗi nhóm thực tế là **batch thiết kế/review L4 sau P6**.
- Cho phép chuẩn bị và mở nhóm nhỏ **3–5 L3**, sau đó đánh giá chất lượng/cost/coverage trước nhóm kế tiếp. Không tự cấp stable L4 IDs hay thay canonical.
- Chọn danh sách L3 theo phân tích dependency, chức năng nền và rủi ro. **Chưa chọn cố định tên L3 ở bản này** vì chưa chạy kiểm tra đủ inventory và phạm vi liên module ở head hiện thời.

## 2. Các gate trước batch đầu

| Gate | Việc phải có |
|---|---|
| Source lock | SHA chính xác của PR #17, đọc canonical 3.2/3.3/3.4 và 12 Owner Decisions; không dùng snapshot PR #18 |
| Selection | Danh sách 3–5 L3 có lý do chọn, owner domain, dependency và impact cross-module |
| Open issue register | Access `OWNERSHIP_UNKNOWN`, Academic `F-023`, Balanced `F-021`, 9 partial baseline test; phân loại blocker vs deferred và áp dụng regression phù hợp |
| Execution policy | Claude Code dùng **tối đa 3 sub-agent** QA/Architect/Reviewer, model **Sonnet 5.5** nếu khả dụng và đúng ID; không tự thay model; Coordinator/Validator ở phiên chính |
| Evidence | Manifest, input/output riêng, reviewer findings, deterministic checks, source hashes, token/usage nếu có, file ZIP gửi ChatGPT |
| Safety and stop | Dừng khi thiếu model hợp lệ, nguồn chưa xác minh, không có sub-agent độc lập hoặc critical permission/safety issue |

## 3. Luồng một batch

1. ChatGPT chuẩn bị lựa chọn L3, danh sách nguồn và các invariant phải giữ, đưa Owner xem nếu có thay đổi phạm vi lớn.
2. Claude Code chỉ chạy thiết kế/test/đối kháng/validator và xuất **ZIP ở thư mục local ngoài repository**; không git write, không tự cập nhật Decision Log.
3. ChatGPT tiếp nhận ZIP, xác minh trace và findings, phản biện, cập nhật bảng quyết định và đề xuất fix sau khi Owner duyệt.
4. Owner chỉ quyết định vấn đề nghiệp vụ còn mở.
5. Gate sau batch: `GO`, `CONDITIONAL_GO` hoặc `BLOCKED`. Khi không còn blocker mới sang batch kế tiếp.

## 4. Các phép đo tối thiểu

- Coverage mapped theo requirement và test; phân biệt full vs partial và UNKNOWN.
- Findings theo severity/disposition, tỷ lệ sửa có evidence, tình huống mới/duplicate.
- Dependency conflicts, owner rights, privacy, AI safety, regression với P5/P6.
- Tổng token, usage và giới hạn công cụ; không báo ước tính chi phí là hóa đơn thực tế.
- Số câu hỏi Owner và công sức review; mục tiêu giảm câu hỏi lặp, không giảm chất lượng kiểm chứng.

## 5. Deliverables chuẩn

- `Batch_Source_Manifest`, `Independent_QA`, `L4_Architecture`, `Adversarial_Findings`, `Validation_Report`, `Revision_Log`, `Traceability_Matrix`, `Test_Registry`, `Owner_Review_Package`, `Execution_Evidence`, `Cross_Module_Regression`.
- Sau batch, ChatGPT quản lý version, link file và Decision Log trên PR #17 hoặc một nhánh tài liệu được Owner chọn.
- Chỉ merge khi có quyết định riêng; không dùng số test của pilot làm bằng chứng chức năng ứng dụng đã chạy.

## 6. Kết quả hiện tại

`P6_THREE_PILOTS_EXECUTED`  
`P6_METHOD_APPROVED_CONDITIONAL_FOR_SMALL_BATCHES`  
`FIRST_BATCH_SOURCE_AND_SELECTION_PENDING`  
`P6_FINAL_REGRESSION_AND_RESEARCH_GATES_OPEN`

**Chưa chạy batch mới, chưa sửa canonical, chưa merge PR #17.**
