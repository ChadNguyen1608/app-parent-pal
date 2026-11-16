-- T2.1 (Dev Plan 15.1 Đợt 2; Tech Spec §2.2, §2.8, §3 `consent-record`; BL 11.3 §2.2, §3.1, BR-CON-001..008, 020..029;
-- D-42, D-58, LQ-16; AC-CON-01..08, 22; RLS-PURPOSE). Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Thêm: mục đích thứ 8 (D-58), policy_versions, consent_events (sổ CHỈ-THÊM), purpose_state (chỉ trigger cập nhật),
-- phụ thuộc mục đích, app_internal.purpose_effective / visible_from / purpose_visible, nối vào app.access_state
-- (tham số purpose), app.consent_record. Rút toàn bộ (app.consent_withdraw_all) ở migration T2.2.
--
-- QUYẾT ĐỊNH MẶC ĐỊNH (tài liệu thiếu hoặc mơ hồ; liệt kê để chủ sản phẩm duyệt):
--  1. Mục đích thứ 8 = 'MD-CONBAO' (D-58 không đặt mã). Tùy chọn, phụ thuộc MD-DONGBO, collect_enabled = FALSE (thận trọng, LQ-16
--     chưa có trả lời): không thu và KHÔNG ghi được DONG_Y (FEATURE_OFF) cho tới khi chủ sản phẩm bật cờ bằng migration.
--     RUT luôn ghi được. Tên hiển thị name_vi là đề xuất nội bộ.
--  2. Mục đích bật hiệu lực (purpose_effective) = tự DANG_BAT, collect_enabled, và MỌI mục đích phụ thuộc (kể cả gián tiếp) hiệu lực.
--  3. Rút một mục đích thì mục đích PHỤ THUỘC đang DANG_BAT bị ghi sự kiện RUT theo (origin PHU_THUOC): đồng ý lại mục cha KHÔNG
--     tự bật lại mục con, phải đồng ý lại từng mục. (Phương án lỏng hơn: chỉ tính động; Architecture §10 chỉ nói tính động.)
--  4. Dữ liệu cũ hiện nếu và chỉ nếu created_at >= visible_from = lớn nhất của active_since trên cả chuỗi phụ thuộc. Nên rút mục cha
--     rồi đồng ý lại mục cha cũng không làm dữ liệu cũ của mục con hiện lại (AC-CON-07).
--  5. Rút mục đích LÕI (MD-LICH) ở cấp con = rút toàn bộ (BR-CON-026): consent_record từ chối, dùng consent_withdraw_all.
--  6. Hộ đóng băng: mọi ghi đồng ý/rút bị FROZEN (BR-FAM-054 "không ẩn thêm"; cùng cách child.delete). Mở lại là việc T2.3.
--  7. Đồng ý của chính người lớn (BR-CON-007, AC-CON-05): p_for_self = true, ghi sổ với subject_member_id; KHÔNG đổi purpose_state
--     (trạng thái theo con do QL quyết). Rút của chính mình thì thu hồi grant của người đó cho mục đích (và mục phụ thuộc): chỉ thu hẹp.
--  8. DONG_Y/RUT trùng trạng thái hiện tại: không ghi sự kiện (changed=false). consent_record không tạo hồ sơ con; "không đồng ý
--     MD-LICH thì không tạo hồ sơ" (BR-CON-001) chưa ép ở máy chủ: hồ sơ chưa có MD-LICH DANG_BAT không dùng được mục đích nào.
--  9. CHO_DONG_Y_LAI (BL 11.3 §3.1, chính sách đổi nội dung) chưa có: Tech Spec §2.2 chỉ có CHUA_HOI|DANG_BAT|DA_RUT. Mục đích MỚI
--     thì tự nhiên chưa đồng ý nên không thu (AC-CON-08). approval 'CHUA_DUYET' chưa chặn gì ở máy chủ; chặn dữ liệu thật theo data_class là T2.4.
-- 10. Chưa làm (bảng chưa có): vô hiệu CR khi rút MD-MONGMUON (AC-CON-04, T4.3), hủy nhắc, thông báo.

-- ============================================================ mục đích thứ 8 (D-58)
insert into app.purposes (code, name_vi, depends_on, kind, collect_enabled) values
  ('MD-CONBAO', 'Con báo trực tiếp cho bố mẹ (không khỏe, nghỉ học sớm, nhờ đón)', '{MD-DONGBO}', 'TUY_CHON', false);

