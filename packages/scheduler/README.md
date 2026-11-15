# packages/scheduler

Bộ xếp lịch tất định của nấc 1 (A-lite E1), không AI, không phụ thuộc package ngoài. TypeScript thuần, chạy bằng `node --experimental-strip-types` (Node ≥ 22.6).
Chuyển từ spike v2 `app-design-document/progress/spike-e1-scheduler/` (task T0.3), sửa múi giờ và ngày (T0.4), thêm `kind` có cấu trúc (B-11) và xu hướng mệt theo loại ngày (D-37).
Quy tắc nguồn: `documents/pal/spec-quy-tac-lap-lich.md`; nghiệp vụ: Business Logic 11.1; thông số: `PARAMS` (nhãn `mac_dinh_chua_kiem_chung`, D-08).

## Chạy

| Lệnh (từ gốc repo) | Việc |
|---|---|
| `npm test` | Toàn bộ test của `packages/*` |
| `npm run test:tz` | `npm test` với `TZ=UTC` rồi `TZ=Asia/Ho_Chi_Minh` |
| `node --experimental-strip-types --test packages/scheduler/test/*.test.ts` | Chỉ test của scheduler |
| `tsc -p packages/tsconfig.json` | Kiểm kiểu mã nguồn (tùy chọn, cần `tsc` cài sẵn; không phải phụ thuộc của repo) |
| `node packages/scheduler/scripts/gen-golden.mjs <spike-e1-scheduler>` | Sinh lại `fixtures/golden/` từ spike (chỉ khi cố ý đổi golden) |

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `src/scheduler.ts` | `scheduleWeek`, `PARAMS`, `defaultBudget` |
| `src/validators.ts` | `checkDayK` (7 mã), `extraChecks`, `budgetBoard`, `confirmKeep`, `kind` |
| `src/phase.ts` | `validatePhase`, `submitPhase`, `activatePhase`, `tickPhases`, `endPhaseEarly` |
| `src/fatigue.ts` | `onCheckin`, `changePath`, `trend` (cũ), `trendByDayType` (D-37) |
| `src/rules.ts`, `src/profiles.ts` | Bảng 88 quy tắc; 8 hồ sơ giả lập P1..P8 |
| `fixtures/golden/` | P1..P8.json (giờ, tên khối, tải, nhóm, trạng thái ngày), params.json |
| `../domain/src/` | `types.ts` (Block, Plan, Phase, BLOCK_KINDS…), `errors.ts` (mã lỗi, trạng thái), `time.ts` (múi giờ, ngày) |

## Múi giờ và đồng hồ (T0.4)

- Múi giờ cố định `Asia/Ho_Chi_Minh` (UTC+7, không giờ mùa hè), hằng số `TIMEZONE` ở `packages/domain`.
- Ngày là chuỗi `YYYY-MM-DD` theo giờ Việt Nam. Mọi hàm nhận `today`/ngày làm tham số: `tickPhases(store, today)`, `submitPhase(..., today)`, `trend*(…, today)`. Không hàm nào đọc đồng hồ máy.
- Cần "hôm nay" từ một mốc thời gian: `dateInVietnam(epochMs)`; nơi gọi (app, Edge Function) truyền mốc vào.
- `scheduleWeek` không còn đo giờ máy (spike có `process.hrtime` và trường `ms`; đã bỏ để đầu ra tất định). Đo độ trễ làm ở nơi gọi (T0.5).
- `test/timezone.test.ts`: quét mã nguồn cấm `Date.now`, `new Date()`, `hrtime`, `Intl.DateTimeFormat`, `toLocale*`, `getHours`…; chạy tiến trình con ở 4 múi giờ (UTC, Asia/Ho_Chi_Minh, America/Los_Angeles, Pacific/Kiritimati) và so băm đầu ra.

## Ánh xạ test ↔ mã quy tắc / AC

