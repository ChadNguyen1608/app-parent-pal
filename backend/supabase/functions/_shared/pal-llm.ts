// Gọi Claude API (Messages) bằng fetch. Khóa ở Deno.env ANTHROPIC_API_KEY (secret Supabase), không bao giờ nằm trong repo.
// `fetchImpl` được tiêm vào để test không cần mạng. Lỗi trả ApiError chung, không lộ chi tiết phía nhà cung cấp.
import { ApiError } from './api.ts';

export const DEFAULT_PAL_MODEL = 'claude-sonnet-5-5';
export const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export interface LlmMessage { role: 'user' | 'assistant'; content: string }
export interface LlmResult { text: string; input_tokens: number; output_tokens: number; model: string }

export function buildRequest(model: string, system: string, messages: LlmMessage[], maxTokens: number) {
  return { model, max_tokens: maxTokens, system, messages };
}

export async function callClaude(fetchImpl: typeof fetch, apiKey: string, model: string, system: string, messages: LlmMessage[], maxTokens: number): Promise<LlmResult> {
  let res: Response;
  try {
    res = await fetchImpl(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(buildRequest(model, system, messages, maxTokens)),
      signal: AbortSignal.timeout(40_000),
    });
  } catch {
    throw new ApiError('INTERNAL', 'PAL-UPSTREAM', 'Pal chưa trả lời được, thử lại sau nhé.');
  }
  if (res.status === 429 || res.status === 529 || res.status === 503) throw new ApiError('RATE_LIMITED', 'PAL-UPSTREAM', 'Pal đang bận, thử lại sau ít phút.');
  if (!res.ok) throw new ApiError('INTERNAL', 'PAL-UPSTREAM', 'Pal chưa trả lời được, thử lại sau nhé.');   // không lặp thân lỗi
  let j: any;
  try { j = await res.json(); } catch { throw new ApiError('INTERNAL', 'PAL-UPSTREAM', 'Pal chưa trả lời được, thử lại sau nhé.'); }
  const text = Array.isArray(j?.content) ? j.content.filter((b: any) => b?.type === 'text' && typeof b.text === 'string').map((b: any) => b.text).join('').trim() : '';
  const i = j?.usage?.input_tokens, o = j?.usage?.output_tokens;
  if (!text || !Number.isInteger(i) || !Number.isInteger(o)) throw new ApiError('INTERNAL', 'PAL-UPSTREAM', 'Pal chưa trả lời được, thử lại sau nhé.');
  return { text, input_tokens: i, output_tokens: o, model: typeof j.model === 'string' && j.model ? j.model.slice(0, 80) : model };
}
