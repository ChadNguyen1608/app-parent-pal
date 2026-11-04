# Test tự động trên emulator và mục phải test trên máy thật

Quy trình: Claude sửa mã, build, cài APK lên emulator, chạy luồng Maestro, đọc log và ảnh màn hình, sửa tiếp. Điều kiện đạt của từng bước vẫn do máy thật quyết định (`spec-phuong-an-a-app-android.md` §6).

## Cài một lần (Windows)

- JDK 17 (Temurin), Android SDK (platform-tools, emulator, `system-images;android-34;google_apis_playstore;x86_64`), AVD tên `pp-test`, Maestro.
- Biến `ANDROID_HOME` trỏ tới `%LOCALAPPDATA%\Android\Sdk`.

## Chạy

```bash
powershell -File scripts/test-loop.ps1 -Apk <đường dẫn file .apk>
```

Kết quả ở `mobile/test-reports/<giờ>/` (không commit): `report.xml`, log Maestro, `logcat-warn.txt`, `logcat-app.txt`, `man-hinh-cuoi.png`.

APK lấy từ EAS (hồ sơ `preview`) hoặc build trên máy. Luồng nằm ở `mobile/.maestro/`.

## Emulator kiểm được

| Việc | Luồng |
|---|---|
| Mở app, đủ 4 tab, màn Phòng thử có 5 nút | `01-mo-app` |
| Nhắc giờ: hẹn, thông báo tới, độ lệch ra số dương | `02-nhac-gio` |
| Ghi âm 5 giây | `03-ghi-am` |
| Chụp ảnh, ảnh được thu nhỏ | `04-chup-anh` |
| Đường xin quyền vị trí; đặt vùng GPS (emulator không cấp vị trí ổn định, nên luồng chấp nhận cả lỗi "lấy vị trí") | `05-vung-gps` |
| Nạp lịch mẫu: quỹ giờ, Lịch tuần có cảnh báo cân bằng, tab Của con | `06-lich-mau` |
| Trò chuyện với Pal giả lập: tạo hồ sơ, hoạt động, lịch tuần; hủy ngày ốm chỉ tuần này | `07-tro-chuyen` |
| Lỗi chạy, lỗi JS, quyền thiếu | logcat |

Quyền được cấp bằng `adb shell pm grant`, nên hộp thoại xin quyền không được test ở đây.

## Lưu ý khi viết luồng

- `launchApp` mặc định ép dừng app, và Android xóa thông báo của app bị ép dừng. Muốn kiểm thông báo thì dùng `launchApp` với `stopApp: false`.
- Maestro chỉ thấy chữ đang nằm trong màn hình và so khớp cả đoạn chữ của một ô (nên dùng `.*`). Phần dưới màn hình cần `scrollUntilVisible`.
- Thỉnh thoảng Maestro báo `Connection timed out` khi mở app: chạy lại.

## Chỉ test được trên máy thật (ghi lại để test sau)

| Mục | Vì sao emulator không đo được | Cách test trên máy thật | Bước |
|---|---|---|---|
| Nhắc lệch không quá 1 phút trong 7 ngày | Emulator không mô phỏng Doze, tiết kiệm pin, hãng máy | Hẹn nhiều nhắc, để máy khóa, bật tiết kiệm pin, đọc độ lệch trong nhật ký | 3 |
| Báo thức sáng reo cả khi máy im lặng | Cần phần cứng loa, chế độ im lặng thật | Đặt báo thức, bật im lặng, đo | 3 |
| Hộp thoại xin quyền, màn "Luôn cho phép" vị trí | Maestro không điều khiển ổn màn cài đặt hệ thống; khác theo hãng | Làm tay theo hướng dẫn trên máy | 1, 4 |
| Vào/ra vùng GPS khi đi bộ, chậm không quá 5 phút | Vị trí giả không phản ánh cảm biến, Wi-Fi, cell thật | Đi bộ ra và vào vùng 100 m, ghi giờ báo | 4 |
| Pin hao thêm dưới 5%/ngày | Emulator không có pin thật | Theo dõi % pin cả ngày | 4 |
| Tối ưu pin theo hãng (Xiaomi, Oppo, Samsung…) | Chỉ có trên ROM thật | Làm theo màn hướng dẫn, thử lại nhắc và vùng | 4, 6 |
| Thông báo đẩy tới trong 30 giây khi app đóng | Mạng, FCM và Doze thật khác emulator | Gửi đẩy khi app bị vuốt đóng, 4G | 5 |
| Ghi 2 phút gửi xong dưới 30 giây qua 4G | Cần mạng di động thật | Đo trên 4G | 5 |
| Chất lượng âm thanh ghi, độ rõ ảnh chụp bài làm | Camera và mic giả | Nghe lại, xem ảnh thật | 1, 5 |
| Ít nhất 3 hãng máy | Chỉ máy thật | Hai tuần test với gia đình | 6 |

Kết quả đo ghi vào `ref-nhat-ky-test.md`.