-- ============================================================ policy_versions (Tech Spec §2.2)
create table app.policy_versions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  effective_at  timestamptz not null,
  purposes_json jsonb not null,
  text_ref      text not null
);
create trigger policy_versions_append_only before update or delete on app.policy_versions
  for each row execute function app.tg_append_only();
create trigger policy_versions_no_truncate before truncate on app.policy_versions
  for each statement execute function app.tg_append_only();

insert into app.policy_versions (effective_at, purposes_json, text_ref)
select now(),
       jsonb_agg(jsonb_build_object('code', p.code, 'name_vi', p.name_vi, 'kind', p.kind, 'depends_on', p.depends_on,
                                    'collect_enabled', p.collect_enabled, 'approval', p.approval) order by p.code),
       'NHAP-D42-CHUA-DUYET'
from app.purposes p;

-- ============================================================ consent_events (sổ chỉ-thêm)
create table app.consent_events (
  id                uuid primary key default gen_random_uuid(),
  at                timestamptz not null default clock_timestamp(),   -- giờ máy chủ
  household_id      uuid not null references app.households (id),
  child_id          uuid not null references app.children (id),
  purpose_code      text not null references app.purposes (code),
  event             text not null check (event in ('DONG_Y', 'RUT')),
  actor_member_id   uuid not null references app.members (id),
  subject_member_id uuid references app.members (id),                 -- null: đồng ý theo con (QL); khác null: của chính người lớn đó
  origin            text not null default 'MOT_MUC' check (origin in ('MOT_MUC', 'PHU_THUOC', 'RUT_TOAN_BO')),
  policy_version_id uuid not null references app.policy_versions (id),
  method            text not null default 'SELF_DECLARED' check (method in ('SELF_DECLARED')),
  paper_ref         text check (paper_ref is null or paper_ref ~ '^[A-Za-z0-9._-]{1,40}$'),   -- mã phiếu giấy, không dữ liệu cá nhân
  idempotency_key   uuid,
  check (subject_member_id is null or (subject_member_id = actor_member_id and origin = 'MOT_MUC')),
  check (origin = 'MOT_MUC' or event = 'RUT')
);
create unique index consent_events_idem_uidx on app.consent_events (idempotency_key) where idempotency_key is not null;
create index consent_events_child_idx on app.consent_events (child_id, purpose_code, at);
create index consent_events_household_idx on app.consent_events (household_id);

create trigger consent_events_append_only before update or delete on app.consent_events
  for each row execute function app.tg_append_only();
create trigger consent_events_no_truncate before truncate on app.consent_events
  for each statement execute function app.tg_append_only();

-- ============================================================ purpose_state (chỉ trigger cập nhật)
create table app.purpose_state (
  child_id      uuid not null references app.children (id),
  purpose_code  text not null references app.purposes (code),
  state         text not null check (state in ('CHUA_HOI', 'DANG_BAT', 'DA_RUT')),   -- không có dòng = CHUA_HOI (fail-closed)
  active_since  timestamptz,
  updated_at    timestamptz not null default clock_timestamp(),
  last_event_id uuid references app.consent_events (id),
  primary key (child_id, purpose_code),
  check ((state = 'DANG_BAT') = (active_since is not null))
);

-- Chặn ghi trực tiếp (kể cả service_role): chỉ chạy khi nằm trong trigger của consent_events (độ sâu trigger >= 2).
-- Xóa dòng KHÔNG bị chặn (xóa hẳn theo hộ ở T2.4); xóa dòng chỉ đưa về CHUA_HOI = không thu.
create function app.tg_purpose_state_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if pg_trigger_depth() < 2 then
    raise exception 'purpose_state chỉ được cập nhật bởi trigger của consent_events' using errcode = '55000';
  end if;
  return new;
end $$;
create trigger purpose_state_guard before insert or update on app.purpose_state
  for each row execute function app.tg_purpose_state_guard();

-- Kiểm tính nhất quán của một dòng sổ (mọi đường ghi, kể cả service_role).
create function app.tg_consent_check() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_hh      uuid;
  v_collect boolean;
  v_eff     timestamptz;
