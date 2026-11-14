# Sổ ràng buộc từ các quyết định đã duyệt (APPROVED)

- **Người soạn:** AI (Claude), chưa kiểm chứng độc lập. Không có agent phụ.
- **Ngày:** 14/11/2026.
- **Nguồn đọc:** toàn bộ 24 file có chữ `APPROVED` trong `documents/app-design-document/` (19 file `_APPROVED.md` và 5 file `_APPROVED_PROPOSAL.md`), cùng `Feature_3_2_L4_Owner_Decision_Register_INDEX.md`, `Feature_3_2_L4_Claude_Final_Report_Author_Remediation_Register_20261114_REVIEW.md`. Đối chiếu với `phase-3-scoring-audit/03_A_Lite_Workflow_Validation.md` và `07_Proposed_Change_Register.md`. Tham chiếu phụ: `documents/app/spec-phuong-an-a-app-android.md` (Plan A, chủ sản phẩm chốt 04/11), `CLAUDE.md`, `Feature_3_2_L4_Independent_Review_9aa4c8a_Disposition_REVIEW.md`.
- **Phạm vi:** chỉ ghi lại và đối chiếu. File này không sửa quyết định nào, cũng không đổi Feature ID.
- **Cách đọc số dòng:** `file:L<n>` là số dòng của file gốc, đếm bằng `nl -ba` trên bản đọc ngày 14/11/2026.

## 0. Tóm tắt

| Chỉ số | Số lượng |
|---|---|
| File APPROVED đã đọc | 24 / 24 |
| Dòng ràng buộc trong sổ (§2) | 124 (một số dòng gộp nhiều điều khoản của cùng một quyết định) |
| Mâu thuẫn hoặc ràng buộc bị thiếu so với A-lite v2 (§3) | 16 (C-01 … C-16) |
| `OWNER_CONFLICT` (§4) | 4 |
| Trạng thái mơ hồ (§5) | 9 (S-01 … S-09) |
| Cổng chặn phát hành hoặc chặn dùng dữ liệu thật (§6) | 7 |

**Viết tắt tên file** (mọi file đều nằm trong `documents/app-design-document/`):

| Mã | File |
|---|---|
| CONS | `Feature_3_2_Consolidation_Decision_Log_APPROVED.md` |
| L3R | `Feature_3_2_L3_Resolution_Decision_Log_APPROVED.md` |
| CR | `Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md` |
| GATE | `Feature_3_2_L4_B01_Conditional_Design_Baseline_Owner_Gate_APPROVED.md` |
| CL | `Feature_3_2_L4_B01_Consent_Ledger_Owner_Decision_Log_APPROVED.md` |
| B01C | `Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md` |
| MS | `Feature_3_2_L4_B01_Mode_State_Owner_Decision_Log_APPROVED.md` |
| PS | `Feature_3_2_L4_B01_Plan_Structure_Owner_Decision_Log_APPROVED.md` |
| PA | `Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md` |
| B02 | `Feature_3_2_L4_B02_Scope_Owner_Decision_APPROVED.md` |
| CAP | `Feature_3_2_L4_Capability_Standard_APPROVED.md` |
| L4C | `Feature_3_2_L4_Consolidation_Owner_Decision_Log_APPROVED.md` |
| FR01 | `Feature_3_2_L4_FR01_Parent_PIN_Unlink_and_Repairing_Owner_Decision_APPROVED.md` |
| METH | `Feature_3_2_L4_Methodology_Decision_Log_APPROVED.md` |
| OD | `Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md` |
| P5 | `Feature_3_2_L4_P5_Owner_Decision_Log_APPROVED.md` |
| AA | `Feature_3_2_L4_P6_Academic_Assessment_Owner_Decision_Log_APPROVED.md` |
| AP | `Feature_3_2_L4_P6_Access_Policy_Owner_Decision_Log_APPROVED.md` |
| BP | `Feature_3_2_L4_P6_Balanced_Planning_Owner_Decision_Log_APPROVED.md` |
| PkA…PkE | `Package_A…E_Decision_Log_3_2_APPROVED_PROPOSAL.md` |
| IDX | `Feature_3_2_L4_Owner_Decision_Register_INDEX.md` |
| REM | `Feature_3_2_L4_Claude_Final_Report_Author_Remediation_Register_20261114_REVIEW.md` |
| A3 | `phase-3-scoring-audit/03_A_Lite_Workflow_Validation.md` |
| A7 | `phase-3-scoring-audit/07_Proposed_Change_Register.md` |
| PLA | `documents/app/spec-phuong-an-a-app-android.md` |

**Loại ràng buộc:** permission (quyền), data (dữ liệu), safety (an toàn), legal (pháp lý), AI, UX, scope (phạm vi). Một dòng có thể thuộc nhiều loại; loại đầu tiên là loại chính.

**Cột "Quan hệ":** `SUP>` nghĩa là thay thế quyết định khác (có ghi rõ trong nguồn). `SUP<` nghĩa là bị quyết định khác thay thế. `CLAR` nghĩa là làm rõ. `CONFLICT` nghĩa là mâu thuẫn (xem §4). `—` nghĩa là không có.

## 1. Thứ bậc áp dụng do nguồn tự ghi

1. Owner log có ưu tiên hơn văn bản tác giả soạn sau đó (REM:L21).
2. Quyết định mới xung đột với quyết định cũ thì phải lập `CONFLICT/CHANGE_PROPOSAL`. Không ghi đè lịch sử (IDX:L71-72).
3. Gate 14/11 thay thế trạng thái `OWNER_GATE_PENDING / BATCH_02_NOT_AUTHORIZED` cũ (IDX:L103). B02 Scope thay thế trạng thái "B02 chưa duyệt" (IDX:L108).
4. FR-01 thay thế giả định cũ cho phép tự hủy liên kết không giới hạn (FR01:L44). Package B Q1 (`F06-G03-M03`) bị CON-D01 thay thế (CONS:L10).
5. 42 Owner decision của P6/B01 được giữ nguyên. Xung đột mới phải trình Owner chốt, không được âm thầm sửa (GATE:L11, B02:L32).

## 2. Sổ ràng buộc

### 2.1 Gói A–E và Consolidation 3.2 (trạng thái chung: `APPROVED_PROPOSAL`, chưa áp vào canonical)

