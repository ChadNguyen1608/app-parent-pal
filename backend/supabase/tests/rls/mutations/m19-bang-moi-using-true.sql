-- expect: RLS-ROLE invitations / HO_KHAC, RLS-ROLE mode_history / HO_KHAC
-- Lỗi: chính sách quá rộng trên bảng mới - người hộ khác đọc lời mời và lịch sử mode của hộ 1.
create policy invitations_all on app.invitations for select to authenticated using (true);
create policy mode_history_all on app.mode_history for select to authenticated using (true);
