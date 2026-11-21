-- expect: PAL-TOK-03
-- Lỗi: ops_alert_add bỏ chống ghi lặp trong ngày: cảnh báo mềm ghi nhiều lần.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.ops_alert_add(text,text,uuid,jsonb,text,boolean)'::regprocedure);
  n := replace(d, $f$if p_once_per_day and exists$f$, $t$if false and exists$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
