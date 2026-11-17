-- expect: SCH-CM-04
-- Lỗi: schedule_commit_apply không kiểm chữ ký HMAC (client tự gửi kết quả xếp lịch giả).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,int,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$if p_signature is null or lower$f$, $t$if false and lower$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
