# Nhật ký test app Android (phương án A)

Ghi mỗi lần cài APK lên máy thật. Không ghi tên con, trường, địa chỉ; dùng mã gia đình (GĐ-1, GĐ-2…). Điều kiện đạt: `spec-phuong-an-a-app-android.md` §6.

## Máy test

| Mã máy | Hãng, đời máy | Android | Gia đình | Ghi chú tối ưu pin |
|---|---|---|---|---|
| M-1 | | | | |

## Kết quả

| Ngày | Bản build | Mã máy | Tính năng | Kết quả đo | Đạt? | Ghi chú |
|---|---|---|---|---|---|---|
| | | | | | | |
| 2026-11-05 | EAS preview (trước khi sửa) | M-1 | 2 Vùng GPS | Lỗi "Not authorized to use background location services" khi bấm nút | Không | Đã sửa: xin quyền nền trước khi hỏi trạng thái vùng (chờ build lại) |
| 2026-11-05 | EAS preview | M-1 | 5 Thông báo đẩy | Chỉ thấy "Đã gửi yêu cầu đẩy", không thấy kết quả | Chưa rõ | Đã thêm ghi phiếu và biên nhận FCM vào nhật ký (chờ build lại) |
| 2026-11-05 | EAS preview | M-1 | 3 Ghi âm | Ghi được, chưa có nút nghe lại | Chưa đánh giá | Đã thêm nút "Nghe lại" (chờ build lại) |
| 2026-11-05 | EAS preview | M-1 | 1 Nhắc giờ | Lệch +45 giây (ngưỡng đạt: dưới 1 phút) | Đạt sát ngưỡng | Thiếu quyền báo thức chính xác nên Android hẹn gần đúng; đã thêm quyền (chờ đo lại) |
| 2026-11-05 | EAS preview | M-1 | 4 Chụp ảnh | Ảnh đã thu nhỏ | Đạt | |
