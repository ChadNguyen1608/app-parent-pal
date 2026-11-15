# backend/supabase

Lược đồ, chính sách RLS, Edge Function và job của nấc 1 (Tech Spec 13.1).
Nơi đặt dự án đám mây chưa chốt (LQ-08); chưa tạo dự án nào. Người soạn: AI, chưa kiểm chứng độc lập.

| Thư mục / file | Nội dung |
|---|---|
| `config.toml` | Cấu hình Supabase CLI cục bộ, tối thiểu. `private` không nằm trong `[api] schemas` |
| `migrations/` | `…100000` baseline T0.2: hộ, thành viên + vai trò, con, grants, thiết bị ghép, mã ghép một lần, phần D-38. `…110000` T1.1: `purposes`, `mode_history`, `invitations`, `app.can`, mã lỗi `app.fail`, FK `grants.purpose_code`. `…120000` T1.3: `child_create/update/delete`. `…130000` T1.4: `mode_set`. `…140000` T1.2: `family_create`, `touch_active`, `private.params`. `…150000` T1.5: ghép máy (`pair_*`), Parent PIN (`pin_set`, `pin_verify` nội bộ), `access_state` thêm `child.pair` và claim epoch, `RATE_LIMITED`. `…160000` T1.6: `unlink_device` |
| `seed/` | Dữ liệu giả (chị Hoa, anh Minh, bé Na, bé Bin, cô Lan, bé Su). **Không dữ liệu thật của trẻ** |
| `tests/stub/` | `supabase-stub.sql`: vai `anon`/`authenticated`/`service_role`, schema `auth`, `auth.uid()`/`auth.jwt()`, `pgcrypto` ở schema `extensions`, `vault.decrypted_secrets` với khóa GIẢ chỉ để test. **Chỉ dùng cho test trên Postgres thuần, không nằm trong migrations** |
| `tests/rls/` | Test bằng `node:test` + `psql` (không package): `rls.test.mjs` (RLS-GEN/ROLE/SCHEMA/D38), `fn.test.mjs` (FN-CAN/TBL/CHILD/MODE), `pair.test.mjs` (FN-FAM, FN-PAIR, FN-PIN, FR01-T01..T10, RLS-EPOCH), `policy-matrix.json`, `mutations/` |
| `functions/` | Edge Function (task sau) |

## Chạy test RLS

Hai chế độ, cùng một bộ test (`tests/rls/rls.test.mjs`, đọc `RLS_DB_URL`).

**(a) Postgres 16 thuần (sandbox, không cần Docker).** Cần `/usr/lib/postgresql/16/bin` (đặt `PG_BIN` nếu khác) và `psql`.

```bash
scripts/db-test.sh                  # initdb vào /tmp, cổng tự chọn, nạp stub + migrations + seed, chạy test, dọn dẹp
scripts/db-test.sh --prove-negative # thêm: áp 36 đột biến và xác nhận test THẤT BẠI đúng mã
```

Chạy bằng root thì script tự hạ quyền initdb/postgres xuống user `postgres`.

**(b) Supabase CLI cục bộ (máy chủ sản phẩm/CI, cần Docker).**

```bash
cd backend && supabase start        # đọc backend/supabase/config.toml, nạp migrations + seed
cd .. && scripts/db-test.sh --supabase          # test vào CSDL cục bộ (mặc định cổng 54322)
scripts/db-test.sh --supabase --reset           # chạy `supabase db reset` trước
```

Không nạp `tests/stub/` ở chế độ này (Supabase đã có vai và `auth.*`). `config.toml` chưa được thử bằng CLI thật trong sandbox (không có Docker image); `major_version` chỉnh theo dự án đám mây khi LQ-08 chốt.

Test không nằm trong `npm test` gốc (cần Postgres). Gõ tay: `RLS_DB_URL=postgresql://... node --test backend/supabase/tests/rls/rls.test.mjs`; thiếu `RLS_DB_URL` thì các test bị bỏ qua có ghi lý do.