| ID | Nguồn | Quyết định (diễn giải) | Feature ID | Loại | Trạng thái ghi | Quan hệ |
|---|---|---|---|---|---|---|
| CP-01 | PkA:L19 | Dùng chung roadmap và milestone cho học tập và khám phá nghề. F03 giữ mục tiêu, F04 thực thi | F03-G04-M03, F04-G01-M01 | scope | APPROVED_PROPOSAL | — |
| CP-02 | PkA:L20, L29-37 | Family Standard Bar có hard/soft cap. Preset chỉ là điểm khởi tạo. Không tính trùng giờ, tổng không quá 24 giờ. Hard cap chặn xác nhận. Cảnh báo một lần. Một nguồn cấu hình duy nhất. Giờ chơi được bảo vệ, chưa chốt % mặc định | F04-G02-M03, F04-G01-M01, F04-G02-M01, F02-G04-M01, F03-G02-M01 | UX / safety | APPROVED_PROPOSAL | — |
| CP-02-W | PkA:L42-46 | Thời tiết chỉ gợi ý đổi giờ hoặc hoạt động. Không âm thầm đổi Standard Bar hay mục tiêu | F02-G04-M01, F04-G02-M01 | UX | APPROVED_PROPOSAL | — |
| CP-03 | PkA:L21 | Ngoại lệ ôn thi phải có lý do, thời hạn, người duyệt, hết hạn rồi khôi phục. Khác với Bar dài hạn | F04-G06-M01/M02, F04-G07 | UX | APPROVED_PROPOSAL | Chi tiết hóa bởi P5-OD-02, BP-OD-01 |
| CP-04 | PkA:L22 | Lập kế hoạch thích ứng theo nguyên nhân. Không tự chẩn đoán, không tự thay mục tiêu quan trọng | F02-G06, F06-G04/G06, F04-G06 | AI / safety | APPROVED_PROPOSAL | — |
| CP-05 | PkA:L23 | Dữ liệu tuyển sinh phải có nguồn, năm, vùng. Bản cache trên web chưa phải bản đã duyệt | F07-G01/G02, F03-G05 | data | APPROVED_PROPOSAL | — |
| PkA-B1 | PkA:L50-53 | Không đưa Journal hay insight suy ra vào kế hoạch hoặc báo cáo khi không có quyền. Tách quan sát với giả thuyết. AI không kết luận trẻ hợp nghề | F05, F06, F03 | permission / AI | APPROVED_PROPOSAL | — |
| PkB-Q1 | PkB:L14 | Lập `F06-G03-M03` Academic Assessment | F06-G03-M03 | scope | APPROVED_PROPOSAL | **SUP<** CON-D01 |
| CP-06-6 | PkB:L36 | AI chấm bài chỉ ở prototype hoặc pilot có kiểm soát đến khi có benchmark. Không tự vào MVP | F06-G07-M01 | AI / scope | APPROVED_PROPOSAL | — |
| CP-06-4 | PkB:L34 | Chữ viết chỉ chấm "sạch" và "đều". Ảnh mờ thì `UNABLE_TO_ASSESS` | F06-G07-M01 | AI | APPROVED_PROPOSAL | — |
| CP-07 | PkB:L15, L45-54 | Tách 3 luồng: Private Journal, Authorized Feedback, Safety Escalation. Cấm suy luận gián tiếp làm lộ Journal. Xóa: ẩn ngay, xóa hẳn sau 60 ngày | F05-G04/G05/G06, F05-G06-M01, F07-G06-M01 | permission / data | APPROVED_PROPOSAL | Chi tiết hóa bởi PA-OD-03, L4C ODP-02 |
| CP-16 | PkB:L16, L68-70 | Cho nhập tay trước. Điểm phụ huynh nhập không được gắn nhãn "trường xác nhận". Thiếu nguồn giáo viên không có nghĩa là bình thường | F06-G01-M02, F04-G05-M02, F08-G01-M01/M02 | data | APPROVED_PROPOSAL | — |
| CP-17 | PkB:L17, L76-80 | Mở rộng F07-G05 Triage/Human Response. Khi người chăm sóc là nguồn căng thẳng thì không mặc định báo cho chính họ. Ngưỡng an toàn chưa được chứng nhận | F07-G05-M01/M02, F05-G01-M02 | safety | APPROVED_PROPOSAL | Human Response bị hoãn (REM:L43) |
| C-D01 | PkC:L11, L17 | Có Career Exploration. AI không gán "hợp/không hợp nghề" | F03-G05-M03, F03-G05-M01 | AI | APPROVED_PROPOSAL | — |
| C-D02 | PkC:L12 | Dùng lại Plan/Roadmap cho cả GOAL và EXPLORATION | F03-G04-M03, F04-G01-M01 | scope | APPROVED_PROPOSAL | Khớp PS-OD-05 |
| C-D03 | PkC:L13, L20 | `CACHED ≠ VERIFIED ≠ APPROVED`. Số liệu thị trường phải có nguồn | F07-G01/G02 | data / AI | APPROVED_PROPOSAL | — |
| C-D04 | PkC:L14, L22 | Ba cấp chia sẻ. Đăng công khai có điều kiện, không mặc định MVP. Phụ huynh đồng ý chưa đủ để vượt luật | F01-G04-M01, F04-G05-M02, F07-G04/G05/G06 | legal / scope | APPROVED_PROPOSAL | — |
| PkC-B | PkC:L21, L23 | Sản phẩm thử nghề không phải Journal. Người 18–23 tuổi tự quản dữ liệu | F03-G05, F01 | data / permission | APPROVED_PROPOSAL | — |
| D-D01 | PkD:L12 | Tách quyền lợi gói khỏi vòng đời thanh toán | F01-G06-M02/M03, F07-G07-M02 | scope | USER_APPROVED_L3_PROPOSAL | — |
| D-D02/D05 | PkD:L13, L16 | Có nhóm Education Finance (ngân sách, phê duyệt chi). Không thanh toán | F08-G06-M01/M02 | scope | USER_APPROVED_L3_PROPOSAL | — |
| D-D03 | PkD:L14 | Tách thành viên gia đình, quyền dữ liệu và quản trị thanh toán | F01-G02, F01-G04, F01-G06-M01, F07-G06 | permission | USER_APPROVED_L3_PROPOSAL | — |
| D-D04 | PkD:L15 | Gợi ý độc lập với quảng cáo và tài trợ | F08-G02, F08-G05 | UX | USER_APPROVED_L3_PROPOSAL | Bổ sung bởi OD-02 |
| D-D06 | PkD:L17 | Hoãn Wallet | (CP-13) | scope | USER_APPROVED_L3_PROPOSAL | — |
| PkD-P1 | PkD:L30 | Không thu hai gói riêng cho phụ huynh và con trong cùng một hành trình. Chưa chốt giá | F01-G06 | scope | USER_CONFIRMED_PRICING_REQUIREMENT | — |
| PkD-P2 | PkD:L68-73 | Người trả tiền không vì thế mà được xem Journal hay dữ liệu nhạy cảm. Quota không được chặn chức năng an toàn. Hạ gói không được xóa tiến độ | F01-G06, F07-G07-M02 | permission / safety | RECOMMENDED (phần nguyên tắc: confirmed) | — |
| E-D01 | PkE:L11, L21 | Điều phối đa phương thức dùng chung hạ tầng, nhưng kiểm quyền riêng cho Parent AI và Child AI | F07-G03-M03, F05-G01, F07-G04 | AI / permission | USER_APPROVED_L3_PROPOSAL | — |
| E-D02 | PkE:L12, L24 | Hybrid quota, chưa chốt con số. Tác vụ an toàn tối thiểu không bị quota chặn | F01-G06-M02, F07-G03-M02, F07-G07-M02 | AI / safety | USER_APPROVED_L3_PROPOSAL | — |
| E-D03 | PkE:L13, L26 | Thích ứng theo tuổi và nhu cầu tiếp cận. Phụ huynh không mặc định đọc dữ liệu của người 18–23 | F07-G07, F03-G03-M02, F04-G04-M02 | UX / permission | USER_APPROVED_L3_PROPOSAL | — |
| E-D04 | PkE:L14, L25 | Thông báo chung có phân loại. Kiểm quyền trước khi gửi. Bản xem trước không lộ Journal | F04-G07-M01/M02, F07-G07-M01 | permission / UX | USER_APPROVED_L3_PROPOSAL | — |
| PkE-V | PkE:L18-19 | Voice dài hạn (STT/TTS/realtime). Voice dùng để nhập Journal chỉ xử lý tạm, không lưu audio mặc định | F07-G03-M03, F05-G04-M01 | data / AI | APPROVED (chốt trước) | Xem C-12 |
| PkE-GAP | PkE:L34, L55-62 | E-GAP-01: bộ quy tắc định tuyến E0–E3 (kiểm quyền trước khi truy xuất, cache theo phân lớp, vô hiệu khi đổi consent) | F07-G03-M01/M02, F07-G04 | AI | **NEW_PROPOSAL** (chưa chốt) | Nguyên tắc được CON-D02/D03 nhận |
| CON-D01 | CONS:L10 | Lập `F06-G07-M01`. `F06-G03-M03` bị thay thế | F06-G07-M01 | scope | APPROVED_CONSOLIDATION_CHOICES / NOT_APPLIED | **SUP>** PkB-Q1 |
| CON-D02 | CONS:L11 | Định tuyến AI là policy spec của F07-G03-M01/M02. Không có Router thứ hai. M03 chỉ lo phương thức, không cấp quyền dữ liệu | F07-G03-M01/M02/M03 | AI | như trên | — |
| CON-D03 | CONS:L12 | Bốn lớp cache. `NO_CACHE` khác với xóa Journal | F07-G03 | data / AI | như trên (chưa có TTL) | — |
| CON-INV | CONS:L25-34 | Bất biến: F03≠F04≠F06; protected leisure; nộp bài≠chấm bài; Journal riêng, kiểm quyền trước khi truy xuất; Wallet hoãn; voice Journal không lưu mặc định; A0–A5 có biến thể; người trả tiền không mặc nhiên sở hữu dữ liệu | Nhiều | permission / data | như trên | — |

