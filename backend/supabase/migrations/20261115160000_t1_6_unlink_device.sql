-- T1.6 (Dev Plan 15.1 Đợt 1, cổng G-1; Tech Spec §3.2 unlink-device, RLS-EPOCH; Architecture §5.3;
-- BL 11.2 BR-FAM-034, 035, 036, 038; FR-01; FR01-T01..T04, T09, T10; AC-FAM-13..15).
-- app.unlink_device(p_child, p_pin, p_binding_epoch): hủy liên kết máy con. Gọi từ máy con hoặc từ QL; cả hai
-- đều cần Parent PIN ĐÚNG của QL hiện hành. Không xóa dữ liệu của con, không cấp quyền gì cho ai (FR01-T10).
-- Người soạn: AI, chưa kiểm chứng độc lập.
--
-- Thứ tự kiểm (Tech Spec §3.2): quyền gọi -> epoch khớp -> QL hiện hành còn hiệu lực -> PIN (khóa tạm?) -> commit một giao dịch.
-- Kết quả:
--   {"ok": true,  "unlinked": true, "replay": false, "epoch": N}  hủy lần này; N = epoch mới của dòng DA_HUY
--   {"ok": true,  "unlinked": true, "replay": true,  "epoch": N}  đã hủy trước đó (gửi lại khi mất phản hồi, FR01-T03)
--   {"ok": false, "error": {"code": "FORBIDDEN", "rule": "FR01-T02", ...}}  PIN sai (đã đếm; HTTP 200 vì cần giữ bộ đếm)
--   raise RATE_LIMITED (PIN đang khóa), CONFLICT_REV (epoch cũ), VALIDATION (thiếu epoch của máy con, chưa đặt PIN),
--   NOT_FOUND / FORBIDDEN (người gọi không liên quan tới liên kết).
--
-- Quyết định mặc định (tài liệu chưa nói; ghi để chủ sản phẩm duyệt):
--  * Hộ đang đóng băng VẪN hủy được: hủy chỉ thu hẹp quyền, không xóa dữ liệu; chặn lại sẽ kéo dài việc lộ dữ liệu.
--  * Idempotent theo TRẠNG THÁI: không dùng idempotency_key. Đã hủy -> trả kết quả cũ, không tăng epoch lần nữa.
--    Replay chỉ cho QL của hộ hoặc chính máy con của liên kết đó; replay không cần PIN (không đổi gì, không lộ gì).
--  * Máy con bắt buộc gửi p_binding_epoch (epoch nó nhận được từ pair_accept); QL có thể bỏ qua.
--  * Epoch: nguồn chân lý là dòng device_bindings trên máy chủ. HIEU_LUC -> DA_HUY ngay khi commit nên mọi token
--    của máy con cũ mất quyền đọc tức thì (app.can/RLS chỉ nhìn HIEU_LUC), không đợi token hết hạn. Epoch tăng để
--    (a) chặn biên nhận hủy / yêu cầu cũ phát lại, (b) liên kết mới sau này luôn có epoch lớn hơn mọi liên kết cũ
--    của con, nên claim `binding_epoch` cũ trong token (nếu có) không khớp liên kết mới (xem access_state ở T1.5).
--
-- CHƯA làm, cần Edge Function (service_role) bọc ngoài, gọi SAU khi hàm này commit; thất bại ở đó không đảo ngược việc hủy:
--  * hủy phiên đăng nhập ẩn danh của máy con (Auth Admin API) và xóa token đẩy (bảng push_tokens, T5.x);
--  * thông báo tối giản cho QL "Máy của [tên gọi] đã hủy liên kết", thử lại khi gửi lỗi, không chứa PIN/mã (FR01-T04,
--    BR-FAM-038) - cần hàng đợi thông báo (outbox, T5.x);
--  * audit_log (T2.5); đếm RATE_LIMITED theo IP; không để PIN lọt vào log của Edge Function.

