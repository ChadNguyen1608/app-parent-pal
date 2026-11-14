# 04.1 – USER FLOW: VÒNG LẬP LỊCH (BATCH 1)

**Product Blueprint – Bước 4: User Flow**
**Người soạn:** AI, chưa kiểm chứng độc lập · **Trạng thái:** nháp chờ duyệt · **Bản:** 15/11/2026 (thay bản 14/11/2026)
**Phạm vi:** F1 Onboarding phụ huynh · F2 Lập lịch tuần · F3 Ghép máy con và Parent PIN · F4 Một ngày của con · F5 Thay đổi lịch.
**Không thuộc phạm vi:** wireframe, giao diện, API, mô hình dữ liệu, thuật toán. Không tạo Feature ID mới. Không thêm ngưỡng thời gian hay ngưỡng sức khỏe mới. Không chọn MVP.

> **Đọc trước:** Hai Blocker của bản 14/11 (B-1 ô Ngủ, B-2 dữ liệu hỏi thăm) **đã được chủ sản phẩm quyết** ngày 15/11 (D-02, D-03), xem mục 9. Luồng chính của bản này là **A-lite E1** (nhập có cấu trúc, không AI) theo OD-A2. Các bước chỉ có ở **nấc 2 (A-lite Plan A, có Pal trò chuyện)** được gắn nhãn `[Nấc 2]` và không thuộc luồng A-lite E1. Chỗ nguồn còn thiếu hay mâu thuẫn: vẽ nhánh mặc định an toàn, gắn `chờ Owner quyết`, đưa vào mục 8.

---

## Thay đổi so với bản 14/11

Nguồn quyết định: `OD-1115` = `app-design-document/progress/Owner_Decision_Log_20261115.md` (APPROVED theo lời chủ sản phẩm). Khi khác nguồn cũ, `OD-1115` thắng.

| # | Quyết định | Chỗ sửa trong tài liệu | Thay đổi |
|---|---|---|---|
| 1 | **OD-A1** (a) | 0.5, F1 | Bắt đầu từ thời khóa biểu. Mục tiêu là trường tùy chọn. Bỏ nhãn `chờ Owner quyết` |
| 2 | **OD-A2** (c) | 0.4, 0.5, F1–F5, mục 7 | A-lite E1 là luồng chính (không AI, nhập có cấu trúc). Pal chat, 🎤, 📷, "Pal vừa ghi", báo đói, thời tiết chuyển thành `[Nấc 2]` |
| 3 | **OD-A6** (b), **OD-A7** (a) | 0.5, F4 | Hội thoại Pal với phụ huynh: F07-G03 làm entry, F03-G05 làm outcome (chỉ nấc 2). Tín hiệu mệt, đói: chủ là F04-G05 |
| 4 | **OD-A8** (b), D-04 | 0.5, F3 | Mã gia đình chỉ trong spike kỹ thuật. FR-01 (tài khoản, ghép máy, Parent PIN) **bắt buộc trước pilot với gia đình thật** |
| 5 | **D-02** | F2 bước 6, 3.2, sơ đồ 3.6, B-1 | Ô Ngủ đỏ **không có** nút "Giữ mức này". Ngủ dưới mức tối thiểu không lưu-phê duyệt được. Gỡ `⛔ BLOCKED` |
| 6 | **D-03** | F4 bước 6 và 11, F5A-X6, F5B-X10, B-2 | Phụ huynh nhận **xu hướng mệt liên quan đến lịch**, không nhận cảm xúc, không nhận nguyên văn. Con được báo trước là bố mẹ nhận thông tin này. Gỡ `⛔ BLOCKED` |
| 7 | **D-06** (theo OD-03) | 0.6 mục 1, F4-X9, CA-14, PA-24 | Con chỉ nhận lời "nói với người lớn tin cậy", có thể kèm 111. Số 113, 115 chỉ hiện cho người lớn |
| 8 | **D-07** | F5B-X4 | Đổi người quản lý chính: quyền đã cấp cho con giữ nguyên. CR đã duyệt chưa áp phải duyệt lại |
| 9 | **D-08** | F2 bước 9–10 | Bộ dựng E1 dùng thông số mặc định của spike E1, gắn nhãn "mặc định chưa kiểm chứng" |
| 10 | **D-09** | F5-A bước 1, 3, 9; F5A-X2; sơ đồ 6.6 | Giai đoạn tạm thời tối đa 60 ngày. Hết hạn (hoặc kết thúc sớm) **tự về lịch trước giai đoạn**. Bỏ ba lựa chọn khi hết hạn |
| 11 | **D-10** | F4 bước 7, sơ đồ 5.6, F5-B | "Rất mệt" **không tự đổi lịch**. Muốn đổi thì con đi bước đề xuất; ở `PARENT_LED`/`UNSET` là mong muốn gửi bố mẹ |
| 12 | **D-11** | F1 bước 10, F3-X5, F4-X8 | App yêu cầu con có thiết bị. Không có thiết bị: chỉ dùng phần lập lịch phía phụ huynh |
| 13 | Sổ ràng buộc C-01, C-03, C-04 | F5-B | Thêm nhánh: không có Primary hợp lệ (fail-closed, vẫn nhận đề xuất); `CHILD_DIRECTED` trong A-lite chưa có quyết định bật; mong muốn của con ở E1 là lựa chọn có sẵn, không chữ tự do |
| 14 | B01C-OD-03 | F5-B | CR đã duyệt chưa áp có hiệu lực tối đa 7 ngày kể từ lúc duyệt |
| 15 | Bảng UF-Q | Mục 8 | UF-Q01, Q02, Q03, Q04, Q07 đánh dấu **đã quyết** kèm mã D-xx. Thêm mục 8.3 "đồng bộ tài liệu" cho các chỗ QT, TAB, PROTO, CLAUDE.md trái với quyết định mới |
| 16 | Danh mục màn hình | Mục 7 | Giữ 40 màn, thêm cột "A-lite E1 / Nấc 2". Không thêm màn mới trong đợt 1 |

---

## 0. Nguồn và quy ước

### 0.1 Nguồn đã đọc (chỉ đọc, không sửa)

| Mã dẫn | File |
|---|---|
| `02.5` | `app-design-document/02_User_Research/User_Research_02_5_User_Scenarios.md` (S01, S03–S05, S09, S11; Q1–Q4; R3) |
| `02.S§3` | `app-design-document/02_User_Research/User_Research_02_Summary.md` §3 (ma trận vai trò) |
| `03.4` | `app-design-document/03_Feature_Planning/Product_Blueprint_03_4_Feature_Interaction_and_Use_Case_Mapping.md` (UC-001…UC-010, UC-012, UC-015) |
| `QT` | `repo/documents/pal/spec-quy-tac-lap-lich.md` (**nguồn chuẩn quy tắc**; trích theo ID A1…O) |
| `TAB` | `repo/documents/pal/spec-quy-thoi-gian-va-tab-cua-con.md` (trích theo §) |
| `PROTO` | `repo/prototype/index.html` (hành vi chuẩn; trích theo hàm và số dòng) |
| `FR-01` | `Feature_3_2_L4_FR01_Parent_PIN_Unlink_and_Repairing_Owner_Decision_APPROVED.md` |
| `B01-CR` | `Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md` |
| `B01-MS` | `Feature_3_2_L4_B01_Mode_State_Owner_Decision_Log_APPROVED.md` |
| `B01-PS` | `Feature_3_2_L4_B01_Plan_Structure_Owner_Decision_Log_APPROVED.md` |
| `B01-CL` | `Feature_3_2_L4_B01_Consent_Ledger_Owner_Decision_Log_APPROVED.md` |
| `P6-BP` | `Feature_3_2_L4_P6_Balanced_Planning_Owner_Decision_Log_APPROVED.md` |
| `A-lite` | `phase-3-scoring-audit/03_A_Lite_Workflow_Validation.md` (A-lite v2) và `08_Research_Gaps_and_Decisions.md` (OD-A1…OD-A8) |
| `PA` | `repo/documents/app/spec-phuong-an-a-app-android.md` (Plan A: nhắc giờ, quyền Android, không popup) |
| `CLAUDE` | `repo/CLAUDE.md` (Pal xưng "mình", nghe trước, không chẩn đoán, lớp an toàn trước AI, 111/113/115) |
| `OD-1115` | `app-design-document/progress/Owner_Decision_Log_20261115.md` (OD-A1..A8, D-01..D-13). **Thắng nguồn cũ khi khác** |
| `CRG` | `app-design-document/progress/Constraint_Register_Approved_Decisions.md` (C-01..C-16, OC-01..04, cổng chặn §6) |
| `SPIKE` | `app-design-document/progress/spike-e1-scheduler/Spike_E1_Scheduler_Report.md` (bộ xếp E1 tất định, tự báo cáo FEASIBLE cho lõi xếp lịch, chưa kiểm chứng độc lập) |
| `OD` | `Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md` (OD-03 an toàn theo người nhận) |
| `B01C` | `Feature_3_2_L4_B01_Consolidation_Owner_Decision_Log_APPROVED.md` |

### 0.2 Mức căn cứ khi nêu con số

Mọi con số lấy từ `QT`, giữ nguyên mức căn cứ: **[NC]** có nghiên cứu/khuyến nghị tổ chức chuyên môn; **[NL]** nghiên cứu ở người lớn hoặc gián tiếp; **[MĐ]** mặc định của Pal, chưa kiểm chứng. Con số đến từ quyết định Owner (7 ngày, 60 ngày, ≥7 ngày trống) ghi là **quyết định Owner**, không phải bằng chứng khoa học. Con số không có nguồn ghi `UNKNOWN`.

### 0.3 Chế độ tự chủ (theo B01-MS-OD-02, B01-PS-OD-03)

| Mode | Quyền của con đối với lịch | Ghi chú |
|---|---|---|
| `UNSET` | Như `PARENT_LED` | Trạng thái nội bộ, không phải mode thứ tư (B01-MS-OD-04) |
| `PARENT_LED` | Không tạo, không sửa lịch có hiệu lực; **chỉ gửi mong muốn** | Không tạo Change Request chính thức (B01-CR §2) |
| `CHILD_EXECUTED` | Tạo đề xuất/nháp; phụ huynh duyệt mới áp dụng | CR hết hạn sau 7 ngày (B01-CR-OD-04) |
| `CHILD_DIRECTED` | Tự sửa trong phạm vi được ủy quyền; phụ huynh `overwrite`/`lock` | Ngoài phạm vi thì dùng CR (B01-CR-OD-01) |

Mode **không** xóa các quyền khác của con: tự làm việc đã duyệt, hỏi Pal, báo trạng thái, Journal (B01-MS-OD-02). Mỗi con có mode riêng (B01-MS-OD-01).

### 0.4 Ký hiệu

- `PA-xx` màn Parent App; `CA-xx` màn Child App (danh mục ở mục 7).
- `[E1]` xử lý theo quy tắc, không AI; `[E2]` có LLM (chỉ ở nhánh Pal chat).
- `[Nấc 2]` = chỉ có ở A-lite Plan A (có Pal trò chuyện, chụp ảnh, ghi âm, báo đói, thời tiết, vùng GPS). **Không thuộc A-lite E1** (OD-A2 (c)). Ghi lại để nấc 2 không phải vẽ lại.
- `chờ Owner quyết` = nhánh mặc định do AI vẽ, chưa được duyệt.
- `đề xuất nội bộ` = cách xử lý luồng do AI đề xuất, không có trong nguồn đã duyệt.

### 0.5 Quyết định Owner áp trong tài liệu này (OD-1115)

| OD | Câu hỏi | Quyết định | Cách vẽ |
|---|---|---|---|
| OD-A1 | Bắt đầu từ mục tiêu hay từ thời khóa biểu | **(a)** Từ thời khóa biểu; đặt mục tiêu tùy chọn | F1 bắt đầu từ giờ học và thẻ hoạt động; mục tiêu là trường tùy chọn `muc_tieu_bo_me` (QT B3). UC-005 không bắt buộc trước UC-007 |
| OD-A2 | A-lite E1 hay biến thể Pal chat | **(c)** A-lite E1 trước; Plan A (có Pal) là nấc 2 | **Nhập có cấu trúc [E1]** là luồng duy nhất của A-lite E1. Nhánh Pal chat [E2] ghi `[Nấc 2]` |
| OD-A6 | Chủ hội thoại Pal với phụ huynh | **(b)** F07-G03 entry, F03-G05 outcome | Chỉ áp ở `[Nấc 2]` (PA-22) |
| OD-A7 | L3 nào sở hữu tín hiệu mệt/đói | **(a)** F04-G05 | Hỏi thăm sau giờ học và báo đói gán F04-G05. Xu hướng do F06-G04-M01 tính |
| OD-A8 | Mã gia đình (Plan A) hay tài khoản + PIN (FR-01) | **(b)** Mã gia đình chỉ trong spike kỹ thuật; FR-01 phải có trước pilot với gia đình thật | Vẽ theo **FR-01**. Biến thể mã gia đình chỉ dùng cho spike, không có người dùng thật ngoài ngoại lệ D-01 |

**Ghi chú về D-01 (ngoại lệ có giới hạn cho Plan A):** thử nội bộ tối đa 3 gia đình, có đồng ý bằng văn bản, có hạn kết thúc, xóa khi kết thúc. **Cổng pháp lý H4, FR-03 vẫn mở, không PASS.** Tài liệu này không đánh dấu cổng nào là đạt.

### 0.6 Bất biến áp cho mọi flow

1. **Lớp an toàn chạy trước AI, nội dung theo người nhận (D-06, OD-03).**
   - **Người lớn** (Parent App): tình huống khẩn chỉ hiện thông tin tĩnh **115** cấp cứu, **113** công an, **111** bảo vệ trẻ em, khi phù hợp (OD-03b). Không chẩn đoán, không gợi ý trả phí, không tự gọi.
   - **Trẻ** (Child App): chỉ hiện lời tĩnh **"Con hãy nói với một người lớn con tin cậy"**, có thể kèm **111** (OD-03a). Không hiện 113, 115 cho trẻ. Không tự liên hệ, không tự báo gia đình, không mở hồ sơ (OD-03a; REM-HRW trong CRG).
   - Không gọi Claude cho tin khẩn.
   - **A-lite E1:** không có AI. Child App ở E1 **không có ô chữ tự do** (chỉ lựa chọn có sẵn), nên không phát sinh xử lý chữ của trẻ (tránh cổng FR-03, CRG C-10) · nhánh mặc định an toàn, `chờ Owner quyết` UF-Q15. Ô chữ tự do còn lại ở Parent App (ghi chú thẻ, lý do thay đổi) đi qua bộ kiểm từ khóa theo quy tắc [E1] trước khi lưu; khớp dấu hiệu khẩn thì hiện PA-24 · `đề xuất nội bộ`, chờ thẩm định danh sách từ khóa (cổng B-6 trong CRG).
2. **Ẩn danh trước khi gọi LLM** `[Nấc 2]`: tên con, trường, địa chỉ thay bằng mã (`[CON_1]`, `[TRUONG_1]`) (PA §4).
3. **Không popup.** Cảnh báo là một dòng chữ có biểu tượng, nằm ngay dưới ô nhập, ghi số hiện tại, mốc và nguồn (QT D6; TAB §1.3; PA §4).
4. **Cảnh báo đúng một lần;** đã xác nhận thì không nhắc lại (QT A2). Tín hiệu mới từ con không tính là nhắc lại (TAB §1.5).
5. **Thông báo chỉ gửi sau khi commit thành công;** không có thông báo "đã đổi" trước commit (03.4 §2, §7).
6. **Pal** xưng "mình", tối đa 3 câu ngắn, mỗi lượt tối đa 1 câu hỏi (QT A3); không gắn nhãn tính cách, không chẩn đoán (QT A4); không bao giờ tự đề xuất kéo dài giờ học (QT A5). Ở A-lite E1, lời của app là **câu mẫu cố định** theo cùng quy tắc này (không sinh bằng AI).
7. **Có nhiều con mà phụ huynh không nêu tên: hỏi lại, không đoán** (CLAUDE). Áp ở mọi màn có thao tác theo con.
8. Không so sánh trẻ với trẻ khác; không điểm tổng; không chấm điểm (TAB §4; CLAUDE).
9. **Không có gì tự đổi lịch có hiệu lực ngoài thao tác commit của người có quyền** (D-10; B01-CR-OD-01; B01-PS-OD-01). Ngoại lệ duy nhất đã được quyết: giai đoạn tạm thời hết hạn thì tự về lịch trước giai đoạn (D-09).

