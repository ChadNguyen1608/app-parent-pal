-- expect: PAL-Q-02
-- Lỗi: pal_state không bao giờ báo hết lượt trong ngày.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.pal_state(uuid)'::regprocedure);
  n := replace(d, $f$when v_used >= v_limit then 'QUOTA'$f$, $t$when false then 'QUOTA'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
