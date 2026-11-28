-- D-74 (28/11/2026): dùng thử 7 ngày, ĐƯỢC ghép máy con theo nguyên tắc KHÓA ở máy bố mẹ. Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Quyết định của chủ sản phẩm (sổ quyết định D-74):
--   (1) Dùng thử 7 ngày: `trial_days` = 7 chuyển sang DA_CHOT (D-72 để CHUA_CHOT).
--   (2) Đã dùng thử thì không dùng thử lại (giữ nguyên D-72: private.trial_claims, had_premium). Không đổi mã.
--   (3) Dùng thử ĐƯỢC ghép máy con. 1 khóa = ghép 1 máy con; khóa của dùng thử cũng tính là 1 khóa (ghép được 1 máy).
--       Thay phần "ghép chỉ premium" của D-68 (private.plan_require_premium bị bỏ, thay bằng private.device_key_require).
--
-- Khóa ghép máy:
--   * `app.household_plans.device_keys` (int, mặc định 1, 0..50): số khóa của gói PREMIUM; chủ sản phẩm đặt số khác qua app.plan_set(p_device_keys).
--     Số khóa HIỆU LỰC (private.device_keys): TRIAL còn hạn = tham số `trial_device_keys` (1, cố định, không đọc cột); PREMIUM = cột device_keys;
--     FREE và TRIAL quá hạn = 0.
--   * Số khóa ĐÃ DÙNG (private.device_keys_used) = liên kết HIEU_LUC + yêu cầu ghép đang chờ máy con xác nhận (CHO_XAC_NHAN_MAY_CON còn trong
--     `pair_accept_window_minutes`) của các con chưa ẩn trong hộ. CHO_XAC_MINH không tính (nấc 1 không có đường nâng lên HIEU_LUC, không quyền gì).
--   * pair_confirm và pair_accept kiểm `đã dùng < khóa` (khóa hàng hộ để hai lượt cùng lúc không vượt). Hết khóa: DEVICE_KEY_LIMIT (HTTP 402,
--     PT402 như PLAN_REQUIRED nhưng message là mã riêng), quy tắc `D-74.keys`, lời tiếng Việt. FREE (0 khóa vì chưa có gói): giữ PLAN_REQUIRED `D-68.premium`.
--     pair_confirm không tính liên kết/yêu cầu của CHÍNH con đó (con đã ghép vẫn nhận BR-FAM-032; yêu cầu chờ cũ của con sẽ bị thay).
--     pair_accept không tính chính yêu cầu đang được xác nhận.
--
-- Máy con còn hoạt động (plan_active, từng máy):
--   private.binding_in_plan(binding) = liên kết HIEU_LUC, hộ đang TRIAL/PREMIUM (còn hạn) và số máy HIEU_LUC ghép TRƯỚC máy này
--   (theo paired_at, rồi id) < số khóa hiệu lực. Hệ quả: hết hạn TRIAL hoặc hạ gói: mọi máy tạm dừng (giữ liên kết, như D-72);
--   giảm device_keys dưới số máy đang ghép: KHÔNG tự hủy liên kết, máy ghép SAU CÙNG vượt khóa tạm dừng (plan_active=false); nâng lại thì chạy lại.
--   app.my_family_state().plan_active và outbox `lich_moi` (schedule_commit_apply) dùng cùng hàm này.
--
-- Outbox `goi_doi`: ghi cho các máy HIEU_LUC của hộ khi (a) trạng thái "gói đang hoạt động" của hộ đổi (FREE <-> TRIAL cũng tính, không chỉ PREMIUM
--   như D-72), hoặc (b) số khóa hiệu lực đổi (máy nào vượt/hết vượt khóa sẽ đổi theo; nội dung vẫn tối giản {type,id}). Hết hạn TRIAL theo thời gian
--   không đổi dòng nào, nên private.job_plan_expiry (job_daily) ghi goi_doi một lần khi ghi audit plan.expired.
--
-- QUYẾT ĐỊNH MẶC ĐỊNH (CHỜ CHỦ SẢN PHẨM DUYỆT):
--   a. Giảm device_keys: không tự hủy, máy ghép sau cùng tạm dừng (như yêu cầu); chưa có màn cho bố mẹ chọn máy nào giữ.
--   b. Số khóa tối đa 50 (chặn nhập nhầm); `trial_device_keys` là tham số DA_CHOT = 1.
--   c. my_plan thêm `device_keys` (số khóa hiệu lực) và `device_keys_used`; không chia theo con (khóa tính theo hộ).
--   d. Gói hết hạn giữa chừng: yêu cầu ghép đang chờ vẫn chờ (như D-68); pair_accept sẽ báo hết khóa/PLAN_REQUIRED.

