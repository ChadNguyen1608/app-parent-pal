-- expect: TERMS-LOG-01
-- Lỗi: gỡ trigger chỉ-thêm khỏi app.terms_acceptances (sửa và xóa được).
drop trigger terms_acceptances_append_only on app.terms_acceptances;
