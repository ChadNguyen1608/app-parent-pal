-- D-76 (28/11/2026): thỏa thuận người dùng khi đăng ký. Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Quyết định: ngay sau đăng nhập lần đầu, phụ huynh phải bấm "Đồng ý" bản Điều khoản sử dụng (kèm tuyên bố quyền lưu dữ liệu, PA-32)
-- rồi mới tạo gia đình. Máy chủ ghi AI đồng ý, PHIÊN BẢN nào, LÚC nào. Điều khoản đổi phiên bản thì hỏi lại một lần.
--
-- Thiết kế:
--   * private.terms_version: bảng một dòng giữ phiên bản điều khoản HIỆN HÀNH (text). Giá trị đầu '2026-11-28-nhap', CHUA_CHOT
--     (chủ sản phẩm chốt nội dung và mã phiên bản sau; đổi phiên bản = sửa dòng này bằng quản trị, cả app lẫn máy chủ đọc từ đây).
--   * app.terms_acceptances: CHỈ-THÊM (trigger chặn sửa, xóa, truncate; riêng purge_household được xóa, như audit_log). Khóa theo user_id
--     (lúc đồng ý chưa có hộ nên chưa có members). KHÔNG khóa ngoại tới auth.users (xóa auth.users không bị chặn bởi bảng chỉ-thêm;
--     purge_household xóa dòng của người dùng bị xóa). Duy nhất (user_id, terms_version) nên đồng ý lặp là idempotent.
--     Người dùng không đọc trực tiếp (đọc trạng thái qua app.terms_status); ghi chỉ qua app.terms_accept.
--   * app.terms_status() -> {current_version, accepted}; app.terms_accept(p_version) -> {version, accepted, replay}. Chỉ người lớn đăng nhập,
--     máy con ẩn danh bị FORBIDDEN. p_version phải đúng bản hiện hành (bản cũ hoặc lạ: VALIDATION D-76.version, app tải lại điều khoản).
--   * family_create: chưa đồng ý bản hiện hành -> TERMS_REQUIRED, HTTP 428 (Precondition Required; không dùng 403 vì 403 đã là FORBIDDEN/quyền).
--     Thứ tự kiểm: chưa đăng nhập, máy con, đã thuộc hộ (trả hộ cũ, không chặn), RỒI mới kiểm điều khoản.
--     Người đã có hộ trước D-76 không bị chặn ở máy chủ; app hỏi họ đồng ý qua terms_status như mọi người.
--   * Audit 'terms.accepted' (chỉ khóa meta `version`): audit_log bắt buộc có household_id nên: (a) người đã có hộ: ghi ngay trong terms_accept
--     (chỉ khi dòng mới, không ghi lặp); (b) người chưa có hộ: ghi trong family_create ngay khi hộ được tạo (lúc đó mới có hộ), cho bản đang hiệu lực.
--     Dòng gốc "ai, bản nào, lúc nào" luôn nằm ở app.terms_acceptances.
--   * purge_household xóa dòng terms_acceptances của người dùng bị xóa (v_del), kể cả khi không xóa auth.users (lần đăng nhập sau sẽ hỏi lại).
-- QUYẾT ĐỊNH MẶC ĐỊNH (CHỜ CHỦ SẢN PHẨM DUYỆT): mã HTTP 428 cho TERMS_REQUIRED; không có đường "thu hồi đồng ý điều khoản" (rút dữ liệu đã có ở BR-CON).

