-- expect: SCH-PS-05
-- Lỗi: profile_save không lưu ghi chú khi tạo hoạt động mới.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.profile_save(uuid,jsonb,integer)'::regprocedure);
  n := replace(d, $f$nullif(btrim(v_card ->> 'note'), ''))$f$, $t$null)$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
