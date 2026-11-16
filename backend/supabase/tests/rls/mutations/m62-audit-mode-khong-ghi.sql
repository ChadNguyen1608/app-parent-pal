-- expect: AUD-03d
-- Lỗi: gỡ trigger audit của children (đổi mode, ẩn hồ sơ không để lại dấu).
drop trigger children_audit on app.children;
