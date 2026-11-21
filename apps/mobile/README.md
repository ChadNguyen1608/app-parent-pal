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

Test: `npm test` trong `apps/mobile` (43 test: ánh xạ lỗi, kiểm đầu vào, mock, RPC với client giả, hợp đồng với migration SQL). Lệnh `npm test` ở gốc repo cũng chạy các test này.

### Hợp đồng RPC

Khớp migration `20261115140000` (T1.2), `150000` (T1.5), `160000` (T1.6) và `120000` (T1.3) ở `backend/supabase/`. Nguồn chuẩn là SQL; `test/contract.test.ts` đọc SQL và kiểm mọi lời gọi trong `src/data/api.ts` (tên hàm, tên tham số, tham số bắt buộc, quyền EXECUTE cho `authenticated`, trường kết quả, chuỗi nhận diện lỗi). Backend đổi chữ ký thì test này đỏ trước khi app lệch.

| Hàm | Client gửi | Client đọc |
|---|---|---|
| `family_create` | `p_call_name` | `household_id`, `replay` |
| `touch_active` | không | `touched` |
| `child_create` | `p_household`, `p_call_name`, `p_grade`, `p_age_years`, `p_has_device`, `p_idempotency_key` | `child_id` |
| `pair_code_create` (máy con) | không | `code`, `expires_at` |
| `pair_confirm` (QL) | `p_child`, `p_code`, `p_pin` (chỉ lần ghép đầu) | `ok`, `state`, `epoch`, `pin_set` |
| `pair_pending` (máy con) | không | `pending`, `adult_call_name`, `expires_at` |
| `pair_accept` (máy con) | không | `ok`, `child_id`, `epoch` |
| `pair_decline` (máy con) | không | `ok` |
| `pin_set` (QL) | `p_pin` | `ok` |
| `unlink_device` | `p_child`, `p_pin`, `p_binding_epoch` (máy con bắt buộc) | `ok` |

**Hai kiểu lỗi.** (1) Lỗi raise: `error.message` là mã (`FORBIDDEN`, `FROZEN`, `VALIDATION`, `NOT_FOUND`, `CONFLICT_REV`, `RATE_LIMITED`...), `hint` là lời Việt, `details` là quy tắc. (2) Thất bại cần đếm trả HTTP 200 `{"ok": false, "error": {code, rule, message_vi, attempts_left?, locked_until?}}`: `pair_confirm` (mã sai, mọi lý do liên quan tới mã), `unlink_device` (PIN sai), `pair_accept` (quá hạn). `rpcOk` trong `api.ts` đổi `ok:false` thành `ApiError`; **thiếu `ok` cũng bị từ chối** (không bao giờ coi là thành công, nhất là `unlink_device`). Chỗ gọi chỉ cần try/catch.

**Hiện lỗi PIN và khóa bằng lời, không popup.** `pinWrongMessage` (`errors.ts`): "PIN chưa đúng. Bạn còn N lần thử." hoặc, khi đã khóa, "...tạm khóa... thử lại sau khoảng X phút" (làm tròn lên). `ApiError.attemptsLeft` và `.lockedUntil` giữ số liệu thô. PIN đang khóa khi gọi lại là `RATE_LIMITED` (raise) với lời của máy chủ. Mã sai ở `pair_confirm` luôn là một câu chung "Mã không đúng hoặc đã hết hạn." (AC-FAM-11); vượt ngưỡng thì `RATE_LIMITED`.

**PA-13 và PIN lần đầu.** Client không có cách hỏi "đã có PIN chưa" (bảng `private.parent_pins` không mở API). PA-13 gửi `pair_confirm` không PIN; máy chủ kiểm PIN trước khi tính mã nên trả `VALIDATION` rule `FR-01` "Cần đặt Parent PIN khi ghép lần đầu." mà không tốn lần thử mã. Khi đó màn hiện ô đặt PIN (nhập hai lần) và gửi lại cùng mã kèm `p_pin`. Nếu PIN đã có mà gửi PIN thì máy chủ báo "Đã có PIN" và màn ẩn ô PIN. Nhận diện bằng rule và tiền tố hint (`PIN_REQUIRED_*` trong `validate.ts`, test hợp đồng kiểm các chuỗi này còn trong SQL). PA-14 vẫn dùng `pin_set` để đặt trước hoặc đổi (không PIN cũ).

