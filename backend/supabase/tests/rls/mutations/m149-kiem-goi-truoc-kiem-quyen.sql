-- expect: PLAN-GATE-02
-- Lỗi: schedule_plan_check kiểm gói trước khi kiểm quyền: người không có quyền với con nhận PLAN_REQUIRED (lộ gói của hộ khác).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_plan_check(uuid)'::regprocedure);
  n := replace(d, $f$v_state := app.access_state(v_uid, 'child.update', v_p.child_id, 'MD-LICH');$f$, $t$perform private.plan_check_schedule(v_p.child_id); v_state := app.access_state(v_uid, 'child.update', v_p.child_id, 'MD-LICH');$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
