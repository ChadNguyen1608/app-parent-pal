# PRODUCT BLUEPRINT 3.2 — CONSOLIDATION DECISION LOG A–E
**Phiên bản:** 1.0 · **Ngày:** 2026-11-09  
**Trạng thái:** `APPROVED_CONSOLIDATION_CHOICES / NOT_APPLIED`  
**Nguồn:** 3.2 baseline, Package A–E Decision Logs, Consolidation Review v1.0, lựa chọn C-Q1..C-Q4 của chủ sản phẩm.  
**PHẠM VI:** Chỉ ghi quyết định và thay đổi đề xuất. **Không sửa** `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md`, 3.3, 3.4, Master Research Backlog hoặc các log cũ.

## 1. Quyết định chốt tại vòng Consolidation
| Decision | Lựa chọn | Quyết định chính xác | Ranh giới |
|---|---|---|---|
| `CON-D01` / C-Q1=A | A | Tạo **L2 `F06-G07 — Academic Learning Assessment`**, đặt **L3 `F06-G07-M01 — Academic Assessment`** | `F06-G03-M03` là **ID đề xuất cũ**, `superseded_proposal`, không được tạo cùng lúc; không di chuyển module đã phát hành |
| `CON-D02` / C-Q2=A | A | AI Response & Execution Routing là policy spec của F07-G03-M01/M02, phối hợp F07-G04 và F07-G01/G02 | Không thêm L3 Router thứ hai; F07-G03-M03 sở hữu modality (STT/TTS/realtime/vision), không cấp quyền dữ liệu |
| `CON-D03` / C-Q3=A | A | Phân loại cache: `PUBLIC_APPROVED_KNOWLEDGE`, `SCOPED_NON_SENSITIVE`, `SENSITIVE_RESTRICTED`, `NO_CACHE`; enforce consent/scope, freshness, invalidation | Thông qua **nguyên tắc phân lớp**, chưa chốt TTL, key schema, provider retention hay cache store; `NO_CACHE` là response/retrieval cache, không xóa Journal riêng đã được phép lưu |
| `CON-D04` / C-Q4=A | A | Lập Scenario Change Log `SC-003` **riêng**, trạng thái `LOG_ONLY` | Không hồi tố sửa SC-001/SC-002 hoặc Blueprint |

**Góp ý bổ sung:** Không có. Các CP-01..24 đã được chốt *ở mức đề xuất* qua A–E, không có nghĩa mọi L4, kỹ thuật hay MVP đã được phê duyệt.

## 2. Kết quả cấu trúc nếu sau này duyệt áp dụng Proposed Diff
- Gốc: **8 Domain / 49 Group / 98 L3** (baseline 2 L3 mẫu/group, chưa hoàn chỉnh).
- Đề xuất qua A–E: **+8 L3** (2 A, 1 B, 1 C, 3 D, 1 E).
- Nhóm bổ sung: **`F08-G06` Education Finance (D)** và **`F06-G07` Academic Learning Assessment (Consolidation)**.
- Dự kiến: **8 Domain / 51 Group / 106 L3**; **không nhân đôi** `F06-G03-M03` và `F06-G07-M01`.
- Các ID mới vẫn là `PROPOSED`, chưa được phát hành vào canonical; thay đổi danh mục đã phát hành trong tương lai phải tuân thủ `legacy_id`/`moved_to`.

## 3. Các ranh giới bất biến khi áp dụng
1. `Goal & Roadmap (F03) ≠ Execution (F04) ≠ Assessment & Reports (F06)`.
2. Family Standard Bar tùy chỉnh + Hard/Soft Cap, protected leisure, multi-dimensional activity không đếm trùng; seasonal/weather-aware scheduling **không tự sửa mục tiêu/Standard Bar**.
3. Academic `submission ≠ assessment ≠ reviewed result`; AI grading ở pilot và benchmark, không suy diễn học lực từ dữ liệu thiếu.
4. `Child Journal / insights` private, không suy luận lộ gián tiếp cho phụ huynh; safety workflow tách, kiểm quyền trước retrieval.
5. Career data có provenance, `cached ≠ verified ≠ approved`, exploration không kết luận “phù hợp nghề”, public publishing có điều kiện.
6. `Entitlement ≠ Billing ≠ Education Finance ≠ Marketplace ≠ Wallet`; Wallet tiếp tục DEFER.
7. Parent AI đi kèm Family Subscription là **hướng thiết kế**, tránh hai subscription cho cùng hành trình; pricing M1/M2/M3 chưa chốt. Hybrid quota chốt về cấu trúc, chưa chốt lượng.
8. AI Voice STT/TTS/realtime dài hạn; không lưu voice Journal mặc định; nhà cung cấp/retention cần kiểm chứng.
9. `E0/E1 → E2 → E3` theo tính đủ của phương pháp, *không* thay thế kiểm quyền, kiểm nguồn, safety và acceptance.
10. A0–A5 yêu cầu biến thể quyền/UX phù hợp; 18+ tự quản dữ liệu, người trả phí không mặc nhiên sở hữu thông tin.

## 4. Chưa chốt / cần kiểm chứng
- L4 thực tế cho mỗi L3 mới, capability acceptance criteria, 6-cohort applicability, cost/risk/dependency chi tiết.
- Exact model routing, cache TTL/keys, provider logs, LLM thresholds, service architecture.
- Safety/escalation thresholds và chính sách quyền theo luật, benchmarking homework/Voice/Vision.
- Pricing, fee tiers, quota amounts, AI cost model, kết nối payment platform.
- Các khía cạnh policy và research còn `UNKNOWN`, chưa gán MR-ID mới.
- Cần bộ Scenario Trace Matrix và L4 coverage review; không thể kết luận 106 L3 là inventory hoàn chỉnh.

## 5. Hợp đồng bước tiếp theo
Tài liệu `Feature_3_2_Proposed_Canonical_Diff_REVIEW.md` mô tả nội dung dự định sửa; `Feature_3_2_Scenario_Trace_Matrix_REVIEW.md` truy vết use case; `Scenario_Change_Log_SC-003_REVIEW.md` lưu SC-003. **Tất cả là REVIEW/LOG_ONLY.** Chỉ cập nhật file 3.2 chính thức khi chủ sản phẩm xác nhận rõ yêu cầu **áp dụng diff**.