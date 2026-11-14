# Phương án MVP để chủ sản phẩm chọn

- **mvp_decision:** `NOT_DECIDED`
- **Ngày soạn:** 14/11/2026 (UTC), áp các quyết định ngày 15/11/2026 trong sổ quyết định của chủ sản phẩm.
- **Loại tài liệu:** đề xuất. Tài liệu này **không chọn MVP**. Khuyến nghị ở cuối mục 0 chỉ là ý kiến, không phải quyết định.
- **Phạm vi:** trình bày 3 phương án, so sánh theo 3 lớp của phương pháp 3.3, liệt kê thay đổi cần làm trong A-lite v2, và câu hỏi cho chủ sản phẩm. Không sửa file nguồn nào.

**Ký hiệu nguồn** (đường dẫn tính từ thư mục gốc repo):

| Mã | File |
|---|---|
| ODL | `app-design-document/progress/Owner_Decision_Log_20261115.md` (quyết định mới nhất, thắng nguồn cũ) |
| A02, A03, A04, A05, A06, A07, A08 | `app-design-document/progress/phase-3-scoring/audit/02_…` đến `08_…` |
| R03, R04, R05 | `app-design-document/progress/phase-3-scoring/review/03_…`, `04_…`, `05_…` |
| PC | `…/phase-3-scoring/audit/data/phase_c.json` (danh sách module A-lite v1, v2, Plan A) |
| COST | `…/phase-3-scoring/review/data/cost_scenarios.json` |
| INV | `…/phase-3-scoring/review/data/inventory_106.json` (tên module) |
| SPK | `app-design-document/progress/spike-e1-scheduler/Spike_E1_Scheduler_Report.md` |
| CMP, FLD | `app-design-document/02_User_Research/User_Research_02_7_…`, `User_Research_02_8_…` |
| CRG, LQP | `app-design-document/progress/Constraint_Register_Approved_Decisions.md`, `Legal_Question_Pack.md` |
| UF | `app-design-document/04_User_Flow/User_Flow_04_1_Scheduling_Loop.md` |
| M33 | `app-design-document/03_Feature_Planning/Product_Blueprint_03_3_…` |
| PLA, LOG | `documents/app/spec-phuong-an-a-app-android.md`, `ref-nhat-ky-test.md` |
| SPEC-QT, SPEC-TAB | `documents/pal/spec-quy-tac-lap-lich.md`, `spec-quy-thoi-gian-va-tab-cua-con.md` |

---

## 0. Tóm tắt một trang cho chủ sản phẩm

### MVP để làm gì

MVP không phải bản app đầy đủ. MVP là **bản nhỏ nhất đủ để trả lời vài câu hỏi then chốt** trước khi bỏ thêm công sức. Hiện chưa có người dùng thật, chưa có phỏng vấn. Mọi điểm giá trị trong bộ chấm điểm đều là giả thuyết (R05 đầu file; A06 §7).

Chủ sản phẩm đã chốt hướng ngày 15/11 (ODL §1):
- bắt đầu từ thời khóa biểu của con, mục tiêu là tùy chọn (OD-A1a);
- làm **A-lite E1** trước: 29 module, không AI, nhập có cấu trúc; Pal trò chuyện (Plan A) là **nấc 2** (OD-A2c);
- app yêu cầu con có máy riêng (D-11); "Rất mệt" không tự đổi lịch (D-10); giai đoạn tạm thời tối đa 60 ngày (D-09).

Việc còn lại là chọn **phạm vi và cách đi** của MVP.

### MVP cần trả lời câu hỏi nào (giả thuyết cần kiểm)

| Mã | Giả thuyết | Nếu sai thì sao | Nguồn |
|---|---|---|---|
| CA-01 | Trẻ lớp 1–9 tự mở tab "Hôm nay" và tự bấm Xong, không cần bị nhắc hay có thưởng | Phần giá trị cho trẻ sụp; còn lại là công cụ lập lịch cho phụ huynh | A05 §4; CMP §2.3 (Joon giữ chân trẻ bằng thưởng) |
| CA-02 | Phụ huynh thấy lịch cân bằng có ích và bớt phải nhắc con | Đề xuất giá trị lõi sụp | A05 §4; FLD §8 giả thuyết 2 |
| CA-03 | Bộ xếp lịch không AI (E1) cho lịch đủ tốt để phụ huynh nhận | Phải dùng AI soạn lịch, kéo theo gói AI | A05 §4; SPK §1 (lõi khả thi, chất lượng thật chưa đo) |
| CA-04 | Hỏi thăm 3 mức (Ổn / Hơi mệt / Rất mệt) không gây áp lực, không bị lạm dụng | Bỏ kênh này hoặc gây hại | A05 §4; A08 RG-06 |
| D-11 | Đủ gia đình có trẻ dùng máy Android riêng | Nhóm dùng được app quá nhỏ | ODL D-11; CMP §3.1 (chưa có số liệu trẻ có máy theo lớp) |

### Ba phương án

| Phương án | Một câu | Module | Chi phí AI |
|---|---|---|---|
| **PA-1** Thử thủ công trước | Chưa dựng app. Phỏng vấn, quan sát gia đình (02.8) và dùng bộ xếp E1 của spike để đưa lịch cho vài gia đình, xem phụ huynh có nhận không | 0 module sản phẩm | 0 |
| **PA-2** A-lite E1 tối thiểu | Dựng 29 module A-lite v2, áp quyết định 15/11. Nấc 2 (Pal) để sau, quyết lại khi có số liệu | 29 | 0 |
| **PA-3** A-lite E1 rồi lên Plan A | Như PA-2, nhưng chuẩn bị song song phần AI (an toàn, nội dung tĩnh, đánh giá tiếng Việt) và đặt sẵn mốc chuyển sang nấc 2 | 29 → 40 | 0 ở nấc 1; nhỏ ở nấc 2 nếu dùng Haiku |

"A-lite E1 + báo cáo tuần và xu hướng" **không** là phương án riêng: các module báo cáo và xu hướng (F06-G02-M01, F06-G04-M01, F06-G05-M01, F06-G05-M02) đã nằm trong 29 module A-lite v2 (PC `alite_v2`), và D-03 yêu cầu báo xu hướng mệt cho phụ huynh.

### Khuyến nghị (không phải quyết định)

**Khuyến nghị: PA-3, bắt đầu bằng phần thực địa của PA-1 chạy trước hoặc song song.**

Lý do:
1. PA-3 khớp đúng thứ tự chủ sản phẩm đã chốt (OD-A2c) và không bỏ Pal, vốn là trung tâm sản phẩm trong CLAUDE.md.
2. Nấc 1 không có AI, nên đo nhanh CA-01, CA-02, CA-03 với ít rủi ro an toàn (A05 §3: A-lite v2 là workflow duy nhất khả thi ở cả 3 kịch bản độ nhạy).
3. Phần chuẩn bị AI (nội dung an toàn tĩnh, đánh giá tiếng Việt, phạm vi OD-05) tốn thời gian người duyệt chứ không tốn nhiều công lập trình. Làm sớm thì nấc 2 không phải chờ (R04 §1 mục 3).
4. Thực địa 02.8 lấp hai khoảng trống mà app không tự trả lời được: trẻ lớp nào có máy riêng (D-11) và phụ huynh đang mất bao nhiêu công để lập lịch (mốc so sánh cho CA-02) (CMP §1 mục 5; FLD §1.1).

