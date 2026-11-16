-- T2.5 (Dev Plan 15.1 Đợt 2; Tech Spec §2.5 `audit_log`, §4.1 sự kiện miền; Architecture §9.3, §12;
-- BL 11.3 BR-CON-074, BR-CON-035; B01C-OD-07). Người soạn: AI, chưa kiểm chứng độc lập.
--
-- app.audit_log: nhật ký kiểm toán tối thiểu, CHỈ-THÊM (trigger chặn sửa/xóa/truncate, kể cả service_role).
-- KHÔNG BAO GIỜ chứa: PIN, mã ghép, token, chữ tự do, lựa chọn hỏi thăm, tên (BR-CON-074, B01C-OD-07).
-- Cách bảo đảm (nhiều lớp, không chỉ dựa vào người gọi tự giữ kỷ luật):
--   1. Danh mục sự kiện `private.audit_events`: mỗi event_code khai SẴN các khóa meta được phép. Khóa lạ bị từ chối.
--   2. Trigger kiểm `app.tg_audit_validate` (BEFORE INSERT) chạy với MỌI đường ghi, kể cả insert trực tiếp của service_role:
--      giá trị meta chỉ là chuỗi mã ngắn [A-Za-z0-9_.:-] (không khoảng trắng, không tiếng Việt, không chuỗi toàn chữ số dài
--      như PIN/mã 6 số), số nguyên nhỏ (< 1000), hoặc boolean. subject_ref chỉ dạng `loại:mã`. Thông báo lỗi KHÔNG lặp
--      lại giá trị vi phạm (tránh PIN lọt vào log của Postgres).
--   3. Chỉ ghi qua private.audit_write* (không cấp EXECUTE cho ai); bảng không cấp INSERT cho authenticated.
-- Cách gắn: TRIGGER trên bảng nguồn (device_bindings, children, consent_events ở T2.1, deletion_requests ở T2.2), không sửa
--   từng hàm RPC: mọi đường làm đổi trạng thái (RPC, Edge Function service_role, job) đều để lại dấu, không đường nào bỏ sót;
--   dòng audit nằm cùng giao dịch với thay đổi (hủy giao dịch thì dòng audit cũng mất).
-- Người thực hiện: actor_kind 'adult' (actor_id = members.id), 'child_device' (actor_id = device_bindings.id),
--   'system' (không có auth.uid(): job, Edge Function service_role, seed). Không dùng auth.users.id (không lộ định danh).
-- Hạn giữ audit PR-CON-04 = UNKNOWN: không có job xóa; xóa hẳn theo hộ (T2.4) cần đường riêng.
-- Việc con mở CA-14 và bấm "Con cần giúp đỡ" KHÔNG có audit (BR-CON-035): không có event_code nào cho việc đó.
-- Chưa gắn (task sau): commit lịch, khóa lịch, CR, đóng băng/mở lại (T2.3), trial_slots, thành viên vào/rời (mời đang tắt).

-- ============================================================ danh mục sự kiện (private, không mở API)
create table private.audit_events (
  event_code        text primary key check (event_code ~ '^[a-z]+(\.[a-z_]+)+$'),
  allowed_meta_keys text[] not null default '{}',
  note              text not null
);
alter table private.audit_events enable row level security;      -- phòng thủ chiều sâu, không chính sách
revoke all on private.audit_events from public, anon, authenticated;
grant all on private.audit_events to service_role;

insert into private.audit_events (event_code, allowed_meta_keys, note) values
  ('binding.requested',    '{epoch,state}',                  'pair_confirm: QL nhập mã, tạo yêu cầu ghép (Architecture §9.3 binding.paired)'),
  ('binding.paired',       '{epoch}',                        'pair_accept: máy con đồng ý, liên kết hiệu lực'),
  ('binding.unlinked',     '{epoch,reason}',                 'unlink_device, child_delete, rút toàn bộ: liên kết hiệu lực bị hủy (reason = mã lý do)'),
  ('mode.changed',         '{old_mode,new_mode,mode_epoch}', 'mode_set (BR-FAM-045)'),
  ('child.hidden',         '{reason}',                       'hồ sơ con bị ẩn (child_delete, rút toàn bộ); không xóa hẳn'),
  ('consent.granted',      '{purpose,origin,self}',          'T2.1: sự kiện DONG_Y trong sổ đồng ý'),
  ('consent.withdrawn',    '{purpose,origin,self}',          'T2.1: sự kiện RUT trong sổ đồng ý (origin: MOT_MUC, PHU_THUOC, RUT_TOAN_BO)'),
  ('deletion.requested',   '{scope,reason}',                 'T2.2: tạo yêu cầu xóa (rút toàn bộ); hạn xóa hẳn UNKNOWN');

