# PRODUCT BLUEPRINT — 3.2 PACKAGE E DECISION LOG

**Ngày:** 2026-11-09  
**Trạng thái:** `USER_APPROVED_L3_PROPOSAL` + `ROUTING_POLICY_GAP_REGISTERED`  
**Nguyên tắc:** Không chỉnh sửa Feature Inventory 3.2, Product Blueprint, 3.3/3.4 hay Master Research Backlog. Chỉ là biên bản quyết định và đề xuất trước Consolidation.

## I. Quyết định đã chốt (Package E)

| ID | CP | Quyết định | Mapping L3 đề xuất |
|---|---|---|---|
| E-D01 — Q1=A | CP-14 | Thêm Multimodal Interaction Orchestration, dùng chung Parent AI/Child AI nhưng kiểm quyền riêng | `ADD F07-G03-M03`; `EXTEND F05-G01-M01/M02`, `F05-G04-M01`, `F07-G04-M01/M02` |
| E-D02 — Q2=A | CP-20 | Hybrid Quota: shared family allowance + fair-use theo child + hạn mức theo capability; CHƯA chốt quota cụ thể | `EXTEND F01-G06-M02`, `F07-G03-M02`, `F07-G07-M02`, `F07-G04-M02` |
| E-D03 — Q3=A | CP-18, CP-22 | Mở rộng F07 Operations và F03/F04 accessibility, không tạo L3 mới | `EXTEND F07-G07-M01/M02`, `F07-G06-M01`, `F03-G03-M02`, `F04-G04-M02` |
| E-D04 — Q4=A | CP-24 | Mở rộng F04-G07/F07-G07, notification chung có phân loại và chính sách từng loại | `EXTEND F04-G07-M01/M02`, `F07-G07-M01` |

## II. Ràng buộc đã chốt từ trước

- **AI Voice = C:** dài hạn bao gồm STT, TTS và realtime Voice, không có nghĩa đã chọn vào MVP.
- **Child Journal:** có thể xử lý voice tạm để nhập dữ liệu; không mặc định lưu audio; retention và transcript nhà cung cấp phải được kiểm chứng.
- **Parent AI / Child AI:** dùng chung hạ tầng có thể được, nhưng quyền dữ liệu, policy theo actor/beneficiary/purpose khác nhau.
- **Family Subscription/Child Slots/Parent AI:** tránh thu hai subscription độc lập cho phụ huynh và trẻ trong cùng hành trình; mô hình M1/M2/M3 và giá cụ thể vẫn chưa chốt. Billing unit khác usage actor và attribution.
- **Wallet = D:** hoãn định nghĩa/triển khai Wallet, không trộn với quota AI.
- **AI Homework Assessment:** prototype/pilot có benchmark chất lượng và chi phí; không mặc định phát hành rộng.
- **Quota:** tác vụ an toàn tối thiểu không bị chặn bất ngờ bởi hạn mức thông thường; vẫn phải có abuse control và chính sách thẩm định.
- **Notification:** kiểm tra quyền trước gửi, không lộ Journal qua preview; safety exception theo policy riêng.
- **Accessibility:** thích nghi theo tuổi, nhu cầu tiếp cận và quyền; 18–23 là người trưởng thành, không mặc định phụ huynh được đọc dữ liệu.

## III. Phát hiện của chủ sản phẩm: AI Response/Execution Routing (mới, CHƯA CHỐT giải pháp)

**Câu hỏi:** Quy tắc phản hồi của AI đã có chưa, trường hợp nào cache, khi nào dùng LLM?

**Kết quả audit:** Đã có khung `E0–E3` và các module `F07-G03-M01` (Single Interface Router), `F07-G03-M02` (Execution Budget), `F07-G01-M02` (Structured Retrieval), `F07-G04-M01` (Policy Evaluation), `F07-G04-M02` (Model Evaluation). Feature Inventory 3.2 yêu cầu các metadata `cache_eligibility`, `fallback_mode`, `safety_gate`, `privacy_scope`, cost/call và benchmark. **Chưa có bảng policy chi tiết từng use case, chuẩn cache, điều kiện escalation, response format, audit/test.**

**Đăng ký gap:** `E-GAP-01: AI Response & Execution Routing Policy`, trạng thái `NEW_PROPOSAL_REQUIRES_CONSOLIDATION`, **không tự động tạo Module L3 thứ hai**.

