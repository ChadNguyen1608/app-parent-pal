// Lớp gọi máy chủ Supabase: RPC schema `app` + Supabase Auth. Mọi lỗi ra ngoài là ApiError (tiếng Việt).
// Chữ ký RPC family_create, child_create, touch_active đã có/được dự kiến ở backend T1.x;
// pair_*, pin_set, unlink_device đang làm ở nhánh khác (T1.5/T1.6): xem README "Giả định về RPC".
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { toApiError, type ErrorContext } from './errors.ts';
import type { AcceptResult, Api, Child, ChildInput, Home, PairCode, PairState, SessionInfo } from './types.ts';

const TOUCH_MIN_INTERVAL_MS = 60 * 60 * 1000; // Architecture 12.1: tối đa 1 lần/giờ

function toSessionInfo(s: Session | null | undefined): SessionInfo | null {
  if (!s) return null;
  return { userId: s.user.id, email: s.user.email ?? null, isAnonymous: s.user.is_anonymous === true };
}

type Obj = Record<string, unknown>;
const asObj = (v: unknown): Obj => (typeof v === 'object' && v !== null ? (v as Obj) : {});
const asStr = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);

export function createSupabaseApi(client: SupabaseClient, now: () => number = () => Date.now()): Api {
  const db = () => client.schema('app');
  let lastTouch: number | null = null;

  async function rpc(fn: string, args: Obj | undefined, ctx?: ErrorContext): Promise<unknown> {
    let res: { data: unknown; error: unknown };
    try {
      res = await db().rpc(fn, args);
    } catch (e) {
      throw toApiError(e, ctx);
    }
    if (res.error) throw toApiError(res.error, ctx);
    return res.data;
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
        const data = await authCall(() => client.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' }));
        return needSession(toSessionInfo(data.session));
      },
      async completeFromLink(link) {
        if (link.kind === 'error') {
          throw toApiError({ code: 'otp_expired', message: 'link' });
        }
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
      return { householdId };
    },

    async touchActive() {
      const t = now();
      if (lastTouch !== null && t - lastTouch < TOUCH_MIN_INTERVAL_MS) return;
      await rpc('touch_active', undefined);
      lastTouch = t;
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

    async pairConfirm(childId, code) {
      await rpc('pair_confirm', { p_child: childId, p_code: code.trim() }, 'pair');
    },

    async pinSet(pin) {
      await rpc('pin_set', { p_pin: pin });
    },

    async pairCodeCreate(): Promise<PairCode> {
      const o = asObj(await rpc('pair_code_create', undefined));
      const code = asStr(o.code);
      if (!code) throw toApiError(new Error('pair_code_create: thiếu code'));
      return { code, expiresAt: asStr(o.expires_at) };
    },

    async pairAccept(): Promise<AcceptResult> {
      try {
        const o = asObj(await rpc('pair_accept', undefined));
        const childId = asStr(o.child_id);
        return childId ? { status: 'PAIRED', childId } : { status: 'WAITING' };
      } catch (e) {
        // Bố mẹ chưa nhập mã: máy chủ chưa có liên kết chờ xác nhận cho máy này.
        if (toApiError(e).code === 'NOT_FOUND') return { status: 'WAITING' };
        throw e;
      }
    },

    async getMyBinding() {
      const me = needSession(toSessionInfo((await authCall(() => client.auth.getSession())).session));
      const r = await db()
        .from('device_bindings')
        .select('child_id')
        .eq('device_user_id', me.userId)
        .eq('state', 'HIEU_LUC')
        .maybeSingle();
      if (r.error) throw toApiError(r.error);
      const childId = r.data ? asStr(asObj(r.data).child_id) : null;
      return childId ? { childId } : null;
    },

    async unlinkDevice(childId, pin) {
      await rpc('unlink_device', { p_child: childId, p_pin: pin }, 'pin');
    },
  };
}
