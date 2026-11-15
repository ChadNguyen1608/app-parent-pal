-- T1.1 (Dev Plan 15.1 Đợt 1; Tech Spec §2.1, §2.2, §2.7, §2.8, §3; BL 11.2, 11.3 §2.2).
-- Thêm: app.purposes (bảng tham chiếu 7 mục đích), app.mode_history (chỉ-thêm),
-- app.invitations (khung, tính năng tắt), điểm quyết định truy cập app.can / app.can_household,
-- FK grants.purpose_code -> purposes, mã lỗi thống nhất (app.fail), và thay các chính sách baseline
-- bằng app.can. KHÔNG sửa migration baseline. Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Mẫu bắt buộc: hàm security definer + search_path rỗng + (select auth.uid()); fail-closed;
-- thu hồi quyền mặc định từ public/anon rồi cấp lại tối thiểu.

-- ============================================================ app.purposes (BL 11.3 §2.2)
-- Chỉ là bảng tham chiếu. Danh mục CHƯA được chủ sản phẩm duyệt (PBA-OD-02): mọi mục 'CHUA_DUYET'.
-- Không có consent_events / purpose_state / purpose_effective ở đây (T2.1).
create table app.purposes (
  code            text primary key,
  name_vi         text not null,
  depends_on      text[] not null default '{}',
  kind            text not null check (kind in ('LOI', 'TUY_CHON')),
  approval        text not null default 'CHUA_DUYET' check (approval in ('CHUA_DUYET')),
  collect_enabled boolean not null default true,    -- false: không thu dữ liệu (MD-SUCKHOE, C-07)
  check (not (code = any (depends_on)))
);

insert into app.purposes (code, name_vi, depends_on, kind, collect_enabled) values
  ('MD-LICH',      'Lập và xem lịch cho con',                          '{}',               'LOI',      true),
  ('MD-DONGBO',    'Đồng bộ lịch sang máy của con và nhắc giờ',         '{MD-LICH}',        'TUY_CHON', true),
  ('MD-XONG',      'Ghi con đã bấm Xong và giờ',                        '{MD-DONGBO}',      'TUY_CHON', true),
  ('MD-MET',       'Hỏi thăm sau giờ học và xu hướng mệt',              '{MD-DONGBO}',      'TUY_CHON', true),
  ('MD-MONGMUON',  'Con gửi mong muốn hoặc đề xuất cho bố mẹ',          '{MD-DONGBO}',      'TUY_CHON', true),
  ('MD-BAOCAO',    'Báo cáo tuần cho bố mẹ',                            '{MD-XONG}',        'TUY_CHON', true),
  ('MD-SUCKHOE',   'Thông tin sức khỏe của con (dị ứng, thuốc)',        '{MD-LICH}',        'TUY_CHON', false);

alter table app.grants
  add constraint grants_purpose_code_fkey foreign key (purpose_code) references app.purposes (code);

-- ============================================================ app.mode_history (Tech Spec §2.1, BR-FAM-045)
create table app.mode_history (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  child_id   uuid not null references app.children (id),
  old_mode   text not null check (old_mode in ('UNSET', 'PARENT_LED', 'CHILD_EXECUTED')),
  new_mode   text not null check (new_mode in ('UNSET', 'PARENT_LED', 'CHILD_EXECUTED')),
  changed_by uuid not null references app.members (id),
  at         timestamptz not null default now(),
  check (old_mode <> new_mode)
);
create index mode_history_child_idx on app.mode_history (child_id);

-- Chỉ-thêm: chặn sửa và xóa (mọi vai, kể cả quản trị). Hàm xóa hẳn theo hộ (T2.4) sẽ có đường riêng.
create function app.tg_append_only() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  raise exception 'append-only table: % not allowed', tg_op using errcode = '55000';
end $$;
create trigger mode_history_append_only
  before update or delete on app.mode_history
  for each row execute function app.tg_append_only();
create trigger mode_history_no_truncate
  before truncate on app.mode_history
  for each statement execute function app.tg_append_only();

