-- expect: FR01-T03
-- Lỗi: unlink_device không tăng epoch.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.unlink_device(uuid,text,integer)'::regprocedure);
  d := replace(o, 'epoch = b.epoch + 1, revoked_at', 'epoch = b.epoch, revoked_at');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
