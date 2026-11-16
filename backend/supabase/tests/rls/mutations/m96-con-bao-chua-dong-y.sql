-- expect: ALR-SEND-01,ALR-SEND-06
-- Lỗi: child_alert_send không kiểm đồng ý riêng MD-CONBAO.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.child_alert_send(text,uuid,int)'::regprocedure);
  n := replace(d, $f$if not app_internal.purpose_effective(v_b.child_id, 'MD-CONBAO') then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