Điều có thể làm khuyến nghị đổi: xem §3.4.

---

## 1. Bối cảnh và căn cứ chung cho mọi phương án

### 1.1 Những gì đã có

- **Bộ xếp lịch E1 khả thi cho phần lõi.** 8 hồ sơ tổng hợp giữ đủ sàn cứng 8/8, 0 lỗi kiểm tra ở ngày không có đánh đổi, chạy 0,3–8,4 ms mỗi tuần (SPK §1, §4). Chất lượng so với bản thử LLM chỉ so định tính (SPK §6).
- **Bản thử web** chạy cả luồng trên một máy, có Pal chat (A03 §7).
- **App Plan A** đang dựng trong `mobile/` (có màn phòng thử, `balance.ts`, ba tab). Test máy thật 05/11: nhắc lệch +45 giây (sát ngưỡng 1 phút), chụp ảnh đạt, GPS và đẩy chưa đạt hoặc chưa rõ (LOG). Mức hoàn thiện của mã: UNKNOWN với người soạn.

### 1.2 Bốn gói nền dùng chung

| Gói | Thành viên | Khi nào bắt buộc | Nguồn |
|---|---|---|---|
| `B_AUTHZ` | F01-G01-M01, F01-G01-M02, F01-G04-M01, F07-G06-M01 | Mọi module có dữ liệu cá nhân. Pilot chỉ cần mức tối thiểu: đăng nhập, phiên, bảng phân quyền cố định, cờ dữ liệu giả lập | R03 §1; A02 §2 |
| `B_CHILD_SCOPE` | F01-G02-M01, F01-G03-M01, F01-G04-M02, F01-G05-M01 | Mọi module có dữ liệu trẻ, cohort A0–A4 | R03 §1; A02 §2 |
| `B_AI_GATE` | F07-G03-M01, F07-G03-M02, F07-G04-M01, F07-G05-M01, F07-G04-M02 | Chỉ khi bật đường AI (E2). Có ô nhập chữ tự do thì vẫn cần lớp quy tắc an toàn (F07-G05-M01) và nội dung tĩnh (F07-G01-M01), kể cả không có LLM | R03 §1; A02 §2; A07 PC-08 |
| `B_LIFECYCLE` | F01-G06-M01, F07-G06-M02 | Pilot dữ liệu giả: chỉ cần runbook thủ công. Trước dữ liệu thật của trẻ: phải đủ, mà H4 đang mở | R03 §1; A02 §2 |

### 1.3 Cổng pháp lý, an toàn chung (chưa cổng nào PASS)

| Cổng | Trạng thái | Chặn gì | Nguồn |
|---|---|---|---|
| Căn cứ pháp lý xử lý dữ liệu trẻ (MR-016, LQ-01, LQ-02, LQ-11) | UNKNOWN | Mọi dữ liệu thật của trẻ | CRG §6 B-1; PA-OD-04; M33 §3 |
| H4: thời hạn xóa | Mở | Phát hành `B_LIFECYCLE`; dữ liệu thật | CRG §6 B-2; A06 §3 |
| FR-03: thông báo an toàn tĩnh khi chưa rõ căn cứ | Mở | Lớp an toàn trên ô nhập chữ của trẻ | CRG §6 B-3; ODL D-01 |
| Danh mục mục đích chưa duyệt (sức khỏe, vị trí) | Mở | Hồ sơ sức khỏe; geofence | CRG §6 B-4, C-07, C-08 |
| Thẩm định Bar mặc định và số khẩn 111/113/115 | Mở | Gỡ nhãn `UNKNOWN`; nội dung an toàn khi chạy thật | CRG §6 B-6; ODL D-08 |
| 4 module nền chưa kiểm độc lập (F01-G04-M01, F01-G04-M02, F01-G05-M01, F07-G06-M01) | Mở | Độ tin cậy của lõi định danh | A03 §1; CRG §6 B-7 |
| Chuyển dữ liệu ra nước ngoài (Supabase, Expo/FCM, API AI) (LQ-08) | UNKNOWN | Cả A-lite (máy chủ, đẩy) lẫn Plan A (thêm API AI) | LQP LQ-08; PLA §2 |
| PIA / DPIA (MR-021, LQ-05) | Chưa làm | Dữ liệu thật | R05 §5; LQP LQ-05 |
| Adversarial MVP Review do phiên Claude khác (OD-A5) | Chưa làm | Bắt đầu phát triển theo phương án đã chọn | A06 §8; ODL OD-A5 |

**Ngoại lệ thử nghiệm nội bộ D-01** (ODL §2): tối đa 3 gia đình quen, bố mẹ ký đồng ý, trẻ được giải thích bằng lời dễ hiểu, có hạn kết thúc, chỉ thu dữ liệu cần cho 5 tính năng thử, xóa khi kết thúc, không đưa lên repo công khai, không dùng cho mục đích khác. Các điều kiện này do AI đề xuất, **chờ chủ sản phẩm xem**. Cổng H4 và FR-03 vẫn mở, ngoại lệ **không** là PASS và **không** áp cho pilot rộng hơn.

Lưu ý: D-01 được viết cho "Plan A test với 1–3 gia đình quen" và "5 tính năng thử". Việc ngoại lệ này có áp cho bản A-lite E1 hay không **chưa được ghi**. Xem câu hỏi Q2 ở §5.

### 1.4 Cohort chung

- Phụ huynh và trẻ **lớp 1–9** (A2–A3), đúng trọng tâm (R05 §1 Gói A).
- Trẻ có **máy Android riêng** (ODL D-11; PLA §1: chỉ Android, không iPhone). Gia đình chưa cho con máy chỉ dùng được phần phụ huynh.
- **Một hộ**, không ghép khác hộ (FR01-4, FR01-5; R04 §4: gia đình hai nhà loại khỏi đợt đầu).
- Không thu dữ liệu sức khỏe trong pilot, trừ khi có purpose đã duyệt (CRG C-07; A03 SG-03).

---

## 2. Chi tiết từng phương án

### PA-1. Thử thủ công trước khi dựng (concierge)

**Mức nguồn ủng hộ:** một phần. Không nguồn nào đề xuất tên "concierge". Các mảnh có nguồn: thực địa 16 gia đình có hoạt động cùng sắp lịch tuần trên giấy và nhật ký 7 ngày (FLD §2.1, §4, §7.1); spike đề xuất chạy song song LLM và E1 trên 5–10 hội thoại thật đã ẩn danh (SPK §9 mục 5); audit ưu tiên thử hành vi bằng dữ liệu giả hoặc không định danh (A05 §5).

