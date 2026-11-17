-- expect: SCH-CM-05
-- Lỗi: schedule_commit_apply không so băm nội dung hồ sơ lúc commit (hồ sơ đổi giữa lúc xếp và lúc lưu vẫn được lưu).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.schedule_commit_apply(uuid,uuid,int,uuid,text,text,text,text,text,text,text,text,text,text)'::regprocedure);
  n := replace(d, $f$if private.profile_content_hash(p_profile) is distinct from p_content_hash then$f$, $t$if false then$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
