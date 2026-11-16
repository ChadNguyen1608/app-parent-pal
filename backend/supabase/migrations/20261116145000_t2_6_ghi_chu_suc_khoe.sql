-- T2.6 (D-66, 17/11/2026; Tech Spec §2.2 mục đích MD-SUCKHOE; BR-CON-001, C-07). Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Ghi chú sức khỏe trong hồ sơ con (dị ứng, thuốc, khác): VẪN LƯU ở nấc 1. Nấc 1 chỉ LƯU và HIỂN THỊ cho người lớn được phép;
-- việc DÙNG thông tin này (bộ xếp lịch, Pal) quyết định sau: KHÔNG hàm nào khác đọc bảng này.
--
-- Cách bảo vệ (dữ liệu nhạy cảm):
--  1. Đồng ý RIÊNG MD-SUCKHOE (collect_enabled = true từ migration T2.1). Ghi (add, bật lại, sửa nội dung) chỉ khi purpose_effective;
--     đọc chỉ khi purpose_visible: rút MD-SUCKHOE thì ẩn ngay, đồng ý lại KHÔNG làm ghi chú cũ hiện lại (AC-CON-07).
--     Rút MD-SUCKHOE còn tạo yêu cầu xóa phạm vi SUC_KHOE (hàng chờ xóa phần sức khỏe, trong consent_record).
--  2. Đọc: QL (cả khi đóng băng); NL chỉ khi có grant mục đích MD-SUCKHOE (mô hình grants hiện có); máy con KHÔNG bao giờ đọc
--     (chính sách đòi người gọi là người lớn của hộ). Ghi: chỉ qua RPC, chỉ QL; không quyền INSERT/UPDATE/DELETE trực tiếp.
--  3. Nguồn: declared_by_member_id, declared_by_role (vai tại thời điểm khai), declared_at (ngày khai theo giờ VN, sửa được, không ở tương lai),
--     source_note (tùy chọn, vd "theo giấy khám"). Sửa nội dung KHÔNG đổi người khai (mặc định an toàn: nguồn là lúc khai đầu).
--  4. Tắt (active = false) mà không xóa; xóa thật bằng health_note_delete. Tắt và xóa là THU HẸP: luôn làm được kể cả hộ đóng băng
--     và khi chưa/không còn đồng ý. Bật lại, thêm, sửa nội dung: cần đồng ý và hộ không đóng băng.
--  5. Audit health.added / health.updated / health.deleted (trigger, không khóa meta nào: KHÔNG kèm nội dung, loại, ngày hay nguồn).
--  6. purge_household / purge_child xóa cả bảng này (T2.4); xóa bằng purge không để lại dòng audit health.deleted.
--  Giới hạn: content 1..500 ký tự, source_note <= 200, tối đa 50 ghi chú mỗi con.

create table app.child_health_notes (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default clock_timestamp(),   -- giờ máy chủ, như sổ đồng ý (so với mốc active_since)
  updated_at             timestamptz not null default now(),
  child_id               uuid not null references app.children (id),
  kind                   text not null check (kind in ('DI_UNG', 'THUOC', 'KHAC')),
  content                text not null check (char_length(btrim(content)) between 1 and 500),
  declared_by_member_id  uuid not null references app.members (id),
  declared_by_role       text not null check (declared_by_role in ('PRIMARY', 'SUPPORTER', 'OBSERVER')),
  declared_at            date not null default ((now() at time zone 'Asia/Ho_Chi_Minh')::date),
  source_note            text check (source_note is null or char_length(btrim(source_note)) between 1 and 200),
  active                 boolean not null default true
);
create index child_health_notes_child_idx on app.child_health_notes (child_id);

insert into private.audit_events (event_code, allowed_meta_keys, note) values
  ('health.added',   '{}', 'T2.6, D-66: thêm ghi chú sức khỏe của con; KHÔNG kèm nội dung'),
  ('health.updated', '{}', 'T2.6, D-66: sửa hoặc bật/tắt ghi chú sức khỏe; KHÔNG kèm nội dung'),
  ('health.deleted', '{}', 'T2.6, D-66: xóa ghi chú sức khỏe; KHÔNG kèm nội dung');

create function app.tg_health_audit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_hh    uuid;
  v_child uuid := coalesce(new.child_id, old.child_id);
