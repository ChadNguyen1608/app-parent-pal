-- expect: LC-JOB-01
-- Lỗi: job đóng băng sai mốc: dùng > thay vì >= (đúng 30 ngày chưa đóng băng).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.job_freeze_idle(timestamptz)'::regprocedure);
  n := replace(d, $f$if p_now - r.last_any >= v_idle then$f$, $t$if p_now - r.last_any > v_idle then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
