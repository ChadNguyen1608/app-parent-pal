-- expect: AUD-06
-- Lỗi: chính sách audit_log cho mọi người đăng nhập đọc.
create policy audit_log_all on app.audit_log for select to authenticated using (true);
