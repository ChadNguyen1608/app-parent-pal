-- expect: PLAN-TRIAL-11
-- Lỗi: purge_household xóa trial_claims: dùng thử lặp được sau khi xóa hộ.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from app.household_plans t where t.household_id = p_household;$f$, $t$delete from app.household_plans t where t.household_id = p_household; delete from private.trial_claims c where c.household_id = p_household;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
