# Product Blueprint 3.2 — Package C Decision Log

**Ngày:** 2026-11-09  
**Trạng thái:** `USER_APPROVED_PROPOSAL / LOG_ONLY`  
**Lưu ý:** Chốt đề xuất ở cấp L3; **chưa sửa** Feature Inventory 3.2, Product Blueprint, 3.3/3.4, Master Research Backlog hay Scenario Logs.

## 1. Quyết định đã chốt

| ID | CP | Quyết định được duyệt | Hành động L3 đề xuất |
|---|---|---|---|
| C-D01 / Q1=A | CP-08 | Thêm Career Exploration Guidance, dùng kho dữ liệu kiến thức F07; không khẳng định trẻ “hợp/không hợp” nghề | `ADD F03-G05-M03`, `EXTEND F03-G05-M01` |
| C-D02 / Q2=A | CP-09 | Tái sử dụng Roadmap/Task/Review cho `GOAL_ORIENTED` và `EXPLORATION_ORIENTED`, không tạo Career Planning Engine riêng | `REUSE F03-G04-M03` (đề xuất Package A); `EXTEND F04-G01-M01`, `F04-G05-M02`, `F06-G06-M01/M02` |
| C-D03 / Q3=A | CP-10 | Dùng chung F07 Knowledge Governance; dữ liệu Career và Admissions tách dataset, dùng chung provenance, editorial review, freshness; `CACHED ≠ VERIFIED ≠ APPROVED` | `EXTEND F07-G01-M01/M02`, `F07-G02-M01/M02` |
| C-D04 / Q4=A | CP-19 | Có ba cấp `PRIVATE_CREATION → CONTROLLED_SHARING → CONDITIONAL_PUBLIC_PUBLISHING`; đăng công khai phụ thuộc tuổi, quyền, chính sách nền tảng và kiểm duyệt | `EXTEND F01-G04-M01`, `F04-G05-M02`, `F07-G04/G05/G06` |

### Ranh giới bắt buộc
- Trẻ được khám phá nghề và phản tư, **không bị AI gán kết luận phù hợp nghề** dựa trên tính cách.
- Hoàn thành khám phá không bắt buộc phải tiếp tục nghề hay đạt thu nhập/sản phẩm công khai.
- Số liệu thị trường phải có nguồn, quần thể, địa bàn, kỳ quan sát và phương pháp; không bịa tỷ lệ thành công/thu nhập.
- Cached chỉ là trạng thái lưu trữ, **không phải** chứng nhận đã xác minh hoặc phê duyệt.
- Artefact thử nghề không phải Child Journal; giữ độc lập mục đích, quyền, retention.
- Public Publishing là phạm vi dài hạn có điều kiện, **không mặc định MVP**; không giả định phụ huynh đồng ý là đủ để vượt giới hạn nền tảng hoặc pháp luật.
- Người trưởng thành 18–23 tuổi tự quản lý quyền dữ liệu, không mặc định yêu cầu phụ huynh duyệt.

## 2. L3 Change Mapping (chưa sửa Inventory)

| CP | Current / Proposed Module | Action | Nội dung |
|---|---|---|---|
| CP-08 | `F03-G05-M03` | ADD | Career Exploration Guidance |
| CP-08 | `F03-G05-M01` | EXTEND | Guidance theo nghề/kỹ năng dựa nguồn |
| CP-09 | `F03-G04-M03` | REUSE | Roadmap, milestones (Package A, còn ở trạng thái đề xuất) |
| CP-09 | `F04-G01-M01` | EXTEND | Exploration-oriented plans |
| CP-09 | `F04-G05-M02` | EXTEND | Nộp artefact thử nghề |
| CP-09 | `F06-G06-M01/M02` | EXTEND | Reflection, review, feedback |
| CP-10 | `F07-G01-M01/M02` | EXTEND | Career dataset và retrieval |
| CP-10 | `F07-G02-M01/M02` | EXTEND | Editorial, provenance, freshness |
| CP-19 | `F01-G04-M01` | EXTEND | Quyền chia sẻ và đăng tải phù hợp độ tuổi |
| CP-19 | `F07-G04/G05/G06` | EXTEND | Content safety, privacy và access control |

**Tổng tạm tính sau A/B/C nếu được áp dụng:** 98 + 2 + 1 + 1 = **102 L3**. Chưa xét Package D/E và Consolidation.

## 3. Góp ý của chủ sản phẩm: Kiểm thử bằng dữ liệu mẫu

**Quyết định triển khai công việc:** Tạo **fixture giả lập** để kiểm tra tính phù hợp *của mô hình dữ liệu đề xuất*, không thay thế validation người dùng thật, thực thi DB, API hay an toàn thực tế. Dữ liệu mẫu không đưa vào kiến thức chính thức.

Các file:
- `Package_C_Career_Test_Fixture_SYNTHETIC.json` — bản ghi giả lập, có nhãn SYNTHETIC.
- `Package_C_Career_Test_Plan_REVIEW.md` — ca kiểm thử, dự kiến đầu ra và những giới hạn kiểm chứng.

**Đã kiểm tra bằng Python:** quan hệ khóa ngoại trong JSON, tách trạng thái cached/approved, hồ sơ người dùng, hai mode kế hoạch và chặn xuất bản minh họa. **Chưa kiểm thử:** triển khai thực, consent engine, các chính sách tuổi/nền tảng hiện hành, kết quả AI, dữ liệu thị trường thật, UI/UX, chi phí.

## 4. Research Delta — chỉ là đề xuất
- Taxonomy nghề nghiệp nhiều-nhiều, kỹ năng có bằng chứng.
- Độ tin cậy của dữ liệu thị trường và cập nhật định kỳ.
- Mức an toàn khi trẻ tạo/chia sẻ/đăng nội dung; rà soát quy định theo độ tuổi/địa bàn.
- Đánh giá kết quả khám phá mà không đóng khung trẻ.
- Chi phí vận hành Knowledge Intelligence và kiểm duyệt.

**Chưa đưa** vào Master Research Backlog.

## 5. Trạng thái tiếp theo

- **Package A:** đã chốt đề xuất, log riêng.
- **Package B:** đã chốt đề xuất, log riêng.
- **Package C:** đã chốt đề xuất, log này.
- **Package D/E:** chưa review/chốt.
- **Consolidation & sửa 3.2 chính thức:** chỉ sau các package và phê duyệt cập nhật văn bản.