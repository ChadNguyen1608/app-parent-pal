import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError } from '../src/data/errors.ts';
import { MOCK_ADULT_NAME, MOCK_OTP, MOCK_PAIR_CODE, createMockApi } from '../src/data/mock.ts';

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

  await rejects(api.pairConfirm(a.childId, MOCK_PAIR_CODE), 'VALIDATION'); // lần đầu bắt buộc kèm PIN
  await rejects(api.pairConfirm(a.childId, MOCK_PAIR_CODE, '12'), 'VALIDATION');
  await rejects(api.pairConfirm(a.childId, '999999', '654321'), 'NOT_FOUND');
  const r = await api.pairConfirm(a.childId, MOCK_PAIR_CODE, '654321');
  assert.deepEqual(r, { state: 'CHO_XAC_NHAN_MAY_CON', epoch: 1, pinSet: true });
  assert.equal((await api.getHome())?.children[0].pairState, 'PENDING', 'còn chờ máy con bấm Đồng ý');
  await rejects(api.pairConfirm(a.childId, MOCK_PAIR_CODE, '654321'), 'VALIDATION'); // đã có PIN thì không gửi PIN
  assert.deepEqual((await api.pairConfirm(a.childId, MOCK_PAIR_CODE)).pinSet, false);

  await rejects(api.pinSet('12'), 'VALIDATION');
  await api.pinSet('654321');
});

test('không ghép được con chưa có máy riêng', async () => {
  const api = createMockApi(fast);
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
  const { householdId } = await api.familyCreate('anh Nam');
  const { childId } = await api.childCreate({ householdId, callName: 'Na', ageYears: 5, hasDevice: false });
  await rejects(api.pairConfirm(childId, MOCK_PAIR_CODE, '654321'), 'VALIDATION');
});

test('phụ huynh: 5 lần nhập mã sai thì RATE_LIMITED, mã sai trả lời chung', async () => {
  const api = createMockApi(fast);
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
  const { householdId } = await api.familyCreate('chị Lan');
  const { childId } = await api.childCreate({ householdId, callName: 'Na', grade: 3, hasDevice: true });
  for (let i = 0; i < 5; i++) {
    await assert.rejects(api.pairConfirm(childId, '000000', '654321'), (e: unknown) => {
      assert.ok(e instanceof ApiError);
      assert.equal(e.code, 'NOT_FOUND');
      assert.equal(e.userMessage, 'Mã không đúng hoặc đã hết hạn.');
      return true;
    });
  }
  await rejects(api.pairConfirm(childId, MOCK_PAIR_CODE, '654321'), 'RATE_LIMITED');
});

test('hộ đóng băng: hàm ghi trả FROZEN', async () => {
  const api = createMockApi({ ...fast, frozen: true });
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
  await rejects(api.familyCreate('chị Lan'), 'FROZEN');
});

test('máy con: lấy mã, chờ pair_pending, hỏi Đồng ý/Không, lưu epoch, hủy bằng PIN + epoch', async () => {
  const api = createMockApi({ ...fast, now: () => Date.parse('2026-11-16T00:00:00Z') });
  await rejects(api.pairCodeCreate(), 'UNAUTHENTICATED');
  const s = await api.auth.signInAnonymously();
  assert.equal(s.isAnonymous, true);
  assert.equal(await api.getMyBinding(), null);
  await rejects(api.pairAccept(), 'NOT_FOUND'); // chưa có yêu cầu chờ

  const c = await api.pairCodeCreate();
  assert.match(c.code, /^\d{6}$/);
  assert.equal(c.expiresAt, '2026-11-16T00:10:00.000Z');
  assert.deepEqual(await api.pairPending(), { pending: false });
  const p = await api.pairPending();
  assert.deepEqual(p, { pending: true, adultCallName: MOCK_ADULT_NAME, expiresAt: '2026-11-16T00:05:00.000Z' });

  // Không: yêu cầu bị hủy, phải lấy mã mới.
  await api.pairDecline();
  assert.deepEqual(await api.pairPending(), { pending: false });
  await rejects(api.pairAccept(), 'NOT_FOUND');

  await api.pairCodeCreate();
  await api.pairPending();
  await api.pairPending();
  const b = await api.pairAccept();
  assert.ok(b.epoch >= 1);
  assert.deepEqual(await api.getMyBinding(), b);

  await rejects(api.unlinkDevice(b.childId, '12', b.epoch), 'VALIDATION');
  await rejects(api.unlinkDevice(b.childId, MOCK_PAIR_CODE), 'VALIDATION'); // máy con bắt buộc gửi epoch
  await rejects(api.unlinkDevice(b.childId, MOCK_PAIR_CODE, b.epoch + 5), 'CONFLICT_REV');
  await assert.rejects(api.unlinkDevice(b.childId, '000000', b.epoch), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, 'FORBIDDEN');
    assert.equal(e.attemptsLeft, 4);
    assert.match(e.userMessage, /còn 4 lần thử/);
    return true;
  });
  await api.unlinkDevice(b.childId, MOCK_PAIR_CODE, b.epoch); // PIN mặc định của bản giả lập
  assert.equal(await api.getMyBinding(), null);
});

test('máy con: sai PIN quá số lần thì khóa có thời hạn, PIN đúng cũng bị RATE_LIMITED', async () => {
  const api = createMockApi({ ...fast, acceptAfter: 0 });
  await api.auth.signInAnonymously();
  await api.pairCodeCreate();
  await api.pairPending();
  const b = await api.pairAccept();
  for (let i = 0; i < 4; i++) await rejects(api.unlinkDevice(b.childId, '111111', b.epoch), 'FORBIDDEN');
  await assert.rejects(api.unlinkDevice(b.childId, '111111', b.epoch), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.attemptsLeft, 0);
    assert.ok(e.lockedUntil);
    assert.match(e.userMessage, /tạm khóa.*15 phút/);
    return true;
  });
  await rejects(api.unlinkDevice(b.childId, MOCK_PAIR_CODE, b.epoch), 'RATE_LIMITED');
  assert.deepEqual(await api.getMyBinding(), b, 'chưa hủy');
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