| File test | Test | Quy tắc / quyết định | AC (BL 11.1 §AC) |
|---|---|---|---|
| `rules-v2.test.ts` | TC-D02-1..5 | D-02, C1, D6, D4 | AC-01, 02, 03 |
| | TC-D08-1 | D-08 (PR-01..PR-21) | |
| | TC-D09-1..14 | D-09, J2, J4, J5, J6, OD-02, B01-PS-OD-04 | AC-12..17 |
| | TC-D10-1..7, TC-D03-1 | D-10, OD-A7, D-03 (hồi quy của `trend` cũ) | |
| | TC-B1-1, 2 | B-1, C3, F4 (nghỉ ≥5′) | AC-05 |
| | TC-B2-1 | B-2, G7 | AC-07 |
| | TC-DET-1 | Tất định | AC-06 |
| `golden.test.ts` | 8 × (giờ + tên khối; trạng thái ngày, số đánh đổi, số câu hỏi), params, tất định toàn đầu ra | Toàn bộ quy tắc xếp, D-08 | AC-04, 09, 10, 11 (qua golden) |
| `mutation.test.ts` | 12 đột biến + lịch gốc sạch | `checkDayK` 7 mã + `x_man_hinh_ngu`, `x_phien`, `x_bo_bua`, `x_nghi_giua`; C1, C2, C3, C4, C5, C6, C7, F4, F5, H2 | |
| `kind.test.ts` | `kind` hợp lệ ở mọi khối; kind và suy-từ-tên cho cùng kết quả; tên tùy ý ("Karate", "Xyz"); `inferLegacyKind` | B-11 | |
| `trend-d37.test.ts` | Gộp theo loại ngày, hiện từ 1 lần, cửa sổ 14 ngày, ngoại lệ đè lịch tuần | D-37, D-21, D-03 | |
| `phase-extra.test.ts` | 5 ca giai đoạn của P5 + AC-18 | P6-OD-01 (60 ngày liên tục, ≥7 ngày trống), J4, J5, D-09 | AC-18 |
| `timezone.test.ts` | Quét đồng hồ; 4 múi giờ | T0.4 | |
| `../../domain/test/time.test.ts` | Ngày, thứ, tuần, `dateInVietnam` | T0.4 | |

## Khác spike (đã làm)

- **B-11 `kind`**: bộ xếp gán `kind` cho mọi khối; bộ kiểm đọc `kind`, `the_thao`, `man_hinh`. Regex tiếng Việt chỉ còn trong `inferLegacyKind()` cho lịch cũ không có `kind`. Test chứng minh cùng kết quả khi bỏ `kind` ở 8 hồ sơ.
- **B-11c**: `tap_muon` bắt cả buổi tập kết thúc sau giờ tắt đèn (spike bỏ lọt). Thử đột biến 12/12 (spike 11/12). Lỗi của ca đột biến spike: khối "Tắt đèn" bị chính hàm `put` xóa khi giờ dời; đã sửa ca (đặt cả `bat_dau` và `ket_thuc`).
- **Bảng `kind` mở rộng so với BL §2.2**: tách `bua_nha` thành `an_trua` và `an_toi` (bộ kiểm C7 cần biết có ăn tối), thêm `an_sang`; `bua_phu` dùng cả ở trường và ở nhà.
- **D-37**: thêm `trendByDayType`, `dayTypesOfDate`. `trend()` cũ giữ để TC-D03-1 (hồi quy) còn chạy.
- Golden so sánh giờ, tên, tải, nhóm, màn hình; không so `ghi_chu` và `kind` (trường mới). Golden khớp 8/8 ngay từ lần port đầu: không có khác biệt về giờ hay tên khối.

## Việc còn lại

1. **Xóa `trend()` cũ** và TC-D03-1 khi chủ sản phẩm xác nhận bỏ BR-133 (phần "theo thứ") và BR-135 (D-37 đã thay). Chưa xóa vì task yêu cầu giữ nguyên 32 test.
2. **Loại ngày (D-37)**: tập thẻ `DAY_TYPES` và mốc "buổi tối" từ 17:00 (`EVENING_FROM_MIN`) là mặc định tôi chọn, nhãn chưa kiểm chứng; cần chủ sản phẩm chốt danh sách loại ngày cho báo cáo tuần (BR-NTF-059).
3. **Phân loại hoạt động đầu vào** (`scheduler.ts`, nhánh `Học thêm:` / `Năng khiếu:`) vẫn dùng regex `STUDY` trên tên hoạt động khi `loai` không phải `the_thao`/`hoc_them`. Nên chuyển sang dùng `loai` bắt buộc (E6) khi có form nhập.
4. `inferLegacyKind` chỉ xấp xỉ regex cũ; chưa có dữ liệu PROTO thật để đối chiếu ngoài 8 hồ sơ.
5. Chưa làm theo Tech Spec §6.1: tham số D-23 (học thêm ngay sau trường ≥15′ phục hồi trước, bữa ≥20′), `effectiveDay` và ma trận ngày (cần hai bản TS/SQL, thuộc task sau), ghim khối K2, CR engine, cờ `child_device` (D-11).
6. Typecheck: mã nguồn qua `tsc` ở chế độ không strict (spike dùng nhiều `any`); chưa đặt `strict` (205 lỗi ở strict).
7. Thông số `PARAMS` còn nhãn `mac_dinh_chua_kiem_chung`, chờ thẩm định bước 14b (D-08). B-1 (nghỉ ≥5′) và B-2 vẫn là mặc định fail-safe chờ chủ sản phẩm.
