-- expect: CON-07a
-- Lỗi: purpose_effective chỉ xét collect_enabled, bỏ qua trạng thái đồng ý/rút (rút rồi vẫn thu và vẫn hiện dữ liệu).
create or replace function app_internal.purpose_effective(p_child uuid, p_code text) returns boolean
language sql stable security definer set search_path = '' as $f$
  select p_child is not null and exists (select 1 from app.purposes p where p.code = p_code and p.collect_enabled)
$f$;
