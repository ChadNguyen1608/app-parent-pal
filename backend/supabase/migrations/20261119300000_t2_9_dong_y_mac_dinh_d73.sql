-- T2.9 (D-73, 19/11/2026): đồng ý mặc định do máy chủ ghi khi tạo hồ sơ con.
-- Thay màn PA-02 đã bỏ và thay việc app gọi consent_record ba lần (lệch được nếu app tắt giữa chừng).
--  1. app.consent_events thêm cột `basis`: 'NGUOI_DUNG' (người dùng bấm, mặc định cho mọi dòng cũ và mọi dòng ghi qua consent_record,
--     consent_withdraw_all, child_consent_record) hoặc 'MAC_DINH_D73' (máy chủ ghi mặc định khi tạo con). Cột chỉ-thêm như cả bảng.
--  2. app.child_create ghi, trong CÙNG giao dịch với dòng children, ba sự kiện DONG_Y: MD-LICH, MD-SUCKHOE, MD-CONBAO
--     (basis = 'MAC_DINH_D73', người ghi = thành viên đang gọi, bản chính sách mới nhất đang hiệu lực).
--     Gọi lặp cùng khóa (replay) trả sớm trước đoạn này nên không ghi đôi.
--  3. Chưa có bản chính sách hiệu lực: không ghi đồng ý (fail-closed: con tạo được nhưng chưa có đồng ý, bố mẹ bật tay ở Cài đặt dữ liệu).
--     Mục nào collect_enabled = false (tắt khẩn cấp) thì bỏ qua mục đó.
--  4. Tắt sau ở Cài đặt dữ liệu vẫn là consent_record RUT như cũ (mục riêng); rút mục lõi vẫn là rút toàn bộ (BR-CON-026).
--  Hộ được tạo (family_create) chưa có con nên không có gì để ghi.
alter table app.consent_events
  add column basis text not null default 'NGUOI_DUNG' check (basis in ('NGUOI_DUNG', 'MAC_DINH_D73'));

create or replace function app.child_create(
  p_household uuid, p_call_name text, p_grade int default null, p_age_years int default null,
  p_has_device boolean default false, p_idempotency_key uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid    uuid := (select auth.uid());
  v_state  text;
  v_name   text := btrim(p_call_name);
  v_old    app.children;
  v_id     uuid;
  v_member uuid;
  v_pv     uuid;
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

  -- D-73: đồng ý mặc định (lõi + hai mục riêng), cùng giao dịch.
  select m.id into v_member from app.members m
  where m.household_id = p_household and m.user_id = v_uid and m.status = 'DA_THAM_GIA';
  select pv.id into v_pv from app.policy_versions pv where pv.effective_at <= clock_timestamp()
  order by pv.effective_at desc, pv.created_at desc limit 1;
  if v_member is not null and v_pv is not null then
    insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id, basis)
    select p_household, v_id, p.code, 'DONG_Y', v_member, v_pv, 'MAC_DINH_D73'
    from app.purposes p
    where p.code in ('MD-LICH', 'MD-SUCKHOE', 'MD-CONBAO') and p.collect_enabled
    order by case p.code when 'MD-LICH' then 1 when 'MD-SUCKHOE' then 2 else 3 end;
  end if;

  return app.child_json(v_id) || jsonb_build_object('replay', false);
end $$;
