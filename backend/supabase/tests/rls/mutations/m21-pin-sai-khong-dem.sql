-- expect: FN-PIN-04, FR01-T02
-- Lỗi: app.pin_verify không ghi số lần sai (không bao giờ khóa).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.pin_verify(uuid,text)'::regprocedure);
  d := replace(o, 'set failed_count = v_fail, lock_level', 'set failed_count = 0, lock_level');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
