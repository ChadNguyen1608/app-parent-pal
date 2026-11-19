// pal-chat (D-69; PA-22; Tech Spec K1). Phụ huynh gửi một câu, Pal trả lời. Người soạn: AI, chưa kiểm chứng độc lập.
// Vào: { message, idempotency_key (uuid), conversation_id?, child_id? }.
// Ra: { conversation_id, reply, blocked, flags, remaining, state, replay? }.
// Thứ tự: kiểm khóa cấu hình -> pal_prepare (cờ, khóa, đóng băng, đồng ý lõi, hạn mức, quyền) -> LỚP AN TOÀN (trước AI; khẩn thì KHÔNG gọi AI)
//   -> hạn mức -> ẩn danh -> kiểm ngân sách token ước lượng -> gọi Claude -> đổi nhãn về tên -> kiểm đầu ra -> ghi lượt (có chữ ký, có token).
// Khóa: ANTHROPIC_API_KEY (gọi AI), PAL_RECORD_KEY (ký lượt ghi; trùng Vault `pal_record_key`), PAL_MODEL (mặc định claude-sonnet-5-5).
// Cả ba nằm ở secret của Supabase, không có trong repo. Thiếu khóa -> FEATURE_OFF, không lộ chi tiết.
import { ApiError, type Deps } from '../_shared/api.ts';
import { Anonymizer, addressTerm } from '../_shared/pal-anon.ts';
import { signPalRecord } from '../_shared/pal-core.ts';
import { DEFAULT_PAL_MODEL, buildRequest, callClaude, type LlmMessage } from '../_shared/pal-llm.ts';
import { buildSystemPrompt } from '../_shared/pal-prompt.ts';
import { DIAGNOSIS_REMINDER, checkOutput, checkSafety, type SafetyFlag } from '../_shared/pal-safety.ts';

export type PalDeps = Deps & { fetch: typeof fetch };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONFIG_OFF = () => new ApiError('FEATURE_OFF', 'PAL-CONFIG', 'Pal chưa sẵn sàng.');

/** Ước lượng số token vào: tiếng Việt khoảng 2,5 ký tự một token (đề xuất nội bộ, nghiêng về ước thừa). */
export const estimateTokens = (chars: number) => Math.ceil(chars / 2.5);

function stateError(state: string): ApiError | null {
  switch (state) {
    case 'OFF': return new ApiError('FEATURE_OFF', 'PAL-FLAG', 'Tính năng trò chuyện với Pal đang tắt.');
    case 'NO_HOUSEHOLD': return new ApiError('FORBIDDEN', 'PAL-HH', 'Bạn chưa thuộc gia đình nào.');
    case 'FROZEN': return new ApiError('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa thay đổi được.');
    case 'NO_CONSENT': return new ApiError('FORBIDDEN', 'PAL-CONSENT', 'Cần đồng ý lập lịch cho ít nhất một con trước khi trò chuyện với Pal.');
    default: return null;
  }
}
const limitError = (state: string) => new ApiError('RATE_LIMITED', `PAL-${state}`,
  state === 'QUOTA' ? 'Hôm nay đã hết lượt hỏi Pal.' : state === 'RATE' ? 'Bạn hỏi hơi nhanh, đợi một chút rồi hỏi tiếp nhé.' : 'Pal đang bận, thử lại sau.');
const lockedError = () => new ApiError('PAL_LOCKED', 'PAL_LOCKED', 'Pal đang tạm dừng.');

