# Spike E1: xếp lịch tuần tất định (không LLM)

- **Ngày:** 14/11/2026
- **Người soạn:** AI, chưa kiểm chứng độc lập.
- **Câu hỏi:** Có xếp được lịch tuần của con một cách tất định (không gọi LLM, "E1"), với chất lượng gần bản thử hiện tại (bản thử dùng prompt LLM để sắp thứ tự trong ngày) không?
- **Nguồn đọc (chỉ đọc):** `documents/pal/spec-quy-tac-lap-lich.md`, `spec-quy-thoi-gian-va-tab-cua-con.md`, `ref-tai-va-phuc-hoi-trong-ngay.md`, `prototype/index.html`, `documents/app-design-document/Feature_3_2_L4_P6_Balanced_Planning_Owner_Decision_Log_APPROVED.md`.
- **Giới hạn:** không gọi được LLM. Mọi so sánh với bản thử đều là **so sánh định tính**, dựa trên việc đọc prompt `RULES`, `ACT_RULES`, `LIFE_RULES`, `OUTPUT_FORMAT` (index.html dòng 455–574). Hồ sơ đều là dữ liệu tổng hợp, không có dữ liệu thật của trẻ.

## 1. Kết luận

**Kết luận: FEASIBLE cho lõi xếp lịch. Cả tính năng vẫn là mô hình lai (E1 + LLM).**

- Phần "xếp giờ, sắp thứ tự, giữ sàn, khớp quỹ" làm tất định được hoàn toàn. Trên 8 hồ sơ, bộ xếp E1:
  - giữ đủ sàn cứng ở cả 8/8 hồ sơ, tính trên mọi ngày nó xếp được;
  - qua bộ kiểm tra `checkDayK` port 1:1 từ bản thử, với **0 lỗi** ở mọi ngày không có đánh đổi;
  - qua thêm 13 kiểm tra bổ sung, cũng với **0 lỗi**;
  - cho cùng một input thì ra cùng một output (8/8);
  - chạy mất **0,3–8,4 ms mỗi tuần**, trung bình 2,05 ms.
- Ngày nào không xếp được mà vẫn giữ sàn thì E1 **không âm thầm bỏ** gì. Nó trả về danh sách đánh đổi kèm phương án cân bằng đã tính sẵn để bố mẹ chọn.
- **Vẫn cần LLM** cho ba việc:
  - nghe lời kể tự nhiên và đổi thành dữ liệu có cấu trúc (hồ sơ, thẻ hoạt động, giai đoạn tạm thời, "lâu dài hay chỉ tuần này");
  - lời giải thích và lời cảnh báo bằng văn nói;
  - chỉnh lịch theo tính cách và sức khỏe ghi trong hồ sơ (B5). Phần này cũng có thể làm bằng bảng ánh xạ.
- **Khoảng cách chất lượng chính so với bản thử:**
  - nội dung `viec` còn chung chung;
  - chưa cá nhân hóa theo hồ sơ (B5);
  - chưa có điều chỉnh theo mùa (I1–I2);
  - chưa giảm số khối cho tuổi 11–15 (G8).

  Cả bốn việc này đều có thể bổ sung mà không cần LLM chạm vào giờ giấc.

## 2. Đã làm gì

Mã nằm trong `app-design-document/progress/spike-e1-scheduler/` (`src/`, kết quả ở `out/`; chạy `node src/run.js`), khoảng 900 dòng JavaScript, chạy trên Node 22, không cài gói nào.

