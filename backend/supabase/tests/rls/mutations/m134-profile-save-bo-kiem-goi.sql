-- expect: PLAN-GATE-01
-- Lỗi: profile_save không kiểm gói.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.profile_save(uuid,jsonb,integer)'::regprocedure);
  n := replace(d, $f$perform private.plan_check_schedule(p_child);$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
