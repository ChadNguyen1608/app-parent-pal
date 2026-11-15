-- expect: RLS-GEN-01
-- Bảng mới ở schema app, có RLS nhưng chưa có dòng trong policy-matrix.json.
create table app.zzz_bang_moi (id uuid primary key default gen_random_uuid());
alter table app.zzz_bang_moi enable row level security;
revoke all on app.zzz_bang_moi from public, anon, authenticated;
