-- expect: PLAN-PURGE-01
-- Lỗi: purge_household bỏ sót app.household_plans.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from app.household_plans t where$f$, $t$delete from app.household_plans t where false and$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
