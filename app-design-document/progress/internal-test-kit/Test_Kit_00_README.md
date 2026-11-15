# Bộ tài liệu thử nghiệm nội bộ với gia đình quen (A-lite E1): đọc trước

> **Cập nhật lượt 3 (15/11/2026):** điều kiện ngoại lệ thử nội bộ đã viết lại cho nấc 1 (D-45). Câu hỏi Q1, Q2, Q4, Q7, Q9 đã quyết (D-44): lưu trong thư mục mã hóa trên máy chủ sản phẩm (tối đa 2 người), xóa 7 ngày sau kết thúc, rút giữa chừng xóa ngay, giữ phiếu ký và nhật ký xóa đến khi có ý kiến luật sư, xin trẻ đồng ý mọi tuổi, không quà. Q8: không mời người lớn thứ hai (D-35). Q10: tìm người xem giúp miễn phí (D-43). Q6 để bước kiến trúc (D-46). Nút "Con cần giúp đỡ" trong đợt thử chỉ có lời tĩnh và 111.

> **Chưa được luật sư xem; không thay ý kiến pháp lý.** Đây là bản nháp do AI soạn. Không file nào trong bộ này là văn bản pháp lý. Cổng pháp lý H4 và FR-03 **vẫn mở, không PASS**. Bộ này chỉ giúp chủ sản phẩm chạy thử có kiểm soát trong ngoại lệ D-01.

- **Ngày soạn:** 15/11/2026.
- **Dùng cho:** thử nghiệm nội bộ nấc 1 (A-lite E1, không AI) với tối đa 3 gia đình quen.
- **Căn cứ:** `Owner_Decision_Log_20261115.md` (D-01, D-03, D-10, D-11, D-17, D-18, D-19, D-20, D-21, D-22, D-26, D-27, D-28, D-30, D-31); `Legal_Question_Pack.md` (LQ-01, LQ-02, LQ-11, LQ-14, LQ-15); `User_Research_02_8_Field_Research_Plan.md` §3, §6; `MVP_Options_for_Owner_Decision.md` (PA-2/PA-3 nấc 1); `User_Flow_04_1`, `04_2`; `documents/pal/spec-quy-tac-lap-lich.md` mục N.
- **Plan A đã dừng (D-31).** Bộ này **không** thu vị trí (GPS), ảnh, ghi âm trong app. Nếu sau này làm nấc 2, phải soạn lại phiếu.

## 1. Gồm những file nào

| File | Dùng để làm gì | Ai dùng |
|---|---|---|
| `Test_Kit_00_README.md` | Điều kiện phải đủ trước khi bắt đầu; điểm cần luật sư xem | Chủ sản phẩm, người chạy thử |
| `Test_Kit_01_Phieu_Dong_Y_Phu_Huynh.md` | Phiếu đồng ý bằng văn bản cho bố mẹ | Phụ huynh ký |
| `Test_Kit_02_Loi_Giai_Thich_Cho_Tre.md` | Lời giải thích cho trẻ, hai mức tuổi; ghi nhận trẻ đồng ý | Người chạy thử nói với trẻ |
| `Test_Kit_03_Kich_Ban_Test.md` | Kịch bản 2 tuần, phỏng vấn, tình huống an toàn, kết thúc | Người chạy thử |
| `Test_Kit_04_Phieu_Ghi_Ket_Qua.md` | Mẫu ghi kết quả và nhật ký xóa dữ liệu | Người chạy thử |

Thứ tự dùng: README (checklist) → Kit 01 và Kit 02 (trước ngày cài) → Kit 03 (suốt 2 tuần) → Kit 04 (ghi hằng ngày và khi xóa).

## 2. Nguyên tắc cố định của đợt thử

