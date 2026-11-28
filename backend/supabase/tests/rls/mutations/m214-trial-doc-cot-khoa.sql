-- expect: PLAN-KEY-02,PLAN-PAIR-02
-- Lỗi: số khóa của TRIAL đọc từ cột device_keys thay vì cố định 1 (chủ sản phẩm vô tình nới khóa dùng thử).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('private.device_keys_of(text,timestamptz,integer)'::regprocedure);
  n := replace(d, $f$when 'TRIAL'   then private.param_int('trial_device_keys')$f$, $t$when 'TRIAL'   then coalesce(p_keys, 1)$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
