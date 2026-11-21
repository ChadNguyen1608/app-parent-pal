-- D-72 (19/11/2026): gói dịch vụ, chi tiết. Người soạn: AI, chưa kiểm chứng độc lập. KHÔNG có thanh toán thật.
--
-- Đổi so với D-68 (migration …d68_goi_dich_vu.sql):
--   1. DÙNG THỬ đếm THEO CON: mỗi hồ sơ con có tối đa `trial_plans_max` (1) kế hoạch và `trial_edits_max` (3) lần sửa (phiên bản mới sau lần tạo đầu).
--      Con đã ẩn không còn trong my_plan; số đếm của con nào chỉ phụ thuộc phiên bản lịch của con đó.
--   2. FREE: `profile_save` (nhập thông tin, thẻ hoạt động) ĐƯỢC. `schedule-preview` (qua RPC `app.schedule_plan_check`) và `schedule_commit_apply` -> PLAN_REQUIRED.
--      Hệ quả: TRIAL hết lượt sửa cũng lưu nháp được (trước đây bị chặn); chỉ xem trước và commit mới bị chặn.
--   3. Dùng thử tự phục vụ: `app.trial_start(p_device_hash)`. Chống dùng thử lặp bằng `private.trial_claims` (mã máy băm + email chuẩn hóa băm).
--      `trial_claims` KHÔNG bị xóa khi purge hộ (để chống lặp): chỉ giữ băm, không khóa ngoại. D-71: dữ liệu giai đoạn test; xem lại trước phát hành.
--   4. Hết hạn TRIAL tính là FREE (đã có ở D-68); `private.job_plan_expiry` (gọi từ job_daily) ghi audit `plan.expired` một lần mỗi đợt dùng thử.
--   5. Máy con: `app.my_family_state()` thêm `plan_active` = hộ đang PREMIUM. TRIAL KHÔNG làm máy con hoạt động (D-68: ghép máy chỉ premium).
--      Khi gói đổi giữa PREMIUM và khác, ghi thông báo outbox `goi_doi` cho các máy con đã ghép của hộ.
--
-- QUYẾT ĐỊNH MẶC ĐỊNH (CHỜ CHỦ SẢN PHẨM DUYỆT):
--   a. `trial_days` = 7 (CHUA_CHOT). Hết hạn tính theo giờ (now() + 7 ngày), không theo ngày lịch.
--   b. `trial_claims` lưu email dạng BĂM (sha256 của email chuẩn hóa), cột `email_norm_hash`, không lưu email thô. `device_hash` do app gửi, máy chủ không nhận Android ID thô.
--   c. Hộ "đã từng TRIAL/PREMIUM" = có dòng gói với trial_started_at, hoặc `had_premium`, hoặc đang khác FREE. Lý do từ chối là TRIAL_USED (HTTP 409) cho cả ba, cả khi mã máy/email đã dùng.
--      Lời từ chối không nói đó là mã máy hay email (rule `D-72.claim` chung).
--   d. Gói PREMIUM đặt tay (plan_set) trước đây rồi hạ về FREE: không dùng thử được nữa (had_premium).
--   e. goi_doi chỉ ghi khi trạng thái PREMIUM đổi (vào hoặc ra khỏi PREMIUM); FREE <-> TRIAL không đổi gì với máy con. Nội dung tối giản {type,id}, id = mã liên kết của máy.
--   f. my_plan trả theo con (`children[]`) thay các số tổng của hộ. NL chỉ thấy con mình được xem (access_state child.view).
--   g. Hạ gói giữa chừng: máy con giữ liên kết, plan_active=false, app con hiện màn tạm dừng (không hủy liên kết, không xóa lịch đã có).

-- ============================================================ mã lỗi: thêm TRIAL_USED (409)
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
    when 'TRIAL_USED'      then 'PT409'
    when 'RATE_LIMITED'    then 'PT429'
    else 'PT500'
  end;
  raise exception using errcode = v_state, message = p_code, detail = coalesce(p_rule, ''), hint = coalesce(p_message_vi, '');
