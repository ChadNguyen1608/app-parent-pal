// Hiểu câu trả lời tự do khi làm quen: cách xưng hô và thông tin các con.
import { fold, hasPhrase, prep, titleCase } from './text';

const KIN = ['chị', 'anh', 'mẹ', 'bố', 'ba', 'má', 'cô', 'chú', 'em', 'bác', 'dì'];

export interface CallName {
  /** Cách gọi đầy đủ: "chị Lan". */
  full: string;
  /** Cách gọi ngắn khi đã quen: "chị". Rỗng nếu không có đại từ. */
  short: string;
}

/** "Cứ gọi mình là chị Lan nhé" -> { full: "chị Lan", short: "chị" }. */
export function parseCallName(input: string): CallName | null {
  const text = input.trim().replace(/[.!?…]+$/u, '');
  if (!text) return null;
  const re = new RegExp(`(?:^|\\s)(${KIN.join('|')})\\s+(\\p{L}+)`, 'iu');
  const m = text.match(re);
  if (m) {
    const kin = m[1].toLocaleLowerCase('vi');
    const name = titleCase(m[2]);
    if (!isStop(name)) return { full: `${kin} ${name}`, short: kin };
  }
  // Trả lời ngắn chỉ có tên: "Lan".
  const words = text.split(/\s+/);
  if (words.length <= 2 && words.every((w) => /^\p{L}+$/u.test(w))) {
    const full = titleCase(text);
    return { full, short: '' };
  }
  const tail = text.match(/(?:^|\s)là\s+(\p{L}+(?:\s+\p{L}+)?)$/iu) ?? text.match(/(?:^|\s)gọi\s+(\p{L}+(?:\s+\p{L}+)?)$/iu);
  if (tail && tail[1] !== text) return parseCallName(tail[1]);
  return null;
}

/** Những từ hay đứng sau "bé/con" nhưng không phải tên. */
const STOP_NAMES = new Set(
  [
    'tôi', 'mình', 'em', 'gái', 'trai', 'lớn', 'nhỏ', 'út', 'đầu', 'thứ', 'nhà', 'của', 'đang', 'năm', 'hay', 'thì',
    'cả', 'hai', 'ba', 'bốn', 'và', 'với', 'là', 'nay', 'đã', 'mới', 'cũng', 'rất', 'bị', 'không', 'nó', 'thích',
    'tên', 'học', 'đi', 'ở', 'lại', 'có', 'được', 'cưng', 'yêu', 'ta', 'người', 'thôi', 'này', 'kia', 'ấy', 'đó',
    'nữa', 'nhé', 'ạ', 'à', 'một', 'mấy', 'các', 'những', 'hết', 'sinh', 'đẻ',
  ].map(low),
);

function low(s: string) {
  return s.normalize('NFC').toLocaleLowerCase('vi');
}
const isStop = (w: string) => STOP_NAMES.has(low(w));

const NUM_WORDS: Record<string, number> = {
  một: 1, hai: 2, ba: 3, bốn: 4, tư: 4, năm: 5, sáu: 6, bảy: 7, tám: 8, chín: 9, mười: 10,
};

function wordsToNumbers(text: string): string {
  return text
    .replace(/mười\s+(một|hai|ba|bốn|năm|lăm|sáu|bảy|tám|chín)/giu, (_, u: string) => {
      const unit = u.toLowerCase() === 'lăm' ? 5 : NUM_WORDS[u.toLowerCase()];
      return String(10 + unit);
    })
    .replace(new RegExp(`(${Object.keys(NUM_WORDS).join('|')})(\\s+tuổi)`, 'giu'), (_, w: string, t: string) => `${NUM_WORDS[w.toLowerCase()]}${t}`);
}

export interface ParsedChild {
  name: string;
  age?: number;
}

/**
 * "Nhà mình có bé Na 8 tuổi và bé Bin 5 tuổi" -> [{Na, 8}, {Bin, 5}].
 * Cũng hiểu "con gái tên Na, tám tuổi", "Na 8 tuổi, Bin 5 tuổi".
 */
export function parseChildren(input: string): ParsedChild[] {
  const text = wordsToNumbers(input);
  const found: { name: string; index: number }[] = [];

  const add = (raw: string, index: number) => {
    const name = titleCase(raw);
    if (isStop(name)) return;
    if (found.some((f) => fold(f.name) === fold(name))) return;
    found.push({ name, index });
  };

  // "tên Na", "bé Na", "con Na", "cháu Na", "bạn Na"
  const keyRe = /(?:^|[^\p{L}])(?:tên|bé|con|cháu|cu|thằng|cái)\s+(\p{L}+)/giu;
  for (const m of text.matchAll(keyRe)) {
    const word = m[1];
    if (isStop(word)) {
      // "con gái tên Na": để mẫu "tên" bắt.
      continue;
    }
    add(word, m.index ?? 0);
  }

  // Tên viết hoa đứng ngay trước tuổi: "Na 8 tuổi".
  const ageRe = /(\p{Lu}\p{Ll}*)\s*(?:,\s*)?(?:năm nay\s+)?(\d{1,2})\s*tuổi/gu;
  for (const m of text.matchAll(ageRe)) add(m[1], m.index ?? 0);

  // Gán tuổi: số tuổi gần nhất phía sau tên, trước tên kế tiếp.
  found.sort((a, b) => a.index - b.index);
  const ages = [...text.matchAll(/(\d{1,2})\s*tuổi/gu)].map((m) => ({ age: Number(m[1]), index: m.index ?? 0 }));
  return found.map((f, i) => {
    const nextIndex = found[i + 1]?.index ?? Infinity;
    const a = ages.find((x) => x.index > f.index && x.index < nextIndex);
    return a && a.age > 0 && a.age < 19 ? { name: f.name, age: a.age } : { name: f.name };
  });
}

/** Các tên con được nhắc trong câu (so khớp cả khi gõ không dấu). */
export function mentionedChildren<T extends { id: string; name: string }>(text: string, children: T[]): T[] {
  const p = prep(text);
  return children.filter((c) => hasPhrase(p, c.name));
}
