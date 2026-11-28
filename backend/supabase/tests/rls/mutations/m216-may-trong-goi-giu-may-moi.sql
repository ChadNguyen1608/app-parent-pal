-- expect: PLAN-ACTIVE-03,PLAN-SYNC-02
-- Lỗi: binding_in_plan giữ các máy ghép SAU CÙNG thay vì máy ghép trước.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.binding_in_plan(uuid)'::regprocedure);
  n := replace(d, $f$(coalesce(o.paired_at, o.created_at), o.id) < (coalesce(b.paired_at, b.created_at), b.id)$f$, $t$(coalesce(o.paired_at, o.created_at), o.id) > (coalesce(b.paired_at, b.created_at), b.id)$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