-- ============================================================ bảng
create table app.audit_log (
  id           uuid primary key default gen_random_uuid(),
  at           timestamptz not null default clock_timestamp(),   -- giờ máy chủ, tăng đơn điệu trong một giao dịch
  household_id uuid not null references app.households (id),
  actor_kind   text not null check (actor_kind in ('adult', 'child_device', 'system')),
  actor_id     uuid,
  event_code   text not null references private.audit_events (event_code),
  subject_ref  text,
  meta         jsonb not null default '{}'::jsonb,
  check ((actor_kind = 'system') = (actor_id is null))
);
create index audit_log_household_at_idx on app.audit_log (household_id, at desc);

-- Kiểm nội dung (mọi đường ghi). Không echo giá trị vi phạm.
create function app.tg_audit_validate() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_keys text[];
  k      text;
  v      jsonb;
  s      text;
begin
  select e.allowed_meta_keys into v_keys from private.audit_events e where e.event_code = new.event_code;
  if not found then
    raise exception 'audit_log: event_code không có trong danh mục' using errcode = '23514';
  end if;
  if jsonb_typeof(new.meta) is distinct from 'object' then
    raise exception 'audit_log: meta phải là object' using errcode = '23514';
  end if;
  for k, v in select * from jsonb_each(new.meta) loop
    if not (k = any (v_keys)) then
      raise exception 'audit_log: khóa meta "%" không được phép cho %', k, new.event_code using errcode = '23514';
    end if;
    case jsonb_typeof(v)
      when 'string' then
        s := v #>> '{}';
        if s !~ '^[A-Za-z0-9_.:-]{1,40}$' or s ~ '^[0-9]{4,}$' then
          raise exception 'audit_log: giá trị meta của khóa "%" không phải mã ngắn', k using errcode = '23514';
        end if;
      when 'number' then
        s := v #>> '{}';
        if s !~ '^-?[0-9]{1,3}$' then
          raise exception 'audit_log: giá trị số của khóa "%" quá lớn hoặc không nguyên', k using errcode = '23514';
        end if;
      when 'boolean' then null;
      else
        raise exception 'audit_log: giá trị meta của khóa "%" phải là mã, số nhỏ hoặc boolean', k using errcode = '23514';
    end case;
  end loop;
  if new.subject_ref is not null
     and (new.subject_ref !~ '^[a-z_]+:[A-Za-z0-9_-]{1,40}$' or new.subject_ref ~ '^[a-z_]+:[0-9]{4,}$') then
    raise exception 'audit_log: subject_ref chỉ dạng loại:mã' using errcode = '23514';
  end if;
  return new;
end $$;

create trigger audit_log_validate before insert on app.audit_log
  for each row execute function app.tg_audit_validate();
create trigger audit_log_append_only before update or delete on app.audit_log
  for each row execute function app.tg_append_only();
create trigger audit_log_no_truncate before truncate on app.audit_log
  for each statement execute function app.tg_append_only();

