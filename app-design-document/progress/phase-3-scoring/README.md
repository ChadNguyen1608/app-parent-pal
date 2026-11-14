# Phase 3.3: chấm điểm tính năng (scoring) và tự kiểm toán

*người soạn: AI; trạng thái: REVIEW, chưa phải quyết định của chủ sản phẩm.*

Thư mục này lưu kết quả bước 3.3 theo prompt chấm điểm v2 (phễu ba lớp: cổng cứng → giá trị → khả năng làm), cùng bản tự kiểm toán có một agent phản biện độc lập.

- **Không chọn MVP.** `mvp_decision = NOT_DECIDED`. Chọn MVP là việc của chủ sản phẩm.
- **Không có điểm tổng.** Mỗi tính năng có nhãn theo từng lớp, không cộng thành một con số.
- **Không đánh dấu PASS cho cổng pháp lý.** H4 và FR-03 vẫn mở.

| Thư mục | Nội dung |
|---|---|
| `review/` | Bản chấm điểm v1: rubric, sổ đánh giá 106 tính năng L3, phụ thuộc và workflow, chi phí, ứng viên gói MVP. Có `data/` (JSON, CSV) và `tools/` (script Python tạo lại báo cáo, cổng chất lượng 25/25) |
| `audit/` | Bản tự kiểm toán: chất lượng chấm điểm, độ mịn phụ thuộc, kiểm A-lite theo workflow, kinh tế vận hành, độ nhạy, tóm tắt sẵn sàng MVP, sổ đề xuất thay đổi PC-01..16, khoảng trống nghiên cứu và câu hỏi OD-A1..A8. Cổng chất lượng 12/12 |
| `audit/baseline_v1/` | Bản đông cứng của `review/` lúc bắt đầu kiểm toán, có `SHA256SUMS`. Không sửa |

## Ghi chú

- Đã soạn ở `documents/app-design-document/phase-3-scoring-review/` và `phase-3-scoring-audit/` trên nhánh cũ, rồi chuyển về đây theo quyết định Q1 (15/11/2026). Một số đường dẫn bên trong `tools/` và `baseline_v1/` vẫn trỏ vị trí cũ. Muốn chạy lại script thì sửa biến đường dẫn ở đầu file.
- Quyết định của chủ sản phẩm ngày 15/11/2026 về OD-A3..A8 được ghi ở bước sau. File này không thay cho sổ quyết định.
- Giá Claude API dùng trong mô hình chi phí là giá niêm yết tra ngày 14/11/2026 (Haiku 5.5 $0,10 / $0,50, Sonnet 5.5 $2 / $10 mỗi triệu token), tỷ giá giả định 26.000 VND/USD.
