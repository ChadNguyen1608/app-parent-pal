# Phương án A: app Android thử nghiệm (đặc tả để dựng)

- **Trạng thái:** đã chốt ngày 04/11/2026 (chủ sản phẩm). Người soạn: AI (Claude).
- **Người dựng:** Claude Code, làm việc cùng chủ sản phẩm.
- **Tài liệu gốc:** "Parent-Pal – Phương án triển khai app Android thử nghiệm" (Claude Docs). File này là bản rút gọn để dựng; khi hai bản khác nhau, hỏi chủ sản phẩm.

## 1. Mục tiêu

Chứng minh 5 tính năng chạy được trên điện thoại Android thật, gắn vào lịch của Pal, test với 1–3 gia đình quen:

1. nhắc theo khối lịch (gồm báo thức buổi sáng reo to);
2. vùng GPS Nhà, Trường, nơi học thêm;
3. ghi âm;
4. chụp ảnh bài làm;
5. thông báo đẩy giữa máy bố mẹ và máy con.

**Không làm ở phương án A:** tài khoản riêng từng người, iPhone, Google Play, quy tắc chạy phía máy chủ, bộ lập lịch máy chủ. Những phần này thuộc phương án B, làm trên **cùng bộ mã**, nên đừng chọn thứ gì khiến B phải viết lại.

## 2. Công nghệ đã chốt

| Phần | Chọn | Ghi chú |
|---|---|---|
| App | Expo (React Native, TypeScript), `expo-router`, development build | Không dùng Expo Go (không có thông báo đẩy, không có vị trí nền). Dùng bản SDK ổn định mới nhất lúc bắt đầu, kiểm tra trên docs.expo.dev |
| Dữ liệu trên máy | `expo-sqlite` | Lịch, nhật ký phòng thử vẫn dùng được khi mất mạng |
| Nhắc giờ | `expo-notifications` (thông báo cục bộ hẹn giờ) | Có nút "Xong" ngay trên thông báo |
| Báo thức sáng | Module native nhỏ (Kotlin) gọi `AlarmManager.setAlarmClock` | Không cần quyền `SCHEDULE_EXACT_ALARM` |
| Vùng GPS | `expo-location` + `expo-task-manager` (geofence) | Chỉ sự kiện vào/ra vùng, **không theo dõi liên tục** |
| Ghi âm | `expo-audio` | |
| Ảnh | `expo-camera` hoặc `expo-image-picker` | |
| Máy chủ | Supabase gói miễn phí: đăng nhập, Postgres, lưu file, Edge Functions | |
| Pal | Edge Function `pal-chat` gọi Claude API | Khóa API chỉ nằm ở secret của Supabase |
| Thông báo đẩy | Expo Push + Firebase Cloud Messaging | |
| Build | EAS Build hồ sơ `preview` ra **APK** (`buildType: apk`), hoặc build trên máy | Gói EAS miễn phí khoảng 15 bản Android/tháng |

## 3. Cấu trúc repo

```
mobile/          App Expo (package.json riêng)
  src/app/       Màn hình (expo-router)
  src/pal/       Prompt, bộ kiểm tra cân bằng, kiểu dữ liệu kế hoạch
  src/lab/       Màn phòng thử và nhật ký sự kiện
  modules/       Module native (báo thức)
supabase/        migrations/, functions/pal-chat/, functions/push/
documents/       Tài liệu (không đổi)
prototype/       Bản thử web (giữ để đối chiếu, không xóa)
```

Bản thử Expo cũ (đồng hành trò chuyện, trước 28/10/2026) nằm ở commit `9abc286`. Có thể lấy lại `src/ai/safety.ts` (lớp an toàn chạy trước AI) và cấu hình test; phần còn lại không dùng.

## 4. Ràng buộc bắt buộc

- **Repo công khai.** Không commit khóa API, `.env`, `google-services.json`, khóa ký APK, dữ liệu thật của trẻ. Dùng secret của EAS và Supabase. Thêm vào `.gitignore` ngay từ commit đầu.
- **Khóa Claude API không bao giờ nằm trong app.** App gọi `pal-chat`; hàm này giới hạn số lượt mỗi máy mỗi ngày.
- **Ẩn danh trước khi gửi Claude** (CLAUDE.md): `pal-chat` thay tên con, tên trường, địa chỉ bằng mã (`[CON_1]`, `[TRUONG_1]`…) trước khi gửi, rồi thay ngược khi nhận. Toạ độ GPS không bao giờ gửi cho Pal; Pal chỉ biết "đã vào vùng Trường lúc 7:02".
- **Lớp an toàn chạy trước AI.** Tin nhắn khẩn chỉ trả thông tin hỗ trợ (111, 113, 115), không gọi Claude.
- **Quyền truy cập dữ liệu:** dù chỉ có một mã gia đình, vẫn bật Postgres RLS theo `family_id` ngay từ đầu (khóa anon của Supabase là công khai). Cấu trúc bảng chừa chỗ cho phạm vi riêng và cả nhà của phương án B.
- **Dữ liệu trẻ:** chỉ lưu sự kiện vào/ra vùng, không lưu chuỗi toạ độ. Ảnh và ghi âm có hạn xóa (mặc định 30 ngày, đề xuất nội bộ). Gia đình test ký phiếu đồng ý trước khi cài (chủ sản phẩm lo).
- **Quy tắc của Pal:** nguồn chuẩn là `documents/pal/spec-quy-tac-lap-lich.md`. Đổi quy tắc thì sửa file đó trước, rồi mới sửa prompt trong `mobile/src/pal/`, `prototype/index.html` và skill `lap-lich-sinh-hoat-tre`.
- **Không popup.** Cảnh báo hiện một lần, nằm trong trang (giống bản thử web). Mỗi cảnh báo ghi rõ lý do hoặc mốc tham khảo.
- **Agent:** chỉ tạo agent khi chủ sản phẩm cho phép.

