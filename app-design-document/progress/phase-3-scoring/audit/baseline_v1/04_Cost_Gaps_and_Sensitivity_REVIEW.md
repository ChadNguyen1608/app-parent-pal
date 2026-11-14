# 04 — Chi phí, khoảng trống bằng chứng và độ nhạy

**Trạng thái:** `REVIEW / ESTIMATE ONLY` · **Người soạn:** AI (Claude), chưa kiểm chứng độc lập · **Nguồn:** HEAD `9043c88`.
**Dữ liệu:** `data/cost_scenarios.json` (script `tools/cost_model.py`), `data/packages.json`.

> Mọi con số chi phí ở đây là **ước lượng dựng từ giả định**, không phải chi phí đo được khi vận hành. Giá model là giá niêm yết, không phải unit economics của app. Chưa có pilot, phỏng vấn hay số liệu sử dụng thật.

## 1. Chi phí AI theo kịch bản (chỉ module E2 trong Tier-3)

**Giả định (toàn bộ là `ASSUMPTION`):**
- **Giá niêm yết** (tra ngày 14/11/2026):
  - Haiku 5.5: $0,10 cho mỗi triệu token vào và $0,50 cho mỗi triệu token ra (prompt ≤100K token);
  - Sonnet 5.5: $2 / $10.
- **Tỷ giá:** 26.000 VND/USD.
- **Quy mô:** Low 30, Base 300, High 3.000 hộ đang hoạt động.
- **Người dùng nặng (p95):** gấp 3 lần mức trung bình.
- **Token mỗi hành động và tỷ lệ thành công:** ghi trong file dữ liệu. Tỷ lệ thành công (phụ huynh nhận bản soạn hoặc gợi ý) là con số đoán, chưa có căn cứ.

| Hành động | Model | $/hành động (gồm retry + kiểm tra đầu ra) | Base: số lần/hộ/tháng | Base: VND/hộ/tháng | p95: VND/hộ/tháng | VND cho mỗi lần thành công |
|---|---|---|---|---|---|---|
| Pal soạn lịch (F04-G02-M01) | Sonnet 5.5 | 0,0324 | 4 | 3.370 | 10.109 | 1.203 |
| Pal soạn lịch (phương án thay thế) | Haiku 5.5 | 0,00176 | 4 | 183 | 548 | 76 |
| Tin nhắn Pal (F05-G01-M01) | Haiku 5.5 | 0,00063 | 60 | 975 | 2.925 | 20 |
| Tin nhắn Pal (nếu cần chất lượng cao hơn) | Sonnet 5.5 | 0,0125 | 60 | 19.500 | 58.500 | 382 |
| Gợi ý có nguồn (F03-G05-M01) | Haiku 5.5 | 0,00084 | 6 | 131 | 393 | 44 |

**Theo gói ứng viên** (VND/hộ/tháng ở Low / Base / High; trong ngoặc là tổng $/tháng ở mức Base):

| Gói | Low | Base | High |
|---|---|---|---|
| A: W1, Sonnet soạn lịch | 1.685 | 3.370 ($38,88) | 6.739 |
| A-lite: W1E1, không dùng LLM | 0 | 0 | 0 |
| B: W2, Pal Haiku + gợi ý | 369 | 1.106 ($12,76) | 3.578 |
| C: W1+W3, Sonnet soạn lịch + Pal Haiku | 2.010 | 4.345 ($50,13) | 9.989 |

**Đối chiếu.** Mô hình kinh tế v1 (project doc, 29/10/2026) giả định chi phí AI khoảng 1.200 VND/người miễn phí/tháng và 8.200 VND/người trả phí/tháng. Kịch bản Base ở trên nằm cùng khoảng đó. Cả hai bên đều là giả định.

**Nhận định về chi phí:**
1. **Chi phí suy luận AI không phải yếu tố quyết định** chọn gói nào, với điều kiện dùng model nhỏ và có hạn mức (F07-G03-M02).
2. **Lựa chọn model mới là biến lớn nhất.** Nếu tiếng Việt buộc phải dùng Sonnet cho hội thoại, chi phí tăng khoảng 20 lần (Base 19.500 VND, p95 58.500 VND/hộ/tháng). Khi đó gói miễn phí bắt buộc phải có hạn mức chặt. Cần kiểm chứng ở MR-026.
3. **Chi phí lớn hơn nằm ngoài inference:**
   - chuyên gia duyệt nội dung (toàn bộ `documents/knowledge/by-age` đang là "nháp, người soạn AI");
   - nội dung tĩnh an toàn OD-03;
   - bộ đánh giá an toàn AI tiếng Việt (F07-G04-M02);
   - công pháp lý (H4, FR-03, MR-016).
   Các chi phí này **chưa ước lượng được** vì chưa có báo giá hay định mức nhân sự. Ghi là `UNKNOWN`.
