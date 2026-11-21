# Sổ quyết định của chủ sản phẩm, 15/11/2026

*Ghi lại bởi: AI, theo trả lời của chủ sản phẩm trong phiên làm việc ngày 15/11/2026. Trạng thái: APPROVED theo lời chủ sản phẩm. Không sửa các sổ quyết định cũ; chỗ nào khác với sổ cũ thì sổ này ghi rõ là quyết định mới hơn.*

Nguồn câu hỏi:
- OD-A1..A8: `progress/phase-3-scoring/audit/08_Research_Gaps_and_Decisions.md`.
- OC-01..04 và C-09: `progress/Constraint_Register_Approved_Decisions.md`.
- UF-Q01..Q13: `04_User_Flow/User_Flow_04_1_Scheduling_Loop.md` §9.
- Câu hỏi của spike: `progress/spike-e1-scheduler/Spike_E1_Scheduler_Report.md` §7.

## 1. Bước 3.3 và gói A-lite

| Mã | Câu hỏi | Quyết định |
|---|---|---|
| Q1 | Đưa kết quả chấm điểm, tự kiểm toán lên repo? | Đồng ý. Đưa vào `progress/phase-3-scoring/` qua nhánh và PR (PR #20) |
| OD-A1 | A-lite bắt đầu từ mục tiêu hay từ thời khóa biểu? | **(a)** Từ thời khóa biểu của con. Đặt mục tiêu là tùy chọn |
| OD-A2 | Biến thể A-lite nào để kiểm thử? | **(c)** Làm A-lite E1 trước (29 module, không AI, nhập có cấu trúc). A-lite Plan A (có Pal trò chuyện) là nấc 2 |
| OD-A3 | Geofence của Plan A | **(a)** Chấp nhận ánh xạ vào F08-G04-M01/M02, F01-G04-M02, F06-G01-M01, F04-G07-M01. Ghi quy tắc riêng cho dữ liệu vị trí: chỉ lưu sự kiện vào/ra. Mở issue theo dõi |
| OD-A4 | Duyệt sửa điểm và rubric R1.2 | Duyệt các mục `CONFIRMED_SOURCE`. Mục `JUDGMENT` chờ người duyệt độc lập (OD-A5) |
| OD-A5 | Ai làm Adversarial MVP Review? | Một phiên Claude khác, không phải phiên đã chấm điểm |
| OD-A6 | Chủ sở hữu hội thoại Pal với phụ huynh | **(b)** F07-G03 làm entry, F03-G05 làm outcome, theo 3.4 UC-017 |
| OD-A7 | Tín hiệu mệt, đói của trẻ thuộc L3 nào | **(a)** F04-G05 (ghi nhận thực hiện) |
| OD-A8 | Định danh cho pilot | **(b)** Mã gia đình trong spike kỹ thuật. FR-01 (tài khoản, ghép máy, Parent PIN) phải có trước pilot với gia đình thật |

## 2. Xung đột giữa các quyết định và nguồn chuẩn

| Mã | Câu hỏi | Quyết định |
|---|---|---|
| D-01 (OC-01) | Plan A test với 1–3 gia đình quen, trong khi PA-OD-04 và Gate cấm dữ liệu trẻ thật | **(b)** Coi là thử nghiệm nội bộ, có đồng ý bằng văn bản, ghi thành **ngoại lệ có giới hạn**. Điều kiện tối thiểu (AI đề xuất, chờ chủ sản phẩm xem): bố mẹ ký đồng ý, trẻ được giải thích bằng lời dễ hiểu; tối đa 3 gia đình; có hạn kết thúc; chỉ thu dữ liệu cần cho 5 tính năng thử; xóa khi kết thúc; không đưa dữ liệu lên repo công khai; không dùng cho mục đích khác. **Cổng pháp lý H4, FR-03 vẫn mở, không coi là PASS.** Ngoại lệ này không áp cho pilot rộng hơn |
| D-02 (UF-Q01, B-1 của User Flow) | Ô Ngủ đỏ: có nút "Giữ mức này" không? | **Không.** Giờ ngủ không được giữ dưới mức tối thiểu. Nút "Giữ mức này" chỉ áp cho các nhóm khác. Khớp C1 và P6-BP-OD-02 |
| D-03 (UF-Q02, B-2 của User Flow) | Báo phụ huynh khi con hay chọn "Rất mệt" | Báo **xu hướng mệt liên quan đến lịch**, không báo cảm xúc. Trẻ được biết phụ huynh nhận thông tin này |
| D-04 (OC-02) | Mã gia đình của Plan A so với FR-01 | Như OD-A8 |
| D-05 (OC-04) | Phạm vi tra mạng | Theo **OD-05**: tra web hoặc LLM ngoài kho chỉ cho câu hỏi giáo dục, đào tạo; loại khác cần chính sách riêng. Cập nhật CLAUDE.md và bản đồ kiến thức §1.1 cho khớp |
| D-06 (C-09) | Lời khuyên an toàn cho trẻ | Theo **OD-03**: trẻ nhận lời "nói với người lớn tin cậy", có thể kèm 111. Số 113, 115 dành cho người lớn. Sửa A-lite cho khớp |
| D-07 (OC-03) | Đổi người quản lý chính thì quyền cũ của trẻ ra sao? | **Quyền cũ của trẻ giữ nguyên.** Theo B01-CL-OD-03 và B01-C-OD-01; phần "grant cũ chuyển `REVIEW_REQUIRED`" của P6-AP-OD-02 không áp cho quyền của trẻ. CR đã duyệt nhưng chưa áp dụng vẫn phải duyệt lại (B01-C-OD-01) |

## 3. Thông số và chính sách lập lịch

| Mã | Câu hỏi | Quyết định |
|---|---|---|
| D-08 | Bảng thông số lập lịch (khoảng 20 giá trị: thời lượng khối sinh hoạt, nghỉ giữa khối, giãn cách trước giờ ngủ…) | Dùng giá trị mặc định của spike E1 (`out/params.json`), gắn nhãn **mặc định chưa kiểm chứng**, chờ thẩm định chuyên môn ở bước 14b |
| D-09 (UF-Q07, B-9 của spike) | Giai đoạn tạm thời cần dài hơn 60 ngày | **Không cho quá 60 ngày.** Hết hạn thì tự về lại hồ sơ lịch trước giai đoạn. Khớp P6-BP-OD-01 |
| D-10 (UF-Q03) | Con chọn "Rất mệt" có tự đổi lịch hôm nay không? | **Không tự đổi.** Muốn đổi lịch, trẻ phải đi qua bước đề xuất (ở `PARENT_LED` là mong muốn gửi bố mẹ, vì chế độ này không có CR chính thức) |
| D-11 (UF-Q04) | Con chưa có máy riêng | **App yêu cầu con có thiết bị.** Không có thiết bị thì chỉ dùng được phần lập lịch phía phụ huynh, không có phần theo dõi trên máy của con |

## 4. Đưa kết quả lên repo

| Mã | Quyết định |
|---|---|
| D-12 | Đưa 4 kết quả ngày 14/11 (đối thủ và kế hoạch thực địa, User Flow đợt 1, spike E1, sổ ràng buộc và bộ câu hỏi pháp lý) lên repo qua PR |
| D-13 | Làm tiếp: User Flow đợt 2, chuẩn bị phương án MVP để chủ sản phẩm chọn (không tự chọn), gom Business Logic cho module lập lịch |

## 5. Việc còn mở

- Câu hỏi UF-Q05, Q06, Q08..Q13 của User Flow: chưa có quyết định, giữ nhánh mặc định có nhãn.
- Câu hỏi B-1, B-2, B-11 của spike (khoảng nghỉ 3–5′ hay 5–10′, "bớt học ở nhà" hay "bỏ ôn bài", nhận diện khối): xử lý trong Business Logic; nếu cần chủ sản phẩm chọn thì hỏi lại.
- Chọn MVP: đã chọn ở lượt 2 (D-16).

## 6. Lượt 2, ngày 15/11/2026

Trả lời của chủ sản phẩm cho các câu hỏi gộp từ User Flow đợt 2, phương án MVP và Business Logic (PR #23), và các câu làm rõ sau đó. Chủ sản phẩm trả lời "theo đề xuất" cho các mục dưới đây, trừ chỗ ghi khác.

| Mã | Câu hỏi | Quyết định |
|---|---|---|
| D-14 | Có sửa `prototype/index.html` theo quyết định mới không? | **Không.** Giữ nguyên làm mốc cũ; ghi danh sách khác biệt trong `prototype/README.md` |
| D-15 | Có sửa spec chuẩn và skill cho khớp D-02, D-03, D-06, D-09, D-10 không? | **Có.** Sửa `documents/pal/spec-quy-tac-lap-lich.md`, `spec-quy-thoi-gian-va-tab-cua-con.md`, CLAUDE.md, rồi skill `lap-lich-sinh-hoat-tre` |
| D-16 | Chọn phương án MVP nào? | **PA-3**: A-lite E1 (phụ huynh điền biểu mẫu, thuật toán xếp lịch, không AI, lịch đồng bộ sang app của con), rồi lên Plan A có Pal. Thực địa của PA-1 chạy trước hoặc song song. Chủ sản phẩm đã được giải thích E1 có thuật toán xếp lịch, không phải "phụ huynh nhập gì hiện nấy" |
| D-17 | Chi tiền cho luật sư, thực địa, chuyên gia thẩm định? | **Chưa**, vì đang test nội bộ |
| D-18 | Ngoại lệ D-01 có áp cho A-lite E1 không; có phải xong FR-01 trước khi thử không? | **Có** cho cả hai |
| D-19 | Chế độ con tự sửa lịch (`CHILD_DIRECTED`) trong A-lite E1 | **Ẩn** |
| D-20 | Mong muốn của con khi chưa có AI | Mẫu cố định, giao module F04-G06-M01, ghi thành change request L3 |
| D-21 | Báo phụ huynh về xu hướng mệt | **Chỉ tổng hợp trong báo cáo cuối tuần**, không báo lẻ tẻ. Không cần ngưỡng. Thay phần "ngưỡng" trong D-03 |
| D-22 | Mời, gỡ thành viên gia đình (F01-G02-M02) | Đưa vào A-lite ở **mức tối thiểu** |
| D-23 | Bốn thông số lập lịch | Nghỉ giữa hai phiên học **≥5 phút**; ngày học thêm buổi tối thì hỏi bố mẹ một lần có bớt học ở nhà không, không tự bỏ (theo G7); học thêm ngay sau giờ trường vẫn cần **≥15 phút** phục hồi trước; mỗi bữa chính **≥20 phút**. Nhãn "mặc định chưa kiểm chứng" |
| D-24 | Hết giai đoạn tạm thời | Về bản mới nhất của hồ sơ chuẩn, không mang phần nới; vẫn tự về khi lịch đang khóa; máy ngoại tuyến thì về đúng ngày |
| D-25 | Lịch có thông số chưa kiểm chứng có được lưu không? | **Được**, nếu không phạm sàn cứng; luôn hiện nhãn "chưa kiểm chứng" |
| D-26 | Nút "Con cần giúp đỡ" trên app của con | **Phương án (b):** mặc định không ghi lại, không tự báo gia đình (người gây hại có thể ở trong nhà; khớp REM-HRW). Con được tự chọn gửi "Con cần nói chuyện" tới người lớn con chọn. Chuyên gia duyệt câu chữ |
| D-27 | Phụ huynh không dùng app | Người quản lý chính không dùng app **một tháng** thì đóng băng tài khoản, gửi thông báo, chờ phụ huynh xác nhận mở lại; tài khoản của con liên kết cũng đóng băng theo. **Không đóng băng** nếu người lớn khác trong gia đình vẫn dùng (chỉ nhắc người quản lý chính). Khi đóng băng, **giữ nguyên dữ liệu**; thời hạn giữ chờ luật sư |
| D-28 | Phụ huynh rút đồng ý | **Rút phần nào thì chỉ tắt tính năng đó** (ví dụ rút đồng ý ghi mệt thì tắt nút báo mệt, lịch vẫn chạy). Rút toàn bộ thì ngừng thu và tiến tới xóa. Thời hạn xóa chờ luật sư |
| D-30 | Con nói về tự hại hoặc bấm nút "Con cần giúp đỡ" thì có báo bố mẹ không? | **Không tự ý báo.** App **gợi ý con báo bố mẹ**, có nút gửi sẵn; con không muốn báo bố mẹ thì có thể chọn người lớn khác con tin. Chỉ gửi khi con bấm. Bổ sung cho D-26 |
| D-29 | Câu hỏi pháp lý mới | Thêm vào `progress/Legal_Question_Pack.md`: rút đồng ý từng phần, thời hạn xóa, đóng băng tài khoản và giữ dữ liệu |

| D-31 | Plan A (app Expo cho 5 tính năng trong `mobile/`, `supabase/`) | **Dừng Plan A**, dồn sức cho nấc 1 (A-lite E1). Mã hiện có giữ nguyên trong repo để tham khảo, không dựng tiếp. Spec `documents/app/spec-phuong-an-a-app-android.md` chuyển trạng thái tạm dừng |
| D-32 | Agent phụ | Dùng mô hình Sonnet 5.5 cho các agent phụ |


## 7. Lượt 3, ngày 15/11/2026

Câu hỏi gộp từ danh sách module nấc 1, IA 6.1, Business Logic 11.2–11.4 và bộ test nội bộ (PR #27). Chủ sản phẩm trả lời "theo đề xuất" cho tất cả.

| Mã | Câu hỏi | Quyết định |
|---|---|---|
| D-33 | Thêm F04-G06-M02 và F07-G01-M01 vào nấc 1 (MQ-01, MQ-02) | **Thêm.** Nấc 1 có 32 module. F07-G01-M01 không kiểm bằng từ khóa |
| D-34 | Chuyển người quản lý chính (MQ-04) | **Hoãn khỏi nấc 1.** Đợt thử: mỗi gia đình một người quản lý |
| D-35 | Người lớn thứ hai (Q-FAM-05, 06) | Chỉ **xem**, không sửa, không duyệt. Đợt thử nội bộ chưa mời người lớn thứ hai |
| D-36 | Khóa lịch trong nấc 1 (Q-FAM-08) | **Có**, khóa và mở thủ công đơn giản |
| D-37 | Cách tổng hợp mệt trong báo cáo tuần (MQ-05, Q-NTF-01, 02) | Gộp **theo loại ngày** (đặc điểm lịch, ví dụ "ngày có học thêm buổi tối"), không theo thứ; hiện từ 1 lần. Thay BR-133 (phần "theo thứ") và BR-135 của BL 11.1 |
| D-38 | Bố mẹ xem hoặc xuất lựa chọn hỏi thăm từng ngày (UF-Q18, Q-CON-04) | **Không** |
| D-39 | Mong muốn con gửi qua mẫu "mệt" (Q-NTF-03, 04) | Bố mẹ thấy (con chủ động gửi); thông báo đẩy trung tính; con được báo "bố mẹ đã xem"; mong muốn không hết hạn |
| D-40 | Giờ yên lặng, giờ gửi báo cáo tuần (Q-NTF-05) | Không nhắc trong **khối ngủ** của lịch con; báo cáo tuần gửi **tối Chủ Nhật 20:00**. Nhãn `đề xuất nội bộ`, chỉnh sau đợt thử |
| D-41 | Định nghĩa đóng băng (MQ-08, Q-FAM-01..03, 09) | 30 ngày không có thao tác có chủ đích của người lớn trên app phụ huynh. App của con chỉ xem lịch đã tải, không nhận lịch mới, không gửi mong muốn, có dòng "Nhờ bố mẹ mở app". Trong lúc đóng băng, giai đoạn tạm thời vẫn tự về khi hết hạn. Chỉ người quản lý chính mở lại được. Bổ sung D-27; thay UF 04.2 G4-X2, G10-X1 ở phần "con vẫn dùng lịch" khi đóng băng |
| D-42 | Danh mục mục đích đồng ý (MQ-07, Q-CON-01..03, 06) | 7 mục đích theo BL 11.3 §2.2; mục tùy chọn không chọn sẵn. Rút một mục: ẩn ngay dữ liệu cũ của mục đó, đồng ý lại không tự hiện lại. Rút toàn bộ: xác nhận 2 lần rồi tạo yêu cầu xóa. Thay UF 04.2 G6 bước 4 |
| D-43 | Nút "Con cần giúp đỡ" khi chưa có người duyệt câu chữ (MQ-09, Q-NTF-06, 07) | Đợt thử: **chỉ lời tĩnh và số 111**, kèm gợi ý con nói với bố mẹ; **chưa bật chức năng gửi tin**. Song song tìm người có chuyên môn bảo vệ trẻ em xem giúp miễn phí. Khi bật gửi: cho con nhắn cả người lớn ngoài app (qua bảng chia sẻ của máy); bản ghi giao tin tạm, xóa khi giao xong |
| D-44 | Điều kiện thử nội bộ (testkit Q1, Q2, Q4, Q7, Q9; Q-CON-07) | Nơi lưu: thư mục mã hóa trên máy của chủ sản phẩm, tối đa 2 người mở. Xóa dữ liệu **7 ngày** sau ngày kết thúc; gia đình rút giữa chừng thì xóa ngay. Phiếu ký và nhật ký xóa giữ đến khi có ý kiến luật sư. Xin trẻ đồng ý ở mọi tuổi. Không quà, không thù lao |
| D-45 | Viết lại D-01 cho nấc 1 (MQ-06) | Ngoại lệ thử nội bộ áp cho **tính năng nấc 1** (lịch, thời khóa biểu, đánh dấu Xong, hỏi thăm mệt, mong muốn của con, báo cáo tuần). Điều kiện: phiếu đồng ý của bố mẹ, trẻ được giải thích và đồng ý; tối đa 3 gia đình; có ngày kết thúc; chỉ thu dữ liệu tối thiểu theo các mục đích đã đồng ý; không GPS, ảnh, ghi âm; FR-01 xong trước (D-18); lưu và xóa theo D-44; không đưa lên repo công khai; không dùng cho mục đích khác. Cổng pháp lý vẫn mở |
| D-47 | Wireframe nấc 1 (canvas "Parent-Pal nấc 1 – Wireframe và prototype" trên claude.ai) | Chủ sản phẩm duyệt luồng wireframe cho MVP và yêu cầu triển khai bước tiếp; duyệt 7 màn mới của app trẻ (CA-07, 09, 10, 11, 12, 17, 20). Màn mới của app phụ huynh chờ góp ý |
| D-48 | Kênh cài app (D-46a) | **Nội bộ, bằng file APK; người thử tự tải APK về cài** (phương án K1). Không qua Google Play. Link tải phải riêng tư (không đặt APK trong repo công khai hay bản phát hành công khai trên GitHub); kênh lưu link chốt khi có bản build đầu |
| D-49 | Cách phụ huynh đăng nhập (D-46b) | **Email nhận mã một lần (OTP)**, không mật khẩu |
| D-50 | Dùng lại mã `mobile/` (D-46c) | **Tái dùng chọn lọc (M2):** mã mới ở `apps/`, `packages/`, `backend/`; giữ nguyên `mobile/`, `supabase/`; chỉ lấy cấu hình Expo, công cụ đo nhắc giờ, kiểu `Block`/`Plan`, kỹ thuật RLS; không lấy GPS, ảnh, ghi âm, Pal chat, mã gia đình |
| D-51 | Mã định danh app (applicationId) | **`vn.parentbestpal.parent`** và **`vn.parentbestpal.child`** (16/11/2026). Không đổi sau khi phát cho người thử |
| D-52 | Báo cáo tuần có đếm lần con bấm "Bỏ qua" không | **Không đếm**; chỉ đếm Ổn / Hơi mệt / Rất mệt |
| D-53 | Người lớn thứ hai thấy con khi nào | Khi người quản lý chính đã cấp bất kỳ quyền xem nào đang hiệu lực (chỉ xem, D-35) |
| D-54 | Nơi đặt máy chủ (LQ-08) và chi phí | **Supabase vùng Singapore (`ap-southeast-1`)**, gói **Pro khoảng 25 USD** cho tháng thử; kèm 6 biện pháp giảm rủi ro của Kiến trúc 12.1 §13.4. Cổng pháp lý LQ-08 vẫn mở, không coi là PASS. Thay một phần D-17 (cho phép khoản này) |
| D-55 | Ai code chính | **Claude** (qua Claude Code) code chính, chủ sản phẩm duyệt PR; làm đến khi hết credit thì dừng |
| D-56 | Dự án Supabase dùng cho nấc 1 (sửa D-54) | Chủ sản phẩm tạo lại dự án trống **`parent-best-pal`** (ref `roadpnpkjwjgfgottiwx`) ở vùng **Tokyo `ap-northeast-1`** (16/11/2026); không chọn được Singapore. Dự án cũ ở Seoul (có hàm `pal-chat` của Plan A) đã bị xóa. Dùng **gói miễn phí** khi phát triển với dữ liệu giả; **phải nâng lên Pro trước khi thử với gia đình thật** (cổng mới: gói miễn phí tự tạm dừng sau 7 ngày, không sao lưu). LQ-08 vẫn mở. Đề xuất chủ sản phẩm thu hồi khóa Claude API từng đặt trong dự án cũ |
| D-57 | Báo cáo tuần: tìm quy luật của ngày mệt (thay cách gộp theo loại ngày cố định của D-37) | Mỗi ngày app tính từ lịch: (1) tổng thời gian học và rèn luyện **> 2 giờ**; (2) chuỗi học/rèn luyện liên tục dài nhất **> 90 phút**; (3) hoạt động cuối kết thúc **sau 19:30**; (4) ngủ đêm trước dưới mức tối thiểu; (5) nghỉ sau giờ học **< 20 phút**; (6) có thể dục hoặc tập thể thao; (7) ngày con báo không khỏe (D-58). So ngày mệt với ngày ổn, chỉ báo đặc điểm xuất hiện ở ngày mệt nhiều hơn hẳn. Tính trên **4 tuần gần nhất**, chỉ báo khi có **≥ 3 lần mệt**; chưa đủ thì chỉ ghi số lần mệt trong tuần. Luôn nói "thường rơi vào", không kết luận nguyên nhân; **chưa gợi ý điều chỉnh lịch**. Không ngày cụ thể, không lựa chọn từng ngày (D-38). Các ngưỡng là `mặc định chưa kiểm chứng`, chờ chuyên gia |
| D-58 | Con báo trực tiếp cho bố mẹ | Thêm nút **"Báo bố mẹ ngay"** trên app của con, gửi **thông báo tức thì** cho bố mẹ, chọn từ mẫu có sẵn (không chữ tự do): "Con thấy không khỏe", "Con được nghỉ học sớm", "Nhờ bố mẹ đến đón con". Khác hẳn nút "Con cần giúp đỡ" (luồng an toàn, không tự báo gia đình, D-26/D-30/D-43); hai nút đặt tách biệt. Báo không khỏe **không tự đổi lịch** (D-10): bố mẹ quyết định hủy hay đổi lịch ngày đó (QT K4). Ngày con báo không khỏe không tính là thiếu việc và được xét riêng trong quy luật mệt (D-57). Lưu ý: "không khỏe" là dữ liệu liên quan sức khỏe; chỉ lưu loại sự kiện và thời điểm, không triệu chứng; thêm làm **mục đích đồng ý thứ 8** (tùy chọn) và câu hỏi cho luật sư |
| D-59 | Gửi email đăng nhập (OTP) | Lúc phát triển: dùng máy chủ thư mặc định của Supabase (chỉ gửi tới email thành viên nhóm, giới hạn số thư); app xử lý cả thư dạng link. **Trước khi thử với gia đình thật (cổng bắt buộc):** dùng SMTP riêng qua **Resend** (gói miễn phí); chủ sản phẩm tự tạo tài khoản và tự nhập thông tin SMTP vào Supabase (không gửi mật khẩu qua chat); sửa mẫu thư để hiện mã 6 số. Resend là thêm một bên nước ngoài nhận email phụ huynh: ghi vào phiếu đồng ý (Kit 01 mục 4) và LQ-08. Việc này không cần gói Pro (16/11/2026) |
| D-60 | Thông số ghép máy và Parent PIN (OW-06, Q-TS-01; PR-FAM-04, PR-FAM-05) | Theo đề xuất: mã ghép **6 chữ số**, hết hạn **10 phút**; nhập sai **5 lần trong 15 phút** thì khóa **15 phút**; máy con có **5 phút** để bấm Đồng ý; PIN **6 chữ số**, chặn PIN dễ đoán; sai PIN **5 lần** thì khóa **15 phút**, lần khóa sau gấp đôi, tối đa 24 giờ; **được hủy liên kết khi gia đình đang đóng băng**; pepper của PIN giữ trong Vault của CSDL ở đợt thử nội bộ, cân nhắc chuyển sang Edge Function trước khi mở rộng. Các giá trị trong `private.params` chuyển sang `DA_CHOT` (16/11/2026) |
| D-61 | Cách build APK (thay gợi ý dùng EAS) | Chủ sản phẩm **tự build APK trên máy tính của mình** (đã có Android SDK); **không** tạo tài khoản Expo/EAS. Claude không build được trong môi trường của mình (không có Android SDK, không có emulator) nên kiểm luồng bằng bản web giả lập; chạy thử thật trên máy của chủ sản phẩm (16/11/2026) |
| D-62 | Ai merge PR | **Claude tự merge PR** khi CI đạt và đã tự kiểm (test, quét bí mật). PR có thay đổi về **thiết kế sản phẩm** (luồng, câu chữ hiển thị, quy tắc nghiệp vụ, dữ liệu thu thập, quyền riêng tư) thì **trao đổi với chủ sản phẩm trước** khi merge. Vẫn giữ: mỗi bước một nhánh, một PR, không đẩy thẳng lên `main`; tạo tài khoản, dịch vụ hay phát sinh chi phí vẫn hỏi trước (16/11/2026) |
| D-63 | Thứ tự làm và mốc thử trên máy thật | Claude làm hết **đợt 2 đến đợt 5–6** của nấc 1 (Dev Plan 15.1) trước; **chặng 2 (Pal/AI tư vấn) chủ sản phẩm đang cân nhắc**, chưa thiết kế. Chủ sản phẩm muốn thử trên máy khi đã có AI và lập lịch tự động; trong lúc chờ, mỗi PR tự chạy test unit, phân quyền, component, E2E và so ảnh trên bản web. Việc cần máy thật (T1.7 nghiệm thu, T3.4, T3.7, T5.2, T6.1) gom lại để chủ sản phẩm chạy một lượt; các cổng liên quan chưa đạt cho tới khi có bằng chứng máy thật (16/11/2026) |
| D-64 | Mô hình đồng ý (thay cách tách theo từng tính năng) | **Đồng ý pháp lý một lần khi đăng ký** cho phần lõi (lập lịch, đồng bộ sang máy con, nhắc việc, "Xong", báo cáo nhanh, điều con mong muốn, báo cáo tuần), **không hỏi từng mục**. Trong bảng mục đích chỉ còn một mục lõi `MD-LICH`. **Bước đồng ý của con:** lần đầu mở app con, màn CA-16 "Những gì bố mẹ thấy" đồng thời là màn con đồng ý; Nghị định 330 phạt xử lý dữ liệu trẻ từ 7 tuổi khi thiếu đồng ý của cả trẻ và người đại diện; **chờ luật sư xác nhận (LQ-17)**. **Đồng ý riêng chỉ cho:** `MD-SUCKHOE`, `MD-CONBAO` (D-58, thiết kế chờ chủ sản phẩm xác nhận), chat AI (chặng 2, chưa dựng). **Cài đặt khác đồng ý:** máy con hiện chỉ có "tắt chat AI (trừ nhật ký)", thuộc chặng 2; nấc 1 chỉ cần chỗ lưu cài đặt (`ai_chat_enabled`, mặc định tắt). **Rút luôn được, kể cả khi hộ đóng băng**; rút = ngừng dùng, gỡ máy con, chờ xóa. **Hộ nhiều con:** rút cho một con chỉ xóa dữ liệu của con đó (kể cả hộ dùng thử; vị trí dùng thử chỉ RUT_SOM khi là con cuối). Giữ: sổ đồng ý chỉ ghi thêm, đồng ý lại không hiện dữ liệu cũ, audit. | Chủ sản phẩm chốt 17/11/2026 |
| D-65 | Thời gian dùng thử tối đa | `trial_max_days` = **14 ngày** (DA_CHOT). | Chủ sản phẩm chốt 17/11/2026 |
| D-66 | Thông tin sức khỏe của con ở nấc 1 | Vẫn **lưu** trong hồ sơ con (dị ứng, thuốc, khác). Phụ huynh **xóa hoặc tắt** được. Lưu kèm **nguồn** (ai khai, vai trò, ngày; ví dụ "mẹ bé khai báo, 17/11/2026"). **Việc dùng** thông tin này (bộ lập lịch, Pal) quyết sau; nấc 1 chỉ lưu và hiển thị. Cần đồng ý riêng `MD-SUCKHOE`; máy con không đọc; audit không ghi nội dung; rút đồng ý thì ẩn ngay và xếp hàng xóa. | Chủ sản phẩm chốt 17/11/2026 (ghi nguyên ý) |
| D-67 | Nút "Báo bố mẹ ngay" (D-58) | Con **chỉ chọn câu có sẵn dạng câu hỏi** (ví dụ "Con thấy không khỏe?", "Nhờ bố mẹ đón sớm?", "Con cần bố mẹ gọi?") và bấm **"Đồng ý"** để xác nhận thì mới gửi. **Không có ô gõ chữ hay triệu chứng.** Thông báo **tự xóa sau 7 ngày** (`child_alert_retention_days` = 7, DA_CHOT), **không vào báo cáo tuần**. Bố mẹ bật tính năng bằng **một lần đồng ý riêng `MD-CONBAO`** (cấp con, `collect_enabled` = true). Giới hạn tần suất gửi: mặc định 6 lần/giờ/con (`child_alert_max_per_hour`, CHUA_CHOT). Thông báo đẩy cho bố mẹ làm sau (T3.5). | Chủ sản phẩm chốt 17/11/2026 |
| D-72 | Gói dịch vụ, chi tiết (19/11/2026) | (1) **Dùng thử:** 1 kế hoạch và 3 lần sửa cho **mỗi hồ sơ con** (đếm theo con). (2) **Miễn phí:** được nhập thông tin con và hỏi Pal; Pal gợi ý hoạt động hợp đặc điểm của con nhưng **không** tạo lịch cụ thể. (3) Miễn phí **không** xem trước hay tạo lịch; bấm tạo lịch thì mời dùng thử. **Chống dùng thử lặp:** một mã máy (Android ID theo app, băm) và một email đã chuẩn hóa chỉ được dùng thử **một lần**; khi có thanh toán Google Play, Play cũng giới hạn một lần mỗi tài khoản Google. (4) **Hạ gói:** máy con báo dừng, chờ cập nhật từ bố mẹ (giữ liên kết). (5) **Hết dùng thử:** khóa tính năng premium và đồng bộ trạng thái sang máy con. (6) Bố mẹ premium thì máy con cũng premium; đổi trạng thái thì máy con đổi theo |
| D-46 | Kênh cài app, cách đăng nhập, dùng lại mã `mobile/` (testkit Q6, MQ-10) | Quyết ở bước **kiến trúc hệ thống** |

Đã chốt 16/11: D-51..D-55. Danh sách loại ngày đã thay bằng cách tìm quy luật (D-57).

Còn mở: có đưa phần kỹ năng mềm (v5.21, v5.22 của bản đồ kiến thức, hiện chỉ có trong project trên claude.ai) vào repo không. Chủ sản phẩm: **chưa đưa vào** (15/11/2026).
