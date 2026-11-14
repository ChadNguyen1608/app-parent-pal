# 00 — Source Authority Manifest (3.3 scoring)

**Ngày chạy:** 14/11/2026 (UTC) · **Người chạy:** AI (Claude), chưa kiểm chứng độc lập · **Trạng thái:** `REVIEW`

## 1. Trạng thái repo

| Mục | Giá trị |
|---|---|
| Repo / nhánh | `ChadNguyen1608/app-parent-pal` / `docs/l4-pilot-three-modules-20261110` |
| HEAD dùng cho mọi điểm | `9043c88ecc4c945ff23e207e0b3c4db521ef6e3b` (commit 2026-11-14T15:46:04+07:00), fetch lúc 2026-11-14T10:20:28Z |
| PR #17 | open, draft, chưa merge, head = `9043c88` (REST API) |
| Working tree khi bắt đầu | sạch (0 thay đổi) |
| Kiểm lại HEAD trước CP-04 và trước khi xuất bản | vẫn là `9043c88`: không có `SOURCE_STALE` |
| Độ mới nguồn | đã xác minh với remote; không gắn `SOURCE_FRESHNESS_UNVERIFIED` |

## 2. Thứ tự ưu tiên nguồn đã áp dụng

Thứ tự theo prompt v2 §0.1. Thời điểm mới hơn không tự động có nghĩa là thay thế bản cũ. **Không có `OWNER_CONFLICT`** trong lượt chạy này.

**Mâu thuẫn đã giải quyết.** OD02–OD05 Log và FR-01 còn ghi trạng thái `INDEPENDENT_RECHECK_PENDING` / `PROPOSED_FOR_INDEPENDENT_REVIEW`. Quyết định sau của Owner là không kiểm lại độc lập, ghi tại Remediation Register dòng 69 và Execution Tracker mục "Owner declined Claude recheck". Quyết định này thay thế các nhãn "pending" trên trong phạm vi lượt chạy. Vì vậy:
- không chạy review hồi quy L4;
- đặc tả được ghi `AUTHOR_REMEDIATED_NOT_INDEPENDENTLY_VERIFIED`.

Chỉ đạo trọng tâm đánh giá ngày 14/11/2026 (prompt v2 §0.4) được xếp hạng 1. Đây là chỉ đạo về **độ sâu đánh giá**, không phải quyết định MVP.

## 3. Inventory

| Kiểm | Kết quả |
|---|---|
| L3 duy nhất | 106 |
| L2 group | 51 |
| Theo domain | F01 13 · F02 12 · F03 14 · F04 15 · F05 12 · F06 13 · F07 15 · F08 12 (khớp bảng chuẩn) |
| Trùng / mồ côi / lạ | 0 / 0 / 0 |
| Module mới của 3.2-R1, chưa có E/cost | F01-G06-M03, F03-G04-M03, F03-G05-M03, F04-G02-M03, F07-G03-M03, F06-G07-M01, F08-G06-M01, F08-G06-M02. Lượt này gán E0–E3 và ghi rõ là đánh giá |
| Lưu ý | Phụ lục của 3.3 vẫn liệt kê 98 L3 (baseline cũ). Lượt chạy dùng 106 theo inventory 3.2-R1 đã duyệt |

## 4. Pin của Remediation Register so với HEAD

| File | Pin trong sổ | Tại HEAD |
|---|---|---|
| `Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md` | `8e8c3b35c92b` | MATCH |
| `Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md` | `8ff894dfae7a` | MATCH |
| `Feature_3_2_L4_Detailed_Review_Group_04_Plan_Changes_REVIEW.md` | `9c4bb794f0fd` | MATCH |
| `Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md` | `1b7f15880a5c` | MATCH |
| `Feature_3_2_L4_Detailed_Review_Group_24_Final_Inventory_REVIEW.md` | `52001e3f57dd` | MATCH |
| `Feature_3_2_L4_Independent_Review_9aa4c8a_Disposition_REVIEW.md` | `262041dfd2a9` | MATCH |
| `Feature_3_2_L4_FR01_Parent_PIN_Unlink_and_Repairing_Owner_Decision_APPROVED.md` | `de08dae59ef6` | MATCH |
| `Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md` | `6ba6f5f5fe19` | MATCH |
| `Feature_3_2_L4_B01_Specification_Remediation_v3_1_Addendum_REVIEW.md` | `3c398a3c5e26` | MATCH |

