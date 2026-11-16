-- expect: MEM-NL-01, MEM-NL-04, RLS-ROLE
-- Lỗi: chính sách đọc invitations cho mọi thành viên hộ và cấp ghi cho authenticated (NL sửa được lời mời).
drop policy invitations_select on app.invitations;
create policy invitations_select on app.invitations for select to authenticated using (true);
grant insert, update, delete on app.invitations to authenticated;
create policy invitations_w on app.invitations for all to authenticated using (true) with check (true);
