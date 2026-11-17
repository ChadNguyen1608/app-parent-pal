-- expect: SCH-VER-03
-- Lỗi: gỡ trigger bảo vệ schedule_profiles (hồ sơ đã ACTIVE sửa được nội dung, phiên bản lịch mất dấu vết).
drop trigger schedule_profiles_guard on app.schedule_profiles;