begin
  select c.household_id into v_hh from app.children c where c.id = new.child_id;
  if v_hh is distinct from new.household_id then
    raise exception 'consent_events: household_id không khớp hồ sơ con' using errcode = '23514';
  end if;
  if not exists (select 1 from app.members m where m.id = new.actor_member_id and m.household_id = new.household_id) then
    raise exception 'consent_events: người ghi không thuộc hộ' using errcode = '23514';
  end if;
  select p.collect_enabled into v_collect from app.purposes p where p.code = new.purpose_code;
  if new.event = 'DONG_Y' and not coalesce(v_collect, false) then
    raise exception 'consent_events: mục đích này chưa được thu, không ghi được đồng ý' using errcode = '23514';
  end if;
  select pv.effective_at into v_eff from app.policy_versions pv where pv.id = new.policy_version_id;
  if v_eff is null or v_eff > clock_timestamp() then
    raise exception 'consent_events: phiên bản chính sách chưa hiệu lực' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger consent_events_check before insert on app.consent_events
  for each row execute function app.tg_consent_check();

-- Áp sự kiện vào purpose_state. Đồng ý khi đã DANG_BAT giữ nguyên active_since (không làm "hiện lại" dữ liệu).
create function app.tg_consent_apply() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.subject_member_id is not null then return null; end if;   -- đồng ý của người lớn: chỉ ghi sổ
  if new.event = 'DONG_Y' then
    insert into app.purpose_state as s (child_id, purpose_code, state, active_since, last_event_id)
    values (new.child_id, new.purpose_code, 'DANG_BAT', new.at, new.id)
    on conflict (child_id, purpose_code) do update
      set state = 'DANG_BAT',
          active_since = case when s.state = 'DANG_BAT' then s.active_since else excluded.active_since end,
          updated_at = clock_timestamp(), last_event_id = excluded.last_event_id;
  else
    insert into app.purpose_state as s (child_id, purpose_code, state, active_since, last_event_id)
    values (new.child_id, new.purpose_code, 'DA_RUT', null, new.id)
    on conflict (child_id, purpose_code) do update
      set state = 'DA_RUT', active_since = null, updated_at = clock_timestamp(), last_event_id = excluded.last_event_id;
  end if;
  return null;
end $$;
create trigger consent_events_apply after insert on app.consent_events
  for each row execute function app.tg_consent_apply();

create function app.tg_consent_audit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.audit_write_auto(new.household_id,
    case new.event when 'DONG_Y' then 'consent.granted' else 'consent.withdrawn' end,
    'child:' || new.child_id,
    jsonb_build_object('purpose', new.purpose_code, 'origin', new.origin, 'self', new.subject_member_id is not null));
  return null;
end $$;
create trigger consent_events_audit after insert on app.consent_events
  for each row execute function app.tg_consent_audit();

