-- Dọn quyền hàm phụ trợ của schema app (cố vấn bảo mật Supabase: lint 0029 "authenticated_security_definer_function_executable").
-- Người soạn: AI, chưa kiểm chứng độc lập.
--
-- VẤN ĐỀ. Schema `app` nằm trong [api] schemas, nên mọi hàm `app.*` mà `authenticated` có EXECUTE đều gọi được qua
-- /rest/v1/rpc/<tên>. Hàm nghiệp vụ (family_create, touch_active, child_*, mode_set, pair_*, pin_set, unlink_device,
-- weekly_report, member_invite) là cố ý. Còn 9 hàm phụ trợ chỉ để chính sách RLS gọi cũng bị lộ ra RPC:
-- is_member, is_primary_member, is_primary, is_self_member, has_grant, is_bound_device, household_frozen, can, can_household.
-- Chúng đều security definer và nhận id làm tham số, nên người gọi RPC có thể dò quan hệ (vd app.is_member(<hộ>)).
--
-- VÌ SAO KHÔNG CHỈ REVOKE. Biểu thức trong chính sách RLS chạy với quyền của NGƯỜI GỌI truy vấn, nên hàm được gọi trong
-- chính sách phải còn EXECUTE cho `authenticated` (và schema chứa nó phải có USAGE). Thu hồi thẳng là làm mọi `select` hỏng.
--
-- CÁCH LÀM (đo bằng pg_depend trên CSDL đã nạp đủ migration):
--  * Chính sách hiện chỉ gọi 4 hàm: can, can_household, is_member, is_self_member
--    -> chuyển sang schema `app_internal` bằng ALTER FUNCTION ... SET SCHEMA. Hàm giữ nguyên OID, nên mọi chính sách trỏ
--       theo tự cập nhật (không phải viết lại chính sách); thân hàm đã dùng tên có schema nên không đổi.
--       `app_internal` KHÔNG nằm trong [api] schemas (config.toml; trên đám mây: Settings > API > Exposed schemas phải giữ
--       không có `app_internal`), nên PostgREST không phát lộ RPC. `authenticated` có USAGE để chính sách giải được tên hàm,
--       `anon` không có gì.
--  * 5 hàm còn lại (is_primary_member, is_primary, has_grant, is_bound_device, household_frozen) không còn chính sách nào
--    dùng (baseline đã thay bằng app.can ở T1.1), không hàm nào gọi -> thu hồi EXECUTE khỏi authenticated, để nguyên trong `app`
--    (chỉ service_role). Có thể xóa hẳn ở dọn dẹp sau.
--  * Không dùng `private`: test RLS-GEN-02 đòi authenticated KHÔNG có USAGE trên `private` (chứa dữ liệu D-38 và PIN).
--
-- HỆ QUẢ cho người gọi: app.can / app.can_household không còn gọi được qua RPC; Edge Function dùng service_role gọi
-- `app_internal.can(...)` (cần USAGE schema cho service_role, đã cấp bên dưới). Ứng dụng khách không gọi hàm này (kiểm test hợp đồng).
--
-- Đối chứng: tests/rls/rls.test.mjs RLS-GEN-04 (app chỉ còn hàm nghiệp vụ), RLS-GEN-05 (app_internal) và đột biến m37, m38.

create schema app_internal;
revoke all on schema app_internal from public, anon, authenticated;
grant usage on schema app_internal to authenticated, service_role;

-- Hàm mới đặt vào app_internal không tự có EXECUTE cho PUBLIC (mặc định của Postgres).
alter default privileges in schema app_internal revoke execute on functions from public, anon, authenticated;

alter function app.can(uuid, text, uuid, text)        set schema app_internal;
alter function app.can_household(uuid, text, uuid)    set schema app_internal;
alter function app.is_member(uuid)                    set schema app_internal;
alter function app.is_self_member(uuid)               set schema app_internal;

-- Giữ đúng ACL: chỉ authenticated (chính sách gọi) và service_role. ALTER ... SET SCHEMA giữ ACL cũ; khẳng định lại cho rõ.
revoke all on function
  app_internal.can(uuid, text, uuid, text), app_internal.can_household(uuid, text, uuid),
  app_internal.is_member(uuid), app_internal.is_self_member(uuid)
  from public, anon;
grant execute on function
  app_internal.can(uuid, text, uuid, text), app_internal.can_household(uuid, text, uuid),
  app_internal.is_member(uuid), app_internal.is_self_member(uuid)
  to authenticated, service_role;

-- Hàm phụ trợ không còn dùng: ra khỏi RPC.
revoke execute on function
  app.is_primary_member(uuid), app.is_primary(uuid), app.has_grant(uuid),
  app.is_bound_device(uuid), app.household_frozen(uuid)
  from public, anon, authenticated;

-- Thân hàm tra tên bằng chữ nên không tự theo khi đổi schema: app.reject_household gọi app.is_member.
-- (ALTER ... SET SCHEMA chỉ giữ chính sách và đối tượng phụ thuộc theo OID, không sửa văn bản thân hàm.)
create or replace function app.reject_household(p_actor uuid, p_state text, p_household uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_state = 'FROZEN' then
    perform app.fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa thay đổi được.');
  elsif (select app_internal.is_member(p_household)) then
    perform app.fail('FORBIDDEN', null, 'Bạn không có quyền làm việc này.');
  else
    perform app.fail('NOT_FOUND', null, 'Không tìm thấy.');
  end if;
end $$;

-- Chốt chặn: không còn hàm nào trong app / private nhắc tên cũ (sót sẽ hỏng lúc chạy, không phải lúc nạp migration).
do $$
declare
  v_bad text;
begin
  select string_agg(n.nspname || '.' || p.proname, ', ') into v_bad
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('app', 'private', 'app_internal') and p.prokind = 'f'
    and p.prosrc ~ 'app\.(can|can_household|is_member|is_self_member)\s*\(';
  if v_bad is not null then
    raise exception 'còn hàm gọi tên cũ app.can/can_household/is_member/is_self_member: %', v_bad;
  end if;
end $$;
