-- expect: RLS-GEN-03, RLS-GEN-04
-- Lỗi: Quên thu hồi EXECUTE của anon trên hàm ghép máy và hủy liên kết.
grant execute on function app.pair_confirm(uuid, text, text), app.unlink_device(uuid, text, int), app.pin_set(text) to anon;