-- ============================================================ app.invitations (khung; Tech Spec §2.1, D-35)
-- Tính năng mời người lớn thứ hai TẮT ở đợt thử: chưa có hàm ghi nào (member-invite là T1.8, sẽ trả FEATURE_OFF).
-- Bảng chỉ để khung lược đồ và chính sách đọc; hạn lời mời PR-FAM-01 chưa chốt (cột expires_at do hàm ghi đặt).
create table app.invitations (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  household_id uuid not null references app.households (id),
  invited_by   uuid not null references app.members (id),
  role         text not null check (role in ('SUPPORTER', 'OBSERVER')),   -- không mời PRIMARY (một QL mỗi hộ)
  scope_json   jsonb not null default '{}'::jsonb,
  code_hmac    text not null unique,                                      -- chỉ lưu băm, không lưu mã
  expires_at   timestamptz not null,
  state        text not null default 'DA_GUI' check (state in ('DA_GUI', 'DA_CHAP_NHAN', 'DA_HUY', 'HET_HAN'))
);
create index invitations_household_idx on app.invitations (household_id);

-- ============================================================ mã lỗi thống nhất (Tech Spec §0)
-- RAISE với SQLSTATE 'PTxyz': PostgREST trả HTTP xyz; message = mã lỗi, detail = quy tắc, hint = lời tiếng Việt.
-- Ánh xạ: UNAUTHENTICATED 401, FORBIDDEN 403, NOT_FOUND 404, VALIDATION 422, FROZEN 423,
-- CONFLICT_REV/LOCKED 409, FEATURE_OFF 403. Edge Function sau này chuyển sang { error: { code, message_vi, rule } }.
create function app.fail(p_code text, p_rule text default null, p_message_vi text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_state text;
begin
  v_state := case p_code
    when 'UNAUTHENTICATED' then 'PT401'
    when 'FORBIDDEN'       then 'PT403'
    when 'FEATURE_OFF'     then 'PT403'
    when 'NOT_FOUND'       then 'PT404'
    when 'VALIDATION'      then 'PT422'
    when 'FROZEN'          then 'PT423'
    when 'CONFLICT_REV'    then 'PT409'
    when 'LOCKED'          then 'PT409'
    else 'PT500'
  end;
  raise exception using errcode = v_state, message = p_code, detail = coalesce(p_rule, ''), hint = coalesce(p_message_vi, '');
end $$;

-- ============================================================ app.access_state / app.can (AD-09, Architecture §6.2)
-- Một điểm quyết định. access_state trả 'ALLOW' | 'FROZEN' | 'DENY' (nội bộ, để hàm ghi phân biệt
-- FROZEN với FORBIDDEN mà không lộ trạng thái cho người không có vai); app.can = (access_state = 'ALLOW').
--
-- Hành động (child):
--   child.view        QL của hộ; NL có grant ACTIVE 'view' (đúng mục đích nếu có truyền); máy con đã ghép (HIEU_LUC)
--   child.admin_read  chỉ QL (đọc dữ liệu quản trị: grants, bindings, mode_history)
--   child.update, child.delete, child.mode_set   chỉ QL
-- Thứ tự (BL 11.3 §5): phiên hợp lệ; hồ sơ chưa ẩn, hộ chưa ẩn; mục đích tồn tại và đang thu; đóng băng; vai và grant.
-- Đóng băng: QL vẫn ĐỌC được (thấy trạng thái), mọi ghi -> FROZEN; NL và máy con không đọc (BR-FAM-054, 057).
-- CHƯA có: purpose_effective (đồng ý đang bật, kể cả phụ thuộc) -> T2.1. Hiện chỉ kiểm mục đích có trong
-- app.purposes và collect_enabled = true (MD-SUCKHOE luôn bị từ chối). Mục đích lạ -> DENY (fail-closed).
-- Tham số p_actor: chỉ được dùng khi trùng người gọi (auth.uid()) hoặc người gọi là service_role
-- (Edge Function / job hỏi thay người dùng). Ngược lại luôn DENY: không cho dò quyền của người khác.
create function app.access_state(p_actor uuid, p_action text, p_child uuid, p_purpose text default null)
returns text language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_service boolean := coalesce((select auth.jwt()) ->> 'role', '') = 'service_role';
  v_hh      uuid;
  v_frozen  boolean;
  v_role    text;
begin
  if p_actor is null or p_child is null or p_action is null then return 'DENY'; end if;
  if not v_service and p_actor is distinct from v_uid then return 'DENY'; end if;

  if p_purpose is not null
     and not exists (select 1 from app.purposes p where p.code = p_purpose and p.collect_enabled) then
    return 'DENY';
  end if;

  select c.household_id,
         (h.state <> 'HOAT_DONG' or h.frozen_at is not null)
    into v_hh, v_frozen
  from app.children c
  join app.households h on h.id = c.household_id
  where c.id = p_child and c.hidden_at is null and h.hidden_at is null;
  if v_hh is null then return 'DENY'; end if;

  select m.role into v_role
  from app.members m
  where m.household_id = v_hh and m.user_id = p_actor and m.status = 'DA_THAM_GIA';

  case p_action
    when 'child.view' then
      if v_role = 'PRIMARY' then return 'ALLOW'; end if;
      if v_role is not null and exists (
           select 1 from app.grants g join app.members m on m.id = g.member_id
           where g.child_id = p_child and m.household_id = v_hh and m.user_id = p_actor
             and m.status = 'DA_THAM_GIA' and g.state = 'ACTIVE' and g.action = 'view'
             and (p_purpose is null or g.purpose_code = p_purpose)) then
        return case when v_frozen then 'FROZEN' else 'ALLOW' end;
      end if;
      if exists (select 1 from app.device_bindings b
                 where b.child_id = p_child and b.device_user_id = p_actor and b.state = 'HIEU_LUC') then
        return case when v_frozen then 'FROZEN' else 'ALLOW' end;
      end if;
      return 'DENY';
    when 'child.admin_read' then
      return case when v_role = 'PRIMARY' then 'ALLOW' else 'DENY' end;
    when 'child.update', 'child.delete', 'child.mode_set' then
      if v_role <> 'PRIMARY' or v_role is null then return 'DENY'; end if;
      return case when v_frozen then 'FROZEN' else 'ALLOW' end;
    else
      return 'DENY';   -- hành động lạ: fail-closed
  end case;
end $$;

create function app.can(p_actor uuid, p_action text, p_child uuid, p_purpose text default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(app.access_state(p_actor, p_action, p_child, p_purpose) = 'ALLOW', false)
$$;

-- Hành động cấp hộ (chưa có hồ sơ con để trỏ tới):
--   household.admin_read  chỉ QL (đọc lời mời...), kể cả đang đóng băng
--   child.create          chỉ QL, hộ không đóng băng
create function app.household_access_state(p_actor uuid, p_action text, p_household uuid)
returns text language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_service boolean := coalesce((select auth.jwt()) ->> 'role', '') = 'service_role';
  v_frozen  boolean;
  v_role    text;
begin
  if p_actor is null or p_household is null or p_action is null then return 'DENY'; end if;
  if not v_service and p_actor is distinct from v_uid then return 'DENY'; end if;

  select (h.state <> 'HOAT_DONG' or h.frozen_at is not null) into v_frozen
  from app.households h where h.id = p_household and h.hidden_at is null;
  if v_frozen is null then return 'DENY'; end if;

  select m.role into v_role from app.members m
  where m.household_id = p_household and m.user_id = p_actor and m.status = 'DA_THAM_GIA';

  case p_action
    when 'household.admin_read' then
      return case when v_role = 'PRIMARY' then 'ALLOW' else 'DENY' end;
    when 'child.create' then
      if v_role is distinct from 'PRIMARY' then return 'DENY'; end if;
      return case when v_frozen then 'FROZEN' else 'ALLOW' end;
    else
      return 'DENY';
  end case;
end $$;

create function app.can_household(p_actor uuid, p_action text, p_household uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(app.household_access_state(p_actor, p_action, p_household) = 'ALLOW', false)
$$;

-- Từ chối đúng mã cho hàm ghi: FROZEN (chỉ khi đã qua kiểm vai), FORBIDDEN (người này thấy được đối tượng),
-- NOT_FOUND (không được biết đối tượng có tồn tại, Tech Spec §0).
create function app.reject_child(p_actor uuid, p_state text, p_child uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_state = 'FROZEN' then
    perform app.fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa thay đổi được.');
  elsif app.access_state(p_actor, 'child.view', p_child, null) <> 'DENY' then
    perform app.fail('FORBIDDEN', null, 'Bạn không có quyền làm việc này.');
  else
    perform app.fail('NOT_FOUND', null, 'Không tìm thấy.');
  end if;
end $$;

create function app.reject_household(p_actor uuid, p_state text, p_household uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_state = 'FROZEN' then
    perform app.fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa thay đổi được.');
  elsif (select app.is_member(p_household)) then
    perform app.fail('FORBIDDEN', null, 'Bạn không có quyền làm việc này.');
  else
    perform app.fail('NOT_FOUND', null, 'Không tìm thấy.');
  end if;
end $$;

-- ============================================================ RLS và chính sách
alter table app.purposes     enable row level security;
alter table app.mode_history enable row level security;
alter table app.invitations  enable row level security;

-- Bảng tham chiếu: mọi người đăng nhập đọc được (Tech Spec §2.7: purposes R cho QL, NL, Con).
create policy purposes_select on app.purposes for select to authenticated using (true);

create policy mode_history_select on app.mode_history for select to authenticated
  using ((select app.can((select auth.uid()), 'child.admin_read', child_id, null)));

create policy invitations_select on app.invitations for select to authenticated
  using ((select app.can_household((select auth.uid()), 'household.admin_read', household_id)));

-- Thay các hàm hẹp của baseline bằng app.can ở những chỗ tương đương hành vi:
--   children_select: QL / NL có grant / máy con đã ghép -> 'child.view' (thêm: hộ đóng băng thì NL và máy con không đọc).
--   grants_select (nhánh QL) và device_bindings_select (nhánh QL) -> 'child.admin_read'.
-- Giữ nguyên households_select, members_select (is_member) và nhánh "của chính mình" của grants/device_bindings.
drop policy children_select on app.children;
create policy children_select on app.children for select to authenticated
  using (hidden_at is null and (select app.can((select auth.uid()), 'child.view', id, null)));

drop policy grants_select on app.grants;
create policy grants_select on app.grants for select to authenticated
  using ((select app.can((select auth.uid()), 'child.admin_read', child_id, null))
      or (select app.is_self_member(member_id)));

drop policy device_bindings_select on app.device_bindings;
create policy device_bindings_select on app.device_bindings for select to authenticated
  using ((select app.can((select auth.uid()), 'child.admin_read', child_id, null))
      or (state = 'HIEU_LUC' and device_user_id = (select auth.uid())));

-- ============================================================ Đặc quyền
revoke all on app.purposes, app.mode_history, app.invitations from public, anon, authenticated;
grant select on app.purposes, app.mode_history, app.invitations to authenticated;
grant all on app.purposes, app.mode_history, app.invitations to service_role;

revoke all on function
  app.tg_append_only(), app.fail(text, text, text),
  app.access_state(uuid, text, uuid, text), app.can(uuid, text, uuid, text),
  app.household_access_state(uuid, text, uuid), app.can_household(uuid, text, uuid),
  app.reject_child(uuid, text, uuid), app.reject_household(uuid, text, uuid)
  from public, anon, authenticated;

-- Chỉ app.can và app.can_household cho authenticated (chính sách gọi chúng). Còn lại là nội bộ.
grant execute on function app.can(uuid, text, uuid, text), app.can_household(uuid, text, uuid)
  to authenticated, service_role;