### 2.2 L3 Resolution và phương pháp L4

| ID | Nguồn | Quyết định (diễn giải) | Feature ID | Loại | Trạng thái ghi | Quan hệ |
|---|---|---|---|---|---|---|
| L3R1-D01 | L3R:L17 | Giữ 8 domain / 51 group / 106 L3. Không có L3 thứ 107 | toàn bộ | scope | OWNER_APPROVED / NOT_APPLIED | Xem S-06 |
| L3R1-D02 | L3R:L18, L30 | L4 chỉ được nhận khi đủ: kết quả, actor, quyền, lớp dữ liệu, biến thể tuổi, AC | toàn bộ | scope | OWNER_APPROVED | — |
| L3C-03 | L3R:L68 | Người trả tiền không có quyền dữ liệu. Không lộ Journal, kể cả gián tiếp | F05, F07 | permission | OWNER_APPROVED | — |
| L3C-05 | L3R:L70 | Kiểm quyền trước khi truy xuất hoặc tra cache. Cached không phải approved | F07-G03, F07-G06 | AI / permission | OWNER_APPROVED | — |
| L3C-06 | L3R:L71 | Thời lượng hoạt động chỉ tính một lần. Bảo vệ giờ chơi. Không âm thầm đổi mục tiêu hoặc Bar | F03, F04 | UX | OWNER_APPROVED | — |
| L3R-§2.4 | L3R:L31, L87 | Nhãn cohort chỉ là mẫu UX, không phải chính sách đồng ý. Đánh giá học tập cho trẻ 0–5 là tùy chọn, qua phụ huynh | F06-G07, F08-G06 | permission / legal | OWNER_APPROVED_AS_PROPOSAL | — |
| L3R-§2.6 | L3R:L33 | An toàn và quyền riêng tư là cổng phát hành, không phải phần làm sau | toàn bộ | safety / legal | OWNER_APPROVED | — |
| L3R-§5 | L3R:L117 | Journal riêng mặc định. Không lưu giọng nói thô. Xóa 60 ngày tùy khả thi pháp lý và kỹ thuật | F05-G06, F07-G06-M02 | data / legal | OWNER_APPROVED | Xem H4 (§6) |
| L3-G07 | L3R:L132 | Chưa được phép sửa canonical hay mở PR | — | scope | NOT_AUTHORIZED | Xem S-06 |
| M-Q1..Q6 | METH:L11-16, L18 | Phương pháp L4 (một kết quả chính, ID `CAND-`, P0–P6). Không duyệt quyền theo tuổi, quyền pháp lý hay MVP | toàn bộ | scope | OWNER_APPROVED_METHODOLOGY | — |
| CAP-1 | CAP:L29 | Mẫu UX không cấp quyền pháp lý. `UNKNOWN` không có nghĩa là được phép. A5 tự quản | toàn bộ | permission / legal | OWNER_APPROVED | — |
| CAP-2 | CAP:L35 | Mặc định từ chối. Kiểm quyền trước khi đọc, suy luận, tra cache hay gọi dịch vụ ngoài | toàn bộ | permission | OWNER_APPROVED | — |
| CAP-3 | CAP:L37 | Ưu tiên E0/E1. E2/E3 chỉ dùng khi đã kiểm mục đích, quyền, benchmark và chi phí. Không tự đặt ngưỡng y tế hay giáo dục | toàn bộ | AI | OWNER_APPROVED | — |
| CAP-4 | CAP:L39 | Cổng G-Legal/Privacy/Safety/Feasibility: `UNKNOWN ≠ PASS`. Không dùng làm căn cứ để pilot trên trẻ thật | toàn bộ | legal / safety | OWNER_APPROVED | — |
| CAP-5 | CAP:L21 | `mvp_decision = NOT_DECIDED` | toàn bộ | scope | OWNER_APPROVED | — |

### 2.3 P5 và P6