| Mục | Nội dung |
|---|---|
| Làm gì | (1) Chạy thực địa 02.8: 8 gia đình tiểu học, 8 THCS. (2) Với gia đình đồng ý: nhập thời khóa biểu đã ẩn danh vào bộ xếp E1 của spike, in lịch tuần, đưa phụ huynh xem và sửa. (3) Ghi số chỗ sửa, lý do sửa, thời gian phụ huynh tự lập lịch như thường |
| Module | Không có module sản phẩm. Dùng `app-design-document/progress/spike-e1-scheduler/src/` như công cụ nội bộ |
| Giả thuyết kiểm được | CA-02 một phần (công sức hiện tại, mong muốn giao việc); CA-03 (phụ huynh có nhận lịch E1 không, sửa gì); D-11 (thiết bị theo lớp, chỉ mô tả, không tính tỷ lệ, FLD §9.2); phản ứng với "không đọc được nhật ký của con" (FLD §9.3) |
| Không kiểm được | CA-01 (trẻ tự dùng app hằng ngày), độ tin cậy nhắc việc, CA-04 trong dùng thật |
| Ai tham gia | 16 gia đình theo cơ cấu FLD §2.1; loại gia đình đang khủng hoảng, nhân viên dự án (FLD §2.3) |
| Ngoài phạm vi | App, Child App, nhắc việc, mọi AI |
| Phụ thuộc, bundle | Không cần bundle nào. Cần quy trình ẩn danh của FLD §3.2 |
| Cổng trước khi gặp người thật | Rà pháp lý mẫu phiếu đồng ý (FLD §3.1: Điều 20 NĐ 13/2023 cần người có chuyên môn xác nhận còn hiệu lực; LQ-02); chuyên gia bảo vệ trẻ em duyệt quy trình khi trẻ tiết lộ nguy cơ (FLD §10 mục 4). FLD §10 mục 6 đặt mặc định **không** cho trẻ thử prototype; muốn đưa lịch E1 cho gia đình xem thì chủ sản phẩm phải đổi mặc định này. D-01 không cần thiết nếu chỉ phỏng vấn |
| Chi phí vận hành | AI: 0. Thù lao, đi lại, ghi âm, gỡ băng: **UNKNOWN**, chưa ước tính (FLD §10 mục 2) |
| Công sức thô | **UNKNOWN** trong nguồn. Ước tính của người soạn, không có định mức: 4–8 tuần-người (16 buổi khoảng 2 giờ, gỡ băng trong 48 giờ, mã hóa đôi 4 buổi đầu, chạy E1 cho từng gia đình) |
| Rủi ro chính | Lời nói khác hành vi thật (CMP §4 dòng 3); không học được gì về trẻ dùng app; chậm có sản phẩm; kênh tuyển lệch mẫu (FLD §10 mục 5) |
| Tiêu chí thành công (đề xuất) | Có bảng thiết bị theo lớp cho 16 gia đình; với lịch E1: mỗi gia đình ghi được số chỗ sửa và lý do; có danh sách việc phụ huynh muốn giao và muốn tự làm (FLD §9.2) |
| Dừng hoặc đổi hướng (đề xuất) | Đa số phụ huynh từ chối ý "không đọc nhật ký của con": báo ngay chủ sản phẩm (FLD §9.3). Đa số gia đình lớp 1–5 không cho con máy riêng: xem lại D-11 và cohort trước khi dựng Child App. Phụ huynh sửa lịch E1 ở phần lớn các khối vì lý do không có trong quy tắc: xem lại bảng tham số (D-08) trước khi dựng |

### PA-2. A-lite E1 tối thiểu (29 module, áp quyết định 15/11)

**Danh sách module** (PC `alite_v2`; tên theo INV; mức chi tiết theo PC `alite_v2_granularity_by_module`):

| Nhóm | Module |
|---|---|
| Nền định danh, phân quyền (`B_AUTHZ`, `B_CHILD_SCOPE`) | F01-G01-M01 Account Access (SHARED), F01-G01-M02 Session Security (SHARED), F01-G02-M01 Family Structure (MINIMAL), F01-G03-M01 Core Identity (FULL), F01-G04-M01 Access Policy (MINIMAL), F01-G04-M02 Consent Ledger (MINIMAL), F01-G05-M01 Mode State (MINIMAL), F07-G06-M01 Purpose-bound Access (MINIMAL) |
| Vòng đời (`B_LIFECYCLE`) | F01-G06-M01 Lifecycle Controls, F07-G06-M02 Retention & Export (cả hai POLICY_OPERATIONAL) |
| Nhập liệu | F02-G01-M01 Intake & Updates (MINIMAL): thời khóa biểu, thẻ hoạt động cố định, tuổi, lớp |
| Lập lịch | F04-G01-M01 Plan Structure (MINIMAL), F04-G01-M02 Plan Templates, F04-G02-M01 Schedule Construction (E1), F04-G02-M02 Schedule Conflict, F04-G02-M03 Balanced Planning Validation (MINIMAL) |
| Giao việc, đề xuất | F04-G03-M01 Task Ownership, F04-G03-M02 Approval Routing (MINIMAL), F04-G06-M01 Change Requests (MINIMAL, chỉ cho trẻ ở `CHILD_EXECUTED`) |
| Thực hiện | F04-G04-M01 Daily Task View, F04-G05-M01 Lightweight Check-off (kèm tín hiệu mệt, theo OD-A7a), F04-G07-M01 Schedule Notifications, F04-G07-M02 Notification Preferences (MINIMAL) |
| Theo dõi, báo cáo | F06-G01-M01 Activity Event Log, F06-G02-M01 Progress Rules, F06-G02-M02 Progress Exceptions, F06-G04-M01 Deterministic Trends, F06-G05-M01 Audience Views (MINIMAL), F06-G05-M02 Summary Rendering |

Tổng: SHARED 2, MINIMAL 12, FULL 13, POLICY_OPERATIONAL 2; 0 module AI (A03 §1). Mục tiêu (F03-G04-M01) là tùy chọn, **ngoài** 29 module (OD-A1a). Không thêm module mới do OD-A7: tín hiệu mệt nằm trong phạm vi F04-G05.

