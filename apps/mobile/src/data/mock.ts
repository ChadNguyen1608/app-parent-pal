// Bản giả lập của lớp Api, chạy trong bộ nhớ, để dựng và thử giao diện khi chưa có backend.
// Bật bằng EXPO_PUBLIC_API_MOCK=1. Dữ liệu mất khi đóng app. Chỉ dùng tên giả.
//
// Quy ước của bản giả lập (khác thật ở chỗ hai app là hai tiến trình riêng nên không thấy nhau):
//  - Mã OTP đúng luôn là 123456. Link thư giả lập: <scheme>://auth-callback?code=mock-link.
//  - Parent App: mã ghép đúng luôn là 123456. Lần ghép đầu phải kèm PIN (như pair_confirm thật); mã sai thì ném NOT_FOUND
//    (thật: ok=false) và 5 lần sai liên tiếp thì RATE_LIMITED.
//  - Child App: pair_pending trả pending=false `acceptAfter` lần đầu, rồi pending=true ("Kết nối với chị Lan?", giả vờ bố mẹ
//    vừa nhập mã); pair_accept chỉ đúng khi đang pending. PIN hủy kết nối: PIN đã đặt, mặc định MOCK_DEFAULT_PIN (482915; 123456 bị máy chủ từ chối vì dễ đoán).
import { apiErrorFromFailure, toApiError } from './errors.ts';
import type { Api, Binding, Child, ChildInput, Home, PairCode, PairConfirmResult, PairPending, PalMessage, PalQuota, PalReply, PalState, SessionInfo } from './types.ts';
import { checkPin } from './validate.ts';

export const MOCK_OTP = '123456';
export const MOCK_LINK_CODE = 'mock-link'; // ?code=mock-link trong link giả lập
export const MOCK_PAIR_CODE = '123456';
/** PIN mặc định của máy con giả lập khi chưa đặt PIN trong phiên. Không dùng 123456: máy chủ coi là dễ đoán. */
export const MOCK_DEFAULT_PIN = '482915';
export const MOCK_MAX_PIN_TRIES = 5;
export const MOCK_MAX_CODE_FAILS = 5;
export const MOCK_LOCK_MINUTES = 15;
export const MOCK_ADULT_NAME = 'chị Lan';
/** Pal giả lập: mặc định 20 lượt/ngày (gói TRIAL, số CHUA_CHOT). Câu có "muốn chết" bị lớp an toàn chặn và không tính lượt. */
export const MOCK_PAL_LIMIT = 20;
export const MOCK_PAL_REPLIES = [
  'Mình nghe chị. Nghe như hôm nay là một ngày dài. Chị kể thêm cho mình chuyện xảy ra lúc nào nhé?',
  'Cảm ơn chị đã chia sẻ. Mình gợi ý một việc nhỏ thôi: tối nay dành 10 phút ngồi cạnh con, không làm gì khác. Chị thấy có làm được không?',
  'Mình chưa có nghiên cứu kiểm trực tiếp cho chuyện này, nên mình không chắc chắn. Chị có thể cho con thử một tuần rồi mình cùng xem lại.',
];
export const MOCK_PAL_SAFETY_REPLY =
  'Mình rất lo cho chị. Nếu chị hoặc ai đó đang gặp nguy hiểm ngay bây giờ, chị gọi 115 (cấp cứu). Nếu trẻ em đang bị xâm hại, gọi 111 (bảo vệ trẻ em) hoặc 113 (công an).';

export type MockOptions = {
  /** Giả lập hộ bị đóng băng: mọi hàm ghi trả FROZEN. */
  frozen?: boolean;
  /** Số lần pair_pending trả pending=false trước khi có yêu cầu chờ (mặc định 1). */
  acceptAfter?: number;
  /** Trạng thái Pal giả lập (mặc định OK). OFF: ẩn mục Pal. LOCKED: Pal đang tạm dừng. */
  palState?: PalState;
  /** Số lượt đã dùng sẵn hôm nay (mặc định 0). */
  palUsed?: number;
  /** Độ trễ giả (ms) để thấy trạng thái đang xử lý. Test đặt 0. */
  latencyMs?: number;
  now?: () => number;
};

function fail(code: string, rule: string, hint: string): never {
  throw toApiError({ message: code, details: rule, hint });
}