| ID | Nguồn | Quyết định (diễn giải) | Feature ID | Loại | Trạng thái ghi | Quan hệ |
|---|---|---|---|---|---|---|
| P5-OD-01 | P5:L12 | Lấy 64 test thiết kế làm baseline. Phải tách "đã review" với "đã chạy" | F01-G04-M01, F06-G07-M01, F04-G02-M03 | scope | P5_OWNER_APPROVED_AT_SPEC_LEVEL | — |
| P5-OD-02 | P5:L13, L19 | Ngoại lệ soft-cap tương tự (cùng scope, constraint, purpose): tối đa 60 ngày mỗi kỳ, ít nhất 7 ngày trống giữa hai kỳ. Không vượt protected hard-cap. Không dùng LLM so khớp để duyệt | F04-G02-M03 | UX / safety | như trên | Mở rộng bởi BP-OD-01 |
| P5-OD-03 | P5:L14, L20 | Không có Primary Manager hợp lệ, hoặc có hơn một người cùng quyền trên một scope: chặn sửa kế hoạch. Observer không tự nâng quyền | F01-G04-M01, F01-G05, F04-G06 | permission | như trên | CLAR bởi AP-OD-03 |
| P5-R-FC | P5:L30-31 | Chặn sửa (fail-closed) vẫn cho trẻ gửi đề xuất. Observer không mặc định đọc Journal | F01-G04, F04-G06 | permission | như trên | — |
| P5-OD-07 | P5:L50 | Không dùng PR #18. P6 bị chặn đến khi có môi trường agent độc lập | — | scope | APPROVED | Xem S-05 |
| AP-OD-01 | AP:L21 | Mỗi gia đình chỉ có một Primary Caregiver hiệu lực. Người khác là Supporter/Observer. Caregiver trong app không đồng nghĩa người giám hộ hợp pháp | F01-G04-M01 | permission / legal | OWNER_DECISIONS_CONFIRMED / FINAL_REGRESSION_PENDING | — |
| AP-OD-02 | AP:L22 | Primary được xem dữ liệu học tập và phát triển trong scope. Không đọc Journal hay tin an toàn chỉ vì vai trò. Grant cũ sau bàn giao đánh dấu `REVIEW_REQUIRED` | F01-G04-M01 | permission | như trên | **CONFLICT** OC-03 |
| AP-OD-03 | AP:L23 | F01-G04 sở hữu luồng bàn giao Primary. F01-G05 chỉ tham gia | F01-G04, F01-G05 | permission | như trên | CLAR P5-OD-03 |
| AP-OD-04 | AP:L24 | Người từ 18 tuổi đã xác minh tự quản. Chia sẻ là tự nguyện | F01-G04-M01 | permission / legal | như trên | — |
| AP-OD-05 | AP:L25 | Child-directed được sửa trong phạm vi Primary ủy quyền. Vượt phạm vi thì phải duyệt | F01-G04-M01, F04-G06 | permission | như trên | — |
| AA-OD-01 | AA:L13 | Bài làm ở nhà do phụ huynh xác nhận (`PARENT_CONFIRMED`), không phải giáo viên | F06-G07-M01 | data | OWNER_CONFIRMED / FINAL_REGRESSION_PENDING | — |
| AA-OD-02 | AA:L14 | AI đánh dấu câu có thể sai. Trong luồng gợi ý, AI chỉ hỏi gợi mở, không đưa đáp án | F06-G07-M01 | AI | như trên | — |
| AA-OD-03 | AA:L15 | Trẻ phản đối thì AI chấm lại, rồi phụ huynh quyết. AI chấm lại không tạo `PARENT_CONFIRMED`. Nộp lại là bài nộp mới | F06-G07-M01 | AI / data | như trên | — |
| AA-OD-04 | AA:L16 | Giữ AI chấm bài trong phạm vi sản phẩm. Chưa chốt quota hay giá | F06-G07-M01 | scope / AI | như trên | — |
| BP-OD-01 | BP:L13 | Cùng constraint không được nới liên tục quá 60 ngày, kể cả khi đổi purpose. Giữ quy tắc 7 ngày trống | F04-G02-M03 | UX / safety | OWNER_CONFIRMED / FINAL_REGRESSION_PENDING | Mở rộng P5-OD-02 |
| BP-OD-02 | BP:L14 | Không có lối tắt khẩn cấp vượt `protected_hard_cap`. `family_hard` đổi được, có audit | F04-G02-M03 | safety | như trên | — |
| BP-OD-03 | BP:L15 | Thứ tự: Bar gia đình → Bar mặc định của app đã thẩm định → `UNKNOWN`. Không dùng số ví dụ làm chuẩn | F04-G02-M03 | data / UX | như trên | — |

### 2.4 Batch 01: Consent Ledger, Mode State, Purpose-bound Access, Plan Structure, Change Requests

