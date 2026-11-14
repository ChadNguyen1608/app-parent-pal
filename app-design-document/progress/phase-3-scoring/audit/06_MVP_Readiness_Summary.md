# 06 — Tổng hợp mức sẵn sàng cho MVP (không chọn MVP)

**Loại:** `SELF_AUDIT / PROPOSAL` · **Người soạn:** AI (Claude, Opus 5.5), tự rà soát lượt chấm của chính mình, chưa kiểm chứng độc lập; có 1 lượt phản biện bằng subagent · **Nguồn:** HEAD `9043c88`; baseline đóng băng `baseline_v1/` (SHA256SUMS) · **Cần Owner duyệt:** mọi thay đổi đề xuất

## Trạng thái: `READY_WITH_CONDITIONS` cho bước Adversarial MVP Review

Nhãn này **không** cho phép sửa Blueprint, chọn MVP hay bắt đầu phát triển.

**Điều kiện** (theo tiêu chí đã thống nhất với Owner):
1. **Không còn mâu thuẫn với quyết định đã duyệt.**
   - Đã tìm ra các mâu thuẫn trong baseline:
     - E2 của F04-G02-M01, trái 3.4/Inventory;
     - A-lite thiếu phần thực thi SC-001-D01 (ngoại lệ có hạn) và D02 (phản hồi tự nguyện);
     - lý do của F03-G05-M03 trái SC-003;
     - chưa áp P6-BP-OD-01..03 và B01 CR / Mode State (phản biện phát hiện);
     - F02-G05-M02 chấm sai phạm vi.
   - Tất cả đều có đề xuất sửa (file 07), **cần Owner duyệt**.
   - Chưa rà hết các Owner Decision Log khác (B01 Plan Structure, Consent Ledger, Purpose-bound Access, P6 Access Policy, P5). Đây là điều kiện còn mở.
2. **Mọi khoảng trống thiết yếu của A-lite đều có hướng xử lý:**
   - 4 năng lực thiếu hẳn đã có đề xuất trong A-lite v2, trừ tín hiệu mệt đang chờ chủ sở hữu (OD-A7);
   - mục tiêu, biến thể A-lite, geofence, định danh chờ Owner quyết (OD-A1, A2, A3, A8).
3. **Gate pháp lý là điều kiện trước khi dùng dữ liệu thật, không phải trước khi review:** H4, FR-03, MR-016/017/018/021 vẫn mở; không gate nào PASS.

## 1. Phát hiện đã xác nhận

- F04-G02-M01 bị nâng E1→E2 trái Inventory/3.4/SC-001, nên A-lite baseline thiếu bộ dựng lịch (CONFIRMED_SOURCE).
- A-lite baseline thiếu hẳn 4 năng lực thiết yếu (bộ dựng lịch, đề xuất của con theo chế độ CHILD_EXECUTED, tín hiệu mệt, phát hiện mẫu 2 tuần) và phủ một phần preset, giai đoạn tạm thời có hạn, việc một lần (sau phản biện: 5 → 4 thiếu hẳn).
- F02-G05-M02 bị chấm theo phạm vi sai (baseline coi là phản hồi về việc; Inventory: trẻ xem và đề nghị sửa hiểu biết về mình).
- Bỏ sót các Owner Decision Log đã duyệt: P6 Balanced Planning (OD-01..03), B01 Change Requests, B01 Mode State (OD-01..04). Cả baseline lẫn lượt audit đầu đều không áp các quyết định này. Phản biện phát hiện ra.
- A-lite E1 không có AI, trong khi CLAUDE.md coi prototype (có Pal chat) là hành vi chuẩn. Đã thêm biến thể Plan A để Owner chọn.
- Cạnh E029 sai chiều (dựng lịch phải gọi kiểm xung đột).
- Lý do của F03-G05-M03 trái SC-003 (lớp 8 = A3, thuộc CORE).
- Geofence của Plan A (Owner chốt 04/11) không có L3 nào đứng tên vị trí; đề xuất ánh xạ vào các ID có sẵn.
- Baseline không đọc 3.4, SC-001..003, spec lập lịch (9 phát hiện SELF_OMISSION).
- Quy tắc INDIRECT áp không nhất quán cho 3 cặp module tương tự (CONFIRMED_SCRIPT).
- dependency_enablement lệch với số phụ thuộc trực tiếp ở F04-G02-M01 và F06-G01-M01.

