# Parent-Pal: Bản đồ bộ kiến thức (tiền mang thai → 24 tuổi)

Bản v5.7 — 28/10/2026. Trạng thái: **đã chốt quy tắc cấu trúc**; đã có đợt nội dung nháp đầu tiên cho 0–6 tuổi (chờ chuyên gia duyệt).

Lịch sử thay đổi:
- **v2:** trục dọc là độ tuổi; các mảng kiến thức ("làn") chạy theo trục đó.
- **v3:** mở rộng trục tuổi: năm đầu đời vào giai đoạn 0–6 tuổi; thêm giai đoạn 18–24 tuổi.
- **v4:** thay 9 làn bằng khung 4 tầng: 3 cấp + lớp nền → 16 nhóm → chủ đề con → mẩu kiến thức.
- **v5 (27/10):** chốt quy tắc theo kết quả kiểm toán (tài liệu "Kiểm toán cấu trúc v4") và quyết định của người dùng:
  - Cấp C chia hai loại: **C1 Định hướng xuyên suốt** và **C2 Định hướng giai đoạn**.
  - Nhóm 12 "Chơi" giữ ở cấp B.
  - Thêm: phạm vi, cây quyết định phân loại, sổ quyết định phân loại, nhãn phương pháp, mẫu mẩu kiến thức v2, ba đối tượng mới (hoạt động, dòng phát triển, kho nguồn), mã định danh, kiểm soát nội dung do AI soạn, tiêu chí nghiệm thu.
- **v5.1 (27/10):** thêm §1.1 "Kho chuẩn và nguồn trả lời" theo quyết định của người dùng: kho chuẩn gồm thông tin định hướng và thủ tục hành chính; thủ tục chưa có trong kho thì Pal báo cho phụ huynh rồi mới dùng thông tin tra trên mạng.
- **v5.2 (27/10):** sắp lại thứ tự để phần đầu tập trung vào thiết kế dữ liệu kiến thức. Quy tắc phân loại chuyển xuống §9, đổi tên thành "Quy tắc xếp bài vào kho"; các mục từ trục tuổi đến kiểm soát chất lượng lùi lên một số (§4–§8).
- **v5.3 (27/10):** bỏ bảng "nhóm trọng tâm" (không có nguồn, dễ gây bỏ sót); thay bằng **lưới độ phủ** độ tuổi × nhóm (§5.1). Tách danh sách bước chuyển thành §5.2; thai kỳ thành §5.3; G0, G3–G6 thành §5.4.
- **v5.4 (27/10):** soạn đợt nội dung đầu cho 0–6 tuổi (`documents/kien-thuc/noi-dung/0-6/`, người soạn AI, trạng thái nháp) và kho nguồn có mã (`documents/kien-thuc/nguon.md`); cập nhật lưới độ phủ (§5.1).
- **v5.7 (28/10):** đổi tên file thành `spec-knowledge-map.md` và chuyển vào thư mục `documents/`; repo chỉ còn tài liệu (code bản thử đã gỡ).
- **v5.6 (28/10):** mục tiêu của gia đình chỉ làm tăng số gợi ý ở mảng tương ứng (ví dụ 2 → 3–5 sách khoa học), không bớt mảng khác; thêm bảng cấu hình số gợi ý (§7.7).
- **v5.5 (28/10):** tách kho thành **lớp bằng chứng** và **lớp thực thi** (§1.2); thêm danh mục thực thi (§7.6), mục tiêu và danh sách của gia đình (§7.7), chi phí và ước tính chi phí (§7.8). Cách Pal trả lời viết riêng ở `documents/pal/guide-pal-answers.md`.

> Bản chính lưu trong repo tại `documents/kien-thuc/spec-knowledge-map.md`; project Parent-Pal giữ bản sao `claude/spec-knowledge-map.md`. Đổi tên từ `ban-do-chu-de-kien-thuc-1-6-tuoi.md` ngày 27/10/2026 vì nội dung đã phủ toàn bộ trục tuổi.

## 1. Phạm vi
- **Trong phạm vi:** sự phát triển của trẻ; chăm sóc và nuôi dạy; an toàn (ở mức nhận biết nguy cơ và tìm hỗ trợ); sức khỏe tinh thần và vai trò của cha mẹ; chuẩn bị cho các bước chuyển của con.
- **Ngoài phạm vi:**
  - chẩn đoán, điều trị, liều thuốc;
  - tư vấn pháp lý;
  - dạy kiến thức môn học cho trẻ;
  - tư vấn tài chính gia đình;
  - giới thiệu sản phẩm, trường, lớp cụ thể.
- **Thêm chủ đề mới:** người soạn đề xuất → chủ sản phẩm duyệt có thuộc phạm vi không → xếp chỗ theo §9.

### 1.1 Kho chuẩn và nguồn trả lời
Pal trả lời từ hai loại nguồn:
- **Kho chuẩn:** tài nguyên của công ty, đã kiểm chứng và qua chuyên gia duyệt. Là khung mà mọi câu trả lời khác phải tuân theo.
- **Tra cứu trên mạng:** Pal tìm ngay lúc được hỏi. Có nguồn, nhưng chưa được đội ngũ kiểm duyệt.

**Kho chuẩn gồm (người dùng chốt 27/10):**
1. **Thông tin định hướng:** toàn bộ khung cấp độ và các nhóm ở §3. Đây là các mẩu kiến thức, hoạt động và dòng phát triển xây theo bản đồ này.
2. **Thủ tục hành chính liên quan đến con:** nhập học, tuyển sinh, chuyển trường, quy chế thi…
   - Nếu kho chuẩn **chưa có** thông tin thủ tục được hỏi: Pal **báo cho phụ huynh** rằng tài liệu của Parent-Pal chưa có, **rồi mới** trả thông tin tra trên mạng, kèm nguồn.
3. Các loại khác: **bổ sung sau**.

**Cách Pal nói rõ nguồn:**
- Từ kho chuẩn: "Theo tài liệu của Parent-Pal…"
- Từ mạng: "Tài liệu của Parent-Pal chưa có thông tin này. Mình vừa tìm trên [tên trang], thông tin này chưa được đội ngũ kiểm duyệt." Kèm link.

**Quy tắc riêng cho thủ tục hành chính** (`đề xuất nội bộ`, chờ duyệt):
- Chỉ dùng nguồn chính thức: văn bản của Bộ, Sở, Phòng GD&ĐT, Bộ Y tế, hoặc thông báo của chính trường.
- Mỗi mẩu thủ tục ghi rõ: văn bản gốc (số hiệu, ngày ban hành), cơ quan ban hành, **địa phương áp dụng**, **năm học áp dụng**, hạn rà soát. Tuyển sinh và thi cử thay đổi theo năm và theo tỉnh, nên hạn rà soát mặc định là **mỗi năm học**.
- Pal luôn kèm lời nhắc kiểm tra lại với trường hoặc Sở trước hạn chót.
- Không đưa tên con, trường, địa chỉ vào câu tìm kiếm trên mạng (quy tắc đã có trong `CLAUDE.md`).

**Chưa chốt (bổ sung sau):**
- Kiến thức chung sẵn có của mô hình AI (không có nguồn) có được dùng không, dùng cho loại câu hỏi nào.
- Danh sách trang được phép tra cứu.
- Có lọc lại danh sách chủ đề trong bản đồ theo tiêu chí "rủi ro cao / định hướng lớn / hay bị hiểu sai / hỏi nhiều" không.
- Khi kho chuẩn thiếu thông tin **định hướng**, Pal xử lý thế nào.

### 1.2 Hai lớp của kho (người dùng chốt 28/10/2026)

| Lớp | Chứa gì | Kiểm soát chất lượng |
|---|---|---|
| **Lớp bằng chứng** | Khuyến nghị, con số, mốc phát triển, dấu hiệu, thủ tục; mỗi ý có nguồn (§7.1, `documents/kien-thuc/noi-dung/`) | Nguồn theo thứ bậc (§2); chuyên gia đúng chuyên môn duyệt |
| **Lớp thực thi** | Danh mục cụ thể để **làm**: trò chơi, hoạt động, món ăn, thực đơn, sách, cơ sở dịch vụ, sản phẩm (§7.6) | Mỗi mục **liên kết tới khuyến nghị** mà nó phục vụ; **qua quy tắc an toàn** của lớp bằng chứng (ví dụ không có thức ăn dễ hóc cho trẻ dưới 4 tuổi); biên tập viên hoặc chuyên gia duyệt |