| Mục | Nội dung |
|---|---|
| Luồng | Nhập thời khóa biểu → quỹ thời gian (nhãn `UNKNOWN` khi dùng mặc định) → E1 xếp lịch, kiểm xung đột, kiểm cân bằng → phụ huynh lưu = duyệt → tab Hôm nay của con, nhắc việc → ✓ Xong → hỏi thăm sau giờ học → phụ huynh nhận xu hướng 2 tuần → tóm tắt tuần → giai đoạn tạm thời có hạn (A03 §2, đã chỉnh theo §4 của tài liệu này) |
| Giả thuyết kiểm được | CA-01, CA-02, CA-03, CA-04 trong dùng thật; độ tin cậy nhắc việc trên Android (A08 RG-07) |
| Ai dùng | Cohort ở §1.4. Trước khi qua cổng pháp lý: chỉ dữ liệu giả lập (R05 §5), hoặc tối đa 3 gia đình nếu chủ sản phẩm cho áp D-01 (Q2) |
| Ngoài phạm vi | Pal trò chuyện và mọi AI; chụp ảnh, ghi âm; geofence; báo đói; thời tiết; họp gia đình; ghép khác hộ; Nhật ký; check-in cảm xúc; thanh toán; nhập lịch ngoài (A03 §5; R05 §3; PS-OD-04) |
| Bundle tối thiểu | `B_AUTHZ` và `B_CHILD_SCOPE` ở mức tối thiểu (bảng phân quyền cố định, cờ dữ liệu giả, ghép 2 máy trong một hộ). `B_LIFECYCLE` ở dạng runbook thủ công khi dữ liệu giả; đủ trước dữ liệu thật. **Không cần `B_AI_GATE`** nếu mọi ô nhập của trẻ là lựa chọn có cấu trúc (A07 PC-08). Có ô chữ tự do thì cần F07-G05-M01 + F07-G01-M01 dạng quy tắc tĩnh (A02 §2) |
| Cổng trước người dùng thật | Toàn bộ bảng §1.3. Định danh: OD-A8b cho dùng mã gia đình trong spike kỹ thuật; FR-01 (ghép máy, Parent PIN, kiểm quyền phía máy chủ, thông báo unlink tối giản) phải có **trước pilot với gia đình thật** (ODL OD-A8; CRG C-14). Ngoại lệ D-01: xem Q2, Q3 |
| Chi phí vận hành | AI: **0 VND** (A04 §2; R04 §1). Hạ tầng: Supabase gói miễn phí, chỉ hợp quy mô Low; hạn mức thật **UNKNOWN** (R04 §1 mục 4; A04 CU-06). EAS miễn phí khoảng 15 bản Android/tháng (PLA §2). Phí đẩy Expo/FCM: **UNKNOWN** trong nguồn. Công người: runbook xóa thủ công (A04 §6: F01-G06-M01, F07-G06-M02 Run M); chuyên gia thẩm định tham số [MĐ] (D-08, bước 14b): **UNKNOWN** |
| Công sức thô | Bộ xếp E1: khoảng **3,5–5 tuần-người** (suy từ SPK §8: tổng 4–6 tuần-người, trừ phần lớp LLM 1–1,5 trên 6,5–8 đơn vị; ước tính). Cả 29 module: khoảng **24–45 tuần-người** (ước tính rất thô của người soạn: đếm Build 20 L / 6 M / 3 H theo A04 §2, quy đổi giả định L = 0,5–1, M = 1–2, H = 2–4 tuần-người, thay F04-G02-M01 bằng số của spike). M33 §5 nói thang Build **không phải ngày công**, nên quy đổi này chỉ để hình dung cỡ. Tái dùng mã `mobile/` có thể giảm, mức giảm UNKNOWN. Chưa tính thẩm định chuyên môn, pháp lý |
| Rủi ro chính | (1) Bị xem là "app lịch"; khác biệt nằm ở quy tắc cân bằng (F04-G02-M03 là module duy nhất có differentiation 5, R05 §3). (2) Trẻ không quay lại khi không có thưởng (CMP §2.3, §4 dòng 9). (3) E1 chưa cá nhân hóa, `viec` chung chung, sửa một chỗ có thể dời khối khác (SPK §6). (4) Nhắc trên Android sát ngưỡng (LOG +45 giây). (5) Lõi định danh có 4 module chưa kiểm độc lập. (6) Mã `mobile/` hiện dựng theo Plan A (có chat); cần màn nhập có cấu trúc. (7) Ít gia đình đủ điều kiện D-11 |
| Thành công (đề xuất, chủ sản phẩm chốt) | Với 1–3 gia đình (D-01) không tính phần trăm; ghi theo từng gia đình, so gia đình với chính nó trước và sau. (a) Phụ huynh kích hoạt được lịch tuần đầu trong 7 ngày (R05 §4, MR-008). (b) Phụ huynh nhận lịch E1 với ít chỉnh sửa; đề xuất theo dõi số chỉnh sửa mỗi lịch, mốc tham khảo "≤3 chỉnh sửa" mượn từ R05 §4 (vốn cho bản Pal soạn). (c) Nhắc lệch dưới 1 phút trong 7 ngày (PLA §6 bước 3). (d) Phụ huynh tự báo số lần nhắc con mỗi ngày giảm so với tuần trước khi dùng (MR-002). (e) Trẻ tự mở tab Hôm nay phần lớn ngày đi học ở tuần 2–4 (R05 §4 đề xuất ≥4 ngày/tuần; đây là chỉ số dùng sản phẩm, không phải điểm của trẻ). (f) 0 sự cố quyền riêng tư hoặc an toàn |
| Dừng hoặc đổi hướng (đề xuất) | Có 1 sự cố quyền riêng tư hoặc an toàn: dừng thử, xử lý trước. Trẻ nói cảm thấy bị theo dõi hoặc áp lực (phỏng vấn ngắn, MR-031): dừng phần hỏi thăm, xem lại thiết kế. Phụ huynh bỏ hoặc viết lại phần lớn lịch E1 sau 2 tuần: cân nhắc cho AI soạn lịch sớm hơn (R04 §4: dưới 30% nhận bản AI thì ngược lại, A-lite thắng; mốc cho E1 chưa có, chủ sản phẩm chốt). Trẻ hầu như không mở app: đổi hướng sang lịch cho phụ huynh + nhắc trên máy phụ huynh (R04 §4) |

### PA-3. A-lite E1 rồi lên Plan A (29 → 40 module), có mốc chuyển

**Nấc 1** giống hệt PA-2. Khác ở hai điểm: (1) chuẩn bị song song các phần không phải lập trình của gói AI; (2) đặt trước mốc chuyển.

**Module thêm ở nấc 2** (PC `plana_added_vs_v2`, tên theo INV):

| Module | Vai trò | Build (tối thiểu) / Run / Change (A04 §6) |
|---|---|---|
| F04-G05-M02 Evidence Submission | Chụp ảnh "Chụp gửi", không AI chấm | L / L / L |
| F07-G01-M01 Content CMS | Nội dung tĩnh an toàn | L / M / H |
| F07-G02-M01 Editorial Workflow | Duyệt nội dung | L / M / M |
| F07-G03-M01 Single Interface Router | Lối vào hội thoại Pal (OD-A6b) | H / M / M |
| F07-G03-M02 Execution Budget | Hạn mức lượt gọi | L / L / M |
| F07-G03-M03 Multimodal Interaction Orchestration | Ghi âm, ảnh | UNKNOWN (không có trong bảng 66 module FULL) |
| F07-G04-M01 Policy Evaluation | Phạm vi OD-05 | M / M / H |
| F07-G04-M02 Model Evaluation | Bộ đánh giá tiếng Việt | M / M / H |
| F07-G05-M01 Safety Triage | Lớp an toàn chạy trước AI | M / L / H |
| F08-G04-M01 Device Consents | Geofence (OD-A3a) | UNKNOWN |
| F08-G04-M02 External Data Import | Geofence (OD-A3a) | UNKNOWN |

Thêm nền tảng không có L3: **ẩn danh trước khi gọi LLM** (A03 SG-21; PLA §4). Có thể cần thêm **F03-G05-M01** nếu chủ sản phẩm xác nhận outcome của hội thoại Pal thuộc F03-G05 (OD-A6b; xem §4 U-04). Khi đó là 41 module.

**Nguyên tắc nấc 2:** E1 vẫn là nguồn chuẩn cho giờ giấc. LLM chỉ đổi lời kể thành dữ liệu có cấu trúc và diễn đạt kết quả, cảnh báo, đánh đổi. LLM không được sửa giờ. Mọi lịch phải qua bộ kiểm tra trước khi lưu (SPK §9 mục 1).

