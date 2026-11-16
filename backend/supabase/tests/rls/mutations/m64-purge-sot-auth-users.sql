-- expect: TRIAL-PURGE-01
-- Lỗi: purge_household không xóa auth.users của hộ (người dùng ẩn danh của máy con còn lại).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from auth.users t where t.id = any (v_del);$f$, $t$delete from auth.users t where false and t.id = any (v_del);$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
