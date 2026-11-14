# Bộ câu hỏi pháp lý cho luật sư Việt Nam: Parent-Pal

- **Người soạn:** AI (Claude), chưa kiểm chứng độc lập.
- **Ngày:** 14/11/2026.
- **Tính chất:** tài liệu này **không phải tư vấn pháp lý** và không đưa ra kết luận pháp lý. Mọi mô tả về văn bản luật dưới đây đều **cần luật sư xác nhận**.
- **Mục đích:** gom các câu hỏi pháp lý đang chặn thiết kế, để luật sư trả lời theo định dạng giúp nhóm sản phẩm thiết kế tiếp.
- **Nguồn nội bộ:** `Product_Blueprint_Master_Research_Backlog_v1_2.md` (MR-016, 017, 018, 021, 022), `Feature_3_2_L4_Independent_Review_9aa4c8a_Disposition_REVIEW.md` (H4), `Feature_3_2_L4_OD02_OD05_Owner_Decision_Log_APPROVED.md` (FR-03), `Feature_3_2_L4_B01_*_APPROVED.md`, `documents/app/spec-phuong-an-a-app-android.md` (Plan A). Xem thêm `Constraint_Register_Approved_Decisions.md` cùng thư mục.

## 0. Mô tả ngắn sản phẩm cho luật sư

- **Hai ứng dụng.** Parent App cho phụ huynh, Child App cho trẻ (lõi là lớp 1–9; dài hạn 0–23 tuổi).
- **Pal.** Trợ lý AI giúp lập lịch sinh hoạt và học tập, nhắc việc, trò chuyện. Pal gọi một API AI của nhà cung cấp nước ngoài (Anthropic, Claude) qua máy chủ trung gian. Tên con, tên trường và địa chỉ được thay bằng mã trước khi gửi.
- **Bản thử Plan A (Android).** Gồm nhắc giờ, vùng GPS (Nhà, Trường, nơi học thêm; chỉ lưu sự kiện vào/ra vùng), ghi âm, chụp ảnh bài làm, thông báo đẩy giữa máy bố mẹ và máy con. Dự kiến test với 1–3 gia đình quen, có ký phiếu đồng ý. Dịch vụ hạ tầng dự kiến: Supabase, Expo Push, Firebase Cloud Messaging. Nơi đặt máy chủ chưa chốt.
- **Quyết định sản phẩm đã có:**
  - phụ huynh tự khai tư cách khi onboarding, không bắt xác minh giấy tờ;
  - mỗi gia đình có một "Primary Caregiver";
  - Nhật ký (Journal) của trẻ là riêng tư, trẻ tự quyết việc chia sẻ;
  - xóa Journal: ẩn ngay, xóa vĩnh viễn sau 60 ngày;
  - không xử lý dữ liệu thật của trẻ khi chưa xác định căn cứ pháp lý (`LEGAL_UNKNOWN ≠ ALLOW`).

## 1. Văn bản tham chiếu

AI chưa đọc được toàn văn chính thức. Trang vbpl.moj.gov.vn bị chặn trong môi trường làm việc, còn trang thuvienphapluat.vn không tải được. Số điều ghi "(chưa xác nhận)" là suy từ tài liệu giới thiệu thứ cấp.