**Mốc chuyển sang nấc 2** (đề xuất; mọi mốc phải đạt, chủ sản phẩm duyệt):

| # | Mốc | Nguồn |
|---|---|---|
| M1 | Nấc 1 có kết quả đo theo tiêu chí ở PA-2, chủ sản phẩm xem và quyết | ODL OD-A2c |
| M2 | Cổng A của Plan A: 5 tính năng kỹ thuật đạt trên máy thật | PLA §6 |
| M3 | Nội dung an toàn tĩnh tách theo người nhận (D-06), số 111/113/115 được chuyên gia xác minh | ODL D-06; CRG B-6; R05 §5 mục 4 |
| M4 | Phạm vi trả lời đã duyệt cho hội thoại lập lịch của phụ huynh; kiểm đầu ra trước khi phát, không stream byte chưa kiểm | OD-05a; CRG C-11; ODL D-05 |
| M5 | Đánh giá AI tiếng Việt xong, chọn model (Haiku hay Sonnet) | R04 GAP-05; MR-023, MR-026 |
| M6 | Ẩn danh trong `pal-chat` được kiểm; giới hạn lượt không chặn nội dung an toàn tĩnh | PLA §4; CRG C-11; E-D02 |
| M7 | Nếu bật geofence: có purpose vị trí trong danh mục; chỉ lưu sự kiện vào/ra; quyết định C-15 (báo động geofence có thuộc luồng an toàn không) | ODL OD-A3; CRG C-08, C-15 |
| M8 | Nếu bật ghi âm: phân loại ghi âm "Kể cho Pal" là Journal hay không (không lưu audio mặc định nếu là Journal) | CRG C-12 |
| M9 | Nếu trẻ dùng chat hoặc ghi âm: FR-03 phải được xử lý; nếu chưa, chỉ phụ huynh dùng Pal | A03 §1; CRG C-10 |
| M10 | Pal nhận xét ảnh bài làm: chỉ pilot có kiểm soát và có benchmark; không tự vào MVP | CP-06-6; CRG C-13 |

| Mục | Nội dung |
|---|---|
| Giả thuyết kiểm thêm ở nấc 2 | Phụ huynh nhập bằng lời kể có nhanh hơn form không (MR-010); Pal diễn đạt đánh đổi có giúp phụ huynh chọn không; bản Pal soạn được nhận với ≤3 chỉnh sửa (R05 §4, mốc đề xuất ≥40%, MR-025) |
| Ai dùng nấc 2 | Phụ huynh. Trẻ chỉ dùng chat hoặc ghi âm khi M9 đạt |
| Ngoài phạm vi | Pal cho trẻ tự do; AI chấm bài trong MVP; insight AI; Nhật ký; thanh toán (R05 §1 Gói A; CP-06-6) |
| Bundle | Như PA-2, thêm `B_AI_GATE` đầy đủ |
| Cổng trước người dùng thật | Bảng §1.3, cộng G-Safety CONDITIONAL cho module AI (A06 §3); module bị chặn pháp lý: F01-G06-M01, F07-G05-M01, F07-G06-M02 (PC `plana_legal_blocked`); LQ-06 (vị trí), LQ-08 (gửi dữ liệu tới API AI ở nước ngoài), LQ-10 (ảnh, giọng nói) |
| Chi phí AI nấc 2 (ước tính) | Xem bảng dưới |
| Công sức thô | Nấc 1 như PA-2. Nấc 2 thêm khoảng **8–15 tuần-người** cho 8 module có mức Build, cộng lớp LLM của spike (1–1,5 đơn vị, SPK §8); **3 module UNKNOWN** (F07-G03-M03, F08-G04-M01, F08-G04-M02). Ước tính rất thô, cùng quy đổi giả định như PA-2. Chưa tính chuyên gia duyệt nội dung, bộ đánh giá, pháp lý: **UNKNOWN** (R04 §1 mục 3) |
| Rủi ro chính | Change H ở 4 module thêm (F07-G01-M01, F07-G04-M01, F07-G04-M02, F07-G05-M01): tốn công giữ nội dung, prompt, bộ đánh giá (A04 §3 mục 4). Tiếng Việt có thể buộc dùng Sonnet, chi phí tăng khoảng 20 lần (R04 §1 mục 2). Kho kiến thức 100% là nháp do AI soạn (R04 GAP-09). Trẻ cảm thấy bị giám sát nếu có ảnh bài làm, GPS (R04 §4 module lưng chừng). Chuẩn bị song song tốn tiền chuyên gia trước khi biết nấc 1 có đáng không |
| Thành công nấc 2 (đề xuất) | Như PA-2 cộng: bản Pal soạn được nhận với ≤3 chỉnh sửa (R05 §4); 0 đầu ra AI không qua kiểm; 0 lần gửi tên con, trường, địa chỉ chưa ẩn danh |
| Dừng hoặc đổi hướng (đề xuất) | Một đầu ra AI chưa kiểm lọt tới người dùng, hoặc một lần lộ dữ liệu chưa ẩn danh: tắt đường AI, giữ nấc 1. Phụ huynh không thấy chat nhanh hơn form: giữ E1 form làm mặc định, chat là tùy chọn (A04 §4) |

**Chi phí AI nấc 2** (ước tính; giá niêm yết tra 14/11: Haiku 5.5 $0,10/$0,50, Sonnet 5.5 $2/$10 mỗi triệu token; 26.000 VND/USD; số lượt và token là giả định trong COST; không phải chi phí đo được):

| Hành động | Model | VND/hộ/tháng (Base) | p95 | 3 gia đình (D-01), VND/tháng | 300 hộ (Base), USD/tháng | Nguồn |
|---|---|---|---|---|---|---|
| Tin nhắn Pal (60 lượt/hộ/tháng) | Haiku 5.5 | 975 | 2.925 | khoảng 2.925 | 11,25 | COST rows "Pal message (Haiku)"; R04 §1 |
| Tin nhắn Pal | Sonnet 5.5 | 19.500 | 58.500 | khoảng 58.500 | 225 | COST rows "Pal message (Sonnet alt)" |
| Pal soạn lịch (chỉ nếu vẫn để LLM soạn; với E1 thì không cần) | Haiku 5.5 / Sonnet 5.5 | 183 / 3.370 | 548 / 10.109 | khoảng 549 / 10.110 | 2,11 / 38,88 | COST rows "schedule draft" |
| Nhận xét ảnh, ghi âm | — | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Không có trong COST |

Cột "3 gia đình" là phép nhân của người soạn (3 × mức Base mỗi hộ). Bảng tin nhắn Pal dùng làm số gần đúng cho hội thoại nhập liệu và diễn đạt; COST gắn hàng này với F05-G01-M01, không phải F07-G03. Kết luận của R04 §1: chi phí suy luận không quyết định việc chọn phương án nếu dùng model nhỏ và có hạn mức; chi phí lớn hơn nằm ở chuyên gia duyệt nội dung, bộ đánh giá, pháp lý (UNKNOWN).

---

## 3. So sánh theo 3 lớp của phương pháp 3.3

