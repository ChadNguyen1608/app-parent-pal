// Ghép prompt cho Pal (chuyển từ stateForPrompt, historyText, send() trong prototype/index.html).
// Văn bản quy tắc nằm ở prompt.generated.ts (tạo từ prototype bằng scripts/gen-prompt.mjs).
// Ở phương án B, phần ghép này chuyển hẳn lên máy chủ (Edge Function pal-chat).
import { allWarnings, fixedDay, getBudget, rangeOf, restRange, SOFT, type ColKey } from './balance.ts';
import type { AppState } from './appstate.ts';
import { ACT_RULES, LIFE_RULES, OUTPUT_FORMAT, RULES } from './prompt.generated.ts';
import { DAYS, DAY_NAME, type Block } from './types.ts';
import { todayStr } from './time.ts';
import { dateAdd, WX } from './today.ts';

/** Bỏ trường rỗng hoặc mặc định của khối khi gửi lên Pal (giảm token đầu vào; Pal hiểu thiếu = mặc định). */
export function compactBlock(b: Partial<Block>): Record<string, unknown> {
  const o: Record<string, unknown> = { bat_dau: b.bat_dau, ket_thuc: b.ket_thuc, khoi: b.khoi };
  if (b.viec && b.viec.length) o.viec = b.viec;
  if (b.xac_nhan) o.xac_nhan = b.xac_nhan;
  if (b.tai) o.tai = b.tai;
  if (b.nhom) o.nhom = b.nhom;
  if (b.man_hinh) o.man_hinh = true;
  if (b.trang_thai && b.trang_thai !== 'binh_thuong') o.trang_thai = b.trang_thai;
  if (b.ghi_chu) o.ghi_chu = b.ghi_chu;
  return o;
}

const compactPlan = (ngay: Record<string, Block[] | undefined>) =>
  Object.fromEntries(Object.entries(ngay).map(([d, bl]) => [d, (bl || []).map(compactBlock)]));

/** Định dạng trả lời dùng trong app: như prototype nhưng cho gộp ngày giống nhau và bỏ trường rỗng (đầu ra là phần tốn nhất). */
const TO_COMPACT_DAY = '"ngay": [ {"ngay":"T2",';
export const APP_OUTPUT_FORMAT = OUTPUT_FORMAT.includes(TO_COMPACT_DAY)
  ? OUTPUT_FORMAT.replace(TO_COMPACT_DAY, '"ngay": [ {"ngay":"T2" (hoặc mảng ["T2","T3","T5"] khi các ngày đó có lịch GIỐNG HỆT nhau: ghi khối một lần),') +
    ' Bỏ hẳn các trường rỗng hoặc mặc định: xac_nhan, ghi_chu, viec khi trống; the_thao, man_hinh khi false; trang_thai khi binh_thuong.'
  : OUTPUT_FORMAT;

export function budgetForPrompt(s: AppState) {
  const B = getBudget(s);
  const fx = (c: ColKey) => ({ truong: rangeOf(c, (d) => fixedDay(s, d), 'truong'), hoc_them: rangeOf(c, (d) => fixedDay(s, d), 'hoc_them') });
  return {
    don_vi: 'phút/ngày',
    xe_dich_toi_da: SOFT,
    preset: s.presetActive || '',
    ngay_di_hoc: { ...B.wd, choi_nghi_con_lai: restRange(s, 'wd'), co_dinh: fx('wd') },
    cuoi_tuan: { ...B.we, choi_nghi_con_lai: restRange(s, 'we'), co_dinh: fx('we') },
    da_xac_nhan_vung_do: Object.keys(B.ok || {}),
  };
}

const wxForPrompt = (s: AppState, today: string) => {
  const o: Record<string, string> = {};
  Object.keys(s.wx).filter((k) => k >= today).forEach((k) => { o[k] = WX[s.wx[k]] ? WX[s.wx[k]].n.replace(/^\S+ /, '') : s.wx[k]; });
  return o;
};

