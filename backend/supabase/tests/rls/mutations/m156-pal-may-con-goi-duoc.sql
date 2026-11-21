-- expect: PAL-AUTH-01
-- Lỗi: pal_quota bỏ kiểm máy con (ẩn danh).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pal_quota()'::regprocedure);
  n := replace(d, $f$if app.is_anonymous_caller() then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
