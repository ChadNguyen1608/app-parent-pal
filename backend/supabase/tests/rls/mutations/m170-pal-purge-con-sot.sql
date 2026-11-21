-- expect: TRIAL-CHILD-01
-- Lỗi: purge_child bỏ xóa tin nhắn Pal của con.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_child(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from app.pal_messages t where t.child_id = p_child;$f$, $t$delete from app.pal_messages t where false;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
