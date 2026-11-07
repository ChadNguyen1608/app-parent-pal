# Kỹ năng mềm — Tổng quan

- **Người soạn:** AI (Claude, tổng hợp từ 3 agent haiku tìm nguồn, được chủ sản phẩm cho phép) · **Trạng thái:** nháp · **Ngày tra cứu:** 7/11/2026
- **Chưa kiểm chứng độc lập.** Claude mở lại một số nguồn chính (mục 6); phần còn lại do agent tự mở và ghi.
- **Người duyệt:** chưa có. Cần chuyên gia tâm lý phát triển và giáo viên các cấp.
- **Nguồn:** `documents/knowledge/ref-kho-nguon.md`, mục 17.
- **Bản gốc:** danh sách 14 kỹ năng do chủ sản phẩm đưa (7/11/2026, "Sơ đồ tổ chức kỹ năng mềm v0.1"), viết cho người đi làm. File này giữ mã kỹ năng gốc (`SS-…`), thêm 9 kỹ năng, chuyển bài tập sang trẻ theo cấp học.

## 1. Các file

| File | Nội dung | Mã |
|---|---|---|
| `content-00-tong-quan-ky-nang-mem.md` | Tổng quan, danh sách, đối chiếu khung, quy tắc dùng (file này) | KT-60001–60004 |
| `content-01-nhom-hieu-minh-va-tu-dieu-hanh.md` | 8 kỹ năng tự điều hành, 64 bài | KT-60101–60108; HD-0001–0064 |
| `content-02-nhom-tuong-tac-va-quan-he.md` | 8 kỹ năng tương tác, 64 bài | KT-60201–60208; HD-0065–0128 |
| `content-03-nhom-tu-duy-lanh-dao-va-tham-gia.md` | 7 kỹ năng tư duy, lãnh đạo, tham gia, 52 bài | KT-60301–60307; HD-0129–0180 |
| `content-04-giao-trinh-luyen-tap-theo-cap-hoc.md` | Cách sắp xếp luyện tập theo năm, theo cấp học | KT-60401 |

## 2. Danh sách 23 kỹ năng và chỗ của chúng trong bản đồ
`KT-60001` · Nhóm chính: 5 · Nhóm phụ: 3, 4, 2 · Nhãn: `kiến_thức_nền`

Kỹ năng mềm **không phải nhóm thứ 18**. Mỗi kỹ năng xếp vào một nhóm chính có sẵn của bản đồ (`documents/knowledge/spec-ban-do-kien-thuc.md`, §3). Cột "Thay đổi so với bản gốc": **mới** là kỹ năng thêm; **chuyển** là đổi nhóm.

| Nhóm kỹ năng | Mã | Kỹ năng | Nhóm chính (phụ) | Thay đổi so với bản gốc |
|---|---|---|---|---|
| I. Hiểu mình và tự điều hành | SS-SELF-05 | Tự nhận thức | 3 (5) | mới |
| | SS-SELF-02 | Quản lý cảm xúc | 3 (5) | |
| | SS-SELF-06 | Ứng phó căng thẳng và phục hồi | 3 (5) | mới |
| | SS-SELF-07 | Tự kiềm chế và tập trung | 5 (2) | mới |
| | SS-SELF-08 | Kiên trì và đặt mục tiêu | 5 (6) | mới |
| | SS-SELF-01 | Quản lý thời gian | 5 (14) | |
| | SS-SELF-04 | Tự học | 6 (5) | |
| | SS-SELF-03 | Thích ứng và linh hoạt | 5 (2, 3) | |
| II. Tương tác và quan hệ | SS-INT-01 | Giao tiếp | 4 (2) | |
| | SS-INT-02 | Lắng nghe | 4 (7) | đổi tên từ "lắng nghe thấu cảm" |
| | SS-INT-05 | Thấu cảm | 4 (3, 13) | mới, tách khỏi lắng nghe |
| | SS-INT-03 | Làm việc nhóm và hợp tác | 4 (9) | |
| | SS-INT-04 | Đàm phán và thuyết phục | 4 (7) | |
| | SS-LEAD-03 | Giải quyết xung đột | 4 (Nền, 7) | chuyển từ nhóm lãnh đạo; giữ mã cũ |
| | SS-INT-06 | Tự khẳng định và nói "không" | 4 (Nền) | mới |
| | SS-INT-07 | Tôn trọng khác biệt | 13 (4, 16) | mới |
| III. Tư duy | SS-THINK-01 | Giải quyết vấn đề | 2 (5) | |
| | SS-THINK-02 | Tư duy phản biện | 2 (11) | |
| | SS-THINK-03 | Sáng tạo | 2 (12) | |
| | SS-THINK-04 | Ra quyết định có trách nhiệm | 13 (2) | mới |
| IV. Lãnh đạo và tham gia | SS-LEAD-01 | Lãnh đạo | 4 (16) | |
| | SS-LEAD-02 | Giao việc và ủy quyền | 14 (4) | chỉ THCS, THPT |
| | SS-LEAD-04 | Tham gia và đóng góp | 16 (9) | mới |

