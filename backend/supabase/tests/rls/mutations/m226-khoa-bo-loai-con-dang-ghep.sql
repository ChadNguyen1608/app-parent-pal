-- expect: PLAN-PAIR-04
-- Lỗi: pair_confirm tính cả máy chờ của chính con đang ghép (xác nhận lại cho cùng con bị chặn).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pair_confirm(uuid,text,text)'::regprocedure);
  n := replace(d, $f$perform private.device_key_require(v_child.household_id, p_child);$f$, $t$perform private.device_key_require(v_child.household_id);$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
