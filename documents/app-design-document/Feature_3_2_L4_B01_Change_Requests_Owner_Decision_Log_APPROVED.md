# Parent-Pal — Batch 01 / Module 05: Change Requests — Owner Decision Log

**Ghi nhận:** 2026-11-13  
**Module:** `F04-G06-M01` — Change Requests  
**Product Owner:** OQ-B01M5-1..5 **CONFIRMED**, theo đề xuất trong Review.  
**Trạng thái:** `OWNER_DECISIONS_RECORDED / B01_CONSOLIDATION_PENDING / FINAL_REGRESSION_OPEN`  
**Giới hạn:** Chốt nghiệp vụ không đồng nghĩa L4 accepted, production-ready hay 103 test ứng dụng đã chạy. Không cấp stable IDs, không sửa canonical Blueprint, không merge PR #17.

## 1. Quyết định được Owner xác nhận

| ID | Quyết định | Hợp đồng thực thi và điều kiện |
|---|---|---|
| **B01-CR-OD-01 / OQ-B01M5-1** | **A — Child-directed** trong phạm vi được ủy quyền có thể sửa lịch **trực tiếp** qua Plan Structure, không cần tạo Change Request; vượt quyền thì dùng CR/approval. | Direct mutation **không** miễn Access Policy, effective Mode State, Plan lock, authorization scope, version check, Balanced Planning, protected hard-cap, privacy/purpose gate và audit. Khi quyền được thu hồi hoặc lịch locked, direct mutation fail-closed. Approval/review workflow thuộc F04-G06-M01; baseline commit thuộc F04-G01-M01; lịch sử thuộc F04-G06-M02. |
| **B01-CR-OD-02 / OQ-B01M5-2** | **Chấp nhận bảng trạng thái khi context thay đổi**: (i) plan version đổi: pending cần reassessment, approved-not-applied bị vô hiệu và tạo yêu cầu mới; (ii) lịch bị lock: pending có thể giữ để xem nhưng không apply, approved-not-applied invalidated; (iii) Primary Caregiver đổi: pending chuyển người có quyền mới, approved-not-applied phải reapprove; (iv) mode đổi làm mất quyền: cả pending và approved-not-applied invalidated; (v) plan archived: cả hai invalidated. | Mọi request gắn plan/base version, actor, mode/policy/lock epoch, approval evidence. Khi pending reassessment không được tự approve/apply. Nếu caregiver handover, xác minh primary manager và rights theo scope; old approval không được replay. Sau invalidate cần new request/decision; lịch sử lưu lý do. |
| **B01-CR-OD-03 / OQ-B01M5-3** | Người có **quyền quản lý plan scope** (Primary Manager hợp lệ, caregiver theo policy) có thể trực tiếp sửa lịch mà **không tự xin một approval thứ hai**. | Không đánh đồng vai trò family-level Primary Caregiver với plan-scope Primary Manager; cả hai phải thông qua authorization, lock, validation, audit và version checks. Supporter/Observer không tự approve; delegated supporter authority cần grants cụ thể. Không cấp quyền ghi đè lên người 18+ đã tự quản. Không bypass protected hard-cap. |
| **B01-CR-OD-04 / OQ-B01M5-4** | **CR chờ duyệt tự hết hạn sau 7 ngày**; có thể tạo CR mới. Với approval đã có nhưng commit timeout/mất response, phải **đối soát trạng thái thật trước khi retry**. | 7 ngày tính từ timestamp submit hợp lệ; cần dùng server time và define expiry boundary/clock policy trong spec, không tái sử dụng approval hết hạn. Mọi commit phải idempotent, cùng request/idempotency key không duplicate plan version hoặc change history. Retry bounded, backoff và alerts thuộc technical design, không chốt con số cố định lúc này. `APPROVED != APPLIED`; timeout != failed. |
| **B01-CR-OD-05 / OQ-B01M5-5** | Có thể **lưu draft và gửi proposal không đạt Standard Bar, kể cả vi phạm protected hard-cap, để phụ huynh xem xét**; nhưng **không được APPROVE hay APPLY** khi còn vi phạm hard-cap. Với soft-cap, cần điều chỉnh hợp lệ hoặc ngoại lệ được phép trước khi approve/apply. | Tách trạng thái `VIEWABLE_FOR_DISCUSSION / NOT_APPROVABLE` khỏi `APPROVABLE`; không để request vi phạm hard-cap vào queue có thể auto-approve. Giao diện cảnh báo rõ mức vi phạm; AI/parent không thể waive hard-cap. Default Standard Bar phù hợp age/context khi Family Bar chưa được thiết lập; nếu default thiếu chuẩn hợp lệ, đánh dấu UNKNOWN/UNVERIFIABLE, vẫn có thể lưu draft nhưng không được lấy UNKNOWN làm PASS. |

