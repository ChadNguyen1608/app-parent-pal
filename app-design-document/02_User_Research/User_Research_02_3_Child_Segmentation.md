# 02.3 — CHILD SEGMENTATION

**Dự án:** Product Blueprint — Nền tảng AI hỗ trợ phát triển trẻ em và thanh thiếu niên  
**Mục:** 02 — User Research & User Types  
**Trạng thái:** Chốt định hướng phân khúc; các giả thuyết về hành vi và nhu cầu vẫn cần nghiên cứu kiểm chứng  
**Ngày cập nhật:** 06/11/2026  

> **Tóm tắt quyết định:** Phạm vi dài hạn của nền tảng là **0–23 tuổi**. Nhóm **CORE** là **học sinh tiểu học và THCS (lớp 1–9, tuổi tham chiếu khoảng 6–14)**, với trọng tâm là trẻ **trực tiếp thực hiện, báo cáo và phản hồi**. THPT (lớp 10–12) nằm trong phạm vi nghiên cứu ngay từ đầu nhưng chưa phải CORE triển khai. Mức độ tự chủ phụ thuộc khả năng thực tế và quyết định của phụ huynh đối với người chưa thành niên, **không bị ấn định cứng theo tuổi hay cấp học**.

---

## 1. Mục tiêu của Child Segmentation

Xác định các nhóm trẻ và thanh thiếu niên sử dụng sản phẩm, nhu cầu mà sản phẩm phải giải quyết cho **chính người sử dụng trẻ**, và mức độ tham gia của phụ huynh. Phân khúc này là cơ sở cho nghiên cứu người dùng, thiết kế trải nghiệm Parent App / Child App, lựa chọn nội dung AI phù hợp và kiểm chứng MVP.

Các câu hỏi trọng tâm:

1. Ở mỗi nhóm học, trẻ có thể tiếp nhận, thực hiện và phản hồi hoạt động như thế nào?
2. Trẻ nhận được lợi ích trực tiếp gì khi dùng ứng dụng, ngoài việc báo cáo cho phụ huynh?
3. Ai được chủ động lập kế hoạch, thay đổi chế độ và quyết định?
4. Những đặc điểm nào cần quan sát thực tế thay vì suy ra từ độ tuổi?

## 2. Ba chiều phân loại độc lập

### 2.1. Education / Development Stage — Cấp học và nhu cầu phát triển

Sử dụng **cấp học tại Việt Nam** làm trục tổ chức nghiên cứu và thiết kế nội dung. Tuổi là giá trị tham chiếu, **không** tự động quyết định cấp học, năng lực hay chế độ tự chủ.

| Mã | Phân khúc | Lớp học / bối cảnh | Tuổi tham chiếu | Vai trò trong định hướng sản phẩm |
|---|---|---|---|---|
| S0 | Trước tiểu học | Trước lớp 1 | 0–5 | Mở rộng dài hạn; trải nghiệm chủ yếu do phụ huynh thực hiện |
| S1 | Tiểu học | Lớp 1–5 | Khoảng 6–10 | **CORE** |
| S2 | Trung học cơ sở (THCS) | Lớp 6–9 | Khoảng 11–14 | **CORE** |
| S3 | Trung học phổ thông (THPT) | Lớp 10–12 | Khoảng 15–17 | Nghiên cứu từ đầu, mở rộng triển khai sau |
| S4 | Sau phổ thông / đầu trưởng thành | Học tiếp, học nghề, làm việc hoặc lộ trình khác | 18–23 | Mở rộng dài hạn; chuyển trọng tâm sang tư vấn và tự định hướng |

**Lý do dùng khoảng tuổi 11–14 cho THCS:** Tuổi vào lớp 6 thường là 11 và lớp 10 thường là 15 tại Việt Nam. Những trường hợp học sớm/muộn, lưu ban, thay đổi hệ thống học hoặc học ngoài nhà trường sẽ được phân loại theo **cấp/lộ trình học thực tế**, không ép theo tuổi.

**Quan trọng:** Cấp học không quyết định tuyệt đối mục tiêu phát triển. Ví dụ, khám phá nghề nghiệp có thể bắt đầu từ THCS và được tiếp tục, bổ sung kiến thức ngành/trường ở THPT và sau phổ thông. Hệ thống cần duy trì thông tin định hướng theo thời gian.

### 2.2. Autonomy Mode — Chế độ tự chủ

Ba chế độ vận hành là **các mô hình vai trò**, không phải ba mốc tuổi cố định:

