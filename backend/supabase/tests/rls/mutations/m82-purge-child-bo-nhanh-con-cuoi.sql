-- expect: TRIAL-CHILD-03
-- Lỗi: purge_child không xóa cả hộ khi là con cuối (hộ mồ côi còn lại).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_child(uuid,text)'::regprocedure);
  n := replace(d, $f$if not exists (select 1 from app.children c where c.household_id = v_h.id and c.id <> p_child and c.hidden_at is null) then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