---

## 1. Tổng quan vòng lặp

```mermaid
flowchart LR
  F1["F1 Onboarding phụ huynh"] --> F2["F2 Lập lịch tuần"]
  F1 -. "có thể làm trước hoặc sau F2" .-> F3["F3 Ghép máy con + PIN"]
  F2 --> F4["F4 Một ngày của con"]
  F3 --> F4
  F4 --> F4W["Tóm tắt tuần"]
  F4 --> F5["F5 Thay đổi"]
  F4W --> F5
  F5 --> F2
  F2 -. "Con không có thiết bị (D-11)" .-> PO["Chỉ phần lập lịch phía phụ huynh"]
```

Phụ huynh có thể lập lịch trước khi con ghép máy (B01-CL-OD-01). Con chỉ truy cập chương trình sau khi ghép hợp lệ (B01-CL-OD-01). App yêu cầu con có thiết bị riêng để dùng F4 phía con; không có thiết bị thì gia đình chỉ dùng F1, F2, F5 phía phụ huynh (D-11). Các luồng còn lại (xem lại tuần, thông báo, thành viên, đồng ý và dữ liệu, an toàn, hủy tài khoản) nằm ở `User_Flow_04_2_Remaining_Flows.md`.

---

## 2. F1 – Onboarding phụ huynh

| Mục | Nội dung |
|---|---|
| **Actor / App** | Phụ huynh (người chăm sóc chính) · Parent App |
| **Mode** | Con mới tạo ở `UNSET` (cư xử như `PARENT_LED`) (B01-MS-OD-04) |
| **Entry point** | Mở Parent App lần đầu; hoặc PA-03 "Thêm con" với gia đình đã có |
| **Mục tiêu** | Có hồ sơ gia đình, hồ sơ con tối thiểu theo QT B1 và danh sách hoạt động cố định (QT E1) |
| **Nguyên tắc UX** | Tối đa 3–4 câu hỏi trọng tâm ở bước đầu, phần còn lại hỏi dần (02.5 N3, S11 – mục tiêu UX, chưa kiểm chứng); giải thích vì sao hỏi; cho bỏ qua; cho sửa |

### 2.1 Các bước

| # | Màn | Người dùng làm | Hệ thống phản hồi |
|---|---|---|---|
| 1 | PA-01 Chào mừng / Đăng ký | Tạo tài khoản hoặc đăng nhập | Tạo tài khoản người lớn (F01-G01-M01). Thất bại → báo lỗi, giữ dữ liệu đã nhập. Spike kỹ thuật dùng mã gia đình thay bước này; pilot với gia đình thật phải dùng tài khoản theo FR-01 (OD-A8 (b)) |
| 2 | PA-02 Đồng ý và quyền riêng tư | Đọc, đồng ý | Ghi consent dạng `SELF_DECLARED`, không bắt xác minh tư cách giám hộ ở onboarding thường (B01-CL-OD-01; F01-G04-M02). Không đồng ý → dừng, không tạo hồ sơ con |
| 3 | PA-03 Hồ sơ gia đình | Đặt tên gia đình, cách Pal gọi mình ("chị Lan") | Tạo hộ gia đình (F01-G02-M01); người tạo là Primary Caregiver (B01-CL) |
| 4 | PA-04 Thêm con – cơ bản | Nhập tên gọi, tuổi/lớp | Tạo hồ sơ con (F01-G03-M01). Bắt buộc tuổi/lớp (QT B1). Mode = `UNSET` |
| 5 | PA-05 Giờ học | Nhập giờ vào học, tan học từng thứ; bán trú hay không; nơi ở (tỉnh/thành) | Bắt buộc theo QT B1; nơi ở dùng cho điều chỉnh theo mùa (QT B2, I1–I2). Ghi đúng lời phụ huynh (QT B3; F02-G01-M01) |
| 6 | PA-07 Hoạt động của con | Bấm "Thêm hoạt động" | Mở PA-07a |
| 7 | PA-07a Thẻ hoạt động | Nhập tên, loại (học thêm/tập luyện/năng khiếu/khác), các thứ, giờ bắt đầu–kết thúc, đi lại (phút, cả đi và về), địa điểm, ghi chú; bấm Lưu | Kiểm: có tên, ≥1 thứ, giờ kết thúc sau giờ bắt đầu (PROTO `actForm`, dòng ~918). Hợp lệ → thêm thẻ; dải T2…CN và tổng giờ/tuần cập nhật (TAB §2.3). Tập có huấn luyện viên tính vào Học thêm; vận động vui không phải thẻ học thêm (QT E6) |
| 8 | PA-07 | Lặp lại cho các hoạt động khác, hoặc "Xong" | Không tạo trùng (QT E2). Tổng giờ học thêm + đi lại vào nhóm "Học thêm và tập luyện" của quỹ, không nhập tay (QT D2) |
| 9 | PA-06 Hồ sơ bổ sung (tùy chọn) | Trả lời hoặc "Để sau": giấc ngủ, thể lực, tính cách, môn mạnh/khó, ăn uống ở trường, **mục tiêu của bố mẹ (tùy chọn, OD-A1)** | Câu hỏi có sẵn, chọn hoặc nhập ngắn (E1). Sức khỏe (dị ứng, thuốc) là dữ liệu nhạy cảm: **ẩn trường này khi dùng dữ liệu thật** cho tới khi có purpose ID đã duyệt (CRG C-07, cổng B-4) · nhánh mặc định an toàn, `chờ Owner quyết` UF-Q16 |
| 10 | PA-03 | Chọn "Con có điện thoại riêng không?" | **Có** → mời ghép máy (F3), không bắt buộc ngay (02.5 Q1). **Không** → báo rõ: app cần con có thiết bị; hiện tại gia đình chỉ dùng được phần lập lịch phía phụ huynh, không có nhắc và theo dõi trên máy con (D-11). Chuyển F2 |

### 2.2 Nhánh ngoại lệ

| Mã | Tình huống | Xử lý |
|---|---|---|
| F1-X1 | **Nhiều con**, phụ huynh thao tác mà chưa chọn con (ví dụ "thêm lớp tiếng Anh") | Mở PA-08 Chọn con: "Lớp này của bạn nào?". **Không đoán**, không mặc định con gần nhất (CLAUDE) |
| F1-X2 | Thiếu thứ hoặc giờ ở thẻ hoạt động | Không lưu; chỉ ra ô thiếu (PROTO `actForm`). Nhánh Pal chat: hỏi 1 câu, chưa ghi (QT E2) |
| F1-X3 | Thẻ trùng tên với thẻ có sẵn | Hỏi: sửa thẻ cũ hay thêm thẻ mới (QT E2 "không tạo trùng") · cách hỏi là `đề xuất nội bộ` |
| F1-X4 | Hoạt động chồng giờ học ở trường hoặc chồng thẻ khác | Lưu thẻ, đánh dấu xung đột; xử lý ở bước kiểm xung đột F2 (F04-G02-M02) |
| F1-X5 | Phụ huynh muốn nhanh, bỏ qua nhiều câu | Đặt giả định hợp lý, nói ngắn giả định chính, mời bổ sung sau (QT B4). Giả định hiện trong hồ sơ, gắn nhãn "giả định" |
| F1-X6 | Mất mạng giữa chừng | Giữ nháp trên máy; đồng bộ khi có mạng · `đề xuất nội bộ`, chờ System Design |
| F1-X7 | Phụ huynh không đồng ý điều khoản | Không tạo hồ sơ con; có thể quay lại sau |
| F1-X8 | **Nhánh Pal chat** `[Nấc 2]` (OD-A2 (c): không thuộc A-lite E1) | Phụ huynh kể tự do hoặc gửi ảnh thời khóa biểu. Lớp an toàn → ẩn danh → Pal [E2] tạo thẻ, viền xanh, nhãn "● Pal vừa ghi" (TAB §2.3). Phụ huynh xác nhận dữ liệu quan trọng (ngày/giờ, tên, lưu ý sức khỏe) trước khi lưu (02.5 S11). Pal không tự thêm hoạt động phụ huynh chưa nói (QT E2) |
| F1-X9 | Người dùng từ 18 tuổi tự quản | Ngoài phạm vi batch này; không mặc định phụ huynh quản (B01-MS-OD-04; 02.S§3) |

### 2.3 Dữ liệu ghi nhận

Tài khoản người lớn; consent (`SELF_DECLARED`, phiên bản chính sách); hộ gia đình; vai trò Primary Caregiver; cách Pal gọi phụ huynh. Hồ sơ con: `tuoi_lop`, `gio_hoc`, bán trú, `noi_o`, các trường tùy chọn theo QT B3 (`an_uong`, `hoc_them`, `suc_khoe`, `the_luc`, `giac_ngu`, `tinh_cach`, `hoc_tap`, `so_thich`, `khong_thich`, `muc_tieu_bo_me`), nguồn và cờ "giả định". Thẻ hoạt động: các trường QT E1, nguồn (`bo_me`/`pal`). Mode = `UNSET`.

### 2.4 Liên kết

- **Feature IDs:** F01-G01-M01, F01-G02-M01, F01-G03-M01, F01-G04-M02, F01-G05-M01, F02-G01-M01, F02-G01-M02 (hỏi dần), F02-G04-M01 (ứng viên chủ của thẻ hoạt động, A-lite SG-02), F03-G04-M01 (tùy chọn, chỉ khi phụ huynh nhập mục tiêu; OD-A1 (a)).
- **UC:** UC-001; UC-003 (cập nhật thông tin có nguồn); UC-005 (tùy chọn, không phải điều kiện trước UC-007; OD-A1 (a)).
- **Quy tắc:** QT B1–B4, E1, E2, E6, D2; TAB §2.3; 02.5 Q1, N3, S01, S11; B01-CL-OD-01; B01-MS-OD-04; CLAUDE (nhiều con); OD-A1, OD-A2, OD-A8, D-11; CRG C-07.

### 2.5 Sơ đồ

```mermaid
flowchart TD
  A([Mở Parent App]) --> B["PA-01 Đăng ký / Đăng nhập"]
  B --> C{"PA-02 Đồng ý điều khoản?"}
  C -- Không --> C1([Dừng, không tạo hồ sơ con])
  C -- Có --> D["PA-03 Hồ sơ gia đình"]
  D --> E["PA-04 Thêm con: tên gọi, tuổi/lớp"]
  E --> F["PA-05 Giờ học, bán trú, nơi ở"]
  F --> G{"Nhập kiểu nào? OD-A2 (c)"}
  G -- "A-lite E1: có cấu trúc" --> H["PA-07a Thẻ hoạt động"]
  G -. "Nấc 2: Pal chat" .-> P["PA-22 Pal chat"]
  P --> S{"Lớp an toàn"}
  S -- Khẩn --> S1["PA-24 Thông tin 115 / 113 / 111 cho người lớn"]
  S -- Bình thường --> P2["Ẩn danh, Pal tạo thẻ 'Pal vừa ghi'"]
  P2 --> P3{"Phụ huynh xác nhận?"}
  P3 -- Sửa --> H
  P3 -- Đúng --> I
  H --> H1{"Đủ tên, thứ, giờ hợp lệ?"}
  H1 -- Không --> H
  H1 -- Có --> H2{"Trùng thẻ có sẵn?"}
  H2 -- Có --> H3["Hỏi: sửa thẻ cũ hay thêm mới"] --> I
  H2 -- Không --> I["PA-07 Danh sách hoạt động"]
  I --> J{"Thêm nữa?"}
  J -- Có --> H
  J -- Không --> K["PA-06 Hồ sơ bổ sung, cho bỏ qua"]
  K --> L{"Con có thiết bị riêng? D-11"}
  L -- Không --> L1["Báo: chỉ dùng phần lập lịch phía phụ huynh"] --> M([F2 Lập lịch tuần])
  L -- Có --> M
  L -- Có --> N([F3 Ghép máy con])
  E -. "Gia đình nhiều con, thao tác chưa nêu con" .-> X["PA-08 Hỏi: của bạn nào?"]
```

---

## 3. F2 – Lập lịch tuần

| Mục | Nội dung |
|---|---|
| **Actor / App** | Phụ huynh · Parent App (tab 🧭 Lên kế hoạch và 🗓️ Lịch tuần, TAB §0) |
| **Mode** | Commit bởi phụ huynh ở mọi mode. Ở `PARENT_LED`/`UNSET`: **lưu = phê duyệt** (A-lite §2 bước 4; UC-008; B01-MS-OD-04) |
| **Entry point** | Sau F1; hoặc PA-09 từ tab Lên kế hoạch; hoặc nút "Xếp lại lịch" (E1; PROTO gọi là "Nhờ Pal cập nhật lịch") khi thẻ hoạt động đổi (QT E5) |
| **Mục tiêu** | Một lịch mẫu tuần có phiên bản, đã kiểm cân bằng và xung đột, được phụ huynh chốt |

### 3.1 Các bước