## Test gồm gì

| Mã | Kiểm |
|---|---|
| RLS-GEN-01 | Mọi bảng `app` bật RLS và có dòng trong `policy-matrix.json` (cả chiều ngược lại) |
| RLS-GEN-02 | `anon`/`authenticated` không đọc được `private.*`; không chính sách; RLS bật |
| RLS-GEN-03/04 | `anon` không có quyền gì; không ai ghi trực tiếp; hàm `app.*` là security definer, `search_path` rỗng, EXECUTE đúng danh sách |
| RLS-ROLE | Số dòng mỗi bảng baseline × vai (QL, NL, Con đã ghép, Con chưa ghép, hộ khác, anon) và ghi trực tiếp bị từ chối |
| RLS-SCHEMA | Ràng buộc: một PRIMARY mỗi hộ, không `CHILD_DIRECTED`, con không máy không ghép, mã ghép dùng một lần... |
| RLS-D38-01..03, 05..07 | Đọc trực tiếp bị từ chối; không đường vòng (view, hàm, publication, cột); `weekly_report` chỉ nhận mã tuần, trả đếm theo loại ngày; mốc cắt CN 20:00; không-suy-ngược. (D-38-04 `Xuất dữ liệu` và thông báo chưa có ở baseline) |

Bảng có khóa chính không phải `id` thì khai `"pk"` trong ma trận. Thêm bảng `app` mới: thêm dòng vào `policy-matrix.json` (số dòng mong đợi theo vai) cùng migration. Thêm hàm `app.*`: thêm vào `app_functions`.

## Chứng minh test thất bại đúng

`scripts/db-test.sh --prove-negative` áp lần lượt từng file trong `tests/rls/mutations/` lên bản sao CSDL sạch (bỏ chính sách, tắt RLS, lỗi quyền của `app.can`/hàm ghi, bảng mới thiếu matrix hoặc thiếu RLS, `using (true)`, cấp quyền `private`, view/hàm đọc vòng, ghi trực tiếp, `weekly_report` nhận khoảng ngày). Mỗi file ghi `-- expect: <mã test>`; script yêu cầu test thất bại và đúng các mã đó.

## Đề xuất job CI riêng (chưa sửa `ci.yml`)

```yaml
# .github/workflows/db-test.yml (đề xuất)
name: db-test
on: { pull_request: { paths: ['backend/supabase/**', 'scripts/db-test.sh'] } }
jobs:
  rls:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - name: Test RLS trên Postgres thuần
        run: |
          sudo apt-get update && sudo apt-get install -y postgresql-16 postgresql-client-16
          PG_BIN=/usr/lib/postgresql/16/bin scripts/db-test.sh --prove-negative
      # Tùy chọn, khi muốn kiểm trên stack thật: supabase/setup-cli + `supabase start` + `scripts/db-test.sh --supabase`
```

## Quyết định mặc định ghi lại (tài liệu thiếu hoặc mơ hồ)

- Ghi trực tiếp: chỉ cấp `select` cho `authenticated`; mọi ghi đi qua hàm (task sau) hoặc `service_role`, theo chú thích "W qua hàm" của Tech Spec §2.7.
- (Đã xử lý ở T1.1) `app.can` và `purposes` đã có; `grants.purpose_code` đã có FK. `households.trial_slot_id` vẫn chưa có FK tới `trial_slots` (T2.4).
- NL thấy con khi có grant `ACTIVE`, `view` (mọi `resource`); QL thấy mọi con chưa ẩn của hộ; máy con chỉ thấy hàng `device_bindings` của mình khi `HIEU_LUC`.
- `weekly_report` đếm "ngày" theo loại ngày (`day_features`), bỏ `bo_qua` và bản đã hoàn tác; ngày không có đặc điểm gộp vào `khong_dac_diem`. Đây là `[MĐKT]`, chờ BL chốt.
- Hàm ghi `checkin_responses` từ máy con (§2.7: "R/W hàng của mình chỉ qua hàm") thuộc task sau.
- Quản trị viên có `service_role` đọc được `private.*` (giới hạn đã ghi ở Architecture §6.3).