| Chế độ | Định hướng vận hành | Vai trò trẻ | Vai trò phụ huynh |
|---|---|---|---|
| **Mode 1 — Parent-led** | Phụ huynh dẫn dắt | Tham gia hoạt động phù hợp khả năng; không nhất thiết tự sử dụng app thường xuyên | Tổ chức, đồng hành thực hiện, quan sát và ghi nhận |
| **Mode 2 — Child-executed** | Trẻ thực thi; **mô hình cốt lõi** | Trực tiếp thực hiện, báo cáo, phản hồi, đề xuất điều chỉnh | Đồng xây dựng/duyệt mục tiêu, giám sát, hỗ trợ và phê duyệt thay đổi quan trọng |
| **Mode 3 — Child-directed** | Trẻ chủ động định hướng | Đề xuất mục tiêu, tham gia lập kế hoạch, tự thực hiện và đánh giá | Tư vấn, hỗ trợ nguồn lực, đồng hành theo mức phù hợp |

**Quyết định đã chốt:**

- Với tài khoản người dùng **chưa thành niên**, **chỉ phụ huynh có quyền chuyển Autonomy Mode**. Trẻ có thể nêu nguyện vọng và trao đổi, nhưng không tự kích hoạt chuyển chế độ; AI không được tự chuyển.
- **Mỗi trẻ có một Autonomy Mode chung** cho tất cả các hoạt động trong giai đoạn đầu, thay vì một chế độ riêng cho từng lĩnh vực. Đây là quyết định đơn giản hóa trải nghiệm, **không** xóa bỏ giới hạn an toàn, yêu cầu phê duyệt đặc biệt hoặc các quy tắc bảo vệ dữ liệu.
- Phụ huynh chọn chế độ dựa trên **khả năng thực tế của trẻ**, không dựa vào trần tuổi cứng. Do đó, một học sinh THPT vẫn có thể dùng Mode 2, hoặc một học sinh THCS có thể dùng Mode 3 khi phù hợp.
- Với người dùng **từ 18 tuổi**, vai trò của phụ huynh về cơ bản chuyển sang **tư vấn**. Việc truy cập dữ liệu, chia sẻ kế hoạch hay mời phụ huynh tham gia phải dựa trên quyền và sự đồng ý của người dùng trưởng thành, không tự động kế thừa quyền quản lý từ thời chưa thành niên.

### 2.3. Capability Profile — Năng lực thực tế và nhu cầu hỗ trợ

Trẻ cùng lớp/cùng tuổi có thể khác nhau về: khả năng hiểu nhiệm vụ, tổ chức thời gian, bắt đầu và duy trì hoạt động, chủ động báo cáo, diễn đạt khó khăn, cần hỗ trợ từ người lớn, và khả năng tham gia ra quyết định.

**Định hướng nghiên cứu:** Ghi nhận năng lực theo **nhiệm vụ và bối cảnh cụ thể**, kết hợp báo cáo từ trẻ và phụ huynh, thay vì tự động gán nhãn tổng quát như “chậm”, “kém”, “giỏi”, hoặc suy luận chẩn đoán từ dữ liệu ứng dụng. Chưa chốt một bộ tiêu chí chấm điểm Capability Profile tại mục 2.3.

## 3. Phân tích nhóm CORE — Tiểu học và THCS (lớp 1–9)

### S1 — Tiểu học (lớp 1–5, khoảng 6–10 tuổi)

**Giả thuyết hành vi:** Nhiều trẻ cần cách diễn đạt trực quan, nhiệm vụ ngắn hoặc có hướng dẫn cụ thể; khả năng tự báo cáo và duy trì hoạt động có thể cần người lớn hỗ trợ, đặc biệt ở các lớp đầu cấp.

**Nhu cầu nghiên cứu:**
- Hiểu “hôm nay làm gì, vì sao làm, bắt đầu từ đâu”.
- Thực hiện được nhiệm vụ có bước rõ ràng.
- Báo cáo đơn giản về hoàn thành, khó khăn và cảm nhận.
- Được ghi nhận nỗ lực, không chỉ kết quả.

**Ví dụ tình huống (minh họa, chưa phải tính năng đã chốt):** Trẻ xem hoạt động chuẩn bị cặp sách, làm theo từng bước, tự đánh dấu hoặc báo lại rằng chưa tìm thấy đồ dùng.

### S2 — THCS (lớp 6–9, khoảng 11–14 tuổi)