Thứ tự đọc: **cổng cứng trước**, rồi giá trị, rồi khả năng làm (M33 §1 Q3). Cổng không được bù bằng giá trị. **Không cộng thành điểm tổng.** Mức H/M/L là nhận định của người soạn dựa trên nguồn ghi trong ô.

### 3.1 Lớp 1: Cổng cứng (không PASS nào)

| Cổng | PA-1 Thủ công | PA-2 A-lite E1 | PA-3 nấc 2 (Plan A) |
|---|---|---|---|
| G-Legal | UNKNOWN: phiếu đồng ý phỏng vấn cần rà (FLD §3.1, LQ-02) | UNKNOWN: MR-016, H4; D-01 có áp không chưa rõ (Q2) | UNKNOWN: như PA-2, thêm LQ-06, LQ-08, LQ-10, FR-03 nếu trẻ dùng chat |
| G-Privacy | UNKNOWN, phạm vi hẹp: ghi chép ẩn danh bằng mã (FLD §3.2) | UNKNOWN: purpose catalog; chuyển ra nước ngoài (Supabase, FCM); 4 module nền chưa kiểm độc lập | UNKNOWN: thêm vị trí (C-08), ảnh, giọng nói (C-12), dữ liệu gửi API AI |
| G-Safety | Cần quy trình khi trẻ tiết lộ nguy cơ (FLD §3.3, §10 mục 4) | Thấp hơn: không AI; vẫn cần nội dung tĩnh D-06 nếu có ô chữ tự do (A07 PC-08) | CONDITIONAL cho module AI (A06 §3); F07-G05-M01 bị chặn pháp lý (PC) |
| G-Feasibility | Cao: dùng công cụ spike có sẵn | CONDITIONAL: lõi E1 FEASIBLE trên dữ liệu tổng hợp (SPK §1); nhắc Android sát ngưỡng (LOG) | CONDITIONAL: kho kiến thức 0 mục đã duyệt (A05 §3); chất lượng tiếng Việt chưa đo |
| Số module bị chặn pháp lý | 0 | 2 (F01-G06-M01, F07-G06-M02) (PC) | 3 (thêm F07-G05-M01) (PC) |

### 3.2 Lớp 2: Giá trị (giả thuyết, độ tin cậy HYPOTHESIS)

| Tiêu chí 3.3 §4.1 | PA-1 | PA-2 | PA-3 (sau nấc 2) | Nguồn |
|---|---|---|---|---|
| parent_value | L–M: chỉ một lịch in, không có nhắc | M–H | H nếu Pal tiếng Việt đủ tốt | R05 §2 dòng 2 |
| child_value | Không đo | M (xem việc, đánh dấu; MR-007 chưa chứng minh) | M; có thể giảm nếu trẻ thấy bị giám sát (ảnh, GPS) | R05 §2 dòng 3; R04 §4 |
| core_loop | Không khép (không có thực hiện) | H: khép Kế hoạch → Thực hiện → Phản hồi → Đánh giá | H | R05 §2 dòng 4 |
| adoption_potential | Không đo | UNKNOWN (CA-01, CA-02) | UNKNOWN | A05 §4 |
| differentiation | — | M: cân bằng có nguồn là điểm khác; "trợ lý AI" đã bị CONTESTED | M–H: thêm Pal tiếng Việt theo lịch học Việt Nam (CMP §4 dòng 1) | R05 §3; CMP §4 |
| dependency_enablement | Thấp (không có mã) | H: nền và lịch là gốc cho nấc sau | H | R05 §2 dòng 9 |
| Học được gì, nhanh không | Nhanh về nhu cầu, thiết bị; không về hành vi dùng | Ngắn: đo dùng hằng ngày ngay | Trung bình: chờ nội dung, đánh giá | R05 §2 dòng 6 |
| Độ nhạy với giả định | Thấp | L | H (kho đã duyệt, model) | R05 §2 dòng 10 |

### 3.3 Lớp 3: Khả năng làm và kinh tế

| Tiêu chí | PA-1 | PA-2 | PA-3 (thêm ở nấc 2) | Nguồn |
|---|---|---|---|---|
| Số module | 0 | 29 | +11 (có thể +1 F03-G05-M01) | PC |
| Build L/M/H (góc nhìn tối thiểu) | — | 20 / 6 / 3 | +4 / +3 / +1, 3 UNKNOWN | A04 §2, §6 |
| Run L/M/H | — | 27 / 2 / 0 | thêm 5 module Run M | A04 §2, §6 |
| Change L/M/H | — | 14 / 15 / 0 | thêm 4 module Change H | A04 §2, §6 |
| Chi phí AI | 0 | 0 | Haiku khoảng 975 VND/hộ/tháng; Sonnet khoảng 19.500 (ước tính) | COST |
| Chi phí ngoài AI | Thực địa: UNKNOWN | Hạ tầng gói miễn phí (hạn mức UNKNOWN); runbook xóa; thẩm định [MĐ] UNKNOWN | Thêm chuyên gia nội dung, bộ đánh giá, pháp lý: UNKNOWN | R04 §1; A04 §5 |
| Công sức thô (ước tính) | 4–8 tuần-người (người soạn, không định mức) | 24–45 tuần-người | +8–15 tuần-người, cộng phần UNKNOWN | §2 |
| Rủi ro build lớn nhất | Tuyển mẫu | Bộ xếp E1 (đã giảm nhờ spike), lõi định danh | Gói AI, nội dung đã duyệt | A04 §3; SPK §8 |

### 3.4 Điều gì có thể làm đổi khuyến nghị

| Nếu | Thì | Nguồn |
|---|---|---|
| Luật sư trả lời căn cứ pháp lý chậm, H4 không chốt được | Không phương án nào thử được với dữ liệu thật ngoài ngoại lệ D-01; PA-1 trở nên hợp lý hơn để không phí thời gian | R04 §4; CRG B-1, B-2 |
| Thực địa cho thấy ít trẻ lớp 1–5 có máy riêng | Thu hẹp cohort sang lớp 6–9, hoặc xem lại D-11 | CMP §3.1; ODL D-11 |
| Có ngay bộ nội dung khởi đầu được chuyên gia duyệt | Nấc 2 khả thi sớm hơn; nghiêng về PA-3 | R04 §4 |
| Phụ huynh viết lại phần lớn lịch E1 | Cho AI soạn lịch sớm hơn (gần biến thể W1) | R04 §4; A05 CA-03 |
| Ngân sách chuyên gia không có | PA-2 (không chuẩn bị song song) hợp lý hơn PA-3 | R04 §1 mục 3 |

---

## 4. Những gì cần cập nhật trong A-lite v2 do quyết định 15/11

Chỉ là **danh sách đề xuất**. Không sửa A03, A07 hay file nguồn nào. Vị trí trong A-lite v2 tham chiếu A03.

