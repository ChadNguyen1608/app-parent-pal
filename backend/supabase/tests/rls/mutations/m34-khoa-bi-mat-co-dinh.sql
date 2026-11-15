-- expect: FN-PAIR-03
-- Lỗi: HMAC mã ghép dùng khóa cố định trong mã thay vì khóa bí mật.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('private.pair_hmac(text)'::regprocedure);
  d := replace(o, 'private.secret(''pairing_secret'')', '''constant-key-not-secret-0000''');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
