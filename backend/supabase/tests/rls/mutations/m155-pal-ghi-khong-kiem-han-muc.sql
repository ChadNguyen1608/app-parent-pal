-- expect: PAL-Q-02,PAL-TOK-02,PAL-RATE-01
-- Lỗi: pal_record_turn không chặn lượt tính phí khi đã hết lượt/token/bận/quá nhanh.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pal_record_turn(uuid,uuid,uuid,text,text,text[],boolean,int,int,text,text)'::regprocedure);
  n := replace(d, $f$if v_st in ('QUOTA', 'TOKENS', 'BUSY', 'RATE') then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
