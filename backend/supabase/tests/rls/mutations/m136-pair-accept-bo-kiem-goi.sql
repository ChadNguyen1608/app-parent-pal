-- expect: PLAN-PAIR-05
-- Lỗi: pair_accept không kiểm gói và khóa ghép máy.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pair_accept()'::regprocedure);
  n := replace(d, $f$perform private.device_key_require(v_hh.id, null, v_b.id);$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
