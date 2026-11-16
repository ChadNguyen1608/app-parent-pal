-- T2.3 (Dev Plan 15.1 Đợt 2; Tech Spec §2.1 `households.state`, §3 #30 `deletion-request`, §4.1 `household.frozen/reopened`,
-- §4.2 `job-daily` bước 5; BL 11.2 BR-FAM-050..062, 080..089; BL 11.3 BR-CON-050..059; D-27, D-41; AC-FAM-21..26; RLS-FROZEN).
-- Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Gồm:
--  1. Đóng băng sau 30 ngày không có thao tác có chủ đích của người lớn (D-41, PR-FAM-06): `private.job_freeze_idle`, gọi từ
--     `private.job_daily` (pg_cron, 00:05 giờ VN). Hộ chỉ đóng băng khi KHÔNG người lớn nào dùng đủ hạn; chỉ QL quá hạn mà người
--     lớn khác còn dùng thì ghi một nhắc cho QL mỗi chu kỳ (BR-FAM-052). Mọi mốc tính theo giờ máy chủ, theo trạng thái (chạy bù
--     được, chạy lại không đổi kết quả). KHÔNG hủy liên kết máy con: máy con bị `FROZEN` qua `app.access_state` (chỉ xem lịch
--     đã tải, không nhận lịch mới, không gửi mong muốn, D-41) và nhận lại lịch ngay khi mở lại (BR-FAM-058).
--  2. Mở lại `app.household_reopen`: CHỈ QL, và phải xác nhận rõ ràng (đăng nhập thôi không đủ, BR-FAM-057); NL chỉ thấy trạng thái.
--     Mở lại đặt `last_active_at` của QL = bây giờ (nếu không job hôm sau đóng băng lại ngay).
--  3. `app.deletion_request` (Tech Spec #30): yêu cầu xóa hồ sơ con / rời gia đình (NL) / xóa gia đình, idempotent (giữ
--     `accepted_at` đầu, AC-CON-17), nối với `deletion_requests` của T2.2. Không xóa hẳn (hạn PR-CON-01 `UNKNOWN`, AC-CON-18):
--     ẩn ngay, `CHO_QUYET_HAN`. Xóa hẳn chỉ có cho dữ liệu GIA_LAP và hộ thử nội bộ (T2.4 `purge_household`).
--  4. RÚT LUÔN ĐƯỢC, KỂ CẢ KHI ĐÓNG BĂNG (D-64; thay công tắc `frozen_allows_withdrawal` của bản nháp trước): hành động `child.withdraw`
--     trong `app.access_state` (rút đồng ý, rút toàn bộ, yêu cầu xóa, xóa hồ sơ `child.delete`) cho QL khi hộ HOAT_DONG hoặc DONG_BANG.
--     Hộ đã sang CHO_XOA (hết hạn thử, xóa gia đình) thì FROZEN (đã ngừng xử lý). Đồng ý MỚI (DONG_Y), đổi mode, ghép máy, đặt PIN
--     vẫn FROZEN khi đóng băng (chỉ thu hẹp mới được làm khi đóng băng).

