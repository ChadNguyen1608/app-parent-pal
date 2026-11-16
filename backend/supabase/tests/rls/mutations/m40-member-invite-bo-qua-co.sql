-- expect: MEM-INV-02, MEM-INV-03
-- Lỗi: member_invite không kiểm cờ invites_enabled (đi thẳng vào thân hàm).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.member_invite(text,uuid[],text[])'::regprocedure);
  d := replace(o, 'if private.param_int(''invites_enabled'') is distinct from 1 then', 'if false then');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
