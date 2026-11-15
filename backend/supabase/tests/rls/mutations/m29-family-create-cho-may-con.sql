-- expect: FN-FAM-03
-- Lỗi: family_create không chặn người dùng ẩn danh.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.family_create(text)'::regprocedure);
  d := replace(o, 'if app.is_anonymous_caller() then', 'if false then');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
