-- expect: TRIAL-PURGE-03
-- Lỗi: cấp quyền ghi private.purge_context cho service_role (mở đường xóa bảng chỉ-thêm).
grant insert on private.purge_context to service_role;
