-- expect: PLAN-GATE-05
-- Lỗi: TRIAL không giới hạn số lần sửa.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.plan_check_schedule(uuid)'::regprocedure);
  n := replace(d, $f$if v_used.plans_used >= v_pmax and v_used.edits_used >= v_emax then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
