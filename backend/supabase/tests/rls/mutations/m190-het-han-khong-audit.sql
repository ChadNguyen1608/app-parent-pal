-- expect: PLAN-EXP-01
-- Lỗi: job_plan_expiry không ghi audit plan.expired.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.job_plan_expiry(timestamptz)'::regprocedure);
  n := replace(d, $f$perform private.audit_write_auto(r.household_id, 'plan.expired', 'household:' || r.household_id);$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
