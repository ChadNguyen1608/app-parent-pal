# 05 — Ứng viên MVP và đề xuất cho Product Owner

**Trạng thái:** `REVIEW / PROPOSAL / MVP_NOT_DECIDED` · **Người soạn:** AI (Claude), chưa kiểm chứng độc lập · **Nguồn:** HEAD `9043c88`.
**Dữ liệu:** `data/packages.json`, `data/graph_results.json`, `data/assessment.json`, `data/cost_scenarios.json`.

> **Quyết định MVP thuộc riêng Product Owner.** Tài liệu này chỉ đề xuất. Blueprint canonical không bị sửa. Mọi điểm giá trị là giả thuyết chuyên gia (HYPOTHESIS): chưa có nghiên cứu người dùng.

## 1. Ba ứng viên

### Gói A: Lịch tuần cân bằng cùng con (workflow W1; có phương án A-lite = W1E1)

| Mục | Nội dung |
|---|---|
| Đối tượng | Phụ huynh và con lớp 1–9 (A2–A3, đúng trọng tâm CORE). A1/A4 có điều kiện |
| Giá trị cho phụ huynh | Xếp được tuần học, học thêm, chơi, ngủ mà vẫn cân bằng; bớt phải nhắc con; nhìn tuần qua một bản tóm tắt |
| Giá trị cho trẻ | Biết hôm nay làm gì; tự đánh dấu xong; thời gian chơi và nghỉ được bảo vệ (lăng kính năng lực, tự chủ, an toàn) |
| Vấn đề giải quyết | Lịch quá tải, phải nhắc liên tục, thiếu cân bằng (đúng nỗi đau mà prototype nhắm tới) |
| Luồng chính | Nhập thời khóa biểu → Pal soạn lịch (E2) hoặc chọn mẫu (E1) → kiểm cân bằng → giao việc → Child App hiện việc hôm nay + nhắc → con đánh dấu → tóm tắt tuần cho phụ huynh |
| Module bắt buộc | **32** (15 CORE_VALUE + 17 MIN_FOUNDATION). A-lite: **24** |
| Tùy chọn | F04-G04-M02, F04-G05-M02, F06-G04-M01, F02-G05-M02, F04-G06-M01, F04-G03-M02, F04-G06-M02, F06-G02-M02, F03-G03-M01, F06-G01-M02, F01-G02-M02 |
| Nền tảng và an toàn bắt buộc | Identity & Authorization Core; Lifecycle (xóa/lưu giữ); Balanced Planning; nếu có AI thì thêm gói AI (router, hạn mức, OD-05, Safety Triage, đánh giá model) và nội dung tĩnh OD-03 |
| Bản đơn giản hóa | Một hộ, chỉ ghép lại trong cùng hộ (FR-01, tắt ghép khác hộ); bảng phân quyền cố định; phụ huynh tự đặt chế độ; con gửi đề xuất bằng tin nhắn thay cho Change Request đầy đủ; xóa dữ liệu theo runbook thủ công |
| Loại trừ | Nhật ký, check-in cảm xúc, Pal cho trẻ, insight AI, thanh toán, thương mại, tích hợp trường, phản hồi bởi con người |
| Độ phức tạp (đếm, không cộng) | Effort mức 1: 2 · mức 2: 17 · mức 3: 11 · mức 4: 2. Complexity ≥4: 8 module (đều là nền tảng). Overhead an toàn H: 10 |
| Chi phí AI (giả định) | 3.370 VND/hộ/tháng ở mức Base (p95 khoảng 10.100). A-lite: 0 |
| Rủi ro kỹ thuật chính | Nhắc đúng giờ trên Android (log test lệch 45 giây, sát ngưỡng); lõi định danh có vòng phụ thuộc lúc chạy; 4 module nền chưa từng được kiểm độc lập |
| Chặn pháp lý / riêng tư / an toàn | H4 (xóa) và G-Legal UNKNOWN với dữ liệu thật của trẻ. FR-03 **không** áp dụng vì AI chỉ phục vụ phụ huynh. OD-05 áp cho bản lịch do AI soạn |
| Độ tin cậy | HYPOTHESIS. Có bằng chứng kỹ thuật một phần: prototype, log test thiết bị Plan A |

