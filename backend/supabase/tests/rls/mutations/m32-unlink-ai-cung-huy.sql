-- expect: FR01-T02
-- Lỗi: unlink_device bỏ kiểm người gọi: NL có grant cũng hủy được (với PIN đúng).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.unlink_device(uuid,text,integer)'::regprocedure);
  d := replace(o, 'if not (v_is_ql or v_is_dev) then', 'if false then');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