- Từng mục của lớp thực thi không cần một bài nghiên cứu riêng, nhưng **không được trái** với lớp bằng chứng.
- Pal dùng lớp thực thi để **giao việc cụ thể**, chọn sẵn một phương án; chỉ đưa phương án khác khi phụ huynh yêu cầu (`documents/pal/guide-pal-answers.md`).
- Trên lớp thực thi có **danh sách của từng gia đình**: những mục Pal chọn cho riêng một con, theo tuổi, hoàn cảnh và mục tiêu (§7.7).

## 2. Nguyên tắc
1. **Thứ bậc nguồn**
   - Bậc 1: WHO, UNICEF, CDC.
   - Bậc 2: AAP, NICE, NHS, Harvard Center on the Developing Child.
   - Bậc 3: tổng quan hệ thống có bình duyệt.
   - Không dùng blog, sách phổ thông.
   - Nguồn Việt Nam dùng ở bước tuỳ biến theo quốc gia.
2. **Khi nguồn mâu thuẫn:** ghi cả hai, nói rõ khác ở đâu, không tự chọn bên nào.
3. **Nhãn mức chắc chắn:** `đồng thuận mạnh` / `khuyến nghị chính thức, bằng chứng vừa` / `bằng chứng hạn chế` / `các nguồn khác nhau`. Ý nào do người soạn tự đề xuất, không có nguồn, thì gắn nhãn `đề xuất nội bộ`.
4. **Ngôn ngữ:** nội dung viết tiếng Việt; tên tài liệu và link giữ nguyên tiếng Anh.
5. **Phạm vi y tế:** chỉ đưa "dấu hiệu cần đi khám"; không chẩn đoán, không điều trị, không liều thuốc.
6. **An toàn không bù trừ:** tín hiệu về an toàn luôn được ưu tiên. Pal không bao giờ tổng kết "mọi thứ đều ổn" khi còn một tín hiệu an toàn chưa xử lý.
7. **Môi trường không phải tính cách:** điều kiện xung quanh (nhà có em bé mới, đổi trường…) ghi là điều kiện, không ghi thành đặc điểm của trẻ.
8. **So con với chính con:** theo dõi con so với chính con theo thời gian và với khoảng tham khảo (mốc, chuẩn tăng trưởng). Không so sánh, không xếp hạng con với trẻ khác. Không có điểm tổng.
9. **Tối thiểu hóa dữ liệu:** cấp B dùng để gợi ý cha mẹ tạo điều kiện, không để đánh giá gia đình. Pal không hỏi thu nhập, nhà ở; chỉ dùng khi phụ huynh tự kể.
10. **Không đòi chi phí:** hoạt động mặc định dùng đồ có sẵn trong nhà, lồng vào sinh hoạt hằng ngày, không đòi mua đồ chơi hay học lớp.
11. **Lệch nhịp là bình thường:** trẻ có thể nhanh ở lĩnh vực này, chậm ở lĩnh vực khác. Pal hiển thị theo từng lĩnh vực, không gộp; chỉ cảnh báo theo dấu hiệu cụ thể. "Chưa quan sát được" khác "chưa làm được"; một lần quan sát không đủ để kết luận.

## 3. Khung 4 tầng

```
Tầng 1  3 cấp + lớp nền an toàn              (giống nhau ở mọi tuổi)
Tầng 2  16 nhóm                              (giống nhau ở mọi tuổi)
Tầng 3  Chủ đề con                           (thay đổi theo giai đoạn, chặng)
Tầng 4  Mẩu kiến thức, hoạt động             (mẫu cố định, §7)
```

### 3.1 Các cấp và 17 nhóm

| Cấp | Câu hỏi của cấp | Số | Tên nhóm | Nói gọn là gì |
|---|---|---|---|---|
| **Nền** | Con có an toàn không? | — | An toàn và quyền trẻ em | Tai nạn, bạo lực (kể cả đòn roi), xâm hại, ranh giới cơ thể, bị lạc, giao thông, chất gây nghiện, tình huống khẩn. Luôn được xét trước. Nối lớp an toàn của app (111, 113, 115) |
| **A. Phát triển cốt lõi** | Con đang phát triển thế nào? | 1 | Sức khỏe và thể chất | Cân nặng, chiều cao, ăn, ngủ, vận động, khám bệnh, răng |
| | | 2 | Nhận thức và tư duy | Nói, hiểu, đọc, suy nghĩ, giải quyết vấn đề |
| | | 3 | Cảm xúc và sức khỏe tâm lý | Khí chất, ăn vạ, nỗi sợ, lo âu |
| | | 4 | Xã hội và quan hệ | Gắn bó với cha mẹ, chơi với bạn, anh chị em |
| | | 5 | Tự chủ và điều hành bản thân | Tự làm việc của mình, kiềm chế, tập trung |
| | | 6 | Học tập và phát triển bản thân | Tò mò, thói quen học |
| **B. Môi trường phát triển** | Cha mẹ có thể tạo điều kiện gì? | 7 | Gia đình và chăm sóc | Cách cha mẹ nuôi dạy, nề nếp, ông bà, sức khỏe tinh thần cha mẹ |
| | | 8 | Môi trường giáo dục | Nhà trẻ, mẫu giáo, trường, giáo viên |
| | | 9 | Bạn bè và cộng đồng | Cơ hội gặp gỡ, hàng xóm, hoạt động chung |
| | | 10 | Điều kiện sống | Nhà ở, nguồn lực (chỉ khi phụ huynh tự kể) |
| | | 11 | Môi trường số | Màn hình, điện thoại, mạng |
| | | 12 | Chơi, văn hóa và trải nghiệm | Chơi tự do, thiên nhiên, nghệ thuật, nghỉ ngơi |
| **C1. Định hướng xuyên suốt** | Con đang lớn lên thành người thế nào? | 13 | Giá trị đạo đức | Trung thực, trách nhiệm, công bằng, tử tế |
| | | 14 | Kỹ năng sống | Việc nhà, tự đi lại, tiêu tiền, nấu ăn đơn giản |
| | | 16 | Năng lực công dân | Tôn trọng quy tắc chung, giúp đỡ, đóng góp cho cộng đồng |
| **C2. Định hướng giai đoạn** | Con cần chuẩn bị gì cho bước tiếp theo? | 15 | Định hướng nghề nghiệp | Sở thích, thế mạnh, chọn ngành (từ THCS) |
| | | 17 | Chuẩn bị bước chuyển | Vào nhà trẻ/mẫu giáo, vào lớp 1, dậy thì, chuyển cấp, rời nhà |

**Khác nhau giữa C1 và C2:**
- **C1 xuyên suốt:** theo con ở mọi tuổi, mỗi giai đoạn có biểu hiện riêng. Ví dụ "trách nhiệm" ở 3 tuổi là cất đồ chơi, ở 10 tuổi là tự lo bài vở. Mỗi nhóm C1 có một **dòng phát triển** (§7.3) mô tả biểu hiện theo từng giai đoạn.
- **C2 giai đoạn:** gắn với một bước chuyển có thời điểm cụ thể, có bắt đầu và kết thúc. Đây là nơi Pal trả lời các câu như "con sắp vào lớp 1, tôi cần chuẩn bị gì".

Nhóm 17 là nhóm mới của v5, sinh ra từ quyết định tách C2. Số thứ tự 13–16 giữ nguyên để không đổi liên kết cũ.

### 3.2 Phạm vi từng nhóm

