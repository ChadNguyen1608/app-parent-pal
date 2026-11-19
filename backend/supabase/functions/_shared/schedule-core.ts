// Lõi thuần của profile-save, schedule-preview, schedule-commit (không I/O, test được bằng Deno không cần CSDL).
// Người soạn: AI, chưa kiểm chứng độc lập.
import { scheduleWeek, PARAMS, validators as V } from './scheduler/src/index.ts';
import { ENGINE_VERSION } from './scheduler/version.ts';
import { ApiError } from './api.ts';

export const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
export const CARD_TYPES = ['hoc_them', 'the_thao', 'nang_khieu', 'khac'];
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const CELLS = ['hoc_nha', 'sinh_hoat', 'ngu', 'man_hinh'];
const KEEP_CELLS = ['hoc_nha', 'sinh_hoat', 'man_hinh', 'hoc_them', 'choi_nghi'];   // ô có thể "Giữ mức này" (không có ngu, D-02)

const bad = (rule: string, msg: string) => new ApiError('VALIDATION', rule, msg);
const isObj = (x: unknown): x is Record<string, any> => x !== null && typeof x === 'object' && !Array.isArray(x);
const isInt = (x: unknown, lo: number, hi: number) => Number.isInteger(x) && (x as number) >= lo && (x as number) <= hi;

// ------------------------------------------------------------------ băm và ký
export function stable(x: unknown): string {
  if (Array.isArray(x)) return '[' + x.map(stable).join(',') + ']';
  if (isObj(x)) return '{' + Object.keys(x).sort().filter((k) => x[k] !== undefined).map((k) => JSON.stringify(k) + ':' + stable(x[k])).join(',') + '}';
  return JSON.stringify(x);
}
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
export const sha256Hex = async (s: string) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
export async function hmacHex(key: string, msg: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg)));
}

export interface CommitFields {
  child_id: string; profile_id: string; expected_rev: number; idempotency_key: string; content_hash: string; input_hash: string;
  engine_version: string; params_version: string; balance_label: string; output: string; tradeoffs: string; questions: string; answers: string;
}
/** Chuỗi được ký. PHẢI trùng app.schedule_commit_message trong migration (có vector kiểm chéo ở cả hai phía). */
export function commitMessage(f: CommitFields): string {
  return ['v1', f.child_id, f.profile_id, String(f.expected_rev), f.idempotency_key, f.content_hash, f.input_hash,
    f.engine_version, f.params_version, f.balance_label, f.output, f.tradeoffs, f.questions, f.answers].join('\n');
}
export const signCommit = (key: string, f: CommitFields) => hmacHex(key, commitMessage(f));

export const paramsVersion = async () => 'p-' + (await sha256Hex(stable(PARAMS))).slice(0, 12);

// ------------------------------------------------------------------ kiểm dữ liệu vào
/** complete=false: lưu nháp (cho thiếu); complete=true: xem trước/commit (BR-001..009: đủ trường bắt buộc). */
export function validateInput(input: any, complete: boolean): void {
  if (!isObj(input)) throw bad('BR-001', 'Hồ sơ lịch phải là một object.');
  const allowed = ['school', 'commute', 'twoSessions', 'sleep', 'meals'];
  for (const k of Object.keys(input)) if (!allowed.includes(k)) throw bad('BR-001', `Trường không hỗ trợ: ${k}`);
  if (complete) for (const k of allowed) if (input[k] === undefined) throw bad('BR-001', `Thiếu ${k}.`);
  if (input.school !== undefined) {
    if (!isObj(input.school)) throw bad('BR-002', 'Thời khóa biểu phải là object theo thứ.');
    for (const d of Object.keys(input.school)) if (!(DAYS as readonly string[]).includes(d)) throw bad('BR-002', `Thứ không hợp lệ: ${d}`);
    if (complete) for (const d of DAYS) if (!(d in input.school)) throw bad('BR-002', `Thiếu thứ ${d} (null nếu không đi học).`);
    for (const [d, s] of Object.entries<any>(input.school)) {
      if (s === null) continue;
      if (!isObj(s) || !HHMM.test(s.start) || !HHMM.test(s.end) || s.end <= s.start) throw bad('BR-002', `Giờ học ${d} không hợp lệ.`);
      for (const k of ['lunch', 'pmStart', 'snack']) if (s[k] !== undefined && !HHMM.test(s[k])) throw bad('BR-002', `Giờ ${k} của ${d} không hợp lệ.`);
      if (s.snackDur !== undefined && !isInt(s.snackDur, 0, 120)) throw bad('BR-002', `snackDur của ${d} không hợp lệ.`);
    }
  }
  if (input.commute !== undefined && !isInt(input.commute, 0, 120)) throw bad('BR-003', 'Thời gian đi lại từ 0 đến 120 phút.');
  if (input.twoSessions !== undefined && typeof input.twoSessions !== 'boolean') throw bad('BR-004', 'twoSessions phải là true/false.');
  if (input.sleep !== undefined && (!isObj(input.sleep) || !HHMM.test(input.sleep.wake))) throw bad('BR-005', 'Giờ dậy không hợp lệ.');
  if (input.meals !== undefined && (!isObj(input.meals) || !HHMM.test(input.meals.dinner) || !HHMM.test(input.meals.lunch))) throw bad('BR-006', 'Giờ bữa trưa/tối không hợp lệ.');
}

