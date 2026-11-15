# apps/mobile

Một dự án Expo (SDK 58, cùng phiên bản với `mobile/` cũ), hai biến thể chọn bằng `APP_VARIANT=parent|child` (task T0.8, Tech Spec 13.1 mục 5).
Cài bằng APK nội bộ, người thử tự tải (D-48); không đưa APK vào repo. Không xin quyền GPS, micro, camera ở nấc 1 (D-45).

## Hai biến thể

| | parent | child |
|---|---|---|
| Tên app | Parent-Pal Phụ huynh | Parent-Pal Con |
| applicationId (ĐỀ XUẤT, chưa chốt) | `vn.parentpal.parent` | `vn.parentpal.child` |
| Tab | Lịch tuần, Lên kế hoạch, Tuần qua, Gia đình | Hôm nay, Tuần của con, Của con |
| Thanh trên | (chưa có) | nút "Con cần giúp đỡ" mở màn lời tĩnh + gọi 111, không gửi tin (D-43) |

Mỗi tab hiện là màn giữ chỗ. Chọn biến thể nằm ở `app.config.ts`; code đọc qua `src/variant.ts`. Nhóm route `src/app/(parent)` và `src/app/(child)`: biến thể nào chỉ vào nhóm của mình.

Quyền Android khai báo: `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM` (nhắc giờ chính xác), `RECEIVE_BOOT_COMPLETED` (đặt lại nhắc sau khởi động). `ACCESS_*_LOCATION`, `CAMERA`, `RECORD_AUDIO` bị chặn rõ trong `blockedPermissions` (đã kiểm bằng `expo prebuild`: manifest có `tools:node="remove"`).

## Chạy và kiểm

```bash
cd apps/mobile
npm install
npx tsc --noEmit                              # hoặc npm run typecheck
APP_VARIANT=parent npx expo config --json     # hoặc npm run config:parent
APP_VARIANT=child  npx expo config --json
```

Không chạy được bằng Expo Go (có module native). Chạy thử trên máy cần development build; xem phần dưới.

## Đo nhắc giờ (`src/lab`)

Rút gọn từ `mobile/src/lab` (D-50): nút hẹn nhắc sau 60 giây, nút thông báo đẩy, nhật ký SQLite ghi giờ hẹn, giờ thật, độ lệch, % pin. Đã bỏ vùng GPS, ghi âm, chụp ảnh. Màn mở ở route `/lab`, có đường vào ở tab "Gia đình" (parent) và "Của con" (child). Chỉ bật khi `extra.labEnabled` (hiện cả hai biến thể đều bật vì chỉ có bản nội bộ; tắt ở bản gia đình thật bằng cờ `lab` trong `app.config.ts`).

## Build APK cục bộ (làm sau, chưa chạy ở T0.8)

Cần Android SDK + JDK 17 trên máy build. Không cần tài khoản EAS.

```bash
cd apps/mobile
APP_VARIANT=parent npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease     # APK ở android/app/build/outputs/apk/release/
```

Lặp lại với `APP_VARIANT=child`. `android/` bị `.gitignore`. APK release cần khóa ký: dùng keystore riêng, không commit. Build trên EAS đám mây (`eas.json` hồ sơ `preview`, `preview-child`) cần tài khoản Expo: hỏi chủ sản phẩm trước.

Thông báo đẩy (FCM) cần `google-services.json` của Firebase. Chỉ nạp qua biến môi trường `GOOGLE_SERVICES_JSON` (đường dẫn file; trên EAS là biến loại file). Không có biến này thì build vẫn chạy, nhắc cục bộ vẫn dùng được, nút đẩy báo lỗi. Hai biến thể có hai applicationId nên cần hai app Android trong Firebase.

## Đã làm trong T0.8

- Khung Expo hai biến thể, `eas.json`, `tsc` sạch, `expo config` đúng cho cả hai.
- Tái dùng chọn lọc: cấu hình, `src/lab` (đo nhắc giờ), kiểu `Block`/`Plan` ở `src/types/plan.ts`. Không lấy Pal chat, geofence, ảnh, ghi âm, mã gia đình.

## Còn lại

- Chưa build APK thật, chưa chạy trên máy thật (không có Android SDK/EAS ở môi trường này).
- `expo-doctor` không chạy hết được vì chặn mạng tới exp.host (18/20 kiểm tra đạt, 2 kiểm tra cần mạng).
- applicationId, tên app, icon: tạm, chờ chủ sản phẩm chốt. Chưa có `extra.eas.projectId` (cần tài khoản Expo).
- Câu chữ màn "Con cần giúp đỡ" là giữ chỗ; câu thật lấy từ `packages/content` sau khi duyệt.
- Module báo thức native (AlarmManager.setAlarmClock) làm ở T3.x; hiện nhắc dùng `expo-notifications`.
- Chưa có `src/features`, `src/data`, `src/notifications` (các task sau).
- Kiểu `Block`/`Plan` sẽ chuyển sang `packages/domain` khi kiểu chung được chốt.