-- QUYẾT ĐỊNH MẶC ĐỊNH (tài liệu thiếu hoặc mơ hồ; chờ chủ sản phẩm duyệt):
--  1. Đóng băng KHÔNG đặt `device_bindings` về `DA_HUY` (Tech Spec §2.1 nhắc `revoke_reason DONG_BANG` nhưng BR-FAM-058 "máy con tiếp
--     tục nhận lịch hiện hành" khi mở lại, và D-41 "app con chỉ xem lịch đã tải"). Máy con mất quyền đọc qua `FROZEN`, không mất liên kết.
--  2. `last_active_at` null (chưa từng chạm) tính từ `joined_at` (thành viên mới vào không bị đóng băng ngay).
--  3. Thông báo "đóng băng", "nhắc QL", "đã mở lại" chưa có kênh gửi (T3.5): ghi vào `private.lifecycle_notices` (outbox tối thiểu,
--     không nội dung) để Edge Function gửi sau. `NHAC_QL`: một dòng mỗi chu kỳ (chu kỳ = lần dùng cuối của QL), PR-FAM-07 vẫn `UNKNOWN`.
--  4. Các bước khác của `job-daily` (giai đoạn, CR, ngoại lệ, lời mời, mã ghép, người dùng ẩn danh >7 ngày) chưa làm: bảng chưa có
--     (T3+) hoặc cần Auth Admin API. `trial_slots` hết hạn: T2.4.
--  5. `deletion_request` NGUOI_LON_ROI: chỉ NL (QL phải chuyển QL hoặc xóa gia đình, BR-FAM-016); GIA_DINH: chỉ QL và chỉ khi
--     không còn người lớn khác (BR-FAM-083 cần luồng chuyển QL chưa có: nhánh an toàn là chặn); cả hai cần `p_confirm = true`.
--  6. Rời gia đình / xóa gia đình / xóa hồ sơ khi hộ đóng băng: được (D-64), như mục 4.

-- ============================================================ tham số
insert into private.params (key, value_int, status, note) values
  ('freeze_idle_days', 30, 'DA_CHOT',
   'D-41, PR-FAM-06: số ngày không có thao tác có chủ đích của người lớn thì đóng băng (30 ngày liên tục, giờ máy chủ)');

-- ============================================================ app.access_state: nhóm "rút, xóa" luôn được khi đóng băng (D-64)
-- Như bản T2.1; thay đổi: 'child.delete' và hành động mới 'child.withdraw' cho QL kể cả hộ đóng băng.
create or replace function app.access_state(p_actor uuid, p_action text, p_child uuid, p_purpose text default null)
returns text language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_service boolean := coalesce((select auth.jwt()) ->> 'role', '') = 'service_role';
  v_hh      uuid;
  v_frozen  boolean;
  v_open    boolean;   -- hộ còn HOAT_DONG hoặc DONG_BANG (chưa CHO_XOA)
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
         (h.state <> 'HOAT_DONG' or h.frozen_at is not null),
         h.state in ('HOAT_DONG', 'DONG_BANG')
    into v_hh, v_frozen, v_open
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
    when 'child.update', 'child.mode_set', 'child.pair', 'child.consent' then
      if v_role <> 'PRIMARY' or v_role is null then return 'DENY'; end if;
      return case when v_frozen then 'FROZEN' else 'ALLOW' end;
    when 'child.delete', 'child.withdraw' then
      -- Nhóm "rút, xóa" (rút đồng ý, rút toàn bộ, xóa hồ sơ, yêu cầu xóa): luôn được khi hộ đóng băng (D-64); hộ CHO_XOA thì không.
      if v_role <> 'PRIMARY' or v_role is null then return 'DENY'; end if;
      return case when v_open then 'ALLOW' else 'FROZEN' end;
    else
      return 'DENY';   -- hành động lạ: fail-closed
  end case;
end $$;
-- ============================================================ app.consent_record: RUT dùng 'child.withdraw' (luôn được, D-64)
-- Như bản T2.1; thay đổi: hành động của QL khi p_event = 'RUT' là 'child.withdraw'. DONG_Y vẫn 'child.consent' (FROZEN khi đóng băng).
-- Thêm (D-66): rút MD-SUCKHOE tạo yêu cầu xóa phạm vi SUC_KHOE (hàng chờ xóa phần sức khỏe của con).
create or replace function app.consent_record(
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
    case when v_member.role = 'PRIMARY' or not v_self then (case when p_event = 'RUT' then 'child.withdraw' else 'child.consent' end)
         else 'child.view' end, p_child, null);
  -- Rút luôn được (D-64): người lớn tự rút phần của mình khi hộ đóng băng (child.view trả FROZEN) vẫn cho qua.
  if v_state <> 'ALLOW' and not (v_self and p_event = 'RUT' and v_state = 'FROZEN') then
    perform app.reject_child(v_uid, v_state, p_child);
  end if;

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
        -- chỉ thu hẹp: thu hồi grant của chính người này cho mục đích
        update app.grants g set state = 'THU_HOI', revoked_at = now()
        where g.member_id = v_member.id and g.child_id = p_child and g.state <> 'THU_HOI'
          and g.purpose_code = p_purpose_code;
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

  if p_event = 'RUT' and p_purpose_code = 'MD-SUCKHOE' then
    -- D-66: rút đồng ý sức khỏe -> ẩn ngay (purpose_effective sai) và đưa phần sức khỏe của con vào hàng chờ xóa
    insert into app.deletion_requests (household_id, scope, child_id, requested_by, reason)
    select v_child.household_id, 'SUC_KHOE', p_child, v_member.id, 'RUT_SUC_KHOE'
    where not exists (select 1 from app.deletion_requests dr where dr.child_id = p_child and dr.scope = 'SUC_KHOE' and dr.state <> 'DA_HUY');
  end if;

  select * into v_cur from app.purpose_state s where s.child_id = p_child and s.purpose_code = p_purpose_code;
  return jsonb_build_object('ok', true, 'child_id', p_child, 'purpose_code', p_purpose_code, 'event', p_event,
    'scope', 'CHILD', 'changed', true, 'replay', false, 'state', v_cur.state,
    'effective', app_internal.purpose_effective(p_child, p_purpose_code), 'active_since', v_cur.active_since);
end $$;
-- ============================================================ app.consent_withdraw_all: dùng 'child.withdraw' (luôn được, D-64)
-- Như bản T2.2; thay đổi duy nhất: hành động kiểm quyền là 'child.withdraw'.
create or replace function app.consent_withdraw_all(p_child uuid, p_confirm_token uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid    uuid := (select auth.uid());
  v_state  text;
  v_child  app.children;
  v_member app.members;
  v_dr     app.deletion_requests;
  v_conf   private.withdraw_confirmations;
  v_ttl    int := private.param_int('withdraw_confirm_ttl_minutes');
  v_pv     uuid;
  v_codes  text[];
  v_token  uuid;
  v_exp    timestamptz;
  v_dev    boolean;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'BR-CON-020', 'Máy của con không rút đồng ý của bố mẹ.');
  end if;

  -- Gửi lặp sau khi đã xong: chỉ QL của hộ đó; giữ thời điểm chấp nhận đầu (BR-CON-052).
  select dr.* into v_dr
  from app.deletion_requests dr join app.members m on m.household_id = dr.household_id
  where dr.child_id = p_child and dr.scope = 'HO_SO_CON' and dr.reason = 'RUT_TOAN_BO' and dr.state <> 'DA_HUY'
    and m.user_id = v_uid and m.role = 'PRIMARY' and m.status = 'DA_THAM_GIA'
  limit 1;
  if found then
    return jsonb_build_object('ok', true, 'step', 2, 'replay', true, 'deletion_request_id', v_dr.id,
      'accepted_at', v_dr.accepted_at, 'state', v_dr.state, 'hard_deleted', false);
  end if;

  v_state := app.access_state(v_uid, 'child.withdraw', p_child, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;

  select * into v_child from app.children c where c.id = p_child for update;
  select * into v_member from app.members m
  where m.household_id = v_child.household_id and m.user_id = v_uid and m.role = 'PRIMARY' and m.status = 'DA_THAM_GIA';

  select coalesce(array_agg(s.purpose_code order by s.purpose_code), '{}') into v_codes
  from app.purpose_state s where s.child_id = p_child and s.state = 'DANG_BAT';
  v_dev := exists (select 1 from app.device_bindings b where b.child_id = p_child
                   and b.state in ('CHO_XAC_NHAN_MAY_CON', 'HIEU_LUC', 'CHO_XAC_MINH'));

  -- ---------------------------------------------------------------- bước 1: hệ quả + mã xác nhận
  if p_confirm_token is null then
    delete from private.withdraw_confirmations w where w.child_id = p_child and w.member_id = v_member.id;
    v_exp := clock_timestamp() + make_interval(mins => v_ttl);
    insert into private.withdraw_confirmations (child_id, member_id, expires_at)
    values (p_child, v_member.id, v_exp) returning token into v_token;
    return jsonb_build_object('ok', true, 'step', 1, 'confirm_token', v_token, 'expires_at', v_exp,
      'consequences', jsonb_build_object(
        'purposes_withdrawn', to_jsonb(v_codes), 'child_hidden', true, 'device_unlinked', v_dev,
        'deletion_request', true, 'hard_deleted_now', false, 'can_reconsent', false));
  end if;

  -- ---------------------------------------------------------------- bước 2: xác nhận lần hai
  select * into v_conf from private.withdraw_confirmations w
  where w.token = p_confirm_token and w.child_id = p_child and w.member_id = v_member.id
    and w.used_at is null and w.expires_at > clock_timestamp()
  for update;
  if not found then
    perform app.fail('VALIDATION', 'D-42', 'Cần xác nhận lại từ bước đầu.');
  end if;
  update private.withdraw_confirmations w set used_at = clock_timestamp() where w.token = v_conf.token;

  select pv.id into v_pv from app.policy_versions pv where pv.effective_at <= clock_timestamp()
  order by pv.effective_at desc, pv.created_at desc limit 1;

  insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, origin, policy_version_id)
  select v_child.household_id, p_child, c, 'RUT', v_member.id, 'RUT_TOAN_BO', v_pv from unnest(v_codes) as c;

  update app.device_bindings b
     set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'RUT_DONG_Y', epoch = b.epoch + 1
   where b.child_id = p_child and b.state in ('CHO_XAC_NHAN_MAY_CON', 'HIEU_LUC', 'CHO_XAC_MINH');

  update app.children set state = 'CHO_XOA', hidden_at = now(), hidden_reason = 'RUT_DONG_Y' where id = p_child;

  insert into app.deletion_requests (household_id, scope, child_id, requested_by, reason)
  values (v_child.household_id, 'HO_SO_CON', p_child, v_member.id, 'RUT_TOAN_BO')
  returning * into v_dr;

  delete from private.withdraw_confirmations w where w.child_id = p_child;

  return jsonb_build_object('ok', true, 'step', 2, 'replay', false, 'deletion_request_id', v_dr.id,
    'accepted_at', v_dr.accepted_at, 'state', v_dr.state, 'purposes_withdrawn', to_jsonb(v_codes), 'hard_deleted', false);
end $$;
-- ============================================================ outbox thông báo vòng đời (private, không nội dung)
create table private.lifecycle_notices (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  household_id uuid not null references app.households (id),
  kind         text not null check (kind in ('NHAC_QL', 'DONG_BANG', 'MO_LAI')),
  anchor_at    timestamptz not null,       -- NHAC_QL: lần dùng cuối của QL (một chu kỳ = một mốc); DONG_BANG: giờ đóng băng; MO_LAI: giờ mở lại
  sent_at      timestamptz,
  unique (household_id, kind, anchor_at)
);
alter table private.lifecycle_notices enable row level security;   -- phòng thủ chiều sâu, không chính sách
revoke all on private.lifecycle_notices from public, anon, authenticated;
grant all on private.lifecycle_notices to service_role;

-- ============================================================ app.job_runs (Tech Spec §2.6; chỉ service_role; không dữ liệu cá nhân)
create table app.job_runs (
  id      uuid primary key default gen_random_uuid(),
  run_at  timestamptz not null default clock_timestamp(),
  job     text not null check (job ~ '^[a-z-]{1,30}$'),
  status  text not null check (status in ('OK', 'LOI')),
  summary jsonb not null default '{}'::jsonb check (jsonb_typeof(summary) = 'object')   -- chỉ số đếm, mã lỗi
);
alter table app.job_runs enable row level security;   -- không chính sách: chỉ service_role
revoke all on app.job_runs from public, anon, authenticated;
grant all on app.job_runs to service_role;

-- ============================================================ audit: đóng băng, mở lại, chờ xóa (T2.5 cơ chế trigger)
insert into private.audit_events (event_code, allowed_meta_keys, note) values
  ('household.frozen',   '{}', 'T2.3: hộ đóng băng (job-daily, D-41); người thực hiện: hệ thống'),
  ('household.reopened', '{}', 'T2.3: QL mở lại hộ đóng băng (BR-FAM-057)'),
  ('household.closing',  '{}', 'T2.3/T2.4: hộ sang CHO_XOA (hết hạn hoặc rút khỏi thử nội bộ, xóa gia đình)');

create function app.tg_audit_household() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.state = 'DONG_BANG' and old.state = 'HOAT_DONG' then
    perform private.audit_write_auto(new.id, 'household.frozen', 'household:' || new.id);
  elsif new.state = 'HOAT_DONG' and old.state = 'DONG_BANG' then
    perform private.audit_write_auto(new.id, 'household.reopened', 'household:' || new.id);
  elsif new.state = 'CHO_XOA' and old.state <> 'CHO_XOA' then
    perform private.audit_write_auto(new.id, 'household.closing', 'household:' || new.id);
  end if;
  return null;
end $$;
create trigger households_audit after update of state on app.households
  for each row when (new.state is distinct from old.state) execute function app.tg_audit_household();
revoke all on function app.tg_audit_household() from public, anon, authenticated;

-- ============================================================ job: đóng băng hộ không dùng (job-daily bước 5)
-- p_now: giờ tham chiếu (mặc định giờ máy chủ); tham số để test và chạy bù có kiểm soát. Chỉ xét hộ HOAT_DONG chưa ẩn.
-- "Dùng app" = last_active_at của người lớn ĐANG THAM GIA (QL và NL); máy con, đồng bộ nền, job không tính (BR-FAM-050, AC-FAM-26).
create function private.job_freeze_idle(p_now timestamptz default clock_timestamp()) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_idle     interval := make_interval(days => private.param_int('freeze_idle_days'));
  r          record;
  v_frozen   int := 0;
  v_reminded int := 0;
  v_n        int;
begin
  for r in
    select h.id as household_id,
           max(coalesce(m.last_active_at, m.joined_at)) as last_any,
           max(coalesce(m.last_active_at, m.joined_at)) filter (where m.role = 'PRIMARY') as last_ql
    from app.households h
    join app.members m on m.household_id = h.id and m.status = 'DA_THAM_GIA'
    where h.state = 'HOAT_DONG' and h.frozen_at is null and h.hidden_at is null
    group by h.id
  loop
    if p_now - r.last_any >= v_idle then
      update app.households set state = 'DONG_BANG', frozen_at = p_now
       where id = r.household_id and state = 'HOAT_DONG' and frozen_at is null;
      insert into private.lifecycle_notices (household_id, kind, anchor_at) values (r.household_id, 'DONG_BANG', p_now)
        on conflict do nothing;
      v_frozen := v_frozen + 1;
    elsif r.last_ql is not null and p_now - r.last_ql >= v_idle then
      -- QL quá hạn nhưng người lớn khác còn dùng: không đóng băng, nhắc QL một lần mỗi chu kỳ (BR-FAM-052)
      insert into private.lifecycle_notices (household_id, kind, anchor_at) values (r.household_id, 'NHAC_QL', r.last_ql)
        on conflict do nothing;
      get diagnostics v_n = row_count;
      v_reminded := v_reminded + v_n;
    end if;
  end loop;
  return jsonb_build_object('frozen', v_frozen, 'ql_reminders', v_reminded);
end $$;

-- job-daily: điều phối các bước (T2.4 thay bản này để thêm bước hết hạn thử nội bộ).
create function private.job_daily(p_now timestamptz default clock_timestamp()) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_res jsonb;
begin
  v_res := jsonb_build_object('freeze', private.job_freeze_idle(p_now));
  insert into app.job_runs (job, status, summary) values ('job-daily', 'OK', v_res);
  return v_res;
end $$;
revoke all on function private.job_freeze_idle(timestamptz), private.job_daily(timestamptz) from public, anon, authenticated;
grant execute on function private.job_freeze_idle(timestamptz), private.job_daily(timestamptz) to service_role;

-- ============================================================ app.household_reopen (BR-FAM-057, 058; AC-FAM-23, 24)
-- Người gọi: người lớn đang tham gia. Chỉ QL mở lại được; NL nhận FORBIDDEN (không tự nâng quyền). Phải p_confirm = true.
-- Hộ không đóng băng: trả changed=false (gửi lặp, mất phản hồi). Hộ CHO_XOA (hết hạn thử, xóa gia đình): không mở lại được.
create function app.household_reopen(p_confirm boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_m   app.members;
  v_h   app.households;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'BR-FAM-057', 'Máy của con không mở lại được. Hãy nhờ bố mẹ mở ứng dụng.');
  end if;

  select * into v_m from app.members m where m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  if not found then perform app.fail('FORBIDDEN', 'BR-FAM-057', 'Bạn chưa thuộc gia đình nào.'); end if;
  if v_m.role is distinct from 'PRIMARY' then
    perform app.fail('FORBIDDEN', 'BR-FAM-057', 'Chỉ người quản lý chính mở lại được. Bạn có thể nhắc người quản lý chính.');
  end if;

  select * into v_h from app.households h where h.id = v_m.household_id and h.hidden_at is null for update;
  if not found then perform app.fail('NOT_FOUND'); end if;

  if v_h.state = 'HOAT_DONG' and v_h.frozen_at is null then
    return jsonb_build_object('ok', true, 'changed', false, 'state', v_h.state);
  end if;
  if v_h.state <> 'DONG_BANG' then
    perform app.fail('VALIDATION', 'BR-CON-086', 'Gia đình này không mở lại được.');
  end if;
  if p_confirm is distinct from true then
    perform app.fail('VALIDATION', 'BR-FAM-057', 'Cần xác nhận rõ ràng để mở lại.');
  end if;

  update app.households set state = 'HOAT_DONG', frozen_at = null where id = v_h.id;
  update app.members set last_active_at = now() where id = v_m.id;   -- mở lại là một thao tác có chủ đích (nếu không, job đóng băng lại ngay)
  insert into private.lifecycle_notices (household_id, kind, anchor_at) values (v_h.id, 'MO_LAI', clock_timestamp())
    on conflict do nothing;
  return jsonb_build_object('ok', true, 'changed', true, 'state', 'HOAT_DONG');
end $$;

-- ============================================================ app.deletion_request (Tech Spec #30; BR-FAM-080..089; BR-CON-050..053)
-- p_scope: 'HO_SO_CON' (QL, cần p_child), 'GIA_DINH' (QL), 'NGUOI_LON_ROI' (NL tự rời). Luôn cần p_confirm = true (xác nhận lần hai).
-- Idempotent: yêu cầu còn hiệu lực cùng đối tượng trả replay và giữ accepted_at ĐẦU (AC-CON-17). Không xóa hẳn: hard_deleted=false.
-- Hạn xóa hẳn `due_at` null (PR-CON-01 UNKNOWN) -> state CHO_QUYET_HAN, không tự xóa (AC-CON-18).
-- Hộ đóng băng: vẫn gửi được (D-64); hộ CHO_XOA thì FROZEN; replay thì luôn trả được.
-- Chưa làm (bảng chưa có): vô hiệu CR, dừng nhắc, hủy token đẩy, thông báo (T3+, Edge Function).
create function app.deletion_request(p_scope text, p_child uuid default null, p_confirm boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := (select auth.uid());
  v_m    app.members;
  v_h    app.households;
  v_c    app.children;
  v_dr   app.deletion_requests;
  v_bind int := 0;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'BR-FAM-086', 'Máy của con không gửi yêu cầu xóa.');
  end if;
  if p_scope is null or p_scope not in ('HO_SO_CON', 'NGUOI_LON_ROI', 'GIA_DINH') then
    perform app.fail('VALIDATION', 'BR-FAM-085', 'Phạm vi yêu cầu xóa không hợp lệ.');
  end if;

  select * into v_m from app.members m where m.user_id = v_uid;
  if not found or v_m.status = 'DA_GO' then perform app.fail('NOT_FOUND'); end if;   -- BR-CON-053: người không có quyền thì không có tác dụng
  select * into v_h from app.households h where h.id = v_m.household_id for update;

  if p_scope = 'NGUOI_LON_ROI' then
    select * into v_dr from app.deletion_requests dr
    where dr.scope = 'NGUOI_LON_ROI' and dr.requested_by = v_m.id and dr.state <> 'DA_HUY';
    if found then
      return jsonb_build_object('ok', true, 'replay', true, 'scope', p_scope, 'deletion_request_id', v_dr.id,
        'accepted_at', v_dr.accepted_at, 'state', v_dr.state, 'hard_deleted', false);
    end if;
    if v_m.status <> 'DA_THAM_GIA' then perform app.fail('NOT_FOUND'); end if;
    if v_m.role = 'PRIMARY' then
      perform app.fail('VALIDATION', 'BR-FAM-016', 'Người quản lý chính chưa rời được: hãy chuyển quyền hoặc xóa gia đình.');
    end if;
  else
    if v_m.role <> 'PRIMARY' or v_m.status <> 'DA_THAM_GIA' then
      perform app.fail('FORBIDDEN', 'BR-CON-053', 'Chỉ người quản lý chính gửi được yêu cầu này.');
    end if;
    if p_scope = 'HO_SO_CON' then
      if p_child is null then perform app.fail('VALIDATION', 'BR-FAM-080', 'Cần chọn hồ sơ con.'); end if;
      select * into v_c from app.children c where c.id = p_child and c.household_id = v_m.household_id for update;
      if not found then perform app.fail('NOT_FOUND'); end if;
      select * into v_dr from app.deletion_requests dr
      where dr.scope = 'HO_SO_CON' and dr.child_id = p_child and dr.state <> 'DA_HUY';
    else
      select * into v_dr from app.deletion_requests dr
      where dr.scope = 'GIA_DINH' and dr.household_id = v_h.id and dr.state <> 'DA_HUY';
    end if;
    if found then
      return jsonb_build_object('ok', true, 'replay', true, 'scope', p_scope, 'deletion_request_id', v_dr.id,
        'accepted_at', v_dr.accepted_at, 'state', v_dr.state, 'hard_deleted', false);
    end if;
  end if;

  if v_h.state not in ('HOAT_DONG', 'DONG_BANG') then
    perform app.fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa thay đổi được.');
  end if;
  if p_confirm is distinct from true then
    perform app.fail('VALIDATION', 'BR-FAM-080', 'Cần xác nhận lần hai để gửi yêu cầu xóa.');
  end if;

  if p_scope = 'HO_SO_CON' then
    update app.children set state = 'CHO_XOA', hidden_at = coalesce(hidden_at, now()), hidden_reason = coalesce(hidden_reason, 'XOA')
     where id = p_child;
    update app.device_bindings
       set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'XOA_HO_SO', epoch = epoch + 1
     where child_id = p_child and state in ('CHO_XAC_NHAN_MAY_CON', 'HIEU_LUC', 'CHO_XAC_MINH');
    insert into app.deletion_requests (household_id, scope, child_id, requested_by, reason)
    values (v_h.id, 'HO_SO_CON', p_child, v_m.id, 'XOA_HO_SO') returning * into v_dr;
  elsif p_scope = 'GIA_DINH' then
    if exists (select 1 from app.members m where m.household_id = v_h.id and m.status = 'DA_THAM_GIA' and m.id <> v_m.id) then
      perform app.fail('VALIDATION', 'BR-FAM-083', 'Còn người lớn khác trong gia đình: cần xử lý quyền của họ trước.');
    end if;
    update app.children set state = 'CHO_XOA', hidden_at = coalesce(hidden_at, now()), hidden_reason = coalesce(hidden_reason, 'XOA')
     where household_id = v_h.id;
    update app.device_bindings b
       set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'XOA_HO_SO', epoch = b.epoch + 1
      from app.children c
     where c.id = b.child_id and c.household_id = v_h.id and b.state in ('CHO_XAC_NHAN_MAY_CON', 'HIEU_LUC', 'CHO_XAC_MINH');
    update app.households set state = 'CHO_XOA', hidden_at = now(), hidden_reason = 'XOA_GIA_DINH' where id = v_h.id;
    insert into app.deletion_requests (household_id, scope, requested_by, reason)
    values (v_h.id, 'GIA_DINH', v_m.id, 'XOA_HO_SO') returning * into v_dr;
  else
    update app.grants set state = 'THU_HOI', revoked_at = now() where member_id = v_m.id and state <> 'THU_HOI';
    update app.members set status = 'DA_ROI', left_at = now() where id = v_m.id;
    insert into app.deletion_requests (household_id, scope, requested_by, reason)
    values (v_h.id, 'NGUOI_LON_ROI', v_m.id, 'XOA_HO_SO') returning * into v_dr;
  end if;

  return jsonb_build_object('ok', true, 'replay', false, 'scope', p_scope, 'deletion_request_id', v_dr.id,
    'accepted_at', v_dr.accepted_at, 'state', v_dr.state, 'hard_deleted', false);
end $$;

create unique index deletion_requests_one_open_per_household
  on app.deletion_requests (household_id) where scope = 'GIA_DINH' and state <> 'DA_HUY';
create unique index deletion_requests_one_open_per_leaver
  on app.deletion_requests (requested_by) where scope = 'NGUOI_LON_ROI' and state <> 'DA_HUY';

-- ============================================================ đăng ký cron (chỉ khi có pg_cron; cục bộ không có thì bỏ qua an toàn)
-- 00:05 giờ VN = 17:05 UTC (pg_cron mặc định UTC). Hàm gọi lại được: `select private.register_cron_jobs()` sau khi bật pg_cron.
create function private.register_cron_jobs() returns text
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    return 'SKIPPED_NO_PG_CRON';
  end if;
  execute $c$select cron.schedule('pp_job_daily', '5 17 * * *', 'select private.job_daily()')$c$;
  return 'OK';
end $$;
revoke all on function private.register_cron_jobs() from public, anon, authenticated;
grant execute on function private.register_cron_jobs() to service_role;
do $$ begin perform private.register_cron_jobs(); end $$;

-- ============================================================ đặc quyền
revoke all on function app.household_reopen(boolean), app.deletion_request(text, uuid, boolean) from public, anon, authenticated;
grant execute on function app.household_reopen(boolean), app.deletion_request(text, uuid, boolean) to authenticated;
