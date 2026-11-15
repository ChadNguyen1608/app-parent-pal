-- expect: FN-CAN-01, FN-MODE-02
-- Lỗi quyền: app.access_state cho mọi thành viên (cả NL/Supporter) ghi, không chỉ QL (AC-FAM-19).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.access_state(uuid,text,uuid,text)'::regprocedure);
  d := replace(o, 'if v_role <> ''PRIMARY'' or v_role is null then return ''DENY''; end if;',
                  'if v_role is null then return ''DENY''; end if;');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
