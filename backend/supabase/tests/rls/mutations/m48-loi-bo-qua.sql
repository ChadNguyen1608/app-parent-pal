-- expect: CON-03b
-- Lỗi: purpose_effective bỏ qua mục lõi (mục riêng vẫn hiệu lực khi đồng ý lõi đã rút).
create or replace function app_internal.purpose_effective(p_child uuid, p_code text) returns boolean
language sql stable security definer set search_path = '' as $f$
  select exists (select 1 from app.purposes p join app.purpose_state s on s.purpose_code = p.code
                 where p.code = p_code and p.collect_enabled and s.child_id = p_child and s.state = 'DANG_BAT')
$f$;
