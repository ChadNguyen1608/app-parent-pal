import type { AlertKind } from '@/data/types';

// Câu chữ "Báo bố mẹ ngay" (D-67). Phía con: ba câu hỏi có sẵn (D-67 ghi nguyên ví dụ). Phía bố mẹ: câu khẳng định tương ứng.
// Tất cả "tạm", chờ chủ sản phẩm duyệt. Máy chủ chỉ nhận mã (AlertKind), không nhận chữ.
export const ALERT_KINDS: AlertKind[] = ['KHONG_KHOE', 'DON_SOM', 'GOI_BO_ME'];
export const CHILD_QUESTION: Record<AlertKind, string> = {
  KHONG_KHOE: 'Con thấy không khỏe?',
  DON_SOM: 'Nhờ bố mẹ đón sớm?',
  GOI_BO_ME: 'Con cần bố mẹ gọi?',
};
export const PARENT_LINE: Record<AlertKind, string> = {
  KHONG_KHOE: 'Con thấy không khỏe',
  DON_SOM: 'Con nhờ bố mẹ đón sớm',
  GOI_BO_ME: 'Con cần bố mẹ gọi',
};
