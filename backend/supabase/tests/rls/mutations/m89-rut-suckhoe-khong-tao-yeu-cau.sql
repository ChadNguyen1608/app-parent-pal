-- expect: CON-02b,HLT-CONSENT-02
-- Lỗi: rút MD-SUCKHOE không đưa phần sức khỏe vào hàng chờ xóa.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.consent_record(uuid,text,text,uuid,text,uuid,boolean)'::regprocedure);
  n := replace(d, $f$if p_event = 'RUT' and p_purpose_code = 'MD-SUCKHOE' then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
