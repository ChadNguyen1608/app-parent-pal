-- expect: PAL-RLS-02
-- Lỗi: cấp INSERT trực tiếp trên pal_messages cho người dùng.
grant insert on app.pal_messages to authenticated;
create policy pal_messages_ins on app.pal_messages for insert to authenticated with check (true);