create function app.unlink_device(p_child uuid, p_pin text, p_binding_epoch int default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid     uuid := (select auth.uid());
  v_child   app.children;
  v_active  app.device_bindings;
  v_last    app.device_bindings;
  v_primary app.members;
  v_is_ql   boolean;
  v_is_dev  boolean;
  v_pin     jsonb;
  v_epoch   int;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;

  select * into v_child from app.children c where c.id = p_child;
  if not found then perform app.fail('NOT_FOUND', null, 'Không tìm thấy.'); end if;

  -- QL hiện hành của hộ (BR-FAM-034: PIN là kiểm tra thêm, quyền hiện hành vẫn do máy chủ xét; BR-FAM-028).
  select * into v_primary from app.members m
  where m.household_id = v_child.household_id and m.role = 'PRIMARY' and m.status = 'DA_THAM_GIA';
  v_is_ql := found and v_primary.user_id = v_uid and not app.is_anonymous_caller();

  select * into v_active from app.device_bindings b where b.child_id = p_child and b.state = 'HIEU_LUC' for update;
  v_is_dev := v_active.id is not null and v_active.device_user_id = v_uid;

  if v_active.id is null then
    -- Không còn liên kết hiệu lực: replay nếu liên kết hiệu lực gần nhất của con đã DA_HUY và người gọi liên quan.
    select * into v_last from app.device_bindings b
    where b.child_id = p_child and b.paired_at is not null order by b.epoch desc limit 1;
    if found and v_last.state = 'DA_HUY' and (v_is_ql or v_last.device_user_id = v_uid) then
      if p_binding_epoch is not null and p_binding_epoch <> v_last.epoch - 1 and p_binding_epoch <> v_last.epoch then
        perform app.fail('CONFLICT_REV', 'FR01-T09', 'Yêu cầu hủy này đã cũ.');
      end if;
      return jsonb_build_object('ok', true, 'unlinked', true, 'replay', true, 'epoch', v_last.epoch);
    end if;
    perform app.fail('NOT_FOUND', null, 'Không có liên kết nào để hủy.');
  end if;

  if not (v_is_ql or v_is_dev) then
    perform app.reject_child(v_uid, 'DENY', p_child);     -- FORBIDDEN nếu thấy được con, NOT_FOUND nếu không
  end if;
  if v_child.hidden_at is not null then perform app.fail('NOT_FOUND', null, 'Không tìm thấy.'); end if;

  -- (1) epoch khớp. Máy con bắt buộc gửi; epoch cũ (biên nhận cũ, liên kết đã thay) bị chặn, không hủy gì.
  if v_is_dev and p_binding_epoch is null then
    perform app.fail('VALIDATION', 'FR01-T09', 'Thiếu epoch của liên kết.');
  end if;
  if p_binding_epoch is not null and p_binding_epoch <> v_active.epoch then
    perform app.fail('CONFLICT_REV', 'FR01-T09', 'Liên kết đã thay đổi. Hãy tải lại.');
  end if;

  -- (2) QL hiện hành còn hiệu lực
  if v_primary.id is null then
    perform app.fail('FORBIDDEN', 'BR-FAM-034', 'Gia đình chưa có người quản lý chính hợp lệ.');
  end if;

  -- (3)(4) PIN: khóa tạm, đúng/sai. Sai: ghi đếm rồi TRẢ (không raise) để bộ đếm được giữ.
  v_pin := app.pin_verify(v_primary.id, p_pin);
  case v_pin ->> 'result'
    when 'NOT_SET' then
      perform app.fail('VALIDATION', 'FR-01', 'Chưa đặt Parent PIN.');
    when 'LOCKED' then
      perform app.fail('RATE_LIMITED', 'PR-FAM-05', 'PIN đang tạm khóa. Hãy thử lại sau.');
    when 'WRONG' then
      return jsonb_build_object('ok', false, 'error', jsonb_build_object(
        'code', 'FORBIDDEN', 'rule', 'FR01-T02', 'message_vi', 'PIN chưa đúng.',
        'attempts_left', v_pin -> 'attempts_left', 'locked_until', v_pin -> 'locked_until'));
    when 'OK' then
      null;
    else
      perform app.fail('FORBIDDEN', 'FR01-T01', 'Không hủy được.');   -- kết quả lạ: từ chối
  end case;

  -- (5) commit: DA_HUY, epoch + 1, vô hiệu mã ghép còn lại của máy. Dữ liệu của con KHÔNG bị xóa hay đổi (FR01-T10).
  update app.device_bindings b
     set state = 'DA_HUY', epoch = b.epoch + 1, revoked_at = now(),
         revoke_reason = case when v_is_dev then 'PIN_MAY_CON' else 'PIN_QL' end
   where b.id = v_active.id
  returning b.epoch into v_epoch;
  update private.pairing_codes c set state = 'HET_HAN' where c.device_user_id = v_active.device_user_id and c.state = 'CON_HAN';

  return jsonb_build_object('ok', true, 'unlinked', true, 'replay', false, 'epoch', v_epoch);
end $$;

revoke all on function app.unlink_device(uuid, text, int) from public, anon, authenticated;
grant execute on function app.unlink_device(uuid, text, int) to authenticated;
