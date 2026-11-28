-- expect: PLAN-NOTIFY-01
-- Lỗi: gỡ trigger outbox: đổi gói không ghi goi_doi cho máy con.
drop trigger household_plans_notify on app.household_plans;
