# backend/supabase

Lược đồ, chính sách RLS, Edge Function và job của nấc 1 (Tech Spec 13.1).
Nơi đặt dự án đám mây chưa chốt (LQ-08); chưa tạo dự án nào. Người soạn: AI, chưa kiểm chứng độc lập.

| Thư mục / file | Nội dung |
|---|---|
| `config.toml` | Cấu hình Supabase CLI cục bộ, tối thiểu. `private` không nằm trong `[api] schemas` |
| `migrations/` | `…100000` baseline T0.2: hộ, thành viên + vai trò, con, grants, thiết bị ghép, mã ghép một lần, phần D-38. `…110000` T1.1: `purposes`, `mode_history`, `invitations`, `app.can`, mã lỗi `app.fail`, FK `grants.purpose_code`. `…120000` T1.3: `child_create/update/delete`. `…130000` T1.4: `mode_set`. `…140000` T1.2: `family_create`, `touch_active`, `private.params`. `…150000` T1.5: ghép máy (`pair_*`), Parent PIN (`pin_set`, `pin_verify` nội bộ), `access_state` thêm `child.pair` và claim epoch, `RATE_LIMITED`. `…160000` T1.6: `unlink_device`. `…170000` T1.8: `member_invite` (khung, cờ `invites_enabled=0`, luôn `FEATURE_OFF`). `…180000` hàm phụ trợ RLS (`can`, `can_household`, `is_member`, `is_self_member`) chuyển sang schema `app_internal` không mở API; 5 hàm không còn dùng thu hồi EXECUTE. `…20261116110000` T2.5: `audit_log` + cơ chế ghi. `…120000` T2.1: mục đích thứ 8, `policy_versions`, `consent_events`, `purpose_state`, `consent_record`, nối `access_state` với đồng ý. `…130000` T2.2: `deletion_requests`, `consent_withdraw_all` hai bước. `…140000` T2.3: đóng băng 30 ngày, `household_reopen`, `deletion_request`, `job_daily`. `…20261117100000` T3.1: `schedule_profiles`, `activity_cards`, `schedule_versions` (bất biến), `schedule_state`, `schedule_answers`. `…110000` T3.2: `profile_save`, `schedule_inputs`, `schedule_commit_apply`, outbox `notifications`, mở rộng `purge_household`. `…150000` T2.4: `trial_slots`, `purge_household`, `deletion_evidence`, `job_trial_purge`, `export_request` (`BLOCKED_H4`). `20261119100000` D-68, D-71: gói dịch vụ (`household_plans`, `my_plan`, `plan_set`), mã lỗi `PLAN_REQUIRED` (402), chặn tạo/sửa kế hoạch và ghép máy, mở ghi chú hoạt động. `20261119150000` D-72: đếm dùng thử theo con, FREE nhập được nhưng không xem trước/tạo lịch (`schedule_plan_check`), `trial_start` + `private.trial_claims`, `plan_active` cho máy con, outbox `goi_doi`, `plan.expired` |
| `seed/` | Dữ liệu giả (chị Hoa, anh Minh, bé Na, bé Bin, cô Lan, bé Su). **Không dữ liệu thật của trẻ** |
| `tests/stub/` | `supabase-stub.sql`: vai `anon`/`authenticated`/`service_role`, schema `auth`, `auth.uid()`/`auth.jwt()`, `pgcrypto` ở schema `extensions`, `vault.decrypted_secrets` với khóa GIẢ chỉ để test. **Chỉ dùng cho test trên Postgres thuần, không nằm trong migrations** |
| `tests/rls/` | Test bằng `node:test` + `psql` (không package): `rls.test.mjs` (RLS-GEN/ROLE/SCHEMA/D38), `fn.test.mjs` (FN-CAN/TBL/CHILD/MODE), `pair.test.mjs` (FN-FAM, FN-PAIR, FN-PIN, FR01-T01..T10, RLS-EPOCH), `member.test.mjs` (MEM-INV, MEM-NL), `consent.test.mjs` (CON-01..08, 22, CON-D58, CON-WA: T2.1, T2.2), `audit.test.mjs` (AUD-01..06: T2.5), `lifecycle.test.mjs` (LC-JOB/FROZEN/REOPEN/DEL/SWITCH/CRON: T2.3), `trial.test.mjs` (TRIAL-SLOT/JOB/WD/PURGE/H4/EXP/EVID/FK: T2.4), `schedule.test.mjs` (SCH-RLS/VER/PS/IN/CM/SIG: T3.1, T3.2), `plan.test.mjs` (PLAN-DB/AUD/MY/GATE/PAIR/SYNC/PURGE: D-68; PLAN-TRIAL/ACTIVE/NOTIFY/EXP: D-72), `policy-matrix.json`, `mutations/` |
| `functions/` | Edge Function (Deno): `_shared/` (lõi API, `schedule-core.ts`, và `scheduler/`, `domain/` SINH TỰ ĐỘNG từ `packages/` bằng `scripts/sync-shared.mjs`), `profile-save/`, `schedule-preview/`, `schedule-commit/` (mỗi hàm: `handler.ts` thuần + `index.ts`), `_tests/` (deno test). Xem mục T0.5, T3.1, T3.2 |

## Chạy test RLS

Hai chế độ, cùng một bộ test (`tests/rls/rls.test.mjs`, đọc `RLS_DB_URL`).

**(a) Postgres 16 thuần (sandbox, không cần Docker).** Cần `/usr/lib/postgresql/16/bin` (đặt `PG_BIN` nếu khác) và `psql`.

