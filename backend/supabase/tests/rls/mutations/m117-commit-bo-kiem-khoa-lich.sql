-- expect: SCH-CM-05
-- Lỗi: schedule_commit_apply bỏ qua lịch đang khóa.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,int,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$if v_st.lock_state = 'LOCKED' then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