| # | Quyết định | Chỗ trong A-lite v2 | Thay đổi đề xuất | Cần sửa thêm ở nguồn chuẩn khác |
|---|---|---|---|---|
| U-01 | OD-A1a | A03 §2 bước 1; SG-01 | Ghi "bắt đầu từ thời khóa biểu". F03-G04-M01 là tùy chọn, ngoài 29 module. Đóng SG-01 | 3.4 UC-007 (điều kiện `goal_available`) cần change request riêng (A08 OD-A1) |
| U-02 | OD-A2c | A03 §1; A07 PC-16 | Ghi A-lite E1 (29) là nấc 1, A-lite Plan A (40) là nấc 2. Thêm mốc chuyển (xem PA-3 M1–M10) | — |
| U-03 | OD-A3a | SG-23; A07 PC-11 | Chấp nhận ánh xạ geofence vào F08-G04-M01/M02, F01-G04-M02, F06-G01-M01, F04-G07-M01. Quy tắc riêng: chỉ lưu sự kiện vào/ra. Mở issue theo dõi. Vẫn cần purpose vị trí trước dữ liệu thật | Danh mục mục đích (PA-OD-02, CRG C-08) |
| U-04 | OD-A6b | A07 PC-12; CRG C-11 | Hội thoại Pal với phụ huynh: F07-G03 là entry, F03-G05 là outcome. Đề xuất chủ sản phẩm xác nhận: với hội thoại **lập lịch**, outcome là lịch (F04-G02-M01, F04-G01-M01) hay phải thêm F03-G05-M01 (E2, Build H, Change H, A04 §6) vào biến thể Plan A (40 → 41) | Inventory GAP-16 (R04) |
| U-05 | OD-A7a | SG-14, SG-15; A03 §2 bước 7; §3 dòng "After-school check" | Chủ sở hữu tín hiệu mệt là F04-G05: ghi vào phạm vi L4 của F04-G05-M01, không tạo ID mới. Báo đói chỉ ở biến thể Plan A. Đổi trạng thái hai dòng từ "owner TBD" | — |
| U-06 | OD-A8b, D-04 | SG-22; A03 §3 dòng "X Identity" | Mã gia đình chỉ trong spike kỹ thuật. FR-01 phải có trước pilot gia đình thật: ghép 2 máy, Parent PIN, **kiểm quyền phía máy chủ**, **thông báo unlink tối giản cho Parent App** (CRG C-14) | — |
| U-07 | D-01 | A03 §7 rủi ro (4); A06 §3; CRG C-16, OC-01 | Ghi ngoại lệ có giới hạn kèm 8 điều kiện (§1.3). Ghi rõ H4, FR-03 vẫn mở, không PASS, không áp pilot rộng. Ghi điều kiện là "AI đề xuất, chờ chủ sản phẩm xem". Ghi phạm vi áp (Plan A hay cả A-lite) là câu hỏi mở (Q2) | — |
| U-08 | D-02 | A03 §2 bước 2 ("trần mềm, có nút Giữ mức này"); §4 bảng dòng "Quỹ thời gian / trần mềm" | Nút "Giữ mức này" **không** áp cho Ngủ. Ô Ngủ dưới mức tối thiểu không giữ được | UF-Q01 đóng |
| U-09 | D-03 | A03 §2 bước 7; SG-16; F06-G04-M01, F06-G05-M01 | Phụ huynh nhận **xu hướng mệt liên quan đến lịch**, không nhận cảm xúc. Trẻ được báo rằng phụ huynh nhận thông tin này: cần một dòng giải thích trên máy con (F04-G04-M01 hoặc F06-G05-M01). Ngưỡng đếm vẫn UNKNOWN cho đến khi có nguồn | UF-Q02 đóng một phần (thời gian lưu chưa có) |
| U-10 | D-05 | Biến thể Plan A; CRG OC-04 | Tra web hoặc LLM ngoài kho chỉ cho câu hỏi giáo dục, đào tạo (OD-05). Không ảnh hưởng nấc 1 | CLAUDE.md mục "Nguồn trả lời" và bản đồ kiến thức §1.1 (ODL D-05 yêu cầu cập nhật) |
| U-11 | D-06 | SG-20; A03 §3 dòng "X Safety" ("static 111/113/115 content for any free-text input"); CRG C-09 | Tách theo người nhận: **trẻ** nhận lời "nói với người lớn tin cậy", có thể kèm 111; **người lớn** nhận 115/113/111 khi phù hợp. Không gộp ba số cho mọi ô nhập | PLA §4 ("chỉ trả thông tin hỗ trợ (111, 113, 115)") và CLAUDE.md mục quyết định đã chốt cần ghi tách người nhận |
| U-12 | D-07 | SG-10; A07 PC-03; CRG C-02, OC-03 | Đổi người quản lý chính: **quyền cũ của trẻ giữ nguyên**. CR đã duyệt nhưng chưa áp dụng phải duyệt lại. Thêm vào phạm vi tối thiểu của F04-G06-M01: bảng vô hiệu CR khi đổi version, lock, người chăm sóc, mode, archive (CR-OD-02); hiệu lực tối đa 7 ngày kể từ lúc duyệt (B01C-OD-03); `APPROVED ≠ APPLIED`, commit idempotent (CR-OD-04) | Phần `REVIEW_REQUIRED` của P6-AP-OD-02 không áp cho quyền của trẻ (ghi chú vào sổ ràng buộc) |
| U-13 | D-08 | SG-04, SG-05; A03 §3 dòng "Task duration", "6-group time budget" | Dùng tham số mặc định của spike (`app-design-document/progress/spike-e1-scheduler/out/params.json`), gắn nhãn **"mặc định chưa kiểm chứng"**, chờ thẩm định ở bước 14b | — |
| U-14 | D-09 | A03 §2 bước 9; SG-17 | Trần 60 ngày là cứng, không có luồng gia hạn. **Hết hạn thì tự về hồ sơ lịch trước giai đoạn.** Mâu thuẫn với dòng "hết hạn thì cho 3 lựa chọn": đề xuất tự về trước, rồi mới hiện lựa chọn (ví dụ lập giai đoạn mới khi đủ 7 ngày trống); chờ chủ sản phẩm chốt (Q6). Giữ mốc xem lại 2 tuần cho giai đoạn 43–60 ngày (SPK B-9) | UF-Q07 đóng. SPEC-QT J2 cần ghi trần 60 ngày (SPK B-9) |
| U-15 | D-10 | A03 §2 bước 7 ("chọn Rất mệt thì áp quy tắc giảm tải"); §4 bảng dòng "Tín hiệu mệt", cột "Tự giải quyết" | **Bỏ tự giảm tải.** Chọn "Rất mệt" chỉ ghi nhận và hiện lời; muốn đổi lịch thì trẻ đi qua bước đề xuất: ở `PARENT_LED` là mong muốn gửi bố mẹ, ở `CHILD_EXECUTED` là CR. Đổi cột "Tự giải quyết" thành "Không" | **Mâu thuẫn với nguồn chuẩn:** SPEC-QT G3 (dòng 116: "Con báo Rất mệt thì phục hồi thêm khoảng 15′ và bỏ phần học theo định hướng của bố mẹ hôm đó") và SPEC-TAB dòng 100. Theo CLAUDE.md, phải sửa spec trước, rồi prompt `prototype/index.html` và skill `lap-lich-sinh-hoat-tre` |
| U-16 | D-11 | A03 §2; SG-22; UF-Q04 | App yêu cầu con có máy. Không có máy: chỉ phần lập lịch phía phụ huynh, không theo dõi trên máy con. Thêm nhánh onboarding "con chưa có máy". Cohort pilot: con có máy Android riêng | UF-Q04 đóng |
| U-17 | Trạng thái A06 | A06 điều kiện 2 | OD-A1, A2, A3, A6, A7, A8 đã có quyết định. Còn mở: Adversarial MVP Review (OD-A5 chọn phiên Claude khác, chưa làm), purpose vị trí, sức khỏe | — |

