-- expect: PAL-SPIKE-01
-- Lỗi: pal_state bỏ kiểm khóa: hộ bị khóa vẫn gọi AI được.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.pal_state(uuid)'::regprocedure);
  n := replace(d, $f$when exists (select 1 from private.pal_locks l where l.household_id = v_h.id) then 'LOCKED'$f$, $t$when false then 'LOCKED'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
