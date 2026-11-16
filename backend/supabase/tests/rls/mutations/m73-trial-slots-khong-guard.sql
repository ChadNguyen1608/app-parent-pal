-- expect: TRIAL-SLOT-01
-- Lỗi: gỡ trigger bảo vệ trial_slots: vượt 3 vị trí, thiếu hạn, chuyển trạng thái tùy ý.
drop trigger trial_slots_guard on app.trial_slots;
