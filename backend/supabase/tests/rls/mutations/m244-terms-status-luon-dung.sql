-- expect: TERMS-ST-01,TERMS-VER-01
-- Lỗi: terms_status luôn báo accepted=true.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.terms_status()'::regprocedure);
  n := replace(d, $f$'accepted', exists (select 1 from app.terms_acceptances t where t.user_id = v_uid and t.terms_version = v_cur)$f$, $t$'accepted', true$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
