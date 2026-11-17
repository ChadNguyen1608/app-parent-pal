// SINH TỰ ĐỘNG bởi scripts/sync-shared.mjs từ packages/domain/src/time.ts. KHÔNG SỬA TAY: sửa ở packages/ rồi chạy lại script.
// Múi giờ và ngày (T0.4). Múi giờ cố định Asia/Ho_Chi_Minh (UTC+7, không có giờ mùa hè).
// Quy ước: ngày là chuỗi "YYYY-MM-DD" theo giờ Việt Nam. Mọi hàm là hàm thuần trên chuỗi/số,
// KHÔNG đọc đồng hồ máy (không Date.now, không new Date() không đối số) và không phụ thuộc biến TZ của tiến trình.
// Muốn biết "hôm nay", nơi gọi truyền vào một mốc thời gian (epoch ms) hoặc chính chuỗi ngày.
import { DAYS, type DayCode } from './types.ts';

export const TIMEZONE = 'Asia/Ho_Chi_Minh';
export const TZ_OFFSET_MINUTES = 7 * 60;
export const DATE_CONVENTION = 'v1: YYYY-MM-DD, Asia/Ho_Chi_Minh, inclusive both ends';
export const MS_PER_DAY = 86_400_000;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(s: unknown): s is string {
  if (typeof s !== 'string') return false;
  const m = ISO_DATE.exec(s);
  if (!m) return false;
  const n = Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / MS_PER_DAY);
  return isoFromDayNumber(n) === s;
}

/** Số ngày kể từ 1970-01-01 của một chuỗi ngày (tính trên UTC thuần, không phụ thuộc TZ máy). */
export function dayNumber(iso: string): number {
  return Math.round(Date.parse(iso + 'T00:00:00Z') / MS_PER_DAY);
}
export function isoFromDayNumber(n: number): string {
  return new Date(n * MS_PER_DAY).toISOString().slice(0, 10);
}
export function addDays(iso: string, k: number): string {
  return isoFromDayNumber(dayNumber(iso) + k);
}
/** Ngày theo giờ Việt Nam của một mốc epoch ms do nơi gọi truyền vào. */
export function dateInVietnam(epochMs: number): string {
  return isoFromDayNumber(Math.floor((epochMs + TZ_OFFSET_MINUTES * 60_000) / MS_PER_DAY));
}
/** Mã thứ của một ngày: 1970-01-01 là thứ Năm. */
export function dayCodeOf(iso: string): DayCode {
  const n = dayNumber(iso);
  return DAYS[(((n + 3) % 7) + 7) % 7]; // n=0 (T5) -> chỉ số 3
}
/** Ngày thứ Hai của tuần chứa `iso` (tuần bắt đầu T2). */
export function weekStart(iso: string): string {
  return addDays(iso, -DAYS.indexOf(dayCodeOf(iso)));
}

/** "HH:MM" -> phút trong ngày; null nếu không đọc được. */
export const toMin = (t: string | undefined | null): number | null => {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || '');
  return m ? +m[1] * 60 + +m[2] : null;
};
/** Phút -> "HH:MM", gói quanh 24h. */
export const hhmm = (m: number): string => {
  m = ((m % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};
