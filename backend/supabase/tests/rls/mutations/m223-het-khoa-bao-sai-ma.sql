-- expect: PLAN-PAIR-02
-- Lỗi: hết khóa ghép máy báo PLAN_REQUIRED thay vì DEVICE_KEY_LIMIT (app không phân biệt được hết khóa với chưa có gói).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.device_key_require(uuid,uuid,uuid)'::regprocedure);
  n := replace(d, $f$perform app.fail('DEVICE_KEY_LIMIT', 'D-74.keys',$f$, $t$perform app.fail('PLAN_REQUIRED', 'D-74.keys',$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
