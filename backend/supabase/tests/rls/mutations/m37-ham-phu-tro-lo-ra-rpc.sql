-- expect: RLS-GEN-04
-- Lỗi: hàm phụ trợ của RLS không còn dùng (app.has_grant) được cấp lại EXECUTE cho authenticated -> lộ qua /rest/v1/rpc.
grant execute on function app.has_grant(uuid) to authenticated;
