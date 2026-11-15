// Phân tích URL mở app từ thư đăng nhập (magic link). Hàm thuần, test bằng node.
// Với flowType 'pkce' (đang dùng), thư mặc định của Supabase dẫn về redirect_to kèm ?code=... (đổi lấy phiên bằng
// exchangeCodeForSession). Mẫu thư tùy biến có thể dẫn kèm ?token_hash=...&type=email (đổi bằng verifyOtp).
// Link hết hạn/không hợp lệ: Supabase gắn error, error_code, error_description (ở query hoặc fragment).

export type AuthLink =
  | { kind: 'code'; code: string }
  | { kind: 'token_hash'; tokenHash: string; type: 'email' | 'magiclink' }
  | { kind: 'error'; errorCode: string | null };

/** Đường dẫn callback (sau scheme của app). */
export const AUTH_CALLBACK_PATH = 'auth-callback';

function parseParams(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of s.split('&')) {
    if (!part) continue;
    const i = part.indexOf('=');
    const k = i < 0 ? part : part.slice(0, i);
    const v = i < 0 ? '' : part.slice(i + 1);
    try {
      out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
    } catch {
      /* bỏ tham số hỏng */
    }
  }
  return out;
}

/** Trả null nếu URL không phải link đăng nhập (để bỏ qua các deep link khác). */
export function parseAuthLink(url: string | null | undefined): AuthLink | null {
  if (!url) return null;
  const hashAt = url.indexOf('#');
  const beforeHash = hashAt < 0 ? url : url.slice(0, hashAt);
  const queryAt = beforeHash.indexOf('?');
  const path = queryAt < 0 ? beforeHash : beforeHash.slice(0, queryAt);
  if (!new RegExp(`(^|/)${AUTH_CALLBACK_PATH}/?$`).test(path)) return null;
  const p = {
    ...(hashAt < 0 ? {} : parseParams(url.slice(hashAt + 1))),
    ...(queryAt < 0 ? {} : parseParams(beforeHash.slice(queryAt + 1))),
  };
  if (p.error || p.error_code || p.error_description) return { kind: 'error', errorCode: p.error_code ?? null };
  if (p.code) return { kind: 'code', code: p.code };
  if (p.token_hash && (p.type === 'email' || p.type === 'magiclink')) {
    return { kind: 'token_hash', tokenHash: p.token_hash, type: p.type };
  }
  return { kind: 'error', errorCode: null };
}
