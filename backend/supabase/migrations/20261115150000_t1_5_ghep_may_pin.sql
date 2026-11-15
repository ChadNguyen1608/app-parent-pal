-- T1.5 (Dev Plan 15.1 Đợt 1; Tech Spec §2.1, §3.1 #5-#9, §3.2; Architecture §5.2-5.3; BL 11.2 BR-FAM-030..039;
-- FR-01; OD-A8, D-18, D-45). Ghép máy con bằng mã 6 số + xác nhận hai bên (AD-11) và Parent PIN.
--
-- Máy con (người dùng ẩn danh)  app.pair_code_create()  ->  mã 6 số (chỉ lưu HMAC, hạn ngắn)
-- QL                            app.pair_confirm(child, code[, pin])  ->  binding CHO_XAC_NHAN_MAY_CON
-- Máy con                       app.pair_pending() xem "Kết nối với [tên]?", app.pair_accept() -> HIEU_LUC,
--                               app.pair_decline() -> DA_HUY
-- QL                            app.pin_set(pin);  app.pin_verify(member, pin) là NỘI BỘ (không ai gọi qua API)
--
-- QUAN TRỌNG (đếm lần thử): RAISE làm hủy giao dịch, kéo theo hủy luôn bộ đếm. Vì vậy các đường thất bại CẦN GHI NHẬN
-- (mã sai ở pair_confirm, PIN sai ở unlink_device) KHÔNG raise mà trả jsonb {"ok": false, "error": {code, rule,
-- message_vi}} (HTTP 200) sau khi đã commit bộ đếm. Mọi lỗi khác vẫn dùng app.fail (raise, mã HTTP thật).
-- Thành công trả {"ok": true, ...}. Edge Function bọc ngoài đổi {"ok": false} thành lỗi chuẩn Tech Spec §0.
-- Người soạn: AI, chưa kiểm chứng độc lập.

create extension if not exists pgcrypto with schema extensions;

-- ============================================================ mã lỗi: thêm RATE_LIMITED (429)
create or replace function app.fail(p_code text, p_rule text default null, p_message_vi text default null)
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
    when 'RATE_LIMITED'    then 'PT429'
    else 'PT500'
  end;
  raise exception using errcode = v_state, message = p_code, detail = coalesce(p_rule, ''), hint = coalesce(p_message_vi, '');
end $$;

-- ============================================================ tham số chưa chốt (private.params, tạo ở T1.2)
-- Tất cả 'CHUA_CHOT' (OW-06 / Q-TS-01): chủ sản phẩm duyệt rồi mới đổi status.
insert into private.params (key, value_int, note) values
  ('pair_code_ttl_minutes',       10, 'PR-FAM-04 UNKNOWN; mặc định đề xuất 10 phút (Architecture §5.3), nhãn đề xuất nội bộ'),
  ('pair_code_max_attempts',       5, 'Số lần mã ĐÚNG bị từ chối (máy đã ghép nơi khác...) trước khi khóa mã; đề xuất nội bộ'),
  ('pair_code_create_per_hour',   10, 'Số mã một máy được tạo mỗi giờ (RATE_LIMITED); đề xuất nội bộ'),
  ('pair_confirm_max_fails',       5, 'Architecture §5.3 [MĐKT]: 5 lần nhập mã sai ...'),
  ('pair_confirm_window_minutes', 15, '... trong 15 phút (đếm theo tài khoản và theo hộ)'),
  ('pair_confirm_lock_minutes',   15, 'Thời gian khóa nhập mã sau khi vượt ngưỡng; đề xuất nội bộ'),
  ('pair_accept_window_minutes',   5, 'Architecture §5.3: hết 5 phút máy con chưa chạm Đồng ý thì hủy'),
  ('pin_length',                   6, 'Architecture §5.3: độ dài PIN UNKNOWN, mặc định 6 chữ số'),
  ('pin_max_failures',             5, 'PR-FAM-05 UNKNOWN; mặc định [MĐKT] 5 lần sai rồi khóa'),
  ('pin_lock_minutes',            15, 'PR-FAM-05 UNKNOWN; khóa lần đầu 15 phút, nhân đôi mỗi lần khóa kế tiếp'),
  ('pin_lock_max_minutes',      1440, 'Trần thời gian khóa PIN (24 giờ); đề xuất nội bộ'),
  ('pin_bcrypt_cost',             10, 'Hệ số bcrypt của pgcrypto crypt()/gen_salt(''bf'')');

