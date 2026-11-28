-- expect: TERMS-ACC-01
-- Lỗi: terms_accept ghi phiên bản do người gọi gửi (không ghi bản hiện hành) - kiểm chứng ghi đúng bản.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.terms_accept(text)'::regprocedure);
  n := replace(d, $f$insert into app.terms_acceptances (user_id, terms_version) values (v_uid, v_cur)$f$, $t$insert into app.terms_acceptances (user_id, terms_version) values (v_uid, v_cur || '-x')$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
