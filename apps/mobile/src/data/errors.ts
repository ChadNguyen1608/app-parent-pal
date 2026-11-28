// Ánh xạ lỗi PostgREST / Supabase Auth / mạng sang thông báo tiếng Việt.
// Hợp đồng lỗi của backend (backend/supabase/README.md, "Hai kiểu trả lỗi"):
//  1. Lỗi raise (app.fail): message = mã (FORBIDDEN, FROZEN, VALIDATION, NOT_FOUND, UNAUTHENTICATED, CONFLICT_REV,
//     RATE_LIMITED, FEATURE_OFF, BLOCKED_H4, PLAN_REQUIRED (402, D-68), TRIAL_USED (409, D-72), DEVICE_KEY_LIMIT (402, D-74), TERMS_REQUIRED (428, D-76), ...), hint = lời tiếng Việt, detail = quy tắc.
//  2. Thất bại cần đếm (pair_confirm mã sai, unlink_device PIN sai, pair_accept quá hạn): HTTP 200 với
//     {"ok": false, "error": {code, rule, message_vi, attempts_left?, locked_until?}}. `apiErrorFromFailure` đổi sang ApiError.

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'PLAN_REQUIRED'
  | 'DEVICE_KEY_LIMIT'
  | 'TRIAL_USED'
  | 'TERMS_REQUIRED'
  | 'FORBIDDEN'
  | 'FROZEN'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'FEATURE_OFF'
  | 'BLOCKED_H4'
  | 'CONFLICT_REV'
  | 'LOCKED'
  | 'OTP_INVALID'
  | 'RATE_LIMITED'
  | 'EMAIL_INVALID'
  | 'AUTH_DISABLED'
  | 'NETWORK'
  | 'UNKNOWN';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly rule: string | null;
  /** Lời tiếng Việt hiển thị cho người dùng. */
  readonly userMessage: string;
  /** Chỉ có khi sai PIN: số lần thử còn lại trước khi khóa (đã nằm trong userMessage). */
  readonly attemptsLeft: number | null;
  /** Chỉ có khi PIN đang khóa: thời điểm mở khóa, ISO (đã nằm trong userMessage). */
  readonly lockedUntil: string | null;
  constructor(
    code: ApiErrorCode,
    userMessage: string,
    rule: string | null = null,
    extra: { attemptsLeft?: number | null; lockedUntil?: string | null } = {},
  ) {
    super(`${code}: ${userMessage}`);
    this.name = 'ApiError';
    this.code = code;
    this.rule = rule;
    this.userMessage = userMessage;
    this.attemptsLeft = extra.attemptsLeft ?? null;
    this.lockedUntil = extra.lockedUntil ?? null;
  }
}

export const FALLBACK_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHENTICATED: 'Bạn cần đăng nhập lại.',
  PLAN_REQUIRED: 'Cần gói dùng thử hoặc Premium để làm việc này.',
  DEVICE_KEY_LIMIT: 'Gói hiện tại đã dùng hết khóa ghép máy của con. Hãy hủy liên kết một máy hoặc nâng cấp gói để ghép thêm.',
  TRIAL_USED: 'Máy này, email này hoặc gia đình này đã dùng thử rồi, nên không dùng thử lại được. Bạn có thể nâng cấp Premium.',
  TERMS_REQUIRED: 'Bạn cần đồng ý Điều khoản sử dụng trước khi tạo gia đình.',
  FORBIDDEN: 'Bạn chưa có quyền làm việc này.',
  FROZEN: 'Gia đình đang tạm dừng app, chưa làm được việc này.',
  VALIDATION: 'Thông tin chưa hợp lệ. Bạn kiểm tra lại giúp mình nhé.',
  NOT_FOUND: 'Không tìm thấy thông tin này.',
  FEATURE_OFF: 'Mục này chưa mở ở bản thử.',
  BLOCKED_H4: 'Việc này chưa mở ở bản thử, mình chưa làm được.',
  CONFLICT_REV: 'Dữ liệu vừa có thay đổi. Bạn thử lại nhé.',
  LOCKED: 'Dữ liệu đang bị khóa. Bạn thử lại sau nhé.',
  OTP_INVALID: 'Mã không đúng hoặc đã hết hạn. Bạn kiểm tra lại hoặc xin mã mới.',
  RATE_LIMITED: 'Bạn thử quá nhiều lần. Chờ một lúc rồi thử lại nhé.',
  EMAIL_INVALID: 'Email này chưa đúng. Bạn kiểm tra lại giúp mình nhé.',
  AUTH_DISABLED: 'Cách đăng nhập này chưa được bật. Báo người phụ trách app giúp mình nhé.',
  NETWORK: 'Chưa kết nối được mạng. Bạn kiểm tra mạng rồi thử lại.',
  UNKNOWN: 'Có lỗi xảy ra. Bạn thử lại sau nhé.',
};

const SERVER_CODES: ReadonlySet<string> = new Set([
  'UNAUTHENTICATED', 'PLAN_REQUIRED', 'TRIAL_USED', 'DEVICE_KEY_LIMIT', 'TERMS_REQUIRED', 'FORBIDDEN', 'FROZEN', 'VALIDATION', 'NOT_FOUND', 'FEATURE_OFF', 'BLOCKED_H4', 'CONFLICT_REV', 'LOCKED', 'RATE_LIMITED',
]);

