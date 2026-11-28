-- expect: PLAN-ACTIVE-03
-- Lỗi: my_family_state chỉ xét gói, bỏ số khóa: máy vượt khóa vẫn báo hoạt động.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.my_family_state()'::regprocedure);
  n := replace(d, $f$'plan_active', private.binding_in_plan(v_bid)$f$, $t$'plan_active', private.plan_tier((select c.household_id from app.device_bindings b join app.children c on c.id = b.child_id where b.id = v_bid)) <> 'FREE'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
