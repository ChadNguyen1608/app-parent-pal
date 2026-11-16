-- expect: MEM-INV-07
-- Lỗi: cờ khác 0 đều coi là bật (thay vì chỉ đúng 1) - giá trị rác như 2, -1 mở tính năng.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.member_invite(text,uuid[],text[])'::regprocedure);
  d := replace(o, 'is distinct from 1 then', '= 0 then');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
