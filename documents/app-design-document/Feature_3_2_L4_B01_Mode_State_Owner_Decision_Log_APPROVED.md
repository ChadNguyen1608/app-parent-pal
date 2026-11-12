# Parent-Pal — Batch 01 / Module 02: Mode State — Owner Decision Log

**Ngày:** 2026-11-12  
**Module:** `F01-G05-M01` — Mode State  
**Trạng thái:** `OWNER_BUSINESS_DECISIONS_RECORDED / REGRESSION_PENDING`  
**Phạm vi:** Quy tắc nghiệp vụ về autonomy đối với **lập và điều chỉnh lịch/kế hoạch của trẻ**, không xác nhận 2 L4 ứng viên là final, không thay Blueprint canonical hoặc cấp stable L4 IDs.

## 1. Owner decisions

| ID | Owner chốt | Diễn giải được phép dùng cho thiết kế |
|---|---|---|
| `B01-MS-OD-01` / OQ-B01M2-1 | **Mỗi trẻ có mode riêng** (ví dụ trẻ lớp 8 và trẻ lớp 2 có thể khác nhau). | Một `effective_autonomy_mode` cho **mỗi child profile** ở thời điểm hiệu lực, áp dụng chung cho các kế hoạch/hoạt động thuộc child này; **không** một mode chung của gia đình và **chưa** cho per-plan mode riêng. Quyền chi tiết theo scope/plan vẫn kiểm qua Access Policy. Age/capability gợi ý nhưng không tự chuyển mode. |
| `B01-MS-OD-02` / OQ-B01M2-2 | **Ba mức quyền đối với lịch trình:** (1) mặc định trẻ không có quyền sắp xếp/điều chỉnh; (2) trẻ được đề xuất, tạo draft để bố mẹ duyệt; (3) trẻ tự điều chỉnh lịch, bố mẹ được `overwrite` và `lock`. | Map vào ba mode hiện có: `PARENT_LED` = parent controls schedule (không có permission mutate schedule của trẻ); `CHILD_EXECUTED` = child creates proposal/draft, caregiver approves before commit; `CHILD_DIRECTED` = child may commit changes within delegated constraints, caregiver can overwrite/lock plan/schedule scope. Giữ đúng bất biến: quyền tự thực hiện task đã duyệt, quyền hỏi/trao đổi với AI, quyền báo cáo cảm xúc và quyền Journal **không bị xóa vì “không có quyền sắp xếp lịch”**. Quy tắc này áp dụng cho `schedule_planning_authority`, không tuyên bố trẻ không có bất kỳ quyền gì trong app. `lock` phải scope, owner, duration, version, reason (nếu cần) và audit; không cho AI tự lock/overwrite. |
| `B01-MS-OD-03` / OQ-B01M2-3 | Theo đề xuất: **Access Policy sở hữu delegated permissions**, Mode State chỉ lưu/resolve mode. | F01-G04 authorization contract và delegated grant; F01-G05-M01 effective state/version; F01-G05-M02 process transition; F04-G06 plan change approval; không nhân bản quyền ủy quyền trong Mode State. Khi change caregiver/permission/version, kiểm tra lại authorization; mode không cấp quyền Journal. |
| `B01-MS-OD-04` / OQ-B01M2-4 | Theo đề xuất: mode ban đầu `UNSET` nhưng quyền lịch như `PARENT_LED`; đổi caregiver giữ mode hiện tại. | `UNSET` là trạng thái nội bộ chưa xác nhận, **không phải một autonomy mode sản phẩm thứ tư**. Tất cả thao tác lịch chưa được ủy quyền: fail-closed; phụ huynh có thể chọn/chuyển mode theo quyền. Chuyển Primary Caregiver không tự reset mode, chỉ re-evaluate rights. Với chủ thể 18+ đã xác minh tự quản, adult policy riêng có ưu tiên hơn child mode. |

## 2. Các giới hạn cần giữ nguyên từ tài liệu trước

- Quyết định 2.3: mỗi trẻ có một mode chung cho các hoạt động, chỉ phụ huynh có quyền được chuyển child mode; trẻ có thể trình bày nguyện vọng nhưng không tự commit chuyển mode.
- P6 Access OQ-1..5: chỉ một family Primary Caregiver đang hiệu lực, Primary Manager theo plan scope được kiểm tra riêng; Child-directed có bounded delegation; adulto 18+ tự quản.
- B01 Consent Ledger OQ-1..4: Parent App có thể khởi tạo plan trước khi Child App link; Child App cần liên kết hợp lệ mới truy cập chương trình; consent caregiver vs Journal share/assent khác quyền; chuyển caregiver không tự vô hiệu hóa consent lịch sử.
- `PARENT_LED` không có schedule mutation permission cho trẻ nhưng không làm mất các quyền cơ bản của trẻ như private journal, đề đạt ý kiến, báo cáo trạng thái/safety.
- Overwrite/lock là khả năng của người có quyền **đối với lịch**, không bao gồm quyền xem/chỉnh sửa Child Journal. Phải bảo vệ hard-cap, policy, audit và xử lý conflict, không cho vượt giới hạn an toàn.

