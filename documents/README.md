# Tài liệu Parent-Pal

## Cấu trúc

```
documents/
├── knowledge/                         Kho kiến thức
│   ├── spec-ban-do-kien-thuc.md       Bản đồ bộ kiến thức (đặc tả)
│   ├── ref-kho-nguon.md               Kho nguồn có mã NG-xxx
│   ├── ref-hang-doi-kiem-chung.md     Thông tin tra mạng chờ tìm bổ sung, duyệt
│   ├── ref-muc-quan-tam-tim-kiem.md   Mức quan tâm tìm kiếm các phương pháp (Google Trends)
│   ├── by-age/                        Nội dung theo giai đoạn tuổi
│   │   ├── age-00-06-early-childhood/ 0–6 tuổi (mầm non)
│   │   └── age-06-11-primary-school/  6–11 tuổi (tiểu học)
│   ├── foundations/                   Kiến thức nền: cơ chế tâm lý, nhu cầu tâm lý của trẻ
│   ├── seasonal/                      Nội dung theo mùa: bệnh hay tăng theo tháng, theo vùng
│   ├── methods/                       Phương pháp giáo dục và chăm sóc
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
- **Mã nội dung** (`KT-xxxx`, `NG-xxx`…) không đổi khi đổi tên hay chuyển file. Bài phương pháp dùng mã `KT-3FFNN`, bài kiến thức nền dùng mã `KT-4FFNN`, bài theo mùa dùng mã `KT-5FFNN` (FF: số thứ tự file, NN: số thứ tự mẩu).

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

## Nội dung 6–11 tuổi

| File | Chặng |
|---|---|
| `content-00-tong-quan-6-11-tuoi.md` | Tổng quan và kiến thức dùng chung 6–11 tuổi |
| `content-01-tieu-hoc-dau-6-8-tuoi.md` | 6–8 tuổi (lớp 1–3) |
| `content-02-tieu-hoc-cuoi-9-11-tuoi.md` | 9–11 tuổi (lớp 4–5) |

## Phương pháp giáo dục và chăm sóc (`methods/`)

| File | Nội dung | Mã |
|---|---|---|
| `content-00-tong-quan-phuong-phap.md` | Bảng tổng quan, nguyên tắc chung | — |
| `content-01-montessori.md` | Montessori | KT-30101–30108 |
| `content-02-mam-non-reggio-waldorf-highscope.md` | Reggio Emilia, Waldorf, HighScope; học qua chơi hay học chữ sớm | KT-30201–30205 |
| `content-03-stem-steam.md` | STEM, STEAM | KT-30301–30305 |
| `content-04-day-som-the-hoc-nao-phai-van-tay.md` | Glenn Doman, video dạy bé đọc, "não phải", Mozart, sinh trắc vân tay | KT-30401–30405 |
| `content-05-easy-lich-sinh-hoat.md` | EASY, lịch Gina Ford | KT-30501–30503 |
| `content-06-an-dam-blw-kieu-nhat.md` | Ăn dặm tự chỉ huy (BLW), kiểu Nhật, 3 in 1 | KT-30601–30606 |
| `content-07-luyen-ngu.md` | Luyện ngủ, quấn chũn | KT-30701–30705 |
| `content-08-kumon-ban-tinh-toan-tu-duy-phonics.md` | Kumon, bàn tính, toán Singapore, toán tư duy, phonics; học trước chương trình | KT-30801–30805 |
| `content-09-song-ngu-tieng-anh-som.md` | Song ngữ, tiếng Anh sớm | KT-30901–30904 |
| `content-10-cach-nuoi-day.md` | Chương trình nuôi dạy, kỷ luật tích cực, nuôi con gắn bó, gentle parenting, RIE, Pikler, kiểu hổ | KT-31001–31005 |
| `content-11-ngu-chung-giuong.md` | Ngủ chung giường | KT-31101–31105 |
| `content-12-boi-som.md` | Bơi sớm | KT-31201–31203 |
| `content-13-kich-hoat-nao-giua-tomatis-luyen-tri-nho.md` | Kích hoạt não giữa, Tomatis, luyện trí nhớ | KT-31301–31303 |
| `content-14-toan-tu-duy.md` | "Toán tư duy", lớp toán cho trẻ mầm non, tiểu học | KT-31401–31404 |
| `content-15-tien-tieu-hoc.md` | Tiền tiểu học, chuẩn bị vào lớp 1 | KT-31501–31505 |

## Kiến thức nền (`foundations/`)

| File | Nội dung | Mã |
|---|---|---|
| `content-01-nhu-cau-tam-ly-va-tu-tin.md` | Bốn nhu cầu tâm lý (lăng kính chung); tự tin là gì, thay đổi theo tuổi; không chấm điểm tự tin; dấu hiệu | KT-40101–40105 |
| `content-02-co-che-tam-ly-trong-nuoi-day.md` | Lời khen, phần thưởng, tư duy phát triển, học qua quan sát, nhút nhát, so sánh, làm quen trước bước chuyển, lo âu, áp lực học tập | KT-40201–40209 |

## Thủ tục hành chính

| File | Lĩnh vực | Mã |
|---|---|---|
| `procedure-ho-tich-khai-sinh.md` | Khai sinh; liên thông khai sinh, thường trú, bảo hiểm y tế, căn cước | KT-0901, KT-0902 |
| `procedure-bao-hiem-y-te.md` | Bảo hiểm y tế cho trẻ, học sinh (mức hưởng, mức đóng, hỗ trợ theo tỉnh) | KT-0903, KT-0912 |
| `procedure-nghi-thai-san.md` | Nghỉ thai sản của mẹ, nghỉ của bố; trợ cấp một lần khi sinh; nghỉ chăm con ốm | KT-0904, KT-0923, KT-0924 |
| `procedure-nhap-hoc.md` | Nhập học nhà trẻ, mẫu giáo, lớp 1, lớp 6 | KT-0905, KT-0907, KT-0909, KT-0910 |
| `procedure-hoc-phi.md` | Học phí mầm non, tiểu học; hỗ trợ học phí trường tư; hỗ trợ chi phí học tập | KT-0906, KT-0911, KT-0922 |
| `procedure-tiem-chung-bat-buoc.md` | Tiêm chủng bắt buộc (gồm nhắc 7 tuổi, HPV) | KT-0908, KT-0913, KT-0914 |
| `procedure-quy-dinh-hoc-tap-tieu-hoc.md` | Chương trình, đánh giá, dạy thêm ở tiểu học | KT-0915, KT-0916, KT-0917 |
| `procedure-chuong-trinh-mien-phi-cua-nha-nuoc.md` | Chương trình y tế miễn phí của Nhà nước: tiêm chủng mở rộng tại trạm y tế, vitamin A, sàng lọc sơ sinh, kiểm tra sức khỏe đầu năm học, khám miễn phí theo lộ trình | KT-0918–0921, KT-0934 |
| `procedure-ho-tro-hoc-tap.md` | Sách giáo khoa miễn phí, ăn trưa 3–5 tuổi, con công nhân khu công nghiệp, nội trú, học bổng, vay vốn | KT-0925–0930 |
| `procedure-ho-tro-gia-dinh-va-tre-em.md` | Hỗ trợ khi sinh con, trợ cấp xã hội hằng tháng cho trẻ, bảo vệ trẻ em (111) | KT-0931–0933 |

## Nội dung theo mùa (`seasonal/`)

| File | Nội dung | Mã |
|---|---|---|
| `content-01-benh-theo-mua.md` | Lịch bệnh trong năm theo vùng; sốt xuất huyết, tay chân miệng, bệnh hô hấp, tiêu chảy, sởi, dại | KT-50101–50107 |

## Ví dụ câu trả lời chuẩn (`documents/pal/examples/`)

| File | Câu hỏi |
|---|---|
| `example-01-ke-hoach-nam-thu-3.md` | Những lưu ý trong năm thứ 3 của trẻ |
| `example-02-montessori-tre-nhut-nhat.md` | Con nghịch và nhút nhát, Montessori có hợp không; trường ở Hà Nội 3–5 triệu/tháng |
| `example-03-luu-y-giai-doan-tieu-hoc.md` | Giai đoạn cấp 1 cần lưu ý gì (câu hỏi chung theo giai đoạn) |