1. **Tối đa 3 gia đình**, mỗi gia đình một hộ (không ghép khác hộ). Gia đình hai nhà, gia đình đang khủng hoảng, nhân viên dự án và người thân gần: không nhận (`User_Research_02_8` §2.3; `MVP_Options` §1.4).
2. **Chỉ dữ liệu tối thiểu** cho tính năng nấc 1. Không sức khỏe (dị ứng, thuốc), không tên trường, không địa chỉ nhà, không vị trí, không ảnh, không ghi âm.
3. **Không đưa dữ liệu thật vào repo công khai**, và không dán dữ liệu thật vào công cụ AI hay dịch vụ tìm kiếm nước ngoài khi chưa ẩn danh (CLAUDE.md).
4. **Có hạn kết thúc** và **xóa khi xong**. Thời hạn xóa theo luật chưa biết (LQ-04, LQ-14, LQ-15); dùng mức an toàn trong Kit 01, ghi nhãn `đề xuất nội bộ`.
5. **Không đo, không chấm điểm trẻ; không so trẻ với trẻ.** Chỉ so mỗi gia đình với chính nó (tuần 1 so với tuần 2).
6. **Người chạy thử không tư vấn, không chẩn đoán.** Gặp dấu hiệu nguy hiểm: làm theo Kit 03 mục 7.
7. **Trẻ nói không là dừng.** Phụ huynh đồng ý nhưng trẻ không đồng ý thì không đưa trẻ vào thử (nhánh mặc định an toàn, `đề xuất nội bộ`).

## 3. Checklist: phải đủ hết mới được bắt đầu

Đánh dấu khi có **bằng chứng** (file, ảnh chụp, chữ ký). Một ô chưa đạt là chưa bắt đầu.

### A. Quyết định và quản trị

| # | Điều kiện | Đạt? | Bằng chứng | Nguồn |
|---|---|---|---|---|
| A1 | Chủ sản phẩm xác nhận 8 điều kiện của ngoại lệ D-01 (xem bảng 4) bằng văn bản; vì D-01 ghi các điều kiện này là "AI đề xuất, chờ chủ sản phẩm xem" | ☐ | | ODL D-01 |
| A2 | Ghi rõ: ngoại lệ áp cho A-lite E1 (D-18), tối đa 3 gia đình, **không** áp cho pilot rộng hơn | ☐ | | ODL D-01, D-18 |
| A3 | Có **ngày bắt đầu** và **ngày kết thúc** cụ thể (đề xuất: thử 14 ngày, thêm tối đa 7 ngày để phỏng vấn cuối và xóa) | ☐ | | ODL D-01 |
| A4 | Có tên **người chịu trách nhiệm** (bên kiểm soát dữ liệu trên thực tế) và người thứ hai cùng tham gia. Pháp nhân chưa có; luật sư chưa trả lời ai là bên kiểm soát (LQ-11 câu 2) | ☐ | | LQ-11 |
| A5 | Chủ sản phẩm xác nhận không chi tiền thuê luật sư ở đợt này (D-17) và chấp nhận H4, FR-03 còn mở | ☐ | | ODL D-17; CRG |
| A6 | Chủ sản phẩm quyết các câu mở trong báo cáo (mục 5), ít nhất Q1 đến Q6 | ☐ | | |

### B. Sản phẩm sẵn sàng

| # | Điều kiện | Đạt? | Bằng chứng | Nguồn |
|---|---|---|---|---|
| B1 | **FR-01 xong:** tài khoản phụ huynh, ghép máy con (mã ghép một lần), Parent PIN, kiểm quyền phía máy chủ, thông báo hủy liên kết tối giản. **Không dùng "mã gia đình" của spike** cho gia đình thật | ☐ | | ODL D-18, OD-A8; UF 04.1 F3 |
| B2 | Bản app chỉ có tính năng nấc 1: không AI, không GPS, không ảnh, không ghi âm | ☐ | | ODL D-31; MVP PA-2 |
| B3 | Mọi ô nhập của trẻ là lựa chọn cố định, **không chữ tự do** (mong muốn qua mẫu, D-20; hỏi thăm 3 mức) | ☐ | | UF 04.1 F4, F5-B |
| B4 | `CHILD_DIRECTED` ẩn (D-19); trường sức khỏe (dị ứng, thuốc) ẩn | ☐ | | ODL D-19; UF F1 bước 9 |
| B5 | Nút **"Con cần giúp đỡ"** có trên app của con, hoạt động không cần mạng, **không ghi lại, không tự báo gia đình**; mục "Hỗ trợ khẩn cấp" có trên app phụ huynh (PA-24) | ☐ | | spec mục N3; D-26, D-30 |
| B6 | Màn **"Những gì bố mẹ thấy"** (CA-16) hiện cho trẻ sau khi ghép, khớp quyền thật | ☐ | | UF 04.2 G6; D-03 |
| B7 | Báo cáo tuần có mục xu hướng mệt liên quan lịch; không hiện từng lựa chọn theo ngày (D-03, D-21) | ☐ | | |
| B8 | Phụ huynh tắt được từng tính năng (ít nhất hỏi thăm mệt; mong muốn của con) và thấy mình đã đồng ý gì (PA-32) | ☐ | | ODL D-28; UF G6 |
| B9 | Đã chạy thử toàn bộ kịch bản (Kit 03) bằng **dữ liệu giả, tên giả** (bé "Na", "Bin"; chị "Hoa") ít nhất một lần, do người trong nhóm làm | ☐ | | |
| B10 | Runbook xóa dữ liệu thủ công đã **diễn tập** trên dữ liệu giả, có người kiểm chứng (Kit 04 mục 8) | ☐ | | MVP PA-2 (`B_LIFECYCLE` runbook thủ công) |
| B11 | Cách cài app cho gia đình (kênh phân phối) đã chốt. Nguồn cũ nhắc cài APK ngoài Google Play cho Plan A; với A-lite E1 chưa có quyết định: **UNKNOWN** | ☐ | | LQ-11; chưa có quyết định |
| B12 | Nơi đặt máy chủ và nhà cung cấp hạ tầng, dịch vụ gửi thông báo đã biết và **điền vào Kit 01 mục 4** (không được để trống khi gia đình ký) | ☐ | | LQ-08 |