```bash
scripts/db-test.sh                  # initdb vào /tmp, cổng tự chọn, nạp stub + migrations + seed, chạy test, dọn dẹp
scripts/db-test.sh --prove-negative # thêm: áp mọi đột biến và xác nhận test THẤT BẠI đúng mã
scripts/db-test.sh --prove-negative --only m66,m67   # chỉ đột biến có tên bắt đầu bằng mã này (vẫn chạy baseline trước); cả bộ mất hơn 60 phút
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
| RLS-GEN-05 | Hàm phụ trợ của chính sách nằm ở `app_internal` (không có trong `[api] schemas`), mọi chính sách chỉ gọi hàm ở đó, EXECUTE đúng danh sách `app_internal_functions`, PUBLIC không có gì |
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

### Đồng ý của con, cài đặt, ghi chú sức khỏe, xóa theo con (D-64, D-66)

- `app.child_consent_record(p_child, p_policy_version_id)`: chỉ máy con đã ghép; ghi `DONG_Y` có `by_child=true` (chủ thể = con) vào sổ, một dòng cho mỗi phiên bản chính sách, không đổi `purpose_state`. Gắn với màn CA-16. Chưa tách theo tuổi (LQ-17 chờ luật sư).
- `private.child_settings.ai_chat_enabled` (mặc định false): QL đổi bằng `app.child_setting_set`; máy con đọc bằng `app.my_child_settings`. Tắt luôn được khi đóng băng; bật phải theo quy tắc ghi thường. Chặng 2 mới dùng.
- `app.my_family_state()`: máy con trả `{state, frozen}`, không lộ thêm.
- `app.child_health_notes` (D-66): `kind` DI_UNG, THUOC, KHAC; nội dung giới hạn độ dài; kèm nguồn (`declared_by_member_id`, `declared_by_role`, `declared_at`, `source_note`). RLS: QL đọc/ghi; NL chỉ đọc khi có grant; máy con không bao giờ đọc; bộ lập lịch không dùng. RPC `health_note_add`, `health_note_update` (gồm bật/tắt `active`), `health_note_delete` (xóa thật). Audit `health.added/updated/deleted` KHÔNG kèm nội dung. Cần đồng ý riêng `MD-SUCKHOE`.
- `app.purge_child(p_child, p_reason)` (chỉ hệ thống): xóa theo thứ tự khóa ngoại và ghi bằng chứng (chỉ băm). Hộ còn con khác thì giữ hộ; con cuối thì xóa cả hộ (`purge_household`). Dữ liệu thật vẫn `BLOCKED_H4`. Hộ thử: vị trí chỉ `RUT_SOM` khi là con cuối.
- `app.child_alerts` (D-67, nút "Báo bố mẹ ngay"): `kind` bị CHECK cứng `KHONG_KHOE | DON_SOM | GOI_BO_ME`, bảng không có cột chữ tự do. `app.child_alert_send(p_kind, p_idempotency_key, p_binding_epoch)`: chỉ máy con đã ghép (epoch sai -> `CONFLICT_REV`), hộ không đóng băng, cần `MD-CONBAO` hiệu lực (đồng ý riêng cấp con, `collect_enabled` = true), tối đa `child_alert_max_per_hour` (6, CHUA_CHOT) lần mỗi giờ mỗi con (`RATE_LIMITED`), gửi lặp cùng khóa trả bản cũ. `app.child_alert_seen(p_alert)`: người lớn đánh dấu đã xem (đóng băng -> `FROZEN`). RLS: QL đọc; NL cần grant `MD-CONBAO`; máy con chỉ thấy cái máy đó gửi; tất cả chỉ trong 7 ngày; rút `MD-CONBAO` thì ẩn, đồng ý lại không hiện lại cái cũ. `private.job_alert_cleanup` (gọi từ `job_daily`) xóa thật thông báo quá `child_alert_retention_days` (7, DA_CHOT). `weekly_report` không đọc bảng này (test ALR-WEEKLY). Audit `alert.sent` chỉ có `{kind}`. `purge_household`/`purge_child` xóa cả bảng. Thông báo đẩy (T3.5): chưa có outbox nên chưa ghi hàng đợi; nơi thêm là cuối `child_alert_send`.
- Mặc định an toàn đã chọn thêm: `declared_by_*` không đổi khi sửa; chỉ QL thêm/sửa ghi chú sức khỏe; ghi nhận đồng ý của con cho mọi con có máy đã ghép (chưa chia tuổi); app chưa có hàm đọc "con đã đồng ý chưa".

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


## Hàm trong schema app và schema app_internal

- `app` nằm trong `[api] schemas`: mọi hàm có EXECUTE cho `authenticated` đều là RPC công khai (`/rest/v1/rpc/...`). Chỉ để hàm **nghiệp vụ** ở đây (`family_create`, `touch_active`, `child_*`, `mode_set`, `pair_*`, `pin_set`, `unlink_device`, `weekly_report`, `member_invite`).
- Hàm phụ trợ mà chính sách RLS gọi thì phải có EXECUTE cho `authenticated` (chính sách chạy với quyền người gọi), nên đặt ở `app_internal`: **không** thêm vào `[api] schemas`, và trên dự án đám mây phải để `app_internal` ngoài mục Exposed schemas. Thêm hàm phụ trợ mới: đặt vào `app_internal`, khai trong `app_internal_functions` của `policy-matrix.json`.
- Hàm `app.*` gọi hàm phụ trợ phải dùng tên có schema (`app_internal.is_member`). `ALTER FUNCTION ... SET SCHEMA` giữ chính sách theo OID nhưng không sửa văn bản thân hàm khác; migration `…180000` có chốt chặn kiểm điều này.
- Edge Function (service_role) gọi `app_internal.can(...)`; `service_role` có USAGE trên `app_internal`.

## Đồng bộ lịch sử migration

Trên dự án đám mây `parent-best-pal` (`roadpnpkjwjgfgottiwx`), bảng lịch sử migration ghi version theo **giờ áp** (do công cụ áp migration đặt), còn file trong repo đặt version theo thứ tự soạn. Tên khớp, version lệch. Nếu không sửa, `supabase db push` sẽ coi 7 file trong repo là chưa áp và thử áp lại (lỗi vì bảng đã có). Đối chiếu (đọc từ `list_migrations`, 15/11/2026; chưa chạy gì lên đám mây):

| Tên | Version trong repo | Version trên đám mây |
|---|---|---|
| baseline_gia_dinh_ghep_may_d38 | 20261115100000 | 20261115190609 |
| t1_1_purposes_mode_history_invitations_can | 20261115110000 | 20261115190652 |
| t1_3_ham_ho_so_con | 20261115120000 | 20261115190730 |
| t1_4_mode_set | 20261115130000 | 20261115190733 |
| t1_2_family_create_touch_active | 20261115140000 | 20261115201355 |
| t1_5_ghep_may_pin | 20261115150000 | 20261115204341 |
| t1_6_unlink_device | 20261115160000 | 20261115204404 |

Hai migration mới của PR này (`…170000_t1_8_member_invite_cong_tat`, `…180000_ham_phu_tro_rls_sang_app_internal`) **chưa có** trên đám mây.

Cách đồng bộ (chạy một lần, từ máy có Supabase CLI đã `supabase link --project-ref roadpnpkjwjgfgottiwx`; chỉ sửa bảng lịch sử, không đổi lược đồ):

```bash
cd backend
# 1) Gỡ 7 version giờ-áp khỏi lịch sử
supabase migration repair --status reverted 20261115190609 20261115190652 20261115190730 20261115190733 20261115201355 20261115204341 20261115204404
# 2) Ghi 7 version của repo là đã áp
supabase migration repair --status applied 20261115100000 20261115110000 20261115120000 20261115130000 20261115140000 20261115150000 20261115160000
# 3) Kiểm: cột Local và Remote phải khớp từng dòng; hai file …170000, …180000 chỉ có Local
supabase migration list
```

Chỉ sau khi chủ sản phẩm đồng ý áp lên đám mây mới chạy `supabase db push` (áp `…170000` và `…180000`). Từ nay nên áp bằng `db push` để version đám mây trùng version file, không áp bằng công cụ tạo version theo giờ. Lệnh `repair` đổi bảng `supabase_migrations.schema_migrations`, nên cần chủ sản phẩm duyệt trước khi chạy (quy tắc: không áp gì lên đám mây từ nhánh code).

## T2.1, T2.2, T2.5: đồng ý theo mục đích, rút toàn bộ, audit

### Đồng ý (T2.1)

- Bảng: `purposes` (D-64: một mục lõi `MD-LICH` gộp mọi tính năng lõi; mục riêng `MD-SUCKHOE`, `MD-CONBAO`; cả hai đều `collect_enabled` = true từ D-66, D-67), `policy_versions` (chỉ-thêm), `consent_events` (sổ chỉ-thêm: trigger chặn sửa/xóa/truncate kể cả `service_role`; có cột `by_child` cho đồng ý của máy con), `purpose_state` (`CHUA_HOI` = không có dòng; chỉ trigger ghi). Không còn cơ chế phụ thuộc giữa các mục và không ẩn dữ liệu theo từng tính năng lõi.
- `app_internal.purpose_effective(child, code)` (nội bộ): mục `DANG_BAT`, `collect_enabled`, và mọi mục lõi (`kind=LOI`) đang bật. Không phải cơ chế phụ thuộc: rút lõi thì mọi mục riêng ngừng hiệu lực. `app_internal.is_adult_of_child` dùng cho RLS dữ liệu sức khỏe (máy con không đọc).
- Dữ liệu cũ: bảng dữ liệu của task sau (T3+) dùng chính sách `app_internal.purpose_visible(child, 'MD-xxx', created_at)` (hoặc `visible_from`). Dữ liệu chỉ hiện nếu `created_at >= visible_from`, mốc = lớn nhất của `active_since` trên cả chuỗi phụ thuộc. Rút rồi đồng ý lại (mục đó hoặc mục cha) không làm dữ liệu cũ hiện lại (D-42, AC-CON-07). Mẫu chính sách được kiểm trong `consent.test.mjs` (CON-07).
- `app.consent_record(p_child, p_purpose_code, p_event, p_policy_version_id, p_paper_ref, p_idempotency_key, p_for_self)`:

| Tình huống | Kết quả |
|---|---|
| QL, theo con | ghi `DONG_Y` / `RUT`; cùng trạng thái thì `changed=false`, không ghi sổ |
| NL theo con (`p_for_self=false`) | `FORBIDDEN` (AC-CON-05) |
| NL hoặc QL của chính mình (`p_for_self=true`) | ghi sổ có `subject_member_id`; không đổi `purpose_state`; `RUT` thu hồi grant của chính người đó cho mục đích và mục phụ thuộc |
| Máy con | `FORBIDDEN` `BR-CON-020` |
| `DONG_Y` mục có `collect_enabled=false` (cờ tắt khẩn cấp) | `FEATURE_OFF`; `RUT` vẫn ghi được. Hiện `MD-SUCKHOE` (D-66) và `MD-CONBAO` (D-67) bật được |
| `RUT` mục lõi MD-LICH ở cấp con | `VALIDATION` `BR-CON-026`: phải dùng rút toàn bộ |
| Hộ đóng băng | `DONG_Y` mới: `FROZEN`; `RUT` luôn được (D-64) |

- Rút một mục riêng: ghi `RUT`; rút `MD-SUCKHOE` ẩn ngay ghi chú sức khỏe và xếp một yêu cầu xóa phạm vi `SUC_KHOE` (`RUT_SUC_KHOE`). Rút lõi ở cấp con: dùng rút toàn bộ.

### Rút toàn bộ (T2.2)

`app.consent_withdraw_all(p_child, p_confirm_token)`. Bước 1 (không mã): trả hệ quả và `confirm_token` dùng một lần (hạn `withdraw_confirm_ttl_minutes`=10 trong `private.params`), không đổi dữ liệu. Bước 2 (có mã): một giao dịch ghi `RUT` mọi mục đang bật (`RUT_TOAN_BO`), hủy liên kết máy con (`RUT_DONG_Y`), ẩn hồ sơ (`state='CHO_XOA'`, `hidden_reason='RUT_DONG_Y'`; mọi hàm dùng `app.can` nên từ chối ghi và đọc), tạo `deletion_requests` (`CHO_QUYET_HAN`, `due_at` null vì hạn xóa hẳn `UNKNOWN`). Gửi lặp: `replay` và giữ `accepted_at` đầu. Không xóa hẳn, `hard_deleted=false` (xóa thật: T2.3/T2.4).

### Audit (T2.5)

- `audit_log` chỉ-thêm; QL đọc dòng của hộ mình. Ghi bằng trigger trên bảng nguồn (`device_bindings`, `children`, `consent_events`, `deletion_requests`) nên mọi đường, kể cả `service_role`, để lại dấu và dòng audit cùng giao dịch. Sự kiện hiện có: `binding.requested|paired|unlinked`, `mode.changed`, `child.hidden`, `consent.granted|withdrawn`, `deletion.requested`.
- Không PIN, mã, token, chữ tự do, lựa chọn hỏi thăm: `private.audit_events` khai sẵn khóa `meta` cho từng sự kiện; trigger `tg_audit_validate` chỉ nhận giá trị là mã ngắn, số nhỏ, boolean (không chuỗi toàn chữ số dài) và không lặp giá trị sai trong thông báo lỗi. Không có sự kiện nào cho nút "Con cần giúp đỡ" hay hỏi thăm (BR-CON-035).
- Thêm sự kiện mới: thêm dòng vào `private.audit_events` (migration) rồi gọi `private.audit_write_auto(...)` từ trigger/hàm.

### Mặc định an toàn đã chọn (tài liệu thiếu hoặc mơ hồ; chờ chủ sản phẩm duyệt)

1. `MD-CONBAO` (D-58 không đặt mã), tùy chọn, `collect_enabled=true` từ D-67; LQ-16 (có phải dữ liệu sức khỏe không) vẫn chờ luật sư, nên thông báo chỉ là mã câu, giữ 7 ngày.
2. Không còn mục phụ thuộc (D-64); đồng ý lại một mục riêng không hiện dữ liệu cũ (`visible_from`).
3. Hộ đóng băng: đồng ý MỚI `FROZEN`; rút, rút toàn bộ, yêu cầu xóa, tắt/xóa ghi chú sức khỏe, tắt cài đặt AI luôn được (D-64).
4. Rút toàn bộ ẩn luôn hồ sơ con (QL cũng không thấy); `deletion_requests` là nơi QL xem tiến trình. Hoàn tác trong thời gian chờ (BR-FAM-084, `UNKNOWN`) chưa có.
5. Mã xác nhận bước hai hạn 10 phút (`CHUA_CHOT`), do máy chủ ép (không chỉ cờ `confirm=true`).
6. Đồng ý của chính người lớn (NL, BR-CON-007): ghi sổ, rút thì thu hồi grant của họ; không đổi `purpose_state`.
7. Chưa ép "không đồng ý MD-LICH thì không tạo hồ sơ" (BR-CON-001) ở `child_create`; chưa có `CHO_DONG_Y_LAI`; `approval='CHUA_DUYET'` chưa chặn gì ở máy chủ (chặn dữ liệu thật theo `data_class` là T2.4); vô hiệu CR khi rút MD-MONGMUON (AC-CON-04) chờ bảng ở T4.3; `family_create` chưa ghi đồng ý (chưa có con để gắn).
8. Audit: `pin_set` chưa có sự kiện (đề xuất `pin.set` không kèm PIN nếu muốn dò đổi PIN); PIN sai và `pair_confirm` thất bại (trả HTTP 200, không raise) chưa ghi audit; hạn giữ audit `PR-CON-04` `UNKNOWN`, không có job xóa.

## T2.3, T2.4: đóng băng, mở lại, xóa, hộ thử

### Vòng đời (T2.3)

- `private.job_freeze_idle(p_now)`: hộ HOAT_DONG mà người lớn đang tham gia nào cũng không có thao tác có chủ đích (`members.last_active_at` do `touch_active`; chưa có thì `joined_at`) trong `freeze_idle_days` (30, D-41) thì thành `DONG_BANG` (đúng 30 ngày là đóng băng). Dữ liệu không đổi, không xóa. Nếu chỉ QL quá hạn mà người lớn khác còn dùng: không đóng băng, ghi một dòng nhắc `NHAC_QL` mỗi chu kỳ (`private.lifecycle_notices`, để Edge Function gửi sau). Job, máy con không tính là hoạt động.
- `private.job_daily(p_now)`: gọi các bước hằng ngày và ghi `app.job_runs` (chỉ `service_role`). Hiện có: đóng băng, kết thúc vị trí thử hết hạn. Bước pha, CR, lời mời, mã ghép hết hạn: chưa làm.
- `private.register_cron_jobs()`: đăng ký 3 lịch (UTC): `pp_job_daily` `5 17 * * *` (00:05 VN), `pp_job_trial_purge` `0 20 * * *` (03:00 VN), `pp_job_trial_purge_withdrawn` `*/10 * * * *` (hộ rút giữa chừng xóa gần như ngay). Chỉ đăng ký khi extension `pg_cron` đã có; không có thì bỏ qua êm. Sau khi bật pg_cron trên Supabase, gọi lại `select private.register_cron_jobs();`.
- `app.household_reopen(p_confirm)`: chỉ QL (người lớn khác `FORBIDDEN` BR-FAM-057; máy con bị từ chối), cần `p_confirm = true`, hộ phải đang `DONG_BANG` (CHO_XOA không mở lại, `VALIDATION` BR-CON-086). Đặt lại `last_active_at` của QL để không bị đóng băng lại ngay.
- `app.deletion_request(p_scope, p_child, p_confirm)`: `HO_SO_CON`, `GIA_DINH`, `NGUOI_LON_ROI`. Gửi lặp trả lại cùng yêu cầu (`accepted_at` là lần đầu). Ẩn ngay, KHÔNG xóa hẳn (`hard_deleted: false`), trạng thái `CHO_QUYET_HAN` không hạn (PR-FAM-05 UNKNOWN).
- RLS-FROZEN: hộ đóng băng thì mọi hàm ghi trả `FROZEN`, trừ danh sách ngoại lệ khai trong `lifecycle.test.mjs` (test LC-FROZEN-02 bắt hàm mới chưa phân loại).

### Hộ thử, xóa thật (T2.4)

- `app.trial_slots`: tối đa 3 vị trí `DANG_THU` cùng lúc (`trial_max_active`), bắt buộc `end_date` và mã phiếu giấy (`consent_paper_ref`, chỉ mã, không dữ liệu cá nhân), hạn chỉ được rút ngắn. Hàm cho hệ thống: `trial_open`, `trial_close`, `trial_attach` (hộ GIA_LAP thành `THU_NOI_BO_D01`). QL của hộ thử đọc được vị trí của mình.
- Hết hạn (`job_daily` hoặc `job_trial_purge` chạy bù): vị trí `HET_THU`, hộ `CHO_XOA` (ngừng thu, ghi `FROZEN`). `job_trial_purge` xóa khi hôm nay (giờ VN) >= `end_date + trial_purge_after_days` (7, D-44). Hộ rút toàn bộ hoặc xóa cả gia đình: vị trí `RUT_SOM`, xóa ở lần chạy kế tiếp (<= 10 phút), không chờ hết hạn.
- `app.purge_household(p_household, p_reason)`: chỉ hệ thống (`service_role`/postgres). Xóa theo thứ tự khóa ngoại, mỗi bảng một lệnh; xóa cả `auth.users` của người lớn và máy con chỉ gắn với hộ này (người dùng còn liên kết hộ khác thì giữ). Ghi `app.deletion_evidence` (chỉ-thêm): mã băm của id hộ, lý do, loại dữ liệu, số dòng theo bảng; không id, tên, email. Dữ liệu ngoài `GIA_LAP`/`THU_NOI_BO_D01` thì `BLOCKED_H4`, không xóa gì.
- Bảng chỉ-thêm (`audit_log`, `mode_history`, `consent_events`) chặn DELETE; purge ghi một dòng `private.purge_context` (khóa theo mã giao dịch, không vai nào có quyền ghi) rồi `tg_append_only` mới cho DELETE đúng ba bảng đó trong giao dịch ấy.
- `app.export_request(p_scope, p_child)`: QL, luôn `BLOCKED_H4` (chưa có bản xuất; AC-CON-19, 21 chưa kiểm được).
- Diễn tập xóa (`TRIAL-PURGE-01`): dựng tập id của hộ bằng đóng bao theo khóa ngoại cộng id `auth.users`, purge, rồi quét MỌI bảng `app`/`private`/`auth.users` tìm id đó; số dòng giảm phải khớp bằng chứng. `TRIAL-FK-01` bắt bảng mới không có đường khóa ngoại tới hộ/con/thành viên/`auth.users` và không được xóa trong `purge_household`.

### Tham số mới (`private.params`)

| Khóa | Giá trị | Trạng thái | Ý nghĩa |
|---|---|---|---|
| `freeze_idle_days` | 30 | DA_CHOT (D-41) | ngày không thao tác thì đóng băng |
| `trial_purge_after_days` | 7 | DA_CHOT (D-44) | ngày sau hạn thử thì xóa |
| `trial_max_active` | 3 | DA_CHOT | số vị trí thử cùng lúc |
| `child_alert_max_per_hour` | 6 | CHUA_CHOT | D-67: số lần con báo bố mẹ tối đa mỗi giờ mỗi con |
| `child_alert_retention_days` | 7 | DA_CHOT (D-67) | ngày giữ thông báo của con rồi xóa thật |
| `trial_max_days` | 14 | DA_CHOT (D-65) | hạn thử tối đa tính từ hôm mở (PR-CON-09) |
| `purge_delete_auth_users` | 1 | CHUA_CHOT | 1 = purge xóa luôn `auth.users`; 0 = trả `auth_user_ids` cho Edge Function xóa bằng Admin API |

### Việc còn lại, chưa làm

- Chưa kiểm `DELETE FROM auth.users` từ hàm SQL trên Supabase thật (stub chỉ có bảng tối thiểu). Nếu bị từ chối: đặt `purge_delete_auth_users = 0` và để Edge Function xóa theo `auth_user_ids`.
- Edge Function gửi thông báo từ `lifecycle_notices`; Edge Function bọc `trial_open/close/attach`, `job-daily`, `job-trial-purge`.
- Bật `pg_cron` rồi gọi `select private.register_cron_jobs();`. Chưa áp lên đám mây.
- (b) hoàn tác trong thời gian chờ xóa: không làm (chờ chủ sản phẩm). App phía con (chỉ xem lịch đã tải, không nhận lịch mới, không gửi mong muốn khi đóng băng): làm sau.


## T0.5, T3.1, T3.2: bộ xếp lịch ở máy chủ, bảng lịch, lưu và commit lịch

### Đóng gói bộ xếp vào Edge Function (T0.5)

- `node scripts/sync-shared.mjs` chép `packages/scheduler/src` và `packages/domain/src` (TS thuần) vào `functions/_shared/scheduler/src`, `functions/_shared/domain/src` (giữ cấu trúc nên import tương đối vẫn đúng), thêm `scheduler/version.ts` (`ENGINE_VERSION` = băm toàn bộ nguồn) và `SYNC.json`. `--check` (CI, job `check`) thoát 1 nếu cây đích lệch, thiếu hoặc thừa file. Không sửa tay trong `_shared/scheduler`, `_shared/domain`.
- Deno chạy được nguyên mã (không bó, không package). `functions/deno.json` tắt `strict` vì mã bộ xếp port từ spike không gõ kiểu chặt.
- `_tests/schedule.test.ts`: đầu ra ĐẦY ĐỦ của `scheduleWeek` trên P1..P8 trong Deno trùng Node từng byte (test gọi `node --experimental-strip-types _tests/node-ref.ts`), khớp golden và `PARAMS`, tất định.
- Độ trễ đo được (Deno 2.9.6, sandbox, 320 lần P1..P8, đã khởi động): p50 khoảng 0,6 ms, p95 khoảng 6,7 ms, max khoảng 10 ms. Chỉ là thời gian tính toán; chưa đo khởi động lạnh của Supabase Edge Runtime, mạng, hay CSDL (cần dự án thật). Chưa đặt ngưỡng (Q-TS-05).

Chạy test Deno (cần Deno 2 và Node 22): `cd backend/supabase/functions && deno test --allow-read --allow-run=node _tests/schedule.test.ts` (tránh `jsr:`; test dùng `node:assert`). Không có test Edge Function chạy trên Supabase thật hay `supabase functions serve` (không Docker); `deno check */index.ts` kiểm cả nhập `npm:@supabase/supabase-js@2`.

### Bảng lịch (T3.1)

| Bảng | Ghi chú |
|---|---|
| `schedule_profiles` | `CHUAN/GIAI_DOAN/PRESET`, `version`, `input`, `budget` (null = quỹ mặc định), `keep_confirmed` (CHECK không có `ngu`, D-02). Mỗi con ≤ 1 `CHUAN` `ACTIVE` và ≤ 1 nháp. Rời `DRAFT` thì nội dung bị trigger khóa; chuyển trạng thái sai đường bị chặn |
| `activity_cards` | Không cột địa điểm. `note`: D-71 (giai đoạn test lưu toàn bộ dữ liệu) cho lưu, 1 đến 500 ký tự, nguyên văn, CHƯA qua `keyword-check` (BR-CON-094): **lọc trước khi phát hành**. Trước D-71 là `CHECK (note is null)` + `FEATURE_OFF` |
| `schedule_versions` | Bất biến: trigger chặn UPDATE/DELETE/TRUNCATE kể cả `service_role` (ngoại lệ duy nhất: trong `purge_household`). `label_status` luôn `chua_kiem_chung`. Duy nhất `(child_id, idempotency_key)` |
| `schedule_state` | `rev`, con trỏ hiệu lực, khóa (`lock-set` thuộc T4.2) |
| `schedule_answers` | duy nhất `(child_id, question_key, local_date)`; `question_key` dạng `g7_bot_hoc_nha.T2` |

RLS (mô hình đồng ý D-64: lịch thuộc mục lõi MD-LICH, không có mục đích riêng cho đồng bộ, nhắc, Xong, hỏi thăm, báo cáo): chỉ người lớn thuộc hộ (QL, hoặc NL có grant `view` MD-LICH) đọc, khi MD-LICH hiệu lực và dữ liệu không cũ hơn `visible_from` (rút rồi đồng ý lại không làm dữ liệu cũ hiện lại); cùng khuôn `is_adult_of_child` + `can` + `purpose_visible` với `child_health_notes`. Máy con KHÔNG đọc bảng nào (lịch tới máy con qua `device-sync`, T3.6). Không ai ghi trực tiếp.

### profile-save, schedule-preview, schedule-commit (T3.2)

| Hàm Edge | Hàm SQL (RPC, JWT người dùng) | Việc |
|---|---|---|
| `profile-save` | `app.profile_save(p_child, p_patch, p_base_version)` | Lưu nháp: chỉ khóa có trong `p_patch` mới đổi. Hồ sơ ACTIVE + sửa -> nháp phiên bản mới (`supersedes_id`). Thẻ: có `id` thì sửa, không `id` thì thêm, vắng mặt thì lưu trữ (không xóa). `p_base_version` sai -> `CONFLICT_REV` |
| `schedule-preview` | `app.schedule_inputs(p_profile)` | Đọc hồ sơ, lớp/tuổi (không tên con), thẻ, `content_hash`, `rev`; Edge chạy bộ xếp, trả `plan`, `tradeoffs`, `questions`, `board`, `warnings`, `blockers`, `commitable`. Không ghi |
| `schedule-commit` | `app.schedule_inputs(p_profile, p_idempotency_key)` rồi `app.schedule_commit_apply(...)` | Chạy lại bộ xếp trên dữ liệu máy chủ, từ chối nếu `blockers`, ký, ghi một giao dịch |

**Vì sao Edge Function gọi SQL bằng JWT người dùng, không `service_role` (Architecture §6.2: hai cách đều được).** (1) RLS, `app.access_state`/`app.can` và `audit_log` (`private.audit_write_auto` đọc `auth.uid()`) chạy đúng danh tính người gọi, không phải truyền "actor" hộ. (2) Ba hàm này không cần khóa `service_role`: lộ hàm không lộ quyền ghi toàn CSDL. (3) Hàm SQL ghi gọi được trực tiếp bằng PostgREST bởi bất kỳ client nào có JWT, nên "chạy lại ở máy chủ, không tin client" phải được thực thi bằng mật mã chứ không bằng đường gọi: kết quả mang **chữ ký HMAC-SHA256** của Edge Function.

Chữ ký (khóa `schedule_commit_key` trong Vault của CSDL, `SCHEDULE_COMMIT_KEY` ở secret của Edge Function; chuỗi ký `v1\n` + child, profile, rev, khóa idempotency, `content_hash`, `input_hash`, engine, params, nhãn, NGUYÊN VĂN output, đánh đổi, câu hỏi, câu trả lời, nối bằng `\n`; `commitMessage()` trong `schedule-core.ts` và `private.schedule_commit_message` phải trùng, vector chéo ở `tests/fixtures/commit-signature-vector.json` kiểm ở cả hai phía). SQL kiểm chữ ký, rồi (khóa hàng con) kiểm: lịch không `LOCKED`, `rev` khớp, băm nội dung hồ sơ+thẻ tính LẠI lúc commit khớp bản đã ký (hồ sơ đổi giữa lúc xếp và lúc lưu -> `CONFLICT_REV`), cấu trúc output (đủ 7 ngày). Rồi ghi `schedule_versions` + nâng hồ sơ nháp thành ACTIVE (bản cũ SUPERSEDED) + `schedule_state.rev+1` + `schedule_answers` + `audit_log` (`schedule.committed`) + outbox `notifications(lich_moi)` cho máy con đã ghép (chỉ khi MD-DONGBO hiệu lực), cùng một giao dịch. Gửi lại cùng `idempotency_key`: trả kết quả cũ (`replay=true`, Edge trả `code: IDEMPOTENT_REPLAY`), kể cả khi hồ sơ đã đổi; không thêm phiên bản, audit, thông báo.

Kiểm sàn cứng và ô đỏ nằm ở Edge Function (bộ xếp là TS): từ chối khi có ngày `XUNG_DOT` (`C/A1`), giờ ngủ dưới mức tối thiểu hoặc ô Ngủ đỏ/dưới sàn (`D-02/C1`, ô Ngủ không có "Giữ mức này"), ô đỏ có "Giữ mức này" chưa được xác nhận (`D6/A2`; xác nhận bằng `keep_confirmed` đã lưu hoặc `confirmed_red` gửi kèm lúc commit). SQL không chạy lại bộ xếp.

### Quyết định mặc định (tài liệu thiếu hoặc mơ hồ; báo chủ sản phẩm)

- `activity_cards.note`: chưa lưu được (fail-closed) cho tới khi `keyword-check` có; `FEATURE_OFF` ở hàm, `CHECK` ở bảng. Cột địa điểm/`location` bị từ chối (Q-ARC-10).
- `idempotency_key` của `schedule_versions` duy nhất theo con (Tech Spec ghi duy nhất toàn cục); `profile_save` idempotent theo nội dung (gửi lại kèm id thẻ thì `changed=false`), không dùng khóa.
- Ngày `XUNG_DOT` chặn commit (kể cả khi bộ xếp có "phương án đề xuất"): bố mẹ phải bỏ/dời hoạt động trước. Ngày `CAN_BO_ME_CHON` được commit (đánh đổi được lưu trong `tradeoffs`, bố mẹ thấy ở bản xem trước). Chưa có quy tắc nào trong tài liệu nói rõ hai điều này.
- Câu trả lời (`answers`, ví dụ `g7_bot_hoc_nha`) được lưu và ghi vào `questions`, nhưng bộ xếp E1 hiện KHÔNG đọc câu trả lời để đổi lịch (spike chỉ sinh câu hỏi với `default: giu_quy`).
- Lớp/tuổi thiếu một thì suy từ cái kia (lớp = tuổi - 5) [MĐKT]. `di_lai` của bộ xếp = `travel_before_min + travel_after_min`.
- `week_start` của `schedule-preview` được nhận nhưng chưa dùng (lịch chuẩn không gắn ngày). `schedule_state.phase_id` chưa có FK (T4.1). `lock-set` (T4.2) chưa có: trạng thái khóa chỉ được đọc và chặn commit.
- Hồ sơ/thẻ tạo trước lúc rút đồng ý rồi đồng ý lại không hiện lại; nháp cũ bị lưu trữ (`RUT_DONG_Y`) khi lưu lần sau.
- `app.notifications` là bản tối thiểu cho outbox (type `lich_moi` cho máy con khi commit; type `con_bao` cho người lớn khi con bấm "Báo bố mẹ ngay", D-67; payload luôn chỉ `{type,id}`, không có mã câu hay tên); T3.5 mở rộng (FCM, retry, loại thông báo khác). Người nhận `con_bao`: QL và NL có grant `view` MD-CONBAO tại lúc gửi. `app.child_alert_send` được tạo lại (`create or replace`) ở migration T3.2 để gắn outbox (điểm gắn ghi ở T2.8 mục 8). Hàng outbox chưa bị hủy khi rút đồng ý (T3.5).
- `purge_household` và `purge_child` (T2.4) được tạo lại ở migration T3.2: xóa thêm `notifications`, `schedule_answers`, `schedule_state`, `schedule_versions`, `activity_cards`, `schedule_profiles` (bảng lịch theo con; `schedule_versions` được ngoại lệ chỉ-thêm trong ngữ cảnh purge).
- Đột biến của đợt 3a đánh số m110..m125 (main đã dùng tới m102).
- Cần tạo secret `schedule_commit_key` (Vault) và `SCHEDULE_COMMIT_KEY` (Edge Function), cùng giá trị, ≥ 16 ký tự, khi áp lên đám mây. Chưa làm gì trên đám mây.
- Chưa phủ: AC-04..08, 17 được kiểm ở mức bộ xếp (đã có từ T0.3) và chặn commit ở Edge Function; chưa có e2e với Supabase thật (không Docker). CI hiện chưa có job `db-test` (đề xuất ở trên).


## D-68, D-71: gói dịch vụ FREE / TRIAL / PREMIUM (19/11/2026)

Migration `20261119100000_d68_goi_dich_vu.sql`. **D-72 (mục sau) sửa lại cách đếm (theo con), cho FREE nhập thông tin và đổi `my_plan`; bảng bên dưới là bản D-68 gốc.** Chưa có thanh toán thật: chủ sản phẩm đặt gói bằng `service_role`. Người soạn: AI, chưa kiểm chứng độc lập.

| Gói | Tạo/sửa kế hoạch | Ghép máy con, đồng bộ lịch sang máy con |
|---|---|---|
| FREE (mặc định, hộ chưa có dòng) | Không: `profile_save` và `schedule_commit_apply` trả `PLAN_REQUIRED` | Không |
| TRIAL | Tạo mới đúng `trial_plans_max` (1); sau lần tạo đầu, tối đa `trial_edits_max` (3) lần commit phiên bản mới | Không |
| PREMIUM | Không giới hạn (chỗ để mở rộng nhiều kế hoạch/phương án sau) | Có |

- Bảng `app.household_plans` (`household_id` khóa chính, `tier`, `trial_started_at`, `trial_ends_at` tùy chọn, `set_by`, `note`): RLS bật, không chính sách, người dùng không đọc trực tiếp. Chỉ `app.plan_set(p_household, p_tier, p_trial_ends_at, p_note, p_set_by)` (service_role, có `private.require_system`) ghi.
- `app.my_plan()` (người lớn trong hộ): `{ok, tier, expired, plans_used, plans_max, edits_used, edits_left, pal_questions_left, trial_ends_at}`; PREMIUM có `plans_max` và `edits_left` là null (không giới hạn); `pal_questions_left` luôn null (agent Pal làm phần đếm).
- Mã lỗi `PLAN_REQUIRED`: `PT402` (HTTP 402). Quy tắc: `D-68.free`, `D-68.trial_plan`, `D-68.trial_edit`, `D-68.premium`. Lời Việt do máy chủ trả; app có câu dự phòng.
- Tham số `private.params`: `trial_plans_max = 1`, `trial_edits_max = 3` (`DA_CHOT`, D-68).
- Audit `plan.changed` `{old_tier, new_tier}` (trigger trên `household_plans`, hệ thống); đổi hạn hoặc ghi chú không ghi. `purge_household` xóa `household_plans`.
- Hàm nội bộ: `private.plan_tier` (gói hiệu lực), `plan_usage`, `plan_check_schedule`, `plan_require_premium`.
- Seed: hai hộ giả PREMIUM (để các test ghép máy, lịch hiện có chạy); test gói đổi bằng `setup`.

### Quyết định mặc định (CHỜ CHỦ SẢN PHẨM DUYỆT)

1. Đếm theo hộ. Hộ nhiều con: 1 kế hoạch dùng thử là cho MỘT con (con đầu tiên được commit); con khác bị chặn ở bước tạo. Đếm cả con đã ẩn (xóa hồ sơ con không trả lại suất) và cả phiên bản tạo thời PREMIUM (hạ xuống TRIAL thì tính hết).
2. `profile_save` cũng bị chặn khi commit chắc chắn bị chặn (FREE; TRIAL hết suất tạo hoặc hết lượt sửa), để không nhập dở rồi mới bị chặn.
3. Gửi lại commit cùng khóa idempotency vẫn trả kết quả cũ kể cả khi gói đã hạ (replay chạy trước kiểm gói).
4. TRIAL có `trial_ends_at` đã qua = FREE (tính lúc đọc, không sửa dòng). `my_plan` báo `expired`.
5. `pair_code_create` KHÔNG chặn theo gói: máy con chưa thuộc hộ nào nên không biết gói của ai. Chặn ở `pair_confirm` (người lớn) và `pair_accept` (hộ hạ gói giữa chừng thì không ghép nốt; yêu cầu vẫn chờ, không tự hủy).
6. Máy đã ghép mà hộ hạ xuống: giữ liên kết (không tự hủy), nhưng không ghi outbox `lich_moi` (không nhận lịch mới, giống đóng băng). **Hàm `device-sync` (T3.6) sau này phải kiểm `private.plan_tier(hộ) = 'PREMIUM'` trước khi trả lịch.**
7. `schedule-preview` (đọc, không ghi) không chặn theo gói; chặn ở lưu nháp và commit.
8. Ghi chú hoạt động (D-71): 500 ký tự, nguyên văn, chưa lọc từ khóa khẩn. Lọc trước khi phát hành.

## D-72: gói dịch vụ, chi tiết (19/11/2026)

Migration `20261119150000_d72_goi_chi_tiet.sql` (sửa D-68 ở trên). Người soạn: AI, chưa kiểm chứng độc lập. Quyết định gốc: `app-design-document/progress/Owner_Decision_Log_20261115.md` D-72.

| Gói | Nhập thông tin con (`profile_save`), hỏi Pal | Xem trước (`schedule-preview`) và tạo lịch (`schedule_commit_apply`) | Máy con |
|---|---|---|---|
| FREE (kể cả TRIAL hết hạn) | Được | `PLAN_REQUIRED` (`D-68.free`) | `plan_active = false` |
| TRIAL | Được | MỖI CON: 1 kế hoạch (lần commit đầu), rồi `trial_edits_max` (3) lần commit phiên bản mới; hết thì `PLAN_REQUIRED` (`D-68.trial_edit`) | `plan_active = false` (ghép máy chỉ premium, D-68) |
| PREMIUM | Được | Không giới hạn | `plan_active = true` |

- **Đếm theo con**: `private.plan_child_usage(child)` = số phiên bản lịch của con đó. `app.my_plan()` trả `{ok, tier, expired, plans_max, edits_max, children: [{child_id, plans_used, edits_used, edits_left}], pal_questions_left, trial_ends_at, trial_available, trial_days}` (con đã ẩn không có trong danh sách; NL chỉ thấy con mình được xem). `plans_max`/`edits_max`/`edits_left` null = không giới hạn.
- **Xem trước qua RPC**: Edge Function `schedule-preview` gọi `app.schedule_plan_check(p_profile)` TRƯỚC khi đọc dữ liệu (kiểm quyền rồi mới kiểm gói, nên người ngoài hộ không biết gói hộ khác). Edge Function `schedule-commit` không tự kiểm gói; `schedule_commit_apply` kiểm sau bước replay idempotency.
- **Dùng thử tự phục vụ** `app.trial_start(p_device_hash text)`: chỉ người quản lý chính (PRIMARY), hộ không đóng băng. Hộ phải chưa từng TRIAL/PREMIUM (`household_plans`: `trial_started_at` null, `had_premium` false, đang FREE hoặc chưa có dòng) nếu không `TRIAL_USED` (HTTP 409, quy tắc `D-72.household`). `device_hash` (64 hex) do app gửi = `sha256(androidId + muối cố định của app)`; máy chủ không nhận Android ID thô. Email lấy từ `auth.users` của người gọi, chuẩn hóa bằng `private.email_norm` (chữ thường; mọi miền bỏ phần sau `+`; gmail.com/googlemail.com bỏ dấu chấm và coi là gmail.com) rồi băm. Mã máy hoặc email đã có trong `private.trial_claims` thì `TRIAL_USED` (quy tắc chung `D-72.claim`, không nói là mã máy hay email). Thành công: gói TRIAL, hạn `trial_days` (7, CHUA_CHOT) ngày, `set_by = 'self'`.
- **`private.trial_claims`** (`device_hash`, `email_norm_hash`, `household_id`, `claimed_at`; hai cột băm đều UNIQUE): RLS bật, không chính sách, chỉ `service_role`. **KHÔNG bị xóa khi `purge_household`/`purge_child`** (không khóa ngoại) để dùng thử không lặp lại được bằng cách xóa hộ rồi tạo lại. Chỉ giữ băm, không có tên, email thô hay Android ID thô. Lý do giữ: giai đoạn test (D-71) cần chống lặp; **xem lại trước phát hành** (thời hạn giữ, căn cứ pháp lý, có đưa vào chính sách quyền riêng tư không).
- **Máy con**: `app.my_family_state()` trả thêm `plan_active` (true khi hộ PREMIUM). Khi false app con hiện CA-18 ("Tạm dừng, chờ bố mẹ cập nhật"), không nhận lịch mới (outbox `lich_moi` chỉ ghi cho PREMIUM, D-68); liên kết giữ nguyên. Bảng thông báo có loại mới `goi_doi` (nội dung tối giản `{type, id}`, `id` = mã liên kết của máy): trigger `household_plans_notify` ghi cho mọi máy con đã ghép (con chưa ẩn) khi hộ VÀO hoặc RA khỏi PREMIUM; FREE <-> TRIAL không ghi. Thông báo đẩy thật chưa có (T3.5): app con hỏi `my_family_state` lúc vào và mỗi lần trở lại nền trước.
- **Hết hạn**: TRIAL quá `trial_ends_at` tính là FREE ngay (lúc đọc). `private.job_plan_expiry` (gọi từ `job_daily`, kết quả `plan_expiry.expired`) ghi audit `plan.expired` (hệ thống, không meta) MỘT lần mỗi đợt dùng thử (cột `expired_noted_at`, xóa khi bắt đầu hoặc gia hạn đợt mới).
- Ghi chú: `PLAN-TRIAL-*` kiểm chuẩn hóa email, hộ đã dùng, `trial_claims` còn sau purge; `PLAN-ACTIVE-*`, `PLAN-NOTIFY-*`, `PLAN-EXP-*`; đột biến `m170`..`m190` (trừ m172) (và `m130`..`m149` đã sửa theo hàm mới; `m131`, `m134`, `m139` đã thay bằng `m170`, `m171`; `m172` bị bỏ vì `access_state` đã loại con ẩn).

### Quyết định mặc định D-72 (CHỜ CHỦ SẢN PHẨM DUYỆT)

1. `trial_days = 7` (CHUA_CHOT), tính theo giờ từ lúc bấm.
2. Email trong `trial_claims` lưu dạng BĂM (sha256 của email chuẩn hóa, cột `email_norm_hash`), không lưu email dạng chữ như cột `email_norm` mô tả ban đầu: giữ ít dữ liệu cá nhân nhất sau khi xóa hộ. Băm không muối riêng, nên người biết email vẫn dò ra được dòng của họ (chấp nhận ở giai đoạn test).
3. `profile_save` không xét gói nữa (kể cả TRIAL hết lượt sửa vẫn lưu nháp được); chỉ xem trước và commit bị chặn.
4. Hộ từng PREMIUM (đặt tay) rồi hạ về FREE: không dùng thử được (`had_premium`).
5. `goi_doi` chỉ ghi khi trạng thái PREMIUM đổi.
6. `D-68.trial_plan` không còn được phát (mỗi con tối đa 1 kế hoạch theo cấu trúc: kế hoạch đầu là lần commit đầu).
7. Khi nhiều người lớn dùng cùng một máy hoặc cùng một Android ID sau khôi phục cài đặt: Android ID đổi khi xóa dữ liệu/khôi phục gốc; coi là chấp nhận được ở giai đoạn test.

## D-74: dùng thử 7 ngày và khóa ghép máy (28/11/2026)

Migration `20261128100000_d74_dung_thu_khoa_ghep_may.sql` (sửa D-68, D-72). Người soạn: AI, chưa kiểm chứng độc lập. Quyết định gốc: `app-design-document/progress/Owner_Decision_Log_20261115.md` (D-74). Đã có sẵn từ D-72 và không đổi: đã dùng thử thì không dùng thử lại (`trial_claims`, `had_premium`).

- **Khóa**: `household_plans.device_keys` (int, mặc định 1, 0..50) là số khóa của PREMIUM, chủ sản phẩm đặt qua `app.plan_set(..., p_device_keys)` (null = giữ nguyên). TRIAL luôn dùng tham số `trial_device_keys` = 1 (DA_CHOT), FREE = 0. `trial_days` = 7 chuyển sang DA_CHOT.
- **Đã dùng** (`private.device_keys_used`): liên kết `HIEU_LUC` + yêu cầu `CHO_XAC_NHAN_MAY_CON` còn trong `pair_accept_window_minutes` của các con chưa ẩn. `CHO_XAC_MINH` không tính (không có đường lên HIEU_LUC).
- **`pair_confirm`, `pair_accept`** gọi `private.device_key_require` (khóa hàng hộ): FREE thì `PLAN_REQUIRED` (`D-68.premium`, lời đổi thành "cần gói dùng thử hoặc Premium"); hết khóa thì **`DEVICE_KEY_LIMIT`** (HTTP 402, PT402, quy tắc `D-74.keys`, lời tiếng Việt nêu số khóa). `pair_confirm` không tính liên kết/yêu cầu của chính con đang ghép; `pair_accept` không tính chính yêu cầu đang xác nhận. `private.plan_require_premium` đã bỏ.
- **Máy con hoạt động** (`private.binding_in_plan`): hộ đang TRIAL/PREMIUM còn hạn và số máy `HIEU_LUC` ghép trước máy này (theo `paired_at`, `id`) < số khóa hiệu lực. Dùng chung cho `my_family_state().plan_active` (theo TỪNG máy) và outbox `lich_moi` (`schedule_commit_apply`). Hết hạn/hạ gói: mọi máy tạm dừng, giữ liên kết. Giảm khóa dưới số máy đang ghép: KHÔNG tự hủy; máy ghép sau cùng tạm dừng.
- **`goi_doi`**: ghi cho các máy `HIEU_LUC` của hộ khi "gói đang hoạt động" (TRIAL/PREMIUM còn hạn) đổi, kể cả FREE <-> TRIAL, hoặc số khóa hiệu lực đổi. TRIAL hết hạn theo thời gian: `job_plan_expiry` ghi `goi_doi` cùng lúc ghi `plan.expired`.
- **`my_plan`** thêm `device_keys` (hiệu lực) và `device_keys_used`. Edge Function: `DEVICE_KEY_LIMIT` -> 402 (`_shared/api.ts`).
- Seed: hai hộ PREMIUM đặt 5 khóa để các test ghép máy cũ chạy được.
- Test: `PLAN-PAIR-01..06`, `PLAN-SYNC-01..02`, `PLAN-ACTIVE-01..03`, `PLAN-NOTIFY-01..04`, `PLAN-EXP-04`, `PLAN-KEY-01..03` (`plan.test.mjs`); đột biến `m210`..`m227` (và `m91`, `m114`, `m135`..`m137`, `m180`, `m181`, `m183` đã sửa theo hàm mới; `m181` đổi thành `m181-plan-active-bo-so-khoa`).

### Quyết định mặc định D-74 (CHỜ CHỦ SẢN PHẨM DUYỆT)

1. Giảm `device_keys`: máy ghép sau cùng tạm dừng, chưa có màn cho bố mẹ chọn máy nào giữ.
2. Số khóa tối đa 50; `CHO_XAC_MINH` không giữ khóa; yêu cầu chờ quá 5 phút nhả khóa.
3. Khóa tính theo hộ (không chia theo con); `plan_set` không ghi audit riêng cho đổi số khóa (chỉ `plan.changed` khi đổi gói).
4. Hết hạn TRIAL theo thời gian: máy con biết qua `my_family_state` (lúc vào app/trở lại nền trước) và `goi_doi` do job ngày ghi.

## D-76: thỏa thuận người dùng khi đăng ký

Migration `20261128300000_d76_thoa_thuan_dieu_khoan.sql`. Người soạn: AI, chưa kiểm chứng độc lập. Quyết định gốc: D-76 trong `app-design-document/progress/Owner_Decision_Log_20261115.md`.

- `private.terms_version` (một dòng): phiên bản Điều khoản hiện hành, giá trị đầu `2026-11-28-nhap` (`CHUA_CHOT`). Đổi phiên bản = sửa dòng này bằng quản trị; mọi người dùng được hỏi đồng ý lại một lần.
- `app.terms_acceptances` (`user_id`, `terms_version`, `accepted_at`, duy nhất theo cặp user + phiên bản): chỉ-thêm (trigger chặn sửa, xóa, truncate; riêng `purge_household` được xóa, qua `app.tg_append_only`). Không khóa ngoại tới `auth.users`. Người dùng không đọc hay ghi trực tiếp.
- `app.terms_status()` -> `{current_version, accepted}`; `app.terms_accept(p_version)` -> `{version, accepted, replay}` (idempotent theo user + phiên bản; phiên bản không phải bản hiện hành: `VALIDATION`, quy tắc `D-76.version`). Chỉ người lớn đăng nhập; máy con ẩn danh `FORBIDDEN`.
- `family_create`: người chưa có hộ mà chưa đồng ý bản hiện hành bị `TERMS_REQUIRED` (**HTTP 428**, `PT428`, quy tắc `D-76`). Thứ tự kiểm: chưa đăng nhập, máy con, đã thuộc hộ (trả hộ cũ, không chặn), rồi điều khoản.
- Audit `terms.accepted` (chỉ khóa `version`): ghi ngay trong `terms_accept` nếu người đó đã có hộ; nếu chưa có hộ thì `family_create` ghi khi hộ được tạo (audit cần `household_id`).
- `purge_household` xóa dòng điều khoản của người dùng bị xóa; `row_counts` có khóa `app.terms_acceptances`.
- Test: `TERMS-ST/ACC/GATE/VER/AUD/LOG/PURGE` (`terms.test.mjs`); đột biến `m240`..`m251`.
- Quyết định mặc định (CHỜ CHỦ SẢN PHẨM DUYỆT): mã HTTP 428 (không dùng 403 vì 403 đã là quyền); không có đường thu hồi đồng ý điều khoản; người đã có hộ trước D-76 không bị chặn ở máy chủ (app hỏi họ qua `terms_status`).

## T2.9: đồng ý mặc định khi tạo con (D-73)

Migration `20261119300000_t2_9_dong_y_mac_dinh_d73.sql`: `app.consent_events` thêm cột `basis` (`NGUOI_DUNG` mặc định; `MAC_DINH_D73`). `app.child_create` (tạo lại bằng `create or replace`, chữ ký không đổi) ghi cùng giao dịch ba sự kiện DONG_Y cho MD-LICH, MD-SUCKHOE, MD-CONBAO (người ghi là QL đang gọi, bản chính sách mới nhất đang hiệu lực, bỏ qua mục `collect_enabled = false`). Gọi lặp cùng khóa trả sớm nên không ghi đôi. Chưa có bản chính sách hiệu lực thì không ghi (fail-closed). Tắt sau vẫn là `consent_record` RUT (basis `NGUOI_DUNG`); rút mục lõi vẫn là rút toàn bộ. `family_create` chưa có con nên không ghi gì. Test: CON-D73a..d (`consent.test.mjs`), CON-01c; đột biến m200..m202.
