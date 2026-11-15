-- expect: RLS-ROLE children / HO_KHAC, RLS-ROLE-ISO
-- Chính sách quá rộng (using true): người hộ khác thấy con của hộ 1.
create policy children_all on app.children for select to authenticated using (true);
