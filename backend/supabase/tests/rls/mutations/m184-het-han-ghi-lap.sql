-- expect: PLAN-EXP-01
-- Lỗi: job_plan_expiry không đánh dấu đã ghi: ghi plan.expired lặp mỗi ngày.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.job_plan_expiry(timestamptz)'::regprocedure);
  n := replace(d, $f$update app.household_plans set expired_noted_at = p_now where household_id = r.household_id;$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
