-- expect: TRIAL-WD-03
-- Lỗi: rút MỘT con của hộ thử còn con khác vẫn đặt vị trí RUT_SOM (xóa cả hộ).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.tg_trial_withdraw()'::regprocedure);
  n := replace(d, $f$if new.scope = 'HO_SO_CON'
     and exists (select 1 from app.children c where c.household_id = new.household_id and c.hidden_at is null) then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
