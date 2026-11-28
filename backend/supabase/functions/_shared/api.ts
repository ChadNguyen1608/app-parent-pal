// Lõi dùng chung của Edge Function nấc 1: lỗi API, bọc handler, nối CSDL bằng JWT NGƯỜI DÙNG (không service_role).
// Lý do dùng JWT người dùng: (1) RLS và app.access_state/app.can chạy đúng danh tính người gọi, không cần "hỏi thay";
// (2) audit_log tự ghi đúng người (private.audit_write_auto đọc auth.uid()); (3) Edge Function không cần giữ khóa service_role
// cho ba hàm lịch, nên lộ hàm không lộ quyền ghi toàn CSDL. Đổi lại: hàm SQL ghi gọi được trực tiếp bởi bất kỳ client nào có JWT,
// nên kết quả xếp lịch phải mang chữ ký HMAC của Edge Function (xem schedule-core.ts, app.schedule_commit_apply).

export const STATUS: Record<string, number> = {
  UNAUTHENTICATED: 401, PLAN_REQUIRED: 402, DEVICE_KEY_LIMIT: 402, FORBIDDEN: 403, FEATURE_OFF: 403, BLOCKED_H4: 403, PURPOSE_OFF: 403, NOT_FOUND: 404,
  VALIDATION: 422, FROZEN: 423, CONFLICT_REV: 409, LOCKED: 409, TRIAL_USED: 409, RATE_LIMITED: 429, INTERNAL: 500,
};

export class ApiError extends Error {
  code: string; rule: string; messageVi: string; extra: Record<string, unknown>;
  constructor(code: string, rule = '', messageVi = '', extra: Record<string, unknown> = {}) {
    super(code); this.code = code; this.rule = rule; this.messageVi = messageVi; this.extra = extra;
  }
  get status() { return STATUS[this.code] ?? 500; }
}

/** Lỗi PostgREST của app.fail: message = mã, details = quy tắc, hint = lời tiếng Việt. */
export function fromDbError(e: { message?: string; details?: string; hint?: string; code?: string }): ApiError {
  const code = e.message && e.message in STATUS ? e.message : 'INTERNAL';
  if (code === 'INTERNAL') return new ApiError('INTERNAL', '', 'Có lỗi phía máy chủ.');   // không lặp thông điệp CSDL (có thể chứa dữ liệu)
  return new ApiError(code, e.details ?? '', e.hint ?? '');
}

export interface Db {
  /** Gọi app.<fn> bằng JWT người dùng. Ném ApiError nếu CSDL từ chối. */
  rpc(fn: string, args: Record<string, any>): Promise<any>;
}
export interface Deps { db: Db; env: (k: string) => string | undefined; }

export function jsonResponse(status: number, body: unknown, requestId: string): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'x-request-id': requestId } });
}

/** Bọc handler: chỉ POST, cần Authorization, JSON; lỗi theo dạng Tech Spec §0. Không ghi log thân yêu cầu/phản hồi. */
export function handle(makeDeps: (authHeader: string) => Deps | Promise<Deps>,
                       run: (body: any, deps: Deps) => Promise<unknown>) {
  return async (req: Request): Promise<Response> => {
    const rid = crypto.randomUUID();
    const err = (e: ApiError) => jsonResponse(e.status, { error: { code: e.code, message_vi: e.messageVi, rule: e.rule, ...e.extra } }, rid);
    try {
      if (req.method !== 'POST') return err(new ApiError('VALIDATION', 'HTTP', 'Chỉ nhận POST.'));
      const auth = req.headers.get('authorization') ?? '';
      if (!/^Bearer\s+\S+/i.test(auth)) return err(new ApiError('UNAUTHENTICATED', '', 'Cần đăng nhập.'));
      let body: any;
      try { body = await req.json(); } catch { return err(new ApiError('VALIDATION', 'HTTP', 'Thân yêu cầu không phải JSON.')); }
      if (body === null || typeof body !== 'object' || Array.isArray(body)) return err(new ApiError('VALIDATION', 'HTTP', 'Thân yêu cầu phải là object.'));
      const out = await run(body, await makeDeps(auth));
      return jsonResponse(200, out, rid);
    } catch (e) {
      if (e instanceof ApiError) return err(e);
      console.error(JSON.stringify({ request_id: rid, event: 'internal_error' }));   // không ghi nội dung lỗi/thân
      return err(new ApiError('INTERNAL', '', 'Có lỗi phía máy chủ.'));
    }
  };
}
