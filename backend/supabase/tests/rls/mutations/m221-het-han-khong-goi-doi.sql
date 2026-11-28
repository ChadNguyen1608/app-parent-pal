-- expect: PLAN-EXP-04
-- Lỗi: job_plan_expiry không ghi goi_doi khi TRIAL hết hạn theo thời gian (máy con không biết gói đã hết).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.job_plan_expiry(timestamptz)'::regprocedure);
  n := replace(d, $f$where c.household_id = r.household_id and b.state = 'HIEU_LUC' and c.hidden_at is null;$f$, $t$where c.household_id = r.household_id and b.state = 'HIEU_LUC' and c.hidden_at is null and false;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
