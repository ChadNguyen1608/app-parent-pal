-- Nền cho phương án A: gia đình, thiết bị, nhật ký phòng thử.
-- RLS theo family_id từ đầu (khóa anon là công khai). Mỗi thiết bị đăng nhập ẩn danh
-- (auth.uid()), tham gia gia đình bằng mã. Cột scope chừa chỗ cho phương án B.

create table public.families (
  id uuid primary key default gen_random_uuid(),
  join_code text not null unique default upper(substr(md5(random()::text), 1, 8)),
  created_at timestamptz not null default now()
);

create table public.family_members (
  user_id uuid not null references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  role text not null check (role in ('parent', 'child')),
  expo_push_token text,
  created_at timestamptz not null default now(),
  primary key (user_id, family_id)
);

create table public.lab_events (
  id bigint generated always as identity primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  scope text not null default 'family' check (scope in ('private', 'family')),
  kind text not null,
  label text not null,
  scheduled_at timestamptz,
  actual_at timestamptz not null default now(),
  battery_pct smallint
);

create index lab_events_family_idx on public.lab_events (family_id, actual_at desc);

-- Hàm này chạy với quyền chủ bảng để tránh đệ quy RLS khi kiểm tra thành viên.
create function public.is_family_member(fid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.family_members m
    where m.family_id = fid and m.user_id = (select auth.uid())
  );
$$;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.lab_events enable row level security;

create policy families_select on public.families
  for select to authenticated using (public.is_family_member(id));

create policy members_select on public.family_members
  for select to authenticated using (public.is_family_member(family_id));
create policy members_update_own on public.family_members
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy lab_events_select on public.lab_events
  for select to authenticated
  using (public.is_family_member(family_id) and (scope = 'family' or user_id = (select auth.uid())));
create policy lab_events_insert on public.lab_events
  for insert to authenticated
  with check (public.is_family_member(family_id) and user_id = (select auth.uid()));
create policy lab_events_delete_own on public.lab_events
  for delete to authenticated using (user_id = (select auth.uid()));

-- Tạo gia đình mới; người gọi thành bố mẹ đầu tiên.
create function public.create_family()
returns public.families
language plpgsql
security definer
set search_path = ''
as $$
declare f public.families;
begin
  insert into public.families default values returning * into f;
  insert into public.family_members (user_id, family_id, role)
    values ((select auth.uid()), f.id, 'parent');
  return f;
end;
$$;

-- Tham gia gia đình bằng mã.
create function public.join_family(code text, member_role text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare fid uuid;
begin
  select id into fid from public.families where join_code = upper(code);
  if fid is null then
    raise exception 'Mã gia đình không đúng';
  end if;
  insert into public.family_members (user_id, family_id, role)
    values ((select auth.uid()), fid, member_role)
    on conflict (user_id, family_id) do update set role = excluded.role;
  return fid;
end;
$$;

revoke all on function public.create_family() from public, anon;
revoke all on function public.join_family(text, text) from public, anon;
grant execute on function public.create_family() to authenticated;
grant execute on function public.join_family(text, text) to authenticated;
