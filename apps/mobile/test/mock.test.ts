import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError } from '../src/data/errors.ts';
import { MOCK_OTP, MOCK_PAIR_CODE, createMockApi } from '../src/data/mock.ts';

const fast = { latencyMs: 0 };

async function rejects(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: unknown) => {
    assert.ok(e instanceof ApiError, 'phải là ApiError');
    assert.equal(e.code, code);
    return true;
  });
}

test('phụ huynh: OTP sai bị từ chối, đúng thì có phiên', async () => {
  const api = createMockApi(fast);
  await rejects(api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP), 'OTP_INVALID'); // chưa gửi mã
  await rejects(api.auth.sendEmailOtp('khong-phai-email'), 'EMAIL_INVALID');
  await api.auth.sendEmailOtp('a@b.vn');
  await rejects(api.auth.verifyEmailOtp('a@b.vn', '000000'), 'OTP_INVALID');
  const s = await api.auth.verifyEmailOtp('A@B.vn', MOCK_OTP);
  assert.equal(s.email, 'a@b.vn');
  assert.equal(s.isAnonymous, false);
  assert.deepEqual(await api.auth.getSession(), s);
  await api.auth.signOut();
  assert.equal(await api.auth.getSession(), null);
});

test('chưa đăng nhập thì gọi RPC bị UNAUTHENTICATED', async () => {
  const api = createMockApi(fast);
  await rejects(api.familyCreate('chị Lan'), 'UNAUTHENTICATED');
  await rejects(api.getHome(), 'UNAUTHENTICATED');
});

test('phụ huynh: tạo hộ, tạo con, ghép máy, đặt PIN', async () => {
  const api = createMockApi(fast);
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
  assert.equal(await api.getHome(), null);
  await rejects(api.familyCreate('   '), 'VALIDATION');
  const { householdId } = await api.familyCreate('chị Lan');
  assert.deepEqual((await api.familyCreate('chị Lan')).householdId, householdId, 'gọi lặp không tạo hộ mới');

  await rejects(api.childCreate({ householdId, callName: 'Bống', hasDevice: true }), 'VALIDATION'); // thiếu lớp/tuổi
  await rejects(api.childCreate({ householdId, callName: 'Bống', grade: 12, hasDevice: true }), 'VALIDATION');
  const key = 'k-1';
  const a = await api.childCreate({ householdId, callName: 'Bống', grade: 4, hasDevice: true, idempotencyKey: key });
  const b = await api.childCreate({ householdId, callName: 'Bống', grade: 4, hasDevice: true, idempotencyKey: key });
  assert.equal(a.childId, b.childId);
  const home = await api.getHome();
  assert.equal(home?.children.length, 1);
  assert.equal(home?.children[0].pairState, 'NONE');

  await rejects(api.pairConfirm(a.childId, '999999'), 'NOT_FOUND');
  await api.pairConfirm(a.childId, MOCK_PAIR_CODE);
  assert.equal((await api.getHome())?.children[0].pairState, 'PAIRED');

  await rejects(api.pinSet('12'), 'VALIDATION');
  await api.pinSet('654321');
});

test('không ghép được con chưa có máy riêng', async () => {
  const api = createMockApi(fast);
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
  const { householdId } = await api.familyCreate('anh Nam');
  const { childId } = await api.childCreate({ householdId, callName: 'Na', ageYears: 5, hasDevice: false });
  await rejects(api.pairConfirm(childId, MOCK_PAIR_CODE), 'VALIDATION');
});

test('hộ đóng băng: hàm ghi trả FROZEN', async () => {
  const api = createMockApi({ ...fast, frozen: true });
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
  await rejects(api.familyCreate('chị Lan'), 'FROZEN');
});

test('máy con: ẩn danh, lấy mã, chờ rồi ghép, hủy kết nối bằng PIN', async () => {
  const api = createMockApi({ ...fast, now: () => Date.parse('2026-11-16T00:00:00Z') });
  await rejects(api.pairCodeCreate(), 'UNAUTHENTICATED');
  const s = await api.auth.signInAnonymously();
  assert.equal(s.isAnonymous, true);
  assert.equal(await api.getMyBinding(), null);
  await rejects(api.pairAccept(), 'NOT_FOUND'); // chưa có mã

  const c = await api.pairCodeCreate();
  assert.match(c.code, /^\d{6}$/);
  assert.equal(c.expiresAt, '2026-11-16T00:10:00.000Z');
  assert.deepEqual(await api.pairAccept(), { status: 'WAITING' });
  const ok = await api.pairAccept();
  assert.equal(ok.status, 'PAIRED');
  const childId = ok.status === 'PAIRED' ? ok.childId : '';
  assert.deepEqual(await api.getMyBinding(), { childId });

  await rejects(api.unlinkDevice(childId, '12'), 'VALIDATION');
  await rejects(api.unlinkDevice(childId, '000000'), 'FORBIDDEN');
  await api.unlinkDevice(childId, MOCK_PAIR_CODE); // PIN mặc định của bản giả lập
  assert.equal(await api.getMyBinding(), null);
});

test('máy con: sai PIN quá số lần thì bị khóa dù PIN đúng', async () => {
  const api = createMockApi({ ...fast, acceptAfter: 0 });
  await api.auth.signInAnonymously();
  await api.pairCodeCreate();
  const r = await api.pairAccept();
  const childId = r.status === 'PAIRED' ? r.childId : '';
  for (let i = 0; i < 5; i++) await rejects(api.unlinkDevice(childId, '111111'), 'FORBIDDEN');
  await rejects(api.unlinkDevice(childId, MOCK_PAIR_CODE), 'FORBIDDEN');
  assert.deepEqual(await api.getMyBinding(), { childId }, 'chưa hủy');
});

test('onChange báo khi đăng nhập và đăng xuất', async () => {
  const api = createMockApi(fast);
  const seen: (string | null)[] = [];
  const off = api.auth.onChange((s) => seen.push(s?.userId ?? null));
  await api.auth.signInAnonymously();
  await api.auth.signOut();
  off();
  await api.auth.signInAnonymously();
  assert.deepEqual(seen, ['mock-child-device', null]);
});
