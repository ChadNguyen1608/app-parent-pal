-- expect: PLAN-GATE-01
-- Lỗi: schedule_plan_check không kiểm gói: gói FREE xem trước được.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_plan_check(uuid)'::regprocedure);
  n := replace(d, $f$perform private.plan_check_schedule(v_p.child_id);$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