**Máy con (CA-02).** Sau khi có mã, thăm dò `pair_pending` mỗi 4 giây (không còn coi `NOT_FOUND` là đang chờ). Có yêu cầu thì hiện "Kết nối với [tên]? Đồng ý / Không": Đồng ý gọi `pair_accept` (quá hạn: lời "Yêu cầu ghép đã hết hạn. Hãy tạo mã mới." rồi tự lấy mã mới), Không gọi `pair_decline` rồi lấy mã mới. `epoch` từ `pair_accept` (và đọc lại từ `device_bindings.epoch` khi mở app) lưu ở `useApp().bindingEpoch`; CA-12 gửi nó vào `unlink_device`. `CONFLICT_REV` (liên kết đã đổi): CA-12 hiện nút "Tải lại thông tin kết nối" gọi `refreshBinding` (không còn liên kết thì về CA-01).

**`pair_confirm` trả `CHO_XAC_MINH`** (máy từng ghép ở hộ khác): máy con không thấy yêu cầu và không có quyền gì (AC-FAM-16). PA-13 báo "cần xác minh thêm, chưa kết nối ngay"; nấc 1 chưa có đường xác minh tiếp.

**`touch_active`.** Gọi khi người lớn mở app và mỗi lần app trở lại nền trước (chỉ khi đã có hộ), client giới hạn 1 lần/giờ như `touch_active_min_interval_minutes = 60` (tham số chưa chốt `CHUA_CHOT`). Máy con không gọi (máy chủ trả `FORBIDDEN`).

**Chưa có trong hợp đồng (Edge Function sau này):** hủy phiên ẩn danh của máy con và xóa token đẩy sau `unlink_device`, thông báo cho QL. Sau `unlink_device` thành công, máy con tự đăng xuất cục bộ.

### Đăng nhập bằng link trong thư (D-59)

Trong lúc phát triển, thư dùng máy chủ thư mặc định của Supabase và chưa sửa được mẫu, nên thư có thể chỉ có link, không có mã 6 số. PA-01 hỗ trợ cả hai: nhập mã 6 số nếu thư có mã, hoặc bấm link trên máy đang cài app.

- Scheme deep link (đã đổi trong `app.config.ts`): `parentbestpal-parent` và `parentbestpal-child` (trước là `parentpal-*`). Link gửi đi là `parentbestpal-parent://auth-callback` (tạo bằng `Linking.createURL('auth-callback')`, truyền vào `signInWithOtp` qua `options.emailRedirectTo`). Trong Expo Go/dev client, URL có dạng `exp://.../--/auth-callback`; cũng phải được thêm vào danh sách cho phép khi thử kiểu đó.
- Cách hoàn tất phiên (supabase-js 2.119): client đặt `flowType: 'pkce'` nên link về `...?code=...` và app gọi `exchangeCodeForSession(code)`; token không nằm trên URL. Chọn PKCE vì mẫu thư mặc định không có `token_hash` (cách `verifyOtp({ token_hash, type })`, vẫn được xử lý nếu sau này mẫu thư sửa được). PKCE cần mở link trên đúng máy đã xin link (mã xác minh lưu trong AsyncStorage); mở trên máy khác sẽ báo lỗi, người dùng xin link mới.
- Bắt URL: `src/state/app.tsx` (`Linking.getInitialURL` và sự kiện `url`) rồi `parseAuthLink` (`src/data/auth-link.ts`, có test). Mỗi URL chỉ xử lý một lần. Link hết hạn hoặc sai hiện lỗi tiếng Việt ở PA-01. Route `src/app/auth-callback.tsx` chỉ chuyển về `/` để router không báo lỗi.
- Việc của chủ sản phẩm: thêm `parentbestpal-parent://auth-callback` vào Supabase, Authentication, URL Configuration, Redirect URLs (thêm cả URL `exp://...` nếu thử bằng dev client qua Expo). Chưa thêm thì Supabase bỏ qua `emailRedirectTo` và dẫn về Site URL.
- Mock: `parentbestpal-parent://auth-callback?code=mock-link` (sau khi xin mã) đăng nhập được.

## Còn lại của T1.7

Cần làm trên dự án Supabase (chủ sản phẩm hoặc người có quyền; task này không đụng đám mây):

