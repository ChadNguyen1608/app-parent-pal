// Ánh xạ lỗi PostgREST / Supabase Auth / mạng sang thông báo tiếng Việt.
// Hợp đồng lỗi của backend (backend/supabase/README.md): message = mã (FORBIDDEN, FROZEN, VALIDATION,
// NOT_FOUND, UNAUTHENTICATED, ...), hint = lời tiếng Việt, detail = quy tắc.

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'FROZEN'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'FEATURE_OFF'
  | 'CONFLICT_REV'
  | 'LOCKED'
  | 'OTP_INVALID'
  | 'RATE_LIMIT'
  | 'EMAIL_INVALID'
  | 'AUTH_DISABLED'
  | 'NETWORK'
  | 'UNKNOWN';

/** Ngữ cảnh làm thông báo chung hơn, để không lộ thông tin (AC-FAM-11). */
export type ErrorContext = 'pair' | 'pin';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly rule: string | null;
  /** Lời tiếng Việt hiển thị cho người dùng. */
  readonly userMessage: string;
  constructor(code: ApiErrorCode, userMessage: string, rule: string | null = null) {
    super(`${code}: ${userMessage}`);
    this.name = 'ApiError';
    this.code = code;
    this.rule = rule;
    this.userMessage = userMessage;
  }
}

export const FALLBACK_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHENTICATED: 'Bạn cần đăng nhập lại.',
  FORBIDDEN: 'Bạn chưa có quyền làm việc này.',
  FROZEN: 'Gia đình đang tạm dừng app, chưa làm được việc này.',
  VALIDATION: 'Thông tin chưa hợp lệ. Bạn kiểm tra lại giúp mình nhé.',
  NOT_FOUND: 'Không tìm thấy thông tin này.',
  FEATURE_OFF: 'Tính năng này chưa mở.',
  CONFLICT_REV: 'Dữ liệu vừa có thay đổi. Bạn thử lại nhé.',
  LOCKED: 'Dữ liệu đang bị khóa. Bạn thử lại sau nhé.',
  OTP_INVALID: 'Mã không đúng hoặc đã hết hạn. Bạn kiểm tra lại hoặc xin mã mới.',
  RATE_LIMIT: 'Bạn thử quá nhanh. Chờ một chút rồi thử lại nhé.',
  EMAIL_INVALID: 'Email này chưa đúng. Bạn kiểm tra lại giúp mình nhé.',
  AUTH_DISABLED: 'Cách đăng nhập này chưa được bật. Báo người phụ trách app giúp mình nhé.',
  NETWORK: 'Chưa kết nối được mạng. Bạn kiểm tra mạng rồi thử lại.',
  UNKNOWN: 'Có lỗi xảy ra. Bạn thử lại sau nhé.',
};

const PAIR_GENERIC = 'Mã không đúng hoặc đã hết hạn.';
const PIN_WRONG = 'PIN chưa đúng. Bạn thử lại nhé.';

const SERVER_CODES: ReadonlySet<string> = new Set([
  'UNAUTHENTICATED', 'FORBIDDEN', 'FROZEN', 'VALIDATION', 'NOT_FOUND', 'FEATURE_OFF', 'CONFLICT_REV', 'LOCKED',
]);

const AUTH_CODES: Record<string, ApiErrorCode> = {
  otp_expired: 'OTP_INVALID',
  otp_disabled: 'AUTH_DISABLED',
  anonymous_provider_disabled: 'AUTH_DISABLED',
  signup_disabled: 'AUTH_DISABLED',
  email_provider_disabled: 'AUTH_DISABLED',
  over_email_send_rate_limit: 'RATE_LIMIT',
  over_request_rate_limit: 'RATE_LIMIT',
  email_address_invalid: 'EMAIL_INVALID',
  validation_failed: 'EMAIL_INVALID',
  session_expired: 'UNAUTHENTICATED',
  session_not_found: 'UNAUTHENTICATED',
  refresh_token_not_found: 'UNAUTHENTICATED',
  bad_jwt: 'UNAUTHENTICATED',
};

type Loose = { message?: unknown; hint?: unknown; details?: unknown; detail?: unknown; code?: unknown; name?: unknown; status?: unknown };

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
}

/** Hint của backend có chữ Việt có dấu thì dùng; hint rỗng hoặc tiếng Anh thì dùng câu dự phòng. */
const VIET_DIACRITIC = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function toApiError(err: unknown, ctx?: ErrorContext): ApiError {
  if (err instanceof ApiError) return err;
  const e: Loose = typeof err === 'object' && err !== null ? (err as Loose) : {};
  const message = str(e.message) ?? (typeof err === 'string' ? err : null);
  const name = str(e.name);
  const authCode = str(e.code);
  const rule = str(e.details) ?? str(e.detail);

  // Lỗi do backend (app.fail): message là mã.
  if (message && SERVER_CODES.has(message)) {
    const code = message as ApiErrorCode;
    if (ctx === 'pair' && (code === 'NOT_FOUND' || code === 'VALIDATION')) return new ApiError(code, PAIR_GENERIC, rule);
    if (ctx === 'pin' && code === 'FORBIDDEN') return new ApiError(code, PIN_WRONG, rule);
    const hint = str(e.hint);
    return new ApiError(code, hint && VIET_DIACRITIC.test(hint) ? hint : FALLBACK_MESSAGES[code], rule);
  }

  // Thiếu quyền EXECUTE / RLS của Postgres (anon gọi hàm không cho phép).
  if (authCode === '42501') return new ApiError('FORBIDDEN', FALLBACK_MESSAGES.FORBIDDEN, rule);

  // Lỗi mạng (fetch của React Native: TypeError "Network request failed").
  if (
    name === 'AuthRetryableFetchError' ||
    (message && /network request failed|failed to fetch|network error|timed out|fetch failed/i.test(message))
  ) {
    return new ApiError('NETWORK', FALLBACK_MESSAGES.NETWORK);
  }

  // Lỗi Supabase Auth: có mã chữ thường.
  if (authCode && AUTH_CODES[authCode]) {
    const c = AUTH_CODES[authCode];
    return new ApiError(c, FALLBACK_MESSAGES[c]);
  }
  if (name === 'AuthSessionMissingError') return new ApiError('UNAUTHENTICATED', FALLBACK_MESSAGES.UNAUTHENTICATED);
  if (e.status === 401) return new ApiError('UNAUTHENTICATED', FALLBACK_MESSAGES.UNAUTHENTICATED);
  if (e.status === 429) return new ApiError('RATE_LIMIT', FALLBACK_MESSAGES.RATE_LIMIT);

  return new ApiError('UNKNOWN', FALLBACK_MESSAGES.UNKNOWN);
}

/** Dùng trong màn: lấy lời tiếng Việt từ bất kỳ lỗi nào. */
export function errorMessage(err: unknown, ctx?: ErrorContext): string {
  return toApiError(err, ctx).userMessage;
}
