-- expect: ALR-WEEKLY-01,ALR-WEEKLY-02
-- Lỗi: weekly_report đếm cả thông báo của con.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.weekly_report(uuid,text)'::regprocedure);
  n := replace(d, $f$return jsonb_build_object('iso_week', iso_week, 'ready', true, 'by_day_type', v_by);$f$, $t$return jsonb_build_object('iso_week', iso_week, 'ready', true, 'by_day_type', v_by, 'alerts', (select count(*) from app.child_alerts a where a.child_id = weekly_report.child));$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
