-- expect: PLAN-PAIR-01
-- Lỗi: pair_confirm không kiểm PREMIUM.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pair_confirm(uuid,text,text)'::regprocedure);
  n := replace(d, $f$perform private.plan_require_premium(v_child.household_id);$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
