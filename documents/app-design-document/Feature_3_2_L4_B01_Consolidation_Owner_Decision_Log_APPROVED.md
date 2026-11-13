# Parent-Pal — Batch 01 Consolidation — Owner Decision Log

**Ngày:** 2026-11-13  
**Nguồn:** `B01_Consolidation.zip` do Product Owner cung cấp; Owner Review sau C0–C5.  
**Owner decisions:** `OQ-B01C-1..8 = CONFIRMED`  
**Trạng thái:** `BUSINESS_DECISIONS_RECORDED / TARGETED_REMEDIATION_REQUIRED / FINAL_REGRESSION_OPEN`  
**Phạm vi:** Bổ sung 8 business decisions, **không** chốt 25 L4 entry, không chứng nhận xử lý dữ liệu thật, không tự đóng 46 findings hoặc 9 HIGH regression gaps, không cấp stable IDs, không merge PR #17.

## 1. Quyết định Owner được chốt

| ID | Quyết định Owner | Ràng buộc và test bảo vệ |
|---|---|---|
| **B01-C-OD-01 / OQ-B01C-1** | **KHÁC đề xuất trước: Khi chuyển Primary Caregiver, giữ nguyên các quyền tự điều chỉnh lịch đã cấp cho trẻ; KHÔNG tự động tạm ngưng hoặc buộc Caregiver mới xác nhận lại.** | Giữ mode, lịch, grants ủy quyền hợp lệ, scope và lịch sử. Caregiver mới có thể điều chỉnh, thu hồi hoặc lock lịch về sau theo policy. Tại mỗi mutation, hệ thống **vẫn** thực hiện fresh authorization/purpose/consent/lock/version/balance checks. Giữ grant hợp lệ **không** đồng nghĩa replay approval cũ của một Change Request: quy tắc B01-CR-OD-02 về CR đã duyệt/chưa áp dụng cần reapprove sau caregiver handover vẫn giữ nguyên, trừ khi Owner quyết định thay đổi riêng. Không cho một grant thiếu hiệu lực pháp lý hay bị thu hồi tiếp tục chỉ vì đã được lưu lịch sử. |
| **B01-C-OD-02 / OQ-B01C-2** | **C — Trẻ chọn có gửi thông báo khi dừng chia sẻ Journal hay không, mặc định KHÔNG gửi thông báo riêng.** | Mọi caregiver access đến Journal bị chặn ngay sau revoke, kể cả derived data không được phép; lựa chọn notification không ảnh hưởng hiệu lực thu hồi. Không leak nội dung Journal trong thông báo hoặc log; UI/UX xử lý tình huống phụ huynh truy cập phải phản ánh quyền hiện hành mà không suy ra nội dung riêng tư. Luồng hỗ trợ an toàn được ủy quyền tuân theo policy riêng. |
| **B01-C-OD-03 / OQ-B01C-3** | **A — Change Request đã duyệt nhưng chưa áp dụng có hiệu lực tối đa 7 ngày kể từ thời điểm được phê duyệt.** | Tự vô hiệu trước hạn nếu plan version/context, lock, caregiver, quyền, mode hoặc validation thay đổi theo policy. Phân biệt với `pending CR` hết hạn sau 7 ngày **kể từ submit** (B01-CR-OD-04); cần kiểm tra server clock, expiry boundary và idempotency. `APPROVED != APPLIED`. |
| **B01-C-OD-04 / OQ-B01C-4** | **A — `F04-G02-M03` Balanced Planning sở hữu thời hạn và nhắc khôi phục ngoại lệ soft-cap.** | Module F04-G06 quản workflow request; F04-G01 lưu plan/refs; Balanced Planning sở hữu constraint/exception validity, notification scheduling policy và expiration contract, không nhân đôi logic trong Plan Structure hoặc CR. Giữ 60-day and >=7-full-gap rules, no protected hard-cap override. |
| **B01-C-OD-05 / OQ-B01C-5** | **A có bổ sung — Lock lịch KHÔNG có thời hạn tối đa cố định; KHÔNG tự động mở khóa vì hết thời gian. App nhắc phụ huynh xem xét định kỳ.** | Lock = effective timetable cannot be edited trừ authorized unlock/override có audit; duration/reminder cadence chi tiết là technical/UX proposal chưa chốt. Review reminder không được auto-unlock; safety limits và adult 18+ authority không bị bỏ qua. |
| **B01-C-OD-06 / OQ-B01C-6** | **A — Khi thời khóa biểu locked vẫn được tạo/chỉnh sửa draft hoặc chuẩn bị offline; KHÔNG được commit làm thay đổi timetable có hiệu lực.** | Khi sync phải kiểm tra lại actor/rights/lock/version/Standard Bar; bản nháp offline không tự ghi đè. Parent-led vẫn không có quyền tạo official schedule CR; draft flow cần mode/scope permission. |
| **B01-C-OD-07 / OQ-B01C-7** | **B — F07 sở hữu policy và governance của audit log chung; hạ tầng cung cấp cơ chế thu thập/lưu log dùng chung.** | F07 governance quy định events, retention, access/PII minimization, integrity; infrastructure triển khai append-only/observability theo architecture, không yêu cầu thiết kế ngay module L3 mới. Audit không được ghi lộ Journal/private data. Ownership feature/domain cần mapping khi consolidation; không giả định F07-G06-M01 sở hữu toàn bộ audit infrastructure. |
| **B01-C-OD-08 / OQ-B01C-8** | **A — Trẻ Parent-led trao đổi nguyện vọng thay đổi lịch qua AI communication trong F05; F04 chỉ tiếp nhận change request chính thức khi workflow/quyền cho phép.** | Nguyện vọng không tự biến thành CR hay plan mutation. AI chỉ hỗ trợ diễn đạt/thảo luận, không tự phê duyệt; nếu có handoff tới F04 thì phải kiểm tra mode/current authorization. Bảo vệ Child Journal/privacy boundary. |

