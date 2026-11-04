// Chuyển từ prototype/index.html (checkDayK, judge, defaultBudget, fixedDay, actualDay...).
// Giữ nguyên hành vi và câu chữ. Quy tắc chuẩn: documents/pal/spec-quy-tac-lap-lich.md.
import { DAYS, type Block, type Budget, type Day, type GroupKey, type PalState } from './types.ts';
import { fmtMin, hm, toMin } from './time.ts';

export const SOFT = 30; // Pal được xê dịch ±30 phút

export const STUDY = /(ôn|học|bài|toán|tiếng việt|tiếng anh|từ vựng|đọc to|luyện|làm đề|văn|chính tả)/i;
export const NOT_HOME = /(ở trường|đi học|tại trường|trung tâm|học thêm|tan học|về nhà|đồng phục|soạn cặp|chuẩn bị)/i;
export const SPORT = /(tập|thi đấu|bóng|bơi|võ|chạy|đạp xe|thể thao|gym)/i;
export const BED = /(tắt đèn|đi ngủ|^ngủ)/i;
export const MEAL = /(ăn sáng|ăn trưa|ăn tối|bữa|ăn nhẹ|^ăn )/i;

export type Live = Block & { s: number; e: number };
export type Warning = { t: string; k: string };
export type Color = 'xanh' | 'cam' | 'do' | 'xam';
export type ColKey = 'wd' | 'we';

export const COLS: { k: ColKey; n: string; days: Day[] }[] = [
  { k: 'wd', n: 'Ngày đi học', days: ['T2', 'T3', 'T4', 'T5', 'T6'] },
  { k: 'we', n: 'Cuối tuần', days: ['T7', 'CN'] },
];

export function gradeOf(s: PalState): number | null {
  const t = String(s.profile.tuoi_lop ?? '');
  const g = /lớp\s*(\d{1,2})/i.exec(t);
  if (g) return +g[1];
  const a = /(\d{1,2})\s*tuổi/i.exec(t);
  return a ? Math.max(1, +a[1] - 5) : null;
}

export function ageOf(s: PalState): number | null {
  const t = String(s.profile.tuoi_lop ?? '');
  const a = /(\d{1,2})\s*tuổi/i.exec(t);
  if (a) return +a[1];
  const g = gradeOf(s);
  return g ? g + 5 : null;
}

export const sleepNeed = (s: PalState) => ((ageOf(s) || 9) <= 12 ? 540 : 480);

export function defaultBudget(s: PalState): Budget {
  const g = gradeOf(s) || 3;
  const a = ageOf(s) || 9;
  const young = a <= 10;
  const need = sleepNeed(s);
  return {
    wd: { hoc_nha: g * 10, sinh_hoat: 105, ngu: need + 30, man_hinh: young ? 30 : 60 },
    we: { hoc_nha: g * 10, sinh_hoat: 120, ngu: need + 60, man_hinh: young ? 60 : 120 },
    ok: {},
  };
}

export function validBudget(b: Budget | null): b is Budget {
  return !!b && !!b.wd && typeof b.wd.hoc_nha === 'number' && !!b.we && typeof b.we.ngu === 'number';
}

/** Quỹ đang dùng: của bố mẹ nếu hợp lệ, không thì mặc định theo tuổi. Không sửa state. */
export const getBudget = (s: PalState): Budget => (validBudget(s.budget) ? s.budget : defaultBudget(s));

const effDayRaw = (s: PalState, d: Day): Block[] => s.plan.ngoai_le[d]?.khoi ?? s.plan.ngay[d] ?? [];

export function liveBlocks(s: PalState, d: Day): Live[] {
  return effDayRaw(s, d)
    .filter((b) => b.trang_thai !== 'huy' && toMin(b.bat_dau) !== null)
    .map((b) => ({ ...b, s: toMin(b.bat_dau) as number, e: (toMin(b.ket_thuc) ?? toMin(b.bat_dau)) as number }))
    .sort((a, b) => a.s - b.s);
}

export const isStudy = (b: Block) =>
  (b.tai === 'cao' || b.tai === 'vua') && STUDY.test(b.khoi + ' ' + (b.viec || []).join(' ')) && !NOT_HOME.test(b.khoi);
export const isSchool = (b: Live) => /(ở trường|tại trường|học ở trường)/i.test(b.khoi) && b.e - b.s >= 150;

/** Các kiểm tra được nới trong giai đoạn tạm thời đang áp dụng. */
export function relaxed(s: PalState): Set<string> {
  const G = s.plan.giai_doan;
  return new Set(G && G.trang_thai === 'dang_ap_dung' ? G.noi_long || [] : []);
}

