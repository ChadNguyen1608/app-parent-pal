// Bản giả lập của lớp Api, chạy trong bộ nhớ, để dựng và thử giao diện khi chưa có backend.
// Bật bằng EXPO_PUBLIC_API_MOCK=1. Dữ liệu mất khi đóng app. Chỉ dùng tên giả.
//
// Quy ước của bản giả lập (khác thật ở chỗ hai app là hai tiến trình riêng nên không thấy nhau):
//  - Mã OTP đúng luôn là 123456.
//  - Parent App: mã ghép đúng luôn là 123456 (mã khác: NOT_FOUND). PIN mặc định của hộ là 123456 cho tới khi đặt.
//  - Child App: lần gọi pair_accept đầu trả WAITING, từ lần thứ hai trả PAIRED (giả vờ bố mẹ vừa nhập mã).
import { toApiError } from './errors.ts';
import type { AcceptResult, Api, Child, ChildInput, Home, PairCode, SessionInfo } from './types.ts';
import { checkPin } from './validate.ts';

export const MOCK_OTP = '123456';
export const MOCK_PAIR_CODE = '123456';
export const MOCK_MAX_PIN_TRIES = 5;

export type MockOptions = {
  /** Giả lập hộ bị đóng băng: mọi hàm ghi trả FROZEN. */
  frozen?: boolean;
  /** Số lần pair_accept trả WAITING trước khi PAIRED (mặc định 1). */
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
  let codesIssued = 0;
  let acceptCalls = 0;
  let boundChildId: string | null = null;
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
      if (!household) household = { id: id('hh'), memberCallName: name };
      return { householdId: household.id };
    },

    async touchActive() {
      needLogin();
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

    async pairConfirm(childId, code) {
      writable();
      await pause();
      const child = children.find((c) => c.id === childId);
      if (!child) fail('NOT_FOUND', 'CHILD', 'Không tìm thấy hồ sơ con.');
      if (!child.hasDevice) fail('VALIDATION', 'BR-FAM-DEV', 'Con chưa có máy riêng.');
      if (code.trim() !== MOCK_PAIR_CODE) fail('NOT_FOUND', 'BR-FAM-031', 'Mã không đúng hoặc đã hết hạn.');
      child.pairState = 'PAIRED';
    },

    async pinSet(p) {
      writable();
      await pause();
      const bad = checkPin(p);
      if (bad) fail('VALIDATION', 'BR-FAM-PIN', bad);
      pin = p;
      pinTries = 0;
    },

    async pairCodeCreate(): Promise<PairCode> {
      needLogin();
      await pause();
      codesIssued += 1;
      acceptCalls = 0;
      const code = codesIssued === 1 ? MOCK_PAIR_CODE : String(Math.floor(100000 + Math.random() * 900000));
      return { code, expiresAt: new Date(now() + 10 * 60_000).toISOString() };
    },

    async pairAccept(): Promise<AcceptResult> {
      needLogin();
      await pause();
      if (codesIssued === 0) fail('NOT_FOUND', 'BR-FAM-030', 'Chưa có mã ghép.');
      acceptCalls += 1;
      if (acceptCalls <= acceptAfter) return { status: 'WAITING' };
      boundChildId = 'mock-child-1';
      return { status: 'PAIRED', childId: boundChildId };
    },

    async getMyBinding() {
      needLogin();
      return boundChildId ? { childId: boundChildId } : null;
    },

    async unlinkDevice(childId, p) {
      needLogin();
      await pause();
      if (opts.frozen) fail('FROZEN', 'BR-FAM-FROZEN', 'Gia đình đang tạm dừng app.');
      const bad = checkPin(p);
      if (bad) fail('VALIDATION', 'BR-FAM-PIN', bad);
      if (pinTries >= MOCK_MAX_PIN_TRIES) fail('FORBIDDEN', 'PR-FAM-05', 'Đã nhập sai nhiều lần. Bạn thử lại sau nhé.');
      if (p !== (pin ?? MOCK_PAIR_CODE)) {
        pinTries += 1;
        fail('FORBIDDEN', 'BR-FAM-034', 'PIN chưa đúng.');
      }
      if (boundChildId !== childId) fail('NOT_FOUND', 'BR-FAM-034', 'Máy này chưa ghép.');
      boundChildId = null;
      pinTries = 0;
      codesIssued = 0;
    },
  };
}

