-- expect: SCH-VER-01
-- Lỗi: gỡ trigger chặn UPDATE/DELETE của schedule_versions (lịch đã commit sửa được).
drop trigger schedule_versions_append_only on app.schedule_versions;