**Ràng buộc chưa được quyết định 15/11 giải quyết, vẫn phải xử lý trong A-lite v2** (CRG §3):

| Mã | Việc còn thiếu |
|---|---|
| C-01 | Luồng `CHILD_DIRECTED`: ẩn trong pilot (có hiển thị rõ) hay làm luồng sửa trực tiếp và lock |
| C-03 | Không có Primary hợp lệ: chặn sửa nhưng vẫn nhận đề xuất; Supporter/Observer không duyệt |
| C-04 | Mong muốn của trẻ `PARENT_LED`: B01C-OD-08 nói đi qua AI communication của F05, nhưng A-lite không có AI và F05 không nằm trong 29 module. Cần cho phép ghi chú có cấu trúc, không AI, và chọn module chủ |
| C-05 | Tách `DRAFT_SAVED` với `ACTIVE`; lịch vi phạm protected hard-cap không được kích hoạt |
| C-06 | Hợp đồng phân quyền tối thiểu: mặc định từ chối, kiểm quyền trước khi đọc hoặc gọi ngoài, một điểm ALLOW/DENY |
| C-07 | Dữ liệu sức khỏe cần purpose đã duyệt; đề xuất loại khỏi pilot |
| C-10 | Lớp an toàn trên ô chữ của trẻ là xử lý dữ liệu; FR-03 vẫn mở |
| SPK B-4, B-6 | Thời lượng chuẩn từng khối sinh hoạt; học thêm ngay sau giờ trường có cần phục hồi trước không. ODL §5 giao cho Business Logic |

---

## 5. Câu hỏi chủ sản phẩm cần trả lời để chốt MVP

| # | Câu hỏi | Phương án | Đề xuất của người soạn |
|---|---|---|---|
| Q1 | Chọn phương án MVP nào? | (a) PA-1; (b) PA-2; (c) PA-3; (d) PA-1 trước rồi PA-2 hoặc PA-3 | (c), với phần thực địa của PA-1 chạy trước hoặc song song. Lý do ở §0 |
| Q2 | Ngoại lệ D-01 có áp cho thử nghiệm nội bộ bản A-lite E1 không, hay chỉ cho test 5 tính năng Plan A? | (a) Áp cho cả A-lite, cùng 8 điều kiện; (b) A-lite chỉ dùng dữ liệu giả cho đến khi có ý kiến luật sư; (c) Áp cho A-lite chỉ sau khi xong thực địa | (a), nếu chủ sản phẩm duyệt 8 điều kiện D-01. Không có dữ liệu thật thì không đo được CA-01, CA-02 (A05 CA-06) |
| Q3 | Thử nội bộ theo D-01 có tính là "pilot với gia đình thật" theo OD-A8 (phải có FR-01) không? | (a) Không: dùng mã gia đình được; (b) Có: phải làm FR-01 trước | (a) cho tối đa 3 gia đình quen, kèm RLS theo `family_id` (PLA §4); (b) cho mọi đợt rộng hơn. Cần chủ sản phẩm xác nhận vì OD-A8 không nói rõ |
| Q4 | Pilot cho những chế độ tự chủ nào? | (a) Chỉ `PARENT_LED`; (b) `PARENT_LED` + `CHILD_EXECUTED`, ẩn `CHILD_DIRECTED`; (c) Cả ba | (b): đủ để kiểm tiếng nói của trẻ mà không phải làm luồng lock (CRG C-01) |
| Q5 | Mong muốn của trẻ ở `PARENT_LED` (gồm sau khi chọn "Rất mệt", D-10) đi qua đâu khi chưa có AI? | (a) Ghi chú có cấu trúc (chọn từ danh sách), chủ là F04-G06-M01; (b) Chờ có F05 AI theo B01C-OD-08; (c) Không có kênh ở nấc 1 | (a). Tránh chữ tự do nên không kéo FR-03 và lớp an toàn vào nấc 1 (CRG C-04, C-10) |
| Q6 | Hết hạn giai đoạn tạm thời: sau khi tự về hồ sơ cũ (D-09), có hiện lựa chọn cho phụ huynh không? | (a) Tự về, không hỏi; (b) Tự về, rồi hiện lựa chọn (giữ lịch cũ, lập giai đoạn mới khi đủ 7 ngày trống); (c) Giữ 3 lựa chọn như A-lite v2 | (b): khớp D-09 và vẫn giữ quyền chọn của phụ huynh |
| Q7 | Tiêu chí thành công và dừng nào được chốt? | (a) Dùng bộ đề xuất ở PA-2, PA-3; (b) Chủ sản phẩm chỉnh mốc; (c) Chỉ định tính cho đợt ≤3 gia đình | (c) cho đợt D-01, (a) hoặc (b) cho đợt rộng hơn. Với ≤3 gia đình, phần trăm không có ý nghĩa |
| Q8 | Có cho chi tiền cho: thực địa 02.8, chuyên gia thẩm định tham số [MĐ] (D-08), luật sư (LQP), chuyên gia duyệt nội dung an toàn (cho nấc 2)? | Từng mục: có / không / để sau | Ưu tiên luật sư (LQ-01, LQ-02, LQ-11) và thực địa. Chuyên gia nội dung chỉ cần nếu chọn PA-3 |
| Q9 | Sửa nguồn chuẩn cho khớp D-10 và D-06? | (a) Sửa SPEC-QT G3, SPEC-TAB, prompt bản thử, skill, PLA §4, CLAUDE.md qua PR; (b) Để sau khi chọn MVP | (a): spec là nguồn chuẩn, đang ngược với quyết định 15/11 |
| Q10 | Mã `mobile/` (đang theo Plan A, có chat) dùng thế nào cho nấc 1? | (a) Dùng tiếp, thay ô chat bằng form có cấu trúc; (b) Tách nhánh A-lite riêng | (a): PLA §1 yêu cầu chung bộ mã cho phương án sau; mức tái dùng thật cần kiểm |

---

## 6. Giới hạn và blocker

- **Không có blocker chặn việc trình bày phương án.** Các chỗ mơ hồ (phạm vi D-01, định nghĩa "pilot" ở OD-A8, D-10 ngược với spec chuẩn, D-09 so với "3 lựa chọn") được đưa thành câu hỏi Q2, Q3, Q6, Q9.
- Mọi số công sức là ước tính thô. Thang Build của 3.3 không phải ngày công (M33 §5); quy đổi sang tuần-người là giả định của người soạn.
- Mọi số chi phí AI là ước tính dựng từ giả định trong COST, không phải chi phí đo được.
- Không có phỏng vấn, pilot hay số liệu sử dụng thật. Agent không thay được bước kiểm chứng với người dùng thật (A06 §7).
- Không đánh PASS cổng pháp lý nào. Không đổi Feature ID. Không sửa file nguồn.

---

người soạn: AI, chưa kiểm chứng độc lập; trạng thái: nháp chờ chủ sản phẩm chọn