## 2. Mối quan hệ với các quyết định đã có

- **B01-C-OD-01** là **override của đề xuất chưa được Owner chấp thuận** trong Consolidation Owner Review, **không** thay đổi B01-MS-OD-01 (mode per child) hay B01-PS-OD-04 (parent lock). Khi thay caregiver: delegated grant hợp lệ không auto-suspend; nhưng actor thực hiện mutation luôn reauthorize; approved-not-applied CR vẫn theo B01-CR-OD-02 là cần reapproval.
- **B01-C-OD-02** bổ sung lựa chọn thông báo, **không** thay quyền revoke/share Journal trong B01-CL-OD-04 và B01-PA-OD-03.
- **B01-C-OD-03** là thời hạn thứ hai: pending 7 ngày **từ submit** và approved-not-applied 7 ngày **từ approval**.
- **B01-C-OD-05/06** làm rõ lock không hủy quyền lưu draft và không tự unlock.
- **B01-C-OD-07** là phân công governance/infrastructure, không mở scope cho mục đích dữ liệu chưa duyệt.
- **B01-C-OD-08** giữ Parent-led khỏi official Change Request nhưng cho phép trao đổi ý nguyện.

## 3. Consolidation report (self-reported; không phải app execution)

Theo Owner Review: ZIP `B01_Consolidation.zip` có 73 mục, no CRC errors; design L4: 28 original entries → 25 consolidated entries (24 effective parts theo báo cáo), test: 395 → 392 sau deduplication; 34/34 Owner decisions traced nhưng 1 full, 27 partial, 2 conflicting, 4 out-of-scope; 114 findings; 46 spec-remediation pending; 9 HIGH regression gaps; 17 tests proposed; 59/64 P5 baseline matched by ID; validator 0 errors/warnings, mutation 15/15. Các con số cần được đối chiếu với evidence khi Targeted Remediation, không nhận là các test app đã chạy.

**Known errors phải sửa không hỏi lại Owner:**
- Purpose Access: `LEGAL_UNKNOWN` không được cho xử lý dữ liệu cá nhân thật của trẻ; không dùng flag LOW-risk để bypass lawful basis.
- Change Requests: protected hard-cap proposal có thể lưu/gửi để thảo luận, **không thể APPROVE/APPLY** khi vi phạm.
- Parent-led official CR, age hard block, lock interpretation; ownership/approval/commit/version và consent/purpose/access must reflect latest approved logs.

## 4. Targeted Remediation — yêu cầu thực hiện trước Batch 02

1. Đọc toàn bộ 8 Owner Decisions trong file này, mapping từng OQ → impacted findings → L4 acceptance criteria → test/trace.
2. Sửa spec contracts, giải quyết 2 contradictory AC và HIGH gaps. Các quyền chuyển caregiver phải theo **B01-C-OD-01 giữ quyền ủy quyền**.
3. 46 findings cần technical remediation/owner mapping, 17 tests đề xuất, 59/64 baseline P5 missing five ID và 9 partial semantics; phân loại `RESOLVED / OPEN / RESEARCH / OUT_OF_SCOPE` bằng evidence.
4. Rà soát ownership F07 audit governance, F05 communication, Standard Bar soft cap reminders.
5. Không tự phê duyệt 25 L4 entries hoặc nâng sang canonical. Owner Review riêng cho thay đổi product mới thực sự phát sinh.

## 5. Trạng thái

`B01_CONSOLIDATION_OWNER_OQ1_TO_OQ8_CONFIRMED`  
`B01_TARGETED_REMEDIATION_PENDING`  
`B01_NEXT_BATCH_DESIGN_NOT_AUTHORIZED_YET`

Claude: đọc GitHub (source), xuất ZIP; max 3 sub-agent Sonnet 5.5 nếu khả dụng, Coordinator giữ model hiện tại; không commit/merge, không sửa canonical. ChatGPT ghi những quyết định được Owner xác nhận vào PR #17.