-- ============================================================ hàm phụ trợ trong app_internal (không mở API)
-- purpose_effective: nội bộ (không cấp cho authenticated); chỉ app.access_state và hàm khác gọi.
create function app_internal.purpose_effective(p_child uuid, p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  with recursive chain(code) as (
    select p_code
    union
    select d from chain c join app.purposes p on p.code = c.code cross join lateral unnest(p.depends_on) as d
  )
  select p_child is not null and p_code is not null
     and exists (select 1 from app.purposes p where p.code = p_code)
     and not exists (
       select 1 from chain c
       left join app.purposes p on p.code = c.code
       left join app.purpose_state s on s.child_id = p_child and s.purpose_code = c.code
       where p.code is null or not p.collect_enabled or s.state is distinct from 'DANG_BAT')
$$;

-- visible_from: mốc từ đó dữ liệu của mục đích được phép hiện (null = không hiện gì). Chính sách của bảng dữ liệu (T3+) dùng
-- purpose_visible(child, code, created_at). Người gọi phải xem được con theo mục đích đó (app_internal.can), service_role thì không cần.
create function app_internal.visible_from(p_child uuid, p_code text) returns timestamptz
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_service boolean := coalesce((select auth.jwt()) ->> 'role', '') = 'service_role';
  v_since   timestamptz;
begin
  if p_child is null or p_code is null then return null; end if;
  if not v_service and not app_internal.can(v_uid, 'child.view', p_child, p_code) then return null; end if;
  if not app_internal.purpose_effective(p_child, p_code) then return null; end if;
  with recursive chain(code) as (
    select p_code
    union
    select d from chain c join app.purposes p on p.code = c.code cross join lateral unnest(p.depends_on) as d
  )
  select max(s.active_since) into v_since
  from chain c join app.purpose_state s on s.child_id = p_child and s.purpose_code = c.code;
  return v_since;
end $$;

create function app_internal.purpose_visible(p_child uuid, p_code text, p_created_at timestamptz) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(p_created_at >= app_internal.visible_from(p_child, p_code), false)
$$;

-- ============================================================ app.access_state: nối purpose_state (Tech Spec §2.8, BL 11.3 §5)
-- Như bản T1.5, thêm: (1) mục đích truyền vào phải HIỆU LỰC cho con đó (đồng ý bật, mọi phụ thuộc bật), nếu không DENY;
-- (2) hành động 'child.consent' (ghi đồng ý/rút/rút toàn bộ): chỉ QL, đóng băng -> FROZEN.
create or replace function app.access_state(p_actor uuid, p_action text, p_child uuid, p_purpose text default null)
returns text language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_service boolean := coalesce((select auth.jwt()) ->> 'role', '') = 'service_role';
  v_hh      uuid;
  v_frozen  boolean;
  v_role    text;
  v_epoch   text := (select auth.jwt()) ->> 'binding_epoch';   -- tùy chọn, chỉ để THU HẸP quyền (RLS-EPOCH)
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

  -- Mục đích chưa đồng ý, đã rút, hoặc có phụ thuộc đã tắt: không ai (kể cả QL) được dùng theo mục đích đó.
  if p_purpose is not null and not app_internal.purpose_effective(p_child, p_purpose) then
    return 'DENY';
  end if;

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
                 where b.child_id = p_child and b.device_user_id = p_actor and b.state = 'HIEU_LUC'
                   and (v_epoch is null or v_epoch = b.epoch::text)) then
        return case when v_frozen then 'FROZEN' else 'ALLOW' end;
      end if;
      return 'DENY';
    when 'child.admin_read' then
      return case when v_role = 'PRIMARY' then 'ALLOW' else 'DENY' end;
    when 'child.update', 'child.delete', 'child.mode_set', 'child.pair', 'child.consent' then
      if v_role <> 'PRIMARY' or v_role is null then return 'DENY'; end if;
      return case when v_frozen then 'FROZEN' else 'ALLOW' end;
    else
      return 'DENY';   -- hành động lạ: fail-closed
  end case;
end $$;

