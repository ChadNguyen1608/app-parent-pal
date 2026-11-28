-- expect: PLAN-TRIAL-07
-- Lỗi: trial_start không kiểm hộ đã từng TRIAL/PREMIUM.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.trial_start(text)'::regprocedure);
  n := replace(d, $f$if found and (v_p.tier <> 'FREE' or v_p.trial_started_at is not null or v_p.had_premium) then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
