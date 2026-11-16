-- expect: ALR-READ-04
-- Lỗi: alert_fresh luôn đúng: thông báo quá 7 ngày vẫn đọc được khi job chưa chạy.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app_internal.alert_fresh(timestamptz)'::regprocedure);
  n := replace(d, $f$select p_created > now() - make_interval(days => private.param_int('child_alert_retention_days'))$f$, $t$select true$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