| File | Nội dung |
|---|---|
| `src/rules.js` → `out/rules.json` | Bảng 82 quy tắc: mã, loại, có tất định không, mức căn cứ, nơi xử lý |
| `src/scheduler.js` | Bộ xếp lịch E1. `PARAMS` ghi nguồn của từng con số |
| `src/validators.js` | Port thuần (không DOM) của `checkDayK`, `groupOf`, `actualDay`, `fixedDay`, `restRange`, `judge`, cộng 13 kiểm tra bổ sung |
| `src/phase.js` | Kiểm tra giai đoạn tạm thời theo J2/J4/J5 và P6-BP-OD-01/02 |
| `src/profiles.js` | 8 hồ sơ tổng hợp |
| `src/run.js` | Chạy tất cả, đo thời gian, ghi `out/` |
| `src/mutation-test.js` → `out/mutation-test.txt` | Cố tình làm hỏng một lịch hợp lệ để chứng minh bộ kiểm tra không "đạt rỗng" |
| `out/weeks.txt` | Lịch 7 ngày của từng hồ sơ, kèm cảnh báo và đánh đổi, dạng dễ đọc |
| `out/P1.json` … `out/P8.json` | Hồ sơ, kết quả, `plan` theo đúng dạng dữ liệu bản thử |

Chạy lại: `node src/run.js` rồi `node src/mutation-test.js`.

### 2.1 Dạng dữ liệu đầu ra

`plan = {tong_quan, ngay: {T2..CN: [khối]}, ngoai_le: {}, giai_doan}`. Mỗi khối có đúng các trường của `OUTPUT_FORMAT` (index.html dòng 568): `bat_dau`, `ket_thuc`, `khoi`, `viec[]`, `xac_nhan`, `tai`, `nhom`, `the_thao`, `man_hinh`, `trang_thai`, `ghi_chu`.

Khối hoạt động có thêm `act_id`, `act_start`, `act_end` để kiểm được rằng không hoạt động nào bị bỏ. Hàm `normBlocks` của bản thử (dòng 414) sẽ bỏ qua các trường thừa này. Vì vậy app thật nên giữ chúng trong schema.

### 2.2 Thuật toán

Thuật toán gồm neo mốc cố định, xếp tham lam theo thứ tự quy tắc, rồi đi theo một thang sửa cố định.

1. **Neo giờ dậy và giờ ngủ cả tuần** (G1, G5, C1):
   - Ngày đi học: giờ dậy = min(giờ dậy mong muốn, giờ phải đi − 30′ khối sáng).
   - Giờ tắt đèn = giờ dậy hôm sau − quỹ ngủ, không bao giờ dưới sàn C1.
   - Cuối tuần giữ giờ tắt đèn của ngày thường và dậy theo quỹ ngủ (G8). Đêm thứ Sáu được thêm tối đa 30′, vẫn trong dung sai D4.
   - Nếu có hoạt động sớm thì dậy sớm hơn.
2. **Đặt khối cố định:**
   - buổi sáng (vận động 15–25′ nếu đủ chỗ; ăn sáng sát giờ đi để rút ngắn khoảng cách tới bữa trưa);
   - đi học, các đoạn ở trường (tách theo bữa trưa và bữa phụ ở trường), về nhà;
   - hoạt động gồm cả đi lại;
   - về nhà: 10′ ghi việc và hỏi thăm, rồi phục hồi (G3, C2);
   - các bữa ở nhà;
   - đuôi buổi tối: vệ sinh → đọc 15′ và nhật ký → tắt đèn (G4, F3).
3. **Bữa phụ** (H2, H3): khi hai lần ăn cách nhau quá mốc (5 giờ; trẻ 6 tuổi 4 giờ), E1 đặt bữa phụ sao cho cách bữa chính kế tiếp khoảng 90′. Nếu lúc đó con không ở nhà (đang ở trường hoặc trên đường) thì E1 tạo đánh đổi cho bố mẹ.
4. **Phiên học ở nhà** (D5, F4, C3, H1, G9):
   - chia theo độ dài phiên tối đa của lớp;
   - nghỉ 5′ trước và sau khối tải cao;
   - phiên tải cao cách bữa chính ≥15′;
   - cuối tuần học buổi sáng.
