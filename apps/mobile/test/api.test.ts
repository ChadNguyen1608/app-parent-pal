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
    family_create: { data: { household_id: 'h1', member_id: 'm1', replay: false } },
    child_create: { data: { child_id: 'c1' } },
    pair_code_create: { data: { code: '482913', expires_at: '2026-11-16T00:10:00Z' } },
    pair_confirm: { data: { ok: true, binding_id: 'b1', state: 'CHO_XAC_NHAN_MAY_CON', epoch: 3, pin_set: true } },
    pin_set: { data: { ok: true, created: false } },
    pair_pending: { data: { pending: true, binding_id: 'b1', adult_call_name: 'chị Lan', expires_at: '2026-11-16T00:05:00Z' } },
    pair_accept: { data: { ok: true, replay: false, binding_id: 'b1', child_id: 'c1', epoch: 4 } },
    pair_decline: { data: { ok: true, declined: true } },
    unlink_device: { data: { ok: true, unlinked: true, replay: false, epoch: 5 } },
  });
  const api = createSupabaseApi(client);
  assert.deepEqual(await api.familyCreate('  chị Lan '), { householdId: 'h1', replay: false });
  assert.deepEqual(
    await api.childCreate({ householdId: 'h1', callName: ' Bống ', grade: 4, hasDevice: true, idempotencyKey: 'k' }),
    { childId: 'c1' },
  );
  assert.deepEqual(await api.pairCodeCreate(), { code: '482913', expiresAt: '2026-11-16T00:10:00Z' });
  assert.deepEqual(await api.pairConfirm('c1', ' 482913 ', '246801'), { state: 'CHO_XAC_NHAN_MAY_CON', epoch: 3, pinSet: true });
  await api.pairConfirm('c1', '482913');
  await api.pinSet('123456');
  assert.deepEqual(await api.pairPending(), { pending: true, adultCallName: 'chị Lan', expiresAt: '2026-11-16T00:05:00Z' });
  assert.deepEqual(await api.pairAccept(), { childId: 'c1', epoch: 4 });
  await api.pairDecline();
  await api.unlinkDevice('c1', '123456', 4);
  await api.unlinkDevice('c1', '123456');

  assert.ok(calls.every((c) => c.schema === 'app'));
  assert.deepEqual(calls.map((c) => c.fn), [
    'family_create', 'child_create', 'pair_code_create', 'pair_confirm', 'pair_confirm', 'pin_set',
    'pair_pending', 'pair_accept', 'pair_decline', 'unlink_device', 'unlink_device',
  ]);
  assert.deepEqual(calls[0].args, { p_call_name: 'chị Lan' });
  assert.deepEqual(calls[1].args, {
    p_household: 'h1', p_call_name: 'Bống', p_grade: 4, p_age_years: null, p_has_device: true, p_idempotency_key: 'k',
  });
  assert.deepEqual(calls[3].args, { p_child: 'c1', p_code: '482913', p_pin: '246801' });
  assert.deepEqual(calls[4].args, { p_child: 'c1', p_code: '482913' }, 'không gửi p_pin khi không có');
  assert.deepEqual(calls[5].args, { p_pin: '123456' });
  assert.deepEqual(calls[9].args, { p_child: 'c1', p_pin: '123456', p_binding_epoch: 4 });
  assert.deepEqual(calls[10].args, { p_child: 'c1', p_pin: '123456' });
});

test('lỗi PostgREST thành ApiError tiếng Việt (gồm RATE_LIMITED và CONFLICT_REV)', async () => {
  const { client } = fakeClient({
    family_create: { error: { message: 'FROZEN', details: 'R', hint: 'Gia đình đang tạm dừng app.', code: 'PT423' } },
    pair_confirm: { error: { message: 'RATE_LIMITED', details: 'BR-FAM-031', hint: 'Đã thử quá nhiều lần. Hãy thử lại sau ít phút.', code: 'PT429' } },
    unlink_device: { error: { message: 'CONFLICT_REV', details: 'FR01-T09', hint: 'Liên kết đã thay đổi. Hãy tải lại.', code: 'PT409' } },
    pin_set: new TypeError('Network request failed'),
  });
  const api = createSupabaseApi(client);
  await assert.rejects(api.familyCreate('a'), (e: unknown) => e instanceof ApiError && e.code === 'FROZEN' && e.userMessage === 'Gia đình đang tạm dừng app.');
  await assert.rejects(api.pairConfirm('c', '123456'), (e: unknown) => e instanceof ApiError && e.code === 'RATE_LIMITED' && e.userMessage.startsWith('Đã thử quá nhiều lần'));
  await assert.rejects(api.unlinkDevice('c', '123456', 1), (e: unknown) => e instanceof ApiError && e.code === 'CONFLICT_REV' && e.rule === 'FR01-T09');
  await assert.rejects(api.pinSet('123456'), (e: unknown) => e instanceof ApiError && e.code === 'NETWORK');
});

