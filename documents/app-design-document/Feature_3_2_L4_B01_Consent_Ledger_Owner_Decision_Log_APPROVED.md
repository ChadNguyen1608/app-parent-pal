# Parent-Pal — Batch 01 / Module 01: Consent Ledger — Owner Decision Log

**Ngày:** 2026-11-12  
**Module:** `F01-G04-M02` — Consent Ledger  
**Owner:** Đã trả lời OQ-B01-1..4.  
**Trạng thái:** `OWNER_BUSINESS_DECISIONS_RECORDED / DESIGN_REGRESSION_PENDING`.  
**Phạm vi:** Chính sách sản phẩm; **không** xác nhận tính hợp pháp của mọi cách xử lý dữ liệu, không phê duyệt stable L4 IDs, 62 test thiết kế, hay đóng các findings của Claude.

## 1. Bốn quyết định Owner

| ID | Lựa chọn thực tế của Owner | Diễn giải thực thi và ranh giới |
|---|---|---|
| **B01-CL-OD-01 / OQ-B01-1** | **Phụ huynh tự khai, không bắt xác minh tư cách giám hộ trong onboarding thông thường.** Child App phải **ghép nối/xác thực liên kết ID với Parent App** trước khi trẻ tiếp cận chương trình do phụ huynh đề ra. | Phân biệt **identity linking** (ghép đúng tài khoản/thiết bị với gia đình) với **legal authority verification** (tư cách có thẩm quyền đồng ý). Việc ghép nối không tự chứng minh thẩm quyền hợp pháp; consent có thể ghi nhận `SELF_DECLARED`/unverified trong các trường hợp thích hợp. Những nghiệp vụ bắt buộc xác minh theo pháp luật/chính sách rủi ro vẫn cần gate riêng. Không để người lạ biết một ID là tự liên kết/chiếm tài khoản; cần one-time invitation/code, expiry, approval, revocation, audit, re-link/recovery, chống account takeover. Không biến yêu cầu link Child App thành điều kiện khiến Parent App không thể khởi tạo kế hoạch trước khi trẻ tham gia. |
| **B01-CL-OD-02 / OQ-B01-2** | **Chỉ Primary Caregiver có quyền thu hồi caregiver-managed consent** trong family workflow của ứng dụng. | Quyền thao tác của **Supporter/Observer** không bao gồm `revoke caregiver consent`. Phải kiểm tra actor/caregiving role/scope/version tại thời điểm commit. **Giới hạn rất quan trọng:** quy tắc này **không vô hiệu hóa** quyền trẻ dừng chia sẻ Journal và thu hồi assent của chính trẻ; không loại bỏ quyền của chủ thể dữ liệu/người có thẩm quyền khác khi pháp luật yêu cầu. Trường hợp yêu cầu thu hồi từ người không phải Primary: không tự cho họ revoke trên hệ thống, ghi nhận dispute/request theo quyền tối thiểu và xử lý qua luồng riêng phù hợp thay vì xóa im lặng. |
| **B01-CL-OD-03 / OQ-B01-3** | Khi chuyển Primary Caregiver từ mẹ sang bố, **giữ nguyên consent đã ghi nhận do mẹ cấp**; bố, với quyền Primary mới, có thể tự thay đổi hoặc thu hồi sau đó. | Không auto revoke/auto reconfirm chỉ vì thay Primary. Giữ provenance `granted_by=mother`, identity, timestamps, policy version; bố không được sửa lịch sử cũ mà phải tạo event/version mới. Không tự cấp thêm scope, mục đích hay dữ liệu. Nếu consent hết hạn, bị thu hồi hoặc không còn hợp lệ do thay đổi căn cứ/pháp luật, engine vẫn phải chặn xử lý dựa trên bản ghi đó: **historical continuity != guaranteed legal validity**. Đây là sự tinh giản so với đề xuất `REVIEW_REQUIRED` mặc định ở Access P6 OQ-2; cần trace xung đột/clarification: việc bàn giao **không tự kích hoạt reapproval**, nhưng quyền hiện tại luôn được re-evaluate theo policy. |
| **B01-CL-OD-04 / OQ-B01-4** | **Chỉ Child Journal là private tuyệt đối theo thiết kế hiện tại**; dữ liệu ngoài Journal được chia sẻ/hiển thị trong khuôn khổ quyền gia đình và chính sách đã chốt. Nếu trẻ rút quyền chia sẻ Journal thì phụ huynh **không được đọc Journal** nữa. | Tách `child_journal_share_grant/assent` khỏi `caregiver-managed consent`. Trẻ chủ động tắt chia sẻ, việc đọc mới bị chặn ngay sau hiệu lực; không yêu cầu Caregiver phải approve hoặc revoke thay. Không tiếp tục chia sẻ bản tóm tắt/derived insight có thể truy ngược Journal; xử lý bản sao đã chia sẻ và retention/deletion theo chính sách hiện hành, không hứa xóa ngay dữ liệu từ máy người nhận. Dữ liệu ngoài Journal **không có nghĩa public/accessible to anyone**: vẫn cần role, purpose, scope, need-to-know, và bảo vệ thông tin nhạy cảm/an toàn theo policy. |

