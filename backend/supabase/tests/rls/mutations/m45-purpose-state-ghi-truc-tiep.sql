-- expect: CON-22c
-- Lỗi: gỡ chốt chặn ghi trực tiếp purpose_state.
drop trigger purpose_state_guard on app.purpose_state;