## 2. Sửa có căn cứ và giả thuyết

- **Sửa có căn cứ** (CONFIRMED_SOURCE / CONFIRMED_SCRIPT): xem cột "Căn cứ" ở file 01 §3–4.
- **Giả thuyết:** mọi điểm giá trị, mọi mức chi phí, quy tắc sắp xếp kịch bản.

## 3. Hard Gate chưa giải quyết

- **H4:** thời hạn xóa.
- **FR-03:** xử lý yêu cầu của trẻ khi chưa rõ cơ sở pháp lý.
- **G-Legal / G-Privacy UNKNOWN** cho mọi module có dữ liệu cá nhân.
- **G-Safety CONDITIONAL** cho module AI.
- **4 module nền** chưa từng được kiểm độc lập.

## 4. Thay đổi phụ thuộc có tác động lớn nhất

1. 36/95 cạnh chỉ cần năng lực tối thiểu → phạm vi nền tảng của pilot nhỏ hơn đáng kể.
2. `B_AI_GATE` chỉ áp khi E2 thật sự được bật → A-lite không cần gói AI.
3. Đổi chiều E029 và thêm P-E02..P-E04 → bộ dựng lịch, quỹ thời gian và ngoại lệ trở thành chuỗi bắt buộc.
4. Rút P-E05 (sai chủ sở hữu) và P-E07 (ghi chi phí thuộc F07-G03-M02) sau phản biện.

## 5. A-lite còn khả thi không?

- **Có thể, nhưng chưa chứng minh được:** A-lite E1 gồm 29 module (12 module chỉ cần năng lực tối thiểu) và 0 module AI. Đây là workflow duy nhất khả thi về cấu trúc ở cả 3 kịch bản độ nhạy.
- **Bộ dựng lịch xác định (E1) chưa tồn tại.** Prototype giao việc xếp thứ tự cho LLM, nên khả thi E1 là UNKNOWN cho đến spike RG-01.
- **Biến thể Plan A** (bám prototype): 40 module, có gói AI. Khả thi hơn về hành vi vì prototype đã chạy, nhưng gánh nặng an toàn và chi phí thay đổi cao hơn.

## 6. Rủi ro lớn về chi phí triển khai

- CU-01: thuật toán xếp lịch;
- CU-02: chuyên gia duyệt nội dung (với workflow có AI);
- CU-03: chọn model tiếng Việt;
- CU-04: thông báo trên Android;
- CU-05: pháp lý.

## 7. Cần kiểm chứng bằng nghiên cứu người dùng

- CA-01: trẻ tự dùng app;
- CA-02: phụ huynh bớt phải nhắc;
- CA-04: kênh phản hồi mệt không gây áp lực;
- giá trị thật của preset và Standard Bar.

Theo Scenario Management Rules §5.7, **agent không thể thay thế bước kiểm chứng giá trị với người dùng thật**.

## 8. Có đủ để sang Adversarial MVP Review chưa?

**Đủ, nếu kèm điều kiện.**
- Có baseline đóng băng, sổ thay đổi, ma trận độ phủ, ma trận phụ thuộc v2 và phân tích độ nhạy.
- Review đó **nên do một reviewer khác thực hiện**, không phải Claude của phiên này. Lúc đó cần commit hoặc gửi kèm `review/` và `audit/`.

**Độ tin cậy:** MEDIUM cho các phát hiện về cấu trúc; HYPOTHESIS cho giá trị. **Cần Owner duyệt:** có (file 07, 08).