### C. Gia đình

| # | Điều kiện | Đạt? | Bằng chứng | Nguồn |
|---|---|---|---|---|
| C1 | Tối đa 3 gia đình; mỗi gia đình đạt sàng lọc: con lớp 1 đến 9, **có máy Android riêng** (D-11), cha mẹ sống cùng trẻ trong một hộ | ☐ | | ODL D-11; MVP §1.4 |
| C2 | **Phiếu đồng ý (Kit 01) đã ký** trước ngày cài, bản gốc giữ riêng; gia đình giữ một bản | ☐ | | ODL D-01 |
| C3 | Nếu trẻ có hai cha mẹ cùng nuôi: cả hai biết và ký (nhánh an toàn); luật chưa rõ một người ký có đủ không (LQ-02 câu 2) | ☐ | | LQ-02 |
| C4 | Đã giải thích cho **trẻ** bằng lời dễ hiểu theo Kit 02 và ghi nhận trẻ đồng ý; trẻ nói không thì không vào đợt thử | ☐ | | ODL D-01; `02_8` §3.1 |
| C5 | Gia đình hiểu: từ chối hoặc dừng giữa chừng không sao, kể cả vì quen biết | ☐ | | |
| C6 | Đã thống nhất cách liên hệ khi có sự cố (ghi trong Kit 01) | ☐ | | |

### D. Lưu trữ dữ liệu

| # | Điều kiện | Đạt? | Bằng chứng | Nguồn |
|---|---|---|---|---|
| D1 | Có **nơi lưu riêng tư** ngoài repo công khai cho phiếu, ghi chép, kết quả (chủ sản phẩm chỉ định, ghi vào Kit 04 mục 9); tối đa 2 người truy cập; thiết bị có mã hóa và khóa màn hình | ☐ | | ODL D-01 |
| D2 | Đã kiểm repo: không có tên thật, ảnh phiếu, hồ sơ, token, khóa nào của gia đình thử (kể cả bản nháp, lịch sử git) | ☐ | | CLAUDE.md |
| D3 | Bảng mã ẩn danh (NB-01 đến NB-03 ↔ tên thật) lưu **tách riêng** với ghi chép | ☐ | | `02_8` §3.2 |
| D4 | Có quy tắc: không dán dữ liệu thật vào công cụ AI hay tìm kiếm nước ngoài khi chưa ẩn danh | ☐ | | CLAUDE.md |

### E. An toàn

| # | Điều kiện | Đạt? | Bằng chứng | Nguồn |
|---|---|---|---|---|
| E1 | Người chạy thử đã đọc Kit 03 mục 7 (tình huống an toàn) và biết các số **111, 113, 115** dùng khi nào | ☐ | | spec mục N2 |
| E2 | Số khẩn và câu chữ nút "Con cần giúp đỡ" đã được người có chuyên môn duyệt, hoặc chủ sản phẩm chấp nhận rủi ro bằng văn bản (cổng B-6 còn mở; D-17 chưa chi tiền chuyên gia) | ☐ | | CRG B-6; spec N3 |
| E3 | Quy trình khi trẻ tiết lộ nguy cơ đã được chuyên gia bảo vệ trẻ em duyệt (MR-022), **hoặc** áp mặc định chặt: người chạy thử **không trò chuyện riêng một mình với trẻ**, không hỏi dò chuyện riêng tư | ☐ | | `02_8` §3.3, §10 mục 4 |
| E4 | Có người thứ hai (cùng nhóm) biết lịch thử và đầu mối liên hệ khi có sự cố | ☐ | | `02_8` §3.3 |

