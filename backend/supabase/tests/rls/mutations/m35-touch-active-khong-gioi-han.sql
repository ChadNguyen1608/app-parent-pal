-- expect: FN-FAM-04
-- Lỗi: touch_active bỏ giới hạn 1 lần/giờ.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.touch_active()'::regprocedure);
  d := replace(o, 'm.last_active_at <= now() - make_interval(mins => v_min)', 'true');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
