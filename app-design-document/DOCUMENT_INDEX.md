# Mục lục tài liệu thiết kế

## 1. Product Vision

- [Product Vision](01_Product_Vision/01_Product_Vision.md) — bản làm việc ghi nhận các quyết định đến 06/11/2026, cùng giả thuyết và câu hỏi còn mở.

## 2. User Research

- [Tổng hợp](02_User_Research/User_Research_02_Summary.md)
- [2.1 User Ecosystem](02_User_Research/User_Research_02_1_User_Ecosystem.md)
- [2.2 Parent Segmentation](02_User_Research/User_Research_02_2_Parent_Segmentation.md)
- [2.3 Child Segmentation](02_User_Research/User_Research_02_3_Child_Segmentation.md)
- [2.4 User Needs and Pain Points](02_User_Research/User_Research_02_4_User_Needs_and_Pain_Points.md)
- [2.5 User Scenarios](02_User_Research/User_Research_02_5_User_Scenarios.md)
- [2.6 User Prioritization](02_User_Research/User_Research_02_6_User_Prioritization.md)
- [2.7 Competitors and Usage Habits](02_User_Research/User_Research_02_7_Competitors_and_Usage_Habits.md) — nháp AI 14/11/2026, chưa kiểm chứng độc lập.
- [2.8 Field Research Plan](02_User_Research/User_Research_02_8_Field_Research_Plan.md) — nháp AI, kế hoạch phỏng vấn thực địa.

Các định hướng đã được chốt ở cấp Product Blueprint. Các giả thuyết cần kiểm chứng thực địa được ghi trong từng tài liệu và [backlog nghiên cứu](progress/Product_Blueprint_Master_Research_Backlog_v1_2.md).

## 3. Feature Planning

- [3.1 Feature Domains](03_Feature_Planning/Product_Blueprint_03_1_Feature_Domains.md)
- [3.2 Feature Inventory and Scope](03_Feature_Planning/Product_Blueprint_03_2_Feature_Inventory_and_Scope.md) — bản 3.2-R1 trên `main` có 8 domains, 51 groups, 106 L3 và trạng thái `L4_PENDING`.
- [3.3 Feature Prioritization and Dependency Mapping](03_Feature_Planning/Product_Blueprint_03_3_Feature_Prioritization_and_Dependency_Mapping.md) — phương pháp đã được duyệt. Bảng ưu tiên và lựa chọn MVP còn mở.
- [3.4 Feature Interaction and Use Case Mapping](03_Feature_Planning/Product_Blueprint_03_4_Feature_Interaction_and_Use_Case_Mapping.md) — khung Use Case đã được duyệt. Workflow chi tiết ở trạng thái đề xuất.

Nguồn nhập bước 1–2 là các bản Markdown xuất đã lưu trên máy. Tài liệu bước 3 và hồ sơ quyết định được chuyển nguyên bản từ `documents/app-design-document/` trên `main` tại `8af3a55`.

## 4. User Flow

- [4.1 Vòng lập lịch (đợt 1)](04_User_Flow/User_Flow_04_1_Scheduling_Loop.md) — nháp AI, cập nhật 15/11/2026 theo sổ quyết định: F1–F5, 40 màn hình.
- [4.2 Các luồng còn lại (đợt 2)](04_User_Flow/User_Flow_04_2_Remaining_Flows.md) — nháp AI 15/11/2026: 10 luồng đầy đủ, 8 luồng khung; tổng 56 màn hình.

## 6. Information Architecture

- [6.1 Kiến trúc thông tin nấc 1](06_Information_Architecture/IA_06_1_Information_Architecture.md) — nháp AI 15/11/2026: app phụ huynh 38 màn, app của con 20 màn; điều hướng, trạng thái đặc biệt, ma trận dữ liệu.

## 7. Wireframe

- Canvas "Parent-Pal nấc 1 – Wireframe và prototype" trên claude.ai (riêng tư của chủ sản phẩm): 39 màn, bấm thử được. Luồng đã duyệt (D-47).

## 12–15. Kiến trúc, Tech Spec, kế hoạch dev

- [12.1 Kiến trúc hệ thống nấc 1](12_System_Architecture/Architecture_12_1_System_Architecture.md) — nháp AI; 4 lựa chọn chờ chủ sản phẩm (D-46a/b/c, LQ-08).
- [13.1 Tech Spec nấc 1](13_Tech_Spec/Tech_Spec_13_1_MVP_Step1.md) — mô hình dữ liệu, RLS, API, test.
- [15.1 Kế hoạch dev nấc 1](15_Dev_Planning/Dev_Plan_15_1_MVP_Step1.md) — đợt 0–6, cổng G-1..G-11, việc của chủ sản phẩm OW-01..10.

## Hồ sơ hỗ trợ (progress)

- [Chấm điểm 3.3 và tự kiểm toán](progress/phase-3-scoring/README.md) — REVIEW, MVP chưa chọn.
- [Spike bộ xếp lịch E1](progress/spike-e1-scheduler/Spike_E1_Scheduler_Report.md) — xếp lịch bằng thuật toán, không AI: khả thi cho phần lõi. Bản v2 (15/11) áp D-02, D-08, D-09, D-10; xem `CHANGES.md`.
- [Sổ ràng buộc từ các quyết định đã duyệt](progress/Constraint_Register_Approved_Decisions.md)
- [Bộ câu hỏi pháp lý](progress/Legal_Question_Pack.md) — cần luật sư xác nhận.
- [Sổ quyết định 15/11/2026](progress/Owner_Decision_Log_20261115.md)
- [Phương án MVP để chủ sản phẩm chọn](progress/MVP_Options_for_Owner_Decision.md) — chưa chọn.
- [Business Logic 11.1: lập lịch E1 (nháp)](progress/Business_Logic_11_1_Scheduling_E1_DRAFT.md) — 112 quy tắc BR.
- [Business Logic 11.2: gia đình và quyền truy cập (nháp)](progress/Business_Logic_11_2_Family_and_Access_DRAFT.md) — 78 quy tắc.
- [Business Logic 11.3: đồng ý và dữ liệu (nháp)](progress/Business_Logic_11_3_Consent_and_Data_DRAFT.md) — 77 quy tắc.
- [Business Logic 11.4: thông báo, báo cáo, an toàn (nháp)](progress/Business_Logic_11_4_Notifications_Reports_Safety_DRAFT.md) — 77 quy tắc.
- [Danh sách module nấc 1 (A-lite E1)](progress/MVP_Step1_Module_List.md) — 30 module, 2 đề xuất thêm.
- [Bộ tài liệu thử nghiệm nội bộ](progress/internal-test-kit/Test_Kit_00_README.md) — mẫu trống, chưa được luật sư xem; không lưu dữ liệu thật trong repo.

[Tiến độ và trạng thái bàn giao](progress/PHASE_STATUS.md)