## 3. Regression cần đánh dấu khi triển khai L4 và module liên quan

1. Hai trẻ cùng gia đình có effective mode khác nhau; cập nhật mode trẻ A không thay trẻ B.
2. Một trẻ có nhiều plan: mode chung nhưng quyền thao tác từng plan phụ thuộc scope, không tự biến thành per-plan mode.
3. `UNSET` cư xử như `PARENT_LED` đối với thay đổi lịch, không chặn trẻ dùng các chức năng ngoài quyền lập lịch theo permission riêng.
4. Ở mode 1, trẻ không thể submit/commit schedule change bằng API; nhưng vẫn có thể biểu đạt nhu cầu/lý do với người lớn hoặc AI theo workflow độc lập (không tự thành draft có hiệu lực).
5. Mode 2: child tạo draft; caregiver có quyền approve/reject; chưa duyệt thì không thay live schedule.
6. Mode 3: child commit trong delegated constraints; caregiver overwrite/lock có scope/version/audit, lock ngăn commit của trẻ cho đến khi người có quyền unlock, và không vi phạm protected hard-cap.
7. Child offline/stale mode khi caregiver overwrite/lock: server revalidates, conflict/fail-closed, không silent overwrite của child.
8. Child mode không auto cấp quyền Journal, không mất quyền rút chia sẻ Journal.
9. Child 18+ có adult self-managed policy, không mặc định tiếp tục parent overwrite.
10. Owner transition giữ mode, nhưng delegated permissions/revocation phải recheck.
11. `F01-G05-M02` là module process chuyển mode, `F01-G05-M01` chỉ commit state hợp lệ/resolve effective state.

## 4. Evidence, unresolved items và ranh giới chấp thuận

Hồ sơ Claude được Owner cung cấp: `B01_F01-G05-M01.zip`. Theo báo cáo trình trong Owner Review: **2 L4 ứng viên**, **59 test thiết kế**, **18 findings** (11 fixed, 5 owner items nhóm thành 4 questions, 2 research), final validator **0 error/0 warning**, cross-module 23 consistent + 2 partial, mutation check 11/11. Số liệu thuộc **báo cáo thiết kế**, chưa phải app test; ZIP chưa được đưa vào repository. Những findings gắn OQ cần map→test→artifact và re-review trước khi đóng.

**Bắt buộc cần xử lý tiếp:**
- Thay các giả định quyền `PARENT_LED` trước đó bằng business scope chính xác: *không có quyền lập/sửa lịch*, **không** phải mất toàn bộ quyền trong ứng dụng.
- Test `CHILD_DIRECTED` caregiver overwrite/lock, xung đột phiên bản, thời hạn lock/scope và revocation.
- `UNSET` fallback vs explicit mode.
- 2 regression partial, tài liệu quyết định 2.3 chưa có trace đầy đủ ở source manifest (trace gap).
- Việc trẻ có thể **đề đạt nguyện vọng** ở mode 1 không tự biến thành chức năng **tạo schedule draft** của mode 2. Nếu triển khai cần ranh giới UI/API rõ.
- `F01-G05-M02` Mode Transitions chưa được chạy trong batch này; để kiểm chứng interface khi module đó được chọn.

## 5. Trạng thái và phân công

`B01_MODULE_02_OWNER_DECISIONS_RECORDED`  
`B01_MODULE_02_FINAL_REGRESSION_PENDING`  
`B01_MODULE_03_F07-G06-M01_NEXT`

Claude Code: chỉ chạy design/review, tối đa 3 subagents Sonnet 5.5 nếu khả dụng, Coordinator ưu tiên Sonnet 5.5; xuất ZIP, không chỉnh Git/Decision Log. ChatGPT quản lý hồ sơ và trình Owner. Không merge PR #17, không sửa canonical.

## 6. Change Log

- `B01-MS-OD-01..04`: ghi bốn lựa chọn Owner.
- `B01-MS-REG-01`: phân biệt quyền lịch trình với quyền chung trong app.
- `B01-MS-REG-02`: caregiver overwrite/lock và `UNSET` fail-closed.
