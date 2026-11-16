-- expect: CON-SET-04
-- Lỗi: child_setting_set: bật cài đặt AI cũng đi đường 'rút' (luôn được khi đóng băng).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.child_setting_set(uuid,text,boolean)'::regprocedure);
  n := replace(d, $f$case when p_value is false then 'child.withdraw' else 'child.update' end$f$, $t$'child.withdraw'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