-- ============================================================ mã lỗi: thêm TERMS_REQUIRED (HTTP 428)
create or replace function app.fail(p_code text, p_rule text default null, p_message_vi text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_state text;
begin
  v_state := case p_code
    when 'UNAUTHENTICATED'   then 'PT401'
    when 'PLAN_REQUIRED'     then 'PT402'
    when 'DEVICE_KEY_LIMIT'  then 'PT402'
    when 'FORBIDDEN'         then 'PT403'
    when 'FEATURE_OFF'       then 'PT403'
    when 'BLOCKED_H4'        then 'PT403'
    when 'NOT_FOUND'         then 'PT404'
    when 'VALIDATION'        then 'PT422'
    when 'FROZEN'            then 'PT423'
    when 'TERMS_REQUIRED'    then 'PT428'
    when 'CONFLICT_REV'      then 'PT409'
    when 'LOCKED'            then 'PT409'
    when 'TRIAL_USED'        then 'PT409'
    when 'RATE_LIMITED'      then 'PT429'
    else 'PT500'
  end;
  raise exception using errcode = v_state, message = p_code, detail = coalesce(p_rule, ''), hint = coalesce(p_message_vi, '');
end $$;

-- ============================================================ phiên bản điều khoản hiện hành (private, một dòng)
create table private.terms_version (
  id      boolean primary key default true check (id),
  version text not null check (version ~ '^[A-Za-z0-9_.:-]{1,40}$' and version !~ '^[0-9]{4,}$'),
  status  text not null default 'CHUA_CHOT' check (status in ('CHUA_CHOT', 'DA_CHOT')),
  note    text not null
);
alter table private.terms_version enable row level security;     -- phòng thủ chiều sâu, không chính sách
revoke all on private.terms_version from public, anon, authenticated;
grant all on private.terms_version to service_role;
insert into private.terms_version (version, status, note) values
  ('2026-11-28-nhap', 'CHUA_CHOT', 'D-76: bản nháp, chờ chủ sản phẩm chốt nội dung và mã phiên bản. Đổi phiên bản thì người dùng được hỏi đồng ý lại một lần.');

create function private.terms_current_version() returns text
language sql stable security definer set search_path = '' as $$
  select t.version from private.terms_version t where t.id
$$;
revoke all on function private.terms_current_version() from public, anon, authenticated;

-- ============================================================ app.terms_acceptances (chỉ-thêm)
create table app.terms_acceptances (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  terms_version text not null check (terms_version ~ '^[A-Za-z0-9_.:-]{1,40}$'),
  accepted_at   timestamptz not null default clock_timestamp(),
  unique (user_id, terms_version)
);
alter table app.terms_acceptances enable row level security;     -- không chính sách: đọc qua app.terms_status()
revoke all on app.terms_acceptances from public, anon, authenticated;
grant all on app.terms_acceptances to service_role;
create trigger terms_acceptances_append_only before update or delete on app.terms_acceptances
  for each row execute function app.tg_append_only();
create trigger terms_acceptances_no_truncate before truncate on app.terms_acceptances
  for each statement execute function app.tg_append_only();

-- purge_household được xóa bảng này (như audit_log, mode_history, consent_events, schedule_versions).
create or replace function app.tg_append_only() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' and tg_table_schema = 'app'
     and tg_table_name in ('audit_log', 'mode_history', 'consent_events', 'schedule_versions', 'terms_acceptances')
     and exists (select 1 from private.purge_context c where c.txid = txid_current()) then
    return old;
  end if;
  raise exception 'append-only table: % not allowed', tg_op using errcode = '55000';
end $$;

-- ============================================================ audit
insert into private.audit_events (event_code, allowed_meta_keys, note) values
  ('terms.accepted', '{version}', 'D-76: người lớn đồng ý Điều khoản sử dụng (terms_accept, hoặc family_create cho lần đồng ý trước khi có hộ); chỉ ghi mã phiên bản');

-- ============================================================ app.terms_status
create function app.terms_status() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_cur text := private.terms_current_version();
begin
  if v_uid is null or not exists (select 1 from auth.users u where u.id = v_uid) then
    perform app.fail('UNAUTHENTICATED');
  end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'D-76', 'Máy của con không có thỏa thuận điều khoản.');
  end if;
  return jsonb_build_object('current_version', v_cur,
    'accepted', exists (select 1 from app.terms_acceptances t where t.user_id = v_uid and t.terms_version = v_cur));
end $$;

-- ============================================================ app.terms_accept
create function app.terms_accept(p_version text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_cur text := private.terms_current_version();
  v_id  uuid;
  v_hh  uuid;
begin
  if v_uid is null or not exists (select 1 from auth.users u where u.id = v_uid) then
    perform app.fail('UNAUTHENTICATED');
  end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'D-76', 'Máy của con không đồng ý điều khoản.');
  end if;
  if p_version is distinct from v_cur then
    perform app.fail('VALIDATION', 'D-76.version', 'Điều khoản đã đổi, hãy mở lại và đọc bản mới.');
  end if;

  insert into app.terms_acceptances (user_id, terms_version) values (v_uid, v_cur)
  on conflict (user_id, terms_version) do nothing
  returning id into v_id;
  if v_id is null then
    return jsonb_build_object('version', v_cur, 'accepted', true, 'replay', true);
  end if;

  select m.household_id into v_hh from app.members m where m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  if v_hh is not null then
    perform private.audit_write_auto(v_hh, 'terms.accepted', null, jsonb_build_object('version', v_cur));
  end if;
  return jsonb_build_object('version', v_cur, 'accepted', true, 'replay', false);