5. **Soạn cặp ngay sau ôn bài** (G4), tối Chủ Nhật soạn đồ cho thứ Hai. Sau đó đặt **màn hình** sao cho kết thúc ≥60′ trước tắt đèn (C6, F5).
6. **Lấp chỗ trống** bằng chơi tự do. Cuối tuần, khoảng trống dài nhất ghi là vận động vui dài (G9).
7. **Thang sửa** (thứ tự cố định), dừng ở bậc đầu tiên xếp đủ:
   1. Giữ quỹ, phục hồi 30′.
   2. Phục hồi 20′; học ở nhà giảm 15′ rồi 30′ (vẫn trong ±30′ của D4).
   3. Lùi giờ tắt đèn 15′ rồi 30′, chỉ khi giờ ngủ vẫn ≥ max(sàn C1, quỹ − 30′) (G7, D4).
   4. Phục hồi 15′ (sàn C2).
   5. **Ngoài dung sai:** học ở nhà dưới quỹ − 30′. Đánh dấu "cần bố mẹ chọn" (A1, spec C).
   6. Vẫn không được: thử bỏ từng hoạt động của ngày. Phương án đầu tiên giữ đủ sàn được hiển thị là **"Phương án đề xuất, chờ bố mẹ chọn"**. Hoạt động bị bỏ được ghi vào `tradeoffs`, không bao giờ mất âm thầm (P6-BP-OD-02).
8. **Khớp quỹ sinh hoạt** (D4): nếu tổng các khối sinh hoạt vượt quỹ + 30′ thì bớt đều mỗi khối bữa ở nhà và khối vệ sinh tối 5′ một lần (xem blocker B-4).
9. **Nhãn cân bằng** theo P6-BP-OD-03:
   - gia đình dùng quỹ mặc định [MĐ] chưa được thẩm định → `UNKNOWN`;
   - gia đình có bar đã duyệt → `WITHIN_FAMILY_BAR` hoặc `OUTSIDE_FAMILY_BAR`.

   E1 không bao giờ gắn nhãn `BALANCED`.

Không có giới hạn thời gian mới nào được đặt ra. Mọi con số đều lấy từ spec và có mức căn cứ trong `PARAMS` (`out/params.json`). Có ba con số là **thời lượng khối** suy ra, không phải giới hạn. Chúng được ghi rõ ở blocker B-4, B-7, B-8.

## 3. Bảng quy tắc: phần nào tất định

Chi tiết từng quy tắc ở `out/rules.json` (82 mục, gồm cả P6-OD-01/02/03).

| Loại | Tất định hoàn toàn | Một phần | Không |
|---|---|---|---|
| hard (sàn, an toàn lịch) | 14 | 2 (C7, J2) | 1 (H6) |
| ordering (thứ tự trong ngày) | 14 | 0 | 0 |
| budget (quỹ, ngưỡng màu) | 12 | 0 | 0 |
| soft (mặc định nên làm) | 4 | 5 (F6, G7, G8, I2, B5) | 0 |
| n/a (hội thoại, dữ liệu, UI) | 14 | 11 | 5 |
| **Tổng** | **58** | **18** | **6** |

**Tất định hoàn toàn**, và E1 đã làm:
- sàn: C1–C6, phần bữa ăn và thời gian nghỉ của C7;
- quỹ: D1–D5 và mọi ngưỡng màu;
- thứ tự: F2–F5, F7, G1, G3, G4, G5, G9, H1–H3;
- hoạt động: E1, E4;
- sửa kế hoạch: K1, K2;
- giai đoạn tạm thời: J3–J6, P6-OD-01/02/03;
- 7 mã của mục O.

**Một phần:**

| Quy tắc | Phần tất định | Phần còn lại |
|---|---|---|
| C7 | Không bỏ bữa, không bỏ nghỉ | "Không dùng đồ ăn để thưởng hay phạt, không phạt thể chất" là lời nói, cần lọc nội dung |
| J2 | Ngày kết thúc, mốc xem lại | Nhận biết lý do chính đáng (J1) |
| G7 | Bữa phụ chắc, lùi giờ ngủ | Câu hỏi "có muốn bớt học ở nhà không" |
| G8 | Giữ giờ dậy cuối tuần | "Ít khối hơn" không có con số |
| B5 | Cần bảng ánh xạ hồ sơ → tham số | Trích hồ sơ từ lời kể tự do |
| E2, E6, K3 | Chống trùng, kiểm trường thiếu | Phân loại từ lời kể |
| F1 | Bảng ánh xạ loại khối → mức xác nhận | — |

