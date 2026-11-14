# B01 Evidence Manifest: bằng chứng L4 Batch 01

- Trạng thái lưu trữ: **ARCHIVE_VERIFIED** (5/5 asset VERIFIED)
- Ngày lập: 2026-11-13 (UTC)
- Người thực hiện: Claude (Opus 5.5, phiên Claude Code), theo cho phép của chủ sản phẩm
- Phạm vi: chỉ ghi nhận nơi lưu và checksum. File này **không** phê duyệt L4, không sửa Owner Decision Log, Blueprint canonical hay Research Backlog.

## 1. Nơi lưu trữ

| Mục | Giá trị |
|---|---|
| Repo | `ChadNguyen1608/parent-pal-evidence` (**private**, kiểm qua API ngày 2026-11-13) |
| Nhánh | `evidence/b01-20261113` |
| Commit mốc | `4209d52af3f233f69af26898fdf5e71988a477d7` |
| Thư mục | `b01-20261113/` (kèm `SHA256SUMS`, `README.md`) |
| Thời điểm commit | 2026-11-13T08:55:22Z |
| Công cụ | `git push` qua proxy của phiên; đối chiếu bằng `git clone` mới + `sha256sum` |

Repo `app-parent-pal` là public, nên ZIP **không** được đặt ở đây. Manifest chỉ chứa checksum và đường dẫn tới repo private.

## 2. Danh sách asset

| Module | File | SHA-256 | Kích thước (byte) | Số mục ZIP | Git blob | Commit nguồn | Owner Decision Log | Kiểm định | Kết luận run |
|---|---|---|---|---|---|---|---|---|---|
| F01-G04-M02 Consent Ledger | `B01_F01-G04-M02.zip` | `179f8b5c2b4145dfccc9ba4e1ea2fe204ce88b661179482bf2555ce5f5483e4a` | 477009 | 78 | `6ff9df43947ebe367e547c7eb0cc43ab224120ab` | `6433e64` | `Feature_3_2_L4_B01_Consent_Ledger_Owner_Decision_Log_APPROVED.md` | VERIFIED | CONDITIONAL_GO |
| F01-G05-M01 Mode State | `B01_F01-G05-M01.zip` | `568537f26bf64a983f811dece1b2ab3ed0f68d765dc283dc0d75a5b16f4c587b` | 429449 | 83 | `5a9ae98fd4a3a185c26fd2c98961e36dd094c2f3` | `998f2f9` | `Feature_3_2_L4_B01_Mode_State_Owner_Decision_Log_APPROVED.md` | VERIFIED | CONDITIONAL_GO |
| F07-G06-M01 Purpose-bound Access | `B01_F07-G06-M01.zip` | `fa2f85d510ee9ba70615fbac14df223d80f1f2da7a94d271f9175cd3e4a471ff` | 500602 | 83 | `f24a6cb54d18c2cdfbd61ce88a789fe95b16aff5` | `19494a2` | `Feature_3_2_L4_B01_Purpose_Bound_Access_Owner_Decision_Log_APPROVED.md` | VERIFIED | CONDITIONAL_GO |
| F04-G01-M01 Plan Structure | `B01_F04-G01-M01.zip` | `2f8ab24792c529fea6a6c7aaa4f76b3d17992e3db9229be10f4c7e67c5ad3ef5` | 650000 | 84 | `f554b0743588be04902362db1dc9a88252b36fd9` | `71fcbd9` | `Feature_3_2_L4_B01_Plan_Structure_Owner_Decision_Log_APPROVED.md` | VERIFIED | CONDITIONAL_GO |
| F04-G06-M01 Change Requests | `B01_F04-G06-M01.zip` | `e6dbb1196ef9b8ec1eaf3da4adb45b429e43f95355063acf2ca775f853376722` | 644488 | 83 | `919146877d567450fde1e801d05d01804e123c6c` | `db77e3d` | `Feature_3_2_L4_B01_Change_Requests_Owner_Decision_Log_APPROVED.md` | VERIFIED | CONDITIONAL_GO |

Commit nguồn là commit của `app-parent-pal` mà từng run L4 đọc. Owner Decision Log nằm trong `documents/app-design-document/`; danh mục chung ở `Feature_3_2_L4_Owner_Decision_Register_INDEX.md`.

## 3. Cách kiểm định (VERIFIED)

1. Trước khi lưu: SHA-256 của 5 file khớp danh sách checksum do ChatGPT cung cấp; CRC đạt; không có đường dẫn `..`, đường dẫn tuyệt đối hay symlink; đủ 12 tài liệu mỗi ZIP.
2. Lưu: commit nguyên file nhị phân vào repo private (không giải nén, không tạo lại).
3. Tải lại: `git clone` mới nhánh `evidence/b01-20261113` vào thư mục tạm khác; HEAD = `4209d52`.
4. Đối chiếu: SHA-256, kích thước và số mục ZIP của bản tải lại khớp bản gốc 5/5; `testzip` không báo lỗi.
5. Không chạy script hay file thực thi nào trong ZIP.

## 4. Sàng lọc dữ liệu nhạy cảm

- Nội dung: tài liệu thiết kế và review L4. Không có dữ liệu thật của trẻ.
- Quét tự động theo mẫu (khóa API, token GitHub/OpenAI/AWS, private key, Bearer, email cá nhân, số điện thoại/CCCD dạng số): 0 kết quả.
- Đây là quét theo mẫu, không thay thế rà soát thủ công.

## 5. Giới hạn

1. **Không dùng GitHub Release.** Phiên bị chặn tạo Release (HTTP 403, chính sách phiên). ZIP được lưu dưới dạng file trong git. Byte vẫn được giữ nguyên và kiểm định như trên.
2. **Không có tag.** Proxy của phiên ngắt kết nối khi đẩy tag `evidence-b01-20261113`, nên mốc cố định là **commit `4209d52`**, không phải tag. Chủ sản phẩm có thể tự tạo tag hoặc Release trỏ vào commit này sau.
3. Nhánh `evidence/b01-20261113` không được bảo vệ. Nếu ai đó đẩy đè, commit `4209d52` vẫn là căn cứ; cần đối chiếu lại `SHA256SUMS`.
4. Căn cứ chính để đối chiếu là SHA-256; Git blob chỉ để tra nhanh trong repo.
5. Cả 5 run đều kết luận CONDITIONAL_GO. Lưu trữ bằng chứng không đổi kết luận này và không phê duyệt L4.
6. Mốc giờ trong `run_log` của Module 04 lệch một ngày (đã ghi CLOCK_NOTE từ Module 05). Mốc giờ trong manifest này lấy từ commit git (UTC).
