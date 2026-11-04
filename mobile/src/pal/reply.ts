// Áp phản hồi JSON của Pal vào trạng thái (chuyển từ send() và 4 tool trong prototype/index.html).
// Hàm thuần: nhận bản nháp của state, sửa trực tiếp bản nháp đó.
import { cleanAct } from './activities.ts';
import { checkDayK } from './balance.ts';
import { DAYS, DAY_NAME, type Activity, type Block, type Day, type Period, type PalState } from './types.ts';
import { todayStr } from './time.ts';

export type PalReply = {
  tra_loi?: string;
  ho_so?: Record<string, string>;
  tong_quan?: { muc_tieu?: string[]; nguyen_tac?: string[]; gio_ngu?: string; ghi_chu?: string } | null;
  /** ngay có thể là một mảng để gộp các ngày có lịch giống hệt nhau (tiết kiệm token đầu ra). */
  ngay?: { ngay: string | string[]; pham_vi?: string; ly_do?: string; khoi?: Partial<Block>[] }[];
  xoa_ngoai_le?: string[];
  hoat_dong?: (Partial<Activity> & { hanh_dong?: 'them' | 'sua' | 'xoa' })[];
  canh_bao?: string[];
  giai_doan?: (Partial<Period> & { hanh_dong?: 'tao' | 'xac_nhan' | 'sua' | 'ket_thuc'; can_xac_nhan?: boolean }) | null;
};

/** Phần của AppState mà phản hồi của Pal được phép đổi. */
export type ReplyTarget = PalState & {
  changed: Partial<Record<Day, number[]>>;
  removed: Partial<Record<Day, number>>;
  actNew: string[];
  actDirty: boolean;
};

export type ApplyResult = { text: string; warn: string; tools: number };

const sig = (b: Block) => JSON.stringify([b.bat_dau, b.ket_thuc, b.khoi, b.viec || [], b.xac_nhan || '', b.trang_thai || '', b.ghi_chu || '', b.tai || '']);

export function normBlocks(arr: Partial<Block>[] | undefined): Block[] {
  return (arr || [])
    .map((b) => ({
      bat_dau: String(b.bat_dau || ''),
      ket_thuc: String(b.ket_thuc || b.bat_dau || ''),
      khoi: String(b.khoi || ''),
      viec: Array.isArray(b.viec) ? b.viec.map(String) : [],
      xac_nhan: b.xac_nhan ? String(b.xac_nhan) : '',
      trang_thai: (b.trang_thai === 'huy' ? 'huy' : 'binh_thuong') as Block['trang_thai'],
      ghi_chu: b.ghi_chu ? String(b.ghi_chu) : '',
      tai: (['cao', 'vua', 'thap', 'phuc_hoi'].includes(b.tai as string) ? b.tai : '') as Block['tai'],
      ...(b.nhom ? { nhom: b.nhom } : {}),
      ...(b.man_hinh ? { man_hinh: true } : {}),
    }))
    .sort((a, b) => a.bat_dau.localeCompare(b.bat_dau));
}

export function snapshotPlan(s: PalState) {
  return JSON.parse(JSON.stringify({ ngay: s.plan.ngay, tong_quan: s.plan.tong_quan }));
}

export function applyPeriod(s: PalState, g: NonNullable<PalReply['giai_doan']>, today = todayStr()) {
  const G = s.plan.giai_doan;
  const act = g.hanh_dong;
  const clean = {
    ten: String(g.ten || 'Giai đoạn tạm thời'),
    ly_do: String(g.ly_do || ''),
    nguon: String(g.nguon || 'bo_me'),
    tu_ngay: String(g.tu_ngay || today).slice(0, 10),
    den_ngay: String(g.den_ngay || '').slice(0, 10),
    quy_tac_tam: (Array.isArray(g.quy_tac_tam) ? g.quy_tac_tam : []).map(String),
    noi_long: (Array.isArray(g.noi_long) ? g.noi_long : []).map(String).filter((k) => ['tong_gio_hoc', 'truoc_gio_hoc', 'van_dong', 'man_hinh', 'an_uong'].includes(k)),
  };
  if (act === 'tao') {
    const pendingConfirm = !!g.can_xac_nhan || clean.nguon === 'con_de_xuat';
    s.plan.giai_doan = { ...clean, trang_thai: pendingConfirm ? 'cho_xac_nhan' : 'dang_ap_dung', lich_goc: pendingConfirm ? null : snapshotPlan(s) };
  } else if (act === 'xac_nhan' && G) {
    Object.assign(G, clean.quy_tac_tam.length ? clean : {}, { trang_thai: 'dang_ap_dung' });
    if (!G.lich_goc) G.lich_goc = snapshotPlan(s);
  } else if (act === 'sua' && G) {
    (Object.keys(clean) as (keyof typeof clean)[]).forEach((k) => {
      const v = clean[k];
      if ((Array.isArray(v) && v.length) || (!Array.isArray(v) && v && (g as Record<string, unknown>)[k] !== undefined)) (G as Record<string, unknown>)[k] = v;
    });
  } else if (act === 'ket_thuc' && G) {
    G.trang_thai = 'het_han';
  }
}

