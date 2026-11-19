-- expect: TRIAL-PURGE-01
-- Lỗi: purge_household bỏ xóa tin nhắn Pal.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from app.pal_messages t where t.household_id = p_household;$f$, $t$delete from app.pal_messages t where false;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
