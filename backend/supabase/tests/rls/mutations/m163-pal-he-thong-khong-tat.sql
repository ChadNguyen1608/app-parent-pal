-- expect: PAL-SPIKE-04
-- Lỗi: pal_check_usage ghi cảnh báo đột biến hệ thống nhưng không tắt pal_enabled.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.pal_check_usage(uuid)'::regprocedure);
  n := replace(d, $f$update private.params set value_int = 0 where key = 'pal_enabled';$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
