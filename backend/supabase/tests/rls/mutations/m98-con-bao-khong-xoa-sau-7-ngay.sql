-- expect: ALR-JOB-02
-- Lỗi: job_alert_cleanup không xóa gì (thông báo giữ quá 7 ngày).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.job_alert_cleanup(timestamptz)'::regprocedure);
  n := replace(d, $f$where a.created_at <$f$, $t$where false and a.created_at <$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
