-- expect: FN-CHILD-09
-- Lỗi: child_delete xóa hẳn dòng thay vì ẩn (mất dữ liệu, trái Tech Spec §0).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.child_delete(uuid,boolean)'::regprocedure);
  d := replace(o, 'update app.children set hidden_at = now(), hidden_reason = ''XOA'' where id = p_child;',
                  'delete from app.device_bindings where child_id = p_child; delete from app.mode_history where child_id = p_child; delete from app.children where id = p_child;');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