const AUTH_CODES: Record<string, ApiErrorCode> = {
  otp_expired: 'OTP_INVALID',
  otp_disabled: 'AUTH_DISABLED',
  anonymous_provider_disabled: 'AUTH_DISABLED',
  signup_disabled: 'AUTH_DISABLED',
  email_provider_disabled: 'AUTH_DISABLED',
  over_email_send_rate_limit: 'RATE_LIMITED',
  over_request_rate_limit: 'RATE_LIMITED',
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

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const e: Loose = typeof err === 'object' && err !== null ? (err as Loose) : {};
  const message = str(e.message) ?? (typeof err === 'string' ? err : null);
  const name = str(e.name);
  const authCode = str(e.code);
  const rule = str(e.details) ?? str(e.detail);

  // Lỗi do backend (app.fail): message là mã.
  if (message && SERVER_CODES.has(message)) {
    const code = message as ApiErrorCode;
    const hint = str(e.hint);
    return new ApiError(code, hint && VIET_DIACRITIC.test(hint) ? hint : FALLBACK_MESSAGES[code], rule);
  }

  // Thiếu quyền EXECUTE / RLS của Postgres (anon gọi hàm không cho phép).
  if (authCode === '42501') return new ApiError('FORBIDDEN', FALLBACK_MESSAGES.FORBIDDEN, rule);
  // PostgREST: errcode PT402 (PLAN_REQUIRED D-68, DEVICE_KEY_LIMIT D-74) thành HTTP 402 khi message không mang mã: coi là PLAN_REQUIRED.
  if (authCode === 'PT402') return new ApiError('PLAN_REQUIRED', FALLBACK_MESSAGES.PLAN_REQUIRED, rule);
  // PostgREST: errcode PT428 (TERMS_REQUIRED, D-76) khi message không mang mã.
  if (authCode === 'PT428') return new ApiError('TERMS_REQUIRED', FALLBACK_MESSAGES.TERMS_REQUIRED, rule);
  // PostgREST: errcode PT429 thành HTTP 429 (RATE_LIMITED) khi message không mang mã.
  // PT409 dùng chung cho CONFLICT_REV, LOCKED, TRIAL_USED: chỉ coi là TRIAL_USED khi message mang mã (nhánh trên); ở đây không đoán.
  if (authCode === 'PT429') return new ApiError('RATE_LIMITED', FALLBACK_MESSAGES.RATE_LIMITED, rule);

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
  if (e.status === 402) return new ApiError('PLAN_REQUIRED', FALLBACK_MESSAGES.PLAN_REQUIRED);
  if (e.status === 428) return new ApiError('TERMS_REQUIRED', FALLBACK_MESSAGES.TERMS_REQUIRED);
  if (e.status === 429) return new ApiError('RATE_LIMITED', FALLBACK_MESSAGES.RATE_LIMITED);

  return new ApiError('UNKNOWN', FALLBACK_MESSAGES.UNKNOWN);
}

/** Dùng trong màn: lấy lời tiếng Việt từ bất kỳ lỗi nào. */
export function errorMessage(err: unknown): string {
  return toApiError(err).userMessage;
}

/** "15 phút", "1 giờ 30 phút", "ít giây". Làm tròn lên theo phút để không hẹn sớm hơn thực tế. */
export function formatWait(ms: number): string {
  if (!(ms > 0)) return 'ít giây';
  const totalMin = Math.ceil(ms / 60_000);
  if (totalMin < 60) return `${totalMin} phút`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
}

/**
 * Lời tiếng Việt khi nhập sai PIN (unlink_device ok:false). Không dùng popup: chuỗi này hiện ngay trong màn.
 * lockedUntil có: đang khóa, nói bao lâu nữa; không thì nói còn mấy lần thử.
 */
export function pinWrongMessage(attemptsLeft: number | null, lockedUntil: string | null, nowMs: number): string {
  if (lockedUntil) {
    const wait = Date.parse(lockedUntil) - nowMs;
    return `PIN chưa đúng. Bạn đã nhập sai nhiều lần nên mình tạm khóa việc này. Bạn thử lại sau khoảng ${formatWait(wait)} nhé.`;
  }
  if (attemptsLeft !== null && attemptsLeft <= 1) {
    return 'PIN chưa đúng. Bạn còn 1 lần thử, sai nữa mình sẽ tạm khóa việc này.';
  }
  if (attemptsLeft !== null) return `PIN chưa đúng. Bạn còn ${attemptsLeft} lần thử.`;
  return 'PIN chưa đúng. Bạn thử lại nhé.';
}

/**
 * Đổi `{"ok": false, "error": {...}}` (HTTP 200) thành ApiError. Mã lạ thành UNKNOWN. Lời Việt của máy chủ được dùng nếu có dấu;
 * riêng sai PIN thì dựng lời từ attempts_left / locked_until.
 */
export function apiErrorFromFailure(payload: unknown, nowMs: number): ApiError {
  const p: Record<string, unknown> = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
  const e: Record<string, unknown> = typeof p.error === 'object' && p.error !== null ? (p.error as Record<string, unknown>) : {};
  const rawCode = str(e.code);
  const code: ApiErrorCode = rawCode && SERVER_CODES.has(rawCode) ? (rawCode as ApiErrorCode) : 'UNKNOWN';
  const rule = str(e.rule);
  const left = typeof e.attempts_left === 'number' ? e.attempts_left : null;
  const until = str(e.locked_until);
  if (rule === 'FR01-T02' && code === 'FORBIDDEN') {
    return new ApiError(code, pinWrongMessage(left, until, nowMs), rule, { attemptsLeft: left, lockedUntil: until });
  }
  const msg = str(e.message_vi);
  return new ApiError(code, msg && VIET_DIACRITIC.test(msg) ? msg : FALLBACK_MESSAGES[code], rule);
}
