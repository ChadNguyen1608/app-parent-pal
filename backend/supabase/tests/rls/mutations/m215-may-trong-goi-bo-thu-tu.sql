-- expect: PLAN-ACTIVE-03,PLAN-SYNC-02
-- Lỗi: binding_in_plan bỏ xét thứ tự ghép: mọi máy đều hoạt động khi còn khóa (không phân biệt máy vượt khóa).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.binding_in_plan(uuid)'::regprocedure);
  n := replace(d, $f$< (coalesce(b.paired_at, b.created_at), b.id)) < private.device_keys(c.household_id)$f$, $t$< (coalesce(b.paired_at, b.created_at), b.id)) < private.device_keys(c.household_id) + 100$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