-- ============================================================ mã lỗi: thêm DEVICE_KEY_LIMIT (HTTP 402)
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
    when 'CONFLICT_REV'      then 'PT409'
    when 'LOCKED'            then 'PT409'
    when 'TRIAL_USED'        then 'PT409'
    when 'RATE_LIMITED'      then 'PT429'
    else 'PT500'
  end;
  raise exception using errcode = v_state, message = p_code, detail = coalesce(p_rule, ''), hint = coalesce(p_message_vi, '');
end $$;

-- ============================================================ tham số, cột
update private.params set status = 'DA_CHOT', note = 'D-74: số ngày dùng thử tự phục vụ (app.trial_start); chủ sản phẩm chốt 7 ngày' where key = 'trial_days';
insert into private.params (key, value_int, status, note) values
  ('trial_device_keys', 1, 'DA_CHOT', 'D-74: số khóa ghép máy con của gói dùng thử (1 khóa = ghép 1 máy con), cố định');

alter table app.household_plans
  add column device_keys int not null default 1 check (device_keys between 0 and 50);
comment on column app.household_plans.device_keys is
  'D-74: số khóa ghép máy con của gói PREMIUM (mặc định 1; chủ sản phẩm đặt qua plan_set). TRIAL luôn dùng tham số trial_device_keys, FREE = 0; không đọc cột này.';

-- ============================================================ nội bộ: gói hiệu lực của một dòng, số khóa, số đã dùng, máy trong gói
create function private.plan_tier_of(p_tier text, p_ends timestamptz) returns text
language sql stable set search_path = '' as $$
  select case when p_tier = 'TRIAL' and p_ends is not null and p_ends <= now() then 'FREE' else coalesce(p_tier, 'FREE') end
$$;

create function private.device_keys_of(p_tier text, p_ends timestamptz, p_keys int) returns int
language sql stable set search_path = '' as $$
  select case private.plan_tier_of(p_tier, p_ends)
           when 'TRIAL'   then private.param_int('trial_device_keys')
           when 'PREMIUM' then coalesce(p_keys, 1)
           else 0 end
$$;

create function private.device_keys(p_household uuid) returns int
language sql stable security definer set search_path = '' as $$
  select coalesce((select private.device_keys_of(p.tier, p.trial_ends_at, p.device_keys) from app.household_plans p where p.household_id = p_household), 0)
$$;

create function private.device_keys_used(p_household uuid, p_except_child uuid default null, p_except_binding uuid default null) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int
  from app.device_bindings b join app.children c on c.id = b.child_id
  where c.household_id = p_household and c.hidden_at is null
    and (p_except_child is null or b.child_id <> p_except_child)
    and (p_except_binding is null or b.id <> p_except_binding)
    and (b.state = 'HIEU_LUC'
         or (b.state = 'CHO_XAC_NHAN_MAY_CON'
             and b.created_at + make_interval(mins => private.param_int('pair_accept_window_minutes')) > now()))
$$;

-- Còn khóa để ghép thêm một máy? FREE: PLAN_REQUIRED (chưa có gói); còn lại: đã dùng >= khóa thì DEVICE_KEY_LIMIT. Khóa hàng hộ (tránh hai lượt cùng lúc).
create function private.device_key_require(p_household uuid, p_except_child uuid default null, p_except_binding uuid default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_keys int;
  v_used int;
begin
  perform 1 from app.households h where h.id = p_household for update;
  if private.plan_tier(p_household) = 'FREE' then
    perform app.fail('PLAN_REQUIRED', 'D-68.premium', 'Cần gói dùng thử hoặc Premium để ghép máy của con.');
  end if;
  v_keys := private.device_keys(p_household);
  v_used := private.device_keys_used(p_household, p_except_child, p_except_binding);
  if v_used >= v_keys then
    perform app.fail('DEVICE_KEY_LIMIT', 'D-74.keys',
      format('Gói hiện tại ghép được tối đa %s máy của con và đã dùng hết khóa ghép máy. Hãy hủy liên kết một máy hoặc nâng cấp gói để ghép thêm.', v_keys));
  end if;
end $$;

-- Máy con (liên kết HIEU_LUC) còn hoạt động: hộ đang TRIAL/PREMIUM và máy này nằm trong số khóa (các máy ghép trước được giữ).
create function private.binding_in_plan(p_binding uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select private.plan_tier(c.household_id) in ('TRIAL', 'PREMIUM')
       and (select count(*) from app.device_bindings o join app.children oc on oc.id = o.child_id
            where oc.household_id = c.household_id and oc.hidden_at is null and o.state = 'HIEU_LUC'
              and (coalesce(o.paired_at, o.created_at), o.id) < (coalesce(b.paired_at, b.created_at), b.id)) < private.device_keys(c.household_id)
    from app.device_bindings b join app.children c on c.id = b.child_id
    where b.id = p_binding and b.state = 'HIEU_LUC'), false)