-- ============================================================ khóa bí mật (KHÔNG nằm trong mã hay migration)
-- Thứ tự tìm: Supabase Vault (vault.decrypted_secrets, tên = p_name), rồi cài đặt cơ sở dữ liệu
-- `app.settings.<tên>` (cho sandbox/CI; cài bằng ALTER DATABASE ... SET, KHÔNG commit giá trị thật).
-- Thiếu hoặc quá ngắn (< 16 ký tự): lỗi INTERNAL, không bao giờ chạy với khóa rỗng (fail-closed).
-- Tên dùng: pairing_secret (HMAC mã ghép), pin_pepper (tiêu vị của băm PIN).
create function private.secret(p_name text) returns text
language plpgsql stable security definer set search_path = '' as $$
declare
  v text;
begin
  if to_regclass('vault.decrypted_secrets') is not null then
    execute 'select decrypted_secret from vault.decrypted_secrets where name = $1 limit 1' into v using p_name;
  end if;
  if v is null or v = '' then
    v := nullif(current_setting('app.settings.' || p_name, true), '');
  end if;
  if v is null or char_length(v) < 16 then
    raise exception using errcode = 'PT500', message = 'INTERNAL', detail = 'secret_missing:' || p_name,
      hint = 'Chưa cấu hình khóa bí mật máy chủ.';
  end if;
  return v;
end $$;

create function private.pair_hmac(p_code text) returns text
language sql stable security definer set search_path = '' as $$
  select encode(extensions.hmac(convert_to('pair:' || p_code, 'UTF8'),
                                convert_to(private.secret('pairing_secret'), 'UTF8'), 'sha256'), 'hex')
$$;

-- ============================================================ bảng mới (private) và chỉ mục
-- Parent PIN: mỗi QL một dòng (mỗi hộ một QL, một PIN). Băm bcrypt(pin || pepper); không bao giờ lưu PIN thô.
create table private.parent_pins (
  member_id    uuid primary key references app.members (id),
  pin_hash     text not null,
  failed_count int  not null default 0 check (failed_count >= 0),
  lock_level   int  not null default 0 check (lock_level >= 0),    -- số lần đã khóa liên tiếp (khóa lũy tiến)
  locked_until timestamptz,
  updated_at   timestamptz not null default now()
);

-- Giới hạn nhập mã ghép theo tài khoản người lớn và theo hộ (Architecture §5.3).
create table private.pair_throttle (
  scope        text not null check (scope in ('USER', 'HOUSEHOLD')),
  key          uuid not null,
  failed_count int  not null default 0 check (failed_count >= 0),
  window_start timestamptz not null default now(),
  locked_until timestamptz,
  primary key (scope, key)
);

alter table private.parent_pins   enable row level security;
alter table private.pair_throttle enable row level security;
revoke all on private.parent_pins, private.pair_throttle from public, anon, authenticated;
grant all on private.parent_pins, private.pair_throttle to service_role;

-- Mỗi máy tối đa một mã CON_HAN (mã mới hủy mã cũ); mỗi máy và mỗi con tối đa một yêu cầu chờ xác nhận.
create unique index pairing_codes_one_active_per_device
  on private.pairing_codes (device_user_id) where state = 'CON_HAN';
create unique index device_bindings_one_pending_per_device
  on app.device_bindings (device_user_id) where state = 'CHO_XAC_NHAN_MAY_CON';
create unique index device_bindings_one_pending_per_child
  on app.device_bindings (child_id) where state = 'CHO_XAC_NHAN_MAY_CON';

