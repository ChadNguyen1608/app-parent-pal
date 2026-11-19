-- expect: PLAN-GATE-02
-- Lỗi: profile_save kiểm gói trước khi kiểm quyền: người ngoài hộ/không grant nhận PLAN_REQUIRED (lộ gói của hộ khác).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.profile_save(uuid,jsonb,integer)'::regprocedure);
  n := replace(d, $f$v_state := app.access_state(v_uid, 'child.update', p_child, 'MD-LICH');$f$, $t$perform private.plan_check_schedule(p_child); v_state := app.access_state(v_uid, 'child.update', p_child, 'MD-LICH');$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