### Gói B: Pal đồng hành phụ huynh (workflow W2, chỉ Parent App)

| Mục | Nội dung |
|---|---|
| Đối tượng | Phụ huynh của trẻ 0–14 (A0–A3); A4 có điều kiện |
| Giá trị cho phụ huynh | Hỏi Pal về nuôi dạy con, được trả lời từ kho tri thức kèm nguồn, Pal nhớ hồ sơ con, gợi ý hoạt động |
| Giá trị cho trẻ | Gián tiếp, qua quyết định của phụ huynh |
| Luồng chính | Hồ sơ con → hỏi Pal → tra kho nội bộ trước → gợi ý có nguồn → phụ huynh chọn |
| Module bắt buộc | **26** (5 CORE_VALUE + 21 MIN_FOUNDATION) |
| Nền tảng và an toàn | Toàn bộ gói AI + Guardrails + Content CMS, Retrieval, Editorial, Provenance (FR-02) + minh bạch trí nhớ (F02-G06-M02) |
| Loại trừ | Child App, lập lịch, báo cáo, thương mại (OD-02, FR-05) |
| Độ phức tạp | Effort mức 2: 11 · mức 3: 12 · mức 4: 3. Complexity ≥4: 11. Overhead an toàn H: 13 |
| Chi phí AI | 1.106 VND/hộ/tháng ở mức Base với Haiku. Nếu phải dùng Sonnet cho hội thoại: khoảng 19.500 |
| Rủi ro chính | **Kho tri thức chưa có nội dung nào được duyệt.** Theo OD-05, Pal không được sinh câu trả lời nếu thiếu bằng chứng phạm vi đã duyệt; ngoài câu hỏi giáo dục, Pal không được tự tra ngoài. Chất lượng tiếng Việt chưa đo (MR-023, 026). **Không khép được vòng lặp** vì thiếu bước thực hiện |
| Chặn pháp lý | H4 và G-Legal UNKNOWN. FR-03 chỉ áp nếu trẻ hỏi trực tiếp, nên gói này chặn trẻ dùng |
| Lưu ý inventory | Hội thoại Pal với phụ huynh chưa có L3 riêng (GAP-16) |

### Gói C: Vòng đầy đủ có tiếng nói của trẻ (W1 + W3). **Chỉ là ứng viên tương lai có điều kiện**

| Mục | Nội dung |
|---|---|
| Đối tượng | A2–A4 |
| Giá trị | Trẻ được nói ra (check-in, phản tư), có Nhật ký riêng và tự chọn chia sẻ, cả nhà cùng xem lại tuần → điều chỉnh kế hoạch |
| Module bắt buộc | **49** (26 CORE_VALUE + 23 MIN_FOUNDATION) |
| Độ phức tạp | Effort mức 4: 6. Complexity ≥4: 14. Overhead an toàn H: 16 |
| Chi phí AI | 4.345 VND/hộ/tháng ở mức Base |
| **Điều kiện bị chặn** | (1) FR-03: Pal xử lý yêu cầu của trẻ khi chưa có cơ sở pháp lý; (2) H4: Nhật ký và chuỗi xóa dẫn xuất; (3) PIA và threat model (MR-018..021); (4) nghiên cứu MR-009, 024, 031, 032 về tải và lệ thuộc cảm xúc. **Không triển khai với dữ liệu thật của trẻ khi các gate này chưa đạt** |

## 2. So sánh

Mức H/M/L là nhận định chuyên gia dựa trên số liệu ở §1 và đồ thị phụ thuộc. Không quy đổi thành điểm tổng.