| Nhóm | Gồm | Ghi chú phân loại |
|---|---|---|
| 1. Sức khỏe và thể chất | Tăng trưởng; dinh dưỡng (ăn gì, bao nhiêu); ngủ; **vận động thô và vận động tinh** (chủ đề con bắt buộc); khám định kỳ; tiêm chủng (chỉ nhắc lịch); răng; thị lực, thính lực; sinh lý đi vệ sinh (táo bón…); dậy thì | Thai kỳ: sức khỏe của mẹ và thai nằm ở đây |
| 2. Nhận thức và tư duy | Ngôn ngữ (hiểu, nói, đọc); hiểu biết về thế giới; giải quyết vấn đề; song ngữ | Phần giao tiếp với người khác ở nhóm 4 |
| 3. Cảm xúc và sức khỏe tâm lý | Ba chủ đề con cố định: **khí chất** (mô tả, không chấm điểm); **điều tiết cảm xúc** (ăn vạ, nỗi sợ, lo âu khi xa người thân, sợ người lạ, giằng co bữa ăn); **sức khỏe tâm thần** | Tuổi teen: trầm cảm, tự hại → nối lớp nền |
| 4. Xã hội và quan hệ | Gắn bó với người chăm sóc; anh chị em; chơi cùng bạn; chia sẻ; xung đột; giao tiếp | — |
| 5. Tự chủ và điều hành bản thân | **Tự phục vụ** (tự xúc ăn, mặc đồ, tập đi vệ sinh); **chức năng điều hành** (tập trung, trí nhớ làm việc, kiềm chế, linh hoạt); lựa chọn trong giới hạn; quản lý thời gian | Nhóm 5 là năng lực; nhóm 14 là kỹ năng áp dụng vào cuộc sống |
| 6. Học tập và phát triển bản thân | Tò mò, động lực, thói quen học, học ở trường, học thêm | Không đồng nhất với điểm số |
| 7. Gia đình và chăm sóc | Chăm sóc đáp ứng; nề nếp; kỷ luật tích cực, không bạo lực; cách khen; bữa ăn gia đình; sức khỏe tinh thần cha mẹ; vai trò của bố; ông bà; con ở với ông bà khi cha mẹ đi làm xa; người giúp việc; chuẩn bị làm cha mẹ | — |
| 8. Môi trường giáo dục | Chọn nhà trẻ, trường; trao đổi với giáo viên; bắt nạt ở trường | Việc thích nghi khi mới vào trường → nhóm 17 |
| 9. Bạn bè và cộng đồng | Cơ hội gặp bạn; hoạt động cộng đồng; cảm giác thuộc về | — |
| 10. Điều kiện sống | Không gian nhà; nguồn lực; tiếp cận dịch vụ | Chỉ khi phụ huynh tự kể (nguyên tắc 9) |
| 11. Môi trường số | Màn hình; nội dung; thiết bị riêng; mạng xã hội; an toàn trực tuyến | Rủi ro nghiêm trọng → nối lớp nền |
| 12. Chơi, văn hóa và trải nghiệm | Chơi tự do, chơi giả vờ, trò chơi có luật; thiên nhiên; nghệ thuật; nghỉ ngơi; thời gian không bị lấp kín | Không biến chơi thành công cụ học |
| 13. Giá trị đạo đức | Trung thực, trách nhiệm, công bằng, tử tế | Ở trẻ nhỏ phải gắn với mức phát triển (ví dụ nói dối ở 4–5 tuổi) |
| 14. Kỹ năng sống | Việc nhà, tự đi lại, tiền tiêu vặt, nấu ăn đơn giản | — |
| 15. Định hướng nghề nghiệp | Sở thích, thế mạnh, chọn ngành | **0–11 tuổi: để trống.** Không "phát hiện năng khiếu sớm" (xem Bộ chỉ số: sinh trắc vân tay, gen năng khiếu) |
| 16. Năng lực công dân | Tôn trọng quy tắc chung, giúp đỡ, tham gia, quyền và trách nhiệm | Ở 0–6 tuổi rất mỏng |
| 17. Chuẩn bị bước chuyển | Vào nhà trẻ/mẫu giáo; vào lớp 1; có em; dậy thì; chuyển cấp; thi cử; rời nhà | Bài tổng quan bước chuyển ở đây; kỹ năng cụ thể nằm ở nhóm cấp A và trỏ tới |

### 3.3 Hai yếu tố xuyên suốt (không phải nhóm)
- **Tiếng nói của trẻ:** mỗi mẩu kiến thức có mục "Con cảm thấy thế nào". 0–3 tuổi: cha mẹ quan sát. Khoảng 4 tuổi trở lên: gợi ý câu cha mẹ hỏi con. Lớn dần: con tự nói.
- **Loại nội dung:** là các mục bên trong mẩu kiến thức (§7.1), không phải nhóm. Gồm: điều thường thấy, vì sao quan trọng, chưa cần kỳ vọng, việc cha mẹ có thể làm, dấu hiệu, hiểu lầm, điều Pal không nói.

## 4. Trục tuổi
Mốc tuổi bám theo hệ thống trường học Việt Nam, vì phụ huynh quen nghĩ theo mốc này. Các nguồn quốc tế chia lệch khoảng ±1 năm; khi gặp phần chồng lấn thì ghi rõ.

| Giai đoạn | Tuổi | Chặng nhỏ | Cách chia của các nguồn để đối chiếu | Trạng thái |
|---|---|---|---|---|
| G0 Tiền mang thai | trước thụ thai | — | Lancet 2018: góc nhìn sinh học, cá nhân, y tế công cộng | chỉ có khung |
| G1 Thai kỳ | ~40 tuần | 3 tam cá nguyệt | — | chỉ có khung (§5.3) |
| G2 Mầm non | 0–6 tuổi | 8 chặng (bảng dưới) | CDC: 0–1, 1–2, 2–3, 3–5; AASM: 4–12 tháng, 1–2, 3–5 | **chi tiết nhất** (§6) |
| G3 Tiểu học | 6–11 tuổi | 6–8; 9–11 | CDC: 6–8, 9–11; AAP Bright Futures: 5–10; AASM: 6–12 | chỉ có khung |
| G4 THCS | 11–15 tuổi | — | WHO: vị thành niên 10–19; UNICEF: 10–14; CDC: 12–14; Bright Futures: 11–14 | chỉ có khung |
| G5 THPT | 15–18 tuổi | — | UNICEF: 15–19; CDC: 15–17; Bright Futures: 15–17; AASM: 13–18 | chỉ có khung |
| G6 Trưởng thành sớm | 18–24 tuổi | — | WHO: thanh niên 15–24; Bright Futures: 18–21; Sawyer (Lancet 2018) đề xuất vị thành niên kéo dài 10–24 (còn tranh luận) | chỉ có khung; tập trung vào **vai trò của cha mẹ** |

Ghi chú pháp lý (dùng cho bước tuỳ biến Việt Nam): Luật Trẻ em 2016 định nghĩa trẻ em là người dưới 16 tuổi; Công ước Liên Hợp Quốc về Quyền trẻ em dùng mốc dưới 18 tuổi.

Chặng của G2, mỗi chặng ứng với một checklist CDC/AAP:

| Chặng | Tuổi | Checklist CDC |
|---|---|---|
| 0a | Sơ sinh 0–28 ngày | — (dùng nguồn chăm sóc sau sinh của WHO ○) |
| 0b | Nhũ nhi 1–12 tháng | 2, 4, 6, 9 tháng ○ |
| 1 | 12–18 tháng | 12, 15 tháng |
| 2 | 18–24 tháng | 18 tháng |
| 3 | 2–3 tuổi | 24, 30 tháng |
| 4 | 3–4 tuổi | 3 tuổi |
| 5 | 4–5 tuổi | 4 tuổi |
| 6 | 5–6 tuổi | 5 tuổi (⚠️ chưa có checklist 6 tuổi) |

**Trẻ sinh non:** hồ sơ trẻ ghi tuần thai lúc sinh, để dùng tuổi hiệu chỉnh khi đối chiếu mốc phát triển và tăng trưởng. Khoảng tuổi áp dụng cần nguồn xác nhận (○).

## 5. Ma trận giai đoạn × nhóm

### 5.1 Lưới độ phủ
Lưới cho biết **mỗi ô (độ tuổi × nhóm) đã có nội dung đến đâu**, để không ô nào bị bỏ quên. Lưới không xếp hạng ưu tiên: mọi ô không phải "không áp dụng" đều cần được nghiên cứu và điền.

Thay cho bảng "nhóm trọng tâm" của v5 (đã bỏ ở v5.3 vì không có nguồn, dễ khiến người soạn và Pal bỏ sót các nhóm còn lại).

**Hàng:** 15 độ tuổi theo trục dọc (§4). **Cột:** 18 nhóm (Nền và nhóm 1–17).

**Trạng thái một ô:**
| Trạng thái | Nghĩa |
|---|---|
| Không áp dụng | Cố ý để trống; bắt buộc ghi lý do (bảng lý do bên dưới) |
| Chưa có | Chưa có gì, cần nghiên cứu |
| Có danh sách | Đã biết cần viết những chủ đề nào (§5.3, §6), chưa viết |
| Đang soạn | Có ít nhất một mẩu kiến thức ở trạng thái nháp hoặc chờ duyệt |
| Đã duyệt | Mọi chủ đề đã lên danh sách của ô đều đã được chuyên gia duyệt |

