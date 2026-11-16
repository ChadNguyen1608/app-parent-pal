// CA-16: dòng "bố mẹ thấy / không thấy" dựng từ các mục đích đang hiệu lực (khớp quyền thật, IA 3.5.1, D-03).
// Câu chữ lấy nguyên từ wireframe CA-16; dòng MD-CONBAO chưa có trong wireframe (tạm, chờ duyệt, hiện khi mục đó bật được).
export type SeenLine = { see: boolean; text: string };

export function seenLines(effective: ReadonlySet<string>): SeenLine[] {
  const out: SeenLine[] = [{ see: true, text: 'Lịch của con' }];
  if (effective.has('MD-XONG')) out.push({ see: true, text: 'Việc con bấm "Xong" và giờ bấm' });
  if (effective.has('MD-MET') && effective.has('MD-BAOCAO')) out.push({ see: true, text: 'Con hay mệt vào loại ngày nào, trong báo cáo cuối tuần' });
  if (effective.has('MD-MET')) out.push({ see: false, text: 'Con chọn gì mỗi ngày khi được hỏi thăm' });
  if (effective.has('MD-MONGMUON')) out.push({ see: true, text: 'Mong muốn con gửi' });
  if (effective.has('MD-CONBAO')) out.push({ see: true, text: 'Khi con bấm "Báo bố mẹ ngay" (tạm)' });
  out.push({ see: false, text: 'Khi con bấm "Con cần giúp đỡ"' });
  return out;
}
