-- expect: PLAN-TRIAL-02
-- Lỗi: trial_start không đặt hạn dùng thử.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.trial_start(text)'::regprocedure);
  n := replace(d, $f$v_ends := now() + make_interval(days => v_days);$f$, $t$v_ends := null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
