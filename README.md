# Parent-Pal

Bạn đồng hành nuôi con cho phụ huynh Việt: trò chuyện thay cho điền form, có trí nhớ về từng bé, chủ động hỏi lại những chuyện phụ huynh từng lo.

Đây là **bản thử**: AI giả lập bằng luật tiếng Việt, dữ liệu lưu trên máy (localStorage trên web). Hai phần này nằm sau giao diện riêng nên sẽ được thay bằng mô hình thật và Supabase mà không phải sửa giao diện.

## Chạy

```bash
npm install
npm run web            # chạy bản web khi phát triển
npm run check          # typecheck + unit test + build web + đóng gói + test trình duyệt
```

`npm run check` là vòng kiểm tra đầy đủ, chạy trước mỗi lần báo xong việc. Ảnh chụp màn hình của test trình duyệt nằm ở `e2e/screens/`.

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `src/domain/` | Mô hình dữ liệu: bé, trí nhớ 4 lớp (hồ sơ, dòng thời gian, đang theo dõi, về phụ huynh), phạm vi riêng/chung |
| `src/ai/engine.ts` | Giao diện "bộ não" của Pal. Bản thật sẽ cài đặt giao diện này bằng API mô hình lớn |
| `src/ai/mockEngine.ts` | AI giả lập: hiểu cách xưng hô, tên và tuổi các con, các chủ đề thường gặp, sở thích và dị ứng |
| `src/ai/safety.ts` | Lớp an toàn chạy **trước** AI: tự hại, xâm hại, bạo lực, đòn roi, trầm cảm sau sinh |
| `src/state/companion.ts` | Điều phối một lượt trò chuyện (hàm thuần, test được) |
| `src/data/repo.ts` | Lưu trữ. Thêm `SupabaseRepo` cùng giao diện khi có backend |
| `src/ui/` | Giao diện: trò chuyện, vệt "đã ghi vào sổ tay", sổ tay về con, sửa/xóa trí nhớ |
| `e2e/` | Test trình duyệt (Chromium ẩn) trên bản web đã build |
| `scripts/build-artifact.mjs` | Đóng gói bản web thành một file HTML để đăng xem thử |

## Giới hạn của bản thử

- AI giả lập chỉ nhận ra các chủ đề trong `src/ai/topics.ts`. Lời khuyên trong đó là ví dụ, **chưa qua chuyên gia duyệt**.
- Lớp an toàn dùng từ khóa; bản thật cần mô hình phân loại và quy trình chuyển chuyên gia thật.
- Chưa có tài khoản, chưa đồng bộ giữa các thiết bị, chưa có app cho con.