## T1.1, T1.3, T1.4: hàm quyền và hàm ghi

### `app.can` (AD-09)

`app.can(actor, action, child, purpose)` và `app.can_household(actor, action, household)`: một điểm ALLOW/DENY, fail-closed. Tham số `actor` chỉ có hiệu lực khi trùng `auth.uid()` hoặc người gọi là `service_role` (Edge Function hỏi thay người dùng); ngược lại luôn `false`, để không dò được quyền người khác. Nội bộ là `app.access_state` trả `ALLOW|FROZEN|DENY` (không cấp cho ai) để hàm ghi trả đúng `FROZEN` mà không lộ trạng thái cho người không có vai.

| Hành động | Ai | Đóng băng |
|---|---|---|
| `child.view` | QL; NL có grant `ACTIVE` `view` (đúng mục đích nếu truyền); máy con `HIEU_LUC` | QL đọc được; NL và máy con không |
| `child.admin_read` | QL (grants, bindings, mode_history) | đọc được |
| `child.update`, `child.delete`, `child.mode_set` | QL | `FROZEN` |
| `child.create` (cấp hộ), `household.admin_read` | QL | tạo bị `FROZEN`; đọc được |

Đã thay bằng `app.can`: chính sách `children_select`, nhánh QL của `grants_select` và `device_bindings_select`, và chính sách của `mode_history`, `invitations`. Giữ nguyên (an toàn, tương đương): `households_select`, `members_select` (`is_member`) và nhánh "của chính mình". Các hàm hẹp baseline vẫn còn, chưa gỡ. Hồ sơ ẩn hoặc hộ ẩn: mọi vai bị từ chối.

### Mã lỗi

`app.fail(code, rule, message_vi)` raise `SQLSTATE PTxyz` để PostgREST trả HTTP `xyz`; `message` = mã, `detail` = quy tắc, `hint` = lời tiếng Việt. `UNAUTHENTICATED` 401, `FORBIDDEN` và `FEATURE_OFF` 403, `NOT_FOUND` 404, `VALIDATION` 422, `FROZEN` 423, `CONFLICT_REV`/`LOCKED` 409. Người không thấy được đối tượng nhận `NOT_FOUND`, người thấy mà không có quyền nhận `FORBIDDEN`. `anon` không có EXECUTE nên nhận lỗi quyền `42501`.

### Hàm ghi qua RPC (PostgREST)

| Hàm | Việc | Ghi chú |
|---|---|---|
| `app.child_create(p_household, p_call_name, p_grade, p_age_years, p_has_device, p_idempotency_key)` | Tạo con, mode `UNSET` | Cần lớp hoặc tuổi; khóa gửi lại trả kết quả cũ (`replay`) |
| `app.child_update(p_child, p_patch jsonb)` | Sửa `call_name`, `grade`, `age_years`, `has_device` | Khóa khác (kể cả `mode`) bị `VALIDATION`; không bỏ `has_device` khi còn liên kết máy |
| `app.child_delete(p_child, p_confirm)` | Ẩn hồ sơ (`hidden_at`, `hidden_reason='XOA'`), hủy liên kết máy (`DA_HUY`, epoch+1) | Phải `p_confirm = true`; gửi lặp trả `replay`; không xóa dữ liệu, không hứa "đã xóa hết" |
| `app.mode_set(p_child, p_mode)` | `PARENT_LED`, `CHILD_EXECUTED`, `UNSET`; `CHILD_DIRECTED` bị `VALIDATION` rule `D-19` | Ghi `mode_history`, tăng `mode_epoch`; cùng mode thì không đổi |

### Hàm nào sau này cần Edge Function

