-- expect: PLAN-GATE-01
-- Lỗi: schedule_commit_apply không kiểm gói.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,integer,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$perform private.plan_check_schedule(p_child, true);$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
