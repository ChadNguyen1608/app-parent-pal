-- expect: FN-CAN-05, FN-CAN-06, FN-CHILD-05, FN-MODE-05
-- Lỗi: app.access_state bỏ qua trạng thái đóng băng của hộ.
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.access_state(uuid,text,uuid,text)'::regprocedure);
  d := replace(o, '(h.state <> ''HOAT_DONG'' or h.frozen_at is not null)', 'false');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
