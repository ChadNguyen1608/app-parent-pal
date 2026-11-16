-- expect: CON-D58a
-- Lỗi: MD-CONBAO bị tắt thu (collect_enabled = false) trái D-67, nút "Báo bố mẹ ngay" không bật được.
update app.purposes set collect_enabled = false where code = 'MD-CONBAO';
