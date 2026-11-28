-- expect: TERMS-GATE-01
-- Lỗi: family_create không kiểm điều khoản (tạo hộ khi chưa đồng ý).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.family_create(text)'::regprocedure);
  n := replace(d, $f$perform app.fail('TERMS_REQUIRED', 'D-76', 'Bạn cần đồng ý Điều khoản sử dụng trước khi tạo gia đình.');$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
