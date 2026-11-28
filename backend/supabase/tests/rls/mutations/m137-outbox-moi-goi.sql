-- expect: PLAN-SYNC-02
-- Lỗi: commit ghi outbox lich_moi cho mọi máy đã ghép, không xét gói và số khóa.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,integer,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$and private.binding_in_plan(b.id)$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
