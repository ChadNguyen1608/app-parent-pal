-- expect: PAL-FLAG-01
-- Lỗi: pal_state bỏ qua cờ pal_enabled: tắt cờ vẫn dùng được.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.pal_state(uuid)'::regprocedure);
  n := replace(d, $f$when private.param_int('pal_enabled') <> 1 then 'OFF'$f$, $t$when false then 'OFF'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
