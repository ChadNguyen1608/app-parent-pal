-- expect: RLS-D38-05, RLS-D38-02, RLS-GEN-04
-- Thêm bản nạp chồng nhận khoảng ngày: cho phép đào xuống từng ngày.
create function app.weekly_report(child uuid, d_from date, d_to date) returns jsonb
language sql security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('d', r.local_date, 'c', r.choice)), '[]'::jsonb)
  from private.checkin_responses r where r.child_id = child and r.local_date between d_from and d_to
$$;
grant execute on function app.weekly_report(uuid, date, date) to authenticated;
