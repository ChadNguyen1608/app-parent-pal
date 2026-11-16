-- expect: AUD-03e
-- Lỗi: gỡ trigger audit của sổ đồng ý.
drop trigger consent_events_audit on app.consent_events;
