-- expect: PLAN-KEY-01
-- Lỗi: tham số trial_days quay lại CHUA_CHOT (chủ sản phẩm đã chốt 7 ngày, D-74).
update private.params set status = 'CHUA_CHOT' where key = 'trial_days';