| ID | Nguồn | Quyết định (diễn giải) | Feature ID | Loại | Trạng thái ghi | Quan hệ |
|---|---|---|---|---|---|---|
| CL-OD-01 | CL:L13 | Phụ huynh tự khai, không xác minh giám hộ khi onboarding. Child App phải liên kết với Parent App trước khi dùng chương trình. Liên kết không chứng minh thẩm quyền. Mã mời dùng một lần, có hạn, chống chiếm tài khoản. Parent App lập kế hoạch được trước khi liên kết | F01-G04-M02, F01-G02-M01 | permission / legal | OWNER_BUSINESS_DECISIONS_RECORDED / DESIGN_REGRESSION_PENDING | Xem OC-02 |
| CL-OD-02 | CL:L14 | Chỉ Primary thu hồi được consent do caregiver quản lý. Không làm mất quyền trẻ dừng chia sẻ Journal | F01-G04-M02 | permission | như trên | — |
| CL-OD-03 | CL:L15 | Đổi Primary (mẹ sang bố) thì giữ nguyên consent cũ. Bố tạo event mới để đổi. Có lịch sử không có nghĩa là hợp lệ về pháp lý | F01-G04-M02 | data / legal | như trên | **CONFLICT** OC-03 (log tự ghi là "tinh giản" AP-OD-02) |
| CL-OD-04 | CL:L16 | Chỉ Child Journal là riêng tuyệt đối. Trẻ rút chia sẻ thì phụ huynh mất quyền đọc ngay. Dữ liệu ngoài Journal không có nghĩa là công khai | F01-G04-M02, F05-G06-M01 | permission | như trên | — |
| CL-INV-6 | CL:L25 | `Consent recorded ≠ authorized to process` | F01-G04 | legal | như trên | — |
| CL-INV-8 | CL:L27 | Phản đối pháp lý của chủ thể khác không bị bỏ qua chỉ vì UI chỉ có nút cho Primary | F01-G04-M02 | legal | như trên | — |
| MS-OD-01 | MS:L12 | Mỗi trẻ một mode, không theo gia đình, không theo từng plan | F01-G05-M01 | permission | OWNER_BUSINESS_DECISIONS_RECORDED / REGRESSION_PENDING | — |
| MS-OD-02 | MS:L13 | Ba mức quyền lịch: PARENT_LED, CHILD_EXECUTED (đề xuất/nháp), CHILD_DIRECTED (tự sửa, phụ huynh overwrite/lock). Quyền Journal, quyền trao đổi, quyền báo cảm xúc không mất. AI không tự lock | F01-G05-M01, F04-G06 | permission / AI | như trên | Xem C-01 |
| MS-OD-03 | MS:L14 | Access Policy giữ quyền ủy quyền. Mode State chỉ lưu và resolve mode | F01-G04, F01-G05-M01 | permission | như trên | — |
| MS-OD-04 | MS:L15 | `UNSET` cư xử như PARENT_LED, fail-closed. Đổi caregiver giữ mode | F01-G05-M01 | permission | như trên | — |
| MS-R1 | MS:L19, L23 | Chỉ phụ huynh đổi mode cho trẻ. Overwrite/lock không gồm quyền đọc Journal | F01-G05 | permission | như trên | — |
| PA-OD-01 | PA:L12 | Access Policy ra quyết định ALLOW/DENY cuối cùng. Thiếu điều kiện thì fail-closed | F01-G04-M01, F07-G06-M01, F01-G04-M02 | permission | OWNER_DECISIONS_CONFIRMED / CONDITIONAL / REGRESSION_AND_RESEARCH_OPEN | — |
| PA-OD-02 | PA:L13 | Owner duyệt danh mục mục đích (purpose catalog) có ID, version, căn cứ pháp lý, quy tắc lưu giữ. Danh sách ứng viên chưa phải whitelist | F07-G06-M01 | legal / data | như trên | Xem C-07, C-08 |
| PA-OD-03 | PA:L14 | Trẻ dừng chia sẻ Journal thì chặn ngay và cách ly dữ liệu dẫn xuất. Xóa Journal: ẩn ngay, xóa hẳn sau 60 ngày, trừ ngoại lệ pháp lý có công bố | F07-G06-M01, F05-G06, F07-G06-M02 | data / legal | như trên | Xem H4 |
| PA-OD-04 | PA:L15 | **Không xử lý dữ liệu thật của trẻ khi chưa xác định căn cứ pháp lý.** `LEGAL_UNKNOWN ≠ ALLOW`. Mục đích phụ, bên thứ ba, Journal và dữ liệu nhạy cảm có cổng riêng | toàn bộ | legal | như trên | **CONFLICT** OC-01 |
| PA-REG-6 | PA:L31 | Chống lệch mục đích: dữ liệu học tập không tự dùng cho thương mại | F07-G06-M01 | legal | như trên | — |
| PS-OD-01 | PS:L13 | F04-G06 duyệt, F04-G01 ghi baseline có version, F04-G06-M02 giữ lịch sử | F04-G01-M01, F04-G06-M01/M02 | data | OWNER_DECISIONS_RECORDED / DESIGN_REGRESSION_PENDING | — |
| PS-OD-02 | PS:L14 | Luôn lưu được nháp dù chưa đạt Bar. Nháp không phải ACTIVE. Không có Bar thì dùng bản mặc định, hoặc `UNKNOWN` | F04-G01-M01, F04-G02-M03 | UX | như trên | CLAR BP-OD-03 |
| PS-OD-03 | PS:L15 | Một mode mỗi trẻ, ba mức quyền như MS-OD-02. Không dùng tuổi cứng | F04-G01-M01, F01-G05-M01 | permission | như trên | — |
| PS-OD-04 | PS:L16 | Primary có quyền lịch cao nhất với trẻ chưa tự quản. LOCK là không sửa thời khóa biểu hiệu lực. Sửa khi đang khóa phải unlock trước hoặc override có audit. Không xóa task khi đổi trạng thái plan. Nhập lịch ngoài không mặc định vào MVP | F04-G01-M01 | permission / scope | như trên | — |
| PS-OD-05 | PS:L17 | Một plan có một chủ thể chính. Hoạt động chung được tham chiếu từ nhiều plan | F04-G01-M01 | data | như trên | — |
| CR-OD-01 | CR:L13 | Child-directed sửa trực tiếp trong phạm vi ủy quyền, không cần CR, nhưng vẫn qua đủ các cổng. Vượt phạm vi thì tạo CR | F04-G06-M01, F04-G01-M01 | permission | OWNER_DECISIONS_RECORDED / FINAL_REGRESSION_OPEN | — |
| CR-OD-02 | CR:L14 | Bảng vô hiệu khi bối cảnh đổi: đổi version, lock, đổi caregiver, đổi mode, archive | F04-G06-M01 | data / permission | như trên | Xem C-02 |
| CR-OD-03 | CR:L15 | Người quản lý plan scope sửa trực tiếp, không cần duyệt lần hai. Supporter/Observer không tự duyệt | F04-G06-M01 | permission | như trên | — |
| CR-OD-04 | CR:L16 | CR đang chờ hết hạn sau 7 ngày kể từ lúc gửi (theo giờ máy chủ). Commit phải idempotent. `APPROVED ≠ APPLIED` | F04-G06-M01 | data | như trên | — |
| CR-OD-05 | CR:L17 | Gửi được đề xuất vi phạm hard-cap để thảo luận, nhưng không bao giờ được duyệt hay áp dụng | F04-G06-M01, F04-G02-M03 | safety | như trên | — |
| CR-INV | CR:L21-23 | Lock chặn mọi commit. Không cấm tuyệt đối theo tuổi A0–A2. Parent-led không tạo CR chính thức | F04-G06, F04-G01 | permission | như trên | — |
| B01C-OD-01 | B01C:L13 | Đổi Primary vẫn giữ quyền tự sửa lịch đã cấp cho trẻ, không tạm ngưng. CR đã duyệt nhưng chưa áp dụng thì vẫn phải duyệt lại | F01-G04, F01-G05, F04-G06 | permission | BUSINESS_DECISIONS_RECORDED / TARGETED_REMEDIATION_REQUIRED | **SUP>** đề xuất chưa duyệt (B01C:L24); **CONFLICT** OC-03 |
| B01C-OD-02 | B01C:L14 | Trẻ chọn có báo hay không khi dừng chia sẻ Journal. Mặc định không báo. Thông báo và log không lộ nội dung | F05-G06-M01 | permission / UX | như trên | — |
| B01C-OD-03 | B01C:L15 | CR đã duyệt nhưng chưa áp dụng có hiệu lực tối đa 7 ngày kể từ lúc duyệt | F04-G06-M01 | data | như trên | — |
| B01C-OD-04 | B01C:L16 | Balanced Planning sở hữu thời hạn ngoại lệ soft-cap và lời nhắc khôi phục | F04-G02-M03 | scope | như trên | — |
| B01C-OD-05 | B01C:L17 | Lock không có thời hạn tối đa, không tự mở. App nhắc phụ huynh xem lại | F04-G01-M01 | UX | như trên | CLAR PS-OD-04 |
| B01C-OD-06 | B01C:L18 | Khi đang khóa vẫn sửa nháp hoặc làm offline được, nhưng không commit | F04-G01-M01 | UX | như trên | — |
| B01C-OD-07 | B01C:L19 | F07 giữ governance audit log. Audit không được lộ Journal | F07 | data | như trên | — |
| B01C-OD-08 | B01C:L20 | Trẻ Parent-led trao đổi mong muốn qua AI communication của F05. F04 chỉ nhận CR khi quyền cho phép | F05-G01, F04-G06 | permission / AI | như trên | Xem C-04 |
| B01C-KE | B01C:L36 | `LEGAL_UNKNOWN` không cho xử lý dữ liệu thật của trẻ. Không dùng cờ rủi ro thấp để lách | F07-G06-M01 | legal | như trên | — |

### 2.5 Gate, B02, L4 Consolidation, FR-01, OD-02..05, các mục tiếp theo