-- ============================================================ app.consent_record (Tech Spec §3 #12; AC-CON-02..08, 22)
-- Vào: p_child, p_purpose_code, p_event 'DONG_Y'|'RUT', p_policy_version_id (null = bản hiệu lực mới nhất), p_paper_ref (chỉ QL,
-- mã phiếu giấy D-01), p_idempotency_key, p_for_self (false: đồng ý theo con, chỉ QL; true: đồng ý của chính người lớn gọi).
-- Ra: {ok, child_id, purpose_code, event, scope: 'CHILD'|'SELF', changed, replay, state, effective, active_since}.
-- Máy con (ẩn danh) không ghi đồng ý (BR-CON-020). NL ghi theo con -> FORBIDDEN (AC-CON-05).
create function app.consent_record(
  p_child uuid, p_purpose_code text, p_event text,
  p_policy_version_id uuid default null, p_paper_ref text default null,
  p_idempotency_key uuid default null, p_for_self boolean default false)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_self    boolean := coalesce(p_for_self, false);
  v_child   app.children;
  v_member  app.members;
  v_purpose app.purposes;
  v_state   text;
  v_pv      uuid;
  v_cur     app.purpose_state;
  v_old     app.consent_events;
  v_last    text;
  v_ids     text[];
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'BR-CON-020', 'Máy của con không ghi đồng ý của bố mẹ.');
  end if;

  select m.* into v_member
  from app.members m join app.children c on c.household_id = m.household_id
  where c.id = p_child and m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  if v_member.id is null then perform app.reject_child(v_uid, 'DENY', p_child); end if;

  v_state := app.access_state(v_uid,
    case when v_member.role = 'PRIMARY' or not v_self then 'child.consent' else 'child.view' end, p_child, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;

  if p_event is null or p_event not in ('DONG_Y', 'RUT') then
    perform app.fail('VALIDATION', 'BR-CON-002', 'Sự kiện không hợp lệ.');
  end if;
  select * into v_purpose from app.purposes p where p.code = p_purpose_code;
  if not found then perform app.fail('VALIDATION', 'BR-CON-001', 'Mục đích không có trong danh mục.'); end if;
  if p_event = 'DONG_Y' and not v_purpose.collect_enabled then
    perform app.fail('FEATURE_OFF', 'C-07', 'Mục này chưa mở ở bản thử.');
  end if;
  if p_event = 'RUT' and not v_self and v_purpose.kind = 'LOI' then
    perform app.fail('VALIDATION', 'BR-CON-026', 'Rút mục lõi nghĩa là rút toàn bộ. Hãy dùng chức năng rút toàn bộ.');
  end if;
  if p_paper_ref is not null and (v_self or p_paper_ref !~ '^[A-Za-z0-9._-]{1,40}$') then
    perform app.fail('VALIDATION', 'D-01', 'Mã phiếu không hợp lệ.');
  end if;

  if p_policy_version_id is null then
    select pv.id into v_pv from app.policy_versions pv where pv.effective_at <= clock_timestamp()
    order by pv.effective_at desc, pv.created_at desc limit 1;
  else
    select pv.id into v_pv from app.policy_versions pv
    where pv.id = p_policy_version_id and pv.effective_at <= clock_timestamp();
  end if;
  if v_pv is null then perform app.fail('VALIDATION', 'BR-CON-005', 'Phiên bản chính sách không hợp lệ.'); end if;

  perform 1 from app.children c where c.id = p_child for update;    -- tuần tự hóa ghi đồng ý của một con
  select * into v_child from app.children c where c.id = p_child;

  if p_idempotency_key is not null then
    select * into v_old from app.consent_events e where e.idempotency_key = p_idempotency_key;
    if found then
      if v_old.child_id = p_child and v_old.purpose_code = p_purpose_code and v_old.event = p_event
         and v_old.actor_member_id = v_member.id then
        select * into v_cur from app.purpose_state s where s.child_id = p_child and s.purpose_code = p_purpose_code;
        return jsonb_build_object('ok', true, 'child_id', p_child, 'purpose_code', p_purpose_code, 'event', p_event,
          'scope', case when v_old.subject_member_id is null then 'CHILD' else 'SELF' end,
          'changed', false, 'replay', true, 'state', coalesce(v_cur.state, 'CHUA_HOI'),
          'effective', app_internal.purpose_effective(p_child, p_purpose_code), 'active_since', v_cur.active_since);
      end if;
      perform app.fail('VALIDATION', 'idempotency', 'Khóa gửi lại không hợp lệ.');
    end if;
  end if;

  if v_self then
    select e.event into v_last from app.consent_events e
    where e.child_id = p_child and e.purpose_code = p_purpose_code and e.subject_member_id = v_member.id
    order by e.at desc, e.id desc limit 1;
    if v_last is distinct from p_event then
      insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, subject_member_id,
                                      policy_version_id, idempotency_key)
      values (v_child.household_id, p_child, p_purpose_code, p_event, v_member.id, v_member.id, v_pv, p_idempotency_key);
      if p_event = 'RUT' then
        -- chỉ thu hẹp: thu hồi grant của chính người này cho mục đích và các mục phụ thuộc
        with recursive dep(code) as (
          select p_purpose_code
          union
          select p.code from dep d join app.purposes p on d.code = any (p.depends_on)
        )
        update app.grants g set state = 'THU_HOI', revoked_at = now()
        where g.member_id = v_member.id and g.child_id = p_child and g.state <> 'THU_HOI'
          and g.purpose_code in (select code from dep);
      end if;
      return jsonb_build_object('ok', true, 'child_id', p_child, 'purpose_code', p_purpose_code, 'event', p_event,
        'scope', 'SELF', 'changed', true, 'replay', false);
    end if;
    return jsonb_build_object('ok', true, 'child_id', p_child, 'purpose_code', p_purpose_code, 'event', p_event,
      'scope', 'SELF', 'changed', false, 'replay', false);
  end if;

  select * into v_cur from app.purpose_state s where s.child_id = p_child and s.purpose_code = p_purpose_code;
  if (p_event = 'DONG_Y' and v_cur.state = 'DANG_BAT') or (p_event = 'RUT' and v_cur.state is distinct from 'DANG_BAT') then
    return jsonb_build_object('ok', true, 'child_id', p_child, 'purpose_code', p_purpose_code, 'event', p_event,
      'scope', 'CHILD', 'changed', false, 'replay', false, 'state', coalesce(v_cur.state, 'CHUA_HOI'),
      'effective', app_internal.purpose_effective(p_child, p_purpose_code), 'active_since', v_cur.active_since);
  end if;

  insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id,
                                  paper_ref, idempotency_key)
  values (v_child.household_id, p_child, p_purpose_code, p_event, v_member.id, v_pv, p_paper_ref, p_idempotency_key);

  if p_event = 'RUT' then
    -- mục phụ thuộc đang bật bị rút theo (quyết định 3); phải đồng ý lại từng mục
    with recursive dep(code) as (
      select p.code from app.purposes p where p_purpose_code = any (p.depends_on)
      union
      select p.code from dep d join app.purposes p on d.code = any (p.depends_on)
    )
    select array_agg(d.code order by d.code) into v_ids
    from dep d join app.purpose_state s on s.child_id = p_child and s.purpose_code = d.code and s.state = 'DANG_BAT';
    if v_ids is not null then
      insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, origin, policy_version_id)
      select v_child.household_id, p_child, c, 'RUT', v_member.id, 'PHU_THUOC', v_pv from unnest(v_ids) as c;
    end if;
  end if;

  select * into v_cur from app.purpose_state s where s.child_id = p_child and s.purpose_code = p_purpose_code;
  return jsonb_build_object('ok', true, 'child_id', p_child, 'purpose_code', p_purpose_code, 'event', p_event,
    'scope', 'CHILD', 'changed', true, 'replay', false, 'state', v_cur.state,
    'effective', app_internal.purpose_effective(p_child, p_purpose_code), 'active_since', v_cur.active_since,
    'also_withdrawn', coalesce(to_jsonb(v_ids), '[]'::jsonb));
