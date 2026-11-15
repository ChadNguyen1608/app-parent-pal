-- expect: FN-PAIR-09
-- Lỗi: pair_confirm cho ghép lần đầu mà không có PIN (không ai đặt PIN, máy con không hủy được).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.pair_confirm(uuid,text,text)'::regprocedure);
  d := replace(o, 'if not v_has_pin and p_pin is null then', 'if false then');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
