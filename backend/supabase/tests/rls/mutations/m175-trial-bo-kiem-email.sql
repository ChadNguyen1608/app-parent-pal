-- expect: PLAN-TRIAL-05
-- Lỗi: trial_start không chặn email đã dùng thử (và nuốt xung đột khóa).
do $m$
declare d text; n text;
begin
  d := pg_get_functiondef('app.trial_start(text)'::regprocedure);
  n := replace(d, $f$ or c.email_norm_hash = v_ehash$f$, $t$$t$);
  n := replace(n, $f$values (p_device_hash, v_ehash, v_h.id);$f$, $t$values (p_device_hash, v_ehash, v_h.id) on conflict do nothing;$t$);
  if n = d then raise exception 'đột biến không áp được'; end if;
  execute n;
end $m$;