end $$;

-- ============================================================ tham số
insert into private.params (key, value_int, status, note) values
  ('trial_days', 7, 'CHUA_CHOT', 'D-72: số ngày dùng thử tự phục vụ (app.trial_start); đề xuất 7, chờ chủ sản phẩm chốt');
update private.params set note = 'D-72: gói TRIAL tạo mới tối đa 1 kế hoạch MỖI CON' where key = 'trial_plans_max';
update private.params set note = 'D-72: gói TRIAL chỉnh sửa tối đa 3 lần (commit phiên bản mới) sau lần tạo đầu, MỖI CON' where key = 'trial_edits_max';

-- ============================================================ household_plans: cờ từng PREMIUM, mốc đã ghi audit hết hạn
alter table app.household_plans
  add column had_premium      boolean not null default false,
  add column expired_noted_at timestamptz;

create function app.tg_plan_flags() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.tier = 'PREMIUM' then new.had_premium := true; end if;
  if new.tier = 'TRIAL' and (tg_op = 'INSERT' or old.tier is distinct from 'TRIAL' or old.trial_ends_at is distinct from new.trial_ends_at) then
    new.expired_noted_at := null;      -- đợt dùng thử mới hoặc gia hạn: được ghi audit hết hạn lại
  end if;
  return new;
end $$;
create trigger household_plans_flags before insert or update on app.household_plans
  for each row execute function app.tg_plan_flags();
revoke all on function app.tg_plan_flags() from public, anon, authenticated;
update app.household_plans set had_premium = true where tier = 'PREMIUM';

-- ============================================================ private.trial_claims (chống dùng thử lặp; KHÔNG xóa khi purge hộ)
create table private.trial_claims (
  id               uuid primary key default gen_random_uuid(),
  device_hash      text not null unique check (device_hash ~ '^[0-9a-f]{64}$'),
  email_norm_hash  text not null unique check (email_norm_hash ~ '^[0-9a-f]{64}$'),
  household_id     uuid not null,            -- cố ý KHÔNG khóa ngoại: dòng này phải sống sau khi hộ bị xóa
  claimed_at       timestamptz not null default now()
);
alter table private.trial_claims enable row level security;      -- không chính sách
revoke all on private.trial_claims from public, anon, authenticated;
grant all on private.trial_claims to service_role;

-- Chuẩn hóa email: chữ thường, bỏ khoảng trắng hai đầu; mọi miền bỏ phần sau "+" của phần tên;
-- gmail.com và googlemail.com: bỏ dấu chấm trong phần tên và coi là cùng miền gmail.com.
create function private.email_norm(p_email text) returns text
language plpgsql immutable set search_path = '' as $$
declare
  v_e     text := lower(btrim(coalesce(p_email, '')));
  v_local text;
  v_dom   text;
begin
  if position('@' in v_e) = 0 then return v_e; end if;
  v_local := substring(v_e from '^(.*)@[^@]*$');
  v_dom := substring(v_e from '@([^@]*)$');
  v_local := split_part(v_local, '+', 1);
  if v_dom in ('gmail.com', 'googlemail.com') then
    v_local := replace(v_local, '.', '');
    v_dom := 'gmail.com';
  end if;
  return v_local || '@' || v_dom;
end $$;

create function private.email_hash(p_email text) returns text
language sql immutable set search_path = '' as $$
  select encode(extensions.digest(convert_to('trial-email:' || private.email_norm(p_email), 'UTF8'), 'sha256'), 'hex')
$$;

-- ============================================================ đếm và kiểm gói THEO CON
drop function private.plan_check_schedule(uuid, boolean);
drop function private.plan_usage(uuid);

create function private.plan_child_usage(p_child uuid, out plans_used int, out edits_used int)
language sql stable security definer set search_path = '' as $$
  select (count(*) > 0)::int, greatest(count(*) - 1, 0)::int from app.schedule_versions v where v.child_id = p_child
$$;

