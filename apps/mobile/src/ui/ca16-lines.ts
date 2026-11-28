// CA-16: dòng "bố mẹ thấy / không thấy" dựng từ các mục đích đang hiệu lực (khớp quyền thật, IA 3.5.1, D-03, D-64).
// Câu chữ lấy nguyên từ wireframe CA-16. Phần lõi luôn có (một đồng ý gộp); dòng "Báo bố mẹ ngay" chỉ khi MD-CONBAO hiệu lực.
export type SeenLine = { see: boolean; text: string };

export function seenLines(effective: ReadonlySet<string>): SeenLine[] {
  const out: SeenLine[] = [
    { see: true, text: 'Lịch của con' },
    { see: true, text: 'Việc con bấm "Xong" và giờ bấm' },
    { see: true, text: 'Con hay mệt vào loại ngày nào, trong báo cáo cuối tuần' },
    { see: false, text: 'Con chọn gì mỗi ngày khi được hỏi thăm' },
    { see: true, text: 'Mong muốn con gửi' },
  ];
  if (effective.has('MD-CONBAO')) out.push({ see: true, text: 'Khi con bấm "Báo bố mẹ ngay" (bố mẹ nhận ngay)' });
  return out;
}