**Giả thuyết hành vi:** Khả năng tự tổ chức và phản tư có thể tăng, song khác biệt rất lớn giữa từng người và từng bối cảnh. Trẻ có thể cần tiếng nói rõ hơn trong kế hoạch và không gian để phản hồi khó khăn, cảm xúc, quan hệ xã hội.

**Nhu cầu nghiên cứu:**
- Hiểu mục tiêu và tham gia điều chỉnh cách thực hiện.
- Chủ động thực thi và báo cáo tiến độ.
- Trao đổi với AI về khó khăn, động lực và trải nghiệm.
- Khám phá sở thích, năng lực và những lĩnh vực học tập/nghề nghiệp có thể quan tâm.

**Ví dụ tình huống:** Trẻ muốn thay đổi thời gian học một kỹ năng vì lịch sinh hoạt không phù hợp; AI hỗ trợ trẻ mô tả lý do và gửi đề xuất để phụ huynh xem xét.

### Phạm vi CORE và phạm vi nghiên cứu

- **CORE sản phẩm:** S1 + S2, tức lớp **1–9**; đây là ranh giới theo cấp học, **không phải luật khóa tính năng theo tuổi**.
- **Nghiên cứu người dùng ban đầu:** Bao gồm **S1, S2 và S3 (THPT)** để hiểu sự phát triển của nhu cầu, mức độ tự chủ và sự chuyển đổi giữa các giai đoạn.
- **Phạm vi MVP chức năng:** Chưa chốt số lượng tính năng hoặc độ sâu phục vụ từng lớp. Không đồng nhất “nghiên cứu cả ba nhóm” với “xây đủ mọi tính năng cho cả ba nhóm trong MVP”.

## 4. Giá trị trực tiếp mà trẻ nhận được

**Quyết định Q3:** Kết hợp cả ba nhóm giá trị, với mức ưu tiên có thể thay đổi theo cấp học, độ tuổi và nhu cầu của từng trẻ:

1. **Execution Support:** AI giúp trẻ hiểu, bắt đầu, thực hiện và theo dõi hoạt động/kế hoạch.
2. **Companionship & Listening:** AI tạo môi trường trò chuyện phù hợp, tiếp nhận và phản hồi trải nghiệm, khó khăn và cảm xúc của trẻ; không thay thế người chăm sóc hay chuyên gia.
3. **Self-discovery & Development:** AI giúp trẻ quan sát sở thích, thử nghiệm lĩnh vực mới, phản tư về điểm mạnh và nhu cầu hỗ trợ, đồng thời hiểu các lựa chọn tương lai.

**Giả thuyết ưu tiên để kiểm chứng (không phải số liệu nghiên cứu):**

| Nhóm | Giá trị có thể nổi bật |
|---|---|
| S1 — Tiểu học | Hỗ trợ hiểu và thực hiện nhiệm vụ; tương tác đơn giản, thân thiện |
| S2 — THCS | Kết hợp thực thi, được lắng nghe, khám phá bản thân |
| S3 — THPT | Khám phá bản thân, định hướng dài hạn, chủ động lập kế hoạch và nhận tư vấn |
| S4 — Sau phổ thông | Tư vấn phát triển cá nhân, ngành học, nghề nghiệp, kỹ năng và mục tiêu tự định hướng |

Trẻ **không nhất thiết muốn dùng app chỉ để hoàn thành nhiệm vụ do phụ huynh giao**. Đây là rủi ro nghiên cứu cốt lõi: nếu Child App bị cảm nhận như công cụ giám sát thuần túy, trẻ có thể không duy trì sử dụng hoặc không phản hồi trung thực.

## 5. Quyền phản hồi và đề xuất điều chỉnh

**Quyết định Q5 đã chốt:** Trẻ được phản hồi lý do, trao đổi với AI và đề xuất điều chỉnh kế hoạch; không bị giới hạn ở trạng thái “hoàn thành/chưa hoàn thành”.

**Luồng minh họa:**

1. Phụ huynh và/hoặc AI xây dựng mục tiêu và kế hoạch theo chế độ.
2. Trẻ thực hiện và tự báo cáo kết quả, trải nghiệm, khó khăn.
3. Trẻ được nói rằng nhiệm vụ quá khó, chưa phù hợp, không muốn thực hiện hoặc cần đổi thời điểm.
4. AI giúp hiểu và diễn đạt phản hồi, **không tự động kết luận trẻ thiếu kỷ luật**.
5. Đề xuất được chuyển cho phụ huynh xử lý khi cần phê duyệt theo chế độ đang áp dụng.
6. Kế hoạch và cách hỗ trợ được điều chỉnh theo quyết định phù hợp; lưu lại ngữ cảnh để theo dõi lâu dài nếu được phép.

