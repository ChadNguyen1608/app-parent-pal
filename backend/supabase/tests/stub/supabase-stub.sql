-- STUB CHỈ DÙNG CHO TEST (T0.2/T0.6). KHÔNG đặt vào migrations/.
-- Mô phỏng phần Supabase mà migration và test RLS cần, để chạy trên Postgres 16 thuần
-- (sandbox, nơi không kéo được Docker image). Trên Supabase CLI cục bộ KHÔNG nạp file này:
-- các vai, schema auth và hàm auth.* đã có sẵn.
-- Không chứa khóa hay dữ liệu thật.

-- Vai (toàn cụm). Giống Supabase: anon/authenticated không đăng nhập, service_role bỏ qua RLS.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator noinherit login;
  end if;
end $$;
grant anon, authenticated, service_role to authenticator;
-- Cho phép vai quản trị của test chuyển sang các vai trên (superuser vốn đã được phép).

create schema if not exists extensions;
grant usage on schema public, extensions to anon, authenticated, service_role;

-- Supabase cấp mặc định rất rộng cho anon/authenticated/service_role trên đối tượng mới.
-- Mô phỏng ở mức xấu nhất (mọi schema) để migration phải tự thu hồi đúng.
alter default privileges for role postgres grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres grant all on functions to anon, authenticated, service_role;

-- Schema auth tối thiểu.
create schema if not exists auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  aud text,
  role text,
  email text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);
grant usage on schema auth to anon, authenticated, service_role;

-- auth.uid() / auth.jwt() / auth.role() đọc request.jwt.claims (PostgREST đặt cho mỗi request).
create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')
  )::jsonb
$$;

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    ), ''
  )::uuid
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;

grant execute on function auth.jwt(), auth.uid(), auth.role() to anon, authenticated, service_role;

-- Publication Realtime rỗng (test D38 kiểm không bảng nhạy cảm nằm trong đó).
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- pgcrypto nằm ở schema `extensions` như trên Supabase (migration T1.5 cũng `create extension if not exists`).
create extension if not exists pgcrypto with schema extensions;

-- Supabase Vault tối thiểu: chỉ có vault.decrypted_secrets (name, decrypted_secret). Schema vault KHÔNG cấp cho
-- anon/authenticated (Supabase cũng vậy). GIÁ TRỊ DƯỚI ĐÂY CHỈ DÙNG CHO TEST, không phải khóa thật.
create schema if not exists vault;
create table vault.decrypted_secrets (
  id               uuid primary key default gen_random_uuid(),
  name             text unique,
  decrypted_secret text
);
insert into vault.decrypted_secrets (name, decrypted_secret) values
  ('pairing_secret', 'TEST-ONLY-pairing-secret-not-a-real-key-0001'),
  ('pin_pepper',     'TEST-ONLY-pin-pepper-not-a-real-key-0002');
revoke all on schema vault from public, anon, authenticated;
revoke all on vault.decrypted_secrets from public, anon, authenticated;
