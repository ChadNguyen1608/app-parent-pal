-- expect: SCH-RLS-01
-- Lỗi: chính sách đọc notifications là using (true): người lớn thấy thông báo gửi cho máy con.
drop policy notifications_select on app.notifications;
create policy notifications_select on app.notifications for select to authenticated using (true);
