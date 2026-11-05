// Pal thật qua máy chủ (Edge Function pal-chat của Supabase): không cần cầu nối trên máy tính, không cần USB.
// Khóa Claude nằm ở máy chủ. App chỉ giữ địa chỉ dự án và khóa công khai (publishable), cả hai được phép công khai;
// quyền truy cập do đăng nhập ẩn danh và giới hạn lượt của máy chủ quyết định.
import { PalError } from './palerror.ts';

export const SUPABASE_URL = 'https://bwjbwlksvjzwvmumsehd.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_gnmgdUp_dfYFEegHCmmi2w_HTPd6num';
export const PAL_CHAT_URL = SUPABASE_URL + '/functions/v1/pal-chat';

type Session = { access_token: string; refresh_token: string; expires_at: number };

// expo-sqlite chỉ nạp khi cần để các bài test chạy bằng Node thuần vẫn import được file này.
async function db() {
  const SQLite = await import('expo-sqlite');
  const d = SQLite.openDatabaseSync('lab.db');
  d.execSync('CREATE TABLE IF NOT EXISTS app_state (k TEXT PRIMARY KEY, v TEXT NOT NULL)');
  return d;
}

async function loadSession(): Promise<Session | null> {
  try {
    const row = (await db()).getFirstSync<{ v: string }>("SELECT v FROM app_state WHERE k = 'sb_session'");
    return row ? (JSON.parse(row.v) as Session) : null;
  } catch {
    return null;
  }
}

async function saveSession(s: Session | null) {
  const d = await db();
  if (s) d.runSync("INSERT OR REPLACE INTO app_state (k, v) VALUES ('sb_session', ?)", JSON.stringify(s));
  else d.runSync("DELETE FROM app_state WHERE k = 'sb_session'");
}

async function authCall(path: string, body: object): Promise<Session> {
  let res: Response;
  try {
    res = await fetch(SUPABASE_URL + path, {
      method: 'POST',
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new PalError('loi_mang', 'Không nối được máy chủ Pal. Kiểm tra mạng rồi thử lại.');
  }
  const j = (await res.json().catch(() => null)) as (Session & { error_code?: string; msg?: string }) | null;
  if (!res.ok || !j?.access_token) {
    if (j?.error_code === 'anonymous_provider_disabled') throw new PalError('bridge_loi', 'Máy chủ chưa bật đăng nhập ẩn danh (Supabase, Authentication, Sign In / Providers).');
    throw new PalError('bridge_loi', 'Đăng nhập máy chủ lỗi: ' + (j?.msg ?? 'HTTP ' + res.status));
  }
  return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at };
}

/** Mã truy cập còn hạn: dùng lại phiên đã lưu, làm mới nếu sắp hết hạn, chưa có thì tạo tài khoản ẩn danh. */
export async function getAccessToken(forceNew = false): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const cur = forceNew ? null : await loadSession();
  if (cur && cur.expires_at - 60 > now) return cur.access_token;
  let next: Session;
  try {
    next = cur ? await authCall('/auth/v1/token?grant_type=refresh_token', { refresh_token: cur.refresh_token }) : await authCall('/auth/v1/signup', {});
  } catch (e) {
    if (!cur) throw e;
    next = await authCall('/auth/v1/signup', {}); // phiên cũ hỏng: tạo lại
  }
  await saveSession(next);
  return next.access_token;
}

export async function clearSession() {
  await saveSession(null);
}
