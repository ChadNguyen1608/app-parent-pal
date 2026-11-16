-- expect: AUD-03a
-- Lỗi: gỡ trigger audit trên device_bindings (ghép, hủy liên kết không để lại dấu).
drop trigger device_bindings_audit on app.device_bindings;