**Hiện trạng (27/10/2026, sau đợt soạn nội dung 0–6 tuổi)**. Chưa có ô nào "Đã duyệt". Nội dung "Đang soạn" nằm ở `documents/kien-thuc/noi-dung/0-6/` (người soạn: AI, chờ chuyên gia duyệt).

| Độ tuổi | Đang soạn | Có danh sách | Không áp dụng | Chưa có | Tóm tắt |
|---|---|---|---|---|---|
| Tiền mang thai | — | — | 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16 | Nền, 1, 7, 10, 17 | 5 chưa có · 13 không áp dụng |
| Thai kỳ | — | Nền, 1, 7, 17 | 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16 | 10 | 4 có danh sách · 1 chưa có · 13 không áp dụng |
| Sơ sinh 0–28 ngày | Nền, 1, 2, 4, 7, 11, 12 | — | 6, 8, 9, 13, 14, 15, 16 | 3, 5, 10, 17 | 7 đang soạn · 4 chưa có · 7 không áp dụng |
| 1–12 tháng | Nền, 1, 2, 3, 4, 7, 8, 11, 12, 17 | — | 13, 14, 15, 16 | 5, 6, 9, 10 | 10 đang soạn · 4 chưa có · 4 không áp dụng |
| 12–18 tháng | Nền, 1, 2, 3, 5, 7, 11, 12 | — | 15, 16 | 4, 6, 8, 9, 10, 13, 14, 17 | 8 đang soạn · 8 chưa có · 2 không áp dụng |
| 18–24 tháng | Nền, 1, 2, 3, 5, 7, 8, 11, 12, 17 | — | 15, 16 | 4, 6, 9, 10, 13, 14 | 10 đang soạn · 6 chưa có · 2 không áp dụng |
| 2–3 tuổi | Nền, 1, 2, 3, 4, 5, 7, 11, 12 | — | 15, 16 | 6, 8, 9, 10, 13, 14, 17 | 9 đang soạn · 7 chưa có · 2 không áp dụng |
| 3–4 tuổi | Nền, 1, 2, 3, 4, 5, 7, 8, 11, 12, 14, 17 | — | 15 | 6, 9, 10, 13, 16 | 12 đang soạn · 5 chưa có · 1 không áp dụng |
| 4–5 tuổi | Nền, 1, 2, 3, 4, 5, 7, 11, 12, 14 | — | 15 | 6, 8, 9, 10, 13, 16, 17 | 10 đang soạn · 7 chưa có · 1 không áp dụng |
| 5–6 tuổi | Nền, 1, 2, 4, 11, 12, 14, 17 | 3, 5 | 15 | 6, 7, 8, 9, 10, 13, 16 | 8 đang soạn · 2 có danh sách · 7 chưa có · 1 không áp dụng |
| Tiểu học 6–8 | — | — | 15 | các nhóm còn lại | 17 chưa có · 1 không áp dụng |
| Tiểu học 9–11 | — | — | 15 | các nhóm còn lại | 17 chưa có · 1 không áp dụng |
| THCS 11–15 | — | — | — | tất cả | 18 chưa có |
| THPT 15–18 | — | — | — | tất cả | 18 chưa có |
| 18–24 tuổi | — | — | 8 | các nhóm còn lại | 17 chưa có · 1 không áp dụng |

Một ô "Đang soạn" chỉ có nghĩa là ô đã có ít nhất một mẩu nháp; chủ đề còn thiếu của từng ô ghi ở mục "Chưa có nội dung có nguồn" cuối mỗi file chặng.

**Lý do các ô "Không áp dụng"** (người soạn đề xuất, người dùng đồng ý 27/10/2026):
| Ô | Lý do |
|---|---|
| Tiền mang thai, thai kỳ × nhóm 2–6, 8, 9, 11–16 | Các nhóm này nói về đứa trẻ hoặc môi trường quanh trẻ, khi trẻ chưa ra đời. Nội dung thai kỳ nằm ở Nền, nhóm 1, 7, 10, 17 (§5.3) |
| Sơ sinh × nhóm 6, 8, 9 | Chưa có hoạt động học tập, chưa đi nhà trẻ, chưa có quan hệ bạn bè và cộng đồng riêng |
| Dưới 12 tháng × nhóm 13, 14, 16 | Giá trị, kỹ năng sống, năng lực công dân chưa phù hợp tuổi |
| 12–36 tháng × nhóm 16 | Năng lực công dân chưa phù hợp tuổi |
| Đến hết tiểu học × nhóm 15 | Tránh "phát hiện năng khiếu sớm" (xem Bộ chỉ số: sinh trắc vân tay, gen năng khiếu) |
| 18–24 tuổi × nhóm 8 | Cha mẹ gần như không còn vai trò ở trường của con |

**Cập nhật lưới:**
- Hiện tại: cập nhật bằng tay mỗi khi danh sách chủ đề (§5.3, §6) hoặc trạng thái mẩu kiến thức thay đổi.
- Khi mẩu kiến thức thành file trong repo (có nhãn nhóm, tuổi, trạng thái theo §7): viết đoạn mã tự tạo lưới từ các file, chạy như một bước kiểm tra, để lưới luôn khớp với kho thật.
- Khi Pal gặp câu hỏi rộng (ví dụ "con lên cấp 1 cần chuẩn bị gì"), Pal dùng bài tổng quan ở nhóm 17 và hồ sơ của bé, không dùng lưới này để xếp hạng nhóm.

### 5.2 Bước chuyển theo giai đoạn (nhóm 17)
Danh sách bước chuyển dự kiến cho nhóm 17, dùng để lập chủ đề con. `đề xuất nội bộ`, chưa có nguồn.

| Giai đoạn | Bước chuyển |
|---|---|
| Tiền mang thai | Chuẩn bị mang thai |
| Thai kỳ | Chuẩn bị sinh; chuẩn bị làm cha mẹ |
| 0–12 tháng | Về nhà sau sinh; cha mẹ đi làm lại |
| 1–3 tuổi | Vào nhà trẻ; có em |
| 3–6 tuổi | Vào mẫu giáo; vào lớp 1 |
| Tiểu học | Chuẩn bị dậy thì; lên THCS |
| THCS | Thi vào lớp 10 |
| THPT | Chọn ngành; rời nhà |
| 18–24 tuổi | Đi làm; sống độc lập |

### 5.3 Thai kỳ trong khung chung
Ở G1, đối tượng của nhóm 1 là **mẹ và thai**.

| Nhóm | Chủ đề con | Nguồn dự kiến |
|---|---|---|
| 1 | Thai và mẹ thay đổi theo tam cá nguyệt; lịch khám thai, nên hỏi bác sĩ gì; dinh dưỡng và vi chất ở mức chung (liều do bác sĩ quyết định); vận động, ngủ, nghỉ ngơi | WHO ○, NHS ○, WHO ANC recommendations 2016 ○, WHO physical activity guidelines 2020 ○ |
| 7 | Sức khỏe tâm thần của mẹ; sự hỗ trợ của bố và gia đình; kết nối với em bé | WHO 2020 ECD guideline, khuyến nghị 4 ✓; Nurturing Care Framework (tính từ thai kỳ) ✓ |
| 17 | Chuẩn bị sinh; chuẩn bị nuôi con bằng sữa mẹ | WHO/UNICEF ○ |
| Nền | Dấu hiệu cần đi khám ngay (nối lớp an toàn, 115); những thứ cần tránh (rượu, thuốc lá, tự ý dùng thuốc…) | WHO ○, NICE ○ |
| Hiểu lầm | Kiêng khem, "thai giáo"… | Theo từng chủ đề |

⚠️ Phần lớn nội dung G1 thuộc vùng y tế. Người duyệt cần là **bác sĩ sản khoa hoặc hộ sinh**.

### 5.4 G0, G3–G6
Chưa lập chủ đề con. Vị trí dự kiến của các chủ đề lớn:

| Chủ đề | Vị trí |
|---|---|
| Học tập ở trường | Nhóm 6, 8 |
| Dậy thì, giáo dục giới tính | Nhóm 1 (bước chuyển ở nhóm 17; phần xâm hại ở Nền) |
| Sức khỏe tâm thần, tự hại, trầm cảm | Nhóm 3, nối chặt lớp nền |
| Mạng xã hội | Nhóm 11 |
| Chất gây nghiện | Nền, nhóm 1 |
| Định hướng nghề nghiệp | Nhóm 15 |

