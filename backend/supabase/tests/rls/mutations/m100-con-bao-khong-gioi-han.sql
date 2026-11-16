-- expect: ALR-SEND-07
-- Lỗi: child_alert_send bỏ giới hạn tần suất.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.child_alert_send(text,uuid,int)'::regprocedure);
  n := replace(d, $f$>= v_max then$f$, $t$>= 1000000 then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
