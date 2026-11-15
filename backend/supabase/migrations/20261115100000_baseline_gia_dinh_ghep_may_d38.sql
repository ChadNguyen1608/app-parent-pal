-- Baseline T0.2 (Tech Spec 13.1 §2.1, một phần §2.5, §2.7, §2.8; Architecture §6; D-38).
-- Gồm: hộ, thành viên + vai trò, con, quyền xem (grants), thiết bị ghép, mã ghép một lần,
-- và phần tối thiểu để chứng minh D-38: private.checkin_responses, private.child_settings,
-- app.weekly_report. Chưa có: app.can/purpose (T1.1), mode_history, invitations, trial_slots.
--
-- Mẫu bắt buộc: RLS bật mọi bảng app; hàm security definer + search_path rỗng +
-- (select auth.uid()); thu hồi quyền mặc định từ public/anon; schema private không mở API.
-- Nhãn: người soạn AI, chưa kiểm chứng độc lập.

create schema if not exists app;
create schema if not exists private;

-- Thu hồi quyền mặc định ngay từ đầu (Supabase cấp rộng cho anon/authenticated).
revoke all on schema app from public, anon, authenticated;
revoke all on schema private from public, anon, authenticated;
grant usage on schema app to authenticated, service_role;
grant usage on schema private to service_role;

-- ============================================================ app: bảng

create table app.households (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  label         text,                       -- nhãn hiển thị tùy chọn do QL nhập; không có tên thật bắt buộc
  data_class    text not null default 'GIA_LAP'
                check (data_class in ('GIA_LAP', 'THU_NOI_BO_D01')),
  state         text not null default 'HOAT_DONG'
                check (state in ('HOAT_DONG', 'DONG_BANG', 'CHO_XOA', 'DA_XOA')),
  frozen_at     timestamptz,
  trial_slot_id uuid,                       -- FK tới trial_slots khi bảng đó có (task sau)
  hidden_at     timestamptz,
  hidden_reason text,
  check (data_class <> 'THU_NOI_BO_D01' or trial_slot_id is not null)
);

create table app.members (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  household_id   uuid not null references app.households (id),
  user_id        uuid not null references auth.users (id),
  role           text not null check (role in ('PRIMARY', 'SUPPORTER', 'OBSERVER')),
  call_name      text not null,             -- tên gọi; không email ở đây
  status         text not null default 'DA_THAM_GIA'
                 check (status in ('DA_THAM_GIA', 'DA_GO', 'DA_ROI')),
  last_active_at timestamptz,
  joined_at      timestamptz not null default now(),
  left_at        timestamptz,
  unique (user_id)                          -- một người một hộ
);
create unique index members_one_primary_per_household
  on app.members (household_id) where role = 'PRIMARY' and status = 'DA_THAM_GIA';

create table app.children (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  household_id  uuid not null references app.households (id),
  call_name     text not null,              -- tên gọi (tên giả khi thử)
  grade         int check (grade between 1 and 9),
  age_years     int check (age_years between 0 and 18),
  mode          text not null default 'UNSET'
                check (mode in ('UNSET', 'PARENT_LED', 'CHILD_EXECUTED')),  -- D-19: không có CHILD_DIRECTED
  mode_epoch    int not null default 1,
  has_device    boolean not null default false,
  state         text not null default 'HOAT_DONG'
                check (state in ('HOAT_DONG', 'CHO_XOA', 'DA_XOA')),
  hidden_at     timestamptz,
  hidden_reason text
  -- Cố ý KHÔNG có cột trường học, địa chỉ, nơi ở (Q-ARC-10), sức khỏe (C-07).
);
create index children_household_idx on app.children (household_id);

create table app.grants (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  member_id    uuid not null references app.members (id),
  child_id     uuid not null references app.children (id),
  resource     text not null,
  action       text not null default 'view' check (action = 'view'),   -- nấc 1: chỉ xem (D-35)
  purpose_code text not null,               -- FK tới app.purposes khi bảng đó có (T1.x)
  state        text not null default 'ACTIVE'
               check (state in ('ACTIVE', 'REVIEW_REQUIRED', 'THU_HOI')),
  granted_at   timestamptz not null default now(),
  revoked_at   timestamptz,
  unique (member_id, child_id, resource, purpose_code)
);
create index grants_child_idx on app.grants (child_id);

