-- expect: TRIAL-JOB-01
-- Lỗi: gỡ trigger kết thúc vị trí: HET_THU nhưng hộ vẫn HOAT_DONG (vẫn thu).
drop trigger trial_slots_ended on app.trial_slots;
