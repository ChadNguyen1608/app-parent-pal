-- expect: PLAN-PAIR-04,PLAN-KEY-02
-- Lỗi: số khóa đã dùng không tính yêu cầu ghép đang chờ máy con xác nhận (ghép vượt khóa bằng nhiều yêu cầu chờ).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.device_keys_used(uuid,uuid,uuid)'::regprocedure);
  n := replace(d, $f$or (b.state = 'CHO_XAC_NHAN_MAY_CON'$f$, $t$or (false$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