4. **Chi phí vận hành không phải AI:** thông báo đẩy và báo thức chính xác (F04-G07-M01: rủi ro trễ ở mức H) và lưu ảnh bài làm (F04-G05-M02: chi phí vận hành M). Plan A dùng Supabase gói miễn phí, chỉ phù hợp quy mô Low.

## 2. Phương án rẻ hơn bằng E0/E1

| Module | Phương án E0/E1 | Mất gì |
|---|---|---|
| F04-G02-M01 soạn lịch | Mẫu lịch theo lớp + điền theo quy tắc (W1E1) | Không soạn được từ mô tả tự do, kém khác biệt |
| F05-G01-M01 Pal | Tìm câu trả lời trong kho đã duyệt + mẫu câu | Mất tính hội thoại; nhưng câu trả lời cũng phải nằm trong kho đã duyệt theo OD-05 |
| F03-G05-M01 gợi ý | Thư viện gợi ý lọc theo tuổi và sở thích | Kém cá nhân hóa |
| F05-G01-M02 guardrails | Quy tắc + danh sách chặn + mẫu tĩnh; chỉ gọi model kiểm tra khi cần | Có thể bỏ sót ngữ cảnh. **Không được bỏ kiểm tra an toàn để giảm chi phí** (3.3 §5) |

## 3. Khoảng trống bằng chứng (đã gộp trùng, gắn MR hiện có)

Phân loại:
- **R** = chặn phát hành hoặc chặn dữ liệu thật;
- **C** = chặn độ tin cậy của ước lượng chi phí;
- **M** = có thể đổi lựa chọn MVP;
- **P** = để pilot đo.

| # | Câu hỏi | MR | Loại | Gói bị ảnh hưởng | Ưu tiên theo tác động |
|---|---|---|---|---|---|
| GAP-01 | Cơ sở pháp lý cho dữ liệu trẻ, đồng ý của người giám hộ, thời hạn xóa (H4) | MR-016, MR-017, MR-018 | R | A, B, C | 1 |
| GAP-02 | Có được xử lý yêu cầu của trẻ khi chưa rõ cơ sở pháp lý không, và có cách hiển thị tĩnh "không xử lý" không (FR-03) | MR-016, MR-022 | R, M | C (và mọi luồng Pal dành cho trẻ) | 1 |
| GAP-03 | Đánh giá tác động quyền riêng tư (PIA), threat model, mã hóa, tách dữ liệu phụ huynh/trẻ | MR-021 | R | A, B, C | 2 |
| GAP-04 | Nội dung tĩnh an toàn: số 111/113/115 đúng theo địa phương, văn bản được chuyên gia duyệt (điều kiện OD-03) | MR-022 | R | A (nếu có AI), B, C | 2 |
| GAP-05 | Chất lượng và an toàn của AI tiếng Việt; chọn model (Haiku hay Sonnet) | MR-023, MR-026 | R, C, M | A (soạn lịch), B, C | 2 |
| GAP-06 | Trẻ có tự nguyện dùng Child App và tự đánh dấu hoàn thành không | MR-007 | M, P | A, C | 3 |
| GAP-07 | Phụ huynh có quay lại dùng và có thấy giảm việc không | MR-001, MR-002 | M, P | A, B | 3 |
| GAP-08 | Năng lực nào chỉ cần E0/E1 (A hay A-lite) | MR-025 | M, C | A | 3 |
| GAP-09 | Năng lực và chi phí chuyên gia duyệt kho tri thức (hiện 100% là nháp do AI soạn) | MR-011, MR-023 (**đề xuất MR mới PMR-02**) | R, M | B (chủ yếu), C | 2 |
| GAP-10 | Cách xác minh quyền của hộ mới và độ an toàn của Parent PIN (FR-01) | MR-017, MR-021 (**đề xuất PMR-01**) | R với ghép khác hộ | A, C nếu cho ghép khác hộ | 4 (pilot chỉ cho ghép trong cùng hộ) |
| GAP-11 | Mức báo cáo và tải cho trẻ; thời điểm check-in | MR-031, MR-032, MR-009 | P | C | 4 |
| GAP-12 | Nhập dữ liệu ban đầu (3–4 câu, ảnh thời khóa biểu) có đủ chính xác không | MR-010 | P | A, B | 4 |
| GAP-13 | Chi phí ở quy mô lớn, cache, hạn mức | MR-027, MR-029 | C, P | A, B, C | 5 |
| GAP-14 | Hiệu chuẩn rubric với nhiều người chấm | MR-039 | M | Mọi điểm | 3 |
| GAP-15 | Thẩm định cạnh phụ thuộc (CANDIDATE → CONFIRMED) | MR-040 | R cho kế hoạch dev | A, B, C | 3 |
| GAP-16 | Inventory: hội thoại Pal với **phụ huynh** chưa có L3 mang tên riêng. F05-G01-M01 tên "Child Conversation", nhưng L4 G02 giao cho nó cả câu trả lời cho phụ huynh | — (**đề xuất làm rõ inventory, PMR-03**) | M | B | 3 |

