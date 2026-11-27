-- expect: CON-D73a,CON-D73c
-- Lỗi: đồng ý mặc định gắn basis NGUOI_DUNG (không phân biệt được với đồng ý do người dùng bấm).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.child_create(uuid,text,integer,integer,boolean,uuid)'::regprocedure);
  n := replace(d, $f$'MAC_DINH_D73'$f$, $t$'NGUOI_DUNG'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
