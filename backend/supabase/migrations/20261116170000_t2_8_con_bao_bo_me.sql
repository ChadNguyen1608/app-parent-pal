-- T2.8 (D-67, D-58; Tech Spec §2.2 mục đích MD-CONBAO; LQ-16). Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Nút "Báo bố mẹ ngay" của con. Con CHỈ chọn một trong ba câu có sẵn (dạng câu hỏi: "Con thấy không khỏe?", "Nhờ bố mẹ đón sớm?",
-- "Con cần bố mẹ gọi?") và bấm "Đồng ý" để xác nhận ở app con; máy chủ chỉ nhận MÃ câu (kind), KHÔNG có chỗ nhập chữ, triệu chứng hay ảnh.
--
-- Cách bảo vệ:
--  1. app.child_alerts: kind bị CHECK cứng ba giá trị KHONG_KHOE | DON_SOM | GOI_BO_ME; bảng không có cột chữ tự do nào.
--     Chỉ ghi qua app.child_alert_send (không INSERT/UPDATE/DELETE trực tiếp cho authenticated).
--  2. Gửi: chỉ máy con đã ghép (liên kết HIEU_LUC; nếu máy gửi kèm p_binding_epoch thì phải đúng epoch, sai -> CONFLICT_REV như T1.6),
--     hộ không đóng băng, cần MD-CONBAO hiệu lực (đồng ý RIÊNG cấp con của QL; chưa đồng ý -> FORBIDDEN, rút -> không gửi được).
--     Giới hạn tần suất: tối đa private.params.child_alert_max_per_hour (6, CHUA_CHOT) lần mỗi giờ mỗi con -> RATE_LIMITED.
--     Gửi lặp cùng p_idempotency_key: trả bản cũ (replay), không ghi thêm, không tính vào giới hạn.
--  3. Đọc (RLS): QL và NL có grant MD-CONBAO đọc theo mô hình hiện có (không đọc khi chưa đồng ý hoặc sau khi rút: purpose_visible,
--     đồng ý lại KHÔNG hiện lại thông báo cũ); máy con chỉ thấy cái CHÍNH máy đó gửi. Mọi người chỉ thấy trong child_alert_retention_days (7).
--  4. app.child_alert_seen: người lớn được đọc đánh dấu "đã xem" (seen_at, seen_by_member_id); gửi lặp không đổi người xem đầu tiên.
--  5. Giữ 7 ngày: private.job_alert_cleanup xóa THẬT thông báo quá child_alert_retention_days (7, DA_CHOT D-67); gọi từ job_daily.
--  6. KHÔNG vào báo cáo tuần: app.weekly_report không đọc bảng này (test chứng minh bằng thân hàm và kết quả).
--  7. Audit: alert.sent chỉ có meta {kind}; không audit khi xem hay khi job xóa. purge_household / purge_child xóa cả bảng (T2.4).
--  8. Thông báo đẩy tới bố mẹ làm sau (T3.5): chưa có outbox ở repo này, nên KHÔNG có hàng đợi ở đây. Khi có outbox, thêm một dòng
--     ghi hàng đợi (chỉ kind, child_id) cùng giao dịch trong app.child_alert_send; trong lúc chờ bố mẹ thấy thông báo khi mở app.

insert into private.params (key, value_int, status, note) values
  ('child_alert_max_per_hour', 6, 'CHUA_CHOT', 'D-67: tối đa số lần con bấm "Báo bố mẹ ngay" mỗi giờ mỗi con (chặn bấm liên tục); chờ chủ sản phẩm chọn'),
  ('child_alert_retention_days', 7, 'DA_CHOT', 'D-67: thông báo của con tự xóa thật sau 7 ngày');

insert into private.audit_events (event_code, allowed_meta_keys, note) values
  ('alert.sent', '{kind}', 'T2.8, D-67: con bấm báo bố mẹ; meta chỉ có mã câu (kind), không chữ tự do');

-- ============================================================ bảng
create table app.child_alerts (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default clock_timestamp(),
  child_id           uuid not null references app.children (id),
  binding_id         uuid not null references app.device_bindings (id),   -- máy con đã gửi (RLS: máy con chỉ thấy cái mình gửi)
  kind               text not null check (kind in ('KHONG_KHOE', 'DON_SOM', 'GOI_BO_ME')),
  seen_at            timestamptz,
  seen_by_member_id  uuid references app.members (id),
  idempotency_key    uuid unique,
  check ((seen_at is null) = (seen_by_member_id is null))
);
create index child_alerts_child_idx on app.child_alerts (child_id, created_at);

