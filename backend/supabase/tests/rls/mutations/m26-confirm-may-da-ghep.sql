-- expect: FN-PAIR-07
-- Lỗi: pair_confirm không từ chối máy đã có liên kết HIEU_LUC (AC-FAM-12).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.pair_confirm(uuid,text,text)'::regprocedure);
  d := replace(o, 'where b.device_user_id = v_code.device_user_id and b.state = ''HIEU_LUC'') then', 'where b.device_user_id = v_code.device_user_id and b.state = ''HIEU_LUC'' and false) then');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
