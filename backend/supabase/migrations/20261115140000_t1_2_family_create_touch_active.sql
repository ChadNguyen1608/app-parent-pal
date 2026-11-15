-- T1.2 (Dev Plan 15.1 Đợt 1; Tech Spec §2.8, §3.1 #1 và #10; BL 11.2 BR-FAM-001, BR-FAM-050; D-27, D-41, D-49).
-- app.family_create: người lớn đã đăng nhập (email OTP là việc của Supabase Auth, không có mã SQL ở đây)
--   chưa thuộc hộ nào tạo hộ + thành viên PRIMARY.
-- app.touch_active: cập nhật last_active_at (đồng hồ đóng băng 30 ngày D-41). Chỉ thao tác có chủ đích của
--   người lớn; máy con (ẩn danh) không tính (BR-FAM-050, AC-FAM-26).
-- Thêm: private.params (tham số chưa chốt, đọc bằng private.param_int), app.is_anonymous_caller (nội bộ).
-- Người soạn: AI, chưa kiểm chứng độc lập.

-- ============================================================ tham số (bảng private, không mở API)
-- Mọi con số "chưa chốt" nằm ở đây, không rải trong mã hàm. status = 'CHUA_CHOT' cho tới khi chủ sản phẩm duyệt
-- (OW-06 trong Dev Plan 15.1). Đổi giá trị = update bằng service_role / migration, không cần sửa hàm.
create table private.params (
  key       text primary key,
  value_int int  not null,
  status    text not null default 'CHUA_CHOT' check (status in ('CHUA_CHOT', 'DA_CHOT')),
  note      text not null
);
alter table private.params enable row level security;   -- phòng thủ chiều sâu, không chính sách
revoke all on private.params from public, anon, authenticated;
grant all on private.params to service_role;

insert into private.params (key, value_int, note) values
  ('touch_active_min_interval_minutes', 60, 'Tech Spec §13.1 bảng nghiệm thu 1: touch-active tối đa 1 lần/giờ (đề xuất nội bộ)');

create function private.param_int(p_key text) returns int
language plpgsql stable security definer set search_path = '' as $$
declare
  v int;
begin
  select p.value_int into v from private.params p where p.key = p_key;
  if v is null then
    raise exception using errcode = 'PT500', message = 'INTERNAL', detail = 'param_missing:' || p_key,
      hint = 'Thiếu tham số cấu hình.';
  end if;
  return v;
end $$;
revoke all on function private.param_int(text) from public, anon, authenticated;

-- ============================================================ nhận diện máy con (người dùng ẩn danh)
-- Supabase: người dùng ẩn danh dùng role `authenticated`, JWT có claim is_anonymous = true (Architecture §5.2).
-- Chặn khi MỘT TRONG HAI nguồn nói ẩn danh: claim của token hoặc cột auth.users.is_anonymous (fail-closed).
create function app.is_anonymous_caller() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select auth.jwt()) ->> 'is_anonymous', '') = 'true'
      or coalesce((select u.is_anonymous from auth.users u where u.id = (select auth.uid())), false)
$$;

