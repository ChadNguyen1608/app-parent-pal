-- expect: RLS-EPOCH-01
-- Lỗi: app.access_state bỏ qua claim binding_epoch của token.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.access_state(uuid,text,uuid,text)'::regprocedure);
  d := replace(o, '(v_epoch is null or v_epoch = b.epoch::text)', 'true');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
