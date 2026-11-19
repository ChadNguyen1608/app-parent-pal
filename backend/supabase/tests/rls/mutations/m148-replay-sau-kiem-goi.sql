-- expect: PLAN-GATE-03
-- Lỗi: schedule_commit_apply kiểm gói TRƯỚC khi trả kết quả gửi lại: hộ hạ xuống FREE thì gửi lại cùng khóa bị 402 thay vì replay.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,integer,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$perform private.plan_check_schedule(p_child, true);$f$, $t$$t$);
  n := replace(n, $f$-- Gửi lại cùng khóa$f$, $t$perform private.plan_check_schedule(p_child, true); -- Gửi lại cùng khóa$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
