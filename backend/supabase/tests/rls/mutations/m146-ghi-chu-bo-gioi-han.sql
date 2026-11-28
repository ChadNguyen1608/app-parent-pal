-- expect: SCH-PS-05
-- Lỗi: ghi chú hoạt động không còn giới hạn 500 ký tự (cả ràng buộc cột lẫn kiểm trong profile_save).
alter table app.activity_cards drop constraint activity_cards_note_len;
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.profile_save(uuid,jsonb,integer)'::regprocedure);
  n := replace(d, $f$char_length(coalesce(v_card ->> 'note', '')) > 500$f$, $t$false$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