## 5. Blob của các nguồn chi phối (tại HEAD)

| Hạng | File | Blob |
|---|---|---|
| 1 | `documents/app-design-document/Feature_3_2_L4_FR01_Parent_PIN_Unlink_and_Repairing_Owner_Decision_APPROVED.md` | `de08dae59ef65575b009f0a841ddf1b596266e2a` |
| 1 | `documents/app-design-document/Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md` | `6ba6f5f5fe1971e5ff50350c99407bbf21953f28` |
| 1 | `documents/app-design-document/Feature_3_2_L4_Owner_Decision_Register_INDEX.md` | `6baf43286ce9895c0564876fbca05622c3fa1cde` |
| 2 | `documents/app-design-document/Feature_3_2_Consolidation_Decision_Log_APPROVED.md` | `943cb8941986d1d9889e6807561c9f36c517b9ce` |
| 2 | `documents/app-design-document/Feature_3_2_L3_Resolution_Decision_Log_APPROVED.md` | `7c57229bc5bdf1331f95e43b7681ef2040bc3615` |
| 2 | `documents/app-design-document/Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md` | `5acbe35c283b46e10e3d55c894f977be35cc279f` |
| 2 | `documents/app-design-document/Feature_3_2_L4_B01_Conditional_Design_Baseline_Owner_Gate_APPROVED.md` | `a2d67d4f603b62aeff9b7f2482d04862bef3b381` |
| 2 | `documents/app-design-document/Feature_3_2_L4_B01_Consent_Ledger_Owner_Decision_Log_APPROVED.md` | `4c3fb4c44c2d729c560ec01ae8d8d998b9e19834` |
| 2 | `documents/app-design-document/Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md` | `6ca27ecb4602f3048218e16ef05005bf020a1983` |
| 2 | `documents/app-design-document/Feature_3_2_L4_B01_Mode_State_Owner_Decision_Log_APPROVED.md` | `ef27b6a5b2941ce159782da4f00f86661ed8cc7e` |
| 2 | `documents/app-design-document/Feature_3_2_L4_B01_Plan_Structure_Owner_Decision_Log_APPROVED.md` | `ca334de1d2ac2132b5661222e59300091200a309` |
| 2 | `documents/app-design-document/Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md` | `9ced7c8971c73c06d857dcef8a5c946e5aa76a98` |
| 2 | `documents/app-design-document/Feature_3_2_L4_B02_Scope_Owner_Decision_APPROVED.md` | `b09a6a5a8b07aac0365325e9e52af1cc16a0b384` |
| 2 | `documents/app-design-document/Feature_3_2_L4_Capability_Standard_APPROVED.md` | `7bfebaebf22300801263eb5aa604018ffedbe257` |
| 2 | `documents/app-design-document/Feature_3_2_L4_Consolidation_Owner_Decision_Log_APPROVED.md` | `9bae28f784a412278154f3194ac15c0d79848a46` |
| 2 | `documents/app-design-document/Feature_3_2_L4_Methodology_Decision_Log_APPROVED.md` | `c565dd8c8f2859fdbb53a7e73515531d9de01670` |
| 2 | `documents/app-design-document/Feature_3_2_L4_P5_Owner_Decision_Log_APPROVED.md` | `913c9f1629e7f2e9013f78fbb5a4164235b3ffd2` |
| 2 | `documents/app-design-document/Feature_3_2_L4_P6_Academic_Assessment_Owner_Decision_Log_APPROVED.md` | `df9e3fdf7e7d7c0e120ca5ce011d94fb27bbae4c` |
| 2 | `documents/app-design-document/Feature_3_2_L4_P6_Access_Policy_Owner_Decision_Log_APPROVED.md` | `b9d71e7f92adf2576cccb03735220b51ae0a43db` |
| 2 | `documents/app-design-document/Feature_3_2_L4_P6_Balanced_Planning_Owner_Decision_Log_APPROVED.md` | `fd824e8a867824f6fa0e04b8f603a748b2b29007` |
| 2 | `documents/app-design-document/Package_A_Decision_Log_3_2_APPROVED_PROPOSAL.md` | `44beab411ab4726c05b9a227d3e8805c4255f90b` |
| 2 | `documents/app-design-document/Package_B_Decision_Log_3_2_APPROVED_PROPOSAL.md` | `93c819d509b59100cbd43996a7dc890844a1a6a2` |
| 2 | `documents/app-design-document/Package_C_Decision_Log_3_2_APPROVED_PROPOSAL.md` | `f1d4d6b7c1a3abf38316c24d6a14ce259edc444d` |
| 2 | `documents/app-design-document/Package_D_Decision_Log_3_2_APPROVED_PROPOSAL.md` | `01e8496a6a79be37c28316c32eaa0ff2aa24f1c0` |
| 2 | `documents/app-design-document/Package_E_Decision_Log_3_2_APPROVED_PROPOSAL.md` | `72862c54cc04c3a5ffd03e15693c0d450dab49bd` |
| 2 | `CLAUDE.md` | `5116df2ae7cbae7118e7c017a6ca6a4117b20e9d` |
| 3 | `documents/app-design-document/Product_Blueprint_03_2_Feature_Inventory_and_Scope.md` | `f52be52f5ae37ddce0b6a021aec915659f357db3` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_01_Linking_and_Membership_REVIEW.md` | `8e8c3b35c92be421334ebf9b855632d55d4ed806` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_02_Pal_Response_REVIEW.md` | `8ff894dfae7a4f90e094b551d104ac784a8f206a` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_03_Journal_Lifecycle_REVIEW.md` | `dfa715531d0456b7e1687d2d6418b7e2d8f821a9` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_04_Plan_Changes_REVIEW.md` | `9c4bb794f0fd43c441ba07da59015788f1c1b23d` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_05_Learning_Evidence_REVIEW.md` | `0907d5aa414e226832ec716f20d03d3c1f7c8397` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_06_Activity_and_Progress_REVIEW.md` | `9fa0c3f20769880520d4463f59a7fd43eb07e17e` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_07_Third_Party_Data_REVIEW.md` | `d549158e4ddc87729c30eed3c35ee375b069e007` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_08_Commerce_and_Expenses_REVIEW.md` | `1b7f15880a5cc030cc388c076451f044a54b9636` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_09_Billing_and_Operations_REVIEW.md` | `050f3012e4c5985dbd3c6d646042a9ef95e3a49e` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_10_Knowledge_Content_REVIEW.md` | `58420cfcd6a860553b344b72cf33ae10ae56621d` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_11_AI_Execution_and_Evaluation_REVIEW.md` | `6ca38a589e7956117b199aea4e538a1ec9b69db9` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_12_Check_In_and_Reflection_REVIEW.md` | `762fa90e77344fe128186234978e38301cb47b00` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_13_Private_Journal_and_Insights_REVIEW.md` | `e8e142532d6f5bf42cbe4be97303735ebababf4c` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_14_Identity_and_Verification_REVIEW.md` | `f89e0630f957a87205dd4a681fb44c15d35ef8d3` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_15_Intake_and_Observations_REVIEW.md` | `b348c6688c204a48f4dd540185e1cdd235332ea9` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_16_Context_and_Profile_REVIEW.md` | `631547269a877407f42f568ed78436000491fcd5` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_17_Feedback_and_Corrections_REVIEW.md` | `92872c4cef7bba4578b0077622ae66b9e261ff05` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_18_Development_Frameworks_REVIEW.md` | `0ef82b41aef07ddb151fcffc42fa8b69de569f3c` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_19_Goals_and_Milestones_REVIEW.md` | `5c2c81a05fc39372d31e520648f5b069f51d9aa6` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_20_Recommendations_and_Goal_Changes_REVIEW.md` | `0ab3b9ac5f057919fd7bb006764f6e4420fefb92` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_21_Scheduling_and_Task_Ownership_REVIEW.md` | `ceafb5821edc8de239f5769789e3a07aa78f6b12` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_22_Daily_Tasks_and_Reminders_REVIEW.md` | `5094fa5da60511b5db9ea0ee9cb6260427ea62c6` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_23_Progress_Evidence_and_Review_REVIEW.md` | `699114b6bb15c90e79b3623b57a90c49cd19deee` |
| 4 | `documents/app-design-document/Feature_3_2_L4_Detailed_Review_Group_24_Final_Inventory_REVIEW.md` | `52001e3f57dde5447b0f4fab025e002092b2b0e9` |
| 4 | `documents/app-design-document/Feature_3_2_L4_B01_Normalized_Cross_Module_Baseline_REVIEW.md` | `dee78905580c9c99c36d8b0d1d8eedee7cdb36e4` |
| 4 | `documents/app-design-document/Feature_3_2_L4_B01_Specification_Remediation_v3_1_Addendum_REVIEW.md` | `3c398a3c5e26136609ee2c2d29843a66a7a7e97f` |
| 4 | `documents/app-design-document/Feature_3_2_L4_B02_Design_and_Checkpoint_REVIEW.md` | `cd4aa379cf2e96ee7d23025108171aa470e65ca9` |
| 5 | `documents/app-design-document/Feature_3_2_L4_Claude_Final_Report_Author_Remediation_Register_20261114_REVIEW.md` | `d8f380578c8c32397f971bc3746368c063ffabfa` |
| 5 | `documents/app-design-document/Feature_3_2_L4_20261114_Owner_Finding_Remediation_Supplemental_Manifest_REVIEW.md` | `ea7abc28e558b2826bf126e84be08e959a7fd770` |
| 5 | `documents/app-design-document/Feature_3_2_to_Phase_3_Execution_Tracker_REVIEW.md` | `9c87da417382bac9a49169b681a2619961c312a5` |
| 6 | `documents/app-design-document/Product_Blueprint_03_3_Feature_Prioritization_and_Dependency_Mapping.md` | `43683dc6e0e7e2a94411f9bb6499ab61b3ef93cb` |
| 6 | `documents/app-design-document/Product_Blueprint_Master_Research_Backlog_v1_2.md` | `37021e8691a38a590646e566ec9a72353cb304fa` |
| 7 | `documents/app-design-document/Feature_3_3_106_L3_Preliminary_Value_Cost_Triage_REVIEW.md` | `5db466a1e98d412bd38366e3dc018c38a454f976` |
| 7 | `documents/app-design-document/Feature_3_3_Initial_106_L3_Assessment_Registry_REVIEW.md` | `8f3bd7f5be0835240d8f25ae458a790728a1bde2` |
| 7 | `documents/app/spec-phuong-an-a-app-android.md` | `d87ab4c0162e29c4b21a61ecb0063cac3b5752e5` |
| 7 | `documents/app/ref-nhat-ky-test.md` | `3fe90af5af41c96e287f028a406edfa42c9f0ae6` |
| 7 | `prototype/README.md` | `b317aa2c12eeab995523e1740029614ece04cfd5` |
| 7 | `documents/pal/spec-quy-tac-lap-lich.md` | `89c9d7c571faa1fd333de7c6b15f87d593bb146b` |
| 8 | `documents/app-design-document/Feature_3_2_L4_Functional_Baseline_Frozen_Manifest_20261114_REVIEW.md` | `cae7a1ddb9c9f5bd85b8677d5b4d7f0292540e82` |
| 8 | `documents/app-design-document/Feature_3_2_L4_Independent_Review_9aa4c8a_Disposition_REVIEW.md` | `262041dfd2a94528952beaded0ff858d64dd981f` |

## 6. Nguồn ngoài git

| Nguồn | Dùng cho | Ghi chú |
|---|---|---|
| `claude/mo-hinh-kinh-te-v1.md` (project Parent-Pal trên claude.ai, tạo 29/10/2026) | Giả định chi phí AI/người dùng và quy mô | Toàn bộ là giả định, chưa có dữ liệu thật |
| Bảng giá Claude API (tra web 14/11/2026) | Kịch bản chi phí E2 | Haiku 5.5: $0,10 / $0,50 mỗi triệu token vào/ra (prompt ≤100K); Sonnet 5.5: $2 / $10. Là giá niêm yết, không phải unit economics của app |
| Tỷ giá USD/VND (tra web 14/11/2026) | Quy đổi | Dùng 26.000 VND/USD (giả định làm tròn; trung bình thị trường liên ngân hàng khoảng 26.000–26.200 đầu tháng 11/2026) |