Chi tiết quyền tự điều chỉnh, quy tắc phê duyệt, lịch sử thay đổi và UX sẽ được thiết kế ở Feature Planning / Permissions, không quyết định hết trong mục phân khúc này.

## 6. Nguyên tắc liên tục giữa các cấp học

- Khi trẻ chuyển lớp hoặc cấp học, dữ liệu mục tiêu, sở thích, trải nghiệm và tiến độ cần có khả năng tiếp nối; không mặc định xóa hay tạo lại định hướng từ đầu.
- Nội dung phát triển thay đổi theo nhu cầu hiện tại nhưng có thể kế thừa định hướng dài hạn.
- Định hướng nghề nghiệp có thể được giới thiệu sớm dưới hình thức khám phá; thông tin về ngành học, trường, tuyển sinh và nghề nghiệp ngày càng cụ thể ở các giai đoạn sau.
- Chuyển cấp học **không tự động chuyển Autonomy Mode**.
- Chuyển sang tuổi trưởng thành đòi hỏi cơ chế quyền truy cập và sự đồng ý riêng; chưa có đặc tả pháp lý/UX đầy đủ tại đây.

## 7. Các rủi ro cần nghiên cứu và kiểm soát

| Rủi ro | Hệ quả có thể xảy ra | Hướng nghiên cứu / nguyên tắc xử lý |
|---|---|---|
| Suy năng lực từ tuổi hoặc lớp | Cá nhân hóa sai, nhiệm vụ không phù hợp | Dùng cấp học làm khung tham chiếu, kiểm chứng với khả năng thực tế |
| Child App chỉ phục vụ giám sát | Trẻ không có động lực, báo cáo hình thức | Đo giá trị trực tiếp cho trẻ, chất lượng phản hồi và sự chủ động |
| Trẻ báo cáo thiếu hoặc sai | Phụ huynh/AI đánh giá sai tiến độ | Phân biệt tự báo cáo với bằng chứng độc lập; tránh kết luận chắc chắn |
| Chế độ chung quá thô | Một số lĩnh vực cần bảo vệ/quy trình đặc biệt | Giữ chế độ chung nhưng không bỏ qua quy tắc an toàn và quyền riêng tư |
| Phụ thuộc vào AI | Giảm khả năng tự suy nghĩ và tự quản lý | Hướng hỗ trợ chuyển dần từ làm mẫu sang khuyến khích trẻ tự quyết |
| Trẻ chia sẻ nội dung nhạy cảm | Xung đột riêng tư, an toàn và trách nhiệm chăm sóc | Xây dựng chính sách Child Journal / Wellbeing Monitoring, giải thích giới hạn riêng tư rõ ràng |
| AI hiểu sai tâm trạng hoặc rủi ro | Báo động sai hoặc bỏ sót tín hiệu nghiêm trọng | Không xem AI là công cụ chẩn đoán; thiết kế hỗ trợ và quy trình an toàn, bao gồm phản ứng với rủi ro cấp tính |
| Sau 18 tuổi vẫn bị giám sát mặc định | Xâm phạm quyền tự quyết và riêng tư của người trưởng thành | Chuyển sang mô hình tư vấn và chia sẻ theo sự đồng ý phù hợp |

**Ghi chú về Child Journal (đã thống nhất ở thảo luận trước):** Trẻ có thể kể chuyện hoặc tâm sự bằng tiếng nói/văn bản; định hướng hiện tại là **không lưu bản ghi âm gốc**, chỉ lưu tóm tắt khi cần. Tóm tắt vẫn là dữ liệu nhạy cảm. Phạm vi phụ huynh được xem, thời gian lưu, xóa, xử lý nguy cơ tự gây hại và cách báo động sẽ được quyết định tại **2.4 User Needs & Pain Points** và phần **Privacy / Permission / Safety**.

## 8. Kế hoạch xác thực giả thuyết

Đây là **đề xuất phương pháp**, chưa phải số liệu khảo sát đã thực hiện.