-- ============================================================ hàm phụ trợ cho chính sách
create function app_internal.alert_fresh(p_created timestamptz) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_created > now() - make_interval(days => private.param_int('child_alert_retention_days'))
$$;
create function app_internal.is_alert_sender(p_binding uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from app.device_bindings b
                 where b.id = p_binding and b.device_user_id = (select auth.uid()) and b.state = 'HIEU_LUC')
         and app.is_anonymous_caller()
$$;
revoke all on function app_internal.alert_fresh(timestamptz), app_internal.is_alert_sender(uuid) from public, anon, authenticated;
grant execute on function app_internal.alert_fresh(timestamptz), app_internal.is_alert_sender(uuid) to authenticated, service_role;

-- ============================================================ audit
create function app.tg_alert_audit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.audit_write_auto((select c.household_id from app.children c where c.id = new.child_id), 'alert.sent',
    'child:' || new.child_id, jsonb_build_object('kind', new.kind));
  return null;
end $$;
create trigger child_alerts_audit after insert on app.child_alerts
  for each row execute function app.tg_alert_audit();

-- ============================================================ RLS
alter table app.child_alerts enable row level security;
create policy child_alerts_select on app.child_alerts for select to authenticated
  using (app_internal.alert_fresh(created_at)
     and (
       ((select app_internal.is_adult_of_child(child_id))
         and (select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-CONBAO'))
         and app_internal.purpose_visible(child_id, 'MD-CONBAO', created_at))
       or (select app_internal.is_alert_sender(binding_id))
     ));
revoke all on app.child_alerts from public, anon, authenticated;
grant select on app.child_alerts to authenticated;
grant all on app.child_alerts to service_role;

-- ============================================================ app.child_alert_send (máy con)
create function app.child_alert_send(p_kind text, p_idempotency_key uuid default null, p_binding_epoch int default null) returns jsonb
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
  return jsonb_build_object('ok', true, 'replay', false, 'id', v_new.id, 'kind', v_new.kind, 'created_at', v_new.created_at);
end $$;

-- ============================================================ app.child_alert_seen (người lớn)
create function app.child_alert_seen(p_alert uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_a     app.child_alerts;
  v_m     app.members;
  v_state text;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'D-67', 'Máy của con không đánh dấu đã xem.');
  end if;
  select * into v_a from app.child_alerts a where a.id = p_alert;
  if not found then perform app.fail('NOT_FOUND'); end if;
  v_state := app.access_state(v_uid, 'child.view', v_a.child_id, 'MD-CONBAO');
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, v_a.child_id); end if;
  if app.household_frozen(v_a.child_id) then
    perform app.fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa thay đổi được.');
  end if;
  if not app_internal.alert_fresh(v_a.created_at) or not app_internal.purpose_visible(v_a.child_id, 'MD-CONBAO', v_a.created_at) then
    perform app.fail('NOT_FOUND');
  end if;
  select m.* into v_m from app.members m join app.children c on c.household_id = m.household_id
   where c.id = v_a.child_id and m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  if v_a.seen_at is null then
    update app.child_alerts set seen_at = clock_timestamp(), seen_by_member_id = v_m.id where id = v_a.id returning * into v_a;
    return jsonb_build_object('ok', true, 'changed', true, 'seen_at', v_a.seen_at);
  end if;
  return jsonb_build_object('ok', true, 'changed', false, 'seen_at', v_a.seen_at);
end $$;

-- ============================================================ job: xóa thật thông báo quá hạn giữ
create function private.job_alert_cleanup(p_now timestamptz default clock_timestamp()) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_n int;
begin
  delete from app.child_alerts a
  where a.created_at < p_now - make_interval(days => private.param_int('child_alert_retention_days'));
  get diagnostics v_n = row_count;
  return jsonb_build_object('deleted', v_n);
end $$;

create or replace function private.job_daily(p_now timestamptz default clock_timestamp()) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_res jsonb;
begin
  v_res := jsonb_build_object('freeze', private.job_freeze_idle(p_now), 'trial_end', private.trial_end_due(p_now),
                              'alerts', private.job_alert_cleanup(p_now));
  insert into app.job_runs (job, status, summary) values ('job-daily', 'OK', v_res);
  return v_res;
end $$;

-- ============================================================ đặc quyền
revoke all on function app.tg_alert_audit(), app.child_alert_send(text, uuid, int), app.child_alert_seen(uuid),
  private.job_alert_cleanup(timestamptz) from public, anon, authenticated;
grant execute on function app.child_alert_send(text, uuid, int), app.child_alert_seen(uuid) to authenticated;
grant execute on function private.job_alert_cleanup(timestamptz) to service_role;
