// Lớp gọi máy chủ Supabase: RPC schema `app` + Supabase Auth. Mọi lỗi ra ngoài là ApiError (tiếng Việt).
// Tên hàm và tham số khớp migration ở backend/supabase/migrations (test/contract.test.ts kiểm lại mỗi lần chạy test).
// Hàm có đường thất bại cần đếm trả HTTP 200 {"ok": false, ...}: dùng rpcOk, không bao giờ coi thiếu "ok" là thành công.
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { effectiveCodes, PURPOSE_LICH } from './consent.ts';
import { ApiError, FALLBACK_MESSAGES, apiErrorFromFailure, toApiError } from './errors.ts';
import type {
  Api,
  Binding,
  Child,
  ChildInput,
  ConsentOverview,
  DeletionScope,
  HouseholdState,
  Home,
  MemberRole,
  OpenDeletion,
  PairCode,
  PairConfirmState,
  PairState,
  Purpose,
  PurposeStatus,
  SessionInfo,
} from './types.ts';

/** Cột mà client đọc từ mỗi bảng schema app. test/contract.test.ts kiểm từng cột có trong migration. */
export const TABLE_READS = {
  members: 'household_id, call_name, role',
  households: 'id, state, frozen_at',
  children: 'id, call_name, grade, age_years, has_device',
  device_bindings: 'child_id, state',
  device_bindings_mine: 'child_id, epoch',
  purposes: 'code, name_vi, depends_on, kind, collect_enabled',
  purpose_state: 'child_id, purpose_code, state, active_since',
  deletion_requests: 'id, scope, child_id, accepted_at, state',
} as const;
const cols = (k: keyof typeof TABLE_READS) => TABLE_READS[k];
const HOUSEHOLD_STATES: readonly string[] = ['HOAT_DONG', 'DONG_BANG', 'CHO_XOA', 'DA_XOA'];
const ROLES: readonly string[] = ['PRIMARY', 'SUPPORTER', 'OBSERVER'];
const SCOPES: readonly string[] = ['HO_SO_CON', 'GIA_DINH', 'NGUOI_LON_ROI'];

// touch_active_min_interval_minutes = 60 (private.params, chưa chốt): máy chủ bỏ qua lần gọi sớm hơn, client không gọi thừa.
const TOUCH_MIN_INTERVAL_MS = 60 * 60 * 1000;

function toSessionInfo(s: Session | null | undefined): SessionInfo | null {
  if (!s) return null;
  return { userId: s.user.id, email: s.user.email ?? null, isAnonymous: s.user.is_anonymous === true };
}

type Obj = Record<string, unknown>;
const asObj = (v: unknown): Obj => (typeof v === 'object' && v !== null ? (v as Obj) : {});
const asStr = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);
const asInt = (v: unknown): number | null => (typeof v === 'number' && Number.isInteger(v) ? v : null);

