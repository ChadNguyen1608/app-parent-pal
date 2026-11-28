-- expect: PLAN-TRIAL-06
-- Lỗi: trial_start băm email chưa chuẩn hóa: biến thể hoa/thường, "+tag" qua mặt được.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.trial_start(text)'::regprocedure);
  n := replace(d, $f$v_ehash := private.email_hash(v_email);$f$, $t$v_ehash := encode(extensions.digest(convert_to('trial-email:' || v_email, 'UTF8'), 'sha256'), 'hex');$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
