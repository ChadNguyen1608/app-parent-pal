import { DAYS, type Activity } from './types.ts';
import { actDur } from './balance.ts';
import { hhmm } from './time.ts';

export const LOAI: Record<Activity['loai'], string> = { hoc_them: 'Học thêm', the_thao: 'Tập luyện', nang_khieu: 'Năng khiếu', khac: 'Khác' };

type Patch = Partial<Omit<Activity, 'loai'>> & { loai?: string };

export function cleanAct(a: Patch, base?: Activity): Activity {
  const o: Partial<Activity> = { ...(base || {}) };
  (['ten', 'dia_diem', 'ghi_chu'] as const).forEach((k) => {
    if (a[k] !== undefined) o[k] = String(a[k] || '').trim();
  });
  if (a.loai !== undefined) o.loai = (a.loai in LOAI ? a.loai : 'khac') as Activity['loai'];
  if (Array.isArray(a.thu)) o.thu = DAYS.filter((d) => a.thu!.includes(d));
  (['bat_dau', 'ket_thuc'] as const).forEach((k) => {
    if (a[k] !== undefined) o[k] = hhmm(a[k]);
  });
  if (a.di_lai !== undefined) o.di_lai = Math.max(0, Math.round(+a.di_lai || 0));
  if (!o.loai) o.loai = 'hoc_them';
  if (!o.thu) o.thu = [];
  if (!o.ten) o.ten = 'Hoạt động';
  return o as Activity;
}

/** Tổng thời gian mỗi tuần của các hoạt động (phút, gồm đi lại). */
export function weeklyMinutes(list: Activity[]): number {
  return list.reduce((n, a) => n + a.thu.length * (actDur(a) + (a.di_lai || 0)), 0);
}
