-- expect: FN-CHILD-10
-- Lỗi quyền: child_delete chỉ kiểm quyền XEM, nên NL có grant và máy con xóa được hồ sơ.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.child_delete(uuid,boolean)'::regprocedure);
  d := replace(o, '''child.delete''', '''child.view''');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