export function checkDayK(s: PalState, d: Day): Warning[] {
  const W: Warning[] = [];
  const B = liveBlocks(s, d);
  if (!B.length) return W;
  const push = (t: string, k = 'khac') => W.push({ t, k });
  const school = B.find(isSchool);
  // (4) học trước giờ đi học
  if (school) {
    B.filter((b) => b.e <= school.s && isStudy(b)).forEach((b) =>
      push('Có khối học "' + b.khoi + '" ngay trước giờ đi học; buổi sáng nên để con vệ sinh, vận động, ăn sáng.', 'truoc_gio_hoc'),
    );
  }
  // (2) phục hồi sau giờ học
  if (school) {
    const after = B.filter((b) => b.s >= school.e);
    const firstStudy = after.find(isStudy);
    if (firstStudy && !after.some((b) => b.tai === 'phuc_hoi' && b.s < firstStudy.s)) {
      push('Sau giờ học ở trường chưa có khối phục hồi trước "' + firstStudy.khoi + '".', 'phuc_hoi');
    }
  }
  // (3) hai khối tải cao liền nhau
  for (let i = 1; i < B.length; i++) {
    const a = B[i - 1];
    const b = B[i];
    if (a.tai === 'cao' && b.tai === 'cao' && b.s - a.e < 5 && !isSchool(a) && !isSchool(b)) {
      push('"' + a.khoi + '" và "' + b.khoi + '" là hai khối tải cao liền nhau, nên chèn nghỉ ngắn.', 'cao_lien');
    }
  }
  // (5) tổng giờ học ở nhà
  {
    const col = d === 'T7' || d === 'CN' ? 'we' : 'wd';
    const lim = getBudget(s)[col].hoc_nha;
    const total = B.filter(isStudy).reduce((n, b) => n + Math.max(0, b.e - b.s), 0);
    if (total > lim + SOFT) {
      push('Tổng giờ học ở nhà khoảng ' + total + ' phút, vượt quỹ bố mẹ đã chọn ' + lim + ' phút (cho phép lệch ±' + SOFT + ' phút).', 'tong_gio_hoc');
    }
  }
  // (7) khoảng cách giữa các bữa
  {
    const ev: { t: number; n: string }[] = [];
    const ML = /(ăn sáng|ăn trưa|ăn tối|bữa|ăn nhẹ|ăn phụ|^ăn )/i;
    B.forEach((b) => {
      if (ML.test(b.khoi) || (b.viec || []).some((v) => /(ăn nhẹ|bữa phụ|ăn phụ|ăn sáng|ăn tối)/i.test(v))) ev.push({ t: b.s, n: b.khoi });
    });
    if (school && school.s <= 660 && school.e >= 720 && !ev.some((x) => x.t >= 600 && x.t <= 780)) {
      ev.push({ t: 675, n: 'bữa trưa ở trường (giả định 11h15)' });
    }
    ev.sort((a, b) => a.t - b.t);
    const lim = (ageOf(s) || 9) <= 6 ? 240 : 300;
    for (let i = 1; i < ev.length; i++) {
      const gap = ev[i].t - ev[i - 1].t;
      if (gap > lim) {
        push(
          'Từ ' + ev[i - 1].n + ' đến ' + ev[i].n + ' cách khoảng ' + fmtMin(gap) +
            ' không có gì ăn. Mốc tham khảo: trẻ cần ăn khoảng 3–4 giờ một lần, 7–12 tuổi có thể 4–5 giờ (Viện Dinh dưỡng và Ăn kiêng Hoa Kỳ). Nên thêm bữa phụ nhỏ ở giữa.',
          'an_xa',
        );
      }
    }
  }
  // (1) giờ ngủ
  const bed = [...B].reverse().find((b) => BED.test(b.khoi));
  const nd = DAYS[(DAYS.indexOf(d) + 1) % 7];
  const NB = liveBlocks(s, nd);
  const age = ageOf(s);
  if (bed && NB.length && age) {
    let sleep = NB[0].s + 1440 - bed.s;
    if (sleep > 1440) sleep -= 1440;
    const need = age <= 12 ? 540 : 480;
    if (sleep < need) {
      push('Từ tắt đèn ' + bed.bat_dau + ' đến dậy ' + NB[0].bat_dau + ' hôm sau chỉ khoảng ' + fmtMin(sleep) + ', dưới mức ' + need / 60 + ' giờ cho ' + age + ' tuổi.', 'ngu');
    }
  }
  // (6) tập mạnh sát giờ ngủ
  if (bed) {
    B.filter((b) => b.tai === 'cao' && SPORT.test(b.khoi) && bed.s - b.e < 60 && b.e <= bed.s).forEach((b) =>
      push('"' + b.khoi + '" kết thúc chưa tới 1 giờ trước giờ tắt đèn.', 'tap_muon'),
    );
  }
  return W;
}

