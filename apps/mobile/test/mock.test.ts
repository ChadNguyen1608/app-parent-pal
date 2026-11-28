import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError } from '../src/data/errors.ts';
import { MOCK_ADULT_NAME, MOCK_DEFAULT_PIN, MOCK_OTP, MOCK_PAIR_CODE, createMockApi } from '../src/data/mock.ts';

const fast = { latencyMs: 0 };
/** Ghép máy theo khóa (D-74): PREMIUM mặc định 1 khóa; mock mặc định TRIAL (1 khóa). */
const premium = { latencyMs: 0, plan: 'PREMIUM' as const };

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
  const api = createMockApi(premium);
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
  await rejects(api.pairConfirm(a.childId, MOCK_PAIR_CODE, '123456'), 'VALIDATION'); // PIN dễ đoán, như máy chủ
  await rejects(api.pairConfirm(a.childId, '999999', '582914'), 'NOT_FOUND');
  const r = await api.pairConfirm(a.childId, MOCK_PAIR_CODE, '582914');
  assert.deepEqual(r, { state: 'CHO_XAC_NHAN_MAY_CON', epoch: 1, pinSet: true });
  assert.equal((await api.getHome())?.children[0].pairState, 'PENDING', 'còn chờ máy con bấm Đồng ý');
  await rejects(api.pairConfirm(a.childId, MOCK_PAIR_CODE, '582914'), 'VALIDATION'); // đã có PIN thì không gửi PIN
  assert.deepEqual((await api.pairConfirm(a.childId, MOCK_PAIR_CODE)).pinSet, false);

  await rejects(api.pinSet('12'), 'VALIDATION');
  await api.pinSet('582914');
});

test('không ghép được con chưa có máy riêng', async () => {
  const api = createMockApi(premium);
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
  const { householdId } = await api.familyCreate('anh Nam');
  const { childId } = await api.childCreate({ householdId, callName: 'Na', ageYears: 5, hasDevice: false });
  await rejects(api.pairConfirm(childId, MOCK_PAIR_CODE, '582914'), 'VALIDATION');
});

test('phụ huynh: 5 lần nhập mã sai thì RATE_LIMITED, mã sai trả lời chung', async () => {
  const api = createMockApi(premium);
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
  const { householdId } = await api.familyCreate('chị Lan');
  const { childId } = await api.childCreate({ householdId, callName: 'Na', grade: 3, hasDevice: true });
  for (let i = 0; i < 5; i++) {
    await assert.rejects(api.pairConfirm(childId, '000000', '582914'), (e: unknown) => {
      assert.ok(e instanceof ApiError);
      assert.equal(e.code, 'NOT_FOUND');
      assert.equal(e.userMessage, 'Mã không đúng hoặc đã hết hạn.');
      return true;
    });
  }
  await rejects(api.pairConfirm(childId, MOCK_PAIR_CODE, '582914'), 'RATE_LIMITED');
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
  await rejects(api.unlinkDevice(b.childId, MOCK_DEFAULT_PIN, b.epoch + 5), 'CONFLICT_REV');
  await assert.rejects(api.unlinkDevice(b.childId, '000000', b.epoch), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, 'FORBIDDEN');
    assert.equal(e.attemptsLeft, 4);
    assert.match(e.userMessage, /còn 4 lần thử/);
    return true;
  });
  await api.unlinkDevice(b.childId, MOCK_DEFAULT_PIN, b.epoch); // PIN mặc định của bản giả lập
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
  await rejects(api.unlinkDevice(b.childId, MOCK_DEFAULT_PIN, b.epoch), 'RATE_LIMITED');
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

