# Tài liệu Parent-Pal

## Cấu trúc

```
documents/
├── knowledge/                         Kho kiến thức
│   ├── spec-knowledge-map.md          Bản đồ bộ kiến thức (đặc tả)
│   ├── ref-sources.md                 Kho nguồn có mã NG-xxx
│   ├── by-age/                        Nội dung theo giai đoạn tuổi
│   │   └── age-00-06-early-childhood/ 0–6 tuổi (mầm non)
│   └── procedures/                    Thủ tục hành chính, theo lĩnh vực
└── pal/                               Cách Pal làm việc
    ├── guide-pal-answers.md           Cách Pal trả lời
    └── examples/                      Ví dụ câu trả lời chuẩn
```

## Quy ước đặt tên

- Tiếng Anh, chữ thường, nối bằng gạch ngang.
- Tên file có **tiền tố theo loại**:

| Tiền tố | Loại | Ví dụ |
|---|---|---|
| `spec-` | Đặc tả: cấu trúc, quy tắc, quyết định | `spec-knowledge-map.md` |
| `guide-` | Hướng dẫn cách làm | `guide-pal-answers.md` |
| `ref-` | Tài liệu tham chiếu, tra cứu | `ref-sources.md` |
| `content-` | Nội dung kiến thức (lớp bằng chứng) | `content-05-toddler-2-3y.md` |
| `procedure-` | Thủ tục hành chính | `procedure-school-enrollment.md` |
| `example-` | Ví dụ câu trả lời chuẩn | `example-01-year-3-plan.md` |

- **Thư mục giai đoạn tuổi:** `age-<từ>-<đến>-<tên giai đoạn>`, tuổi viết 2 chữ số để sắp xếp đúng. Dự kiến: `age-00-06-early-childhood`, `age-06-11-primary-school`, `age-11-15-lower-secondary`, `age-15-18-upper-secondary`, `age-18-24-young-adult`; thêm `pre-pregnancy` và `pregnancy` cho hai giai đoạn trước sinh.
- **File nội dung trong một giai đoạn:** `content-<thứ tự>-<tên chặng>-<khoảng tuổi>.md`. Đơn vị tuổi: `m` là tháng, `y` là năm. Ví dụ `content-03-toddler-12-18m.md`.
- **Thủ tục** xếp theo lĩnh vực, không theo tuổi; mỗi mẩu trong file ghi độ tuổi áp dụng.
- **Mã nội dung** (`KT-xxxx`, `NG-xxx`…) không đổi khi đổi tên hay chuyển file.

## Nội dung 0–6 tuổi

| File | Chặng |
|---|---|
| `content-00-overview-0-6y.md` | Tổng quan và kiến thức nền 0–6 tuổi |
| `content-01-newborn-0-1m.md` | Sơ sinh (0–28 ngày) |
| `content-02-infant-1-12m.md` | 1–12 tháng |
| `content-03-toddler-12-18m.md` | 12–18 tháng |
| `content-04-toddler-18-24m.md` | 18–24 tháng |
| `content-05-toddler-2-3y.md` | 2–3 tuổi |
| `content-06-preschool-3-4y.md` | 3–4 tuổi |
| `content-07-preschool-4-5y.md` | 4–5 tuổi |
| `content-08-preschool-5-6y.md` | 5–6 tuổi |

## Thủ tục hành chính

| File | Lĩnh vực | Mã |
|---|---|---|
| `procedure-civil-registration.md` | Khai sinh; liên thông khai sinh, thường trú, bảo hiểm y tế, căn cước | KT-0901, KT-0902 |
| `procedure-health-insurance.md` | Bảo hiểm y tế cho trẻ | KT-0903 |
| `procedure-parental-leave.md` | Nghỉ thai sản của mẹ, nghỉ của bố | KT-0904 |
| `procedure-school-enrollment.md` | Nhập học nhà trẻ, mẫu giáo, lớp 1 | KT-0905, KT-0907 |
| `procedure-tuition-fees.md` | Học phí | KT-0906 |
| `procedure-mandatory-vaccination.md` | Tiêm chủng bắt buộc | KT-0908 |
