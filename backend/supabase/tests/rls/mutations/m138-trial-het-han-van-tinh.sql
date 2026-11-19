-- expect: PLAN-GATE-08
-- Lỗi: gói TRIAL quá hạn vẫn được tính là TRIAL.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.plan_tier(uuid)'::regprocedure);
  n := replace(d, $f$p.tier = 'TRIAL' and p.trial_ends_at is not null and p.trial_ends_at <= now()$f$, $t$false$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
