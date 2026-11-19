-- D-68 (19/11/2026): gói dịch vụ ba mức FREE / TRIAL / PREMIUM ở cấp gia đình; D-71: giai đoạn test lưu ghi chú hoạt động.
-- Người soạn: AI, chưa kiểm chứng độc lập. KHÔNG có thanh toán thật: gói do chủ sản phẩm đặt bằng service_role (app.plan_set).
--
-- Quy tắc (D-68):
--   FREE    chưa tạo được kế hoạch: profile_save và schedule_commit_apply -> PLAN_REQUIRED (HTTP 402). Không ghép, không đồng bộ máy con.
--   TRIAL   tạo mới đúng `trial_plans_max` (1) kế hoạch; sau lần tạo đầu, tối đa `trial_edits_max` (3) lần commit phiên bản MỚI. Không ghép máy.
--   PREMIUM không giới hạn. Ghép máy con (pair_confirm, pair_accept) và đồng bộ lịch sang máy con (outbox `lich_moi`) CHỈ PREMIUM.
--
-- QUYẾT ĐỊNH MẶC ĐỊNH (tài liệu thiếu hoặc mơ hồ; CHỜ CHỦ SẢN PHẨM DUYỆT):
--  1. Đếm theo HỘ, không theo con: "1 kế hoạch" là của gia đình. Hộ nhiều con thì 1 kế hoạch dùng thử = 1 kế hoạch cho 1 con (con đầu tiên được commit);
--     con khác bị chặn ở bước tạo. `plans_used` = số con của hộ đã có ít nhất một phiên bản lịch; `edits_used` = tổng phiên bản - số con có lịch.
--     Đếm CẢ con đã ẩn (xóa hồ sơ con không "trả lại" suất tạo) và cả phiên bản tạo thời PREMIUM (hạ từ PREMIUM xuống TRIAL thì tính hết).
--  2. profile_save (lưu nháp) cũng bị chặn khi commit chắc chắn bị chặn: FREE; TRIAL mà con này chưa có kế hoạch và hộ đã dùng hết suất tạo;
--     TRIAL mà con có kế hoạch và đã hết lượt chỉnh sửa. Lý do: không để phụ huynh nhập dở rồi mới bị chặn lúc lưu.
--  3. schedule_commit_apply: gửi lại cùng khóa idempotency vẫn trả kết quả cũ kể cả khi gói đã đổi (replay chạy trước kiểm gói).
--  4. TRIAL có `trial_ends_at` đã qua: coi như FREE (chỉ tính khi đọc; không sửa dòng). `trial_ends_at` null = không hạn.
--  5. pair_code_create KHÔNG chặn theo gói: máy con tạo mã khi chưa thuộc hộ nào nên không biết gói của ai. Chặn ở pair_confirm (người lớn nhập mã)
--     và pair_accept (máy con đồng ý; hộ hạ gói giữa chừng thì không ghép nốt). pair_accept gọi lại khi đã HIEU_LUC vẫn trả replay.
--  6. Máy đã ghép mà hộ hạ xuống khác PREMIUM: giữ nguyên liên kết (không tự hủy), nhưng KHÔNG nhận lịch mới (không ghi outbox `lich_moi`),
--     giống đóng băng. Hàm đồng bộ máy con sau này (T3.6 device-sync) PHẢI kiểm `private.plan_tier(hộ) = 'PREMIUM'` trước khi trả lịch.
--  7. `pal_questions_left` của app.my_plan trả null (chưa có bộ đếm; agent Pal làm phần đếm).
--  8. Ghi chú hoạt động (D-71): giới hạn 500 ký tự, lưu nguyên văn, KHÔNG qua bộ kiểm khẩn (BR-CON-094). Lọc trước khi phát hành.
--
-- Chưa có thanh toán, nên không có đường để phụ huynh tự đổi gói; `household_plans` không cho người dùng đọc trực tiếp (đọc qua app.my_plan).

