-- expect: FN-CAN-02
-- Lỗi: app.can tin tham số actor, cho dò quyền của người khác.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.access_state(uuid,text,uuid,text)'::regprocedure);
  d := replace(o, 'if not v_service and p_actor is distinct from v_uid then return ''DENY''; end if;', '');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