export function createMockApi(opts: MockOptions = {}): Api {
  const now = opts.now ?? (() => Date.now());
  const latency = opts.latencyMs ?? 250;
  const acceptAfter = opts.acceptAfter ?? 1;

  let session: SessionInfo | null = null;
  const listeners = new Set<(s: SessionInfo | null) => void>();
  let pendingEmail: string | null = null;
  let household: { id: string; memberCallName: string } | null = null;
  const children: Child[] = [];
  let pin: string | null = null;
  let pinTries = 0;
  let pinLockedUntil: number | null = null;
  let codeFails = 0;
  let codesIssued = 0;
  let pendingCalls = 0;
  let pendingShown = false;
  let epochSeq = 1;
  let bound: Binding | null = null;
  const seenKeys = new Map<string, string>();
  let palUsed = opts.palUsed ?? 0;
  let palConv: string | null = null;
  const palMsgs: PalMessage[] = [];
  const palReplays = new Map<string, PalReply>();
  let seq = 0;

  const pause = () => (latency > 0 ? new Promise<void>((r) => setTimeout(r, latency)) : Promise.resolve());
  const setSession = (s: SessionInfo | null) => {
    session = s;
    listeners.forEach((cb) => cb(s));
  };
  const needLogin = (): SessionInfo => {
    if (!session) fail('UNAUTHENTICATED', 'AUTH', 'Bạn cần đăng nhập lại.');
    return session;
  };
  const writable = () => {
    needLogin();
    if (opts.frozen) fail('FROZEN', 'BR-FAM-FROZEN', 'Gia đình đang tạm dừng app.');
  };
  const id = (p: string) => `${p}-${++seq}`;
  const palStatus = (): PalQuota => {
    if (!household) return { state: 'NO_HOUSEHOLD', tier: null, limit: null, used: null, remaining: null };
    const forced = opts.palState ?? 'OK';
    const remaining = Math.max(0, MOCK_PAL_LIMIT - palUsed);
    const state: PalState = forced !== 'OK' ? forced : remaining === 0 ? 'QUOTA' : 'OK';
    return { state, tier: 'TRIAL', limit: MOCK_PAL_LIMIT, used: palUsed, remaining };
  };

  return {
    kind: 'mock',
    auth: {
      async getSession() {
        return session;
      },
      onChange(cb) {
        listeners.add(cb);
        return () => void listeners.delete(cb);
      },
      async sendEmailOtp(email) {
        await pause();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          throw toApiError({ code: 'email_address_invalid', message: 'Email address is invalid' });
        }
        pendingEmail = email.trim().toLowerCase();
      },
      async verifyEmailOtp(email, token) {
        await pause();
        if (pendingEmail === null || pendingEmail !== email.trim().toLowerCase() || token.trim() !== MOCK_OTP) {
          throw toApiError({ code: 'otp_expired', message: 'Token has expired or is invalid' });
        }
        pendingEmail = null;
        const s = { userId: 'mock-parent', email: email.trim().toLowerCase(), isAnonymous: false };
        setSession(s);
        return s;
      },
      async completeFromLink(link) {
        await pause();
        if (link.kind !== 'code' || link.code !== MOCK_LINK_CODE) {
          throw toApiError({ code: 'otp_expired', message: 'link hết hạn' });
        }
        const s = { userId: 'mock-parent', email: pendingEmail ?? 'link@example.com', isAnonymous: false };
        pendingEmail = null;
        setSession(s);
        return s;
      },
      async signInAnonymously() {
        await pause();
        const s = { userId: 'mock-child-device', email: null, isAnonymous: true };
        setSession(s);
        return s;
      },
      async signOut() {
        await pause();
        setSession(null);
      },
    },

    async getHome(): Promise<Home> {
      needLogin();
      await pause();
      if (!household) return null;
      return { householdId: household.id, memberCallName: household.memberCallName, children: children.map((c) => ({ ...c })) };
    },

    async familyCreate(callName) {
      writable();
      await pause();
      const name = callName.trim();
      if (name === '') fail('VALIDATION', 'BR-001', 'Cần tên gọi của bạn.');
      if (name.length > 40) fail('VALIDATION', 'BR-001', 'Tên gọi tối đa 40 ký tự.');
      const replay = household !== null;
      if (!household) household = { id: id('hh'), memberCallName: name };
      return { householdId: household.id, replay };
    },

    async touchActive() {
      needLogin();
      return { touched: true };
    },

    async childCreate(input: ChildInput) {
      writable();
      await pause();
      if (!household || household.id !== input.householdId) fail('NOT_FOUND', 'HH', 'Không tìm thấy gia đình.');
      if (input.idempotencyKey && seenKeys.has(input.idempotencyKey)) return { childId: seenKeys.get(input.idempotencyKey)! };
      const name = input.callName.trim();
      if (name === '') fail('VALIDATION', 'BR-001', 'Cần tên gọi của con.');
      if (name.length > 40) fail('VALIDATION', 'BR-001', 'Tên gọi tối đa 40 ký tự.');
      const grade = input.grade ?? null;
      const age = input.ageYears ?? null;
      if (grade !== null && (grade < 1 || grade > 9)) fail('VALIDATION', 'BR-001', 'Lớp từ 1 đến 9.');
      if (age !== null && (age < 0 || age > 18)) fail('VALIDATION', 'BR-001', 'Tuổi từ 0 đến 18.');
      if (grade === null && age === null) fail('VALIDATION', 'BR-001', 'Cần lớp hoặc tuổi của con.');
      const childId = id('child');
      children.push({ id: childId, callName: name, grade, ageYears: age, hasDevice: input.hasDevice, pairState: 'NONE' });
      if (input.idempotencyKey) seenKeys.set(input.idempotencyKey, childId);
      return { childId };
    },

    async pairConfirm(childId, code, pinIn): Promise<PairConfirmResult> {
      writable();
      await pause();
      const child = children.find((c) => c.id === childId);
      if (!child) fail('NOT_FOUND', 'CHILD', 'Không tìm thấy hồ sơ con.');
      if (codeFails >= MOCK_MAX_CODE_FAILS) fail('RATE_LIMITED', 'BR-FAM-031', 'Đã thử quá nhiều lần. Hãy thử lại sau ít phút.');
      if (!child.hasDevice) fail('VALIDATION', 'BR-FAM-037', 'Con chưa có máy riêng. Chưa ghép được.');
      if (pin === null && pinIn === undefined) fail('VALIDATION', 'FR-01', 'Cần đặt Parent PIN khi ghép lần đầu.');
      if (pin !== null && pinIn !== undefined) fail('VALIDATION', 'FR-01', 'Đã có PIN. Muốn đổi PIN, hãy dùng chức năng đổi PIN.');
      if (pinIn !== undefined) {
        const bad = checkPin(pinIn, pinIn); // như pin_check_format: định dạng + dễ đoán
        if (bad) fail('VALIDATION', 'FR-01', bad);
      }
      if (code.trim() !== MOCK_PAIR_CODE) {
        codeFails += 1;
        throw apiErrorFromFailure({ ok: false, error: { code: 'NOT_FOUND', rule: 'BR-FAM-031', message_vi: 'Mã không đúng hoặc đã hết hạn.' } }, now());
      }
      if (pinIn !== undefined) pin = pinIn;
      codeFails = 0;
      child.pairState = 'PENDING';
      return { state: 'CHO_XAC_NHAN_MAY_CON', epoch: 1, pinSet: pinIn !== undefined };
    },

    async pinSet(p) {
      writable();
      await pause();
      const bad = checkPin(p, p);
      if (bad) fail('VALIDATION', 'FR-01', bad);
      pin = p;
      pinTries = 0;
      pinLockedUntil = null;
    },

    async pairCodeCreate(): Promise<PairCode> {
      needLogin();
      await pause();
      codesIssued += 1;
      pendingCalls = 0;
      pendingShown = false;
      const code = codesIssued === 1 ? MOCK_PAIR_CODE : String(Math.floor(100000 + Math.random() * 900000));
      return { code, expiresAt: new Date(now() + 10 * 60_000).toISOString() };
    },

    async pairPending(): Promise<PairPending> {
      needLogin();
      await pause();
      if (codesIssued === 0 || bound) return { pending: false };
      if (!pendingShown) {
        pendingCalls += 1;
        if (pendingCalls <= acceptAfter) return { pending: false };
        pendingShown = true;
      }
      return { pending: true, adultCallName: household?.memberCallName ?? MOCK_ADULT_NAME, expiresAt: new Date(now() + 5 * 60_000).toISOString() };
    },

    async pairAccept(): Promise<Binding> {
      needLogin();
      await pause();
      if (!pendingShown) fail('NOT_FOUND', 'AD-11', 'Không có yêu cầu ghép nào đang chờ.');
      epochSeq += 1;
      pendingShown = false;
      bound = { childId: 'mock-child-1', epoch: epochSeq };
      return { ...bound };
    },

    async pairDecline() {
      needLogin();
      await pause();
      pendingShown = false;
      codesIssued = 0; // mã đã dùng, máy con phải lấy mã mới
    },

    async getMyBinding() {
      needLogin();
      return bound ? { ...bound } : null;
    },

    async unlinkDevice(childId, p, bindingEpoch) {
      const me = needLogin();
      await pause();
      const bad = checkPin(p);
      if (bad) fail('VALIDATION', 'FR-01', bad);
      if (!bound || bound.childId !== childId) fail('NOT_FOUND', '', 'Không có liên kết nào để hủy.');
      if (me.isAnonymous && bindingEpoch === undefined) fail('VALIDATION', 'FR01-T09', 'Thiếu epoch của liên kết.');
      if (bindingEpoch !== undefined && bindingEpoch !== bound.epoch) fail('CONFLICT_REV', 'FR01-T09', 'Liên kết đã thay đổi. Hãy tải lại.');
      const t = now();
      if (pinLockedUntil !== null && pinLockedUntil > t) fail('RATE_LIMITED', 'PR-FAM-05', 'PIN đang tạm khóa. Hãy thử lại sau.');
      if (p !== (pin ?? MOCK_DEFAULT_PIN)) {
        pinTries += 1;
        if (pinTries >= MOCK_MAX_PIN_TRIES) {
          pinTries = 0;
          pinLockedUntil = t + MOCK_LOCK_MINUTES * 60_000;
        }
        throw apiErrorFromFailure(
          {
            ok: false,
            error: {
              code: 'FORBIDDEN',
              rule: 'FR01-T02',
              message_vi: 'PIN chưa đúng.',
              attempts_left: pinLockedUntil !== null ? 0 : MOCK_MAX_PIN_TRIES - pinTries,
              locked_until: pinLockedUntil !== null ? new Date(pinLockedUntil).toISOString() : null,
            },
          },
          t,
        );
      }
      bound = null;
      pinTries = 0;
      pinLockedUntil = null;
      codesIssued = 0;
      pendingShown = false;
    },

    async palQuota() {
      needLogin();
      return palStatus();
    },

    async palSend(input): Promise<PalReply> {
      needLogin();
      await pause();
      const done = palReplays.get(input.idempotencyKey);
      if (done) return done;
      const q = palStatus();
      if (q.state === 'LOCKED') fail('PAL_LOCKED', 'PAL-LOCKED', 'Pal đang tạm dừng.');
      if (q.state === 'OFF') fail('FEATURE_OFF', 'PAL-FLAG', 'Tính năng trò chuyện với Pal đang tắt.');
      const text = input.message.trim();
      if (text === '') fail('VALIDATION', 'PAL-IN', 'Bạn nhập câu hỏi trước nhé.');
      const blocked = /muốn chết|tự tử|tu tu/i.test(text);
      if (!blocked && q.state !== 'OK') fail('RATE_LIMITED', 'PAL-QUOTA', 'Hôm nay bạn đã dùng hết lượt hỏi Pal.');
      palConv = input.conversationId ?? palConv ?? id('pal-conv');
      const reply = blocked ? MOCK_PAL_SAFETY_REPLY : MOCK_PAL_REPLIES[palUsed % MOCK_PAL_REPLIES.length];
      if (!blocked) palUsed += 1;
      const flags = blocked ? ['EMERGENCY_SELF_HARM'] : [];
      const at = new Date(now()).toISOString();
      palMsgs.push({ id: id('pal-msg'), role: 'user', content: text, flags: [], createdAt: at });
      palMsgs.push({ id: id('pal-msg'), role: 'assistant', content: reply, flags, createdAt: at });
      const out: PalReply = { conversationId: palConv, reply, blocked, flags, remaining: palStatus().remaining, state: palStatus().state };
      palReplays.set(input.idempotencyKey, out);
      return out;
    },

    async palHistory() {
      needLogin();
      return { conversationId: palConv, messages: [...palMsgs] };
    },
  };
}
