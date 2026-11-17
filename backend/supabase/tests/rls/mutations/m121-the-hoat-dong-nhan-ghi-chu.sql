-- expect: SCH-VER-03
-- Lỗi: gỡ ràng buộc note is null của activity_cards (chữ tự do chưa qua bộ kiểm khẩn được lưu).
alter table app.activity_cards drop constraint activity_cards_note_check;
