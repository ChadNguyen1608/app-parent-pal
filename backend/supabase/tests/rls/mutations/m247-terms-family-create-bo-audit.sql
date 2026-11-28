-- expect: TERMS-AUD-02
-- Lỗi: family_create không ghi audit terms.accepted khi hộ được tạo.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.family_create(text)'::regprocedure);
  n := replace(d, $f$perform private.audit_write_auto(v_hh, 'terms.accepted', null, jsonb_build_object('version', private.terms_current_version()));$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
