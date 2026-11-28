// Bản giả lập của lớp Api, chạy trong bộ nhớ, để dựng và thử giao diện khi chưa có backend.
// Bật bằng EXPO_PUBLIC_API_MOCK=1. Dữ liệu mất khi đóng app. Chỉ dùng tên giả.
//
// Quy ước của bản giả lập (khác thật ở chỗ hai app là hai tiến trình riêng nên không thấy nhau):
//  - Mã OTP đúng luôn là 123456. Link thư giả lập: <scheme>://auth-callback?code=mock-link.
//  - Parent App: mã ghép đúng luôn là 123456. Lần ghép đầu phải kèm PIN (như pair_confirm thật); mã sai thì ném NOT_FOUND
//    (thật: ok=false) và 5 lần sai liên tiếp thì RATE_LIMITED.
//  - Gói dịch vụ (D-68, D-72, D-74): mặc định TRIAL (mỗi con 1 kế hoạch, sửa 3 lần, 1 khóa ghép máy). Chọn bằng MockOptions.plan, hoặc ?plan=FREE|TRIAL|PREMIUM
//    trên URL bản web. Ghép máy theo khóa: FREE 0, TRIAL 1, PREMIUM MockOptions.deviceKeys (mặc định 1); hết khóa thì pairConfirm trả DEVICE_KEY_LIMIT, FREE trả PLAN_REQUIRED như máy chủ thật.
//    trialStart: FREE chưa dùng thử -> TRIAL; MockOptions.trialClaimed (?trial=used) giả lập máy/email đã dùng thử -> TRIAL_USED. Gói FREE chưa dùng thử có trialAvailable.
//  - Child App: pair_pending trả pending=false `acceptAfter` lần đầu, rồi pending=true ("Kết nối với chị Lan?", giả vờ bố mẹ
//    vừa nhập mã); pair_accept chỉ đúng khi đang pending. PIN hủy kết nối: PIN đã đặt, mặc định MOCK_DEFAULT_PIN (482915; 123456 bị máy chủ từ chối vì dễ đoán).
//  - Đồng ý (D-64, T2.1..T2.3): một mục lõi MD-LICH và hai mục riêng MD-SUCKHOE, MD-CONBAO. Phản chiếu consent_record, consent_withdraw_all
//    (hai bước, mã hạn 10 phút), household_reopen, deletion_request, export_request (luôn BLOCKED_H4). Máy con giả lập có sẵn danh sách mục đích
//    hiệu lực (MOCK_CHILD_DEFAULT_CONSENT) vì hai app là hai tiến trình riêng.
//  - Ghi chú sức khỏe (D-66): chỉ ghi khi MD-SUCKHOE hiệu lực; rút MD-SUCKHOE thì ghi chú biến mất (máy chủ: ẩn ngay rồi xếp hàng xóa).
//  - Báo bố mẹ (D-67): child_alert_send cần MD-CONBAO hiệu lực, tối đa MOCK_ALERT_MAX_PER_HOUR lần mỗi giờ, giữ 7 ngày. Hai app là hai tiến trình
//    riêng nên với `demoAlert` thì khi bố mẹ bật MD-CONBAO, mock tạo sẵn một báo mẫu để thử màn của bố mẹ.
import { effectiveCodes, PURPOSE_CONBAO, PURPOSE_LICH, PURPOSE_SUCKHOE } from './consent.ts';
import { apiErrorFromFailure, toApiError } from './errors.ts';
import type {
  Api,
  AlertKind,
  Binding,
  Child,
  ChildAlert,
  ChildInput,
  ConsentOverview,
  DeletionResult,
  DeletionScope,
  HealthKind,
  HealthNote,
  Home,
  HouseholdState,
  MemberRole,
  MyFamilyState,
  OpenDeletion,
  PairCode,
  PairConfirmResult,
  PairPending,
  PlanInfo,
  PlanTier,
  Purpose,
  PurposeStatus,
  SessionInfo,
} from './types.ts';
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
export const MOCK_WITHDRAW_TTL_MINUTES = 10;
/** child_alert_max_per_hour (CHUA_CHOT): 6. */
export const MOCK_ALERT_MAX_PER_HOUR = 6;
export const MOCK_ALERT_RETENTION_DAYS = 7;
/** Danh mục mục đích như migration T2.1 (D-64): một mục lõi, hai mục riêng. */
export const MOCK_PURPOSES: Purpose[] = [
  { code: 'MD-LICH', nameVi: 'Phần cốt lõi: lập lịch, đồng bộ sang máy của con và nhắc giờ, ghi con bấm Xong, hỏi thăm, mong muốn của con, báo cáo tuần', kind: 'LOI', collectEnabled: true },
  { code: 'MD-SUCKHOE', nameVi: 'Thông tin sức khỏe của con (dị ứng, thuốc), lưu trong hồ sơ', kind: 'TUY_CHON', collectEnabled: true },
  { code: 'MD-CONBAO', nameVi: 'Con báo trực tiếp cho bố mẹ (không khỏe, nhờ đón sớm, nhờ gọi), chỉ chọn câu có sẵn', kind: 'TUY_CHON', collectEnabled: true },
];
/** Máy con giả lập: các mục bố mẹ coi như đã bật (CA-16 và nút "Báo bố mẹ ngay" dựng từ đây). */
export const MOCK_CHILD_DEFAULT_CONSENT = ['MD-LICH', 'MD-CONBAO'];

