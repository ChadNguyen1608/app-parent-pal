-- expect: RLS-GEN-02
-- Lỗi: cấp SELECT trên private.trial_claims cho authenticated.
grant select on private.trial_claims to authenticated;