/** Cảnh báo còn hiệu lực (đã trừ phần được nới trong giai đoạn tạm thời). */
export function checkDay(s: PalState, d: Day): string[] {
  const r = relaxed(s);
  return checkDayK(s, d).filter((w) => !r.has(w.k)).map((w) => w.t);
}

export function relaxedCount(s: PalState, d: Day): number {
  const r = relaxed(s);
  return checkDayK(s, d).filter((w) => r.has(w.k)).length;
}

export function allWarnings(s: PalState): Partial<Record<Day, string[]>> {
  const o: Partial<Record<Day, string[]>> = {};
  DAYS.forEach((d) => {
    const w = checkDay(s, d);
    if (w.length) o[d] = w;
  });
  return o;
}

/* ---------- quỹ thời gian ---------- */

export function groupOf(b: Live): GroupKey {
  if (b.nhom && ['truong', 'hoc_them', 'hoc_nha', 'choi_nghi', 'sinh_hoat', 'ngu'].includes(b.nhom)) return b.nhom;
  const t = b.khoi + ' ' + (b.viec || []).join(' ');
  if (BED.test(b.khoi)) return 'ngu';
  if (isSchool(b) || /(đi học|về nhà|tan học)/i.test(b.khoi)) return 'truong';
  if (/(trung tâm|học thêm|gia sư|lớp bơi|lớp vẽ|lớp đàn|câu lạc bộ|clb|võ|taekwondo|karate|múa|đi học tiếng anh)/i.test(t)) return 'hoc_them';
  if (b.tai === 'phuc_hoi') return 'choi_nghi';
  if (isStudy(b)) return 'hoc_nha';
  if (/(ăn|bữa|vệ sinh|tắm|đánh răng|thay đồ|soạn cặp|dậy|nhật ký|đọc sách|đọc truyện)/i.test(t)) return 'sinh_hoat';
  if (b.tai === 'cao' || b.tai === 'vua') return 'hoc_nha';
  return 'choi_nghi';
}

export const actDur = (a: { bat_dau: string; ket_thuc: string }) => {
  const x = toMin(a.bat_dau);
  const y = toMin(a.ket_thuc);
  return x !== null && y !== null && y > x ? y - x : 0;
};

export function fixedDay(s: PalState, d: Day): { truong: number; hoc_them: number } {
  const R = { truong: 0, hoc_them: 0 };
  const useActs = s.activities.length > 0;
  liveBlocks(s, d).forEach((b) => {
    const g = groupOf(b);
    if (g === 'truong' || (g === 'hoc_them' && !useActs)) R[g] += Math.max(0, b.e - b.s);
  });
  if (useActs) {
    s.activities.filter((a) => a.thu.includes(d)).forEach((a) => {
      R.hoc_them += actDur(a) + (+a.di_lai || 0);
    });
  }
  return R;
}

export type DayTotals = Record<GroupKey | 'man_hinh', number>;

export function actualDay(s: PalState, d: Day): DayTotals | null {
  const R: DayTotals = { truong: 0, hoc_them: 0, hoc_nha: 0, choi_nghi: 0, man_hinh: 0, sinh_hoat: 0, ngu: 0 };
  const B = liveBlocks(s, d);
  if (!B.length) return null;
  let last: number | null = null;
  B.forEach((b) => {
    const g = groupOf(b);
    const dur = Math.max(0, b.e - b.s);
    if (g !== 'ngu') {
      R[g] += dur;
      if (g === 'sinh_hoat' && MEAL.test(b.khoi)) R.choi_nghi += Math.round(dur / 2);
    }
    if (b.man_hinh || /(tivi|ti vi|điện thoại|game|màn hình|ipad)/i.test(b.khoi)) R.man_hinh += dur;
    if (last !== null && b.s > last && g !== 'ngu') R.choi_nghi += b.s - last;
    last = Math.max(last || 0, b.e);
  });
  const bed = [...B].reverse().find((b) => BED.test(b.khoi));
  const nb = liveBlocks(s, DAYS[(DAYS.indexOf(d) + 1) % 7]);
  if (bed && nb.length) {
    let sl = nb[0].s + 1440 - bed.s;
    if (sl > 1440) sl -= 1440;
    R.ngu = sl;
  }
  return R;
}

