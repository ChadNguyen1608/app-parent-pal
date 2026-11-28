-- expect: PLAN-KEY-02
-- Lỗi: my_plan không trả device_keys_used.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.my_plan()'::regprocedure);
  n := replace(d, $f$'device_keys_used', private.device_keys_used(v_hh));$f$, $t$'device_keys_used', 0);$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