end $$;

-- ============================================================ app.family_create (thêm kiểm điều khoản)
create or replace function app.family_create(p_call_name text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := (select auth.uid());
  v_name text := btrim(p_call_name);
  v_m    app.members;
  v_hh   uuid;
  v_mid  uuid;
begin
  if v_uid is null or not exists (select 1 from auth.users u where u.id = v_uid) then
    perform app.fail('UNAUTHENTICATED');
  end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'FR-01', 'Máy của con không tạo được gia đình.');
  end if;

  select * into v_m from app.members m where m.user_id = v_uid;
  if found then
    if v_m.role = 'PRIMARY' and v_m.status = 'DA_THAM_GIA' then
      return jsonb_build_object('household_id', v_m.household_id, 'member_id', v_m.id, 'role', v_m.role,
                                'call_name', v_m.call_name, 'replay', true);
    end if;
    perform app.fail('VALIDATION', 'BR-FAM-001', 'Tài khoản này đã thuộc một gia đình.');
  end if;

  -- D-76: chưa đồng ý bản điều khoản hiện hành thì không tạo hộ (hộ cũ và gọi lặp đã trả ở trên, không bị chặn).
  if not exists (select 1 from app.terms_acceptances t where t.user_id = v_uid and t.terms_version = private.terms_current_version()) then
    perform app.fail('TERMS_REQUIRED', 'D-76', 'Bạn cần đồng ý Điều khoản sử dụng trước khi tạo gia đình.');
  end if;

  if v_name is null or v_name = '' then
    perform app.fail('VALIDATION', 'BR-FAM-001', 'Cần tên gọi của bạn.');
  end if;
  if char_length(v_name) > 40 then
    perform app.fail('VALIDATION', 'BR-FAM-001', 'Tên gọi tối đa 40 ký tự.');
  end if;

  begin
    insert into app.households default values returning id into v_hh;
    insert into app.members (household_id, user_id, role, call_name, last_active_at)
    values (v_hh, v_uid, 'PRIMARY', v_name, now())     -- tạo tài khoản tính là một lần dùng (BR-FAM-050)
    returning id into v_mid;
  exception when unique_violation then
    -- hai yêu cầu đồng thời cùng một người: giao dịch phụ bị hủy, không để lại hộ mồ côi
    perform app.fail('VALIDATION', 'BR-FAM-001', 'Tài khoản này đã thuộc một gia đình.');
  end;

  -- D-76: audit cho lần đồng ý đang hiệu lực (lúc đồng ý chưa có hộ nên chưa ghi được; chỉ ghi mã phiên bản).
  perform private.audit_write_auto(v_hh, 'terms.accepted', null, jsonb_build_object('version', private.terms_current_version()));

  return jsonb_build_object('household_id', v_hh, 'member_id', v_mid, 'role', 'PRIMARY',
                            'call_name', v_name, 'replay', false);
end $$;

