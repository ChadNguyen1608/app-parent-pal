-- expect: TRIAL-PURGE-03
-- Lỗi: tg_append_only cho xóa audit_log, mode_history, consent_events ở mọi giao dịch (không cần ngữ cảnh purge).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.tg_append_only()'::regprocedure);
  n := replace(d, $f$and exists (select 1 from private.purge_context c where c.txid = txid_current()) then$f$, $t$then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
