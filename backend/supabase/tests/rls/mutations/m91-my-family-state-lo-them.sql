-- expect: CON-FAM-01
-- Lỗi: my_family_state trả thêm mã hộ (lộ nhiều hơn trạng thái).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.my_family_state()'::regprocedure);
  n := replace(d, $f$jsonb_build_object('ok', true, 'state', v_state,$f$, $t$jsonb_build_object('ok', true, 'household_id', v_bid, 'state', v_state,$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
