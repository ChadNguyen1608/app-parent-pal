-- expect: PLAN-GATE-01
-- Lỗi: profile_save kiểm gói như commit: gói FREE không nhập được thông tin (D-72: FREE được nhập).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.profile_save(uuid,jsonb,integer)'::regprocedure);
  n := replace(d, $f$if p_patch is null or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then$f$, $t$perform private.plan_check_schedule(p_child); if p_patch is null or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
