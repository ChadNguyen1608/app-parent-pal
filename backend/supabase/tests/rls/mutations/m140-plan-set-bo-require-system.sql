-- expect: PLAN-DB-02
-- Lỗi: plan_set bỏ require_system: cấp nhầm EXECUTE là người dùng tự đổi gói được.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.plan_set(uuid,text,timestamp with time zone,text,text)'::regprocedure);
  n := replace(d, $f$perform private.require_system();$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
