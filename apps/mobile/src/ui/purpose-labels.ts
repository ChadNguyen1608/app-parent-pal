// Câu chữ hiển thị của các mục đồng ý (D-64: một mục lõi, hai mục riêng).
// Wireframe PA-02, PA-32 chưa vẽ theo mô hình mới nên MỌI câu ở đây là "tạm": chờ chủ sản phẩm duyệt (xem báo cáo T2.6).
export type PurposeLabel = { code: string; title: string; desc: string; short: string };

/** Mục lõi: một đồng ý gộp, mô tả gọn phần lõi. */
export const CORE_LABEL: PurposeLabel = {
  code: 'MD-LICH',
  title: 'Phần cốt lõi của app',
  desc: 'Lịch của con, đồng bộ sang máy con và nhắc giờ, con bấm "Xong", hỏi thăm sau giờ học, mong muốn của con, báo cáo tuần. Cần để dùng app.',
  short: 'Phần cốt lõi',
};
/** Hai mục riêng, không chọn sẵn. */
export const OPTIONAL_LABELS: PurposeLabel[] = [
  {
    code: 'MD-SUCKHOE',
    title: 'Lưu thông tin sức khỏe của con',
    desc: 'Dị ứng, thuốc và ghi chú khác trong hồ sơ con. Chỉ bố mẹ thấy, máy con không thấy.',
    short: 'Thông tin sức khỏe của con',
  },
  {
    code: 'MD-CONBAO',
    title: 'Cho con báo bố mẹ ngay',
    desc: 'Con chọn một câu có sẵn để báo bố mẹ (thấy không khỏe, nhờ đón sớm, nhờ gọi). Con không gõ chữ. Thông báo tự xóa sau 7 ngày.',
    short: 'Con báo bố mẹ ngay',
  },
];
export const PURPOSE_LABELS: PurposeLabel[] = [CORE_LABEL, ...OPTIONAL_LABELS];
export const labelOf = (code: string) => PURPOSE_LABELS.find((l) => l.code === code);
export const shortName = (code: string) => labelOf(code)?.short ?? code;
