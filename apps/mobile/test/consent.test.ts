// Đồng ý, rút toàn bộ, mở lại, xóa, xuất: bản giả lập phản chiếu quy tắc máy chủ; lớp api.ts gọi đúng tham số.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSupabaseApi } from '../src/data/api.ts';
import { activeDependents, dependentsOf, effectiveCodes, parentsFirst } from '../src/data/consent.ts';
import { ApiError, toApiError } from '../src/data/errors.ts';
import { MOCK_PURPOSES, createMockApi, type MockApi } from '../src/data/mock.ts';

const fast = { latencyMs: 0 };

async function rejects(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, code);
    return true;
  });
}

async function setup(opts: Parameters<typeof createMockApi>[0] = {}): Promise<{ api: MockApi; childId: string }> {
  const api = createMockApi({ ...fast, ...opts });
  await api.auth.sendEmailOtp('a@b.vn');
  await api.auth.verifyEmailOtp('a@b.vn', '123456');
  const { householdId } = await api.familyCreate('chị Lan');
  const { childId } = await api.childCreate({ householdId, callName: 'Bin', grade: 3, hasDevice: true });
  return { api, childId };
}
const on = (api: MockApi, childId: string, code: string) => api.consentRecord({ childId, purposeCode: code, event: 'DONG_Y' });

test('hàm thuần: phụ thuộc, hiệu lực, thứ tự cha trước con', () => {
  assert.deepEqual(dependentsOf(MOCK_PURPOSES, 'MD-DONGBO'), ['MD-XONG', 'MD-MET', 'MD-MONGMUON', 'MD-BAOCAO', 'MD-CONBAO']);
  const ov = {
    purposes: MOCK_PURPOSES,
    states: {
      'MD-LICH': { state: 'DANG_BAT' as const, activeSince: 'x' },
      'MD-XONG': { state: 'DANG_BAT' as const, activeSince: 'x' },
      'MD-SUCKHOE': { state: 'DANG_BAT' as const, activeSince: 'x' },
    },
  };
  assert.deepEqual(effectiveCodes(ov), ['MD-LICH']); // XONG thiếu cha DONGBO; SUCKHOE chưa được thu
  assert.deepEqual(activeDependents(ov, 'MD-LICH'), ['MD-XONG', 'MD-SUCKHOE']);
  assert.deepEqual(parentsFirst(MOCK_PURPOSES, ['MD-BAOCAO', 'MD-XONG', 'MD-DONGBO', 'MD-LICH']), ['MD-LICH', 'MD-DONGBO', 'MD-XONG', 'MD-BAOCAO']);
});

test('đồng ý: ghi, lặp không đổi, rút kéo theo mục con, mục lõi phải rút toàn bộ', async () => {
  const { api, childId } = await setup();
  assert.equal((await api.getHome())!.children[0].coreConsent, false);
  assert.equal((await on(api, childId, 'MD-LICH')).changed, true);
  assert.equal((await on(api, childId, 'MD-LICH')).changed, false);
  assert.equal((await api.getHome())!.children[0].coreConsent, true);
  await on(api, childId, 'MD-DONGBO');
  await on(api, childId, 'MD-XONG');
  await on(api, childId, 'MD-BAOCAO');
  const r = await api.consentRecord({ childId, purposeCode: 'MD-DONGBO', event: 'RUT' });
  assert.deepEqual(r.alsoWithdrawn, ['MD-XONG', 'MD-BAOCAO']);
  const ov = await api.getConsentOverview(childId);
  assert.equal(ov.states['MD-XONG'].state, 'DA_RUT');
  assert.equal(ov.purposes.length, 8);
  await rejects(api.consentRecord({ childId, purposeCode: 'MD-LICH', event: 'RUT' }), 'VALIDATION');
});

test('mục đích thứ 8 (MD-CONBAO) và MD-SUCKHOE: FEATURE_OFF, lời tiếng Việt', async () => {
  const { api, childId } = await setup();
  await on(api, childId, 'MD-LICH');
  await on(api, childId, 'MD-DONGBO');
  for (const c of ['MD-CONBAO', 'MD-SUCKHOE']) {
    await assert.rejects(on(api, childId, c), (e: unknown) => {
      assert.ok(e instanceof ApiError);
      assert.equal(e.code, 'FEATURE_OFF');
      assert.match(e.userMessage, /chưa mở/);
      return true;
    });
  }
  await api.consentRecord({ childId, purposeCode: 'MD-CONBAO', event: 'RUT' }); // rút luôn ghi được
});

