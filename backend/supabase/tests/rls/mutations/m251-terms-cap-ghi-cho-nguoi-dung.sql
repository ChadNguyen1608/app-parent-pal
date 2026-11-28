-- expect: RLS-GEN-03
-- Lỗi: cấp quyền ghi trực tiếp app.terms_acceptances cho người dùng đăng nhập.
grant insert on app.terms_acceptances to authenticated;
