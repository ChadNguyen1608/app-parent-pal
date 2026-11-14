# Parent-Pal — Batch 01 / Module 04: Plan Structure — Owner Decision Log

**Ngày:** 2026-11-13  
**Module:** `F04-G01-M01` — Plan Structure  
**Owner Review:** `OQ-B01M4-1..5 = CONFIRMED`  
**Trạng thái:** `OWNER_DECISIONS_RECORDED / DESIGN_REGRESSION_PENDING`  
**Phạm vi phê duyệt:** Quyết định nghiệp vụ, **không** xác nhận 11 L4 ứng viên hoặc 96 test thiết kế là sản phẩm đã kiểm thử; không cấp stable L4 IDs, không merge hoặc sửa Blueprint canonical.

## A. Năm quyết định Owner

| ID | Nội dung được Owner chốt | Contract và ranh giới |
|---|---|---|
| **B01-PS-OD-01 / OQ-B01M4-1** | **Theo đề xuất:** `F04-G06-M01` quản lý đề xuất và quy trình phê duyệt thay đổi; `F04-G01-M01` sở hữu việc ghi **plan baseline phiên bản mới** sau khi các điều kiện hợp lệ đã thỏa; `F04-G06-M02` quản lý lịch sử lý do/người yêu cầu/người duyệt. | Không sửa baseline khi proposal chưa approved hoặc chưa có quyền. Commit phải kiểm version/idempotency, revalidate authorization, plan lock và validation status. Access Policy sở hữu authorization; Balanced Planning sở hữu validation; Plan Structure không tự phê duyệt. |
| **B01-PS-OD-02 / OQ-B01M4-2** | **Bổ sung/nhắc lại quyết định trước:** Nếu phụ huynh chưa định nghĩa Family Standard Bar, ứng dụng **fallback về App Default Standard Bar thích hợp theo tuổi/bối cảnh**. Kế hoạch **được lưu draft ngay cả khi không đáp ứng Standard Bar**. | Không đánh đồng `DRAFT_SAVED` với `BALANCED`, `VALIDATED` hay `ACTIVE`. Draft chưa đạt chuẩn phải hiển thị vi phạm và hướng xử lý; việc commit/activate chỉ được diễn ra sau khi đáp ứng policy/gates, trừ ngoại lệ soft-cap hợp lệ được phê duyệt. Nếu App Default Standard Bar không có phiên bản hợp lệ/đủ bằng chứng, ghi `UNKNOWN/UNVERIFIABLE` cho phần liên quan, không tự dùng giá trị ví dụ làm chuẩn. Không vượt `protected_hard_cap`. **Không** biến câu trả lời này thành quy định “không có Family Bar thì không thể tạo lịch”. |
| **B01-PS-OD-03 / OQ-B01M4-3** | **Theo đề xuất:** Một mode cho mỗi trẻ (không phải per-family/per-plan); quyền lập/sửa lịch: `PARENT_LED` — trẻ không tạo/sửa lịch có hiệu lực, chỉ có thể trao đổi nguyện vọng; `CHILD_EXECUTED` — trẻ tạo proposal/draft và phụ huynh duyệt; `CHILD_DIRECTED` — trẻ tự điều chỉnh trong phạm vi được ủy quyền, phụ huynh có quyền overwrite/lock. | Không dùng tuổi cứng làm tiêu chuẩn duy nhất; capability/ủy quyền cần kiểm riêng. Mode quản quyền lịch, không vô hiệu hóa Child Journal, emotional check-in, quyền trao đổi hoặc quyền chủ thể. `F01-G05-M01` lưu mode; Access Policy quản grants; F04 quản mutation/approval. |
| **B01-PS-OD-04 / OQ-B01M4-4** | **Owner làm rõ:** Phụ huynh/Primary Caregiver là người có quyền quản lý lịch cao nhất **đối với trẻ chưa tự quản**. `LOCK` = **không cho chỉnh sửa thời khóa biểu hiện tại** cho tới khi người có quyền unlock; phụ huynh có thể overwrite/lock/unlock theo policy. | Khi locked, trẻ (kể cả Child-directed), Supporter và mọi mutation thiếu quyền unlock đều không thể thay đổi lịch effective, kể cả API offline/stale/retry. Parent muốn sửa lịch đã khóa phải **unlock trước** hoặc dùng luồng `authorized override` có audit và version, không silent bypass. `LOCK` không đồng nghĩa khóa toàn bộ hồ sơ/mục tiêu/Journal hoặc cấm xem lịch; draft/proposal có thể tồn tại theo policy nhưng không commit vào lịch khóa. Lock cần scope, actor, time, version, audit; cơ chế nhắc review có thể thiết kế, **chưa chốt thời hạn khóa tối đa**. Caregiver authority không vượt `protected_hard_cap`, policy an toàn hoặc quyền tự quản của chủ thể 18+ đã xác minh. Plan lifecycle `Draft/Active/Paused/Completed/Archived` không được tự xóa tasks; import bên ngoài không tự vào MVP. |
| **B01-PS-OD-05 / OQ-B01M4-5** | **Theo đề xuất:** Một plan có **một chủ thể chính** (một trẻ hoặc người trưởng thành tự quản). Hoạt động gia đình chung được tham chiếu từ nhiều plan; không cần plan chung đa chủ thể ở giai đoạn đầu. Kế hoạch khám phá sử dụng cùng Plan Structure, có thể liên kết **exploration topic** thay cho mục tiêu thành tích đã duyệt nếu phù hợp. | Không tạo engine hướng nghiệp riêng. Giữ ownership, scope, allocation/evidence rõ khi activity chung. `GOAL_ORIENTED` và `EXPLORATION_ORIENTED` tái sử dụng một lifecycle/plan model, chỉ mở extension cần thiết. |

