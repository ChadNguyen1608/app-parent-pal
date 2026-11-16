-- expect: AUD-01a
-- Lỗi: gỡ trigger chỉ-thêm của audit_log.
drop trigger audit_log_append_only on app.audit_log;
