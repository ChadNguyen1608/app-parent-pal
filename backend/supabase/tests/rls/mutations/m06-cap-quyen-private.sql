-- expect: RLS-GEN-02, RLS-D38-01
-- Cấp nhầm quyền đọc private cho authenticated (và policy cho phép).
grant usage on schema private to authenticated;
grant select on private.checkin_responses to authenticated;
create policy leak on private.checkin_responses for select to authenticated using (true);
