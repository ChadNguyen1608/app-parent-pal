-- expect: CON-05a
-- Lỗi: consent_record cho NL ghi đồng ý THEO CON (dùng quyền xem thay vì quyền QL).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.consent_record(uuid,text,text,uuid,text,uuid,boolean)'::regprocedure);
  n := replace(d, $f$case when v_member.role = 'PRIMARY' or not v_self then (case when p_event = 'RUT' then 'child.withdraw' else 'child.consent' end)
         else 'child.view' end$f$, $t$'child.view'$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
