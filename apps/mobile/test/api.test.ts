import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSupabaseApi } from '../src/data/api.ts';
import { ApiError } from '../src/data/errors.ts';

type Call = { schema: string; fn: string; args: unknown };

/** Client giả đủ dùng cho RPC: ghi lại lời gọi, trả kết quả cấu hình sẵn. */
function fakeClient(results: Record<string, { data?: unknown; error?: unknown } | Error>) {
  const calls: Call[] = [];
  const client = {
    schema(schema: string) {
      return {
        async rpc(fn: string, args?: unknown) {
          calls.push({ schema, fn, args });
          const r = results[fn] ?? { data: null };
          if (r instanceof Error) throw r;
          return { data: r.data ?? null, error: r.error ?? null };
        },
      };
    },
    auth: {
      lastOtp: null as unknown,
      async signInWithOtp(a: unknown) {
        this.lastOtp = a;
        return { data: {}, error: null };
      },
      async verifyOtp(a: unknown) {
        this.lastOtp = a;
        return {
          data: { session: { user: { id: 'u1', email: 'a@b.vn', is_anonymous: false } } },
          error: null,
        };
      },
    },
  };
  return { client: client as never, calls, raw: client };
}

test('RPC gọi đúng schema app, tên hàm và tham số', async () => {
  const { client, calls } = fakeClient({
    family_create: { data: { household_id: 'h1' } },
    child_create: { data: { child_id: 'c1' } },
    pair_code_create: { data: { code: '482913', expires_at: '2026-11-16T00:10:00Z' } },
  });
  const api = createSupabaseApi(client);
  assert.deepEqual(await api.familyCreate('  chị Lan '), { householdId: 'h1' });
  assert.deepEqual(
    await api.childCreate({ householdId: 'h1', callName: ' Bống ', grade: 4, hasDevice: true, idempotencyKey: 'k' }),
    { childId: 'c1' },
  );
  assert.deepEqual(await api.pairCodeCreate(), { code: '482913', expiresAt: '2026-11-16T00:10:00Z' });
  await api.pairConfirm('c1', ' 482913 ');
  await api.pinSet('123456');
  await api.unlinkDevice('c1', '123456');

  assert.ok(calls.every((c) => c.schema === 'app'));
  assert.deepEqual(calls.map((c) => c.fn), ['family_create', 'child_create', 'pair_code_create', 'pair_confirm', 'pin_set', 'unlink_device']);
  assert.deepEqual(calls[0].args, { p_call_name: 'chị Lan' });
  assert.deepEqual(calls[1].args, {
    p_household: 'h1', p_call_name: 'Bống', p_grade: 4, p_age_years: null, p_has_device: true, p_idempotency_key: 'k',
  });
  assert.deepEqual(calls[3].args, { p_child: 'c1', p_code: '482913' });
  assert.deepEqual(calls[4].args, { p_pin: '123456' });
  assert.deepEqual(calls[5].args, { p_child: 'c1', p_pin: '123456' });
});

test('lỗi PostgREST thành ApiError tiếng Việt', async () => {
  const { client } = fakeClient({
    family_create: { error: { message: 'FROZEN', details: 'R', hint: 'Gia đình đang tạm dừng app.', code: 'PT423' } },
    pair_confirm: { error: { message: 'NOT_FOUND', hint: 'Mã đã dùng.', code: 'PT404' } },
    unlink_device: { error: { message: 'FORBIDDEN', hint: 'x', code: 'PT403' } },
    pin_set: new TypeError('Network request failed'),
  });
  const api = createSupabaseApi(client);
  await assert.rejects(api.familyCreate('a'), (e: unknown) => e instanceof ApiError && e.code === 'FROZEN' && e.userMessage === 'Gia đình đang tạm dừng app.');
  await assert.rejects(api.pairConfirm('c', '123456'), (e: unknown) => e instanceof ApiError && e.userMessage === 'Mã không đúng hoặc đã hết hạn.');
  await assert.rejects(api.unlinkDevice('c', '123456'), (e: unknown) => e instanceof ApiError && e.userMessage.startsWith('PIN chưa đúng'));
  await assert.rejects(api.pinSet('123456'), (e: unknown) => e instanceof ApiError && e.code === 'NETWORK');
});

test('pair_accept: NOT_FOUND là đang chờ; có child_id là đã ghép; lỗi khác báo ra', async () => {
  let r: { data?: unknown; error?: unknown } = { error: { message: 'NOT_FOUND' } };
  const { client } = fakeClient({});
  const wrapped = { ...(client as object), schema: () => ({ rpc: async () => ({ data: r.data ?? null, error: r.error ?? null }) }) } as never;
  const api = createSupabaseApi(wrapped);
  assert.deepEqual(await api.pairAccept(), { status: 'WAITING' });
  r = { data: { child_id: 'c9' } };
  assert.deepEqual(await api.pairAccept(), { status: 'PAIRED', childId: 'c9' });
  r = { error: { message: 'FROZEN' } };
  await assert.rejects(api.pairAccept(), (e: unknown) => e instanceof ApiError && e.code === 'FROZEN');
});

test('touch_active chỉ gọi tối đa một lần mỗi giờ', async () => {
  const { client, calls } = fakeClient({});
  let t = 1_000_000;
  const api = createSupabaseApi(client, () => t);
  await api.touchActive();
  t += 59 * 60_000;
  await api.touchActive();
  assert.equal(calls.filter((c) => c.fn === 'touch_active').length, 1);
  t += 2 * 60_000;
  await api.touchActive();
  assert.equal(calls.filter((c) => c.fn === 'touch_active').length, 2);
});

test('đăng nhập email OTP dùng type email', async () => {
  const { client, raw } = fakeClient({});
  const api = createSupabaseApi(client);
  await api.auth.sendEmailOtp(' a@b.vn ');
  assert.deepEqual(raw.auth.lastOtp, { email: 'a@b.vn', options: { shouldCreateUser: true } });
  const s = await api.auth.verifyEmailOtp('a@b.vn', ' 123456 ');
  assert.deepEqual(raw.auth.lastOtp, { email: 'a@b.vn', token: '123456', type: 'email' });
  assert.deepEqual(s, { userId: 'u1', email: 'a@b.vn', isAnonymous: false });
});

test('emailRedirectTo được truyền; link đổi phiên bằng exchangeCodeForSession hoặc verifyOtp token_hash', async () => {
  const { client, raw } = fakeClient({});
  const session = { user: { id: 'u2', email: 'c@d.vn', is_anonymous: false } };
  const auth = raw.auth as Record<string, unknown>;
  const seen: unknown[] = [];
  auth.exchangeCodeForSession = async (c: string) => (seen.push(c), { data: { session }, error: null });
  const api = createSupabaseApi(client);
  await api.auth.sendEmailOtp('a@b.vn', 'parentbestpal-parent://auth-callback');
  assert.deepEqual(raw.auth.lastOtp, { email: 'a@b.vn', options: { shouldCreateUser: true, emailRedirectTo: 'parentbestpal-parent://auth-callback' } });
  assert.equal((await api.auth.completeFromLink({ kind: 'code', code: 'c1' })).userId, 'u2');
  assert.deepEqual(seen, ['c1']);
  await api.auth.completeFromLink({ kind: 'token_hash', tokenHash: 'h', type: 'email' });
  assert.deepEqual(raw.auth.lastOtp, { token_hash: 'h', type: 'email' });
  await assert.rejects(api.auth.completeFromLink({ kind: 'error', errorCode: 'otp_expired' }), (e: unknown) => e instanceof ApiError && e.code === 'OTP_INVALID');
});