| ID | Nguồn | Quyết định (diễn giải) | Feature ID | Loại | Trạng thái ghi | Quan hệ |
|---|---|---|---|---|---|---|
| GATE-1 | GATE:L10-11 | Normalized baseline cùng các log là baseline thiết kế có điều kiện. Giữ 42 quyết định | B01 | scope | CONDITIONAL_DESIGN_BASELINE_APPROVED | **SUP>** B01C:L52 (theo IDX:L103) |
| GATE-NB | GATE:L18-22 | Không phát triển production, không dùng dữ liệu trẻ thật, không bỏ cổng pháp lý và an toàn, không tự chốt MVP | toàn bộ | legal / scope | như trên | **CONFLICT** OC-01 |
| B02-S | B02:L9-15 | Batch 02 gồm F01-G02-M01, F04-G06-M02, F05-G06-M01, F07-G06-M02 | 4 L3 | scope | B02_SCOPE_APPROVED / DESIGN_AUTHORIZED | **SUP>** GATE "scope pending" |
| B02-L | B02:L33-34 | Căn cứ pháp lý `UNKNOWN` thì không xử lý dữ liệu trẻ. Chia sẻ Journal và lưu giữ là fail-closed | F05-G06-M01, F07-G06-M02 | legal | như trên | — |
| ODP-01 | L4C:L9 | Không hỗ trợ chuyển liên kết giữa hai hộ | F01-G02-M01 | permission / scope | OWNER DECISIONS RECORDED / FINAL L4 PENDING | CLAR bởi FR01 #5 |
| ODP-02 | L4C:L10 | Xóa Journal là một chiều sau khi xác nhận. Không khôi phục. Giữ mốc 60 ngày tùy nghĩa vụ pháp lý | F05-G06, F07-G06-M02 | data / legal | như trên | Xem H4 |
| ODP-03 | L4C:L11 | AI chỉ trả lời trong phạm vi đã hỗ trợ hoặc đã huấn luyện. Ngoài phạm vi thì không trả lời | F07-G03, F05-G01, F07-G04 | AI | như trên | Chi tiết hóa bởi OD-05; **CONFLICT** OC-04 |
| FR01-1 | FR01:L9 | Unlink trên Child App cần Parent PIN, quyền hiện hành và xác nhận. PIN không thay kiểm quyền phía máy chủ. PIN không áp lên người 18+ | F01-G02-M01, F01-G01-M02 | permission / safety | APPROVED_OPTION_A / INDEPENDENT_RECHECK_PENDING | **SUP>** giả định unlink tự do (FR01:L44); **CONFLICT** OC-02 |
| FR01-2 | FR01:L10 | Unlink có hiệu lực thì gửi thông báo tối giản cho Parent App và ghi audit. Không gửi PIN hay Journal | F01-G02-M01, F04-G07 | UX / data | như trên | Xem C-14 |
| FR01-3 | FR01:L11 | Ghép lại cùng hộ dùng luồng thường. Token cũ mất hiệu lực. Unlink không xóa dữ liệu | F01-G02-M01 | permission | như trên | — |
| FR01-4 | FR01:L12 | Ghép sang hộ khác cần xác minh mới, riêng cho trẻ đó. Có tài khoản và mã thì chưa đủ | F01-G02-M01 | permission / legal | như trên (phương pháp xác minh còn mở) | — |
| FR01-5 | FR01:L13 | Cấm chuyển hộ khi liên kết đang hoạt động. Hộ B không thừa hưởng dữ liệu hay quyền của hộ A | F01-G02-M01 | permission | như trên | CLAR ODP-01 |
| OD-02 | OD:L10-12 | Bản phát hành đầu không hiển thị tài trợ cho người dưới 18 (A0–A4), kể cả qua cache, phân trang hay AI | F08-G03-M01/M02, F08-G05-M01/M02, F05-G01-M01 | UX / legal | OWNER_DECISIONS_APPROVED / INDEPENDENT_RECHECK_PENDING | — |
| OD-03a | OD:L18 | Trẻ có nguy cơ: chỉ hiện lời tĩnh "nói với người lớn tin cậy", có thể kèm 111. Không tự liên hệ, không báo gia đình, không mở hồ sơ | F05-G01-M01/M02, F07-G05-M01 | safety | như trên | CLAR lời cũ "chỉ nói với người lớn"; xem C-09 |
| OD-03b | OD:L20 | Phụ huynh báo khẩn: lớp an toàn chạy trước AI, hiện 115/113/111 tĩnh khi phù hợp. Không chẩn đoán, không gợi ý trả phí, không tự gọi | F07-G05-M01 | safety | như trên | — |
| OD-03c | OD:L22 | OD-03 không miễn G-Legal. Thông báo tĩnh khi chưa rõ căn cứ pháp lý (FR-03) vẫn mở | F07-G05-M01 | legal / safety | như trên | Xem §6 |
| OD-04 | OD:L28-30 | Ghim B01 v3.1 addendum vào manifest bổ sung. Không coi FV3-B01-001..007 là đã đóng | F04-G06-M01, F04-G01-M01, F04-G06-M02, F04-G03-M02, F04-G02-M03 | scope | như trên | Xem C-02, S-02 |
| OD-05a | OD:L36 | Mọi đầu ra AI cho người dùng phải có phạm vi đã duyệt và được kiểm trên đầu ra thật trước khi phát. Thiếu bằng chứng thì không phát byte nào, kể cả retry, cache hay stream | F07-G03-M01, F07-G04-M01/M02, F05-G01-M01, F06-G04-M02, mọi L4 sinh nội dung | AI | như trên | Chi tiết hóa ODP-03 |
| OD-05b | OD:L38 | Tra web hoặc LLM ngoài kho chỉ áp cho câu hỏi giáo dục/đào tạo, kèm báo trước, nhãn "chưa kiểm chứng", nguồn, hàng đợi. Loại câu hỏi khác cần chính sách riêng | F07-G01/G02, F07-G03 | AI | như trên | **CONFLICT** OC-04 |
| REM-HRW | REM:L43, L50 | Human Response Workflow hoãn ở bản đầu. Luồng an toàn của trẻ không tự báo gia đình | F07-G05-M02 | safety / scope | Owner-deferred | Xem C-15 |
| REM-LB | REM:L41 | FR-03 và H4 là cổng chặn phát hành. Mốc 60 ngày không được đè lên hạn pháp lý sớm hơn | F07-G06-M02, F05-G06, F07-G05-M01 | legal | LEGAL_RESEARCH_OPEN | — |

## 3. Đối chiếu với A-lite v2 (A3, A7)

Phần A-lite v2 đã khớp: 60/7 ngày (A3:L58), protected_hard/family_hard (A3:L44), Bar `UNKNOWN` (A3:L42, A7 PC-15), hard-cap không duyệt được (A3:L50), UNSET như PARENT_LED (A3:L94), Parent-led không tạo CR (A3:L49), B01C-OD-04 Balanced Planning sở hữu hết hạn (A3:L108).

