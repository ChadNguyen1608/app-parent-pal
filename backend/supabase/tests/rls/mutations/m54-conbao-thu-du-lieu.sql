-- expect: CON-D58a,CON-D58b
-- Lỗi: MD-CONBAO bật collect_enabled (thu dữ liệu 'không khỏe' khi LQ-16 chưa có trả lời).
update app.purposes set collect_enabled = true where code = 'MD-CONBAO';