export function rangeOf(col: ColKey, fn: (d: Day) => Record<string, number> | null, key: string): [number, number] | null {
  const days = COLS.find((c) => c.k === col)!.days;
  const xs = days.map(fn).filter((v): v is Record<string, number> => !!v).map((v) => v[key]);
  return xs.length ? [Math.min(...xs), Math.max(...xs)] : null;
}

/** Phần còn lại = 24h − cố định − các ô bố mẹ nhập (ăn uống tính một nửa vào nghỉ). */
export function restRange(s: PalState, col: ColKey): [number, number] {
  const B = getBudget(s)[col];
  const days = COLS.find((c) => c.k === col)!.days;
  const vals = days.map((d) => {
    const f = fixedDay(s, d);
    return 1440 - f.truong - f.hoc_them - B.hoc_nha - B.sinh_hoat - B.ngu + Math.round(B.sinh_hoat * 0.25);
  });
  return [Math.min(...vals), Math.max(...vals)];
}

/** Màu và câu cảnh báo của một ô quỹ giờ (đặc tả mục 2.2). */
export function judge(s: PalState, gk: string, col: ColKey, v: number): [Color, string] {
  const wd = col === 'wd';
  const need = sleepNeed(s);
  const lo = (x: number, ok: number, warn: number, why: string): [Color, string] => (x >= ok ? ['xanh', ''] : x >= warn ? ['cam', why] : ['do', why]);
  switch (gk) {
    case 'ngu': {
      const rng = (ageOf(s) || 9) <= 12 ? '9–12 giờ cho trẻ 6–12 tuổi' : '8–10 giờ cho trẻ 13–18 tuổi';
      return lo(v, need, need - 30, 'Ngủ ' + hm(v) + ', thấp hơn mức tối thiểu ' + hm(need) + '. Mốc tham khảo: ' + rng + ' (Viện Hàn lâm Y học Giấc ngủ Hoa Kỳ, AASM). Thiếu ngủ kéo dài làm giảm tập trung và tâm trạng.');
    }
    case 'hoc_nha':
      return ['xam', '']; // bố mẹ tự quản lý; ảnh hưởng thể hiện qua ô chơi và nghỉ, giấc ngủ
    case 'man_hinh':
      return v <= 60
        ? ['xanh', '']
        : v <= 120
          ? ['cam', 'Màn hình giải trí ' + hm(v) + ', trên 1 giờ. Mốc 1 giờ là mặc định của Pal cho trẻ nhỏ, để còn chỗ cho vận động và tắt màn hình trước giờ ngủ 60 phút (chưa phải chuẩn y khoa).']
          : ['do', 'Màn hình giải trí ' + hm(v) + ', vượt mốc tối đa 2 giờ/ngày cho trẻ 5–17 tuổi (Hướng dẫn vận động 24 giờ của Canada).'];
    case 'sinh_hoat':
      return lo(v, 90, 60, 'Ăn uống, vệ sinh còn ' + hm(v) + '. Mốc tham khảo khoảng 1h30 ở nhà: sáng 30′ (vệ sinh, ăn sáng), tối 30′ (ăn tối), 30′ tắm và vệ sinh trước ngủ. Thiếu thì con dễ phải ăn vội, bị giục. (Ước tính của Pal, chưa phải chuẩn.)');
    case 'choi_nghi':
      return v < 0
        ? ['do', 'Các nhóm cộng lại vượt 24 giờ khoảng ' + hm(-v) + '. Cần giảm giờ học ở nhà, sinh hoạt hoặc ngủ cho đủ một ngày.']
        : lo(v, wd ? 60 : 120, wd ? 30 : 60, 'Chơi và nghỉ chỉ còn ' + hm(v) + '. Mốc tham khảo ' + (wd ? 'ngày đi học ít nhất 1 giờ: 20–30′ phục hồi sau giờ học và khoảng 30′ tự do buổi tối' : 'cuối tuần ít nhất 2 giờ chơi tự do') + '; WHO khuyến nghị trẻ 5–17 tuổi vận động trung bình 60′/ngày, phần ngoài giờ trường nằm trong ô này.');
    case 'hoc_them':
      return v <= (wd ? 120 : 180)
        ? ['xanh', '']
        : [v <= (wd ? 180 : 270) ? 'cam' : 'do', 'Học thêm ' + hm(v) + (wd ? ', trên 2 giờ sau 6–7 giờ ở trường' : ', trên 3 giờ trong ngày nghỉ') + ', làm hẹp thời gian phục hồi và chơi tự do. (Mốc mặc định của Pal, chưa phải chuẩn.)'];
    default:
      return ['xam', ''];
  }
}
