-- expect: TRIAL-CHILD-04
-- Lỗi: purge_child ở hộ thử xóa cả con chưa rút.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_child(uuid,text)'::regprocedure);
  n := replace(d, $f$if v_c.state <> 'CHO_XOA' then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
