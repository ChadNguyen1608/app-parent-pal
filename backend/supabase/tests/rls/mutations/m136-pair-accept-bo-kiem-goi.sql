-- expect: PLAN-PAIR-02
-- Lỗi: pair_accept không kiểm PREMIUM.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pair_accept()'::regprocedure);
  n := replace(d, $f$perform private.plan_require_premium(v_hh.id);$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