**Không tất định:**
- A3, A4: sinh lời nói;
- B2: hội thoại thu thập;
- J1: nhận biết lý do;
- H6: hiểu chỉ định bác sĩ do bố mẹ kể lại;
- M1–M3: chấm bài qua ảnh, cần mô hình thị giác.

## 4. Kết quả 8 hồ sơ

Thời gian là trung bình của 200 lần chạy cả tuần.

| Hồ sơ | Trạng thái tuần | Ngày | Sàn | Lỗi `checkDayK` | Lỗi bổ sung | Đánh đổi | ms/tuần |
|---|---|---|---|---|---|---|---|
| P1 Lớp 1, bán trú, quỹ mặc định | OK | 7 OK | đạt | 0 | 0 | 0 | 0,48 |
| P2 Lớp 3, 3 lớp ngoài giờ | Điều chỉnh trong dung sai | 5 OK, 2 điều chỉnh | đạt | 0 | 0 | 0 | 0,88 |
| P3 Lớp 5, bán trú cả ngày, bar gia đình đã duyệt | OK, `WITHIN_FAMILY_BAR` | 7 OK | đạt | 0 | 0 | 0 | 0,50 |
| P4 Lớp 6, học 1 buổi, 2 hoạt động | Cần bố mẹ chọn | 2 OK, 5 cần chọn | đạt | 5 (`an_xa`, đã thành đánh đổi) | 0 | 5 bữa xa | 1,10 |
| P5 Lớp 8, mùa thi, học T7 | Cần bố mẹ chọn | 1 OK, 6 cần chọn | đạt | 6 (`an_xa`, đã thành đánh đổi) | 0 | 6 bữa xa; giai đoạn bị từ chối | 2,13 |
| P6 Lớp 4, quá tải | **Xung đột** | 1 OK, 1 cần chọn, 5 xung đột | đạt (ở phương án đề xuất) | 0 | 0 | 5 không xếp được, 2 Karate sau giờ ngủ, 1 trùng giờ | 8,44 |
| P7 Lớp 4, cuối tuần dày | OK | 7 OK | đạt | 0 | 0 | 0 | 0,31 |
| P8 Lớp 7, đi lại 60′ mỗi chiều | Cần bố mẹ chọn | 1 OK, 1 điều chỉnh, 5 cần chọn | đạt | 10 (`an_xa`, đã thành đánh đổi) | 0 | 10 bữa xa | 2,55 |

**Mọi lỗi `checkDayK` còn lại đều là `an_xa`**, và mỗi lỗi đã có đánh đổi tương ứng. Đây là các khoảng cách bữa nằm trọn trong giờ con ở trường hoặc trên đường, nên lịch ở nhà không sửa được:
- P4, P5: từ ăn sáng 6:15 đến ăn trưa sau 11:45 (học 1 buổi, trường không có bữa phụ);
- P8: từ bữa trưa ở trường 11:00 đến lúc về nhà 17:40.

E1 đưa ba lựa chọn: mang bữa phụ ăn giờ ra chơi hoặc trên đường; hỏi trường có bữa phụ không; giữ như hiện tại (bố mẹ xác nhận một lần).