const hungerForPrompt = (s: AppState, now: Date) =>
  Object.keys(s.log).filter((k) => k >= dateAdd(-14, now) && (s.log[k].doi || []).length).map((k) => k + ': ' + s.log[k].doi!.join(', '));

export function stateForPrompt(s: AppState, now = new Date()): string {
  const G = s.plan.giai_doan ? { ...s.plan.giai_doan } : null;
  if (G) delete G.lich_goc;
  const today = todayStr(now);
  return JSON.stringify({
    quy_thoi_gian: budgetForPrompt(s),
    hom_nay: today + ' (' + DAY_NAME[DAYS[(now.getDay() + 6) % 7]] + ')',
    ho_so: s.profile,
    tong_quan: s.plan.tong_quan,
    lich_mau: compactPlan(s.plan.ngay),
    ngoai_le_tuan_nay: Object.fromEntries(Object.entries(s.plan.ngoai_le).map(([d, e]) => [d, { ...e, khoi: (e?.khoi || []).map(compactBlock) }])),
    giai_doan: G,
    hoat_dong: s.activities,
    hoat_dong_doi_chua_xep: !!s.actDirty,
    thoi_tiet_bao: wxForPrompt(s, today),
    con_bao_doi: hungerForPrompt(s, now),
    canh_bao_app_dang_thay: allWarnings(s),
  });
}

export const historyText = (s: AppState) =>
  s.messages.slice(-10).map((m) => (m.role === 'user' ? 'Phụ huynh: ' : 'Pal: ') + m.content).join('\n');

/** Luật bổ sung của app, đặt cuối để ưu tiên: chặn hai lỗi mô hình nhỏ hay mắc (đo thật 06/11/2026). */
export const APP_RULES = [
  'QUY TẮC TRUNG THỰC VỀ DỮ LIỆU (ưu tiên cao nhất):',
  '- CHỈ nói "mình đã lập/đã sửa lịch" hoặc mời phụ huynh mở tab Lịch tuần khi trường "ngay" của CHÍNH lượt này có dữ liệu. Nếu "ngay" là [] thì tuyệt đối không nhắc tab Lịch tuần; nói rõ chưa lập lịch và hỏi điều còn thiếu, hoặc nói sẽ lập khi phụ huynh bảo.',
  '- Lịch mẫu tuần phải đủ 7 ngày T2, T3, T4, T5, T6, T7, CN, kể cả cuối tuần.',
  '- CHỈ ghi vào "ho_so" điều phụ huynh ĐÃ NÓI trong hội thoại. Không đoán, không điền trường chưa được kể; thiếu thì bỏ trống.',
].join('\n');

/** Phần cố định giữa các lượt (luật và định dạng): đặt làm system để API lưu bộ nhớ đệm, từ lượt thứ hai chỉ tính khoảng 10% giá. */
export const SYSTEM_PROMPT = [RULES, ACT_RULES, LIFE_RULES, APP_OUTPUT_FORMAT, APP_RULES].join('\n');

/** Phần thay đổi mỗi lượt: trạng thái và hội thoại gần đây. */
export function buildUserPrompt(s: AppState, now = new Date()): string {
  return [
    'TRẠNG THÁI HIỆN TẠI (JSON): ' + stateForPrompt(s, now),
    'HỘI THOẠI GẦN ĐÂY:\n' + historyText(s),
    'Hãy trả lời tin nhắn cuối cùng của phụ huynh, CHỈ bằng một đối tượng JSON đúng định dạng trên.',
  ].join('\n\n');
}

/** Prompt đầy đủ trong một chuỗi (cho cầu nối dùng claude -p, không có system riêng). */
export function buildPrompt(s: AppState, now = new Date()): string {
  return SYSTEM_PROMPT + '\n\n' + buildUserPrompt(s, now);
}