-- ============================================================ app.purge_household (thêm xóa terms_acceptances)
create or replace function app.purge_household(p_household uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_h      app.households;
  v_slot   app.trial_slots;
  v_hash   text;
  v_counts jsonb := '{}'::jsonb;
  v_n      int;
  v_users  uuid[];
  v_keep   uuid[];
  v_del    uuid[];
  v_drop   boolean := private.param_int('purge_delete_auth_users') = 1;
begin
  perform private.require_system();
  if p_household is null or p_reason is null or p_reason not in ('HET_THU', 'RUT_SOM', 'GIA_LAP_DIEN_TAP', 'OWNER') then
    perform app.fail('VALIDATION', 'D-44', 'Hộ hoặc lý do xóa không hợp lệ.');
  end if;
  v_hash := encode(extensions.digest(convert_to(p_household::text, 'UTF8'), 'sha256'), 'hex');

  select * into v_h from app.households h where h.id = p_household for update;
  if not found then
    if exists (select 1 from app.deletion_evidence e where e.household_ref_hash = v_hash) then
      return jsonb_build_object('ok', true, 'replay', true);
    end if;
    perform app.fail('NOT_FOUND');
  end if;

  if v_h.data_class not in ('GIA_LAP', 'THU_NOI_BO_D01') then
    perform app.fail('BLOCKED_H4', 'BR-CON-056', 'Dữ liệu thật chưa được xóa hẳn khi cổng pháp lý H4 còn mở.');
  end if;
  if v_h.data_class = 'THU_NOI_BO_D01' then
    select * into v_slot from app.trial_slots s where s.id = v_h.trial_slot_id for update;
    if not found or v_slot.state not in ('HET_THU', 'RUT_SOM') then
      perform app.fail('VALIDATION', 'D-44', 'Vị trí thử còn đang mở: hãy kết thúc trước khi xóa.');
    end if;
  elsif p_reason not in ('GIA_LAP_DIEN_TAP', 'OWNER') then
    perform app.fail('VALIDATION', 'D-44', 'Lý do xóa không khớp loại dữ liệu.');
  end if;

  -- người dùng đăng nhập thuộc hộ: người lớn, và máy con ẩn danh (giữ lại nếu còn gắn với hộ khác)
  select coalesce(array_agg(distinct u), '{}') into v_users from (
    select m.user_id as u from app.members m where m.household_id = p_household
    union
    select b.device_user_id from app.device_bindings b join app.children c on c.id = b.child_id where c.household_id = p_household
  ) s;
  select coalesce(array_agg(u), '{}') into v_keep from unnest(v_users) u
   where exists (select 1 from app.members m where m.user_id = u and m.household_id <> p_household)
      or exists (select 1 from app.device_bindings b join app.children c on c.id = b.child_id
                  where b.device_user_id = u and c.household_id <> p_household);
  select coalesce(array_agg(u), '{}') into v_del from unnest(v_users) u where not (u = any (v_keep));

  insert into private.purge_context (txid, household_id) values (txid_current(), p_household) on conflict (txid) do nothing;

  delete from private.pair_throttle t where (t.scope = 'HOUSEHOLD' and t.key = p_household) or (t.scope = 'USER' and t.key = any (v_del));
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.pair_throttle', v_n);
  delete from private.withdraw_confirmations t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.withdraw_confirmations', v_n);
  delete from private.checkin_responses t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.checkin_responses', v_n);
  delete from private.child_settings t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.child_settings', v_n);
  delete from app.child_health_notes t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.child_health_notes', v_n);
  delete from app.child_alerts t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.child_alerts', v_n);
  delete from app.notifications t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.notifications', v_n);
  delete from app.schedule_answers t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_answers', v_n);
  delete from app.schedule_state t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_state', v_n);
  delete from app.schedule_versions t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_versions', v_n);
  delete from app.activity_cards t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.activity_cards', v_n);
  delete from app.schedule_profiles t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_profiles', v_n);
  delete from private.parent_pins t where t.member_id in (select m.id from app.members m where m.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.parent_pins', v_n);
  delete from private.pairing_codes t where t.device_user_id = any (v_del);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.pairing_codes', v_n);
  delete from private.lifecycle_notices t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.lifecycle_notices', v_n);
  delete from app.purpose_state t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.purpose_state', v_n);
  delete from app.consent_events t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.consent_events', v_n);
  delete from app.deletion_requests t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.deletion_requests', v_n);
  delete from app.audit_log t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.audit_log', v_n);
  delete from app.mode_history t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.mode_history', v_n);
  delete from app.grants t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.grants', v_n);
  delete from app.invitations t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.invitations', v_n);
  delete from app.device_bindings t where t.child_id in (select c.id from app.children c where c.household_id = p_household);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.device_bindings', v_n);
  delete from app.children t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.children', v_n);
  delete from app.members t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.members', v_n);
  delete from app.terms_acceptances t where t.user_id = any (v_del);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.terms_acceptances', v_n);
  delete from app.household_plans t where t.household_id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.household_plans', v_n);
  delete from app.households t where t.id = p_household;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.households', v_n);

  if v_drop then
    delete from auth.users t where t.id = any (v_del);
    get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('auth.users', v_n);
  end if;

  insert into app.deletion_evidence (household_ref_hash, reason, data_class, trial_slot_id, row_counts)
  values (v_hash, p_reason, v_h.data_class, v_h.trial_slot_id, v_counts);
  if v_slot.id is not null then
    update app.trial_slots set state = 'XOA_XONG', purged_at = clock_timestamp() where id = v_slot.id;
  end if;
  delete from private.purge_context where txid = txid_current();

  return jsonb_build_object('ok', true, 'replay', false, 'row_counts', v_counts,
    'auth_users_deleted', case when v_drop then coalesce(cardinality(v_del), 0) else 0 end,
    'auth_user_ids', to_jsonb(case when v_drop then '{}'::uuid[] else v_del end));
end $$;

-- ============================================================ Đặc quyền
revoke all on function app.terms_status(), app.terms_accept(text) from public, anon, authenticated;
grant execute on function app.terms_status(), app.terms_accept(text) to authenticated;