export const MOCK_DEFAULT_PLAN: PlanTier = 'TRIAL';
export const MOCK_TRIAL_PLANS_MAX = 1;
export const MOCK_TRIAL_EDITS_MAX = 3;
export const MOCK_TRIAL_DAYS = 7;
export const MOCK_TRIAL_DEVICE_KEYS = 1;
/** D-76: phiên bản Điều khoản hiện hành của bản giả lập (như private.terms_version của máy chủ). */
export const MOCK_TERMS_VERSION = '2026-11-28-nhap';

export function isPlanTier(v: unknown): v is PlanTier {
  return v === 'FREE' || v === 'TRIAL' || v === 'PREMIUM';
}

export type MockOptions = {
  /** Gói dịch vụ của hộ giả lập (mặc định TRIAL). */
  plan?: PlanTier;
  /** Số khóa ghép máy của gói PREMIUM (mặc định 1, như máy chủ). TRIAL luôn 1, FREE 0. */
  deviceKeys?: number;
  /** Giả lập hộ đóng băng: getHome báo DONG_BANG, mọi hàm ghi trả FROZEN cho tới khi household_reopen. */
  frozen?: boolean;
  /** D-76: người lớn đã đồng ý bản Điều khoản hiện hành từ đầu (mặc định false: phải gọi termsAccept trước familyCreate, như máy chủ). */
  termsAccepted?: boolean;
  /** Giả lập mã máy hoặc email đã dùng thử ở nơi khác: trialStart trả TRIAL_USED. */
  trialClaimed?: boolean;
  /** Số lần pair_pending trả pending=false trước khi có yêu cầu chờ (mặc định 1). */
  acceptAfter?: number;
  /** Độ trễ giả (ms) để thấy trạng thái đang xử lý. Test đặt 0. */
  latencyMs?: number;
  /** Vai của người lớn đăng nhập (mặc định PRIMARY = người quản lý chính). */
  role?: MemberRole;
  /** Máy con giả lập: ghi đè danh sách mục đích hiệu lực. */
  childConsent?: string[];
  /** Khi bố mẹ bật MD-CONBAO, tạo sẵn một báo mẫu của con (hai app giả lập không thấy nhau). Mặc định tắt. */
  demoAlert?: boolean;
  /** false: tạo con KHÔNG ghi đồng ý mặc định (D-73), để test các nhánh "chưa đồng ý" (con tạo trước D-73, hoặc máy chủ chưa có bản chính sách). Mặc định true. */
  defaultConsent?: boolean;
  now?: () => number;
};

function checkNote(kind: HealthKind, content: string, source: string | null) {
  if (!['DI_UNG', 'THUOC', 'KHAC'].includes(kind)) fail('VALIDATION', 'D-66', 'Loại ghi chú không hợp lệ.');
  if (content.trim().length < 1 || content.trim().length > 500) fail('VALIDATION', 'D-66', 'Nội dung từ 1 đến 500 ký tự.');
  if (source !== null && source.trim().length > 200) fail('VALIDATION', 'D-66', 'Nguồn từ 1 đến 200 ký tự.');
}

