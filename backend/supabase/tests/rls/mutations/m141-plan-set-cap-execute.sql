-- expect: PLAN-DB-02,RLS-GEN-04
-- Lỗi: cấp EXECUTE của app.plan_set cho authenticated (và bỏ require_system): người dùng tự đổi gói.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.plan_set(uuid,text,timestamp with time zone,text,text)'::regprocedure);
  n := replace(d, $f$perform private.require_system();$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
grant execute on function app.plan_set(uuid, text, timestamptz, text, text) to authenticated;
