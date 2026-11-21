-- expect: PAL-TOK-04
-- Lỗi: pal_state bỏ ngân sách token ngày toàn hệ thống.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.pal_state(uuid)'::regprocedure);
  n := replace(d, $f$when v_stok >= private.param_int('pal_system_tokens_per_day') then 'BUSY'$f$, $t$when false then 'BUSY'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