| Tiêu chí | A (W1) | A-lite | B (W2) | C (điều kiện) |
|---|---|---|---|---|
| 1. Giá trị từ đầu đến cuối | **H**: khép được Kế hoạch → Thực hiện → Đánh giá | M–H | M: dừng ở Định hướng | H (khi đủ điều kiện) |
| 2. Giá trị cho phụ huynh | H (soạn lịch 5/4 ở A2/A3; nhắc 4/4; tóm tắt 4/4) | M–H | H (Pal 4/3, gợi ý 4/3), nhưng phụ thuộc kho tri thức | H |
| 3. Trẻ tự nguyện dùng | M (xem việc hôm nay 4/4, đánh dấu 4/4; MR-007 chưa chứng minh) | M | L (gián tiếp) | M–H (Nhật ký 3/4, phản hồi 3/4) |
| 4. Độ khép vòng lặp | H | H | L | **Cao nhất** |
| 5. Hiệu quả chi phí | H | **Cao nhất** (0 AI) | H nếu dùng Haiku; M nếu cần Sonnet | M |
| 6. Thời gian để học được từ pilot | **Ngắn**: đo dùng hằng ngày ngay | Ngắn | Trung bình: cần duyệt nội dung trước | Dài |
| 7. Khả thi triển khai | H: prototype và Plan A đã có phần lớn hành vi | H | M: gói AI + kho tri thức | L |
| 8. Sẵn sàng an toàn/riêng tư | M: còn H4 và nền chưa kiểm độc lập; không có FR-03 | M (ít module hơn) | M–L: gói AI đầy đủ + nội dung tĩnh + kho đã duyệt | L: 9 module bị chặn |
| 9. Tái sử dụng và phát triển | H: nền và lịch là gốc cho C; thêm B sau | H | M: gói AI dùng lại được cho A | — |
| 10. Nhạy với giả định bất định | M (tỷ lệ nhận bản AI, MR-007) | L | **H** (kho đã duyệt, model, inventory) | H |

## 3. Đề xuất

**Đề xuất: Gói A, triển khai theo hai nấc.**
1. **Nấc 1 = A-lite (24 module, không LLM):** lịch từ mẫu và quy tắc cân bằng, Child App xem việc hôm nay, nhắc việc, đánh dấu, tóm tắt tuần. Nấc này đo được ngay câu hỏi lớn nhất (MR-007, MR-001/002) mà không phải chờ gói AI và OD-05.
2. **Nấc 2 = bật Pal soạn lịch (W1, thêm 8 module):** khi gói AI, nội dung tĩnh OD-03 và bộ đánh giá tiếng Việt đã sẵn sàng.

**Vì sao chọn A:**
- Khép được vòng lặp chính và đúng nỗi đau mà Owner nêu (lập lịch, hỗ trợ trẻ thực hiện, báo cáo).
- Có sẵn bằng chứng kỹ thuật (prototype, log test Plan A) và quy tắc lập lịch có mức căn cứ [NC]/[NL].
- Không chạm FR-03.
- Chi phí AI thấp hoặc bằng 0.
- Phần nền tảng làm cho A chính là nền mà B và C sẽ dùng lại.

**Phương án thay thế:**
- **B** chỉ nên đi sau, hoặc gắn vào A dưới dạng "hỏi Pal về lịch và việc học", **sau khi** có bộ nội dung khởi đầu đã được chuyên gia duyệt và đã giải quyết GAP-16.
- **C** là lộ trình mở rộng sau pilot, khi FR-03, H4 và PIA đã đạt.

**Đánh đổi:**
- A ít khác biệt hơn B về "Pal có trí nhớ". Đây là hình ảnh trung tâm của Pal trong CLAUDE.md.
- A-lite có thể bị xem là "app lịch". Sự khác biệt của nó nằm ở quy tắc cân bằng: F04-G02-M03 là module duy nhất có điểm khác biệt 5 trong 66 module chấm đầy đủ.

**Cố ý loại trừ:** Nhật ký, check-in, Pal cho trẻ, insight AI, đánh giá học tập (P6), thanh toán, thương mại, tích hợp, phản hồi bởi con người, ghép khác hộ, nhiều hộ.

