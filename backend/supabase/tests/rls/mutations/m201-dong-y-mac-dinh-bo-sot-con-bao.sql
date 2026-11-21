-- expect: CON-D73a,CON-01c
-- Lỗi: đồng ý mặc định bỏ sót MD-CONBAO.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.child_create(uuid,text,integer,integer,boolean,uuid)'::regprocedure);
  n := replace(d, $f$where p.code in ('MD-LICH', 'MD-SUCKHOE', 'MD-CONBAO')$f$, $t$where p.code in ('MD-LICH', 'MD-SUCKHOE')$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