## 6. Bản đồ G2 theo chặng (danh sách việc cần nghiên cứu, chưa phải nội dung)

> Nội dung nháp đã soạn cho từng chặng: `documents/kien-thuc/noi-dung/0-6/`. Danh sách dưới đây giữ làm danh sách chủ đề cần nghiên cứu; chủ đề nào chưa có nguồn được ghi ở cuối mỗi file nội dung.
Chủ đề con xếp theo nhóm, đã áp dụng quy tắc §9. Ở mỗi chặng chỉ ghi những nhóm đã có chủ đề.

### Chặng 0a–0b — 0–12 tháng
⚠️ **Ưu tiên lấp đầy.** Chưa lập danh sách. Dự kiến cần ít nhất:
- Nền: ngủ an toàn.
- Nhóm 1: bú mẹ, ăn dặm (6 tháng), tăng trưởng, lịch tiêm.
- Nhóm 3: khóc nhiều.
- Nhóm 4: gắn bó.
- Nhóm 7: sức khỏe tinh thần cha mẹ sau sinh, ở cữ/kiêng cữ (hiểu lầm).
- Nhóm 17: cha mẹ đi làm lại.

### Chặng 1 — 12–18 tháng
- **Nền:** hóc dị vật, ngã, đuối nước (xô, chậu), ngộ độc.
- **1:** checklist 12, 15 tháng (phần vận động); khám 12, 15 tháng; răng sữa; ăn bổ sung (WHO 2023); chuyển loại sữa. ⚠️ Các nguồn khác nhau (JPGN 2024).
- **2:** chỉ trỏ, gọi tên đồ vật; đọc sách tranh.
- **3:** lo âu khi xa người thân; bắt đầu nói "không".
- **5:** tự xúc ăn.
- **7:** cho ăn đáp ứng.
- **11:** ⚠️ WHO và AAP khác nhau về màn hình.
- **Dấu hiệu:** không đạt mốc trong checklist; mất kỹ năng đã có.
- **Hiểu lầm (dự kiến):** "xem video để học từ" (2, 11); "xe tập đi" (1, Nền).

### Chặng 2 — 18–24 tháng
- **Nền:** leo trèo, bỏng, ổ điện, ghế ô tô, mũ bảo hiểm.
- **1:** checklist 18 tháng; khám 18 tháng; sàng lọc phát triển và tự kỷ theo lịch AAP (mức "bổ trợ" trong Bộ chỉ số); đồ uống có đường.
- **2:** bùng nổ từ vựng.
- **3:** ăn vạ bắt đầu; cắn, đánh.
- **5:** cho trẻ chọn trong giới hạn.
- **7:** bữa ăn gia đình.
- **11:** AAP chấp nhận nội dung chất lượng cao có người lớn xem cùng.
- **12:** chơi giả vờ.
- **17:** vào nhà trẻ; có em.
- **Hiểu lầm (dự kiến):** "trẻ chậm nói là do lười" (2).

### Chặng 3 — 2–3 tuổi
- **Nền:** đuối nước, giao thông, thuốc trong nhà.
- **1:** checklist 24, 30 tháng; sàng lọc 30 tháng; bữa ăn 2–3 tuổi; ngủ 11–14 tiếng ở tuổi 1–2 (AASM ✓); bỏ giấc trưa?; không chịu đi ngủ, thức đêm; răng.
- **2:** câu ngắn; song ngữ.
- **3:** đỉnh ăn vạ; giằng co bữa ăn (kén ăn).
- **5:** tập đi vệ sinh.
- **7:** nề nếp; khen cụ thể.
- **12:** chơi giả vờ.
- **Dấu hiệu:** chậm nói, chậm tương tác.
- **Hiểu lầm (dự kiến):** "đánh nhẹ để dạy thì không sao" (7, Nền).

### Chặng 4 — 3–4 tuổi
- **Nền:** dạy về cơ thể và ranh giới; bị lạc.
- **1:** checklist 3 tuổi; ngủ 10–13 tiếng ở tuổi 3–5 (AASM ✓).
- **2:** kể chuyện, đếm.
- **3:** nỗi sợ.
- **4:** chơi cùng bạn; chia sẻ đồ; anh chị em.
- **14:** việc nhà vừa sức (cất đồ chơi).
- **17:** vào mẫu giáo.
- **Hiểu lầm (dự kiến):** "học chữ càng sớm càng tốt" (6).

### Chặng 5 — 4–5 tuổi
- **Nền:** an toàn ngoài đường.
- **1:** checklist 4 tuổi.
- **2:** tiền đọc–viết, tiền toán.
- **3:** nói dối ở trẻ nhỏ (phụ 13: đặt trong bối cảnh phát triển, không quy thành vấn đề đạo đức).
- **4:** xung đột với bạn.
- **11:** thiết bị và mạng.
- **12:** trò chơi có luật.
- **Hiểu lầm (dự kiến):** "học thêm càng nhiều càng tốt" (6).

### Chặng 6 — 5–6 tuổi
- **1:** checklist 5 tuổi (⚠️ cần nguồn cho mốc 6 tuổi); vận động theo WHO 2020 (từ 5 tuổi) ○; răng vĩnh viễn đầu tiên.
- **3:** thua cuộc, thất vọng.
- **5:** tự lập.
- **17:** **chuẩn bị vào lớp 1** (bài tổng quan, trỏ tới các nhóm 1, 3, 5, 6, 8, 11 và Nền).
- **Hiểu lầm (dự kiến):** "phải biết đọc trước khi vào lớp 1" (6).

## 7. Đối tượng dữ liệu

### 7.1 Mẩu kiến thức (mẫu v2)
```
Mã · Giai đoạn · Chặng · Nhóm chính / phụ · Chủ đề · Tuổi từ–đến (tháng) hoặc tuần thai · Nhãn
Điều thường thấy ở tuổi này (mỗi ý có nhãn mức chắc chắn + mã nguồn)
Vì sao quan trọng
Chưa cần kỳ vọng ở tuổi này
Việc cha mẹ có thể làm (trỏ tới mã Hoạt động nếu có)
Con cảm thấy thế nào (quan sát của cha mẹ / câu gợi ý hỏi con, theo tuổi)
Dấu hiệu, chia 3 mức:
  - Nên theo dõi thêm
  - Nên trao đổi với bác sĩ / chuyên gia (ghi chuyên môn nào)
  - Cần đi khám ngay / gọi hỗ trợ (nối lớp nền)
Ảnh hưởng đến (nhóm/chủ đề khác, ví dụ giấc ngủ → cảm xúc, học tập)
Các nguồn khác nhau ở đâu
Hiểu lầm thường gặp
Điều Pal KHÔNG nên nói
Phạm vi áp dụng của bằng chứng (nghiên cứu ở đâu, nhóm tuổi nào, giới hạn)
Nguồn (mã trong kho nguồn)
Người soạn (AI / người) · Người duyệt + chuyên môn · Ngày duyệt · Hạn rà soát
Trạng thái: khung / nháp / chờ duyệt / đã duyệt / phát hành
Lịch sử thay đổi
```

### 7.2 Hoạt động
> Mẫu đầy đủ hơn, gồm nhãn kỹ năng và chi phí: xem §7.6 (lớp thực thi). Mẫu dưới đây giữ làm phần "cách làm" của một mục hoạt động.

```
Mã · Mục tiêu (nhóm, chủ đề) · Tuổi từ–đến
Dấu hiệu trẻ đã sẵn sàng
Cách làm (từng bước)
Vật dụng (ưu tiên đồ có sẵn trong nhà; nguyên tắc 10)
Thời lượng tham khảo
Cách làm dễ hơn / khó hơn
Dấu hiệu nên dừng hoặc đổi hoạt động
Mẩu kiến thức liên quan · Nguồn · Người soạn · Trạng thái
```

### 7.3 Dòng phát triển
Mô tả **tiến trình** của một kỹ năng hoặc một định hướng qua các giai đoạn, thay vì chỉ một mốc tuổi đơn lẻ. Mỗi dòng có một đoạn cho từng giai đoạn/chặng (biểu hiện thường thấy, chưa cần kỳ vọng), trỏ tới mẩu kiến thức của chặng đó.
- **Dòng của cấp A** (dự kiến khoảng 8 dòng): điều tiết cảm xúc, ngôn ngữ, vận động thô, vận động tinh, tự phục vụ, chơi với bạn, tập trung/chức năng điều hành, giấc ngủ.
- **Dòng của C1:** mỗi giá trị hoặc kỹ năng sống chính có một dòng (ví dụ trách nhiệm, trung thực, tự lập).

