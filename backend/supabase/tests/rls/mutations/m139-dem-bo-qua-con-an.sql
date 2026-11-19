-- expect: PLAN-MY-05
-- Lỗi: đếm kế hoạch bỏ qua con đã ẩn: xóa hồ sơ con trả lại suất tạo.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.plan_usage(uuid)'::regprocedure);
  n := replace(d, $f$where c.household_id = p_household$f$, $t$where c.household_id = p_household and c.hidden_at is null$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
