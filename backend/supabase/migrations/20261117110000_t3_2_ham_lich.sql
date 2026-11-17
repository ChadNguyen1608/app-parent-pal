-- T3.2 (Dev Plan 15.1; Tech Spec §3.1 #15-17, §3.2; Architecture §7; AC-04..08, 17, 24). Người soạn: AI, chưa kiểm chứng độc lập.
-- Hàm SQL cho profile-save, schedule-preview, schedule-commit. Edge Function gọi bằng JWT NGƯỜI DÙNG (xem functions/_shared/api.ts).
--   app.profile_save(p_child, p_patch, p_base_version)       lưu nháp hồ sơ + thẻ
--   app.schedule_inputs(p_profile, p_idempotency_key)        đọc dữ liệu MÁY CHỦ cho bộ xếp (preview/commit), kèm băm nội dung và rev
--   app.schedule_commit_apply(...)                           ghi phiên bản + trạng thái + audit + outbox trong MỘT giao dịch
-- Vì sao hàm ghi nhận kết quả đã xếp từ Edge Function mà vẫn "không tin client": mọi hàm app.* gọi được trực tiếp bằng PostgREST, nên
-- kết quả phải mang chữ ký HMAC-SHA256 của Edge Function (khóa `schedule_commit_key`, Vault ở CSDL, SCHEDULE_COMMIT_KEY ở Edge Function).
-- Chữ ký phủ: con, hồ sơ, rev, khóa idempotency, băm nội dung hồ sơ (SQL tính lại lúc commit, khóa hàng), băm đầu vào bộ xếp,
-- phiên bản bộ xếp/tham số, nhãn cân bằng và NGUYÊN VĂN output/đánh đổi/câu hỏi/câu trả lời (text, tránh lệch chuẩn hóa JSON).
-- Không có khóa thì không giả được; hồ sơ đổi giữa lúc xếp và lúc commit thì CONFLICT_REV.
-- Giới hạn: kiểm sàn cứng/ô đỏ do Edge Function (bộ xếp là TS); SQL chỉ kiểm cấu trúc output (đủ 7 ngày, kích thước). Quản trị viên
-- giữ khóa Vault ký được kết quả tùy ý (rủi ro vận hành đã biết, Architecture §6.3).
-- Thêm: bảng outbox app.notifications (tối thiểu theo Tech Spec §2.5; T3.5 mở rộng gửi FCM), sự kiện audit schedule.committed,
-- purge_household và purge_child (T2.4) xóa thêm các bảng lịch và outbox; app.child_alert_send (T2.8) ghi outbox `con_bao` (D-67).

-- ============================================================ outbox thông báo
create table app.notifications (
  id              uuid primary key default gen_random_uuid(),
  type            text not null check (type in ('lich_moi', 'con_bao')),
  recipient_kind  text not null check (recipient_kind in ('member', 'device')),
  recipient_id    uuid not null,          -- members.id hoặc device_bindings.id
  child_id        uuid not null references app.children (id),
  idempotency_key uuid not null unique,
  state           text not null default 'CHO_GUI' check (state in ('TAO', 'HOAN', 'CHO_GUI', 'DA_GUI', 'DA_MO', 'LOI', 'HUY')),
  payload_min     jsonb not null check (jsonb_typeof(payload_min) = 'object' and payload_min ?& array['id', 'type'] and payload_min - 'id' - 'type' = '{}'::jsonb),   -- chỉ {type,id}
  send_after      timestamptz not null default now(),
  attempts        int not null default 0,
  last_error_code text,
  created_at      timestamptz not null default now()
);
alter table app.notifications enable row level security;
-- Tech Spec §2.7: mỗi người chỉ thấy hàng của mình (người lớn theo members.id; máy con theo binding HIEU_LUC của mình).
create policy notifications_select on app.notifications for select to authenticated
  using ((recipient_kind = 'member' and (select app_internal.is_self_member(recipient_id)))
      or (recipient_kind = 'device' and exists (select 1 from app.device_bindings b
            where b.id = recipient_id and b.device_user_id = (select auth.uid()) and b.state = 'HIEU_LUC')));
revoke all on app.notifications from public, anon, authenticated;
grant select on app.notifications to authenticated;
grant all on app.notifications to service_role;

insert into private.audit_events (event_code, allowed_meta_keys, note) values
  ('schedule.committed', '{rev,profile_version}', 'T3.2: schedule_commit_apply ghi phiên bản lịch mới (Tech Spec §4.1)');

-- ============================================================ nội bộ: thẻ đang dùng, băm nội dung hồ sơ, chuỗi ký
create function private.live_cards(p_child uuid) returns setof app.activity_cards
language sql stable security definer set search_path = '' as $$
  select c.* from app.activity_cards c
  where c.child_id = p_child and c.state = 'ACTIVE' and c.hidden_at is null
    and app_internal.purpose_visible(p_child, 'MD-LICH', c.created_at)
$$;

create function private.profile_content_hash(p_profile uuid) returns text
language sql stable security definer set search_path = '' as $$
  select encode(extensions.digest(convert_to(
    p.id::text || '|' || p.version || '|' || p.input::text || '|' || coalesce(p.budget::text, 'null') || '|' || p.keep_confirmed::text || '|' ||
    coalesce((select string_agg(c.id::text || ':' || c.name || ':' || c.type || ':' || array_to_string(c.days, ',') || ':' || c.start_time::text || ':' ||
                                c.end_time::text || ':' || c.travel_before_min || ':' || c.travel_after_min, ';' order by c.id)
              from private.live_cards(p.child_id) c), ''), 'UTF8'), 'sha256'), 'hex')
  from app.schedule_profiles p where p.id = p_profile
$$;

-- Chuỗi được ký. PHẢI trùng commitMessage() trong functions/_shared/schedule-core.ts (vector kiểm chéo ở cả hai phía).
create function private.schedule_commit_message(
  p_child uuid, p_profile uuid, p_expected_rev int, p_key uuid, p_content_hash text, p_input_hash text, p_engine text, p_params text,
  p_balance text, p_output text, p_tradeoffs text, p_questions text, p_answers text) returns text
language sql immutable set search_path = '' as $$
  select concat_ws(E'\n', 'v1', p_child::text, p_profile::text, p_expected_rev::text, p_key::text, p_content_hash, p_input_hash,
                   p_engine, p_params, p_balance, p_output, p_tradeoffs, p_questions, p_answers)
$$;

create function private.schedule_commit_sign(p_message text) returns text
language sql stable security definer set search_path = '' as $$
  select encode(extensions.hmac(convert_to(p_message, 'UTF8'), convert_to(private.secret('schedule_commit_key'), 'UTF8'), 'sha256'), 'hex')
$$;
revoke all on function private.live_cards(uuid), private.profile_content_hash(uuid), private.schedule_commit_message(uuid, uuid, int, uuid, text, text, text, text, text, text, text, text, text),
  private.schedule_commit_sign(text) from public, anon, authenticated;

-- ============================================================ app.profile_save
create function app.profile_save(p_child uuid, p_patch jsonb, p_base_version int default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid    uuid := (select auth.uid());
  v_state  text;
  v_member uuid;
  v_k      text;
  v_d      app.schedule_profiles;
  v_a      app.schedule_profiles;
  v_h0     text;
  v_new    boolean := false;
  v_id     uuid;
  v_ver    int;
  v_input  jsonb;
  v_budget jsonb;
  v_keep   jsonb;
  v_card   jsonb;
  v_cid    uuid;
  v_ids    uuid[] := '{}';
  v_days   text[];
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  v_state := app.access_state(v_uid, 'child.update', p_child, 'MD-LICH');
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;
  select m.id into v_member from app.members m join app.children c on c.household_id = m.household_id
   where c.id = p_child and m.user_id = v_uid and m.status = 'DA_THAM_GIA' and m.role = 'PRIMARY';

  if p_patch is null or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then
    perform app.fail('VALIDATION', 'BR-001', 'Không có gì để lưu.');
  end if;
  for v_k in select jsonb_object_keys(p_patch) loop
    if v_k not in ('input', 'budget', 'keep_confirmed', 'cards') then perform app.fail('VALIDATION', 'BR-001', 'Trường không hỗ trợ: ' || v_k); end if;
  end loop;
  if p_patch ? 'input' then
    if jsonb_typeof(p_patch -> 'input') <> 'object' or length((p_patch -> 'input')::text) > 20000 then perform app.fail('VALIDATION', 'BR-001', 'input không hợp lệ.'); end if;
    select k into v_k from jsonb_object_keys(p_patch -> 'input') k where k not in ('school', 'commute', 'twoSessions', 'sleep', 'meals') limit 1;
    if v_k is not null then perform app.fail('VALIDATION', 'BR-001', 'Trường input không hỗ trợ: ' || v_k); end if;
  end if;
  if p_patch ? 'budget' and jsonb_typeof(p_patch -> 'budget') not in ('object', 'null') then perform app.fail('VALIDATION', 'BR-007', 'budget không hợp lệ.'); end if;
  if p_patch ? 'keep_confirmed' then
    if jsonb_typeof(p_patch -> 'keep_confirmed') <> 'object' then perform app.fail('VALIDATION', 'D6', 'keep_confirmed không hợp lệ.'); end if;
    if (p_patch -> 'keep_confirmed' -> 'wd') ? 'ngu' or (p_patch -> 'keep_confirmed' -> 'we') ? 'ngu' then
      perform app.fail('VALIDATION', 'D-02/C1', 'Ô Ngủ không có "Giữ mức này".');
    end if;
  end if;
  if p_patch ? 'cards' then
    if jsonb_typeof(p_patch -> 'cards') <> 'array' or jsonb_array_length(p_patch -> 'cards') > 20 then perform app.fail('VALIDATION', 'BR-008', 'cards không hợp lệ.'); end if;
    for v_card in select * from jsonb_array_elements(p_patch -> 'cards') loop
      if jsonb_typeof(v_card) <> 'object' then perform app.fail('VALIDATION', 'BR-008', 'Hoạt động không hợp lệ.'); end if;
      select k into v_k from jsonb_object_keys(v_card) k
       where k not in ('id', 'name', 'type', 'days', 'start', 'end', 'travel_before_min', 'travel_after_min', 'note') limit 1;
      if v_k is not null then perform app.fail('VALIDATION', 'Q-ARC-10', 'Trường hoạt động không hỗ trợ: ' || v_k); end if;
      if coalesce(v_card ->> 'note', '') <> '' then
        perform app.fail('FEATURE_OFF', 'BR-CON-094', 'Ghi chú tự do chưa dùng được vì chưa có bộ kiểm khẩn.');
      end if;
    end loop;
  end if;

  perform 1 from app.children c where c.id = p_child for update;    -- tuần tự hóa các lần lưu của một con

  -- Dữ liệu từ thời đã rút đồng ý (không còn hiện): nháp cũ bị lưu trữ, không dùng làm gốc (D-42).
  update app.schedule_profiles set state = 'ARCHIVED', hidden_at = now(), hidden_reason = 'RUT_DONG_Y', updated_at = now()
   where child_id = p_child and kind = 'CHUAN' and state = 'DRAFT' and hidden_at is null
     and not app_internal.purpose_visible(p_child, 'MD-LICH', created_at);

  select * into v_d from app.schedule_profiles where child_id = p_child and kind = 'CHUAN' and state = 'DRAFT' and hidden_at is null;
  select * into v_a from app.schedule_profiles where child_id = p_child and kind = 'CHUAN' and state = 'ACTIVE'
     and app_internal.purpose_visible(p_child, 'MD-LICH', created_at);

  if v_d.id is not null then
    if p_base_version is not null and p_base_version <> v_d.version then
      perform app.fail('CONFLICT_REV', 'AC-24', 'Bản nháp đã được lưu ở nơi khác, hãy tải lại.');
    end if;
    v_h0 := private.profile_content_hash(v_d.id);
    v_id := v_d.id; v_ver := v_d.version;
  else
    if p_base_version is not null and p_base_version is distinct from v_a.version then
      perform app.fail('CONFLICT_REV', 'AC-24', 'Hồ sơ đã được lưu ở nơi khác, hãy tải lại.');
    end if;
    select coalesce(max(version), 0) + 1 into v_ver from app.schedule_profiles where child_id = p_child and kind = 'CHUAN';
    insert into app.schedule_profiles (child_id, kind, version, input, budget, keep_confirmed, state, supersedes_id, created_by)
    values (p_child, 'CHUAN', v_ver, coalesce(v_a.input, '{}'::jsonb), v_a.budget, coalesce(v_a.keep_confirmed, '{}'::jsonb), 'DRAFT', v_a.id, v_member)
    returning id into v_id;
    v_new := true;
  end if;

  update app.schedule_profiles p set
    input = case when p_patch ? 'input' then p_patch -> 'input' else p.input end,
    budget = case when p_patch ? 'budget' then nullif(p_patch -> 'budget', 'null'::jsonb) else p.budget end,
    keep_confirmed = case when p_patch ? 'keep_confirmed' then p_patch -> 'keep_confirmed' else p.keep_confirmed end,
    updated_at = now()
  where p.id = v_id;

  if p_patch ? 'cards' then
    for v_card in select * from jsonb_array_elements(p_patch -> 'cards') loop
      begin
        select array_agg(d) into v_days from jsonb_array_elements_text(v_card -> 'days') d;
        v_cid := nullif(v_card ->> 'id', '')::uuid;
        if v_cid is not null then
          update app.activity_cards set name = btrim(v_card ->> 'name'), type = v_card ->> 'type', days = v_days,
                 start_time = (v_card ->> 'start')::time, end_time = (v_card ->> 'end')::time,
                 travel_before_min = coalesce((v_card ->> 'travel_before_min')::int, 0), travel_after_min = coalesce((v_card ->> 'travel_after_min')::int, 0),
                 updated_at = now()
           where id = v_cid and child_id = p_child and state = 'ACTIVE' and hidden_at is null;
          if not found then perform app.fail('NOT_FOUND', null, 'Không tìm thấy hoạt động.'); end if;
        else
          insert into app.activity_cards (child_id, name, type, days, start_time, end_time, travel_before_min, travel_after_min)
          values (p_child, btrim(v_card ->> 'name'), v_card ->> 'type', v_days, (v_card ->> 'start')::time, (v_card ->> 'end')::time,
                  coalesce((v_card ->> 'travel_before_min')::int, 0), coalesce((v_card ->> 'travel_after_min')::int, 0))
          returning id into v_cid;
        end if;
      exception when invalid_text_representation or datetime_field_overflow or invalid_datetime_format or check_violation or not_null_violation or numeric_value_out_of_range then
        perform app.fail('VALIDATION', 'BR-008', 'Hoạt động có giá trị không hợp lệ.');
      end;
      v_ids := v_ids || v_cid;
    end loop;
    update app.activity_cards set state = 'ARCHIVED', hidden_at = now(), hidden_reason = 'BO_KHOI_DANH_SACH', updated_at = now()
     where child_id = p_child and state = 'ACTIVE' and hidden_at is null and id <> all (v_ids)
       and app_internal.purpose_visible(p_child, 'MD-LICH', created_at);
  else
    select coalesce(array_agg(c.id order by c.id), '{}') into v_ids from private.live_cards(p_child) c;
  end if;

  return jsonb_build_object('ok', true, 'profile_id', v_id, 'version', v_ver, 'state', 'DRAFT',
    'content_hash', private.profile_content_hash(v_id),
    'changed', v_new or v_h0 is distinct from private.profile_content_hash(v_id), 'card_ids', to_jsonb(v_ids));
end $$;

-- ============================================================ app.schedule_inputs
create function app.schedule_inputs(p_profile uuid, p_idempotency_key uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_p     app.schedule_profiles;
  v_state text;
  v_v     app.schedule_versions;
  v_st    app.schedule_state;
  v_c     app.children;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  select * into v_p from app.schedule_profiles where id = p_profile and hidden_at is null;
  if not found then perform app.fail('NOT_FOUND', null, 'Không tìm thấy hồ sơ lịch.'); end if;
  v_state := app.access_state(v_uid, 'child.update', v_p.child_id, 'MD-LICH');
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, v_p.child_id); end if;
  if not app_internal.purpose_visible(v_p.child_id, 'MD-LICH', v_p.created_at) then perform app.fail('NOT_FOUND', null, 'Không tìm thấy hồ sơ lịch.'); end if;

  if p_idempotency_key is not null then
    select * into v_v from app.schedule_versions where child_id = v_p.child_id and idempotency_key = p_idempotency_key;
    if found then
      return jsonb_build_object('replay', jsonb_build_object('ok', true, 'version_id', v_v.id, 'rev', v_v.rev, 'label_status', v_v.label_status));
    end if;
  end if;
  if v_p.state not in ('DRAFT', 'ACTIVE') then perform app.fail('VALIDATION', 'BR-001', 'Hồ sơ này đã cũ, hãy dùng bản mới nhất.'); end if;

  select * into v_c from app.children where id = v_p.child_id;
  select * into v_st from app.schedule_state where child_id = v_p.child_id;
  return jsonb_build_object(
    'profile', jsonb_build_object('id', v_p.id, 'child_id', v_p.child_id, 'kind', v_p.kind, 'version', v_p.version, 'state', v_p.state,
                                  'input', v_p.input, 'budget', v_p.budget, 'keep_confirmed', v_p.keep_confirmed),
    'child', jsonb_build_object('grade', v_c.grade, 'age_years', v_c.age_years),
    'cards', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'type', c.type, 'days', to_jsonb(c.days),
                         'start_time', c.start_time::text, 'end_time', c.end_time::text,
                         'travel_before_min', c.travel_before_min, 'travel_after_min', c.travel_after_min) order by c.id)
                       from private.live_cards(v_p.child_id) c), '[]'::jsonb),
    'content_hash', private.profile_content_hash(v_p.id),
    'rev', coalesce(v_st.rev, 0), 'lock_state', coalesce(v_st.lock_state, 'UNLOCKED'));