test('đồng ý: khóa gửi lặp, khóa dùng sai, người lớn khác theo con bị từ chối', async () => {
  const { api, childId } = await setup();
  const k = { childId, purposeCode: 'MD-LICH', event: 'DONG_Y' as const, idempotencyKey: 'k1' };
  assert.equal((await api.consentRecord(k)).replay, false);
  assert.equal((await api.consentRecord(k)).replay, true);
  await rejects(api.consentRecord({ ...k, purposeCode: 'MD-DONGBO' }), 'VALIDATION');
  const { api: other, childId: c2 } = await setup({ role: 'SUPPORTER' });
  await rejects(other.consentRecord({ childId: c2, purposeCode: 'MD-LICH', event: 'DONG_Y' }), 'FORBIDDEN');
  assert.equal((await other.consentRecord({ childId: c2, purposeCode: 'MD-LICH', event: 'DONG_Y', forSelf: true })).changed, true);
});

test('rút toàn bộ: hai bước, mã sai hoặc hết hạn bị từ chối, xong thì ẩn hồ sơ và có yêu cầu xóa', async () => {
  let t = 1_000_000;
  const { api, childId } = await setup({ now: () => t });
  await on(api, childId, 'MD-LICH');
  await on(api, childId, 'MD-DONGBO');
  const s1 = await api.withdrawAllStart(childId);
  assert.deepEqual(s1.consequences.purposesWithdrawn, ['MD-DONGBO', 'MD-LICH']);
  assert.equal(s1.consequences.childHidden, true);
  assert.equal(s1.consequences.hardDeletedNow, false);
  assert.equal((await api.getHome())!.children.length, 1); // bước 1 chưa đổi gì
  await rejects(api.withdrawAllConfirm(childId, 'sai'), 'VALIDATION');
  t += 11 * 60_000;
  await rejects(api.withdrawAllConfirm(childId, s1.confirmToken), 'VALIDATION'); // quá 10 phút
  const s1b = await api.withdrawAllStart(childId);
  const s2 = await api.withdrawAllConfirm(childId, s1b.confirmToken);
  assert.equal(s2.replay, false);
  assert.equal(s2.hardDeleted, false);
  const home = (await api.getHome())!;
  assert.equal(home.children.length, 0);
  assert.equal(home.openDeletions[0].scope, 'HO_SO_CON');
  assert.equal((await api.withdrawAllConfirm(childId, s1b.confirmToken)).replay, true);
});

test('đóng băng: ghi bị FROZEN, chỉ QL mở lại, cần xác nhận rõ ràng', async () => {
  const { api, childId } = await setup();
  api.setHouseholdState('DONG_BANG');
  assert.equal((await api.getHome())!.householdState, 'DONG_BANG');
  assert.equal(await api.getFamilyState(), 'FROZEN');
  await rejects(on(api, childId, 'MD-LICH'), 'FROZEN');
  await rejects(api.withdrawAllStart(childId), 'FROZEN');
  await rejects(api.householdReopen(false), 'VALIDATION');
  assert.deepEqual(await api.householdReopen(true), { changed: true });
  assert.deepEqual(await api.householdReopen(true), { changed: false });
  assert.equal(await api.getFamilyState(), 'ACTIVE');
  const { api: sup } = await setup({ role: 'SUPPORTER' });
  sup.setHouseholdState('DONG_BANG');
  await rejects(sup.householdReopen(true), 'FORBIDDEN');
});

test('yêu cầu xóa: hồ sơ con, gia đình, người lớn rời; gửi lặp giữ lần đầu', async () => {
  const { api, childId } = await setup();
  const a = await api.deletionRequest('HO_SO_CON', childId);
  assert.equal(a.replay, false);
  assert.equal((await api.deletionRequest('HO_SO_CON', childId)).acceptedAt, a.acceptedAt);
  await rejects(api.deletionRequest('NGUOI_LON_ROI'), 'VALIDATION'); // QL chưa rời được
  await rejects(api.deletionRequest('HO_SO_CON', null), 'VALIDATION');
  const g = await api.deletionRequest('GIA_DINH');
  assert.equal(g.hardDeleted, false);
  assert.equal((await api.getHome())!.householdState, 'CHO_XOA');
  const { api: sup } = await setup({ role: 'SUPPORTER' });
  await rejects(sup.deletionRequest('GIA_DINH'), 'FORBIDDEN');
  await sup.deletionRequest('NGUOI_LON_ROI');
  assert.equal(await sup.getHome(), null);
});