$$;
revoke all on function private.plan_tier_of(text, timestamptz), private.device_keys_of(text, timestamptz, int), private.device_keys(uuid),
  private.device_keys_used(uuid, uuid, uuid), private.device_key_require(uuid, uuid, uuid), private.binding_in_plan(uuid)
  from public, anon, authenticated;

-- ============================================================ ghép máy: kiểm khóa (thay kiểm PREMIUM của D-68)
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

  perform private.device_key_require(v_child.household_id, p_child);     -- D-74: còn khóa ghép máy (trước bộ đếm nhập mã); máy chờ/đã ghép của chính con này không tính

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
  perform private.device_key_require(v_hh.id, null, v_b.id);     -- D-74: còn khóa cho máy này (không tính chính yêu cầu đang xác nhận)

  begin
    update app.device_bindings b set state = 'HIEU_LUC', epoch = b.epoch + 1, paired_at = now()
    where b.id = v_b.id returning * into v_b;
  exception when unique_violation then
    perform app.fail('VALIDATION', 'BR-FAM-032', 'Con này hoặc máy này đã có liên kết khác.');
  end;
  delete from private.pairing_codes c where c.device_user_id = v_uid;
  return jsonb_build_object('ok', true, 'replay', false, 'binding_id', v_b.id, 'child_id', v_b.child_id, 'epoch', v_b.epoch);
end $$;

drop function private.plan_require_premium(uuid);

-- ============================================================ máy con: plan_active theo TỪNG máy (hộ đang TRIAL/PREMIUM và máy trong số khóa)
create or replace function app.my_family_state() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid    uuid := (select auth.uid());
  v_state  text;
  v_frozen timestamptz;
  v_bid    uuid;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if not app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'D-41', 'Chỉ máy của con dùng hàm này.');
  end if;
  select h.state, h.frozen_at, b.id into v_state, v_frozen, v_bid
  from app.device_bindings b join app.children c on c.id = b.child_id join app.households h on h.id = c.household_id
  where b.device_user_id = v_uid and b.state = 'HIEU_LUC' and c.hidden_at is null and h.hidden_at is null;
  if not found then perform app.fail('NOT_FOUND'); end if;
  -- D-74: plan_active=false khi hộ hết dùng thử/hạ gói hoặc máy này vượt số khóa (ghép sau cùng): app con hiện màn tạm dừng, chờ bố mẹ cập nhật.
  return jsonb_build_object('ok', true, 'state', v_state, 'frozen', v_state <> 'HOAT_DONG' or v_frozen is not null,
                            'plan_active', private.binding_in_plan(v_bid));
end $$;

-- ============================================================ app.my_plan: thêm device_keys, device_keys_used
create or replace function app.my_plan() returns jsonb
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
    'trial_days', private.param_int('trial_days'),
    'device_keys', private.device_keys(v_hh),
    'device_keys_used', private.device_keys_used(v_hh));
end $$;

-- ============================================================ app.plan_set: thêm p_device_keys (null = giữ nguyên; hộ mới = 1)
drop function app.plan_set(uuid, text, timestamptz, text, text);
create function app.plan_set(p_household uuid, p_tier text, p_trial_ends_at timestamptz default null, p_note text default null,
                             p_set_by text default 'owner', p_device_keys int default null) returns jsonb
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
  if p_device_keys is not null and p_device_keys not between 0 and 50 then
    perform app.fail('VALIDATION', 'D-74', 'Số khóa ghép máy phải từ 0 đến 50.');
  end if;
  perform 1 from app.households h where h.id = p_household for update;
  if not found then perform app.fail('NOT_FOUND'); end if;

  select * into v_old from app.household_plans p where p.household_id = p_household;
  insert into app.household_plans (household_id, tier, trial_started_at, trial_ends_at, set_by, note, device_keys, updated_at)
  values (p_household, p_tier,
          case when p_tier = 'TRIAL' then now() end,
          p_trial_ends_at, p_set_by, nullif(btrim(p_note), ''), coalesce(p_device_keys, 1), now())
  on conflict (household_id) do update set
    tier = excluded.tier,
    trial_started_at = case when excluded.tier = 'TRIAL' then (case when household_plans.tier = 'TRIAL' then household_plans.trial_started_at else now() end)
                            else household_plans.trial_started_at end,
    trial_ends_at = excluded.trial_ends_at,
    set_by = excluded.set_by, note = excluded.note,
    device_keys = coalesce(p_device_keys, household_plans.device_keys), updated_at = now()
  returning * into v_new;
  return jsonb_build_object('ok', true, 'old_tier', coalesce(v_old.tier, 'FREE'), 'tier', v_new.tier, 'changed', coalesce(v_old.tier, 'FREE') <> v_new.tier,
                            'device_keys', v_new.device_keys);
