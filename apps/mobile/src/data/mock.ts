// Bản giả lập của lớp Api, chạy trong bộ nhớ, để dựng và thử giao diện khi chưa có backend.
// Bật bằng EXPO_PUBLIC_API_MOCK=1. Dữ liệu mất khi đóng app. Chỉ dùng tên giả.
//
// Quy ước của bản giả lập (khác thật ở chỗ hai app là hai tiến trình riêng nên không thấy nhau):
//  - Mã OTP đúng luôn là 123456. Link thư giả lập: <scheme>://auth-callback?code=mock-link.
//  - Parent App: mã ghép đúng luôn là 123456. Lần ghép đầu phải kèm PIN (như pair_confirm thật); mã sai thì ném NOT_FOUND
//    (thật: ok=false) và 5 lần sai liên tiếp thì RATE_LIMITED.
//  - Child App: pair_pending trả pending=false `acceptAfter` lần đầu, rồi pending=true ("Kết nối với chị Lan?", giả vờ bố mẹ
//    vừa nhập mã); pair_accept chỉ đúng khi đang pending. PIN hủy kết nối: PIN đã đặt, mặc định 123456.
import { apiErrorFromFailure, toApiError } from './errors.ts';
import type { Api, Binding, Child, ChildInput, Home, PairCode, PairConfirmResult, PairPending, SessionInfo } from './types.ts';
import { checkPin } from './validate.ts';

export const MOCK_OTP = '123456';
export const MOCK_LINK_CODE = 'mock-link'; // ?code=mock-link trong link giả lập
export const MOCK_PAIR_CODE = '123456';
export const MOCK_MAX_PIN_TRIES = 5;
export const MOCK_MAX_CODE_FAILS = 5;
export const MOCK_LOCK_MINUTES = 15;
export const MOCK_ADULT_NAME = 'chị Lan';

export type MockOptions = {
  /** Giả lập hộ bị đóng băng: mọi hàm ghi trả FROZEN. */
  frozen?: boolean;
  /** Số lần pair_pending trả pending=false trước khi có yêu cầu chờ (mặc định 1). */
  acceptAfter?: number;
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
        const bad = checkPin(pinIn);
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
      const bad = checkPin(p);
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
      if (p !== (pin ?? MOCK_PAIR_CODE)) {
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
  };
}