1. Bật schema `app` trong Settings → API → Exposed schemas (để `supabase.schema('app')` chạy).
2. Bật Authentication → Sign In / Providers → Anonymous sign-ins (máy con).
3. Bật Email provider. Khi sửa được mẫu thư: sửa mẫu "Magic Link / Confirm signup" thêm `{{ .Token }}` để gửi mã 6 số (xem docs Supabase: Passwordless email logins). Mặc định thư chỉ có liên kết. Độ dài OTP mặc định 6 số, khớp `OTP_LENGTH`. Dùng SMTP riêng cho gửi thật: dịch vụ mặc định giới hạn rất thấp số thư mỗi giờ.
4. Hợp đồng RPC đã khớp migration T1.2, T1.5, T1.6 (mục "Hợp đồng RPC"); nhớ áp các migration này lên dự án đám mây khi chủ sản phẩm cho phép (task này không áp).
5. Chưa chạy trên máy thật hay giả lập Android: chỉ kiểm `tsc`, `expo config` hai biến thể, `expo export --platform android` (bundle được, cả hai biến thể) và test node. Cần thử tay: chuyển màn tự động khi đổi giai đoạn (`Stack.Protected`), bàn phím, đọc màn hình.
6. Chưa làm: PA-37 (không vào được tài khoản; với OTP có nút "Gửi lại mã"), PA-15 (thông báo ghép/hủy), PA-38 danh sách nhiều phiên, đổi PIN hỏi PIN cũ, CA-15 (xin quyền thông báo), CA-20, PA-03 đầy đủ. Câu chữ CA-16 bám IA 4.6, chờ chủ sản phẩm duyệt.

## T2.6: đồng ý, quyền riêng tư, sức khỏe, báo bố mẹ (mô hình D-64..D-67)

Màn hình bám các RPC trên `main` (migration `20261116110000..170000`); `test/contract.test.ts` kiểm tên hàm, tham số, trường kết quả, cột bảng và CHECK của `kind`.

| Màn | Việc | RPC / bảng |
|---|---|---|
| ~~PA-02 `dong-y`~~ (bỏ, D-73) | Không còn màn đồng ý và cổng `needConsent`. Máy chủ ghi đồng ý mặc định ngay trong `child_create` (migration T2.9, `basis = 'MAC_DINH_D73'`): MD-LICH, MD-SUCKHOE, MD-CONBAO cùng giao dịch với dòng con, nên không có trạng thái "con có mà chưa đồng ý" do app tắt giữa chừng. App không gọi `consent_record` khi tạo con. Mock phản chiếu (`defaultConsent: false` để test nhánh chưa đồng ý) | `child_create` |
| PA-32 `quyen-rieng-tu` (D-73) | Đoạn tuyên bố quyền riêng tư chung cho mọi con (nguyên văn D-73, ghi chú "Câu chữ chờ duyệt."), nút "Đồng ý" (quay lại, không ghi máy chủ), khung cuộn "Điều khoản sử dụng" bản nháp AI (`src/content/dieu-khoan.ts`, chờ luật sư) | không gọi máy chủ |
| `cai-dat-du-lieu` (D-73, từ tab Gia đình) | Mỗi con: công tắc lưu sức khỏe (MD-SUCKHOE), cho con báo bố mẹ ngay (MD-CONBAO) (tắt có xác nhận: dữ liệu cũ ẩn ngay, không hiện lại), trò chuyện AI trên máy con (`ai_chat_enabled`, chuẩn bị, mặc định tắt); nút xóa dữ liệu một con hoặc cả gia đình (sang PA-35/36 hai bước) | `consent_record`, `child_setting_get/set`; sang PA-35/36 |
| PA-35/36 `xoa` | Một con: `consent_withdraw_all` hai bước (mã xác nhận); cả gia đình: `deletion_request('GIA_DINH')` | rút luôn được kể cả hộ đóng băng |
| PA-06 `suc-khoe` (trong thẻ con ở tab Gia đình) | Không còn bước hỏi đồng ý (D-73); nếu đã tắt ở Cài đặt dữ liệu thì chỉ có nút sang đó. Danh sách ghi chú (Dị ứng/Thuốc/Khác) kèm nguồn "ai khai (vai trò), ngày" và ghi chú nguồn; thêm, sửa, tắt/bật, xóa | `health_note_add/update/delete`, đọc `child_health_notes` |
| PA-15 `thong-bao` | Báo của con trong 7 ngày, đánh dấu đã xem; lối vào ở tab Gia đình chỉ khi có con đã bật MD-CONBAO | đọc `child_alerts`, `child_alert_seen` |
| CA-16 `bo-me-thay` | Kiêm bước con đồng ý: "Con hiểu rồi" gọi `child_consent_record` rồi mới vào Hôm nay; lỗi thì báo và bấm lại được (không kẹt, không vào app khi chưa ghi) | `child_consent_record` |
| CA-18 `tam-dung` | Trạng thái hộ từ `my_family_state` | `my_family_state` |
| CA-21 `bao-bo-me` | Nút ở Hôm nay chỉ hiện khi MD-CONBAO hiệu lực. Ba câu hỏi có sẵn, không ô gõ chữ; chọn câu rồi bấm "Đồng ý" ở màn xác nhận mới gửi; `RATE_LIMITED` hiện lời của máy chủ | `child_alert_send` (chỉ mã câu) |