- `child_create/update`: kiểm khẩn chữ tự do (`keyword-check`, F07-G01-M01) trước khi lưu `call_name`. RPC hiện chưa kiểm; Edge Function bọc ngoài và gọi hàm này.
- `child_delete`: hủy phiên đăng nhập ẩn danh và token đẩy của máy con (cần Admin API, `service_role`), thông báo tối giản cho máy con, vô hiệu CR `PENDING`/`APPROVED` (bảng ở T4.x), `audit_log` (T2.5), tombstone và hạn xóa hẳn (`PR-FAM-11` chưa chốt).
- `mode_set`: vô hiệu CR khi con mất quyền (BR-FAM-043, AC-FAM-18), báo con sau commit (BR-FAM-045).
- Các hàm sau (T1.5, T1.6) có PIN băm, HMAC, pepper, FCM: Edge Function.

### Mặc định an toàn đã chọn (tài liệu thiếu hoặc mơ hồ)

- `purposes` seed 7 mục đích ngay trong migration (cần cho FK); tất cả `CHUA_DUYET`; `MD-SUCKHOE` có hàng nhưng `collect_enabled=false`, nên `app.can` từ chối mọi hành động gắn mục đích này. `purpose_effective` (đồng ý đang bật) thuộc T2.1; hiện `app.can` chỉ kiểm mục đích tồn tại và được thu.
- `invitations` chỉ có bảng và chính sách đọc cho QL; chưa có hàm ghi (tính năng tắt, `member-invite` trả `FEATURE_OFF` ở T1.8). Vai chỉ `SUPPORTER|OBSERVER`.
- `mode_history.changed_by` trỏ tới `members.id`; bảng chỉ-thêm (trigger chặn sửa, xóa, truncate). Hàm xóa hẳn theo hộ (T2.4) cần đường riêng.
- Đóng băng: NL và máy con không đọc `children` (Tech Spec §2.7 "hộ không DONG_BANG", QL luôn đọc được). Baseline chưa chặn điều này.
- `child_delete` không đặt `children.state = 'CHO_XOA'`; chỉ `hidden_at`. Việc chuyển trạng thái chờ xóa hẳn để T2.x quyết.
- AC-CON-15, AC-CON-16 nói về giờ tan học (hồ sơ lịch) và thẻ hoạt động: bảng chưa có (T3.1), nên chưa kiểm được. Test chỉ kiểm mẫu "ẩn, không xóa hẳn" ở hồ sơ con (AC-FAM-27). AC-FAM-18 (vô hiệu CR) chờ `change_requests`.

## T1.2, T1.5, T1.6: đăng nhập, ghép máy, PIN, hủy liên kết

Đăng nhập người lớn bằng email OTP (D-49) là việc của Supabase Auth, không có mã SQL. Máy con đăng nhập ẩn danh (`signInAnonymously`); JWT có claim `is_anonymous`. Hàm nhận diện máy con (`app.is_anonymous_caller`, nội bộ) coi là ẩn danh nếu claim HOẶC cột `auth.users.is_anonymous` nói vậy (fail-closed).

### Danh sách hàm RPC (schema `app`, gọi qua PostgREST `rpc`)

