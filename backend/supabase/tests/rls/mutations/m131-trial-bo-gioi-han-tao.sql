-- expect: PLAN-GATE-06
-- Lỗi: TRIAL không giới hạn số kế hoạch tạo mới (con thứ hai tạo được).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.plan_check_schedule(uuid,boolean)'::regprocedure);
  n := replace(d, $f$if not v_has and v_used.plans_used >= v_pmax then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