test('gói dịch vụ (D-68, D-74): mặc định TRIAL; my_plan theo gói và khóa; FREE không ghép được (PLAN_REQUIRED trước PIN và mã); TRIAL và PREMIUM ghép theo khóa', async () => {
  const mk = async (plan?: 'FREE' | 'TRIAL' | 'PREMIUM') => {
    const api = createMockApi({ ...fast, ...(plan ? { plan } : {}) });
    await api.auth.sendEmailOtp('a@b.vn');
    await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
    const { householdId } = await api.familyCreate('chị Lan');
    const { childId } = await api.childCreate({ householdId, callName: 'Bin', grade: 3, hasDevice: true });
    return { api, childId };
  };
  const def = await mk();
  assert.deepEqual(await def.api.myPlan(), {
    tier: 'TRIAL', expired: false, plansMax: 1, editsMax: 3, children: [{ childId: def.childId, plansUsed: 0, editsUsed: 0, editsLeft: 3 }],
    palQuestionsLeft: null, trialEndsAt: null, trialAvailable: false, trialDays: 7, deviceKeys: 1, deviceKeysUsed: 0,
  });
  const free = await mk('FREE');
  assert.deepEqual(await free.api.myPlan(), {
    tier: 'FREE', expired: false, plansMax: 0, editsMax: 0, children: [{ childId: free.childId, plansUsed: 0, editsUsed: 0, editsLeft: 0 }],
    palQuestionsLeft: null, trialEndsAt: null, trialAvailable: true, trialDays: 7, deviceKeys: 0, deviceKeysUsed: 0,
  });
  const prem = await mk('PREMIUM');
  assert.deepEqual(await prem.api.myPlan(), {
    tier: 'PREMIUM', expired: false, plansMax: null, editsMax: null, children: [{ childId: prem.childId, plansUsed: 0, editsUsed: 0, editsLeft: null }],
    palQuestionsLeft: null, trialEndsAt: null, trialAvailable: false, trialDays: 7, deviceKeys: 1, deviceKeysUsed: 0,
  });

  for (const { api, childId } of [free]) {
    await assert.rejects(api.pairConfirm(childId, MOCK_PAIR_CODE, '482915'), (e: unknown) => {
      assert.ok(e instanceof ApiError);
      assert.equal(e.code, 'PLAN_REQUIRED');
      assert.equal(e.rule, 'D-68.premium');
      assert.match(e.userMessage, /dùng thử hoặc Premium/);
      return true;
    });
  }
  assert.equal((await def.api.pairConfirm(def.childId, MOCK_PAIR_CODE, '482915')).state, 'CHO_XAC_NHAN_MAY_CON', 'dùng thử ghép được 1 máy (D-74)');
  assert.equal((await def.api.myPlan()).deviceKeysUsed, 1, 'yêu cầu chờ giữ khóa');
  assert.equal((await prem.api.pairConfirm(prem.childId, MOCK_PAIR_CODE, '482915')).state, 'CHO_XAC_NHAN_MAY_CON');
  const out = createMockApi(fast);
  await rejects(out.myPlan(), 'UNAUTHENTICATED');
});

test('dùng thử (D-72): FREE bấm Dùng thử thành TRIAL có hạn; dùng lại, hộ đã có gói, máy/email đã dùng thử đều TRIAL_USED', async () => {
  const mk = async (o: { plan?: 'FREE' | 'TRIAL' | 'PREMIUM'; trialClaimed?: boolean }) => {
    const api = createMockApi({ ...fast, now: () => Date.UTC(2026, 10, 19), ...o });
    await api.auth.sendEmailOtp('a@b.vn');
    await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
    await api.familyCreate('chị Lan');
    return api;
  };
  const api = await mk({ plan: 'FREE' });
  assert.equal((await api.myPlan()).trialAvailable, true);
  const r = await api.trialStart();
  assert.equal(r.trialEndsAt, '2026-11-26T00:00:00.000Z');
  const p = await api.myPlan();
  assert.equal(p.tier, 'TRIAL'); assert.equal(p.trialAvailable, false); assert.equal(p.trialEndsAt, '2026-11-26T00:00:00.000Z');
  await assert.rejects(api.trialStart(), (e: unknown) => e instanceof ApiError && e.code === 'TRIAL_USED' && e.rule === 'D-72.claim');
  await rejects((await mk({ plan: 'PREMIUM' })).trialStart(), 'TRIAL_USED');
  await rejects((await mk({ plan: 'TRIAL' })).trialStart(), 'TRIAL_USED');
  const claimed = await mk({ plan: 'FREE', trialClaimed: true });
  await rejects(claimed.trialStart(), 'TRIAL_USED');
  assert.equal((await claimed.myPlan()).tier, 'FREE');
  await rejects(createMockApi(fast).trialStart(), 'UNAUTHENTICATED');
  await rejects(createMockApi({ ...fast, plan: 'FREE', frozen: true }).trialStart(), 'UNAUTHENTICATED');
});

