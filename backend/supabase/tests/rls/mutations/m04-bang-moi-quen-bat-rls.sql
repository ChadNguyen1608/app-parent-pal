-- expect: RLS-GEN-01
-- Bảng mới quên bật RLS.
create table app.zzz_quen_rls (id uuid primary key default gen_random_uuid());