| Hàm | Ai gọi | Việc | Ghi chú |
|---|---|---|---|
| `family_create(p_call_name)` | người lớn đã đăng nhập, chưa thuộc hộ | Tạo hộ `GIA_LAP` + thành viên `PRIMARY` | Gọi lại khi đã là QL: trả hộ cũ (`replay`). Máy con: `FORBIDDEN` |
| `touch_active()` | QL, NL | Cập nhật `last_active_at` (đồng hồ 30 ngày D-41) | Tối đa 1 lần/giờ (`touched=false` nếu sớm hơn). Máy con và người ngoài hộ: `FORBIDDEN`. Không tự mở lại hộ đóng băng |
| `pair_code_create()` | máy con (ẩn danh) | Mã 6 số, chỉ lưu HMAC, hạn ngắn | Mã mới hủy mã cũ của máy; máy đã `HIEU_LUC` bị từ chối; giới hạn tạo mã mỗi giờ |
| `pair_confirm(p_child, p_code, p_pin default null)` | QL | Dùng mã, tạo binding `CHO_XAC_NHAN_MAY_CON` | Lần ghép đầu của QL phải kèm `p_pin` (đặt PIN cùng lúc); sau đó không gửi. Máy từng ghép hiệu lực ở hộ KHÁC rồi hủy: binding `CHO_XAC_MINH` (không quyền, AC-FAM-16) |
| `pair_pending()` | máy con | Xem "Kết nối với [tên]?" | Chỉ yêu cầu `CHO_XAC_NHAN_MAY_CON` còn hạn |
| `pair_accept()` | máy con | Bấm Đồng ý: `HIEU_LUC`, epoch + 1, xóa mã của máy | Quá hạn: binding `DA_HUY`, trả `ok=false`. Gọi lại: `replay` |
| `pair_decline()` | máy con | Bấm Không: `DA_HUY` | Idempotent |
| `pin_set(p_pin)` | QL | Đặt hoặc đổi PIN của mình | Băm `bcrypt(pin ∥ pepper)` bằng pgcrypto. Đổi PIN xóa bộ đếm và khóa |
| `pin_verify(member, pin)` | KHÔNG AI (nội bộ) | Kiểm PIN, đếm sai, khóa lũy tiến | Chỉ `unlink_device` gọi; không cấp EXECUTE |
| `unlink_device(p_child, p_pin, p_binding_epoch default null)` | máy con hoặc QL | `DA_HUY`, epoch + 1, cần PIN đúng của QL hiện hành | Idempotent; máy con bắt buộc gửi epoch |

Thêm vào `app.access_state`: hành động `child.pair` (như `child.update`: chỉ QL, đóng băng -> `FROZEN`).

### Hai kiểu trả lỗi (quan trọng cho Edge Function và máy khách)

`RAISE` hủy cả giao dịch, kể cả bộ đếm thử sai. Nên hai đường thất bại CẦN ĐẾM không raise mà trả **HTTP 200** với `{"ok": false, "error": {"code", "rule", "message_vi"}}`:

- `pair_confirm`: mọi lý do liên quan tới mã (sai, hết hạn, đã dùng, sai định dạng, máy đã ghép nơi khác) -> `NOT_FOUND` chung "Mã không đúng hoặc đã hết hạn." (AC-FAM-11).
- `unlink_device`: PIN sai -> `FORBIDDEN` rule `FR01-T02`, kèm `attempts_left` và `locked_until`. `pair_accept` quá hạn -> `NOT_FOUND` rule `AD-11`.

Mọi lỗi khác dùng `app.fail` (raise, HTTP thật): thêm `RATE_LIMITED` -> `PT429`. Thành công trả `{"ok": true, ...}`. Máy khách và Edge Function phải kiểm `ok`, đừng chỉ dựa mã HTTP.

### Tham số chưa chốt (bảng `private.params`, mọi dòng `CHUA_CHOT`, chờ OW-06 / Q-TS-01)

| Khóa | Mặc định | Nguồn |
|---|---|---|
| `pair_code_ttl_minutes` | 10 | PR-FAM-04 `UNKNOWN`; đề xuất nội bộ (Architecture §5.3) |
| `pair_code_max_attempts` | 5 | Lần mã ĐÚNG bị từ chối (máy đã ghép nơi khác) trước khi khóa mã; đề xuất nội bộ |
| `pair_code_create_per_hour` | 10 | Số mã một máy được tạo mỗi giờ; đề xuất nội bộ |
| `pair_confirm_max_fails` / `_window_minutes` / `_lock_minutes` | 5 / 15 / 15 | Architecture §5.3 `[MĐKT]` 5 lần / 15 phút, theo tài khoản và theo hộ |
| `pair_accept_window_minutes` | 5 | Architecture §5.3 |
| `pin_length` | 6 | Architecture §5.3 `UNKNOWN`, mặc định 6 chữ số. PIN cùng một số hoặc dãy tăng/giảm bị từ chối (đề xuất nội bộ) |
| `pin_max_failures` / `pin_lock_minutes` / `pin_lock_max_minutes` | 5 / 15 / 1440 | PR-FAM-05 `UNKNOWN`; khóa nhân đôi mỗi lần, trần 24 giờ |
| `pin_bcrypt_cost` | 10 | pgcrypto `gen_salt('bf', 10)` |
| `touch_active_min_interval_minutes` | 60 | Tech Spec bảng nghiệm thu 1 |