export function validateBudget(b: any): void {
  if (b === null || b === undefined) return;   // null = quỹ mặc định theo lớp/tuổi
  if (!isObj(b)) throw bad('BR-007', 'Quỹ thời gian phải là object.');
  for (const c of Object.keys(b)) if (c !== 'wd' && c !== 'we') throw bad('BR-007', `Cột quỹ không hợp lệ: ${c}`);
  for (const c of ['wd', 'we']) {
    if (!isObj(b[c])) throw bad('BR-007', `Thiếu cột quỹ ${c}.`);
    for (const k of CELLS) if (!isInt(b[c][k], 0, 1440)) throw bad('BR-007', `Quỹ ${c}.${k} phải là số phút từ 0 đến 1440.`);
    for (const k of Object.keys(b[c])) if (!CELLS.includes(k)) throw bad('BR-007', `Ô quỹ không hợp lệ: ${k}`);
  }
}

export function validateKeep(k: any): void {
  if (k === null || k === undefined) return;
  if (!isObj(k)) throw bad('D6', 'keep_confirmed phải là object.');
  for (const c of Object.keys(k)) {
    if (c !== 'wd' && c !== 'we') throw bad('D6', `Cột không hợp lệ: ${c}`);
    if (!isObj(k[c])) throw bad('D6', 'keep_confirmed theo cột phải là object.');
    for (const [cell, v] of Object.entries(k[c])) {
      if (cell === 'ngu') throw bad('D-02/C1', 'Ô Ngủ không có "Giữ mức này"; lịch luôn xếp theo sàn.');
      if (!KEEP_CELLS.includes(cell) || v !== true) throw bad('D6', `Ô không hợp lệ: ${cell}`);
    }
  }
}

export function validateCards(cards: any): void {
  if (!Array.isArray(cards) || cards.length > 20) throw bad('BR-008', 'Danh sách hoạt động tối đa 20.');
  for (const c of cards) {
    if (!isObj(c)) throw bad('BR-008', 'Hoạt động phải là object.');
    if (typeof c.name !== 'string' || !c.name.trim() || c.name.length > 60) throw bad('BR-008', 'Tên hoạt động 1 đến 60 ký tự.');
    if (!CARD_TYPES.includes(c.type)) throw bad('BR-008', 'Loại hoạt động không hợp lệ.');
    if (!Array.isArray(c.days) || !c.days.length || c.days.some((d: any) => !(DAYS as readonly string[]).includes(d)) || new Set(c.days).size !== c.days.length) throw bad('BR-008', 'Thứ của hoạt động không hợp lệ.');
    if (!HHMM.test(c.start) || !HHMM.test(c.end) || c.end <= c.start) throw bad('BR-008', 'Giờ bắt đầu/kết thúc không hợp lệ (kết thúc phải sau bắt đầu).');
    for (const k of ['travel_before_min', 'travel_after_min']) if (c[k] !== undefined && !isInt(c[k], 0, 180)) throw bad('BR-008', `${k} từ 0 đến 180.`);
    // D-71 (giai đoạn test lưu toàn bộ dữ liệu): ghi chú được lưu nguyên văn, tối đa 500 ký tự; CHƯA qua bộ kiểm khẩn (BR-CON-094). Lọc trước khi phát hành.
    if (c.note !== undefined && c.note !== null && (typeof c.note !== 'string' || c.note.length > 500)) throw bad('D-71', 'Ghi chú là chữ, tối đa 500 ký tự.');
    if (c.location !== undefined || c.address !== undefined) throw bad('Q-ARC-10', 'Nấc 1 không lưu địa điểm hoạt động.');
  }
}

// ------------------------------------------------------------------ dựng đầu vào bộ xếp từ dữ liệu máy chủ
export interface ServerInputs {
  profile: { id: string; child_id: string; version: number; state: string; input: any; budget: any; keep_confirmed: any };
  child: { grade: number | null; age_years: number | null };
  cards: Array<{ id: string; name: string; type: string; days: string[]; start_time: string; end_time: string; travel_before_min: number; travel_after_min: number }>;
  content_hash: string; rev: number; lock_state: string;
}
const hhmm = (t: string) => t.slice(0, 5);

export function buildEngineProfile(s: ServerInputs): any {
  // Lớp hoặc tuổi: thiếu một thì suy từ cái kia (lớp 1 = 6 tuổi) [MĐKT]; hồ sơ con bắt buộc có ít nhất một (check_child_fields).
  const grade = s.child.grade ?? (s.child.age_years != null ? Math.min(9, Math.max(1, s.child.age_years - 5)) : null);
  const age = s.child.age_years ?? (s.child.grade != null ? s.child.grade + 5 : null);
  if (grade == null || age == null) throw bad('BR-001', 'Hồ sơ con cần lớp hoặc tuổi.');
  const i = s.profile.input;
  return {
    id: s.profile.id, grade, age, twoSessions: i.twoSessions, school: i.school, commute: i.commute,
    activities: s.cards.map((c) => ({ id: c.id, ten: c.name, loai: c.type, thu: c.days, bat_dau: hhmm(c.start_time), ket_thuc: hhmm(c.end_time), di_lai: (c.travel_before_min || 0) + (c.travel_after_min || 0) })),
    budget: s.profile.budget ?? null, sleep: i.sleep, meals: i.meals,
  };
}