| # | Loại | Tham chiếu A-lite | Quyết định liên quan | Mô tả |
|---|---|---|---|---|
| C-01 | Thiếu | A3:L50, A3:L95, A7 PC-03 | MS-OD-02, AP-OD-05, CR-OD-01, PS-OD-04 | A-lite v2 chỉ có luồng cho CHILD_EXECUTED. Không có đường đi khi phụ huynh chọn CHILD_DIRECTED (sửa trực tiếp trong phạm vi, có overwrite/lock), dù A3:L138 vẫn nhắc mode này. Owner cần chọn: ẩn CHILD_DIRECTED trong pilot (có hiển thị rõ), hoặc thêm luồng sửa trực tiếp và lock. |
| C-02 | **Mâu thuẫn** | A3:L155 ("máy trạng thái CR B01 v3.1 … quá mức cho pilot"), A7 PC-03 (chỉ có "7-day expiry") | CR-OD-02, B01C-OD-03, OD-04 | Việc vô hiệu CR khi đổi version, lock, mode hay archive là **Owner decision** (CR:L14), không chỉ là chi tiết của v3.1. Dù chỉ có một người duyệt, khi phụ huynh sửa plan lúc con đang có đề xuất chờ, đề xuất vẫn phải được đánh giá lại. Thiếu cả mốc "đã duyệt chưa áp dụng tối đa 7 ngày kể từ lúc duyệt" (B01C:L15) và `APPROVED ≠ APPLIED`/idempotency (CR:L16). |
| C-03 | Thiếu | A3:L94, A7 PC-03 ("single approver") | P5-OD-03, AP-OD-01, CR-OD-03 | Không nêu hành vi khi không có Primary Manager hợp lệ (phải fail-closed nhưng vẫn nhận đề xuất, P5:L30). Không nêu Supporter/Observer không duyệt được. |
| C-04 | Mâu thuẫn nhẹ | A3:L95 ("informal wish note", structured choices), A7 PC-03 | B01C-OD-08, MS-OD-02 | Owner chốt mong muốn của trẻ Parent-led đi qua **AI communication trong F05**. A-lite v2 có 0 module AI và không gán module chủ cho "wish note" (F05 không nằm trong 29 module). Cần Owner xác nhận cho dùng ghi chú có cấu trúc, không AI, và chọn module chủ. |
| C-05 | Thiếu | A3:L49, A3:L94 | PS-OD-02, CP-02 #3-4 | "Phụ huynh lưu = phê duyệt" chưa tách `DRAFT_SAVED` với `ACTIVE`. Chưa nói lịch vi phạm protected hard-cap thì không được kích hoạt (ngoài sàn ngủ tự sửa). |
| C-06 | Thiếu | A3:L157 ("engine Access Policy đầy đủ quá mức"), A3:L35 | PA-OD-01, CAP-2, MS-OD-03 | Có thể bỏ engine đầy đủ, nhưng vẫn cần hợp đồng tối thiểu: mặc định từ chối, kiểm quyền trước khi đọc, cache hay gọi ngoài, và một điểm ALLOW/DENY duy nhất. Bốn module nền chưa được kiểm độc lập (REM:L50). |
| C-07 | Thiếu | A3:L79, SG-03 | PA-OD-02, PA-OD-04, CAP-4 | Dữ liệu sức khỏe (dị ứng, thuốc) đang được đánh dấu YES/HARD_SAFETY. Chưa nêu rằng cần một purpose ID đã duyệt trong danh mục và cổng dành cho dữ liệu nhạy cảm trước khi dùng dữ liệu thật. |
| C-08 | Thiếu | A3:L115, SG-23, A7 PC-11 | PA-OD-02, PA-OD-04, E-D04 | Geofence: danh mục mục đích ứng viên (PA:L13) **không có mục vị trí hoặc giám sát an toàn**. Owner phải bổ sung purpose trước khi dùng dữ liệu thật. Thông báo "lệch mốc" phải kiểm quyền và không lộ dữ liệu khi xem trước. |
| C-09 | **Mâu thuẫn** | A3:L112, SG-20 ("static 111/113/115 content for any free-text input") | OD-03a, OD-03b | OD-03 tách theo người nhận. Trẻ chỉ nhận lời "nói với người lớn tin cậy", có thể kèm 111. Gói 115/113/111 dành cho phụ huynh hoặc người lớn khi phù hợp. A-lite gộp ba số cho mọi ô nhập chữ. CLAUDE.md cũng ghi ba số mà không tách người nhận. |
| C-10 | Thiếu | A3:L112, A7 PC-08 | OD-03c, REM-LB (FR-03) | Lớp an toàn xử lý ô nhập chữ của trẻ cũng là xử lý dữ liệu. Khi căn cứ pháp lý chưa rõ, FR-03 vẫn mở. A-lite chưa ghi điều kiện này. |
| C-11 | Thiếu | A3:L34, A3:L159-162, A7 PC-08/PC-10 | OD-05a/b, ODP-03, E-D02, PkD-P2 | Biến thể Plan-A có Pal chat. Còn thiếu: kiểm đầu ra trước khi phát (không stream byte chưa kiểm); phạm vi trả lời đã duyệt cho hội thoại lập lịch của phụ huynh (PC-12 chưa có chủ); giới hạn lượt của `pal-chat` (PLA:L53) không được chặn nội dung an toàn tĩnh. |
| C-12 | Thiếu | A3:L102 (ghi âm), PLA:L57 (ảnh, ghi âm giữ 30 ngày) | PkE-V, CON-INV #8, L3R-§5 | Chưa phân loại ghi âm "Kể cho Pal" là Journal hay không. Nếu là nhập Journal thì quy tắc là không lưu audio mặc định, khác với mức giữ 30 ngày của Plan A. |
| C-13 | Thiếu | A3:L100-101, PLA:L89 ("gửi Pal nhận xét") | AA-OD-01..04, CP-06-6, OD-05a | A-lite hoãn AI nhận xét ảnh, nhưng Plan A bước 5 có Pal nhận xét ảnh và ghi âm. Nếu làm, phải áp: không đưa đáp án trong luồng gợi ý, không tự tạo `PARENT_CONFIRMED`, chỉ pilot có benchmark. |
| C-14 | Thiếu | A3:L114, SG-22 | FR01-2, FR01-1 | A-lite có PIN nhưng thiếu thông báo unlink tối giản cho Parent App và kiểm quyền phía máy chủ (PIN cục bộ không đủ, FR01:L9, FR01-T09). |
| C-15 | Cần làm rõ | PLA:L88 (lệch mốc an toàn thì báo bố mẹ), A3:L115 | REM-HRW, OD-03a | Owner đã hoãn Human Response và chốt "không tự báo gia đình từ luồng an toàn của trẻ". Báo động geofence do phụ huynh cấu hình có thuộc "luồng an toàn" không? Chưa có quyết định. |
| C-16 | **Mâu thuẫn** | A3:L28, A3:L157 ("pilot chỉ dùng dữ liệu giả lập"), so với PLA:L90 (test hai tuần với gia đình thật) | PA-OD-04, GATE-NB, B02-L, CAP-4 | Biến thể Plan-A sẽ chạy với 1–3 gia đình thật (GPS, ảnh, giọng nói), nhưng A-lite lập luận xóa nhiều tầng và H4 "chỉ chặn khi dùng dữ liệu thật". Xem OC-01. |

## 4. OWNER_CONFLICT

