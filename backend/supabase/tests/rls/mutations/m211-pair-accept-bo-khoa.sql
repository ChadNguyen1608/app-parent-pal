-- expect: PLAN-PAIR-05
-- Lỗi: pair_accept không còn kiểm khóa: giảm khóa giữa chừng vẫn ghép nốt.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pair_accept()'::regprocedure);
  n := replace(d, $f$perform private.device_key_require(v_hh.id, null, v_b.id);$f$, $t$if private.plan_tier(v_hh.id) = 'FREE' then perform app.fail('PLAN_REQUIRED', 'D-68.premium', 'Cần gói.'); end if;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