export interface PreviewResult {
  plan: any; tradeoffs: any[]; questions: any[]; board: any; warnings: any[]; day_status: Record<string, string>;
  balance_label: string; label_status: string; engine_version: string; params_version: string; input_hash: string;
  blockers: Array<{ rule: string; t: string }>; red_unconfirmed: Array<{ col: string; cell: string }>;
}

/** Chạy bộ xếp trên dữ liệu máy chủ và gom mọi lý do không được commit (blockers). Không ghi gì. */
export async function runPreview(s: ServerInputs, confirmed: Array<{ col: string; cell: string }> = []): Promise<PreviewResult> {
  validateInput(s.profile.input, true); validateBudget(s.profile.budget); validateKeep(s.profile.keep_confirmed);
  const prof = buildEngineProfile(s);
  const res = scheduleWeek(prof);
  const ctx = V.makeCtx({ plan: res.plan, age: prof.age, grade: prof.grade, budget: res.budget, activities: prof.activities });
  const board = V.budgetBoard(ctx);
  const warnings: any[] = [];
  for (const d of DAYS) for (const w of V.checkDayK(ctx, d)) warnings.push({ day: d, k: w.k, t: w.t });
  const day_status = Object.fromEntries(Object.entries<any>(res.days).map(([d, x]) => [d, x.status]));

  const blockers: Array<{ rule: string; t: string }> = [];
  // Sàn cứng (C1, D-02): giờ ngủ dưới mức tối thiểu ở bất kỳ ngày nào, hoặc ô Ngủ của bảng quỹ đỏ/dưới sàn.
  for (const w of warnings) if (w.k === 'ngu') blockers.push({ rule: 'D-02/C1', t: `${w.day}: ${w.t}` });
  for (const c of ['wd', 'we']) if (board[c].ngu.color === 'do' || board[c].ngu.duoi_san) blockers.push({ rule: 'D-02/C1', t: `Quỹ ngủ cột ${c} dưới mức tối thiểu; không thể lưu.` });
  // Ngày không xếp được phương án nào đủ sàn: bố mẹ phải bỏ/dời hoạt động trước.
  for (const [d, st] of Object.entries(day_status)) if (st === 'XUNG_DOT') blockers.push({ rule: 'C/A1', t: `${d}: chưa có phương án đủ sàn, cần bỏ hoặc dời hoạt động.` });

  // Ô đỏ có "Giữ mức này": cần bố mẹ đã xác nhận (keep_confirmed đã lưu, hoặc confirmed_red gửi kèm lúc commit).
  const keep = s.profile.keep_confirmed ?? {};
  const all = [...confirmed];
  for (const c of confirmed) {
    const r = V.confirmKeep(board, c.col, c.cell);
    if (!r.ok) throw bad(r.rule, r.t);
  }
  const red_unconfirmed: Array<{ col: string; cell: string }> = [];
  for (const c of ['wd', 'we']) for (const cell of KEEP_CELLS) {
    const x = board[c][cell];
    if (x && x.color === 'do' && x.giu_muc && !(keep[c] && keep[c][cell]) && !all.some((a) => a.col === c && a.cell === cell)) red_unconfirmed.push({ col: c, cell });
  }
  for (const r of red_unconfirmed) blockers.push({ rule: 'D6/A2', t: `Ô ${r.cell} (${r.col}) đang đỏ, cần bố mẹ bấm "Giữ mức này".` });

  return {
    plan: res.plan, tradeoffs: res.tradeoffs, questions: res.questions, board, warnings, day_status,
    balance_label: 'UNKNOWN', label_status: 'chua_kiem_chung', engine_version: ENGINE_VERSION, params_version: await paramsVersion(),
    input_hash: await sha256Hex(stable(prof)), blockers, red_unconfirmed,
  };
}

export function validateAnswers(answers: any, questions: any[]): Array<{ question_key: string; answer: string }> {
  if (answers === undefined || answers === null) return [];
  if (!Array.isArray(answers) || answers.length > 20) throw bad('A2', 'answers phải là danh sách tối đa 20.');
  const valid = new Set(questions.map((q) => `${q.kind}.${q.day}`));
  return answers.map((a) => {
    if (!isObj(a) || typeof a.question_key !== 'string' || !valid.has(a.question_key) || typeof a.answer !== 'string' || !/^[a-z_]{1,30}$/.test(a.answer))
      throw bad('A2', 'Câu trả lời không khớp câu hỏi của lịch.');
    return { question_key: a.question_key, answer: a.answer };
  });
}