| # | Màn | Người dùng làm | Hệ thống phản hồi |
|---|---|---|---|
| 1 | PA-08 (nếu nhiều con) | Chọn con | Không đoán (CLAUDE) |
| 2 | PA-09 Quỹ giờ | Xem bảng 6 nhóm × 2 cột (ngày đi học, cuối tuần) | Nạp quỹ mặc định theo tuổi (QT D, "Quỹ mặc định" – **[MĐ]**). Gắn nhãn "mặc định của Pal, chưa kiểm chứng"; không gắn `BALANCED/VALID` khi bar chưa được thẩm định (P6-BP-OD-03; B01-PS-OD-02). Hai nhóm cố định lấy từ thời khóa biểu và thẻ hoạt động, không nhập tay (QT D2). "Chơi và nghỉ" tự tính = 24 giờ trừ các nhóm, cộng một nửa giờ ăn (QT D3) |
| 3 | PA-09 | Chọn preset (Bình thường, Thi cử, Nghỉ hè, Nghỉ lễ…) hoặc giữ mặc định | Nạp preset; mỗi preset giữ riêng các xác nhận vùng đỏ (TAB §2.1). Thi cử/Nghỉ hè là ngoại lệ có thời hạn, không phải Standard Bar dài hạn (A-lite, SC-001-D03) → nếu chọn, gợi ý tạo giai đoạn tạm thời (F5-A) |
| 4 | PA-09 | Nhập **một con số** (giờ/ngày) cho: học ở nhà, ăn uống và vệ sinh, ngủ, màn hình giải trí tối đa (QT D1) | Tính lại "Chơi và nghỉ"; chấm màu theo bảng ngưỡng QT D (xem 3.2). Học ở nhà **không chấm màu**, Pal không đặt trần riêng (QT D5) |
| 5 | PA-09 | Ô cam: không cần làm gì | Dòng ⚠️ dưới ô, ghi số hiện tại, mốc, nguồn; mốc không nguồn ghi "mặc định của Pal" (TAB §1.3) |
| 6 | PA-09 | Ô đỏ (trần mềm, **trừ ô Ngủ**): bấm **"Giữ mức này"** hoặc sửa số | Bấm "Giữ mức này": ô vẫn đỏ, dòng chữ đổi thành "bố mẹ đã xác nhận", Pal không nhắc lại (TAB §1.4; QT A2, D6). Đây là "ngoại lệ soft-cap hợp lệ" cho phép commit (B01-CR-OD-05; B01-PS-OD-02) |
| 6b | PA-09 | **Ô Ngủ đỏ** (thiếu >30′ so với mức tối thiểu theo tuổi) | **Không có nút "Giữ mức này"** (D-02; khớp QT C1, P6-BP-OD-02). Dòng chữ dưới ô: số hiện tại, mức tối thiểu theo tuổi, nguồn [NC] AASM. Nháp vẫn lưu được (B01-PS-OD-02) nhưng gắn `NOT_APPROVABLE`; phụ huynh phải nâng số mới lưu-phê duyệt được. Bộ dựng không bao giờ xếp ngủ dưới sàn C1 (QT D4) |
| 6c | PA-09 | **Ô Ngủ cam** (thiếu ≤30′) | QT D chỉ yêu cầu dòng cảnh báo cho ô cam. Nhưng D-02 ghi "giờ ngủ không được giữ dưới mức tối thiểu". Nhánh mặc định an toàn: hiện dòng cảnh báo; bộ dựng vẫn xếp ngủ đủ mức tối thiểu (QT D4), nên lịch có hiệu lực không dưới sàn; dòng chữ ghi "Lịch sẽ xếp đủ mức tối thiểu" · `đề xuất nội bộ`, `chờ Owner quyết` UF-Q14 |
| 7 | PA-09 | Tổng các nhóm > 24 giờ | Dòng "Chơi và nghỉ" báo đỏ kèm số giờ bị vượt (TAB §2.1; PROTO `judge` dòng 769). Không có nút "Giữ mức này" cho dòng này (PROTO dòng 838 chỉ hiện nút ở ô nhập). Phụ huynh phải giảm một ô nhập. Nháp vẫn lưu được (B01-PS-OD-02), nhưng không dựng được lịch hợp lệ nên không lưu-phê duyệt được · phần "không lưu-phê duyệt" là `đề xuất nội bộ` suy từ ràng buộc 24 giờ |
| 8 | PA-09 | (Tùy chọn) "Lưu preset" / "Lưu thành mới" / "Xóa" | Lưu quỹ thành preset (QT D7) |
| 9 | PA-09 | Bấm **"Xếp lịch theo quỹ này"** | **Dựng lịch đề xuất** (F04-G02-M01) bằng bộ xếp **[E1]** (OD-A2 (c)): mẫu theo lớp (F04-G01-M02) + quy tắc thứ tự trong ngày + xê dịch ±30′ quanh số phụ huynh nhập (QT D4). Thông số khối (thời lượng, nghỉ giữa khối, giãn cách trước giờ ngủ…) lấy từ `out/params.json` của spike, gắn nhãn **"mặc định chưa kiểm chứng"**, chờ thẩm định ở bước 14b (D-08). Spike tự báo cáo lõi xếp lịch E1 khả thi (SPIKE §1), chưa kiểm chứng độc lập. `[Nấc 2]`: Pal xếp theo prompt `RULES` như PROTO, kết quả vẫn qua bước 11 |
| 10 | (hệ thống) | — | Áp quy tắc dựng: sàn C1–C7; khối và nhãn tải F1–F3; phiên học F4; màn hình không phải nghỉ F5; nhịp ngày G1–G10; bữa ăn H1–H3; điều chỉnh mùa I1–I3 trong quỹ ăn uống-vệ sinh ±30′. Lỗi thứ tự (hai khối học liền nhau, học ngay khi vừa về, học trước giờ đi học) **tự sửa, không hỏi lại** (QT C cuối mục; TAB §1.2) |
| 11 | (hệ thống) | — | **Kiểm tự động** cho từng ngày (QT O; PROTO `checkDayK`): `ngu`, `phuc_hoi`, `cao_lien`, `an_xa` (hiện cho phụ huynh); `truoc_gio_hoc`, `tong_gio_hoc`, `tap_muon` (chỉ dùng nội bộ). **Kiểm xung đột** chồng giờ (F04-G02-M02; UC-010). **Kiểm cân bằng** (F04-G02-M03) |
| 12 | PA-10 Xem trước lịch tuần | Xem từng ngày; xem 1 điều đã chỉnh theo con (QT B5) | Lịch chi tiết **không có màu** (QT D6). Vi phạm còn lại hiện thành dòng chữ ở ngày đó. Phần mới đổi tô đỏ (QT K2) |
| 13 | PA-10 | Sửa (quay lại PA-09 hoặc PA-07) hoặc bấm **"Lưu lịch"** | Kiểm lại: quyền (F01-G04-M01), phiên bản lịch, lock, cân bằng. Nếu còn vi phạm `protected_hard_cap` (gồm ngủ dưới mức tối thiểu, D-02) → `NOT_APPROVABLE`, không commit (B01-CR-OD-05; P6-BP-OD-02). Soft-cap đỏ chưa xác nhận → yêu cầu xác nhận hoặc sửa. Không có Primary hợp lệ cho scope → chặn commit (P5-OD-03; xem 04.2 luồng G4) |
| 14 | (hệ thống) | — | Commit lịch mẫu tuần phiên bản mới (F04-G01-M01, idempotent); ghi lịch sử người lưu, lý do (F04-G06-M02). Ở `PARENT_LED`/`UNSET`, đây là phê duyệt |
| 15 | (hệ thống) | — | Sau commit: đặt lại toàn bộ lời nhắc trên máy con (F04-G07-M01; PA bước 3); báo máy con "Lịch mới" nếu đã ghép (F04-G07-M01). Chưa ghép → lịch chờ, không gửi. Con không có thiết bị → không có nhắc phía con (D-11) |
| 16 | PA-11 Lịch tuần | Xem lịch đã lưu | Hiện hồ sơ, tổng quan, chi tiết ngày, thẻ giai đoạn tạm thời (TAB §0) |

### 3.2 Ngưỡng màu dùng ở bước 4–7 (chép từ QT D, giữ mức căn cứ)

| Ô | Xanh | Cam | Đỏ | Căn cứ |
|---|---|---|---|---|
| Ngủ | ≥ mức tối thiểu theo tuổi (6–12 tuổi 9–12 giờ; 13–18 tuổi 8–10 giờ) | thiếu ≤30′ | thiếu >30′, **không có "Giữ mức này"** (D-02) | [NC] AASM |
| Màn hình giải trí | ≤1 giờ | 1–2 giờ | >2 giờ | Đỏ [NC] Canada 24h; cam [MĐ] |
| Ăn uống, vệ sinh | ≥1h30 | 1h–1h30 | <1 giờ | [MĐ] |
| Chơi và nghỉ (ngày đi học) | ≥1 giờ | 30′–1 giờ | <30′ hoặc tổng >24 giờ | [MĐ]; WHO 60′ vận động/ngày [NC] |
| Chơi và nghỉ (cuối tuần) | ≥2 giờ | 1–2 giờ | <1 giờ | [MĐ] |
| Học thêm (ngày đi học) | ≤2 giờ | 2–3 giờ | >3 giờ | [MĐ] |
| Học thêm (cuối tuần) | ≤3 giờ | 3–4h30 | >4h30 | [MĐ] |
| Học ở nhà | không chấm | | | QT D5 |

Nhánh theo tuổi: A2 (6–10) và A3 (11–14) khác nhau ở mức ngủ tối thiểu (QT C1), quỹ màn hình mặc định (≤10 tuổi 30′/1 giờ; lớn hơn 1 giờ/2 giờ – [MĐ]), độ dài phiên học (lớp 1–3 khoảng 20–30′; lớp 4–5 30–40′; lớp 6–9 40–45′ – [MĐ], QT F4) và G8 (11–15 tuổi: ít khối hơn, con tự sắp trong khối, xác nhận nhẹ hơn – [NC] NT-07). Tiểu học 2 buổi/ngày: khối ôn bài là ôn nhẹ (QT G10).

### 3.3 Nhánh ngoại lệ

| Mã | Tình huống | Xử lý |
|---|---|---|
| F2-X1 | Thiếu dữ liệu bắt buộc (QT B1) | Không dựng; dẫn về PA-05. Không tự giả định giờ ngủ (03.4 UC-010; A-lite §2) |
| F2-X2 | **Không có slot hợp lệ** (ví dụ hoạt động tối làm sát giờ ngủ) | Hiện trade-off, không ép chọn (03.4 UC-010). Pal nói 1 câu lý do, đưa 1–2 phương án cân bằng và hỏi phụ huynh chọn (QT C đầu mục) |
| F2-X3 | Phụ huynh yêu cầu phương án phạm sàn C | Ở lượt đó **không** xếp phương án phạm (QT C). Draft vẫn lưu được để xem, gắn `NOT_APPROVABLE` nếu phạm protected hard-cap (B01-PS-OD-02; B01-CR-OD-05) |
| F2-X4 | Xung đột chồng giờ (thẻ hoạt động chồng giờ học, hai thẻ chồng nhau) | Chỉ ra cặp xung đột và gợi ý slot khác; không tự dời (03.4 UC-010) |
| F2-X5 | Ngày có học thêm buổi tối | Bữa phụ chắc sau giờ học; giờ ngủ lùi tối đa 15–30′; hỏi phụ huynh có muốn bớt học ở nhà không (QT G7, [MĐ]) |
| F2-X6 | Hai lần ăn cách quá 5 giờ (6 tuổi: quá 4 giờ) | Dòng cảnh báo `an_xa`; chưa biết giờ ăn trưa thì giả định 11h15 và nói rõ là giả định (QT H2, [NC] + nguồn phổ thông) |
| F2-X7 | Phụ huynh đổi preset sau khi đã có lịch | Lịch chưa đổi; hiện nút "Xếp lịch theo quỹ này" (TAB §2.1) |
| F2-X8 | Phụ huynh tự sửa thẻ hoạt động sau khi đã có lịch | Hiện "Lịch tuần chưa cập nhật" + nút "Xếp lại lịch" (E1); **không tự xếp lại khi chưa được nhờ** (QT E5) |
| F2-X9 | Hai người lớn cùng sửa (đổi phiên bản giữa chừng) | Commit bị từ chối do lệch phiên bản; yêu cầu tải lại và đánh giá lại (03.4 UC-010 "concurrent change"; B01-PS-OD-01) |
| F2-X10 | Lịch đang `LOCK` | Không commit; người có quyền unlock trước hoặc dùng `authorized override` có audit (B01-PS-OD-04) |
| F2-X11 | Mất mạng khi bấm Lưu | Không báo "đã lưu" khi chưa commit; giữ nháp; thử lại idempotent; đối soát trạng thái thật trước khi thử lại (B01-CR-OD-04 "timeout ≠ failed") |
| F2-X12 | Commit thành công nhưng gửi lịch tới máy con thất bại | Lịch vẫn có hiệu lực; gửi lại; hiện trạng thái "máy con chưa nhận" cho phụ huynh · cách hiển thị là `đề xuất nội bộ` |
| F2-X13 | Mùa lạnh/nồm miền Bắc làm quỹ ăn uống-vệ sinh vượt ±30′ | Nói với phụ huynh một lần, gợi ý lưu preset theo mùa (QT I3) |
| F2-X15 | Phụ huynh cố lưu khi ô Ngủ đỏ | Không lưu-phê duyệt; nháp giữ `NOT_APPROVABLE`; dòng chữ chỉ ra ô Ngủ (D-02; B01-PS-OD-02) |
| F2-X16 | Không có Primary hợp lệ, hoặc có hai người cùng quyền trên scope | Chặn commit (fail-closed); vẫn lưu nháp (P5-OD-03; CRG C-03) |
| F2-X14 | **Nhánh Pal chat** `[Nấc 2]` | Phụ huynh nói "xếp lại cả tuần". Lớp an toàn → ẩn danh → Pal [E2] dựng. Kết quả vẫn qua `checkDayK`, kiểm xung đột, kiểm cân bằng [E1] trước khi hiện PA-10. LLM không có quyền commit (03.4 §7) |

### 3.4 Dữ liệu ghi nhận

Quỹ theo con: 4 ô nhập × 2 cột, preset đang dùng, danh sách xác nhận vùng đỏ theo preset (khóa `cột.nhóm`), phiên bản Standard Bar dùng để chấm (hoặc `UNKNOWN`). Lịch mẫu tuần: khối (giờ bắt đầu, kết thúc, tên, việc nhỏ, cách xác nhận, nhãn tải), phiên bản, người commit, thời điểm. Kết quả kiểm (mã QT O). Lịch sử thay đổi.

### 3.5 Liên kết

- **Feature IDs:** F04-G02-M03 (Balanced Planning), F04-G02-M01 (dựng lịch), F04-G02-M02 (xung đột), F04-G01-M01 (lưu phiên bản), F04-G01-M02 (mẫu), F04-G06-M02 (lịch sử), F04-G07-M01 (đặt lại nhắc), F01-G04-M01 (quyền), F01-G05-M01 (mode), F03-G03-M01 (tùy chọn, mốc theo giai đoạn).
- **UC:** UC-007, UC-008; UC-010 (nhánh xung đột).
- **Quy tắc:** QT A1–A6, B4–B5, C1–C7, D1–D7, E4–E6, F1–F7, G1–G10, H1–H4, I1–I3, O; TAB §1, §2; P6-BP-OD-02, -03; B01-PS-OD-01, -02, -04; B01-CR-OD-04, -05; B01-MS-OD-04; P5-OD-03; **D-02, D-08, OD-A2**.

### 3.6 Sơ đồ

```mermaid
flowchart TD
  A([Vào tab Lên kế hoạch]) --> A1{"Nhiều con, chưa chọn?"}
  A1 -- Có --> A2["PA-08 Hỏi: lịch của bạn nào?"] --> B
  A1 -- Không --> B["PA-09 Quỹ giờ: mặc định theo tuổi, nhãn MĐ chưa kiểm chứng"]
  B --> C["Chọn preset / nhập 4 ô x 2 cột"]
  C --> D{"Màu từng ô"}
  D -- Xanh --> E
  D -- Cam --> D1["Dòng cảnh báo: số, mốc, nguồn"] --> E
  D -- "Đỏ, ô không phải Ngủ" --> D2{"Giữ mức này?"}
  D2 -- Sửa số --> C
  D2 -- Giữ --> D3["Ghi 'bố mẹ đã xác nhận', không nhắc lại"] --> E
  D -- "Đỏ, ô Ngủ (D-02)" --> BL["Không có nút giữ; nháp NOT_APPROVABLE; phải nâng số"] --> C
  D -- "Cam, ô Ngủ" --> BC["Dòng cảnh báo; lịch vẫn xếp đủ mức tối thiểu (UF-Q14)"] --> E
  D -- "Tổng quá 24 giờ" --> D4["Chơi và nghỉ đỏ, không có nút giữ"] --> C
  E["Bấm: Xếp lịch theo quỹ này"] --> F{"Bộ dựng (OD-A2 c)"}
  F -- "A-lite E1" --> G["Mẫu theo lớp + quy tắc thứ tự + lệch 30 phút; thông số spike, chưa kiểm chứng (D-08)"]
  F -. "Nấc 2: Pal E2" .-> G2["Lớp an toàn, ẩn danh, Pal dựng"]
  G --> H
  G2 --> H["Kiểm checkDayK + xung đột + cân bằng"]
  H --> H1{"Có slot hợp lệ?"}
  H1 -- Không --> H2["Hiện trade-off, 1-2 phương án, phụ huynh chọn"] --> C
  H1 -- Có --> I["PA-10 Xem trước lịch tuần, không màu"]
  I --> J{"Phụ huynh"}
  J -- Sửa --> C
  J -- "Lưu lịch" --> K{"Quyền, phiên bản, lock, hard-cap"}
  K -- "Phạm hard-cap" --> K1["NOT_APPROVABLE, giữ nháp"] --> C
  K -- "Lock / lệch phiên bản" --> K2["Không commit, tải lại hoặc unlock"] --> I
  K -- Đạt --> L["Commit phiên bản mới = phê duyệt PARENT_LED"]
  L --> M["Ghi lịch sử, đặt lại nhắc trên máy con"]
  M --> N{"Máy con đã ghép?"}
  N -- Có --> N1["Báo máy con: lịch mới"] --> O
  N -- Không --> O([PA-11 Lịch tuần])
```

