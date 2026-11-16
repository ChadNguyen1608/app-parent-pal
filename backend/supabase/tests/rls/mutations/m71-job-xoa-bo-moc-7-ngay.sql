-- expect: TRIAL-JOB-02
-- Lỗi: job-trial-purge bỏ mốc 7 ngày: xóa ngay khi vị trí HET_THU.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.job_trial_purge(timestamptz,boolean)'::regprocedure);
  n := replace(d, $f$s.state = 'HET_THU' and s.purge_due_at <= v_today$f$, $t$s.state = 'HET_THU'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
