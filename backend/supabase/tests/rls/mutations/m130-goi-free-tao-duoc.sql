-- expect: PLAN-GATE-01
-- Lỗi: gói FREE được coi như TRIAL: tạo/sửa kế hoạch không bị chặn.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.plan_check_schedule(uuid)'::regprocedure);
  n := replace(d, $f$if v_tier <> 'TRIAL' then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
