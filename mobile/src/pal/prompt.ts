// Ghép prompt cho Pal (chuyển từ stateForPrompt, historyText, send() trong prototype/index.html).
// Văn bản quy tắc nằm ở prompt.generated.ts (tạo từ prototype bằng scripts/gen-prompt.mjs).
// Ở phương án B, phần ghép này chuyển hẳn lên máy chủ (Edge Function pal-chat).
import { allWarnings, fixedDay, getBudget, rangeOf, restRange, SOFT, type ColKey } from './balance.ts';
import type { AppState } from './appstate.ts';
import { ACT_RULES, LIFE_RULES, OUTPUT_FORMAT, RULES } from './prompt.generated.ts';
import { DAYS, DAY_NAME } from './types.ts';
import { todayStr } from './time.ts';
import { dateAdd, WX } from './today.ts';

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
    lich_mau: s.plan.ngay,
    ngoai_le_tuan_nay: s.plan.ngoai_le,
    giai_doan: G,
    hoat_dong: s.activities,
    hoat_dong_doi_chua_xep: !!s.actDirty,
    thoi_tiet_bao: wxForPrompt(s, today),
    con_bao_doi: hungerForPrompt(s, now),
    canh_bao_app_dang_thay: allWarnings(s),
  });
}

export const historyText = (s: AppState) =>
  s.messages.slice(-14).map((m) => (m.role === 'user' ? 'Phụ huynh: ' : 'Pal: ') + m.content).join('\n');

/** Prompt đầy đủ cho một lượt trả lời. */
export function buildPrompt(s: AppState, now = new Date()): string {
  return (
    RULES + '\n' + ACT_RULES + '\n' + LIFE_RULES + '\n' + OUTPUT_FORMAT +
    '\n\nTRẠNG THÁI HIỆN TẠI (JSON): ' + stateForPrompt(s, now) +
    '\n\nHỘI THOẠI GẦN ĐÂY:\n' + historyText(s) +
    '\n\nHãy trả lời tin nhắn cuối cùng của phụ huynh, CHỈ bằng một đối tượng JSON đúng định dạng trên.'
  );
}
