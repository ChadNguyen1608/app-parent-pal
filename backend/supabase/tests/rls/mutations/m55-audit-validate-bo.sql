-- expect: AUD-02a,AUD-02b,AUD-02c
-- Lỗi: gỡ trigger kiểm nội dung audit_log (PIN, mã, chữ tự do lọt vào được).
drop trigger audit_log_validate on app.audit_log;
