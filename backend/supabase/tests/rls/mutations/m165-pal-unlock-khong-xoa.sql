-- expect: PAL-OWN-03
-- Lỗi: pal_unlock không xóa khóa.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pal_unlock(uuid)'::regprocedure);
  n := replace(d, $f$delete from private.pal_locks where household_id = p_household;$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
