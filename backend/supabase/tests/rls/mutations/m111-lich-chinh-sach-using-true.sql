-- expect: SCH-RLS-02
-- Lỗi: chính sách đọc schedule_profiles là using (true): NL không có grant và hộ khác thấy lịch của con khác.
drop policy schedule_profiles_select on app.schedule_profiles;
create policy schedule_profiles_select on app.schedule_profiles for select to authenticated using (true);
