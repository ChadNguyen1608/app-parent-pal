-- expect: RLS-GEN-05
-- Lỗi: cấp USAGE schema app_internal và EXECUTE app_internal.can cho anon.
grant usage on schema app_internal to anon;
grant execute on function app_internal.can(uuid, text, uuid, text) to anon;
