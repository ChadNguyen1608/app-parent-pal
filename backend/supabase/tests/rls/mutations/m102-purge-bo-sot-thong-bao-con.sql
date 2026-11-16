-- expect: TRIAL-PURGE-01
-- Lỗi: purge_household không xóa child_alerts.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from app.child_alerts t where t.child_id in (select c.id from app.children c where c.household_id = p_household);$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