| Văn bản | Thông tin | Nguồn đã mở | Ngày truy cập |
|---|---|---|---|
| Luật Bảo vệ dữ liệu cá nhân, số 91/2025/QH15 | Thông qua ngày 26/6/2025, hiệu lực từ 01/01/2026 | [LuatVietnam](https://luatvietnam.vn/tin-van-ban-moi/da-co-luat-bao-ve-du-lieu-ca-nhan-2025-so-91-2025-qh15-186-102925-article.html); tài liệu giới thiệu luật của [Trường ĐH Tiền Giang (PDF)](https://www.tgu.edu.vn/upload/files/Tailieu-gioithieu-LuatBaovedulieucanhan.pdf) (thứ cấp ○) | 14/11/2026 |
| Nghị định 356/2025/NĐ-CP (quy định chi tiết Luật 91) | Ban hành 31/12/2025, hiệu lực 01/01/2026, thay Nghị định 13/2023/NĐ-CP | [Cổng Chính phủ, trang thông tin văn bản](https://chinhphu.vn/?classid=0&docid=216387&pageid=27160) (chỉ có thông tin hành chính); [EY Legal Alert 03/2026 (PDF)](https://www.ey.com/content/dam/ey-unified-site/ey-com/vi-vn/technical/tax/documents/ey-vietnam-legal-alert-march-2026-decree-no356-2025-nd-cp-providing-detailed-guidance-for-implementation-of-personal-data-protection-law-viet.pdf) (thứ cấp ○) | 14/11/2026 |
| Toàn văn Nghị định 356 (chưa mở được) | Bản .doc trên Cơ sở dữ liệu quốc gia về VBPL | https://vbpl.moj.gov.vn/TW/Lists/vbpq/Attachments/187276/ND.356.2025.doc | Truy cập bị từ chối (403) |
| Nghị định 330 (xử phạt bảo vệ dữ liệu cá nhân) | Chỉ thấy tên trong kết quả tìm kiếm, chưa đọc | [EY (PDF)](https://www.ey.com/content/dam/ey-unified-site/ey-com/vi-vn/technical/tax/documents/ey-vn-decree-330-providing-sanctions-for-personal-data-protection.pdf) | 14/11/2026 |

**Các điểm AI ghi nhận từ nguồn thứ cấp** (tất cả **cần luật sư xác nhận**):

- **Đồng ý (Điều 9, theo tài liệu giới thiệu):** phải tự nguyện, rõ ràng, tách riêng theo từng mục đích. Im lặng không được coi là đồng ý.
- **Xử lý không cần đồng ý:** tài liệu giới thiệu dẫn "Điều 19 khoản 1", gồm các trường hợp như bảo vệ tính mạng, sức khỏe khi khẩn cấp.
- **Dữ liệu của trẻ em (số điều chưa xác nhận):** người đại diện theo pháp luật thực hiện quyền thay trẻ. Tài liệu giới thiệu nói việc công khai thông tin của trẻ từ đủ 7 tuổi cần cả trẻ và người đại diện đồng ý.
- **Dữ liệu nhạy cảm:** tài liệu giới thiệu kể sức khỏe và vị trí trong các ví dụ. Danh mục chi tiết do Nghị định quy định. Bản tóm tắt của EY về Nghị định 356 không nói rõ vị trí có thuộc danh mục hay không.
- **Ứng dụng di động và dữ liệu vị trí (số điều chưa xác nhận):** phải thông báo cho người dùng và có lựa chọn bật/tắt theo dõi vị trí.
- **AI, dữ liệu lớn, điện toán đám mây (số điều chưa xác nhận):** chỉ xử lý trong giới hạn cần thiết, phải phân loại rủi ro.
- **Hồ sơ đánh giá tác động (DPIA) và chuyển dữ liệu ra nước ngoài (CTIA):**
  - theo tài liệu giới thiệu Luật: nộp trong 60 ngày kể từ lần xử lý hoặc chuyển đầu tiên;
  - theo EY về Nghị định 356: chuyển sang thẩm định trước bởi Cục A05, Bộ Công an.
- **Thời hạn xử lý yêu cầu:** hai nguồn khác nhau, xem LQ-04.
- **Chuyển tiếp:** dữ liệu đã có đồng ý theo Nghị định 13 thì không cần xin lại.

## 2. Các câu hỏi

Mỗi câu hỏi có bốn phần: (a) bối cảnh xử lý, (b) câu hỏi cụ thể, (c) vì sao quan trọng với thiết kế, (d) định dạng câu trả lời giúp gỡ chặn.

### LQ-01. Căn cứ pháp lý để xử lý dữ liệu của trẻ (MR-016; PA-OD-04)

- **(a) Bối cảnh:** hồ sơ trẻ (tên, tuổi, lớp, thời khóa biểu, hoạt động cố định), lịch, tiến độ "✓ Xong", tự báo "Ổn / Hơi mệt / Rất mệt", tin báo "Con thấy đói". Phụ huynh tạo hồ sơ trên Parent App. Trẻ dùng Child App sau khi liên kết.
- **(b) Câu hỏi:**
  1. Với từng hoạt động trên, căn cứ xử lý phù hợp là gì (đồng ý, thực hiện hợp đồng với phụ huynh, căn cứ khác)?
  2. Ai phải đồng ý: chỉ người đại diện theo pháp luật, hay cả trẻ, và từ tuổi nào?
  3. Mốc 7 tuổi chỉ áp cho việc "công khai" thông tin hay cho mọi hoạt động xử lý?
- **(c) Vì sao quan trọng:** Owner đã chốt không xử lý dữ liệu thật khi chưa có căn cứ. Câu trả lời mở hoặc giữ cổng G-Legal cho toàn bộ app.
- **(d) Định dạng:** bảng gồm các cột: hoạt động, căn cứ, người đồng ý, tuổi, điều khoản, điều kiện kèm theo. Mỗi ô ghi CÓ / KHÔNG / CÓ ĐIỀU KIỆN.

### LQ-02. Đồng ý của người giám hộ và việc tự khai (MR-017; CL-OD-01..03; AP-OD-01)

- **(a) Bối cảnh:**
  - phụ huynh tự khai là cha/mẹ, không nộp giấy tờ;
  - một Primary Caregiver mỗi gia đình, người lớn khác là Supporter/Observer;
  - đổi Primary (mẹ sang bố) thì consent mẹ đã cấp vẫn giữ;
  - chỉ Primary rút được consent.
- **(b) Câu hỏi:**
  1. Đồng ý do người tự khai là cha/mẹ đưa ra có hợp lệ không? Bằng chứng tối thiểu là gì?
  2. Khi có hai cha mẹ (hoặc cha mẹ ly hôn), đồng ý của một người có đủ không? Người còn lại có quyền phản đối hoặc yêu cầu xóa không?
  3. Đổi người quản lý thì đồng ý cũ còn hiệu lực không?
  4. Quy định "chỉ Primary rút đồng ý" có trái quyền của người đại diện khác hoặc của trẻ không?
  5. Hình thức đồng ý nào được chấp nhận (bấm nút, chữ ký điện tử)? Cần lưu những trường gì để chứng minh?
- **(c) Vì sao quan trọng:** quyết định thiết kế Consent Ledger, luồng onboarding và luồng tranh chấp.
- **(d) Định dạng:** danh sách trường bắt buộc của bản ghi đồng ý; cây quyết định cho tình huống nhiều người giám hộ; mẫu câu đồng ý đã duyệt.

### LQ-03. Xác minh thẩm quyền khi ghép trẻ vào hộ khác (FR-01B; ODP-01)

- **(a) Bối cảnh:** Owner chốt: sau khi hủy liên kết (cần Parent PIN), muốn ghép trẻ sang hộ khác thì phải có xác minh mới, riêng cho trẻ đó. Không chuyển hộ trực tiếp.
- **(b) Câu hỏi:**
  1. Pháp luật có yêu cầu mức xác minh nào để một người lớn được quản lý dữ liệu của trẻ (giấy khai sinh, quyết định giám hộ, mức khác)?
  2. Khi có tranh chấp, app phải làm gì: tạm khóa, giữ nguyên, hay chờ quyết định của cơ quan có thẩm quyền?
- **(c) Vì sao quan trọng:** FR-01B đang để ngỏ phương pháp xác minh. Owner cấm tự đặt ra yêu cầu giấy tờ khi chưa có căn cứ.
- **(d) Định dạng:** danh sách giấy tờ hoặc cách xác minh được chấp nhận, kèm mức bắt buộc; quy trình xử lý tranh chấp gồm các bước tối thiểu.

### LQ-04. Thời hạn xóa dữ liệu (H4, MR-018; ODP-02, PA-OD-03)

- **(a) Bối cảnh:**
  - trẻ hoặc phụ huynh yêu cầu xóa Journal hoặc dữ liệu khác;
  - sản phẩm đặt: ẩn ngay, xóa vĩnh viễn sau 60 ngày, gồm cả dữ liệu dẫn xuất (tóm tắt, embedding, cache) và bản sao lưu;
  - xóa là một chiều, không khôi phục;
  - ảnh và ghi âm của Plan A tự xóa sau 30 ngày (đề xuất nội bộ).
- **(b) Câu hỏi:**
  1. Hai nguồn nội bộ và thứ cấp ghi thời hạn khác nhau:
     - tài liệu nội bộ dẫn "Điều 5 khoản 4" Nghị định 356: 2 ngày làm việc để phản hồi, 20 ngày để thực hiện, nhánh 30 ngày khi có bên xử lý hoặc bên thứ ba, gia hạn một lần tối đa 20 ngày;
     - bản tóm tắt của EY: yêu cầu xóa phản hồi trong 20 ngày, hoàn tất trong 30 ngày, gia hạn một lần tối đa 20 ngày; rút đồng ý thì 2 ngày làm việc và 15 ngày.

     Thời hạn đúng là bao nhiêu? Mốc bắt đầu tính là lúc nào?
  2. Mức 60 ngày của sản phẩm có vượt hạn luật định không?
  3. "Ẩn ngay" có được coi là đã thực hiện yêu cầu không?
  4. Bản sao lưu, log kiểm toán và dữ liệu ở nhà cung cấp AI phải xóa trong hạn nào?
  5. Những ngoại lệ được giữ lại là gì (nghĩa vụ lưu trữ, an toàn trẻ em)?
  6. Rút chia sẻ Journal (không xóa) có phải là yêu cầu "hạn chế xử lý" theo luật không?
- **(c) Vì sao quan trọng:** H4 đang là cổng chặn phát hành cho F07-G06-M02 Retention & Deletion và F05-G06. Thời hạn quyết định cấu hình lịch xóa và kiến trúc sao lưu.
- **(d) Định dạng:** bảng gồm loại yêu cầu (xóa, rút đồng ý, hạn chế, truy cập), hạn phản hồi, hạn hoàn tất, mốc bắt đầu, điều kiện gia hạn, bằng chứng cần lưu, điều khoản. Thêm danh sách ngoại lệ được giữ lại, kèm thời hạn.

### LQ-05. Đánh giá tác động xử lý dữ liệu, DPIA (MR-021)

- **(a) Bối cảnh:** công ty khởi nghiệp, quy mô pilot 1–3 gia đình rồi mở rộng. Xử lý dữ liệu trẻ, có thể có sức khỏe và vị trí.
- **(b) Câu hỏi:**
  1. App có phải lập và nộp DPIA không? Nộp trước khi xử lý (thẩm định trước) hay trong 60 ngày sau lần đầu?
  2. Miễn trừ cho doanh nghiệp nhỏ hoặc khởi nghiệp có áp dụng khi xử lý dữ liệu nhạy cảm hoặc dữ liệu trẻ không?
  3. Pilot nội bộ với gia đình quen, có phiếu đồng ý, có cần DPIA không?
  4. Hồ sơ cần có những phần nào (sơ đồ luồng dữ liệu, vai trò bên kiểm soát hay bên xử lý)?
- **(c) Vì sao quan trọng:** quyết định việc pilot Plan A có được chạy với dữ liệu thật không (xung đột OC-01 trong sổ ràng buộc), và mốc thời gian phát hành.
- **(d) Định dạng:** CÓ/KHÔNG phải nộp, theo từng giai đoạn (pilot, phát hành); danh mục thành phần hồ sơ; thời hạn và cơ quan nhận.

### LQ-06. Dữ liệu vị trí của trẻ cho geofence (Plan A; PC-11, OD-A3)

- **(a) Bối cảnh:**
  - phụ huynh bật vùng Nhà, Trường, nơi học thêm trên máy con;
  - app xin quyền vị trí nền ("Luôn cho phép");
  - chỉ lưu sự kiện vào/ra vùng và thời điểm, không lưu chuỗi tọa độ;
  - tọa độ không gửi cho AI;
  - lệch mốc thì đẩy thông báo cho bố mẹ.
- **(b) Câu hỏi:**
  1. Sự kiện "vào vùng Trường lúc 7:02" có phải dữ liệu vị trí hay dữ liệu nhạy cảm không?
  2. Cần đồng ý của ai (cha mẹ, trẻ từ 7 tuổi)? Trẻ có quyền tắt không?
  3. Nghĩa vụ thông báo và lựa chọn bật/tắt của nhà cung cấp ứng dụng được thể hiện thế nào trên máy trẻ?
  4. Có giới hạn thời gian lưu không?
  5. Chia sẻ sự kiện vị trí với người lớn khác trong gia đình (Supporter) có cần đồng ý riêng không?
- **(c) Vì sao quan trọng:** danh mục mục đích (purpose catalog) Owner phê duyệt hiện chưa có mục vị trí. Câu trả lời quyết định có làm tính năng 2 của Plan A hay không, và màn xin quyền ra sao.
- **(d) Định dạng:** phân loại dữ liệu (thường hay nhạy cảm); người đồng ý; nội dung thông báo bắt buộc; thời hạn lưu tối đa; điều khoản.

### LQ-07. Dữ liệu sức khỏe trong hồ sơ trẻ (SG-03)

- **(a) Bối cảnh:** phụ huynh có thể nhập dị ứng, thuốc đang dùng để Pal tránh gợi ý món ăn hoặc hoạt động có hại.
- **(b) Câu hỏi:**
  1. Thông tin này có phải dữ liệu sức khỏe nhạy cảm không?
  2. Cần hình thức đồng ý nào?
  3. Có được gửi (đã ẩn danh hoặc chưa) tới API AI ở nước ngoài không?
  4. Nếu chỉ lưu trên máy, không lên máy chủ, nghĩa vụ có khác không?
- **(c) Vì sao quan trọng:** A-lite coi đây là năng lực an toàn thiết yếu. Nếu nghĩa vụ quá nặng thì nhóm sẽ giảm thiểu hoặc loại khỏi pilot.
- **(d) Định dạng:** CÓ/KHÔNG nhạy cảm; điều kiện xử lý; khuyến nghị tối thiểu hóa được phép.

### LQ-08. Chuyển dữ liệu ra nước ngoài khi dùng API AI và hạ tầng nước ngoài

- **(a) Bối cảnh:**
  - nội dung trò chuyện, ảnh bài làm, ghi âm có thể được gửi tới API AI (Anthropic, Hoa Kỳ) để Pal trả lời hoặc nhận xét;
  - tên con, trường, địa chỉ được thay bằng mã trước khi gửi;
  - máy chủ Supabase và dịch vụ đẩy Expo/FCM có thể đặt ở nước ngoài.
- **(b) Câu hỏi:**
  1. Dữ liệu đã thay mã còn là dữ liệu cá nhân không? Ảnh bài làm và giọng nói có tự làm lộ danh tính không?
  2. Việc gọi API có phải "chuyển dữ liệu ra nước ngoài" không? Phải lập và nộp CTIA trước hay sau?
  3. Hợp đồng với nhà cung cấp AI cần điều khoản gì (bên xử lý, thời hạn lưu, không dùng để huấn luyện)?
  4. Dịch vụ đẩy thông báo có tính là chuyển ra nước ngoài không?
- **(c) Vì sao quan trọng:** quyết định kiến trúc `pal-chat`, mức ẩn danh và việc chọn nơi đặt máy chủ.
- **(d) Định dạng:** danh sách luồng dữ liệu, ghi rõ luồng nào phải lập CTIA; danh mục điều khoản hợp đồng bắt buộc; tiêu chí ẩn danh được chấp nhận (nếu có).

### LQ-09. Thông báo an toàn tĩnh khi chưa rõ căn cứ xử lý (FR-03; OD-03)

- **(a) Bối cảnh:**
  - lớp an toàn đọc tin nhắn trước AI;
  - nếu thấy dấu hiệu nguy cơ, trẻ được thấy lời "nói với người lớn tin cậy", có thể kèm 111;
  - phụ huynh báo khẩn thì thấy 115/113/111;
  - không tự gọi, không tự báo gia đình.
- **(b) Câu hỏi:**
  1. Việc quét tin nhắn của trẻ để phát hiện nguy cơ có phải là xử lý dữ liệu cần căn cứ riêng không?
  2. Trường hợp "bảo vệ tính mạng, sức khỏe khi khẩn cấp" có áp dụng không?
  3. Có được hiển thị một thông báo tĩnh mà không lưu tin nhắn không?
  4. Có nghĩa vụ báo cơ quan bảo vệ trẻ em khi phát hiện dấu hiệu xâm hại không?
- **(c) Vì sao quan trọng:** FR-03 đang chặn phát hành. Owner đã hoãn Human Response Workflow và cấm tự báo gia đình. Nếu luật có nghĩa vụ báo cáo, quyết định này cần xem lại.
- **(d) Định dạng:** CÓ/KHÔNG cần căn cứ riêng; điều kiện của ngoại lệ khẩn cấp; nghĩa vụ báo cáo (có/không, cho ai, trong bao lâu).

### LQ-10. Ảnh, giọng nói, cảm xúc và Journal của trẻ

- **(a) Bối cảnh:** ảnh bài làm (có thể có mặt hoặc chữ viết của trẻ), ghi âm "Kể cho Pal", tự báo mệt, Journal riêng tư.
- **(b) Câu hỏi:**
  1. Giọng nói hoặc ảnh có thành dữ liệu sinh trắc học không?
  2. Nhật ký cảm xúc có phải dữ liệu nhạy cảm không?
  3. Khi trẻ không muốn chia sẻ Journal mà phụ huynh (người đại diện) yêu cầu truy cập, quyền của ai được ưu tiên?
- **(c) Vì sao quan trọng:** Owner chốt Journal riêng tuyệt đối, trẻ tự quyết việc chia sẻ. Nếu luật cho người đại diện quyền truy cập thì có mâu thuẫn.
- **(d) Định dạng:** phân loại từng loại dữ liệu; quy tắc ưu tiên khi trẻ và người đại diện không cùng ý; thời hạn lưu khuyến nghị theo luật (nếu có).

### LQ-11. Pilot với gia đình thật (Plan A, bước 6)

- **(a) Bối cảnh:** 1–3 gia đình quen, test hai tuần, chủ sản phẩm lo phiếu đồng ý giấy, cài APK ngoài Google Play.
- **(b) Câu hỏi:**
  1. Phiếu đồng ý giấy có đủ làm căn cứ không? Phiếu cần những nội dung bắt buộc nào?
  2. Pilot do cá nhân (chưa có pháp nhân) thực hiện thì ai là bên kiểm soát dữ liệu?
  3. Có cần DPIA hay CTIA trước pilot không (liên quan LQ-05, LQ-08)?
- **(c) Vì sao quan trọng:** các quyết định L4 đã duyệt cấm dùng dữ liệu trẻ thật khi chưa đánh giá căn cứ. Đây là xung đột OC-01, đang chờ Owner.
- **(d) Định dạng:** danh mục nội dung phiếu đồng ý; CÓ/KHÔNG cần hồ sơ trước pilot; điều kiện tối thiểu để pilot hợp pháp.

### LQ-12. Chuyển sang tuổi trưởng thành (AP-OD-04)

- **(a) Bối cảnh:** người đủ 18 tuổi đã xác minh thì tự quản dữ liệu. Dữ liệu do phụ huynh nhập từ trước vẫn còn.
- **(b) Câu hỏi:**
  1. Đủ 18 tuổi thì phải xin lại đồng ý của chính người đó không?
  2. Phụ huynh còn quyền gì với dữ liệu cũ?
  3. Trẻ 16–17 tuổi có quyền riêng nào không?
- **(c) Vì sao quan trọng:** thiết kế luồng chuyển giao tài khoản và quyền.
- **(d) Định dạng:** bảng mốc tuổi và quyền tương ứng.

### LQ-13. Nội dung tài trợ và người dưới 18 tuổi (OD-02)

- **(a) Bối cảnh:** Owner chốt không hiển thị tài trợ cho người dưới 18. Phụ huynh có thể thấy gợi ý dịch vụ có tài trợ, kèm minh bạch.
- **(b) Câu hỏi:** luật quảng cáo và luật bảo vệ dữ liệu có hạn chế thêm gì không, ví dụ dùng dữ liệu của trẻ để chọn quảng cáo hiển thị cho phụ huynh?
- **(c) Vì sao quan trọng:** dùng để kiểm Package D và chặn lệch mục đích (PA-REG-6).
- **(d) Định dạng:** danh mục điều cấm hoặc điều kiện, kèm điều khoản.

### LQ-14. Rút đồng ý từng phần (D-28)

- **(a) Bối cảnh:** chủ sản phẩm chốt hướng "rút phần nào thì chỉ tắt tính năng đó". Ví dụ phụ huynh rút đồng ý ghi việc con báo mệt thì app tắt nút báo mệt, lịch vẫn chạy. Rút toàn bộ thì app ngừng thu và tiến tới xóa.
- **(b) Câu hỏi:**
  1. Cách rút từng phần như trên có đúng luật không? Có cần tách đồng ý theo từng mục đích ngay từ đầu không?
  2. Sau khi rút, dữ liệu cũ của phần đã rút phải xóa trong bao lâu? Có được giữ bản đã ẩn danh để thống kê không?
  3. Trẻ ở độ tuổi nào thì phải hỏi thêm ý kiến của chính trẻ khi rút hay cho lại đồng ý?
- **(c) Vì sao quan trọng:** quyết định luồng G6, G7 của User Flow 4.2 và cấu trúc lưu dữ liệu theo mục đích.
- **(d) Định dạng:** CÓ/KHÔNG cho từng câu, thời hạn cụ thể, điều khoản.

### LQ-15. Đóng băng tài khoản khi phụ huynh không dùng app (D-27)

- **(a) Bối cảnh:** người quản lý chính không dùng app một tháng thì tài khoản và tài khoản liên kết của con đóng băng, có thông báo, chờ phụ huynh xác nhận mở lại. Không đóng băng nếu người lớn khác trong gia đình vẫn dùng. Khi đóng băng, dữ liệu giữ nguyên.
- **(b) Câu hỏi:**
  1. Giữ dữ liệu của trẻ khi tài khoản đóng băng được tối đa bao lâu? Hết hạn thì phải xóa hay chỉ cần ẩn?
  2. Có phải báo trước bao lâu trước khi đóng băng hay xóa không, báo qua kênh nào?
  3. Việc ngừng app của con (trẻ đang dùng lịch) khi phụ huynh không dùng có rủi ro pháp lý nào không?
- **(c) Vì sao quan trọng:** luồng G9, G10 của User Flow 4.2; thời hạn lưu là một phần của cổng H4.
- **(d) Định dạng:** thời hạn cụ thể, điều khoản.

## 3. Thứ tự ưu tiên đề xuất cho luật sư

1. LQ-01, LQ-02, LQ-11: căn cứ xử lý và đồng ý. Gỡ cổng dữ liệu thật và pilot.
2. LQ-04, LQ-14, LQ-15: thời hạn xóa, rút đồng ý, đóng băng (H4, cổng chặn phát hành).
3. LQ-08, LQ-05: chuyển ra nước ngoài và DPIA.
4. LQ-06, LQ-07, LQ-09, LQ-10: các loại dữ liệu nhạy cảm và luồng an toàn.
5. LQ-03, LQ-12, LQ-13.

## 4. Yêu cầu chung về cách trả lời

- Mỗi câu trả lời ghi số điều, khoản của văn bản, kèm phiên bản và ngày hiệu lực.
- Ghi rõ mức chắc chắn: rõ ràng theo luật / có thể diễn giải / chưa có hướng dẫn.
- Chỗ nào luật chưa quy định, xin luật sư đề xuất mức an toàn tối thiểu. Nhóm sẽ gắn nhãn `đề xuất nội bộ` theo quy ước của repo.
- Nhóm sản phẩm sẽ ghi câu trả lời vào sổ ràng buộc và đổi trạng thái cổng G-Legal tương ứng. Những phần chưa được trả lời vẫn giữ `UNKNOWN`, không được hiểu là được phép.

*Toàn bộ mô tả văn bản luật trong tài liệu này: cần luật sư xác nhận.*