-- ============================================================ cơ chế ghi (nội bộ, không cấp EXECUTE cho ai)
create function private.audit_write(
  p_household uuid, p_actor_kind text, p_actor_id uuid, p_event text,
  p_subject text default null, p_meta jsonb default '{}'::jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  insert into app.audit_log (household_id, actor_kind, actor_id, event_code, subject_ref, meta)
  values (p_household, p_actor_kind, p_actor_id, p_event, p_subject, coalesce(p_meta, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end $$;

-- Tự xác định người thực hiện từ phiên hiện tại (không tin tham số do người gọi truyền).
create function private.audit_write_auto(
  p_household uuid, p_event text, p_subject text default null, p_meta jsonb default '{}'::jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := (select auth.uid());
  v_kind text := 'system';
  v_id   uuid;
begin
  if v_uid is not null then
    if app.is_anonymous_caller() then
      select b.id into v_id
      from app.device_bindings b join app.children c on c.id = b.child_id
      where b.device_user_id = v_uid and c.household_id = p_household
      order by b.created_at desc, b.epoch desc limit 1;
      if v_id is not null then v_kind := 'child_device'; end if;
    else
      select m.id into v_id from app.members m where m.user_id = v_uid and m.household_id = p_household;
      if v_id is not null then v_kind := 'adult'; end if;
    end if;
  end if;
  return private.audit_write(p_household, v_kind, case when v_kind = 'system' then null else v_id end,
                             p_event, p_subject, p_meta);
end $$;

-- ============================================================ trigger gắn vào bảng nguồn hiện có
-- Mã lý do hủy liên kết / ẩn hồ sơ: cột gốc là chữ tự do, nên chỉ cho qua giá trị dạng MÃ; còn lại gộp 'KHAC'.
create function private.audit_code(p_text text) returns text
language sql immutable set search_path = '' as $$
  select case when p_text ~ '^[A-Z][A-Z0-9_]{0,29}$' then p_text else 'KHAC' end
$$;

create function app.tg_audit_binding() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_hh uuid;
begin
  select c.household_id into v_hh from app.children c where c.id = new.child_id;
  if tg_op = 'INSERT' then
    if new.state in ('CHO_XAC_NHAN_MAY_CON', 'CHO_XAC_MINH') then
      perform private.audit_write_auto(v_hh, 'binding.requested', 'child:' || new.child_id,
        jsonb_build_object('epoch', new.epoch, 'state', new.state));
    end if;
  elsif new.state is distinct from old.state then
    if new.state = 'HIEU_LUC' then
      perform private.audit_write_auto(v_hh, 'binding.paired', 'child:' || new.child_id,
        jsonb_build_object('epoch', new.epoch));
    elsif old.state = 'HIEU_LUC' and new.state = 'DA_HUY' then
      perform private.audit_write_auto(v_hh, 'binding.unlinked', 'child:' || new.child_id,
        jsonb_build_object('epoch', new.epoch, 'reason', private.audit_code(new.revoke_reason)));
    end if;
  end if;
  return null;
end $$;
create trigger device_bindings_audit
  after insert or update of state on app.device_bindings
  for each row execute function app.tg_audit_binding();

create function app.tg_audit_child() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.mode is distinct from old.mode then
    perform private.audit_write_auto(new.household_id, 'mode.changed', 'child:' || new.id,
      jsonb_build_object('old_mode', old.mode, 'new_mode', new.mode, 'mode_epoch', new.mode_epoch));
  end if;
  if old.hidden_at is null and new.hidden_at is not null then
    perform private.audit_write_auto(new.household_id, 'child.hidden', 'child:' || new.id,
      jsonb_build_object('reason', private.audit_code(new.hidden_reason)));
  end if;
  return null;
end $$;
create trigger children_audit
  after update of mode, hidden_at on app.children
  for each row execute function app.tg_audit_child();

-- ============================================================ RLS và đặc quyền
alter table app.audit_log enable row level security;

-- Tech Spec §2.7: QL đọc dòng của hộ mình. NL, máy con: không có chính sách (từ chối).
create policy audit_log_select on app.audit_log for select to authenticated
  using ((select app_internal.can_household((select auth.uid()), 'household.admin_read', household_id)));

revoke all on app.audit_log from public, anon, authenticated;
grant select on app.audit_log to authenticated;
grant all on app.audit_log to service_role;

revoke all on function
  app.tg_audit_validate(), app.tg_audit_binding(), app.tg_audit_child(),
  private.audit_write(uuid, text, uuid, text, text, jsonb),
  private.audit_write_auto(uuid, text, text, jsonb),
  private.audit_code(text)
  from public, anon, authenticated;
