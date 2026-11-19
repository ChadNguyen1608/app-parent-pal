// Ẩn danh trước khi gửi ra Claude API (CLAUDE.md: không gửi tên con, trường, địa chỉ ra API nước ngoài khi chưa ẩn danh).
// Thay tên con, tên gọi người lớn (lấy từ hồ sơ hộ), trường, địa chỉ, số điện thoại, email bằng nhãn ([con 1], [phụ huynh], [trường 1]...),
// rồi đổi lại khi trả về. Thuần, test bằng deno test. Người soạn: AI, chưa kiểm chứng độc lập.
//
// Quy tắc khớp tên (nghiêng về ẩn thừa còn hơn sót):
//  - không phân biệt hoa thường, nguyên từ (hai bên không phải chữ/số);
//  - tên có dấu khớp đúng dấu; tên gõ KHÔNG dấu cũng khớp ("Bình" khớp "binh"), nhưng "bĩnh" thì không (tránh nuốt chữ thường);
//  - mỗi từ của tên (trừ từ xưng hô như bé, anh, chị) cũng là bí danh của tên đó ("chị Hoa" -> "Hoa");
//  - tên trùng chữ thường ("Hoa", "Lan") bị ẩn cả khi nghĩa là hoa/lan: chấp nhận.
// Giới hạn đã biết: tên trường/địa chỉ chỉ nhận ra khi viết hoa chữ cái đầu hoặc có tiền tố (THCS, THPT, số nhà + đường); viết thường toàn bộ
// ("truong le quy don") thì sót. Câu tìm kiếm ra ngoài vẫn phải tuân bản đồ §1.1 mục 6.

export interface AnonPerson { call_name: string; self?: boolean }
export interface AnonInput { children: AnonPerson[]; adults: AnonPerson[] }

const TITLES = new Set(['anh', 'chị', 'chi', 'em', 'bé', 'be', 'cô', 'co', 'chú', 'chu', 'bác', 'bac', 'ông', 'ong', 'bà', 'ba', 'dì', 'di', 'cậu', 'cau', 'mợ', 'mẹ', 'me', 'bố', 'bo', 'má', 'ma', 'thầy', 'thay', 'bạn', 'ban', 'con', 'cháu', 'chau']);
const LETTER = /[\p{L}\p{N}]/u;
const DIACRITIC = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/;

function fold1(c: string): string {
  const f = c.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase();
  return f.length ? Array.from(f)[0] : c;
}
const hasDia = (s: string) => DIACRITIC.test(s.normalize('NFC').toLowerCase());
const norm = (s: string) => s.normalize('NFC').replace(/\s+/g, ' ').trim();

interface Alias { fold: string[]; lower: string; label: string }

const SCHOOL_RES: RegExp[] = [
  /\b(?:THPT|THCS|TH|MN)\s+(?:[\p{Lu}][\p{L}]*(?:\s+|$)){1,4}/gu,
  /\b[Tt]rường\s+(?:(?:[Tt]iểu học|[Tt]rung học (?:cơ sở|phổ thông)|[Mm]ầm non|[Mm]ẫu giáo|[Qq]uốc tế|[Ss]ong ngữ|[Cc]huyên|[Nn]hà trẻ)\s+)?(?:[\p{Lu}][\p{L}]*(?:\s+|$)){1,4}/gu,
  /\b[Tt]iểu học\s+(?:[\p{Lu}][\p{L}]*(?:\s+|$)){1,4}/gu,
];
const ADDRESS_RES: RegExp[] = [
  /\b(?:số\s+)?\d{1,4}[A-Za-z]?(?:\/\d+[A-Za-z]?)*\s*,?\s+(?:đường|phố|ngõ|ngách|hẻm|đ\.)\s+(?:[\p{L}\d]+(?:\s+|$)){1,4}/giu,
  /\b(?:đường|phố|ngõ|ngách|hẻm|phường|xã|thị trấn|khu phố|tổ dân phố|chung cư|khu đô thị)\s+(?:[\p{Lu}\d][\p{L}\d]*(?:\s+|$)){1,3}/gu,
];
const PHONE_RE = /(?<![\d])(?:\+?84|0)(?:[\s.\-]?\d){8,10}(?![\d])/g;
const EMAIL_RE = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;

export class Anonymizer {
  private aliases: Alias[] = [];
  private back = new Map<string, string>();      // khóa nhãn chuẩn hóa -> chuỗi gốc
  private extra: Array<{ kind: string; re: RegExp[] }> = [];
  private counters: Record<string, number> = {};
  private extraByOriginal = new Map<string, string>();
  readonly fullNames: string[] = [];

  constructor(input: AnonInput) {
    input.children.forEach((c, i) => this.addPerson(c.call_name, `[con ${i + 1}]`));
    let n = 0;
    for (const a of input.adults) this.addPerson(a.call_name, a.self ? '[phụ huynh]' : `[người lớn ${++n}]`);
    this.aliases.sort((a, b) => b.fold.length - a.fold.length);
    this.extra = [{ kind: 'trường', re: SCHOOL_RES }, { kind: 'địa chỉ', re: ADDRESS_RES }, { kind: 'email', re: [EMAIL_RE] }, { kind: 'số điện thoại', re: [PHONE_RE] }];
  }