create table app.device_bindings (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  child_id              uuid not null references app.children (id),
  device_user_id        uuid not null references auth.users (id),   -- người dùng ẩn danh của máy con
  epoch                 int not null default 1,
  state                 text not null default 'CHO_XAC_NHAN_MAY_CON'
                        check (state in ('CHO_XAC_NHAN_MAY_CON', 'HIEU_LUC', 'DA_HUY', 'CHO_XAC_MINH')),
  paired_by_member_id    uuid references app.members (id),
  paired_at             timestamptz,
  revoked_at            timestamptz,
  revoke_reason         text
);
create unique index device_bindings_one_active_per_child
  on app.device_bindings (child_id) where state = 'HIEU_LUC';
create unique index device_bindings_one_active_per_device
  on app.device_bindings (device_user_id) where state = 'HIEU_LUC';
create index device_bindings_child_idx on app.device_bindings (child_id);

-- ============================================================ private: bảng (không mở API)

-- Mã ghép dùng một lần (§2.1). Chỉ lưu băm; xóa dòng khi dùng xong (logic ở hàm task sau).
create table private.pairing_codes (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  device_user_id uuid not null references auth.users (id),
  code_hmac      text not null,
  expires_at     timestamptz not null,
  state          text not null default 'CON_HAN' check (state in ('CON_HAN', 'DA_DUNG', 'HET_HAN')),
  attempts       int not null default 0 check (attempts >= 0)
);
create unique index pairing_codes_active_hmac on private.pairing_codes (code_hmac) where state = 'CON_HAN';

-- D-38: lựa chọn hỏi thăm từng ngày. Không chính sách nào cho vai người lớn.
create table private.checkin_responses (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  child_id        uuid not null references app.children (id),
  local_date      date not null,
  choice          text not null check (choice in ('on', 'hoi_met', 'rat_met', 'bo_qua')),
  day_features    text[] not null default '{}',   -- loại ngày suy ra từ lịch LÚC NHẬN (D-37)
  occurred_at     timestamptz not null,
  received_at     timestamptz not null default now(),
  undone_at       timestamptz,
  idempotency_key uuid not null unique,
  unique (child_id, local_date)                   -- ghi một lần mỗi (con, ngày)
);

create table private.child_settings (
  child_id                 uuid primary key references app.children (id),
  checkin_invite_enabled   boolean not null default true
);

-- ============================================================ app: tiện ích cho chính sách (§2.8)
-- Mọi hàm: security definer, search_path rỗng, (select auth.uid()), fail-closed (null -> false).

create function app.is_member(p_household uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from app.members m
    where m.household_id = p_household
      and m.user_id = (select auth.uid())
      and m.status = 'DA_THAM_GIA'
  )
$$;

create function app.is_primary_member(p_household uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from app.members m
    where m.household_id = p_household
      and m.user_id = (select auth.uid())
      and m.status = 'DA_THAM_GIA'
      and m.role = 'PRIMARY'
  )
$$;

create function app.is_primary(p_child uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from app.children c
    join app.members m on m.household_id = c.household_id
    where c.id = p_child
      and c.hidden_at is null
      and m.user_id = (select auth.uid())
      and m.status = 'DA_THAM_GIA'
      and m.role = 'PRIMARY'
  )
$$;

create function app.is_self_member(p_member uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from app.members m
    where m.id = p_member
      and m.user_id = (select auth.uid())
      and m.status = 'DA_THAM_GIA'
  )
$$;

create function app.has_grant(p_child uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from app.grants g
    join app.members m on m.id = g.member_id
    where g.child_id = p_child
      and g.state = 'ACTIVE'
      and g.action = 'view'
      and m.user_id = (select auth.uid())
      and m.status = 'DA_THAM_GIA'
  )
$$;

create function app.is_bound_device(p_child uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from app.device_bindings b
    where b.child_id = p_child
      and b.device_user_id = (select auth.uid())
      and b.state = 'HIEU_LUC'
  )
$$;

create function app.household_frozen(p_child uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select h.state <> 'HOAT_DONG' or h.frozen_at is not null
    from app.children c join app.households h on h.id = c.household_id
    where c.id = p_child
  ), true)   -- không rõ -> coi là đóng băng (fail-closed)
$$;

-- Con có máy mới được ghép (§2.1: has_device=false -> không cho ghép).
create function app.tg_binding_requires_device() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.state in ('CHO_XAC_NHAN_MAY_CON', 'HIEU_LUC', 'CHO_XAC_MINH')
     and not coalesce((select c.has_device from app.children c where c.id = new.child_id), false) then
    raise exception 'child has no device' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger device_bindings_requires_device
  before insert or update of state, child_id on app.device_bindings
  for each row execute function app.tg_binding_requires_device();

