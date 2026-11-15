# apps/mobile

Một dự án Expo (SDK 58, cùng phiên bản với `mobile/` cũ), hai biến thể chọn bằng `APP_VARIANT=parent|child` (task T0.8, Tech Spec 13.1 mục 5).
Cài bằng APK nội bộ, người thử tự tải (D-48); không đưa APK vào repo. Không xin quyền GPS, micro, camera ở nấc 1 (D-45).

## Hai biến thể

| | parent | child |
|---|---|---|
| Tên app | Parent-Pal Phụ huynh | Parent-Pal Con |
| applicationId (đã chốt D-51) | `vn.parentbestpal.parent` | `vn.parentbestpal.child` |
| Tab | Lịch tuần, Lên kế hoạch, Tuần qua, Gia đình | Hôm nay, Tuần của con, Của con |
| Thanh trên | (chưa có) | nút "Con cần giúp đỡ" mở màn lời tĩnh + gọi 111, không gửi tin (D-43) |

Các tab chính vẫn là màn giữ chỗ (trừ "Gia đình" của parent và "Của con" của child, đã có lối vào ghép máy và cài đặt; xem T1.7 bên dưới). Chọn biến thể nằm ở `app.config.ts`; code đọc qua `src/variant.ts`. Nhóm route `src/app/(parent)` và `src/app/(child)`: biến thể nào chỉ vào nhóm của mình.

Quyền Android khai báo: `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM` (nhắc giờ chính xác), `RECEIVE_BOOT_COMPLETED` (đặt lại nhắc sau khởi động). `ACCESS_*_LOCATION`, `CAMERA`, `RECORD_AUDIO` bị chặn rõ trong `blockedPermissions` (đã kiểm bằng `expo prebuild`: manifest có `tools:node="remove"`).

## Chạy và kiểm

