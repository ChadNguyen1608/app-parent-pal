-- expect: SCH-OB-01
-- Lỗi: child_alert_send không ghi outbox con_bao (bố mẹ không có điểm gắn để thông báo đẩy).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.child_alert_send(text,uuid,int)'::regprocedure);
  n := replace(d, $f$and m.status = 'DA_THAM_GIA'$f$, $t$and m.status = 'DA_THAM_GIA' and false$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
