import { DAYS, type Block, type Day } from './types.ts';
import { pad } from './time.ts';

export const todayKey = (now = new Date()): Day => DAYS[(now.getDay() + 6) % 7];
export const blockKey = (b: Block) => (b.bat_dau || '') + '|' + (b.khoi || '');
export const nowHHMM = (now = new Date()) => pad(now.getHours()) + ':' + pad(now.getMinutes());
export const nowMin = (now = new Date()) => now.getHours() * 60 + now.getMinutes();

export type Kind = 'anh' | 'noi' | 'tu' | 'bm' | 'khong' | 'bam';

/** Cách xác nhận của một khối, theo chữ trong trường xac_nhan. */
export function kindOf(x: string | undefined): Kind {
  const s = (x || '').toLowerCase();
  if (/ảnh|chụp/.test(s)) return 'anh';
  if (/giọng|kể|nói/.test(s)) return 'noi';
  if (/tự động|vùng|buổi tập/.test(s)) return 'tu';
  if (/bố mẹ|phụ huynh/.test(s)) return 'bm';
  if (/không cần/.test(s) || !s) return 'khong';
  return 'bam';
}

export const WX: Record<string, { n: string; d: string[] }> = {
  nang: { n: '☀️ Nắng nóng', d: ['Mũ', 'Bình nước đầy'] },
  mua: { n: '🌧 Mưa', d: ['Áo mưa hoặc ô', 'Túi ni lông bọc sách'] },
  lanh: { n: '🧥 Lạnh', d: ['Áo khoác', 'Khăn quàng'] },
  thuong: { n: '🌤 Bình thường', d: [] },
};

export const dateAdd = (n: number, now = new Date()) => {
  const t = new Date(now.getTime() + n * 864e5);
  return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
};
