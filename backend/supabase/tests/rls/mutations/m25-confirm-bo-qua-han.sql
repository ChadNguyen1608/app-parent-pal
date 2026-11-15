-- expect: FN-PAIR-05
-- Lỗi: pair_confirm không kiểm hạn mã.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.pair_confirm(uuid,text,text)'::regprocedure);
  d := replace(o, 'if v_code.expires_at <= now() then', 'if false then');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