Các MR đề xuất (PMR-01..03) **chỉ ghi ở đây**. Master Research Backlog không bị sửa.

## 4. Độ nhạy: điều gì có thể làm đổi khuyến nghị

| Giả định thay đổi (trong khoảng hợp lý) | Ảnh hưởng | Gói bị đổi |
|---|---|---|
| Nghiên cứu pháp lý kết luận không xử lý được yêu cầu của trẻ (FR-03) | C chỉ còn là tương lai; A và B không đổi vì AI chỉ phục vụ phụ huynh | C |
| H4 kéo dài (không chốt được thời hạn xóa) | **Không gói nào được pilot với dữ liệu thật.** Chỉ còn thử với dữ liệu giả hoặc dữ liệu không định danh | A, B, C |
| Tiếng Việt cần Sonnet cho Pal | B tốn khoảng 20 lần, vẫn dưới giá giả định 99k/tháng nhưng gói miễn phí lỗ hơn | B |
| Phụ huynh nhận dưới 30% bản lịch do AI soạn | A-lite (không LLM) tốt hơn A; bớt 8 module | A → A-lite |
| Trẻ ít mở Child App (MR-007) | A thu về "planner cho phụ huynh" + nhắc việc trên máy phụ huynh; giá trị cho trẻ giảm | A |
| Có ngay một bộ nội dung khởi đầu được chuyên gia duyệt (khoảng 50–100 mục) | B trở nên khả thi sớm hơn; có thể gắn B vào A làm "hỏi Pal về lịch" | B, A+B |
| Gia đình thử nghiệm có bố mẹ sống ở hai nhà | Cần ghép khác hộ (FR-01, phương thức chưa có) → loại khỏi đợt pilot đầu | A, C |
| Nhập thời khóa biểu bằng tay quá vướng (MR-010) | Đưa F07-G03-M03 Multimodal vào lại (đọc ảnh thời khóa biểu) | A |

**Module có thể vào hoặc ra tùy giả định ("lưng chừng"):**
- F04-G02-M01 (chế độ E2 hay E1);
- F05-G01-M01 (có Pal hội thoại hay không);
- F04-G06-M01 và F04-G03-M02 (trẻ đề xuất thay đổi; có thể thay bằng tin nhắn);
- F04-G05-M02 (ảnh bài làm: có rủi ro trẻ cảm thấy bị giám sát);
- F02-G05-M02 (phản hồi của trẻ);
- F06-G06-M01/M02 (họp gia đình cuối tuần);
- F07-G03-M03 (đọc ảnh).

## 5. Kiểm tra gate CP-05

- **Bất định lớn đã hiển thị:** GAP-01, 02, 05, 09.
- **Giả định kiểm được:** đặt trong `tools/cost_model.py`.
- **Không gate pháp lý nào bị coi là PASS.**
- **Đã chỉ ra yếu tố có thể đổi khuyến nghị:** bảng §4.
- **Không tuyên bố đã có pilot hay phỏng vấn.**
