-- expect: RLS-GEN-03, RLS-ROLE children / QL
-- Cấp INSERT/UPDATE/DELETE trực tiếp cho authenticated (trái nguyên tắc ghi qua hàm).
grant insert, update, delete on app.children to authenticated;
