// Tiện ích xử lý tiếng Việt cho AI giả lập.

/** Bỏ dấu, viết thường, để so khớp cả khi phụ huynh gõ không dấu. */
export function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Văn bản đã chuẩn bị để so khớp. Bỏ dấu làm mất nghĩa ("cáu" và "câu" cùng thành "cau"),
 * nên chỉ so khớp kiểu không dấu khi chính phụ huynh gõ không dấu.
 */
export interface Prepared {
  raw: string;
  folded: string;
  accented: boolean;
}

export function prep(text: string): Prepared {
  const raw = text.normalize('NFC').toLocaleLowerCase('vi').replace(/\s+/g, ' ').trim();
  const folded = fold(text);
  return { raw, folded, accented: /[^\x00-\x7f]/.test(raw) };
}

const WORD = '\\p{L}\\p{N}';

/** Có chứa cụm từ nguyên vẹn (theo ranh giới từ) không. */
export function hasPhrase(p: Prepared, phrase: string): boolean {
  const hay = p.accented ? p.raw : p.folded;
  const needle = p.accented ? phrase.normalize('NFC').toLocaleLowerCase('vi') : fold(phrase);
  const re = new RegExp(`(^|[^${WORD}])${escapeRe(needle)}($|[^${WORD}])`, 'u');
  return re.test(hay);
}

export function hasAny(p: Prepared, phrases: string[]): string | null {
  for (const ph of phrases) if (hasPhrase(p, ph)) return ph;
  return null;
}

export function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Viết hoa chữ cái đầu mỗi từ: "na" -> "Na". */
export function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase('vi') + w.slice(1).toLocaleLowerCase('vi'))
    .join(' ');
}

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "hôm nay", "hôm qua", "3 hôm trước", "tuần trước", "ngày 17/10". */
export function relativeDay(then: number, now: number): string {
  const days = Math.round((startOfDay(now) - startOfDay(then)) / DAY);
  if (days <= 0) return 'hôm nay';
  if (days === 1) return 'hôm qua';
  if (days < 7) return `${days} hôm trước`;
  if (days < 14) return 'tuần trước';
  const d = new Date(then);
  return `ngày ${d.getDate()}/${d.getMonth() + 1}`;
}

export const days = (n: number) => n * DAY;

/** Chọn một mẫu câu theo hạt giống cố định, để câu trả lời đa dạng mà test vẫn ổn định. */
export function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

export function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
