-- expect: LC-FROZEN-01
-- Lỗi: access_state bỏ qua công tắc: rút đồng ý và xóa luôn được phép khi hộ đóng băng.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.access_state(uuid,text,uuid,text)'::regprocedure);
  n := replace(d, $f$return case when v_frozen and not private.frozen_allows_withdrawal() then 'FROZEN' else 'ALLOW' end;$f$, $t$return 'ALLOW';$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