export async function run(body: any, deps0: Deps) {
  const deps = deps0 as PalDeps;
  // --- 1. kiểm đầu vào (hình dạng) và khóa cấu hình
  const message = typeof body.message === 'string' ? body.message.normalize('NFC').trim() : '';
  if (!message) throw new ApiError('VALIDATION', 'PAL-IN', 'Hãy nhập câu hỏi.');
  if (typeof body.idempotency_key !== 'string' || !UUID.test(body.idempotency_key)) throw new ApiError('VALIDATION', 'PAL-IN', 'Thiếu idempotency_key.');
  for (const k of ['conversation_id', 'child_id']) {
    if (body[k] !== undefined && body[k] !== null && (typeof body[k] !== 'string' || !UUID.test(body[k]))) throw new ApiError('VALIDATION', 'PAL-IN', `${k} không hợp lệ.`);
  }
  const recordKey = deps.env('PAL_RECORD_KEY');
  if (!recordKey) throw CONFIG_OFF();
  const conversationId: string | null = body.conversation_id ?? null;
  const key: string = body.idempotency_key;

  // --- 2. trạng thái từ CSDL (cờ, khóa, đồng ý lõi, quyền, hạn mức)
  const prep = await deps.db.rpc('pal_prepare', { p_conversation: conversationId, p_child: body.child_id ?? null, p_key: key });
  const state: string = prep?.state ?? 'OFF';
  const e = stateError(state);
  if (e) throw e;
  if (prep.replay) {   // gửi lặp: trả câu đã lưu, không gọi AI lần nữa
    return { conversation_id: prep.replay.conversation_id, reply: prep.replay.reply, blocked: false, flags: prep.replay.flags ?? [],
      remaining: prep.remaining, state, replay: true };
  }
  if (message.length > prep.max_question_chars) throw new ApiError('VALIDATION', 'PAL-LEN', `Câu hỏi dài quá ${prep.max_question_chars} ký tự, hãy chia nhỏ.`);

  const adults: Array<{ call_name: string; self?: boolean }> = prep.adults ?? [];
  const children: Array<{ id: string; call_name: string; age_years: number | null; grade: number | null }> = prep.children ?? [];
  const title = addressTerm(adults.find((a) => a.self)?.call_name ?? '');

  const recChild: string | null = conversationId ? (prep.conversation_child_id ?? null) : (body.child_id ?? null);
  const record = async (reply: string, flags: SafetyFlag[], counted: boolean, tin: number | null, tout: number | null, model: string | null) => {
    const fields = { conversation: conversationId, child: recChild, key, user: message, assistant: reply, flags, counted, in_tokens: tin, out_tokens: tout, model };
    return await deps.db.rpc('pal_record_turn', {
      p_conversation: conversationId, p_child: recChild, p_key: key, p_user: message, p_assistant: reply, p_flags: flags,
      p_counted: counted, p_in_tokens: tin, p_out_tokens: tout, p_model: model, p_sig: await signPalRecord(recordKey, fields),
    }).catch((err: unknown) => {
      if (err instanceof ApiError && err.code === 'FORBIDDEN' && err.rule === 'PAL_LOCKED') throw lockedError();
      throw err;
    });
  };

  // --- 3. LỚP AN TOÀN, chạy trước AI. Khẩn cấp/thuốc: không gọi AI, không tính lượt, không bị hạn mức hay khóa chặn.
  const safety = checkSafety(message, title);
  if (safety.block && safety.reply) {
    const rec = await record(safety.reply, safety.flags, false, null, null, null);
    return { conversation_id: rec.conversation_id, reply: safety.reply, blocked: true, flags: safety.flags, remaining: rec.remaining, state: rec.state };
  }

  // --- 4. hạn mức (lượt/ngày, token/ngày, ngân sách hệ thống, số câu/phút) và khóa
  if (state === 'LOCKED') throw lockedError();
  if (state !== 'OK') throw limitError(state);
  const apiKey = deps.env('ANTHROPIC_API_KEY');
  if (!apiKey) throw CONFIG_OFF();
  const model = deps.env('PAL_MODEL') || DEFAULT_PAL_MODEL;

  // --- 5. ẩn danh trước khi gửi ra ngoài
  const anon = new Anonymizer({ children, adults });
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = Array.isArray(prep.history) ? prep.history : [];
  const convChild: string | null = recChild;
  const focus = convChild ? children.findIndex((c) => c.id === convChild) : -1;
  const system = buildSystemPrompt({
    title, firstTurn: history.length === 0, flags: safety.flags, focus: focus >= 0 ? focus : null,
    children: children.map((c, i) => ({ label: `[con ${i + 1}]`, age_years: c.age_years, grade: c.grade })),
  });
  const msgs: LlmMessage[] = history.map((m) => ({ role: m.role, content: anon.anonymize(m.content) }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();   // API cần bắt đầu bằng lượt của người dùng
  msgs.push({ role: 'user', content: anon.anonymize(message) });

  const maxOut: number = prep.max_output_tokens;
  const req = buildRequest(model, system, msgs, maxOut);
  const leaked = anon.leaks(JSON.stringify(req));
  if (leaked.length) throw new ApiError('INTERNAL', 'PAL-ANON', 'Có lỗi phía máy chủ.');   // thất bại an toàn: không gửi

  // --- 6. kiểm ngân sách token bằng ước lượng TRƯỚC khi gọi
  const est = estimateTokens(system.length + msgs.reduce((n, m) => n + m.content.length, 0)) + maxOut;
  if (prep.tokens_today + est > prep.tokens_cap) throw limitError('TOKENS');
  if (prep.system_tokens_today + est > prep.system_budget) throw limitError('BUSY');

  // --- 7. gọi AI, đổi nhãn về tên, kiểm đầu ra
  const out = await callClaude(deps.fetch, apiKey, model, system, msgs, maxOut);
  let reply = anon.restore(out.text);
  const flags = new Set<SafetyFlag>(safety.flags);
  const chk = checkOutput(reply, title);
  if (!chk.ok) { reply = chk.reply; chk.flags.forEach((f) => flags.add(f)); }
  if (safety.flags.includes('MEDICAL_DIAGNOSIS')) reply = `${DIAGNOSIS_REMINDER}\n\n${reply}`;

  // --- 8. ghi lượt (chữ ký + token) rồi trả về
  const rec = await record(reply, [...flags], true, out.input_tokens, out.output_tokens, out.model);
  return { conversation_id: rec.conversation_id, reply, blocked: false, flags: [...flags], remaining: rec.remaining, state: rec.state };
}
