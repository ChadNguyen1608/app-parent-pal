// Bản giả lập của lớp Api, chạy trong bộ nhớ, để dựng và thử giao diện khi chưa có backend.
// Bật bằng EXPO_PUBLIC_API_MOCK=1. Dữ liệu mất khi đóng app. Chỉ dùng tên giả.
//
// Quy ước của bản giả lập (khác thật ở chỗ hai app là hai tiến trình riêng nên không thấy nhau):
//  - Mã OTP đúng luôn là 123456. Link thư giả lập: <scheme>://auth-callback?code=mock-link.
//  - Parent App: mã ghép đúng luôn là 123456. Lần ghép đầu phải kèm PIN (như pair_confirm thật); mã sai thì ném NOT_FOUND
//    (thật: ok=false) và 5 lần sai liên tiếp thì RATE_LIMITED.
//  - Gói dịch vụ (D-68, D-72): mặc định TRIAL (mỗi con 1 kế hoạch, sửa 3 lần, KHÔNG ghép máy). Chọn bằng MockOptions.plan, hoặc ?plan=FREE|TRIAL|PREMIUM
//    trên URL bản web. Chỉ PREMIUM ghép máy được (pairConfirm trả PLAN_REQUIRED như máy chủ thật).
//    trialStart: FREE chưa dùng thử -> TRIAL; MockOptions.trialClaimed (?trial=used) giả lập máy/email đã dùng thử -> TRIAL_USED. Gói FREE chưa dùng thử có trialAvailable.
//  - Child App: pair_pending trả pending=false `acceptAfter` lần đầu, rồi pending=true ("Kết nối với chị Lan?", giả vờ bố mẹ
//    vừa nhập mã); pair_accept chỉ đúng khi đang pending. PIN hủy kết nối: PIN đã đặt, mặc định MOCK_DEFAULT_PIN (482915; 123456 bị máy chủ từ chối vì dễ đoán).
import { apiErrorFromFailure, toApiError } from './errors.ts';
import type { Api, Binding, Child, ChildInput, FamilyState, Home, PairCode, PairConfirmResult, PairPending, PlanInfo, PlanTier, SessionInfo } from './types.ts';
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

export const MOCK_DEFAULT_PLAN: PlanTier = 'TRIAL';
export const MOCK_TRIAL_PLANS_MAX = 1;
export const MOCK_TRIAL_EDITS_MAX = 3;
export const MOCK_TRIAL_DAYS = 7;

export function isPlanTier(v: unknown): v is PlanTier {
  return v === 'FREE' || v === 'TRIAL' || v === 'PREMIUM';
}

export type MockOptions = {
  /** Gói dịch vụ của hộ giả lập (mặc định TRIAL). */
  plan?: PlanTier;
  /** Giả lập hộ bị đóng băng: mọi hàm ghi trả FROZEN. */
  frozen?: boolean;
  /** Giả lập mã máy hoặc email đã dùng thử ở nơi khác: trialStart trả TRIAL_USED. */
  trialClaimed?: boolean;
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
  let plan: PlanTier = opts.plan ?? MOCK_DEFAULT_PLAN;
  let trialUsed = plan !== 'FREE'; // đã từng TRIAL hoặc PREMIUM
  let trialEndsAt: string | null = null; // chỉ có khi dùng thử bắt đầu bằng trialStart

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

    async myPlan(): Promise<PlanInfo> {
      needLogin();
      await pause();
      const left = plan === 'PREMIUM' ? null : plan === 'TRIAL' ? MOCK_TRIAL_EDITS_MAX : 0;
      return {
        tier: plan,
        expired: false,
        plansMax: plan === 'PREMIUM' ? null : plan === 'TRIAL' ? MOCK_TRIAL_PLANS_MAX : 0,
        editsMax: plan === 'PREMIUM' ? null : plan === 'TRIAL' ? MOCK_TRIAL_EDITS_MAX : 0,
        children: children.map((c) => ({ childId: c.id, plansUsed: 0, editsUsed: 0, editsLeft: left })),
        palQuestionsLeft: null,
        trialEndsAt: plan === 'TRIAL' ? trialEndsAt : null,
        trialAvailable: plan === 'FREE' && !trialUsed,
        trialDays: MOCK_TRIAL_DAYS,
      };
    },

    async trialStart() {
      writable();
      await pause();
      if (plan !== 'FREE' || trialUsed || opts.trialClaimed) fail('TRIAL_USED', 'D-72.claim', 'Máy này hoặc email này đã dùng thử rồi.');
      plan = 'TRIAL';
      trialUsed = true;
      trialEndsAt = new Date(now() + MOCK_TRIAL_DAYS * 86_400_000).toISOString();
      return { trialEndsAt };
    },

    async myFamilyState(): Promise<FamilyState> {
      needLogin();
      await pause();
      return { frozen: opts.frozen === true, planActive: plan === 'PREMIUM' };
    },

    async pairConfirm(childId, code, pinIn): Promise<PairConfirmResult> {
      writable();
      await pause();
      const child = children.find((c) => c.id === childId);
      if (!child) fail('NOT_FOUND', 'CHILD', 'Không tìm thấy hồ sơ con.');
      if (plan !== 'PREMIUM') fail('PLAN_REQUIRED', 'D-68.premium', 'Chỉ gói Premium mới ghép và đồng bộ lịch sang máy của con.');
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
  };
}
