-- expect: PLAN-KEY-01
-- Lỗi: plan_set bỏ qua p_device_keys: không lưu số khóa chủ sản phẩm đặt.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.plan_set(uuid,text,timestamp with time zone,text,text,integer)'::regprocedure);
  n := replace(d, $f$device_keys = coalesce(p_device_keys, household_plans.device_keys),$f$, $t$device_keys = household_plans.device_keys,$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
