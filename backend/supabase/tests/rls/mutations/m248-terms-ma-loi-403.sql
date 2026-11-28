-- expect: TERMS-GATE-01,TERMS-GATE-02
-- Lỗi: TERMS_REQUIRED trả PT403 thay vì PT428.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.fail(text,text,text)'::regprocedure);
  n := replace(d, $f$when 'TERMS_REQUIRED'    then 'PT428'$f$, $t$when 'TERMS_REQUIRED'    then 'PT403'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