test('HTTP 200 với ok=false: pair_confirm, unlink_device, pair_accept ném ApiError (không coi là thành công)', async () => {
  const { client } = fakeClient({
    pair_confirm: { data: { ok: false, error: { code: 'NOT_FOUND', rule: 'BR-FAM-031', message_vi: 'Mã không đúng hoặc đã hết hạn.' } } },
    unlink_device: { data: { ok: false, error: { code: 'FORBIDDEN', rule: 'FR01-T02', message_vi: 'PIN chưa đúng.', attempts_left: 2, locked_until: null } } },
    pair_accept: { data: { ok: false, error: { code: 'NOT_FOUND', rule: 'AD-11', message_vi: 'Yêu cầu ghép đã hết hạn. Hãy tạo mã mới.' } } },
  });
  const api = createSupabaseApi(client, () => Date.parse('2026-11-16T00:00:00Z'));
  await assert.rejects(api.pairConfirm('c', '123456'), (e: unknown) => e instanceof ApiError && e.code === 'NOT_FOUND' && e.userMessage === 'Mã không đúng hoặc đã hết hạn.');
  await assert.rejects(api.unlinkDevice('c', '000000', 2), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, 'FORBIDDEN');
    assert.equal(e.attemptsLeft, 2);
    assert.equal(e.userMessage, 'PIN chưa đúng. Bạn còn 2 lần thử.');
    return true;
  });
  await assert.rejects(api.pairAccept(), (e: unknown) => e instanceof ApiError && e.rule === 'AD-11' && e.userMessage.startsWith('Yêu cầu ghép đã hết hạn'));
});

test('thiếu "ok" trong phản hồi hàm có ok: từ chối, không coi là thành công', async () => {
  const { client } = fakeClient({ unlink_device: { data: {} }, pair_confirm: { data: null }, pin_set: { data: { created: true } } });
  const api = createSupabaseApi(client);
  await assert.rejects(api.unlinkDevice('c', '123456', 1), (e: unknown) => e instanceof ApiError && e.code === 'UNKNOWN');
  await assert.rejects(api.pairConfirm('c', '123456', '246801'), (e: unknown) => e instanceof ApiError && e.code === 'UNKNOWN');
  await assert.rejects(api.pinSet('246801'), (e: unknown) => e instanceof ApiError && e.code === 'UNKNOWN');
});

test('pair_pending: pending=false khi chưa có yêu cầu', async () => {
  const { client } = fakeClient({ pair_pending: { data: { pending: false } } });
  const api = createSupabaseApi(client);
  assert.deepEqual(await api.pairPending(), { pending: false });
});

test('touch_active chỉ gọi tối đa một lần mỗi giờ và trả touched', async () => {
  const { client, calls } = fakeClient({ touch_active: { data: { touched: true, last_active_at: '2026-11-16T00:00:00Z' } } });
  let t = 1_000_000;
  const api = createSupabaseApi(client, () => t);
  assert.deepEqual(await api.touchActive(), { touched: true });
  t += 59 * 60_000;
  assert.deepEqual(await api.touchActive(), { touched: false });
  assert.equal(calls.filter((c) => c.fn === 'touch_active').length, 1);
  t += 2 * 60_000;
  await api.touchActive();
  assert.equal(calls.filter((c) => c.fn === 'touch_active').length, 2);
  assert.deepEqual(calls[0].args, undefined, 'touch_active không có tham số');
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
