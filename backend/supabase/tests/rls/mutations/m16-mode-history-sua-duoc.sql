-- expect: FN-TBL-04
-- Lỗi: gỡ trigger chỉ-thêm của mode_history.
drop trigger mode_history_append_only on app.mode_history;