test('máy con: my_family_state báo planActive khi hộ dùng thử hoặc Premium (có khóa); FREE thì không; đóng băng báo riêng', async () => {
  for (const [plan, active] of [['PREMIUM', true], ['TRIAL', true], ['FREE', false]] as const) {
    const api = createMockApi({ ...fast, plan });
    await rejects(api.myFamilyState(), 'UNAUTHENTICATED');
    await api.auth.signInAnonymously();
    assert.deepEqual(await api.myFamilyState(), { frozen: false, planActive: active });
  }
  const f = createMockApi({ ...fast, plan: 'PREMIUM', frozen: true });
  await f.auth.signInAnonymously();
  assert.deepEqual(await f.myFamilyState(), { frozen: true, planActive: true });
});

test('khóa ghép máy (D-74): hết khóa thì DEVICE_KEY_LIMIT trước PIN và mã; ghép lại cho chính con đang chờ không tốn khóa; nhiều khóa ghép được nhiều con', async () => {
  const mk = async (o: { plan: 'TRIAL' | 'PREMIUM'; deviceKeys?: number }) => {
    const api = createMockApi({ ...fast, ...o });
    await api.auth.sendEmailOtp('a@b.vn');
    await api.auth.verifyEmailOtp('a@b.vn', MOCK_OTP);
    const { householdId } = await api.familyCreate('chị Lan');
    const a = (await api.childCreate({ householdId, callName: 'Bin', grade: 3, hasDevice: true })).childId;
    const b = (await api.childCreate({ householdId, callName: 'Na', grade: 5, hasDevice: true })).childId;
    return { api, a, b };
  };
  const t = await mk({ plan: 'TRIAL' });
  assert.deepEqual([(await t.api.myPlan()).deviceKeys, (await t.api.myPlan()).deviceKeysUsed], [1, 0]);
  assert.equal((await t.api.pairConfirm(t.a, MOCK_PAIR_CODE, '482915')).state, 'CHO_XAC_NHAN_MAY_CON');
  await assert.rejects(t.api.pairConfirm(t.b, MOCK_PAIR_CODE, '482915'), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, 'DEVICE_KEY_LIMIT');
    assert.equal(e.rule, 'D-74.keys');
    assert.match(e.userMessage, /tối đa 1 máy/);
    return true;
  });
  assert.equal((await t.api.pairConfirm(t.a, MOCK_PAIR_CODE)).state, 'CHO_XAC_NHAN_MAY_CON', 'ghép lại cho chính con đang chờ');
  const p = await mk({ plan: 'PREMIUM', deviceKeys: 2 });
  assert.equal((await p.api.myPlan()).deviceKeys, 2);
  await p.api.pairConfirm(p.a, MOCK_PAIR_CODE, '482915');
  await p.api.pairConfirm(p.b, MOCK_PAIR_CODE);
  assert.deepEqual([(await p.api.myPlan()).deviceKeys, (await p.api.myPlan()).deviceKeysUsed], [2, 2]);
  const z = await mk({ plan: 'PREMIUM', deviceKeys: 0 });
  await assert.rejects(z.api.pairConfirm(z.a, MOCK_PAIR_CODE, '482915'), (e: unknown) => e instanceof ApiError && e.code === 'DEVICE_KEY_LIMIT');
});
