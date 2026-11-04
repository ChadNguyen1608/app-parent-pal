# Parent-Pal mobile (phương án A)

App Expo (SDK 58, TypeScript, expo-router, development build). Đặc tả: `documents/app/spec-phuong-an-a-app-android.md`.

Bước 1: màn **Phòng thử** (`src/lab/`) có 5 nút thử nhanh và nhật ký sự kiện (giờ hẹn, giờ thật, độ lệch, % pin) lưu trong SQLite trên máy.

```bash
npm install
npx tsc --noEmit
npx expo-doctor
```

Không chạy được bằng Expo Go. Build APK cài thử bằng hồ sơ `preview` (cần tài khoản Expo, hỏi chủ sản phẩm trước):

```bash
npx eas-cli@latest build --platform android --profile preview
```

Thông báo đẩy (nút 5) cần thêm `google-services.json` của Firebase, nạp bằng file secret của EAS. Không commit file này.

Báo thức native (Kotlin, `modules/`) làm ở bước 3.
