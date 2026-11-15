-- expect: FN-PAIR-04
-- Lỗi: pair_confirm tạo HIEU_LUC ngay, bỏ bước máy con bấm Đồng ý (AD-11).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.pair_confirm(uuid,text,text)'::regprocedure);
  d := replace(o, 'else ''CHO_XAC_NHAN_MAY_CON'' end;', 'else ''HIEU_LUC'' end;');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
