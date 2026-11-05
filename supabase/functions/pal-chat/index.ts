// Edge Function pal-chat: app gửi {prompt} (trạng thái + hội thoại), hàm tự gắn luật, gọi Claude, trả {text}.
// Luật, model, giới hạn token đều do máy chủ quyết định; app không đổi được. Khóa Claude chỉ nằm trong secret
// ANTHROPIC_API_KEY (đặt ở bảng điều khiển Supabase), không bao giờ nằm trong app.
// Luật của Pal nằm trong repo (rules.txt, công khai, không phải bí mật). Hàm tải đúng bản của một commit rồi
// kiểm sha256; sai hash thì từ chối chạy. Đổi luật: chạy scripts/gen-function-rules.mjs, commit, push,
// rồi sửa hai hằng số dưới đây và triển khai lại hàm.
const RULES_URL =
  'https://raw.githubusercontent.com/ChadNguyen1608/app-parent-pal/b235d540433984eb507f0daf5faf18fe85f77e09/supabase/functions/pal-chat/rules.txt';
const RULES_SHA256 = 'ac55ff1ced2eea4da8c855d88d565dea43052997a918e258afe0470d5e758fdb';

const MODEL = 'claude-haiku-5-5';
const MAX_TOKENS = 8000;
const MAX_PROMPT_CHARS = 80_000;
const USER_DAILY_LIMIT = Number(Deno.env.get('PAL_USER_DAILY_LIMIT') ?? '150');
const GLOBAL_DAILY_LIMIT = Number(Deno.env.get('PAL_GLOBAL_DAILY_LIMIT') ?? '3000');
const GLOBAL_ID = '00000000-0000-0000-0000-000000000000';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CLAUDE_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/** Mã người dùng trong JWT (cổng Supabase đã kiểm chữ ký). Khóa anon công khai không có sub nên bị loại. */
function userOf(req: Request): string | null {
  try {
    const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return p.role === 'authenticated' && typeof p.sub === 'string' ? p.sub : null;
  } catch {
    return null;
  }
}

async function hit(user: string, limit: number): Promise<boolean> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pal_hit`, {
    method: 'POST',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_user: user, p_limit: limit }),
  });
  if (!r.ok) throw new Error('đếm lượt lỗi ' + r.status);
  return (await r.json()) === true;
}

async function sha(s: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

let rulesCache: string | null = null;
/** Tải luật một lần cho mỗi lần khởi động hàm; trả null nếu tải lỗi hoặc sai hash. */
async function loadRules(): Promise<string | null> {
  if (rulesCache) return rulesCache;
  try {
    const r = await fetch(RULES_URL);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const text = await r.text();
    if ((await sha(text)) !== RULES_SHA256) throw new Error('sai sha256');
    rulesCache = text;
    return text;
  } catch (e) {
    console.error('không tải được luật', e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  // Kiểm tra nhanh: bản luật đang chạy và đã có khóa Claude chưa. Không lộ nội dung nào.
  if (req.method === 'GET') return json({ ok: true, model: MODEL, rules_ok: (await loadRules()) !== null, has_key: CLAUDE_KEY !== '' });
  if (req.method !== 'POST') return json({ error: 'Sai phương thức' }, 405);

  const user = userOf(req);
  if (!user) return json({ error: 'Cần đăng nhập' }, 401);
  if (!CLAUDE_KEY) return json({ error: 'Máy chủ chưa có khóa Claude' }, 503);
  const rules = await loadRules();
  if (!rules) return json({ error: 'Máy chủ chưa sẵn sàng' }, 503);

  let prompt: unknown;
  try {
    ({ prompt } = await req.json());
  } catch {
    return json({ error: 'Dữ liệu gửi lên không đúng' }, 400);
  }
  if (typeof prompt !== 'string' || prompt.length < 1 || prompt.length > MAX_PROMPT_CHARS) return json({ error: 'Dữ liệu gửi lên không đúng' }, 400);

  try {
    if (!(await hit(GLOBAL_ID, GLOBAL_DAILY_LIMIT))) return json({ error: 'Pal đang quá tải hôm nay, thử lại ngày mai' }, 429);
    if (!(await hit(user, USER_DAILY_LIMIT))) return json({ error: 'Hôm nay bạn đã dùng hết số lượt Pal' }, 429);
  } catch (e) {
    console.error(e);
    return json({ error: 'Máy chủ lỗi' }, 500);
  }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: 'low' },
      thinking: { type: 'disabled' },
      system: [{ type: 'text', text: rules, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(120_000),
  }).catch((e) => {
    console.error('gọi Claude lỗi', e);
    return null;
  });
  const j = r ? await r.json().catch(() => null) : null;
  if (!r || !r.ok || !j) {
    console.error('Claude trả lỗi', r?.status, j?.error?.message);
    return json({ error: 'Pal không trả lời được, thử lại sau' }, 502);
  }
  const u = j.usage ?? {};
  console.log(`token vào ${u.input_tokens} ghi cache ${u.cache_creation_input_tokens} đọc cache ${u.cache_read_input_tokens} ra ${u.output_tokens} dừng ${j.stop_reason}`);
  const text = (j.content ?? []).filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('');
  return json({ text });
});
