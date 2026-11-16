-- T2.7 (D-64, D-65; Tech Spec §2.2, §2.5; BL 11.3 BR-CON-020, BR-CON-034; CA-16, CA-17). Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Gồm ba nhóm hàm cho máy con và cài đặt (các bảng/cột đã có từ trước):
--  1. app.child_consent_record: máy con (ẩn danh, đã ghép HIEU_LUC) ghi "con đã đồng ý" vào sổ đồng ý (consent_events, by_child = true,
--     người ghi = liên kết máy con) khi mở app con lần đầu, màn CA-16 "Những gì bố mẹ thấy" kiêm bước đồng ý của con. Ghi MD-LICH
--     (mục lõi) kèm phiên bản chính sách hiệu lực. KHÔNG đổi purpose_state. Chỉ ghi, chưa rút: con rút = bố mẹ gỡ máy (T1.6) hoặc rút toàn bộ.
--     Nghị định 330 (trẻ từ đủ 7 tuổi) CHỜ luật sư xác nhận (LQ-17): ở đây ghi cho mọi con có máy, không phân theo tuổi.
--     Gửi lặp: cùng phiên bản chính sách thì replay (không ghi thêm); phiên bản chính sách mới thì ghi dòng mới (đồng ý lại).
--     Bố mẹ chưa đồng ý mục lõi hoặc hộ đóng băng thì từ chối. Dòng sổ do con ghi QL đọc được (consent_events_select, cả hộ).
--  2. Cài đặt: `private.child_settings.ai_chat_enabled` (mặc định TẮT; chặng 2 dùng cho "trò chuyện với AI", trừ nhật ký).
--     QL đổi bằng app.child_setting_set (chỉ khóa ai_chat_enabled; checkin_invite_enabled là của con, BR-CON-034, QL không đổi),
--     đọc bằng app.child_setting_get (chỉ trả ai_chat_enabled). Máy con đọc bằng app.my_child_settings. Bật: child.update (FROZEN khi
--     đóng băng); TẮT là thu hẹp: luôn được (child.withdraw). Nấc 1 chỉ lưu chỗ cài đặt, chưa có tính năng AI dùng nó.
--  3. app.my_family_state: máy con đã ghép biết hộ có đóng băng không (thiếu ở báo cáo T2.6): trả {state, frozen}, không gì khác.

alter table private.child_settings add column ai_chat_enabled boolean not null default false;

insert into private.audit_events (event_code, allowed_meta_keys, note) values
  ('setting.changed', '{key,value}', 'T2.7: QL đổi cài đặt của con (key = mã cài đặt, value = bật/tắt); không chữ tự do');

-- ============================================================ app.child_consent_record
create function app.child_consent_record(p_policy_version_id uuid default null, p_idempotency_key uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_b     app.device_bindings;
  v_c     app.children;
  v_state text;
  v_pv    uuid;
  v_old   app.consent_events;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if not app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'D-64', 'Chỉ máy của con ghi đồng ý của con.');
  end if;

  select b.* into v_b from app.device_bindings b where b.device_user_id = v_uid and b.state = 'HIEU_LUC';
  if not found then perform app.fail('NOT_FOUND'); end if;
  v_state := app.access_state(v_uid, 'child.view', v_b.child_id, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, v_b.child_id); end if;
  select * into v_c from app.children c where c.id = v_b.child_id for update;
  if not app_internal.purpose_effective(v_c.id, 'MD-LICH') then
    perform app.fail('FORBIDDEN', 'BR-CON-001', 'Bố mẹ chưa đồng ý phần cốt lõi.');
  end if;

  if p_policy_version_id is null then
    select pv.id into v_pv from app.policy_versions pv where pv.effective_at <= clock_timestamp()
    order by pv.effective_at desc, pv.created_at desc limit 1;
  else
    select pv.id into v_pv from app.policy_versions pv where pv.id = p_policy_version_id and pv.effective_at <= clock_timestamp();
  end if;
  if v_pv is null then perform app.fail('VALIDATION', 'BR-CON-005', 'Phiên bản chính sách không hợp lệ.'); end if;

  if p_idempotency_key is not null then
    select * into v_old from app.consent_events e where e.idempotency_key = p_idempotency_key;
    if found then
      if v_old.by_child and v_old.child_id = v_c.id and v_old.actor_binding_id = v_b.id then
        return jsonb_build_object('ok', true, 'changed', false, 'replay', true, 'consented_at', v_old.at,
                                  'policy_version_id', v_old.policy_version_id);
      end if;
      perform app.fail('VALIDATION', 'idempotency', 'Khóa gửi lại không hợp lệ.');
    end if;
  end if;

  select * into v_old from app.consent_events e
  where e.child_id = v_c.id and e.by_child and e.policy_version_id = v_pv
  order by e.at desc, e.id desc limit 1;
  if found then
    return jsonb_build_object('ok', true, 'changed', false, 'replay', true, 'consented_at', v_old.at, 'policy_version_id', v_pv);
  end if;

  insert into app.consent_events (household_id, child_id, purpose_code, event, actor_binding_id, by_child, policy_version_id, idempotency_key)
  values (v_c.household_id, v_c.id, 'MD-LICH', 'DONG_Y', v_b.id, true, v_pv, p_idempotency_key)
  returning * into v_old;
  return jsonb_build_object('ok', true, 'changed', true, 'replay', false, 'consented_at', v_old.at, 'policy_version_id', v_pv);
