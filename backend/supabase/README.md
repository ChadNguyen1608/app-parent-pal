# backend/supabase

Lược đồ, chính sách RLS, Edge Function và job của nấc 1 (Tech Spec 13.1).
Nơi đặt dự án đám mây chưa chốt (LQ-08); chưa tạo dự án nào. Người soạn: AI, chưa kiểm chứng độc lập.

| Thư mục / file | Nội dung |
|---|---|
| `config.toml` | Cấu hình Supabase CLI cục bộ, tối thiểu. `private` không nằm trong `[api] schemas` |
| `migrations/` | `…100000` baseline T0.2: hộ, thành viên + vai trò, con, grants, thiết bị ghép, mã ghép một lần, phần D-38. `…110000` T1.1: `purposes`, `mode_history`, `invitations`, `app.can`, mã lỗi `app.fail`, FK `grants.purpose_code`. `…120000` T1.3: `child_create/update/delete`. `…130000` T1.4: `mode_set` |
| `seed/` | Dữ liệu giả (chị Hoa, anh Minh, bé Na, bé Bin, cô Lan, bé Su). **Không dữ liệu thật của trẻ** |
| `tests/stub/` | `supabase-stub.sql`: vai `anon`/`authenticated`/`service_role`, schema `auth`, `auth.uid()`/`auth.jwt()`. **Chỉ dùng cho test trên Postgres thuần, không nằm trong migrations** |
| `tests/rls/` | Test bằng `node:test` + `psql` (không package): `rls.test.mjs` (RLS-GEN/ROLE/SCHEMA/D38), `fn.test.mjs` (FN-CAN/TBL/CHILD/MODE), `policy-matrix.json`, `mutations/` |
| `functions/` | Edge Function (task sau) |

## Chạy test RLS

Hai chế độ, cùng một bộ test (`tests/rls/rls.test.mjs`, đọc `RLS_DB_URL`).

**(a) Postgres 16 thuần (sandbox, không cần Docker).** Cần `/usr/lib/postgresql/16/bin` (đặt `PG_BIN` nếu khác) và `psql`.

```bash
scripts/db-test.sh                  # initdb vào /tmp, cổng tự chọn, nạp stub + migrations + seed, chạy test, dọn dẹp
scripts/db-test.sh --prove-negative # thêm: áp 18 đột biến và xác nhận test THẤT BẠI đúng mã
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
