-- expect: PLAN-TRIAL-01
-- Lỗi: chuẩn hóa email không bỏ phần sau "+".
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.email_norm(text)'::regprocedure);
  n := replace(d, $f$v_local := split_part(v_local, '+', 1);$f$, $t$$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