### 7.4 Kho nguồn
Mỗi nguồn có:
- mã, tên gốc, tổ chức, năm/phiên bản, link;
- bậc nguồn, `loại_bằng_chứng` (hướng dẫn chính thức / tổng quan hệ thống / nghiên cứu gốc / đồng thuận chuyên gia);
- ngày kiểm;
- trạng thái: hiện hành / đã thay thế / rút lại.

Mẩu kiến thức trỏ tới mã nguồn. Khi một nguồn đổi trạng thái, lọc ra được mọi mẩu phụ thuộc vào nó.

### 7.5 Mã định danh và nhãn
- **Mã ổn định, không chứa số nhóm**, để chuyển nhóm không phải đổi mã: `KT-0001` (mẩu kiến thức), `HD-0001` (hoạt động), `DP-01` (dòng phát triển), `NG-001` (nguồn). Khi đổi tên khái niệm, giữ tên cũ làm tên phụ để tìm kiếm.
- **Nhãn:**
  - `giai_đoạn`, `chặng`, `tuổi_từ_tháng`, `tuổi_đến_tháng` (G1 dùng `tuần_thai_từ` / `tuần_thai_đến`);
  - `nhóm_chính`, `nhóm_phụ`; `cấp` suy ra từ nhóm;
  - `chủ_đề`;
  - tùy chọn: `kiến_thức_nền` (không gắn tuổi: serve-and-return, stress độc hại…), `hoàn_cảnh_đặc_biệt` (chậm phát triển, sinh non, biến cố gia đình…), `phương_pháp`, `hiểu_lầm`, `an_toàn`, `thủ_tục`.
  - mẩu có nhãn `thủ_tục` bắt buộc thêm: `văn_bản_gốc`, `cơ_quan_ban_hành`, `địa_phương`, `năm_học`, `hạn_rà_soát` (§1.1).

### 7.6 Lớp thực thi: danh mục chung
Mọi mục của lớp thực thi có các trường chung:
- `mã` (ví dụ `HD-0001` hoạt động, `MA-0001` món ăn, `SA-0001` sách, `CS-0001` cơ sở dịch vụ, `SP-0001` sản phẩm);
- `tuổi_từ_tháng`, `tuổi_đến_tháng`;
- `kỹ_năng_chính`, `kỹ_năng_phụ` (nhãn kỹ năng, gắn với nhóm của bản đồ; ví dụ vận động thô, vận động tinh, ngôn ngữ biểu đạt, tò mò khám phá, tự phục vụ);
- `chủ_đề` (con vật, xe cộ, nấu ăn, thiên nhiên…), dùng khi khớp với sở thích của con;
- `phục_vụ_khuyến_nghị`: mã mẩu kiến thức của lớp bằng chứng mà mục này phục vụ;
- `lưu_ý_an_toàn`;
- **chi phí** (§7.8);
- `trạng_thái`: mẫu / đã duyệt / ngừng dùng; `người_soạn`; `người_duyệt`;
- `đối_tác` và cờ **`chỉ_là_mẫu_ẩn_khi_phát_hành`**: mọi mục giới thiệu sản phẩm hoặc cơ sở đối tác trong giai đoạn thử nghiệm đều bật cờ này và bị loại khỏi bản phát hành.

Trường riêng theo loại:

| Loại | Trường riêng |
|---|---|
| Hoạt động, trò chơi | đồ dùng (có sẵn trong nhà / phải mua); thời lượng; không gian cần (trong nhà, sân, nước); số người lớn cần; cách làm (§7.2); cách làm dễ hơn, khó hơn; dấu hiệu nên dừng; nguồn |
| Món ăn | nguyên liệu; nhóm thực phẩm; cách chế biến theo tuổi (thái nhỏ, gỡ xương, nấu mềm); cảnh báo hóc và dị ứng; vùng miền; thời gian nấu |
| Thực đơn | ghép từ món ăn theo quy tắc của lớp bằng chứng (thịt, cá hoặc trứng mỗi ngày; không đồ uống có đường; không thức ăn dễ hóc dưới 4 tuổi; số bữa phụ); **cần chuyên gia dinh dưỡng duyệt quy tắc** |
| Sách | tác giả; bản tiếng Việt (nhà xuất bản, năm); loại (bìa cứng, âm thanh, lật mở, có vần, tranh không chữ, kể chuyện); độ dài |
| Cơ sở dịch vụ | loại (trạm y tế, bệnh viện nhi, trung tâm tiêm chủng, nha khoa, lớp học); địa chỉ; tỉnh, xã; công hay tư; dịch vụ; giờ làm việc; liên hệ; ngày cập nhật |
| Sản phẩm | loại; tiêu chí khớp với khuyến nghị (ví dụ "kem đánh răng có fluoride"); tuổi |

### 7.7 Mục tiêu và danh sách của gia đình
**Mục tiêu** (người dùng chốt 28/10/2026):
- Danh sách mục tiêu cố định giúp phụ huynh có **cái nhìn tổng quan** về những khả năng có thể phát triển cho con; mỗi mục tiêu tương ứng một số nhãn kỹ năng.
- Pal **hỏi phụ huynh về nguyện vọng và khả năng** (tài chính, thời gian, người chăm, không gian), rồi đưa ra **một thiết kế phù hợp nhất kèm cảnh báo**. Cách hỏi và cách trình bày: `documents/pal/guide-pal-answers.md`.
- **Bố mẹ tự thống nhất với nhau.** Pal chỉ nhận ý kiến cuối cùng; phần tư vấn tổng thể đã được đưa ra trước đó.

**Phần nền và phần theo mục tiêu:**
- Mọi kế hoạch luôn có đủ **phần nền** theo lớp bằng chứng: an toàn, ngủ, ăn, vận động, đọc sách, khám và tiêm.
- **Mục tiêu chỉ làm tăng số gợi ý ở mảng tương ứng, không bớt mảng khác** (người dùng chốt 28/10/2026). Ví dụ: bình thường Pal gợi ý 2 sách khoa học trong tháng; gia đình chọn mục tiêu khoa học thì gợi ý **3–5 sách**. Sách về ngôn ngữ, vận động… vẫn giữ số lượng mặc định.
- Số gợi ý mặc định theo từng loại (sách, trò chơi, hoạt động) và theo tuổi lưu trong một **bảng cấu hình**: `loại`, `kỹ_năng hoặc chủ_đề`, `tuổi`, `số_mặc_định`, `số_khi_có_mục_tiêu` (ví dụ 2 và 3–5).
- Phần tăng thêm nằm **trong giới hạn thời gian và tài chính** mà phụ huynh khai báo.
- Pal **cảnh báo** khi phần theo mục tiêu lấn vào phần nền (ví dụ lớp học thêm làm mất giờ ngủ trưa hoặc giờ vận động), khi kế hoạch vượt khả năng gia đình khai báo, hoặc khi mục tiêu không hợp tuổi (ví dụ "phát hiện năng khiếu sớm", nhóm 15).
- Cơ sở: lớp bằng chứng hiện không có nguồn ủng hộ chuyên biệt hóa sớm ở 0–6 tuổi.

**Bảng dữ liệu:**

| Bảng | Trường chính |
|---|---|
| Danh sách mục tiêu cố định | tên; mô tả cho phụ huynh; nhãn kỹ năng tương ứng; tuổi áp dụng |
| Mục tiêu của gia đình (thuộc hồ sơ con, phạm vi `family`) | mục tiêu; mức ưu tiên; ngày đặt |
| Khả năng của gia đình (thuộc hồ sơ, phạm vi `family`) | ngân sách tháng cho con (khoảng); thời gian rảnh của người lớn theo ngày; người chăm chính; con đi nhà trẻ hay không; không gian nhà; tỉnh, xã (chỉ hỏi khi cần tìm cơ sở dịch vụ); dị ứng của con |
| Danh sách của gia đình | mã mục trong danh mục chung, hoặc mục phụ huynh tự thêm; lý do Pal chọn (mục tiêu nào, kỹ năng nào); trạng thái (sắp làm, đã làm, con thích, không hứng thú, bỏ); ngày; ghi chú |

