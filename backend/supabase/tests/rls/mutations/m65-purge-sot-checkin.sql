-- expect: TRIAL-PURGE-01
-- Lỗi: purge_household bỏ sót private.checkin_responses (dữ liệu nhạy cảm của trẻ).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from private.checkin_responses t where$f$, $t$delete from private.checkin_responses t where false and$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