## 4. Giả thuyết pilot và tiêu chí đo (đề xuất để Owner chốt; không phải chuẩn ngành)

| Giả thuyết | Chỉ số | Ngưỡng đề xuất | MR |
|---|---|---|---|
| Phụ huynh hoàn tất lịch tuần đầu tiên | % hộ có lịch được kích hoạt trong 7 ngày | ≥60% | MR-008 |
| Trẻ A2–A3 tự mở Child App | % trẻ mở app ≥4 ngày/tuần trong tuần 2–4 | ≥50% | MR-007 |
| Nhắc việc đúng giờ | % nhắc trong vòng 1 phút | ≥95% | Plan A §6 |
| Bớt việc nhắc cho phụ huynh | Tự báo cáo số lần nhắc/ngày, trước và sau | Giảm rõ (Owner chốt mức) | MR-002 |
| Lịch cân bằng được chấp nhận | % tuần không bị phụ huynh bỏ qua cảnh báo cân bằng | Theo dõi, chưa đặt ngưỡng | MR-012 |
| (Nấc 2) Bản lịch Pal soạn hữu ích | % bản soạn được nhận với ≤3 chỉnh sửa | ≥40% | MR-025 |
| Không gây áp lực cho trẻ | Phỏng vấn ngắn về cảm giác bị giám sát hoặc quá tải | Không có tín hiệu tiêu cực rõ | MR-031 |
| An toàn | Sự cố về quyền riêng tư hoặc an toàn | 0 | MR-021 |

**Hành vi dùng và giữ chân dự kiến** (giả thuyết): dùng hằng ngày ở phía trẻ (xem việc, đánh dấu); hằng tuần ở phía phụ huynh (lịch, tóm tắt). Rủi ro bỏ app sau 2–3 tuần nếu nhắc gây phiền (MR-031).

**Mở rộng sau pilot:** A → thêm phản hồi của trẻ và đề xuất đổi lịch (F02-G05-M02, F04-G06-M01) → B (Pal cho phụ huynh, khi kho tri thức đã duyệt) → C (khi FR-03, H4, PIA đạt) → thanh toán.

## 5. Điều kiện tiên quyết

**Trước khi phát triển:**
1. Owner chọn gói (và nấc).
2. Thẩm định các cạnh phụ thuộc của gói đã chọn, CANDIDATE → CONFIRMED (MR-040).
3. Kiểm độc lập 4 module nền chưa từng được review: Access Policy, Consent Ledger, Mode State, Purpose-bound Access.
4. Viết Technical Specification cho Identity & Authorization Core.
5. Chốt bảng phân quyền tối giản cho pilot.

**Trước khi thử với dữ liệu thật của trẻ:**
1. H4: thời hạn xóa đã được xác minh pháp lý.
2. Cơ sở pháp lý và đồng ý của người giám hộ (MR-016, 017).
3. PIA (MR-021).
4. Với nấc 2: nội dung tĩnh OD-03 được chuyên gia duyệt, số 111/113/115 đã xác minh, đánh giá AI tiếng Việt (MR-023).
5. Quy trình xóa có log.

Trước khi các điều kiện này đạt, chỉ thử với dữ liệu giả lập.

## 6. Quyết định Owner còn cần

1. **Chọn gói MVP:** A / A-lite trước / B / kết hợp.
2. **GAP-16:** hội thoại Pal với phụ huynh thuộc L3 nào (giữ ở F05-G01-M01 hay thêm L3 mới qua quy trình sửa inventory).
3. Phạm vi pilot: chỉ gia đình một hộ (tắt ghép khác hộ theo FR-01) có chấp nhận được không.
4. Ngưỡng thành công của pilot (§4).
5. Có cho phép thuê hoặc mời chuyên gia duyệt bộ nội dung khởi đầu không (GAP-09; có phát sinh chi phí).
6. Các quyết định pháp lý H4 / FR-03 sau khi nghiên cứu xong (không phải quyết định sản phẩm).
