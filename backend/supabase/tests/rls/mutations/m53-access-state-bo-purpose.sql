-- expect: CON-01b
-- Lỗi: app.access_state không kiểm purpose_effective (mục chưa đồng ý/đã rút vẫn được dùng).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.access_state(uuid,text,uuid,text)'::regprocedure);
  n := replace(d, $f$not app_internal.purpose_effective(p_child, p_purpose)$f$, $t$false$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