end $$;

-- ============================================================ RLS và chính sách
alter table app.policy_versions enable row level security;
alter table app.consent_events  enable row level security;
alter table app.purpose_state   enable row level security;

-- Bản chính sách: mọi người đăng nhập đọc (Tech Spec §2.7).
create policy policy_versions_select on app.policy_versions for select to authenticated using (true);

-- Sổ đồng ý: QL đọc cả hộ (kể cả hồ sơ đã ẩn, đóng băng); người lớn đọc dòng của chính mình. Máy con không đọc (CA-16 dựng từ bảng quyền).
create policy consent_events_select on app.consent_events for select to authenticated
  using ((select app_internal.can_household((select auth.uid()), 'household.admin_read', household_id))
      or (subject_member_id is not null and (select app_internal.is_self_member(subject_member_id))));

-- Trạng thái: QL đọc mọi mục đích của con; NL và máy con chỉ thấy mục đích HIỆU LỰC mà họ được xem (để ẩn nút).
create policy purpose_state_select on app.purpose_state for select to authenticated
  using ((select app_internal.can((select auth.uid()), 'child.admin_read', child_id, null))
      or (select app_internal.can((select auth.uid()), 'child.view', child_id, purpose_code)));

-- ============================================================ đặc quyền
revoke all on app.policy_versions, app.consent_events, app.purpose_state from public, anon, authenticated;
grant select on app.policy_versions, app.consent_events, app.purpose_state to authenticated;
grant all on app.policy_versions, app.consent_events, app.purpose_state to service_role;

revoke all on function
  app.tg_purpose_state_guard(), app.tg_consent_check(), app.tg_consent_apply(), app.tg_consent_audit(),
  app.consent_record(uuid, text, text, uuid, text, uuid, boolean)
  from public, anon, authenticated;
grant execute on function app.consent_record(uuid, text, text, uuid, text, uuid, boolean) to authenticated;

revoke all on function
  app_internal.purpose_effective(uuid, text), app_internal.visible_from(uuid, text),
  app_internal.purpose_visible(uuid, text, timestamptz)
  from public, anon, authenticated;
grant execute on function app_internal.purpose_effective(uuid, text) to service_role;
grant execute on function app_internal.visible_from(uuid, text), app_internal.purpose_visible(uuid, text, timestamptz)
  to authenticated, service_role;
