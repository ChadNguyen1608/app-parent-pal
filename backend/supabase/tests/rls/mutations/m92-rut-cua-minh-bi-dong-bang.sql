-- expect: CON-05e
-- Lỗi: consent_record: người lớn tự rút phần của mình khi đóng băng bị FROZEN (bỏ ngoại lệ rút).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.consent_record(uuid,text,text,uuid,text,uuid,boolean)'::regprocedure);
  n := replace(d, $f$if v_state <> 'ALLOW' and not (v_self and p_event = 'RUT' and v_state = 'FROZEN') then$f$, $t$if v_state <> 'ALLOW' then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