---

## 4. F3 – Ghép máy của con và Parent PIN (FR-01)

| Mục | Nội dung |
|---|---|
| **Actor / App** | Con (Child App) tạo mã; phụ huynh (Parent App) ghép; người chăm sóc có quyền nhập PIN trên máy con khi hủy liên kết |
| **Mode** | Không phụ thuộc mode lịch. Ghép là **identity linking**, không chứng minh thẩm quyền pháp lý (B01-CL-OD-01) |
| **Entry point** | Con mở Child App lần đầu (CA-01); phụ huynh mở PA-13 "Ghép máy của con" từ PA-03 hoặc lời mời sau F1 |
| **Mô hình định danh** | Vẽ theo FR-01 (tài khoản phụ huynh + ghép + PIN). **FR-01 phải có trước pilot với gia đình thật** (OD-A8 (b), D-04). Biến thể "mã gia đình" của Plan A chỉ dùng trong spike kỹ thuật; không có PIN phía máy chủ, không thu hồi liên kết được (CRG OC-02), nên không dùng cho người dùng ngoài ngoại lệ D-01 |
| **Điều kiện thiết bị** | App yêu cầu con có thiết bị riêng (D-11) |

### 4.1 Các bước – ghép lần đầu

| # | Màn | Người dùng làm | Hệ thống phản hồi |
|---|---|---|---|
| 1 | CA-01 Chào | Con mở app | Chưa ghép: không hiện chương trình của phụ huynh (B01-CL-OD-01) |
| 2 | CA-02 Mã ghép | Con xem mã | Child App sinh **mã ghép mới**, dùng một lần, có hạn (B01-CL-OD-01; FR-01 mục 3). Thời hạn mã: `UNKNOWN`, chờ System Design |
| 3 | PA-13 Ghép máy | Phụ huynh chọn con (PA-08 nếu nhiều con), nhập mã | Kiểm: tài khoản phụ huynh hợp lệ, quyền với hồ sơ con, mã còn hạn, máy con chưa có liên kết hiệu lực (F01-G02-M01, F01-G04-M01) |
| 4 | PA-14 Parent PIN | Đặt PIN (lần đầu) hoặc xác nhận PIN đã có | Lưu PIN thuộc người chăm sóc có quyền. Quy trình đặt, đổi, khôi phục, độ dài, số lần thử: chờ System Design/bảo mật (FR-01 "Remaining unspecified") · thời điểm đặt PIN ở bước ghép là `đề xuất nội bộ` |
| 5 | (hệ thống) | — | Tạo liên kết hiệu lực (binding epoch mới); ghi audit (F01-G01-M02, F01-G04-M02) |
| 6 | CA-03 Ghép thành công | Con thấy "Đã kết nối với gia đình" | Tải lịch đã commit (nếu có) → CA-04; xin quyền thông báo (CA-15; PA §7 `POST_NOTIFICATIONS`) |
| 7 | PA-15 Thông báo | Phụ huynh nhận "Đã ghép máy của [tên gọi]" | Thông báo sau commit, tối thiểu, không chứa mã ghép (FR-01 mục 2) |

### 4.2 Các bước – hủy liên kết từ máy con (FR-01A)

| # | Màn | Người dùng làm | Hệ thống phản hồi |
|---|---|---|---|
| 1 | CA-11 Cài đặt | Bấm "Hủy liên kết" | Yêu cầu Parent PIN; con biết phiên đăng nhập hoặc mở được Cài đặt **không đủ** để hủy (FR-01 mục 1) |
| 2 | CA-12 Nhập Parent PIN | Người lớn nhập PIN, xác nhận lần nữa | Máy chủ kiểm PIN + quyền tài khoản hiện tại + binding epoch. PIN là kiểm tra thêm, không thay quyền phía máy chủ (FR-01 mục 1) |
| 3 | (hệ thống) | — | Commit hủy liên kết đúng một lần (idempotent, FR01-T03); tăng epoch; vô hiệu token cũ. **Không xóa dữ liệu con, không cấp quyền Journal** (FR-01 mục 3) |
| 4 | PA-15 | Phụ huynh nhận thông báo tối thiểu "Máy của [tên gọi] đã hủy liên kết" | Không chứa PIN, mã ghép, nội dung Journal, lý do riêng (FR-01 mục 2). Gửi thất bại → thử lại, hiện được; không đảo ngược việc hủy (FR-01 mục 2; FR01-T04) |

### 4.3 Ghép lại

| Trường hợp | Xử lý |
|---|---|
| Cùng hộ gia đình, sau khi đã hủy | Luồng 4.1 bình thường với **mã mới**; mã và token cũ vô hiệu (FR-01 mục 3; FR01-T05) |
| Hộ khác (B) khi liên kết với hộ A còn hiệu lực | **Từ chối**, kể cả có mã (FR-01 mục 5; FR01-T08) |
| Hộ khác (B) sau khi hộ A đã hủy hợp lệ | Cần **xác minh mới, riêng cho trẻ này** rằng người lớn ở B có quyền quản lý trẻ. Tài khoản hợp lệ + thành viên hộ + biết mã **không đủ** (FR-01 mục 4). Chưa có bằng chứng → trạng thái chờ xác minh, **không** có quyền truy cập dữ liệu (FR01-T06). Phương pháp xác minh: `NEEDS_POLICY/LEGAL/UX DESIGN`; không tự đặt yêu cầu giấy tờ hay sự đồng ý của hộ cũ (FR-01). Hộ B không thừa hưởng dữ liệu, quyền, Journal của hộ A (FR-01 mục 5) |

### 4.4 Nhánh ngoại lệ

| Mã | Tình huống | Xử lý |
|---|---|---|
| F3-X1 | Mã sai hoặc hết hạn | Báo "Mã không đúng hoặc đã hết hạn, hãy lấy mã mới trên máy con". Không tiết lộ mã đó có tồn tại không (B01-CL-OD-01: không để người lạ biết một ID) |
| F3-X2 | Nhập PIN sai (hủy liên kết) | Không hủy, không lộ dữ liệu; giới hạn số lần thử ở máy chủ (FR01-T02). Số lần cụ thể: `UNKNOWN` |
| F3-X3 | Máy con ngoại tuyến khi hủy | **Không** coi trạng thái trên máy là đã hủy; hủy chỉ có hiệu lực khi máy chủ commit (FR-01 "Offline… fail-closed"; FR01-T09) |
| F3-X4 | Mất phản hồi sau commit hủy, thử lại | Đúng một lần hủy, đúng một lần tăng epoch (FR01-T03) |
| F3-X5 | **Con chưa có máy** | **Đã quyết (D-11):** app yêu cầu con có thiết bị. Không có thiết bị thì gia đình chỉ dùng phần lập lịch phía phụ huynh (F1, F2, F5 phía phụ huynh); không có CA-xx, không nhắc, không ✓ từ con. **Không** cho dùng chung máy phụ huynh làm máy con (nhánh mặc định an toàn, vì dùng chung làm mất ranh giới quyền giữa Parent App và Child App) · `chờ Owner quyết` UF-Q17. Khi con có máy sau này → F3 bình thường |
| F3-X6 | Nhiều con | Mỗi con ghép riêng; PA-13 bắt chọn con trước khi nhập mã (CLAUDE). Một máy ghép nhầm con → hủy liên kết (4.2) rồi ghép lại đúng con · `đề xuất nội bộ` |
| F3-X7 | Từ chối quyền thông báo trên máy con | Vẫn ghép được; CA-04 hiện hướng dẫn bật lại; báo phụ huynh "nhắc trên máy con đang tắt" · `đề xuất nội bộ` |
| F3-X8 | Người dùng 18+ tự quản | Parent PIN không tạo quyền người chăm sóc đối với người lớn tự quản (FR-01 mục 1; FR01-T11) |
| F3-X9 | Thông báo ghép thành công gửi thất bại | Liên kết vẫn có hiệu lực; thử lại; PA-03 hiện trạng thái "đã ghép" |

### 4.5 Dữ liệu ghi nhận

Mã ghép (một lần, có hạn, không lưu sau khi dùng), liên kết hộ–con–máy, binding epoch, audit ghép/hủy (ai, khi nào, không có PIN), PIN dạng đã băm (cơ chế mật mã chờ System Design), trạng thái thông báo, trạng thái "chờ xác minh" cho ghép khác hộ.

### 4.6 Liên kết

- **Feature IDs:** F01-G02-M01, F01-G02-M02, F01-G01-M02, F01-G04-M01, F01-G04-M02, F04-G07-M01 (thông báo cho phụ huynh).
- **UC:** UC-001 (liên kết thiết bị khi thiết lập gia đình), UC-002 (cấp/thu hồi quyền).
- **Quy tắc:** FR-01 mục 1–5, FR01-T01…T11; B01-CL-OD-01; B01-MS-OD-04 (18+); PA §7; OD-A8, D-04, D-11.

### 4.7 Sơ đồ

```mermaid
flowchart TD
  subgraph Ghep["Ghép lần đầu"]
    A([CA-01 Con mở Child App]) --> B["CA-02 Sinh mã một lần, có hạn"]
    B --> C["PA-13 Phụ huynh chọn con, nhập mã"]
    C --> C1{"Mã hợp lệ? Quyền với con? Máy chưa liên kết?"}
    C1 -- "Mã sai / hết hạn" --> C2["Báo lấy mã mới, không lộ ID"] --> B
    C1 -- "Đang liên kết hộ khác" --> C3["Từ chối chuyển liên kết"]
    C1 -- Đạt --> D["PA-14 Đặt / xác nhận Parent PIN"]
    D --> E["Commit liên kết, epoch mới, audit"]
    E --> F["CA-03 Ghép xong, tải lịch, xin quyền thông báo"]
    E --> G["PA-15 Báo phụ huynh, không chứa mã"]
  end
  subgraph Huy["Hủy liên kết trên máy con"]
    H([CA-11 Cài đặt: Hủy liên kết]) --> I["CA-12 Nhập Parent PIN + xác nhận"]
    I --> J{"Máy chủ kiểm PIN, quyền, epoch"}
    J -- "Sai / ngoại tuyến" --> J1["Không hủy, giới hạn số lần thử"]
    J -- Đạt --> K["Commit hủy đúng 1 lần, token cũ vô hiệu, không xóa dữ liệu"]
    K --> L{"Gửi thông báo phụ huynh"}
    L -- "Thất bại" --> L1["Thử lại, hiện được; hủy vẫn hiệu lực"]
    L -- "Thành công" --> L2["PA-15 Thông báo tối thiểu"]
  end
  subgraph Lai["Ghép lại"]
    M{"Hộ nào?"} -- "Cùng hộ" --> B
    M -- "Hộ khác" --> N{"Có xác minh mới riêng cho trẻ?"}
    N -- "Chưa" --> N1["Chờ xác minh, không truy cập dữ liệu"]
    N -- "Có" --> N2["Ghép mới, không thừa hưởng dữ liệu hộ cũ"]
  end
  K -.-> M
```

---

## 5. F4 – Một ngày của con

| Mục | Nội dung |
|---|---|
| **Actor / App** | Con (Child App, tab 🧒 "Hôm nay"); phụ huynh (Parent App, tab 🗓️ Lịch tuần, tóm tắt tuần) |
| **Mode** | Mọi mode: con tự làm và báo các việc đã duyệt (B01-MS-OD-02). Mode chỉ ảnh hưởng quyền sửa lịch (xem F5) |
| **Entry point** | Con chạm thông báo nhắc; hoặc mở Child App (CA-04); phụ huynh mở PA-11 hoặc PA-21 |
| **Tiền điều kiện** | Đã có lịch commit (F2) và máy con đã ghép (F3). Con không có thiết bị → không có F4 phía con (D-11) |
| **Phạm vi A-lite E1** | ✓ Xong, Hoàn tác, hỏi thăm 3 lựa chọn, tóm tắt tuần. `[Nấc 2]`: 📷 Chụp gửi, 🎤 Kể cho Pal, 🍎 báo đói, thời tiết soạn cặp, vùng GPS |

### 5.1 Các bước – trong ngày

