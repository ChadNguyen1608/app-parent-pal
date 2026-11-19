-- expect: PAL-TOK-01
-- Lỗi: pal_record_turn ghi token = 0 vào ai_usage thay vì số từ usage.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pal_record_turn(uuid,uuid,uuid,text,text,text[],boolean,int,int,text,text)'::regprocedure);
  n := replace(d, $f$values (v_hh, v_mem, p_model, p_in_tokens, p_out_tokens, v_cost);$f$, $t$values (v_hh, v_mem, p_model, 0, 0, v_cost);$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