- Phản hồi "con thích / không hứng thú" là cách đưa **tiếng nói của trẻ** (§3.3) vào kế hoạch: danh sách tự điều chỉnh theo phản hồi.
- Mục phụ huynh tự thêm chỉ nằm trong danh sách của gia đình đó; có thể được đội ngũ xem xét đưa vào danh mục chung sau khi duyệt.

### 7.8 Chi phí và ước tính chi phí
Mọi mục của lớp thực thi có trường chi phí, để Pal **ước tính chi phí** của kế hoạch (đồ chơi cho hoạt động, khám bệnh, tiêm dịch vụ, sách, học tập):

| Trường | Ý nghĩa |
|---|---|
| `kiểu_chi_phí` | một lần (mua đồ chơi, sách) / mỗi lần dùng (một lần khám, một mũi tiêm dịch vụ) / định kỳ (học phí theo tháng) / miễn phí |
| `chi_phí_từ`, `chi_phí_đến` | khoảng giá, đơn vị đồng |
| `có_phương_án_0_đồng` | có cách làm không tốn tiền không (ví dụ dùng đồ gia dụng thay đồ chơi mua) |
| `vùng_giá` | toàn quốc / thành phố lớn / tỉnh |
| `nguồn_giá`, `ngày_cập_nhật_giá` | lấy giá từ đâu, khi nào; giá cũ hơn 6 tháng thì cần cập nhật (`đề xuất nội bộ`) |

Quy tắc ước tính:
- Ước tính **theo tháng**, cộng các mục trong danh sách của gia đình, hiện dạng **khoảng** (thấp nhất – cao nhất), kèm ngày cập nhật giá.
- Luôn hiện **phương án tiết kiệm** khi có (ví dụ tiêm chủng mở rộng ở trạm y tế, đồ chơi tự làm).
- Ghi rõ đây là **ước tính tham khảo**, giá thực tế tùy nơi.
- So ước tính với ngân sách gia đình khai báo; vượt thì cảnh báo và đề xuất phương án rẻ hơn.

## 8. Kiểm soát chất lượng

### 8.1 Tám câu kiểm tra khái niệm khi duyệt
Nguồn: văn bản "Khung sơ bộ phát triển toàn diện trẻ và các vấn đề chưa giải quyết" của người dùng.
1. Mẩu này nói về **kết quả/năng lực của trẻ** hay về **môi trường**? Nếu là môi trường, có đang bị viết thành tính cách của trẻ không?
2. Có tín hiệu **an toàn** nào bị lấp hoặc bị "cân" với điểm mạnh khác không?
3. Có **so sánh trẻ với trẻ khác** hay ngầm tạo điểm tổng không?
4. **Tiếng nói của trẻ** có được tính đến theo cách phù hợp tuổi không?
5. Có đang suy **nhân quả** từ một tương quan không?
6. Có cần **điều chỉnh cho trẻ có nhu cầu đặc biệt** không?
7. Có hỏi hoặc lưu **dữ liệu nhạy cảm** không cần thiết không?
8. Có phù hợp **văn hóa và pháp lý Việt Nam** không?

### 8.2 Nội dung do AI soạn
- Mọi mẩu ghi rõ `người soạn` là AI hay người.
- Mọi link nguồn do AI đưa ra phải được mở và kiểm tra trước khi chuyển "chờ duyệt".
- Bắt buộc chuyên gia đúng chuyên môn duyệt các phần: Nền, nhóm 1 (phần y tế), nhóm 3 (sức khỏe tâm thần), thai kỳ.
- AI không được tự chuyển trạng thái sang "đã duyệt" hay "phát hành".

### 8.3 Tiêu chí nghiệm thu
- **Một mẩu kiến thức được phát hành khi:**
  - đủ các mục bắt buộc của mẫu §7.1;
  - mọi ý có mã nguồn và nhãn mức chắc chắn;
  - link nguồn đã kiểm;
  - qua 8 câu kiểm tra §8.1;
  - chuyên gia đúng chuyên môn đã duyệt.
- **Một chặng tuổi được phát hành khi:**
  - mọi ô của chặng trong lưới độ phủ (§5.1), trừ ô "Không áp dụng", đã ở trạng thái "Đã duyệt";
  - lớp nền có mẩu cho các rủi ro chính;
  - có ít nhất 3 tình huống đời thường;
  - các dòng phát triển liên quan đã có đoạn cho chặng đó.
- **Kiểm tra tự động** (viết thành script kiểm tra khi dữ liệu nằm trong repo; repo hiện chỉ còn tài liệu): thiếu mục bắt buộc, thiếu mã nguồn, mã nguồn trỏ tới nguồn "rút lại", nhóm không hợp lệ, trùng mã.

## 9. Quy tắc xếp bài vào kho (dành cho người soạn nội dung)

> Mục này dùng khi **cất một bài mới vào kho chuẩn**: bài nằm ở nhóm nào. Đây **không phải** cách Pal tìm câu trả lời; cách Pal tìm câu trả lời sẽ viết thành mục riêng (việc còn mở).

### 9.1 Cây quyết định
Áp dụng theo thứ tự, dừng ở bước đầu tiên khớp:
1. Nội dung có nguy cơ gây hại thể chất, bạo lực, xâm hại, hoặc cần hỗ trợ khẩn? → **Nền**. Nhóm liên quan khác làm nhóm phụ.
2. Nội dung là một **phương pháp, trường phái, sản phẩm hay dịch vụ** (Montessori, EASY, ăn dặm tự chỉ huy BLW, Glenn Doman, sinh trắc vân tay…)? → gắn nhãn `phương_pháp`; nhóm chính là nhóm mà phương pháp nhắm tới.
3. Nội dung là **tổng quan một bước chuyển** (vào lớp 1, có em, dậy thì…)? → **nhóm 17**. Kỹ năng cụ thể của bước chuyển viết thành mẩu riêng ở nhóm cấp A, trỏ về nhóm 17.
4. Nội dung mô tả điều đang diễn ra **ở trẻ** (hành vi, kỹ năng, cơ thể)? → **cấp A**, chọn nhóm theo năng lực bị tác động chính (bảng §3.2).
5. Nội dung mô tả **điều kiện quanh trẻ**, hoặc thực hành của người lớn không gắn với một hiện tượng cụ thể ở trẻ? → **cấp B**.
6. Nội dung về **giá trị, kỹ năng sống, công dân** nhìn theo hướng lâu dài? → **C1**. Hành vi cụ thể ở một tuổi (ví dụ tranh đồ chơi lúc 2 tuổi) vẫn xếp cấp A, chỉ liên kết với C1.
7. Nội dung về **định hướng nghề nghiệp**? → **nhóm 15**.

Mỗi mẩu có **1 nhóm chính**, tối đa **1 nhóm phụ**. Ca nào mơ hồ thì ghi vào Sổ quyết định phân loại (§9.2), để các lần sau xếp giống nhau.

### 9.2 Sổ quyết định phân loại
| Khái niệm | Nhóm chính | Nhóm phụ | Lý do |
|---|---|---|---|
| Ăn vạ | 3 | 7 | Hiện tượng điều tiết cảm xúc ở trẻ |
| Kén ăn: ăn gì, bao nhiêu | 1 | — | Dinh dưỡng |
| Kén ăn: giằng co trong bữa ăn | 3 | 7 | Phần hành vi, cảm xúc |
| Tập đi vệ sinh | 5 | 1 | Kỹ năng tự phục vụ; phần táo bón ở nhóm 1 |
| Tự xúc ăn | 5 | 1 | Kỹ năng tự phục vụ |
| Sợ người lạ, lo âu khi xa người thân | 3 | 4 | Cảm xúc, liên quan gắn bó |
| Ngủ an toàn cho trẻ nhỏ | Nền | 1 | Nguy cơ tử vong đột ngột ở trẻ sơ sinh |
| Thời lượng ngủ, nề nếp ngủ | 1 | 7 | Sức khỏe |
| Không chịu đi ngủ, thức đêm | 1 | 3 | Sức khỏe; phần cảm xúc ở nhóm phụ |
| Khả năng tập trung | 5 | — | Chức năng điều hành |
| Chức năng điều hành | 5 | — | — |
| Song ngữ | 2 | 7 | Ngôn ngữ |
| Ông bà chăm cháu | 7 | — | Môi trường gia đình |
| Màn hình | 11 | 1 | Môi trường số; phần ảnh hưởng đến giấc ngủ ở nhóm 1 |
| Montessori | 8 (nhãn `phương_pháp`) | 6 | Phương pháp giáo dục |
| Kỷ luật không bạo lực | 7 | Nền | Thực hành của cha mẹ |
| Nói dối ở trẻ 4–5 tuổi | 3 | 13 | Hiện tượng phát triển; liên kết giá trị trung thực |
| Chuẩn bị vào lớp 1 (tổng quan) | 17 | 6 | Bước chuyển |
| Thích nghi khi mới đi mẫu giáo | 17 | 3 | Bước chuyển |
| Chia sẻ đồ chơi | 4 | 13 | Hành vi xã hội ở trẻ |
| Thủ tục nhập học, tuyển sinh, chuyển trường, quy chế thi | 17 (nhãn `thủ_tục`) | 8 | Gắn với bước chuyển của con |
| Thủ tục y tế cho con (thẻ bảo hiểm y tế, sổ tiêm chủng) | 1 (nhãn `thủ_tục`) | — | Sức khỏe |
| Giấy tờ hộ tịch của con (khai sinh…) | 7 (nhãn `thủ_tục`) | — | Việc của gia đình |

