# Spike E1 v2: thay đổi so với v1

- **Ngày:** 15/11/2026 (áp sổ quyết định `Owner_Decision_Log_20261115.md`).
- **Gốc:** bản v1 của spike (, 14/11/2026). `Spike_E1_Scheduler_Report.md` trong thư mục này là **báo cáo v1, giữ nguyên**. File này chỉ ghi phần đổi.
- **Chạy lại:** `node src/run.js`, `node src/mutation-test.js`, `node src/test-rules-v2.js` (Node 22, không cần package).
- Hồ sơ đều là dữ liệu giả lập.

## 1. Thay đổi theo quyết định

| Mã | Quyết định | Đổi ở đâu | Hành vi mới |
|---|---|---|---|
| D-02 | Ô Ngủ không có "Giữ mức này" | `validators.js`: `budgetBoard`, `keepAllowed`, `confirmKeep`; `scheduler.js` ghi chú `C1/D-02` | Mỗi ô có `giu_muc` (true chỉ khi ô đỏ và không phải ô Ngủ). `confirmKeep(…, "ngu")` luôn từ chối. Ô Ngủ cam (thiếu ≤30′) cũng không giữ được (fail-safe, xem BL M-03). Bộ xếp vẫn dùng sàn C1 như v1 |
| D-08 | Thông số dùng `params.json` của spike, nhãn "mặc định chưa kiểm chứng" | `scheduler.js` `PARAMS` | Mỗi thông số có `id` (PR-01…PR-21), `status: "mac_dinh_chua_kiem_chung"`, `quyet_dinh: "D-08"`, `cho_tham_dinh: "buoc_14b"`. Thêm `SNACK` (10′, trước là hằng số trong code) |
| D-09 | Giai đoạn tối đa 60 ngày; hết hạn tự về hồ sơ trước | `phase.js`: `validatePhase`, mới `submitPhase`, `activatePhase`, `tickPhases`, `endPhaseEarly` | >60 ngày (tính cả hai đầu) → `TU_CHOI`, kể cả khi không nới gì. Áp dụng thì lưu `ho_so_truoc`. Qua ngày cuối → `HET_HAN`, hồ sơ hiệu lực tự về `ho_so_truoc`, phát sự kiện. Kết thúc sớm cũng về hồ sơ trước. Lịch đang khóa → `CHO_MO_KHOA` |
| D-10, OD-A7 | "Rất mệt" không tự đổi lịch; tín hiệu mệt thuộc F04-G05 | mới `fatigue.js`; `scheduler.js` đổi ghi chú khối phục hồi | `onCheckin` không có quyền ghi lịch, `schedule_changed` luôn `false`. Đường đổi lịch theo chế độ: `UNSET`/`PARENT_LED` → mong muốn (không CR); `CHILD_EXECUTED` → CR; `CHILD_DIRECTED` → sửa trong phạm vi hoặc CR; đang khóa → CR chỉ để xem. Ghi chú khối phục hồi không còn hứa "+15′, bỏ học định hướng" |
| D-03 | Báo xu hướng mệt liên quan đến lịch, con được biết | `fatigue.js` `trend` | Đếm "Rất mệt" trong 14 ngày theo thứ và theo đặc điểm lịch. Ngưỡng gửi = `null` (chưa có nguồn) → chưa gửi. Không có chữ của con trong dữ liệu gửi |
| J5 + chế độ | Đề xuất giai đoạn từ con | `phase.js` | Thiếu `mode` coi là `UNSET` (fail-closed). `UNSET`/`PARENT_LED` → `MONG_MUON`. `CHILD_EXECUTED`/`CHILD_DIRECTED` → `CHO_BO_ME_XAC_NHAN` |

## 2. Mặc định fail-safe cho blocker còn mở (chờ chủ sản phẩm, không sửa spec gốc)

| Mã | Mặc định v2 | Đổi ở đâu |
|---|---|---|
| B-1 | Nghỉ giữa hai phiên học **≥5′** ở cả bộ xếp và bộ kiểm tra. v1 kiểm ≥3′ | `validators.js` `BREAK_MIN`, `x_nghi_giua`; `PARAMS.BREAK` |
| B-2 | Theo spec G7: giữ quỹ học ở nhà, không tự bỏ ôn bài; tạo **1 câu hỏi có cấu trúc** cho bố mẹ mỗi ngày có học thêm tối (khi học ở nhà >0′), hai phương án, mặc định `giu_quy` | `scheduler.js` `questions[]`; `run.js` in vào `weeks.txt` |

## 3. Kết quả chạy lại

| Chỉ số | v1 | v2 |
|---|---|---|
| Giữ sàn cứng | 8/8 | 8/8 |
| Lỗi `checkDayK` còn lại | 21, đều `an_xa` (đã thành đánh đổi) | 21, đều `an_xa` (không đổi) |
| Lỗi kiểm tra bổ sung | 0 | 0 (với sàn nghỉ 5′) |
| Tất định | 8/8 | 8/8 |
| Giờ và tên khối so với v1 | — | giống hệt ở 8/8 hồ sơ (chỉ đổi `ghi_chu`) |
| Thời gian | 0,3–8,4 ms/tuần | 0,3–8,0 ms/tuần |
| Thử đột biến | 10/11 | 11/12 (thêm ca B-1: cách 4′). Ca bỏ lọt vẫn là `tap_muon` kết thúc sau giờ tắt đèn (B-11c) |
| Test quy tắc mới | — | 32/32 đạt (`out/test-rules-v2.txt`) |
| Bảng quy tắc | 82 | 88 (thêm D-02, D-03, D-08, D-09, D-10, D-11) |
| Câu hỏi G7 cho bố mẹ | 0 (chỉ ghi chú) | 4 (P4 T3, T5; P5 T2, T4) |

File kết quả: `out/run-console.txt`, `out/summary.json`, `out/weeks.txt`, `out/P1.json`…`P8.json`, `out/params.json`, `out/rules.json`, `out/mutation-test.txt`, `out/test-rules-v2.txt`.

## 4. Chưa làm trong v2

- D-11 (con không có máy): chỉ ghi vào `rules.json` và Business Logic; bộ xếp chưa có cờ `child_device`.
- B-4, B-6, B-11: giữ xử lý tạm của v1 (xem Business Logic §11).
- Ghim khối khi sửa (K2), ngoại lệ chỉ tuần này, CR engine: chưa có code; chỉ đặc tả trong Business Logic.

người soạn: AI, chưa kiểm chứng độc lập; trạng thái: nháp chờ duyệt
