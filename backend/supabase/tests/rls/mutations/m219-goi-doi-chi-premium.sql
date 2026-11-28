-- expect: PLAN-NOTIFY-01
-- Lỗi: goi_doi chỉ ghi khi trạng thái PREMIUM đổi (như D-72): FREE <-> TRIAL không báo máy con.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.tg_plan_notify()'::regprocedure);
  n := replace(d, $f$if v_old_act is distinct from v_new_act or v_old_keys is distinct from v_new_keys then$f$, $t$if (tg_op = 'UPDATE' and old.tier = 'PREMIUM') is distinct from (new.tier = 'PREMIUM') then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
