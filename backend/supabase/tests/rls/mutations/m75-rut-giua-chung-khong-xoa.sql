-- expect: TRIAL-WD-01
-- Lỗi: gỡ trigger rút giữa chừng: hộ thử rút toàn bộ nhưng vị trí không thành RUT_SOM.
drop trigger deletion_requests_trial_withdraw on app.deletion_requests;
