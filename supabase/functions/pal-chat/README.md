# pal-chat

Edge Function giữ khóa Claude và luật của Pal; app chỉ gửi `{prompt}` (trạng thái + hội thoại) và nhận `{text}`.

- Model, `max_tokens`, mức nỗ lực, luật: do hàm quyết định, app không đổi được.
- Cần đăng nhập (JWT của người dùng ẩn danh). Khóa anon công khai bị từ chối (không có `sub`).
- Giới hạn lượt: mặc định 150 lượt/người/ngày và 3000 lượt/cả hệ thống/ngày (bảng `pal_usage`, hàm `pal_hit`).
  Đổi bằng secret `PAL_USER_DAILY_LIMIT`, `PAL_GLOBAL_DAILY_LIMIT`.
- Khóa Claude: secret `ANTHROPIC_API_KEY` (Supabase, Edge Functions, Secrets). Không ghi vào repo.
- Luật: `rules.txt` do `scripts/gen-function-rules.mjs` tạo từ `mobile/src/pal/prompt.ts`. Hàm tải đúng bản của một commit
  trên GitHub và kiểm sha256 (hai hằng số đầu `index.ts`). Đổi luật: tạo lại `rules.txt`, commit, push, sửa hai hằng số
  (mã commit và sha256 mà script in ra), triển khai lại hàm.
- Kiểm tra nhanh: `GET /functions/v1/pal-chat` (kèm khóa anon) trả `rules_ok` và `has_key`.
- Chưa có: ẩn danh dữ liệu trẻ trước khi gửi, lớp an toàn nội dung, đăng nhập bằng email.
