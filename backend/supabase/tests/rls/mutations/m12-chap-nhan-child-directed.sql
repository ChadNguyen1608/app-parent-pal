-- expect: FN-MODE-01, FN-MODE-06, RLS-SCHEMA
-- Lỗi D-19: bỏ ràng buộc CSDL và hàm mode_set nhận CHILD_DIRECTED.
alter table app.children drop constraint children_mode_check;
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.mode_set(uuid,text)'::regprocedure);
  d := replace(o, 'if p_mode = ''CHILD_DIRECTED'' then', 'if false then');
  d := replace(d, 'not in (''PARENT_LED'', ''CHILD_EXECUTED'', ''UNSET'')', 'not in (''PARENT_LED'', ''CHILD_EXECUTED'', ''UNSET'', ''CHILD_DIRECTED'')');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
