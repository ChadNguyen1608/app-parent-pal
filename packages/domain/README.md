# packages/domain

Kiểu dữ liệu dùng chung, mã lỗi, hằng số, múi giờ cố định `Asia/Ho_Chi_Minh` (task T0.4). Không phụ thuộc package ngoài.

| File | Nội dung |
|---|---|
| `src/types.ts` | `DAYS`, `Block`, `Plan`, `Phase`, `Activity`, `Budget`, `BLOCK_KINDS` (B-11) |
| `src/errors.ts` | Mã `checkDayK` và `extraChecks`, trạng thái ngày, kết quả kiểm giai đoạn, vòng đời giai đoạn, `PARAM_STATUS` |
| `src/time.ts` | `TIMEZONE`, `dayCodeOf`, `addDays`, `weekStart`, `dateInVietnam(epochMs)`, `toMin`, `hhmm`. Hàm thuần, không đọc đồng hồ máy |

Chạy test: `npm test` ở gốc repo. Import chéo gói dùng đường dẫn tương đối (`../../domain/src/index.ts`) vì chưa có workspace.
