-- expect: TRIAL-CHILD-04
-- Lỗi: purge_child nhận cả dữ liệu thật (xóa hẳn khi cổng H4 còn đóng).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_child(uuid,text)'::regprocedure);
  n := replace(d, $f$if v_h.data_class not in ('GIA_LAP', 'THU_NOI_BO_D01') then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
