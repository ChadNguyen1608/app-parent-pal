-- expect: SCH-OB-02
-- Lỗi: outbox con_bao gửi cho mọi người lớn trong hộ, kể cả NL không có grant MD-CONBAO.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.child_alert_send(text,uuid,int)'::regprocedure);
  n := replace(d, $f$(m.role = 'PRIMARY' or exists$f$, $t$(true or exists$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
