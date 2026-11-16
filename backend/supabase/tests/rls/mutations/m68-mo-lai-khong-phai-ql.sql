-- expect: LC-REOPEN-02
-- Lỗi: mở lại hộ đóng băng cho cả người lớn không phải QL.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.household_reopen(boolean)'::regprocedure);
  n := replace(d, $f$if v_m.role is distinct from 'PRIMARY' then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
