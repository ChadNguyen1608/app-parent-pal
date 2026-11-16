-- T2.4 (Dev Plan 15.1 Đợt 2; Tech Spec §2.1 `trial_slots`, §2.6 `deletion_evidence`, `job_runs`, §2.8 `app.purge_household`,
-- §3 #31 `export-request`, #34 `trial-*`, §4.2 `job-trial-purge`; BL 11.3 §4.8 BR-CON-056, 064, 080..089, EC-CON-14, 15;
-- D-01, D-44, D-45; AC-CON-17..21, 23..26; C-H4). Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Gồm:
--  1. `app.trial_slots` (tối đa 3 `DANG_THU`, bắt buộc hạn kết thúc và mã phiếu giấy, hạn tối đa `trial_max_days`), FK
--     `households.trial_slot_id`, mỗi vị trí một hộ, hộ thử chỉ gắn vào vị trí đang `DANG_THU` (BR-CON-080).
--  2. `app.deletion_evidence` (bằng chứng xóa: mã băm của hộ, lý do, số dòng đã xóa theo bảng; KHÔNG dữ liệu cá nhân).
--  3. `app.purge_household(household, reason)`: xóa THẬT toàn bộ dữ liệu của một hộ trong MỘT giao dịch theo thứ tự khóa ngoại,
--     kể cả bảng chỉ-thêm (đường riêng, chỉ trong hàm này) và người dùng đăng nhập (người lớn, máy con ẩn danh). Chỉ cho dữ liệu
--     GIA_LAP và hộ thử nội bộ đã hết hạn hoặc đã rút; mọi loại khác: BLOCKED_H4 (BR-CON-056, AC-CON-20).
--  4. `private.job_trial_purge`: xóa sau `trial_purge_after_days` (7, D-44) ngày kể từ ngày kết thúc; vị trí RUT_SOM: xóa ngay
--     (lần chạy kế tiếp, xem README). `private.trial_end_due`: hết hạn thử -> HET_THU, hộ sang CHO_XOA (ngừng thu).
--  5. `app.trial_open/trial_close/trial_attach` (service_role = chủ sản phẩm; `trial-open/close` của Tech Spec §3 #34).
--  6. `app.export_request`: luôn BLOCKED_H4 ở đợt thử (chưa dựng bản xuất).
--  7. Móc "rút giữa chừng": một yêu cầu xóa kiểu RUT_TOAN_BO (hoặc xóa cả gia đình) của hộ thử đặt vị trí sang RUT_SOM.
--
-- QUYẾT ĐỊNH MẶC ĐỊNH (tài liệu thiếu hoặc mơ hồ; chờ chủ sản phẩm duyệt):
--  1. "Ngày kết thúc" `end_date` là ngày CUỐI được thu. Job-daily chuyển HET_THU khi `end_date` < hôm nay (giờ VN); xóa khi
--     hôm nay >= `end_date` + 7 (D-44 "7 ngày sau ngày kết thúc"). Thu và xóa dùng ngày theo Asia/Ho_Chi_Minh.
--  2. Hết hạn hoặc rút: hộ sang `state = 'CHO_XOA'` (ngừng thu: mọi hàm ghi FROZEN, máy con và NL không đọc, QL đọc được, không
--     mở lại được). Dùng lại nghĩa "ngừng xử lý" của đóng băng nên không đụng `app.access_state`.
--  3. Một yêu cầu rút toàn bộ của MỘT con trong hộ thử = hộ rút (BR-CON-087), xóa cả hộ (đơn vị xóa là hộ, `purge_household`).
--     Nếu chủ sản phẩm muốn chỉ xóa con đó khi hộ còn con khác: cần hàm xóa theo con (chưa làm).
--  4. `purge_household` cũng xóa dòng `auth.users` của người lớn trong hộ và máy con chỉ gắn với hộ này (một người dùng còn
--     liên kết ở hộ khác thì giữ). Chưa kiểm trên Supabase thật (stub chỉ có bảng `auth.users` tối thiểu): nếu dự án thật từ chối
--     DELETE trên auth.users cho vai chạy hàm, đặt `purge_delete_auth_users = 0` thì hàm trả `auth_user_ids` (chưa xóa) để Edge
--     Function xóa bằng Auth Admin API, và nhớ gọi.
--  5. `deletion_evidence` giữ thêm `data_class` và `trial_slot_id` (không cá nhân) để đối chiếu với phiếu giấy (D-44: phiếu và nhật
--     ký xóa giữ tới khi luật sư cho ý kiến). Mã băm = sha256 của id hộ, id ngẫu nhiên (không dò ngược được khi không có id).
--  6. `export_request` ở đợt thử luôn BLOCKED_H4, kể cả hộ thử (BR-CON-064 cho phép xuất cho hộ thử, nhưng bản xuất chưa dựng).
--  7. Không có hoàn tác sau khi yêu cầu xóa (BR-FAM-084 UNKNOWN), không hạn xóa hẳn cho dữ liệu khác (PR-CON-01 UNKNOWN, AC-CON-18, 19).

-- ============================================================ mã lỗi: thêm BLOCKED_H4 (403)
create or replace function app.fail(p_code text, p_rule text default null, p_message_vi text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_state text;
begin
  v_state := case p_code
    when 'UNAUTHENTICATED' then 'PT401'
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
  ('trial_purge_after_days', 7, 'DA_CHOT', 'D-44: xóa dữ liệu hộ thử 7 ngày sau ngày kết thúc'),
  ('trial_max_active', 3, 'DA_CHOT', 'D-01, D-45, PR-CON-10: tối đa 3 hộ thử cùng lúc (AC-CON-23)'),
  ('trial_max_days', 14, 'CHUA_CHOT', 'Tech Spec §2.1 [MĐKT], Q-ARC-09: hạn kết thúc tối đa N ngày kể từ lúc mở vị trí thử; PR-CON-09 do chủ sản phẩm chọn hạn từng vị trí'),
  ('purge_delete_auth_users', 1, 'CHUA_CHOT', 'Kỹ thuật: 1 = purge_household xóa luôn auth.users của hộ (chưa kiểm trên Supabase thật); 0 = trả auth_user_ids để Edge Function xóa bằng Admin API');

-- Chỉ hệ thống (service_role, job, quản trị CSDL) gọi hàm quản trị; JWT của người dùng đăng nhập thì không (phòng thủ chiều sâu, ngoài EXECUTE).
create function private.require_system() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if coalesce((select auth.jwt()) ->> 'role', '') in ('authenticated', 'anon') then
    perform app.fail('FORBIDDEN', 'D-44', 'Chỉ hệ thống thực hiện được.');
  end if;
end $$;
revoke all on function private.require_system() from public, anon, authenticated;

create function private.today_vn(p_now timestamptz default clock_timestamp()) returns date
language sql stable set search_path = '' as $$
  select (p_now at time zone 'Asia/Ho_Chi_Minh')::date
$$;
revoke all on function private.today_vn(timestamptz) from public, anon, authenticated;

-- ============================================================ app.trial_slots (Tech Spec §2.1; AC-CON-23, 24)
create table app.trial_slots (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  end_date          date,                                   -- ngày cuối được thu (giờ VN)
  consent_paper_ref text check (consent_paper_ref ~ '^[A-Za-z0-9._-]{1,40}$'),   -- chỉ mã phiếu giấy, không bản scan hay dữ liệu cá nhân (BR-CON-082)
  state             text not null default 'CHUA_MO'
                    check (state in ('CHUA_MO', 'DANG_THU', 'HET_THU', 'RUT_SOM', 'XOA_XONG', 'TU_CHOI')),
  opened_at         timestamptz,
  ended_at          timestamptz,
  purge_due_at      date,                                   -- = end_date + trial_purge_after_days (trigger đặt); RUT_SOM: hôm nay
  purged_at         timestamptz,
  check (state in ('CHUA_MO', 'TU_CHOI') or (end_date is not null and consent_paper_ref is not null)),
  check ((state = 'XOA_XONG') = (purged_at is not null))
);

create function app.tg_trial_slot_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_today date := private.today_vn();
  v_after int  := private.param_int('trial_purge_after_days');
  v_max   int  := private.param_int('trial_max_active');
  v_days  int  := private.param_int('trial_max_days');
  v_n     int;
begin
  if tg_op = 'UPDATE' and old.state is distinct from new.state and not (
       (old.state = 'CHUA_MO'  and new.state in ('DANG_THU', 'TU_CHOI'))
    or (old.state = 'DANG_THU' and new.state in ('HET_THU', 'RUT_SOM'))
    or (old.state = 'HET_THU'  and new.state in ('RUT_SOM', 'XOA_XONG'))
    or (old.state = 'RUT_SOM'  and new.state = 'XOA_XONG')) then
    raise exception 'trial_slots: không chuyển trạng thái % -> %', old.state, new.state using errcode = '23514';
  end if;

  if new.state = 'DANG_THU' and (tg_op = 'INSERT' or old.state <> 'DANG_THU') then
    if new.end_date is null or new.consent_paper_ref is null then
      raise exception 'trial_slots: mở vị trí thử cần hạn kết thúc và mã phiếu đồng ý (BR-CON-082)' using errcode = '23514';
    end if;
    if new.end_date < v_today or new.end_date > v_today + v_days then
      raise exception 'trial_slots: hạn kết thúc phải từ hôm nay đến hôm nay + % ngày', v_days using errcode = '23514';
    end if;
    perform pg_advisory_xact_lock(hashtext('pp.trial_slots'));   -- tuần tự hóa mở vị trí để đếm không bị vượt
    select count(*) into v_n from app.trial_slots s where s.state = 'DANG_THU' and s.id <> new.id;
    if v_n >= v_max then
      raise exception 'trial_slots: đã đủ % hộ thử đang chạy (BR-CON-081)', v_max using errcode = '23514';
    end if;
    new.opened_at := coalesce(new.opened_at, clock_timestamp());
  end if;

  if tg_op = 'UPDATE' and old.state in ('DANG_THU', 'HET_THU') and new.end_date > old.end_date then
    raise exception 'trial_slots: chỉ được rút ngắn hạn kết thúc' using errcode = '23514';
  end if;

  if new.state in ('HET_THU', 'RUT_SOM') and (tg_op = 'INSERT' or old.state not in ('HET_THU', 'RUT_SOM')) then
    new.ended_at := coalesce(new.ended_at, clock_timestamp());
  end if;
  if new.state in ('DANG_THU', 'HET_THU') then
    new.purge_due_at := new.end_date + v_after;
  elsif new.state = 'RUT_SOM' then
    new.purge_due_at := v_today;
  end if;
  return new;
end $$;
create trigger trial_slots_guard before insert or update on app.trial_slots
  for each row execute function app.tg_trial_slot_guard();

-- Hết hạn hoặc rút: ngừng thu ngay (hộ sang CHO_XOA, BR-CON-086).
create function app.tg_trial_slot_ended() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update app.households set state = 'CHO_XOA'
   where trial_slot_id = new.id and state in ('HOAT_DONG', 'DONG_BANG');
  return null;
end $$;
create trigger trial_slots_ended after update of state on app.trial_slots
  for each row when (new.state in ('HET_THU', 'RUT_SOM') and old.state is distinct from new.state)
  execute function app.tg_trial_slot_ended();

-- ============================================================ households: FK, mỗi vị trí một hộ, chỉ gắn vào vị trí đang thu
alter table app.households
  add constraint households_trial_slot_fkey foreign key (trial_slot_id) references app.trial_slots (id);
create unique index households_one_per_trial_slot on app.households (trial_slot_id) where trial_slot_id is not null;

create function app.tg_household_trial_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and old.data_class = 'THU_NOI_BO_D01' and new.data_class is distinct from old.data_class then
    raise exception 'households: hộ thử nội bộ không đổi lại loại dữ liệu' using errcode = '23514';
  end if;
  if new.data_class = 'THU_NOI_BO_D01'
     and (tg_op = 'INSERT' or old.data_class is distinct from new.data_class or old.trial_slot_id is distinct from new.trial_slot_id)
     and not exists (select 1 from app.trial_slots s where s.id = new.trial_slot_id and s.state = 'DANG_THU') then
    raise exception 'households: hộ thử nội bộ chỉ gắn vào vị trí thử đang mở (BR-CON-080)' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger households_trial_guard before insert or update of data_class, trial_slot_id on app.households
  for each row execute function app.tg_household_trial_guard();

-- Rút giữa chừng (BR-CON-087, AC-CON-26): yêu cầu rút toàn bộ hoặc xóa gia đình của hộ thử -> vị trí RUT_SOM (xóa ở lần chạy kế tiếp).
create function app.tg_trial_withdraw() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update app.trial_slots s set state = 'RUT_SOM'
    from app.households h
   where h.id = new.household_id and h.trial_slot_id = s.id and s.state in ('DANG_THU', 'HET_THU');
  return null;
end $$;
create trigger deletion_requests_trial_withdraw after insert on app.deletion_requests
  for each row when (new.reason = 'RUT_TOAN_BO' or new.scope = 'GIA_DINH')
  execute function app.tg_trial_withdraw();

-- ============================================================ app.deletion_evidence (Tech Spec §2.6; D-44; chỉ-thêm; không dữ liệu cá nhân)
create table app.deletion_evidence (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  household_ref_hash text not null unique check (household_ref_hash ~ '^[0-9a-f]{64}$'),
  reason             text not null check (reason in ('HET_THU', 'RUT_SOM', 'GIA_LAP_DIEN_TAP', 'OWNER')),
  data_class         text not null check (data_class in ('GIA_LAP', 'THU_NOI_BO_D01')),
  trial_slot_id      uuid references app.trial_slots (id),
  purged_at          timestamptz not null default clock_timestamp(),
  row_counts         jsonb not null check (jsonb_typeof(row_counts) = 'object')
);
create function app.tg_evidence_validate() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  k text;
  v jsonb;
begin
  for k, v in select * from jsonb_each(new.row_counts) loop
    if k !~ '^(app|private|auth)\.[a-z_]+$' or jsonb_typeof(v) <> 'number' or (v #>> '{}') !~ '^[0-9]{1,6}$' then
      raise exception 'deletion_evidence: row_counts chỉ gồm tên bảng và số dòng' using errcode = '23514';
    end if;
  end loop;
  return new;
end $$;
create trigger deletion_evidence_validate before insert on app.deletion_evidence
  for each row execute function app.tg_evidence_validate();
create trigger deletion_evidence_append_only before update or delete on app.deletion_evidence
  for each row execute function app.tg_append_only();
create trigger deletion_evidence_no_truncate before truncate on app.deletion_evidence
  for each statement execute function app.tg_append_only();

-- ============================================================ đường xóa riêng cho bảng chỉ-thêm (chỉ trong purge_household)
-- Bảng chỉ-thêm (audit_log, mode_history, consent_events) chặn DELETE kể cả quản trị. purge_household ghi một dòng vào
-- private.purge_context (khóa theo mã giao dịch) rồi xóa; trigger chỉ cho DELETE (không TRUNCATE, không UPDATE) của đúng ba bảng đó
-- và chỉ khi giao dịch hiện tại có dòng ngữ cảnh. Không vai nào có quyền ghi bảng ngữ cảnh (kể cả service_role).
create table private.purge_context (
  txid         bigint primary key,
  household_id uuid not null,
  created_at   timestamptz not null default clock_timestamp()
);
alter table private.purge_context enable row level security;
revoke all on private.purge_context from public, anon, authenticated, service_role;

create or replace function app.tg_append_only() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' and tg_table_schema = 'app' and tg_table_name in ('audit_log', 'mode_history', 'consent_events')
     and exists (select 1 from private.purge_context c where c.txid = txid_current()) then
    return old;
  end if;
  raise exception 'append-only table: % not allowed', tg_op using errcode = '55000';
end $$;

-- ============================================================ app.purge_household (Tech Spec §2.8; BR-CON-056, 086, 087; AC-CON-20, 25, 26)
-- Vào: p_household, p_reason ('HET_THU' | 'RUT_SOM' | 'GIA_LAP_DIEN_TAP' | 'OWNER'). Chỉ hệ thống.
-- Ra: {ok, replay, row_counts, auth_users_deleted, auth_user_ids} (auth_user_ids: chưa xóa, cho Edge Function; rỗng khi đã xóa).
-- Từ chối: loại dữ liệu ngoài GIA_LAP / THU_NOI_BO_D01 -> BLOCKED_H4; hộ thử mà vị trí chưa HET_THU/RUT_SOM -> VALIDATION.
-- Gửi lặp (hộ đã xóa, còn bằng chứng): replay. Thứ tự xóa theo khóa ngoại; mỗi lệnh một dòng để kiểm đột biến.
create function app.purge_household(p_household uuid, p_reason text) returns jsonb
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

-- ============================================================ job: hết hạn thử và xóa
-- trial_end_due: DANG_THU quá ngày cuối -> HET_THU (trigger đưa hộ sang CHO_XOA = ngừng thu). Gọi từ job_daily và job_trial_purge (chạy bù).
create function private.trial_end_due(p_now timestamptz default clock_timestamp()) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_n int;
begin
  update app.trial_slots set state = 'HET_THU' where state = 'DANG_THU' and end_date < private.today_vn(p_now);
  get diagnostics v_n = row_count;
  return jsonb_build_object('ended', v_n);
end $$;

create or replace function private.job_daily(p_now timestamptz default clock_timestamp()) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_res jsonb;
begin
  v_res := jsonb_build_object('freeze', private.job_freeze_idle(p_now), 'trial_end', private.trial_end_due(p_now));
  insert into app.job_runs (job, status, summary) values ('job-daily', 'OK', v_res);
  return v_res;
end $$;

-- job_trial_purge: vị trí RUT_SOM (xóa ngay) và HET_THU có purge_due_at <= hôm nay (D-44). Mỗi hộ một giao dịch con: lỗi một hộ
-- không chặn hộ khác (ghi LOI, giữ nguyên dữ liệu hộ đó). p_only_withdrawn = true: chỉ xử lý RUT_SOM (lịch chạy dày để "xóa ngay").
-- Chỉ GIA_LAP và THU_NOI_BO_D01 bị chạm (purge_household từ chối loại khác); hộ không có vị trí thử không bao giờ bị job xóa.
create function private.job_trial_purge(p_now timestamptz default clock_timestamp(), p_only_withdrawn boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_today  date := private.today_vn(p_now);
  r        record;
  h        record;
  v_ok     int := 0;
  v_fail   int := 0;
  v_ended  jsonb;
  v_res    jsonb;
begin
  v_ended := private.trial_end_due(p_now);
  for r in
    select s.id, s.state from app.trial_slots s
    where s.state = 'RUT_SOM' or (not p_only_withdrawn and s.state = 'HET_THU' and s.purge_due_at <= v_today)
    order by s.purge_due_at, s.id
  loop
    for h in select hh.id from app.households hh where hh.trial_slot_id = r.id loop
      begin
        perform app.purge_household(h.id, case when r.state = 'RUT_SOM' then 'RUT_SOM' else 'HET_THU' end);
        v_ok := v_ok + 1;
      exception when others then
        v_fail := v_fail + 1;
      end;
    end loop;
    -- vị trí chưa gắn hộ nào (hoặc hộ đã xóa): đóng sổ
    if not exists (select 1 from app.households hh where hh.trial_slot_id = r.id) then
      update app.trial_slots set state = 'XOA_XONG', purged_at = clock_timestamp() where id = r.id and state <> 'XOA_XONG';
    end if;
  end loop;
  v_res := jsonb_build_object('purged', v_ok, 'failed', v_fail, 'ended', v_ended -> 'ended');
  if not p_only_withdrawn or v_ok + v_fail > 0 then
    insert into app.job_runs (job, status, summary)
    values ('job-trial-purge', case when v_fail > 0 then 'LOI' else 'OK' end, v_res);
  end if;
  return v_res;
end $$;

-- ============================================================ vị trí thử: hàm cho chủ sản phẩm (service_role; Edge Function trial-open/close)
create function app.trial_open(p_end_date date, p_consent_paper_ref text, p_slot uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_s app.trial_slots;
begin
  perform private.require_system();
  if p_end_date is null or p_consent_paper_ref is null or btrim(p_consent_paper_ref) = '' then
    perform app.fail('VALIDATION', 'BR-CON-082', 'Cần hạn kết thúc và mã phiếu đồng ý của bố mẹ.');
  end if;
  if p_consent_paper_ref !~ '^[A-Za-z0-9._-]{1,40}$' then
    perform app.fail('VALIDATION', 'BR-CON-082', 'Mã phiếu chỉ gồm chữ, số, dấu chấm, gạch (tối đa 40 ký tự).');
  end if;
  if p_end_date < private.today_vn() or p_end_date > private.today_vn() + private.param_int('trial_max_days') then
    perform app.fail('VALIDATION', 'PR-CON-09', 'Hạn kết thúc ngoài khoảng cho phép.');
  end if;
  if (select count(*) from app.trial_slots s where s.state = 'DANG_THU' and s.id is distinct from p_slot)
       >= private.param_int('trial_max_active') then
    perform app.fail('VALIDATION', 'BR-CON-081', 'Đã đủ số hộ thử cùng lúc.');
  end if;
  if p_slot is null then
    insert into app.trial_slots (end_date, consent_paper_ref, state) values (p_end_date, p_consent_paper_ref, 'DANG_THU')
    returning * into v_s;
  else
    update app.trial_slots set end_date = p_end_date, consent_paper_ref = p_consent_paper_ref, state = 'DANG_THU'
     where id = p_slot and state = 'CHUA_MO' returning * into v_s;
    if not found then perform app.fail('NOT_FOUND'); end if;
  end if;
  return jsonb_build_object('ok', true, 'slot_id', v_s.id, 'state', v_s.state, 'end_date', v_s.end_date, 'purge_due_at', v_s.purge_due_at);
end $$;

-- Kết thúc sớm (BR-CON-086): ngừng thu ngay; ngày kết thúc = hôm nay, xóa sau trial_purge_after_days ngày (D-44).
create function app.trial_close(p_slot uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_s app.trial_slots;
begin
  perform private.require_system();
  update app.trial_slots set state = 'HET_THU', end_date = least(end_date, private.today_vn())
   where id = p_slot and state = 'DANG_THU' returning * into v_s;
  if not found then perform app.fail('NOT_FOUND'); end if;
  return jsonb_build_object('ok', true, 'slot_id', v_s.id, 'state', v_s.state, 'end_date', v_s.end_date, 'purge_due_at', v_s.purge_due_at);
end $$;

-- Gắn hộ (đã tạo bằng family_create, GIA_LAP) vào vị trí đang thu: từ đây là dữ liệu THU_NOI_BO_D01.
create function app.trial_attach(p_household uuid, p_slot uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_h app.households;
begin
  perform private.require_system();
  select * into v_h from app.households h where h.id = p_household for update;
  if not found then perform app.fail('NOT_FOUND'); end if;
  if v_h.trial_slot_id = p_slot then
    return jsonb_build_object('ok', true, 'replay', true, 'slot_id', p_slot);
  end if;
  if v_h.data_class <> 'GIA_LAP' or v_h.state <> 'HOAT_DONG' or v_h.hidden_at is not null then
    perform app.fail('VALIDATION', 'BR-CON-080', 'Chỉ gắn được hộ giả lập đang hoạt động.');
  end if;
  if exists (select 1 from app.households h where h.trial_slot_id = p_slot) then
    perform app.fail('VALIDATION', 'BR-CON-081', 'Vị trí thử này đã có hộ.');
  end if;
  if not exists (select 1 from app.trial_slots s where s.id = p_slot and s.state = 'DANG_THU') then
    perform app.fail('VALIDATION', 'BR-CON-080', 'Vị trí thử chưa mở hoặc đã kết thúc.');
  end if;
  update app.households set data_class = 'THU_NOI_BO_D01', trial_slot_id = p_slot where id = p_household;
  return jsonb_build_object('ok', true, 'replay', false, 'slot_id', p_slot);
end $$;

-- ============================================================ app.export_request (Tech Spec #31; AC-CON-20; BR-CON-056, 064)
-- Đợt thử chưa dựng bản xuất: mọi lời gọi hợp lệ của QL trả BLOCKED_H4 (nhánh an toàn). Không ghi gì.
create function app.export_request(p_scope text default 'GIA_DINH', p_child uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_m   app.members;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'BR-CON-060', 'Máy của con không yêu cầu xuất dữ liệu.');
  end if;
  select * into v_m from app.members m where m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  if not found then perform app.fail('NOT_FOUND'); end if;
  if v_m.role <> 'PRIMARY' then
    perform app.fail('FORBIDDEN', 'BR-CON-060', 'Chỉ người quản lý chính yêu cầu xuất dữ liệu của gia đình.');
  end if;
  if p_scope is null or p_scope not in ('GIA_DINH', 'HO_SO_CON') then
    perform app.fail('VALIDATION', 'BR-CON-060', 'Phạm vi xuất không hợp lệ.');
  end if;
  perform app.fail('BLOCKED_H4', 'BR-CON-056', 'Xuất dữ liệu chưa mở ở bản thử.');
  return null;   -- không tới được
end $$;

-- ============================================================ RLS, chính sách, đặc quyền
alter table app.trial_slots       enable row level security;
alter table app.deletion_evidence enable row level security;   -- không chính sách: chỉ service_role

-- QL đọc trạng thái vị trí thử của hộ mình (Tech Spec §2.7); không ai khác.
create policy trial_slots_select on app.trial_slots for select to authenticated
  using (exists (select 1 from app.households h
                 where h.trial_slot_id = trial_slots.id
                   and (select app_internal.can_household((select auth.uid()), 'household.admin_read', h.id))));

revoke all on app.trial_slots, app.deletion_evidence from public, anon, authenticated;
grant select on app.trial_slots to authenticated;
grant all on app.trial_slots, app.deletion_evidence to service_role;

revoke all on function
  app.tg_trial_slot_guard(), app.tg_trial_slot_ended(), app.tg_household_trial_guard(), app.tg_trial_withdraw(),
  app.tg_evidence_validate(),
  app.purge_household(uuid, text), app.trial_open(date, text, uuid), app.trial_close(uuid), app.trial_attach(uuid, uuid),
  app.export_request(text, uuid),
  private.trial_end_due(timestamptz), private.job_daily(timestamptz), private.job_trial_purge(timestamptz, boolean)
  from public, anon, authenticated;
grant execute on function
  app.purge_household(uuid, text), app.trial_open(date, text, uuid), app.trial_close(uuid), app.trial_attach(uuid, uuid),
  private.trial_end_due(timestamptz), private.job_daily(timestamptz), private.job_trial_purge(timestamptz, boolean)
  to service_role;
grant execute on function app.export_request(text, uuid) to authenticated;

-- ============================================================ đăng ký cron (thay bản T2.3): thêm xóa hộ thử
-- 03:00 giờ VN = 20:00 UTC; "xóa ngay" khi rút: mỗi 10 phút chỉ xử lý vị trí RUT_SOM.
create or replace function private.register_cron_jobs() returns text
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    return 'SKIPPED_NO_PG_CRON';
  end if;
  execute $c$select cron.schedule('pp_job_daily', '5 17 * * *', 'select private.job_daily()')$c$;
  execute $c$select cron.schedule('pp_job_trial_purge', '0 20 * * *', 'select private.job_trial_purge()')$c$;
  execute $c$select cron.schedule('pp_job_trial_purge_withdrawn', '*/10 * * * *', 'select private.job_trial_purge(clock_timestamp(), true)')$c$;
  return 'OK';
end $$;
do $$ begin perform private.register_cron_jobs(); end $$;