| # | Màn | Người dùng làm | Hệ thống phản hồi |
|---|---|---|---|
| 1 | CA-06 Thông báo | Nhận nhắc theo khối; buổi sáng có báo thức | Mỗi khối lịch thành một lời nhắc cục bộ, có nút "Xong" ngay trên thông báo (PA §2, bước 3; F04-G07-M01). Tôn trọng tùy chọn thông báo (F04-G07-M02); giờ yên lặng cụ thể: `UNKNOWN` |
| 2 | CA-06 | Bấm "Xong" trên thông báo (với khối loại con bấm) | Ghi hoàn thành + giờ (F04-G05-M01 → F06-G01-M01) |
| 3 | CA-04 Hôm nay | Mở tab | Danh sách khối hôm nay, chữ to, lời đơn giản; lấy ngoại lệ tuần này nếu có, ẩn khối đã hủy (PROTO `renderToday` dòng 999). Khối đang diễn ra có nhãn **"Bây giờ"**; thanh **"Đã xong x/y"** chỉ đếm khối cần xác nhận; **không chấm điểm, không xếp hạng** (TAB §4; QT L1; F04-G04-M01) |
| 4 | CA-04 | Bấm nút trên khối, tùy cách xác nhận (QT F1, L1) | **✓ Xong** → ghi giờ. **"Tự ghi nhận"** → tự động. **"Chờ bố mẹ xác nhận"** → không có nút cho con. Khối nghỉ → không có nút. `[Nấc 2]`: **📷 Chụp gửi** (F04-G05-M02; AI chấm bài chỉ cho pilot có kiểm soát, SC-002-D05, CRG C-13); **🎤 Kể cho Pal** (phân loại ghi âm là Journal hay không còn mở, CRG C-12). Ở A-lite E1, khối có cách xác nhận ảnh/giọng nói hiện nút ✓ Xong thay thế · `đề xuất nội bộ` |
| 5 | CA-04 | Bấm **"Hoàn tác"** nếu bấm nhầm | Xóa ghi nhận khối đó (QT L1; PROTO dòng 1025) |
| 6 | CA-05 Hỏi thăm sau giờ học | Ở khối "Ghi lại việc được giao và hỏi thăm" (QT G3), chọn **Ổn / Hơi mệt / Rất mệt**, hoặc bỏ qua | Lời mời **tùy chọn**, con được bỏ qua hoặc tắt; không hỏi lặp khi con bỏ qua (02.5 R3, S09). Lưu lựa chọn trong nhật ký ngày (chủ: F04-G05, OD-A7 (a)). **Lần đầu con thấy CA-05**, và luôn có dòng nhỏ cố định: "Khi con hay mệt vào những ngày có lịch dày, bố mẹ sẽ được báo là con hay mệt vào ngày nào. Bố mẹ không thấy con chọn gì từng ngày." (D-03: trẻ được biết) · câu chữ là `đề xuất nội bộ`; phạm vi "không thấy từng ngày" là nhánh an toàn, `chờ Owner quyết` UF-Q18 |
| 7 | CA-05 | Chọn **"Rất mệt"** | **Không tự đổi lịch** (D-10). Lời cho con (câu mẫu, không hứa đổi lịch): "Con thấy rất mệt. Con có muốn nhắn bố mẹ xin nghỉ thêm hôm nay không?" · `đề xuất nội bộ`. Nút theo mode của con (F01-G05-M01): **`PARENT_LED`/`UNSET`** → "Nhắn bố mẹ" mở CA-08 với mong muốn có sẵn "Hôm nay con rất mệt, con muốn nghỉ thêm và chỉ làm bài cô giao" (F5-B B1). **`CHILD_EXECUTED`** → "Đề xuất đổi lịch hôm nay" mở CA-09 với đề xuất điền sẵn theo QT G3: phục hồi thêm khoảng 15′ (**[MĐ]**), bỏ phần học theo định hướng bố mẹ hôm đó, giữ bài cô giao (F5-B B2). **`CHILD_DIRECTED`** → cũng mở CA-09 (đi bước đề xuất, đúng chữ của D-10); việc con tự sửa trong phạm vi qua CA-09b là thao tác riêng, không phải phản ứng tự động · `chờ Owner quyết` UF-Q19. Con có thể bỏ qua nút; lịch giữ nguyên |
| 8 | CA-04 | `[Nấc 2]` Bấm **🍎 "Con thấy đói"** | Ghi giờ (chủ: F04-G05, OD-A7 (a)). Lần đầu trong ngày vào hàng chờ của phụ huynh, kèm bữa gần nhất và bữa tiếp theo. Với con: chỉ nhắc uống nước hoặc chờ bữa sắp tới, không tự cho ăn (QT H5; TAB §4). A-lite E1 xếp là hoãn được |
| 9 | CA-04 khối Soạn cặp | `[Nấc 2]` Chọn "Ngày mai trời thế nào?" ☀️/🌧/🧥/🌤 | Hiện đồ cần mang; sáng hôm sau khối thay đồ nhắc lại (QT I4) |
| 10 | PA-11 Lịch tuần | Phụ huynh xem hôm nay | Thấy dấu ✓ và giờ con làm xong từng việc (TAB §4; F06-G05-M02) |
| 11 | PA-21 Tóm tắt tuần | Phụ huynh xem **xu hướng mệt liên quan đến lịch** | **Đã quyết (D-03).** F06-G04-M01 xét cửa sổ 2 tuần, không kết luận từ một ngày (QT L2). Chỉ hiện xu hướng gắn với lịch, ví dụ "2 tuần qua, con hay báo mệt vào những ngày có học thêm buổi tối". **Không** hiện từng lựa chọn Ổn/Hơi mệt/Rất mệt theo ngày, **không** hiện cảm xúc, **không** chép nguyên văn. Kèm câu hỏi về bối cảnh và một đề xuất cụ thể, không kết luận nguyên nhân (TAB §1.5; A-lite §2 bước 7). Ngưỡng số ngày để báo: `UNKNOWN`, chưa có nguồn (A-lite SG-16); khi chưa có ngưỡng đã duyệt, hệ thống **không báo** (fail-closed) · `chờ Owner quyết` UF-Q20. Thời hạn lưu dữ liệu hỏi thăm: `UNKNOWN` (cổng H4) |

### 5.2 Các bước – tóm tắt tuần

| # | Màn | Người dùng làm | Hệ thống phản hồi |
|---|---|---|---|
| 1 | PA-21 Tóm tắt tuần | Phụ huynh mở (từ thông báo hoặc tab) | Tổng hợp theo đối tượng xem (F06-G05-M01/M02; UC-015): việc đã xong theo ngày, ngày có ngoại lệ, giai đoạn tạm thời đang chạy, xu hướng mệt liên quan lịch nếu đủ điều kiện (bước 11). Phân biệt "đã bấm xong" (tự báo cáo) với tiến bộ năng lực (02.5 S04; 03.4 §6.4). Luồng xem lại tuần chi tiết: 04.2 luồng G1 |
| 2 | PA-21 | — | Ngày ốm, ngày nghỉ, ngày giảm tải **không tính là chưa hoàn thành** (QT K4; F06-G02-M02) |
| 3 | PA-21 | Bấm "Điều chỉnh" | Sang F5 hoặc F2 |
| 4 | CA-13 Tuần của con | Con xem tuần của mình | Chỉ thứ con được xem; không điểm, không so sánh với trẻ khác (TAB §4; CLAUDE) |

Tần suất và thời điểm gửi tóm tắt tuần: `UNKNOWN` (nguồn chưa nêu).

### 5.3 Nhánh ngoại lệ

| Mã | Tình huống | Xử lý |
|---|---|---|
| F4-X1 | Máy con từ chối `POST_NOTIFICATIONS` | Không có nhắc; tab Hôm nay vẫn dùng được; hiện hướng dẫn bật lại · `đề xuất nội bộ` |
| F4-X2 | Không có `SCHEDULE_EXACT_ALARM` (Android 14 mặc định tắt) | Nhắc sớm vài phút (PA §7) |
| F4-X3 | Máy ngủ, tiết kiệm pin làm nhắc trễ | Màn hướng dẫn bỏ tối ưu pin theo hãng (PA §7). Điều kiện đạt nhắc lệch ≤1 phút là mục tiêu test của Plan A, không phải quy tắc sản phẩm (PA §6) |
| F4-X4 | Lịch đổi trong ngày (F5) | Đặt lại toàn bộ lời nhắc (PA bước 3); CA-04 tải lịch mới; khối đã hủy biến mất |
| F4-X5 | Con bấm Xong khi ngoại tuyến | Ghi trên máy, đồng bộ khi có mạng; đây là ghi nhận thực hiện, không phải sửa lịch · `đề xuất nội bộ`, chờ System Design |
| F4-X6 | Con không mở app, không bấm gì | Không nhắc dồn; không coi là thất bại; phụ huynh thấy "chưa ghi nhận", không thấy "không làm" · `đề xuất nội bộ` |
| F4-X7 | Thông báo nhắc gửi thất bại | Tab Hôm nay vẫn đúng lịch; ghi lỗi vào nhật ký sự kiện (PA bước 1 có nhật ký giờ hẹn, giờ thật, độ lệch) |
| F4-X8 | **Con không có máy** | **Đã quyết (D-11):** không có F4 phía con. Phụ huynh vẫn xem lịch trên PA-11; không có ✓ từ con, không có hỏi thăm, không có xu hướng mệt. PA-21 ghi rõ "chưa có dữ liệu từ máy con", không ghi "không làm" |
| F4-X9 | `[Nấc 2]` Con nhập chữ tự do hoặc nói (🎤, Pal chat) có dấu hiệu nguy hiểm | Lớp an toàn chạy trước; CA-14 chỉ hiện lời "nói với người lớn con tin cậy", có thể kèm 111; **không** hiện 113, 115 cho trẻ; không tự báo gia đình; không gọi Claude (D-06; OD-03a). A-lite E1 không có ô chữ tự do phía con nên nhánh này không phát sinh. Luồng an toàn chi tiết: 04.2 luồng G8 |
| F4-X10 | `[Nấc 2]` Con báo ốm qua chữ tự do | Pal không chẩn đoán, không nêu liều thuốc; gợi ý báo bố mẹ (QT N1). Dấu hiệu khẩn (khó thở, co giật, bất tỉnh): với trẻ chỉ hiện lời "nói ngay với người lớn ở gần con", có thể kèm 111 (D-06). QT N2 ghi "gọi 115" nhưng D-06 dành 115 cho người lớn → cần đồng bộ QT N2 (mục 8.3) |
| F4-X13 | Con chọn "Rất mệt" nhiều ngày | Mỗi lần là tín hiệu mới (TAB §1.5), không tính là nhắc lại. Không tự đổi lịch (D-10). Xu hướng gửi phụ huynh theo bước 11 |
| F4-X11 | Gia đình nhiều con dùng chung một máy phụ huynh để xem | PA-11 và PA-21 luôn hiện tên con đang xem; đổi con qua PA-08 (CLAUDE) |
| F4-X12 | Con 11–14 tuổi (A3) | Ít khối hơn, con tự sắp xếp trong khối, xác nhận nhẹ hơn (QT G8, [NC] NT-07) |

### 5.4 Dữ liệu ghi nhận

Nhật ký ngày theo con: khối, giờ bấm Xong, cách xác nhận, hoàn tác (F06-G01-M01; nguồn dữ liệu F06-G01-M02 tùy chọn). Lựa chọn hỏi thăm (Ổn/Hơi mệt/Rất mệt) hoặc "bỏ qua" (chủ F04-G05); phụ huynh **chỉ** thấy xu hướng mệt liên quan lịch do F06-G04-M01 tính (D-03). Mốc con đã được báo về việc chia sẻ xu hướng (D-03). Mong muốn hoặc đề xuất phát sinh từ "Rất mệt" (F5-B). `[Nấc 2]`: báo đói (giờ báo, bữa gần nhất, bữa tiếp theo), lựa chọn thời tiết. Trạng thái gửi nhắc (giờ hẹn, giờ thật). Không lưu ghi âm gốc (02.5 S06 định hướng chung; chi tiết ngoài batch).

### 5.5 Liên kết

- **Feature IDs:** F04-G04-M01, F04-G05-M01 (gồm hỏi thăm và báo đói, OD-A7 (a)), F04-G05-M02 (`[Nấc 2]`), F04-G07-M01, F04-G07-M02, F06-G01-M01, F06-G01-M02, F06-G02-M01, F06-G02-M02, F06-G05-M01, F06-G05-M02, F06-G04-M01 (xu hướng mệt liên quan lịch, D-03), F01-G05-M01 (rẽ nhánh theo mode khi "Rất mệt"), F07-G05-M01 và F07-G01-M01 (lớp an toàn, nội dung tĩnh; `[Nấc 2]` ở phía con).
- **UC:** UC-009, UC-015; UC-010 (khi "Rất mệt" dẫn tới đề xuất).
- **Quy tắc:** QT F1, G3, G8, H5, I4, K4, L1, L2, N1, N2; TAB §1.5, §4; 02.5 S04, S09, R3; PA §2, §4, §6 bước 3, §7; **D-03, D-06, D-10, D-11, OD-A7**.

### 5.6 Sơ đồ

```mermaid
flowchart TD
  A([Đến giờ khối]) --> B{"Nhắc trên máy con"}
  B -- "Có quyền thông báo" --> C["CA-06 Thông báo có nút Xong"]
  B -- "Không có exact alarm" --> C0["Nhắc sớm vài phút"] --> C
  B -- "Bị từ chối quyền" --> C1["Không nhắc, hướng dẫn bật lại"]
  C --> D{"Con bấm"}
  D -- "Xong trên thông báo" --> L["Ghi hoàn thành + giờ"]
  D -- "Mở app" --> E
  C1 --> E["CA-04 Hôm nay: Bây giờ, Đã xong x/y, không điểm"]
  E --> F{"Loại xác nhận của khối"}
  F -- "Con bấm" --> F1["✓ Xong"] --> L
  F -. "Nấc 2: ảnh" .-> F2["📷 Chụp gửi"] --> L
  F -. "Nấc 2: giọng nói" .-> F3["🎤 Kể cho Pal"] --> S{"Lớp an toàn"}
  S -- Khẩn --> S1["CA-14 Nói với người lớn tin cậy, có thể kèm 111"]
  S -- "Bình thường" --> L
  F -- "Bố mẹ xác nhận" --> F4["Hiện: Chờ bố mẹ"]
  F -- "Khối nghỉ" --> F5["Không có nút"]
  L --> U{"Bấm nhầm?"}
  U -- Có --> U1["Hoàn tác"] --> E
  U -- Không --> P["PA-11 Phụ huynh thấy ✓ và giờ"]
  E --> K{"Khối hỏi thăm sau giờ học"}
  K -- "Bỏ qua / tắt" --> K0["Không hỏi lặp"]
  K -- "Ổn / Hơi mệt" --> K1["Ghi nhận"]
  K -- "Rất mệt" --> K2["Không tự đổi lịch (D-10); hỏi con có muốn nhắn bố mẹ"]
  K2 --> K3{"Mode của con"}
  K3 -- "PARENT_LED / UNSET" --> K4["CA-08 Mong muốn có sẵn gửi bố mẹ"]
  K3 -- "CHILD_EXECUTED / CHILD_DIRECTED" --> K5["CA-09 Đề xuất điền sẵn theo QT G3"]
  K3 -- "Con bỏ qua" --> K6["Lịch giữ nguyên"]
  K1 --> T["F06-G04-M01: xu hướng 2 tuần liên quan lịch (D-03)"]
  K2 --> T
  T --> T1{"Có ngưỡng đã duyệt?"}
  T1 -- "Chưa (UNKNOWN)" --> T2["Không báo, fail-closed (UF-Q20)"]
  T1 -- Có --> T3["PA-21 Xu hướng, không cảm xúc, không nguyên văn; con đã được báo"]
  P --> W["PA-21 Tóm tắt tuần: ngày ốm/nghỉ không tính là chưa xong"]
  W --> W1([F5 Thay đổi])
```

---

## 6. F5 – Thay đổi lịch

F5 có ba luồng con: **F5-A** giai đoạn tạm thời; **F5-B** đề xuất và mong muốn của con; **F5-C** thay đổi chỉ trong tuần này.

### 6.1 F5-A – Giai đoạn tạm thời (ôn thi, nghỉ lễ, theo chỉ định bác sĩ…)

| Mục | Nội dung |
|---|---|
| **Actor / App** | Phụ huynh · Parent App. Con chỉ khởi tạo qua F5-B |
| **Mode** | Phụ huynh tạo ở mọi mode. Đề xuất từ con phải có bố mẹ xác nhận mới áp dụng (QT J5) |
| **Entry point** | PA-11 "Thêm giai đoạn tạm thời"; chọn preset Thi cử/Nghỉ hè ở PA-09; `[Nấc 2]` Pal chat khi phụ huynh kể "con thi ngày 28/11…" (PROTO `renderChips`) |

