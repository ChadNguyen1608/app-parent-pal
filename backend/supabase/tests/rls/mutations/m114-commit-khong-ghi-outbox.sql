-- expect: SCH-CM-01
-- Lỗi: schedule_commit_apply không ghi outbox thông báo lịch mới cho máy con.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,int,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$and private.binding_in_plan(b.id);$f$, $t$and false;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
