-- expect: RLS-GEN-03, RLS-GEN-04
-- Lỗi: quên thu hồi EXECUTE của anon trên hàm ghi hồ sơ con và mode_set.
grant execute on function app.child_delete(uuid, boolean), app.mode_set(uuid, text) to anon;