function fail(code: string, rule: string, hint: string): never {
  throw toApiError({ message: code, details: rule, hint });
}

/** Bản giả lập kèm móc cho test: đổi trạng thái hộ như job đóng băng của máy chủ. */
export type MockApi = Api & { setHouseholdState(s: HouseholdState): void; /** D-76: đổi phiên bản Điều khoản hiện hành; mọi người dùng phải đồng ý lại. */ setTermsVersion(v: string): void };

export function createMockApi(opts: MockOptions = {}): MockApi {
  const now = opts.now ?? (() => Date.now());
  const latency = opts.latencyMs ?? 250;
  const acceptAfter = opts.acceptAfter ?? 1;
  let plan: PlanTier = opts.plan ?? MOCK_DEFAULT_PLAN;
  let trialUsed = plan !== 'FREE'; // đã từng TRIAL hoặc PREMIUM
  let trialEndsAt: string | null = null; // chỉ có khi dùng thử bắt đầu bằng trialStart
  /** D-74: khóa ghép máy theo gói. */
  const keys = (): number => (plan === 'TRIAL' ? MOCK_TRIAL_DEVICE_KEYS : plan === 'PREMIUM' ? (opts.deviceKeys ?? 1) : 0);

  let termsVersion = MOCK_TERMS_VERSION;
  let termsOk = opts.termsAccepted === true;
  let session: SessionInfo | null = null;
  const listeners = new Set<(s: SessionInfo | null) => void>();
  let pendingEmail: string | null = null;
  let household: { id: string; memberCallName: string } | null = null;
  let hhState: HouseholdState = opts.frozen ? 'DONG_BANG' : 'HOAT_DONG';
  const role: MemberRole = opts.role ?? 'PRIMARY';
  const children: Child[] = [];
  const hidden = new Set<string>();
  const consent = new Map<string, Map<string, { state: PurposeStatus; activeSince: string | null }>>();
  const consentKeys = new Map<string, { child: string; code: string; event: string }>();
  const selfLast = new Map<string, string>();
  const notes = new Map<string, HealthNote[]>();
  const alerts: (ChildAlert & { key: string | null })[] = [];
  const childConsented = new Set<string>();
  const aiChat = new Map<string, boolean>(); // cài đặt ai_chat_enabled từng con, mặc định tắt (D-73)
  let pairedChildId: string | null = null;
  const deletions: OpenDeletion[] = [];
  const withdrawTokens = new Map<string, { token: string; expiresAt: number }>();
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
    if (hhState === 'DONG_BANG') fail('FROZEN', 'BR-FAM-FROZEN', 'Gia đình đang tạm dừng app.');
  };
  const visible = () => children.filter((c) => !hidden.has(c.id));
  /** Khóa đã dùng: máy đang ghép + yêu cầu đang chờ máy con xác nhận (trừ con đang ghép lại: yêu cầu chờ cũ của chính con đó bị thay). */
  const keysUsed = (exceptChild?: string): number => visible().filter((c) => c.id !== exceptChild && (c.pairState === 'PENDING' || c.pairState === 'PAIRED')).length;
  const visibleChild = (childId: string): Child => {
    const c = visible().find((x) => x.id === childId);
    if (!c) fail('NOT_FOUND', 'CHILD', 'Không tìm thấy hồ sơ con.');
    return c;
  };
  const states = (childId: string) => {
    let m = consent.get(childId);
    if (!m) consent.set(childId, (m = new Map()));
    return m;
  };
  /** Mục hiệu lực của con (D-64): tự bật, được thu, và mục lõi cũng bật. */
  const effective = (childId: string, code: string) =>
    effectiveCodes({ purposes: MOCK_PURPOSES, states: Object.fromEntries(states(childId)) }).includes(code);
  const asKid = (): { childId: string; epoch: number } => {
    const me = needLogin();
    if (!me.isAnonymous) fail('FORBIDDEN', 'D-67', 'Chỉ máy của con làm được việc này.');
    if (!bound) fail('NOT_FOUND', 'D-67', 'Máy này chưa ghép.');
    return bound;
  };
  const noKid = () => {
    if (session?.isAnonymous) fail('FORBIDDEN', 'BR-CON-020', 'Máy của con không làm được việc này.');
  };
  const primaryOnly = (msg: string) => {
    if (role !== 'PRIMARY') fail('FORBIDDEN', 'BR-CON-053', msg);
  };
  const id = (p: string) => `${p}-${++seq}`;

  const api: MockApi = {
    kind: 'mock',
    setTermsVersion(v) {
      if (v !== termsVersion) termsOk = false;
      termsVersion = v;
    },

    setHouseholdState(st) {
      hhState = st;
    },
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
      return {
        householdId: household.id,
        memberCallName: household.memberCallName,
        role,
        householdState: hhState,
        children: visible().map((c) => ({
          ...c,
          coreConsent: states(c.id).get(PURPOSE_LICH)?.state === 'DANG_BAT',
          healthConsent: states(c.id).get(PURPOSE_SUCKHOE)?.state === 'DANG_BAT',
          alertConsent: states(c.id).get(PURPOSE_CONBAO)?.state === 'DANG_BAT',
        })),
        openDeletions: deletions.map((d) => ({ ...d })),
      };
    },

    async termsStatus() {
      needLogin();
      await pause();
      return { currentVersion: termsVersion, accepted: termsOk };
    },

    async termsAccept(version) {
      needLogin();
      await pause();
      if (version !== termsVersion) fail('VALIDATION', 'D-76.version', 'Điều khoản đã đổi, hãy mở lại và đọc bản mới.');
      const replay = termsOk;
      termsOk = true;
      return { version: termsVersion, replay };
    },

    async familyCreate(callName) {
      writable();
      await pause();
      if (!household && !termsOk) fail('TERMS_REQUIRED', 'D-76', 'Bạn cần đồng ý Điều khoản sử dụng trước khi tạo gia đình.');
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
      children.push({ id: childId, callName: name, grade, ageYears: age, hasDevice: input.hasDevice, pairState: 'NONE', coreConsent: opts.defaultConsent !== false, healthConsent: opts.defaultConsent !== false, alertConsent: opts.defaultConsent !== false });
      if (input.idempotencyKey) seenKeys.set(input.idempotencyKey, childId);
      // D-73: máy chủ ghi đồng ý mặc định (lõi + hai mục riêng) cùng lúc tạo con.
      const m = states(childId);
      if (opts.defaultConsent !== false) for (const code of [PURPOSE_LICH, PURPOSE_SUCKHOE, PURPOSE_CONBAO]) m.set(code, { state: 'DANG_BAT', activeSince: new Date(now()).toISOString() });
      if (opts.defaultConsent !== false && opts.demoAlert) alerts.push({ id: id('alert'), childId, kind: 'KHONG_KHOE', createdAt: new Date(now() - 5 * 60_000).toISOString(), seenAt: null, key: null });
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
        deviceKeys: keys(),
        deviceKeysUsed: keysUsed(),
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

    async myFamilyState(): Promise<MyFamilyState> {
      needLogin();
      await pause();
      return { frozen: hhState === 'DONG_BANG', planActive: keys() > 0 };
    },

    async pairConfirm(childId, code, pinIn): Promise<PairConfirmResult> {
      writable();
      await pause();
      const child = visibleChild(childId);
      if (plan === 'FREE') fail('PLAN_REQUIRED', 'D-68.premium', 'Cần gói dùng thử hoặc Premium để ghép máy của con.');
      if (keysUsed(childId) >= keys()) fail('DEVICE_KEY_LIMIT', 'D-74.keys', `Gói hiện tại ghép được tối đa ${keys()} máy của con và đã dùng hết khóa ghép máy. Hãy hủy liên kết một máy hoặc nâng cấp gói để ghép thêm.`);
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
      pairedChildId = childId;
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

    async getConsentOverview(childId): Promise<ConsentOverview> {
      needLogin();
      await pause();
      visibleChild(childId);
      const st: ConsentOverview['states'] = {};
      for (const [code, v] of states(childId)) st[code] = { ...v };
      return { purposes: MOCK_PURPOSES.map((p) => ({ ...p })), states: st };
    },

    async consentRecord(input) {
      if (input.event === 'RUT') needLogin(); // rút luôn được, kể cả khi đóng băng (D-64)
      else writable();
      await pause();
      noKid();
      const { childId, purposeCode: code, event } = input;
      visibleChild(childId);
      if (event !== 'DONG_Y' && event !== 'RUT') fail('VALIDATION', 'BR-CON-002', 'Sự kiện không hợp lệ.');
      if (role !== 'PRIMARY' && !input.forSelf) fail('FORBIDDEN', 'BR-CON-053', 'Chỉ người quản lý chính ghi đồng ý theo con.');
      const p = MOCK_PURPOSES.find((x) => x.code === code);
      if (!p) fail('VALIDATION', 'BR-CON-001', 'Mục đích không có trong danh mục.');
      if (event === 'DONG_Y' && !p.collectEnabled) fail('FEATURE_OFF', 'C-07', 'Mục này chưa mở ở bản thử.');
      if (event === 'RUT' && !input.forSelf && p.kind === 'LOI') {
        fail('VALIDATION', 'BR-CON-026', 'Rút mục lõi nghĩa là rút toàn bộ. Hãy dùng chức năng rút toàn bộ.');
      }
      if (input.idempotencyKey) {
        const old = consentKeys.get(input.idempotencyKey);
        if (old) {
          if (old.child === childId && old.code === code && old.event === event) return { changed: false, replay: true, effective: effective(childId, code) };
          fail('VALIDATION', 'idempotency', 'Khóa gửi lại không hợp lệ.');
        }
        consentKeys.set(input.idempotencyKey, { child: childId, code, event });
      }
      if (input.forSelf) {
        const k = `${childId}|${code}`;
        const changed = selfLast.get(k) !== event;
        selfLast.set(k, event);
        return { changed, replay: false, effective: false };
      }
      const m = states(childId);
      const cur = m.get(code)?.state;
      if ((event === 'DONG_Y' && cur === 'DANG_BAT') || (event === 'RUT' && cur !== 'DANG_BAT')) return { changed: false, replay: false, effective: effective(childId, code) };
      if (event === 'DONG_Y') {
        m.set(code, { state: 'DANG_BAT', activeSince: new Date(now()).toISOString() });
        if (code === PURPOSE_CONBAO && opts.demoAlert) {
          alerts.push({ id: id('alert'), childId, kind: 'KHONG_KHOE', createdAt: new Date(now() - 5 * 60_000).toISOString(), seenAt: null, key: null });
        }
        return { changed: true, replay: false, effective: effective(childId, code) };
      }
      m.set(code, { state: 'DA_RUT', activeSince: null });
      if (code === PURPOSE_SUCKHOE) notes.delete(childId); // máy chủ: ẩn ngay và xếp hàng xóa; đồng ý lại không hiện lại cái cũ
      if (code === PURPOSE_CONBAO) for (let i = alerts.length - 1; i >= 0; i--) if (alerts[i].childId === childId) alerts.splice(i, 1);
      return { changed: true, replay: false, effective: false };
    },

    async childSettingGet(childId) {
      needLogin();
      await pause();
      noKid();
      visibleChild(childId);
      return { aiChatEnabled: aiChat.get(childId) === true };
    },

    async childSettingSet(childId, key, value) {
      if (value) writable();
      else needLogin(); // tắt = thu hẹp, luôn được
      await pause();
      noKid();
      visibleChild(childId);
      primaryOnly('Chỉ người quản lý chính đổi cài đặt này.');
      if (key !== 'ai_chat_enabled') fail('VALIDATION', 'BR-CON-034', 'Cài đặt không hợp lệ.');
      aiChat.set(childId, value);
      return { aiChatEnabled: value };
    },

    async withdrawAllStart(childId) {
      needLogin(); // rút luôn được, kể cả khi đóng băng (D-64)
      await pause();
      noKid();
      primaryOnly('Chỉ người quản lý chính rút đồng ý toàn bộ.');
      const child = visibleChild(childId);
      const codes = [...states(childId)].filter(([, v]) => v.state === 'DANG_BAT').map(([c]) => c).sort();
      const token = id('tok');
      withdrawTokens.set(childId, { token, expiresAt: now() + MOCK_WITHDRAW_TTL_MINUTES * 60_000 });
      return {
        confirmToken: token,
        expiresAt: new Date(now() + MOCK_WITHDRAW_TTL_MINUTES * 60_000).toISOString(),
        consequences: {
          purposesWithdrawn: codes,
          childHidden: true,
          deviceUnlinked: child.pairState !== 'NONE',
          deletionRequest: true,
          hardDeletedNow: false,
          canReconsent: false,
        },
      };
    },

    async withdrawAllConfirm(childId, confirmToken) {
      needLogin();
      await pause();
      noKid();
      primaryOnly('Chỉ người quản lý chính rút đồng ý toàn bộ.');
      const done = deletions.find((d) => d.childId === childId && d.scope === 'HO_SO_CON');
      if (done) return { replay: true, deletionRequestId: done.id, acceptedAt: done.acceptedAt, state: done.state, hardDeleted: false };
      visibleChild(childId);
      const t = withdrawTokens.get(childId);
      if (!t || t.token !== confirmToken || t.expiresAt <= now()) fail('VALIDATION', 'D-42', 'Cần xác nhận lại từ bước đầu.');
      withdrawTokens.delete(childId);
      const m = states(childId);
      for (const [c, v] of m) if (v.state === 'DANG_BAT') m.set(c, { state: 'DA_RUT', activeSince: null });
      hidden.add(childId);
      const d: OpenDeletion = { id: id('del'), scope: 'HO_SO_CON', childId, acceptedAt: new Date(now()).toISOString(), state: 'CHO_QUYET_HAN' };
      deletions.push(d);
      return { replay: false, deletionRequestId: d.id, acceptedAt: d.acceptedAt, state: d.state, hardDeleted: false };
    },

    async householdReopen(confirm) {
      needLogin();
      await pause();
      noKid();
      if (!household) fail('FORBIDDEN', 'BR-FAM-057', 'Bạn chưa thuộc gia đình nào.');
      if (role !== 'PRIMARY') fail('FORBIDDEN', 'BR-FAM-057', 'Chỉ người quản lý chính mở lại được. Bạn có thể nhắc người quản lý chính.');
      if (hhState === 'HOAT_DONG') return { changed: false };
      if (hhState !== 'DONG_BANG') fail('VALIDATION', 'BR-CON-086', 'Gia đình này không mở lại được.');
      if (confirm !== true) fail('VALIDATION', 'BR-FAM-057', 'Cần xác nhận rõ ràng để mở lại.');
      hhState = 'HOAT_DONG';
      return { changed: true };
    },

    async deletionRequest(scope, childId): Promise<DeletionResult> {
      needLogin();
      await pause();
      noKid();
      if (!household) fail('NOT_FOUND', '', '');
      if (!['HO_SO_CON', 'NGUOI_LON_ROI', 'GIA_DINH'].includes(scope)) fail('VALIDATION', 'BR-FAM-085', 'Phạm vi yêu cầu xóa không hợp lệ.');
      const same = (d: OpenDeletion) => d.scope === scope && (scope !== 'HO_SO_CON' || d.childId === childId);
      const replayOf = (d: OpenDeletion): DeletionResult => ({ replay: true, scope: d.scope, deletionRequestId: d.id, acceptedAt: d.acceptedAt, state: d.state, hardDeleted: false });
      if (scope === 'NGUOI_LON_ROI') {
        const d = deletions.find(same);
        if (d) return replayOf(d);
        if (role === 'PRIMARY') fail('VALIDATION', 'BR-FAM-016', 'Người quản lý chính chưa rời được: hãy chuyển quyền hoặc xóa gia đình.');
      } else {
        primaryOnly('Chỉ người quản lý chính gửi được yêu cầu này.');
        if (scope === 'HO_SO_CON') {
          if (!childId) fail('VALIDATION', 'BR-FAM-080', 'Cần chọn hồ sơ con.');
          if (!children.some((c) => c.id === childId)) fail('NOT_FOUND', '', '');
        }
        const d = deletions.find(same);
        if (d) return replayOf(d);
      }
      if (hhState !== 'HOAT_DONG' && hhState !== 'DONG_BANG') fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng, chưa thay đổi được.'); // đóng băng vẫn gửi được (D-64)
      const rec: OpenDeletion = { id: id('del'), scope, childId: scope === 'HO_SO_CON' ? (childId ?? null) : null, acceptedAt: new Date(now()).toISOString(), state: 'CHO_QUYET_HAN' };
      deletions.push(rec);
      if (scope === 'HO_SO_CON' && childId) hidden.add(childId);
      if (scope === 'GIA_DINH') {
        for (const c of children) hidden.add(c.id);
        hhState = 'CHO_XOA';
      }
      if (scope === 'NGUOI_LON_ROI') household = null;
      return { replay: false, scope, deletionRequestId: rec.id, acceptedAt: rec.acceptedAt, state: rec.state, hardDeleted: false };
    },

    async exportRequest(scope) {
      needLogin();
      await pause();
      noKid();
      primaryOnly('Chỉ người quản lý chính yêu cầu xuất dữ liệu của gia đình.');
      if (scope !== 'GIA_DINH' && scope !== 'HO_SO_CON') fail('VALIDATION', 'BR-CON-060', 'Phạm vi xuất không hợp lệ.');
      fail('BLOCKED_H4', 'BR-CON-056', 'Xuất dữ liệu chưa mở ở bản thử.');
    },

    async getMyConsent(childId) {
      needLogin();
      await pause();
      if (opts.childConsent) return [...opts.childConsent];
      const m = consent.get(childId);
      if (!m) return [...MOCK_CHILD_DEFAULT_CONSENT];
      return effectiveCodes({ purposes: MOCK_PURPOSES, states: Object.fromEntries(m) });
    },

    async getFamilyState() {
      needLogin();
      return hhState === 'DONG_BANG' ? 'FROZEN' : 'ACTIVE';
    },

    async childConsentRecord() {
      const b = asKid();
      await pause();
      if (hhState === 'DONG_BANG') fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng app.');
      if (consent.has(b.childId) && !effective(b.childId, PURPOSE_LICH)) fail('FORBIDDEN', 'BR-CON-001', 'Bố mẹ chưa đồng ý phần cốt lõi.');
      const changed = !childConsented.has(b.childId);
      childConsented.add(b.childId);
      return { changed, consentedAt: new Date(now()).toISOString() };
    },

    async childAlertSend(kind: AlertKind, idempotencyKey, bindingEpoch) {
      const b = asKid();
      await pause();
      if (bindingEpoch !== undefined && bindingEpoch !== b.epoch) fail('CONFLICT_REV', 'D-67', 'Máy này không còn là máy đã ghép.');
      if (hhState === 'DONG_BANG') fail('FROZEN', 'BR-FAM-054', 'Gia đình đang tạm dừng app.');
      if (!['KHONG_KHOE', 'DON_SOM', 'GOI_BO_ME'].includes(kind)) fail('VALIDATION', 'D-67', 'Chỉ chọn câu có sẵn.');
      if (idempotencyKey) {
        const old = alerts.find((a) => a.key === idempotencyKey);
        if (old) return { id: old.id, replay: true, createdAt: old.createdAt };
      }
      const codes = opts.childConsent ?? (consent.has(b.childId) ? effectiveCodes({ purposes: MOCK_PURPOSES, states: Object.fromEntries(states(b.childId)) }) : MOCK_CHILD_DEFAULT_CONSENT);
      if (!codes.includes(PURPOSE_CONBAO)) fail('FORBIDDEN', 'D-67', 'Bố mẹ chưa bật tính năng này.');
      const t = now();
      if (alerts.filter((a) => a.childId === b.childId && a.key !== null && Date.parse(a.createdAt) > t - 3_600_000).length >= MOCK_ALERT_MAX_PER_HOUR) {
        fail('RATE_LIMITED', 'D-67', 'Đã báo nhiều lần, hãy chờ một lúc.');
      }
      const a = { id: id('alert'), childId: b.childId, kind, createdAt: new Date(t).toISOString(), seenAt: null, key: idempotencyKey ?? `auto-${seq}` };
      alerts.push(a);
      return { id: a.id, replay: false, createdAt: a.createdAt };
    },

    async listHealthNotes(childId) {
      needLogin();
      await pause();
      visibleChild(childId);
      if (!effective(childId, PURPOSE_SUCKHOE)) return [];
      return (notes.get(childId) ?? []).map((n) => ({ ...n }));
    },

    async healthNoteAdd(input) {
      writable();
      await pause();
      noKid();
      primaryOnly('Chỉ người quản lý chính ghi thông tin sức khỏe.');
      visibleChild(input.childId);
      checkNote(input.kind, input.content, input.sourceNote ?? null);
      if (input.declaredAt && input.declaredAt > new Date(now()).toISOString().slice(0, 10)) fail('VALIDATION', 'D-66', 'Ngày khai không ở tương lai.');
      if (!effective(input.childId, PURPOSE_SUCKHOE)) fail('FORBIDDEN', 'D-66', 'Cần đồng ý riêng cho thông tin sức khỏe trước.');
      const list = notes.get(input.childId) ?? [];
      if (list.length >= 50) fail('VALIDATION', 'D-66', 'Mỗi con tối đa 50 ghi chú sức khỏe.');
      const n: HealthNote = {
        id: id('note'),
        childId: input.childId,
        kind: input.kind,
        content: input.content.trim(),
        declaredByName: household?.memberCallName ?? null,
        declaredByRole: role,
        declaredAt: input.declaredAt ?? new Date(now() + 7 * 3_600_000).toISOString().slice(0, 10),
        sourceNote: input.sourceNote?.trim() ? input.sourceNote.trim() : null,
        active: true,
      };
      notes.set(input.childId, [...list, n]);
      return { ...n };
    },

    async healthNoteUpdate(noteId, patch) {
      const found = [...notes.values()].flat().find((n) => n.id === noteId);
      const narrow = Object.keys(patch).length === 1 && patch.active === false;
      if (narrow) needLogin();
      else writable();
      await pause();
      noKid();
      primaryOnly('Chỉ người quản lý chính sửa thông tin sức khỏe.');
      if (Object.keys(patch).length === 0) fail('VALIDATION', 'D-66', 'Không có gì để sửa.');
      if (!found) fail('NOT_FOUND', '', '');
      if (!narrow && !effective(found.childId, PURPOSE_SUCKHOE)) fail('FORBIDDEN', 'D-66', 'Cần đồng ý riêng cho thông tin sức khỏe trước.');
      checkNote(patch.kind ?? found.kind, patch.content ?? found.content, patch.sourceNote === undefined ? found.sourceNote : patch.sourceNote);
      if (patch.kind !== undefined) found.kind = patch.kind;
      if (patch.content !== undefined) found.content = patch.content.trim();
      if (patch.sourceNote !== undefined) found.sourceNote = patch.sourceNote && patch.sourceNote.trim() ? patch.sourceNote.trim() : null;
      if (patch.declaredAt !== undefined) found.declaredAt = patch.declaredAt;
      if (patch.active !== undefined) found.active = patch.active;
      return { ...found };
    },

    async healthNoteDelete(noteId) {
      needLogin(); // thu hẹp: luôn được, kể cả đóng băng
      await pause();
      noKid();
      primaryOnly('Chỉ người quản lý chính xóa thông tin sức khỏe.');
      for (const [cid, list] of notes) {
        if (list.some((n) => n.id === noteId)) {
          notes.set(cid, list.filter((n) => n.id !== noteId));
          return;
        }
      }
      fail('NOT_FOUND', '', '');
    },

    async listChildAlerts() {
      needLogin();
      await pause();
      noKid();
      const cutoff = now() - MOCK_ALERT_RETENTION_DAYS * 86_400_000;
      const ok = new Set(visible().filter((c) => effective(c.id, PURPOSE_CONBAO)).map((c) => c.id));
      return alerts
        .filter((a) => ok.has(a.childId) && Date.parse(a.createdAt) > cutoff)
        .map(({ key: _k, ...a }) => ({ ...a }))
        .sort((x, y) => Date.parse(y.createdAt) - Date.parse(x.createdAt));
    },

    async childAlertSeen(alertId) {
      writable();
      await pause();
      noKid();
      const a = alerts.find((x) => x.id === alertId);
      if (!a) fail('NOT_FOUND', '', '');
      if (a.seenAt === null) a.seenAt = new Date(now()).toISOString();
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
      bound = { childId: pairedChildId ?? 'mock-child-1', epoch: epochSeq };
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
  return api;
}
