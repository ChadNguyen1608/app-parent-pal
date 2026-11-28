-- expect: PLAN-NOTIFY-02
-- Lỗi: goi_doi ghi cả khi gói và số khóa không đổi (đổi ghi chú cũng báo máy con).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.tg_plan_notify()'::regprocedure);
  n := replace(d, $f$if v_old_act is distinct from v_new_act or v_old_keys is distinct from v_new_keys then$f$, $t$if true then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