**Đề xuất ownership:** `EXTEND F07-G03-M01` cho intent/task routing và lựa chọn E0/E1/E2/E3; `EXTEND F07-G03-M02` cho token/model/cost/quota/caching policy; `EXTEND F07-G04-M01/M02` cho safety/quality gate; `REUSE F07-G01/G02` cho approved knowledge; `EXTEND F07-G07-M02` cho usage attribution. `F07-G03-M03` mới điều phối phương thức text/voice/vision, **không thay thế** quyết định E0–E3.

### Decision Matrix sơ bộ (đề xuất, chưa phê duyệt từng tuyến)

| Task | Ưu tiên | Escalation/giới hạn |
|---|---|---|
| Đọc lịch, trạng thái, quyền lợi gói | E0 DB | Không LLM để lấy giá trị đã có |
| Tạo lịch/xung đột/balance Standard Bar | E1 rule/constraint | E2 chỉ khi cần giải thích sáng tạo, không vượt hard safety caps |
| Nội dung theo tuổi/Admission/Career | E1 truy vấn knowledge approved | E2 diễn giải có grounding; cache chưa approved thì không thành dữ kiện |
| Phép tính, tiến độ, tổng hợp số | E1 deterministic | Không dùng LLM làm phép tính khi rules đủ |
| Báo cáo tháng | E0/E1 structured aggregation | E2 diễn giải phức tạp khi có quyền/dữ liệu và budget |
| Child Companion đối thoại mở | E2 có safety/privacy gates | Escalation an toàn riêng, không tự tiết lộ Journal |
| Chấm bài có đáp án xác định | E1 | AI Vision/LLM chỉ pilot hoặc trường hợp đạt policy |
| Chữ viết ảnh | E2 vision pilot | Ảnh mờ -> UNABLE_TO_ASSESS, kiểm quality/chi phí |
| Tra cứu thống kê nghề | E1 từ nguồn kiểm chứng | Không bịa số từ LLM; nói thiếu dữ liệu khi thiếu nguồn |
| Nghiên cứu đa bước | E3 có kiểm soát | Không mặc định agent; cần evaluation/approval |

### Rules tối thiểu nên đặc tả trước khi phát triển

1. **Authorize before retrieval/inference:** actor/role, child scope, purpose, consent; không share cache xuyên child/family đối với dữ liệu riêng.
2. **Response priority:** E0 → E1 (rule/approved template/retrieval) → E2 → E3; đây là thứ tự ưu tiên kinh tế, **không** bypass safety hoặc bỏ mất nhu cầu thực sự của người dùng.
3. **Cache policy by classification:** static reference knowledge có version/freshness; dữ liệu per-family/per-child phải scope-isolated; nhạy cảm (Journal/safety) cần chính sách nghiêm và có thể `NO_CACHE`.
4. **Invalidation:** thay đổi consent, nguồn, phiếu duyệt, knowledge version, age cohort/policy, xóa dữ liệu phải vô hiệu hóa các kết quả liên quan.
5. **Grounding:** approved knowledge ≠ merely cached; generation không được nâng nguồn chưa verified thành fact; thống kê không nguồn phải trả lời thiếu bằng chứng.
6. **Fallback:** khi cache cũ, model lỗi, thiếu quota, không có dữ liệu hoặc safety triage không chắc chắn thì có response/fallback tương ứng; không tự sáng tác.
7. **Cost attribution:** ghi actor, beneficiary/scope, capability/modality, execution tier, estimated/actual cost, cache hit, policy version; billing tính theo subscription policy, không tự nhân cost request dùng chung.
8. **Evaluation:** policy routing phải có bộ test per task/cohort, privacy, safety, hit rate, freshness, escalation, unit economics và human-review boundaries.

**Chưa được chốt:** có L3 router mới hay không (đề xuất KHÔNG), exact cache TTL/key, model provider, quota numbers, response schema, retrieval thresholds, safe fallback và test acceptance criteria. Đưa vào Consolidation để duyệt.

## IV. Kết quả tạm tính A–E

| Package | L3 thêm đề xuất | Group thêm đề xuất |
|---|---:|---:|
| A | +2 | 0 |
| B | +1 | 0 |
| C | +1 | 0 |
| D | +3 | +1 |
| E | +1 | 0 |
| **Tổng đề xuất** | **98 + 8 = 106** | **49 + 1 = 50** |

8 Domains không đổi. Tất cả chưa phản ánh việc trùng/lệch ownership hoặc nghiên cứu mới sau Consolidation. Không sửa tài liệu chính thức.