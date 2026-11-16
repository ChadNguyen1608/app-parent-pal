// Câu chữ hiển thị của từng mục đích, lấy NGUYÊN từ wireframe PA-02 (title, desc) và PA-32 (short).
// Mục đích không có trong bảng này không hiện ra (máy chủ có MD-SUCKHOE nhưng wireframe ghi "Không thu: sức khỏe").
// "Lịch sử thay đổi lịch" có trong wireframe nhưng chưa có mục đích tương ứng ở máy chủ nên chưa hiện.
// CẦN CHỦ SẢN PHẨM DUYỆT: dòng MD-CONBAO ở PA-02 (wireframe chỉ có ở PA-32).
export type PurposeLabel = { code: string; title: string; desc: string; short: string };

export const PURPOSE_LABELS: PurposeLabel[] = [
  { code: 'MD-LICH', title: 'Lịch và thời khóa biểu của con', desc: 'Bắt buộc để xếp lịch', short: 'Lịch và thời khóa biểu' },
  { code: 'MD-XONG', title: 'Đánh dấu "Xong" trên máy con', desc: 'Bạn thấy việc nào con đã làm', short: 'Đánh dấu "Xong"' },
  { code: 'MD-MET', title: 'Hỏi thăm sau giờ học', desc: 'Con chọn Ổn / Hơi mệt / Rất mệt. Bạn chỉ thấy tổng hợp cuối tuần', short: 'Hỏi thăm sau giờ học' },
  { code: 'MD-MONGMUON', title: 'Mong muốn của con', desc: 'Con gửi lựa chọn có sẵn cho bạn', short: 'Mong muốn của con' },
  { code: 'MD-BAOCAO', title: 'Báo cáo tuần', desc: 'Gửi tối Chủ Nhật', short: 'Báo cáo tuần' },
  { code: 'MD-DONGBO', title: 'Nhắc giờ trên máy con', desc: 'Thông báo theo từng khối', short: 'Nhắc giờ trên máy con' },
  { code: 'MD-CONBAO', title: 'Con báo không khỏe (tùy chọn)', desc: 'Đang chờ duyệt', short: 'Con báo không khỏe (tùy chọn)' },
];
export const labelOf = (code: string) => PURPOSE_LABELS.find((l) => l.code === code);
export const shortName = (code: string) => labelOf(code)?.short ?? code;
