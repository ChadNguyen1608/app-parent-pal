-- expect: PLAN-SYNC-01
-- Lỗi: commit ghi outbox lich_moi cho mọi gói (không chỉ PREMIUM).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,integer,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$and private.plan_tier(v_hh) = 'PREMIUM'$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
