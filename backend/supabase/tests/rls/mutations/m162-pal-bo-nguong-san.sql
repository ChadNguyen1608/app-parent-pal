-- expect: PAL-SPIKE-02
-- Lỗi: pal_check_usage bỏ ngưỡng sàn: hộ mới bị khóa oan.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.pal_check_usage(uuid)'::regprocedure);
  n := replace(d, $f$greatest(v_floor, v_factor * v_avg)$f$, $t$(v_factor * v_avg)$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
