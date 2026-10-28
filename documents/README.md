# Tài liệu Parent-Pal

## Cấu trúc

```
documents/
├── knowledge/                         Kho kiến thức
│   ├── spec-ban-do-kien-thuc.md       Bản đồ bộ kiến thức (đặc tả)
│   ├── ref-kho-nguon.md               Kho nguồn có mã NG-xxx
│   ├── by-age/                        Nội dung theo giai đoạn tuổi
│   │   └── age-00-06-early-childhood/ 0–6 tuổi (mầm non)
│   └── procedures/                    Thủ tục hành chính, theo lĩnh vực
└── pal/                               Cách Pal làm việc
    ├── guide-cach-pal-tra-loi.md      Cách Pal trả lời
    └── examples/                      Ví dụ câu trả lời chuẩn
```

## Quy ước đặt tên

- Chữ thường, nối bằng gạch ngang.
- **Tên thư mục:** tiếng Anh.
- **Tên file:** tiền tố theo loại bằng tiếng Anh, phần mô tả bằng **tiếng Việt không dấu** (để không nhầm khi gõ, khi tìm kiếm và trên mọi hệ điều hành).
- Các tiền tố:

| Tiền tố | Loại | Ví dụ |
|---|---|---|
| `spec-` | Đặc tả: cấu trúc, quy tắc, quyết định | `spec-ban-do-kien-thuc.md` |
| `guide-` | Hướng dẫn cách làm | `guide-cach-pal-tra-loi.md` |
| `ref-` | Tài liệu tham chiếu, tra cứu | `ref-kho-nguon.md` |
| `content-` | Nội dung kiến thức (lớp bằng chứng) | `content-05-nha-tre-2-3-tuoi.md` |
| `procedure-` | Thủ tục hành chính | `procedure-nhap-hoc.md` |
| `example-` | Ví dụ câu trả lời chuẩn | `example-01-ke-hoach-nam-thu-3.md` |

- **Thư mục giai đoạn tuổi:** `age-<từ>-<đến>-<tên giai đoạn>`, tuổi viết 2 chữ số để sắp xếp đúng. Dự kiến: `age-00-06-early-childhood`, `age-06-11-primary-school`, `age-11-15-lower-secondary`, `age-15-18-upper-secondary`, `age-18-24-young-adult`; thêm `pre-pregnancy` và `pregnancy` cho hai giai đoạn trước sinh.
- **File nội dung trong một giai đoạn:** `content-<thứ tự>-<tên chặng>-<khoảng tuổi>-<thang|tuoi>.md`. Ví dụ `content-03-tap-di-12-18-thang.md`.
- **Thủ tục** xếp theo lĩnh vực, không theo tuổi; mỗi mẩu trong file ghi độ tuổi áp dụng.
- **Mã nội dung** (`KT-xxxx`, `NG-xxx`…) không đổi khi đổi tên hay chuyển file.

## Nội dung 0–6 tuổi

| File | Chặng |
|---|---|
| `content-00-tong-quan-0-6-tuoi.md` | Tổng quan và kiến thức nền 0–6 tuổi |
| `content-01-so-sinh-0-1-thang.md` | Sơ sinh (0–28 ngày) |
| `content-02-nhu-nhi-1-12-thang.md` | 1–12 tháng |
| `content-03-tap-di-12-18-thang.md` | 12–18 tháng |
| `content-04-tap-di-18-24-thang.md` | 18–24 tháng |
| `content-05-nha-tre-2-3-tuoi.md` | 2–3 tuổi |
| `content-06-mau-giao-3-4-tuoi.md` | 3–4 tuổi |
| `content-07-mau-giao-4-5-tuoi.md` | 4–5 tuổi |
| `content-08-mau-giao-5-6-tuoi.md` | 5–6 tuổi |

## Thủ tục hành chính

| File | Lĩnh vực | Mã |
|---|---|---|
| `procedure-ho-tich-khai-sinh.md` | Khai sinh; liên thông khai sinh, thường trú, bảo hiểm y tế, căn cước | KT-0901, KT-0902 |
| `procedure-bao-hiem-y-te.md` | Bảo hiểm y tế cho trẻ | KT-0903 |
| `procedure-nghi-thai-san.md` | Nghỉ thai sản của mẹ, nghỉ của bố | KT-0904 |
| `procedure-nhap-hoc.md` | Nhập học nhà trẻ, mẫu giáo, lớp 1 | KT-0905, KT-0907 |
| `procedure-hoc-phi.md` | Học phí | KT-0906 |
| `procedure-tiem-chung-bat-buoc.md` | Tiêm chủng bắt buộc | KT-0908 |