Câu chữ: wireframe chưa vẽ theo mô hình mới nên mọi câu có chú "(tạm)" hoặc nằm trong `src/ui/purpose-labels.ts`, `src/ui/alert-text.ts` đang chờ chủ sản phẩm duyệt. Mock: `MOCK_CHILD_DEFAULT_CONSENT = [MD-LICH, MD-CONBAO]` cho máy con; `demoAlert` (bật trong `src/data/index.ts`) tạo sẵn một báo mẫu khi bố mẹ bật MD-CONBAO vì hai app giả lập không thấy nhau.

## Test component, E2E và so ảnh (chạy được không cần máy Android)

| Lệnh | Việc |
|---|---|
| `npm test` | Test đơn vị lớp dữ liệu (node:test, thư mục `test/`) |
| `npm run test:component` | jest-expo + @testing-library/react-native, thư mục `component-test/` (`*.spec.tsx`): PA-13 (ô PIN chỉ hiện khi máy chủ đòi), CA-12 (số lần thử, khóa), CA-16 ("Con hiểu rồi" sang Hôm nay, chống tái phát lỗi PR #38), `useAction`. Dùng mock api, không mạng |
| `npm run build:web` | Xuất bản web hai biến thể, dữ liệu giả (`EXPO_PUBLIC_API_MOCK=1`) ra `.web-build/parent`, `.web-build/child` (bị `.gitignore`). Mỗi biến thể chạy `--clear` vì cache Metro không phân biệt `APP_VARIANT`. Cần `metro.config.js` (thêm `.wasm`) và `react-native-web`, `@expo/metro-runtime` (devDependencies; không ảnh hưởng build Android) |
| `npm run test:e2e` | Playwright (`@playwright/test`, TypeScript) trong `e2e/`: luồng phụ huynh, luồng máy con, nhánh lỗi, khung 390x844, kèm 13 ảnh so sánh. Tự bật hai máy chủ tĩnh có fallback SPA (`e2e/serve.mjs`, cổng 4101, 4102) |

Chạy E2E trên máy đã có Chrome: `E2E_CHROME_PATH=/usr/bin/google-chrome npm run test:e2e`. Không đặt biến này thì dùng chromium của Playwright (`npx playwright install --with-deps chromium`, như trên CI).

### Ảnh chuẩn (visual)

- Ảnh chuẩn ở `e2e/snapshots/<parent|child>/`, sinh trên Linux và commit vào repo. Ngưỡng: `maxDiffPixelRatio` 1%, `threshold` 0.2 (chống nhiễu răng cưa chữ).
- **Ảnh chỉ đúng cho nền Linux/CI.** Chạy trên macOS hoặc Windows sẽ lệch font và phông hệ thống, đừng cập nhật ảnh chuẩn từ đó.
- Khi cố ý đổi giao diện: **gắn nhãn `cap-nhat-anh-chuan` vào PR**. Workflow `update-snapshots.yml` chụp lại ảnh chuẩn trên CI, commit vào nhánh PR rồi gỡ nhãn; xem lại từng ảnh đổi trong diff, rồi đẩy thêm một commit để CI chạy lại. Không commit ảnh chuẩn chụp trên máy dev (lệch font so với CI). `npm run test:e2e:update` chỉ để thử cục bộ. CI thất bại sẽ đính kèm báo cáo HTML và ảnh lệch (artifact `mobile-e2e-report`).
- Mock ghép máy của con tự đẩy yêu cầu sau khoảng 8 giây, nên mỗi test máy con chạy 10 đến 15 giây.

### Ghi chú: biểu tượng tab hiện "⏷"

Không phải lỗi riêng của web. Các tab chưa đặt `tabBarIcon`, nên expo-router vẽ biểu tượng giữ chỗ `MissingIcon` (ký tự "⏷", `node_modules/expo-router/build/react-navigation/elements/MissingIcon.js`) trên mọi nền, kể cả Android. Chọn biểu tượng thật (hoặc ẩn) là việc thiết kế, chưa làm. Test E2E vì vậy so khớp tên tab bằng phần cuối (`/Của con$/`); khi có biểu tượng thật thì cập nhật ảnh chuẩn.