-- ============================================================ app.family_create (Tech Spec §3.1 #1; BR-FAM-001)
-- Người gọi: người lớn đã đăng nhập (không ẩn danh), chưa có dòng members nào (unique(user_id): một người một hộ).
-- Gọi lại khi đã là PRIMARY đang tham gia: trả hộ cũ (replay), không tạo hộ thứ hai (mất phản hồi thì gửi lại được).
-- Đã là thành viên không phải PRIMARY, hoặc đã rời/bị gỡ: VALIDATION (không tự lập hộ mới).
-- Hộ mới là data_class 'GIA_LAP' (mặc định của cột). Ghi đồng ý SELF_DECLARED trước khi tạo hồ sơ con
-- (BR-FAM-001) thuộc T2.1, chưa có ở đây.
create function app.family_create(p_call_name text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := (select auth.uid());
  v_name text := btrim(p_call_name);
  v_m    app.members;
  v_hh   uuid;
  v_mid  uuid;
begin
  if v_uid is null or not exists (select 1 from auth.users u where u.id = v_uid) then
    perform app.fail('UNAUTHENTICATED');
  end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'FR-01', 'Máy của con không tạo được gia đình.');
  end if;

  select * into v_m from app.members m where m.user_id = v_uid;
  if found then
    if v_m.role = 'PRIMARY' and v_m.status = 'DA_THAM_GIA' then
      return jsonb_build_object('household_id', v_m.household_id, 'member_id', v_m.id, 'role', v_m.role,
                                'call_name', v_m.call_name, 'replay', true);
    end if;
    perform app.fail('VALIDATION', 'BR-FAM-001', 'Tài khoản này đã thuộc một gia đình.');
  end if;

  if v_name is null or v_name = '' then
    perform app.fail('VALIDATION', 'BR-FAM-001', 'Cần tên gọi của bạn.');
  end if;
  if char_length(v_name) > 40 then
    perform app.fail('VALIDATION', 'BR-FAM-001', 'Tên gọi tối đa 40 ký tự.');
  end if;

  begin
    insert into app.households default values returning id into v_hh;
    insert into app.members (household_id, user_id, role, call_name, last_active_at)
    values (v_hh, v_uid, 'PRIMARY', v_name, now())     -- tạo tài khoản tính là một lần dùng (BR-FAM-050)
    returning id into v_mid;
  exception when unique_violation then
    -- hai yêu cầu đồng thời cùng một người: giao dịch phụ bị hủy, không để lại hộ mồ côi
    perform app.fail('VALIDATION', 'BR-FAM-001', 'Tài khoản này đã thuộc một gia đình.');
  end;

  return jsonb_build_object('household_id', v_hh, 'member_id', v_mid, 'role', 'PRIMARY',
                            'call_name', v_name, 'replay', false);
end $$;

-- ============================================================ app.touch_active (Tech Spec §2.8, §3.1 #10; BR-FAM-050)
-- Người gọi: người lớn đang tham gia một hộ (QL hoặc NL). Máy con và người ngoài hộ: FORBIDDEN.
-- Giới hạn 1 lần/giờ (tham số touch_active_min_interval_minutes): gọi sớm hơn trả touched=false, không ghi.
-- Không đổi trạng thái hộ: mở lại khi đóng băng là thao tác xác nhận riêng của QL (BR-FAM-057, task sau).
-- Hệ thống (job, đồng bộ nền, máy con) KHÔNG được gọi hàm này để "giữ sống" hộ (AC-FAM-26).
create function app.touch_active() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid  uuid := (select auth.uid());
  v_mid  uuid;
  v_last timestamptz;
  v_min  int;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  if app.is_anonymous_caller() then
    perform app.fail('FORBIDDEN', 'BR-FAM-050', 'Hoạt động của máy con không tính.');
  end if;

  select m.id into v_mid from app.members m
  where m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  if v_mid is null then
    perform app.fail('FORBIDDEN', 'BR-FAM-050', 'Bạn chưa thuộc gia đình nào.');
  end if;

  v_min := private.param_int('touch_active_min_interval_minutes');
  update app.members m set last_active_at = now()
  where m.id = v_mid
    and (m.last_active_at is null or m.last_active_at <= now() - make_interval(mins => v_min))
  returning m.last_active_at into v_last;

  if v_last is null then
    return jsonb_build_object('touched', false,
      'last_active_at', (select m.last_active_at from app.members m where m.id = v_mid));
  end if;
  return jsonb_build_object('touched', true, 'last_active_at', v_last);
end $$;

-- ============================================================ Đặc quyền
revoke all on function app.is_anonymous_caller() from public, anon, authenticated;
revoke all on function app.family_create(text), app.touch_active() from public, anon, authenticated;
grant execute on function app.family_create(text), app.touch_active() to authenticated;
