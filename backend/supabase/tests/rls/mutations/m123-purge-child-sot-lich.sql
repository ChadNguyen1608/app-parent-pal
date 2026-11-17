-- expect: TRIAL-CHILD-01
-- Lỗi: purge_child bỏ sót app.schedule_versions (lịch của con còn lại sau khi xóa dữ liệu một con).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_child(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from app.schedule_versions t where t.child_id = p_child;$f$, $t$delete from app.schedule_versions t where false;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
