-- Đếm số lượt gọi Pal mỗi người mỗi ngày, và một hàng tổng cho cả hệ thống (user_id toàn số 0).
-- Chỉ Edge Function (service_role) được đọc/ghi; app không đụng tới bảng này.
create table public.pal_usage (
  user_id uuid not null,
  day date not null,
  n integer not null default 0,
  primary key (user_id, day)
);

alter table public.pal_usage enable row level security;

create function public.pal_hit(p_user uuid, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare c integer;
begin
  insert into public.pal_usage as u (user_id, day, n) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set n = u.n + 1 where u.n < p_limit
  returning u.n into c;
  return c is not null;
end;
$$;

revoke all on function public.pal_hit(uuid, integer) from public, anon, authenticated;
grant execute on function public.pal_hit(uuid, integer) to service_role;
grant all on table public.pal_usage to service_role;
