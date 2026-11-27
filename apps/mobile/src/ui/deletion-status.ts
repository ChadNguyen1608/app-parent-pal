import type { OpenDeletion } from '@/data/types';

/** Dòng trạng thái yêu cầu xóa (chờ duyệt câu chữ). Không hứa "đã xóa hết": hạn xóa hẳn chưa chốt. */
export function deletionLine(d: OpenDeletion, childName?: string): string {
  const day = d.acceptedAt ? new Date(d.acceptedAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '';
  const what = d.scope === 'GIA_DINH' ? 'gia đình' : d.scope === 'NGUOI_LON_ROI' ? 'việc bạn rời gia đình' : `hồ sơ của ${childName ?? 'con'}`;
  return `Đã nhận yêu cầu xóa ${what}${day ? ` ngày ${day}` : ''}. Dữ liệu đã được ẩn. Thời hạn xóa hẳn chưa chốt. (tạm)`;
}
