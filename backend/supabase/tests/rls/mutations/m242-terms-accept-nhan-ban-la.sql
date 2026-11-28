-- expect: TERMS-ACC-03
-- Lỗi: terms_accept nhận mọi chuỗi phiên bản (không so với bản hiện hành).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.terms_accept(text)'::regprocedure);
  n := replace(d, $f$if p_version is distinct from v_cur then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