end $$;
revoke all on function app.plan_set(uuid, text, timestamptz, text, text, int) from public, anon, authenticated;
grant execute on function app.plan_set(uuid, text, timestamptz, text, text, int) to service_role;

-- ============================================================ outbox goi_doi: khi "gói đang hoạt động" của hộ đổi (kể cả FREE <-> TRIAL) hoặc số khóa hiệu lực đổi
create or replace function app.tg_plan_notify() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_old_act  boolean := tg_op = 'UPDATE' and private.plan_tier_of(old.tier, old.trial_ends_at) <> 'FREE';
  v_new_act  boolean := private.plan_tier_of(new.tier, new.trial_ends_at) <> 'FREE';
  v_old_keys int := case when tg_op = 'UPDATE' then private.device_keys_of(old.tier, old.trial_ends_at, old.device_keys) else 0 end;
  v_new_keys int := private.device_keys_of(new.tier, new.trial_ends_at, new.device_keys);
begin
  if v_old_act is distinct from v_new_act or v_old_keys is distinct from v_new_keys then
    insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
    select 'goi_doi', 'device', b.id, b.child_id, gen_random_uuid(), jsonb_build_object('type', 'goi_doi', 'id', b.id)
    from app.device_bindings b join app.children c on c.id = b.child_id
    where c.household_id = new.household_id and b.state = 'HIEU_LUC' and c.hidden_at is null;
  end if;
  return null;
end $$;
drop trigger household_plans_notify on app.household_plans;
create trigger household_plans_notify after insert or update of tier, trial_ends_at, device_keys on app.household_plans
  for each row execute function app.tg_plan_notify();

-- ============================================================ job: TRIAL hết hạn -> audit plan.expired VÀ goi_doi cho máy con (một lần mỗi đợt)
create or replace function private.job_plan_expiry(p_now timestamptz default clock_timestamp()) returns jsonb
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
    insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
    select 'goi_doi', 'device', b.id, b.child_id, gen_random_uuid(), jsonb_build_object('type', 'goi_doi', 'id', b.id)
    from app.device_bindings b join app.children c on c.id = b.child_id
    where c.household_id = r.household_id and b.state = 'HIEU_LUC' and c.hidden_at is null;
    v_n := v_n + 1;
  end loop;
  return jsonb_build_object('expired', v_n);
end $$;

-- ============================================================ đồng bộ lịch sang máy con: chỉ máy còn trong gói và trong số khóa
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

  -- Outbox (cùng giao dịch): báo máy con đã ghép có lịch mới (chỉ máy còn trong gói và trong số khóa, D-74). Đồng bộ và nhắc nằm trong mục lõi MD-LICH (D-64), đã kiểm ở đầu hàm.
  -- Nội dung tối giản {type,id}.
  insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
  select 'lich_moi', 'device', b.id, p_child, md5(p_idempotency_key::text || b.id::text)::uuid,
         jsonb_build_object('type', 'lich_moi', 'id', v_vid)
  from app.device_bindings b where b.child_id = p_child and b.state = 'HIEU_LUC'
    and private.binding_in_plan(b.id);     -- D-74: máy con trong gói (TRIAL/PREMIUM còn hạn) và trong số khóa ghép máy; ngoài đó không nhận lịch mới

  return jsonb_build_object('ok', true, 'version_id', v_vid, 'rev', v_rev, 'label_status', 'chua_kiem_chung', 'replay', false);
end $$;

-- ============================================================ đặc quyền
revoke all on function app.my_plan(), app.my_family_state() from public, anon, authenticated;
grant execute on function app.my_plan(), app.my_family_state() to authenticated;
