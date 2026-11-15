-- T1.3 (Tech Spec §3.1 #2-3; BL 11.2 BR-FAM-080, 085, 088; BL 11.3 BR-CON-088).
-- Hàm ghi hồ sơ con dạng SQL security definer, gọi qua RPC (PostgREST): app.child_create / child_update / child_delete.
-- Xóa = ẩn (hidden_at + hidden_reason), không xóa hẳn. Chỉ QL. Hộ đóng băng -> FROZEN.
-- Người soạn: AI, chưa kiểm chứng độc lập.

-- Idempotency cho child_create (Tech Spec §0): khóa do máy khách sinh, duy nhất khi có.
alter table app.children add column idempotency_key uuid;
create unique index children_idempotency_key_uidx on app.children (idempotency_key)
  where idempotency_key is not null;

-- Kiểm trường hồ sơ con (nội bộ). Chữ tự do `call_name` CHƯA qua bộ kiểm khẩn (keyword-check, F07-G01-M01): xem README.
create function app.check_child_fields(p_name text, p_grade int, p_age_years int) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_name is null or btrim(p_name) = '' then
    perform app.fail('VALIDATION', 'BR-001', 'Cần tên gọi của con.');
  end if;
  if char_length(btrim(p_name)) > 40 then
    perform app.fail('VALIDATION', 'BR-001', 'Tên gọi tối đa 40 ký tự.');
  end if;
  if p_grade is not null and p_grade not between 1 and 9 then
    perform app.fail('VALIDATION', 'BR-001', 'Lớp từ 1 đến 9.');
  end if;
  if p_age_years is not null and p_age_years not between 0 and 18 then
    perform app.fail('VALIDATION', 'BR-001', 'Tuổi từ 0 đến 18.');
  end if;
  if p_grade is null and p_age_years is null then
    perform app.fail('VALIDATION', 'BR-001', 'Cần lớp hoặc tuổi của con.');
  end if;
end $$;

create function app.child_json(p_child uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('child_id', c.id, 'call_name', c.call_name, 'grade', c.grade,
           'age_years', c.age_years, 'mode', c.mode, 'mode_epoch', c.mode_epoch, 'has_device', c.has_device)
  from app.children c where c.id = p_child
$$;

-- ---------------------------------------------------------------- child_create
create function app.child_create(
  p_household uuid, p_call_name text, p_grade int default null, p_age_years int default null,
  p_has_device boolean default false, p_idempotency_key uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_state text;
  v_name  text := btrim(p_call_name);
  v_old   app.children;
  v_id    uuid;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  v_state := app.household_access_state(v_uid, 'child.create', p_household);
  if v_state <> 'ALLOW' then perform app.reject_household(v_uid, v_state, p_household); end if;

  if p_idempotency_key is not null then
    select * into v_old from app.children c where c.idempotency_key = p_idempotency_key;
    if found then
      if v_old.household_id = p_household then
        return app.child_json(v_old.id) || jsonb_build_object('replay', true);
      end if;
      perform app.fail('VALIDATION', 'idempotency', 'Khóa gửi lại không hợp lệ.');
    end if;
  end if;

  perform app.check_child_fields(v_name, p_grade, p_age_years);

  insert into app.children (household_id, call_name, grade, age_years, has_device, idempotency_key)
  values (p_household, v_name, p_grade, p_age_years, coalesce(p_has_device, false), p_idempotency_key)
  returning id into v_id;     -- mode mặc định 'UNSET' (BR-FAM-041)

  return app.child_json(v_id) || jsonb_build_object('replay', false);
end $$;

-- ---------------------------------------------------------------- child_update
-- p_patch: jsonb chỉ nhận khóa call_name, grade, age_years, has_device. Không nhận mode (đi qua mode_set).
create function app.child_update(p_child uuid, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_state text;
  v_old   app.children;
  v_bad   text;
  v_name  text;
  v_grade int;
  v_age   int;
  v_dev   boolean;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  v_state := app.access_state(v_uid, 'child.update', p_child, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;

  if p_patch is null or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then
    perform app.fail('VALIDATION', 'BR-001', 'Không có gì để sửa.');
  end if;
  select string_agg(k, ',') into v_bad from jsonb_object_keys(p_patch) k
  where k not in ('call_name', 'grade', 'age_years', 'has_device');
  if v_bad is not null then
    perform app.fail('VALIDATION', 'BR-001', 'Trường không được sửa: ' || v_bad);
  end if;

  select * into v_old from app.children c where c.id = p_child for update;

  begin
    v_name  := case when p_patch ? 'call_name'  then btrim(p_patch ->> 'call_name') else v_old.call_name end;
    v_grade := case when p_patch ? 'grade'      then (p_patch ->> 'grade')::int      else v_old.grade end;
    v_age   := case when p_patch ? 'age_years'  then (p_patch ->> 'age_years')::int  else v_old.age_years end;
    v_dev   := case when p_patch ? 'has_device' then (p_patch ->> 'has_device')::boolean else v_old.has_device end;
  exception when invalid_text_representation or numeric_value_out_of_range then
    perform app.fail('VALIDATION', 'BR-001', 'Giá trị không hợp lệ.');
  end;
  if (p_patch ? 'call_name' and jsonb_typeof(p_patch -> 'call_name') <> 'string')
     or (p_patch ? 'has_device' and (jsonb_typeof(p_patch -> 'has_device') <> 'boolean' or v_dev is null)) then
    perform app.fail('VALIDATION', 'BR-001', 'Giá trị không hợp lệ.');
  end if;

  perform app.check_child_fields(v_name, v_grade, v_age);

  if v_old.has_device and not v_dev and exists (
       select 1 from app.device_bindings b where b.child_id = p_child
         and b.state in ('CHO_XAC_NHAN_MAY_CON', 'HIEU_LUC', 'CHO_XAC_MINH')) then
    perform app.fail('VALIDATION', 'FR-01', 'Hủy liên kết máy của con trước khi đổi.');
  end if;

  update app.children set call_name = v_name, grade = v_grade, age_years = v_age, has_device = v_dev
  where id = p_child;
  return app.child_json(p_child);
end $$;

-- ---------------------------------------------------------------- child_delete (ẩn, không xóa hẳn)
-- BR-FAM-080: xác nhận lần hai (p_confirm = true), ẩn ngay khỏi mọi màn, hủy liên kết máy con, không hứa "đã xóa hết".
-- Gửi lặp: idempotent (BR-FAM-085), trả replay = true.
-- CHƯA làm (cần bảng/Edge Function sau): vô hiệu CR PENDING/APPROVED (T4.x), hủy phiên và token đẩy của máy con,
-- thông báo, audit_log (T2.5), tombstone/hạn xóa hẳn (T2.x).
create function app.child_delete(p_child uuid, p_confirm boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_state text;
  v_n     int;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;

  -- Gửi lặp: hồ sơ đã ẩn và người gọi là QL của hộ đó.
  if exists (select 1 from app.children c join app.members m on m.household_id = c.household_id
             where c.id = p_child and c.hidden_at is not null and m.user_id = v_uid
               and m.role = 'PRIMARY' and m.status = 'DA_THAM_GIA') then
    return jsonb_build_object('child_id', p_child, 'hidden', true, 'replay', true);
  end if;

  v_state := app.access_state(v_uid, 'child.delete', p_child, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;
  if p_confirm is distinct from true then
    perform app.fail('VALIDATION', 'BR-FAM-080', 'Cần xác nhận lần hai để ẩn hồ sơ.');
  end if;

  perform 1 from app.children c where c.id = p_child for update;
  update app.children set hidden_at = now(), hidden_reason = 'XOA' where id = p_child;

  update app.device_bindings
     set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'XOA_HO_SO', epoch = epoch + 1
   where child_id = p_child and state in ('CHO_XAC_NHAN_MAY_CON', 'HIEU_LUC', 'CHO_XAC_MINH');
  get diagnostics v_n = row_count;

  return jsonb_build_object('child_id', p_child, 'hidden', true, 'replay', false, 'bindings_revoked', v_n);
end $$;

-- ---------------------------------------------------------------- đặc quyền
revoke all on function
  app.check_child_fields(text, int, int), app.child_json(uuid),
  app.child_create(uuid, text, int, int, boolean, uuid),
  app.child_update(uuid, jsonb), app.child_delete(uuid, boolean)
  from public, anon, authenticated;
grant execute on function
  app.child_create(uuid, text, int, int, boolean, uuid),
  app.child_update(uuid, jsonb), app.child_delete(uuid, boolean)
  to authenticated;