**Xử lý ca không khả thi (P6):**
- Thứ Hai đến thứ Sáu học trường đến 17:00, rồi Tiếng Anh 17:45–19:45. Khi đó không còn đủ chỗ cho phục hồi ≥15′, ăn tối, vệ sinh và giờ ngủ ≥9 giờ. E1 không xếp phương án phạm sàn. Lịch hiển thị là phương án "bỏ hoặc dời Tiếng Anh ngày này". Phương án này xếp được 75′ học ở nhà (quỹ 90′), có khối mở đầu "Phương án đề xuất, chờ bố mẹ chọn".
- Karate thứ Hai và thứ Tư kết thúc 21:00, sau giờ tắt đèn 20:45. Lùi tối đa 30′ vẫn không đủ. E1 báo: dời buổi tập, hoặc bỏ buổi này; không có phương án cắt giờ ngủ (C1).
- Thứ Bảy, Vẽ trùng giờ Toán tư duy. E1 báo trùng giờ, các hoạt động khác vẫn được xếp.
- Bảng quỹ (`judge` port) cùng lúc báo đỏ: học thêm ngày thường 230′ và tổng các nhóm vượt 24 giờ 129′. Cách này khớp hành vi bảng quỹ của bản thử.

**Giai đoạn tạm thời (P5):** giai đoạn "Ôn thi học kỳ I" bắt đầu 30/11 bị **từ chối**, vì chỉ cách đợt "on_thi" trước (kết thúc 25/11) 4 ngày trống, cần ≥7 ngày. E1 gợi ý ngày bắt đầu sớm nhất là 03/12. Ba ca thử thêm:

| Ca thử | Kết quả | Quy tắc |
|---|---|---|
| Đổi mục đích sang "thi đấu" để nối liền từ 26/11 | Từ chối: nới `tong_gio_hoc` liên tục quá 60 ngày | OD-01 |
| Xin nới giờ ngủ | Từ chối: protected_hard, không có đường tắt | J4, OD-02 |
| Con đề xuất | Chờ bố mẹ xác nhận | J5 |

Quỹ học ở nhà 150′ do bố mẹ đặt vẫn được xếp đủ mà không cần nới `tong_gio_hoc`. Lý do: trong E1, cờ này chỉ có tác dụng khi bố mẹ muốn vượt chính quỹ của mình.

**Thử đột biến** (`out/mutation-test.txt`): cố tình làm hỏng lịch P3, bộ kiểm tra bắt được **10/11** lỗi. Ca bỏ lọt là một giới hạn thật của `checkDayK` (xem B-11c).

**Thời gian chạy:**
- 0,3–8,4 ms mỗi tuần. P6 chậm nhất vì phải thử nhiều bậc sửa và nhiều phương án bỏ hoạt động.
- Xếp lại cả tuần sau mỗi lần sửa là rẻ.
- So với bản thử: mỗi lần xếp lịch là một lần gọi LLM, thường mất vài giây. Con số vài giây là ước lượng, spike không đo.

## 5. Phần vẫn cần LLM

| Việc | Vì sao | Gợi ý |
|---|---|---|
| Thu thập từ lời kể (B2, B3, E2, E3, K3, J1) | Lời tự nhiên, không có cấu trúc | LLM trích ra JSON theo schema; app kiểm trường thiếu, trùng, ngày giờ; thiếu thì hỏi 1 câu |
| Lời trả lời, giải thích, cảnh báo (A2, A3, A6) | Văn nói ≤3 câu, có mức căn cứ, không gắn nhãn tính cách | LLM diễn đạt từ `tradeoffs` và `notes` mà E1 trả về; **LLM không được sửa giờ**. Có thể dùng mẫu câu làm phương án dự phòng |
| Cá nhân hóa theo hồ sơ (B5) | Hồ sơ là chữ tự do (hen, dễ nản, cần yên tĩnh) | Bước 1: LLM gắn cờ có cấu trúc (ví dụ `nhanh_met`, `de_nan`, `can_yen_tinh`). Bước 2: bảng ánh xạ tất định từ cờ sang tham số (phục hồi 30′, mở đầu bằng việc dễ, đổi nội dung khối phục hồi, nhắc trước 5′ khi chuyển khối) |
| Nội dung `viec` cụ thể theo thời khóa biểu và sổ việc | Cần đọc thời khóa biểu, ảnh sổ liên lạc | LLM điền danh sách việc vào khối đã có giờ |
| Chỉ định bác sĩ (H6), ảnh bài làm (M) | An toàn, thị giác | LLM + người duyệt; ngoài phạm vi E1 |

