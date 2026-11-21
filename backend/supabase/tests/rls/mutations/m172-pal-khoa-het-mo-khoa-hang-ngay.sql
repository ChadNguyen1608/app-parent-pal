-- expect: PAL-OWN-03
-- Lỗi: app.pal_set_enabled không đổi cờ.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pal_set_enabled(boolean)'::regprocedure);
  n := replace(d, $f$update private.params set value_int = case when p_enabled then 1 else 0 end where key = 'pal_enabled';$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
