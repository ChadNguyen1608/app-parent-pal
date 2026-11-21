-- expect: PLAN-NOTIFY-01
-- Lỗi: goi_doi ghi cả khi FREE <-> TRIAL (không đổi gì với máy con).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.tg_plan_notify()'::regprocedure);
  n := replace(d, $f$if v_old_prem is distinct from (new.tier = 'PREMIUM') then$f$, $t$if true then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
