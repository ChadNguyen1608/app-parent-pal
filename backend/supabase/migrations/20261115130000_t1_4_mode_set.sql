-- T1.4 (Tech Spec §3.1 #4; BL 11.2 BR-FAM-040..045; D-19).
-- app.mode_set: chỉ QL; chỉ nhận PARENT_LED / CHILD_EXECUTED / UNSET; CHILD_DIRECTED bị từ chối (D-19);
-- ghi app.mode_history, tăng mode_epoch. Cùng mode: không đổi, không ghi lịch sử (idempotent).
-- CHƯA làm: vô hiệu CR PENDING/APPROVED khi con mất quyền (BR-FAM-043, AC-FAM-18) - bảng change_requests ở T4.x;
-- báo con sau commit (BR-FAM-045), audit_log (T2.5).
-- Người soạn: AI, chưa kiểm chứng độc lập.

create function app.mode_set(p_child uuid, p_mode text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid    uuid := (select auth.uid());
  v_state  text;
  v_old    app.children;
  v_member uuid;
begin
  if v_uid is null then perform app.fail('UNAUTHENTICATED'); end if;
  v_state := app.access_state(v_uid, 'child.mode_set', p_child, null);
  if v_state <> 'ALLOW' then perform app.reject_child(v_uid, v_state, p_child); end if;

  if p_mode = 'CHILD_DIRECTED' then
    perform app.fail('VALIDATION', 'D-19', 'Chế độ này chưa mở ở bản thử.');
  end if;
  if p_mode is null or p_mode not in ('PARENT_LED', 'CHILD_EXECUTED', 'UNSET') then
    perform app.fail('VALIDATION', 'BR-FAM-042', 'Chế độ không hợp lệ.');
  end if;

  select * into v_old from app.children c where c.id = p_child for update;
  if v_old.mode = p_mode then
    return jsonb_build_object('child_id', p_child, 'mode', v_old.mode, 'mode_epoch', v_old.mode_epoch, 'changed', false);
  end if;

  select m.id into v_member from app.members m
  where m.household_id = v_old.household_id and m.user_id = v_uid and m.status = 'DA_THAM_GIA';

  update app.children set mode = p_mode, mode_epoch = mode_epoch + 1 where id = p_child;
  insert into app.mode_history (child_id, old_mode, new_mode, changed_by) values (p_child, v_old.mode, p_mode, v_member);

  return jsonb_build_object('child_id', p_child, 'mode', p_mode, 'mode_epoch', v_old.mode_epoch + 1,
                            'changed', true, 'old_mode', v_old.mode);
end $$;

revoke all on function app.mode_set(uuid, text) from public, anon, authenticated;
grant execute on function app.mode_set(uuid, text) to authenticated;
