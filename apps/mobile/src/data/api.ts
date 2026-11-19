// Lớp gọi máy chủ Supabase: RPC schema `app` + Supabase Auth. Mọi lỗi ra ngoài là ApiError (tiếng Việt).
// Tên hàm và tham số khớp migration ở backend/supabase/migrations (test/contract.test.ts kiểm lại mỗi lần chạy test).
// Hàm có đường thất bại cần đếm trả HTTP 200 {"ok": false, ...}: dùng rpcOk, không bao giờ coi thiếu "ok" là thành công.
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { ApiError, FALLBACK_MESSAGES, apiErrorFromFailure, toApiError } from './errors.ts';
import type { Api, Binding, Child, ChildInput, Home, PairCode, PairConfirmState, PairState, PlanInfo, PlanTier, SessionInfo } from './types.ts';

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
        .select('household_id, call_name')
        .eq('user_id', me.userId)
        .eq('status', 'DA_THAM_GIA')
        .maybeSingle();
      if (m.error) throw toApiError(m.error);
      if (!m.data) return null;
      const householdId = String(asObj(m.data).household_id);
      const memberCallName = String(asObj(m.data).call_name ?? '');

      const kids = await db()
        .from('children')
        .select('id, call_name, grade, age_years, has_device')
        .eq('household_id', householdId)
        .is('hidden_at', null)
        .order('created_at', { ascending: true });
      if (kids.error) throw toApiError(kids.error);
      const binds = await db().from('device_bindings').select('child_id, state').in('state', ['HIEU_LUC', 'CHO_XAC_NHAN_MAY_CON']);
      if (binds.error) throw toApiError(binds.error);
      const stateOf = new Map<string, PairState>();
      for (const b of binds.data ?? []) {
        const o = asObj(b);
        stateOf.set(String(o.child_id), o.state === 'HIEU_LUC' ? 'PAIRED' : 'PENDING');
      }
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
        };
      });
      return { householdId, memberCallName, children };
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

    async myPlan(): Promise<PlanInfo> {
      const o = await rpcOk('my_plan', undefined);
      // Phản hồi lạ thì từ chối chứ không đoán gói (không bao giờ mặc định thành PREMIUM).
      const tier = o.tier === 'FREE' || o.tier === 'TRIAL' || o.tier === 'PREMIUM' ? (o.tier as PlanTier) : null;
      const plansUsed = asInt(o.plans_used);
      const editsUsed = asInt(o.edits_used);
      if (!tier || plansUsed === null || editsUsed === null) throw toApiError(new Error('my_plan: phản hồi sai hợp đồng'));
      return {
        tier,
        expired: o.expired === true,
        plansUsed,
        plansMax: asInt(o.plans_max),
        editsUsed,
        editsLeft: asInt(o.edits_left),
        palQuestionsLeft: asInt(o.pal_questions_left),
        trialEndsAt: asStr(o.trial_ends_at),
      };
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
        .select('child_id, epoch')
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
