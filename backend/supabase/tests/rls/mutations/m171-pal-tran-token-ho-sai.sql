-- expect: PAL-TOK-02
-- Lỗi: pal_state bỏ trần token ngày của hộ.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.pal_state(uuid)'::regprocedure);
  n := replace(d, $f$when v_htok >= private.param_int('pal_household_tokens_per_day') then 'TOKENS'$f$, $t$when false then 'TOKENS'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
