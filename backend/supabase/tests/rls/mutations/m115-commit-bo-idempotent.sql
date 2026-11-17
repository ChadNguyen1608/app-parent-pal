-- expect: SCH-CM-03
-- Lỗi: schedule_commit_apply không trả kết quả cũ khi gửi lại cùng khóa (tạo trùng hoặc lỗi).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,int,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$from app.schedule_versions where child_id = p_child and idempotency_key = p_idempotency_key;$f$, $t$from app.schedule_versions where child_id = p_child and idempotency_key = p_idempotency_key and false;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