begin
  if tg_op = 'DELETE'
     and exists (select 1 from private.purge_context c where c.txid = txid_current()) then
    return old;   -- xóa hẳn theo hộ/con (T2.4): không ghi audit
  end if;
  select c.household_id into v_hh from app.children c where c.id = v_child;
  if tg_op = 'INSERT' then
    perform private.audit_write_auto(v_hh, 'health.added', 'child:' || v_child);
  elsif tg_op = 'UPDATE' then
    if (new.kind, new.content, new.declared_at, new.source_note, new.active)
       is distinct from (old.kind, old.content, old.declared_at, old.source_note, old.active) then
      perform private.audit_write_auto(v_hh, 'health.updated', 'child:' || v_child);
    end if;
  else
    perform private.audit_write_auto(v_hh, 'health.deleted', 'child:' || v_child);
    return old;
  end if;
  return null;
end $$;
create trigger child_health_notes_audit after insert or update or delete on app.child_health_notes
  for each row execute function app.tg_health_audit();

alter table app.child_health_notes enable row level security;
create policy child_health_notes_select on app.child_health_notes for select to authenticated
  using ((select app_internal.is_adult_of_child(child_id))
     and (select app_internal.can((select auth.uid()), 'child.view', child_id, 'MD-SUCKHOE'))
     and app_internal.purpose_visible(child_id, 'MD-SUCKHOE', created_at));

-- ============================================================ RPC
create function app.health_note_json(p_note app.child_health_notes) returns jsonb
language sql immutable security definer set search_path = '' as $$
  select jsonb_build_object('id', p_note.id, 'child_id', p_note.child_id, 'kind', p_note.kind, 'content', p_note.content,
    'declared_by_member_id', p_note.declared_by_member_id, 'declared_by_role', p_note.declared_by_role,
    'declared_at', p_note.declared_at, 'source_note', p_note.source_note, 'active', p_note.active)
$$;