-- ============================================================ app.access_state: thêm 'child.pair' và claim epoch
-- child.pair = như child.update (chỉ QL, hộ đóng băng -> FROZEN).
-- RLS-EPOCH: nếu token có claim `binding_epoch` thì máy con chỉ được đọc khi nó KHỚP epoch hiện hành của liên kết
-- HIEU_LUC. Claim chỉ để THU HẸP quyền (token cũ bị loại), không bao giờ mở rộng: quyền gốc luôn là dòng
-- device_bindings state = 'HIEU_LUC' trên máy chủ. Máy con tự sửa claim chỉ làm hại chính nó.
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
    when 'child.update', 'child.delete', 'child.mode_set', 'child.pair' then
      if v_role <> 'PRIMARY' or v_role is null then return 'DENY'; end if;
      return case when v_frozen then 'FROZEN' else 'ALLOW' end;
    else
      return 'DENY';   -- hành động lạ: fail-closed
  end case;
end $$;

-- ============================================================ hàm nội bộ: giới hạn nhập mã, PIN
create function private.pair_throttle_check(p_user uuid, p_household uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_until timestamptz;
begin
  select max(t.locked_until) into v_until from private.pair_throttle t
  where t.locked_until > now()
    and ((t.scope = 'USER' and t.key = p_user) or (t.scope = 'HOUSEHOLD' and t.key = p_household));
  if v_until is not null then
    perform app.fail('RATE_LIMITED', 'BR-FAM-031', 'Đã thử quá nhiều lần. Hãy thử lại sau ít phút.');
  end if;
end $$;

-- Ghi một lần nhập mã sai cho cả tài khoản và hộ; vượt ngưỡng trong cửa sổ thì khóa.
create function private.pair_throttle_hit(p_user uuid, p_household uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_max  int := private.param_int('pair_confirm_max_fails');
  v_win  int := private.param_int('pair_confirm_window_minutes');
  v_lock int := private.param_int('pair_confirm_lock_minutes');
  r      record;
begin
  for r in select * from (values ('USER', p_user), ('HOUSEHOLD', p_household)) as x(scope, key) loop
    insert into private.pair_throttle as t (scope, key, failed_count, window_start)
    values (r.scope, r.key, 1, now())
    on conflict (scope, key) do update set
      failed_count = case when t.window_start <= now() - make_interval(mins => v_win) then 1 else t.failed_count + 1 end,
      window_start = case when t.window_start <= now() - make_interval(mins => v_win) then now() else t.window_start end,
      locked_until = null;
    update private.pair_throttle t set locked_until = now() + make_interval(mins => v_lock)
    where t.scope = r.scope and t.key = r.key and t.failed_count >= v_max;
  end loop;
end $$;

-- Kết quả thất bại chung cho mọi lý do liên quan tới mã (AC-FAM-11: không lộ mã có tồn tại không).
create function private.pair_fail(p_user uuid, p_household uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.pair_throttle_hit(p_user, p_household);
  return jsonb_build_object('ok', false, 'error', jsonb_build_object(
    'code', 'NOT_FOUND', 'rule', 'BR-FAM-031', 'message_vi', 'Mã không đúng hoặc đã hết hạn.'));
end $$;

-- Kiểm định dạng PIN: đúng pin_length chữ số, không phải dãy hiển nhiên (cùng một số, tăng/giảm dần).
create function private.pin_check_format(p_pin text) returns void
language plpgsql stable security definer set search_path = '' as $$
declare
  v_len int := private.param_int('pin_length');
begin
  if p_pin is null or p_pin !~ ('^[0-9]{' || v_len || '}$') then
    perform app.fail('VALIDATION', 'FR-01', 'PIN gồm ' || v_len || ' chữ số.');
  end if;
  if p_pin ~ '^(.)\1+$' or '01234567890123456789' like '%' || p_pin || '%'
     or '98765432109876543210' like '%' || p_pin || '%' then
    perform app.fail('VALIDATION', 'FR-01', 'PIN quá dễ đoán. Hãy chọn PIN khác.');
  end if;
end $$;

create function private.pin_store(p_member uuid, p_pin text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.parent_pins as p (member_id, pin_hash)
  values (p_member, extensions.crypt(p_pin || private.secret('pin_pepper'),
                                      extensions.gen_salt('bf', private.param_int('pin_bcrypt_cost'))))
  on conflict (member_id) do update set
    pin_hash = excluded.pin_hash, failed_count = 0, lock_level = 0, locked_until = null, updated_at = now();
end $$;

-- app.pin_verify: NỘI BỘ (không cấp EXECUTE cho ai). Trả {result: OK | WRONG | LOCKED | NOT_SET, ...}.
-- Đếm sai ghi vào private.parent_pins; vì hàm gọi nó phải trả giá trị (không raise) thì bộ đếm mới được giữ.
-- Khóa lũy tiến: sau pin_max_failures lần sai liên tiếp, khóa pin_lock_minutes * 2^(lần khóa - 1), trần pin_lock_max_minutes.
-- Đúng thì xóa bộ đếm. PIN null, rỗng, sai định dạng đều tính là SAI (fail-closed, FR01-T01).
create function app.pin_verify(p_member uuid, p_pin text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v        private.parent_pins;
  v_max    int := private.param_int('pin_max_failures');
  v_base   int := private.param_int('pin_lock_minutes');
  v_cap    int := private.param_int('pin_lock_max_minutes');
  v_ok     boolean;
  v_fail   int;
  v_level  int;
  v_until  timestamptz;
begin
  select * into v from private.parent_pins p where p.member_id = p_member for update;
  if not found then return jsonb_build_object('result', 'NOT_SET'); end if;
  if v.locked_until is not null and v.locked_until > now() then
    return jsonb_build_object('result', 'LOCKED', 'locked_until', v.locked_until);
  end if;

  v_ok := p_pin is not null and p_pin ~ '^[0-9]+$'
          and extensions.crypt(p_pin || private.secret('pin_pepper'), v.pin_hash) = v.pin_hash;
  if v_ok then
    update private.parent_pins p set failed_count = 0, lock_level = 0, locked_until = null where p.member_id = p_member;
    return jsonb_build_object('result', 'OK');
  end if;

  v_fail := v.failed_count + 1;
  v_level := v.lock_level;
  v_until := null;
  if v_fail >= v_max then
    v_level := v.lock_level + 1;
    v_until := now() + make_interval(mins => least(v_base::bigint * (1::bigint << least(v_level - 1, 20)), v_cap)::int);
    v_fail := 0;
  end if;
  update private.parent_pins p set failed_count = v_fail, lock_level = v_level, locked_until = v_until
  where p.member_id = p_member;
  return jsonb_build_object('result', 'WRONG', 'attempts_left', case when v_until is null then v_max - v_fail else 0 end,
                            'locked_until', v_until);
end $$;

-- ============================================================ app.pin_set (Tech Spec §3.1 #9; chỉ QL)
-- Đặt hoặc đổi PIN của chính QL. Đổi PIN xóa bộ đếm sai và khóa (QL đã đăng nhập là người có quyền).
-- Quy trình đặt/đổi/khôi phục PIN là UNKNOWN (BR-FAM-028, BR-FAM-071): mặc định an toàn, chỉ QL của hộ, không PIN cũ.
-- Máy con (ẩn danh) và người lớn khác không gọi được: không có đường "reset PIN" nào cho máy con (FR01-T02).
-- Hộ đóng băng -> FROZEN.
create function app.pin_set(p_pin text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_m     app.members;
  v_frozen boolean;
  v_new   boolean;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'FR-01', 'Máy của con không đặt được PIN.');
  end if;
  select * into v_m from app.members m where m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  if not found or v_m.role <> 'PRIMARY' then
    perform app.fail('FORBIDDEN', 'BR-FAM-004', 'Chỉ người quản lý chính đặt được PIN.');
  end if;
  select (h.state <> 'HOAT_DONG' or h.frozen_at is not null) into v_frozen
  from app.households h where h.id = v_m.household_id and h.hidden_at is null;
  if v_frozen is null then perform app.fail('NOT_FOUND', null, 'Không tìm thấy.'); end if;
  if v_frozen then perform app.fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa thay đổi được.'); end if;

  perform private.pin_check_format(p_pin);
  v_new := not exists (select 1 from private.parent_pins p where p.member_id = v_m.id);
  perform private.pin_store(v_m.id, p_pin);
  return jsonb_build_object('ok', true, 'created', v_new);
end $$;

-- ============================================================ app.pair_code_create (Tech Spec §3.2; BR-FAM-030)
-- Người gọi: máy con = người dùng ẩn danh. Người lớn đăng nhập thật không gọi được.
-- Máy đã có liên kết HIEU_LUC: VALIDATION (phải hủy liên kết trước, BR-FAM-036).
-- Mã mới làm mã cũ của máy này HET_HAN. Mã 6 chữ số (20 bit): an toàn dựa vào hạn ngắn, giới hạn nhập sai theo
-- tài khoản + hộ, và khóa HMAC không nằm trong CSDL; KHÔNG dựa vào độ dài mã. Trả mã thô đúng một lần.
create function app.pair_code_create() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_ttl   int := private.param_int('pair_code_ttl_minutes');
  v_per_h int := private.param_int('pair_code_create_per_hour');
  v_code  text;
  v_n     bigint;
  v_exp   timestamptz;
  v_try   int := 0;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if not app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'FR-01', 'Chỉ máy của con tạo mã ghép.');
  end if;
  if exists (select 1 from app.device_bindings b where b.device_user_id = v_uid and b.state = 'HIEU_LUC') then
    perform app.fail('VALIDATION', 'BR-FAM-036', 'Máy này đã ghép. Hãy hủy liên kết trước khi ghép lại.');
  end if;
  if (select count(*) from private.pairing_codes c
      where c.device_user_id = v_uid and c.created_at > now() - interval '1 hour') >= v_per_h then
    perform app.fail('RATE_LIMITED', 'BR-FAM-030', 'Tạo mã quá nhiều lần. Hãy thử lại sau.');
  end if;

  update private.pairing_codes c set state = 'HET_HAN' where c.device_user_id = v_uid and c.state = 'CON_HAN';
  v_exp := now() + make_interval(mins => v_ttl);

  loop
    v_try := v_try + 1;
    if v_try > 20 then
      raise exception using errcode = 'PT500', message = 'INTERNAL', detail = 'pair_code_collision', hint = 'Thử lại.';
    end if;
    -- 4 byte ngẫu nhiên mật mã học, loại bỏ phần dư để mã đều nhau (không lệch modulo)
    v_n := ('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint;
    continue when v_n >= 4294000000;
    v_code := lpad((v_n % 1000000)::text, 6, '0');
    begin
      insert into private.pairing_codes (device_user_id, code_hmac, expires_at)
      values (v_uid, private.pair_hmac(v_code), v_exp);
      exit;
    exception when unique_violation then
      null;   -- trùng HMAC với mã đang hạn của máy khác: sinh mã khác
    end;
  end loop;

  return jsonb_build_object('code', v_code, 'expires_at', v_exp, 'ttl_minutes', v_ttl);
end $$;

-- ============================================================ app.pair_confirm (Tech Spec §3.2; BR-FAM-031, 032, 036, 037)
-- Người gọi: QL của hộ chứa p_child. Kiểm: con thuộc hộ không đóng băng, has_device = true, con chưa có HIEU_LUC,
-- Parent PIN (lần ghép đầu của QL phải kèm p_pin; sau đó không gửi p_pin, đổi PIN bằng pin_set), rồi mới tới mã.
-- Mọi lý do liên quan tới mã (sai định dạng, không có, hết hạn, đã dùng, máy đã ghép nơi khác) trả CÙNG MỘT kết quả
-- {"ok": false, "error": {"code": "NOT_FOUND"...}} và tính một lần sai (AC-FAM-11, AC-FAM-12).
-- Thành công: mã DA_DUNG; binding CHO_XAC_NHAN_MAY_CON (máy con còn phải bấm Đồng ý, AD-11).
-- Máy này từng ghép hiệu lực ở HỘ KHÁC rồi đã hủy: binding là CHO_XAC_MINH, KHÔNG quyền gì (AC-FAM-16, FR01-T06);
-- nấc 1 không có đường nâng CHO_XAC_MINH lên HIEU_LUC. Hộ cũ hủy hợp lệ rồi hộ B nhập mã: không dữ liệu nào đi theo.
-- Epoch của binding mới = epoch lớn nhất từng có của con + 1 (không bao giờ dùng lại số cũ).
create function app.pair_confirm(p_child uuid, p_code text, p_pin text default null) returns jsonb
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

-- ============================================================ app.pair_pending / pair_accept / pair_decline (máy con)
-- pair_pending: máy con xem yêu cầu đang chờ để hiện "Kết nối với [tên gọi người lớn]? Đồng ý / Không" (AD-11).
-- Chỉ trả yêu cầu CHO_XAC_NHAN_MAY_CON còn trong hạn; CHO_XAC_MINH không lộ ra máy.
create function app.pair_pending() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_win int := private.param_int('pair_accept_window_minutes');
  r     record;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if not app.is_anonymous_caller() then perform app.fail('FORBIDDEN', 'FR-01', 'Chỉ máy của con.'); end if;
  select b.id, m.call_name, b.created_at + make_interval(mins => v_win) as expires_at into r
  from app.device_bindings b join app.members m on m.id = b.paired_by_member_id
  where b.device_user_id = v_uid and b.state = 'CHO_XAC_NHAN_MAY_CON'
    and b.created_at + make_interval(mins => v_win) > now();
  if not found then return jsonb_build_object('pending', false); end if;
  return jsonb_build_object('pending', true, 'binding_id', r.id, 'adult_call_name', r.call_name, 'expires_at', r.expires_at);
end $$;

-- pair_accept: máy con chạm Đồng ý. CHO_XAC_NHAN_MAY_CON -> HIEU_LUC, epoch + 1, xóa mã của máy.
-- Quá hạn (pair_accept_window_minutes): binding DA_HUY (HET_HAN_XAC_NHAN), trả ok=false (ghi nhận nên không raise).
-- Gọi lại khi đã HIEU_LUC: trả bản ghi cũ (replay, idempotent). Hộ đóng băng -> FROZEN. QL đã mất vai -> NOT_FOUND.
create function app.pair_accept() returns jsonb
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

  begin
    update app.device_bindings b set state = 'HIEU_LUC', epoch = b.epoch + 1, paired_at = now()
    where b.id = v_b.id returning * into v_b;
  exception when unique_violation then
    perform app.fail('VALIDATION', 'BR-FAM-032', 'Con này hoặc máy này đã có liên kết khác.');
  end;
  delete from private.pairing_codes c where c.device_user_id = v_uid;
  return jsonb_build_object('ok', true, 'replay', false, 'binding_id', v_b.id, 'child_id', v_b.child_id, 'epoch', v_b.epoch);
end $$;

-- pair_decline: máy con chạm Không. Idempotent: không có yêu cầu thì trả declined = false.
create function app.pair_decline() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_n   int;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if not app.is_anonymous_caller() then perform app.fail('FORBIDDEN', 'FR-01', 'Chỉ máy của con.'); end if;
  update app.device_bindings b set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'MAY_CON_TU_CHOI'
  where b.device_user_id = v_uid and b.state = 'CHO_XAC_NHAN_MAY_CON';
  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', true, 'declined', v_n > 0);
end $$;

-- ============================================================ Đặc quyền
revoke all on function
  private.secret(text), private.pair_hmac(text),
  private.pair_throttle_check(uuid, uuid), private.pair_throttle_hit(uuid, uuid), private.pair_fail(uuid, uuid),
  private.pin_check_format(text), private.pin_store(uuid, text)
  from public, anon, authenticated;

revoke all on function
  app.pin_verify(uuid, text), app.pin_set(text), app.pair_code_create(), app.pair_confirm(uuid, text, text),
  app.pair_pending(), app.pair_accept(), app.pair_decline()
  from public, anon, authenticated;
-- pin_verify là nội bộ: không cấp cho ai (kể cả authenticated).
grant execute on function
  app.pin_set(text), app.pair_code_create(), app.pair_confirm(uuid, text, text),
  app.pair_pending(), app.pair_accept(), app.pair_decline()
  to authenticated;