- Xếp nhóm theo cây quyết định của bản đồ (§9). Kỹ năng có phần an toàn (giải quyết xung đột khi có bạo lực; nói "không" với đụng chạm) có nhóm phụ **Nền**; phần an toàn luôn xét trước.
- Nhóm I–IV là cách gom để đọc, không phải nhóm của bản đồ.

## 3. Đối chiếu với các khung lớn
`KT-60002` · Nhóm chính: 5 · Nhãn: `kiến_thức_nền`

### 3.1 Các khung
- **WHO** (1997), 10 kỹ năng sống cốt lõi: decision-making; problem-solving; creative thinking; critical thinking; effective communication; interpersonal relationship skills; self-awareness; empathy; coping with stress; coping with emotions. Chỉ đọc qua nguồn thứ cấp ○ [NG-509]; bản WHO gốc [NG-581] chưa mở được.
- **CASEL** (2020), 5 năng lực: Self-Awareness, Self-Management, Social Awareness, Relationship Skills, Responsible Decision-Making [NG-293].
- **UNICEF** Global Framework on Transferable Skills (2019), 12 kỹ năng trong 4 chiều: nhận thức (creativity, critical thinking, problem-solving); công cụ (cooperation, negotiation, decision-making); cá nhân (self-management, resilience, communication); xã hội (respect for diversity, empathy, participation) [NG-531] [NG-510] [NG-582].
- **OECD SSES** (2019): 5 lĩnh vực theo mô hình tính cách Big Five: task performance, emotional regulation, engaging with others, open-mindedness, collaboration [NG-583]. Đây là mô hình tính cách, nên ánh xạ với kỹ năng hành vi chỉ gần đúng.
- **Việt Nam, chương trình GDPT 2018** (Thông tư 32/2018/TT-BGDĐT): 3 năng lực chung: tự chủ và tự học; giao tiếp và hợp tác; giải quyết vấn đề và sáng tạo ○ [NG-586] [NG-587]. Thành phần của từng năng lực chưa xác nhận.
- **Thông tư 04/2014/TT-BGDĐT** quy định **quản lý** hoạt động giáo dục kỹ năng sống (điều kiện, cấp phép, thanh tra), **không liệt kê kỹ năng** ○ [NG-549].

### 3.2 Bảng đối chiếu 23 kỹ năng

