-- expect: TERMS-GATE-02
-- Lỗi: family_create chấp nhận đồng ý bất kỳ phiên bản (không so với bản hiện hành).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.family_create(text)'::regprocedure);
  n := replace(d, $f$t.terms_version = private.terms_current_version()$f$, $t$true$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
