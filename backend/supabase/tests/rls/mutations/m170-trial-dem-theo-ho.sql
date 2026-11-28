-- expect: PLAN-GATE-06
-- Lỗi: TRIAL đếm phiên bản theo HỘ thay vì theo con: con thứ hai bị tính chung lượt sửa.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.plan_child_usage(uuid)'::regprocedure);
  n := replace(d, $f$from app.schedule_versions v where v.child_id = p_child$f$, $t$from app.schedule_versions v where v.child_id in (select c2.id from app.children c2 where c2.household_id = (select c1.household_id from app.children c1 where c1.id = p_child))$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
