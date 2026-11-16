-- expect: LC-JOB-02
-- Lỗi: job đóng băng chỉ xét QL: QL quá hạn là đóng băng dù người lớn khác còn dùng.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.job_freeze_idle(timestamptz)'::regprocedure);
  n := replace(d, $f$if p_now - r.last_any >= v_idle then$f$, $t$if p_now - r.last_ql >= v_idle then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