Đổi giá trị = `update private.params` (service_role) hoặc migration; không phải sửa hàm.

### Khóa bí mật (KHÔNG commit khóa thật)

`private.secret(name)` tìm theo thứ tự: Supabase Vault (`vault.decrypted_secrets`, cột `name`), rồi cài đặt `app.settings.<name>` (cho CI/sandbox, cài bằng `ALTER DATABASE ... SET`). Thiếu hoặc ngắn hơn 16 ký tự: lỗi `INTERNAL`, không bao giờ chạy với khóa rỗng. Hai tên: `pairing_secret` (HMAC-SHA256 của mã ghép) và `pin_pepper` (nối vào PIN trước khi băm). Giá trị `TEST-ONLY-...` chỉ nằm trong `tests/stub/`. Trên dự án thật: tạo hai secret trong Vault (ưu tiên Vault vì cài đặt cơ sở dữ liệu đọc được bằng `current_setting` từ mọi vai có chạy SQL). Đổi `pin_pepper` làm mọi PIN cũ vô hiệu (phải đặt lại); đổi `pairing_secret` làm mã đang chờ vô hiệu (vô hại, hạn 10 phút).

Lệch so với Architecture §5.3: tài liệu để pepper ở secret của Edge Function (ngoài CSDL). Vì hàm là SQL, pepper nằm trong Vault của chính CSDL: lộ bản sao CSDL không kèm khóa Vault vẫn không dò được PIN, nhưng quản trị viên CSDL có thể đọc cả hai. Muốn tách hẳn thì chuyển băm PIN sang Edge Function (hàm SQL chỉ lưu/đếm).

### Epoch và "token cũ" (RLS-EPOCH)

Chọn cách đơn giản, an toàn: **nguồn chân lý là dòng `device_bindings` trên máy chủ**, không phải token.

- Quyền đọc của máy con chỉ có khi có dòng `HIEU_LUC` của đúng (con, người dùng ẩn danh). `unlink_device` đổi dòng đó sang `DA_HUY` trong cùng giao dịch, nên mọi token cũ mất quyền ngay, không đợi token hết hạn.
- Epoch của con tăng đơn điệu qua mọi liên kết: binding mới có epoch = lớn nhất từng có + 1 (`pair_confirm`), `pair_accept` +1, `unlink_device` +1. Không bao giờ dùng lại số cũ.
- Máy con gửi `p_binding_epoch` (epoch nhận từ `pair_accept`) khi hủy; sai epoch -> `CONFLICT_REV`, không hủy gì. Chặn biên nhận hủy cũ phát lại sau khi đã ghép lại (FR01-T09).
- Tùy chọn: nếu token có claim `binding_epoch` (cần Auth Hook sau này) thì `access_state` chỉ cho đọc khi khớp epoch hiện hành. Claim chỉ THU HẸP quyền, không mở rộng: máy con tự sửa claim chỉ làm hại chính nó. Chưa cần Auth Hook để đạt các test hiện tại.
- Chưa phủ: bộ chính sách `device_bindings_select` (nhánh "hàng của mình") và `app.is_bound_device` baseline không xét claim epoch; chúng chỉ thấy hàng `HIEU_LUC`, không mở dữ liệu của con.

### Quyết định mặc định (tài liệu thiếu hoặc mơ hồ; báo chủ sản phẩm)