Lớp an toàn (N1, N2) chạy **trước** cả hai phần, như CLAUDE.md quy định.

## 6. Khoảng cách chất lượng so với bản thử (định tính)

So sánh bằng cách đọc prompt (index.html dòng 455–574). Không chạy được LLM nên không đo chất lượng thật.

**E1 hơn bản thử:**
- **Đảm bảo sàn ngay khi xếp.** Prompt yêu cầu LLM "tự sửa lỗi thứ tự", nhưng bản thử chỉ chạy `checkDayK` sau khi xếp để cảnh báo, không sửa (dòng 1141). E1 không bao giờ cho ra lịch phạm sàn.
- **Khớp quỹ ±30′ có kiểm.** Prompt dòng 506 chỉ dặn. E1 đo bằng `actualDay` và kiểm mọi nhóm.
- **Ca không khả thi có phương án tính sẵn.** Theo prompt dòng 491, LLM trả `"ngay": []` cùng 1–2 phương án bằng lời. E1 tính sẵn lịch cho từng phương án.
- **Tất định:** cùng input thì cùng output. Đây là nền cho K2 (chỉ tô đỏ khối đổi) và cho kiểm thử hồi quy.

**E1 kém bản thử:**
1. **Chưa cá nhân hóa (B5).** Lịch của trẻ nhanh mệt, dễ nản, hen… giống hệt lịch của trẻ khác.
2. **`viec` chung chung.** Ví dụ "Việc cần tập trung nhất" thay cho "Toán: bài 3 trang 59". Chưa ghi đồng phục, đồ cần mang theo đúng ngày (prompt dòng 528).
3. **Chưa có mùa và vùng** (I1–I2): tắm tối dài thêm 10–15′ mùa lạnh miền Bắc, phương án trong nhà mùa mưa. Phần này tất định, chỉ là chưa làm.
4. **Tuổi 11–15 (G8):** chưa gộp khối, chưa "để con tự sắp xếp trong khối". Spec cũng không có con số cho "ít khối hơn".
5. **Cuối tuần:** prompt dòng 529 có "buổi ôn tuần". E1 chỉ chia phiên học buổi sáng.
6. **Các mảnh lẻ do lưới 5′:** có khối "Nghỉ ngắn" 5′ chen giữa, có khối màn hình chỉ 5′ (P8 thứ Sáu). LLM thường làm tròn tự nhiên hơn.
7. **Sửa một chỗ có thể dời các khối bên cạnh.** Do xếp tham lam, một thay đổi nhỏ có thể dời cả các khối không liên quan. Prompt yêu cầu giữ nguyên từng chữ các khối không đổi (K2). E1 cần thêm chế độ "ghim khối cũ" khi sửa.
8. **G7:** E1 chỉ ghi chú "cần hỏi bố mẹ", không hỏi được.

## 7. Blocker và mâu thuẫn ghi nhận

Các mục dưới không chặn spike. Mỗi mục ghi cách đã xử lý tạm.

