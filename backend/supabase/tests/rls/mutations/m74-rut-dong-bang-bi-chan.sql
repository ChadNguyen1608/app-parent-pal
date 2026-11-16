-- expect: LC-WITHDRAW-02,CON-WA-08,CON-05e
-- Lỗi: access_state: rút/xóa lại bị FROZEN khi hộ đóng băng (trái D-64).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.access_state(uuid,text,uuid,text)'::regprocedure);
  n := replace(d, $f$return case when v_open then 'ALLOW' else 'FROZEN' end;$f$, $t$return case when v_frozen then 'FROZEN' else 'ALLOW' end;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
