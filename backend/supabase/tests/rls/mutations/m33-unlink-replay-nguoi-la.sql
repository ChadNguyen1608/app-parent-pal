-- expect: FR01-T03b
-- Lỗi: unlink_device trả biên nhận cũ cho bất kỳ ai (lộ trạng thái liên kết).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.unlink_device(uuid,text,integer)'::regprocedure);
  d := replace(o, '(v_is_ql or v_last.device_user_id = v_uid)', 'true');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
