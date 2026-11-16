-- T1.8 (Dev Plan 15.1 Đợt 1; Tech Spec §2.1, §3 hàng 11 `member-invite`; D-35; BL 11.2 BR-FAM-010, 011, 004, 009, 018;
-- AC-FAM-xx liên quan: mời người lớn thứ hai). Người soạn: AI, chưa kiểm chứng độc lập.
--
-- CHỈ LÀ KHUNG: người lớn thứ hai (Supporter / Observer) chưa dùng được ở đợt thử.
--   * private.params.invites_enabled = 0 (CHUA_CHOT). Chỉ giá trị đúng bằng 1 mới coi là bật (fail-closed).
--   * app.member_invite(...) luôn trả FEATURE_OFF (app.fail, HTTP 403) khi cờ tắt, TRƯỚC mọi tra cứu dữ liệu,
--     nên mọi người gọi (QL, NL, máy con, hộ khác) đều nhận cùng một phản hồi: không lộ vai trò, hộ, con.
--   * Khi cờ bật mà thân hàm chưa cài: trả INTERNAL (fail-closed). Bật cờ KHÔNG đủ để mời; task sau (nấc 2) phải cài thân hàm.
--   * Không ghi dòng nào vào app.invitations / grants / members. Bảng invitations vẫn chỉ-đọc (QL đọc).
--
-- Chữ ký (đặt theo BR-FAM-010: chọn vai, chọn con, chọn loại dữ liệu; chỉ Primary mời):
--   app.member_invite(p_role text, p_child_ids uuid[] default '{}', p_purposes text[] default '{}') returns jsonb
--     p_role      'SUPPORTER' | 'OBSERVER' (không có PRIMARY: BR-FAM-009, mỗi hộ một Primary)
--     p_child_ids con được xem (rỗng = chưa chọn, sẽ VALIDATION khi cài thân hàm)
--     p_purposes  mã mục đích trong app.purposes (loại dữ liệu được xem). Journal / nội dung riêng / tin an toàn KHÔNG cấp được (BR-FAM-010)
--   Kết quả khi cài thật (task sau): {"ok": true, "invitation_id": uuid, "code": "<mã một lần, chỉ trả một lần>", "expires_at": ts}
--   Hạn lời mời PR-FAM-01 và trần số người lớn PR-FAM-02 đều UNKNOWN; sẽ vào private.params khi cài thân hàm.
--
-- Quyết định mặc định (chủ sản phẩm duyệt):
--   1. Cờ đặt trong private.params (bảng tham số sẵn có từ T1.2, value_int 0/1) thay vì bảng cờ mới: một chỗ cho mọi con số chưa chốt.
--      Đổi bằng service_role/migration, không sửa hàm. Tên cờ theo Tech Spec §2.1: `invites_enabled`.
--   2. Kiểm cờ ngay sau kiểm đăng nhập, trước kiểm vai. Hệ quả: NL gọi cũng nhận FEATURE_OFF chứ không FORBIDDEN.
--      Chấp nhận được vì tính năng chưa tồn tại; khi bật cờ, thân hàm mới thật sự kiểm "chỉ Primary" (BR-FAM-010).
--   3. Các hàm đi kèm (member-accept / -remove / -leave) CHƯA có hàm nào trong CSDL: chưa tạo, tránh bề mặt API thừa.
--      Khi tạo, mỗi hàm dùng cùng cờ này.

insert into private.params (key, value_int, note) values
  ('invites_enabled', 0,
   'Tech Spec §2.1, D-35: mời người lớn thứ hai TẮT ở đợt thử. 0 = tắt, 1 = bật (chỉ đúng 1 mới bật). Bật cờ chưa đủ: thân hàm member_invite chưa cài (T1.8 chỉ là khung)');

create function app.member_invite(p_role text, p_child_ids uuid[] default '{}', p_purposes text[] default '{}')
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;

  -- Cờ: thiếu tham số thì private.param_int raise INTERNAL (fail-closed). Chỉ đúng 1 là bật.
  if private.param_int('invites_enabled') is distinct from 1 then
    perform app.fail('FEATURE_OFF', 'D-35', 'Tính năng mời thêm người lớn chưa mở.');
  end if;

  -- Cờ bật nhưng chưa có thân hàm: không làm gì cả.
  perform app.fail('INTERNAL', 'T1.8', 'Tính năng mời thêm người lớn chưa được cài.');
  return null;  -- không tới được
end $$;

revoke all on function app.member_invite(text, uuid[], text[]) from public, anon, authenticated;
grant execute on function app.member_invite(text, uuid[], text[]) to authenticated;
