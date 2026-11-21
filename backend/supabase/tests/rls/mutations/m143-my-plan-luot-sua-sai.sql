-- expect: PLAN-MY-02
-- Lỗi: my_plan không trừ lượt sửa đã dùng.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.my_plan()'::regprocedure);
  n := replace(d, $f$greatest(0, v_emax - u.edits_used)$f$, $t$v_emax$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
