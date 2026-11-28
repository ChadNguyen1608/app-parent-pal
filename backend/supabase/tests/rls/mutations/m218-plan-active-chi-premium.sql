-- expect: PLAN-ACTIVE-01
-- Lỗi: my_family_state chỉ coi PREMIUM là hoạt động (như D-72, bỏ dùng thử).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.my_family_state()'::regprocedure);
  n := replace(d, $f$'plan_active', private.binding_in_plan(v_bid)$f$, $t$'plan_active', private.binding_in_plan(v_bid) and (select private.plan_tier(c.household_id) from app.device_bindings b join app.children c on c.id = b.child_id where b.id = v_bid) = 'PREMIUM'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
