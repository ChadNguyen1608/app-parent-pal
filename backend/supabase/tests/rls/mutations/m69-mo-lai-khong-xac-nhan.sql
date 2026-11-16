-- expect: LC-REOPEN-03
-- Lỗi: mở lại không cần xác nhận rõ ràng.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.household_reopen(boolean)'::regprocedure);
  n := replace(d, $f$if p_confirm is distinct from true then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
