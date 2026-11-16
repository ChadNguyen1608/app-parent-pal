-- expect: CON-CHILD-04
-- Lỗi: child_consent_record bỏ kiểm máy con (người lớn gọi được).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.child_consent_record(uuid,uuid)'::regprocedure);
  n := replace(d, $f$if not app.is_anonymous_caller() then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