| # | Màn | Người dùng làm | Hệ thống phản hồi |
|---|---|---|---|
| 1 | PA-18 Giai đoạn tạm thời | Nhập tên, lý do (ôn thi, chỉ định bác sĩ, hồi phục sau ốm, thi đấu, việc gia đình), từ ngày, **đến ngày** | Lý do chính đáng có thời hạn: app không phản đối, không giảng giải (QT J1). Bắt buộc có ngày kết thúc (QT J2). **Ngày kết thúc không quá 60 ngày** kể từ ngày bắt đầu; ô chọn ngày không cho chọn quá mốc này (D-09; P6-BP-OD-01). Form có cấu trúc [E1] là luồng A-lite E1 (A-lite SG-17: PROTO tạo giai đoạn qua LLM, dòng 497) |
| 2 | PA-18 | Chọn các kiểm tra muốn nới | **Chỉ được chọn:** `truoc_gio_hoc`, `van_dong`, `man_hinh`, `an_uong` (chỉ theo bác sĩ), `tong_gio_hoc` (QT J4). Không hiện lựa chọn nới C1, C2 (giữ ≥15′), C3, C7 (QT J4; TAB §3 "Sàn cố định không bao giờ được nới") |
| 3 | (hệ thống) | — | Kiểm **P6-BP-OD-01** và **D-09** (quyết định Owner): cùng một ràng buộc chỉ được nới **liên tục tối đa 60 ngày**, kể cả khi đổi mục đích, **không có ngoại lệ dài hơn**; giữa hai ngoại lệ **tương tự** (cùng phạm vi + ràng buộc + mục đích) phải có **≥7 ngày trống hoàn chỉnh**. Không đạt → không kích hoạt, nêu lý do |
| 4 | (hệ thống) | — | Kỳ dài hơn 6 tuần → đặt mốc xem lại mỗi 2 tuần (QT J2; TAB §3) – quy tắc sản phẩm |
| 5 | PA-18 | Đọc **một** cảnh báo nhẹ kèm 1 cách giữ cân bằng tối thiểu | Cảnh báo đúng một lần (QT J2, A2). Ăn uống/giảm cân chỉ theo đúng lời bác sĩ phụ huynh kể; không đặt calo hay mục tiêu cân; không nói về cân nặng với con (QT H6) |
| 6 | PA-18 | Bấm "Áp dụng" | Lưu bản lịch cũ để khôi phục (QT J2; PROTO `snapshotPlan`); lập bộ quy tắc tạm; dựng lại lịch (bước 9–14 F2); commit phiên bản mới (F04-G01-M01). Pal không tự đề xuất thêm giờ học, kể cả khi nhóm học đang được nới (QT A5) |
| 7 | PA-11 Thẻ giai đoạn | Xem "⏳ [tên] · từ → đến · Đang áp dụng · còn N ngày" + danh sách quy tắc tạm + dòng "Luôn giữ: đủ giờ ngủ, nghỉ sau giờ học ít nhất 15 phút, nghỉ ngắn giữa các khối học, không bỏ bữa" | PROTO `renderPlan` dòng ~345–350. Trong giai đoạn: không nhắc lại cảnh báo về những điều đã nới (QT J3); `checkDay` bỏ qua các mã đã nới (PROTO dòng 589–591) |
| 8 | PA-11 | (Tùy chọn) "Kết thúc sớm" | Chuyển sang hết hạn, sang bước 9 (PROTO `applyPeriod` "ket_thuc") |
| 9 | (hệ thống) | — | **Hết hạn hoặc kết thúc sớm: tự về lại lịch trước giai đoạn** (D-09; PROTO `revertPeriod`). Đây là commit do hệ thống thực hiện theo quyết định Owner, ghi lịch sử với lý do "hết hạn giai đoạn" (F04-G06-M02), idempotent; đặt lại nhắc trên máy con (F04-G07-M01). Quy tắc tạm **ngừng áp dụng đúng ngày hết hạn** kể cả khi commit khôi phục chưa chạy xong (fail-closed về phía bảo vệ con) · cách thực thi khi máy ngoại tuyến `chờ Owner quyết` UF-Q21. Lịch đang `LOCK` không chặn việc khôi phục này, vì khôi phục thu hẹp ngoại lệ chứ không nới · `đề xuất nội bộ`, `chờ Owner quyết` UF-Q21 |
| 10 | PA-15 → PA-19 | Sau khi đã khôi phục: nhận thông báo "Giai đoạn [tên] đã kết thúc, lịch đã về như trước" | Thông báo chỉ gửi sau commit (0.6 mục 5). Phần đổi lại tô đỏ (QT K2). Phụ huynh có thể sửa lịch mẫu qua F2 như bình thường (không còn quy tắc nới). **Bỏ** ba lựa chọn của QT J6 ("quay về", "nhờ Pal sắp xếp lại", "giữ lịch hiện tại"): D-09 thắng QT J6 · cần đồng bộ QT J6 và PROTO `checkPeriodExpiry` (mục 8.3) |
| 11 | (hệ thống) | — | Nếu trong giai đoạn phụ huynh đã sửa thẻ hoạt động hay giờ học, bản lịch cũ có thể không còn khớp: khôi phục bản cũ, rồi hiện "Lịch tuần chưa cập nhật" + nút "Xếp lại lịch"; không tự xếp lại (QT E5) · `đề xuất nội bộ` |

**Nhánh ngoại lệ F5-A**

| Mã | Tình huống | Xử lý |
|---|---|---|
| F5A-X1 | Thiếu ngày kết thúc | Không áp dụng; hỏi ngày kết thúc (QT J2) |
| F5A-X2 | Vượt 60 ngày liên tục cho cùng ràng buộc, hoặc chưa đủ 7 ngày trống | Không kích hoạt; nêu lý do (P6-BP-OD-01). **Đã quyết (D-09):** không có luồng xin dài hơn 60 ngày. Muốn tiếp, phải chờ đủ 7 ngày trống rồi tạo giai đoạn mới; hoặc sửa lịch mẫu thường trong giới hạn không nới |
| F5A-X3 | Giai đoạn đè lên giai đoạn đang chạy | Chưa có quy tắc (P6-BP §3 "tương tác ngoại lệ khác loại: UNKNOWN"). Nhánh mặc định an toàn: không cho kích hoạt giai đoạn thứ hai khi giai đoạn khác đang chạy · `chờ Owner quyết` UF-Q08 |
| F5A-X10 | Phụ huynh sửa ngày kết thúc khi đang chạy | Ngày mới vẫn phải ≤ 60 ngày tính từ ngày bắt đầu ban đầu (D-09; P6-BP-OD-01 "liên tục") |
| F5A-X4 | Đề xuất giai đoạn từ con (`CHILD_EXECUTED`) | Trạng thái "Chờ bố mẹ xác nhận", chưa áp vào lịch, chưa lưu bản lịch cũ (QT J5; TAB §3; PROTO `applyPeriod` `cho_xac_nhan`) → PA-17. Đề xuất cũng bị giới hạn 60 ngày (D-09) |
| F5A-X5 | Đề xuất giai đoạn từ con khi `CHILD_DIRECTED` | Chưa xác định giai đoạn tạm thời có nằm trong phạm vi ủy quyền không · mục 8, UF-Q05. Tạm xử lý như CR chờ phụ huynh (đạt cả QT J5 và B01-CR-OD-01 "ngoài phạm vi → CR") · `chờ Owner quyết` |
| F5A-X6 | Con báo "Rất mệt" lặp lại trong giai đoạn | Lịch không tự đổi (D-10). Xu hướng mệt liên quan lịch vẫn báo phụ huynh theo F4 bước 11 (D-03), **kể cả trong giai đoạn**, vì là tín hiệu mới, không phải cảnh báo nhắc lại về điều đã nới (TAB §1.5; QT J3) · việc báo trong giai đoạn là `đề xuất nội bộ` (TAB §3 và QT P ghi còn mở), `chờ Owner quyết` UF-Q22 |
| F5A-X7 | Gắn giai đoạn với preset, hết hạn tự về "Bình thường" | Một phần đã rõ: hết hạn tự về **lịch trước giai đoạn** (D-09), gồm cả preset đang dùng trước giai đoạn · `đề xuất nội bộ` suy từ D-09. Việc tự gắn preset khi tạo giai đoạn vẫn **chưa chốt** (TAB §3; QT P) |
| F5A-X8 | Thông báo hết hạn gửi thất bại | Lịch đã khôi phục vẫn có hiệu lực; thẻ giai đoạn trên PA-11 hiện "Đã kết thúc, lịch đã về như trước"; thử gửi lại |
| F5A-X9 | Lịch đang `LOCK` | Không **bắt đầu** giai đoạn tới khi unlock hoặc `authorized override` (B01-PS-OD-04). Việc **khôi phục khi hết hạn**: xem bước 9, UF-Q21 |

### 6.2 F5-B – Mong muốn và đề xuất của con

| Mục | Nội dung |
|---|---|
| **Actor / App** | Con (Child App) gửi; phụ huynh (Parent App) xem, duyệt |
| **Mode** | Rẽ nhánh theo mode hiệu lực của **con đó** (B01-MS-OD-01). `PARENT_LED`/`UNSET`: chỉ gửi mong muốn. `CHILD_EXECUTED`: tạo đề xuất (CR). `CHILD_DIRECTED`: sửa trực tiếp trong phạm vi, ngoài phạm vi dùng CR |
| **Entry point** | CA-07 "Thời gian của con" (con xem quỹ, không sửa – TAB §4; QT L3); hoặc nút sau khi chọn "Rất mệt" ở CA-05 (D-10, F4 bước 7) |
| **A-lite E1** | B1 và B2 là luồng A-lite v2 (A-lite §2 bước 4). B3 (`CHILD_DIRECTED`) **không có** trong A-lite v2 (CRG C-01); bản này vẽ đủ để Owner chọn, nhánh mặc định an toàn là **ẩn lựa chọn `CHILD_DIRECTED` ở PA-12 trong A-lite E1** · `chờ Owner quyết` UF-Q23 |

| # | Màn | Người dùng làm | Hệ thống phản hồi |
|---|---|---|---|
| 1 | CA-07 | Con xem quỹ thời gian (chỉ xem) | Máy chủ đọc mode hiệu lực của con, quyết định nút hiện ra (F01-G05-M01; F01-G04-M01) |
| **B1** | **`PARENT_LED` / `UNSET`** | | |
| B1.1 | CA-08 Gửi mong muốn | Bấm "Con muốn nói với bố mẹ"; chọn loại mong muốn có sẵn (ví dụ: "con mệt, muốn nghỉ thêm hôm nay", "con muốn thêm giờ chơi", "con muốn đổi giờ một việc") và, nếu cần, chọn ngày/khối liên quan | Không tạo Change Request, không có trạng thái duyệt, không đổi lịch (B01-CR §2; B01-MS-OD-02 regression 4; D-10). Ở A-lite E1 **chỉ có lựa chọn có sẵn, không chữ tự do** (A-lite SG-10; nhánh an toàn tránh FR-03). B01C-OD-08 giao kênh này cho "AI communication của F05", nhưng A-lite E1 không có AI → kênh có cấu trúc, module chủ chưa gán · `chờ Owner quyết` UF-Q24 (CRG C-04). `[Nấc 2]`: thêm chữ tự do qua lớp an toàn |
| B1.2 | PA-16 Hàng chờ "Con đề xuất và báo" | Phụ huynh xem; "Để sau" hoặc tự sửa lịch (F2/F5-C) | Mong muốn vào hàng chờ ở màn Lên kế hoạch (QT L3; PROTO dòng 853–864). Phụ huynh sửa lịch là thao tác của phụ huynh, không phải "duyệt" |
| **B2** | **`CHILD_EXECUTED`** | | |
| B2.1 | CA-09 Tạo đề xuất | Con chọn ngày/khối, đổi giờ hoặc đổi việc; chọn lý do có sẵn (E1, không chữ tự do); "Lưu nháp" hoặc "Gửi bố mẹ". Từ "Rất mệt": đề xuất điền sẵn theo QT G3 | Chạy kiểm cân bằng và xung đột (F04-G02-M02, -M03). Phạm `protected_hard_cap` → nháp vẫn lưu và gửi được để thảo luận, trạng thái `VIEWABLE_FOR_DISCUSSION / NOT_APPROVABLE`, cảnh báo rõ mức vi phạm (B01-CR-OD-05). Phạm soft-cap → hiện cần chỉnh hoặc cần ngoại lệ hợp lệ |
| B2.2 | (hệ thống) | — | Tạo CR `PENDING`, gắn phiên bản lịch gốc, người gửi, epoch mode/policy/lock, thời điểm gửi theo giờ máy chủ (B01-CR-OD-02, -04). Chuyển tới người quản lý lịch có quyền (F04-G03-M02). Báo phụ huynh sau khi CR được ghi. Không có Primary hợp lệ → vẫn nhận CR, chờ đến khi có người có quyền (P5-R-FC; CRG C-03). Supporter/Observer không duyệt được (B01-CR-OD-03) |
| B2.2b | (hệ thống) | — | Đề xuất đổi lịch **hôm nay** (ví dụ từ "Rất mệt"): nếu phụ huynh không duyệt trước khi khối liên quan bắt đầu, khối vẫn chạy theo lịch cũ; CR vẫn chờ tới hạn 7 ngày hoặc tới khi phụ huynh quyết · việc CR "hôm nay" trở nên vô nghĩa sau hết ngày: `chờ Owner quyết` UF-Q25 |
| B2.3 | CA-10 Trạng thái đề xuất | Con thấy "Đang chờ bố mẹ" | — |
| B2.4 | PA-17 Chi tiết đề xuất | Phụ huynh xem phần đổi (tô đỏ), kết quả kiểm; bấm **Duyệt** hoặc **Không duyệt** | Duyệt chỉ được khi không phạm hard-cap; soft-cap cần xác nhận "Giữ mức này" hoặc sửa (B01-CR-OD-05). Lời Pal trong chat không phải bằng chứng duyệt (03.4 UC-010) |
| B2.5 | (hệ thống) | — | Duyệt → kiểm lại quyền, phiên bản, lock, cân bằng → commit phiên bản mới (F04-G01-M01) → lịch sử (F04-G06-M02) → đặt lại nhắc → báo con. `APPROVED ≠ APPLIED` (B01-CR §2). CR đã duyệt nhưng chưa áp có hiệu lực **tối đa 7 ngày kể từ lúc duyệt** (B01C-OD-03). Không duyệt → giữ lịch cũ, báo con (03.4 UC-010) |
| **B3** | **`CHILD_DIRECTED`** | | |
| B3.1 | CA-09b Sửa lịch | Con sửa trong phạm vi được ủy quyền | Sửa trực tiếp không cần CR, nhưng vẫn qua Access Policy, mode, lock, phiên bản, Balanced Planning, hard-cap, audit (B01-CR-OD-01). Ngoài phạm vi → thành CR như B2 |
| B3.2 | PA-11 | Phụ huynh xem; có thể `overwrite` hoặc `lock` | Lock có phạm vi, người khóa, thời điểm, phiên bản, audit; AI không tự lock (B01-MS-OD-02; B01-PS-OD-04). Thời hạn khóa tối đa: chưa chốt (B01-PS-OD-04) |

**Nhánh ngoại lệ F5-B**

| Mã | Tình huống | Xử lý |
|---|---|---|
| F5B-X1 | CR chờ quá **7 ngày** (quyết định Owner) | Tự hết hạn, tính từ thời điểm gửi hợp lệ theo giờ máy chủ; con có thể tạo CR mới (B01-CR-OD-04) |
| F5B-X2 | Lịch đổi phiên bản khi CR đang chờ | CR chuyển "cần đánh giá lại", không tự duyệt/áp; CR đã duyệt chưa áp → vô hiệu, cần CR mới (B01-CR-OD-02 i) |
| F5B-X3 | Lịch bị lock | CR chờ vẫn xem được nhưng không áp; CR đã duyệt chưa áp → vô hiệu (B01-CR-OD-02 ii) |
| F5B-X4 | Đổi Primary Caregiver | **Đã quyết (D-07):** quyền đã cấp cho con (mode, phạm vi ủy quyền sửa lịch) **giữ nguyên**, không tạm ngưng, không chuyển `REVIEW_REQUIRED` (B01-CL-OD-03, B01C-OD-01). CR chờ chuyển cho người có quyền mới; CR đã duyệt chưa áp phải duyệt lại (B01-CR-OD-02 iii; B01C-OD-01). Luồng đổi người quản lý: 04.2 luồng G4 |
| F5B-X5 | Phụ huynh đổi mode làm con mất quyền (ví dụ về `PARENT_LED`) | Cả CR chờ và CR đã duyệt chưa áp đều vô hiệu (B01-CR-OD-02 iv) |
| F5B-X6 | Duyệt xong nhưng commit bị timeout | Đối soát trạng thái thật trước khi thử lại; không tạo trùng phiên bản (B01-CR-OD-04) |
| F5B-X7 | Con ngoại tuyến, gửi đề xuất với mode/lịch cũ | Máy chủ kiểm lại; xung đột thì từ chối, không ghi đè im lặng (B01-MS-OD regression 7) |
| F5B-X8 | Con ở `PARENT_LED` cố gửi CR qua API | Từ chối (B01-MS-OD regression 4) |
| F5B-X11 | Mong muốn ở `PARENT_LED` không ai xem | Không hết hạn, không đổi lịch; con thấy "đã gửi" · việc báo con "bố mẹ đã xem" và hạn của mong muốn: `chờ Owner quyết` UF-Q06 |
| F5B-X9 | `[Nấc 2]` Con nhờ Pal giúp diễn đạt đề xuất | Lớp an toàn → ẩn danh → Pal [E2] lắng nghe, giúp con nói lý do (02.5 S05; UC-012). Pal không duyệt, không tự ghi (03.4 §7) |
| F5B-X10 | Mong muốn của con là than mệt, đói, thiếu giờ chơi | Là tín hiệu mới, không tính là nhắc lại (TAB §1.5). Bản thân mong muốn hiện cho phụ huynh ở PA-16 vì con chủ động gửi. Xu hướng mệt liên quan lịch báo theo F4 bước 11 (D-03) |

