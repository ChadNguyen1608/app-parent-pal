-- expect: ALR-SEND-02
-- Lỗi: bỏ ràng buộc ba mã câu của child_alerts.kind (chữ tự do/triệu chứng lọt vào bảng).
alter table app.child_alerts drop constraint child_alerts_kind_check;