end $$;

-- ============================================================ cài đặt của con
create function app.child_setting_set(p_child uuid, p_key text, p_value boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_state text;
  v_old   boolean;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'BR-CON-034', 'Máy của con không đổi cài đặt này.');
  end if;
  v_state := app.access_state(v_uid, case when p_value is false then 'child.withdraw' else 'child.update' end, p_child, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;
  if p_key is distinct from 'ai_chat_enabled' or p_value is null then
    perform app.fail('VALIDATION', 'BR-CON-034', 'Cài đặt không hợp lệ.');
  end if;

  perform 1 from app.children c where c.id = p_child for update;
  select s.ai_chat_enabled into v_old from private.child_settings s where s.child_id = p_child;
  if v_old is distinct from p_value then
    insert into private.child_settings (child_id, ai_chat_enabled) values (p_child, p_value)
    on conflict (child_id) do update set ai_chat_enabled = excluded.ai_chat_enabled;
    perform private.audit_write_auto((select c.household_id from app.children c where c.id = p_child), 'setting.changed',
      'child:' || p_child, jsonb_build_object('key', p_key, 'value', p_value));
  end if;
  return jsonb_build_object('ok', true, 'key', p_key, 'value', p_value, 'changed', v_old is distinct from p_value);
end $$;

create function app.child_setting_get(p_child uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_val boolean;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'BR-CON-034', 'Máy của con dùng my_child_settings.');
  end if;
  if app.access_state(v_uid, 'child.admin_read', p_child, null) <> 'ALLOW' then
    perform app.reject_child(v_uid, 'DENY', p_child);
  end if;
  select s.ai_chat_enabled into v_val from private.child_settings s where s.child_id = p_child;
  return jsonb_build_object('ok', true, 'ai_chat_enabled', coalesce(v_val, false));
end $$;

create function app.my_child_settings() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_b     app.device_bindings;
  v_state text;
  v_val   boolean;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if not app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'BR-CON-034', 'Chỉ máy của con đọc cài đặt của con.');
  end if;
  select b.* into v_b from app.device_bindings b where b.device_user_id = v_uid and b.state = 'HIEU_LUC';
  if not found then perform app.fail('NOT_FOUND'); end if;
  v_state := app.access_state(v_uid, 'child.view', v_b.child_id, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, v_b.child_id); end if;
  select s.ai_chat_enabled into v_val from private.child_settings s where s.child_id = v_b.child_id;
  return jsonb_build_object('ok', true, 'ai_chat_enabled', coalesce(v_val, false));
end $$;

-- ============================================================ app.my_family_state (máy con đã ghép)
create function app.my_family_state() returns jsonb
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
  return jsonb_build_object('ok', true, 'state', v_h.state, 'frozen', v_h.state <> 'HOAT_DONG' or v_h.frozen_at is not null);
end $$;

-- ============================================================ đặc quyền
revoke all on function
  app.child_consent_record(uuid, uuid), app.child_setting_set(uuid, text, boolean), app.child_setting_get(uuid),
  app.my_child_settings(), app.my_family_state()
  from public, anon, authenticated;
grant execute on function
  app.child_consent_record(uuid, uuid), app.child_setting_set(uuid, text, boolean), app.child_setting_get(uuid),
  app.my_child_settings(), app.my_family_state()
  to authenticated;
