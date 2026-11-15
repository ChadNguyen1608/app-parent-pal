-- expect: RLS-GEN-01, RLS-ROLE members / HO_KHAC
-- Mô phỏng tắt RLS: bảng app.members lộ cho cả hộ khác.
alter table app.members disable row level security;