| Kỹ năng | WHO (1997) | CASEL (2020) | UNICEF (2019) | OECD SSES (2019) | GDPT 2018 |
|---|---|---|---|---|---|
| Tự nhận thức | Self-awareness | Self-Awareness | — | — | — |
| Quản lý cảm xúc | Coping with emotions | Self-Management (Regulating your feelings) | Self-management | Emotional regulation (emotional control) | — |
| Ứng phó căng thẳng và phục hồi | Coping with stress | Self-Management (Using strategies to handle stress) | Resilience | Emotional regulation (stress resistance) | — |
| Tự kiềm chế và tập trung | — | Self-Management (Staying disciplined and self-driven) (gần) | Self-management (định nghĩa gồm kiểm soát xung động) | Task performance (self-control) | — |
| Kiên trì và đặt mục tiêu | — | Self-Management (Setting individual and group goals) | — | Task performance (persistence) | — |
| Quản lý thời gian | — | Self-Management (Planning and organizing your work) (gần) | — | — | — |
| Tự học | — | — | — | — | Năng lực tự chủ và tự học |
| Thích ứng và linh hoạt | — | — | Resilience (định nghĩa: navigate successfully in changing circumstances) (gần) | — | — |
| Giao tiếp | Effective communication | Relationship Skills (Communicating clearly) | Communication | — | Năng lực giao tiếp và hợp tác |
| Lắng nghe | — | — | — | — | — |
| Thấu cảm | Empathy | Social Awareness (Feeling and showing empathy and compassion) | Empathy | Collaboration (empathy) | — |
| Làm việc nhóm | Interpersonal relationship skills (gần) | Relationship Skills (Collaborating and solving problems as a team) | Cooperation | Collaboration (co-operation) | Năng lực giao tiếp và hợp tác (hợp tác) |
| Đàm phán và thuyết phục | — | — | Negotiation | — | — |
| Giải quyết xung đột | — | Relationship Skills (Resolving conflicts constructively) | — | — | — |
| Tự khẳng định và nói "không" | — | Relationship Skills (Resisting negative peer pressure; Standing up for others' rights) (gần) | — | Engaging with others (assertiveness) (gần) | — |
| Tôn trọng khác biệt | — | Relationship Skills (Showing cultural competence) (gần) | Respect for diversity | Open-mindedness (tolerance) (gần) | — |
| Giải quyết vấn đề | Problem solving | Responsible Decision-Making (Finding solutions to personal and social problems) | Problem-solving | — | Năng lực giải quyết vấn đề và sáng tạo |
| Tư duy phản biện | Critical thinking | Responsible Decision-Making (Reaching reasoned judgments based on evidence) | Critical thinking | — | — |
| Sáng tạo | Creative thinking | — | Creativity | Open-mindedness (creativity) | Năng lực giải quyết vấn đề và sáng tạo |
| Ra quyết định có trách nhiệm | Decision making | Responsible Decision-Making | Decision-making | — | — |
| Lãnh đạo | — | Relationship Skills (Leading within groups) | — | — | — |
| Giao việc và ủy quyền | — | — | — | — | — |
| Tham gia và đóng góp | — | Responsible Decision-Making (Assessing impacts at personal, community, and institutional levels) (gần) | Participation | — | — |

Ghi chú về bảng:
- Các ô CASEL ghi tên năng lực và tiểu kỹ năng trong ngoặc, vì các tiểu kỹ năng là thuật ngữ của chính khung.
- Ô GDPT chỉ ghi tên năng lực chung. Thành phần chưa xác nhận.
- "Lắng nghe" không có tên tương đương trong 5 khung. CASEL có tiểu kỹ năng "Considering others' viewpoints" nhưng không đủ gần để ghi.

### 3.3 Điểm cần biết khi đối chiếu

1. **Không khung nào có "Giao việc và ủy quyền".** Đây là kỹ năng thực hành nhất trong danh sách nhưng không có tên trong 5 khung đã đối chiếu.
2. **"Lãnh đạo" chỉ xuất hiện như một tiểu kỹ năng của CASEL** ("Leading within groups"). WHO, UNICEF, OECD và GDPT không có.
3. **Tư duy phản biện không có tên riêng trong GDPT 2018 ở mức năng lực chung.** Ba năng lực chung không có từ này. Cách chương trình đưa tư duy phản biện vào các môn học chưa xác nhận.
4. **OECD SSES là mô hình tính cách (Big Five).** Các kỹ năng như giao tiếp, giải quyết vấn đề, tư duy phản biện không có trong khung này. Ánh xạ chỉ là gần đúng.
5. **Tham gia (participation) nằm trong UNICEF và chỉ có gần đúng trong CASEL.** Đây là kỹ năng mà các khung học thuật ít nhấn mạnh.

### 3.4 Có trong khung nhưng chưa thành kỹ năng riêng

| Kỹ năng | Khung có | Ghi chú |
|---|---|---|
| Tự tin vào khả năng bản thân (belief in ability) | CASEL (Self-Awareness); OECD (self-efficacy, chỉ số bổ sung) | Liên quan đến lòng tự trọng. Pal không chấm điểm tự tin (theo quy tắc sản phẩm). |
| Tò mò (curiosity) | OECD (Open-mindedness); CASEL (Responsible Decision-Making) | Gắn chặt với tư duy phản biện và sáng tạo. |
| Lạc quan (optimism) | OECD (Emotional regulation) | Có thể liên quan đến ứng phó căng thẳng. |
| Tin cậy (trust) | OECD (Collaboration) | Nền tảng của làm việc nhóm. |
| Hành động chính trực (acting honestly and with integrity) | CASEL (Self-Awareness) | Nằm giữa tự nhận thức và ra quyết định có đạo đức. |
| Chủ động (taking initiative) | CASEL (Self-Management) | Nền tảng cho lãnh đạo ở trẻ nhỏ. |
| Nhận ra chuẩn mực xã hội, kể cả bất công | CASEL (Social Awareness) | Quan trọng với tham gia và tôn trọng khác biệt. |
| Biết thông tin trực tuyến và đánh giá nguồn tin | UNESCO MIL (2011) (không nằm trong 5 khung chính) | Quan trọng cho THCS và THPT. Không có tên trong 5 khung. |
| Chức năng điều hành (working memory, mental flexibility, self-control) | Harvard CDC (InBrief) | Nền tảng sinh học của tự kiềm chế, giải quyết vấn đề và linh hoạt. |

### 3.5 Nhận xét về danh sách gốc 14 kỹ năng
- Định nghĩa của 14 kỹ năng gốc nhìn chung đúng. Các lưu ý trong bản gốc đúng: quản lý cảm xúc không đồng nghĩa với EQ; "5 Whys" không cho nguyên nhân chắc chắn; xung đột có bạo lực không dùng hòa giải thông thường; tần suất bài tập chưa được kiểm chứng.
- Bản gốc **thiếu** 7 kỹ năng có trong ít nhất một khung lớn: tự nhận thức, thấu cảm, ra quyết định, ứng phó căng thẳng, tôn trọng khác biệt, kiên trì và tự kiềm chế, tham gia. "Nói không" được thêm vì gắn với lớp an toàn của Parent-Pal.
- Bài tập trong bản gốc viết cho người đi làm (email, buổi rút kinh nghiệm cuối dự án, ủy quyền). Các file 01–03 thay bằng bài cho trẻ theo cấp học.
- "Tiêu chí quan sát" và rubric chia cấp độ trong bản gốc dễ thành chấm điểm. Parent-Pal chỉ mô tả hành vi, so con với chính con.


## 4. Bằng chứng: mức chắc chắn
`KT-60003` · Nhóm chính: 5 · Nhóm phụ: 3, 4 · Nhãn: `kiến_thức_nền`

| Điều | Mức chắc chắn | Nguồn |
|---|---|---|
| Chương trình kỹ năng cảm xúc – xã hội ở trường cải thiện kỹ năng, hành vi, học tập (ES chung 0,30; học tập +11 điểm phần trăm vị) | Cao (phân tích gộp 213 chương trình) | [NG-519] [NG-590] |
| Lợi ích còn sau 6 tháng đến 18 năm | Vừa (82 chương trình; phần học tập chỉ 8 nghiên cứu) | [NG-592] |
| Đọc truyện đối thoại tăng vốn từ diễn đạt ở trẻ nhỏ (d = 0,59) | Vừa (ít nghiên cứu) | [NG-536] |
| Đào tạo sáng tạo có hiệu quả (Δ = 0,68; nhóm giải quyết vấn đề Δ = 0,84) | Vừa (70 nghiên cứu, nhiều nghiên cứu nhỏ) | [NG-565] |
| Dạy tư duy phản biện có hiệu quả nhỏ (g = 0,30); tốt hơn khi gắn với nội dung cụ thể và kết hợp ứng dụng, đối thoại, người hướng dẫn | Vừa (341 nghiên cứu chất lượng cao) | [NG-566] |
| Chương trình giảm định kiến có hiệu quả thấp đến vừa (d = 0,30); tốt nhất khi có tiếp xúc trực tiếp và tập nhìn từ góc người khác | Vừa | [NG-543] |
| Luyện chức năng điều hành cần lặp lại, tăng độ khó dần; chuyển giao thường hẹp; trò chơi máy tính chuyển giao hẹp | Vừa đến cao | [NG-520] [NG-523] |
| Giáo dục phòng xâm hại ở trường: trẻ kể với người lớn nhiều hơn, không thấy tác hại rõ; chưa chứng minh giảm xâm hại | Vừa | [NG-556] |
| Tư duy tăng trưởng: can thiệp có hiệu quả rất nhỏ (d = 0,08) | Cao (phân tích gộp 29 nghiên cứu) | [NG-527] [NG-268] |
| "Grit" không phải yếu tố dự báo thành công mạnh; gần như trùng với tính tận tâm | Vừa (đọc qua trang tin ○) | [NG-528] |
| Lắng nghe, thấu cảm, lãnh đạo, giao việc, tham gia của trẻ ở gia đình | **Thấp**: chủ yếu là khuyến nghị thực hành, chưa có thử nghiệm tại nhà | Mục D của từng kỹ năng |

**Điều Pal không nói:**
- Không hứa "tập kỹ năng này thì con sẽ thành công, giỏi hơn". Không nói trò chơi máy tính "tăng trí thông minh".
- Không nói "dạy con tư duy tăng trưởng là đủ" (hiệu quả rất nhỏ, tùy bối cảnh).
- Không gọi bài là "chương trình đã được chứng minh" khi bài chỉ là `tổ chức khuyến nghị` hay `suy từ lý thuyết`. Phần lớn chương trình có thử nghiệm là chương trình ở lớp học; chuyển sang gia đình là `suy từ lý thuyết`.

## 5. Cách Pal dùng
`KT-60004` · Nhóm chính: 7 · Nhóm phụ: 5 · Nhãn: `kiến_thức_nền`

- **Đi theo giáo trình**, không đưa cả 23 kỹ năng: `content-04-giao-trinh-luyen-tap-theo-cap-hoc.md`.
- **Nghe trước:** phụ huynh kể chuyện cụ thể thì Pal nghe, hỏi rõ, rồi mới gợi ý kỹ năng và 1–2 bài.
- **Chọn sẵn một bài** cho phụ huynh, chỉ đưa bài khác khi được hỏi (`documents/pal/guide-cach-pal-tra-loi.md`).
- **Nói mức bằng chứng** của bài bằng một câu.
- **Không chấm điểm** kỹ năng, không xếp mức, không so với trẻ khác. Không chấm điểm tự tin, lòng tự trọng (KT-40104).
- **4 nhu cầu tâm lý:** mỗi bài nuôi nhu cầu nào (an toàn, gắn kết, năng lực, tự chủ); bài nào ép buộc thì làm tổn thương nhu cầu tự chủ.
- **An toàn trước:** bắt nạt, bạo lực, xâm hại thì không hòa giải, không "tập kỹ năng"; lớp an toàn đưa **111**, **113**, **115**.
- **Riêng tư:** nhật ký cảm xúc, nhật ký của con là của con. Cha mẹ không đọc khi con không cho; Pal không lưu nội dung nhật ký của con.

## 6. Claude đã mở lại để kiểm
| Nhận định | Kết quả |
|---|---|
| Sisk 2018: phân tích gộp 2, 29 nghiên cứu (43 hệ số), d = 0,08 | Khớp [NG-527] |
| Abrami 2015: 341 nghiên cứu chất lượng cao, g = 0,30; gắn nội dung g = 0,57; kết hợp g = 0,57 | Khớp [NG-566] |
| Duckworth 2013: 77 học sinh lớp 5, hiệu quả ở quý 3, quý 4 không còn ý nghĩa | Khớp [NG-526] |
| Diamond 2013: linh hoạt đổi từng lượt từ 7–9 tuổi; linh hoạt dựa trên kiềm chế và trí nhớ làm việc | Khớp [NG-523] |
| Durlak 2011, EEF, Taylor 2017, Harvard, Jones 2017, Lally 2010, Gollwitzer 2006 (dùng trong giáo trình) | Claude tự tìm và mở (`content-04`, mục 1) |

## 7. Chưa có nội dung có nguồn
- Biểu hiện theo tuổi (mục B) còn thiếu nguồn ở nhiều ô, nhất là lắng nghe, thấu cảm, làm việc nhóm, lãnh đạo ở TH, THCS, THPT; quản lý thời gian, tự học, kiên trì ở MN.
- Chưa đọc được bản gốc WHO 1997, toàn văn Thông tư 32/2018 (thành phần năng lực chung), chương trình giáo dục mầm non bản tiếng Việt.
- Chưa có thử nghiệm nào ở Việt Nam trong các nguồn đã tìm.
- Chưa có cách quan sát tiến bộ thống nhất (không chấm điểm) cho từng kỹ năng.