| Mã | Vấn đề | Vị trí | Xử lý tạm |
|---|---|---|---|
| B-1 | Nghỉ giữa hai khối học: C3 ghi 3–5′, F4 ghi 5–10′ | spec dòng 48 và 105; ref dòng 147 (3–5′) | Dùng 5′, thỏa cả hai |
| B-2 | Ngày có học thêm tối: spec G7 "hỏi bố mẹ có muốn bớt học ở nhà", prompt ghi "bỏ ôn bài ở nhà" | spec dòng 120; index.html dòng 519 | Theo spec (nguồn chuẩn): giữ quỹ, ghi chú cần hỏi, chỉ giảm khi không vừa |
| B-3 | Màn hình: prompt cố định 30′ hoặc 60′ theo tuổi; spec dùng quỹ do bố mẹ nhập | index.html dòng 520; spec D dòng 85 | Theo quỹ |
| B-4 | Thời lượng từng khối sinh hoạt không có trong spec. Ghi chú ngưỡng (sáng 30′ + tối 30′ + tắm 30′) cộng G4 (đọc 15′), G3 (10′), soạn cặp, ăn trưa ở nhà thì vượt quỹ mặc định cuối tuần 2h (+30′) | spec dòng 74, 83 | Bớt đều 5′ mỗi khối bữa ở nhà và vệ sinh tối để vào ±30′ (phải bớt ở 8 ngày cuối tuần, tính trên cả 8 hồ sơ). Cần chủ sản phẩm chốt thời lượng chuẩn từng khối |
| B-5 | Giờ ngủ đêm thứ Sáu và Chủ Nhật thuộc cột "ngày đi học" hay "cuối tuần": spec không nói | spec D1 dòng 60; `actualDay` index.html dòng 739–741 gán theo ngày bắt đầu đêm | Theo bản thử (ngày bắt đầu đêm). Đêm thứ Sáu +≤30′ để thứ Bảy dậy muộn hơn một chút |
| B-6 | C2 "phục hồi trước việc học": học thêm ngay sau giờ trường có tính là "việc học" không? `checkDayK` chỉ xét học ở nhà (`NOT_HOME` loại "học thêm") | spec dòng 47; index.html dòng 580, 599–603 | E1 luôn đặt ghi việc + phục hồi ngay khi về (hoặc sau hoạt động). Vì thế P6 bị xung đột. Cần chốt cách hiểu |
| B-7 | Thời lượng bữa phụ không có trong spec | H2–H4, spec dòng 130–132 | 10′, ngang khối G3. Là thời lượng khối, không phải giới hạn |
| B-8 | Phiên học ngắn nhất không có trong spec | F4 | 20′, lấy cận dưới của lớp 1–3 trong F4 |
| B-9 | Spec J2 cho giai đoạn dài hơn 6 tuần (xem lại mỗi 2 tuần), không đặt trần. P6-OD-01 đặt trần 60 ngày liên tục cho cùng constraint | spec dòng 151; Decision Log dòng 13 | Áp cả hai: 43–60 ngày thì có mốc xem lại; trên 60 ngày liên tục thì từ chối. Cần đưa OD-01 vào spec |
| B-10 | P6-OD-03 cấm nhãn `VALID/BALANCED` khi chưa kiểm chứng. Chú thích bảng quỹ của bản thử ghi "cân bằng" cho màu xanh, mà các ngưỡng đều [MĐ] | index.html dòng 846; Decision Log dòng 15 | E1 trả `UNKNOWN` khi dùng mặc định. UI app thật nên đổi chữ |
| B-11 | Điểm yếu của `checkDayK` khi port 1:1 (xem dưới) | index.html dòng 579–632 | Đặt tên khối E1 cho khớp regex; đề xuất dùng kiểu khối có cấu trúc |
| B-12 | `restRange` cộng sinh_hoat × 0,25, coi như một nửa sinh hoạt là bữa ăn, để xấp xỉ D3 | index.html dòng 753 | Giữ nguyên khi port |

Chi tiết B-11, các điểm yếu của bộ kiểm tra bản thử:

- **(a) Nhận diện khối bằng regex tiếng Việt, dễ sai.**
  - `STUDY` có `/ôn/`, nên khớp cả chữ "không".
  - "Soạn đồ cho thứ Hai" không nằm trong `NOT_HOME`, nên bị tính là học ở nhà.
  - Lớp "Tiếng Anh" bị tính là học ở nhà nếu tên khối không có chữ "Học thêm".
  - "Karate" không khớp `SPORT`, nên `tap_muon` bỏ qua.

  E1 phải đặt tên khối khéo để né những chỗ này. LLM của bản thử cũng gặp đúng rủi ro đó.
