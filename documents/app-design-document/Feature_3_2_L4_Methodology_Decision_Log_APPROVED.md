# PARENT-PAL — Nhật ký quyết định phương pháp phân rã L4

**Ngày:** 2026-11-10  
**Quyết định:** M-Q1=A; M-Q2=A; M-Q3=A; M-Q4=A; M-Q5=A; M-Q6=A  
**Trạng thái:** `OWNER_APPROVED_METHODOLOGY / PILOT_REVIEW_ONLY` (phương pháp đã được chủ sản phẩm chấp thuận; nội dung thử nghiệm chỉ để rà soát)  
**Mốc tham chiếu:** Blueprint 3.2-R1 trên `main`, 8 domain / 51 group / 106 L3. PR #16 đã merge.  
**Phạm vi PR này:** Phương pháp L4 và thử nghiệm trên đúng ba L3; không thay đổi tài liệu chuẩn (canonical).

| Quyết định | Quy tắc đã chốt |
|---|---|
| M-Q1 | Mỗi L4 có một kết quả chính có thể kiểm thử độc lập; không ấn định số lượng L4 cho mỗi L3 |
| M-Q2 | Đặc tả đầy đủ theo schema 3.2, bổ sung quyền truy cập, chủ sở hữu dữ liệu, sáu nhóm tuổi, workflow, truy vết, tiêu chí nghiệm thu và trường hợp lỗi; ghi `UNKNOWN` kèm vấn đề cần xử lý |
| M-Q3 | Giữ nguyên ID L4 minh họa đã công bố; dùng ID `CAND-` cho đề xuất mới cho đến khi rà soát ranh giới |
| M-Q4 | Áp dụng P0–P6 theo ưu tiên rủi ro; mở yêu cầu thay đổi L3 thay vì tự ý sửa ranh giới trách nhiệm |
| M-Q5 | Thử nghiệm `F01-G04-M01`, `F06-G07-M01`, `F04-G02-M03` |
| M-Q6 | Đưa phương pháp, bản thử nghiệm và test case vào PR để review; không sửa 3.2/3.3/3.4 hoặc merge khi chưa có phê duyệt riêng |

**Phạm vi phê duyệt:** Chỉ phê duyệt *phương pháp*, không đồng nghĩa phê duyệt L4 ứng viên, quyền theo độ tuổi/pháp luật, ngưỡng an toàn, chất lượng model, điều kiện phát hành, triển khai hoặc MVP.

**Trình tự review:** P0 đối chiếu nguồn và ranh giới → P1 liệt kê kết quả chức năng → P2 tách/gộp/tái sử dụng/chuyển owner → P3 đặc tả hợp đồng chức năng → P4 truy vết/test case → P5 rà soát liên chức năng → P6 chủ sản phẩm phê duyệt và đề xuất thay đổi canonical. Hiện tại mới đạt **bản nháp P4**; P5/P6 chưa hoàn thành.

**Người cần xác nhận:** Product Owner chốt ranh giới và danh sách ứng viên; chuyên gia pháp lý/quyền riêng tư rà soát quyền và dữ liệu; chuyên gia giáo dục đánh giá rubric/phản hồi; chuyên gia phát triển trẻ em và an toàn rà soát cân bằng; kỹ thuật đánh giá tính khả thi. **Chưa chạy test trên phần mềm.**
