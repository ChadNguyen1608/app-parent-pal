-- expect: TRIAL-H4-01
-- Lỗi: purge_household nhận cả loại dữ liệu thật (xóa hẳn khi cổng H4 còn đóng).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure);
  n := replace(d, $f$if v_h.data_class not in ('GIA_LAP', 'THU_NOI_BO_D01') then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
