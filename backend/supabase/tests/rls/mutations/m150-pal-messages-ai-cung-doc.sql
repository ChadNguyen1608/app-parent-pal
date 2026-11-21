-- expect: PAL-RLS-01
-- Lỗi: chính sách đọc tin nhắn Pal mở cho mọi người đăng nhập (using true): người lớn khác đọc được hội thoại riêng.
drop policy pal_messages_select on app.pal_messages;
create policy pal_messages_select on app.pal_messages for select to authenticated using (true);
