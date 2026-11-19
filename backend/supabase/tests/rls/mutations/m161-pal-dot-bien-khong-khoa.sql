-- expect: PAL-SPIKE-01,PAL-SPIKE-03
-- Lỗi: pal_check_usage phát hiện đột biến nhưng không khóa hộ.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.pal_check_usage(uuid)'::regprocedure);
  n := replace(d, $f$insert into private.pal_locks (household_id, reason) values (p_household, 'SPIKE');$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