## B. Trace với các quyết định trước đó

- **P6-BP-OD-03 / OQ-3C:** App Default Standard Bar có hiệu lực khi family chưa có custom bar; `B01-PS-OD-02` làm rõ việc **draft vẫn được lưu khi plan không đạt bar**, nhưng chưa phải approved/active.
- **P6-BP-OD-01/02:** Cùng scope/constraint/purpose của soft-cap phải có gap ≥7 ngày trống; cùng constraint không kéo quá 60 ngày liên tục qua đổi purpose; protected hard cap không bị bypass.
- **B01-MS-OD-01..04:** Mỗi trẻ một mode, Parent-led quyền lịch như mode mặc định, Child-executed có đề xuất, Child-directed commit trong delegation; quyền của người lớn tự quản không bị phụ huynh ghi đè.
- **P6-AP-OD-01..05 & B01-CL-OD-01..04:** Primary Caregiver chỉ là role app cấp gia đình, quyền plan scope phải được kiểm tra; consent lịch sử không tự tạo access; Journal private.
- **B01-PA-OD-04:** Chỉ sử dụng dữ liệu cá nhân thật của trẻ khi căn cứ pháp lý phù hợp đã được xác định; thiết kế/test bằng dữ liệu giả.

## C. Regression & acceptance cần chạy lại

1. Child draft không đạt Standard Bar được **save** và hiện unmet constraints, nhưng `commit` khi protected hard cap bị vi phạm phải bị từ chối.
2. Không có Family Bar -> chọn App Default Bar đúng age/context/version; nếu không có app default verified thì `UNKNOWN/UNVERIFIABLE`, nhưng có thể giữ draft.
3. Child-directed sửa timetable bị locked -> deny, kể cả stale sync/offline/race; Primary unlock rồi commit hợp lệ theo version hoặc authorized override có audit.
4. Parent-led child muốn thay đổi giờ -> communication/request intent không tự biến thành active schedule mutation. Child-executed có draft/proposal và cần caregiver approval.
5. Bàn giao Primary Caregiver -> giữ plan/mode, recheck quyền actor mới trước overwrite/lock.
6. AI output không thể tự trở thành baseline; Change Requests approved chưa đủ nếu commit version/validation/authorization thất bại.
7. Một plan một primary subject; shared family activity tham chiếu nhiều plan nhưng không vô tình ghi đè/bị double-owned.
8. EXPLORATION_ORIENTED chấp nhận exploration topic; re-use plan lifecycle, không duplicate career engine.
9. Plan archived/paused vẫn giữ historical audit và references, không silently erase task.
10. Không có dữ liệu Journal được phép mà AI vẫn đọc để tạo plan -> deny.

## D. Bằng chứng và issues chưa đóng

- Hồ sơ đầu vào do Owner cung cấp: `B01_F04-G01-M01.zip` (không commit vào Git trong thay đổi này).
- Theo báo cáo Claude được trình trong Owner Review: **11 L4 ứng viên, 96 test thiết kế, 27 findings** (14 fixed, 7 chờ Owner nhóm thành 5 OQ, 4 research, 2 open), Validator cuối 0 errors/1 warning, cross-module 31 consistent/3 partial, mutation checks 11/11. **Các số liệu là agent-reported design-level findings**, không phải app tests.
- **F-023:** thiếu ba test hồi quy; **F-027:** chưa trace đủ acceptance criteria tới từng điều kiện Commit Gate; phải sửa và revalidate.
- **9/11 L4** được báo có phụ thuộc ownership decisions; cần map từng L4/AC/test tới 5 quyết định trước khi bảo đảm final consistency.
- Execution Evidence có timestamp bất thường và token lũy kế chưa đối soát; chỉ dùng là self-reported runtime evidence, không tự suy ra usage billing.
- Nghiên cứu Standard Bar nguồn/độ tuổi, constraints hard/soft theo grade/context, legal basis và data safety còn mở.
- Child lock duration, quyền sửa khi locked, lịch sử override và mối quan hệ giữa plan lock với schedule lock cần tests chi tiết; không tự đặt global lock max.
- **Không tự đóng các 7 Owner findings** chỉ vì OQ đã chốt; phải rerun test/contract mapping và re-review.

## E. Trạng thái & handoff

`B01_MODULE_04_EXECUTED`  
`B01_MODULE_04_OWNER_DECISIONS_RECORDED`  
`B01_MODULE_04_FINAL_REGRESSION_PENDING`  
`B01_MODULE_05_F04-G06-M01_NEXT`

Claude Code: chỉ thiết kế/test/critical review; **tối đa 3 sub-agent Sonnet 5.5** nếu khả dụng, Coordinator giữ model hiện tại; không sửa Git/Decision Log. ChatGPT quản lý GitHub và Owner Review. PR #17 còn Draft, không merge; không sửa canonical, không cấp stable L4 IDs.