### F. Kết thúc và xóa

| # | Điều kiện | Đạt? | Bằng chứng | Nguồn |
|---|---|---|---|---|
| F1 | Kế hoạch xóa có ngày, người xóa, người kiểm chứng (Kit 04 mục 8) | ☐ | | ODL D-01 |
| F2 | Gia đình biết họ được thông báo khi xóa xong, và biết phiếu ký + nhật ký xóa được giữ (xem câu mở Q4) | ☐ | | |
| F3 | Chủ sản phẩm có lịch họp quyết định sau 2 tuần (tiếp tục, đổi hướng, dừng) | ☐ | | MVP PA-2 |

## 4. Tám điều kiện của ngoại lệ D-01 và nơi tài liệu đáp ứng

| # | Điều kiện D-01 | Nơi đáp ứng |
|---|---|---|
| 1 | Bố mẹ ký đồng ý | Kit 01 |
| 2 | Trẻ được giải thích bằng lời dễ hiểu | Kit 02 |
| 3 | Tối đa 3 gia đình | README mục 2 và C1 |
| 4 | Có hạn kết thúc | Kit 01 mục 7; A3 |
| 5 | Chỉ thu dữ liệu cần cho tính năng thử | Kit 01 mục 3 (D-01 nói "5 tính năng của Plan A"; D-18 chuyển sang tính năng nấc 1) |
| 6 | Xóa khi kết thúc | Kit 01 mục 8; Kit 03 mục 9; Kit 04 mục 8 |
| 7 | Không đưa dữ liệu lên repo công khai | README D1, D2; Kit 04 mục 9 |
| 8 | Không dùng cho mục đích khác | Kit 01 mục 5 |

## 5. Điểm cần luật sư xem khi có điều kiện (D-17: chưa chi tiền)

Danh sách xếp theo mức ưu tiên cho **đợt thử này**. Mô tả luật dưới đây đều cần luật sư xác nhận.

| # | Điểm cần xem | Chỗ trong bộ này | Câu hỏi nguồn |
|---|---|---|---|
| 1 | Phiếu giấy này có đủ làm căn cứ xử lý dữ liệu của trẻ không; nội dung bắt buộc của phiếu còn thiếu gì | Kit 01 toàn bộ | LQ-11 câu 1; LQ-01 |
| 2 | Ai phải đồng ý: chỉ cha mẹ, hay cả trẻ; từ tuổi nào (mốc 7 tuổi áp cho việc gì). Bộ này xin ý kiến trẻ ở **mọi tuổi** (đề xuất nội bộ từ `02_8` §3.1) | Kit 01 mục 11; Kit 02 | LQ-01 câu 2, 3 |
| 3 | Một người cha/mẹ ký có đủ không; người kia có quyền phản đối hay yêu cầu xóa không | Kit 01 mục 11 | LQ-02 câu 2 |
| 4 | Tự khai là cha/mẹ có hợp lệ không; bằng chứng tối thiểu | Kit 01 mục 11 | LQ-02 câu 1 |
| 5 | Ai là bên kiểm soát dữ liệu khi chưa có pháp nhân | Kit 01 mục 2 | LQ-11 câu 2 |
| 6 | Có cần DPIA hoặc hồ sơ chuyển dữ liệu ra nước ngoài **trước** đợt thử không (máy chủ, dịch vụ thông báo) | Kit 01 mục 4 | LQ-11 câu 3; LQ-05; LQ-08 |
| 7 | Rút đồng ý từng phần có đúng luật không; dữ liệu của phần đã rút phải xóa trong bao lâu; có được giữ bản ẩn danh | Kit 01 mục 9 | LQ-14; D-28 |
| 8 | Thời hạn xóa sau khi kết thúc; mốc tính; ngoại lệ được giữ lại (phiếu ký, nhật ký xóa) | Kit 01 mục 8; Kit 04 mục 8 | LQ-04; D-28 |
| 9 | Đóng băng tài khoản khi không dùng, thời hạn giữ (ít liên quan 2 tuần, nhưng phiếu có nhắc) | Kit 01 mục 8 | LQ-15; D-27 |
| 10 | "Hỏi thăm mệt" và tín hiệu liên quan có là dữ liệu sức khỏe/nhạy cảm không | Kit 01 mục 3 | LQ-01 (hoạt động "tự báo"); LQ-10 câu 2 |
| 11 | Người chạy thử có nghĩa vụ báo cơ quan khi trẻ tiết lộ dấu hiệu xâm hại không; thông báo tĩnh có cần căn cứ riêng không | Kit 03 mục 7; Kit 02 | LQ-09 câu 1, 4 |
| 12 | Trẻ và phụ huynh khác ý nhau (trẻ không muốn chia sẻ, phụ huynh muốn xem) thì quyền ai ưu tiên | Kit 01 mục 6 | LQ-10 câu 3 |
| 13 | Dữ liệu thông báo đẩy (token máy) có tính là chuyển dữ liệu ra nước ngoài không | Kit 01 mục 4 | LQ-08 câu 4 |

