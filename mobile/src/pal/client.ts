// Cách app hỏi Pal. Ba cách trả lời cùng một giao diện:
//  - mock:   câu trả lời viết sẵn, để test tính năng không cần mạng, không tốn chi phí
//  - bridge: máy dev chạy scripts/pal-bridge.mjs, gọi Claude Code (claude -p) bằng gói của người dev. Chỉ để dev thử.
//  - cloud:  pal-chat, Edge Function của Supabase: giữ khóa Claude và luật, đăng nhập ẩn danh, giới hạn lượt. Không cần USB.
import type { AppState } from './appstate.ts';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompt.ts';
import { mockReply } from './mock.ts';
import { clearSession, getAccessToken, PAL_CHAT_URL, SUPABASE_PUBLISHABLE_KEY } from './cloud.ts';
import { PalError } from './palerror.ts';
import type { PalReply } from './reply.ts';

export type PalMode = AppState['palMode'];

/** Địa chỉ máy dev nhìn từ emulator Android. Máy thật dùng EXPO_PUBLIC_PAL_BRIDGE_URL (địa chỉ LAN). */
export const BRIDGE_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_PAL_BRIDGE_URL) || 'http://10.0.2.2:8787/pal';

/** Quá thời gian này thì báo lỗi thay vì quay mãi. */
export const PAL_TIMEOUT_MS = 120000;

export { PalError };

/** Lấy đối tượng JSON từ văn bản của mô hình (chịu được code fence và chữ thừa quanh JSON). */
export function parseReply(text: string): PalReply {
  const t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a < 0 || b <= a) throw new PalError('invalid_json', 'Pal không trả về đúng định dạng');
  try {
    const r = JSON.parse(t.slice(a, b + 1));
    if (!r || typeof r !== 'object' || Array.isArray(r)) throw new Error('không phải đối tượng');
    return r as PalReply;
  } catch (e) {
    throw new PalError('invalid_json', 'JSON hỏng: ' + (e instanceof Error ? e.message : String(e)));
  }
}

/** Hỏi Pal một lượt. `state.messages` đã có tin nhắn mới nhất của phụ huynh ở cuối. */
export async function askPal(state: AppState, now = new Date()): Promise<PalReply> {
  if (state.palMode === 'mock') {
    const last = [...state.messages].reverse().find((m) => m.role === 'user');
    return mockReply(last?.content ?? '', state);
  }
  if (state.palMode === 'cloud') return parseReply(await askCloud(buildUserPrompt(state, now)));
  let res: Response;
  try {
    res = await fetch(BRIDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // system (luật cố định) tách riêng để cầu nối dùng bộ nhớ đệm của API; prompt là phần đổi mỗi lượt
      body: JSON.stringify({ system: SYSTEM_PROMPT, prompt: buildUserPrompt(state, now) }),
      // Không đợi mãi nếu cáp USB đứt hoặc cầu nối treo; Pal thật qua API thường xong trong dưới 30 giây.
      signal: AbortSignal.timeout(PAL_TIMEOUT_MS),
    });
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError');
    throw new PalError('loi_mang', timedOut ? 'Pal không trả lời sau ' + PAL_TIMEOUT_MS / 1000 + ' giây. Kiểm tra cáp USB và cầu nối, rồi thử lại.' : 'Không nối được cầu nối Pal (' + BRIDGE_URL + '). Đã chạy scripts/pal-bridge.mjs chưa?');
  }
  const body = (await res.json().catch(() => null)) as { text?: string; error?: string } | null;
  if (!res.ok || !body || body.error) throw new PalError('bridge_loi', body?.error || 'Cầu nối lỗi HTTP ' + res.status);
  return parseReply(body.text ?? '');
}

/** Gọi pal-chat. Máy chủ tự gắn luật nên chỉ gửi phần đổi mỗi lượt. Mã hết hạn thì đăng nhập lại và thử một lần nữa. */
async function askCloud(prompt: string): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await getAccessToken(attempt > 0);
    let res: Response;
    try {
      res = await fetch(PAL_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(PAL_TIMEOUT_MS),
      });
    } catch (e) {
      const timedOut = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError');
      throw new PalError('loi_mang', timedOut ? 'Pal không trả lời sau ' + PAL_TIMEOUT_MS / 1000 + ' giây. Thử lại nhé.' : 'Không nối được máy chủ Pal. Kiểm tra mạng rồi thử lại.');
    }
    if (res.status === 401 && attempt === 0) {
      await clearSession();
      continue;
    }
    const body = (await res.json().catch(() => null)) as { text?: string; error?: string } | null;
    if (!res.ok || !body || body.error) throw new PalError('bridge_loi', body?.error || 'Máy chủ Pal lỗi HTTP ' + res.status);
    return body.text ?? '';
  }
  throw new PalError('bridge_loi', 'Đăng nhập máy chủ Pal không thành công');
}
