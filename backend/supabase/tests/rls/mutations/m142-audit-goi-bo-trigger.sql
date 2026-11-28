-- expect: PLAN-AUD-01
-- Lỗi: gỡ trigger audit của household_plans: đổi gói không để lại plan.changed.
drop trigger household_plans_audit on app.household_plans;