## 2. Bất biến liên module và giải quyết xung đột

- **Lock (theo Plan Structure OQ-B01M4-4):** `LOCK = effective timetable not editable`. Child-directed direct mutation, worker queue, stale/offline API, approved request đều không được commit khi locked. Parent có thể unlock rồi sửa, hoặc đi qua **authorized override** có audit, validation và version; không silent bypass. Chỉ người có thẩm quyền quản lý lịch của trẻ chưa tự quản mới unlock/override.
- **Age/capability:** Không đặt cấm tuyệt đối theo A0–A2 chỉ bằng tuổi nếu trái Owner decision; quyền phải được đánh giá dựa trên mode, khả năng, grants và chính sách bảo vệ bắt buộc. Ghi đề xuất sửa regression/test cũ, không tự chỉnh Blueprint.
- **Parent-led:** Child được trao đổi mong muốn nhưng không tạo Change Request lịch chính thức. Các baseline tests P5 mâu thuẫn phải được đề xuất cập nhật, có original trace & supersedes record.
- **APPROVED != APPLIED:** F04-G06 quản approval validity + commit handoff, F04-G01 ghi plan baseline có version, F04-G06-M02 giữ history; commit failed/replayed không được phát sinh kết quả sai.
- **Family and adult rights:** 1 Primary Caregiver ở family level, Primary Manager theo plan scope; người 18+ đã xác minh tự quản, caregiver không có quyền override.
- **Journal/purpose:** Journal private; không đưa derived content không được phép vào CR context; Access Policy final decision, F07 purpose assessment; không dùng dữ liệu cá nhân thật nếu chưa có lawful basis phù hợp.

## 3. Các trường hợp regression bắt buộc

1. Child-directed edit under delegation trực tiếp: allowed only after complete authorization/lock/version/balance checks; result audited.
2. Child-directed out-of-scope -> CR review; Parent-led cannot submit official CR; Child-executed can create draft and submit.
3. Locked timetable blocks all unauthorized mutations even already-approved CR; approved invalidates if lock happens precommit.
4. Pending request base version changes -> pending reassess, not silently applied; approved stale -> invalidated/new request.
5. Caregiver handover -> pending reroutes authorized actor; prior approved un-applied reapproval, no replay.
6. Mode change removing rights and plan Archived invalidates pending/approved as specified.
7. Expiry at exact 7-day boundary with server time; no approval beyond expiry; option to make new request.
8. Timeout after real commit -> read/confirm actual transaction before retry; no duplicate plan versions/change history.
9. Soft-cap violation: draft/proposal allowed, approval only if valid exception or revised. Hard-cap violation: draft/proposal visible for discussion, **approval/apply always DENY** until corrected.
10. Family Default Bar absent -> App Default Bar by age/context/version; default not verified -> UNKNOWN but draft persists.
11. 18+ self-managed adult resists parent takeover; Journal and purpose barriers preserved.

## 4. Chưa đóng — Batch 01 Consolidation

Input: `B01_F04-G06-M01.zip` do Owner cung cấp; ZIP chưa commit vào repo.

Theo báo cáo pilot do Claude cung cấp: **5 L4 ứng viên**, **103 test thiết kế**, **25 findings** (12 fixed, 9 Owner nhóm thành 5 OQ, 2 research, 2 open), **0 Validator errors/warnings**, mutation checks **11/11**, cross-module **29 consistent, 4 partial, 1 conflict**. **Self-reported design evidence**; chưa thực thi application tests.

- Owner decisions đã chốt, **không tự đóng 9 findings** đến khi rerun trace, review và test mapping.
- Open technical: `F-022`, `F-025`; owner không cần phê duyệt việc sửa technical detail.
- Conflict Register ghi 14 mục; cần phân tích source và severity, đặc biệt lock/Parent-led/age policy.
- 4 partial + 1 conflict trong cross-module regression chưa được đóng.
- Những quyết định có nhãn recommendation trước đây phải được cập nhật theo authoritative log này, không dựa vào bản Claude cũ.
- Research issues (2) phải giữ riêng và map MR, không giả lập verified evidence.

## 5. Handoff và gate

`B01_MODULE_05_EXECUTED`  
`B01_MODULE_05_OWNER_DECISIONS_RECORDED`  
`B01_BATCH_01_ALL_FIVE_MODULES_REVIEWED`  
`B01_CONSOLIDATION_REQUIRED`  
`B01_FINAL_ACCEPTANCE_NOT_GRANTED`

Claude Code: tối đa 3 sub-agent Sonnet 5.5 khi khả dụng, Coordinator giữ model hiện tại; ZIP ngoài repo; không push/commit hoặc thay docs. ChatGPT quản lý Decision Logs/Git; Owner quyết định business conflicts. PR #17 Draft, không merge.