-- ============================================================ D-38: hàm tổng hợp tuần (duy nhất)
-- Chỉ nhận MÃ TUẦN ISO (không khoảng ngày). Trả số đếm theo LOẠI NGÀY (D-37), không trả ngày/thứ.
-- Mốc cắt (L4): chỉ sẵn sàng sau Chủ Nhật 20:00 giờ VN của tuần đó; chỉ tính bản ghi có
-- occurred_at <= mốc. Chỉ QL của hộ gọi được. 'bo_qua' và bản đã hoàn tác không tính [MĐKT].
create function app.weekly_report(child uuid, iso_week text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_year   int;
  v_week   int;
  v_jan4   date;
  v_monday date;
  v_cutoff timestamptz;
  v_by     jsonb;
begin
  if iso_week is null or iso_week !~ '^[0-9]{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$' then
    raise exception 'invalid iso_week' using errcode = '22023';
  end if;
  v_year := substr(iso_week, 1, 4)::int;
  v_week := substr(iso_week, 7, 2)::int;
  v_jan4 := make_date(v_year, 1, 4);
  v_monday := v_jan4 - (extract(isodow from v_jan4)::int - 1) + (v_week - 1) * 7;
  if to_char(v_monday, 'IYYY') <> substr(iso_week, 1, 4) then
    raise exception 'invalid iso_week' using errcode = '22023';   -- ví dụ W53 không tồn tại
  end if;

  if not coalesce((select app.is_primary(child)), false) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v_cutoff := ((v_monday + 6)::timestamp + time '20:00') at time zone 'Asia/Ho_Chi_Minh';
  if now() < v_cutoff then
    return jsonb_build_object('iso_week', iso_week, 'ready', false);
  end if;

  select coalesce(jsonb_object_agg(t.day_type, jsonb_build_object(
           'ngay', t.ngay, 'hoi_met', t.hoi_met, 'rat_met', t.rat_met)), '{}'::jsonb)
    into v_by
  from (
    select f.day_type,
           count(*)                                   as ngay,
           count(*) filter (where r.choice = 'hoi_met') as hoi_met,
           count(*) filter (where r.choice = 'rat_met') as rat_met
    from private.checkin_responses r
    cross join lateral (
      select distinct u as day_type
      from unnest(case when cardinality(r.day_features) = 0
                       then array['khong_dac_diem'] else r.day_features end) as u
    ) f
    where r.child_id = child
      and r.local_date between v_monday and v_monday + 6
      and r.occurred_at <= v_cutoff
      and r.undone_at is null
      and r.choice <> 'bo_qua'
    group by f.day_type
  ) t;

  return jsonb_build_object('iso_week', iso_week, 'ready', true, 'by_day_type', v_by);
end $$;

-- ============================================================ RLS (mặc định từ chối)

alter table app.households       enable row level security;
alter table app.members          enable row level security;
alter table app.children         enable row level security;
alter table app.grants           enable row level security;
alter table app.device_bindings  enable row level security;
alter table private.pairing_codes       enable row level security;   -- phòng thủ chiều sâu, không chính sách
alter table private.checkin_responses   enable row level security;
alter table private.child_settings      enable row level security;

-- Chỉ chính sách SELECT; ghi đi qua hàm (task sau) hoặc service_role (bỏ qua RLS).
create policy households_select on app.households for select to authenticated
  using (hidden_at is null and (select app.is_member(id)));

create policy members_select on app.members for select to authenticated
  using ((select app.is_member(household_id)));

create policy children_select on app.children for select to authenticated
  using (hidden_at is null and (
         (select app.is_primary_member(household_id))
      or (select app.has_grant(id))
      or (select app.is_bound_device(id))));

create policy grants_select on app.grants for select to authenticated
  using ((select app.is_primary(child_id)) or (select app.is_self_member(member_id)));

create policy device_bindings_select on app.device_bindings for select to authenticated
  using ((select app.is_primary(child_id))
      or (state = 'HIEU_LUC' and device_user_id = (select auth.uid())));

-- ============================================================ Đặc quyền (thu hồi rồi cấp lại tối thiểu)

revoke all on all tables    in schema app     from public, anon, authenticated;
revoke all on all sequences in schema app     from public, anon, authenticated;
revoke all on all functions in schema app     from public, anon, authenticated;
revoke all on all tables    in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

grant select on app.households, app.members, app.children, app.grants, app.device_bindings
  to authenticated;
grant all on all tables in schema app     to service_role;
grant all on all tables in schema private to service_role;

-- Hàm tiện ích: authenticated cần EXECUTE vì chính sách gọi chúng. Hàm trigger: không ai.
grant execute on function
  app.is_member(uuid), app.is_primary_member(uuid), app.is_primary(uuid),
  app.is_self_member(uuid), app.has_grant(uuid), app.is_bound_device(uuid),
  app.household_frozen(uuid), app.weekly_report(uuid, text)
  to authenticated, service_role;
