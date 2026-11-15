-- expect: FN-PAIR-01
-- Lỗi: pair_code_create lưu mã thô thay vì HMAC.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.pair_code_create()'::regprocedure);
  d := replace(o, 'values (v_uid, private.pair_hmac(v_code), v_exp)', 'values (v_uid, v_code, v_exp)');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
