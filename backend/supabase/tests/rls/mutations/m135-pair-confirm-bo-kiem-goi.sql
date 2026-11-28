-- expect: PLAN-PAIR-01,PLAN-PAIR-02
-- Lỗi: pair_confirm không kiểm gói và khóa ghép máy.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pair_confirm(uuid,text,text)'::regprocedure);
  n := replace(d, $f$perform private.device_key_require(v_child.household_id, p_child);$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
