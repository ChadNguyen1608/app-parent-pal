// Lõi dùng chung của pal-chat (D-69): chuỗi ký và chữ ký ghi lượt trò chuyện. Người soạn: AI, chưa kiểm chứng độc lập.
// Chuỗi được ký PHẢI trùng private.pal_record_message() trong migration 20261119200000 (vector kiểm chéo ở cả hai phía:
// backend/supabase/tests/fixtures/pal-record-vector.json).

export interface RecordFields {
  conversation: string | null; child: string | null; key: string; user: string; assistant: string;
  flags: string[]; counted: boolean; in_tokens: number | null; out_tokens: number | null; model: string | null;
}

export function palRecordMessage(f: RecordFields): string {
  return ['pal1', f.conversation ?? '-', f.child ?? '-', f.key, f.user, f.assistant, f.flags.join(','),
    f.counted ? 't' : 'f', f.in_tokens === null ? '-' : String(f.in_tokens), f.out_tokens === null ? '-' : String(f.out_tokens), f.model ?? '-'].join('\n');
}

const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

export async function palHmacHex(key: string, msg: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg)));
}

export const signPalRecord = (key: string, f: RecordFields) => palHmacHex(key, palRecordMessage(f));