- Hủy liên kết khi hộ đóng băng: **vẫn được** (chỉ thu hẹp quyền, không xóa dữ liệu). `pin_set`, `pair_confirm`, `pair_accept` khi đóng băng: `FROZEN`.
- `pin_set` không đòi PIN cũ; QL đã đăng nhập đổi được và xóa bộ đếm (quy trình đổi/khôi phục PIN là `UNKNOWN`, BR-FAM-028/071). PIN gắn với `members.id` của QL hiện hành: đổi QL thì PIN của QL cũ không còn đủ (BR-FAM-028).
- Mã ghép 6 chữ số (yêu cầu của task) chỉ ~20 bit; Architecture ghi 8 ký tự (~40 bit). An toàn dựa vào: hạn ngắn, giới hạn nhập sai theo tài khoản và hộ (vì tra mã theo HMAC, đoán sai không chạm dòng nào nên cột `attempts` chỉ đếm khi mã ĐÚNG bị từ chối), khóa HMAC ngoài bảng, và bước máy con xác nhận. Nên cân nhắc nâng độ dài (đổi hằng số trong `pair_code_create` và định dạng ở `pair_confirm`).
- Idempotent theo trạng thái, không dùng `idempotency_key` cho `unlink_device`, `pair_accept`, `pair_decline`; `family_create` trả hộ cũ khi người gọi đã là QL.
- Binding thay thế (yêu cầu mới của cùng con hoặc cùng máy) đặt `DA_HUY` với `revoke_reason = 'THAY_THE'`; từ chối trong lúc chờ: `MAY_CON_TU_CHOI`; quá hạn xác nhận: `HET_HAN_XAC_NHAN`; hủy bằng PIN: `PIN_MAY_CON` (từ máy con) hoặc `PIN_QL`.
- `CHO_XAC_MINH` được tạo trong một trường hợp duy nhất: máy từng ghép hiệu lực ở hộ khác rồi đã hủy (AC-FAM-16, FR01-T06). Không có hàm nào nâng nó lên `HIEU_LUC`; `pair_accept` chỉ nhận `CHO_XAC_NHAN_MAY_CON`.

### Việc cần Edge Function sau (service_role, gọi sau khi hàm SQL commit)

- `unlink_device`: hủy phiên ẩn danh của máy con (Auth Admin API) và xóa token đẩy (`push_tokens`, T5.x); thông báo tối giản cho QL "Máy của [tên gọi] đã hủy liên kết" có thử lại, không chứa PIN hoặc mã, gửi lỗi không đảo ngược việc hủy (FR01-T04, BR-FAM-038); `audit_log` (T2.5). FR01-T04 chỉ kiểm được phần "biên nhận không chứa PIN/mã"; phần đẩy và thử lại chưa có bảng nào để test.
- `pair_accept`: thông báo "Đã ghép máy của [tên gọi]" (BR-FAM-038), audit.
- `pair_code_create`: giới hạn theo IP và CAPTCHA cho đăng nhập ẩn danh (Architecture §5.2); job dọn mã hết hạn (`private.pairing_codes`) và người dùng ẩn danh chưa ghép sau 7 ngày.
- `family_create`: ghi đồng ý `SELF_DECLARED` (BR-FAM-001, T2.1); đăng nhập thất bại không lộ tài khoản có tồn tại không (BR-FAM-070) do Supabase Auth xử lý.
- Vận hành: không bật `log_statement` hoặc `log_parameter_max_length` cho các hàm có tham số PIN/mã; Edge Function bọc ngoài không được log thân yêu cầu.
- Hủy phiên khi máy ngoại tuyến (AC-FAM-14): ngoại tuyến thì không có lời gọi nào tới máy chủ nên liên kết vẫn `HIEU_LUC`; phía máy khách chỉ xóa liên kết khi nhận `ok=true`.
- Các cổng khác của FR-01 chưa phủ ở đây: FR01-T11 (người lớn 18+ tự quản, ngoài phạm vi lớp 1-9, BR-FAM-007), phương pháp xác minh mở `CHO_XAC_MINH` (`UNKNOWN`, LQ-03), FR01-T07 (xác minh độc lập) chỉ kiểm được rằng không có đường tự nâng quyền.