## 5. Chuyển từ bản thử web

`prototype/index.html` là bản chạy đúng nhất hiện nay. Chuyển sang TypeScript, giữ nguyên hành vi:

| Trong bản thử | Chuyển sang |
|---|---|
| `RULES`, `ACT_RULES`, `LIFE_RULES`, `OUTPUT_FORMAT` | `mobile/src/pal/prompt.ts`; phía máy chủ ghép prompt (để B đưa hẳn lên máy chủ) |
| `checkDayK`, `checkDay`, `relaxed` | `mobile/src/pal/balance.ts`, có test đơn vị |
| `judge`, `defaultBudget`, `renderBudget` | Màn Lên kế hoạch, phần quỹ giờ |
| `applyActs`, `renderActs`, `fixedDay` | Hoạt động cố định của con |
| `renderPlan`, giai đoạn tạm thời, ngoại lệ trong tuần | Màn Lịch tuần |
| `renderToday`, nút Xong, báo đói, thời tiết | Màn Của con (máy con) |
| `sample.json(...)`, `TOOLS` | Gọi `pal-chat`; giữ 4 tool của bản thử: `luu_ho_so`, `cap_nhat_tong_quan`, `cap_nhat_ngay`, `xoa_ngoai_le` |
| `localStorage`, `db` của artifact | SQLite trên máy + bảng Supabase |

Ba tab giữ tên: 🧭 Lên kế hoạch, 🗓️ Lịch tuần, 🧒 Của con. Đặc tả giao diện: `documents/pal/spec-quy-thoi-gian-va-tab-cua-con.md`.

## 6. Các bước và điều kiện đạt

Mỗi bước là một nhánh và một PR. Xong bước nào thì build APK, cài lên máy thật, ghi kết quả vào `documents/app/ref-nhat-ky-test.md`.

| Bước | Việc | Đạt khi |
|---|---|---|
| 1 | Dựng `mobile/` và `supabase/`; màn Phòng thử có 5 nút thử nhanh; nhật ký sự kiện (giờ hẹn, giờ thật, độ lệch, % pin); hồ sơ EAS `preview` | Cài được APK qua link EAS hoặc ADB; 5 nút thử chạy trên máy thật |
| 2 | Chuyển prompt, `checkDayK`, lịch tuần, quỹ giờ, tab Của con; `pal-chat` có ẩn danh, giới hạn lượt, lớp an toàn | Test đơn vị của `balance.ts` cho cùng kết quả với bản thử trên 3 lịch mẫu; trò chuyện tạo được lịch tuần |
| 3 | Mỗi khối lịch thành một lời nhắc cục bộ, nút "Xong" trên thông báo; Pal sửa lịch thì đặt lại toàn bộ lời nhắc; báo thức sáng | Máy khóa, bật tiết kiệm pin: nhắc lệch không quá 1 phút trong 7 ngày; báo thức reo cả khi máy im lặng, tắt bằng một chạm |
| 4 | Vùng Nhà, Trường, nơi học thêm; lệch mốc an toàn thì đẩy thông báo cho bố mẹ; màn hướng dẫn tắt tối ưu pin theo hãng | Báo "đã vào trường" chậm không quá 5 phút; pin hao thêm dưới 5%/ngày (mục tiêu tự đặt) |
| 5 | Chụp ảnh, ghi âm gửi Pal nhận xét; đề xuất và báo đói của con đẩy sang máy bố mẹ; bố mẹ duyệt thì máy con nhận | Ghi 2 phút gửi xong dưới 30 giây qua 4G; đẩy tới trong 30 giây kể cả khi app đóng |
| 6 | Hai tuần test với gia đình, ít nhất 3 hãng máy | Đo theo cột "Đạt khi" ở trên; tổng hợp vào nhật ký test |

**Cổng A:** chỉ bàn sang phương án B khi 5 tính năng đạt. Kết quả do chủ sản phẩm quyết.

## 7. Quyền Android cần xin

| Quyền | Dùng cho | Khi nào xin |
|---|---|---|
| `POST_NOTIFICATIONS` | Mọi thông báo (Android 13+) | Lần đầu mở app |
| `SCHEDULE_EXACT_ALARM` | Nhắc đúng phút; từ Android 14 mặc định tắt | Màn riêng, có giải thích; không có thì nhắc sớm vài phút |
| `ACCESS_FINE_LOCATION`, `ACCESS_BACKGROUND_LOCATION` | Vùng GPS ("Luôn cho phép") | Khi bố mẹ bật vùng, giải thích trước |
| `RECORD_AUDIO`, `CAMERA` | Ghi âm, ảnh | Lần đầu dùng |
| Bỏ tối ưu pin | Giữ nhắc và vùng khi máy ngủ | Màn hướng dẫn theo hãng |

## 8. Việc phải hỏi chủ sản phẩm, không tự làm

- Tạo dự án Supabase, tài khoản Firebase, tài khoản Expo, khóa Claude API và hạn mức chi tiêu.
- Bất kỳ chi phí nào, kể cả gói trả phí "tạm".
- Đổi quy tắc lập lịch hay thêm cảnh báo mới.
- Gửi APK cho gia đình test.