-- p_kind 'DI_UNG' | 'THUOC' | 'KHAC'; p_declared_at mặc định hôm nay (VN), không ở tương lai. Chỉ QL, cần đồng ý MD-SUCKHOE.
create function app.health_note_add(p_child uuid, p_kind text, p_content text, p_declared_at date default null, p_source_note text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_state text;
  v_m     app.members;
  v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_n     app.child_health_notes;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'C-07', 'Máy của con không ghi hay đọc thông tin sức khỏe.');
  end if;
  v_state := app.access_state(v_uid, 'child.update', p_child, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;
  select m.* into v_m from app.members m join app.children c on c.household_id = m.household_id
   where c.id = p_child and m.user_id = v_uid and m.status = 'DA_THAM_GIA' and m.role = 'PRIMARY';

  if p_kind is null or p_kind not in ('DI_UNG', 'THUOC', 'KHAC') then
    perform app.fail('VALIDATION', 'D-66', 'Loại ghi chú không hợp lệ.');
  end if;
  if p_content is null or char_length(btrim(p_content)) not between 1 and 500 then
    perform app.fail('VALIDATION', 'D-66', 'Nội dung từ 1 đến 500 ký tự.');
  end if;
  if p_source_note is not null and char_length(btrim(p_source_note)) not between 1 and 200 then
    perform app.fail('VALIDATION', 'D-66', 'Nguồn từ 1 đến 200 ký tự.');
  end if;
  if p_declared_at is not null and p_declared_at > v_today then
    perform app.fail('VALIDATION', 'D-66', 'Ngày khai không ở tương lai.');
  end if;
  perform 1 from app.children c where c.id = p_child for update;
  if not app_internal.purpose_effective(p_child, 'MD-SUCKHOE') then
    perform app.fail('FORBIDDEN', 'D-66', 'Cần đồng ý riêng cho thông tin sức khỏe trước.');
  end if;
  if (select count(*) from app.child_health_notes h where h.child_id = p_child) >= 50 then
    perform app.fail('VALIDATION', 'D-66', 'Mỗi con tối đa 50 ghi chú sức khỏe.');
  end if;

  insert into app.child_health_notes (child_id, kind, content, declared_by_member_id, declared_by_role, declared_at, source_note)
  values (p_child, p_kind, btrim(p_content), v_m.id, v_m.role, coalesce(p_declared_at, v_today), nullif(btrim(p_source_note), ''))
  returning * into v_n;
  return jsonb_build_object('ok', true, 'note', app.health_note_json(v_n));
end $$;

-- p_patch: object với các khóa kind, content, declared_at, source_note, active (khóa lạ -> VALIDATION). Tắt (active=false) là thu hẹp.
create function app.health_note_update(p_note uuid, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_n       app.child_health_notes;
  v_new     app.child_health_notes;
  v_state   text;
  v_today   date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  k         text;
  v_narrow  boolean;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'C-07', 'Máy của con không ghi hay đọc thông tin sức khỏe.');
  end if;
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then
    perform app.fail('VALIDATION', 'D-66', 'Không có gì để sửa.');
  end if;
  for k in select jsonb_object_keys(p_patch) loop
    if k not in ('kind', 'content', 'declared_at', 'source_note', 'active') then
      perform app.fail('VALIDATION', 'D-66', 'Trường không được sửa.');
    end if;
  end loop;

  select * into v_n from app.child_health_notes h where h.id = p_note;
  if not found then perform app.fail('NOT_FOUND'); end if;
  v_narrow := p_patch = '{"active": false}'::jsonb;
  v_state := app.access_state(v_uid, case when v_narrow then 'child.withdraw' else 'child.update' end, v_n.child_id, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, v_n.child_id); end if;
  if not v_narrow and not app_internal.purpose_effective(v_n.child_id, 'MD-SUCKHOE') then
    perform app.fail('FORBIDDEN', 'D-66', 'Cần đồng ý riêng cho thông tin sức khỏe trước.');
  end if;

  v_new := v_n;
  if p_patch ? 'kind' then
    if jsonb_typeof(p_patch -> 'kind') <> 'string' or (p_patch ->> 'kind') not in ('DI_UNG', 'THUOC', 'KHAC') then
      perform app.fail('VALIDATION', 'D-66', 'Loại ghi chú không hợp lệ.');
    end if;
    v_new.kind := p_patch ->> 'kind';
  end if;
  if p_patch ? 'content' then
    if jsonb_typeof(p_patch -> 'content') <> 'string' or char_length(btrim(p_patch ->> 'content')) not between 1 and 500 then
      perform app.fail('VALIDATION', 'D-66', 'Nội dung từ 1 đến 500 ký tự.');
    end if;
    v_new.content := btrim(p_patch ->> 'content');
  end if;
  if p_patch ? 'declared_at' then
    if jsonb_typeof(p_patch -> 'declared_at') <> 'string' or (p_patch ->> 'declared_at') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      perform app.fail('VALIDATION', 'D-66', 'Ngày khai không hợp lệ.');
    end if;
    v_new.declared_at := (p_patch ->> 'declared_at')::date;
    if v_new.declared_at > v_today then perform app.fail('VALIDATION', 'D-66', 'Ngày khai không ở tương lai.'); end if;
  end if;
  if p_patch ? 'source_note' then
    if jsonb_typeof(p_patch -> 'source_note') = 'null' then
      v_new.source_note := null;
    elsif jsonb_typeof(p_patch -> 'source_note') <> 'string' or char_length(btrim(p_patch ->> 'source_note')) not between 1 and 200 then
      perform app.fail('VALIDATION', 'D-66', 'Nguồn từ 1 đến 200 ký tự.');
    else
      v_new.source_note := btrim(p_patch ->> 'source_note');
    end if;
  end if;
  if p_patch ? 'active' then
    if jsonb_typeof(p_patch -> 'active') <> 'boolean' then
      perform app.fail('VALIDATION', 'D-66', 'Trạng thái bật/tắt không hợp lệ.');
    end if;
    v_new.active := (p_patch ->> 'active')::boolean;
  end if;

  update app.child_health_notes set kind = v_new.kind, content = v_new.content, declared_at = v_new.declared_at,
         source_note = v_new.source_note, active = v_new.active, updated_at = now()
   where id = p_note returning * into v_new;
  return jsonb_build_object('ok', true, 'note', app.health_note_json(v_new));
end $$;

-- Xóa thật một ghi chú (thu hẹp: luôn được, kể cả đóng băng và khi đã rút đồng ý). Chỉ QL.
create function app.health_note_delete(p_note uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_n     app.child_health_notes;
  v_state text;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'C-07', 'Máy của con không ghi hay đọc thông tin sức khỏe.');
  end if;
  select * into v_n from app.child_health_notes h where h.id = p_note;
  if not found then perform app.fail('NOT_FOUND'); end if;
  v_state := app.access_state(v_uid, 'child.withdraw', v_n.child_id, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, v_n.child_id); end if;
  delete from app.child_health_notes where id = p_note;
  return jsonb_build_object('ok', true, 'deleted', true);
end $$;

-- ============================================================ đặc quyền
revoke all on app.child_health_notes from public, anon, authenticated;
grant select on app.child_health_notes to authenticated;
grant all on app.child_health_notes to service_role;

revoke all on function
  app.tg_health_audit(), app.health_note_json(app.child_health_notes),
  app.health_note_add(uuid, text, text, date, text), app.health_note_update(uuid, jsonb), app.health_note_delete(uuid)
  from public, anon, authenticated;
grant execute on function
  app.health_note_add(uuid, text, text, date, text), app.health_note_update(uuid, jsonb), app.health_note_delete(uuid)
  to authenticated;

