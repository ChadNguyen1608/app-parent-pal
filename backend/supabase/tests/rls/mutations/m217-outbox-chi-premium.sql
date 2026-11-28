-- expect: PLAN-SYNC-01
-- Lỗi: commit chỉ ghi outbox lich_moi cho hộ PREMIUM (như D-68, bỏ dùng thử).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,integer,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$and private.binding_in_plan(b.id)$f$, $t$and private.plan_tier(v_hh) = 'PREMIUM'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
