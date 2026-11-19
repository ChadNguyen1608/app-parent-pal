-- expect: PAL-PREP-02
-- Lỗi: pal_prepare lấy lịch sử cuộc trò chuyện của người khác.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pal_prepare(uuid,uuid,uuid)'::regprocedure);
  n := replace(d, $f$c.id = p_conversation and c.member_id = (v_s ->> 'member_id')::uuid$f$, $t$c.id = p_conversation$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