## 6. Câu hỏi mở cho chủ sản phẩm (kèm đề xuất)

| # | Câu hỏi | Đề xuất của AI |
|---|---|---|
| Q1 | Nơi lưu riêng tư là ở đâu, ai được truy cập? | Thư mục mã hóa trên máy cá nhân của chủ sản phẩm, tối đa 2 người, không đồng bộ lên dịch vụ công khai. Điền vào Kit 04 mục 9 |
| Q2 | Hạn xóa sau khi kết thúc là bao nhiêu ngày? | 7 ngày kể từ ngày kết thúc (ngắn hơn mọi hạn nhắc trong LQ-04). Nhãn `đề xuất nội bộ`, luật sư chưa xác nhận |
| Q3 | Báo cáo tuần có hiện xu hướng mệt khi **chưa có ngưỡng**? `User_Flow_04_2` G1 vẫn ghi "chưa có ngưỡng thì không hiện" (UF-Q20), còn D-21 ghi "không cần ngưỡng" | Theo D-21: hiện trong báo cáo cuối tuần, dựa trên cửa sổ 2 tuần, không kết luận từ một ngày. Cần sửa UF-Q20 cho khớp. Nếu chưa sửa kịp, tuần 1 thường hiện "chưa đủ dữ liệu" |
| Q4 | Phiếu ký và nhật ký xóa có được giữ sau khi xóa dữ liệu không? Giữ bao lâu? | Giữ đến khi luật sư trả lời LQ-04 (ngoại lệ lưu trữ), ghi rõ cho gia đình trong Kit 01 mục 8 |
| Q5 | Bố mẹ có thấy từng lựa chọn mệt theo ngày không? Nguồn: UF-Q18 còn `chờ Owner quyết` | Giữ nhánh an toàn: **không** thấy theo ngày. Trẻ được báo đúng như vậy (D-03). Người chạy thử cũng chỉ ghi tổng theo tuần |
| Q6 | Kênh cài app (APK hay kênh khác) và cách gia đình đăng nhập (email hay số điện thoại)? | UNKNOWN. Chốt cùng với FR-01 trước ngày cài. Điền vào Kit 01 mục 4 |
| Q7 | Có xin trẻ **mọi tuổi** đồng ý, hay chỉ từ 7 tuổi? | Mọi tuổi (cẩn trọng hơn, theo `02_8` §3.1) |
| Q8 | Có mời người lớn thứ hai vào app (D-22, UF-Q26) trong đợt thử? | Không trong đợt đầu; chỉ khi chủ sản phẩm cho và người đó ký phiếu riêng |
| Q9 | Thù lao hoặc quà cho gia đình? D-17 chưa chi tiền | Không thù lao. Nếu có quà thì nhỏ và như nhau cho mọi trẻ (`02_8` §2.4) |
| Q10 | Quy trình khi trẻ tiết lộ nguy cơ: ai duyệt khi chưa có ngân sách chuyên gia? | Áp mặc định chặt (E3) và tìm một người có chuyên môn bảo vệ trẻ em xem giúp miễn phí |

## 7. Điều bộ này không làm

- Không kết luận hợp pháp hay không hợp pháp.
- Không thay chuyên gia bảo vệ trẻ em hay bác sĩ.
- Không chọn thay chủ sản phẩm ở các câu Q1 đến Q10: đề xuất chỉ là mặc định an toàn.

*người soạn: AI, chưa kiểm chứng độc lập; trạng thái: nháp chờ duyệt*