end $$;

-- ============================================================ app.schedule_commit_apply
create function app.schedule_commit_apply(
  p_child uuid, p_profile uuid, p_expected_rev int, p_idempotency_key uuid, p_content_hash text, p_input_hash text,
  p_engine_version text, p_params_version text, p_balance_label text, p_output text, p_tradeoffs text, p_questions text,
  p_answers text, p_signature text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_state   text;
  v_p       app.schedule_profiles;
  v_member  uuid;
  v_hh      uuid;
  v_v       app.schedule_versions;
  v_st      app.schedule_state;
  v_rev     int;
  v_out     jsonb;
  v_trade   jsonb;
  v_quest   jsonb;
  v_ans     jsonb;
  v_a       jsonb;
  v_vid     uuid;
  v_day     text;
  v_today   date := private.today_vn();
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  select * into v_p from app.schedule_profiles where id = p_profile and hidden_at is null;
  if not found or v_p.child_id is distinct from p_child then perform app.fail('NOT_FOUND', null, 'Không tìm thấy hồ sơ lịch.'); end if;
  v_state := app.access_state(v_uid, 'child.update', p_child, 'MD-LICH');
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;
  select m.id, m.household_id into v_member, v_hh from app.members m join app.children c on c.household_id = m.household_id
   where c.id = p_child and m.user_id = v_uid and m.status = 'DA_THAM_GIA' and m.role = 'PRIMARY';

  perform 1 from app.children c where c.id = p_child for update;

  -- Gửi lại cùng khóa: trả kết quả cũ (AC-24), trước khi xét chữ ký/rev.
  select * into v_v from app.schedule_versions where child_id = p_child and idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('ok', true, 'version_id', v_v.id, 'rev', v_v.rev, 'label_status', v_v.label_status, 'replay', true);
  end if;

  -- Chữ ký của Edge Function (so sánh sau khi chuẩn hóa chữ thường). Không nói rõ phần nào sai.
  if p_signature is null or lower(p_signature) is distinct from private.schedule_commit_sign(private.schedule_commit_message(
       p_child, p_profile, p_expected_rev, p_idempotency_key, p_content_hash, p_input_hash, p_engine_version, p_params_version,
       p_balance_label, p_output, p_tradeoffs, p_questions, p_answers)) then
    perform app.fail('FORBIDDEN', 'AD-03', 'Kết quả xếp lịch không do máy chủ xếp lịch xác nhận.');
  end if;

  select * into v_st from app.schedule_state where child_id = p_child for update;
  if v_st.lock_state = 'LOCKED' then perform app.fail('LOCKED', 'B01C-OD-05', 'Lịch đang khóa, cần mở khóa trước.'); end if;
  if coalesce(v_st.rev, 0) <> p_expected_rev then perform app.fail('CONFLICT_REV', 'AC-24', 'Lịch đã được lưu ở nơi khác, hãy xem lại.'); end if;
  if v_p.state not in ('DRAFT', 'ACTIVE') then perform app.fail('VALIDATION', 'BR-001', 'Hồ sơ này đã cũ.'); end if;
  if not app_internal.purpose_visible(p_child, 'MD-LICH', v_p.created_at) then perform app.fail('NOT_FOUND', null, 'Không tìm thấy hồ sơ lịch.'); end if;
  if private.profile_content_hash(p_profile) is distinct from p_content_hash then
    perform app.fail('CONFLICT_REV', 'AC-24', 'Hồ sơ lịch đã đổi trong lúc xếp, hãy xem trước lại.');
  end if;

  -- Cấu trúc (không thay kiểm sàn cứng của Edge Function).
  if p_input_hash !~ '^[0-9a-f]{64}$' or length(p_output) > 400000 or length(p_tradeoffs) > 100000 or length(p_questions) > 100000 or length(p_answers) > 20000 then
    perform app.fail('VALIDATION', 'BR-001', 'Kết quả xếp lịch không hợp lệ.');
  end if;
  begin
    v_out := p_output::jsonb; v_trade := p_tradeoffs::jsonb; v_quest := p_questions::jsonb; v_ans := p_answers::jsonb;
  exception when others then
    perform app.fail('VALIDATION', 'BR-001', 'Kết quả xếp lịch không hợp lệ.');
  end;
  if jsonb_typeof(v_out) <> 'object' or jsonb_typeof(v_out -> 'ngay') is distinct from 'object' or not (v_out ? 'tong_quan')
     or jsonb_typeof(v_trade) <> 'array' or jsonb_typeof(v_quest) <> 'array' or jsonb_typeof(v_ans) <> 'array' or jsonb_array_length(v_ans) > 20 then
    perform app.fail('VALIDATION', 'BR-001', 'Kết quả xếp lịch không hợp lệ.');
  end if;
  foreach v_day in array array['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] loop
    if jsonb_typeof(v_out -> 'ngay' -> v_day) is distinct from 'array' then perform app.fail('VALIDATION', 'BR-001', 'Thiếu ngày ' || v_day || ' trong lịch.'); end if;
  end loop;

  v_rev := coalesce(v_st.rev, 0) + 1;
  begin
    insert into app.schedule_versions (child_id, profile_id, profile_version, rev, engine_version, params_version, input_hash, output, tradeoffs,
                                       questions, balance_label, committed_by_kind, committed_by, commit_reason, idempotency_key)
    values (p_child, p_profile, v_p.version, v_rev, p_engine_version, p_params_version, p_input_hash, v_out, v_trade, v_quest,
            p_balance_label, 'member', v_member, 'bo_me_luu_lich', p_idempotency_key)
    returning id into v_vid;
  exception when check_violation then
    perform app.fail('VALIDATION', 'BR-001', 'Kết quả xếp lịch không hợp lệ.');
  end;

  -- Hồ sơ nháp trở thành hiệu lực; bản hiệu lực cũ của con thành SUPERSEDED (chỉ một CHUAN ACTIVE).
  if v_p.state = 'DRAFT' then
    update app.schedule_profiles set state = 'SUPERSEDED', updated_at = now() where child_id = p_child and kind = 'CHUAN' and state = 'ACTIVE';
    update app.schedule_profiles set state = 'ACTIVE', updated_at = now() where id = p_profile;
  end if;

  insert into app.schedule_state (child_id, rev, effective_version_id, base_version_id, updated_at)
  values (p_child, v_rev, v_vid, v_vid, now())
  on conflict (child_id) do update set rev = excluded.rev, effective_version_id = excluded.effective_version_id,
    base_version_id = excluded.base_version_id, updated_at = excluded.updated_at;

  for v_a in select * from jsonb_array_elements(v_ans) loop
    begin
      insert into app.schedule_answers (child_id, question_key, local_date, answer, answered_by)
      values (p_child, v_a ->> 'question_key', v_today, v_a ->> 'answer', v_member)
      on conflict (child_id, question_key, local_date) do update set answer = excluded.answer, answered_by = excluded.answered_by, at = now();
    exception when check_violation or not_null_violation then
      perform app.fail('VALIDATION', 'A2', 'Câu trả lời không hợp lệ.');
    end;
  end loop;

  perform private.audit_write_auto(v_hh, 'schedule.committed', 'child:' || p_child,
    jsonb_build_object('rev', v_rev, 'profile_version', v_p.version));

  -- Outbox (cùng giao dịch): báo máy con đã ghép có lịch mới. Đồng bộ và nhắc nằm trong mục lõi MD-LICH (D-64), đã kiểm ở đầu hàm.
  -- Nội dung tối giản {type,id}.
  insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
  select 'lich_moi', 'device', b.id, p_child, md5(p_idempotency_key::text || b.id::text)::uuid,
         jsonb_build_object('type', 'lich_moi', 'id', v_vid)
  from app.device_bindings b where b.child_id = p_child and b.state = 'HIEU_LUC';

  return jsonb_build_object('ok', true, 'version_id', v_vid, 'rev', v_rev, 'label_status', 'chua_kiem_chung', 'replay', false);
end $$;

revoke all on function app.profile_save(uuid, jsonb, int), app.schedule_inputs(uuid, uuid), app.tg_schedule_profile_guard() from public, anon, authenticated;
revoke all on function app.schedule_commit_apply(uuid, uuid, int, uuid, text, text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function app.profile_save(uuid, jsonb, int), app.schedule_inputs(uuid, uuid) to authenticated;
grant execute on function app.schedule_commit_apply(uuid, uuid, int, uuid, text, text, text, text, text, text, text, text, text, text) to authenticated;

-- ============================================================ outbox cho nút báo bố mẹ (D-67; điểm gắn ghi ở T2.8 mục 8)
create or replace function app.child_alert_send(p_kind text, p_idempotency_key uuid default null, p_binding_epoch int default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_b     app.device_bindings;
  v_state text;
  v_old   app.child_alerts;
  v_new   app.child_alerts;
  v_max   int := private.param_int('child_alert_max_per_hour');
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if not app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'D-67', 'Chỉ máy của con gửi thông báo này.');
  end if;
  select b.* into v_b from app.device_bindings b where b.device_user_id = v_uid and b.state = 'HIEU_LUC';
  if not found then perform app.fail('NOT_FOUND'); end if;
  if p_binding_epoch is not null and p_binding_epoch <> v_b.epoch then
    perform app.fail('CONFLICT_REV', 'D-67', 'Máy này không còn là máy đã ghép.');
  end if;
  v_state := app.access_state(v_uid, 'child.view', v_b.child_id, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, v_b.child_id); end if;
  if p_kind is null or p_kind not in ('KHONG_KHOE', 'DON_SOM', 'GOI_BO_ME') then
    perform app.fail('VALIDATION', 'D-67', 'Chỉ chọn câu có sẵn.');
  end if;

  perform 1 from app.children c where c.id = v_b.child_id for update;   -- tuần tự hóa đếm tần suất
  if p_idempotency_key is not null then
    select * into v_old from app.child_alerts a where a.idempotency_key = p_idempotency_key;
    if found then
      if v_old.binding_id = v_b.id and v_old.kind = p_kind then
        return jsonb_build_object('ok', true, 'replay', true, 'id', v_old.id, 'kind', v_old.kind, 'created_at', v_old.created_at);
      end if;
      perform app.fail('VALIDATION', 'idempotency', 'Khóa gửi lại không hợp lệ.');
    end if;
  end if;
  if not app_internal.purpose_effective(v_b.child_id, 'MD-CONBAO') then
    perform app.fail('FORBIDDEN', 'D-67', 'Bố mẹ chưa bật tính năng này.');
  end if;
  if (select count(*) from app.child_alerts a where a.child_id = v_b.child_id and a.created_at > clock_timestamp() - interval '1 hour') >= v_max then
    perform app.fail('RATE_LIMITED', 'D-67', 'Đã báo nhiều lần, hãy chờ một lúc.');
  end if;

  insert into app.child_alerts (child_id, binding_id, kind, idempotency_key)
  values (v_b.child_id, v_b.id, p_kind, p_idempotency_key) returning * into v_new;

  -- Outbox (cùng giao dịch, T3.5 sẽ gửi): báo người lớn được xem MD-CONBAO (QL, NL có grant view). Nội dung tối giản {type,id}, KHÔNG có
  -- kind hay tên con trong hàng đợi; thông báo đẩy chỉ nói "có tin mới", chi tiết đọc trong app qua RLS của child_alerts.
  insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
  select 'con_bao', 'member', m.id, v_b.child_id, md5(v_new.id::text || m.id::text)::uuid, jsonb_build_object('type', 'con_bao', 'id', v_new.id)
  from app.members m
  where m.household_id = (select c.household_id from app.children c where c.id = v_b.child_id) and m.status = 'DA_THAM_GIA'
    and (m.role = 'PRIMARY' or exists (select 1 from app.grants g where g.member_id = m.id and g.child_id = v_b.child_id
                                       and g.state = 'ACTIVE' and g.action = 'view' and g.purpose_code = 'MD-CONBAO'));
  return jsonb_build_object('ok', true, 'replay', false, 'id', v_new.id, 'kind', v_new.kind, 'created_at', v_new.created_at);
end $$;

-- ============================================================ purge_household, purge_child: thêm outbox và các bảng lịch
-- (chép nguyên từ migration T2.4, thêm 6 lệnh xóa mỗi hàm: notifications, schedule_answers, schedule_state, schedule_versions, activity_cards, schedule_profiles)
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

create or replace function app.purge_child(p_child uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_c      app.children;
  v_h      app.households;
  v_slot   app.trial_slots;
  v_hash   text;
  v_counts jsonb := '{}'::jsonb;
  v_n      int;
  v_users  uuid[];
  v_del    uuid[];
  v_drop   boolean := private.param_int('purge_delete_auth_users') = 1;
  v_sub    text := 'child:' || p_child::text;
  v_res    jsonb;
begin
  perform private.require_system();
  if p_child is null or p_reason is null or p_reason not in ('RUT_SOM', 'GIA_LAP_DIEN_TAP', 'OWNER') then
    perform app.fail('VALIDATION', 'D-64', 'Con hoặc lý do xóa không hợp lệ.');
  end if;
  v_hash := encode(extensions.digest(convert_to(p_child::text, 'UTF8'), 'sha256'), 'hex');

  select * into v_c from app.children c where c.id = p_child for update;
  if not found then
    if exists (select 1 from app.deletion_evidence e where e.household_ref_hash = v_hash) then
      return jsonb_build_object('ok', true, 'replay', true, 'scope', 'CON');
    end if;
    perform app.fail('NOT_FOUND');
  end if;
  select * into v_h from app.households h where h.id = v_c.household_id for update;

  if v_h.data_class not in ('GIA_LAP', 'THU_NOI_BO_D01') then
    perform app.fail('BLOCKED_H4', 'BR-CON-056', 'Dữ liệu thật chưa được xóa hẳn khi cổng pháp lý H4 còn mở.');
  end if;
  if v_h.data_class = 'THU_NOI_BO_D01' then
    select * into v_slot from app.trial_slots s where s.id = v_h.trial_slot_id for update;
    if not found or v_slot.state not in ('DANG_THU', 'HET_THU', 'RUT_SOM') then
      perform app.fail('VALIDATION', 'D-44', 'Vị trí thử không còn trong vòng thử.');
    end if;
    if p_reason not in ('RUT_SOM', 'OWNER') then
      perform app.fail('VALIDATION', 'D-44', 'Lý do xóa không khớp loại dữ liệu.');
    end if;
    if v_c.state <> 'CHO_XOA' then
      perform app.fail('VALIDATION', 'D-64', 'Con này chưa rút đồng ý hoặc chưa yêu cầu xóa.');
    end if;
  elsif p_reason not in ('GIA_LAP_DIEN_TAP', 'OWNER') then
    perform app.fail('VALIDATION', 'D-44', 'Lý do xóa không khớp loại dữ liệu.');
  end if;

  -- con cuối cùng: xóa cả hộ
  if not exists (select 1 from app.children c where c.household_id = v_h.id and c.id <> p_child and c.hidden_at is null) then
    v_res := app.purge_household(v_h.id, p_reason);
    -- dấu vết theo con (để gửi lặp purge_child cho con này trả replay, không NOT_FOUND); số dòng nằm ở bằng chứng của hộ
    insert into app.deletion_evidence (scope, household_ref_hash, reason, data_class, trial_slot_id, row_counts)
    values ('CON', v_hash, p_reason, v_h.data_class, v_h.trial_slot_id, '{}'::jsonb)
    on conflict (household_ref_hash) do nothing;
    return v_res || jsonb_build_object('scope', 'HO');
  end if;

  -- máy con ẩn danh của con này (giữ lại nếu còn gắn với con khác hoặc là thành viên)
  select coalesce(array_agg(distinct b.device_user_id), '{}') into v_users from app.device_bindings b where b.child_id = p_child;
  select coalesce(array_agg(u), '{}') into v_del from unnest(v_users) u
   where not exists (select 1 from app.members m where m.user_id = u)
     and not exists (select 1 from app.device_bindings b where b.device_user_id = u and b.child_id <> p_child);

  insert into private.purge_context (txid, household_id) values (txid_current(), v_h.id) on conflict (txid) do nothing;

  delete from private.pair_throttle t where t.scope = 'USER' and t.key = any (v_del);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.pair_throttle', v_n);
  delete from private.withdraw_confirmations t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.withdraw_confirmations', v_n);
  delete from private.checkin_responses t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.checkin_responses', v_n);
  delete from private.child_settings t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.child_settings', v_n);
  delete from app.child_health_notes t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.child_health_notes', v_n);
  delete from app.child_alerts t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.child_alerts', v_n);
  delete from app.notifications t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.notifications', v_n);
  delete from app.schedule_answers t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_answers', v_n);
  delete from app.schedule_state t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_state', v_n);
  delete from app.schedule_versions t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_versions', v_n);
  delete from app.activity_cards t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.activity_cards', v_n);
  delete from app.schedule_profiles t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.schedule_profiles', v_n);
  delete from private.pairing_codes t where t.device_user_id = any (v_del);
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('private.pairing_codes', v_n);
  delete from app.purpose_state t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.purpose_state', v_n);
  delete from app.consent_events t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.consent_events', v_n);
  delete from app.deletion_requests t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.deletion_requests', v_n);
  delete from app.audit_log t where t.household_id = v_h.id and t.subject_ref = v_sub;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.audit_log', v_n);
  delete from app.mode_history t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.mode_history', v_n);
  delete from app.grants t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.grants', v_n);
  delete from app.device_bindings t where t.child_id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.device_bindings', v_n);
  delete from app.children t where t.id = p_child;
  get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('app.children', v_n);

  if v_drop then
    delete from auth.users t where t.id = any (v_del);
    get diagnostics v_n = row_count; v_counts := v_counts || jsonb_build_object('auth.users', v_n);
  end if;

  insert into app.deletion_evidence (scope, household_ref_hash, reason, data_class, trial_slot_id, row_counts)
  values ('CON', v_hash, p_reason, v_h.data_class, v_h.trial_slot_id, v_counts);
  delete from private.purge_context where txid = txid_current();

  return jsonb_build_object('ok', true, 'replay', false, 'scope', 'CON', 'row_counts', v_counts,
    'auth_users_deleted', case when v_drop then coalesce(cardinality(v_del), 0) else 0 end,
    'auth_user_ids', to_jsonb(case when v_drop then '{}'::uuid[] else v_del end));
end $$;

-- Quyền thực thi của purge_household, purge_child, child_alert_send giữ nguyên như migration gốc (create or replace không đổi ACL).
