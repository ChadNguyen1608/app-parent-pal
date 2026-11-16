-- expect: CON-WA-01
-- Lỗi: rút toàn bộ chạy ngay ở lần gọi đầu (bỏ bước xác nhận thứ hai).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.consent_withdraw_all(uuid,uuid)'::regprocedure);
  n := replace(d, $f$if p_confirm_token is null then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.consent_withdraw_all(uuid,uuid)'::regprocedure);
  n := replace(d, $f$  if not found then
    perform app.fail('VALIDATION', 'D-42', 'Cần xác nhận lại từ bước đầu.');
  end if;$f$, $t$  null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
