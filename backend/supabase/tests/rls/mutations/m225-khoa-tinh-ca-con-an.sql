-- expect: PLAN-KEY-03
-- Lỗi: số khóa đã dùng tính cả liên kết của con đã ẩn.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.device_keys_used(uuid,uuid,uuid)'::regprocedure);
  n := replace(d, $f$where c.household_id = p_household and c.hidden_at is null$f$, $t$where c.household_id = p_household$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
