-- expect: PAL-OWN-01
-- Lỗi: cấp EXECUTE app.ai_usage_report cho authenticated.
grant execute on function app.ai_usage_report(date, date) to authenticated;