export function createSupabaseApi(client: SupabaseClient, now: () => number = () => Date.now()): Api {
  const db = () => client.schema('app');
  let lastTouch: number | null = null;

  async function rpc(fn: string, args: Obj | undefined): Promise<unknown> {
    let res: { data: unknown; error: unknown };
    try {
      res = await db().rpc(fn, args);
    } catch (e) {
      throw toApiError(e);
    }
    if (res.error) throw toApiError(res.error);
    return res.data;
  }

  /** RPC có "ok": ok=true trả nguyên đối tượng; ok=false ném lỗi trong payload; thiếu ok là phản hồi sai hợp đồng (từ chối). */
  async function rpcOk(fn: string, args: Obj | undefined): Promise<Obj> {
    const o = asObj(await rpc(fn, args));
    if (o.ok === true) return o;
    if (o.ok === false) throw apiErrorFromFailure(o, now());
    throw new ApiError('UNKNOWN', FALLBACK_MESSAGES.UNKNOWN);
  }

  async function authCall<R extends { data: unknown; error: unknown }>(run: () => PromiseLike<R>): Promise<R['data']> {
    let res: R;
    try {
      res = await run();
    } catch (e) {
      throw toApiError(e);
    }
    if (res.error) throw toApiError(res.error);
    return res.data;
  }

  async function readOverview(childId: string): Promise<ConsentOverview> {
    const ps = await db().from('purposes').select(cols('purposes'));
    if (ps.error) throw toApiError(ps.error);
    const purposes: Purpose[] = (ps.data ?? []).flatMap((row): Purpose[] => {
      const o = asObj(row);
      const code = asStr(o.code);
      if (!code) return [];
      return [
        {
          code,
          nameVi: String(o.name_vi ?? ''),
          dependsOn: Array.isArray(o.depends_on) ? o.depends_on.filter((x): x is string => typeof x === 'string') : [],
          kind: o.kind === 'LOI' ? 'LOI' : 'TUY_CHON',
          collectEnabled: o.collect_enabled === true, // thiếu thì coi là chưa mở
        },
      ];
    });
    const st = await db().from('purpose_state').select(cols('purpose_state')).eq('child_id', childId);
    if (st.error) throw toApiError(st.error);
    const states: ConsentOverview['states'] = {};
    for (const row of st.data ?? []) {
      const o = asObj(row);
      const code = asStr(o.purpose_code);
      if (!code) continue;
      const state: PurposeStatus = o.state === 'DANG_BAT' ? 'DANG_BAT' : o.state === 'DA_RUT' ? 'DA_RUT' : 'CHUA_HOI';
      states[code] = { state, activeSince: asStr(o.active_since) };
    }
    return { purposes, states };
  }

  function needSession(info: SessionInfo | null): SessionInfo {
    if (!info) throw toApiError({ message: 'UNAUTHENTICATED' });
    return info;
  }

  return {
    kind: 'supabase',
    auth: {
      async getSession() {
        const data = await authCall(() => client.auth.getSession());
        return toSessionInfo(data.session);
      },
      onChange(cb) {
        const { data } = client.auth.onAuthStateChange((_event, s) => cb(toSessionInfo(s)));
        return () => data.subscription.unsubscribe();
      },
      async sendEmailOtp(email, redirectTo) {
        // shouldCreateUser: true để người mới đăng ký bằng đúng luồng này (PA-01 gộp đăng ký và đăng nhập).
        await authCall(() => client.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true, ...(redirectTo ? { emailRedirectTo: redirectTo } : {}) } }));
      },
      async verifyEmailOtp(email, token) {
        lastTouch = null;
        const data = await authCall(() => client.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' }));
        return needSession(toSessionInfo(data.session));
      },
      async completeFromLink(link) {
        if (link.kind === 'error') {
          throw toApiError({ code: 'otp_expired', message: 'link' });
        }
        lastTouch = null;
        const data =
          link.kind === 'code'
            ? await authCall(() => client.auth.exchangeCodeForSession(link.code))
            : await authCall(() => client.auth.verifyOtp({ token_hash: link.tokenHash, type: link.type === 'magiclink' ? 'magiclink' : 'email' }));
        return needSession(toSessionInfo(data.session));
      },
      async signInAnonymously() {
        const data = await authCall(() => client.auth.signInAnonymously());
        return needSession(toSessionInfo(data.session));
      },
      async signOut() {
        lastTouch = null;
        await authCall(async () => ({ data: null, error: (await client.auth.signOut()).error }));
      },
    },

    async getHome(): Promise<Home> {
      const me = needSession(toSessionInfo((await authCall(() => client.auth.getSession())).session));
      const m = await db()
        .from('members')
        .select(cols('members'))
        .eq('user_id', me.userId)
        .eq('status', 'DA_THAM_GIA')
        .maybeSingle();
      if (m.error) throw toApiError(m.error);
      if (!m.data) return null;
      const householdId = String(asObj(m.data).household_id);
      const memberCallName = String(asObj(m.data).call_name ?? '');
      const rawRole = String(asObj(m.data).role ?? '');
      const role: MemberRole = ROLES.includes(rawRole) ? (rawRole as MemberRole) : 'OBSERVER'; // vai lạ: quyền thấp nhất

      // Hộ không đọc được (đã ẩn vì yêu cầu xóa) thì coi là đang chờ xóa; không đoán là hoạt động.
      const hh = await db().from('households').select(cols('households')).eq('id', householdId).maybeSingle();
      if (hh.error) throw toApiError(hh.error);
      const rawState = asStr(asObj(hh.data).state);
      const householdState: HouseholdState = !hh.data ? 'CHO_XOA' : rawState && HOUSEHOLD_STATES.includes(rawState) ? (rawState as HouseholdState) : 'DONG_BANG';

      const kids = await db()
        .from('children')
        .select(cols('children'))
        .eq('household_id', householdId)
        .is('hidden_at', null)
        .order('created_at', { ascending: true });
      if (kids.error) throw toApiError(kids.error);
      const binds = await db().from('device_bindings').select(cols('device_bindings')).in('state', ['HIEU_LUC', 'CHO_XAC_NHAN_MAY_CON']);
      if (binds.error) throw toApiError(binds.error);
      const stateOf = new Map<string, PairState>();
      for (const b of binds.data ?? []) {
        const o = asObj(b);
        stateOf.set(String(o.child_id), o.state === 'HIEU_LUC' ? 'PAIRED' : 'PENDING');
      }
      const childIds = (kids.data ?? []).map((row) => String(asObj(row).id));
      const lich = new Set<string>();
      if (childIds.length > 0) {
        const ps = await db().from('purpose_state').select(cols('purpose_state')).in('child_id', childIds).eq('purpose_code', PURPOSE_LICH).eq('state', 'DANG_BAT');
        if (ps.error) throw toApiError(ps.error);
        for (const r of ps.data ?? []) lich.add(String(asObj(r).child_id));
      }
      const dr = await db().from('deletion_requests').select(cols('deletion_requests')).eq('household_id', householdId).neq('state', 'DA_HUY');
      if (dr.error) throw toApiError(dr.error);
      const openDeletions: OpenDeletion[] = (dr.data ?? []).flatMap((row): OpenDeletion[] => {
        const o = asObj(row);
        const id = asStr(o.id);
        const scope = asStr(o.scope);
        if (!id || !scope || !SCOPES.includes(scope)) return [];
        return [{ id, scope: scope as DeletionScope, childId: asStr(o.child_id), acceptedAt: asStr(o.accepted_at), state: asStr(o.state) ?? 'CHO_QUYET_HAN' }];
      });
      const children: Child[] = (kids.data ?? []).map((row) => {
        const o = asObj(row);
        const cid = String(o.id);
        return {
          id: cid,
          callName: String(o.call_name ?? ''),
          grade: typeof o.grade === 'number' ? o.grade : null,
          ageYears: typeof o.age_years === 'number' ? o.age_years : null,
          hasDevice: o.has_device === true,
          pairState: stateOf.get(cid) ?? 'NONE',
          coreConsent: lich.has(cid),
        };
      });
      return { householdId, memberCallName, role, householdState, children, openDeletions };
    },

    async familyCreate(callName) {
      const o = asObj(await rpc('family_create', { p_call_name: callName.trim() }));
      const householdId = asStr(o.household_id);
      if (!householdId) throw toApiError(new Error('family_create: thiếu household_id'));
      return { householdId, replay: o.replay === true };
    },

    async touchActive() {
      const t = now();
      if (lastTouch !== null && t - lastTouch < TOUCH_MIN_INTERVAL_MS) return { touched: false };
      const o = asObj(await rpc('touch_active', undefined));
      lastTouch = t; // máy chủ bỏ qua (touched=false) cũng nghĩa là vừa có hoạt động gần đây: không hỏi lại trong giờ này
      return { touched: o.touched === true };
    },

    async childCreate(input: ChildInput) {
      const o = asObj(
        await rpc('child_create', {
          p_household: input.householdId,
          p_call_name: input.callName.trim(),
          p_grade: input.grade ?? null,
          p_age_years: input.ageYears ?? null,
          p_has_device: input.hasDevice,
          p_idempotency_key: input.idempotencyKey ?? null,
        }),
      );
      const childId = asStr(o.child_id);
      if (!childId) throw toApiError(new Error('child_create: thiếu child_id'));
      return { childId };
    },

    async pairConfirm(childId, code, pin) {
      // p_pin chỉ gửi khi có (lần ghép đầu); gửi null cũng được nhưng bỏ hẳn khóa cho rõ.
      const o = await rpcOk('pair_confirm', { p_child: childId, p_code: code.trim(), ...(pin !== undefined ? { p_pin: pin } : {}) });
      const state = o.state === 'CHO_XAC_MINH' ? 'CHO_XAC_MINH' : o.state === 'CHO_XAC_NHAN_MAY_CON' ? 'CHO_XAC_NHAN_MAY_CON' : null;
      if (!state) throw toApiError(new Error('pair_confirm: state lạ'));
      return { state: state as PairConfirmState, epoch: asInt(o.epoch) ?? 0, pinSet: o.pin_set === true };
    },

    async pinSet(pin) {
      await rpcOk('pin_set', { p_pin: pin });
    },

    getConsentOverview: (childId) => readOverview(childId),

    async consentRecord(input) {
      const o = await rpcOk('consent_record', {
        p_child: input.childId,
        p_purpose_code: input.purposeCode,
        p_event: input.event,
        p_idempotency_key: input.idempotencyKey ?? null,
        p_for_self: input.forSelf === true,
      });
      return {
        changed: o.changed === true,
        replay: o.replay === true,
        alsoWithdrawn: Array.isArray(o.also_withdrawn) ? o.also_withdrawn.filter((x): x is string => typeof x === 'string') : [],
      };
    },

    async withdrawAllStart(childId) {
      const o = await rpcOk('consent_withdraw_all', { p_child: childId });
      const token = asStr(o.confirm_token);
      if (o.step !== 1 || !token) throw toApiError(new Error('consent_withdraw_all: thiếu confirm_token ở bước 1'));
      const c = asObj(o.consequences);
      return {
        confirmToken: token,
        expiresAt: asStr(o.expires_at),
        consequences: {
          purposesWithdrawn: Array.isArray(c.purposes_withdrawn) ? c.purposes_withdrawn.filter((x): x is string => typeof x === 'string') : [],
          childHidden: c.child_hidden === true,
          deviceUnlinked: c.device_unlinked === true,
          deletionRequest: c.deletion_request === true,
          hardDeletedNow: c.hard_deleted_now === true,
          canReconsent: c.can_reconsent === true,
        },
      };
    },

    async withdrawAllConfirm(childId, confirmToken) {
      const o = await rpcOk('consent_withdraw_all', { p_child: childId, p_confirm_token: confirmToken });
      if (o.step !== 2) throw toApiError(new Error('consent_withdraw_all: bước 2 trả sai bước'));
      return {
        replay: o.replay === true,
        deletionRequestId: asStr(o.deletion_request_id),
        acceptedAt: asStr(o.accepted_at),
        state: asStr(o.state) ?? 'CHO_QUYET_HAN',
        hardDeleted: o.hard_deleted === true,
      };
    },

    async householdReopen(confirm) {
      const o = await rpcOk('household_reopen', { p_confirm: confirm });
      return { changed: o.changed === true };
    },

    async deletionRequest(scope, childId) {
      const o = await rpcOk('deletion_request', { p_scope: scope, p_child: childId ?? null, p_confirm: true });
      return {
        replay: o.replay === true,
        scope,
        deletionRequestId: asStr(o.deletion_request_id),
        acceptedAt: asStr(o.accepted_at),
        state: asStr(o.state) ?? 'CHO_QUYET_HAN',
        hardDeleted: o.hard_deleted === true,
      };
    },

    async exportRequest(scope, childId) {
      // Bản thử: máy chủ luôn raise BLOCKED_H4. Nếu sau này trả ok thì coi là đã nhận yêu cầu.
      await rpcOk('export_request', { p_scope: scope, p_child: childId ?? null });
    },

    async getMyConsent(childId) {
      return effectiveCodes(await readOverview(childId));
    },

    async getFamilyState() {
      // Máy con chưa có đường đọc trạng thái đóng băng (households chỉ cho thành viên đọc). Đọc được dòng và thấy
      // DONG_BANG thì báo FROZEN; không đọc được thì ACTIVE để không chặn nhầm. Xem README mục T2.6.
      const hh = await db().from('households').select(cols('households')).maybeSingle();
      return !hh.error && asObj(hh.data).state === 'DONG_BANG' ? 'FROZEN' : 'ACTIVE';
    },

    async pairCodeCreate(): Promise<PairCode> {
      const o = asObj(await rpc('pair_code_create', undefined));
      const code = asStr(o.code);
      if (!code) throw toApiError(new Error('pair_code_create: thiếu code'));
      return { code, expiresAt: asStr(o.expires_at) };
    },

    async pairPending() {
      const o = asObj(await rpc('pair_pending', undefined));
      if (o.pending !== true) return { pending: false as const };
      return { pending: true as const, adultCallName: asStr(o.adult_call_name) ?? 'bố mẹ', expiresAt: asStr(o.expires_at) };
    },

    async pairAccept(): Promise<Binding> {
      const o = await rpcOk('pair_accept', undefined);
      const childId = asStr(o.child_id);
      const epoch = asInt(o.epoch);
      if (!childId || epoch === null) throw toApiError(new Error('pair_accept: thiếu child_id hoặc epoch'));
      return { childId, epoch };
    },

    async pairDecline() {
      await rpcOk('pair_decline', undefined);
    },

    async getMyBinding() {
      const me = needSession(toSessionInfo((await authCall(() => client.auth.getSession())).session));
      const r = await db()
        .from('device_bindings')
        .select(cols('device_bindings_mine'))
        .eq('device_user_id', me.userId)
        .eq('state', 'HIEU_LUC')
        .maybeSingle();
      if (r.error) throw toApiError(r.error);
      const o = asObj(r.data);
      const childId = asStr(o.child_id);
      const epoch = asInt(o.epoch);
      return childId && epoch !== null ? { childId, epoch } : null;
    },

    async unlinkDevice(childId, pin, bindingEpoch) {
      await rpcOk('unlink_device', { p_child: childId, p_pin: pin, ...(bindingEpoch !== undefined ? { p_binding_epoch: bindingEpoch } : {}) });
    },
  };
}
