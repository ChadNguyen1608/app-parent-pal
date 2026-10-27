# Parent-Pal: hướng dẫn cho Claude

Đọc thêm `AGENTS.md` (quy tắc Expo) và `README.md` (cấu trúc thư mục).

## Sản phẩm

App đồng hành nuôi con cho phụ huynh trẻ ở Việt Nam. Trung tâm là **Pal**, một người bạn trò chuyện có trí nhớ, thay cho việc điền form.

- Pal xưng "mình", gọi phụ huynh theo cách họ chọn khi làm quen ("chị Lan" lần đầu, sau đó "chị").
- Nguyên tắc trò chuyện: **nghe trước, khuyên sau, gợi ý dịch vụ sau cùng**. Không gợi ý trả phí khi phụ huynh đang buồn.
- Pal không hùa theo khi phụ huynh muốn dùng đòn roi: phản biện nhẹ nhàng, thẳng thắn.
- Pal không chẩn đoán. Gọi là "đồng hành", không gọi là "tư vấn tâm lý".

Kế hoạch dài hơn (chưa làm): app riêng cho con, vòng "con đề xuất, cha mẹ định hướng", sàn kết nối trung tâm đã kiểm định, thanh toán.

## Các quyết định đã chốt

- **Một codebase Expo** (SDK 58, Expo Router, TypeScript) cho iOS, Android, web.
- **Trí nhớ 4 lớp** (`MemoryKind`): `fact` hồ sơ, `event` dòng thời gian, `followup` việc đang theo dõi để Pal hỏi lại, `parent` về chính phụ huynh.
- **Hai phạm vi** (`MemoryScope`): `private` chỉ người kể thấy, `family` cả nhà dùng chung. Cảm xúc của phụ huynh mặc định `private`. Không bao giờ đưa dữ liệu `private` của người này cho người lớn khác.
- **Minh bạch**: mọi thứ Pal nhớ phải hiện cho phụ huynh thấy (vệt dưới tin nhắn, Sổ tay về con) và sửa, xóa, đổi phạm vi được.
- **Lớp an toàn chạy trước AI** (`src/ai/safety.ts`). Mức `urgent` thì chỉ đưa thông tin hỗ trợ (111 bảo vệ trẻ em, 113 công an, 115 cấp cứu), không trả lời như thường, không ghi trí nhớ.
- **AI sau giao diện `CompanionEngine`** (`src/ai/engine.ts`). Hiện là `MockEngine` (luật tiếng Việt). Bản thật: gọi API mô hình lớn qua server, trả về đúng `TurnOutput`. Không gửi tên con, trường, địa chỉ ra API nước ngoài khi chưa ẩn danh.
- **Lưu trữ sau giao diện `Repo`** (`src/data/repo.ts`). Hiện là `LocalRepo` (AsyncStorage). Sau này thêm Supabase cùng giao diện.
- Có nhiều con mà phụ huynh không nêu tên: **hỏi lại**, không đoán.
- So khớp tiếng Việt: dùng `prep`/`hasPhrase` trong `src/ai/text.ts`. Chỉ so khớp kiểu bỏ dấu khi phụ huynh gõ không dấu ("cáu" và "câu" không được lẫn nhau).

## Bộ kiến thức

Cấu trúc bộ kiến thức ở `docs/kien-thuc/ban-do-kien-thuc.md` (bản v5). Đọc file này trước khi viết hay xếp bất kỳ nội dung lời khuyên nào.

- Trục dọc là tuổi: tiền mang thai → thai kỳ → 0–6 → 6–11 → 11–15 → 15–18 → 18–24.
- Mỗi nội dung thuộc **1 nhóm chính** trong 17 nhóm: lớp **Nền** an toàn; cấp **A** phát triển cốt lõi (1–6); cấp **B** môi trường (7–12); **C1** định hướng xuyên suốt (13, 14, 16); **C2** định hướng giai đoạn (15, 17).
- Xếp nhóm theo cây quyết định và sổ quyết định phân loại trong file, không tự đặt nhóm mới.
- Không điểm tổng, không so sánh trẻ với trẻ khác; tín hiệu an toàn luôn được ưu tiên.
- Nội dung do AI soạn phải ghi `người soạn: AI` và không được tự chuyển sang "đã duyệt".

## Làm việc

```bash
npm install
npm run check   # typecheck + jest + build web + đóng gói artifact + test trình duyệt
```

- Chạy `npm run check` trước khi báo xong bất kỳ việc gì. Xem ảnh trong `e2e/screens/` khi đổi giao diện.
- Cài gói bằng `EXPO_OFFLINE=1 npx expo install <gói>`: trong môi trường cloud, máy chủ phiên bản của Expo bị chặn, cờ này dùng danh sách phiên bản đi kèm SDK.
- Test trình duyệt dùng `puppeteer-core` + `@sparticuz/chromium` (không cần cài trình duyệt). Thêm `?fast` vào URL để bỏ độ trễ "đang viết".
- `scripts/build-artifact.mjs` đóng gói bản web thành một file HTML tự chứa (nhúng JS và 4 font) để đăng trang xem thử.
- Giao diện: bộ màu "đèn ngủ" trong `src/ui/theme.ts`, font Be Vietnam Pro, hỗ trợ sáng và tối. Chữ trên giao diện viết tiếng Việt, ngắn, rõ, động từ nói đúng việc nút làm.
- Comment trong code viết bằng tiếng Việt.

## Giới hạn hiện tại

- Lời khuyên trong `src/ai/topics.ts` là ví dụ, **chưa qua chuyên gia duyệt**.
- Chưa có tài khoản, đồng bộ, backend. Supabase của chủ dự án đã dùng hết 2 project miễn phí.
