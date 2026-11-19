-- expect: PAL-SIG-02
-- Lỗi: pal_record_turn bỏ kiểm chữ ký HMAC của Edge Function.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.pal_record_turn(uuid,uuid,uuid,text,text,text[],boolean,int,int,text,text)'::regprocedure);
  n := replace(d, $f$if p_sig is null or p_sig <> private.pal_record_sign(v_msg) then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