  private key(label: string) { return label.toLowerCase().replace(/\s+/g, ' '); }

  private addPerson(callName: string, label: string) {
    const full = norm(callName);
    if (!full) return;
    this.fullNames.push(full);
    if (!this.back.has(this.key(label))) this.back.set(this.key(label), full);
    const words = full.split(' ');
    const forms = new Set<string>([full]);
    for (const w of words) if (w.length >= 2 && !TITLES.has(w.toLowerCase())) forms.add(w);
    if (words.length > 1) {   // bỏ từ xưng hô đầu: "chị Hoa" -> "Hoa"; "bé Bảo An" -> "Bảo An"
      let k = 0;
      while (k < words.length - 1 && TITLES.has(words[k].toLowerCase())) k++;
      if (k > 0) forms.add(words.slice(k).join(' '));
    }
    for (const f of forms) this.aliases.push({ fold: Array.from(f).map(fold1), lower: f.toLowerCase(), label });
  }

  private nameMatchAt(cps: string[], fc: string[], i: number): Alias | null {
    for (const a of this.aliases) {
      const n = a.fold.length;
      if (i + n > fc.length) continue;
      let ok = true;
      for (let k = 0; k < n; k++) if (fc[i + k] !== a.fold[k]) { ok = false; break; }
      if (!ok) continue;
      if (i > 0 && LETTER.test(cps[i - 1])) continue;
      if (i + n < cps.length && LETTER.test(cps[i + n])) continue;
      const span = cps.slice(i, i + n).join('');
      if (span.toLowerCase() === a.lower || !hasDia(span)) return a;
    }
    return null;
  }

  private nameSegment(seg: string): string {
    const cps = Array.from(seg.normalize('NFC'));
    const fc = cps.map(fold1);
    let out = '';
    for (let i = 0; i < cps.length;) {
      const a = this.nameMatchAt(cps, fc, i);
      if (a) { out += a.label; i += a.fold.length; } else { out += cps[i]; i++; }
    }
    return out;
  }

  private extraLabel(kind: string, original: string): string {
    const known = this.extraByOriginal.get(`${kind}|${original.toLowerCase()}`);
    if (known) return known;
    const n = (this.counters[kind] = (this.counters[kind] ?? 0) + 1);
    const label = `[${kind} ${n}]`;
    this.extraByOriginal.set(`${kind}|${original.toLowerCase()}`, label);
    this.back.set(this.key(label), original.trim());
    return label;
  }

  anonymize(text: string): string {
    let t = text.normalize('NFC');
    for (const { kind, re } of this.extra) {
      for (const r of re) {
        t = t.replace(new RegExp(r.source, r.flags), (m) => {
          const trailing = /\s+$/.exec(m)?.[0] ?? '';
          return this.extraLabel(kind, m.trimEnd()) + trailing;
        });
      }
    }
    // tên người: bỏ qua đoạn đã là nhãn [..]
    return t.split(/(\[[^\]]*\])/u).map((p) => (p.startsWith('[') && p.endsWith(']') ? p : this.nameSegment(p))).join('');
  }

  /** Đổi nhãn về chuỗi gốc trong câu trả lời của AI. */
  restore(text: string): string {
    const r = text.replace(/\[\s*([^\]\[]{1,40}?)\s*\]/gu, (m, inner: string) => this.back.get(this.key(`[${inner}]`)) ?? m);
    return r.replace(/(?<![\p{L}])(bé|anh|chị|cô|chú|bác|em|ông|bà|dì|mợ|cậu)\s+\1(?![\p{L}])/giu, '$1');
  }

  /** Kiểm sau cùng: chuỗi gửi đi còn chứa tên đầy đủ của ai trong hộ không (khớp nguyên từ, không phân biệt hoa thường). */
  leaks(outgoing: string): string[] {
    const hay = outgoing.normalize('NFC').toLowerCase();
    return this.fullNames.filter((n) => {
      const nl = n.toLowerCase();
      for (let from = 0; ;) {
        const i = hay.indexOf(nl, from);
        if (i < 0) return false;
        const before = i > 0 ? hay[i - 1] : '';
        const after = hay[i + nl.length] ?? '';
        if (!LETTER.test(before) && !LETTER.test(after)) return true;
        from = i + 1;
      }
    });
  }
}

/** Từ xưng hô (anh, chị...) lấy từ tên gọi, để lời mẫu và lời dặn AI gọi đúng; không có thì "bạn". */
export function addressTerm(callName: string): string {
  const w = norm(callName).split(' ')[0]?.toLowerCase() ?? '';
  return TITLES.has(w) && !['con', 'cháu', 'chau', 'bé', 'be', 'bạn', 'ban'].includes(w) ? w : 'bạn';
}
