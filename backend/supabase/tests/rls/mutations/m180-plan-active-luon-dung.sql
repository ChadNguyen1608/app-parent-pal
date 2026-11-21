-- expect: PLAN-ACTIVE-01
-- Lỗi: my_family_state luôn báo plan_active = true.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.my_family_state()'::regprocedure);
  n := replace(d, $f$'plan_active', private.plan_tier(v_h.id) = 'PREMIUM'$f$, $t$'plan_active', true$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
