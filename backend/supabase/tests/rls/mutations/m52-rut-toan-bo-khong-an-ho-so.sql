-- expect: CON-WA-02
-- Lỗi: rút toàn bộ không ẩn hồ sơ con (dữ liệu vẫn hiện, ghi mới vẫn được).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.consent_withdraw_all(uuid,uuid)'::regprocedure);
  n := replace(d, $f$update app.children set state = 'CHO_XOA', hidden_at = now(), hidden_reason = 'RUT_DONG_Y' where id = p_child;$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
