-- expect: TRIAL-EVID-01
-- Lỗi: gỡ trình kiểm bằng chứng xóa: có thể ghi khóa lạ, dữ liệu cá nhân vào row_counts.
drop trigger deletion_evidence_validate on app.deletion_evidence;
