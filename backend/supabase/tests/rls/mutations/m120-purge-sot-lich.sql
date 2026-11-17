-- expect: TRIAL-PURGE-01
-- Lỗi: purge_household bỏ sót app.schedule_versions (lịch của hộ còn lại sau khi xóa).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from app.schedule_versions t where$f$, $t$delete from app.schedule_versions t where false and$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