### 6.3 F5-C – Thay đổi chỉ trong tuần này

| Mục | Nội dung |
|---|---|
| **Actor / App** | Phụ huynh · Parent App |
| **Mode** | Phụ huynh commit ở mọi mode. Con yêu cầu thì đi qua F5-B theo mode |
| **Entry point** | PA-11 chọn một ngày → "Đổi chỉ tuần này"; nhánh Pal chat: "Thứ Năm tuần này con bị ốm, hủy toàn bộ lịch" (PROTO `renderChips`) |

| # | Màn | Người dùng làm | Hệ thống phản hồi |
|---|---|---|---|
| 1 | PA-20 Đổi chỉ tuần này | Chọn loại: nghỉ một buổi, học bù, ốm hủy cả ngày, khác; nhập lý do | Không sửa danh sách hoạt động (QT E3). Không rõ là lâu dài hay một lần → hỏi 1 câu (QT K3) |
| 2 | (hệ thống) | — | Xác định mọi ngày bị ảnh hưởng, kể cả tối hôm trước và sáng hôm sau (QT K1, G5) |
| 3 | (hệ thống) | — | **Ốm hủy cả ngày:** các khối cũ chuyển trạng thái hủy, giữ tên; thêm khối cho bố mẹ: báo nghỉ, theo dõi sức khỏe, tối quyết định lịch hôm sau (QT K4) |
| 4 | PA-10 | Xem trước; chỉ những ngày có đổi; khối không đổi giữ nguyên từng chữ, phần đổi tô đỏ (QT K2) | Chạy lại `checkDayK`, xung đột, cân bằng |
| 5 | PA-10 | Bấm Lưu | Ghi ngoại lệ `chi_tuan_nay` kèm lý do (PROTO `cap_nhat_ngay` dòng 431–439); đặt lại nhắc; báo máy con |
| 6 | PA-11 | (Tùy chọn) "Bỏ ngoại lệ" | Quay về lịch mẫu cho ngày đó (PROTO `xoa_ngoai_le` dòng 450–452) |
| 7 | PA-21 | — | Ngày ốm không tính là chưa hoàn thành (F06-G02-M02) |

**Nhánh ngoại lệ F5-C**

| Mã | Tình huống | Xử lý |
|---|---|---|
| F5C-X1 | Thay đổi thật ra là lâu dài (đổi lịch học, đổi giờ cố định) | Sửa lịch mẫu tuần hoặc sửa thẻ hoạt động (QT E3, K3) → "Lịch tuần chưa cập nhật" + nút xếp lại; không tự xếp lại (QT E5) |
| F5C-X2 | Học bù trùng giờ khối khác | Kiểm xung đột, hiện trade-off (F04-G02-M02; UC-010) |
| F5C-X3 | Phụ huynh nhập lý do có dấu hiệu khẩn (khó thở, co giật, bất tỉnh) | Bộ kiểm từ khóa [E1] trên ô lý do (0.6 mục 1): hiện PA-24 cho người lớn với 115 (QT N2; OD-03b). Không chẩn đoán, không nêu liều thuốc (QT N1). Vẫn cho lưu ngoại lệ ốm |
| F5C-X4 | Hết tuần | Ngoại lệ tự hết hiệu lực khi sang tuần mới: **chưa có quy tắc**; PROTO lưu ngoại lệ theo thứ (T2…CN), không theo ngày, nên không tự hết · mục 8, UF-Q09 |
| F5C-X5 | Nhiều con cùng nghỉ (ví dụ ngày lễ) | Hỏi áp cho con nào; không mặc định áp cho tất cả (CLAUDE) · cách hỏi là `đề xuất nội bộ` |
| F5C-X6 | Lịch đang lock | Như F2-X10 |

### 6.4 Dữ liệu ghi nhận (F5)

Giai đoạn: tên, lý do, nguồn (`bo_me`/`con_de_xuat`), từ ngày, đến ngày (≤60 ngày, D-09), danh sách mã nới, quy tắc tạm, bản lịch cũ, trạng thái (`cho_xac_nhan`, `dang_ap_dung`, `het_han`, `da_ket_thuc`), mốc xem lại, ngày kết thúc sớm, thời điểm và kết quả commit khôi phục tự động. CR: người gửi, phiên bản gốc, epoch mode/policy/lock, thời điểm gửi (giờ máy chủ), trạng thái (`PENDING`, `REASSESSMENT`, `APPROVED`, `APPLIED`, `REJECTED`, `EXPIRED`, `INVALIDATED`, `VIEWABLE_FOR_DISCUSSION/NOT_APPROVABLE`), người duyệt, khóa idempotency. Mong muốn (`PARENT_LED`): loại, chữ kèm theo, ngày, trạng thái đã xem. Ngoại lệ tuần: ngày, khối, lý do. Lock: phạm vi, người khóa, thời điểm, phiên bản.

### 6.5 Liên kết (F5)

- **Feature IDs:** F04-G06-M01, F04-G06-M02, F04-G03-M02, F04-G01-M01, F04-G02-M02, F04-G02-M03, F01-G05-M01, F01-G04-M01, F04-G07-M01, F06-G02-M02; F05-G01-M01 (nhánh Pal của con, UC-012).
- **UC:** UC-010, UC-008, UC-012 (nhánh Pal chat).
- **Quy tắc:** QT A2, A5, E3, E5, G5, H6, J1–J5 (J6 bị D-09 thay), K1–K4, L3, N1, N2; TAB §1.5, §3, §4; P6-BP-OD-01, -02; B01-CR-OD-01…05 và §2; B01-MS-OD-01, -02, -04; B01-PS-OD-01, -04; B01C-OD-01, -03, -08; P5-OD-03, P5-R-FC; **D-03, D-07, D-09, D-10**; CRG C-01, C-03, C-04.

### 6.6 Sơ đồ F5-A

```mermaid
flowchart TD
  A([PA-11 Thêm giai đoạn tạm thời]) --> B["PA-18 Tên, lý do, từ ngày, đến ngày"]
  B --> B1{"Có ngày kết thúc, không quá 60 ngày? (D-09)"}
  B1 -- Không --> B
  B1 -- Có --> C["Chọn mã được nới: chỉ danh sách J4"]
  C --> D{"P6-BP-OD-01 + D-09: tối đa 60 ngày liên tục, 7 ngày trống, không gia hạn"}
  D -- "Không đạt" --> D1["Không kích hoạt, nêu lý do"]
  D -- Đạt --> E{"Dài hơn 6 tuần?"}
  E -- Có --> E1["Đặt mốc xem lại mỗi 2 tuần"] --> F
  E -- Không --> F["Cảnh báo nhẹ đúng 1 lần + 1 cách giữ cân bằng"]
  F --> G["Áp dụng: lưu lịch cũ, quy tắc tạm, dựng lại, commit"]
  G --> H["PA-11 Thẻ giai đoạn: không nhắc lại điều đã nới"]
  H --> I{"Kết thúc"}
  I -- "Kết thúc sớm" --> J
  I -- "Đến hạn" --> J["Quy tắc tạm ngừng đúng ngày; tự commit về lịch trước giai đoạn (D-09)"]
  J --> J1["Lịch sử: lý do hết hạn; đặt lại nhắc máy con"]
  J1 --> J2{"Thẻ hoạt động / giờ học đã đổi trong giai đoạn?"}
  J2 -- Có --> J3["Lịch tuần chưa cập nhật + nút Xếp lại lịch, không tự xếp"]
  J2 -- Không --> J4
  J3 --> J4["PA-19 Báo phụ huynh sau commit: lịch đã về như trước"]
  K([Đề xuất giai đoạn từ con]) --> K1{"Mode của con"}
  K1 -- "PARENT_LED" --> K2["Chỉ là mong muốn, PA-16"]
  K1 -- "CHILD_EXECUTED" --> K3["Chờ bố mẹ xác nhận, chưa áp"] --> B
  K1 -- "CHILD_DIRECTED" --> K4["Tạm xử lý như CR: chờ Owner quyết UF-Q05"] --> K3
```

### 6.7 Sơ đồ F5-B

```mermaid
flowchart TD
  A([CA-07 Con xem quỹ thời gian]) --> M{"Mode hiệu lực của con"}
  R([CA-05 Con chọn Rất mệt, D-10]) --> M
  M -- "PARENT_LED / UNSET" --> P1["CA-08 Gửi mong muốn, chỉ lựa chọn có sẵn (E1)"]
  P1 --> P2["PA-16 Hàng chờ, không có trạng thái duyệt"]
  P2 --> P3{"Phụ huynh"}
  P3 -- "Để sau" --> P4([Kết thúc])
  P3 -- "Tự sửa lịch" --> P5([F2 / F5-C])
  M -- "CHILD_EXECUTED" --> E1["CA-09 Tạo đề xuất"]
  E1 --> E2{"Kiểm cân bằng"}
  E2 -- "Phạm hard-cap" --> E3["VIEWABLE_FOR_DISCUSSION / NOT_APPROVABLE"]
  E2 -- "Phạm soft-cap" --> E4["Cần chỉnh hoặc ngoại lệ hợp lệ"]
  E2 -- Đạt --> E5
  E3 --> E5["Gửi: CR PENDING, gắn phiên bản, giờ máy chủ"]
  E4 --> E5
  E5 --> E6["PA-17 Phụ huynh xem"]
  E6 --> E7{"Bối cảnh đổi trước khi quyết?"}
  E7 -- "Quá 7 ngày" --> X1["EXPIRED, con tạo CR mới"]
  E7 -- "Đổi phiên bản" --> X2["REASSESSMENT"]
  E7 -- "Lock / mất quyền / lưu trữ" --> X3["Không áp / INVALIDATED"]
  E7 -- "Đổi Primary (D-07)" --> X4["CR chờ chuyển người mới; đã duyệt chưa áp phải duyệt lại; quyền của con giữ nguyên"]
  E7 -- "Không có Primary hợp lệ" --> X5["Giữ PENDING, chặn duyệt (P5-OD-03)"]
  E7 -- Không --> E8{"Duyệt?"}
  E8 -- "Không duyệt" --> E9["Giữ lịch cũ, báo con"]
  E8 -- "Duyệt, còn hard-cap" --> E3
  E8 -- "Duyệt hợp lệ" --> E10["Kiểm lại, commit, lịch sử, đặt lại nhắc, báo con; đã duyệt chưa áp tối đa 7 ngày"]
  M -- "CHILD_DIRECTED (A-lite E1: mặc định ẩn, UF-Q23)" --> D1{"Trong phạm vi ủy quyền và không lock?"}
  D1 -- Có --> D2["Sửa trực tiếp qua đủ kiểm tra, audit"]
  D1 -- "Ngoài phạm vi" --> E1
  D1 -- "Đang lock" --> D3["Từ chối, fail-closed"]
  D2 --> D4["Phụ huynh có thể overwrite / lock"]
```

### 6.8 Sơ đồ F5-C

```mermaid
flowchart TD
  A([PA-11 Chọn ngày: Đổi chỉ tuần này]) --> A1{"Nhiều con?"}
  A1 -- Có --> A2["Hỏi áp cho con nào"] --> B
  A1 -- Không --> B["PA-20 Loại thay đổi + lý do"]
  B --> C{"Lâu dài hay một lần?"}
  C -- "Không rõ" --> C1["Hỏi 1 câu"] --> C
  C -- "Lâu dài" --> C2["Sửa lịch mẫu / thẻ hoạt động, chờ nhờ xếp lại"]
  C -- "Một lần" --> D["Xác định ngày ảnh hưởng: tối trước, sáng sau"]
  D --> E{"Ốm hủy cả ngày?"}
  E -- Có --> E1["Khối cũ: hủy, giữ tên; thêm khối cho bố mẹ"]
  E -- Không --> E2["Dời / bù khối"]
  E1 --> F
  E2 --> F["Kiểm checkDayK, xung đột, cân bằng"]
  F --> G["PA-10 Chỉ ngày có đổi, phần đổi tô đỏ"]
  G --> H["Lưu ngoại lệ tuần này, đặt lại nhắc, báo máy con"]
  H --> I["PA-21 Ngày ốm không tính là chưa xong"]
  B -. "Dấu hiệu khẩn" .-> S["PA-24 Thông tin 115"]
```

---

## 7. Danh mục màn hình

Cột **Phạm vi**: `E1` = có trong A-lite E1; `E1 (một phần)` = màn có trong E1 nhưng một số thành phần là nấc 2; `Nấc 2` = chỉ có ở A-lite Plan A (OD-A2 (c)).

### 7.1 Parent App (24 màn)

| Mã | Tên màn | Dùng ở | Phạm vi | Ghi chú |
|---|---|---|---|---|
| PA-01 | Chào mừng / Đăng ký – Đăng nhập | F1 | E1 | Spike dùng mã gia đình; pilot gia đình thật dùng tài khoản FR-01 (OD-A8) |
| PA-02 | Đồng ý và quyền riêng tư | F1 | E1 | Consent `SELF_DECLARED`. Luồng xem, rút đồng ý: 04.2 G6 |
| PA-03 | Hồ sơ gia đình (danh sách con, trạng thái ghép, con có thiết bị không) | F1, F3 | E1 | Thêm câu hỏi thiết bị (D-11) |
| PA-04 | Thêm con – thông tin cơ bản | F1 | E1 | |
| PA-05 | Giờ học và thời khóa biểu | F1, F2 | E1 | Điểm bắt đầu (OD-A1) |
| PA-06 | Hồ sơ bổ sung (tùy chọn) | F1 | E1 | Mục tiêu tùy chọn (OD-A1); trường sức khỏe ẩn khi dùng dữ liệu thật (UF-Q16) |
| PA-07 | Hoạt động của con (khung thẻ, dải T2…CN, tổng giờ/tuần) | F1, F2, F5-C | E1 | |
| PA-07a | Form thẻ hoạt động | F1 | E1 | Form con của PA-07, không tính là màn riêng |
| PA-08 | Chọn con | F1–F5 | E1 | Bắt buộc khi nhiều con và chưa nêu con |
| PA-09 | Lên kế hoạch – Quỹ giờ (6 nhóm × 2 cột, preset) | F2, F5-A | E1 | Ô Ngủ đỏ không có nút giữ (D-02) |
| PA-10 | Xem trước lịch tuần / kết quả kiểm | F2, F5-C | E1 | Không màu |
| PA-11 | Lịch tuần (chi tiết ngày, ✓ và giờ, thẻ giai đoạn) | F2, F4, F5 | E1 | |
| PA-12 | Chế độ tự chủ của con | F5-B | E1 | Chuyển mode thuộc F01-G05-M02, chưa chạy trong batch thiết kế B01 (B01-MS §4). `CHILD_DIRECTED` mặc định ẩn ở E1 (UF-Q23) |
| PA-13 | Ghép máy của con | F3 | E1 | |
| PA-14 | Parent PIN (đặt / đổi) | F3 | E1 | Chi tiết chờ System Design. Bắt buộc trước pilot gia đình thật (OD-A8) |
| PA-15 | Thông báo | F3, F4, F5 | E1 | Luồng thông báo: 04.2 G3 |
| PA-16 | Hàng chờ "Con đề xuất và báo" | F4, F5-B | E1 | Nằm ở tab Lên kế hoạch (QT L3). Báo đói là `Nấc 2` |
| PA-17 | Chi tiết đề xuất / Change Request | F5-A, F5-B | E1 | |
| PA-18 | Giai đoạn tạm thời – tạo, sửa | F5-A | E1 | Ngày kết thúc ≤60 ngày (D-09) |
| PA-19 | Giai đoạn đã kết thúc – lịch đã về như trước | F5-A | E1 | Không còn 3 lựa chọn (D-09). Có thể là trạng thái của thẻ trên PA-11 |
| PA-20 | Đổi chỉ tuần này | F5-C | E1 | |
| PA-21 | Tóm tắt tuần | F4, F5 | E1 | Có mục xu hướng mệt liên quan lịch (D-03) |
| PA-22 | Trò chuyện với Pal | F1, F2, F5 | **Nấc 2** | Chủ: F07-G03 entry, F03-G05 outcome (OD-A6 (b)) |
| PA-23 | Xin quyền thông báo | F2, F4 | E1 | Plan A §7 |
| PA-24 | Thông tin hỗ trợ khẩn cấp cho người lớn (115/113/111, tĩnh) | ô chữ tự do Parent App | E1 | D-06; OD-03b |

