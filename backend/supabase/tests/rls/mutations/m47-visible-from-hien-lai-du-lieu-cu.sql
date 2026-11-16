-- expect: CON-07a
-- Lỗi: visible_from lấy mốc đồng ý ĐẦU TIÊN trong sổ thay vì mốc hiện hành: đồng ý lại làm dữ liệu cũ hiện lại.
create or replace function app_internal.visible_from(p_child uuid, p_code text) returns timestamptz
language sql stable security definer set search_path = '' as $f$
  select case when app_internal.purpose_effective(p_child, p_code)
              then (select min(e.at) from app.consent_events e where e.child_id = p_child and e.purpose_code = p_code and e.event = 'DONG_Y') end
$f$;
