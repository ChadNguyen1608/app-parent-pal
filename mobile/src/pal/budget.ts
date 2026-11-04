import { judge, defaultBudget, getBudget } from './balance.ts';
import type { ColKey } from './balance.ts';
import type { Budget, PalState } from './types.ts';

export type GroupDef = { k: string; n: string; ex: string; mode: 'fixed' | 'input' | 'rest'; sub?: boolean };

export const GROUPS: GroupDef[] = [
  { k: 'truong', n: 'Ở trường và đi lại', ex: 'Theo thời khóa biểu', mode: 'fixed' },
  { k: 'hoc_them', n: 'Học thêm và tập luyện ngoài trường', ex: 'Lấy từ khung Hoạt động của con: trung tâm, gia sư, năng khiếu, CLB thể thao (tính cả đi lại)', mode: 'fixed' },
  { k: 'hoc_nha', n: 'Học và rèn luyện ở nhà', ex: 'Bài cô giao, ôn bài, học theo định hướng bố mẹ, tự luyện đàn, luyện chữ', mode: 'input' },
  { k: 'sinh_hoat', n: 'Ăn uống, vệ sinh, việc cá nhân', ex: 'Bữa ăn, tắm, thay đồ, soạn cặp, đọc truyện trước ngủ', mode: 'input' },
  { k: 'ngu', n: 'Ngủ', ex: 'Từ tắt đèn đến lúc dậy', mode: 'input' },
  { k: 'choi_nghi', n: 'Chơi tự do, vận động vui, nghỉ ngơi', ex: 'Phần thời gian còn lại trong ngày (đã gồm một nửa giờ ăn)', mode: 'rest' },
  { k: 'man_hinh', n: '↳ trong đó: màn hình giải trí (tối đa)', ex: 'Tivi, điện thoại, game', mode: 'input', sub: true },
];

/** Đặt số giờ cho một ô; trả về quỹ mới (không sửa quỹ cũ). Giờ không hợp lệ thì giữ nguyên. */
export function setBudget(s: PalState, col: ColKey, gk: string, hours: number): Budget {
  const B: Budget = JSON.parse(JSON.stringify(getBudget(s)));
  if (!isFinite(hours) || hours < 0) return B;
  (B[col] as Record<string, number>)[gk] = Math.round((hours * 60) / 5) * 5;
  if (judge(s, gk, col, (B[col] as Record<string, number>)[gk])[0] !== 'do') delete B.ok[col + '.' + gk];
  return B;
}

export { defaultBudget };