export function applyActs(s: ReplyTarget, list: NonNullable<PalReply['hoat_dong']>, idSeed = Date.now()): number {
  let n = 0;
  list.forEach((a, i) => {
    if (!a || typeof a !== 'object') return;
    const find = () => s.activities.findIndex((x) => x.id === a.id || (!a.id && a.ten && x.ten.toLowerCase() === String(a.ten).toLowerCase()));
    if (a.hanh_dong === 'xoa') {
      const k = find();
      if (k >= 0) { s.activities.splice(k, 1); n++; }
      return;
    }
    if (a.hanh_dong === 'sua') {
      const k = find();
      if (k >= 0) { s.activities[k] = cleanAct(a, s.activities[k]); s.actNew.push(s.activities[k].id); n++; return; }
    }
    const o = cleanAct(a);
    o.id = 'a' + idSeed.toString(36) + i;
    o.nguon = 'pal';
    s.activities.push(o);
    s.actNew.push(o.id);
    n++;
  });
  return n;
}

function applyDay(s: ReplyTarget, d: Day, scope: string, reason: string, khoi: Partial<Block>[]): string {
  const nb = normBlocks(khoi);
  const before = (s.plan.ngoai_le[d] ? s.plan.ngoai_le[d]!.khoi : s.plan.ngay[d]) || [];
  if (scope === 'chi_tuan_nay') s.plan.ngoai_le[d] = { khoi: nb, ly_do: reason || '' };
  else { s.plan.ngay[d] = nb; delete s.plan.ngoai_le[d]; }
  const changedIdx: number[] = [];
  let removed = 0;
  if (before.length) {
    const oldSigs = new Set(before.map(sig));
    const newSigs = new Set(nb.map(sig));
    nb.forEach((b, i) => { if (!oldSigs.has(sig(b))) changedIdx.push(i); });
    removed = Math.max(0, before.filter((b) => !newSigs.has(sig(b))).length - changedIdx.length);
  }
  s.changed[d] = changedIdx;
  if (removed) s.removed[d] = removed;
  else delete s.removed[d];
  return 'Đã lưu ' + DAY_NAME[d] + ': ' + nb.length + ' khối, ' + changedIdx.length + ' khối thay đổi' + (removed ? ', bỏ ' + removed + ' khối' : '') + '.';
}

/** Tách mục có nhiều ngày ("ngay": ["T2","T3"]) thành từng ngày, mỗi ngày một bản sao khối. */
export function expandDays(list: PalReply['ngay']): { ngay: string; pham_vi?: string; ly_do?: string; khoi?: Partial<Block>[] }[] {
  const out: { ngay: string; pham_vi?: string; ly_do?: string; khoi?: Partial<Block>[] }[] = [];
  for (const e of Array.isArray(list) ? list : []) {
    if (!e || typeof e !== 'object') continue;
    const names = Array.isArray(e.ngay) ? e.ngay : [e.ngay];
    for (const n of names) out.push({ ...e, ngay: String(n), khoi: Array.isArray(e.khoi) ? JSON.parse(JSON.stringify(e.khoi)) : e.khoi });
  }
  return out;
}

/** Áp phản hồi của Pal. Gọi một lần cho mỗi lượt trả lời. */
export function applyReply(s: ReplyTarget, r: PalReply, today = todayStr(), idSeed = Date.now()): ApplyResult {
  s.changed = {};
  s.removed = {};
  s.actNew = [];
  let tools = 0;
  if (r.ho_so && typeof r.ho_so === 'object' && Object.keys(r.ho_so).length) { tools++; s.profile = { ...s.profile, ...r.ho_so }; }
  if (r.giai_doan && typeof r.giai_doan === 'object') { tools++; applyPeriod(s, r.giai_doan, today); }
  if (Array.isArray(r.hoat_dong) && r.hoat_dong.length) tools += applyActs(s, r.hoat_dong, idSeed);
  if (r.tong_quan && typeof r.tong_quan === 'object') {
    tools++;
    s.plan.tong_quan = { muc_tieu: r.tong_quan.muc_tieu || [], nguyen_tac: r.tong_quan.nguyen_tac || [], gio_ngu: r.tong_quan.gio_ngu || '', ghi_chu: r.tong_quan.ghi_chu || '' };
  }
  const waiting = s.plan.giai_doan?.trang_thai === 'cho_xac_nhan' && r.giai_doan?.hanh_dong === 'tao';
  const days = !waiting ? expandDays(r.ngay) : [];
  const touched: Day[] = [];
  for (const d of days) {
    if (d && (DAYS as readonly string[]).includes(d.ngay)) {
      tools++;
      applyDay(s, d.ngay as Day, d.pham_vi === 'chi_tuan_nay' ? 'chi_tuan_nay' : 'mau_tuan', d.ly_do || '', Array.isArray(d.khoi) ? d.khoi : []);
      touched.push(d.ngay as Day);
    }
  }
  for (const d of Array.isArray(r.xoa_ngoai_le) ? r.xoa_ngoai_le : []) {
    if ((DAYS as readonly string[]).includes(d)) { tools++; delete s.plan.ngoai_le[d as Day]; s.changed[d as Day] = []; }
  }
  if (days.length) s.actDirty = false;

  // cảnh báo: của Pal cộng của app cho các ngày vừa đổi
  const appW: string[] = [];
  touched.forEach((d) =>
    checkDayK(s, d).filter((x) => ['ngu', 'phuc_hoi', 'cao_lien', 'an_xa'].includes(x.k)).forEach((x) => appW.push(DAY_NAME[d] + ': ' + x.t)),
  );
  const palW = (Array.isArray(r.canh_bao) ? r.canh_bao : []).map(String).filter((x) => x.trim());
  const warn = palW.concat(appW.filter((x) => !palW.some((p) => p.includes(x.slice(0, 20))))).slice(0, 5).join('\n');
  const text = String(r.tra_loi || '').trim() || (days.length ? 'Mình đã cập nhật lịch, bạn mở tab Lịch tuần để xem nhé.' : 'Mình đã ghi nhận.');
  return { text, warn, tools };
}
