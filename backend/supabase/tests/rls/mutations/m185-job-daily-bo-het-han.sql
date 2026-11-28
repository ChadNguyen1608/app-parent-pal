-- expect: PLAN-EXP-01
-- Lỗi: job_daily không gọi job_plan_expiry.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.job_daily(timestamptz)'::regprocedure);
  n := replace(d, $f$, 'plan_expiry', private.job_plan_expiry(p_now)$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