## 10. Đối chiếu hệ làn v3 → khung hiện tại
| Làn v3 | Chuyển thành |
|---|---|
| L1 Mốc phát triển | Mục "Điều thường thấy" + phần theo dõi trong hồ sơ trẻ (Bộ chỉ số) + dòng phát triển |
| L2 Dấu hiệu cần đi khám | Mục "Dấu hiệu" (3 mức) trong mọi mẩu |
| L3 Chơi, ngôn ngữ, học sớm | Nhóm 2, 5, 6, 12 |
| L4 Cảm xúc, hành vi và cách đồng hành | Nhóm 3, 4; cách cha mẹ xử lý → nhóm 7 |
| L5 Dinh dưỡng | Nhóm 1 |
| L6 Ngủ, vận động, màn hình | Nhóm 1, nhóm 11 |
| L7 Sức khỏe dự phòng | Nhóm 1 |
| L8 An toàn | Nền |
| L9 Hiểu lầm thường gặp | Mục "Hiểu lầm" + nhãn `hiểu_lầm` (gom thành chuyên mục riêng được) |
| N / P / S | Nhãn `kiến_thức_nền` / nhóm 7 / nhãn `hoàn_cảnh_đặc_biệt` |
| T1–T9 (thai kỳ) | Nhóm 1, 7, 17 và Nền (§5.3) |

## 11. Việc còn mở
1. **Lấp nội dung 0–12 tháng** (ưu tiên kế tiếp).
2. **Bản đồ chuyển tuyến:** dấu hiệu nào → gặp ai (bác sĩ nhi, chuyên khoa phát triển, âm ngữ trị liệu, tâm lý, mắt, tai mũi họng…), theo hệ thống y tế Việt Nam.
3. Chuyên gia duyệt các ô "Không áp dụng" của lưới độ phủ (§5.1), danh sách bước chuyển (§5.2) và sổ quyết định phân loại (§9.2).
4. Đối chiếu 17 nhóm với Nurturing Care Framework, CDC/AAP, WHO 2020 ECD guideline và chuẩn Việt Nam cho 0–6 tuổi: Chương trình giáo dục mầm non; Bộ chuẩn phát triển trẻ em 5 tuổi (nhiều khả năng là Thông tư 23/2010, cần kiểm số hiệu và hiệu lực).
5. Nguồn xác nhận khoảng tuổi dùng tuổi hiệu chỉnh cho trẻ sinh non.
6. Kho nguồn có mã đã lập tại `documents/kien-thuc/nguon.md` (27/10). Còn lại: chuyển các nguồn ở §13 chưa có mã vào kho; đối chiếu bản gốc cho các nguồn thứ cấp (bậc TC).
7. Chốt các mục "chưa chốt" của §1.1 (kiến thức chung của AI, danh sách trang được phép, lọc chủ đề, xử lý khi thiếu thông tin định hướng).
8. Viết mục "Cách Pal tìm câu trả lời" (hiểu câu hỏi → lọc theo tuổi và các nhóm liên quan → tìm trong kho chuẩn → tra mạng khi thiếu → trả lời, nói rõ nguồn), tách khỏi §9.
9. Lớp thực thi (§7.6–7.8): xây trước các bảng sự kiện theo tháng tuổi, hoạt động, món ăn; chuyên gia dinh dưỡng duyệt quy tắc thực đơn; tìm hướng dẫn khẩu phần của Viện Dinh dưỡng Quốc gia; tải đủ bảng chuẩn tăng trưởng WHO; xin phép tác giả M-CHAT-R/F trước khi đưa bộ câu hỏi vào app; xác minh tiêm chủng mở rộng miễn phí tại trạm y tế.
10. Lập danh sách thủ tục hành chính ưu tiên đưa vào kho (ví dụ tuyển sinh mầm non, lớp 1, lớp 6, lớp 10) và cách cập nhật theo năm học, theo tỉnh.

## 12. Ghi chú về file tham khảo "Khung 0–18 tuổi"
- **Dùng:** cấu trúc theo giai đoạn.
- **Chưa dùng nội dung:** file không ghi nguồn.
- **Mục "Khả năng bứt phá":** thay bằng nhóm 2, 6, 12 (cơ hội học có bằng chứng) và chuyên mục hiểu lầm.

## 13. Nguồn đã xác nhận (26–27/10/2026)
- [Nurturing care framework](https://nurturing-care.org/about/what-is-the-nurturing-care-framework/)
- [WHO guideline on improving ECD (2020) – FAQ](https://cdn.who.int/media/docs/default-source/mca-documents/child/early-child-development/frequently_asked_questions_improving_ecd_who-guideline_2020_bd.pdf)
- [CDC revised milestone checklists – AAFP 2022](https://www.aafp.org/afp/2022/1000/editorial-cdc-developmental-milestone-checklist)
- [CDC Positive Parenting Tips by age](https://restoredcdc.org/www.cdc.gov/child-development/positive-parenting-tips/)
- [UNICEF ECDI2030](https://www.unicef.cn/en/documents/ecdi2030-early-childhood-development-index-2030)
- [WHO Guidelines on physical activity, sedentary behaviour and sleep for children under 5](https://www.who.int/publications/i/item/guidelines-on-physical-activity-sedentary-behaviour-and-sleep-for-children-under-5-years-of-age)
- [AASM pediatric sleep duration consensus 2016](https://aasm.org/resources/pdf/pediatricsleepdurationmethods.pdf)
- [WHO Guideline for complementary feeding 6–23 months (2023)](https://www.who.int/timorleste/publications/i/item/9789240081864)
- [Multisociety response to WHO CF guideline (JPGN 2024)](https://pubmed.ncbi.nlm.nih.gov/38743631/)
- [WHO – Corporal punishment of children and health](https://who.int/news-room/fact-sheets/detail/corporal-punishment-and-health)
- [WHO – Ending corporal punishment (INSPIRE)](https://www.who.int/teams/social-determinants-of-health/violence-prevention/ending-corporal-punishment-of-children)
- [UNICEF – Parenting for Lifelong Health for Young Children](https://www.unicef.org/montenegro/en/parenting-lifelong-health-young-children)
- [UNICEF – Care for Child Development](https://www.unicef.org/documents/care-child-development)
- [Harvard Center on the Developing Child](https://developingchild.harvard.edu/)
- [AAP Bright Futures Guidelines 4th ed.](https://www.aap.org/en/practice-management/bright-futures/bright-futures-materials-and-tools/bright-futures-guidelines-and-pocket-guide/)
- [AAP media recommendations 2016 (tóm tắt)](https://www.edweek.org/leadership/pediatricians-set-new-guidelines-on-electronic-media-use-by-young-children/2016/10)
- [WHO – Drowning fact sheet](https://who.int/news-room/fact-sheets/detail/drowning)
- [WHO – Adolescent health (SEARO)](https://www.who.int/india/health-topics/adolescent-health-and-development)
- [Sawyer et al. – The age of adolescence (Lancet Child Adolesc Health 2018)](https://eres.library.adelaide.edu.au/dspace/handle/2440/124427)
- [Luật Trẻ em 2016](https://thuvienphapluat.vn/van-ban/EN/Van-hoa-Xa-hoi/Law-102-2016-QH13-children/312407/tieng-anh.aspx)
