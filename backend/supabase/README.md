# backend/supabase

Lược đồ, chính sách RLS, Edge Function và job của nấc 1 (Tech Spec 13.1).
Nơi đặt dự án đám mây chưa chốt (LQ-08); chưa tạo dự án nào. Người soạn: AI, chưa kiểm chứng độc lập.

| Thư mục / file | Nội dung |
|---|---|
| `config.toml` | Cấu hình Supabase CLI cục bộ, tối thiểu. `private` không nằm trong `[api] schemas` |
| `migrations/` | Baseline T0.2: hộ, thành viên + vai trò, con, grants, thiết bị ghép, mã ghép một lần, phần D-38 (`private.checkin_responses`, `app.weekly_report`) |
| `seed/` | Dữ liệu giả (chị Hoa, anh Minh, bé Na, bé Bin, cô Lan, bé Su). **Không dữ liệu thật của trẻ** |
| `tests/stub/` | `supabase-stub.sql`: vai `anon`/`authenticated`/`service_role`, schema `auth`, `auth.uid()`/`auth.jwt()`. **Chỉ dùng cho test trên Postgres thuần, không nằm trong migrations** |
| `tests/rls/` | Test RLS bằng `node:test` + `psql` (không package): `rls.test.mjs`, `policy-matrix.json`, `mutations/` |
| `functions/` | Edge Function (task sau) |

## Chạy test RLS

Hai chế độ, cùng một bộ test (`tests/rls/rls.test.mjs`, đọc `RLS_DB_URL`).

**(a) Postgres 16 thuần (sandbox, không cần Docker).** Cần `/usr/lib/postgresql/16/bin` (đặt `PG_BIN` nếu khác) và `psql`.

```bash
scripts/db-test.sh                  # initdb vào /tmp, cổng tự chọn, nạp stub + migrations + seed, chạy test, dọn dẹp
scripts/db-test.sh --prove-negative # thêm: áp 10 đột biến và xác nhận test THẤT BẠI đúng mã
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

Thêm bảng `app` mới: thêm dòng vào `policy-matrix.json` (số dòng mong đợi theo vai) cùng migration. Thêm hàm `app.*`: thêm vào `app_functions`.

## Chứng minh test thất bại đúng

`scripts/db-test.sh --prove-negative` áp lần lượt từng file trong `tests/rls/mutations/` lên bản sao CSDL sạch (bỏ chính sách, tắt RLS, bảng mới thiếu matrix hoặc thiếu RLS, `using (true)`, cấp quyền `private`, view/hàm đọc vòng, ghi trực tiếp, `weekly_report` nhận khoảng ngày). Mỗi file ghi `-- expect: <mã test>`; script yêu cầu test thất bại và đúng các mã đó.

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
- Chưa có `app.can` và `purposes` (T1.1): chính sách baseline dùng các hàm hẹp `app.is_member`, `is_primary`, `has_grant`, `is_bound_device`. `grants.purpose_code` chưa có FK; `households.trial_slot_id` chưa có FK tới `trial_slots`.
- NL thấy con khi có grant `ACTIVE`, `view` (mọi `resource`); QL thấy mọi con chưa ẩn của hộ; máy con chỉ thấy hàng `device_bindings` của mình khi `HIEU_LUC`.
- `weekly_report` đếm "ngày" theo loại ngày (`day_features`), bỏ `bo_qua` và bản đã hoàn tác; ngày không có đặc điểm gộp vào `khong_dac_diem`. Đây là `[MĐKT]`, chờ BL chốt.
- Hàm ghi `checkin_responses` từ máy con (§2.7: "R/W hàng của mình chỉ qua hàm") thuộc task sau.
- Quản trị viên có `service_role` đọc được `private.*` (giới hạn đã ghi ở Architecture §6.3).