test('xuất dữ liệu: luôn BLOCKED_H4 với lời tiếng Việt', async () => {
  const { api, childId } = await setup();
  await assert.rejects(api.exportRequest('GIA_DINH'), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.code, 'BLOCKED_H4');
    assert.match(e.userMessage, /chưa mở/);
    return true;
  });
  await rejects(api.exportRequest('HO_SO_CON', childId), 'BLOCKED_H4');
});

test('máy con giả lập: danh sách mục đích hiệu lực mặc định và ghi đè', async () => {
  const api = createMockApi(fast);
  await api.auth.signInAnonymously();
  assert.ok((await api.getMyConsent('x')).includes('MD-XONG'));
  const api2 = createMockApi({ ...fast, childConsent: ['MD-LICH'] });
  await api2.auth.signInAnonymously();
  assert.deepEqual(await api2.getMyConsent('x'), ['MD-LICH']);
});

test('api.ts: mã lỗi BLOCKED_H4 và FEATURE_OFF của máy chủ thành lời Việt; hint tiếng Anh bị bỏ', () => {
  const b = toApiError({ message: 'BLOCKED_H4', details: 'BR-CON-056', hint: 'Xuất dữ liệu chưa mở ở bản thử.' });
  assert.equal(b.code, 'BLOCKED_H4');
  assert.equal(b.userMessage, 'Xuất dữ liệu chưa mở ở bản thử.');
  assert.match(toApiError({ message: 'BLOCKED_H4', hint: 'blocked' }).userMessage, /chưa mở ở bản thử/);
  assert.match(toApiError({ message: 'FEATURE_OFF', hint: '' }).userMessage, /chưa mở/);
});

test('api.ts: tham số RPC mới và đọc kết quả', async () => {
  const calls: { fn: string; args: unknown }[] = [];
  const results: Record<string, unknown> = {
    consent_record: { ok: true, changed: true, replay: false, also_withdrawn: ['MD-XONG'] },
    consent_withdraw_all: { ok: true, step: 1, confirm_token: 'tok', expires_at: 'x', consequences: { purposes_withdrawn: ['MD-LICH'], child_hidden: true, device_unlinked: true, deletion_request: true, hard_deleted_now: false, can_reconsent: false } },
    household_reopen: { ok: true, changed: true },
    deletion_request: { ok: true, replay: false, deletion_request_id: 'd', accepted_at: 'a', state: 'CHO_QUYET_HAN', hard_deleted: false },
    export_request: { ok: false, error: { code: 'BLOCKED_H4', message_vi: 'Xuất dữ liệu chưa mở ở bản thử.' } },
  };
  const client = {
    schema: () => ({
      async rpc(fn: string, args?: unknown) {
        calls.push({ fn, args });
        return { data: results[fn] ?? null, error: null };
      },
    }),
  };
  const api = createSupabaseApi(client as never);
  assert.deepEqual(await api.consentRecord({ childId: 'c', purposeCode: 'MD-DONGBO', event: 'RUT', idempotencyKey: 'k' }), { changed: true, replay: false, alsoWithdrawn: ['MD-XONG'] });
  assert.deepEqual(calls[0].args, { p_child: 'c', p_purpose_code: 'MD-DONGBO', p_event: 'RUT', p_idempotency_key: 'k', p_for_self: false });
  const s1 = await api.withdrawAllStart('c');
  assert.equal(s1.confirmToken, 'tok');
  assert.equal(s1.consequences.deviceUnlinked, true);
  assert.deepEqual(calls[1].args, { p_child: 'c' });
  results.consent_withdraw_all = { ok: true, step: 2, replay: false, deletion_request_id: 'd', accepted_at: 'a', state: 'CHO_QUYET_HAN', hard_deleted: false };
  assert.equal((await api.withdrawAllConfirm('c', 'tok')).deletionRequestId, 'd');
  assert.deepEqual(calls[2].args, { p_child: 'c', p_confirm_token: 'tok' });
  assert.deepEqual(await api.householdReopen(true), { changed: true });
  assert.deepEqual(calls[3].args, { p_confirm: true });
  assert.equal((await api.deletionRequest('GIA_DINH')).scope, 'GIA_DINH');
  assert.deepEqual(calls[4].args, { p_scope: 'GIA_DINH', p_child: null, p_confirm: true });
  await rejects(api.exportRequest('GIA_DINH'), 'BLOCKED_H4'); // cả khi máy chủ trả ok=false trong payload
});
