-- expect: CON-D73a,CON-01c
-- Lỗi: child_create không ghi đồng ý mặc định (con mới chưa có đồng ý nào).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.child_create(uuid,text,integer,integer,boolean,uuid)'::regprocedure);
  n := replace(d, $f$where p.code in ('MD-LICH', 'MD-SUCKHOE', 'MD-CONBAO') and p.collect_enabled$f$, $t$where false$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
