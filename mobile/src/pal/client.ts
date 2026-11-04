// Cách app hỏi Pal. Ba cách trả lời cùng một giao diện:
//  - mock:   câu trả lời viết sẵn, để test tính năng không cần mạng, không tốn chi phí
//  - bridge: máy dev chạy scripts/pal-bridge.mjs, gọi Claude Code (claude -p) bằng gói của người dev. Chỉ để dev thử.
//  - (bước sau) pal-chat: Edge Function của Supabase, có ẩn danh, giới hạn lượt, lớp an toàn
import type { AppState } from './appstate.ts';
import { buildPrompt } from './prompt.ts';
import { mockReply } from './mock.ts';
import type { PalReply } from './reply.ts';

export type PalMode = AppState['palMode'];

/** Địa chỉ máy dev nhìn từ emulator Android. Máy thật dùng EXPO_PUBLIC_PAL_BRIDGE_URL (địa chỉ LAN). */
export const BRIDGE_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_PAL_BRIDGE_URL) || 'http://10.0.2.2:8787/pal';

export class PalError extends Error {
  code: 'loi_mang' | 'invalid_json' | 'bridge_loi';
  constructor(code: 'loi_mang' | 'invalid_json' | 'bridge_loi', message: string) {
    super(message);
    this.code = code;
  }
}

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
  let res: Response;
  try {
    res = await fetch(BRIDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: buildPrompt(state, now) }),
    });
  } catch (e) {
    throw new PalError('loi_mang', 'Không nối được cầu nối Pal (' + BRIDGE_URL + '). Đã chạy scripts/pal-bridge.mjs chưa?');
  }
  const body = (await res.json().catch(() => null)) as { text?: string; error?: string } | null;
  if (!res.ok || !body || body.error) throw new PalError('bridge_loi', body?.error || 'Cầu nối lỗi HTTP ' + res.status);
  return parseReply(body.text ?? '');
}
