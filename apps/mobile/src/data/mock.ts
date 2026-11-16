// Bản giả lập của lớp Api, chạy trong bộ nhớ, để dựng và thử giao diện khi chưa có backend.
// Bật bằng EXPO_PUBLIC_API_MOCK=1. Dữ liệu mất khi đóng app. Chỉ dùng tên giả.
//
// Quy ước của bản giả lập (khác thật ở chỗ hai app là hai tiến trình riêng nên không thấy nhau):
//  - Mã OTP đúng luôn là 123456. Link thư giả lập: <scheme>://auth-callback?code=mock-link.
//  - Parent App: mã ghép đúng luôn là 123456. Lần ghép đầu phải kèm PIN (như pair_confirm thật); mã sai thì ném NOT_FOUND
//    (thật: ok=false) và 5 lần sai liên tiếp thì RATE_LIMITED.
//  - Child App: pair_pending trả pending=false `acceptAfter` lần đầu, rồi pending=true ("Kết nối với chị Lan?", giả vờ bố mẹ
//    vừa nhập mã); pair_accept chỉ đúng khi đang pending. PIN hủy kết nối: PIN đã đặt, mặc định MOCK_DEFAULT_PIN (482915; 123456 bị máy chủ từ chối vì dễ đoán).
//  - Đồng ý (T2.1, T2.2, T2.3): phản chiếu quy tắc của consent_record, consent_withdraw_all (hai bước, mã hạn 10 phút), household_reopen,
//    deletion_request, export_request (luôn BLOCKED_H4). MD-CONBAO chưa mở (FEATURE_OFF). Máy con giả lập có sẵn danh sách mục đích hiệu lực
//    (MOCK_CHILD_DEFAULT_CONSENT) vì hai app là hai tiến trình riêng.
import { dependentsOf, effectiveCodes } from './consent.ts';
import { apiErrorFromFailure, toApiError } from './errors.ts';
import type {
  Api,
  Binding,
  Child,
  ChildInput,
  ConsentOverview,
  DeletionResult,
  DeletionScope,
  Home,
  HouseholdState,
  MemberRole,
  OpenDeletion,
  PairCode,
  PairConfirmResult,
  PairPending,
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
/** Danh mục mục đích như migration T1.1 và T2.1 (tên và phụ thuộc giữ nguyên). */
export const MOCK_PURPOSES: Purpose[] = [
  { code: 'MD-LICH', nameVi: 'Lập và xem lịch cho con', dependsOn: [], kind: 'LOI', collectEnabled: true },
  { code: 'MD-DONGBO', nameVi: 'Đồng bộ lịch sang máy của con và nhắc giờ', dependsOn: ['MD-LICH'], kind: 'TUY_CHON', collectEnabled: true },
  { code: 'MD-XONG', nameVi: 'Ghi con đã bấm Xong và giờ', dependsOn: ['MD-DONGBO'], kind: 'TUY_CHON', collectEnabled: true },
  { code: 'MD-MET', nameVi: 'Hỏi thăm sau giờ học và xu hướng mệt', dependsOn: ['MD-DONGBO'], kind: 'TUY_CHON', collectEnabled: true },
  { code: 'MD-MONGMUON', nameVi: 'Con gửi mong muốn hoặc đề xuất cho bố mẹ', dependsOn: ['MD-DONGBO'], kind: 'TUY_CHON', collectEnabled: true },
  { code: 'MD-BAOCAO', nameVi: 'Báo cáo tuần cho bố mẹ', dependsOn: ['MD-XONG'], kind: 'TUY_CHON', collectEnabled: true },
  { code: 'MD-SUCKHOE', nameVi: 'Thông tin sức khỏe của con (dị ứng, thuốc)', dependsOn: ['MD-LICH'], kind: 'TUY_CHON', collectEnabled: false },
  { code: 'MD-CONBAO', nameVi: 'Con báo trực tiếp cho bố mẹ (không khỏe, nghỉ học sớm, nhờ đón)', dependsOn: ['MD-DONGBO'], kind: 'TUY_CHON', collectEnabled: false },
];
/** Máy con giả lập: các mục bố mẹ coi như đã bật (CA-16 dựng từ đây). */
export const MOCK_CHILD_DEFAULT_CONSENT = ['MD-LICH', 'MD-DONGBO', 'MD-XONG', 'MD-MET', 'MD-MONGMUON', 'MD-BAOCAO'];

export type MockOptions = {
  /** Giả lập hộ đóng băng: getHome báo DONG_BANG, mọi hàm ghi trả FROZEN cho tới khi household_reopen. */
  frozen?: boolean;
  /** Số lần pair_pending trả pending=false trước khi có yêu cầu chờ (mặc định 1). */
  acceptAfter?: number;
  /** Độ trễ giả (ms) để thấy trạng thái đang xử lý. Test đặt 0. */
  latencyMs?: number;
  /** Vai của người lớn đăng nhập (mặc định PRIMARY = người quản lý chính). */
  role?: MemberRole;
  /** Máy con giả lập: ghi đè danh sách mục đích hiệu lực. */
  childConsent?: string[];
  now?: () => number;
};

function fail(code: string, rule: string, hint: string): never {
  throw toApiError({ message: code, details: rule, hint });
}

/** Bản giả lập kèm móc cho test: đổi trạng thái hộ như job đóng băng của máy chủ. */
export type MockApi = Api & { setHouseholdState(s: HouseholdState): void };

export function createMockApi(opts: MockOptions = {}): MockApi {
  const now = opts.now ?? (() => Date.now());
  const latency = opts.latencyMs ?? 250;
  const acceptAfter = opts.acceptAfter ?? 1;

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
  const noKid = () => {
    if (session?.isAnonymous) fail('FORBIDDEN', 'BR-CON-020', 'Máy của con không làm được việc này.');
  };
  const primaryOnly = (msg: string) => {
    if (role !== 'PRIMARY') fail('FORBIDDEN', 'BR-CON-053', msg);
  };
  const id = (p: string) => `${p}-${++seq}`;

  const api: MockApi = {
    kind: 'mock',
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
        children: visible().map((c) => ({ ...c, coreConsent: states(c.id).get('MD-LICH')?.state === 'DANG_BAT' })),
        openDeletions: deletions.map((d) => ({ ...d })),
      };
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
      children.push({ id: childId, callName: name, grade, ageYears: age, hasDevice: input.hasDevice, pairState: 'NONE', coreConsent: false });
      if (input.idempotencyKey) seenKeys.set(input.idempotencyKey, childId);
      return { childId };
    },

    async pairConfirm(childId, code, pinIn): Promise<PairConfirmResult> {
      writable();
      await pause();
      const child = visibleChild(childId);
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

    async getConsentOverview(childId): Promise<ConsentOverview> {
      needLogin();
      await pause();
      visibleChild(childId);
      const st: ConsentOverview['states'] = {};
      for (const [code, v] of states(childId)) st[code] = { ...v };
      return { purposes: MOCK_PURPOSES.map((p) => ({ ...p, dependsOn: [...p.dependsOn] })), states: st };
    },

    async consentRecord(input) {
      writable();
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
          if (old.child === childId && old.code === code && old.event === event) return { changed: false, replay: true, alsoWithdrawn: [] };
          fail('VALIDATION', 'idempotency', 'Khóa gửi lại không hợp lệ.');
        }
        consentKeys.set(input.idempotencyKey, { child: childId, code, event });
      }
      if (input.forSelf) {
        const k = `${childId}|${code}`;
        const changed = selfLast.get(k) !== event;
        selfLast.set(k, event);
        return { changed, replay: false, alsoWithdrawn: [] };
      }
      const m = states(childId);
      const cur = m.get(code)?.state;
      if ((event === 'DONG_Y' && cur === 'DANG_BAT') || (event === 'RUT' && cur !== 'DANG_BAT')) return { changed: false, replay: false, alsoWithdrawn: [] };
      if (event === 'DONG_Y') {
        m.set(code, { state: 'DANG_BAT', activeSince: new Date(now()).toISOString() });
        return { changed: true, replay: false, alsoWithdrawn: [] };
      }
      m.set(code, { state: 'DA_RUT', activeSince: null });
      const also = dependentsOf(MOCK_PURPOSES, code).filter((d) => m.get(d)?.state === 'DANG_BAT');
      for (const d of also) m.set(d, { state: 'DA_RUT', activeSince: null });
      return { changed: true, replay: false, alsoWithdrawn: also };
    },

    async withdrawAllStart(childId) {
      writable();
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
      writable();
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
      writable();
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
  return api;
}