- Nghiên cứu cả **S1, S2, S3** từ đầu, với trẻ và phụ huynh theo quy trình phù hợp cho người chưa thành niên.
- Tách quan sát hành vi thực hiện nhiệm vụ, phỏng vấn nhu cầu và thử nghiệm trải nghiệm; tránh chỉ hỏi phụ huynh thay cho trẻ.
- Kiểm chứng: khả năng tự thực hiện/báo cáo, mức độ hiểu hướng dẫn AI, lý do trẻ muốn dùng app, mức độ thoải mái khi phản hồi thật, khác biệt theo cấp học và chế độ tự chủ.
- Chú ý nhóm học sinh có khả năng/điều kiện tiếp cận công nghệ khác nhau; không đồng nhất kết quả từ một nhóm nhỏ với toàn bộ học sinh.
- Sử dụng phát hiện để chọn phạm vi MVP và ưu tiên tính năng; hiện **chưa có bằng chứng định lượng** cho việc nhóm tuổi nào có tỷ lệ sử dụng/duy trì cao nhất.

## 9. Decision Log — Các lựa chọn đã chốt

| Mã | Quyết định | Trạng thái |
|---|---|---|
| Q1 | **Chỉ phụ huynh** được chuyển Autonomy Mode cho người dùng chưa thành niên | **Đã chốt** |
| Q2 | **Một Autonomy Mode chung** cho mọi hoạt động, vẫn tuân thủ các ngoại lệ an toàn/quyền pháp lý | **Đã chốt** |
| Q3 | Giá trị cho trẻ kết hợp **hỗ trợ thực thi + đồng hành/lắng nghe + khám phá bản thân**, ưu tiên thay đổi theo giai đoạn | **Đã chốt** |
| Q4 | **Lấy mẫu nghiên cứu từ cả ba cấp phổ thông** (tiểu học, THCS, THPT) ngay từ đầu | **Đã chốt** |
| Q5 | Trẻ được **giải thích lý do, trò chuyện với AI và đề xuất điều chỉnh** | **Đã chốt** |
| Q6 | Nhóm **CORE = Tiểu học và THCS (lớp 1–9)** | **Đã chốt** |
| Bổ sung | Phân nhóm theo **cấp học Việt Nam**, không ấn định trần tuổi cứng; phạm vi dài hạn **0–23** | **Đã chốt** |
| Bổ sung | Từ **18 tuổi**, chuyển trọng tâm sang **tư vấn**, chia sẻ với phụ huynh dựa trên quyền và thỏa thuận phù hợp | **Đã thống nhất định hướng** |

## 10. Các vấn đề còn mở — Không chặn việc hoàn tất 2.3

Những nội dung này **không yêu cầu chốt thêm ở mục 2.3**, mà chuyển sang bước nghiên cứu/thiết kế phù hợp:

1. **2.4 — User Needs & Pain Points:** Nhu cầu thực sự của từng nhóm; động lực dùng app; lý do trẻ từ chối nhiệm vụ; mong đợi của phụ huynh và trẻ đối với AI.
2. **Privacy / Permission / Safety:** Ai được xem nhật ký/tóm tắt; thông báo khẩn cấp; đồng ý và chia sẻ dữ liệu; cơ chế riêng tư sau 18 tuổi; quyền giám hộ và ngoại lệ an toàn.
3. **Feature Planning & MVP:** Chức năng cụ thể theo từng cấp học và Autonomy Mode; những gì bắt buộc có ở bản đầu; cách xử lý đề xuất/phê duyệt; phạm vi Child Journal.
4. **Child Development Framework:** Các khung nghiên cứu phát triển trẻ, tiêu chí năng lực, phương pháp đánh giá và nguồn tri thức có kiểm chứng; chưa được kết luận trong mục này.
5. **User Research Validation:** Tuyển mẫu, phỏng vấn và thử nghiệm với học sinh S1–S3 để kiểm chứng các giả thuyết hành vi/nhu cầu.

---

## 11. Kết luận chính thức của 2.3

**Đối tượng sử dụng cốt lõi của sản phẩm là học sinh lớp 1–9 tại Việt Nam, những người được AI hỗ trợ trực tiếp trong quá trình thực hiện kế hoạch phát triển, phản hồi trải nghiệm và từng bước hình thành khả năng tự chủ.** Phụ huynh giữ vai trò định hướng, giám sát và quyết định chế độ vận hành cho người chưa thành niên. Ứng dụng phục vụ một lộ trình phát triển liên tục 0–23 tuổi, có nghiên cứu trước các nhu cầu của học sinh THPT và có định hướng dịch chuyển từ quản lý sang tư vấn khi người dùng trưởng thành.

**Trạng thái cuối:** Phần **02.3 Child Segmentation hoàn tất ở cấp độ quyết định Product Blueprint**. Không còn câu hỏi bắt buộc cần xác nhận trong phần này.