```bash
cd apps/mobile
npm install
npx tsc --noEmit                              # hoặc npm run typecheck
npm test                                      # test đơn vị lớp dữ liệu (node:test, không cần máy thật)
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

## T1.7: màn đăng nhập, ghép máy, PIN (giao diện + client)

Màn theo IA 06.1 (§3.6, §4.6, §6): PA-01, PA-04 rút gọn, PA-13, PA-14, PA-38 (parent); CA-01, CA-02, CA-03, CA-16 tối thiểu, CA-11, CA-12 (child). D-49: phụ huynh đăng nhập bằng email nhận mã 6 số, không mật khẩu. Máy con đăng nhập ẩn danh.

| Biến thể | Luồng | File (trong `src/app`) |
|---|---|---|
| parent | PA-01 email → mã 6 số → (lần đầu) tên gọi của bạn → thêm con (tên gọi, lớp hoặc tuổi, có máy riêng không) → khung chính | `(parent)/dang-nhap.tsx`, `bat-dau.tsx` |
| parent | Gia đình → Ghép máy (PA-13, nhập mã) → Đặt PIN (PA-14) | `(parent)/ghep-may.tsx`, `dat-pin.tsx` |
| parent | Gia đình → Phiên đăng nhập, Đăng xuất (PA-38) | `(parent)/phien.tsx` |
| child | CA-01 "Lấy mã" (đăng nhập ẩn danh) → CA-02 mã cỡ lớn, thăm dò `pair_accept` mỗi 4 giây hoặc nút "Bố mẹ đã nhập" → CA-03 → CA-16 → khung chính | `(child)/chao.tsx`, `ma-ghep.tsx`, `ghep-xong.tsx`, `bo-me-thay.tsx` |
| child | Của con → Cài đặt (CA-11) → Hủy kết nối → Nhập PIN (CA-12) → `unlink_device` → về CA-01 | `(child)/cai-dat.tsx`, `nhap-pin.tsx` |

Cổng màn hình: `(parent)/_layout.tsx` và `(child)/_layout.tsx` dùng `Stack.Protected` theo giai đoạn trong `src/state/app.tsx` (phụ huynh: loading, out, needHome, ready; máy con: loading, unpaired, justPaired, intro, ready). Nút "Con cần giúp đỡ" (lời tĩnh + 111, không gửi tin, D-43) hiện ở thanh trên mọi màn của child, kể cả khi chưa ghép. Cảnh báo hiện ngay trong màn (`Notice`), không popup. Nút cao tối thiểu 48.

### Cấu hình môi trường

```bash
cd apps/mobile
cp .env.example .env     # .env bị .gitignore, KHÔNG commit
# điền EXPO_PUBLIC_SUPABASE_URL và EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (khóa công khai, không phải service_role)
```

Thiếu cả hai biến và không bật mock thì app hiện màn "Chưa cấu hình" thay vì sập. Phiên đăng nhập lưu bằng `@react-native-async-storage/async-storage` (cách Supabase khuyến nghị cho Expo; phiên ẩn danh của máy con cũng lưu ở đây).

### Chạy với bản giả lập (chưa có backend)

```bash
EXPO_PUBLIC_API_MOCK=1 APP_VARIANT=parent npx expo start --dev-client
EXPO_PUBLIC_API_MOCK=1 APP_VARIANT=child  npx expo start --dev-client
```

Dữ liệu nằm trong bộ nhớ, mất khi đóng app. Hai app là hai tiến trình nên không thấy nhau, vì vậy bản giả lập quy ước (`src/data/mock.ts`): mã OTP đúng là `123456`; mã ghép đúng ở app phụ huynh là `123456` (app con hiện mã đầu tiên cũng là `123456`); PIN mặc định `123456` cho tới khi đặt; app con báo "đã ghép" ở lần `pair_accept` thứ hai (lần đầu: đang chờ). Tên con, email, mã chỉ là dữ liệu giả.

### Lớp dữ liệu (`src/data`)

- `api.ts`: `createSupabaseApi(client)` gọi `supabase.schema('app').rpc(...)`. Hàm: `family_create(p_call_name)`, `touch_active()` (giới hạn 1 lần/giờ ở máy, theo Architecture 12.1), `child_create(p_household, p_call_name, p_grade, p_age_years, p_has_device, p_idempotency_key)` (chữ ký thật ở migration T1.3), `pair_code_create()`, `pair_confirm(p_child, p_code)`, `pair_accept()`, `pin_set(p_pin)`, `unlink_device(p_child, p_pin)`. Đọc hộ/con/liên kết bằng `select` trên `app.members`, `app.children`, `app.device_bindings` (RLS hiện có).
- `errors.ts`: lỗi PostgREST (`message` = mã FORBIDDEN, FROZEN, VALIDATION, NOT_FOUND, UNAUTHENTICATED...; `hint` = lời tiếng Việt) thành `ApiError` có `userMessage` tiếng Việt. Dùng `hint` nếu có chữ Việt, không thì câu dự phòng theo mã. Có thêm lỗi Supabase Auth (OTP sai/hết hạn, quá nhanh, bật/tắt phương thức) và lỗi mạng. Ngữ cảnh `pair` gộp NOT_FOUND và VALIDATION thành một câu "Mã không đúng hoặc đã hết hạn." (AC-FAM-11); ngữ cảnh `pin` đổi FORBIDDEN thành "PIN chưa đúng".
- `mock.ts`: bản giả lập có kiểm đầu vào giống máy chủ (tên, lớp 1-9, tuổi 0-18, cần lớp hoặc tuổi, PIN 6 số, khóa sau 5 lần sai PIN, FROZEN khi bật `frozen`).
- `index.ts`: chọn bản thật/giả theo `src/config.ts` (duy nhất file này import module native).

Test: `npm test` trong `apps/mobile` (26 test: ánh xạ lỗi, kiểm đầu vào, mock, RPC với client giả). Lệnh `npm test` ở gốc repo cũng chạy các test này.

### Giả định về RPC (chờ khớp với T1.5, T1.6)

Chưa có migration cho `pair_*`, `pin_set`, `unlink_device` ở `main`. Client đang giả định, đổi ở `src/data/api.ts` nếu khác:

- `family_create` trả `{ household_id }`; `child_create` trả `{ child_id, ... }` (đã đúng với `child_json` ở T1.3).
- `pair_code_create()` trả `{ code, expires_at }`, mã 6 số (`PAIR_CODE_LENGTH`); hạn mã trong tài liệu là `UNKNOWN` (Tech Spec T-03 đề xuất 10 phút), client chỉ dùng `expires_at` nếu có, không tự hứa thời hạn.
- `pair_accept()` trả `{ child_id }` khi bố mẹ đã nhập mã đúng; trả `NOT_FOUND` khi chưa có liên kết chờ xác nhận (client coi là "đang chờ"). Nếu máy chủ trả trạng thái khác, sửa hàm `pairAccept`.
- PIN 6 số (`PIN_LENGTH`, Tech Spec T-03, đề xuất nội bộ). `pin_set` không nhận PIN cũ nên PA-14 "đổi PIN" chưa hỏi PIN cũ.
- Máy con biết `child_id` của mình qua `pair_accept` hoặc đọc `app.device_bindings` (`state = 'HIEU_LUC'`, `device_user_id` = chính nó), dùng cho `unlink_device`.

## Còn lại của T1.7

Cần làm trên dự án Supabase (chủ sản phẩm hoặc người có quyền; task này không đụng đám mây):

1. Bật schema `app` trong Settings → API → Exposed schemas (để `supabase.schema('app')` chạy).
2. Bật Authentication → Sign In / Providers → Anonymous sign-ins (máy con).
3. Bật Email provider, sửa mẫu thư "Magic Link / Confirm signup" thêm `{{ .Token }}` để gửi mã 6 số (xem docs Supabase: Passwordless email logins). Mặc định thư chỉ có liên kết. Độ dài OTP mặc định 6 số, khớp `OTP_LENGTH`. Dùng SMTP riêng cho gửi thật: dịch vụ mặc định giới hạn rất thấp số thư mỗi giờ.
4. Khớp chữ ký thật của `pair_*`, `pin_set`, `unlink_device` khi T1.5, T1.6 vào `main` (mục trên).
5. Chưa chạy trên máy thật hay giả lập Android: chỉ kiểm `tsc`, `expo config` hai biến thể, `expo export --platform android` (bundle được, cả hai biến thể) và test node. Cần thử tay: chuyển màn tự động khi đổi giai đoạn (`Stack.Protected`), bàn phím, đọc màn hình.
6. Chưa làm: PA-02 (đồng ý), PA-37 (không vào được tài khoản; với OTP có nút "Gửi lại mã"), PA-15 (thông báo ghép/hủy), PA-38 danh sách nhiều phiên, đổi PIN hỏi PIN cũ, CA-15 (xin quyền thông báo), CA-20, PA-03 đầy đủ. Câu chữ CA-16 bám IA 4.6, chờ chủ sản phẩm duyệt.
