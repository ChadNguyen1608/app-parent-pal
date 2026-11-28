-- expect: PLAN-PAIR-02
-- Lỗi: pair_confirm không còn kiểm khóa ghép máy (chỉ còn kiểm gói: đủ gói là ghép vô hạn).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pair_confirm(uuid,text,text)'::regprocedure);
  n := replace(d, $f$perform private.device_key_require(v_child.household_id, p_child);$f$, $t$if private.plan_tier(v_child.household_id) = 'FREE' then perform app.fail('PLAN_REQUIRED', 'D-68.premium', 'Cần gói.'); end if;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