-- Kiểm quyền tạo/sửa kế hoạch của MỘT con. FREE (kể cả TRIAL quá hạn): không. TRIAL: tạo mới được khi con chưa có phiên bản nào;
-- đã có thì chỉ khi chưa dùng hết `trial_edits_max` lần sửa. PREMIUM: không giới hạn.
create function private.plan_check_schedule(p_child uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_hh    uuid;
  v_tier  text;
  v_pmax  int;
  v_emax  int;
  v_used  record;
begin
  select c.household_id into v_hh from app.children c where c.id = p_child;
  v_tier := private.plan_tier(v_hh);
  if v_tier = 'PREMIUM' then return; end if;
  if v_tier <> 'TRIAL' then
    perform app.fail('PLAN_REQUIRED', 'D-68.free', 'Gói miễn phí chưa xem trước và tạo lịch được. Hãy dùng thử hoặc nâng cấp Premium.');
  end if;
  v_pmax := private.param_int('trial_plans_max');
  v_emax := private.param_int('trial_edits_max');
  select * into v_used from private.plan_child_usage(p_child);
  if v_used.plans_used >= v_pmax and v_used.edits_used >= v_emax then
    perform app.fail('PLAN_REQUIRED', 'D-68.trial_edit',
      format('Gói dùng thử chỉ chỉnh sửa kế hoạch của mỗi con tối đa %s lần. Cần gói Premium để chỉnh sửa tiếp.', v_emax));
  end if;
end $$;
revoke all on function private.plan_child_usage(uuid), private.plan_check_schedule(uuid), private.email_norm(text), private.email_hash(text)
  from public, anon, authenticated;

-- ============================================================ app.schedule_plan_check (cho Edge Function schedule-preview)
create function app.schedule_plan_check(p_profile uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_p     app.schedule_profiles;
  v_state text;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  select * into v_p from app.schedule_profiles where id = p_profile and hidden_at is null;
  if not found then perform app.fail('NOT_FOUND', null, 'Không tìm thấy hồ sơ lịch.'); end if;
  v_state := app.access_state(v_uid, 'child.update', v_p.child_id, 'MD-LICH');
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, v_p.child_id); end if;
  perform private.plan_check_schedule(v_p.child_id);
  return jsonb_build_object('ok', true);
end $$;

-- ============================================================ app.my_plan (theo con)
drop function app.my_plan();
create function app.my_plan() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := (select auth.uid());
  v_hh   uuid;
  v_tier text;
  v_p    app.household_plans;
  v_pmax int := private.param_int('trial_plans_max');
  v_emax int := private.param_int('trial_edits_max');
  v_kids jsonb;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then perform app.fail('FORBIDDEN', 'D-68', 'Chỉ người lớn trong gia đình xem gói.'); end if;
  select m.household_id into v_hh from app.members m where m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  if v_hh is null then perform app.fail('FORBIDDEN', 'D-68', 'Chỉ người lớn trong gia đình xem gói.'); end if;
  v_tier := private.plan_tier(v_hh);
  select * into v_p from app.household_plans p where p.household_id = v_hh;
  select coalesce(jsonb_agg(jsonb_build_object('child_id', c.id, 'plans_used', u.plans_used, 'edits_used', u.edits_used,
           'edits_left', case v_tier when 'PREMIUM' then null when 'TRIAL' then greatest(0, v_emax - u.edits_used) else 0 end)
           order by c.created_at, c.id), '[]'::jsonb)
    into v_kids
  from app.children c cross join lateral private.plan_child_usage(c.id) u
  where c.household_id = v_hh and c.hidden_at is null and app.access_state(v_uid, 'child.view', c.id, null) = 'ALLOW';
  return jsonb_build_object('ok', true, 'tier', v_tier,
    'expired', coalesce(v_p.tier = 'TRIAL', false) and v_tier = 'FREE',
    'plans_max', case v_tier when 'PREMIUM' then null when 'TRIAL' then v_pmax else 0 end,
    'edits_max', case v_tier when 'PREMIUM' then null when 'TRIAL' then v_emax else 0 end,
    'children', v_kids,
    'pal_questions_left', null,
    'trial_ends_at', case when v_tier = 'TRIAL' then v_p.trial_ends_at end,
    'trial_available', v_tier = 'FREE' and (v_p.household_id is null or (v_p.trial_started_at is null and not v_p.had_premium)),
    'trial_days', private.param_int('trial_days'));
end $$;

-- ============================================================ app.trial_start (người quản lý chính tự bắt đầu dùng thử)
create function app.trial_start(p_device_hash text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid    uuid := (select auth.uid());
  v_m      app.members;
  v_h      app.households;
  v_p      app.household_plans;
  v_email  text;
  v_ehash  text;
  v_days   int := private.param_int('trial_days');
  v_ends   timestamptz;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then perform app.fail('FORBIDDEN', 'D-72', 'Chỉ người quản lý chính của gia đình bắt đầu dùng thử.'); end if;
  if p_device_hash is null or p_device_hash !~ '^[0-9a-f]{64}$' then
    perform app.fail('VALIDATION', 'D-72', 'Mã máy không hợp lệ.');
  end if;
  select * into v_m from app.members m where m.user_id = v_uid and m.status = 'DA_THAM_GIA' and m.role = 'PRIMARY';
  if not found then perform app.fail('FORBIDDEN', 'D-72', 'Chỉ người quản lý chính của gia đình bắt đầu dùng thử.'); end if;
  select * into v_h from app.households h where h.id = v_m.household_id for update;
  if v_h.hidden_at is not null then perform app.fail('NOT_FOUND'); end if;
  if v_h.state <> 'HOAT_DONG' or v_h.frozen_at is not null then
    perform app.fail('FROZEN', 'D-72', 'Gia đình đang tạm dừng, chưa bắt đầu dùng thử được.');
  end if;

  select * into v_p from app.household_plans p where p.household_id = v_h.id;
  if found and (v_p.tier <> 'FREE' or v_p.trial_started_at is not null or v_p.had_premium) then
    perform app.fail('TRIAL_USED', 'D-72.household', 'Gia đình này đã dùng thử hoặc đã có gói.');
  end if;

  select u.email into v_email from auth.users u where u.id = v_uid;
  if v_email is null or btrim(v_email) = '' then
    perform app.fail('VALIDATION', 'D-72', 'Tài khoản cần có email để dùng thử.');
  end if;
  v_ehash := private.email_hash(v_email);
  if exists (select 1 from private.trial_claims c where c.device_hash = p_device_hash or c.email_norm_hash = v_ehash) then
    perform app.fail('TRIAL_USED', 'D-72.claim', 'Máy này hoặc email này đã dùng thử rồi.');
  end if;
  begin
    insert into private.trial_claims (device_hash, email_norm_hash, household_id) values (p_device_hash, v_ehash, v_h.id);
  exception when unique_violation then
    perform app.fail('TRIAL_USED', 'D-72.claim', 'Máy này hoặc email này đã dùng thử rồi.');
  end;

  v_ends := now() + make_interval(days => v_days);
  insert into app.household_plans (household_id, tier, trial_started_at, trial_ends_at, set_by, updated_at)
  values (v_h.id, 'TRIAL', now(), v_ends, 'self', now())
  on conflict (household_id) do update set tier = 'TRIAL', trial_started_at = now(), trial_ends_at = v_ends, set_by = 'self', note = null, updated_at = now();
  return jsonb_build_object('ok', true, 'tier', 'TRIAL', 'trial_ends_at', v_ends);
end $$;

-- ============================================================ máy con: plan_active
create or replace function app.my_family_state() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_h   app.households;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if not app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'D-41', 'Chỉ máy của con dùng hàm này.');
  end if;
  select h.* into v_h
  from app.device_bindings b join app.children c on c.id = b.child_id join app.households h on h.id = c.household_id
  where b.device_user_id = v_uid and b.state = 'HIEU_LUC' and c.hidden_at is null and h.hidden_at is null;
  if not found then perform app.fail('NOT_FOUND'); end if;
  -- D-72: máy con chỉ hoạt động khi hộ PREMIUM (TRIAL không ghép máy, D-68). plan_active=false: app con hiện màn tạm dừng, chờ bố mẹ cập nhật.
  return jsonb_build_object('ok', true, 'state', v_h.state, 'frozen', v_h.state <> 'HOAT_DONG' or v_h.frozen_at is not null,
                            'plan_active', private.plan_tier(v_h.id) = 'PREMIUM');
end $$;

-- ============================================================ outbox goi_doi
alter table app.notifications drop constraint notifications_type_check;
alter table app.notifications add constraint notifications_type_check check (type in ('lich_moi', 'con_bao', 'goi_doi'));

create function app.tg_plan_notify() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_old_prem boolean := tg_op = 'UPDATE' and old.tier = 'PREMIUM';
begin
  if v_old_prem is distinct from (new.tier = 'PREMIUM') then
    insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
    select 'goi_doi', 'device', b.id, b.child_id, gen_random_uuid(), jsonb_build_object('type', 'goi_doi', 'id', b.id)
    from app.device_bindings b join app.children c on c.id = b.child_id
    where c.household_id = new.household_id and b.state = 'HIEU_LUC' and c.hidden_at is null;
  end if;
  return null;
end $$;
create trigger household_plans_notify after insert or update of tier on app.household_plans
  for each row execute function app.tg_plan_notify();
revoke all on function app.tg_plan_notify() from public, anon, authenticated;

-- ============================================================ job: TRIAL hết hạn -> audit plan.expired (một lần mỗi đợt)
insert into private.audit_events (event_code, allowed_meta_keys, note) values
  ('plan.expired', '{}', 'D-72: gói dùng thử hết hạn (job-daily), từ đó tính là FREE; người thực hiện: hệ thống');

create function private.job_plan_expiry(p_now timestamptz default clock_timestamp()) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  r record;
  v_n int := 0;
begin
  for r in select p.household_id from app.household_plans p
            where p.tier = 'TRIAL' and p.trial_ends_at is not null and p.trial_ends_at <= p_now and p.expired_noted_at is null
            order by p.household_id for update
  loop
    update app.household_plans set expired_noted_at = p_now where household_id = r.household_id;
    perform private.audit_write_auto(r.household_id, 'plan.expired', 'household:' || r.household_id);
    v_n := v_n + 1;
  end loop;
  return jsonb_build_object('expired', v_n);
end $$;

create or replace function private.job_daily(p_now timestamptz default clock_timestamp()) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_res jsonb;
begin
  v_res := jsonb_build_object('freeze', private.job_freeze_idle(p_now), 'trial_end', private.trial_end_due(p_now),
                              'alerts', private.job_alert_cleanup(p_now), 'plan_expiry', private.job_plan_expiry(p_now));
  insert into app.job_runs (job, status, summary) values ('job-daily', 'OK', v_res);
  return v_res;
end $$;
revoke all on function private.job_plan_expiry(timestamptz) from public, anon, authenticated;
grant execute on function private.job_plan_expiry(timestamptz) to service_role;

-- ============================================================ hàm đổi: profile_save (bỏ kiểm gói), schedule_commit_apply (đếm theo con)
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
  -- D-72: lưu hồ sơ (nhập thông tin) KHÔNG xét gói; FREE nhập được. Gói chỉ chặn xem trước và tạo lịch.

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

  -- D-68, D-72: gói dịch vụ (sau replay: gửi lại cùng khóa vẫn trả kết quả cũ). Đếm theo con; hàng con đã khóa ở trên nên tuần tự.
  perform private.plan_check_schedule(p_child);

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

-- ============================================================ đặc quyền
revoke all on function app.my_plan(), app.trial_start(text), app.schedule_plan_check(uuid), app.my_family_state()
  from public, anon, authenticated;
grant execute on function app.my_plan(), app.trial_start(text), app.schedule_plan_check(uuid), app.my_family_state() to authenticated;
