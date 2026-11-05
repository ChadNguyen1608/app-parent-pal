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

APK lấy từ EAS (hồ sơ `preview`) hoặc build trên máy bằng `powershell -File scripts/build-local.ps1` (khoảng 8 phút sau lần đầu; không tốn lượt EAS). Bản build máy ký bằng khóa debug nên phải `adb uninstall vn.parentpal.app` trước khi cài. Script sao chép dự án sang `C:p` vì đường dẫn build C++ trong thư mục dự án vượt giới hạn 248 ký tự của Windows. Luồng nằm ở `mobile/.maestro/`.

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
| Pal thật qua cầu nối máy dev: hỏi lại, rồi lập hồ sơ và lịch tuần (cần `node scripts/pal-bridge.mjs` chạy trong terminal đã đăng nhập claude) | `08-pal-that` |
| Lỗi chạy, lỗi JS, quyền thiếu | logcat |

Quyền được cấp bằng `adb shell pm grant`, nên hộp thoại xin quyền không được test ở đây.

## Lưu ý khi viết luồng

- `launchApp` mặc định ép dừng app, và Android xóa thông báo của app bị ép dừng. Muốn kiểm thông báo thì dùng `launchApp` với `stopApp: false`.
- Maestro chỉ thấy chữ đang nằm trong màn hình và so khớp cả đoạn chữ của một ô (nên dùng `.*`). Phần dưới màn hình cần `scrollUntilVisible`.
- Thỉnh thoảng Maestro báo `Connection timed out` khi mở app: chạy lại.

## Pal thật qua cầu nối (đo ngày 2026-11-04)

- Lượt hỏi đáp thường: 12 đến 21 giây. Lượt lập hồ sơ và lịch tuần: 133 đến 146 giây, có lần quá 180 giây; Pal trả khoảng 26.000 đến 30.000 ký tự JSON. Đây là độ trễ cần giảm trước khi cho người dùng thật dùng (rút gọn đầu ra, lập lịch theo từng ngày, hoặc truyền dần).
- Pal thật hỏi lại (bệnh nền, giờ ngủ dậy) trước khi lập lịch, nên luồng trả lời thêm một lượt.
- Cầu nối phải chạy trong terminal của chính bạn. Chạy từ trong một phiên Claude Code khác sẽ kế thừa biến môi trường của phiên đó và báo lỗi OAuth; cầu nối đã tự bỏ các biến CLAUDE*, ANTHROPIC*.
- Bản APK cần cho phép HTTP thường (đã bật cho mọi hồ sơ trừ production) thì app mới gọi được http://10.0.2.2:8787.
- Maestro: chờ Pal bằng ngủ cố định vì chữ "Pal đang nghĩ…" có thể nằm ngoài màn hình; bàn phím che nút Gửi nên phải `hideKeyboard` rồi cuộn tới nút.

## Pal thật bằng API key (Haiku) và tiết kiệm token

- Đặt key vào file `key/anthropic-api-key.txt` (thư mục `key/` không vào git) hoặc biến `ANTHROPIC_API_KEY`, rồi chạy `node scripts/pal-bridge.mjs`. Có key thì cầu nối gọi thẳng API với model `claude-haiku-5-5` (đổi bằng `--model`, mức nỗ lực bằng `--effort low|medium|high`, mặc định low); không có key thì dùng `claude -p`. **Key không bao giờ nằm trong app**: file APK giải nén được, lộ key là người khác dùng tiền của bạn.
- Mỗi lượt cầu nối in số token vào, ghi cache, đọc cache, ra và chi phí ước tính. Haiku 5.5 giá 0,10 đô la / 1 triệu token vào, 0,50 đô la / 1 triệu token ra (dưới 100K token vào); không nhận `temperature` khác mặc định.
- Đã giảm token: (1) luật cố định (khoảng 20.000 ký tự) tách thành `system` có `cache_control`, từ lượt hai tính khoảng 10% giá; (2) lịch gửi lên bỏ trường rỗng, nhỏ hơn khoảng 30%; (3) Pal được phép gộp các ngày giống hệt nhau trong một mục (`"ngay":["T2","T3"]`) và bỏ trường rỗng, vì đầu ra là phần tốn nhất; (4) hội thoại gửi 10 tin gần nhất thay vì 14.
- Đã đo thật (2026-11-05, Haiku 5.5, mức nỗ lực low, app bản mới trên emulator):
  - Lượt chat: 13.225 token vào, 515 ra, 3 giây, khoảng 0,0016 đô la.
  - Lượt lập lịch lớp 3: 13.717 token vào, 2.749 ra, 10 giây, khoảng 0,0027 đô la (trước đây qua Claude Code: 133–146 giây, 26–30 nghìn ký tự ra). Cờ Lịch tuần có "lớp 3": luồng 08 qua.
  - Haiku 5.5 bật suy nghĩ mặc định: lượt lập lịch từng dùng hết 8.000 token ra cho suy nghĩ, không ra chữ nào. Cầu nối nay tắt suy nghĩ mặc định (`--think on` để bật lại).
  - Bộ nhớ đệm chưa chạy: log luôn báo ghi cache 0, đọc cache 0, có thể do phần system chưa đủ dài tối thiểu để API lưu đệm. Chi phí đã rất thấp nên chưa gấp; xem lại khi chuyển sang Edge Function.

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
