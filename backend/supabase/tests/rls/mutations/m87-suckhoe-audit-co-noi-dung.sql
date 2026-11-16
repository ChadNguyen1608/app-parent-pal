-- expect: HLT-AUDIT-01,HLT-AUDIT-02
-- Lỗi: audit health.added mang theo nội dung ghi chú (cho phép khóa meta content).
update private.audit_events set allowed_meta_keys = '{content}' where event_code = 'health.added';
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.tg_health_audit()'::regprocedure);
  n := replace(d, $f$perform private.audit_write_auto(v_hh, 'health.added', 'child:' || v_child);$f$,
    $t$perform private.audit_write_auto(v_hh, 'health.added', 'child:' || v_child, jsonb_build_object('content', left(regexp_replace(new.content, '[^A-Za-z0-9]', '', 'g'), 40)));$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
