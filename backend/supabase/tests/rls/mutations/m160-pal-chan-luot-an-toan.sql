-- expect: PAL-Q-02,PAL-SPIKE-01
-- Lỗi: pal_record_turn chặn cả lượt an toàn (không tính) khi hết lượt hoặc bị khóa.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pal_record_turn(uuid,uuid,uuid,text,text,text[],boolean,int,int,text,text)'::regprocedure);
  n := replace(d, $f$if v_st not in ('OK', 'QUOTA', 'TOKENS', 'BUSY', 'RATE', 'LOCKED') then$f$, $t$if v_st <> 'OK' then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
