-- expect: RLS-D38-02, RLS-GEN-04
-- Đường vòng: hàm security definer trả từng dòng hỏi thăm cho người lớn.
create function app.leak_checkins(p_child uuid) returns setof private.checkin_responses
language sql security definer set search_path = '' as $$
  select * from private.checkin_responses where child_id = p_child
$$;
grant execute on function app.leak_checkins(uuid) to authenticated;
