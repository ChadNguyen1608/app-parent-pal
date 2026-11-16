-- expect: CON-22a
-- Lỗi: gỡ trigger chỉ-thêm của consent_events.
drop trigger consent_events_append_only on app.consent_events;