## 2. Invariants & test regression bắt buộc

1. Parent App có thể tạo plan trước khi child link; Child App không thể truy xuất/execution chương trình của gia đình khi chưa link hợp lệ.
2. Invitation/code ngắn hạn, kiểm soát sai ID, link nhiều trẻ/nhiều parent, re-link, lost device, duplicate link, revocation và chống takeover; không mặc định thiết bị liên kết = legal verification.
3. Supporter cố thu hồi caregiver consent → deny; Primary hợp lệ thu hồi → versioned event + audit; past grant không được mutate/delete.
4. Child tự tắt Journal sharing → parent read ngay sau đó deny, kể cả cache/search/summary mới; xử lý retention/deletion khi liên quan theo policy riêng.
5. Đổi Primary mother→father → bản consent lịch sử không đổi; chỉ new Primary có thể tạo event revocation/change; **không** tăng quyền Journal hoặc biến self-declared thành legal-verified.
6. Consent có thể còn record `ACTIVE` nhưng hành vi xử lý vẫn bị chặn nếu thiếu lawful basis/authority/purpose/permission theo chính sách bắt buộc. `Consent recorded != authorized to process`.
7. Dữ liệu ngoài Journal vẫn không public; Supporter/Observer và AI chỉ tiếp cận theo giới hạn riêng.
8. Legal objection/restriction từ chủ thể khác không bị triệt tiêu vì chỉ Caregiver có UI action `revoke`; ghi issue cho legal/governance flow.

## 3. Kết quả Claude được báo cáo

Hồ sơ Owner cung cấp: `B01_F01-G04-M02.zip`, chưa lưu zip vào GitHub. Theo Owner Review và báo cáo agent được trình trong cuộc trao đổi: **6 L4 ứng viên**, **62 test thiết kế**, **21 findings** (12 fixed, 5 owner items quy thành 4 Owner questions, 3 research, 1 LOW open), Validator **0 errors, 7 warnings**, cross-module 17/17 consistency theo thiết kế. Đây không phải kiểm thử app. Các số liệu do Claude báo cáo, cần đối chiếu lại artifacts gốc trước khi dùng làm metric kiểm toán.

Issue còn mở:
- `F-021` — reference tới acceptance criterion đã `RETIRED` (LOW); phải sửa trace và rerun validator.
- 7 warning: phân loại cảnh báo thao tác read không state transition vs test còn pending Owner; cần re-evaluate theo bốn quyết định mới.
- Kiểm thử xung đột P6 Access OQ-2 (grant after handover) vs OQ-B01-3: tách `consent historical event`, `access grant`, `current authorization`. Quy tắc giữ event cũ không tự khẳng định access grant còn hợp lệ.

## 4. Các điểm chưa được suy diễn thành chính sách

- Đối tượng và hoạt động nào theo pháp luật Việt Nam cần xác minh thẩm quyền, yêu cầu đồng ý hợp lệ và quyền rút lại của chủ thể dữ liệu: `RESEARCH_REQUIRED`; quyết định giảm friction onboarding không thay kết luận pháp lý.
- Phạm vi `caregiver-managed consent` và `child-assent/journal-sharing` phải được đánh dấu rõ, không dùng một quyền `revoke_any_consent`.
- Chi tiết kỹ thuật invitation/device binding vẫn là đề xuất kiến trúc để đánh giá, **không** quyết định một giao thức xác thực cụ thể.
- Việc dữ liệu “ngoài Journal đều mở” được hiểu là **hiển thị có phân quyền trong gia đình theo thiết kế**, không phải truy cập công khai hoặc mọi bên nhận dữ liệu.

## 5. Trạng thái bàn giao

`B01_MODULE_01_OWNER_DECISIONS_RECORDED`  
`B01_MODULE_01_REGRESSION_AND_LEGAL_RESEARCH_OPEN`  
`B01_MODULE_02_F01-G05-M01_READY_TO_PREPARE`

Claude chỉ review/pilot và xuất ZIP; ChatGPT quản lý Decision Log/Git. Không sửa canonical, không tự chốt L4 IDs, không merge PR #17.