-- ============================================================ mã lỗi: thêm PLAN_REQUIRED (402)
create or replace function app.fail(p_code text, p_rule text default null, p_message_vi text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_state text;
begin
  v_state := case p_code
    when 'UNAUTHENTICATED' then 'PT401'
    when 'PLAN_REQUIRED'   then 'PT402'
    when 'FORBIDDEN'       then 'PT403'
    when 'FEATURE_OFF'     then 'PT403'
    when 'BLOCKED_H4'      then 'PT403'
    when 'NOT_FOUND'       then 'PT404'
    when 'VALIDATION'      then 'PT422'
    when 'FROZEN'          then 'PT423'
    when 'CONFLICT_REV'    then 'PT409'
    when 'LOCKED'          then 'PT409'
    when 'RATE_LIMITED'    then 'PT429'
    else 'PT500'
  end;
  raise exception using errcode = v_state, message = p_code, detail = coalesce(p_rule, ''), hint = coalesce(p_message_vi, '');
end $$;

-- ============================================================ tham số
insert into private.params (key, value_int, status, note) values
  ('trial_plans_max', 1, 'DA_CHOT', 'D-68: gói TRIAL tạo mới tối đa 1 kế hoạch mỗi hộ'),
  ('trial_edits_max', 3, 'DA_CHOT', 'D-68: gói TRIAL chỉnh sửa tối đa 3 lần (commit phiên bản mới) sau lần tạo đầu, tính theo hộ');

-- ============================================================ app.household_plans
create table app.household_plans (
  household_id     uuid primary key references app.households (id),
  tier             text not null check (tier in ('FREE', 'TRIAL', 'PREMIUM')),
  trial_started_at timestamptz,
  trial_ends_at    timestamptz,
  set_by           text not null default 'owner' check (set_by ~ '^[A-Za-z0-9_.:-]{1,40}$'),
  note             text check (note is null or char_length(note) <= 500),     -- ghi chú vận hành của chủ sản phẩm, KHÔNG ghi dữ liệu cá nhân
  updated_at       timestamptz not null default now(),
  check (tier <> 'TRIAL' or trial_started_at is not null),
  check (trial_ends_at is null or (trial_started_at is not null and trial_ends_at > trial_started_at))
);
alter table app.household_plans enable row level security;     -- không chính sách: người dùng đọc qua app.my_plan()
revoke all on app.household_plans from public, anon, authenticated;
grant all on app.household_plans to service_role;

-- ============================================================ audit plan.changed (chỉ gói cũ, gói mới)
insert into private.audit_events (event_code, allowed_meta_keys, note) values
  ('plan.changed', '{old_tier,new_tier}', 'D-68: gói dịch vụ của hộ đổi (không dòng nào khi chỉ đổi hạn hoặc ghi chú); người thực hiện: hệ thống');

create function app.tg_audit_plan() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_old text := case when tg_op = 'INSERT' then 'FREE' else old.tier end;
begin
  if v_old is distinct from new.tier then
    perform private.audit_write_auto(new.household_id, 'plan.changed', 'household:' || new.household_id,
      jsonb_build_object('old_tier', v_old, 'new_tier', new.tier));
  end if;
  return null;
end $$;
create trigger household_plans_audit after insert or update of tier on app.household_plans
  for each row execute function app.tg_audit_plan();
revoke all on function app.tg_audit_plan() from public, anon, authenticated;

-- ============================================================ nội bộ: gói hiệu lực, mức dùng, kiểm
create function private.plan_tier(p_household uuid) returns text
language sql stable security definer set search_path = '' as $$
  select coalesce((select case when p.tier = 'TRIAL' and p.trial_ends_at is not null and p.trial_ends_at <= now() then 'FREE' else p.tier end
                     from app.household_plans p where p.household_id = p_household), 'FREE')
$$;

create function private.plan_usage(p_household uuid, out plans_used int, out edits_used int)
language sql stable security definer set search_path = '' as $$
  select count(distinct v.child_id)::int, (count(*) - count(distinct v.child_id))::int
  from app.schedule_versions v join app.children c on c.id = v.child_id
  where c.household_id = p_household
$$;

-- Kiểm quyền tạo/sửa kế hoạch cho một con. p_lock = true (chỉ lúc commit): khóa hàng hộ để hai con cùng hộ không cùng "tạo kế hoạch đầu".
create function private.plan_check_schedule(p_child uuid, p_lock boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_hh    uuid;
  v_tier  text;
  v_pmax  int;
  v_emax  int;
  v_used  record;
  v_has   boolean;
begin
  select c.household_id into v_hh from app.children c where c.id = p_child;
  v_tier := private.plan_tier(v_hh);
  if v_tier = 'PREMIUM' then return; end if;
  if v_tier <> 'TRIAL' then
    perform app.fail('PLAN_REQUIRED', 'D-68.free', 'Cần gói dùng thử hoặc Premium để tạo và chỉnh sửa kế hoạch.');
  end if;
  if p_lock then perform 1 from app.households h where h.id = v_hh for update; end if;
  v_pmax := private.param_int('trial_plans_max');
  v_emax := private.param_int('trial_edits_max');
  select * into v_used from private.plan_usage(v_hh);
  v_has := exists (select 1 from app.schedule_versions v where v.child_id = p_child);
  if not v_has and v_used.plans_used >= v_pmax then
    perform app.fail('PLAN_REQUIRED', 'D-68.trial_plan',
      format('Gói dùng thử chỉ tạo được %s kế hoạch. Cần gói Premium để tạo thêm.', v_pmax));
  end if;
  if v_has and v_used.edits_used >= v_emax then
    perform app.fail('PLAN_REQUIRED', 'D-68.trial_edit',
      format('Gói dùng thử chỉ chỉnh sửa kế hoạch tối đa %s lần. Cần gói Premium để chỉnh sửa tiếp.', v_emax));
  end if;
end $$;

create function private.plan_require_premium(p_household uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if private.plan_tier(p_household) <> 'PREMIUM' then
    perform app.fail('PLAN_REQUIRED', 'D-68.premium', 'Chỉ gói Premium mới ghép và đồng bộ lịch sang máy của con.');
  end if;
end $$;
revoke all on function private.plan_tier(uuid), private.plan_usage(uuid), private.plan_check_schedule(uuid, boolean), private.plan_require_premium(uuid)
  from public, anon, authenticated;

-- ============================================================ app.my_plan (người lớn trong hộ)
create function app.my_plan() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := (select auth.uid());
  v_hh   uuid;
  v_tier text;
  v_p    app.household_plans;
  v_used record;
  v_pmax int := private.param_int('trial_plans_max');
  v_emax int := private.param_int('trial_edits_max');
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then perform app.fail('FORBIDDEN', 'D-68', 'Chỉ người lớn trong gia đình xem gói.'); end if;
  select m.household_id into v_hh from app.members m where m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  if v_hh is null then perform app.fail('FORBIDDEN', 'D-68', 'Chỉ người lớn trong gia đình xem gói.'); end if;
  v_tier := private.plan_tier(v_hh);
  select * into v_p from app.household_plans p where p.household_id = v_hh;
  select * into v_used from private.plan_usage(v_hh);
  return jsonb_build_object('ok', true, 'tier', v_tier,
    'expired', v_p.tier = 'TRIAL' and v_tier = 'FREE',
    'plans_used', v_used.plans_used,
    'plans_max', case v_tier when 'PREMIUM' then null when 'TRIAL' then v_pmax else 0 end,
    'edits_used', v_used.edits_used,
    'edits_left', case v_tier when 'PREMIUM' then null when 'TRIAL' then greatest(0, v_emax - v_used.edits_used) else 0 end,
    'pal_questions_left', null,
    'trial_ends_at', case when v_tier = 'TRIAL' then v_p.trial_ends_at end);
end $$;

-- ============================================================ app.plan_set (chỉ hệ thống: service_role / chủ sản phẩm)
create function app.plan_set(p_household uuid, p_tier text, p_trial_ends_at timestamptz default null, p_note text default null,
                             p_set_by text default 'owner') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_old app.household_plans;
  v_new app.household_plans;
begin
  perform private.require_system();
  if p_household is null or p_tier is null or p_tier not in ('FREE', 'TRIAL', 'PREMIUM') then
    perform app.fail('VALIDATION', 'D-68', 'Hộ hoặc gói không hợp lệ.');
  end if;
  if p_set_by is null or p_set_by !~ '^[A-Za-z0-9_.:-]{1,40}$' or char_length(coalesce(p_note, '')) > 500 then
    perform app.fail('VALIDATION', 'D-68', 'Người đặt hoặc ghi chú không hợp lệ.');
  end if;
  if p_trial_ends_at is not null and (p_tier <> 'TRIAL' or p_trial_ends_at <= now()) then
    perform app.fail('VALIDATION', 'D-68', 'Hạn dùng thử chỉ áp cho gói TRIAL và phải ở tương lai.');
  end if;
  perform 1 from app.households h where h.id = p_household for update;
  if not found then perform app.fail('NOT_FOUND'); end if;

  select * into v_old from app.household_plans p where p.household_id = p_household;
  insert into app.household_plans (household_id, tier, trial_started_at, trial_ends_at, set_by, note, updated_at)
  values (p_household, p_tier,
          case when p_tier = 'TRIAL' then now() end,
          p_trial_ends_at, p_set_by, nullif(btrim(p_note), ''), now())
  on conflict (household_id) do update set
    tier = excluded.tier,
    trial_started_at = case when excluded.tier = 'TRIAL' then (case when household_plans.tier = 'TRIAL' then household_plans.trial_started_at else now() end)
                            else household_plans.trial_started_at end,
    trial_ends_at = excluded.trial_ends_at,
    set_by = excluded.set_by, note = excluded.note, updated_at = now()
  returning * into v_new;
  return jsonb_build_object('ok', true, 'old_tier', coalesce(v_old.tier, 'FREE'), 'tier', v_new.tier, 'changed', coalesce(v_old.tier, 'FREE') <> v_new.tier);
end $$;

revoke all on function app.my_plan(), app.plan_set(uuid, text, timestamptz, text, text) from public, anon, authenticated;
grant execute on function app.my_plan() to authenticated;
grant execute on function app.plan_set(uuid, text, timestamptz, text, text) to service_role;

-- ============================================================ D-71: ghi chú hoạt động được lưu (giới hạn 500 ký tự)
alter table app.activity_cards drop constraint activity_cards_note_check;
alter table app.activity_cards add constraint activity_cards_note_len check (note is null or char_length(note) between 1 and 500);

-- ============================================================ hàm đổi: profile_save, schedule_commit_apply, pair_confirm, pair_accept, purge_household
-- (chép nguyên từ T3.2, T1.5; chỉ thêm kiểm gói, ghi chú, outbox theo gói, xóa household_plans. create or replace giữ nguyên ACL)
create or replace function app.profile_save(p_child uuid, p_patch jsonb, p_base_version int default null) returns jsonb
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
  perform private.plan_check_schedule(p_child);     -- D-68: FREE không lưu được; TRIAL hết suất tạo hoặc hết lượt sửa cũng không

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
      if v_card ? 'note' and jsonb_typeof(v_card -> 'note') not in ('string', 'null') then
        perform app.fail('VALIDATION', 'D-71', 'Ghi chú phải là chữ.');
      end if;
      if char_length(coalesce(v_card ->> 'note', '')) > 500 then
        perform app.fail('VALIDATION', 'D-71', 'Ghi chú tối đa 500 ký tự.');     -- D-71: lưu nguyên văn, chưa lọc (lọc trước khi phát hành)
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
                 note = case when v_card ? 'note' then nullif(btrim(v_card ->> 'note'), '') else note end,
                 updated_at = now()
           where id = v_cid and child_id = p_child and state = 'ACTIVE' and hidden_at is null;
          if not found then perform app.fail('NOT_FOUND', null, 'Không tìm thấy hoạt động.'); end if;
        else
          insert into app.activity_cards (child_id, name, type, days, start_time, end_time, travel_before_min, travel_after_min, note)
          values (p_child, btrim(v_card ->> 'name'), v_card ->> 'type', v_days, (v_card ->> 'start')::time, (v_card ->> 'end')::time,
                  coalesce((v_card ->> 'travel_before_min')::int, 0), coalesce((v_card ->> 'travel_after_min')::int, 0),
                  nullif(btrim(v_card ->> 'note'), ''))
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

create or replace function app.schedule_commit_apply(
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

  -- D-68: gói dịch vụ (sau replay: gửi lại cùng khóa vẫn trả kết quả cũ). Khóa hàng hộ để tuần tự hóa việc đếm.
  perform private.plan_check_schedule(p_child, true);

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

  -- Outbox (cùng giao dịch): báo máy con đã ghép có lịch mới (chỉ hộ PREMIUM, D-68). Đồng bộ và nhắc nằm trong mục lõi MD-LICH (D-64), đã kiểm ở đầu hàm.
  -- Nội dung tối giản {type,id}.
  insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
  select 'lich_moi', 'device', b.id, p_child, md5(p_idempotency_key::text || b.id::text)::uuid,
         jsonb_build_object('type', 'lich_moi', 'id', v_vid)
  from app.device_bindings b where b.child_id = p_child and b.state = 'HIEU_LUC'
    and private.plan_tier(v_hh) = 'PREMIUM';     -- D-68: chỉ PREMIUM đồng bộ sang máy con (hạ gói: máy đã ghép không nhận lịch mới)

  return jsonb_build_object('ok', true, 'version_id', v_vid, 'rev', v_rev, 'label_status', 'chua_kiem_chung', 'replay', false);
end $$;

create or replace function app.pair_confirm(p_child uuid, p_code text, p_pin text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_state   text;
  v_child   app.children;
  v_member  app.members;
  v_has_pin boolean;
  v_hmac    text;
  v_code    private.pairing_codes;
  v_max_att int := private.param_int('pair_code_max_attempts');
  v_other   boolean;
  v_epoch   int;
  v_bstate  text;
  v_bid     uuid;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'FR-01', 'Máy của con không xác nhận ghép.');
  end if;

  v_state := app.access_state(v_uid, 'child.pair', p_child, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;
  select * into v_child from app.children c where c.id = p_child;
  select * into v_member from app.members m
  where m.household_id = v_child.household_id and m.user_id = v_uid and m.status = 'DA_THAM_GIA' and m.role = 'PRIMARY';

  perform private.plan_require_premium(v_child.household_id);     -- D-68: chỉ PREMIUM ghép máy (trước bộ đếm nhập mã)

  perform private.pair_throttle_check(v_uid, v_child.household_id);

  if not v_child.has_device then
    perform app.fail('VALIDATION', 'BR-FAM-037', 'Con chưa có máy riêng. Chưa ghép được.');
  end if;
  if exists (select 1 from app.device_bindings b where b.child_id = p_child and b.state = 'HIEU_LUC') then
    perform app.fail('VALIDATION', 'BR-FAM-032', 'Con này đã ghép máy. Hãy hủy liên kết trước khi ghép lại.');
  end if;

  v_has_pin := exists (select 1 from private.parent_pins p where p.member_id = v_member.id);
  if not v_has_pin and p_pin is null then
    perform app.fail('VALIDATION', 'FR-01', 'Cần đặt Parent PIN khi ghép lần đầu.');
  end if;
  if v_has_pin and p_pin is not null then
    perform app.fail('VALIDATION', 'FR-01', 'Đã có PIN. Muốn đổi PIN, hãy dùng chức năng đổi PIN.');
  end if;
  if p_pin is not null then perform private.pin_check_format(p_pin); end if;

  -- Tra mã. Mã phải đúng 6 chữ số; sai định dạng vẫn tính một lần sai.
  if p_code is not null and p_code ~ '^[0-9]{6}$' then
    v_hmac := private.pair_hmac(p_code);
    select * into v_code from private.pairing_codes c where c.code_hmac = v_hmac and c.state = 'CON_HAN' for update;
  end if;
  if v_code.id is null then
    return private.pair_fail(v_uid, v_child.household_id);
  end if;
  if v_code.expires_at <= now() then
    update private.pairing_codes c set state = 'HET_HAN' where c.id = v_code.id;
    return private.pair_fail(v_uid, v_child.household_id);
  end if;

  -- Máy đã có liên kết hiệu lực (kể cả ở hộ khác): từ chối chung; tính lần thử trên mã, đủ ngưỡng thì khóa mã.
  if exists (select 1 from app.device_bindings b where b.device_user_id = v_code.device_user_id and b.state = 'HIEU_LUC') then
    update private.pairing_codes c set attempts = c.attempts + 1,
           state = case when c.attempts + 1 >= v_max_att then 'HET_HAN' else c.state end
    where c.id = v_code.id;
    return private.pair_fail(v_uid, v_child.household_id);
  end if;

  -- Từ đây mọi kiểm tra đã đạt: ghi PIN lần đầu, hủy yêu cầu chờ cũ, tạo binding.
  if p_pin is not null then perform private.pin_store(v_member.id, p_pin); end if;

  v_other := exists (
    select 1 from app.device_bindings b join app.children c on c.id = b.child_id
    where b.device_user_id = v_code.device_user_id and b.paired_at is not null
      and b.state in ('HIEU_LUC', 'DA_HUY') and c.household_id <> v_child.household_id);

  update app.device_bindings b set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'THAY_THE'
  where b.state in ('CHO_XAC_NHAN_MAY_CON', 'CHO_XAC_MINH')
    and (b.child_id = p_child or b.device_user_id = v_code.device_user_id);

  select coalesce(max(b.epoch), 0) + 1 into v_epoch from app.device_bindings b where b.child_id = p_child;
  v_bstate := case when v_other then 'CHO_XAC_MINH' else 'CHO_XAC_NHAN_MAY_CON' end;
  insert into app.device_bindings (child_id, device_user_id, epoch, state, paired_by_member_id)
  values (p_child, v_code.device_user_id, v_epoch, v_bstate, v_member.id)
  returning id into v_bid;

  update private.pairing_codes c set state = 'DA_DUNG' where c.id = v_code.id;
  return jsonb_build_object('ok', true, 'binding_id', v_bid, 'state', v_bstate, 'epoch', v_epoch,
                            'pin_set', p_pin is not null);
end $$;

create or replace function app.pair_accept() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_win   int := private.param_int('pair_accept_window_minutes');
  v_b     app.device_bindings;
  v_c     app.children;
  v_hh    app.households;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if not app.is_anonymous_caller() then perform app.fail('FORBIDDEN', 'FR-01', 'Chỉ máy của con.'); end if;

  select * into v_b from app.device_bindings b
  where b.device_user_id = v_uid and b.state = 'CHO_XAC_NHAN_MAY_CON' for update;
  if not found then
    select * into v_b from app.device_bindings b where b.device_user_id = v_uid and b.state = 'HIEU_LUC';
    if found then
      return jsonb_build_object('ok', true, 'replay', true, 'binding_id', v_b.id, 'child_id', v_b.child_id, 'epoch', v_b.epoch);
    end if;
    perform app.fail('NOT_FOUND', 'AD-11', 'Không có yêu cầu ghép nào đang chờ.');
  end if;

  if v_b.created_at + make_interval(mins => v_win) <= now() then
    update app.device_bindings b set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'HET_HAN_XAC_NHAN' where b.id = v_b.id;
    return jsonb_build_object('ok', false, 'error', jsonb_build_object(
      'code', 'NOT_FOUND', 'rule', 'AD-11', 'message_vi', 'Yêu cầu ghép đã hết hạn. Hãy tạo mã mới.'));
  end if;

  select * into v_c from app.children c where c.id = v_b.child_id;
  select * into v_hh from app.households h where h.id = v_c.household_id;
  if v_c.hidden_at is not null or v_hh.hidden_at is not null or not v_c.has_device
     or not exists (select 1 from app.members m where m.id = v_b.paired_by_member_id
                    and m.household_id = v_c.household_id and m.role = 'PRIMARY' and m.status = 'DA_THAM_GIA') then
    perform app.fail('NOT_FOUND', 'AD-11', 'Yêu cầu ghép không còn hiệu lực.');
  end if;
  if v_hh.state <> 'HOAT_DONG' or v_hh.frozen_at is not null then
    perform app.fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa ghép được.');
  end if;
  perform private.plan_require_premium(v_hh.id);     -- D-68

  begin
    update app.device_bindings b set state = 'HIEU_LUC', epoch = b.epoch + 1, paired_at = now()
    where b.id = v_b.id returning * into v_b;
  exception when unique_violation then
    perform app.fail('VALIDATION', 'BR-FAM-032', 'Con này hoặc máy này đã có liên kết khác.');
  end;
  delete from private.pairing_codes c where c.device_user_id = v_uid;
  return jsonb_build_object('ok', true, 'replay', false, 'binding_id', v_b.id, 'child_id', v_b.child_id, 'epoch', v_b.epoch);
end $$;

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
