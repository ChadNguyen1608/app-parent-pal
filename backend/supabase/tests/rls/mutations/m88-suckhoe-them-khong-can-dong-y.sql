-- expect: HLT-CONSENT-01
-- Lỗi: health_note_add không kiểm đồng ý riêng MD-SUCKHOE.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.health_note_add(uuid,text,text,date,text)'::regprocedure);
  n := replace(d, $f$if not app_internal.purpose_effective(p_child, 'MD-SUCKHOE') then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
