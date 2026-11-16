-- expect: TRIAL-CHILD-01,TRIAL-FK-02
-- Lỗi: purge_child không xóa dòng audit có chủ thể là con.
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.purge_child(uuid,text)'::regprocedure);
  n := replace(d, $f$delete from app.audit_log t where t.household_id = v_h.id and t.subject_ref = v_sub;$f$, $t$null;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
