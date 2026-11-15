-- expect: FR01-T01, FR01-T02
-- Lỗi: unlink_device không kiểm PIN (coi như đúng).
do $$
declare d text; o text;
begin
  o := pg_get_functiondef('app.unlink_device(uuid,text,integer)'::regprocedure);
  d := replace(o, 'v_pin := app.pin_verify(v_primary.id, p_pin);', 'v_pin := jsonb_build_object(''result'', ''OK'');');
  if d = o then raise exception 'đột biến không áp được'; end if;
  execute d;
end $$;
