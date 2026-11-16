-- expect: CON-WA-02
-- Lỗi: rút toàn bộ không tạo yêu cầu xóa.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.consent_withdraw_all(uuid,uuid)'::regprocedure);
  n := replace(d, 'insert into app.deletion_requests (', 'perform 1; /* (');
  n := replace(n, E'returning * into v_dr;\n\n  delete', E'returning * into v_dr; */\n\n  delete');
  if n = d or position('*/' in n) = 0 then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