Đếm: 25 mục, PA-07a là form con → **24 màn Parent App** (23 E1, 1 nấc 2).

### 7.2 Child App (16 màn)

| Mã | Tên màn | Dùng ở | Phạm vi | Ghi chú |
|---|---|---|---|---|
| CA-01 | Chào / chưa ghép | F3 | E1 | |
| CA-02 | Mã ghép | F3 | E1 | Mã một lần, có hạn |
| CA-03 | Ghép thành công | F3 | E1 | |
| CA-04 | Hôm nay | F4 | E1 (một phần) | ✓ Xong, Hoàn tác là E1. 📷, 🎤, 🍎, thời tiết là nấc 2 |
| CA-05 | Hỏi thăm sau giờ học | F4 | E1 | Tùy chọn; có dòng báo con về việc bố mẹ nhận xu hướng (D-03); "Rất mệt" không đổi lịch (D-10) |
| CA-06 | Thông báo nhắc (của hệ điều hành) có nút "Xong" | F4 | E1 | |
| CA-07 | Thời gian của con (quỹ, chỉ xem) | F5-B | E1 | |
| CA-08 | Gửi mong muốn | F5-B, F4 | E1 | `PARENT_LED`/`UNSET`; chỉ lựa chọn có sẵn |
| CA-09 | Tạo đề xuất | F5-B, F4 | E1 | `CHILD_EXECUTED`; và `CHILD_DIRECTED` ngoài phạm vi |
| CA-09b | Sửa lịch trong phạm vi | F5-B | E1, mặc định ẩn | `CHILD_DIRECTED` (UF-Q23) |
| CA-10 | Trạng thái đề xuất | F5-B | E1 | |
| CA-11 | Cài đặt | F3 | E1 | |
| CA-12 | Nhập Parent PIN | F3 | E1 | |
| CA-13 | Tuần của con | F4 | E1 | |
| CA-14 | Lời an toàn cho trẻ ("nói với người lớn con tin cậy", có thể kèm 111; tĩnh) | F4, F5 | **Nấc 2** | Phát sinh khi có ô chữ tự do hoặc giọng nói phía con. Không hiện 113, 115 (D-06; OD-03a). 04.2 G8 đề xuất thêm lối vào tĩnh "Con cần giúp đỡ" ở E1 (UF-Q37); nếu Owner chọn, màn này thành E1 |
| CA-15 | Xin quyền thông báo | F3, F4 | E1 | |

Đếm: **16 màn Child App** (gồm CA-09b; 15 E1, 1 nấc 2).

**Tổng: 40 màn** (24 Parent App + 16 Child App; 38 E1, 2 nấc 2), chưa gồm màn hướng dẫn tắt tối ưu pin theo hãng (PA §7) và màn Phòng thử của Plan A (chỉ cho spike). Các màn mới của đợt 2 đánh số từ PA-25 và CA-16, xem `User_Flow_04_2_Remaining_Flows.md`.

---

## 8. Quyết định và câu hỏi

### 8.1 Quyết định Owner đã áp (OD-1115)

| Mã | Câu hỏi | Quyết định | Ảnh hưởng tới flow |
|---|---|---|---|
| OD-A1 | Bắt đầu từ mục tiêu hay thời khóa biểu | **Đã quyết:** (a) thời khóa biểu, mục tiêu tùy chọn | F1, F2 |
| OD-A2 | A-lite E1 hay biến thể Pal chat | **Đã quyết:** (c) E1 trước, Plan A là nấc 2 | F1, F2, F4, F5; mọi nhãn `[Nấc 2]` |
| OD-A6 | Chủ module hội thoại Pal với phụ huynh | **Đã quyết:** (b) F07-G03 entry, F03-G05 outcome | PA-22 (nấc 2) |
| OD-A7 | L3 sở hữu tín hiệu mệt/đói | **Đã quyết:** (a) F04-G05 | F4 bước 6–8 |
| OD-A8 | Mã gia đình hay tài khoản + PIN | **Đã quyết:** (b) mã gia đình chỉ trong spike; FR-01 trước pilot gia đình thật | F3, PA-01, PA-14 |

### 8.2 Bảng UF-Q

| Mã | Câu hỏi | Flow | Trạng thái | Ghi chú / nhánh đang vẽ |
|---|---|---|---|---|
| UF-Q01 | Ô Ngủ dưới mức tối thiểu: chặn hay "Giữ mức này"? | F2 | **Đã quyết – D-02** | Không có nút giữ cho ô Ngủ. Phần ô cam: UF-Q14 |
| UF-Q02 | Dữ liệu hỏi thăm có hiện cho phụ huynh không, dạng nào? | F4, F5 | **Đã quyết – D-03** | Chỉ xu hướng mệt liên quan lịch; con được biết. Còn mở: ngưỡng (UF-Q20), phạm vi hiển thị (UF-Q18), thời hạn lưu (H4) |
| UF-Q03 | "Rất mệt" có tự đổi lịch hôm nay không? | F4 | **Đã quyết – D-10** | Không tự đổi; đi bước đề xuất / mong muốn. Còn mở: UF-Q19, UF-Q25 |
| UF-Q04 | Con không có máy riêng | F3, F4 | **Đã quyết – D-11** | Chỉ phần lập lịch phía phụ huynh. Còn mở: dùng chung máy (UF-Q17) |
| UF-Q05 | Ở `CHILD_DIRECTED`, giai đoạn tạm thời có thuộc phạm vi ủy quyền? | F5-A | Mở | Fail-closed: thành CR |
| UF-Q06 | Mong muốn ở `PARENT_LED` có hết hạn, có báo con "bố mẹ đã xem"? | F5-B | Mở | Không hết hạn, không báo đã xem |
| UF-Q07 | Giai đoạn cần dài hơn 60 ngày | F5-A | **Đã quyết – D-09** | Không cho quá 60 ngày; hết hạn tự về lịch cũ |
| UF-Q08 | Hai giai đoạn khác loại chồng nhau | F5-A | Mở | Fail-closed: không cho kích hoạt giai đoạn thứ hai |
| UF-Q09 | Ngoại lệ "chỉ tuần này" tự hết khi nào; lưu theo ngày hay theo thứ | F5-C | Mở | PROTO lưu theo thứ |
| UF-Q10 | Thời hạn mã ghép, số lần thử PIN, đặt PIN lúc nào | F3 | Mở | FR-01 giao System Design |
| UF-Q11 | Giờ yên lặng của nhắc; tần suất và thời điểm gửi tóm tắt tuần | F4 | Mở | Không có số trong nguồn; xem thêm 04.2 G1, G3 |
| UF-Q12 | Ghi nhận khi ngoại tuyến (Xong, nháp onboarding) | F1, F4 | Mở | Chờ System Design |
| UF-Q13 | Thiết lập mode ở onboarding hay để `UNSET` | F1, F5-B | Mở | Để `UNSET` |
| UF-Q14 | Ô Ngủ **cam** (thiếu ≤30′): D-02 "không giữ dưới mức tối thiểu" có áp cho ô cam không? | F2 | Mở (mới) | Dòng cảnh báo; bộ dựng vẫn xếp đủ mức tối thiểu |
| UF-Q15 | A-lite E1: Child App không có ô chữ tự do (chỉ lựa chọn có sẵn)? | F4, F5-B | Mở (mới) | Không có chữ tự do phía con |
| UF-Q16 | Trường sức khỏe (dị ứng, thuốc) trong A-lite E1 khi chưa có purpose ID | F1 | Mở (mới) | Ẩn khi dùng dữ liệu thật (CRG C-07) |
| UF-Q17 | Con không có máy: có cho dùng chung máy phụ huynh làm máy con không? | F3 | Mở (mới) | Không |
| UF-Q18 | D-03: phụ huynh có được xem lựa chọn từng ngày không, hay chỉ xu hướng? | F4 | Mở (mới) | Chỉ xu hướng |
| UF-Q19 | D-10 ở `CHILD_DIRECTED`: "Rất mệt" mở đề xuất (CR) hay cho sửa trong phạm vi? | F4, F5-B | Mở (mới) | Mở CR |
| UF-Q20 | Ngưỡng số ngày mệt trong 2 tuần để báo phụ huynh | F4 | Mở (mới) | `UNKNOWN` → không báo |
| UF-Q21 | Khôi phục tự động khi hết giai đoạn: ai thực thi khi máy ngoại tuyến, có vượt `LOCK` không | F5-A | Mở (mới) | Quy tắc tạm ngừng đúng ngày; khôi phục không bị LOCK chặn |
| UF-Q22 | Trong giai đoạn tạm thời có báo xu hướng mệt không | F5-A | Mở (mới) | Có báo (tín hiệu mới) |
| UF-Q23 | A-lite E1 có bật `CHILD_DIRECTED` không (CRG C-01) | F5-B | Mở (mới) | Ẩn trong E1 |
| UF-Q24 | Kênh mong muốn của con ở E1 thuộc module nào, khi B01C-OD-08 giao cho AI của F05 | F5-B | Mở (mới) | Lựa chọn có sẵn, chưa gán module |
| UF-Q25 | CR đổi lịch "hôm nay" chưa được duyệt trong ngày thì xử lý ra sao | F5-B | Mở (mới) | Giữ chờ tới 7 ngày |

Câu hỏi mới của đợt 2 tiếp tục từ UF-Q26 (xem 04.2 §15).

### 8.3 Cần đồng bộ tài liệu (không phải blocker)

Tài liệu này **không** sửa các nguồn dưới đây. Theo quy trình đổi quy tắc, sửa QT trước, rồi PROTO và skill.

| Điểm | Chi tiết | Hướng xử lý |
|---|---|---|
| QT L3 và TAB §4 cho mọi con "gửi đề xuất" | Viết trước quyết định mode | B01-MS-OD-02 và B01-CR §2 giới hạn: `PARENT_LED` chỉ gửi mong muốn. Sửa QT L3, TAB §4 và nhãn nút "Con muốn đề xuất" trong PROTO dòng 1051 |
| QT J chưa có trần 60 ngày và 7 ngày trống | P6-BP-OD-01, D-09 | Đưa vào QT J2 (SPIKE B-9 cũng nêu) |
| QT J6 ba lựa chọn khi hết hạn | D-09: tự về lịch trước giai đoạn | Sửa QT J6, TAB §3, PROTO `checkPeriodExpiry`, `renderChips` |
| QT D6, TAB §1.4: "Giữ mức này" cho mọi vùng đỏ | D-02: không áp cho ô Ngủ | Sửa QT D6, TAB §1.4; PROTO dòng 838 không hiện nút ở ô `ngu` |
| QT G3, TAB §4: "Rất mệt" thì phục hồi thêm 15′ và bỏ phần học định hướng bố mẹ | D-10: không tự đổi lịch | Ghi lại thành nội dung đề xuất điền sẵn; sửa lời trong PROTO dòng 1038 (không hứa "tối nay chỉ làm phần cô giao") |
| QT L2, TAB §1.5 và 02.5 S09 | D-03: báo xu hướng mệt liên quan lịch, không báo cảm xúc, trẻ được biết | Thêm câu "trẻ được báo trước" và "không báo cảm xúc" vào QT L2 |
| CLAUDE.md, QT N2, A-lite SG-20: 111/113/115 cho mọi ô chữ | D-06 / OD-03: trẻ chỉ nhận "nói với người lớn tin cậy" + có thể 111 | Sửa CLAUDE.md mục an toàn, QT N2, A-lite SG-20 |
| CLAUDE.md mục "Nguồn trả lời" | D-05 / OD-05: tra mạng chỉ cho câu hỏi giáo dục | Không ảnh hưởng A-lite E1 (không tra mạng). Ghi ở đây để nhắc |
| R3 (02.5) và QT G3 | Không mâu thuẫn: khối vẫn có, chỉ phần hỏi là tùy chọn | Flow F4 bước 6 vẽ "bỏ qua / tắt" |

---

## 9. Blockers

**Bản này không còn blocker chặn vẽ.** Hai blocker của bản 14/11 đã được giải quyết:

| Mã | Nội dung | Quyết định | Phần còn lại (không chặn vẽ) |
|---|---|---|---|
| B-1 | Ô Ngủ đỏ có được "Giữ mức này" không | **D-02:** không. Khớp QT C1, D4 và P6-BP-OD-02 | Ô Ngủ cam (UF-Q14); đồng bộ QT D6, TAB §1.4, PROTO dòng 838 |
| B-2 | Ai được xem dữ liệu hỏi thăm | **D-03:** phụ huynh nhận xu hướng mệt liên quan lịch, không nhận cảm xúc; trẻ được biết | Ngưỡng (UF-Q20), phạm vi hiển thị (UF-Q18), thời hạn lưu (cổng H4); đồng bộ QT L2 |

Cổng pháp lý còn mở và **không** được coi là đạt: H4 (thời hạn xóa), FR-03 (xử lý yêu cầu của trẻ khi chưa rõ căn cứ), MR-016 (căn cứ xử lý dữ liệu trẻ), purpose catalog cho sức khỏe và vị trí (CRG §6 B-1..B-6). Các cổng này chặn **dùng dữ liệu thật**, không chặn vẽ flow.

---

## 10. Tự kiểm

- Không tạo Feature ID mới: mọi ID đã đối chiếu với `Product_Blueprint_03_2_Feature_Inventory_and_Scope.md`.
- Không thêm ngưỡng thời gian hay sức khỏe mới: con số lấy từ QT (kèm [NC]/[NL]/[MĐ]), từ quyết định Owner (7 ngày, 60 ngày, ≥7 ngày trống, 7 ngày hiệu lực CR đã duyệt), từ spike (gắn "mặc định chưa kiểm chứng", D-08), hoặc từ PA (mục tiêu test, không phải quy tắc sản phẩm). Chỗ không có số ghi `UNKNOWN`.
- Không quyết thay Owner: các UF-Q còn mở chỉ vẽ nhánh mặc định có nhãn.
- Không chọn MVP. Không đánh dấu cổng pháp lý nào là PASS.
- Ví dụ không dùng dữ liệu trẻ thật.
- Không sửa nguồn chuẩn; chỉ soạn bản nháp.

*người soạn: AI, chưa kiểm chứng độc lập; trạng thái: nháp chờ duyệt.*
