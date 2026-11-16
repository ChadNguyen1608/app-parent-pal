-- T2.2 (Dev Plan 15.1 Đợt 2; Tech Spec §2.5 `deletion_requests`, §3 #13 `consent-withdraw-all`; BL 11.3 §3.2, BR-CON-026..028,
-- 052, 070; D-42; AC-CON-06). Người soạn: AI, chưa kiểm chứng độc lập.
--
-- app.consent_withdraw_all(p_child, p_confirm_token): rút toàn bộ đồng ý của MỘT con, HAI BƯỚC do máy chủ ép:
--   Bước 1 (p_confirm_token null): trả hệ quả sẽ xảy ra và một confirm_token dùng một lần, hạn ngắn. Không đổi dữ liệu nào của con.
--   Bước 2 (có token đúng): một giao dịch: ghi sự kiện RUT cho mọi mục đang bật (origin RUT_TOAN_BO), hủy liên kết máy con
--     (máy con mất quyền ngay, hiện CA-17), ẩn hồ sơ con (hidden_at, state CHO_XOA, hidden_reason RUT_DONG_Y: mọi bảng dữ liệu
--     dùng app.can nên không ai đọc/ghi được nữa), tạo deletion_requests (CHO_QUYET_HAN: hạn xóa hẳn UNKNOWN, LQ-04).
--   Gửi lặp sau khi xong: replay, giữ accepted_at ĐẦU (BR-CON-052). KHÔNG xóa hẳn dữ liệu và không hứa "đã xóa hết" (hard_deleted=false):
--   xóa thật thuộc T2.3/T2.4.
-- Quyết định mặc định: chỉ QL; hộ đóng băng -> FROZEN (BR-FAM-054); máy con và NL không gọi được; token gắn (con, QL), hạn
-- private.params 'withdraw_confirm_ttl_minutes' = 10 (CHUA_CHOT); hoàn tác trong thời gian chờ (BR-FAM-084, UNKNOWN) chưa có.
-- Chưa làm (bảng chưa có): vô hiệu CR, dừng nhắc, thông báo, tombstone chi tiết từng bảng dữ liệu (T3+: dùng app.can).

create table app.deletion_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  household_id uuid not null references app.households (id),
  scope        text not null check (scope in ('HO_SO_CON', 'NGUOI_LON_ROI', 'GIA_DINH')),
  child_id     uuid references app.children (id),
  requested_by uuid not null references app.members (id),
  accepted_at  timestamptz not null default clock_timestamp(),     -- thời điểm chấp nhận LẦN ĐẦU (AC-CON-17)
  state        text not null default 'CHO_QUYET_HAN' check (state in ('CHO_QUYET_HAN', 'CHO_XOA_HAN', 'DA_XOA', 'DA_HUY')),
  due_at       timestamptz,                                         -- null = UNKNOWN (PR-CON-01), không tự xóa
  reason       text not null check (reason in ('RUT_TOAN_BO', 'XOA_HO_SO')),
  check (scope <> 'HO_SO_CON' or child_id is not null)
);
create unique index deletion_requests_one_open_per_child
  on app.deletion_requests (child_id) where scope = 'HO_SO_CON' and state <> 'DA_HUY';
create index deletion_requests_household_idx on app.deletion_requests (household_id);

create function app.tg_deletion_audit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.audit_write_auto(new.household_id, 'deletion.requested',
    case when new.child_id is not null then 'child:' || new.child_id else 'household:' || new.household_id end,
    jsonb_build_object('scope', new.scope, 'reason', new.reason));
  return null;
end $$;
create trigger deletion_requests_audit after insert on app.deletion_requests
  for each row execute function app.tg_deletion_audit();

-- Mã xác nhận bước hai (private, không mở API). Không bao giờ vào audit.
create table private.withdraw_confirmations (
  token      uuid primary key default gen_random_uuid(),
  child_id   uuid not null references app.children (id),
  member_id  uuid not null references app.members (id),
  created_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null,
  used_at    timestamptz
);
alter table private.withdraw_confirmations enable row level security;
revoke all on private.withdraw_confirmations from public, anon, authenticated;
grant all on private.withdraw_confirmations to service_role;

insert into private.params (key, value_int, note) values
  ('withdraw_confirm_ttl_minutes', 10, 'T2.2, D-42: hạn của mã xác nhận bước hai khi rút toàn bộ (đề xuất nội bộ)');

create function app.consent_withdraw_all(p_child uuid, p_confirm_token uuid default null) returns jsonb
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

  v_state := app.access_state(v_uid, 'child.consent', p_child, null);
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

-- ============================================================ RLS và đặc quyền
alter table app.deletion_requests enable row level security;

-- QL đọc yêu cầu của hộ mình; người lớn đọc yêu cầu do chính mình gửi (Tech Spec §2.7).
create policy deletion_requests_select on app.deletion_requests for select to authenticated
  using ((select app_internal.can_household((select auth.uid()), 'household.admin_read', household_id))
      or (select app_internal.is_self_member(requested_by)));

revoke all on app.deletion_requests from public, anon, authenticated;
grant select on app.deletion_requests to authenticated;
grant all on app.deletion_requests to service_role;

revoke all on function app.tg_deletion_audit(), app.consent_withdraw_all(uuid, uuid) from public, anon, authenticated;
grant execute on function app.consent_withdraw_all(uuid, uuid) to authenticated;
