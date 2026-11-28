-- expect: TERMS-PURGE-01
-- Lỗi: purge_household không xóa dòng đồng ý điều khoản.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from app.terms_acceptances t where t.user_id = any (v_del);$f$, $t$delete from app.terms_acceptances t where false and t.user_id = any (v_del);$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
