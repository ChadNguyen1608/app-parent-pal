-- expect: CON-CHILD-02
-- Lỗi: trigger áp sự kiện coi đồng ý của con như đồng ý của bố mẹ (đổi purpose_state).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.tg_consent_apply()'::regprocedure);
  n := replace(d, 'if new.subject_member_id is not null or new.by_child then return null; end if;', 'if new.subject_member_id is not null then return null; end if;');
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
