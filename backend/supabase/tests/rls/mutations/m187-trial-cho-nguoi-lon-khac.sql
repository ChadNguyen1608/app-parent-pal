-- expect: PLAN-TRIAL-08
-- Lỗi: trial_start không giới hạn cho người quản lý chính: NL cũng bắt đầu dùng thử được.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.trial_start(text)'::regprocedure);
  n := replace(d, $f$and m.role = 'PRIMARY';$f$, $t$;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
