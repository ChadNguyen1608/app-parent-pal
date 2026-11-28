-- expect: TERMS-AUD-01
-- Lỗi: terms_accept không ghi audit terms.accepted.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.terms_accept(text)'::regprocedure);
  n := replace(d, $f$perform private.audit_write_auto(v_hh, 'terms.accepted', null, jsonb_build_object('version', v_cur));$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
