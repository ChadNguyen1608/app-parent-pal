-- expect: PLAN-PAIR-04,PLAN-KEY-02
-- Lỗi: yêu cầu chờ đã quá hạn xác nhận vẫn giữ khóa mãi.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.device_keys_used(uuid,uuid,uuid)'::regprocedure);
  n := replace(d, $f$and b.created_at + make_interval(mins => private.param_int('pair_accept_window_minutes')) > now()$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
