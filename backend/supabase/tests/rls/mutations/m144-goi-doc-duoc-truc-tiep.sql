-- expect: PLAN-DB-01
-- Lỗi: household_plans mở đọc cho authenticated với chính sách using (true): người dùng đọc gói (và ghi chú vận hành) của hộ khác.
create policy household_plans_select on app.household_plans for select to authenticated using (true);
grant select on app.household_plans to authenticated;
