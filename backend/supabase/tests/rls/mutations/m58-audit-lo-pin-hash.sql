-- expect: AUD-05
-- Lỗi: bỏ kiểm nội dung audit VÀ trigger ghi băm PIN vào meta của binding.unlinked.
drop trigger audit_log_validate on app.audit_log;
update private.audit_events set allowed_meta_keys = array_append(allowed_meta_keys, 'reason') where false;
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.tg_audit_binding()'::regprocedure);
  n := replace(d, $f$private.audit_code(new.revoke_reason)$f$, $t$(select pin_hash from private.parent_pins limit 1)$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