- **(b) `cao_lien` chỉ so hai khối kề nhau theo thứ tự sắp xếp.** Nếu các khối chồng giờ thì bỏ lọt.
- **(c) `tap_muon` chỉ xét buổi tập kết thúc trước giờ tắt đèn** (`b.e <= bed.s`). Buổi tập kết thúc sau giờ tắt đèn không bị báo. Thử đột biến đã xác nhận.
- **(d) `an_xa` dùng giờ bắt đầu khối.** Giả định ăn trưa 11:15 chỉ áp khi trường kéo dài qua 11:00–12:00 (dòng 617), trong khi H2 nói giả định chung.
- **(e) `isSchool` chỉ lấy khối trường đầu tiên dài ≥150′.**

## 8. Ước lượng công sức để đưa vào sản phẩm

Tính tương đối so với spike (spike = 1).

| Hạng mục | Cỡ |
|---|---|
| Chuyển sang TypeScript, schema khối có kiểu (`kind`: truong, hoc_nha, phuc_hoi, bua…) thay cho regex; test đơn vị theo từng mã quy tắc; test thuộc tính (property-based) cho sàn | 1,5–2 |
| Bảng ánh xạ hồ sơ → tham số (B5), mùa và vùng (I1–I3), soạn cặp buổi sáng (G6), gộp khối tuổi 11–15 (G8) | 1 |
| Sửa kế hoạch: K1–K4, ngoại lệ "chỉ tuần này", ghim khối không đổi, diff tối thiểu | 1,5 |
| Engine giai đoạn tạm thời: lưu lịch cũ, hết hạn, idempotency theo `proposal_id` (F-021), audit family_hard | 1 |
| Lớp LLM: trích JSON từ lời kể + diễn đạt từ `tradeoffs`; cổng kiểm chặn LLM đổi giờ; lớp an toàn chạy trước | 1–1,5 |
| UI: trạng thái "chờ bố mẹ chọn", danh sách đánh đổi, nhãn `UNKNOWN` | 0,5–1 |
| **Tổng kỹ thuật** | **khoảng 6,5–8 lần spike** |

Ngoài phần kỹ thuật còn một việc không thuộc kỹ sư: chuyên gia thẩm định các mốc [MĐ] (P6-OD-03, spec mục P). Việc này quyết định nhãn `UNKNOWN` có được gỡ hay không.

> **Ước lượng thô, chưa kiểm chứng:** khoảng 4–6 tuần-người cho một lập trình viên quen code base, chưa tính thời gian thẩm định chuyên môn.

## 9. Khuyến nghị

1. **Dùng E1 làm nguồn chuẩn cho giờ giấc và thứ tự.** LLM chỉ làm hai việc: (a) đổi lời kể thành input có cấu trúc, (b) diễn đạt kết quả, cảnh báo, đánh đổi. Mọi lịch, kể cả lịch do LLM đề xuất, phải qua bộ kiểm tra trước khi lưu.
2. **Giữ `prototype/index.html` làm hành vi chuẩn,** nhưng ghi rõ các điểm E1 cố ý khác: B-2, B-3, sửa trước thay vì chỉ cảnh báo, nhãn `UNKNOWN`.
3. **Chủ sản phẩm cần chốt trước khi dựng:**
   - B-4: thời lượng chuẩn từng khối sinh hoạt;
   - B-6: học thêm ngay sau giờ trường có cần phục hồi trước không;
   - B-1: 5′ giữa hai khối học;
   - B-9: đưa OD-01 vào spec;
   - B-5: cột quỹ cho đêm thứ Sáu và Chủ Nhật.
4. **Thay regex bằng kiểu khối có cấu trúc** trong cả bộ xếp lẫn bộ kiểm tra (B-11). Đây là thay đổi rẻ nhất mà tăng độ tin cậy nhiều nhất.
5. **Bước tiếp theo nên làm:** lấy 5–10 hội thoại thật đã ẩn danh từ bản thử, chạy song song LLM và E1 trên cùng input, so bằng `checkDayK` + kiểm tra bổ sung + đánh giá của chủ sản phẩm. Khi đó so sánh chất lượng mới là định lượng. Spike này chưa làm được việc đó.