| ID | Bên A | Bên B | Nội dung xung đột | Nguồn có ghi thứ bậc không |
|---|---|---|---|---|
| **OC-01** | PLA:L57, L90 (Owner chốt 04/11): 1–3 gia đình ký phiếu đồng ý, test hai tuần trên máy thật, có GPS, ảnh, ghi âm | PA-OD-04 (PA:L15, 12/11), GATE-NB (GATE:L20, 14/11), B02-L (B02:L33), CAP-4 | Các quyết định sau cấm xử lý dữ liệu thật của trẻ khi chưa đánh giá căn cứ pháp lý, và Gate ghi rõ không cho dùng dữ liệu trẻ thật. Phiếu đồng ý có thể là căn cứ, nhưng chưa có `lawful_basis_assessed`. | Không. Gate thuộc luồng L4, Plan A thuộc luồng dựng app. Không bên nào ghi là thay thế bên kia. |
| **OC-02** | PLA:L17 (không làm tài khoản riêng, dùng một mã gia đình), PLA:L56 | FR01-1..4 (Parent PIN, kiểm quyền máy chủ), CL-OD-01 (mã mời một lần, có hạn, chống chiếm tài khoản) | Plan A dùng chung một mã gia đình, nên không có danh tính để kiểm PIN phía máy chủ hay thu hồi liên kết. A-lite đã nêu vấn đề này là OD-A8. | Một phần: FR01:L44 chỉ thay thế "candidate designs", không nhắc Plan A. |
| **OC-03** | AP-OD-02 (AP:L22): grant cũ sau bàn giao đánh dấu `REVIEW_REQUIRED` | CL-OD-03 (CL:L15): không tự xác nhận lại; B01C-OD-01 (B01C:L13): giữ grant ủy quyền lịch, không tạm ngưng | Hai bên chưa thống nhất việc grant cũ sau khi đổi Primary có bị chờ duyệt lại hay không. CL:L15 tự ghi là "tinh giản" và yêu cầu "trace xung đột/clarification". B01C:L24 chỉ nói đã thay thế một đề xuất chưa duyệt, không nói thay AP-OD-02. Có thể hiểu: `REVIEW_REQUIRED` áp cho grant xem dữ liệu, còn B01C-OD-01 áp cho grant sửa lịch. Owner chưa xác nhận cách hiểu này. | Không rõ ràng. |
| **OC-04** | CLAUDE.md (mục Nguồn trả lời): thông tin chưa có trong kho, "mọi loại", thì tra mạng có nhãn | OD-05b (OD:L38): tra ngoài kho chỉ cho câu hỏi giáo dục/đào tạo; ODP-03 (L4C:L11): ngoài phạm vi thì không trả lời | Với câu hỏi không thuộc giáo dục (ví dụ thủ tục hay lịch sinh hoạt), CLAUDE.md cho tra mạng, còn OD-05 và ODP-03 bắt không trả lời. Prototype đang dùng hành vi của CLAUDE.md. | Không. OD-05 nói "giữ như đã đặc tả", nhưng mô tả quy tắc cũ hẹp hơn CLAUDE.md. |

## 5. Trạng thái mơ hồ

| ID | Nguồn | Trạng thái ghi | Mâu thuẫn với | Đề xuất ghi lại (Owner chốt) |
|---|---|---|---|---|
| S-01 | FR01:L3, L40-42; IDX:L113 | `INDEPENDENT_RECHECK_PENDING`, giữ finding HIGH ở trạng thái OPEN | REM:L3 (chỉ tác giả tự sửa, không cho Claude kiểm lại), REM:L69 (Owner từ chối regression độc lập) | `OWNER_DECLINED_RECHECK / AUTHOR_REMEDIATED / RISK_OPEN`. Ghi rõ HIGH không được đóng. |
| S-02 | OD:L4, L30, L59 | `INDEPENDENT_RECHECK_PENDING`. OD-04 viết "Claude independently rechecks" | REM:L3, L69 | Như S-01. Riêng OD-04: FV3-B01-001..007 giữ trạng thái OPEN vô thời hạn. |
| S-03 | IDX:L13-20 | "Owner confirmed, final regression pending" cho 8 L3 | REM:L50: bốn L3 nền NOT_REVIEWED trong lần kiểm cuối. Regression đã bị từ chối | Ghi rõ regression có còn kế hoạch chạy không. |
| S-04 | IDX:L118, Tracker | "FR-06, FR-09, FR-08 và H2 remain RECHECK_PENDING" | REM:L69 | Như S-01. |
| S-05 | P5:L44, L50; AP:L55 | `BLOCKED_NO_INDEPENDENT_AGENT_RUNTIME`; `P6_METHOD_APPROVAL_NOT_GRANTED` | Pilot P6 sau đó đã chạy bằng Claude Code (AP:L11, AA:L21, BP:L20). Gate 14/11 cho chạy tiếp mà không ghi phương pháp P6 đã duyệt | Chốt: phương pháp P6 đã duyệt chưa, hay được miễn. |
| S-06 | CONS:L3, L3R:L6, L3R:L132 | `NOT_APPLIED_TO_CANONICAL`; L3-G07 `NOT_AUTHORIZED` | METH:L6 và B02:L21: Blueprint 3.2-R1 trên `main` đã có 106 L3 (PR #16 đã merge) | Ghi một dòng supersede: diff v2 đã áp ngày nào, do ai cho phép. |
| S-07 | B01C:L52 | `B01_NEXT_BATCH_DESIGN_NOT_AUTHORIZED_YET` | Đã được IDX:L103 và GATE thay thế | Đã có thứ bậc. Chỉ nên thêm chú thích vào file gốc. |
| S-08 | PkD:L30, L62 | Nguyên tắc giá `USER_CONFIRMED`, mô hình `RECOMMENDED_NOT_YET_APPROVED`, nằm trong file `APPROVED_PROPOSAL` | Tên file dễ khiến người đọc hiểu mọi nội dung đều đã duyệt | Khi chấm điểm, chỉ coi PkD-P1 là ràng buộc. |
| S-09 | PkE:L34 | E-GAP-01 `NEW_PROPOSAL_REQUIRES_CONSOLIDATION` | CON-D02/D03 duyệt nguyên tắc, nhưng tám rule (PkE:L55-62) chưa được duyệt từng rule | Ghi rule nào đã thành ràng buộc. |

## 6. Cổng chặn (blockers)

| # | Cổng | Nguồn | Chặn gì |
|---|---|---|---|
| B-1 | Căn cứ pháp lý xử lý dữ liệu trẻ (MR-016) | PA-OD-04, B02-L, GATE-NB | Mọi dữ liệu thật, gồm pilot Plan A (OC-01) |
| B-2 | H4: hạn xóa theo Nghị định 356/2025 | REM:L41; Disposition H4 | Phát hành F07-G06-M02 và F05-G06; mốc 60 ngày |
| B-3 | FR-03: thông báo an toàn tĩnh khi chưa rõ căn cứ | OD:L22, REM:L29 | Lớp an toàn trên ô nhập chữ của trẻ |
| B-4 | Purpose catalog chưa duyệt (sức khỏe, vị trí) | PA-OD-02 | Hồ sơ sức khỏe, geofence |
| B-5 | Phương pháp xác minh ghép hộ khác | FR01:L18 | FR01-4 (A-lite đã hoãn) |
| B-6 | Thẩm định Bar mặc định của app và số khẩn 111/113/115 | BP-OD-03, OD:L20 | Hiển thị Bar là `VALID`; nội dung an toàn khi chạy thật |
| B-7 | Bốn L3 nền chưa kiểm độc lập, và Owner đã từ chối kiểm lại | REM:L50, L69 | Tin cậy của A-lite v2 (A3:L35) |
